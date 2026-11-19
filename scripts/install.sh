#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is missing. Install Docker Engine first; see README.md."
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is missing. Install the Docker Compose plugin first."
  exit 1
fi
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

python3 - <<'PY'
from pathlib import Path
import secrets
p = Path(".env")
lines = p.read_text().splitlines()
generated = {}
keys = {
    "WEBUI_SECRET_KEY": 48,
    "CONNECT_API_KEY": 40,
    "MYSQL_ROOT_PASSWORD": 32,
    "MYSQL_PASSWORD": 32,
    "NEXTCLOUD_ADMIN_PASSWORD": 28,
}
out = []
for line in lines:
    if "=" in line and not line.lstrip().startswith("#"):
        key, value = line.split("=", 1)
        if key in keys and (value.strip() == "CHANGE_ME" or not value.strip()):
            value = secrets.token_urlsafe(keys[key])
            generated[key] = value
            line = f"{key}={value}"
    out.append(line)
p.write_text("\n".join(out) + "\n")
if generated:
    print("\nGenerated credentials (save these somewhere safe):")
    if "NEXTCLOUD_ADMIN_PASSWORD" in generated:
        print("Nextcloud admin username is the NEXTCLOUD_ADMIN_USER in .env")
        print("Nextcloud admin password: " + generated["NEXTCLOUD_ADMIN_PASSWORD"])
    if "CONNECT_API_KEY" in generated:
        print("OneOS Connect API key: " + generated["CONNECT_API_KEY"])
    print("Open WebUI, database and connector secrets were saved into .env.")
PY

mkdir -p data/{caddy,caddy-config,open-webui,mariadb,redis,nextcloud,vaultwarden,homeassistant,navet} backups
chmod 600 .env
docker compose config --quiet
docker compose pull
docker compose up -d --build
echo
echo "OneOS containers:"
docker compose ps
echo
echo "Open https://${ONEOS_DOMAIN:-oneos.home.arpa} after configuring your router's local DNS."
echo "Export Caddy's local root certificate with:"
echo "docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt"
