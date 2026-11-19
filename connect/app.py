from __future__ import annotations

import hmac
import os
import posixpath
import xml.etree.ElementTree as ET
from typing import Literal
from urllib.parse import quote, unquote, urljoin

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

app = FastAPI(
    title="OneOS Connect",
    description="Permission-limited OpenAPI tools for OneOS-connected services.",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
)
bearer = HTTPBearer(auto_error=False)
DAV_BODY = """<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:displayname/><d:getcontentlength/><d:getlastmodified/><d:resourcetype/><d:getcontenttype/></d:prop>
</d:propfind>"""


def require_key(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> None:
    expected = os.getenv("CONNECT_API_KEY", "")
    supplied = credentials.credentials if credentials else ""
    if not expected or not supplied or not hmac.compare_digest(expected, supplied):
        raise HTTPException(status_code=401, detail="A valid OneOS Connect bearer key is required.")


def nextcloud_settings() -> tuple[str, str, str]:
    base = os.getenv("NEXTCLOUD_URL", "").rstrip("/")
    username = os.getenv("NEXTCLOUD_USERNAME", "")
    password = os.getenv("NEXTCLOUD_APP_PASSWORD", "")
    if not base or not username or not password:
        raise HTTPException(status_code=503, detail="Nextcloud connector is not configured. Set its URL, service username, and app password in .env.")
    return base, username, password


def safe_dav_path(path: str) -> str:
    clean = path.replace("\\", "/").strip("/")
    parts = [part for part in clean.split("/") if part not in ("", ".")]
    if any(part == ".." or "\x00" in part for part in parts):
        raise HTTPException(status_code=400, detail="Path traversal is not allowed.")
    return "/".join(quote(part, safe="") for part in parts)


def dav_url(base: str, username: str, path: str) -> str:
    safe_user = quote(username, safe="")
    safe_path = safe_dav_path(path)
    suffix = f"/remote.php/dav/files/{safe_user}/"
    return base + suffix + safe_path


def home_assistant_settings() -> tuple[str, str]:
    base = os.getenv("HOME_ASSISTANT_URL", "").rstrip("/")
    token = os.getenv("HOME_ASSISTANT_TOKEN", "")
    if not base or not token:
        raise HTTPException(status_code=503, detail="Home Assistant connector is not configured. Set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in .env.")
    return base, token


async def ha_request(method: str, route: str, body: dict | None = None):
    base, token = home_assistant_settings()
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.request(
                method,
                base + route,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=body,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Home Assistant from OneOS Connect.") from exc
    if not response.is_success:
        raise HTTPException(status_code=502, detail=f"Home Assistant returned HTTP {response.status_code}.")
    return response.json() if response.content else {}


@app.get("/health", include_in_schema=False)
async def health():
    return {"service": "oneos-connect", "status": "ok"}


@app.get("/tools/nextcloud/list", dependencies=[Depends(require_key)])
async def nextcloud_list(path: str = Query(default="", description="Folder path relative to the Nextcloud account root, for example Documents")):
    """List a Nextcloud folder using a dedicated Nextcloud app password."""
    base, username, password = nextcloud_settings()
    url = dav_url(base, username, path)
    try:
        async with httpx.AsyncClient(timeout=20, auth=(username, password)) as client:
            response = await client.request("PROPFIND", url, headers={"Depth": "1", "Content-Type": "application/xml"}, content=DAV_BODY)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Nextcloud WebDAV.") from exc
    if response.status_code not in (200, 207):
        raise HTTPException(status_code=502, detail=f"Nextcloud WebDAV returned HTTP {response.status_code}.")
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError as exc:
        raise HTTPException(status_code=502, detail="Nextcloud returned an invalid WebDAV response.") from exc
    entries = []
    for item in root.findall(".//{DAV:}response"):
        prop = item.find(".//{DAV:}prop")
        if prop is None:
            continue
        name = prop.findtext("{DAV:}displayname") or ""
        resource = prop.find("{DAV:}resourcetype")
        is_folder = resource is not None and resource.find("{DAV:}collection") is not None
        href_node = item.find("{DAV:}href")
        href = unquote(href_node.text or "") if href_node is not None else ""
        if not name:
            name = posixpath.basename(href.rstrip("/"))
        entries.append({
            "name": name,
            "is_folder": is_folder,
            "size_bytes": prop.findtext("{DAV:}getcontentlength"),
            "modified": prop.findtext("{DAV:}getlastmodified"),
            "content_type": prop.findtext("{DAV:}getcontenttype"),
        })
    # The first PROPFIND response is the folder itself.
    if entries:
        entries = entries[1:]
    return {"path": path or "/", "items": entries}


@app.get("/tools/nextcloud/read", dependencies=[Depends(require_key)])
async def nextcloud_read(path: str = Query(..., description="File path relative to the Nextcloud account root")):
    """Read a small text or JSON file from Nextcloud; binary downloads are not exposed."""
    base, username, password = nextcloud_settings()
    url = dav_url(base, username, path)
    try:
        async with httpx.AsyncClient(timeout=25, auth=(username, password), follow_redirects=False) as client:
            response = await client.get(url)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Nextcloud WebDAV.") from exc
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="That Nextcloud file was not found.")
    if not response.is_success:
        raise HTTPException(status_code=502, detail=f"Nextcloud WebDAV returned HTTP {response.status_code}.")
    content_type = response.headers.get("content-type", "").split(";")[0].lower()
    if not (content_type.startswith("text/") or content_type in ("application/json", "application/xml", "application/yaml")):
        raise HTTPException(status_code=415, detail="Only text, JSON, XML, and YAML files can be read by this tool.")
    raw = response.text
    return {"path": path, "content": raw[:100_000], "truncated": len(raw) > 100_000}


class NextcloudWrite(BaseModel):
    path: str = Field(..., description="Destination file path relative to the Nextcloud account root")
    content: str = Field(..., max_length=100_000, description="UTF-8 text content to write")


@app.put("/tools/nextcloud/write", dependencies=[Depends(require_key)])
async def nextcloud_write(payload: NextcloudWrite):
    """Create or replace a UTF-8 text file in the connected Nextcloud account."""
    base, username, password = nextcloud_settings()
    url = dav_url(base, username, payload.path)
    try:
        async with httpx.AsyncClient(timeout=25, auth=(username, password)) as client:
            response = await client.put(url, content=payload.content.encode("utf-8"), headers={"Content-Type": "text/plain; charset=utf-8"})
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Nextcloud WebDAV.") from exc
    if response.status_code not in (200, 201, 204):
        raise HTTPException(status_code=502, detail=f"Nextcloud WebDAV returned HTTP {response.status_code}.")
    return {"ok": True, "path": payload.path, "status": response.status_code}


@app.get("/tools/homeassistant/entities", dependencies=[Depends(require_key)])
async def homeassistant_entities(domain: Literal["light", "media_player", "sensor", "switch", "binary_sensor"] | None = None):
    """Read states for selected, non-secret Home Assistant entity domains."""
    states = await ha_request("GET", "/api/states")
    allowed = {domain} if domain else {"light", "media_player", "sensor", "switch", "binary_sensor"}
    result = []
    for item in states if isinstance(states, list) else []:
        entity_id = str(item.get("entity_id", ""))
        item_domain = entity_id.split(".", 1)[0]
        if item_domain not in allowed:
            continue
        attrs = item.get("attributes") or {}
        result.append({
            "entity_id": entity_id,
            "domain": item_domain,
            "name": attrs.get("friendly_name", entity_id),
            "state": item.get("state"),
            "unit": attrs.get("unit_of_measurement"),
            "last_changed": item.get("last_changed"),
        })
        if len(result) >= 250:
            break
    return {"entities": result}


class HomeAssistantAction(BaseModel):
    entity_id: str = Field(..., description="A light.* or media_player.* entity")
    service: Literal["turn_on", "turn_off", "media_play", "media_pause", "media_play_pause"]


@app.post("/tools/homeassistant/action", dependencies=[Depends(require_key)])
async def homeassistant_action(payload: HomeAssistantAction):
    """Control only lights and media players; other Home Assistant domains are deliberately blocked."""
    if "." not in payload.entity_id:
        raise HTTPException(status_code=400, detail="Use a valid Home Assistant entity ID.")
    domain = payload.entity_id.split(".", 1)[0]
    allow = {
        "light": {"turn_on", "turn_off"},
        "media_player": {"media_play", "media_pause", "media_play_pause"},
    }
    if payload.service not in allow.get(domain, set()):
        raise HTTPException(status_code=403, detail="This Home Assistant domain/service is not enabled in OneOS Connect.")
    result = await ha_request("POST", f"/api/services/{domain}/{payload.service}", {"entity_id": payload.entity_id})
    return {"ok": True, "entity_id": payload.entity_id, "service": payload.service, "result": result}
