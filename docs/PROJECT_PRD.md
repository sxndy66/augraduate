# AU Track — Product Requirements Document

## Product Vision

**For** Anna University students who want to track their academic performance  
**Who** struggle with manual CGPA calculation, missed exam notifications, and scattered grade records  
**AU Track** is a mobile-first academic companion app  
**That** provides automatic OCR grade extraction, real-time GPA/CGPA tracking, arrear management, university notification alerts, and a target GPA planner  
**Unlike** spreadsheets, manual calculators, or the official university portal  
**Our product** is fast, privacy-first, student-designed, and works entirely from your phone.

## Target Users

### Primary Persona: "The Tracker" (70% of users)
- 2nd–4th year B.E/B.Tech student
- Checks results immediately when published
- Manually calculates GPA every semester
- Has 1–3 arrears they're trying to clear
- Uses phone for almost everything

### Secondary Persona: "The Planner" (20% of users)
- Focused on maintaining or improving CGPA
- Wants to know what grades they need next semester to hit a target
- Plans post-graduation (GATE, placements, higher studies)

### Tertiary Persona: "The First Year" (10% of users)
- New to Anna University grading system
- Confused about GPA vs CGPA, credits, regulation differences
- Needs guidance and clear explanations

## User Stories & Acceptance Criteria

### Epic 1: Authentication & Onboarding

**US-1.1: Sign up with email**
- As a new user, I want to create an account with my email and password
- **Acceptance:** Email + password form, email verification sent, profile created in Supabase, redirected to onboarding

**US-1.2: Sign up with Google**
- As a new user, I want to sign up using my Google account for convenience
- **Acceptance:** Google OAuth button, creates session, creates profile record, redirects to onboarding

**US-1.3: Onboarding flow**
- As a new user, I want to select my degree, regulation, branch, and current semester
- **Acceptance:** 4-step wizard (degree → regulation → branch → semester), each step validates before proceeding, saves to profiles table, marks onboarding_completed = true

### Epic 2: Grade Management

**US-2.1: Manual grade entry**
- As a student, I want to manually enter my grades for each semester
- **Acceptance:** Semester selector, subject table with code/name/credits/grade fields, grade dropdown (O/A+/A/B+/B/C/U/RA), GPA auto-calculated, saves to user_grades table

**US-2.2: OCR grade upload**
- As a student, I want to upload a screenshot of my results and have grades extracted automatically
- **Acceptance:** Drag-drop upload zone, image preview, OCR processing with progress bar, editable results table, confirm to save, privacy notice displayed, manual entry fallback available

**US-2.3: Edit existing grades**
- As a student, I want to edit grades I've already saved
- **Acceptance:** Click edit on any grade row, modify fields, save updates user_grades, GPA recalculated

**US-2.4: Delete a grade entry**
- As a student, I want to delete an incorrect grade entry
- **Acceptance:** Delete button on each row, confirmation prompt, removes from user_grades, GPA recalculated

### Epic 3: GPA/CGPA Calculation

**US-3.1: View semester GPA**
- As a student, I want to see my GPA for each semester
- **Acceptance:** GPA displayed on semester page, formula: Σ(credits × grade_point) / Σ(credits), formatted to 2 decimal places

**US-3.2: View overall CGPA**
- As a student, I want to see my cumulative GPA across all semesters
- **Acceptance:** CGPA on dashboard, formula: Σ(all credits × grade_points) / Σ(all credits), excludes RA/U (0 point) subjects from numerator but includes in denominator per AU rules

**US-3.3: GPA calculator tool**
- As a student, I want to calculate hypothetical GPA for planning
- **Acceptance:** Standalone calculator page, add subjects with credits and expected grades, see projected GPA without saving

### Epic 4: Arrear Tracking

**US-4.1: View arrears**
- As a student, I want to see all my arrears (RA/U grades) in one place
- **Acceptance:** Arrears page lists all subjects with RA or U grade, shows subject code/name/semester/credits

**US-4.2: Mark arrear as cleared**
- As a student, I want to mark an arrear as cleared after re-exam
- **Acceptance:** "Clear" button on each arrear, updates grade to new value, removes from arrears list

**US-4.3: Arrear statistics**
- As a student, I want to see how many arrears I have and their impact
- **Acceptance:** Total arrears count, total arrear credits, impact on CGPA shown

### Epic 5: Notifications

**US-5.1: View notifications**
- As a student, I want to see latest university notifications
- **Acceptance:** Notification feed with title, body, category badge, source link, published date, only verified notifications shown

**US-5.2: Filter notifications**
- As a student, I want to filter by category and degree/branch
- **Acceptance:** Category dropdown (8 categories), degree filter, branch filter, results update instantly

**US-5.3: Mute notifications**
- As a student, I want to mute categories I don't care about
- **Acceptance:** Mute toggle per category, mute all toggle, preferences saved to localStorage

**US-5.4: Mark as read**
- As a student, I want to mark notifications as read
- **Acceptance:** Mark read button, mark all read button, read state persisted to notification_reads table

**US-5.5: Save notification**
- As a student, I want to bookmark important notifications
- **Acceptance:** Save button on each notification, saved notifications tracked in saved_notifications table

### Epic 6: Target Planner

**US-6.1: Set target CGPA**
- As a student, I want to set a target CGPA and see what I need to achieve it
- **Acceptance:** Input target CGPA, select remaining semesters, system calculates required GPA per semester

**US-6.2: View semester plan**
- As a student, I want to see a plan for each remaining semester
- **Acceptance:** Per-semester breakdown showing required GPA, suggested grade distribution, feasibility indicator

### Epic 7: Notes

**US-7.1: Create study notes**
- As a student, I want to create personal notes for subjects
- **Acceptance:** Note form with title, content, subject tag, saves to user_notes table

**US-7.2: View and edit notes**
- As a student, I want to view and edit my notes
- **Acceptance:** Note list with cards, edit and delete actions, notes scoped to current user via RLS

### Epic 8: Admin

**US-8.1: Admin data review**
- As an admin, I want to review and verify user-submitted subjects and scraped notifications
- **Acceptance:** Admin-only page (role check), subject review table, notification review table, verify buttons

## MVP Scope (Phase 1–3)

### In Scope
- ✅ Email + Google authentication
- ✅ Onboarding wizard (degree, regulation, branch, semester)
- ✅ Manual grade entry per semester
- ✅ OCR grade upload with Tesseract.js
- ✅ GPA and CGPA calculation
- ✅ Arrear tracking
- ✅ Notification center with filtering
- ✅ Target GPA planner
- ✅ Personal notes
- ✅ Settings page
- ✅ Admin data review
- ✅ Privacy, terms, contact pages

### Out of Scope (Phase 4+)
- ⬜ Notification scraping automation
- ⬜ Push notifications (PWA)
- ⬜ Offline mode / service worker
- ⬜ Social features (leaderboard, sharing)
- ⬜ Attendance tracking
- ⬜ Timetable management
- ⬜ Mobile app (React Native)
- ⬜ Multi-university support
- ⬜ AI-powered study recommendations

## Success Metrics

| Metric | Target (3 months) | Target (6 months) |
|--------|-------------------|-------------------|
| Registered users | 100 | 500 |
| Weekly active users | 40 | 200 |
| OCR uploads per week | 20 | 100 |
| Notification views per week | 100 | 500 |
| User retention (30-day) | 30% | 45% |

## Constraints

- Must work on mobile (primary device for target users)
- Must not store grade screenshots on servers (privacy)
- Must include non-affiliation disclaimer on all university-data pages
- Must use Anna University's official 10-point grading system
- Must support R2017 and R2021 regulations
