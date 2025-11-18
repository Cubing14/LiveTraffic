-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Incident photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload incident photos" ON storage.objects;

-- Create correct storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Create storage policies for incident photos
CREATE POLICY "Incident photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'incident-photos');

CREATE POLICY "Authenticated users can upload incident photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'incident-photos' AND 
  auth.role() = 'authenticated'
);