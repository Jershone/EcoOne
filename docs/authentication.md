# Omnexa authentication

Authentik is the central identity provider and user/group directory. The installer creates its initial built-in `akadmin` account using the email and password entered during setup.

## Shared browser access

The installer writes an Authentik blueprint containing a domain-level forward-auth provider for the Pi's Tailscale MagicDNS hostname. Authentik's embedded proxy outpost is assigned to that provider. Caddy checks the user's Authentik session before forwarding browser requests to:

- Open WebUI on Tailscale HTTPS port 8445
- Nextcloud on Tailscale HTTPS port 8446
- Navet on Tailscale HTTPS port 8448

The browser apps are routed through Caddy listeners bound to loopback-only host ports. Their direct container ports are not published to the LAN. The Tailscale Serve endpoints are private to the tailnet.

If the blueprint has not been applied yet, inspect `docker compose logs authentik-worker`. Authentik discovers mounted YAML blueprints automatically. The configuration uses Authentik's embedded outpost, so no separately managed proxy-outpost token is required.

## App-specific accounts still exist

Forward authentication is an access gate; it does not automatically create or log into an account inside every upstream app. Keep each app's own supported account system until its native SSO has been configured and tested.

- **Open WebUI:** Authentik gates browser access. Open WebUI still has its own account/login unless its native OIDC provider is configured. Configure OIDC only after creating a provider in Authentik and entering its client details in `.env`. Keep an emergency local admin.
- **Nextcloud:** Authentik gates browser access. For true single sign-on inside Nextcloud, install/configure the upstream `user_oidc` app and test account mapping before disabling local login.
- **Navet:** Authentik gates access to the Navet web app. Navet then uses its supported Home Assistant sign-in to connect to the smart-home instance. This second authorization is intentional.
- **Home Assistant:** It keeps its native login and API token. The Home Assistant mobile app, device discovery, webhooks, and API endpoints must continue to work; do not put a generic browser login redirect in front of the whole API.
- **Vaultwarden:** It keeps its native Bitwarden-compatible accounts and sync/API authentication. A generic proxy login in front of its sync endpoints can break clients, so it is not put behind the shared browser gate.
- **Tailscale:** Its identity remains independent of Authentik. This provides a recovery path if the Pi or Authentik is offline.

## User management

Open Authentik at the private HTTPS URL printed by the installer (port 8444). Sign in as `akadmin`, then create named users and groups in Directory. The shared forward-auth provider is configured for the embedded outpost. Review application access policies before inviting anyone outside your trusted household.\n\nThe installer also asks for a separate Nextcloud administrator password. Open WebUI and Vaultwarden allow initial account registration only behind the private Tailscale access path; after creating the intended accounts, disable Vaultwarden signups by setting `VAULTWARDEN_SIGNUPS_ALLOWED=false` in `.env` and running `docker compose up -d --force-recreate vaultwarden`.

## Recovery

If Authentik is unavailable, use SSH over Tailscale to repair the Pi. Do not expose Authentik, Docker, database ports, Home Assistant, or Vaultwarden directly to the public internet. Tailscale Serve must remain private; do not enable Funnel.
