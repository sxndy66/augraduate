# AU Track — Site Structure

## Full Site Map

### Public Pages

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page — hero, features, CTA to sign up | No |
| `/login` | Email + Google login form | No |
| `/signup` | Email + Google registration form | No |
| `/forgot-password` | Password reset request form | No |
| `/auth/callback` | OAuth callback handler (server route) | No |
| `/privacy` | Privacy policy page | No |
| `/terms` | Terms of service page | No |
| `/contact` | Contact form and support links | No |
| `/features` | Feature showcase page | No |
| `/demo` | Interactive demo (no auth, sample data) | No |

### Authenticated Pages

| Route | Purpose | Auth | Onboarding |
|-------|---------|------|------------|
| `/onboarding` | 4-step onboarding wizard | Yes | — |
| `/dashboard` | Main dashboard — CGPA, stats, recent activity | Yes | Yes |
| `/semesters` | Semester list with GPA per semester | Yes | Yes |
| `/semesters/[semester]` | Individual semester grade management | Yes | Yes |
| `/calculator` | Standalone GPA/CGPA calculator | Yes | No |
| `/arrears` | Arrear tracking and management | Yes | Yes |
| `/ocr-upload` | OCR grade screenshot upload | Yes | Yes |
| `/notifications` | University notification center | Yes | No |
| `/target-planner` | Target CGPA planner | Yes | Yes |
| `/notes` | Personal study notes | Yes | Yes |
| `/settings` | Profile settings, preferences, danger zone | Yes | No |

### Admin Pages

| Route | Purpose | Auth | Role |
|-------|---------|------|------|
| `/admin/data-review` | Review and verify subjects + notifications | Yes | admin |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/calculate-gpa` | POST | Calculate GPA from grade entries |
| `/api/calculate-cgpa` | POST | Calculate CGPA from all semester grades |
| `/api/target-plan` | POST | Generate target GPA plan |
| `/api/ocr` | POST | Server-side OCR processing (Gemini Vision) |
| `/api/ocr` | GET | OCR API status and usage info |
| `/api/notifications` | GET | Fetch verified notifications with filters |
| `/auth/callback` | GET | OAuth callback handler |

### Navigation Structure

```
Navbar (authenticated)
├── Dashboard
├── Semesters → /semesters
├── OCR Upload → /ocr-upload
├── Notifications → /notifications
├── Calculator → /calculator
├── Arrears → /arrears
├── Target Planner → /target-planner
├── Notes → /notes
├── Settings → /settings
└── Logout

Footer (all pages)
├── Privacy Policy → /privacy
├── Terms of Service → /terms
├── Contact → /contact
├── Non-affiliation disclaimer
└── Created by Santhosh V
```

### Route Protection

- **ProtectedRoute** component wraps all authenticated pages
- Checks Supabase session → redirects to `/login` if absent
- If `requireOnboarding = true`, checks `profiles.onboarding_completed` → redirects to `/onboarding` if false
- Admin pages additionally check `profiles.role === 'admin'`

### URL Patterns

- Dynamic routes use `[param]` syntax (e.g., `/semesters/[semester]`)
- API routes are under `/app/api/` with `route.ts` files
- Auth callback at `/auth/callback/route.ts`
- All pages use Next.js App Router conventions (`page.tsx`, `layout.tsx`)
