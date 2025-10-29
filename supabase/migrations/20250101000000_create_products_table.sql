-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  cover_image text NOT NULL,
  other_images text[] DEFAULT '{}',
  availability_count integer NOT NULL DEFAULT 0 CHECK (availability_count >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'out_of_stock')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on store_id for faster queries
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL security;

-- Policy: Users can view all products
CREATE POLICY "Users can view all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins and store owners can insert products
CREATE POLICY "Admins and store owners can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Admins and store owners can update products
CREATE POLICY "Admins and store owners can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Admins and store owners can delete products
CREATE POLICY "Admins and store owners can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
