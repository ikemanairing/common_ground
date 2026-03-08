# Common Ground Deploy Guide

## 1) Local Run
1. Start local static server:
   - `./run-mobile.sh 8080`
2. Open:
   - `http://127.0.0.1:8080/`
   - `http://127.0.0.1:8080/1.html`
3. Optional checks:
   - `./scripts/check-structure.sh`
   - `./scripts/verify-app.sh`
   - `./scripts/smoke-local.sh http://127.0.0.1:8080`
   - `cd app && npm run test:flow`

## 2) Planned Vercel + Supabase Deployment

### Vercel (frontend app, planned)
- Project root (planned): `app/`
- Install command (planned): `npm ci`
- Build command (planned): `npm run build`
- Output directory (planned): `dist`

### Supabase (backend, planned)
- Migrations path: `supabase/migrations/`
- Edge Functions path: `supabase/functions/`
- Runtime secrets should be configured in Supabase project settings.

## 3) Planned Environment Variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_FUNCTIONS_URL` | Vercel | Preferred base URL for browser-side Edge Function calls |
| `VITE_API_BASE_URL` | Vercel | Compatibility fallback for old API routing code paths |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server-only) | Elevated key for server-side jobs only |
| `SUPABASE_DB_URL` | CI or local migration job | Postgres connection string for migrations |
| `SUPABASE_ACCESS_TOKEN` | CI only | Supabase CLI auth for deploy pipelines |

### Frontend function URL rule
- Browser code should use `VITE_SUPABASE_FUNCTIONS_URL` first.
- `VITE_API_BASE_URL` is kept only as a fallback for compatibility while older code paths are being removed.
- Recommended value:
  - `VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1`
- See [`app/.env.example`](/home/ikemanairing/code/Projects/Common_Ground/app/.env.example) for the local example.

### Current app-to-function mapping
- Step1:
  - `session-presence`: 세션 인원 수 확인
  - `session-join`: 닉네임과 join token으로 세션 참여
- StepQ8 / Step6:
  - `step-save`: Q1~Q8 응답 저장
  - `compare-random`: 같은 세션의 비교 대상 응답 조회
- Shared client:
  - Browser-side function calls are centralized in [`app/src/lib/api/functionClient.ts`](/home/ikemanairing/code/Projects/Common_Ground/app/src/lib/api/functionClient.ts).
  - Step-specific clients are kept in each feature folder and should delegate actual HTTP calls to the shared function client.

## 4) Security Note
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
- Only `VITE_*` values should be accessible to browser code.
