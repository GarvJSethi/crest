-- ============================================================================
-- Migration 00012: Storage Buckets (Product Images)
-- ============================================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup Row Level Security (RLS) policies for the bucket

-- Allow PUBLIC READ access to the 'product-images' bucket
CREATE POLICY "Public Access to product images" 
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow ADMINS to INSERT (upload) new images
CREATE POLICY "Admin Upload to product images" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Allow ADMINS to UPDATE images
CREATE POLICY "Admin Update to product images" 
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Allow ADMINS to DELETE images
CREATE POLICY "Admin Delete to product images" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
