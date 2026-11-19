#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if docker info >/dev/null 2>&1; then D=(docker); else D=(sudo docker); fi
"${D[@]}" compose ps
printf '\nEndpoint checks (from the Pi itself):\n'
check(){ local name="$1" url="$2"; local code; code="$(curl -k -sS -o /dev/null -w '%{http_code}' --max-time 8 "$url" || true)"; if [[ "$code" =~ ^(2|3)[0-9][0-9]$ ]]; then printf '  OK   %-18s HTTP %s\n' "$name" "$code"; else printf '  FAIL %-18s HTTP %s\n' "$name" "${code:-no response}"; fi; }
check Portal http://127.0.0.1/
check Authentik http://127.0.0.1:9000/-/health/ready/
check Open-WebUI http://127.0.0.1:3000/health
check Nextcloud http://127.0.0.1:8081/status.php
check Vaultwarden http://127.0.0.1:8082/alive
check Navet http://127.0.0.1:8083/
check Home-Assistant http://127.0.0.1:8123/
printf '\nResource summary:\n'
free -h
df -h .
printf '\nFor service logs: docker compose logs --tail=100 SERVICE\n'
