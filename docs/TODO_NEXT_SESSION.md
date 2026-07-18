# AU Track — TODO for Next Session (Phase 4)

## Priority Order

### 🔴 High Priority — Must Do First

1. **Deploy to Vercel**
   - [ ] Connect GitHub repo to Vercel
   - [ ] Set environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY)
   - [ ] Run `supabase db push` to apply migrations
   - [ ] Verify auth callback URL in Supabase dashboard matches Vercel URL
   - [ ] Test OAuth flow on production URL

2. **Run Supabase Migrations**
   - [ ] Create all 16 tables per DATABASE_SCHEMA.md
   - [ ] Enable RLS on all tables
   - [ ] Apply all RLS policies per SUPABASE_RLS.md
   - [ ] Create `on_auth_user_created` trigger for profiles
   - [ ] Create `update_updated_at` trigger on relevant tables
   - [ ] Seed reference data (degrees, regulations, branches)
   - [ ] Seed sample subjects for R2017 and R2021 (CSE, IT, ECE, EEE, MECH, CIVIL, AIDS)

3. **Configure Supabase Auth**
   - [ ] Set site URL to production domain
   - [ ] Add redirect URLs for localhost and production
   - [ ] Enable Google OAuth provider
   - [ ] Configure email templates (signup, reset, magic link)

### 🟡 Medium Priority — Core Phase 4

4. **Notification Scraping Pipeline**
   - [ ] Set up Firecrawl or custom scraper for annauniv.edu
   - [ ] Create cron job (Supabase Edge Function or Vercel Cron) to poll sources
   - [ ] Parse scraped content into notification format
   - [ ] Auto-insert with is_verified = false
   - [ ] Add deduplication logic (title + published_date hash)
   - [ ] Create admin alert for new unverified notifications

5. **PWA Setup**
   - [ ] Generate `manifest.webmanifest` (already referenced in layout)
   - [ ] Create service worker for offline caching
   - [ ] Add install prompt component
   - [ ] Generate app icons (192px, 512px)
   - [ ] Configure web push notifications (VAPID keys)

6. **Security Hardening**
   - [ ] Add rate limiting to API routes (use Upstash Redis or Vercel KV)
   - [ ] Configure CSP headers in `next.config.js`
   - [ ] Implement audit log writes for admin verify actions
   - [ ] Add account deletion with cascade (delete user_grades, arrears, notes, etc.)
   - [ ] Data export endpoint (JSON download of all user data)

7. **Mute Preferences Sync**
   - [ ] Wire up `muted_categories` table to UI (replace localStorage-only approach)
   - [ ] Load muted categories on page mount from Supabase
   - [ ] Save mute toggles to Supabase in real-time
   - [ ] Sync across devices when user logs in

### 🟢 Lower Priority — Polish

8. **UX Improvements**
   - [ ] Add skeleton loaders for dashboard, notifications, semester pages
   - [ ] Implement light mode toggle in settings
   - [ ] Add onboarding skip option (with "complete later" prompt)
   - [ ] Improve OCR image preview with zoom/pan
   - [ ] Add notification pagination (infinite scroll or load more)
   - [ ] Add empty state illustrations (SVG)

9. **Analytics & Feedback**
   - [ ] Integrate Plausible or Umami (privacy-friendly analytics)
   - [ ] Add feedback widget (floating button → modal form)
   - [ ] Track key events: signup, onboarding_complete, ocr_upload, grade_save

10. **Testing Infrastructure**
    - [ ] Configure Jest + React Testing Library
    - [ ] Write unit tests for GPA/CGPA calculation
    - [ ] Write unit tests for OCR text extraction
    - [ ] Configure Playwright for E2E tests
    - [ ] Write E2E test for auth → onboarding → grade entry flow
    - [ ] Set up CI test pipeline on GitHub Actions

11. **Referral Program**
    - [ ] Add `referred_by` column to profiles
    - [ ] Track referral source via URL parameter on signup
    - [ ] Display "Track Together" badge on dashboard
    - [ ] Create referral link sharing component

12. **Performance**
    - [ ] Add React.memo to heavy components (NotificationCard, SubjectTable)
    - [ ] Optimize Supabase queries (select only needed columns)
    - [ ] Add dynamic imports for large components (Tesseract already done)
    - [ ] Configure Next.js image optimization for any static images

## Quick Start for Next Session

```bash
# 1. Install dependencies
cd au-track && npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase URL, anon key, and optionally Gemini API key

# 3. Run migrations
supabase db push

# 4. Seed reference data
# Run the seed SQL for degrees, regulations, branches

# 5. Start dev server
npm run dev

# 6. Type check
npm run type-check
```

## Files to Create Next Session

```
supabase/migrations/00001_initial_schema.sql    — All 16 tables
supabase/migrations/00002_rls_policies.sql      — All RLS policies
supabase/migrations/00003_triggers.sql           — Auth + updated_at triggers
supabase/migrations/00004_seed_data.sql          — Degrees, regulations, branches
supabase/migrations/00005_sample_subjects.sql    — Subject catalog
public/manifest.webmanifest                       — PWA manifest
public/icons/icon-192.png                        — PWA icon
public/icons/icon-512.png                        — PWA icon
next.config.js                                    — CSP headers, security config
```
