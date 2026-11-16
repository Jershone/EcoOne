# EcoOne smart-home setup

EcoOne does not claim that every brand speaks one universal protocol. In this release, **Home Assistant is the bridge**: it integrates supported brands, then EcoOne displays selected entities from that Home Assistant instance.

## 1. Add devices to Home Assistant

1. Run Home Assistant on a device that stays connected to your home network.
2. In Home Assistant, open **Settings → Devices & services → Add integration**.
3. Search for the brand or protocol of your light, switch, TV or appliance.
4. Follow that integration's pairing instructions.
5. Confirm that Home Assistant can see and control the device first.

Compatibility depends on the exact model, firmware, region and Home Assistant integration. Some cloud integrations require internet; local integrations may work entirely on the LAN.

## 2. Create a Home Assistant access token

1. Open your Home Assistant user profile.
2. Find **Long-Lived Access Tokens**.
3. Create a token named `EcoOne`.
4. Copy it immediately. Treat it like a password; do not share it in messages, screenshots or public repositories.

## 3. Connect EcoOne

1. On the computer running EcoOne, open **http://localhost:43821**.
2. Pair the host browser using the code in its terminal if it is not already paired.
3. Under **Your smart home**, enter your Home Assistant URL, for example `http://homeassistant.local:8123`.
4. Paste the token and choose **Connect Home Assistant**.
5. EcoOne verifies the token before saving it.

The token is stored in the host's local `data/config.json` file (or the desktop app's per-user application data directory). Protect the host account and do not share that file. Paired phone and TV clients do not receive the token.

## 4. Supported controls in EcoOne 0.1

- `light`: turn on / turn off
- `switch`: turn on / turn off
- `media_player`: play / pause

The server API has a limited action allow-list. Other Home Assistant domains are not exposed in this first interface.

## 5. TV guidance

- **Android TV / Google TV:** install the EcoOne APK and enter the host computer's LAN address.
- **Other TV systems:** use the built-in browser if it supports modern web features, or use a compatible Home Assistant app/integration. The Android APK is not an Apple TV, webOS or Tizen native app.
- **Device not listed:** check whether Home Assistant itself can see and control it first.

## Security notes

- Keep EcoOne and Home Assistant on a trusted private home network.
- Do not port-forward EcoOne's port `43821` to the public internet.
- Do not use the pairing code on a network you do not trust.
- EcoOne 0.1 uses plain HTTP on the LAN. Do not use it over public Wi-Fi; HTTPS and hardened remote access are future work.
