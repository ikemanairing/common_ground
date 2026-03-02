#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

REQUIRED_ITEMS="
plan.md
run-mobile.sh
app/src/__tests__/stepValidators.spec.ts
docs/deploy.md
docs/runbook.md
scripts/check-structure.sh
scripts/smoke-local.sh
"

PLANNED_ITEMS="
app
app/src
supabase
supabase/migrations
supabase/functions
"

missing=0

printf "Checking required structure...\n"
for item in $REQUIRED_ITEMS; do
  if [ -e "$ROOT_DIR/$item" ]; then
    printf "[ok] %s\n" "$item"
  else
    printf "[missing] %s\n" "$item"
    missing=1
  fi
done

printf "\nChecking planned structure (warn-only)...\n"
for item in $PLANNED_ITEMS; do
  if [ -e "$ROOT_DIR/$item" ]; then
    printf "[ok] %s\n" "$item"
  else
    printf "[warn] %s (planned)\n" "$item"
  fi
done

printf "\nChecking script permissions...\n"
for script in scripts/check-structure.sh scripts/smoke-local.sh; do
  if [ -x "$ROOT_DIR/$script" ]; then
    printf "[ok] executable: %s\n" "$script"
  else
    printf "[missing-x] %s\n" "$script"
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  printf "\nStructure check failed.\n" >&2
  exit 1
fi

printf "\nStructure check passed.\n"
