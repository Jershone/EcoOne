# OneOS — self-hosted ecosystem

OneOS is a Raspberry Pi deployment repository, not a replacement operating system and not a collection of cloned app interfaces. It runs the upstream applications you choose, keeps their own UIs, and adds a small integration layer so they can work together.

**The main idea:** each product keeps its original interface. Open WebUI is the real Open WebUI application, loaded in an iframe drawer from the OneOS portal. OneOS Connect exposes permission-limited API tools to that assistant.

## Included services

| App | How it runs | What it does |
|---|---|---|
| Open WebUI | Official container | One assistant UI; cloud model providers are configured in its settings |
| Nextcloud | Official container + MariaDB + Redis | Files and cloud storage |
| Vaultwarden | Official container | Separate password manager; deliberately not connected to AI |
| Home Assistant | Official container, host networking | Smart-home platform and API |
| Navet | Official container | Smart-home dashboard connected to Home Assistant |
| OneOS Connect | Small Python/FastAPI service in this repo | OpenAPI tools for Nextcloud and Home Assistant |
| Caddy | Official container | Local HTTPS and reverse proxy |
| AppFlowy | Optional upstream installer | See the licence note below |

Magic Earth is a phone app and Google Search is an external service; neither is a self-hosted server. They are not copied into this repository. Immich is not included.

## Important Raspberry Pi notes

This deployment targets **Raspberry Pi OS 64-bit on a Raspberry Pi 4 (4 GB)**. There is no local LLM server in this stack: model inference happens at the cloud provider you connect in Open WebUI.

The core services are a fairly large workload for 4 GB RAM. Start with the core Compose stack, use an SSD for persistent data as soon as possible, and add AppFlowy only after checking available memory and storage. A 64 GB microSD card is a starting point, not a good long-term data disk for Nextcloud databases and frequent writes.

## 1. Prepare Raspberry Pi OS

On your Pi, connect by SSH or open a terminal. Update the OS and install Docker:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y git curl ca-certificates openssl
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh
sudo usermod -aG docker "$USER"
```

Log out and SSH in again so the Docker group takes effect. Confirm:

```bash
docker --version
docker compose version
```

## 2. Download and configure OneOS

```bash
git clone https://github.com/Jershone/EcoOne.git OneOS
cd OneOS
cp .env.example .env
nano .env
```

Set your timezone, the hostname you will use, and the Nextcloud admin username. The setup script generates the local secrets and the initial Nextcloud admin password if the example values are still present.

The default local name is `oneos.home.arpa`. In your router's local DNS settings, create these names pointing to the Pi's LAN IP:

- `oneos.home.arpa`
- `ai.oneos.home.arpa`
- `cloud.oneos.home.arpa`
- `vault.oneos.home.arpa`
- `home.oneos.home.arpa`
- `navet.oneos.home.arpa`
- `connect.oneos.home.arpa`

A wildcard DNS record for `*.oneos.home.arpa` is also suitable. If your router cannot create local DNS records, add the names to the hosts file on each device. Do not use public DNS for these private names.

## 3. Start the core stack

```bash
chmod +x scripts/*.sh
./scripts/install.sh
```

Check the containers:

```bash
docker compose ps
docker compose logs -f caddy open-webui connect
```

Open `https://oneos.home.arpa`. Caddy uses its own local certificate authority. Export its root certificate and trust it on each device that will use OneOS:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

Install `caddy-root.crt` as a trusted CA certificate on your laptop and phone. Keep that file private to your home setup. Browsers will show a certificate warning until the CA is trusted.

## 4. First-time setup

1. Open `https://cloud.oneos.home.arpa` and sign in with the generated Nextcloud admin account. The setup script prints the initial password once.
2. Open `https://vault.oneos.home.arpa`. Temporarily set `VAULTWARDEN_SIGNUPS_ALLOWED=true` in `.env`, restart with `docker compose up -d vaultwarden`, create your account, then set it back to `false` and restart. Do not leave public signups enabled.
3. Open `https://home.oneos.home.arpa` and complete Home Assistant onboarding. For reverse-proxy support, add the trusted-proxy snippet from [docs/connections.md](docs/connections.md) to Home Assistant's `configuration.yaml`, then restart Home Assistant.
4. Open `https://navet.oneos.home.arpa` and connect it to the Home Assistant address `https://home.oneos.home.arpa`. Navet uses Home Assistant as its provider; it is not a separate smart-home backend.
5. Open `https://ai.oneos.home.arpa` and create the first Open WebUI account. The first account is the administrator. Then set `OPEN_WEBUI_ENABLE_SIGNUP=false` in `.env` and run `docker compose up -d open-webui` to disable further signups.

## 5. Connect cloud AI providers

Open WebUI → Admin Settings → Connections. Add your provider API endpoint and API key there. Open WebUI supports OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Groq, OpenRouter, Azure OpenAI, and other OpenAI-compatible services. See [docs/cloud-models.md](docs/cloud-models.md).

**No local models are installed or downloaded by this Compose stack.** A cloud API account and its own API usage terms/costs are required. Your prompts and any context you attach are sent to the selected provider.

## 6. Connect the apps to the assistant

Open [docs/connections.md](docs/connections.md). In brief:

- Nextcloud: create a dedicated non-admin account and an app password for OneOS Connect.
- Home Assistant: create a long-lived token for a dedicated account and use it in `.env`.
- Open WebUI: register OneOS Connect as an OpenAPI tool server using `https://connect.oneos.home.arpa/openapi.json` and the `CONNECT_API_KEY` from `.env`.
- AppFlowy: if you choose its current self-host distribution, its own OpenAPI document can be registered separately. See the licensing and setup note in [docs/appflowy.md](docs/appflowy.md).
- Vaultwarden: deliberately has no AI connector. The assistant must not read the password vault.

The assistant can only access what the integration account/token can access. The Home Assistant tool allow-list is intentionally limited to lights and media players; it does not expose locks, alarms, covers, or arbitrary service calls.

## 7. Open the embedded assistant

The portal at `https://oneos.home.arpa` has a button that opens the **actual Open WebUI site** inside an iframe.

- Laptop/desktop: a narrow, phone-like drawer approximately 420 px wide.
- Phone: a full-height, full-width panel that respects the device's safe areas.
- The panel does not reimplement the chat UI. It loads `https://ai.oneos.home.arpa`.

Open WebUI and the portal use sibling subdomains under the same home domain. Caddy removes the frame-deny header at the proxy and Open WebUI sends a frame-ancestors policy allowing only the OneOS portal. If the iframe is blank, check certificate trust, the browser console, and `docker compose logs open-webui caddy`.

## Updating and backups

```bash
./scripts/update.sh
./scripts/backup.sh
```

Backups are written to `backups/`. Copy them to another disk or a separate machine; a backup stored only on the Pi's microSD is not a reliable backup. AppFlowy has its own backup procedure and is not included in the core backup script.

## AppFlowy and the open-source boundary

The current official AppFlowy self-host server repository is distributed under the **AppFlowy Self-Hosted Commercial License**, not the same open-source licence as the AppFlowy client. It advertises a free self-host tier for one user seat. The installer in `scripts/install-appflowy.sh` is therefore optional, asks you to read/accept the upstream terms, and downloads the upstream repository without copying its source into OneOS.

The older AppFlowy-Cloud repository is archived and is not the recommended current self-host server. Read [docs/appflowy.md](docs/appflowy.md) before deciding.

## Security boundary

- Do not port-forward these services to the public internet.
- Keep `.env`, `data/`, `backups/`, Caddy's CA key, and API tokens private.
- Use unique strong passwords and app-specific credentials.
- Vaultwarden is not exposed as an AI tool.
- The default network is intended for a trusted home LAN. For remote access, add a private VPN such as Tailscale rather than opening router ports.
- This is a starter home deployment, not a hardened public production environment.

## Repository contents

- `docker-compose.yml`: upstream services and the OneOS Connect service
- `Caddyfile`: local HTTPS and app hostnames
- `portal/`: small launcher shell and the Open WebUI iframe drawer only
- `connect/`: API tools for approved integrations
- `scripts/`: setup, update, backup, and optional AppFlowy installer
- `docs/`: integration and operational guides

Original OneOS orchestration and connector code is MIT-licensed. Each upstream project retains its own licence and terms.
