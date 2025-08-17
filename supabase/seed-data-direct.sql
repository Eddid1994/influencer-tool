-- ============================================
-- Direct Seed Data for Visca CRM
-- Run this in your Supabase SQL Editor
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM activities WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM campaigns WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM influencers WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM brands WHERE id != '00000000-0000-0000-0000-000000000000';

-- Insert Brands
INSERT INTO brands (name, website, industry, contact_email, contact_phone, notes) VALUES
('Nike Sports', 'https://nike.com', 'Sports & Fashion', 'partnerships@nike.com', '+1-503-671-6453', 'Global sports brand'),
('Sephora Beauty', 'https://sephora.com', 'Beauty & Cosmetics', 'influencer@sephora.com', '+1-877-737-4672', 'Beauty retailer'),
('Apple Tech', 'https://apple.com', 'Technology', 'marketing@apple.com', '+1-800-275-2273', 'Tech brand'),
('Fashion Nova', 'https://fashionnova.com', 'Fashion', 'collabs@fashionnova.com', '+1-888-442-5830', 'Fast fashion'),
('Gymshark', 'https://gymshark.com', 'Fitness', 'athletes@gymshark.com', '+44-121-820-7575', 'Fitness apparel'),
('Daniel Wellington', 'https://danielwellington.com', 'Accessories', 'influencer@dw.com', '+46-8-410-385-30', 'Watches'),
('HelloFresh', 'https://hellofresh.com', 'Food', 'partnerships@hellofresh.com', '+1-646-846-3663', 'Meal kits'),
('Airbnb', 'https://airbnb.com', 'Travel', 'partnerships@airbnb.com', '+1-855-424-7262', 'Travel platform'),
('Glossier', 'https://glossier.com', 'Beauty', 'gteam@glossier.com', '+1-877-945-6774', 'Beauty brand'),
('Spotify', 'https://spotify.com', 'Entertainment', 'creators@spotify.com', '+1-866-679-9129', 'Music streaming');

-- Insert Influencers
INSERT INTO influencers (name, email, phone, instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, niche, status, notes) VALUES
('Emma Rodriguez', 'emma@email.com', '+1-310-555-0101', '@emmarodriguez', 2500000, '@emmarodriguez', 1800000, ARRAY['fashion', 'lifestyle'], 'active', 'Top fashion influencer'),
('James Mitchell', 'james@email.com', '+1-415-555-0102', '@jamesmitchell', 1800000, '@jamesmitchell', 2200000, ARRAY['fitness', 'health'], 'active', 'Fitness coach'),
('Sophia Chen', 'sophia@email.com', '+1-212-555-0103', '@sophiachen', 890000, '@sophiachen', 1200000, ARRAY['beauty', 'skincare'], 'active', 'Beauty guru'),
('Michael Johnson', 'michael@email.com', '+1-305-555-0104', '@michaeljtech', 650000, '@michaeljtech', 980000, ARRAY['tech', 'gaming'], 'negotiating', 'Tech reviewer'),
('Isabella Martinez', 'isabella@email.com', '+1-323-555-0105', '@isabellamartinez', 1200000, '@isabellamartinez', 950000, ARRAY['fashion', 'luxury'], 'active', 'Luxury fashion'),
('David Park', 'david@email.com', '+1-206-555-0201', '@davidpark', 450000, '@davidparkfood', 380000, ARRAY['food', 'cooking'], 'active', 'Food blogger'),
('Olivia Thompson', 'olivia@email.com', '+1-617-555-0202', '@oliviathompson', 320000, '@oliviathompson', 410000, ARRAY['travel', 'photography'], 'contacted', 'Travel photographer'),
('Ryan Garcia', 'ryan@email.com', '+1-512-555-0203', '@ryangarcia', 280000, '@ryangarciafit', 350000, ARRAY['fitness', 'sports'], 'active', 'CrossFit athlete'),
('Ava Wilson', 'ava@email.com', '+1-404-555-0204', '@avawilson', 520000, '@avawilson', 680000, ARRAY['fashion', 'sustainable'], 'active', 'Sustainable fashion'),
('Nathan Brown', 'nathan@email.com', '+1-602-555-0205', '@nathanbrown', 180000, '@nathanbrownmusic', 220000, ARRAY['music', 'lifestyle'], 'new', 'Musician'),
('Sarah Kim', 'sarah@email.com', '+1-408-555-0301', '@sarahkimstyle', 85000, '@sarahkimstyle', 120000, ARRAY['fashion', 'minimalist'], 'active', 'Minimalist fashion'),
('Alex Turner', 'alex@email.com', '+1-503-555-0302', '@alexturner', 62000, '@alexturnereats', 95000, ARRAY['food', 'vegan'], 'active', 'Vegan blogger'),
('Maya Patel', 'maya@email.com', '+1-214-555-0303', '@mayapatel', 78000, '@mayapatelbeauty', 110000, ARRAY['beauty', 'tutorials'], 'negotiating', 'Beauty tutorials'),
('Lucas Anderson', 'lucas@email.com', '+1-303-555-0304', '@lucasanderson', 42000, '@lucasandersonfit', 58000, ARRAY['fitness', 'yoga'], 'contacted', 'Yoga instructor'),
('Chloe Davis', 'chloe@email.com', '+1-702-555-0305', '@chloedavis', 95000, '@chloedavisart', 130000, ARRAY['art', 'diy'], 'active', 'DIY creator'),
('Jordan Lee', 'jordan@email.com', '+1-619-555-0401', '@jordanlee', 28000, '@jordanleetravel', 35000, ARRAY['travel', 'budget'], 'new', 'Budget travel'),
('Rachel Green', 'rachel@email.com', '+1-916-555-0402', '@rachelgreen', 31000, '@rachelgreencooks', 42000, ARRAY['food', 'baking'], 'new', 'Pastry chef'),
('Tyler Martinez', 'tyler@email.com', '+1-480-555-0403', '@tylermartinez', 19000, '@tylermartinezgaming', 45000, ARRAY['gaming', 'esports'], 'contacted', 'Gaming streamer'),
('Zoe Taylor', 'zoe@email.com', '+1-813-555-0404', '@zoetaylor', 52000, '@zoetaylorfashion', 68000, ARRAY['fashion', 'vintage'], 'inactive', 'Vintage fashion'),
('Marcus White', 'marcus@email.com', '+1-330-555-0405', '@marcuswhite', 37000, '@marcuswhitetech', 48000, ARRAY['tech', 'coding'], 'rejected', 'Tech educator');

-- Create campaigns (with subqueries to get IDs)
INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, actual_cost, target_views, actual_views, notes)
SELECT 
  b.id,
  i.id,
  'Nike Summer Fitness 2024',
  'active',
  '2024-02-01',
  '2024-04-30',
  50000,
  45000,
  1000000,
  850000,
  'Fitness campaign'
FROM brands b, influencers i
WHERE b.name = 'Nike Sports' AND i.name = 'James Mitchell';

INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, target_views, notes)
SELECT 
  b.id,
  i.id,
  'Sephora Spring Beauty',
  'active',
  '2024-02-15',
  '2024-05-15',
  35000,
  750000,
  'Beauty campaign'
FROM brands b, influencers i
WHERE b.name = 'Sephora Beauty' AND i.name = 'Sophia Chen';

INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, actual_cost, target_views, actual_views, notes)
SELECT 
  b.id,
  i.id,
  'Fashion Nova Collection',
  'completed',
  '2024-01-01',
  '2024-01-31',
  75000,
  70000,
  2000000,
  2150000,
  'Fashion campaign'
FROM brands b, influencers i
WHERE b.name = 'Fashion Nova' AND i.name = 'Emma Rodriguez';

-- Show summary of inserted data
SELECT 
  (SELECT COUNT(*) FROM brands) as total_brands,
  (SELECT COUNT(*) FROM influencers) as total_influencers,
  (SELECT COUNT(*) FROM campaigns) as total_campaigns;