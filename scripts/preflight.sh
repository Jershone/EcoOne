#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
warn(){ printf 'WARNING: %s\n' "$*" >&2; }

[[ "$(uname -m)" == "aarch64" ]] || fail "Omnexa requires 64-bit ARM (aarch64). Install Raspberry Pi OS 64-bit."
[[ -r /etc/os-release ]] || fail "Cannot identify the operating system."
. /etc/os-release
[[ "${ID:-}" == "raspbian" || "${ID:-}" == "debian" ]] || warn "This is not Raspberry Pi OS/Debian; installation may need adjustments."
[[ "${VERSION_CODENAME:-}" != "" ]] || warn "OS release codename is unavailable."
mem_kb="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
mem_gb=$((mem_kb / 1024 / 1024))
(( mem_gb >= 3 )) || fail "At least 3 GiB RAM is required for the core stack; detected about ${mem_gb} GiB."
free_kb="$(df -Pk . | awk 'NR==2 {print $4}')"
free_gb=$((free_kb / 1024 / 1024))
(( free_gb >= 12 )) || fail "At least 12 GiB free disk space is required; detected about ${free_gb} GiB."
command -v curl >/dev/null 2>&1 || fail "curl is required."
command -v python3 >/dev/null 2>&1 || fail "python3 is required."
command -v git >/dev/null 2>&1 || fail "git is required."
printf 'Preflight passed: %s / %s / about %s GiB RAM / %s GiB free disk.\n' "${PRETTY_NAME:-Linux}" "$(uname -m)" "$mem_gb" "$free_gb"
if [[ "$free_gb" -lt 25 ]]; then warn "A USB SSD is strongly recommended; the 64 GB microSD will have limited headroom for app data and backups."; fi
