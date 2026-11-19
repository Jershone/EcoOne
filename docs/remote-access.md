# Private remote access with Tailscale

The Pi and each laptop/phone must be signed into the same Tailscale tailnet. `./omnexa-run` installs Tailscale on Raspberry Pi OS and runs `tailscale up`; complete the sign-in using your existing Tailscale identity provider (such as Google or GitHub), not Authentik.

Keep Tailscale identity independent of Authentik. If the Pi, Docker, or Authentik is down, you still need a working path into the tailnet to repair it.

## Connect your devices

1. Install the official Tailscale app on your laptop and phone.
2. Sign in with the same tailnet account used when enrolling the Pi.
3. Confirm all devices appear in the Tailscale admin console.
4. Use the Pi's Tailscale IP or MagicDNS name to reach its services privately.
5. Keep router port forwarding disabled. Do not expose Docker, PostgreSQL, MariaDB, Authentik admin, Vaultwarden, or Home Assistant directly to the public internet.

## DuckDNS

`omnexa.duckdns.org` is the selected DNS label. A DNS record alone does not provide access control, HTTPS, or a secure tunnel. This repository does not enable public ingress or router port forwarding. Do not assume the hostname is remotely reachable until a deliberate HTTPS ingress design is configured.

## Tailscale Serve

Tailscale Serve can publish one local service privately to devices in your tailnet. Before enabling it, choose the service and verify its authentication, TLS, and callback URLs. Do not blindly publish every Compose port. Use the official Tailscale Serve documentation and test from a second device.
