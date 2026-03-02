#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5173}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}/app"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "App directory not found: ${APP_DIR}" >&2
  exit 1
fi

echo "Starting Common Ground React app on 0.0.0.0:${PORT}"
echo "Open on desktop:  http://localhost:${PORT}"
echo "Open on mobile:   http://<your-computer-ip>:${PORT}"

cd "${APP_DIR}"
npm run dev -- --host 0.0.0.0 --port "${PORT}"
