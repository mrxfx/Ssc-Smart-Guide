---
name: SSC GD Smart Coach — Project Stack
description: Architecture decisions and key facts for the SSC GD exam prep platform.
---

# SSC GD Smart Coach — Stack & Decisions

## Architecture
- **Frontend**: React+Vite at artifact `ssc-gd`, preview path `/`, port from `PORT` env var
- **Backend**: Express 5 API server at artifact `api-server`, mounted at `/api`
- **DB**: PostgreSQL + Drizzle ORM (`@workspace/db`), schema in `lib/db/src/schema/`
- **Auth**: Firebase (frontend only) — user ID passed via `x-user-id` header to API
- **AI**: OpenAI `gpt-4o-mini` via `OPENAI_API_KEY` secret, route handlers in `artifacts/api-server/src/routes/ai.ts`
- **API contract**: OpenAPI spec at `lib/api-spec/openapi.yaml`, generated hooks in `@workspace/api-client-react`, Zod schemas in `@workspace/api-zod`

## Key Decisions
- Firebase auth is frontend-only; backend reads `x-user-id` header (no JWT verification — fine for MVP)
- Admin routes in `/admin/*` — no middleware guard on backend; frontend uses role check
- Seed data: run `pnpm --filter @workspace/scripts run seed` to populate DB
- All DB tables use `text` primary keys (UUIDs via `randomUUID()`) not `serial`
- `questions.optionsJson` stores options as JSON string (array of `{id, text}`)

**Why:** Firebase JWT verification on backend would require firebase-admin SDK setup. Header-based approach is simpler for MVP, revisit before production.
