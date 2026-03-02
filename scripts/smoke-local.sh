#!/bin/sh
set -eu

BASE_URL=${1:-http://127.0.0.1:8080}
CURL_BIN=${CURL_BIN:-curl}

if ! command -v "$CURL_BIN" >/dev/null 2>&1; then
  printf "curl is required but not found.\n" >&2
  exit 1
fi

required_failures=0

check_required() {
  label=$1
  path=$2
  url="${BASE_URL}${path}"

  if "$CURL_BIN" -fsS -o /dev/null "$url"; then
    printf "[ok] %s -> %s\n" "$label" "$url"
  else
    printf "[fail] %s -> %s\n" "$label" "$url" >&2
    required_failures=$((required_failures + 1))
  fi
}

check_placeholder() {
  label=$1
  path=$2
  url="${BASE_URL}${path}"

  if "$CURL_BIN" -fsS -o /dev/null "$url"; then
    printf "[ok] %s -> %s\n" "$label" "$url"
  else
    printf "[placeholder] %s -> %s (not wired yet)\n" "$label" "$url"
  fi
}

printf "Running smoke flow against %s\n" "$BASE_URL"

check_required "root" "/"
check_required "step-1" "/1.html"
check_required "step-10" "/10.html"

check_placeholder "api-health" "/api/health"
check_placeholder "api-session" "/api/session"

if [ "$required_failures" -ne 0 ]; then
  printf "Smoke flow failed (%s required check(s)).\n" "$required_failures" >&2
  printf "Tip: start local server with ./run-mobile.sh 8080\n" >&2
  exit 1
fi

printf "Smoke flow passed for required checks.\n"
