# Omnexa — connected self-hosted ecosystem

Omnexa is a self-hosted app ecosystem for Raspberry Pi OS 64-bit. It is not a replacement operating system: each upstream app keeps its own interface. The portal is a launcher, and the integration layer connects selected services.

## One-command installation

On a fresh Raspberry Pi OS 64-bit installation:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
git clone https://github.com/Jershone/EcoOne.git Omnexa
cd Omnexa
chmod +x omnexa-run
./omnexa-run
```

The installer checks architecture, memory, and disk space; installs Docker if needed; generates secrets; asks for separate Authentik and Nextcloud administrator passwords; enrolls the Pi in Tailscale; generates the Authentik forward-auth blueprint for its MagicDNS hostname; validates Compose; and starts the stack.

Tailscale sign-in is interactive. Install Tailscale on each phone/laptop and join the same tailnet. Enable MagicDNS and HTTPS certificates when prompted. No router port forwarding is required.

## Authentication model

Authentik is the central identity provider and user/group directory. The installer automatically configures its embedded proxy outpost and a shared forward-auth provider for browser access to Open WebUI, Nextcloud, and Navet.

Forward authentication is an access gate, not automatic account federation. Those upstream apps still retain their own account login until their native OIDC integration is configured. Navet also uses Home Assistant's supported sign-in. Home Assistant and Vaultwarden retain native authentication because generic proxy redirects can break their APIs, device integrations, and Bitwarden clients. Tailscale identity remains independent for recovery.

See [docs/authentication.md](docs/authentication.md) for the exact boundaries and setup details.

## Included services

| Service | Purpose |
|---|---|
| Omnexa portal | Launcher for hosted services |
| Authentik | Central identity and shared browser access |
| Open WebUI | Cloud model interface; no local LLM |
| Nextcloud + MariaDB + Redis + cron | Files and collaboration |
| Vaultwarden | Password manager with native Bitwarden-compatible auth |
| Home Assistant | Smart-home platform |
| Navet | Home Assistant-connected dashboard |
| Omnexa Connect | Limited API tools for Nextcloud and Home Assistant |
| Caddy | Reverse proxy and Authentik forward-auth gate |
| Tailscale | Private remote access |

Magic Earth and Google Search remain external services. Immich and LibreChat are not included. AppFlowy is optional and is not installed by the core installer.

## Hardware

Target: Raspberry Pi 4, 4 GB RAM, Raspberry Pi OS 64-bit. The full stack is demanding for 4 GB. Use an SSD for persistent application/database data as soon as possible; the microSD is suitable for initial setup, not ideal long-term storage. AppFlowy remains optional and should be deferred until resource usage is measured.

## Operations

```bash
bash ./scripts/doctor.sh     # endpoint and resource checks
./scripts/update.sh          # pull and update containers
./scripts/backup.sh          # local backup; copy it off the Pi
docker compose ps
docker compose logs -f authentik-server authentik-worker
```

Keep `.env`, `data/`, and `backups/` private. A backup on the same SD card is not disaster recovery.

## Validation status

The repository includes CI checks for shell syntax, Python syntax, and Docker Compose configuration. These checks do not replace a real installation test on the target Raspberry Pi. Do not rely on the stack for critical data until the Pi installation, app sign-ins, backups, restores, and remote access have all been verified.
