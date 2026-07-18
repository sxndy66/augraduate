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