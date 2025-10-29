-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Admins and store owners can insert products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Admins and store owners can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Admins and store owners can delete products" ON public.products;

-- Disable RLS for products table (since this is an admin panel)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- (Uncomment the lines below and comment out the DISABLE line above)
/*
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all products
CREATE POLICY "Allow authenticated users to view products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update products
CREATE POLICY "Allow authenticated users to update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users to delete products
CREATE POLICY "Allow authenticated users to delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);
*/
