# AU Track — Notification System Documentation

## Overview

The notification system aggregates publicly available Anna University announcements and delivers them to students in a filtered, categorized feed. Notifications cover exam timetables, results, revaluation deadlines, hall tickets, practical exams, internal assessments, academic calendars, and circulars.

## Notification Categories

| Category Key | Display Label | Badge Color | Description |
|-------------|---------------|-------------|-------------|
| `exam_timetable` | Exam Timetable | red | Semester exam schedules and slot timings |
| `results` | Results | green | Publication of semester/end-semester results |
| `revaluation` | Revaluation | amber | Revaluation and retotalling application windows |
| `hall_ticket` | Hall Ticket | blue | Hall ticket download availability |
| `practical_exam` | Practical Exam | indigo | Practical exam schedules and instructions |
| `internal_assessment` | Internal Assessment | amber | Internal assessment marks and schedules |
| `academic_calendar` | Academic Calendar | indigo | Semester calendars, holidays, important dates |
| `circulars` | Circulars | gray | General university circulars and announcements |

## Data Flow

```
Public university sources (annauniv.edu, affiliated college sites)
       ↓
Scraping pipeline (Phase 4 — automated cron jobs)
       ↓
Raw notifications inserted into `notifications` table (is_verified = false)
       ↓
Admin reviews and verifies (admin/data-review page)
       ↓
is_verified = true → visible to users
       ↓
User views notifications at /notifications
       ↓
Filters applied (category, degree, branch)
       ↓
User actions: mark read, save, mute category
```

## Filtering

### Category Filter
- Dropdown with 8 categories + "All Categories"
- Filters `notifications.category` field
- Applied client-side via API query parameter

### Degree Filter
- Filters by `notifications.degree_scope` (text array)
- Notifications with `degree_scope = null` apply to all degrees
- Query: `degree_scope.is.null OR degree_scope.cs.{degree_id}`

### Branch Filter
- Filters by `notifications.branch_scope` (text array)
- Notifications with `branch_scope = null` apply to all branches
- Query: `branch_scope.is.null OR branch_scope.cs.{branch_id}`

## Mute System

### Mute All
- Global toggle that hides all notifications
- Persisted in `localStorage` as `au_mute_all`
- When enabled, shows "All notifications are muted" message

### Mute Specific Category
- Per-category mute toggle (clickable badges in filter bar)
- Muted categories persisted in `localStorage` as `au_muted_categories` (JSON array)
- Muted notifications are filtered out client-side
- Also stored in `muted_categories` table for cross-device sync (Phase 4)

## User Actions

| Action | Description | Storage |
|--------|-------------|---------|
| Mark as Read | Marks notification as read | `notification_reads` table |
| Mark All Read | Marks all visible notifications as read | `notification_reads` table |
| Save | Bookmarks notification for later | `saved_notifications` table |
| Unsave | Removes bookmark | `saved_notifications` table |
| Mute Category | Hides all notifications in a category | `localStorage` + `muted_categories` table |

## Notification Card Display

Each notification card shows:
- **Category badge** — colored by category
- **Unread indicator** — blue dot for unread, gray for read
- **Title** — notification headline
- **Body** — truncated to 3 lines
- **Source link** — external link to original URL (opens in new tab)
- **Published date** — when the university published it
- **Fetched date** — when AU Track scraped it
- **Action buttons** — Mark Read, Save, Mute Category

## API Route

### `GET /api/notifications`
- **Auth:** Required
- **Query params:** `category`, `degree`, `branch`, `limit` (max 100), `offset`
- **Returns:** `{ notifications: Notification[], total: number }`
- **Filtering:** Only `is_verified = true` notifications are returned
- **User state:** Includes `is_read` and `is_saved` flags per notification

## Non-Affiliation Disclaimer

Displayed prominently on the notifications page:

> "AU Track is an independent platform and is not affiliated with, endorsed by, or officially connected to Anna University. Notifications are sourced from publicly available university channels for convenience. Always verify with official sources before making decisions."

## Component Architecture

```
app/notifications/page.tsx                    — Main notifications page
├── components/notifications/NotificationFilters.tsx  — Filter bar + mute controls
├── components/notifications/NotificationList.tsx     — List with empty state
└── components/notifications/NotificationCard.tsx     — Individual card with actions
```

## Future Enhancements (Phase 4+)

- Push notifications via PWA service worker
- Email digest of new notifications
- Automated scraping pipeline with cron jobs
- Real-time updates via Supabase subscriptions
- Notification preferences sync across devices
