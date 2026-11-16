# EcoOne

**One ecosystem. Every device.**

EcoOne is an open-source, local-first project for connecting computers, phones, TVs and compatible smart-home devices without requiring one hardware brand.

This repository now contains the first runnable foundation: a private LAN server, device pairing, a web/PWA dashboard, a Windows desktop app shell, an Android / Android TV companion, and a Home Assistant bridge.

## Start it

Requirements: Node.js 22 or newer.

**Windows PowerShell**
```powershell
git clone https://github.com/Jershone/EcoOne.git
cd EcoOne
.\ecoone.ps1
```

On Linux/macOS:
```bash
git clone https://github.com/Jershone/EcoOne.git
cd EcoOne
chmod +x ecoone
./ecoone
```

The launcher installs npm dependencies automatically on first run and starts the private server on port `43821`. The terminal prints the local address, LAN address(es) and a six-digit pairing code. Keep the host running while connected devices use EcoOne.

Read [docs/START-HERE.md](docs/START-HERE.md) for phone, TV and desktop installation.

## First release scope (0.1)

- Local HTTP server for a trusted home LAN.
- Six-digit device pairing and local device registry.
- Paired-device online status.
- Authenticated WebSocket sessions and a small device-to-device relay foundation.
- Responsive web dashboard and installable PWA.
- Electron desktop app and Windows / Linux build definitions.
- Android / Android TV companion APK.
- Home Assistant connection and control for supported lights, switches and media players.

## Smart home

Home Assistant is the supported bridge in this release. Add vendor integrations in Home Assistant, then connect EcoOne with a Home Assistant URL and long-lived access token. EcoOne stores that token in the host's local data folder and does not send it to paired devices.

See [docs/SMART-HOME.md](docs/SMART-HOME.md). Device availability depends on the Home Assistant integration and hardware model.

## Downloads and builds

- [Downloads page](https://jershone.github.io/EcoOne/downloads.html)
- [GitHub Releases](https://github.com/Jershone/EcoOne/releases)
- [GitHub Actions builds](https://github.com/Jershone/EcoOne/actions)

GitHub Actions builds Windows, Linux and Android packages on pushes to `main`. Push a version tag such as `v0.1.0` to create a GitHub Release with downloadable installers.

## Build locally

```bash
npm install
npm test
npm run desktop
```

Windows installer: `npm run dist:windows` on Windows. Linux AppImage: `npm run dist:linux` on Linux. Android: open `android/` in Android Studio or use Gradle 8.13 and JDK 17 with `gradle -p android :app:assembleDebug`.

## Roadmap

1. One Connect: clipboard sync, deliberate file transfer, phone touchpad / keyboard, safe device-to-device flows.
2. One Home: more Home Assistant entity domains, local discovery and carefully scoped vendor adapters.
3. One AI: provider settings and a shared assistant layer.
4. One Browser and One Search: privacy controls and open search providers.
5. One Office: open document formats and integrations with proven projects.
6. One Cloud: optional self-hosted sync and backup.

The roadmap is not a claim that these features already work. Each area needs separate implementation, permissions, compatibility testing and security review.

## Security model and limits

EcoOne 0.1 is designed for a trusted private home network, not public internet access. Do not port-forward port `43821`. Pairing codes are displayed in the host terminal; paired devices receive individual tokens. The server stores token hashes for device pairing. Home Assistant's long-lived token is stored locally on the host and should be protected like a password.

The first release uses HTTP on the LAN and does not yet provide remote access, HTTPS certificates, code signing or production mobile signing. Do not use it on public Wi-Fi or expose it to the internet.

## License

MIT for the original EcoOne code in this repository. Third-party dependencies and future integrations retain their own licenses.
