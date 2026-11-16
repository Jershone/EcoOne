# EcoOne — Start here

EcoOne 0.1 is the first runnable local release. The **host computer runs the private server**. Phones, tablets and Android TV screens connect to it over your home Wi-Fi.

## 1. Start the private server

Install Node.js 22 or newer from https://nodejs.org/

Clone the repository and enter the folder:

```powershell
git clone https://github.com/Jershone/EcoOne.git
cd EcoOne
.\ecoone.ps1
```

On macOS or Linux:

```bash
git clone https://github.com/Jershone/EcoOne.git
cd EcoOne
chmod +x ecoone
./ecoone
```

The first run installs npm dependencies automatically. Keep the terminal open while EcoOne is running.

The terminal prints a local address, one or more LAN addresses (for example `http://192.168.1.20:43821`) and a six-digit pairing code. Open the local address on the host computer. If Windows Firewall asks, allow Node.js on **Private networks only**. Do not create a router port-forward for EcoOne.

## 2. Connect a phone

On the phone, open the LAN address printed by the server, using the same home Wi-Fi. Enter a device name and the six-digit code from the host terminal.

The dashboard is also a Progressive Web App. In Chrome on Android, use the browser menu's **Install app** or **Add to Home screen** option.

## 3. Connect Android TV

Download the **EcoOne Android / Android TV APK** from [GitHub Releases](https://github.com/Jershone/EcoOne/releases). Transfer it to your Android TV device using a method you already use for your own files, install it, and open EcoOne.

Enter the LAN server address shown by the host terminal. The EcoOne pairing page opens on the TV. Use the TV remote to enter the six-digit code and choose a name such as `Living room TV`.

The same APK includes Android TV launcher support. Other smart-TV platforms are not native APK targets; use their browser if it supports a modern web app, or connect them through Home Assistant when supported.

## 4. Install the Windows desktop app

Download `EcoOne-Setup.exe` from [GitHub Releases](https://github.com/Jershone/EcoOne/releases) and run it. The desktop app includes the local server and opens its dashboard.

The first installer is not code-signed yet, so Windows may display an unknown-publisher warning. Only install builds from this repository that you have chosen to trust.

## 5. Build the apps yourself

```bash
npm install
npm test
npm run desktop
```

Windows installer: `npm run dist:windows` on Windows. Linux AppImage: `npm run dist:linux` on Linux.

The Android project is in `android/`. Open it in Android Studio, or build with Gradle 8.13 and JDK 17:

```bash
gradle -p android :app:assembleDebug
```

GitHub Actions builds Windows, Linux and Android packages on pushes to `main`. Push a tag such as `v0.1.0` to publish a GitHub Release containing the installers.

## What's working in 0.1

- Private LAN server and six-digit device pairing
- Paired-device online status
- Authenticated WebSocket sessions and device-to-device message relay foundation
- Responsive web dashboard and installable PWA
- Electron desktop app and Windows / Linux build definitions
- Android / Android TV companion APK
- Home Assistant connection and controls for supported lights, switches and media players

## Not included yet

This is a real first slice, not the finished ecosystem. It does not yet perform automatic operating-system clipboard sync, phone-as-mouse, unrestricted file transfer, AI, search, office apps, cloud sync, or direct drivers for every TV and appliance. Those need separate platform permissions, integrations and testing. Smart-home control currently relies on Home Assistant.

See [the smart-home walkthrough](SMART-HOME.md) and the root README for the roadmap.
