# Common Ground Runbook

## 1) Incident Checklist
1. Detect
   - Confirm user-facing symptoms (broken page, API failure, elevated errors).
2. Triage
   - Identify blast radius: which step/page and which environment.
   - Record start time and suspected trigger (deploy, config, external outage).
3. Mitigate
   - Roll back last deploy if needed.
   - Disable risky paths behind feature flags or temporary guards.
4. Recover
   - Verify key screens and smoke checks:
     - `./scripts/smoke-local.sh <base-url>`
5. Communicate
   - Share status, impact, and ETA in team channel.
6. Close + Follow-up
   - Capture root cause, fix summary, and prevention tasks.

## 2) Basic Severity Guide
- SEV-1: Core user flow unavailable for most users.
- SEV-2: Major feature degraded with workaround available.
- SEV-3: Minor issue, low user impact.

## 3) 7-Day Retention Note
- Keep incident artifacts for at least 7 days:
  - deploy logs
  - application/server logs
  - smoke-check outputs
  - timeline notes
- After 7 days, archive or delete based on team policy and compliance needs.

## 4) Verification Order
1. Run the shared verification script:
   - `./scripts/verify-app.sh`
2. If only frontend code changed and you need a faster loop:
   - `cd app && npm run typecheck`
   - `cd app && npm run test:flow`
   - `cd app && npm run test:validators`
   - `cd app && npm run build`
3. If the issue is route or state related, also re-check:
   - `./scripts/smoke-step1.sh`
   - `./scripts/smoke-step3-10.sh`

## 5) Failure Triage Guide
- `typecheck` fails:
  - Check recently touched step components, router guards, and shared client utilities first.
- `build` fails:
  - Check imports, deleted file references, and Vite-visible env usage.
- `smoke-step1.sh` fails:
  - Check Step1 entry, profile flow, and step1 helper files.
- `smoke-step3-10.sh` fails:
  - Check migrated screen files, `LegacyHtmlStep` references, and route wiring for later steps.

## 6) Manual Flow Scenarios
- Resume flow:
  - Start the flow, refresh, and confirm the app returns to the expected next route.
- Step7 finish branch:
  - Choose `바로 끝내기`, confirm the app jumps to mission, and confirm the back button returns to wrap-up instead of summary.
- Done summary:
  - Complete Step8, Step9, Step10 and confirm the Done screen shows nickname, emotion, summary, and mission.
- Full checklist:
  - Use [`docs/manual-flow-checklist.md`](/home/ikemanairing/code/Projects/Common_Ground/docs/manual-flow-checklist.md) to record the manual run.
