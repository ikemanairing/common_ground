#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
APP_DIR="$ROOT_DIR/app"

printf "[1/7] Typecheck\n"
(cd "$APP_DIR" && npm run typecheck)

printf "\n[2/7] Flow tests\n"
(cd "$APP_DIR" && npm run test:flow)

printf "\n[3/7] Validator tests\n"
(cd "$APP_DIR" && npm run test:validators)

printf "\n[4/7] Build\n"
(cd "$APP_DIR" && npm run build)

printf "\n[5/7] Structure\n"
"$ROOT_DIR/scripts/check-structure.sh"

printf "\n[6/7] Step1 smoke\n"
"$ROOT_DIR/scripts/smoke-step1.sh"

printf "\n[7/7] Step3-10 smoke\n"
"$ROOT_DIR/scripts/smoke-step3-10.sh"

printf "\nVerification passed.\n"
