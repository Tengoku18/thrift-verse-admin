# Storage Buckets Setup

This guide explains how to set up storage buckets and RLS policies for file uploads.

## Issue

If you encounter the error: `new row violates row-level security policy` when uploading images, it means the storage buckets don't have proper RLS policies configured.

## Solution

You need to apply the storage bucket migration to set up the proper RLS policies.

### Option 1: Using Supabase CLI (Recommended)

1. Make sure you have Supabase CLI installed and linked to your project:
   ```bash
   # Install if not already installed
   npm install -g supabase

   # Link to your project (run from admin directory)
   supabase link --project-ref your-project-ref
   ```

2. Push the migration:
   ```bash
   supabase db push
   ```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of `migrations/20250103000000_setup_storage_buckets_and_policies.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

### Option 3: Apply Specific Migration

If you only want to run this specific migration:

```bash
supabase db push --include-all --include-seed
```

## What This Does

The migration:

1. **Creates storage buckets** (if they don't exist):
   - `products` - for product images
   - `profiles` - for user profile images

2. **Sets up RLS policies** that allow:
   - **Authenticated users** to upload, update, and delete files
   - **Public access** to read/view uploaded files
   - This ensures admins and authenticated users can upload images

## Verification

After applying the migration, test the upload functionality:

1. Try creating a new user with a profile image
2. Try creating a new product with images
3. You should no longer see the RLS policy violation error

## Troubleshooting

### Still getting RLS errors?

1. Verify the migration was applied:
   - Go to Supabase Dashboard → Database → Migrations
   - Check that the migration appears in the list

2. Check bucket existence:
   - Go to Storage in Supabase Dashboard
   - Verify `products` and `profiles` buckets exist
   - Verify they are marked as **Public**

3. Check RLS policies:
   - Go to Database → Policies
   - Filter by `storage.objects`
   - Verify the policies from the migration are listed

### Buckets already exist?

If you get an error about buckets already existing, that's fine! The migration uses `ON CONFLICT DO UPDATE` to handle existing buckets gracefully.

## Security Note

These policies allow:
- Any authenticated user to upload files
- Public read access to all files

This is appropriate for an admin panel where admins manage user data. If you need more restrictive policies (e.g., users can only upload to their own profile), you would need to modify the policies accordingly.
