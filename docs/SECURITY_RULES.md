# AU Track — Security Rules & Best Practices

## Authentication

### Supabase Auth
- Email/password and Google OAuth authentication via Supabase
- Session tokens stored in HTTP-only cookies (SSR-compatible)
- Session refresh handled by middleware (`lib/supabase/middleware.ts`)
- No JWT manipulation on the client — Supabase SDK handles token lifecycle

### Route Protection
- **ProtectedRoute** component wraps all authenticated pages
- Checks session existence → redirects to `/login` if absent
- Checks `onboarding_completed` → redirects to `/onboarding` if incomplete
- Admin pages check `profiles.role === 'admin'` → shows "Access Denied" if not admin

## Row Level Security (RLS)

- **All 16 tables have RLS enabled** — no table is accessible without a policy
- Users can only SELECT, INSERT, UPDATE, DELETE their own data (`auth.uid() = user_id`)
- Public reference data (degrees, regulations, branches) is SELECT-only for non-admins
- Admin-only tables (audit_log) require `role = 'admin'` in profiles
- See [SUPABASE_RLS.md](./SUPABASE_RLS.md) for full policy documentation

## Data Privacy

### Grade Screenshots (OCR)
- Screenshots are processed **entirely client-side** using Tesseract.js
- Images are **never uploaded** to AU Track servers (default path)
- Only extracted grade text data is saved to the database (after user review)
- Image preview uses `URL.createObjectURL()` — local blob, not a server URL
- Deleting the screenshot revokes the object URL and clears browser memory

### Personal Data
- Email and full name stored in `profiles` — visible only to the user
- Grade data in `user_grades` — strictly per-user, no cross-user access
- Notes in `user_notes` — private to each user
- No data is shared with third parties

### Server-Side OCR (Optional)
- Only enabled when `GEMINI_API_KEY` is configured
- Images sent to Google Gemini Vision API are processed in memory — not stored
- Subject to Google's data retention policies
- Disabled by default — client-side OCR is the primary path

## Input Validation

### Client-Side
- All forms use Zod schemas for validation (`lib/validators/`)
- File uploads validated for type (PNG/JPG/JPEG/WEBP) and size (max 5 MB)
- Grade inputs validated against canonical set (O/A+/A/B+/B/C/U/RA)
- Semester numbers validated as integers 1–8

### Server-Side
- API routes re-validate all inputs using Zod
- File type and size checked again on the server
- Auth session verified before any data operation
- SQL injection prevented by Supabase client (parameterized queries)

## Environment Variables

| Variable | Purpose | Exposed to Client? |
|----------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes (public, RLS-protected) |
| `GEMINI_API_KEY` | Google Gemini Vision API key | No (server-only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin ops) | No (server-only, never in client code) |

### Rules
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- **Never** prefix a secret variable with `NEXT_PUBLIC_`
- Service role key is only used in server-side admin operations and migrations
- Anon key is safe to expose — RLS policies enforce access control

## CSRF Protection
- Next.js App Router API routes use `POST`/`GET` methods with JSON/form data
- Supabase auth tokens are validated server-side on every request
- No cookie-based CSRF tokens needed — Supabase SDK handles session integrity

## XSS Prevention
- React automatically escapes all rendered content
- `dangerouslySetInnerHTML` is **never used** in the codebase
- User-generated content (notes, notification bodies) is rendered as text, not HTML
- External links use `rel="noopener noreferrer"` to prevent tab hijacking

## Rate Limiting
- Supabase Auth has built-in rate limiting for login/signup attempts
- API routes are protected by Supabase auth checks (no anonymous access)
- Future: Vercel Edge Middleware for rate limiting on API routes (Phase 4)

## Admin Security
- Admin role checked via `profiles.role = 'admin'` in the database
- Admin pages use client-side role check + RLS policy enforcement
- Admin actions (verify subject/notification) are logged in `audit_log` table
- No admin functionality accessible without admin role in profiles

## Security Checklist

- [x] RLS enabled on all tables
- [x] No service role key in client code
- [x] All API routes check authentication
- [x] Input validation on both client and server
- [x] No `dangerouslySetInnerHTML` usage
- [x] External links use `rel="noopener noreferrer"`
- [x] File upload validation (type + size)
- [x] OCR images processed client-side (privacy)
- [x] Admin role verification on admin pages
- [x] Session refresh via middleware
- [ ] Rate limiting on API routes (Phase 4)
- [ ] CSP headers (Phase 4)
- [ ] Audit log for all admin actions (Phase 4)
