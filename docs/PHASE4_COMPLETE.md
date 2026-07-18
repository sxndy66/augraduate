# AU Track — Phase 4: UX Polish and Security Hardening

This document covers all features delivered in Phase 4 of AU Track.

---

## AI Study Plan

### Description
The AI Study Plan feature generates personalized weekly study schedules based on a student's weak subjects, exam timeline, and CGPA goals. It analyzes grade history and arrear data to identify areas needing focus, then produces a day-by-day plan with subject strategies and daily goals.

### How It Works
1. User navigates to `/study-plan`
2. System pulls the user's grades, arrears, and target CGPA from Supabase
3. Weak subjects are identified (GPA below target or arrears pending)
4. A study plan is generated with:
   - Weekly schedule broken down by day
   - Subject priority ranking
   - Daily study goals and time allocations
   - CGPA improvement projections
5. Plans are saved to Supabase and can be revisited

### API Routes
- `POST /api/study-plan` — Generate a new study plan
- `GET /api/study-plan` — Fetch saved study plans
- `DELETE /api/study-plan` — Delete a saved plan

---

## PWA & Offline

### Service Worker
AU Track is a Progressive Web App (PWA) with a registered service worker that enables:
- **App shell caching**: Core layout, CSS, and JS are cached on first visit
- **Runtime caching**: API responses are cached with a stale-while-revalidate strategy
- **Offline fallback**: A custom offline page is shown when navigation fails without connectivity

### Caching Strategy
| Resource | Strategy | Cache Duration |
|----------|----------|----------------|
| App shell (HTML, CSS, JS) | Cache-first | Until update |
| Static assets (images, fonts) | Cache-first | 30 days |
| API data (grades, notes) | Stale-while-revalidate | 24 hours |
| Supabase auth | Network-only | N/A |

### Install Prompt
- The landing page features an "Install as App" highlight in the features grid
- Users can add AU Track to their home screen on both Android and iOS
- A manifest.json in `/public/` defines app icons, theme color, and display mode
- The `register-sw.tsx` component handles service worker registration and update prompts

### Offline Capability
- Grades, CGPA, notes, and arrears are available offline via `lib/offline-storage.ts`
- The `useOnlineStatus` hook detects connectivity changes
- The `usePendingSync` hook queues mutations and syncs them when the connection is restored
- A visual indicator shows online/offline status in the navbar

---

## More Branches

AU Track supports the following branches with subject data:

| Branch Code | Branch Name |
|-------------|-------------|
| AIDS | Artificial Intelligence & Data Science |
| CSE | Computer Science & Engineering |
| IT | Information Technology |
| ECE | Electronics & Communication Engineering |
| EEE | Electrical & Electronics Engineering |
| MECH | Mechanical Engineering |
| CIVIL | Civil Engineering |
| MECATRONICS | Mechatronics Engineering |
| BME | Biomedical Engineering |
| AERO | Aeronautical Engineering |

Subject data is stored in `/data/` and includes semester-wise subject codes, names, and credits for each branch under R2021 and R2018 regulations.

---

## UX Polish

### Skeleton Loaders
- **Skeleton component** (`components/ui/Skeleton.tsx`): Supports `text`, `circular`, `rectangular`, and `card` variants with customizable width, height, and rounded corners. Shimmer animation via Tailwind's `animate-shimmer` keyframe.
- **SkeletonCard** (`components/ui/SkeletonCard.tsx`): Pre-built skeleton card with toggleable header, stats grid, chart placeholder, and list sections.
- **SkeletonText** and **SkeletonRow**: Composable helpers for multi-line text and multi-column row skeletons.
- **DashboardSkeleton** (`components/dashboard/DashboardSkeleton.tsx`): Full-page skeleton for the dashboard loading state, including CGPA hero, stats grid, semester progress, recent activity, and chart placeholders.

### Error Boundary
- **ErrorBoundary** (`components/ui/ErrorBoundary.tsx`): React class component that catches render errors, logs error details (message, stack, component stack, user agent, URL), generates a unique error ID, and displays a retry button. In development, shows a collapsible error details panel. Recovers cleanly on retry.

### Light Mode
- **LightDarkToggle** (`components/ui/LightDarkToggle.tsx`): Animated sun/moon toggle button using the ThemeProvider context. Features Framer Motion icon transitions, aria-label for accessibility, keyboard support (Enter/Space), and saves preference to localStorage.
- The ThemeProvider has been updated to support both `dark` and `light` themes with class-based toggling on `document.documentElement`.
- All new components use `dark:` Tailwind variants for color-dependent styles.

### Feedback Widget
- **FeedbackWidget** (`components/layout/FeedbackWidget.tsx`): Floating button (bottom-right) that opens a modal with 1-5 star rating, category dropdown, and message textarea. Submits to Supabase `feedback` table with fallback to API. Rate-limited (3/hour). Dismissable via localStorage. Animated with Framer Motion.

---

## Security

### Rate Limiting
- **useRateLimit hook** (`lib/hooks/useRateLimit.ts`): Client-side rate limiting for forms and uploads. Tracks action count per time window, returns `{ canAct, remainingActions, timeUntilReset, resetAt }`. Persists to localStorage across page reloads.
- **Server-side rate limiting** (`lib/security.ts`): `rateLimitCheck(key, maxAttempts, windowMs)` function using in-memory tracking. Applied to:
  - `/api/export-data`: 1 request per minute per user
  - `/api/delete-account`: 3 attempts per 10 minutes per user

### CSP Headers
The middleware (`middleware.ts`) adds the following security headers to all responses:
- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — Disables unnecessary browser features
- `Content-Security-Policy` — Restricts script/style/font/img/connect sources to self, Supabase, and Google Fonts
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — Forces HTTPS in production

### Input Sanitization
- `sanitizeInput(text, maxLength)`: Strips HTML tags, removes XSS vectors (javascript:, on* handlers, data:text/html), removes control characters, and limits length.

### File Validation
- `validateFileType(file, allowedTypes)`: Checks MIME type and extension, detects double-ended extensions (e.g., `file.php.jpg`).
- `validateFileSize(file, maxMB)`: Validates file size against a maximum in MB.

### CSRF & Hashing
- `generateCSRFToken()`: Generates a 32-byte cryptographically random hex token using Web Crypto API.
- `hashString(str)`: djb2-based hash for deduplication (not for security).

### Data Export (GDPR Compliance)
- **`/api/export-data`** (GET): Exports all user data (profile, grades, arrears, notes, target plans, notification preferences, screenshot uploads) as a downloadable JSON file. Requires authentication. Rate-limited to 1 request per minute.

### Account Deletion
- **`/api/delete-account`** (DELETE): Permanently deletes all user data and auth account. Requires authentication + password confirmation. Cascades through: `user_grades`, `arrears`, `notes`, `target_plans`, `screenshot_uploads`, `notification_preferences`, `profiles`. Uses Supabase service role key to delete from `auth.users`. Rate-limited to 3 attempts per 10 minutes.

### Health Check
- **`/api/health`** (GET): Returns `{ status, timestamp, version, services }`. Checks Supabase connection. Returns 503 if unhealthy.

---

## Updated Roadmap Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Foundation (auth, UI library, onboarding, dashboard) |
| Phase 2 | ✅ Complete | Core Features (grades, CGPA, arrears, target planner, notes) |
| Phase 3 | ✅ Complete | Advanced Features (OCR, notifications, admin, PWA base) |
| Phase 4 | ✅ Complete | UX Polish & Security Hardening |

### Phase 4 Deliverables
- [x] Skeleton loading components (Skeleton, SkeletonCard, DashboardSkeleton)
- [x] Error boundary with error logging and retry
- [x] Light/dark mode toggle with animated icons
- [x] Debounce, localStorage, and rate limit hooks
- [x] Security utilities (sanitization, file validation, CSRF, hashing, rate limiting)
- [x] Health check API route
- [x] Data export API route (GDPR compliance)
- [x] Account deletion API route with password confirmation
- [x] Security headers in middleware (CSP, X-Frame-Options, etc.)
- [x] Feedback widget with rating and categories
- [x] Settings page: appearance toggle, API-based export/delete
- [x] Landing page: PWA install and offline capability highlights
- [x] Phase 4 documentation and changelog

### Technical Details (Phase 4 Additions)
- **New hooks:** useDebounce, useLocalStorage, useRateLimit
- **New UI components:** Skeleton, SkeletonCard, ErrorBoundary, LightDarkToggle
- **New layout components:** FeedbackWidget
- **New dashboard components:** DashboardSkeleton
- **New API routes:** /api/health, /api/export-data, /api/delete-account
- **New lib modules:** lib/security.ts
- **Updated files:** middleware.ts, app/settings/page.tsx, app/page.tsx
