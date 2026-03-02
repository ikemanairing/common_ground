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
