# OneOS app connections

OneOS does not replace the applications' own interfaces. It connects them through their supported APIs and authentication methods.

## Connection map

| From | To | Connection |
|---|---|---|
| Open WebUI | OneOS Connect | OpenAPI tool server |
| OneOS Connect | Nextcloud | WebDAV using a dedicated app password |
| OneOS Connect | Home Assistant | REST API using a dedicated long-lived token |
| Open WebUI | AppFlowy (optional) | AppFlowy's own OpenAPI document |
| Navet | Home Assistant | Navet's supported Home Assistant provider login |
| Vaultwarden | AI | No connection by design |

## Nextcloud → OneOS Connect

1. Sign in to Nextcloud as an administrator.
2. Create a dedicated standard user named `oneos-ai` (or set `NEXTCLOUD_CONNECT_USER` in `.env` to another account).
3. Sign in as that service user, open Personal settings → Security, and create a new app password called `OneOS Connect`.
4. Copy the app password into `NEXTCLOUD_CONNECT_APP_PASSWORD` in `.env`.
5. Restart the connector: `docker compose up -d --force-recreate connect`.

The connector can list folders, read small text/JSON/XML/YAML files, and create or replace UTF-8 text files. It cannot read binary downloads. Its access is limited to the service user's files.

## Home Assistant → OneOS Connect

1. Finish Home Assistant onboarding at `https://home.oneos.home.arpa`.
2. Create a dedicated Home Assistant user for the connector. Give it only the access it needs.
3. Sign in as that user and create a long-lived access token from the user profile.
4. Put the token in `HOME_ASSISTANT_TOKEN` in `.env`. The URL should normally remain `http://host.docker.internal:8123` because the Home Assistant container uses host networking.
5. Restart the connector: `docker compose up -d --force-recreate connect`.

The current tool allow-list permits state reads for lights, media players, sensors, switches and binary sensors. It only permits actions for lights (on/off) and media players (play/pause). Locks, alarms, garage doors, covers and arbitrary Home Assistant service calls are not exposed.

### Home Assistant reverse-proxy configuration

Home Assistant is routed through Caddy at `https://home.oneos.home.arpa`. Add this to `data/homeassistant/configuration.yaml` (merge it with any existing `http:` section; do not duplicate the key):

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 172.30.0.0/24
```

Then restart only Home Assistant:

```bash
docker compose restart homeassistant
```

If you change the Docker subnet in `docker-compose.yml`, update the trusted proxy CIDR too.

## Open WebUI → OneOS Connect

1. Open `https://ai.oneos.home.arpa` and sign in as the Open WebUI administrator.
2. Open the Admin Settings tool-server section and add an OpenAPI server.
3. Use the server/schema URL `https://connect.oneos.home.arpa/openapi.json`.
4. Choose Bearer authentication and paste the value of `CONNECT_API_KEY` from the Pi's `.env` file.
5. Save it and test the Nextcloud and Home Assistant tools.

If your Open WebUI version labels this area differently, look for its external OpenAPI tools/servers section. The connector's schema is served directly by FastAPI at `/openapi.json`.

## AppFlowy → Open WebUI

The optional AppFlowy self-host server exposes its own OpenAPI document at `/api/docs/openapi.json`. Register that document as a separate OpenAPI tool server in Open WebUI after the AppFlowy server is running. Use an AppFlowy credential with only the access needed for the workspace. See [appflowy.md](appflowy.md) for the licensing and deployment caveat.

## Why Vaultwarden stays separate

A password manager is a high-impact secret store. OneOS does not provide an AI tool for reading vault entries, exporting passwords, or accessing the Vaultwarden admin interface. Use Vaultwarden through its own official clients and UI.
