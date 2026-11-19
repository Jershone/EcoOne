# Raspberry Pi deployment

## Supported target

- Raspberry Pi 4 (4 GB RAM recommended) or newer
- Raspberry Pi OS 64-bit (aarch64)
- Ethernet or reliable Wi-Fi
- 64 GB microSD can be used for initial testing; a USB SSD is strongly recommended for persistent app and database data
- Cloud model APIs only; no local model server

## Install

Run these commands from the Pi's normal user account (do not run the installer as root):

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
git clone https://github.com/Jershone/EcoOne.git Omnexa
cd Omnexa
chmod +x omnexa-run
./omnexa-run
```

The installer checks the OS, architecture, RAM, and free disk space; installs Docker if needed; asks for the initial Authentik administrator email and password; enrolls the Pi in Tailscale; validates the Compose configuration; and starts the services.

Tailscale requires an interactive sign-in. Install Tailscale on each phone/laptop and join the same tailnet. Enable HTTPS certificates in the Tailscale admin console if prompted. The installer prints private URLs when Serve is available.

## First-run checklist

1. Open the Authentik URL printed by the installer and sign in as `akadmin` using the password entered during setup.
2. Create household users and groups in Authentik.
3. Complete Home Assistant's first-run onboarding and add devices/integrations.
4. Open Navet and sign in to Home Assistant using the URL reachable from the browser and Pi.
5. Complete Nextcloud's first-run check and create a dedicated service account plus app password for Omnexa Connect if you want AI file tools.
6. Add a Home Assistant long-lived access token to `.env` only if you want the restricted Connect API tools.
7. Add cloud model provider credentials in Open WebUI.
8. Run `./scripts/doctor.sh` and inspect any failed endpoint before relying on the installation.

## Update, backup, diagnosis

```bash
./scripts/doctor.sh
./scripts/update.sh
./scripts/backup.sh
docker compose logs -f
```

Keep `.env`, `data/`, and `backups/` private. Copy backups to a separate disk or machine. A backup on the same microSD is not a disaster-recovery backup.

## Move to an SSD

Stop the stack with `docker compose down`, copy the entire Omnexa directory (including hidden `.env`) to the mounted SSD, then start it from the new directory. Verify every service and a backup before deleting the original copy.

## Resource notes

The complete stack is demanding for a 4 GB Pi. Keep AppFlowy optional and defer it until the core stack has been stable and memory usage has been measured. Monitor with `docker stats`, `free -h`, and `df -h`. If the Pi repeatedly swaps or runs out of memory, disable services you do not use or move to stronger hardware.
