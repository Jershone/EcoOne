# Private remote access with Tailscale

The installer enrolls the Pi in your existing tailnet and configures Tailscale Serve endpoints. Tailscale Serve provides HTTPS certificates and keeps the routes available only to devices in that tailnet. It is not Tailscale Funnel and does not make the apps public on the internet.

## Connect your devices

1. Install the official Tailscale app on your laptop and phone.
2. Sign in with the same tailnet account used when enrolling the Pi. Keep this identity separate from Authentik.
3. Confirm the devices appear in the Tailscale admin console.
4. If prompted, enable HTTPS certificates for your tailnet in the Tailscale admin console, then rerun `./omnexa-run`.
5. Use the private HTTPS addresses printed by the installer. The service ports are 8443 (portal), 8444 (Authentik), 8445 (Open WebUI), 8446 (Nextcloud), 8447 (Vaultwarden), and 8448 (Navet). Home Assistant is available at the Pi's Tailscale IP on port 8123 over the encrypted tailnet.
6. Review tailnet ACLs so only your intended devices/users can access the Pi.

The Tailscale Serve listener is private to the tailnet. Do not use Tailscale Funnel for these services. Keep router port forwarding disabled. Do not expose Docker, PostgreSQL, MariaDB, Authentik admin, Vaultwarden, or Home Assistant directly to the public internet.

## Keep Tailscale login independent

Use your existing Tailscale identity provider (such as Google or GitHub), not Authentik. If the Pi, Docker, or Authentik is offline, you still need a working path into the tailnet to repair it.

## DuckDNS

`omnexa.duckdns.org` is the selected DNS label, but this private Tailscale setup does not depend on DuckDNS. A DNS record alone does not provide access control, HTTPS, or a secure tunnel. Keep DuckDNS as a reserved name until you deliberately configure a separate public-facing use case.
