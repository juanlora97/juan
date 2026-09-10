/*
# Create storage bucket for portfolio images

1. Storage
- Creates a private bucket `portfolio-images` to store all portfolio photos.
- The bucket is private so images are served via signed URLs.

2. Security
- Storage policies allow authenticated users to upload, read, update, and delete images.
- Public users can read images from the bucket (for displaying on the public site).

3. Important Notes
- This migration is safe to re-run.
*/

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read portfolio images" ON storage.objects;
CREATE POLICY "Public can read portfolio images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Authenticated can upload portfolio images" ON storage.objects;
CREATE POLICY "Authenticated can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Authenticated can update portfolio images" ON storage.objects;
CREATE POLICY "Authenticated can update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Authenticated can delete portfolio images" ON storage.objects;
CREATE POLICY "Authenticated can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images');
