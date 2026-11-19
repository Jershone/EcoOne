#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
stamp="$(date +%Y%m%d-%H%M%S)"
dump="backups/nextcloud-${stamp}.sql"
archive="backups/oneos-${stamp}.tar.gz"

echo "Creating a logical Nextcloud database backup..."
docker compose exec -T nextcloud-db sh -lc 'mariadb-dump --single-transaction -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' > "$dump"

echo "Stopping services briefly so file-based app data is consistent..."
docker compose stop
restart_stack() { docker compose start >/dev/null 2>&1 || true; }
trap restart_stack EXIT

tar -czf "$archive" .env data "$dump"
restart_stack
trap - EXIT
echo "Backup created: $archive"
echo "Copy it to another disk or another machine. This Pi is not the backup destination."
