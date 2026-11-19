# Omnexa identity and SSO

Authentik is the central identity provider and user directory. The installer creates the initial built-in `akadmin` administrator using the email and password entered during `./omnexa-run`. Authentik's bootstrap account is named `akadmin`; the installer does not invent a different admin username. The bootstrap values are only consumed on the first startup.

Open Authentik at `http://PI-LAN-IP:9000` or through the Pi's Tailscale IP. Do not expose port 9000 publicly. Add named users and groups in Directory, then assign applications to the groups that should use them.

## Open WebUI (native OIDC)

1. In Authentik, create an OAuth2/OpenID Connect provider and application with slug `openwebui`.
2. Set the strict redirect URI to `https://ai.omnexa.duckdns.org/oauth/oidc/callback`. This must match the actual HTTPS URL used by Open WebUI; if you change the hostname, change this URI too.
3. Copy the Client ID and Client Secret into `OPEN_WEBUI_OAUTH_CLIENT_ID` and `OPEN_WEBUI_OAUTH_CLIENT_SECRET` in `.env`.
4. Set `OPEN_WEBUI_OPENID_PROVIDER_URL` to `https://AUTHENTIK-HTTPS-URL/application/o/openwebui/.well-known/openid-configuration`.
5. Recreate Open WebUI: `docker compose up -d --force-recreate open-webui`.
6. Test with a non-admin account. Keep an emergency local admin login until SSO is verified.

Open WebUI supports one OIDC provider at a time. Authentik is not automatically connected until the provider and client details are entered.

## Nextcloud

Nextcloud's OIDC integration is not enabled automatically. Install the upstream `user_oidc` app and configure it with an Authentik provider's discovery URL and client credentials. Test account mapping and recovery before changing existing accounts. Do not assume matching email addresses alone safely merge accounts.

## Home Assistant and Navet

Home Assistant does not include generic OIDC login as a standard built-in provider. Authentik can protect a web route through a proxy outpost, but that can interfere with mobile apps, webhooks, local device discovery, and API clients. Keep Home Assistant's native login and API token until a proxy design is separately tested. Navet continues to authenticate through Home Assistant.

## Vaultwarden

Vaultwarden keeps its own account system. Do not force an unsupported SSO/proxy configuration in front of its web vault or sync API; it can break Bitwarden clients and account recovery. Keep signups disabled after creating the intended account.

## Honest SSO boundary

Authentik does not magically unify accounts in apps without compatible SSO. In this initial deployment, Authentik provides user/group management and native OIDC integration for Open WebUI after manual provider setup. Nextcloud requires its OIDC app configuration. Home Assistant and Vaultwarden retain their supported native authentication until a separately tested integration is implemented.
