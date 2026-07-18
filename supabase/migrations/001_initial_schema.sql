-- ============================================================================
-- AU Track — Initial Schema Migration
-- Anna University student tracking app (Next.js + Supabase)
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "moddatetime";

-- ============================================================================
-- Reference / lookup tables
-- ============================================================================

create table if not exists public.regulations (
    id      uuid primary key default gen_random_uuid(),
    code    text not null unique,
    name    text not null,
    active  boolean not null default true
);

create table if not exists public.degrees (
    id    uuid primary key default gen_random_uuid(),
    name  text not null,
    level text not null
);

create table if not exists public.branches (
    id        uuid primary key default gen_random_uuid(),
    degree_id uuid references public.degrees(id) on delete set null,
    code      text not null,
    name      text not null,
    active    boolean not null default true
);

create table if not exists public.semesters (
    id              uuid primary key default gen_random_uuid(),
    regulation_id   uuid references public.regulations(id) on delete cascade,
    branch_id       uuid references public.branches(id) on delete cascade,
    semester_number int not null,
    total_credits   int
);

-- ============================================================================
-- Subjects
-- ============================================================================

create table if not exists public.subjects (
    id              uuid primary key default gen_random_uuid(),
    regulation_id   uuid references public.regulations(id) on delete cascade,
    branch_id       uuid references public.branches(id) on delete cascade,
    semester_number int,
    subject_code    text not null,
    subject_name    text not null,
    credits         int,
    category        text,
    is_elective     boolean not null default false,
    verified        boolean not null default false
);

-- ============================================================================
-- Profiles
-- ============================================================================

create table if not exists public.profiles (
    id                      uuid primary key references auth.users(id) on delete cascade,
    full_name               text,
    email                   text,
    avatar_url              text,
    degree_id               uuid references public.degrees(id) on delete set null,
    regulation_id           uuid references public.regulations(id) on delete set null,
    branch_id               uuid references public.branches(id) on delete set null,
    current_semester        int,
    previous_cgpa           numeric(5,2),
    previous_completed_credits int,
    target_cgpa             numeric(5,2),
    onboarding_completed    boolean not null default false,
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now()
);

-- ============================================================================
-- User academic data
-- ============================================================================

create table if not exists public.user_grades (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references auth.users(id) on delete cascade,
    subject_id       uuid not null references public.subjects(id) on delete cascade,
    semester_number  int,
    grade            text,
    grade_point      numeric(3,1),
    credits          int,
    attempt_type     text not null default 'regular',
    source           text not null default 'manual',
    confirmed        boolean not null default false,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    constraint user_grades_user_subject_unique unique (user_id, subject_id),
    constraint user_grades_grade_check
        check (grade in ('O','A+','A','B+','B','C','U','RA','absent','withheld'))
);

create table if not exists public.semester_results (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references auth.users(id) on delete cascade,
    semester_number  int not null,
    gpa              numeric(5,2),
    earned_credits   int,
    total_credits    int,
    calculated_at    timestamptz not null default now()
);

create table if not exists public.cgpa_snapshots (
    id                      uuid primary key default gen_random_uuid(),
    user_id                 uuid not null references auth.users(id) on delete cascade,
    cgpa                    numeric(5,2),
    total_completed_credits int,
    source                  text,
    created_at              timestamptz not null default now()
);

create table if not exists public.arrears (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references auth.users(id) on delete cascade,
    subject_id       uuid not null references public.subjects(id) on delete cascade,
    semester_number  int,
    status           text not null default 'pending',
    attempt_count    int not null default 1,
    exam_month       text,
    target_grade     text,
    notes            text,
    cleared_at       timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    constraint arrears_status_check
        check (status in ('pending','in_progress','cleared','failed'))
);

-- ============================================================================
-- Notifications
-- ============================================================================

create table if not exists public.notification_sources (
    id      uuid primary key default gen_random_uuid(),
    name    text,
    url     text,
    type    text,
    active  boolean not null default true
);

create table if not exists public.notifications (
    id            uuid primary key default gen_random_uuid(),
    title         text,
    body          text,
    source_url    text,
    category      text,
    degree_filter text,
    branch_filter text,
    published_at  timestamptz,
    fetched_at    timestamptz not null default now(),
    verified      boolean not null default false
);

create table if not exists public.user_notification_preferences (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users(id) on delete cascade,
    muted             boolean not null default false,
    allowed_categories text[],
    degree_filter     text,
    branch_filter     text,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    constraint user_notification_preferences_user_unique unique (user_id)
);

-- ============================================================================
-- Notes
-- ============================================================================

create table if not exists public.notes (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    subject_id  uuid references public.subjects(id) on delete set null,
    title       text,
    body        text,
    tags        text[],
    pinned      boolean not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ============================================================================
-- Screenshot uploads
-- ============================================================================

create table if not exists public.screenshot_uploads (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid not null references auth.users(id) on delete cascade,
    file_path      text,
    status         text not null default 'pending',
    extracted_json jsonb,
    confirmed      boolean not null default false,
    created_at     timestamptz not null default now(),
    deleted_at     timestamptz,
    constraint screenshot_uploads_status_check
        check (status in ('pending','processing','completed','failed'))
);

-- ============================================================================
-- Target plans
-- ============================================================================

create table if not exists public.target_plans (
    id                    uuid primary key default gen_random_uuid(),
    user_id               uuid not null references auth.users(id) on delete cascade,
    current_cgpa          numeric(5,2),
    target_cgpa           numeric(5,2),
    remaining_credits     int,
    required_average_gpa  numeric(5,2),
    plan_json             jsonb,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- profiles
create index if not exists idx_profiles_degree_id     on public.profiles(degree_id);
create index if not exists idx_profiles_regulation_id  on public.profiles(regulation_id);
create index if not exists idx_profiles_branch_id      on public.profiles(branch_id);

-- subjects
create index if not exists idx_subjects_subject_code    on public.subjects(subject_code);
create index if not exists idx_subjects_regulation_id   on public.subjects(regulation_id);
create index if not exists idx_subjects_branch_id       on public.subjects(branch_id);
create index if not exists idx_subjects_semester_number on public.subjects(semester_number);

-- user_grades
create index if not exists idx_user_grades_user_id          on public.user_grades(user_id);
create index if not exists idx_user_grades_subject_id       on public.user_grades(subject_id);
create index if not exists idx_user_grades_semester_number  on public.user_grades(semester_number);

-- semester_results
create index if not exists idx_semester_results_user_id         on public.semester_results(user_id);
create index if not exists idx_semester_results_semester_number on public.semester_results(semester_number);

-- cgpa_snapshots
create index if not exists idx_cgpa_snapshots_user_id    on public.cgpa_snapshots(user_id);
create index if not exists idx_cgpa_snapshots_created_at on public.cgpa_snapshots(created_at);

-- arrears
create index if not exists idx_arrears_user_id          on public.arrears(user_id);
create index if not exists idx_arrears_subject_id       on public.arrears(subject_id);
create index if not exists idx_arrears_status           on public.arrears(status);

-- notifications
create index if not exists idx_notifications_published_at on public.notifications(published_at);
create index if not exists idx_notifications_category     on public.notifications(category);
create index if not exists idx_notifications_verified     on public.notifications(verified);

-- user_notification_preferences
create index if not exists idx_user_notif_prefs_user_id on public.user_notification_preferences(user_id);

-- notes
create index if not exists idx_notes_user_id    on public.notes(user_id);
create index if not exists idx_notes_subject_id on public.notes(subject_id);
create index if not exists idx_notes_pinned     on public.notes(pinned);

-- screenshot_uploads
create index if not exists idx_screenshot_uploads_user_id    on public.screenshot_uploads(user_id);
create index if not exists idx_screenshot_uploads_status     on public.screenshot_uploads(status);
create index if not exists idx_screenshot_uploads_created_at on public.screenshot_uploads(created_at);

-- target_plans
create index if not exists idx_target_plans_user_id on public.target_plans(user_id);

-- semesters
create index if not exists idx_semesters_regulation_id on public.semesters(regulation_id);
create index if not exists idx_semesters_branch_id     on public.semesters(branch_id);

-- branches
create index if not exists idx_branches_degree_id on public.branches(degree_id);

-- ============================================================================
-- updated_at trigger function (uses moddatetime extension)
-- ============================================================================

-- moddatetime provides the moddatetime_with_schema() trigger function.
-- We create a lightweight wrapper that works on any table with an updated_at column.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Apply updated_at triggers to all tables that have updated_at

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create trigger trg_user_grades_updated_at
    before update on public.user_grades
    for each row execute function public.set_updated_at();

create trigger trg_arrears_updated_at
    before update on public.arrears
    for each row execute function public.set_updated_at();

create trigger trg_user_notification_preferences_updated_at
    before update on public.user_notification_preferences
    for each row execute function public.set_updated_at();

create trigger trg_notes_updated_at
    before update on public.notes
    for each row execute function public.set_updated_at();

create trigger trg_target_plans_updated_at
    before update on public.target_plans
    for each row execute function public.set_updated_at();

-- ============================================================================
-- handle_new_user trigger — auto-create a profile row on signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================================
-- Done
-- ============================================================================