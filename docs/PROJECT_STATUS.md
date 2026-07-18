# AU Track — Project Status

## Current State: Phases 1–3 Complete ✅

As of the latest build, AU Track has completed Phases 1, 2, and 3 of the roadmap. The app is feature-complete for its MVP scope and ready for initial user testing.

## Phase Completion Summary

### Phase 1: Foundation ✅
- ✅ Next.js 14 App Router + TypeScript + Tailwind CSS project setup
- ✅ Supabase integration (auth, database, RLS)
- ✅ Custom UI component library (10 components)
- ✅ Email + Google OAuth authentication
- ✅ Onboarding wizard (4 steps: degree, regulation, branch, semester)
- ✅ Dashboard with CGPA display and stat cards
- ✅ Landing page with hero and feature highlights
- ✅ Privacy, terms, contact pages

### Phase 2: Core Features ✅
- ✅ Manual grade entry per semester
- ✅ GPA calculation (per semester) with Anna University 10-point system
- ✅ CGPA calculation (cumulative across all semesters)
- ✅ Arrear tracking (RA/U grade detection, clear flow, statistics)
- ✅ Target GPA planner (required GPA calculation, feasibility check)
- ✅ Personal study notes (create, edit, delete, pin)
- ✅ Settings page (profile edit, preferences, danger zone)
- ✅ Standalone GPA calculator tool

### Phase 3: Advanced Features ✅
- ✅ OCR grade upload with Tesseract.js (client-side, privacy-first)
- ✅ UploadZone component (drag & drop, file validation, preview)
- ✅ OCRProgress component (stage-based progress indicator)
- ✅ OCRResults component (editable results table with grade correction)
- ✅ OCRConfirm component (confirmation step with projected GPA)
- ✅ Server-side OCR API route (Gemini Vision, with client-side fallback)
- ✅ Notification center with 8 categories
- ✅ NotificationFilters component (category, degree, branch filters)
- ✅ NotificationCard component (read, save, mute actions)
- ✅ NotificationList component (with empty state)
- ✅ Notifications API route (verified-only, filtered)
- ✅ Mute all + mute per-category (localStorage persistence)
- ✅ Mark as read + save notifications (Supabase persistence)
- ✅ Admin data review page (role-protected)
- ✅ Subject verification (admin can verify user-submitted subjects)
- ✅ Notification verification (admin can verify scraped notifications)
- ✅ Non-affiliation disclaimers on all relevant pages

## File Count

| Category | Files | Status |
|----------|-------|--------|
| App pages | 18 | ✅ Complete |
| API routes | 5 | ✅ Complete |
| Components | 35+ | ✅ Complete |
| Lib/utils | 8 | ✅ Complete |
| Documentation | 19 | ✅ Complete |
| Static data | 4 | ✅ Complete |

## What's Working

- Full authentication flow (signup, login, OAuth, password reset)
- Onboarding wizard with validation
- Grade CRUD operations (manual entry + OCR)
- GPA/CGPA auto-calculation
- Arrear detection and clearing
- Target GPA planning
- Notification feed with filtering and mute
- Admin data review and verification
- Dark mode UI throughout
- Mobile-responsive design

## What's Not Yet Implemented (Phase 4)

- [ ] Automated notification scraping pipeline
- [ ] PWA (service worker, push notifications, offline mode)
- [ ] Light mode toggle
- [ ] Rate limiting on API routes
- [ ] CSP security headers
- [ ] Analytics integration
- [ ] Referral program
- [ ] Data export feature
- [ ] Account deletion cascade
- [ ] Email notification digests

## Known Issues

1. **Notification scraping is manual** — Notifications must be manually inserted into the database (or via admin). Automated scraping is Phase 4.
2. **Mute preferences are localStorage-only** — Cross-device sync via `muted_categories` table is implemented in schema but not yet wired up in the UI.
3. **No rate limiting** — API routes are protected by auth but have no rate limiting.
4. **No automated tests** — Test plan is documented but Jest/Playwright not yet configured.

## Tech Debt

- Some components could benefit from React.memo optimization
- Supabase queries could use select() optimization to reduce payload
- Image preview in OCR could support zoom/pan for large screenshots
- Notification pagination not implemented (loads up to 100 at once)

## Deployment Status

- **Staging:** Not yet deployed (local development only)
- **Production:** Not yet deployed
- **Database:** Supabase project configured, migrations ready
- **Next step:** Deploy to Vercel and run database migrations
