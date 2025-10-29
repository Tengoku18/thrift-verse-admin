-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products', 'products', true),
  ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their uploads in products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their uploads in products" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their uploads in profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their uploads in profiles" ON storage.objects;

-- Products bucket policies
-- Allow authenticated users to upload to products bucket
CREATE POLICY "Allow authenticated users to upload products"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow public read access to products
CREATE POLICY "Allow public read access to products"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update their uploads in products"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete their uploads in products"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Profiles bucket policies
-- Allow authenticated users to upload to profiles bucket
CREATE POLICY "Allow authenticated users to upload profiles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- Allow public read access to profiles
CREATE POLICY "Allow public read access to profiles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update their uploads in profiles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete their uploads in profiles"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');
