# Common Ground Deploy Guide

## 1) Local Run
1. Start local static server:
   - `./run-mobile.sh 8080`
2. Open:
   - `http://127.0.0.1:8080/`
   - `http://127.0.0.1:8080/1.html`
3. Optional checks:
   - `./scripts/check-structure.sh`
   - `./scripts/smoke-local.sh http://127.0.0.1:8080`

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
| `VITE_SUPABASE_URL` | Vercel | Supabase project URL for browser client |
| `VITE_SUPABASE_ANON_KEY` | Vercel | Public anon key for browser client |
| `VITE_API_BASE_URL` | Vercel | Optional base URL for API routing |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server-only) | Elevated key for server-side jobs only |
| `SUPABASE_DB_URL` | CI or local migration job | Postgres connection string for migrations |
| `SUPABASE_ACCESS_TOKEN` | CI only | Supabase CLI auth for deploy pipelines |

## 4) Security Note
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
- Only `VITE_*` values should be accessible to browser code.
