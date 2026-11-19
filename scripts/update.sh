#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if docker info >/dev/null 2>&1; then D=(docker); else D=(sudo docker); fi
"${D[@]}" compose config --quiet
"${D[@]}" compose pull
"${D[@]}" compose build --pull
"${D[@]}" compose up -d --remove-orphans
"${D[@]}" image prune -f
"${D[@]}" compose ps
