# AppFlowy installation and integration

## Licence status

The latest official AppFlowy self-host deployment repository is `AppFlowy-IO/AppFlowy-SelfHost-Commercial`. Its repository states that it is distributed under the AppFlowy Self-Hosted Commercial License and advertises a free tier for one user seat. That is **not the same as an OSI open-source server distribution**.

The older `AppFlowy-IO/AppFlowy-Cloud` repository was archived in 2026. Its README directs self-hosters to the commercial self-host repository and warns that the archived server is no longer used to build current self-host images.

Because OneOS is intended to use upstream projects rather than silently repackage them, AppFlowy is not part of the default Compose stack. Run the optional installer only after reading the upstream terms:

```bash
./scripts/install-appflowy.sh
```

It clones the upstream repository into `vendor/AppFlowy-SelfHost-Commercial`, copies its `deploy.env` to `.env`, changes the upstream HTTP/TLS host ports to 8085/8445, and runs the upstream Compose file. It does not copy the upstream source into the OneOS repo.

## Open AppFlowy

Open:

```text
http://<PI-LAN-IP>:8085
```

The optional AppFlowy install is a substantial group of services. On a Pi 4 with 4 GB RAM, do not start it at the same time as every other service until you have checked memory use. An SSD is strongly recommended.

## Connect its API to Open WebUI

When the self-host server is running, AppFlowy exposes its OpenAPI document at:

```text
http://<PI-LAN-IP>:8085/api/docs/openapi.json
```

Use that URL as a separate OpenAPI tool server in Open WebUI. Follow the authentication shown by your own AppFlowy Swagger page and use credentials scoped to the workspace. The available API operations and access levels depend on the AppFlowy server version and licence.

For a strictly open-source-only stack, leave AppFlowy out until AppFlowy provides a maintained self-host server under an open-source licence that matches that requirement.
