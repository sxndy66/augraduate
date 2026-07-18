# AU Track 🎓

**Smart CGPA Tracker for Anna University Students**

Upload your grade screenshot, get instant CGPA calculation, arrear tracking, semester breakdowns, university notifications, and personalized academic insights — all in one privacy-first app.

> **Disclaimer:** AU Track is an independent platform and is not affiliated with, endorsed by, or officially connected to Anna University. All information is provided for convenience. Always verify with official university sources.

---

## ✨ Features

### Grade Management
- **OCR Grade Upload** — Upload a screenshot of your results and grades are extracted automatically using client-side OCR (Tesseract.js). Your screenshot never leaves your browser.
- **Manual Grade Entry** — Enter grades by hand with full control over subject codes, credits, and grades.
- **Editable Results** — Review and correct any OCR-extracted grades before saving.

### GPA & CGPA
- **Semester GPA** — Automatic GPA calculation per semester using Anna University's 10-point grading system.
- **Cumulative CGPA** — Overall CGPA across all semesters, updated in real-time.
- **GPA Calculator** — Standalone tool for hypothetical "what-if" calculations without saving.

### Arrear Tracking
- **Arrear Detection** — Automatically identifies RA/U grades as arrears.
- **Clear Arrears** — Mark arrears as cleared after re-exams; GPA recalculates automatically.
- **Statistics** — Total arrears, arrear credits, and CGPA impact at a glance.

### Notifications
- **University Notifications** — Exam timetables, results, revaluation, hall tickets, and more in one feed.
- **Smart Filtering** — Filter by category, degree, and branch.
- **Mute Controls** — Mute all or specific categories. Mark as read. Save important notifications.

### Target Planner
- **Set Target CGPA** — Input your goal and see what GPA you need per remaining semester.
- **Feasibility Check** — Know whether your target is achievable.

### More
- **Personal Notes** — Create and organize study notes by subject.
- **Admin Data Review** — Admin-only panel for verifying user-submitted subjects and scraped notifications.
- **Dark Mode** — Beautiful dark UI by default, designed for late-night study sessions.
- **Mobile-First** — Fully responsive, works great on phones.

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 with custom design tokens |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) |
| OCR | Tesseract.js (client-side), Google Gemini Vision (server-side optional) |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Data Fetching | TanStack React Query |
| Hosting | Vercel |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- (Optional) Google Gemini API key for server-side OCR

### 1. Clone & Install

```bash
git clone <repository-url>
cd au-track
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# Required — Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — Server-side OCR (Gemini Vision)
GEMINI_API_KEY=your_gemini_api_key

# Server-only (for migrations/admin scripts) — DO NOT expose to client
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from your Supabase dashboard → Project Settings → API.

### 3. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migrations:**
   ```bash
   # Install Supabase CLI if not already
   npm install -g supabase

   # Link your project
   supabase link --project-ref your_project_ref

   # Push migrations
   supabase db push
   ```

3. **Enable Authentication providers:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable **Email** (enabled by default)
   - Enable **Google** (configure OAuth credentials)

4. **Configure redirect URLs:**
   - Go to Authentication → URL Configuration
   - Set Site URL: `http://localhost:3000` (dev) or your production URL
   - Add Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback`

5. **Seed reference data:**
   - Run the seed SQL for degrees, regulations, and branches
   - (See `docs/DATABASE_SCHEMA.md` and `docs/TODO_NEXT_SESSION.md`)

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Type Check

```bash
npm run type-check
```

---

## 📦 Deploy on Vercel

1. **Push your code to GitHub** (if not already)

2. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo

3. **Configure environment variables:**
   - In Vercel project settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `GEMINI_API_KEY` (optional, for server-side OCR)

4. **Update Supabase redirect URLs:**
   - Add your Vercel production URL to Supabase Auth redirect URLs
   - `https://your-app.vercel.app/auth/callback`

5. **Deploy:**
   - Vercel auto-deploys on push to main branch
   - Or click "Deploy" in the Vercel dashboard

---

## 🔒 Security Notes

- **Row Level Security (RLS)** is enabled on all database tables — users can only access their own data
- **Grade screenshots are processed client-side** — images never leave the user's browser (Tesseract.js)
- **No tracking cookies** — only Supabase auth cookies (HTTP-only, secure)
- **No third-party analytics** — privacy-friendly analytics planned for Phase 4
- **Service role key** is never exposed to the client
- **Input validation** on both client (Zod) and server (API route re-validation)
- See [`docs/SECURITY_RULES.md`](docs/SECURITY_RULES.md) for full details

---

## 📁 Project Structure

```
au-track/
├── app/                      # Next.js App Router pages & API routes
│   ├── api/                  # API route handlers
│   ├── dashboard/            # Main dashboard
│   ├── semesters/            # Semester grade management
│   ├── ocr-upload/           # OCR grade upload
│   ├── notifications/        # Notification center
│   ├── arrears/              # Arrear tracking
│   ├── calculator/           # GPA calculator
│   ├── target-planner/       # Target GPA planner
│   ├── notes/                # Personal notes
│   ├── settings/             # User settings
│   ├── admin/                # Admin panel
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Base UI components (10+)
│   ├── ocr/                  # OCR components (4)
│   ├── notifications/        # Notification components (3)
│   ├── dashboard/            # Dashboard widgets
│   ├── forms/                # Form components
│   ├── layout/               # Navbar, Footer, ProtectedRoute
│   └── providers/            # Context providers
├── lib/                      # Utilities & validators
│   ├── supabase/             # Supabase client factories
│   ├── validators/           # Zod schemas (gpa, ocr, notifications, etc.)
│   └── utils.ts              # Shared utilities
├── data/                     # Static JSON data (subjects, regulations)
├── docs/                     # Project documentation (19 files)
└── tailwind.config.ts        # Tailwind config with custom colors
```

---

## 📚 Documentation

Full documentation is in the [`docs/`](docs/) directory:

| Document | Description |
|----------|-------------|
| [PROJECT_AI_MASTER.md](docs/PROJECT_AI_MASTER.md) | Project overview, team, tech stack, architecture |
| [PROJECT_PRD.md](docs/PROJECT_PRD.md) | Product requirements, user stories, MVP scope |
| [SITE_STRUCTURE.md](docs/SITE_STRUCTURE.md) | Full site map with all routes |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | All 16 tables, relationships, indexes |
| [SUPABASE_RLS.md](docs/SUPABASE_RLS.md) | RLS policy documentation |
| [GPA_RULES.md](docs/GPA_RULES.md) | Grading system, GPA/CGPA formulas, edge cases |
| [OCR_FLOW.md](docs/OCR_FLOW.md) | OCR flow, privacy, fallback strategy |
| [NOTIFICATION_SYSTEM.md](docs/NOTIFICATION_SYSTEM.md) | Notification categories, filtering |
| [SECURITY_RULES.md](docs/SECURITY_RULES.md) | Security rules and best practices |
| [BRAND_GUIDE.md](docs/BRAND_GUIDE.md) | Brand identity, colors, typography |
| [MARKETING_PLAN.md](docs/MARKETING_PLAN.md) | Marketing strategy and message templates |
| [LEGAL_NOTES.md](docs/LEGAL_NOTES.md) | Disclaimers, privacy obligations |
| [ROADMAP.md](docs/ROADMAP.md) | 4-phase product roadmap |
| [TEST_PLAN.md](docs/TEST_PLAN.md) | Acceptance criteria per feature |
| [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | Current status (Phases 1–3 complete) |
| [TODO_NEXT_SESSION.md](docs/TODO_NEXT_SESSION.md) | Phase 4 task list |
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## 🎨 Design System

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#0a0e27` | Background, dark base |
| Electric Blue | `#3b82f6` | Primary actions, links |
| Royal Indigo | `#6366f1` | Gradients, accents |
| Success Green | `#22c55e` | Success, pass grades |
| Amber | `#f59e0b` | Warnings, pending |
| Error Red | `#ef4444` | Errors, fail grades |

### Typography
- **Font:** Inter (via `next/font/google`)
- **Dark mode:** Default (`class`-based)

---

## ⚖️ Legal Disclaimer

AU Track is an **independent, student-built platform** and is not affiliated with, endorsed by, sponsored by, or officially connected to Anna University or any of its affiliated colleges.

- All grade calculations are for **informational purposes only** — always verify with official university records
- Notifications are sourced from **publicly available channels** and may be delayed — always check official sources
- Grade screenshots are processed **entirely in your browser** and are never uploaded to AU Track servers
- The app is **free to use** with no paywall for core features

See [Privacy Policy](/privacy) and [Terms of Service](/terms) for full details.

---

## 📄 License

Proprietary. All rights reserved. Third-party libraries used under their respective licenses.

---

## 🙋 Support

- **Contact:** [Contact page](/contact) or santhosh023166@gmail.com
- **Privacy:** [Privacy Policy](/privacy)
- **Terms:** [Terms of Service](/terms)

---

## 👤 Created By

**Santhosh V**

Built with ❤️ for Anna University students.