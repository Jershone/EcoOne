# Raspberry Pi deployment notes

## Hardware

- Raspberry Pi 4, 4 GB RAM
- Raspberry Pi OS 64-bit
- Ethernet recommended
- 64 GB microSD for first boot only; move persistent application data to a USB SSD as soon as possible
- No local language model or model weights are installed

## Suggested install sequence

1. Install Raspberry Pi OS 64-bit and enable SSH.
2. Connect the Pi to the home router and identify its LAN IP.
3. Install Docker Engine and Compose v2.
4. Clone this repository and run `./scripts/install.sh`.
5. Configure local DNS names and trust Caddy's local CA on your phone/laptop.
6. Finish Nextcloud, Vaultwarden, Home Assistant and Navet setup.
7. Add cloud model provider keys in Open WebUI.
8. Configure Nextcloud and Home Assistant credentials for OneOS Connect.
9. Add the OneOS Connect OpenAPI tool server inside Open WebUI.
10. Add AppFlowy only if you accept its separate upstream licence and the Pi has enough headroom.

## Storage migration to SSD

Before moving data, stop the services:

```bash
docker compose down
```

Copy the whole OneOS folder, including `.env` and `data/`, to the mounted SSD, then run Compose from the copied folder. Do not delete the original until you have checked every app and created an additional backup.

## Monitor the Pi

```bash
docker stats
df -h
free -h
docker compose ps
```

If memory pressure or SD-card I/O is high, stop AppFlowy first, then pause services you are not using. Avoid installing a local LLM on this 4 GB Pi; use cloud APIs as designed.
