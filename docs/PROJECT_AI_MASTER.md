# AU Track — AI Master Document

## Project Overview

**AU Track** is a student-first academic companion app built specifically for Anna University students. It helps students track their GPA/CGPA, manage arrears, upload grade screenshots for automatic OCR extraction, receive timely university notifications, and plan their academic trajectory with a target GPA planner.

The app is designed to be fast, privacy-respecting, and mobile-first — addressing the pain points of scattered grade tracking, missed exam notifications, and manual CGPA calculation that Anna University students face every semester.

## Creator

**Santhosh V** — Independent developer and Anna University student advocate.

## Team Structure

| Role | Responsibility | Current Holder |
|------|---------------|----------------|
| Product Owner | Feature prioritization, user research, roadmap | Santhosh V |
| Full-Stack Developer | Frontend, backend, Supabase, deployments | Santhosh V |
| Designer | UI/UX, brand identity, component design | Santhosh V |
| QA / Testing | Acceptance testing, bug triage | Santhosh V (assisted by AI) |
| Content / Data | Subject data, notification scraping, verification | Santhosh V + community contributors |

> AU Track is currently a solo project. Community contributors may join for data verification and notification sourcing in Phase 4.

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 with custom design tokens
- **UI Components:** Custom component library (Button, Card, Input, Select, Badge, Spinner, ProgressBar, EmptyState, ErrorState, Toast, StatCard)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack React Query
- **OCR:** Tesseract.js (client-side), Google Gemini Vision (server-side optional)

### Backend
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS)
- **API Routes:** Next.js Route Handlers (App Router `/app/api/`)
- **Validation:** Zod schemas shared between client and server

### Infrastructure
- **Hosting:** Vercel
- **Database Hosting:** Supabase Cloud
- **Environment Variables:** Vercel Environment Variables + `.env.local` for development
- **CI/CD:** Vercel automatic deployments on git push

### Key Libraries
| Package | Purpose |
|---------|---------|
| `@supabase/ssr` | Supabase SSR client for Next.js App Router |
| `@supabase/supabase-js` | Supabase JavaScript client |
| `tesseract.js` | Client-side OCR for grade screenshot extraction |
| `zod` | Runtime schema validation |
| `react-hook-form` | Form state management |
| `framer-motion` | UI animations and transitions |
| `lucide-react` | Icon system |
| `clsx` + `tailwind-merge` | Conditional class name composition |

## Architecture Decisions

### 1. App Router over Pages Router
Next.js 14 App Router provides nested layouts, server components, and collocated API routes. This reduces boilerplate and enables streaming SSR for faster initial loads.

### 2. Supabase over Custom Backend
Supabase provides PostgreSQL, authentication, row-level security, and real-time subscriptions out of the box. This eliminates the need for a separate backend server while maintaining fine-grained access control through RLS policies.

### 3. Client-Side OCR as Primary Path
Tesseract.js runs entirely in the browser, meaning student grade screenshots never leave the user's device. This is a critical privacy decision — students may hesitate to upload sensitive academic records to a third-party server. Server-side Gemini Vision OCR is available as an optional enhancement when an API key is configured.

### 4. Custom UI Component Library
Instead of using a pre-built component library (shadcn/ui, MUI), AU Track uses a purpose-built component system with the project's custom design tokens (navy, electric-blue, royal-indigo, success-green, amber, error-red). This ensures full control over styling, dark mode support, and bundle size.

### 5. Zod Schemas as Single Source of Truth
Validation schemas are defined in `lib/validators/` and shared between client forms and API routes. This prevents validation drift and ensures consistent error messages.

### 6. Dark Mode by Default
The app defaults to dark mode (`<html className="dark">`) with a navy-based color palette. This matches the aesthetic preferences of the target demographic (college students) and reduces eye strain during late-night study sessions.

### 7. Class-Based Dark Mode
Tailwind's `darkMode: "class"` strategy is used instead of `media` to allow explicit toggle control and avoid hydration mismatches.

## Project Structure

```
au-track/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/            # Auth pages (login, signup, forgot-password)
│   ├── api/               # API route handlers
│   ├── dashboard/         # Main dashboard
│   ├── semesters/         # Semester grade management
│   ├── calculator/        # GPA/CGPA calculator
│   ├── arrears/           # Arrear tracking
│   ├── ocr-upload/        # OCR grade upload
│   ├── notifications/     # Notification center
│   ├── target-planner/    # Target GPA planner
│   ├── notes/             # Personal notes
│   ├── settings/          # User settings
│   ├── admin/             # Admin panel
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── ocr/               # OCR-related components
│   ├── notifications/     # Notification components
│   ├── dashboard/         # Dashboard widgets
│   ├── forms/             # Form components
│   ├── layout/            # Navbar, Footer, ProtectedRoute
│   └── providers/         # Context providers
├── lib/                   # Utilities, validators, Supabase clients
│   ├── supabase/          # Supabase client factories
│   ├── validators/        # Zod schemas and validation logic
│   └── utils.ts           # Shared utilities (cn, formatDate, etc.)
├── data/                  # Static JSON data (subjects, regulations, branches)
├── docs/                  # Project documentation
└── public/                # Static assets
```

## Design Principles

1. **Student-first:** Every feature is designed around the student workflow — from checking results to planning next semester.
2. **Privacy by default:** Sensitive data (grade screenshots) is processed client-side. No unnecessary data collection.
3. **Fast and responsive:** Target < 2s page load. Mobile-first design for students on the go.
4. **Accessible:** Semantic HTML, ARIA labels, keyboard navigation, sufficient color contrast.
5. **Non-affiliated:** Clear disclaimers that AU Track is not affiliated with Anna University.
