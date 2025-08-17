-- Add missing columns to brands table
-- Run this in Supabase SQL Editor before running the Node.js script

-- Add address column
ALTER TABLE brands ADD COLUMN IF NOT EXISTS address text;

-- Add social media URL columns  
ALTER TABLE brands ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS youtube_url text;

-- Add updated_at column
ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Add trigger for updated_at column
CREATE TRIGGER IF NOT EXISTS update_brands_updated_at 
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the new structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'brands' 
AND table_schema = 'public'
ORDER BY ordinal_position;