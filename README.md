# EcoOne

**One ecosystem. Every device.**

EcoOne is an open ecosystem project exploring a unified experience across Windows, Android, computers, phones and compatible smart-home devices.

## Current status

This repository currently contains the public concept and landing website. Native companion apps, device discovery, secure pairing, cross-device clipboard, file handoff, remote input, AI provider integrations and smart-home adapters are planned work, not features already delivered.

## Product areas

- **One Connect** — phone/computer pairing, shared clipboard, file handoff and phone-as-touchpad.
- **One AI** — a provider-agnostic assistant with optional API integrations.
- **One Home** — integrations for compatible smart-home platforms and appliances.
- **One Search** — web and personal search experience.
- **One Office** — interoperable documents, spreadsheets and presentations.
- **One Cloud** — user-controlled file sync and preferences.

## Website

Lightweight static HTML/CSS/JS. No build step or package installation is required. Open index.html locally, or publish with GitHub Pages.

## Enable GitHub Pages

Open **Settings → Pages**. Under **Build and deployment**, select **GitHub Actions**. The included workflow deploys the static site whenever changes are pushed to main.

The expected site address is https://jershone.github.io/EcoOne/ once Pages is enabled and the workflow succeeds.

## Development principles

1. Reuse mature open-source projects instead of rebuilding everything.
2. Respect upstream licenses, attribution and contribution rules.
3. Keep device communication secure and explicit; pairing must be authorized by the device owner.
4. Prefer local networking and user-controlled data storage where practical.
5. Never claim an integration works until it has been implemented and tested on real hardware.

## Roadmap

- [x] Project identity and responsive concept website
- [x] Public product areas and project direction
- [ ] Architecture and technology decisions
- [ ] Windows companion prototype
- [ ] Android companion prototype
- [ ] Secure device pairing and discovery
- [ ] Clipboard and file transfer
- [ ] Remote touchpad / keyboard mode
- [ ] AI provider adapter layer
- [ ] Smart-home integration layer

## License

Original website and project material are offered under the MIT License. Third-party dependencies and integrations retain their own licenses and terms.
