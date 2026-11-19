# Omnexa — connected self-hosted ecosystem

Omnexa is a Raspberry Pi deployment project, not a replacement operating system. Each upstream application keeps its own interface. The portal is a launcher and embeds the real Open WebUI interface in a narrow desktop drawer / full-screen mobile panel.

## One-command installation

On a fresh Raspberry Pi OS 64-bit installation, open a terminal and run:

```bash
git clone https://github.com/Jershone/EcoOne.git Omnexa
cd Omnexa
chmod +x omnexa-run
./omnexa-run
```

The installer checks Docker, generates unique secrets, asks for the Authentik administrator email and password, installs Tailscale, asks you to authenticate the Pi into your tailnet, starts the services, and opens the Authentik setup page. It does not configure router port forwarding.

You can run `./omnexa-run` again to update/reconcile the stack. The script never overwrites an existing `.env`.

## Identity and access

Authentik is Omnexa's central identity provider. It is included with its own PostgreSQL database and persistent data. The first account is Authentik's `akadmin` administrator. Use the Authentik admin UI to add people, groups, and app providers.

- Open WebUI supports Authentik OIDC; provider/client details are configured in Authentik and then entered in `.env` (see `docs/authentication.md`).
- Nextcloud can use its OIDC user backend, but it requires installing/configuring the upstream user_oidc app and a provider. Follow the guide.
- Home Assistant does not provide generic OIDC login as a built-in feature. It can be protected at the reverse-proxy layer, but do not enable proxy authentication until trusted-proxy and direct-access rules are tested.
- Navet uses its Home Assistant connection.
- Vaultwarden remains on its own account system. Do not put a password manager behind an untested SSO/proxy configuration; preserve its supported Bitwarden clients and emergency access.
- Tailscale keeps its own Google/GitHub identity provider. This is deliberate: if Omnexa or Authentik is offline, you must still be able to reach the Pi to repair it.

Authentik does not magically unify accounts in apps without compatible SSO. The guides identify what is native OIDC and what needs proxy protection.

## Included services

| Service | Purpose |
|---|---|
| Open WebUI | Hosted/cloud model UI; configure provider API keys in its admin settings |
| Authentik | Central identity provider and user/group management |
| Nextcloud + MariaDB + Redis | Files and collaboration |
| Vaultwarden | Separate password manager |
| Home Assistant | Smart-home platform |
| Navet | Home Assistant-connected dashboard |
| Omnexa Connect | Limited API tools for Nextcloud and Home Assistant |
| Caddy | Reverse proxy |
| AppFlowy | Optional separate installer; current server distribution has a separate commercial self-host licence |

Magic Earth and Google Search remain external services. Immich and LibreChat are not included.

## Remote access and DuckDNS

The chosen DNS name is `omnexa.duckdns.org`. DuckDNS only maps a name to an IP address; it does not create a secure private network. Tailscale is installed on the Pi and should also be installed on your laptop/phone. Authenticate those devices into the same tailnet. Use the Pi's Tailscale IP or MagicDNS name with the service ports printed by the installer.

The installer configures private Tailscale Serve HTTPS routes (not public Funnel) for the portal and web apps. The portal's embedded Open WebUI drawer is used on the configured app hostname; on the direct Tailscale hostname the AI link opens Open WebUI in a new tab because its anti-framing policy is retained. Home Assistant remains available over the encrypted tailnet on port 8123. See `docs/remote-access.md`. Do not expose Vaultwarden, Authentik admin, or database ports to the public internet.

## Hardware notes

Target: Raspberry Pi 4, 4 GB RAM, Raspberry Pi OS 64-bit. This is a heavy stack for 4 GB. Use an SSD for persistent app/database data as soon as possible. Start with the core services and monitor memory; AppFlowy is optional and should be deferred. No local LLM is installed; inference is through cloud model APIs.

## Operations

```bash
./omnexa-run                 # install or reconcile
./scripts/update.sh          # pull and update containers
./scripts/backup.sh          # local backup (copy it off the Pi)
docker compose ps
docker compose logs -f authentik-server authentik-worker
```

Keep `.env`, `data/`, and `backups/` private. Do not commit secrets. Backups on the same SD card are not sufficient.

## Validation status

This repository change has not been run on the physical Raspberry Pi. Verify Docker Compose and each upstream app on the Pi before relying on it. The installer is designed to be rerunnable, but app-specific SSO still requires the configuration steps in the docs.
