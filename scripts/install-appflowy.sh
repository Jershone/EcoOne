#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "NOTICE: the current official AppFlowy self-host server repository is distributed under the AppFlowy Self-Hosted Commercial License."
echo "Read its licence before continuing: https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial"
echo "The upstream repository advertises a free tier limited to one user seat."
read -r -p "Have you read the terms and do you want to continue? Type YES: " answer
if [ "$answer" != "YES" ]; then
  echo "Cancelled. No AppFlowy files were downloaded."
  exit 0
fi

mkdir -p vendor
if [ ! -d vendor/AppFlowy-SelfHost-Commercial/.git ]; then
  git clone --depth 1 https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial.git vendor/AppFlowy-SelfHost-Commercial
fi
cd vendor/AppFlowy-SelfHost-Commercial
if [ ! -f .env ]; then cp deploy.env .env; fi
python3 - <<'PY'
from pathlib import Path
p = Path(".env")
lines = p.read_text().splitlines()
values = {"NGINX_PORT": "8085", "NGINX_TLS_PORT": "8445"}
seen = set()
out = []
for line in lines:
    key = line.split("=", 1)[0].strip() if "=" in line else ""
    if key in values:
        out.append(f"{key}={values[key]}")
        seen.add(key)
    else:
        out.append(line)
for key, value in values.items():
    if key not in seen:
        out.append(f"{key}={value}")
p.write_text("\n".join(out) + "\n")
PY
docker compose up -d
echo "AppFlowy is starting. Open http://<PI-LAN-IP>:8085"
echo "Its own API documentation is at http://<PI-LAN-IP>:8085/api/docs"
