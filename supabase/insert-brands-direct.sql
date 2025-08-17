-- Run this SQL directly in your Supabase SQL Editor
-- This bypasses RLS policies

-- First, check if the additional columns exist and add them if not
ALTER TABLE brands ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- Insert the new brands
INSERT INTO brands (name, industry, notes, created_at) VALUES
  ('Bauhaus', 'Home Improvement', 'German home improvement and gardening retailer', NOW()),
  ('Zahnheld', 'Healthcare', 'Dental care and oral health products', NOW()),
  ('Vonmählen', 'Tech Accessories', 'Premium tech accessories and lifestyle products', NOW()),
  ('305 Care', 'Beauty & Personal Care', 'Personal care and wellness products', NOW()),
  ('TerraCanis', 'Pet Food', 'Premium natural pet food and nutrition', NOW()),
  ('Maica (IOS Suit)', 'Fashion Tech', 'Smart fashion and wearable technology', NOW()),
  ('Lotto24', 'Gaming & Lottery', 'Online lottery platform', NOW()),
  ('ImmoScout24', 'Real Estate', 'Leading real estate marketplace in Germany', NOW()),
  ('Ethernal (Kiki Koala)', 'Children Products', 'Sustainable children products and toys', NOW()),
  ('Rudelkönig', 'Pet Products', 'Pet accessories and lifestyle products', NOW()),
  ('Hydraid', 'Sports & Hydration', 'Hydration and sports nutrition products', NOW()),
  ('GirlGotLashes', 'Beauty', 'Lash and beauty products', NOW()),
  ('IEA Medical', 'Medical Devices', 'Medical equipment and healthcare solutions', NOW()),
  ('Farben Löwe', 'Paint & Coatings', 'Professional paint and coating products', NOW()),
  ('Valktental', 'Outdoor & Sports', 'Outdoor gear and sporting equipment', NOW()),
  ('Kulturwerke', 'Arts & Culture', 'Cultural events and creative services', NOW())
ON CONFLICT (name) DO NOTHING;

-- Show the newly added brands
SELECT id, name, industry, created_at 
FROM brands 
WHERE name IN (
  'Bauhaus', 'Zahnheld', 'Vonmählen', '305 Care', 'TerraCanis', 
  'Maica (IOS Suit)', 'Lotto24', 'ImmoScout24', 'Ethernal (Kiki Koala)', 
  'Rudelkönig', 'Hydraid', 'GirlGotLashes', 'IEA Medical', 
  'Farben Löwe', 'Valktental', 'Kulturwerke'
)
ORDER BY created_at DESC;