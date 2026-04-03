---
## Task ID: 2 - Database & Utils Builder (CleanCheck SaaS)
### Work Task
Create the complete Prisma schema and lib utilities for the CleanCheck SaaS platform — a tool for cleaning companies to digitize, track, and audit interventions via QR codes, interactive checklists, and a quality scoring system.

### Work Summary

**1. Prisma Schema** (`/prisma/schema.prisma`) — Replaced OKAR schema with 9 CleanCheck models:
- Company (tenant with subscription tiers)
- User (multi-role: manager/agent/client)
- Client (end customers)
- Intervention (full lifecycle + QR fields)
- ChecklistTemplate (reusable definitions)
- ChecklistItem (tasks within interventions)
- Rating (1-5 client satisfaction)
- QualityScore (5 weighted sub-scores)
- Session (JWT auth)

**2. Database** — Successfully pushed to SQLite, Prisma Client generated.

**3. Lib Utilities:**
- `db.ts` — Prisma singleton
- `auth.ts` — bcryptjs, JWT (7d), PIN codes, in-memory rate limiting (5/min)
- `qr.ts` — JWT payloads (4h), QR image generation, validity checks
- `scoring.ts` — Weighted quality algorithm (Punctuality 25%, Completion 20%, Client Rating 35%, Regularity 10%, Reactivity 10%)

**4. Middleware** — Protects dashboard/API routes with Bearer token auth, role-based routing.

**5. `.env.example`** — Complete env template.

### Files Modified
1. `/prisma/schema.prisma`
2. `/src/lib/db.ts`
3. `/src/lib/auth.ts`
4. `/src/lib/qr.ts`
5. `/src/lib/scoring.ts` (new)
6. `/src/middleware.ts`
7. `.env.example`
