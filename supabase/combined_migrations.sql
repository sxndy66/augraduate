

-- ======================================================================
-- FILE: migrations/001_initial_schema.sql
-- ======================================================================

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

-- ======================================================================
-- FILE: migrations/002_rls_policies.sql
-- ======================================================================

-- ============================================================================
-- AU Track — Row Level Security Policies
-- ============================================================================

-- ============================================================================
-- is_admin() helper function
-- Checks JWT app_metadata -> role, or email against ADMIN_EMAILS env setting
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
    select
        coalesce(
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
            false
        )
        or
        coalesce(
            auth.jwt() -> 'app_metadata' ->> 'role' = 'service_role',
            false
        )
        or (
            auth.email() is not null
            and auth.email() in (
                'admin@autrack.in',
                'santhosh023166@gmail.com'
            )
        )
$$;

-- ============================================================================
-- Enable RLS on ALL tables
-- ============================================================================

alter table public.profiles                          enable row level security;
alter table public.regulations                       enable row level security;
alter table public.degrees                           enable row level security;
alter table public.branches                          enable row level security;
alter table public.semesters                         enable row level security;
alter table public.subjects                          enable row level security;
alter table public.user_grades                       enable row level security;
alter table public.semester_results                  enable row level security;
alter table public.cgpa_snapshots                    enable row level security;
alter table public.arrears                           enable row level security;
alter table public.notification_sources              enable row level security;
alter table public.notifications                     enable row level security;
alter table public.user_notification_preferences     enable row level security;
alter table public.notes                             enable row level security;
alter table public.screenshot_uploads                enable row level security;
alter table public.target_plans                      enable row level security;

-- ============================================================================
-- profiles — user can SELECT / INSERT / UPDATE only their own row
-- ============================================================================

create policy "profiles_select_own"
    on public.profiles for select
    using (id = auth.uid());

create policy "profiles_insert_own"
    on public.profiles for insert
    with check (id = auth.uid());

create policy "profiles_update_own"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- ============================================================================
-- regulations — publicly readable, admin-only write
-- ============================================================================

create policy "regulations_select_all"
    on public.regulations for select
    using (true);

create policy "regulations_insert_admin"
    on public.regulations for insert
    with check (public.is_admin());

create policy "regulations_update_admin"
    on public.regulations for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "regulations_delete_admin"
    on public.regulations for delete
    using (public.is_admin());

-- ============================================================================
-- degrees — publicly readable, admin-only write
-- ============================================================================

create policy "degrees_select_all"
    on public.degrees for select
    using (true);

create policy "degrees_insert_admin"
    on public.degrees for insert
    with check (public.is_admin());

create policy "degrees_update_admin"
    on public.degrees for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "degrees_delete_admin"
    on public.degrees for delete
    using (public.is_admin());

-- ============================================================================
-- branches — publicly readable, admin-only write
-- ============================================================================

create policy "branches_select_all"
    on public.branches for select
    using (true);

create policy "branches_insert_admin"
    on public.branches for insert
    with check (public.is_admin());

create policy "branches_update_admin"
    on public.branches for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "branches_delete_admin"
    on public.branches for delete
    using (public.is_admin());

-- ============================================================================
-- semesters — publicly readable, admin-only write
-- ============================================================================

create policy "semesters_select_all"
    on public.semesters for select
    using (true);

create policy "semesters_insert_admin"
    on public.semesters for insert
    with check (public.is_admin());

create policy "semesters_update_admin"
    on public.semesters for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "semesters_delete_admin"
    on public.semesters for delete
    using (public.is_admin());

-- ============================================================================
-- subjects — publicly readable, admin-only write
-- ============================================================================

create policy "subjects_select_all"
    on public.subjects for select
    using (true);

create policy "subjects_insert_admin"
    on public.subjects for insert
    with check (public.is_admin());

create policy "subjects_update_admin"
    on public.subjects for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "subjects_delete_admin"
    on public.subjects for delete
    using (public.is_admin());

-- ============================================================================
-- user_grades — user CRUD only their own
-- ============================================================================

create policy "user_grades_select_own"
    on public.user_grades for select
    using (user_id = auth.uid());

create policy "user_grades_insert_own"
    on public.user_grades for insert
    with check (user_id = auth.uid());

create policy "user_grades_update_own"
    on public.user_grades for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "user_grades_delete_own"
    on public.user_grades for delete
    using (user_id = auth.uid());

-- ============================================================================
-- semester_results — user CRUD only their own
-- ============================================================================

create policy "semester_results_select_own"
    on public.semester_results for select
    using (user_id = auth.uid());

create policy "semester_results_insert_own"
    on public.semester_results for insert
    with check (user_id = auth.uid());

create policy "semester_results_update_own"
    on public.semester_results for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "semester_results_delete_own"
    on public.semester_results for delete
    using (user_id = auth.uid());

-- ============================================================================
-- cgpa_snapshots — user CRUD only their own
-- ============================================================================

create policy "cgpa_snapshots_select_own"
    on public.cgpa_snapshots for select
    using (user_id = auth.uid());

create policy "cgpa_snapshots_insert_own"
    on public.cgpa_snapshots for insert
    with check (user_id = auth.uid());

create policy "cgpa_snapshots_update_own"
    on public.cgpa_snapshots for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "cgpa_snapshots_delete_own"
    on public.cgpa_snapshots for delete
    using (user_id = auth.uid());

-- ============================================================================
-- arrears — user CRUD only their own
-- ============================================================================

create policy "arrears_select_own"
    on public.arrears for select
    using (user_id = auth.uid());

create policy "arrears_insert_own"
    on public.arrears for insert
    with check (user_id = auth.uid());

create policy "arrears_update_own"
    on public.arrears for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "arrears_delete_own"
    on public.arrears for delete
    using (user_id = auth.uid());

-- ============================================================================
-- notifications — publicly readable if verified, admin-only write
-- ============================================================================

create policy "notifications_select_verified"
    on public.notifications for select
    using (verified = true or public.is_admin());

create policy "notifications_insert_admin"
    on public.notifications for insert
    with check (public.is_admin());

create policy "notifications_update_admin"
    on public.notifications for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "notifications_delete_admin"
    on public.notifications for delete
    using (public.is_admin());

-- ============================================================================
-- notification_sources — publicly readable, admin-only write
-- ============================================================================

create policy "notification_sources_select_all"
    on public.notification_sources for select
    using (true);

create policy "notification_sources_insert_admin"
    on public.notification_sources for insert
    with check (public.is_admin());

create policy "notification_sources_update_admin"
    on public.notification_sources for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "notification_sources_delete_admin"
    on public.notification_sources for delete
    using (public.is_admin());

-- ============================================================================
-- user_notification_preferences — user CRUD only their own
-- ============================================================================

create policy "user_notif_prefs_select_own"
    on public.user_notification_preferences for select
    using (user_id = auth.uid());

create policy "user_notif_prefs_insert_own"
    on public.user_notification_preferences for insert
    with check (user_id = auth.uid());

create policy "user_notif_prefs_update_own"
    on public.user_notification_preferences for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "user_notif_prefs_delete_own"
    on public.user_notification_preferences for delete
    using (user_id = auth.uid());

-- ============================================================================
-- notes — user CRUD only their own
-- ============================================================================

create policy "notes_select_own"
    on public.notes for select
    using (user_id = auth.uid());

create policy "notes_insert_own"
    on public.notes for insert
    with check (user_id = auth.uid());

create policy "notes_update_own"
    on public.notes for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "notes_delete_own"
    on public.notes for delete
    using (user_id = auth.uid());

-- ============================================================================
-- screenshot_uploads — user CRUD only their own
-- ============================================================================

create policy "screenshot_uploads_select_own"
    on public.screenshot_uploads for select
    using (user_id = auth.uid());

create policy "screenshot_uploads_insert_own"
    on public.screenshot_uploads for insert
    with check (user_id = auth.uid());

create policy "screenshot_uploads_update_own"
    on public.screenshot_uploads for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "screenshot_uploads_delete_own"
    on public.screenshot_uploads for delete
    using (user_id = auth.uid());

-- ============================================================================
-- target_plans — user CRUD only their own
-- ============================================================================

create policy "target_plans_select_own"
    on public.target_plans for select
    using (user_id = auth.uid());

create policy "target_plans_insert_own"
    on public.target_plans for insert
    with check (user_id = auth.uid());

create policy "target_plans_update_own"
    on public.target_plans for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "target_plans_delete_own"
    on public.target_plans for delete
    using (user_id = auth.uid());

-- ============================================================================
-- Storage bucket policies for screenshots (private bucket)
-- Users can only access files in their own folder: screenshots/{auth.uid()}/...
-- ============================================================================

-- Create the private screenshots bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

-- SELECT: user can only read files in their own folder
create policy "screenshots_bucket_select_own"
    on storage.objects for select
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- INSERT: user can only upload to their own folder
create policy "screenshots_bucket_insert_own"
    on storage.objects for insert
    with check (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- UPDATE: user can only update files in their own folder
create policy "screenshots_bucket_update_own"
    on storage.objects for update
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    )
    with check (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- DELETE: user can only delete files in their own folder
create policy "screenshots_bucket_delete_own"
    on storage.objects for delete
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- ============================================================================
-- Done
-- ============================================================================

-- ======================================================================
-- FILE: seed.sql
-- ======================================================================

-- ============================================================================
-- AU Track — Seed Data
-- ============================================================================

-- ============================================================================
-- Regulations
-- ============================================================================

insert into public.regulations (code, name, active) values
    ('R2017', 'Anna University Regulation 2017', true),
    ('R2021', 'Anna University Regulation 2021', true)
on conflict (code) do nothing;

-- ============================================================================
-- Degrees
-- ============================================================================

insert into public.degrees (name, level) values
    ('B.E.', 'UG'),
    ('B.Tech', 'UG'),
    ('M.E.', 'PG'),
    ('M.Tech', 'PG')
on conflict do nothing;

-- ============================================================================
-- Branches
-- Using subqueries to resolve degree_id by name
-- ============================================================================

insert into public.branches (degree_id, code, name, active)
select d.id, x.code, x.name, true
from public.degrees d
join (
    values
        ('B.E.',   'CSE',         'Computer Science and Engineering'),
        ('B.E.',   'IT',          'Information Technology'),
        ('B.E.',   'ECE',         'Electronics and Communication Engineering'),
        ('B.E.',   'EEE',         'Electrical and Electronics Engineering'),
        ('B.E.',   'Mechanical',  'Mechanical Engineering'),
        ('B.E.',   'Civil',       'Civil Engineering'),
        ('B.E.',   'AIDS',        'Artificial Intelligence and Data Science'),
        ('B.E.',   'Biomedical',  'Biomedical Engineering'),
        ('B.E.',   'Aeronautical','Aeronautical Engineering'),
        ('B.E.',   'Chemical',    'Chemical Engineering')
) as x(degree_name, code, name)
on d.name = x.degree_name
on conflict do nothing;

-- ============================================================================
-- Subjects — AIDS R2021 across 8 semesters
-- Realistic Anna University R2021 curriculum for AI & Data Science
-- ============================================================================

-- Resolve regulation and branch IDs once
do $$
declare
    v_reg_id   uuid;
    v_branch_id uuid;
begin
    select id into v_reg_id    from public.regulations where code = 'R2021';
    select id into v_branch_id from public.branches    where code = 'AIDS';

    -- ------------------------------------------------------------------
    -- Semester 1
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 1, 'HS3151',          'Professional English - I',                  3, 'HS',     false, true),
        (v_reg_id, v_branch_id, 1, 'MA3151',          'Matrices and Calculus',                      4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'PH3151',          'Engineering Physics',                        3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'CY3151',          'Engineering Chemistry',                      3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3151',          'Problem Solving and Python Programming',     3, 'ES',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3171',          'Problem Solving and Python Programming Lab', 2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 1, 'BS3171',          'Physics and Chemistry Laboratory',           2, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3152',          'Heritage of Tamils',                         1, 'HS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3172',          'Tamils and Technology',                      1, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 2
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 2, 'HS3251',          'Professional English - II',                  3, 'HS',     false, true),
        (v_reg_id, v_branch_id, 2, 'MA3251',          'Statistics and Numerical Mathematics',       4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 2, 'PH3251',          'Physics for Information Science',            3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 2, 'BE3251',          'Basic Electrical and Electronics Engineering', 3, 'ES',   false, true),
        (v_reg_id, v_branch_id, 2, 'GE3251',          'Engineering Graphics',                       4, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'GE3271',          'Engineering Practices Laboratory',           2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'CS3271',          'Programming in C Laboratory',                2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'GE3252',          'Tamils and Technology',                      1, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 3
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 3, 'MA3351',          'Discrete Mathematics',                       4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 3, 'CS3351',          'Digital Principles and Computer Organization', 3, 'ES',   false, true),
        (v_reg_id, v_branch_id, 3, 'CS3491',          'Theory of Computation',                      3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3301',          'Foundations of Artificial Intelligence',     3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3302',          'Intelligent Systems',                        3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'DS3301',          'Data Structures and Algorithms',             3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'DS3311',          'Data Structures and Algorithms Laboratory',  2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3311',          'Intelligent Systems Laboratory',             2, 'PC',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 4
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 4, 'MA3451',          'Probability and Queueing Models',            4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3401',          'Machine Learning Techniques',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3402',          'Deep Learning',                              3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3401',          'Database Management Systems',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3402',          'Object Oriented Programming',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3411',          'Database Management Systems Laboratory',     2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3411',          'Machine Learning Laboratory',                2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3412',          'Deep Learning Laboratory',                   2, 'PC',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 5
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 5, 'AI3501',          'Natural Language Processing',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3502',          'Computer Vision',                            3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'DS3501',          'Big Data Analytics',                         3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'DS3502',          'Data Warehousing and Data Mining',           3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3503',          'Reinforcement Learning',                     3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 5, 'AI3511',          'Natural Language Processing Laboratory',     2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3512',          'Computer Vision Laboratory',                 2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'GE3451',          'Environmental Sciences and Sustainability',  2, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 6
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 6, 'AI3601',          'Robotics and Automation',                    3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3601',          'Cloud Computing',                            3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3602',          'Information Retrieval and Web Search',       3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'AI3602',          'Fuzzy Logic and Neural Networks',            3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 6, 'DS3603',          'Time Series Analysis and Forecasting',       3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 6, 'AI3611',          'Robotics Laboratory',                        2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3611',          'Cloud Computing Laboratory',                 2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'GE3452',          'Universal Human Values',                     2, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 7
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 7, 'AI3701',          'Generative AI',                              3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'DS3701',          'DevOps and MLOps',                           3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'AI3702',          'Explainable AI',                             3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 7, 'DS3702',          'Blockchain Technologies',                    3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 7, 'AI3711',          'Generative AI Laboratory',                   2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'DS3711',          'MLOps Laboratory',                           2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'GE3791',          'Internship / Industry Project',              3, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 8
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 8, 'AI3801',          'Autonomous Systems',                         3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'DS3801',          'Quantum Computing Foundations',              3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'AI3802',          'Edge AI and IoT',                            3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'GE3811',          'Project Work / Capstone Project',           10, 'HS',     false, true),
        (v_reg_id, v_branch_id, 8, 'GE3821',          'Professional Ethics and Engineering Economics', 2, 'HS',  false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semesters table — 8 semesters for AIDS R2021
    -- ------------------------------------------------------------------
    insert into public.semesters (regulation_id, branch_id, semester_number, total_credits)
    values
        (v_reg_id, v_branch_id, 1, 22),
        (v_reg_id, v_branch_id, 2, 22),
        (v_reg_id, v_branch_id, 3, 23),
        (v_reg_id, v_branch_id, 4, 22),
        (v_reg_id, v_branch_id, 5, 21),
        (v_reg_id, v_branch_id, 6, 21),
        (v_reg_id, v_branch_id, 7, 19),
        (v_reg_id, v_branch_id, 8, 21)
    on conflict do nothing;

end $$;

-- ============================================================================
-- Notification Sources
-- ============================================================================

insert into public.notification_sources (name, url, type, active) values
    ('Anna University Official Website', 'https://www.annauniv.edu', 'university', true),
    ('Anna University COE Portal', 'https://coe1.annauniv.edu', 'examination', true),
    ('Anna University News Portal', 'https://news.annauniv.edu', 'news', true)
on conflict do nothing;

-- ============================================================================
-- Sample Notifications
-- ============================================================================

insert into public.notifications (title, body, source_url, category, degree_filter, branch_filter, published_at, fetched_at, verified)
values
    (
        'Anna University Semester Examination Time Table Released',
        'The Anna University Controller of Examinations has released the end-semester examination time table for all UG and PG programs under R2021 regulation. Students are advised to check the COE portal for their respective schedules.',
        'https://coe1.annauniv.edu',
        'examination',
        null,
        null,
        now() - interval '2 days',
        now() - interval '2 days',
        true
    ),
    (
        'Revaluation Results Published for November 2025 Examinations',
        'Revaluation results for the November 2025 end-semester examinations have been published. Students can check their results on the COE portal using their register number.',
        'https://coe1.annauniv.edu',
        'results',
        null,
        null,
        now() - interval '5 days',
        now() - interval '5 days',
        true
    ),
    (
        'Anna University Campus Placement Drive - TCS, Infosys, and Cognizant',
        'Anna University is organizing a mega campus placement drive with TCS, Infosys, and Cognizant for final year B.E. and B.Tech students. Eligible students must register on the placement portal before the deadline.',
        'https://www.annauniv.edu',
        'placement',
        'B.E.',
        null,
        now() - interval '1 day',
        now() - interval '1 day',
        true
    ),
    (
        'Supplementary Examination Registration Open for Arrear Subjects',
        'Registration for supplementary examinations (arrear exams) is now open. Students with arrears in any semester can register through the COE portal. The last date for registration is 15 days from today.',
        'https://coe1.annauniv.edu',
        'examination',
        null,
        null,
        now() - interval '3 hours',
        now() - interval '3 hours',
        true
    ),
    (
        'New AI & Data Science Elective Courses Announced for R2021',
        'Anna University has announced new elective courses for the AI & Data Science branch under R2021 regulation, including Generative AI, Edge AI, and Quantum Computing Foundations for Semester 7 and 8.',
        'https://www.annauniv.edu',
        'academic',
        'B.E.',
        'AIDS',
        now() - interval '1 week',
        now() - interval '1 week',
        true
    )
on conflict do nothing;

-- ============================================================================
-- Done
-- ============================================================================

-- ======================================================================
-- FILE: policies.sql
-- ======================================================================

-- ============================================================================
-- AU Track — Storage Policies for Screenshots Bucket
-- Private bucket: users can only access files in their own folder
-- Path pattern: screenshots/{auth.uid()}/{filename}
-- ============================================================================

-- Ensure the private screenshots bucket exists
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

-- ============================================================================
-- SELECT — user can only read files in their own folder
-- ============================================================================

create policy "screenshots_select_own"
    on storage.objects for select
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- ============================================================================
-- INSERT — user can only upload to their own folder
-- ============================================================================

create policy "screenshots_insert_own"
    on storage.objects for insert
    with check (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- ============================================================================
-- UPDATE — user can only update files in their own folder
-- ============================================================================

create policy "screenshots_update_own"
    on storage.objects for update
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    )
    with check (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- ============================================================================
-- DELETE — user can only delete files in their own folder
-- ============================================================================

create policy "screenshots_delete_own"
    on storage.objects for delete
    using (
        bucket_id = 'screenshots'
        and storage.foldername(name) = auth.uid()::text
    );

-- ============================================================================
-- Done
-- ============================================================================