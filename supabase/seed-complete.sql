-- ============================================
-- Complete Seed Data for Visca CRM with Proper Relationships
-- Run this in your Supabase SQL Editor
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM activities WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM campaigns WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM influencers WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM brands WHERE id != '00000000-0000-0000-0000-000000000000';

-- ============================================
-- BRANDS (10 companies that book influencers)
-- ============================================
INSERT INTO brands (name, website, industry, contact_email, contact_phone, notes) VALUES
('Nike Sports', 'https://nike.com', 'Sports & Fashion', 'partnerships@nike.com', '+1-503-671-6453', 'Global sports brand, high budget campaigns'),
('Sephora Beauty', 'https://sephora.com', 'Beauty & Cosmetics', 'influencer@sephora.com', '+1-877-737-4672', 'Beauty retailer, works with beauty influencers'),
('Apple Tech', 'https://apple.com', 'Technology', 'marketing@apple.com', '+1-800-275-2273', 'Premium tech brand, selective partnerships'),
('Fashion Nova', 'https://fashionnova.com', 'Fashion', 'collabs@fashionnova.com', '+1-888-442-5830', 'Fast fashion, high volume campaigns'),
('Gymshark', 'https://gymshark.com', 'Fitness', 'athletes@gymshark.com', '+44-121-820-7575', 'Fitness apparel, athlete partnerships'),
('Daniel Wellington', 'https://danielwellington.com', 'Accessories', 'influencer@dw.com', '+46-8-410-385-30', 'Watches, works with lifestyle influencers'),
('HelloFresh', 'https://hellofresh.com', 'Food', 'partnerships@hellofresh.com', '+1-646-846-3663', 'Meal kits, family-oriented campaigns'),
('Airbnb', 'https://airbnb.com', 'Travel', 'partnerships@airbnb.com', '+1-855-424-7262', 'Travel platform, destination campaigns'),
('Glossier', 'https://glossier.com', 'Beauty', 'gteam@glossier.com', '+1-877-945-6774', 'Millennial beauty brand, authentic content'),
('Spotify', 'https://spotify.com', 'Entertainment', 'creators@spotify.com', '+1-866-679-9129', 'Music streaming, podcast sponsorships');

-- ============================================
-- INFLUENCERS (20 content creators)
-- ============================================
INSERT INTO influencers (name, email, phone, instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, niche, status, notes) VALUES
-- Mega Influencers (1M+ followers)
('Emma Rodriguez', 'emma@email.com', '+1-310-555-0101', '@emmarodriguez', 2500000, '@emmarodriguez', 1800000, ARRAY['fashion', 'lifestyle'], 'active', 'Top fashion influencer, 15% engagement rate'),
('James Mitchell', 'james@email.com', '+1-415-555-0102', '@jamesmitchell', 1800000, '@jamesmitchell', 2200000, ARRAY['fitness', 'health'], 'active', 'Fitness coach, protein brand ambassador'),
('Isabella Martinez', 'isabella@email.com', '+1-323-555-0105', '@isabellamartinez', 1200000, '@isabellamartinez', 950000, ARRAY['fashion', 'luxury'], 'active', 'Luxury fashion, works with high-end brands'),

-- Macro Influencers (100K-1M followers)
('Sophia Chen', 'sophia@email.com', '+1-212-555-0103', '@sophiachen', 890000, '@sophiachen', 1200000, ARRAY['beauty', 'skincare'], 'active', 'Beauty guru, skincare specialist'),
('Michael Johnson', 'michael@email.com', '+1-305-555-0104', '@michaeljtech', 650000, '@michaeljtech', 980000, ARRAY['tech', 'gaming'], 'active', 'Tech reviewer, honest reviews'),
('Ava Wilson', 'ava@email.com', '+1-404-555-0204', '@avawilson', 520000, '@avawilson', 680000, ARRAY['fashion', 'sustainable'], 'active', 'Eco-fashion advocate'),
('David Park', 'david@email.com', '+1-206-555-0201', '@davidpark', 450000, '@davidparkfood', 380000, ARRAY['food', 'cooking'], 'negotiating', 'Celebrity chef, cookbook author'),
('Olivia Thompson', 'olivia@email.com', '+1-617-555-0202', '@oliviathompson', 320000, '@oliviathompson', 410000, ARRAY['travel', 'photography'], 'active', 'Travel photographer, 50+ countries'),
('Ryan Garcia', 'ryan@email.com', '+1-512-555-0203', '@ryangarcia', 280000, '@ryangarciafit', 350000, ARRAY['fitness', 'sports'], 'active', 'CrossFit athlete, nutrition expert'),
('Nathan Brown', 'nathan@email.com', '+1-602-555-0205', '@nathanbrown', 180000, '@nathanbrownmusic', 220000, ARRAY['music', 'lifestyle'], 'contacted', 'Indie musician, festival performer'),

-- Micro Influencers (10K-100K followers)
('Sarah Kim', 'sarah@email.com', '+1-408-555-0301', '@sarahkimstyle', 85000, '@sarahkimstyle', 120000, ARRAY['fashion', 'minimalist'], 'active', 'Minimalist fashion, capsule wardrobes'),
('Chloe Davis', 'chloe@email.com', '+1-702-555-0305', '@chloedavis', 95000, '@chloedavisart', 130000, ARRAY['art', 'diy'], 'active', 'DIY content, home decor'),
('Maya Patel', 'maya@email.com', '+1-214-555-0303', '@mayapatel', 78000, '@mayapatelbeauty', 110000, ARRAY['beauty', 'tutorials'], 'active', 'Makeup tutorials, bridal specialist'),
('Alex Turner', 'alex@email.com', '+1-503-555-0302', '@alexturner', 62000, '@alexturnereats', 95000, ARRAY['food', 'vegan'], 'negotiating', 'Plant-based recipes'),
('Zoe Taylor', 'zoe@email.com', '+1-813-555-0404', '@zoetaylor', 52000, '@zoetaylorfashion', 68000, ARRAY['fashion', 'vintage'], 'active', 'Vintage fashion, thrift finds'),
('Lucas Anderson', 'lucas@email.com', '+1-303-555-0304', '@lucasanderson', 42000, '@lucasandersonfit', 58000, ARRAY['fitness', 'yoga'], 'contacted', 'Yoga instructor, wellness coach'),
('Marcus White', 'marcus@email.com', '+1-330-555-0405', '@marcuswhite', 37000, '@marcuswhitetech', 48000, ARRAY['tech', 'coding'], 'active', 'Coding tutorials, bootcamp instructor'),

-- Nano Influencers (1K-10K followers) & New
('Rachel Green', 'rachel@email.com', '+1-916-555-0402', '@rachelgreen', 31000, '@rachelgreencooks', 42000, ARRAY['food', 'baking'], 'new', 'Pastry chef, recipe developer'),
('Jordan Lee', 'jordan@email.com', '+1-619-555-0401', '@jordanlee', 28000, '@jordanleetravel', 35000, ARRAY['travel', 'budget'], 'new', 'Budget travel tips'),
('Tyler Martinez', 'tyler@email.com', '+1-480-555-0403', '@tylermartinez', 19000, '@tylermartinezgaming', 45000, ARRAY['gaming', 'esports'], 'inactive', 'Former esports player');

-- ============================================
-- CAMPAIGNS (Brands booking Influencers)
-- Each campaign = one brand working with one influencer
-- ============================================

-- Get brand and influencer IDs for campaigns
WITH brand_ids AS (
  SELECT id, name FROM brands
),
influencer_ids AS (
  SELECT id, name FROM influencers
)

-- Insert multiple campaigns showing various brand-influencer relationships
INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, actual_cost, target_views, actual_views, notes)
VALUES
-- Nike campaigns (working with multiple fitness influencers)
((SELECT id FROM brand_ids WHERE name = 'Nike Sports'), 
 (SELECT id FROM influencer_ids WHERE name = 'James Mitchell'),
 'Nike Summer Fitness Challenge 2024', 'active', '2024-02-01', '2024-04-30', 
 75000, 72000, 1500000, 1420000, 
 'Q1 fitness campaign, 3 posts per week, Instagram + TikTok'),

((SELECT id FROM brand_ids WHERE name = 'Nike Sports'), 
 (SELECT id FROM influencer_ids WHERE name = 'Ryan Garcia'),
 'Nike CrossFit Series 2024', 'active', '2024-03-01', '2024-05-31', 
 45000, NULL, 800000, NULL, 
 'CrossFit focused content, workout videos'),

((SELECT id FROM brand_ids WHERE name = 'Nike Sports'), 
 (SELECT id FROM influencer_ids WHERE name = 'Lucas Anderson'),
 'Nike Yoga Collection Launch', 'planned', '2024-04-01', '2024-06-30', 
 25000, NULL, 400000, NULL, 
 'Yoga wear launch, mindfulness content'),

-- Fashion Nova campaigns (multiple fashion influencers)
((SELECT id FROM brand_ids WHERE name = 'Fashion Nova'), 
 (SELECT id FROM influencer_ids WHERE name = 'Emma Rodriguez'),
 'Fashion Nova Spring Collection 2024', 'completed', '2024-01-01', '2024-02-28', 
 120000, 115000, 3000000, 3250000, 
 'Major spring campaign, exceeded targets by 8%'),

((SELECT id FROM brand_ids WHERE name = 'Fashion Nova'), 
 (SELECT id FROM influencer_ids WHERE name = 'Isabella Martinez'),
 'Fashion Nova Luxury Line', 'active', '2024-02-15', '2024-04-15', 
 85000, 80000, 1800000, 1650000, 
 'Premium collection, high-end positioning'),

((SELECT id FROM brand_ids WHERE name = 'Fashion Nova'), 
 (SELECT id FROM influencer_ids WHERE name = 'Ava Wilson'),
 'Fashion Nova Sustainable Collection', 'active', '2024-03-01', '2024-05-31', 
 55000, NULL, 1200000, NULL, 
 'Eco-friendly line, sustainability focus'),

-- Sephora beauty campaigns
((SELECT id FROM brand_ids WHERE name = 'Sephora Beauty'), 
 (SELECT id FROM influencer_ids WHERE name = 'Sophia Chen'),
 'Sephora K-Beauty Festival', 'active', '2024-02-01', '2024-03-31', 
 65000, 62000, 1500000, 1480000, 
 'Korean beauty products, tutorial series'),

((SELECT id FROM brand_ids WHERE name = 'Sephora Beauty'), 
 (SELECT id FROM influencer_ids WHERE name = 'Maya Patel'),
 'Sephora Bridal Beauty Series', 'planned', '2024-04-01', '2024-06-30', 
 35000, NULL, 600000, NULL, 
 'Wedding season campaign, bridal makeup tutorials'),

-- Gymshark fitness partnerships
((SELECT id FROM brand_ids WHERE name = 'Gymshark'), 
 (SELECT id FROM influencer_ids WHERE name = 'James Mitchell'),
 'Gymshark Athlete Partnership Q1-Q2', 'active', '2024-01-01', '2024-06-30', 
 150000, 75000, 4000000, 2100000, 
 'Long-term athlete sponsorship, exclusive collection'),

((SELECT id FROM brand_ids WHERE name = 'Gymshark'), 
 (SELECT id FROM influencer_ids WHERE name = 'Ryan Garcia'),
 'Gymshark CrossFit Games 2024', 'planned', '2024-05-01', '2024-08-31', 
 60000, NULL, 1200000, NULL, 
 'CrossFit Games sponsorship, competition coverage'),

-- Apple tech reviews
((SELECT id FROM brand_ids WHERE name = 'Apple Tech'), 
 (SELECT id FROM influencer_ids WHERE name = 'Michael Johnson'),
 'iPhone 15 Pro Max Review Campaign', 'completed', '2023-09-15', '2023-10-31', 
 95000, 95000, 2500000, 3100000, 
 'Product launch review, unboxing + long-term review'),

((SELECT id FROM brand_ids WHERE name = 'Apple Tech'), 
 (SELECT id FROM influencer_ids WHERE name = 'Marcus White'),
 'Apple Developer Series', 'active', '2024-02-01', '2024-12-31', 
 120000, 20000, 1500000, 250000, 
 'Year-long developer content, Swift tutorials'),

-- HelloFresh food campaigns
((SELECT id FROM brand_ids WHERE name = 'HelloFresh'), 
 (SELECT id FROM influencer_ids WHERE name = 'David Park'),
 'HelloFresh Chef Collaboration', 'negotiating', '2024-04-01', '2024-09-30', 
 80000, NULL, 1800000, NULL, 
 'Celebrity chef recipes, exclusive meal plans'),

((SELECT id FROM brand_ids WHERE name = 'HelloFresh'), 
 (SELECT id FROM influencer_ids WHERE name = 'Alex Turner'),
 'HelloFresh Vegan Box Launch', 'planned', '2024-03-15', '2024-05-15', 
 40000, NULL, 700000, NULL, 
 'Plant-based meal kit promotion'),

-- Airbnb travel campaigns
((SELECT id FROM brand_ids WHERE name = 'Airbnb'), 
 (SELECT id FROM influencer_ids WHERE name = 'Olivia Thompson'),
 'Airbnb Hidden Gems Europe', 'completed', '2023-06-01', '2023-08-31', 
 85000, 82000, 2000000, 2350000, 
 'European summer destinations, 15 properties featured'),

((SELECT id FROM brand_ids WHERE name = 'Airbnb'), 
 (SELECT id FROM influencer_ids WHERE name = 'Jordan Lee'),
 'Airbnb Budget Travel Series', 'planned', '2024-05-01', '2024-07-31', 
 25000, NULL, 400000, NULL, 
 'Affordable travel destinations, tips for saving'),

-- Daniel Wellington accessories
((SELECT id FROM brand_ids WHERE name = 'Daniel Wellington'), 
 (SELECT id FROM influencer_ids WHERE name = 'Sarah Kim'),
 'DW Minimalist Collection', 'active', '2024-02-14', '2024-04-30', 
 30000, 28000, 500000, 480000, 
 'Minimalist watch collection, lifestyle content'),

-- Glossier beauty
((SELECT id FROM brand_ids WHERE name = 'Glossier'), 
 (SELECT id FROM influencer_ids WHERE name = 'Chloe Davis'),
 'Glossier G Suit Launch', 'completed', '2024-01-15', '2024-02-29', 
 45000, 43000, 800000, 920000, 
 'New product line launch, DIY beauty content'),

-- Spotify entertainment
((SELECT id FROM brand_ids WHERE name = 'Spotify'), 
 (SELECT id FROM influencer_ids WHERE name = 'Nathan Brown'),
 'Spotify Indie Artist Spotlight', 'contacted', '2024-04-01', '2024-06-30', 
 35000, NULL, 600000, NULL, 
 'Playlist curation, behind-the-scenes content'),

-- Multi-influencer campaign example
((SELECT id FROM brand_ids WHERE name = 'Fashion Nova'), 
 (SELECT id FROM influencer_ids WHERE name = 'Zoe Taylor'),
 'Fashion Nova Vintage Revival', 'active', '2024-03-15', '2024-05-15', 
 28000, 25000, 450000, 410000, 
 'Vintage-inspired collection, thrift vs new comparisons');

-- ============================================
-- ACTIVITIES (Interaction history)
-- ============================================
WITH user_id AS (
  SELECT id FROM profiles LIMIT 1
),
inf_ids AS (
  SELECT id, name FROM influencers
)

INSERT INTO activities (influencer_id, user_id, activity_type, description)
VALUES
-- Emma Rodriguez activities
((SELECT id FROM inf_ids WHERE name = 'Emma Rodriguez'), (SELECT id FROM user_id),
 'contract_signed', 'Signed Fashion Nova Spring 2024 contract - $120,000 campaign'),
((SELECT id FROM inf_ids WHERE name = 'Emma Rodriguez'), (SELECT id FROM user_id),
 'content_received', 'Received 15 posts for Fashion Nova campaign, all approved'),
((SELECT id FROM inf_ids WHERE name = 'Emma Rodriguez'), (SELECT id FROM user_id),
 'payment_sent', 'Final payment processed for Fashion Nova - $115,000'),

-- James Mitchell activities
((SELECT id FROM inf_ids WHERE name = 'James Mitchell'), (SELECT id FROM user_id),
 'meeting_scheduled', 'Nike campaign kickoff meeting - Monday 2pm PT'),
((SELECT id FROM inf_ids WHERE name = 'James Mitchell'), (SELECT id FROM user_id),
 'contract_signed', 'Gymshark athlete partnership agreement signed'),

-- Sophia Chen activities
((SELECT id FROM inf_ids WHERE name = 'Sophia Chen'), (SELECT id FROM user_id),
 'email_sent', 'Sent Sephora campaign brief and content calendar'),
((SELECT id FROM inf_ids WHERE name = 'Sophia Chen'), (SELECT id FROM user_id),
 'content_approved', 'Approved 5 K-Beauty tutorial videos'),

-- Michael Johnson activities
((SELECT id FROM inf_ids WHERE name = 'Michael Johnson'), (SELECT id FROM user_id),
 'call_made', 'Follow-up call about Apple Developer Series'),
((SELECT id FROM inf_ids WHERE name = 'Michael Johnson'), (SELECT id FROM user_id),
 'negotiating', 'Negotiating rates for Q2 2024 tech reviews'),

-- New influencer outreach
((SELECT id FROM inf_ids WHERE name = 'David Park'), (SELECT id FROM user_id),
 'email_sent', 'Initial outreach for HelloFresh partnership'),
((SELECT id FROM inf_ids WHERE name = 'Nathan Brown'), (SELECT id FROM user_id),
 'call_made', 'Discovery call for Spotify collaboration'),
((SELECT id FROM inf_ids WHERE name = 'Jordan Lee'), (SELECT id FROM user_id),
 'email_sent', 'Sent Airbnb campaign proposal');

-- ============================================
-- Summary Query to Verify Data
-- ============================================
SELECT 
  'Data Successfully Loaded!' as status,
  (SELECT COUNT(*) FROM brands) as total_brands,
  (SELECT COUNT(*) FROM influencers) as total_influencers,
  (SELECT COUNT(*) FROM campaigns) as total_campaigns,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'completed') as completed_campaigns,
  (SELECT COUNT(*) FROM activities) as total_activities;