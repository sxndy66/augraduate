# AU Track — Product Roadmap

## Phase 1: Foundation (Complete ✅)

**Goal:** Core app with authentication and basic grade tracking.

| Feature | Status |
|---------|--------|
| Project setup (Next.js, Tailwind, Supabase) | ✅ Complete |
| Custom UI component library | ✅ Complete |
| Email + Google authentication | ✅ Complete |
| Onboarding wizard (degree, regulation, branch, semester) | ✅ Complete |
| Dashboard with stats | ✅ Complete |
| Manual grade entry per semester | ✅ Complete |
| GPA calculation (per semester) | ✅ Complete |
| CGPA calculation (cumulative) | ✅ Complete |
| Privacy, terms, contact pages | ✅ Complete |
| Landing page | ✅ Complete |

## Phase 2: Core Features (Complete ✅)

**Goal:** Full academic tracking toolkit.

| Feature | Status |
|---------|--------|
| Arrear tracking and management | ✅ Complete |
| Target GPA planner | ✅ Complete |
| Personal study notes | ✅ Complete |
| Settings page (profile, preferences) | ✅ Complete |
| Semester-wise breakdown view | ✅ Complete |
| GPA calculator tool (standalone) | ✅ Complete |

## Phase 3: Advanced Features (Complete ✅)

**Goal:** OCR, notifications, and admin tools.

| Feature | Status |
|---------|--------|
| OCR grade upload (Tesseract.js client-side) | ✅ Complete |
| OCR results preview with editable grades | ✅ Complete |
| OCR confirmation step with projected GPA | ✅ Complete |
| Server-side OCR API route (Gemini Vision) | ✅ Complete |
| Notification center with filtering | ✅ Complete |
| Notification categories (8 types) | ✅ Complete |
| Notification mute (all + per-category) | ✅ Complete |
| Mark as read + save notifications | ✅ Complete |
| Admin data review page | ✅ Complete |
| Subject verification system | ✅ Complete |
| Notification verification system | ✅ Complete |

## Phase 4: Growth & Polish (Planned — Next Session)

**Goal:** Scale to 100+ users, automate notifications, add PWA features.

### 4A: Notification Automation
- [ ] Automated notification scraping pipeline (cron jobs)
- [ ] Source monitoring for annauniv.edu and affiliated sites
- [ ] Webhook for instant notification ingestion
- [ ] Notification deduplication logic
- [ ] Email digest for new notifications

### 4B: PWA & Mobile
- [ ] PWA manifest and service worker
- [ ] Push notifications via web push API
- [ ] Offline mode for cached data
- [ ] Add to home screen prompt
- [ ] App icon optimization

### 4C: UX Polish
- [ ] Light mode support (toggle in settings)
- [ ] Onboarding improvements (skip option, progress bar)
- [ ] Dashboard customization (reorder widgets)
- [ ] Empty state illustrations
- [ ] Skeleton loaders for all async content
- [ ] Error boundary with recovery options

### 4D: Data & Analytics
- [ ] Privacy-friendly analytics (Plausible or Umami)
- [ ] User feedback widget
- [ ] Feature usage tracking (anonymous, aggregated)
- [ ] A/B testing framework for key flows

### 4E: Security Hardening
- [ ] Rate limiting on API routes
- [ ] CSP headers via Next.js middleware
- [ ] Audit log for all admin actions
- [ ] Data export feature (GDPR compliance)
- [ ] Account deletion with cascade cleanup

### 4F: Social & Community
- [ ] Referral program ("Track Together")
- [ ] Anonymous CGPA comparison (opt-in)
- [ ] Study group finder (by branch/semester)
- [ ] Community-submitted subject data with verification queue

## Future Phases (Beyond Phase 4)

### Phase 5: Mobile App
- React Native app for iOS and Android
- Native camera for OCR (better accuracy)
- Push notification integration

### Phase 6: Multi-University
- Support for other Tamil Nadu universities
- Configurable grading systems
- University-specific notification sources

### Phase 7: AI Features
- AI-powered study recommendations based on grade patterns
- Predictive CGPA forecasting
- Smart arrear clearing strategy suggestions
- Natural language notification summarization

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 | 2 weeks | ✅ Complete |
| Phase 2 | 2 weeks | ✅ Complete |
| Phase 3 | 2 weeks | ✅ Complete |
| Phase 4 | 4–6 weeks | 📋 Planned |
| Phase 5 | 8–12 weeks | 🔮 Future |
| Phase 6 | 4–8 weeks | 🔮 Future |
| Phase 7 | Ongoing | 🔮 Future |
