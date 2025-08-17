-- Add Dummy Data to Visca CRM
-- Run this in your Supabase SQL Editor

-- ============================================
-- SAMPLE BRANDS (10 brands)
-- ============================================
INSERT INTO brands (name, website, industry, contact_email, contact_phone, notes) VALUES
('Nike Sports', 'https://nike.com', 'Sports & Fashion', 'partnerships@nike.com', '+1-503-671-6453', 'Global sports brand, interested in fitness and lifestyle influencers'),
('Sephora Beauty', 'https://sephora.com', 'Beauty & Cosmetics', 'influencer@sephora.com', '+1-877-737-4672', 'Leading beauty retailer, frequent collaborations with beauty influencers'),
('Apple Tech', 'https://apple.com', 'Technology', 'marketing@apple.com', '+1-800-275-2273', 'Premium tech brand, selective partnerships with tech reviewers'),
('Fashion Nova', 'https://fashionnova.com', 'Fashion', 'collabs@fashionnova.com', '+1-888-442-5830', 'Fast fashion brand, works with fashion and lifestyle influencers'),
('Gymshark Fitness', 'https://gymshark.com', 'Fitness Apparel', 'athletes@gymshark.com', '+44-121-820-7575', 'Fitness apparel brand with ambassador program'),
('Daniel Wellington', 'https://danielwellington.com', 'Accessories', 'influencer@danielwellington.com', '+46-8-410-385-30', 'Watch brand, micro-influencer friendly'),
('HelloFresh', 'https://hellofresh.com', 'Food & Beverage', 'partnerships@hellofresh.com', '+1-646-846-3663', 'Meal kit delivery service, lifestyle partnerships'),
('Airbnb Travel', 'https://airbnb.com', 'Travel & Hospitality', 'partnerships@airbnb.com', '+1-855-424-7262', 'Travel accommodation platform, travel influencer partnerships'),
('Glossier', 'https://glossier.com', 'Beauty', 'gteam@glossier.com', '+1-877-945-6774', 'Millennial beauty brand, authentic content focus'),
('Spotify', 'https://spotify.com', 'Entertainment', 'creators@spotify.com', '+1-866-679-9129', 'Music streaming platform, podcast and music partnerships')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE INFLUENCERS (20 influencers)
-- ============================================
INSERT INTO influencers (name, email, phone, instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, youtube_handle, youtube_subscribers, niche, status, notes) VALUES
-- Top Tier Influencers
('Emma Rodriguez', 'emma.rodriguez@email.com', '+1-310-555-0101', '@emmarodriguez', 2500000, '@emmarodriguez', 1800000, '@EmmaRodriguezOfficial', 950000, ARRAY['fashion', 'lifestyle', 'travel'], 'active', 'Top fashion influencer, great engagement rates, prefers long-term partnerships'),
('James Mitchell', 'james.mitchell@email.com', '+1-415-555-0102', '@jamesmitchell', 1800000, '@jamesmitchell', 2200000, '@JamesMitchellFit', 620000, ARRAY['fitness', 'health', 'nutrition'], 'active', 'Fitness coach and nutritionist, promotes healthy lifestyle'),
('Sophia Chen', 'sophia.chen@email.com', '+1-212-555-0103', '@sophiachen', 890000, '@sophiachen', 1200000, '@SophiaChenBeauty', 450000, ARRAY['beauty', 'skincare', 'makeup'], 'active', 'Beauty guru specializing in K-beauty and skincare routines'),
('Michael Johnson', 'michael.j@email.com', '+1-305-555-0104', '@michaeljtech', 650000, '@michaeljtech', 980000, '@MichaelJTech', 1500000, ARRAY['tech', 'gaming', 'reviews'], 'negotiating', 'Tech reviewer with focus on smartphones and gaming gear'),
('Isabella Martinez', 'isabella.m@email.com', '+1-323-555-0105', '@isabellamartinez', 1200000, '@isabellamartinez', 950000, NULL, NULL, ARRAY['fashion', 'luxury', 'lifestyle'], 'active', 'Luxury fashion influencer, works with high-end brands'),

-- Mid-Tier Influencers
('David Park', 'david.park@email.com', '+1-206-555-0201', '@davidpark', 450000, '@davidparkfood', 380000, '@DavidParkCooks', 280000, ARRAY['food', 'cooking', 'restaurants'], 'active', 'Food blogger and chef, restaurant reviews and recipes'),
('Olivia Thompson', 'olivia.t@email.com', '+1-617-555-0202', '@oliviathompson', 320000, '@oliviathompson', 410000, NULL, NULL, ARRAY['travel', 'adventure', 'photography'], 'contacted', 'Travel photographer, focuses on sustainable tourism'),
('Ryan Garcia', 'ryan.garcia@email.com', '+1-512-555-0203', '@ryangarcia', 280000, '@ryangarciafit', 350000, '@RyanGarciaFitness', 180000, ARRAY['fitness', 'crossfit', 'sports'], 'active', 'CrossFit athlete and personal trainer'),
('Ava Wilson', 'ava.wilson@email.com', '+1-404-555-0204', '@avawilson', 520000, '@avawilson', 680000, '@AvaWilsonStyle', 210000, ARRAY['fashion', 'sustainable', 'thrifting'], 'active', 'Sustainable fashion advocate, thrift shopping expert'),
('Nathan Brown', 'nathan.b@email.com', '+1-602-555-0205', '@nathanbrown', 180000, '@nathanbrownmusic', 220000, '@NathanBrownMusic', 390000, ARRAY['music', 'entertainment', 'lifestyle'], 'new', 'Musician and content creator, music production tutorials'),

-- Micro-Influencers
('Sarah Kim', 'sarah.kim@email.com', '+1-408-555-0301', '@sarahkimstyle', 85000, '@sarahkimstyle', 120000, NULL, NULL, ARRAY['fashion', 'minimalist', 'lifestyle'], 'active', 'Minimalist fashion blogger, capsule wardrobe expert'),
('Alex Turner', 'alex.turner@email.com', '+1-503-555-0302', '@alexturner', 62000, '@alexturnereats', 95000, '@AlexTurnerEats', 45000, ARRAY['food', 'vegan', 'health'], 'active', 'Vegan food blogger, plant-based recipes'),
('Maya Patel', 'maya.patel@email.com', '+1-214-555-0303', '@mayapatel', 78000, '@mayapatelbeauty', 110000, NULL, NULL, ARRAY['beauty', 'indian', 'tutorials'], 'negotiating', 'Beauty influencer specializing in Indian beauty techniques'),
('Lucas Anderson', 'lucas.a@email.com', '+1-303-555-0304', '@lucasanderson', 42000, '@lucasandersonfit', 58000, NULL, NULL, ARRAY['fitness', 'yoga', 'wellness'], 'contacted', 'Yoga instructor and wellness coach'),
('Chloe Davis', 'chloe.davis@email.com', '+1-702-555-0305', '@chloedavis', 95000, '@chloedavisart', 130000, '@ChloeDavisArt', 72000, ARRAY['art', 'diy', 'crafts'], 'active', 'DIY and craft content creator, home decor specialist'),

-- Emerging Influencers
('Jordan Lee', 'jordan.lee@email.com', '+1-619-555-0401', '@jordanlee', 28000, '@jordanleetravel', 35000, NULL, NULL, ARRAY['travel', 'budget', 'backpacking'], 'new', 'Budget travel expert, backpacking tips'),
('Rachel Green', 'rachel.green@email.com', '+1-916-555-0402', '@rachelgreen', 31000, '@rachelgreencooks', 42000, NULL, NULL, ARRAY['food', 'baking', 'desserts'], 'new', 'Pastry chef, baking tutorials and recipes'),
('Tyler Martinez', 'tyler.m@email.com', '+1-480-555-0403', '@tylermartinez', 19000, '@tylermartinezgaming', 45000, '@TylerGaming', 89000, ARRAY['gaming', 'esports', 'streaming'], 'contacted', 'Gaming streamer, esports competitor'),
('Zoe Taylor', 'zoe.taylor@email.com', '+1-813-555-0404', '@zoetaylor', 52000, '@zoetaylorfashion', 68000, NULL, NULL, ARRAY['fashion', 'vintage', 'thrifting'], 'inactive', 'Vintage fashion enthusiast, thrift finds'),
('Marcus White', 'marcus.white@email.com', '+1-330-555-0405', '@marcuswhite', 37000, '@marcuswhitetech', 48000, '@MarcusWhiteTech', 95000, ARRAY['tech', 'coding', 'tutorials'], 'rejected', 'Tech educator, coding tutorials and tech reviews')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE CAMPAIGNS (15 campaigns)
-- ============================================
INSERT INTO campaigns (brand_id, influencer_id, campaign_name, status, start_date, end_date, budget, actual_cost, target_views, actual_views, notes) VALUES
-- Active Campaigns
((SELECT id FROM brands WHERE name = 'Nike Sports' LIMIT 1), 
 (SELECT id FROM influencers WHERE name = 'James Mitchell' LIMIT 1),
 'Nike Summer Fitness Challenge 2024', 'active', '2024-01-15', '2024-03-31', 50000, 45000, 1000000, 850000,
 'Promoting Nike Training app and new fitness gear line. 3 posts per week + stories.'),

((SELECT id FROM brands WHERE name = 'Sephora Beauty' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Sophia Chen' LIMIT 1),
 'Sephora Spring Beauty Collection', 'active', '2024-02-01', '2024-04-30', 35000, 32000, 750000, 820000,
 'New spring makeup collection launch. Tutorial videos and product reviews.'),

((SELECT id FROM brands WHERE name = 'Gymshark Fitness' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Ryan Garcia' LIMIT 1),
 'Gymshark Athlete Program Q1', 'active', '2024-01-01', '2024-03-31', 25000, 23000, 500000, 480000,
 'Ongoing athlete partnership. Workout content with Gymshark apparel.'),

((SELECT id FROM brands WHERE name = 'Fashion Nova' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Emma Rodriguez' LIMIT 1),
 'Fashion Nova Spring Collection', 'active', '2024-02-15', '2024-05-15', 75000, 70000, 2000000, 1950000,
 'Spring fashion campaign. Weekly outfit posts and haul videos.'),

((SELECT id FROM brands WHERE name = 'HelloFresh' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'David Park' LIMIT 1),
 'HelloFresh Chef Partnership', 'active', '2024-01-01', '2024-06-30', 40000, 35000, 600000, 580000,
 'Recipe creation and meal kit reviews. Bi-weekly content.'),

-- Completed Campaigns
((SELECT id FROM brands WHERE name = 'Daniel Wellington' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Isabella Martinez' LIMIT 1),
 'DW Valentine Special 2024', 'completed', '2024-01-20', '2024-02-14', 15000, 15000, 400000, 520000,
 'Valentine''s Day campaign. Exceeded view targets by 30%.'),

((SELECT id FROM brands WHERE name = 'Glossier' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Maya Patel' LIMIT 1),
 'Glossier You Perfume Launch', 'completed', '2023-11-01', '2023-12-31', 20000, 19500, 300000, 380000,
 'Perfume launch campaign. Great engagement and conversions.'),

((SELECT id FROM brands WHERE name = 'Apple Tech' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Michael Johnson' LIMIT 1),
 'iPhone 15 Pro Review Campaign', 'completed', '2023-09-15', '2023-10-31', 60000, 60000, 1500000, 1820000,
 'Product review and unboxing. Viral video with 1.8M views.'),

((SELECT id FROM brands WHERE name = 'Airbnb Travel' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Olivia Thompson' LIMIT 1),
 'Airbnb Unique Stays Europe', 'completed', '2023-06-01', '2023-08-31', 45000, 43000, 800000, 920000,
 'European unique stays showcase. 10 property features.'),

-- Planned Campaigns
((SELECT id FROM brands WHERE name = 'Spotify' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Nathan Brown' LIMIT 1),
 'Spotify Creator Spotlight', 'planned', '2024-04-01', '2024-06-30', 30000, NULL, 500000, NULL,
 'Podcast and playlist curation partnership.'),

((SELECT id FROM brands WHERE name = 'Nike Sports' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Ava Wilson' LIMIT 1),
 'Nike Sustainable Line Launch', 'planned', '2024-05-01', '2024-07-31', 55000, NULL, 1200000, NULL,
 'Sustainable fashion line promotion.'),

((SELECT id FROM brands WHERE name = 'Sephora Beauty' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Chloe Davis' LIMIT 1),
 'Sephora DIY Beauty Series', 'planned', '2024-04-15', '2024-06-15', 25000, NULL, 400000, NULL,
 'DIY beauty tutorials using Sephora products.'),

-- Negotiating
((SELECT id FROM brands WHERE name = 'Fashion Nova' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Sarah Kim' LIMIT 1),
 'Fashion Nova Minimalist Collection', 'planned', '2024-03-01', '2024-05-31', 18000, NULL, 250000, NULL,
 'Minimalist fashion campaign. Terms being negotiated.'),

-- Cancelled
((SELECT id FROM brands WHERE name = 'Gymshark Fitness' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Lucas Anderson' LIMIT 1),
 'Gymshark Yoga Line', 'cancelled', '2024-02-01', '2024-04-30', 22000, NULL, 350000, NULL,
 'Campaign cancelled due to scheduling conflicts.'),

((SELECT id FROM brands WHERE name = 'HelloFresh' LIMIT 1),
 (SELECT id FROM influencers WHERE name = 'Alex Turner' LIMIT 1),
 'HelloFresh Vegan Box', 'cancelled', '2024-01-15', '2024-03-15', 28000, NULL, 450000, NULL,
 'Campaign cancelled - influencer signed exclusive deal with competitor.')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE ACTIVITIES (Recent interactions)
-- ============================================
INSERT INTO activities (influencer_id, user_id, activity_type, description) VALUES
((SELECT id FROM influencers WHERE name = 'Emma Rodriguez' LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1),
 'contract_signed', 'Signed contract for Fashion Nova Spring Collection - $75,000'),

((SELECT id FROM influencers WHERE name = 'Michael Johnson' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'negotiating', 'Negotiating rates for Q2 tech review series'),

((SELECT id FROM influencers WHERE name = 'Sophia Chen' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'content_received', 'Received 5 tutorial videos for Sephora campaign'),

((SELECT id FROM influencers WHERE name = 'James Mitchell' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'meeting_scheduled', 'Campaign kickoff meeting scheduled for Monday 2pm'),

((SELECT id FROM influencers WHERE name = 'David Park' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'email_sent', 'Sent February content calendar for approval'),

((SELECT id FROM influencers WHERE name = 'Olivia Thompson' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'call_made', 'Discovery call for potential Q2 travel campaign'),

((SELECT id FROM influencers WHERE name = 'Sarah Kim' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'proposal_sent', 'Sent collaboration proposal for minimalist fashion line'),

((SELECT id FROM influencers WHERE name = 'Maya Patel' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'payment_sent', 'Final payment processed for Glossier campaign - $19,500'),

((SELECT id FROM influencers WHERE name = 'Ryan Garcia' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'content_approved', 'Approved 3 workout videos for Gymshark campaign'),

((SELECT id FROM influencers WHERE name = 'Nathan Brown' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'follow_up', 'Follow-up on Spotify partnership opportunity'),

((SELECT id FROM influencers WHERE name = 'Ava Wilson' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'email_sent', 'Sent Nike sustainable line campaign brief'),

((SELECT id FROM influencers WHERE name = 'Jordan Lee' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'email_sent', 'Welcome email sent with onboarding information'),

((SELECT id FROM influencers WHERE name = 'Rachel Green' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'call_made', 'Initial outreach call - interested in food partnerships'),

((SELECT id FROM influencers WHERE name = 'Tyler Martinez' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'meeting_scheduled', 'Gaming campaign discussion scheduled for Friday'),

((SELECT id FROM influencers WHERE name = 'Marcus White' LIMIT 1),
 (SELECT id FROM profiles LIMIT 1),
 'rejected', 'Partnership declined - rates outside budget')
ON CONFLICT DO NOTHING;

-- ============================================
-- Success Message
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM influencers) as total_influencers,
  (SELECT COUNT(*) FROM brands) as total_brands,
  (SELECT COUNT(*) FROM campaigns) as total_campaigns,
  (SELECT COUNT(*) FROM activities) as total_activities;