# AU Track — Database Schema

## Overview

AU Track uses Supabase (PostgreSQL) with 16 tables. All tables have Row Level Security (RLS) enabled. The schema supports multi-regulation, multi-degree, multi-branch academic tracking for Anna University students.

## Tables

### 1. `profiles`
User profile data, created on signup via Supabase Auth trigger.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, references auth.users(id) | User ID (matches Supabase Auth) |
| email | text | not null | User email |
| full_name | text | | Display name |
| avatar_url | text | | Profile picture URL |
| degree_id | text | references degrees(id) | Selected degree (be, btech, me, mtech) |
| regulation_id | text | references regulations(id) | Selected regulation (R2017, R2021) |
| branch_id | text | references branches(id) | Selected branch (cse, it, ece, etc.) |
| current_semester | int | default 1, check 1–8 | Current semester number |
| onboarding_completed | boolean | default false | Whether onboarding wizard is done |
| role | text | default 'student', check admin/student | User role |
| created_at | timestamptz | default now() | Account creation time |
| updated_at | timestamptz | default now() | Last profile update |

**Indexes:** `idx_profiles_email` on email, `idx_profiles_role` on role

### 2. `degrees`
Degree types offered by Anna University.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | Degree identifier (be, btech, me, mtech) |
| code | text | not null | Short code (B.E, B.Tech, M.E, M.Tech) |
| name | text | not null | Full degree name |
| level | text | check undergraduate/postgraduate | Degree level |
| duration | int | not null | Duration in years |
| total_semesters | int | not null | Total number of semesters |
| default_credits | int | not null | Default credits required |

### 3. `regulations`
Anna University curriculum regulations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | Regulation identifier (R2017, R2021) |
| name | text | not null | Full regulation name |
| short_name | text | not null | Short name (R2017) |
| full_name | text | not null | Complete name |
| effective_from | int | not null | Start year |
| effective_to | int | | End year (null if current) |
| is_active | boolean | default true | Whether currently in use |
| grading_system | jsonb | not null | Grade-to-point mapping |
| pass_mark | int | not null | Minimum passing mark |
| total_semesters | int | not null | Default semester count |
| credits_required | jsonb | not null | Credits per degree type |
| description | text | | Regulation description |

### 4. `branches`
Engineering branches under each degree.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK | Branch identifier (cse, it, ece) |
| code | text | not null | Short code (CSE, IT, ECE) |
| name | text | not null | Full branch name |
| degree_id | text | FK → degrees(id) | Parent degree |
| regulations | text[] | not null | Compatible regulation IDs |
| total_semesters | int | not null | Semester count |

**Indexes:** `idx_branches_degree_id` on degree_id

### 5. `subjects`
Subject/master course catalog. User-submitted subjects start as unverified.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Subject ID |
| subject_code | text | not null | Anna University subject code (e.g. CS8492) |
| subject_name | text | not null | Full subject name |
| credits | int | not null, check 1–10 | Credit hours |
| semester | int | not null, check 1–8 | Which semester it belongs to |
| regulation_id | text | FK → regulations(id) | Applicable regulation |
| branch_id | text | FK → branches(id) | Applicable branch (null = all branches) |
| category | text | check HS/BS/ES/PC/PE/OE | Subject category |
| is_elective | boolean | default false | Whether it's an elective |
| is_verified | boolean | default false | Admin verification status |
| submitted_by | uuid | FK → auth.users(id) | User who submitted (null = system) |
| verified_at | timestamptz | | When verified by admin |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update |

**Indexes:** `idx_subjects_code` on subject_code, `idx_subjects_regulation_branch` on (regulation_id, branch_id), `idx_subjects_verified` on is_verified

**Unique constraint:** `uniq_subjects_code_reg_branch` on (subject_code, regulation_id, branch_id)

### 6. `user_grades`
Individual grade entries per user per semester.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Grade entry ID |
| user_id | uuid | FK → auth.users(id), not null | Owner |
| subject_code | text | not null | Subject code |
| subject_name | text | | Subject name (denormalized for OCR) |
| credits | int | not null, check 1–10 | Credit hours |
| grade | text | not null, check valid grades | Grade (O/A+/A/B+/B/C/U/RA) |
| semester_number | int | not null, check 1–8 | Semester number |
| category | text | check HS/BS/ES/PC/PE/OE | Subject category |
| is_elective | boolean | default false | Elective flag |
| source | text | default 'manual', check manual/ocr | Entry method |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update |

**Indexes:** `idx_user_grades_user` on user_id, `idx_user_grades_user_sem` on (user_id, semester_number), `idx_user_grades_user_subject` on (user_id, subject_code)

**Unique constraint:** `uniq_user_grades_user_subj_sem` on (user_id, subject_code, semester_number)

### 7. `user_semester_gpa`
Cached GPA per semester per user (updated via trigger or app logic).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Row ID |
| user_id | uuid | FK → auth.users(id), not null | Owner |
| semester_number | int | not null, check 1–8 | Semester |
| gpa | numeric(5,2) | not null | Calculated GPA |
| total_credits | int | not null | Total credits that semester |
| earned_credits | int | not null | Credits earned (non-RA) |
| calculated_at | timestamptz | default now() | Last calculation time |

**Unique constraint:** `uniq_user_sem_gpa` on (user_id, semester_number)

### 8. `user_cgpa`
Cached overall CGPA per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Row ID |
| user_id | uuid | FK → auth.users(id), unique, not null | Owner |
| cgpa | numeric(5,2) | not null | Calculated CGPA |
| total_credits | int | not null | Total credits across all semesters |
| earned_credits | int | not null | Total earned credits |
| arrears_count | int | default 0 | Number of arrears |
| calculated_at | timestamptz | default now() | Last calculation time |

**Unique constraint:** `uniq_user_cgpa` on user_id

### 9. `arrears`
Tracks active arrears (RA/U grades) per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Arrear ID |
| user_id | uuid | FK → auth.users(id), not null | Owner |
| subject_code | text | not null | Subject code |
| subject_name | text | | Subject name |
| credits | int | not null | Credit hours |
| semester_number | int | not null | Original semester |
| attempt_count | int | default 1 | Number of attempts |
| status | text | default 'active', check active/cleared | Current status |
| cleared_grade | text | | Grade when cleared |
| cleared_date | timestamptz | | When cleared |
| created_at | timestamptz | default now() | Creation time |

**Indexes:** `idx_arrears_user` on user_id, `idx_arrears_user_status` on (user_id, status)

### 10. `notifications`
University notifications scraped from public sources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Notification ID |
| title | text | not null | Notification title |
| body | text | | Full notification text |
| summary | text | | Short summary |
| category | text | not null, check valid categories | Category key |
| source_url | text | | Original URL |
| source_name | text | | Source name (e.g. "annauniv.edu") |
| published_date | timestamptz | not null | When published by university |
| fetched_date | timestamptz | default now() | When scraped by AU Track |
| is_verified | boolean | default false | Admin verification |
| degree_scope | text[] | | Applicable degrees (null = all) |
| branch_scope | text[] | | Applicable branches (null = all) |
| created_at | timestamptz | default now() | Record creation |

**Indexes:** `idx_notifications_category` on category, `idx_notifications_verified` on is_verified, `idx_notifications_published` on published_date DESC

### 11. `notification_reads`
Tracks which notifications a user has read.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Row ID |
| user_id | uuid | FK → auth.users(id), not null | Reader |
| notification_id | uuid | FK → notifications(id), not null | Notification |
| read_at | timestamptz | default now() | When marked as read |

**Unique constraint:** `uniq_notif_read` on (user_id, notification_id)

### 12. `saved_notifications`
Bookmarked notifications per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Row ID |
| user_id | uuid | FK → auth.users(id), not null | User |
| notification_id | uuid | FK → notifications(id), not null | Notification |
| saved_at | timestamptz | default now() | When saved |

**Unique constraint:** `uniq_saved_notif` on (user_id, notification_id)

### 13. `muted_categories`
User's muted notification categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Row ID |
| user_id | uuid | FK → auth.users(id), not null | User |
| category | text | not null | Muted category key |
| muted_at | timestamptz | default now() | When muted |

**Unique constraint:** `uniq_muted_cat` on (user_id, category)

### 14. `user_notes`
Personal study notes per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Note ID |
| user_id | uuid | FK → auth.users(id), not null | Owner |
| title | text | not null | Note title |
| content | text | not null | Note body |
| subject_code | text | | Related subject (optional) |
| tags | text[] | default '{}' | Custom tags |
| is_pinned | boolean | default false | Pinned to top |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last edit |

**Indexes:** `idx_notes_user` on user_id, `idx_notes_user_subject` on (user_id, subject_code)

### 15. `target_plans`
Saved target GPA plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Plan ID |
| user_id | uuid | FK → auth.users(id), not null | Owner |
| target_cgpa | numeric(3,2) | not null, check 0–10 | Target CGPA |
| current_cgpa | numeric(3,2) | not null | Current CGPA |
| remaining_semesters | int | not null, check 1–8 | Semesters remaining |
| required_gpa_per_sem | numeric(5,2) | not null | Calculated required GPA |
| is_feasible | boolean | not null | Whether target is achievable |
| created_at | timestamptz | default now() | Creation time |

**Indexes:** `idx_target_plans_user` on user_id

### 16. `audit_log`
Audit trail for admin actions and critical data changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Log ID |
| actor_id | uuid | FK → auth.users(id) | Who performed the action |
| action | text | not null | Action type (verify, delete, update) |
| entity_type | text | not null | Table name |
| entity_id | uuid | | Row ID affected |
| metadata | jsonb | | Additional context |
| created_at | timestamptz | default now() | When action occurred |

**Indexes:** `idx_audit_actor` on actor_id, `idx_audit_entity` on (entity_type, entity_id)

## Relationships

```
auth.users ──< profiles
profiles >── degrees
profiles >── regulations
profiles >── branches
branches >── degrees
subjects >── regulations
subjects >── branches
auth.users ──< user_grades
auth.users ──< user_semester_gpa
auth.users ──< user_cgpa
auth.users ──< arrears
auth.users ──< user_notes
auth.users ──< target_plans
auth.users ──< notification_reads >── notifications
auth.users ──< saved_notifications >── notifications
auth.users ──< muted_categories
auth.users ──< audit_log
```

## Database Triggers

1. **`on_auth_user_created`** — Creates a `profiles` row when a new auth.users record is inserted.
2. **`update_updated_at`** — Automatically updates `updated_at` on row modification (applied to profiles, subjects, user_grades, user_notes).

## Migration Files

Migrations are managed via Supabase CLI and stored in `supabase/migrations/`. Run with:

```bash
supabase db push
```
