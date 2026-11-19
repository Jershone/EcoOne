# Architecture

```text
Laptop / Phone browser
        |
        | HTTPS (Caddy local CA)
        v
OneOS Portal (very small launcher)
   |                    |
   | app links           | iframe: original Open WebUI page
   v                    v
Nextcloud / HA /       Open WebUI
Navet / Vaultwarden       |
                          | OpenAPI tool calls
                          v
                     OneOS Connect
                       /       \
                  WebDAV       HA REST
                    |            |
                Nextcloud    Home Assistant
                                  |
                                Navet

Optional: AppFlowy self-host stack, installed from its own upstream repository.
External: Magic Earth phone app and Google Search.
```

## Responsibilities

- Upstream app containers own their UI, data model, identity and upgrade cycle.
- Caddy terminates local HTTPS and routes by subdomain.
- The portal only provides launch links and an iframe drawer. It contains no custom chat components.
- Open WebUI provides the assistant UI and connects to hosted model APIs.
- OneOS Connect is a narrow adapter, not an unrestricted network proxy.
- Vaultwarden is isolated from assistant tools.
- Home Assistant owns device integrations; Navet is a dashboard/provider client of Home Assistant.

## Why subdomains?

Open WebUI runs at `ai.<domain>` and the portal at `<domain>`. They are separate origins but same-site sibling hosts. The reverse proxy strips the upstream `X-Frame-Options` response header; Open WebUI emits a Content-Security-Policy `frame-ancestors` directive allowing only the portal. Secure, same-site cookies are enabled for HTTPS.

This does not create single sign-on across every app. Each upstream app still owns its login. A future SSO provider must be evaluated app by app; do not assume all upstream apps support generic OIDC in the same way.
