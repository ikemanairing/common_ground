#!/bin/sh

set -u

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

STEP1_FILE="$REPO_ROOT/app/src/features/flow/steps/Step1.tsx"
SEARCH_ROOT="$REPO_ROOT/app/src"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  printf 'PASS: %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf 'FAIL: %s\n' "$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

if [ ! -f "$STEP1_FILE" ]; then
  fail "Step1.tsx exists ($STEP1_FILE)"
elif grep -q 'LegacyHtmlStep' "$STEP1_FILE"; then
  fail "Step1.tsx does not reference LegacyHtmlStep"
else
  pass "Step1.tsx does not reference LegacyHtmlStep"
fi

STEP1_SCREEN_FILE=$(
  find "$SEARCH_ROOT" -type f \( \
    -name 'Step1Screen.tsx' -o \
    -name 'Step1Screen.ts' -o \
    -name 'Step1Screen.jsx' -o \
    -name 'Step1Screen.js' \
  \) 2>/dev/null | head -n 1
)

if [ -n "$STEP1_SCREEN_FILE" ]; then
  pass "Step1Screen file exists ($STEP1_SCREEN_FILE)"
else
  fail "Step1Screen file exists"
fi

STEP1_PROFILE_HOOK_FILE=$(
  find "$SEARCH_ROOT" -type f \( \
    -name 'useStep1Profile.ts' -o \
    -name 'useStep1Profile.tsx' -o \
    -name 'useStep1Profile.js' -o \
    -name 'useStep1Profile.jsx' \
  \) 2>/dev/null | head -n 1
)

if [ -n "$STEP1_PROFILE_HOOK_FILE" ]; then
  pass "useStep1Profile hook exists ($STEP1_PROFILE_HOOK_FILE)"
else
  fail "useStep1Profile hook exists"
fi

TOTAL_COUNT=$((PASS_COUNT + FAIL_COUNT))
printf '\nSummary: %s PASS, %s FAIL, %s TOTAL\n' "$PASS_COUNT" "$FAIL_COUNT" "$TOTAL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
fi

exit 1
