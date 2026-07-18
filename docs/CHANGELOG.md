# AU Track — Changelog

All notable changes to AU Track are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-06-30

### Added — Phase 4: UX Polish and Security Hardening

- Skeleton loading component (`components/ui/Skeleton.tsx`)
  - Variants: text, circular, rectangular, card
  - Customizable width, height, rounded
  - Shimmer animation via Tailwind keyframe
  - Composable helpers: SkeletonText, SkeletonRow
- SkeletonCard component (`components/ui/SkeletonCard.tsx`)
  - Pre-built skeleton card for dashboard loading states
  - Toggleable header, stats grid, chart placeholder, list sections
- DashboardSkeleton component (`components/dashboard/DashboardSkeleton.tsx`)
  - Full dashboard skeleton loading state with CGPA hero, stats grid, progress, activity
- ErrorBoundary component (`components/ui/ErrorBoundary.tsx`)
  - React error boundary class component
  - Catches render errors with error ID generation
  - Error details panel in development
  - Retry button with clean recovery
  - Error logging (message, stack, component stack, user agent, URL)
- LightDarkToggle component (`components/ui/LightDarkToggle.tsx`)
  - Animated sun/moon icon transition via Framer Motion
  - Uses ThemeProvider context
  - aria-label and keyboard support (Enter/Space)
  - Saves preference to localStorage
- FeedbackWidget component (`components/layout/FeedbackWidget.tsx`)
  - Floating feedback button (bottom-right, fixed position)
  - Modal with 1-5 star rating, category dropdown, message textarea
  - Submit to Supabase feedback table with API fallback
  - Rate limited (3 submissions per hour)
  - Dismissable with localStorage
  - Animated with Framer Motion
- useDebounce hook (`lib/hooks/useDebounce.ts`)
  - Debounce value (300ms default)
  - useDebouncedCallback for debouncing functions
- useLocalStorage hook (`lib/hooks/useLocalStorage.ts`)
  - Persistent localStorage with SSR safety
  - JSON serialization, error handling, remove function
- useRateLimit hook (`lib/hooks/useRateLimit.ts`)
  - Client-side rate limiting for forms and uploads
  - Tracks action count per time window
  - Returns canAct, remainingActions, timeUntilReset, resetAt
  - Persists to localStorage across reloads
- Security utilities (`lib/security.ts`)
  - sanitizeInput: strips HTML, prevents XSS, limits length
  - validateFileType: checks MIME type and extension, detects double extensions
  - validateFileSize: validates file size against max MB
  - generateCSRFToken: cryptographically random token via Web Crypto API
  - hashString: djb2 hash for deduplication
  - rateLimitCheck: server-side in-memory rate limiting
  - CSP_HEADER constant for Content Security Policy
- Health check API route (`/api/health`)
  - GET returns status, timestamp, version, services
  - Checks Supabase connection
  - Returns 503 if unhealthy
- Data export API route (`/api/export-data`)
  - GET exports all user data as downloadable JSON (GDPR compliance)
  - Exports: profile, grades, arrears, notes, target plans, notification preferences, screenshot uploads
  - Requires authentication
  - Rate limited (1 request per minute per user)
- Account deletion API route (`/api/delete-account`)
  - DELETE permanently deletes all user data and auth account
  - Requires authentication + password confirmation
  - Cascades: user_grades, arrears, notes, target_plans, screenshot_uploads, notification_preferences, profiles
  - Deletes from auth.users via Supabase service role key
  - Rate limited (3 attempts per 10 minutes)
- Security headers in middleware (`middleware.ts`)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Content-Security-Policy (allows Supabase, Google Fonts, inline styles for Tailwind)
  - Strict-Transport-Security with includeSubDomains
- Settings page updates (`app/settings/page.tsx`)
  - Appearance section with light/dark mode toggle
  - Export data button now calls /api/export-data (server-side export)
  - Delete account section with password confirmation dialog calling /api/delete-account
- Landing page updates (`app/page.tsx`)
  - "Install as App" feature highlighting PWA install prompt
  - "Works Offline" feature highlighting offline capability
  - "Export Your Data" trust item for GDPR compliance
- Documentation
  - `docs/PHASE4_COMPLETE.md` — Full Phase 4 feature documentation
  - Updated `docs/CHANGELOG.md` with Phase 4 entries

### Changed

- Middleware now applies security headers to all responses including API routes and redirects
- Settings page export-data handler now uses server-side API route instead of client-side Supabase queries
- Settings page delete-account handler now uses server-side API route with password verification
- Landing page features grid expanded from 7 to 9 items

### Security

- Content Security Policy header prevents XSS and data injection attacks
- X-Frame-Options DENY prevents clickjacking
- Server-side rate limiting on export and delete endpoints
- Client-side rate limiting on feedback submissions
- Input sanitization strips HTML and XSS vectors
- File validation checks MIME type, extension, and double-ended extensions
- Password confirmation required for account deletion
- CSRF token generation utility available for form protection

### Removed

- Client-side data export logic (replaced by server-side API route)
- Client-side account deletion logic (replaced by server-side API route with password verification)


## [1.0.0] — 2026-06-30

### Added — Phase 1: Foundation

- Next.js 14 App Router project with TypeScript and Tailwind CSS
- Supabase integration: authentication (email + Google OAuth), database, RLS
- Custom UI component library:
  - Button (5 variants, 3 sizes, loading state, Framer Motion animations)
  - Card (glass-morphism, gradient border option, hover effects)
  - Input (label, error, hint, left/right icons, validation)
  - Select (label, error, hint, custom dropdown arrow)
  - Badge (6 colors, icon support)
  - Spinner (4 sizes, optional label)
  - ProgressBar (4 colors, 3 sizes, animated fill)
  - EmptyState (icon, title, description, action button)
  - ErrorState (icon, title, message, retry button)
  - Toast (4 types: success, error, info, warning; auto-dismiss; context provider)
  - StatCard (label, value, icon, trend indicator)
- Theme provider (dark mode class-based, default dark)
- Supabase provider (session context, auth state listener)
- React Query provider (data fetching cache)
- Root layout with ambient gradient background
- Landing page with hero section and feature highlights
- Email/password authentication (signup, login, forgot password)
- Google OAuth authentication
- Auth callback route handler
- ProtectedRoute component (session check, onboarding check)
- Onboarding wizard (4 steps: degree, regulation, branch, semester)
- Dashboard with CGPA display, stat grid, semester progress, recent activity
- Navbar and Footer components
- LoadingScreen component
- Privacy policy page
- Terms of service page
- Contact page
- Features showcase page
- Demo page (no auth required, sample data)

### Added — Phase 2: Core Features

- Semester list page with GPA per semester
- Individual semester page with grade management
- SubjectTable component (add, edit, delete grades)
- SemesterTabs component (switch between semesters)
- GPAPreview component (live GPA calculation)
- GPA calculation (Anna University 10-point grading system)
- CGPA calculation (cumulative across all semesters)
- GPA validator (grade points, valid grades, GPA formula)
- CGPA validator (cumulative formula, edge cases)
- Arrear tracking page with statistics
- ArrearForm component (add arrears manually)
- ArrearList component (view, clear arrears)
- ArrearStats component (count, credits, CGPA impact)
- Target GPA planner page
- PlannerForm component (target CGPA, remaining semesters)
- PlannerResults component (required GPA, feasibility)
- SemesterPlan component (per-semester breakdown)
- Target plan API route
- Personal notes page
- NoteForm component (create notes with title, content, subject tag)
- NoteList component (view, edit, delete, pin notes)
- NoteCard component (individual note display)
- Settings page (profile edit, preferences, danger zone)
- Standalone GPA calculator page
- Calculate GPA API route
- Calculate CGPA API route
- Target plan API route
- Degree, Regulation, Branch, Semester selector form components

### Added — Phase 3: Advanced Features

- OCR grade upload page (`/ocr-upload`)
  - Multi-step workflow: upload → processing → results → confirm
  - Semester selector
  - Privacy notice (client-side processing, dismissible)
  - Manual entry fallback link
  - Delete screenshot option
- UploadZone component
  - Drag & drop file upload
  - Click to browse
  - File validation (PNG, JPG, JPEG, WEBP only; max 5 MB)
  - Image preview with remove button
  - Error messages for invalid files
  - Keyboard accessible (Enter/Space to browse)
- OCRProgress component
  - Stage-based progress (loading, recognizing, extracting, done, error)
  - Animated progress bar
  - Status icons and messages
- OCRResults component
  - Editable results table (subject code, name, credits, grade)
  - Inline editing with validation
  - Grade dropdown (O/A+/A/B+/B/C/U/RA)
  - Delete individual entries
  - Add new rows manually
  - Status badges (Verified, Needs Review)
- OCRConfirm component
  - Summary card (total subjects, credits, projected GPA)
  - Invalid entry warnings
  - Save to user_grades with upsert
  - Loading state during save
- OCR API route (`/api/ocr`)
  - POST: Server-side OCR via Google Gemini Vision (optional)
  - File validation (type, size, auth check)
  - Returns client-side OCR suggestion if Gemini not configured
  - GET: API status and usage info
- OCR text extraction validator (`lib/validators/ocr.ts`)
  - Regex-based grade extraction from raw OCR text
  - Subject code, credits, grade parsing
  - Confidence scoring
  - Result validation and normalization
- Notifications center page (`/notifications`)
  - Notification feed with title, body, category badge, source link, dates
  - Filter by category (8 categories: exam timetable, results, revaluation, hall ticket, practical exam, internal assessment, academic calendar, circulars)
  - Filter by degree and branch
  - Mute all toggle
  - Mute specific category
  - Mark as read (individual + mark all)
  - Save/bookmark notifications
  - Source URL and fetched date display
  - Empty state when no notifications
  - Non-affiliation disclaimer banner
  - Mute preferences persisted to localStorage
- NotificationFilters component
  - Category, degree, branch dropdowns
  - Mute toggle badges per category
  - Mute all button
  - Active filter clear button
  - Result count display
- NotificationCard component
  - Category badge with color coding
  - Unread indicator (blue dot)
  - Title, body (truncated), source link
  - Published and fetched dates
  - Mark read, save, mute actions
  - Muted state visual indicator
- NotificationList component
  - Animated list with AnimatePresence
  - Mark all read button
  - Empty state with helpful message
- Notifications API route (`/api/notifications`)
  - GET: Fetch verified notifications with optional filters
  - Category, degree, branch filtering
  - Pagination (limit, offset)
  - User read/saved state included
  - Auth required
- Admin data review page (`/admin/data-review`)
  - Admin role check (redirects non-admins)
  - Subject review table (verified/unverified)
  - Notification review table (verified/unverified)
  - Verify buttons with loading states
  - Unverified count statistics
  - Tab switching (subjects / notifications)
  - Refresh button
- Documentation (19 files in `docs/`)
  - PROJECT_AI_MASTER.md — Master document
  - PROJECT_PRD.md — Product requirements document
  - SITE_STRUCTURE.md — Full site map
  - DATABASE_SCHEMA.md — All 16 tables documented
  - SUPABASE_RLS.md — RLS policy documentation
  - GPA_RULES.md — Grading system and formulas
  - OCR_FLOW.md — OCR flow and privacy
  - NOTIFICATION_SYSTEM.md — Notification architecture
  - SECURITY_RULES.md — Security best practices
  - BRAND_GUIDE.md — Brand identity guide
  - MARKETING_PLAN.md — Marketing strategy
  - LEGAL_NOTES.md — Legal disclaimers and privacy
  - ROADMAP.md — 4-phase product roadmap
  - TEST_PLAN.md — Acceptance criteria per feature
  - PROJECT_STATUS.md — Current status (Phases 1–3 complete)
  - TODO_NEXT_SESSION.md — Phase 4 task list
  - FINAL_HANDOFF_PROMPT.md — AI continuation prompt
  - CHANGELOG.md — This file
  - README.md — Project README

### Technical Details

- **Framework:** Next.js 14.2.20
- **Language:** TypeScript 5.7.2 (strict mode)
- **Styling:** Tailwind CSS 3.4.16 with custom design tokens
- **Database:** Supabase (PostgreSQL with RLS)
- **OCR:** Tesseract.js 5.1.1 (client-side), Google Gemini Vision (server-side optional)
- **Animations:** Framer Motion 11.15.0
- **Forms:** React Hook Form 7.54.0 + Zod 3.24.1
- **Icons:** Lucide React 0.468.0
- **Data fetching:** TanStack React Query 5.62.0

### Known Limitations

- Notification scraping is manual (automated pipeline is Phase 4)
- Mute preferences are localStorage-only (Supabase sync is Phase 4)
- No automated tests configured (future enhancement)
- Notification scraping is still manual (future enhancement)
