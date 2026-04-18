-- RLS Policies for gallery-images bucket

-- 1. Allow authenticated users to upload files to their own couple's directory
create policy "Users can upload gallery images to their couple directory"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery-images' AND
  (storage.foldername(name))[1] = 'couples' AND
  exists (
    select 1 from public.couple_members
    where couple_id::text = (storage.foldername(name))[2]
    and profile_id = auth.uid()
  )
);

-- 2. Allow authenticated users to view files from their own couple's directory
create policy "Users can view their couple's gallery images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'gallery-images' AND
  (storage.foldername(name))[1] = 'couples' AND
  exists (
    select 1 from public.couple_members
    where couple_id::text = (storage.foldername(name))[2]
    and profile_id = auth.uid()
  )
);

-- 3. Allow users to delete their own couple's images
create policy "Users can delete their couple's gallery images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery-images' AND
  (storage.foldername(name))[1] = 'couples' AND
  exists (
    select 1 from public.couple_members
    where couple_id::text = (storage.foldername(name))[2]
    and profile_id = auth.uid()
  )
);

-- 4. Allow users to update their own couple's images (e.g. for upsert)
create policy "Users can update their couple's gallery images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gallery-images' AND
  (storage.foldername(name))[1] = 'couples' AND
  exists (
    select 1 from public.couple_members
    where couple_id::text = (storage.foldername(name))[2]
    and profile_id = auth.uid()
  )
);
