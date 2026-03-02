#!/bin/sh

set -u

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

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

check_no_legacy_ref() {
  file="$1"
  if [ ! -f "$file" ]; then
    fail "File exists ($file)"
    return
  fi

  if grep -q 'LegacyHtmlStep' "$file"; then
    fail "No LegacyHtmlStep in $file"
  else
    pass "No LegacyHtmlStep in $file"
  fi
}

check_file_exists() {
  file="$1"
  if [ -f "$file" ]; then
    pass "File exists ($file)"
  else
    fail "File exists ($file)"
  fi
}

check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step3.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step4.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step5.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step6.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step7.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step8.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step9.tsx"
check_no_legacy_ref "$REPO_ROOT/app/src/features/flow/steps/Step10.tsx"

check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step3/Step3Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step4/Step4Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step5/Step5Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step6/Step6Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step7/Step7Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step8/Step8Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step9/Step9Screen.tsx"
check_file_exists "$REPO_ROOT/app/src/features/flow/steps/step10/Step10Screen.tsx"

TOTAL_COUNT=$((PASS_COUNT + FAIL_COUNT))
printf '\nSummary: %s PASS, %s FAIL, %s TOTAL\n' "$PASS_COUNT" "$FAIL_COUNT" "$TOTAL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
fi

exit 1
