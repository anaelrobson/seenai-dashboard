-- Storage policies for the "videos" bucket

create policy "Authenticated upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'videos'
    and auth.uid() = owner
    and name like (auth.uid() || '/%')
  );

create policy "Read own files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'videos'
    and auth.uid() = owner
    and name like (auth.uid() || '/%')
  );
