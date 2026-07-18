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