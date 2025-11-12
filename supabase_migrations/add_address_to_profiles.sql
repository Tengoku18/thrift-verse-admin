-- Migration: Add address column to profiles table
-- This migration adds a mandatory address field to the profiles table
-- without altering any existing data by providing a default value

-- Step 1: Add the address column with a default value for existing rows
ALTER TABLE profiles
ADD COLUMN address TEXT NOT NULL DEFAULT 'Address not provided';

-- Step 2: Update the default constraint to remove the default for new inserts
-- This ensures new users must provide an address, but existing users have the placeholder
ALTER TABLE profiles
ALTER COLUMN address DROP DEFAULT;

-- Optional: Add a check constraint to ensure minimum address length (10 characters)
ALTER TABLE profiles
ADD CONSTRAINT address_length_check CHECK (char_length(address) >= 10);

-- Note: Existing rows with 'Address not provided' (27 characters) will satisfy the constraint
-- New rows will need to provide addresses with at least 10 characters as per application validation
