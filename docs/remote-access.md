# Private remote access with Tailscale

Omnexa uses Tailscale Serve for private HTTPS access. Serve shares local services only with devices in the same tailnet; it is not Funnel and does not publish the services to the public internet.

## Connect devices

1. Install the official Tailscale app on the laptop and phone.
2. Sign in with the same tailnet identity used when enrolling the Pi.
3. Enable MagicDNS and HTTPS certificates in the Tailscale admin console if prompted.
4. Confirm the devices appear in the same tailnet.
5. Open the private URLs printed by `./omnexa-run`.

## Service endpoints

| Service | HTTPS port | Access |
|---|---:|---|
| Omnexa portal | 8443 | Tailnet only |
| Authentik | 8444 | Tailnet only |
| Open WebUI | 8445 | Authentik forward-auth gate |
| Nextcloud | 8446 | Authentik forward-auth gate |
| Vaultwarden | 8447 | Native Bitwarden-compatible login |
| Navet | 8448 | Authentik gate, then Home Assistant sign-in |
| Home Assistant | 8123 | Native login/API over tailnet |

The Caddy listeners for Open WebUI, Nextcloud, and Navet bind to loopback-only ports on the Pi. The Tailscale Serve HTTPS listeners forward to those local ports. Vaultwarden is served directly through Tailscale Serve so its Bitwarden sync/API endpoints keep their expected behavior. Home Assistant uses its native interface and API over the encrypted tailnet.

## Keep Tailscale independent

Use your existing Tailscale identity provider, not Authentik. If Authentik or Docker is offline, you still need to reach the Pi over Tailscale to repair it.

## DuckDNS

`omnexa.duckdns.org` is reserved for a possible future DNS setup. It is not required by this private Tailscale deployment. A DNS record alone does not provide access control or a secure tunnel.

Do not configure router port forwarding or Tailscale Funnel for Omnexa.
