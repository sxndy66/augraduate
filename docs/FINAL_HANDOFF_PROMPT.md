# AU Track — Final Handoff Prompt for AI Continuation

## Copy this prompt to continue building AU Track in a new AI session:

---

I am building **AU Track**, a Next.js 14 App Router + TypeScript + Tailwind CSS + Supabase app for Anna University students. The project is at `/home/user/au-track/`.

**Current state:** Phases 1–3 are complete. The app has authentication, onboarding, manual grade entry, OCR grade upload (Tesseract.js), GPA/CGPA calculation, arrear tracking, target GPA planner, notifications center, admin data review, and personal notes.

**Tech stack:**
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS with custom colors: navy, electric-blue, royal-indigo, success-green, amber, error-red
- Dark mode class-based (default: dark)
- Supabase for database, auth, and RLS
- Framer Motion for animations
- Tesseract.js for client-side OCR
- Zod for validation
- React Hook Form for forms

**Existing structure:**
- `app/` — All pages and API routes (App Router)
- `components/ui/` — Button, Card, Input, Select, Badge, Spinner, ProgressBar, EmptyState, ErrorState, Toast, StatCard
- `components/ocr/` — UploadZone, OCRProgress, OCRResults, OCRConfirm
- `components/notifications/` — NotificationList, NotificationCard, NotificationFilters
- `lib/supabase/` — client.ts, server.ts, middleware.ts
- `lib/validators/` — gpa.ts, cgpa.ts, ocr.ts, notifications.ts, target-plan.ts
- `lib/utils.ts` — cn, formatDate, formatGPA, getInitials
- `data/anna-university/` — degrees.json, branches.json, regulations.json, subjects/
- `docs/` — 19 documentation files (PRD, schema, RLS, brand guide, etc.)

**Import paths use `@/` alias.**

**Next task (Phase 4):** I need you to:

1. Create Supabase migration SQL files for all 16 tables (see `docs/DATABASE_SCHEMA.md` for full schema)
2. Create RLS policy SQL (see `docs/SUPABASE_RLS.md`)
3. Create triggers (on_auth_user_created, update_updated_at)
4. Create seed data SQL for degrees, regulations, branches, and sample subjects
5. Set up PWA manifest and service worker
6. Add rate limiting to API routes
7. Configure CSP headers in next.config.js
8. Wire up muted_categories table to replace localStorage-only mute preferences
9. Add skeleton loaders for async pages
10. Set up Jest + React Testing Library with initial tests for GPA calculation and OCR extraction

Please read the documentation files in `docs/` for full context before starting. Start with the database migrations since everything else depends on them.

---

## Context Files to Reference

| File | Purpose |
|------|---------|
| `docs/PROJECT_AI_MASTER.md` | Full project overview and architecture |
| `docs/DATABASE_SCHEMA.md` | All 16 tables with columns, types, constraints |
| `docs/SUPABASE_RLS.md` | RLS policies for every table |
| `docs/TODO_NEXT_SESSION.md` | Detailed Phase 4 task list |
| `docs/ROADMAP.md` | Full product roadmap |
| `docs/GPA_RULES.md` | Grading system and calculation formulas |
| `docs/OCR_FLOW.md` | OCR architecture and privacy model |
| `tailwind.config.ts` | Custom color tokens and theme config |
| `package.json` | Dependencies and scripts |

## Key Decisions Already Made

1. **Client-side OCR is primary** — Tesseract.js, images never leave browser
2. **Dark mode is default** — `<html className="dark">` in root layout
3. **Custom UI components** — No shadcn/ui or external component library
4. **Supabase for everything** — Auth, database, RLS (no custom backend)
5. **Non-affiliated with Anna University** — Disclaimers on all relevant pages
6. **Free forever** — No paywall for core features
7. **Privacy-first** — Minimal data collection, no tracking cookies
