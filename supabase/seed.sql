-- Seed Data for Visca CRM
-- This script populates your database with sample data for testing

-- ============================================
-- SAMPLE BRANDS
-- ============================================
INSERT INTO brands (name, website, industry, contact_email, contact_phone, notes) VALUES
('Nike', 'https://nike.com', 'Sports & Fashion', 'partnerships@nike.com', '+1-503-671-6453', 'Global sports brand, interested in fitness influencers'),
('Sephora', 'https://sephora.com', 'Beauty', 'influencer@sephora.com', '+1-877-737-4672', 'Beauty retailer, frequent collaborations'),
('Apple', 'https://apple.com', 'Technology', 'marketing@apple.com', '+1-800-275-2273', 'Tech giant, selective partnerships'),
('Revolve', 'https://revolve.com', 'Fashion', 'collabs@revolve.com', '+1-888-442-5830', 'Online fashion retailer, works with lifestyle influencers'),
('Gymshark', 'https://gymshark.com', 'Fitness', 'athletes@gymshark.com', '+44-121-820-7575', 'Fitness apparel, ambassador program'),
('Daniel Wellington', 'https://danielwellington.com', 'Accessories', 'influencer@danielwellington.com', '+46-8-410-385-30', 'Watch brand, micro-influencer friendly'),
('HelloFresh', 'https://hellofresh.com', 'Food & Beverage', 'partnerships@hellofresh.com', '+1-646-846-3663', 'Meal kit delivery, lifestyle partnerships'),
('Airbnb', 'https://airbnb.com', 'Travel', 'partnerships@airbnb.com', '+1-855-424-7262', 'Travel accommodation, travel influencers'),
('Glossier', 'https://glossier.com', 'Beauty', 'gteam@glossier.com', '+1-877-945-6774', 'Beauty brand, authentic content focus'),
('Spotify', 'https://spotify.com', 'Entertainment', 'creators@spotify.com', '+1-866-679-9129', 'Music streaming, podcast partnerships');

-- ============================================
-- SAMPLE INFLUENCERS
-- ============================================
INSERT INTO influencers (name, email, phone, instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, youtube_handle, youtube_subscribers, niche, status, notes) VALUES
-- Fashion & Lifestyle Influencers
('Emma Chamberlain', 'emma@chamberlain.com', '+1-310-555-0101', '@emmachamberlain', 16000000, '@emmachamberlain', 10500000, '@emmachamberlain', 12000000, ARRAY['lifestyle', 'fashion', 'coffee'], 'active', 'Gen Z icon, authentic content creator'),
('Chiara Ferragni', 'chiara@theblondesalad.com', '+39-02-555-0102', '@chiaraferragni', 29000000, NULL, NULL, '@chiaraferragni', 1850000, ARRAY['fashion', 'luxury', 'lifestyle'], 'active', 'Fashion blogger turned entrepreneur'),
('Aimee Song', 'aimee@songofstyle.com', '+1-323-555-0103', '@aimeesong', 7000000, '@aimeesong', 500000, '@songofstyle', 380000, ARRAY['fashion', 'interior', 'travel'], 'active', 'Fashion blogger, interior designer'),

-- Beauty Influencers
('James Charles', 'james@jamescharles.com', '+1-518-555-0201', '@jamescharles', 22600000, '@jamescharles', 38000000, '@jamescharles', 23900000, ARRAY['beauty', 'makeup'], 'active', 'MUA, beauty guru'),
('Huda Kattan', 'huda@hudabeauty.com', '+971-4-555-0202', '@hudabeauty', 52000000, '@hudabeauty', 8000000, '@hudabeauty', 4100000, ARRAY['beauty', 'makeup', 'business'], 'active', 'Beauty mogul, Huda Beauty founder'),
('Jackie Aina', 'jackie@jackieaina.com', '+1-626-555-0203', '@jackieaina', 1700000, '@jackieaina', 1200000, '@jackieaina', 3500000, ARRAY['beauty', 'lifestyle'], 'negotiating', 'Beauty influencer, diversity advocate'),

-- Fitness Influencers
('Chloe Ting', 'chloe@chloeting.com', '+61-3-555-0301', '@chloe_t', 3000000, '@chloe_t', 2500000, '@chloeting', 24900000, ARRAY['fitness', 'health'], 'active', 'Fitness YouTuber, workout programs'),
('Jeff Nippard', 'jeff@jeffnippard.com', '+1-416-555-0302', '@jeffnippard', 1500000, '@jeffnippard', 1000000, '@jeffnippard', 3800000, ARRAY['fitness', 'science', 'bodybuilding'], 'active', 'Science-based fitness content'),
('Kayla Itsines', 'kayla@kaylaitsines.com', '+61-8-555-0303', '@kayla_itsines', 15800000, '@kayla_itsines', 1200000, '@kaylaitsines', 2900000, ARRAY['fitness', 'health', 'nutrition'], 'active', 'Sweat app founder, BBG creator'),

-- Tech Influencers
('Marques Brownlee', 'marques@mkbhd.com', '+1-201-555-0401', '@mkbhd', 5200000, '@mkbhd', 7500000, '@mkbhd', 18500000, ARRAY['tech', 'reviews'], 'active', 'Tech reviewer, MKBHD'),
('iJustine', 'justine@ijustine.com', '+1-412-555-0402', '@ijustine', 2000000, '@ijustine', 2300000, '@ijustine', 7100000, ARRAY['tech', 'lifestyle', 'gaming'], 'contacted', 'Tech enthusiast, Apple fan'),
('Austin Evans', 'austin@austinevans.com', '+1-816-555-0403', '@austinnotduncan', 450000, '@austinnotduncan', 800000, '@austinevans', 5400000, ARRAY['tech', 'gaming', 'reviews'], 'new', 'Tech reviews, PC builds'),

-- Food Influencers
('Joshua Weissman', 'joshua@joshuaweissman.com', '+1-713-555-0501', '@joshuaweissman', 4500000, '@joshuaweissman', 8000000, '@joshuaweissman', 8700000, ARRAY['food', 'cooking', 'comedy'], 'active', 'Chef, cookbook author'),
('Rosanna Pansino', 'ro@nerdy-nummies.com', '+1-206-555-0502', '@rosannapansino', 4400000, '@rosannapansino', 3500000, '@rosannapansino', 14400000, ARRAY['food', 'baking', 'entertainment'], 'active', 'Nerdy Nummies creator'),

-- Travel Influencers
('Chris Burkard', 'chris@chrisburkard.com', '+1-805-555-0601', '@chrisburkard', 3900000, NULL, NULL, '@chrisburkard', 131000, ARRAY['travel', 'photography', 'adventure'], 'active', 'Adventure photographer'),
('Murad Osmann', 'murad@followmeto.travel', '+7-495-555-0602', '@muradosmann', 4100000, '@muradosmann', 200000, '@followmeto', 580000, ARRAY['travel', 'photography'], 'contacted', '#FollowMeTo creator'),

-- Micro-Influencers
('Sarah Chen', 'sarah.chen@email.com', '+1-415-555-0701', '@sarahstyles', 85000, '@sarahstyles', 120000, NULL, NULL, ARRAY['fashion', 'sustainable'], 'new', 'Sustainable fashion advocate'),
('Mike Rodriguez', 'mike.r@email.com', '+1-305-555-0702', '@mikeeats', 45000, '@mikeeats', 95000, '@mikeeats', 25000, ARRAY['food', 'local'], 'active', 'Local food blogger'),
('Anna Kim', 'anna.kim@email.com', '+1-213-555-0703', '@annakorea', 62000, '@annakorea', 180000, NULL, NULL, ARRAY['beauty', 'k-beauty'], 'negotiating', 'K-beauty specialist'),
('Tom Anderson', 'tom.anderson@email.com', '+1-503-555-0704', '@tomfitness', 38000, '@tomfitness', 75000, '@tomfitness', 15000, ARRAY['fitness', 'nutrition'], 'new', 'Personal trainer, nutritionist');

-- ============================================
-- SAMPLE CAMPAIGNS
-- ============================================
INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, actual_cost, target_views, actual_views, notes) VALUES
-- Active Campaigns
((SELECT id FROM brands WHERE name = 'Nike' LIMIT 1), 
 (SELECT id FROM influencers WHERE name = 'Kayla Itsines' LIMIT 1),
 'Nike Training Club Summer Campaign', 'active', '2024-01-01', '2024-03-31', 50000, 45000, 1000000, 850000,
 'Promoting Nike Training Club app with workout videos'),

((SELECT id FROM brands WHERE name = 'Sephora' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Huda Kattan' LIMIT 1),
 'Sephora Beauty Insider Sale', 'active', '2024-01-15', '2024-02-15', 75000, 75000, 2000000, 2150000,
 'VIB Sale promotion, exclusive discount codes'),

((SELECT id FROM brands WHERE name = 'Gymshark' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Jeff Nippard' LIMIT 1),
 'Gymshark Athlete Collection Launch', 'active', '2024-02-01', '2024-04-30', 30000, 25000, 500000, 480000,
 'New athlete collection, workout content'),

-- Completed Campaigns
((SELECT id FROM brands WHERE name = 'Daniel Wellington' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Aimee Song' LIMIT 1),
 'DW Valentine''s Day Collection', 'completed', '2024-01-20', '2024-02-14', 15000, 15000, 300000, 420000,
 'Valentine''s special, discount code AIMEE15'),

((SELECT id FROM brands WHERE name = 'HelloFresh' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Joshua Weissman' LIMIT 1),
 'HelloFresh Chef''s Choice Box', 'completed', '2023-11-01', '2023-12-31', 40000, 38000, 800000, 920000,
 'Holiday meal kits, cooking tutorials'),

-- Planned Campaigns
((SELECT id FROM brands WHERE name = 'Apple' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Marques Brownlee' LIMIT 1),
 'iPhone 16 Pro Review', 'planned', '2024-03-15', '2024-04-15', 100000, NULL, 5000000, NULL,
 'Exclusive early access review'),

((SELECT id FROM brands WHERE name = 'Revolve' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Emma Chamberlain' LIMIT 1),
 'Revolve Festival 2024', 'planned', '2024-04-01', '2024-04-30', 80000, NULL, 3000000, NULL,
 'Coachella festival coverage, outfit showcases'),

((SELECT id FROM brands WHERE name = 'Airbnb' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Chris Burkard' LIMIT 1),
 'Airbnb Unique Stays', 'planned', '2024-05-01', '2024-07-31', 60000, NULL, 1500000, NULL,
 'Showcasing unique Airbnb properties worldwide');

-- ============================================
-- SAMPLE ACTIVITIES
-- ============================================
INSERT INTO activities (influencer_id, user_id, activity_type, description) VALUES
((SELECT id FROM influencers WHERE name = 'Emma Chamberlain' LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1),
 'email_sent', 'Sent collaboration proposal for Revolve Festival 2024'),

((SELECT id FROM influencers WHERE name = 'Marques Brownlee' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'meeting_scheduled', 'Scheduled briefing call for iPhone 16 Pro review - March 10, 2pm PST'),

((SELECT id FROM influencers WHERE name = 'Huda Kattan' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'contract_signed', 'Signed contract for Sephora Beauty Insider Sale campaign'),

((SELECT id FROM influencers WHERE name = 'Jeff Nippard' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'content_received', 'Received first batch of content for Gymshark campaign - 3 videos, 5 posts'),

((SELECT id FROM influencers WHERE name = 'iJustine' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'call_made', 'Discovery call to discuss potential tech collaboration'),

((SELECT id FROM influencers WHERE name = 'Jackie Aina' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'negotiating', 'Negotiating rates for summer beauty campaign'),

((SELECT id FROM influencers WHERE name = 'Sarah Chen' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'email_sent', 'Welcome email sent with media kit request'),

((SELECT id FROM influencers WHERE name = 'Joshua Weissman' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'payment_sent', 'Final payment sent for HelloFresh campaign - $38,000'),

((SELECT id FROM influencers WHERE name = 'Chris Burkard' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'proposal_sent', 'Sent detailed proposal for Airbnb Unique Stays campaign'),

((SELECT id FROM influencers WHERE name = 'Murad Osmann' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'follow_up', 'Follow up on initial outreach - awaiting response');

-- ============================================
-- UPDATE STATISTICS
-- ============================================
-- This will help demonstrate the dashboard metrics
UPDATE campaigns 
SET actual_views = target_views * (0.8 + random() * 0.4),
    actual_cost = budget * (0.85 + random() * 0.15)
WHERE status = 'completed' AND actual_views IS NULL;

-- Add some variety to follower counts
UPDATE influencers 
SET instagram_followers = instagram_followers * (0.95 + random() * 0.1),
    tiktok_followers = tiktok_followers * (0.95 + random() * 0.1),
    youtube_subscribers = youtube_subscribers * (0.95 + random() * 0.1)
WHERE status = 'active';