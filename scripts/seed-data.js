#!/usr/bin/env node

/**
 * Seed dummy data into Supabase database
 * Run: node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dummy data
const brands = [
  { name: 'Nike Sports', website: 'https://nike.com', industry: 'Sports & Fashion', contact_email: 'partnerships@nike.com', contact_phone: '+1-503-671-6453', notes: 'Global sports brand, interested in fitness and lifestyle influencers' },
  { name: 'Sephora Beauty', website: 'https://sephora.com', industry: 'Beauty & Cosmetics', contact_email: 'influencer@sephora.com', contact_phone: '+1-877-737-4672', notes: 'Leading beauty retailer, frequent collaborations' },
  { name: 'Apple Tech', website: 'https://apple.com', industry: 'Technology', contact_email: 'marketing@apple.com', contact_phone: '+1-800-275-2273', notes: 'Premium tech brand, selective partnerships' },
  { name: 'Fashion Nova', website: 'https://fashionnova.com', industry: 'Fashion', contact_email: 'collabs@fashionnova.com', contact_phone: '+1-888-442-5830', notes: 'Fast fashion brand, works with fashion influencers' },
  { name: 'Gymshark Fitness', website: 'https://gymshark.com', industry: 'Fitness Apparel', contact_email: 'athletes@gymshark.com', contact_phone: '+44-121-820-7575', notes: 'Fitness apparel brand with ambassador program' },
  { name: 'Daniel Wellington', website: 'https://danielwellington.com', industry: 'Accessories', contact_email: 'influencer@dw.com', contact_phone: '+46-8-410-385-30', notes: 'Watch brand, micro-influencer friendly' },
  { name: 'HelloFresh', website: 'https://hellofresh.com', industry: 'Food & Beverage', contact_email: 'partnerships@hellofresh.com', contact_phone: '+1-646-846-3663', notes: 'Meal kit delivery service' },
  { name: 'Airbnb Travel', website: 'https://airbnb.com', industry: 'Travel & Hospitality', contact_email: 'partnerships@airbnb.com', contact_phone: '+1-855-424-7262', notes: 'Travel accommodation platform' },
  { name: 'Glossier', website: 'https://glossier.com', industry: 'Beauty', contact_email: 'gteam@glossier.com', contact_phone: '+1-877-945-6774', notes: 'Millennial beauty brand' },
  { name: 'Spotify', website: 'https://spotify.com', industry: 'Entertainment', contact_email: 'creators@spotify.com', contact_phone: '+1-866-679-9129', notes: 'Music streaming platform' }
];

const influencers = [
  { name: 'Emma Rodriguez', email: 'emma.rodriguez@email.com', phone: '+1-310-555-0101', instagram_handle: '@emmarodriguez', instagram_followers: 2500000, tiktok_handle: '@emmarodriguez', tiktok_followers: 1800000, youtube_handle: '@EmmaRodriguezOfficial', youtube_subscribers: 950000, niche: ['fashion', 'lifestyle', 'travel'], status: 'active', notes: 'Top fashion influencer, great engagement rates' },
  { name: 'James Mitchell', email: 'james.mitchell@email.com', phone: '+1-415-555-0102', instagram_handle: '@jamesmitchell', instagram_followers: 1800000, tiktok_handle: '@jamesmitchell', tiktok_followers: 2200000, youtube_handle: '@JamesMitchellFit', youtube_subscribers: 620000, niche: ['fitness', 'health', 'nutrition'], status: 'active', notes: 'Fitness coach and nutritionist' },
  { name: 'Sophia Chen', email: 'sophia.chen@email.com', phone: '+1-212-555-0103', instagram_handle: '@sophiachen', instagram_followers: 890000, tiktok_handle: '@sophiachen', tiktok_followers: 1200000, youtube_handle: '@SophiaChenBeauty', youtube_subscribers: 450000, niche: ['beauty', 'skincare', 'makeup'], status: 'active', notes: 'Beauty guru specializing in K-beauty' },
  { name: 'Michael Johnson', email: 'michael.j@email.com', phone: '+1-305-555-0104', instagram_handle: '@michaeljtech', instagram_followers: 650000, tiktok_handle: '@michaeljtech', tiktok_followers: 980000, youtube_handle: '@MichaelJTech', youtube_subscribers: 1500000, niche: ['tech', 'gaming', 'reviews'], status: 'negotiating', notes: 'Tech reviewer with focus on smartphones' },
  { name: 'Isabella Martinez', email: 'isabella.m@email.com', phone: '+1-323-555-0105', instagram_handle: '@isabellamartinez', instagram_followers: 1200000, tiktok_handle: '@isabellamartinez', tiktok_followers: 950000, niche: ['fashion', 'luxury', 'lifestyle'], status: 'active', notes: 'Luxury fashion influencer' },
  { name: 'David Park', email: 'david.park@email.com', phone: '+1-206-555-0201', instagram_handle: '@davidpark', instagram_followers: 450000, tiktok_handle: '@davidparkfood', tiktok_followers: 380000, youtube_handle: '@DavidParkCooks', youtube_subscribers: 280000, niche: ['food', 'cooking', 'restaurants'], status: 'active', notes: 'Food blogger and chef' },
  { name: 'Olivia Thompson', email: 'olivia.t@email.com', phone: '+1-617-555-0202', instagram_handle: '@oliviathompson', instagram_followers: 320000, tiktok_handle: '@oliviathompson', tiktok_followers: 410000, niche: ['travel', 'adventure', 'photography'], status: 'contacted', notes: 'Travel photographer' },
  { name: 'Ryan Garcia', email: 'ryan.garcia@email.com', phone: '+1-512-555-0203', instagram_handle: '@ryangarcia', instagram_followers: 280000, tiktok_handle: '@ryangarciafit', tiktok_followers: 350000, youtube_handle: '@RyanGarciaFitness', youtube_subscribers: 180000, niche: ['fitness', 'crossfit', 'sports'], status: 'active', notes: 'CrossFit athlete' },
  { name: 'Ava Wilson', email: 'ava.wilson@email.com', phone: '+1-404-555-0204', instagram_handle: '@avawilson', instagram_followers: 520000, tiktok_handle: '@avawilson', tiktok_followers: 680000, youtube_handle: '@AvaWilsonStyle', youtube_subscribers: 210000, niche: ['fashion', 'sustainable', 'thrifting'], status: 'active', notes: 'Sustainable fashion advocate' },
  { name: 'Nathan Brown', email: 'nathan.b@email.com', phone: '+1-602-555-0205', instagram_handle: '@nathanbrown', instagram_followers: 180000, tiktok_handle: '@nathanbrownmusic', tiktok_followers: 220000, youtube_handle: '@NathanBrownMusic', youtube_subscribers: 390000, niche: ['music', 'entertainment', 'lifestyle'], status: 'new', notes: 'Musician and content creator' },
  { name: 'Sarah Kim', email: 'sarah.kim@email.com', phone: '+1-408-555-0301', instagram_handle: '@sarahkimstyle', instagram_followers: 85000, tiktok_handle: '@sarahkimstyle', tiktok_followers: 120000, niche: ['fashion', 'minimalist', 'lifestyle'], status: 'active', notes: 'Minimalist fashion blogger' },
  { name: 'Alex Turner', email: 'alex.turner@email.com', phone: '+1-503-555-0302', instagram_handle: '@alexturner', instagram_followers: 62000, tiktok_handle: '@alexturnereats', tiktok_followers: 95000, youtube_handle: '@AlexTurnerEats', youtube_subscribers: 45000, niche: ['food', 'vegan', 'health'], status: 'active', notes: 'Vegan food blogger' },
  { name: 'Maya Patel', email: 'maya.patel@email.com', phone: '+1-214-555-0303', instagram_handle: '@mayapatel', instagram_followers: 78000, tiktok_handle: '@mayapatelbeauty', tiktok_followers: 110000, niche: ['beauty', 'indian', 'tutorials'], status: 'negotiating', notes: 'Beauty influencer specializing in Indian beauty' },
  { name: 'Lucas Anderson', email: 'lucas.a@email.com', phone: '+1-303-555-0304', instagram_handle: '@lucasanderson', instagram_followers: 42000, tiktok_handle: '@lucasandersonfit', tiktok_followers: 58000, niche: ['fitness', 'yoga', 'wellness'], status: 'contacted', notes: 'Yoga instructor' },
  { name: 'Chloe Davis', email: 'chloe.davis@email.com', phone: '+1-702-555-0305', instagram_handle: '@chloedavis', instagram_followers: 95000, tiktok_handle: '@chloedavisart', tiktok_followers: 130000, youtube_handle: '@ChloeDavisArt', youtube_subscribers: 72000, niche: ['art', 'diy', 'crafts'], status: 'active', notes: 'DIY and craft content creator' },
  { name: 'Jordan Lee', email: 'jordan.lee@email.com', phone: '+1-619-555-0401', instagram_handle: '@jordanlee', instagram_followers: 28000, tiktok_handle: '@jordanleetravel', tiktok_followers: 35000, niche: ['travel', 'budget', 'backpacking'], status: 'new', notes: 'Budget travel expert' },
  { name: 'Rachel Green', email: 'rachel.green@email.com', phone: '+1-916-555-0402', instagram_handle: '@rachelgreen', instagram_followers: 31000, tiktok_handle: '@rachelgreencooks', tiktok_followers: 42000, niche: ['food', 'baking', 'desserts'], status: 'new', notes: 'Pastry chef' },
  { name: 'Tyler Martinez', email: 'tyler.m@email.com', phone: '+1-480-555-0403', instagram_handle: '@tylermartinez', instagram_followers: 19000, tiktok_handle: '@tylermartinezgaming', tiktok_followers: 45000, youtube_handle: '@TylerGaming', youtube_subscribers: 89000, niche: ['gaming', 'esports', 'streaming'], status: 'contacted', notes: 'Gaming streamer' },
  { name: 'Zoe Taylor', email: 'zoe.taylor@email.com', phone: '+1-813-555-0404', instagram_handle: '@zoetaylor', instagram_followers: 52000, tiktok_handle: '@zoetaylorfashion', tiktok_followers: 68000, niche: ['fashion', 'vintage', 'thrifting'], status: 'inactive', notes: 'Vintage fashion enthusiast' },
  { name: 'Marcus White', email: 'marcus.white@email.com', phone: '+1-330-555-0405', instagram_handle: '@marcuswhite', instagram_followers: 37000, tiktok_handle: '@marcuswhitetech', tiktok_followers: 48000, youtube_handle: '@MarcusWhiteTech', youtube_subscribers: 95000, niche: ['tech', 'coding', 'tutorials'], status: 'rejected', notes: 'Tech educator' }
];

async function seedData() {
  console.log('🌱 Starting to seed data...\n');

  try {
    // Clear existing data (optional)
    console.log('🧹 Clearing existing data...');
    await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('influencers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert brands
    console.log('📦 Adding brands...');
    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .insert(brands)
      .select();

    if (brandsError) {
      console.error('❌ Error inserting brands:', brandsError);
    } else {
      console.log(`✅ Added ${brandsData.length} brands`);
    }

    // Insert influencers
    console.log('👥 Adding influencers...');
    const { data: influencersData, error: influencersError } = await supabase
      .from('influencers')
      .insert(influencers)
      .select();

    if (influencersError) {
      console.error('❌ Error inserting influencers:', influencersError);
    } else {
      console.log(`✅ Added ${influencersData.length} influencers`);
    }

    // Add some sample campaigns
    if (brandsData && influencersData) {
      console.log('📊 Adding sample campaigns...');
      
      const campaigns = [
        {
          brand_id: brandsData[0].id, // Nike
          influencer_id: influencersData[1].id, // James Mitchell
          campaign_name: 'Nike Summer Fitness Challenge 2024',
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2024-03-31',
          budget: 50000,
          actual_cost: 45000,
          target_views: 1000000,
          actual_views: 850000,
          notes: 'Promoting Nike Training app and new fitness gear line'
        },
        {
          brand_id: brandsData[1].id, // Sephora
          influencer_id: influencersData[2].id, // Sophia Chen
          campaign_name: 'Sephora Spring Beauty Collection',
          status: 'active',
          start_date: '2024-02-01',
          end_date: '2024-04-30',
          budget: 35000,
          actual_cost: 32000,
          target_views: 750000,
          actual_views: 820000,
          notes: 'New spring makeup collection launch'
        },
        {
          brand_id: brandsData[3].id, // Fashion Nova
          influencer_id: influencersData[0].id, // Emma Rodriguez
          campaign_name: 'Fashion Nova Spring Collection',
          status: 'active',
          start_date: '2024-02-15',
          end_date: '2024-05-15',
          budget: 75000,
          actual_cost: 70000,
          target_views: 2000000,
          actual_views: 1950000,
          notes: 'Spring fashion campaign with weekly posts'
        },
        {
          brand_id: brandsData[4].id, // Gymshark
          influencer_id: influencersData[7].id, // Ryan Garcia
          campaign_name: 'Gymshark Athlete Program Q1',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          budget: 25000,
          actual_cost: 23000,
          target_views: 500000,
          actual_views: 580000,
          notes: 'Quarterly athlete partnership'
        },
        {
          brand_id: brandsData[2].id, // Apple
          influencer_id: influencersData[3].id, // Michael Johnson
          campaign_name: 'iPhone 15 Pro Review',
          status: 'completed',
          start_date: '2023-09-15',
          end_date: '2023-10-31',
          budget: 60000,
          actual_cost: 60000,
          target_views: 1500000,
          actual_views: 1820000,
          notes: 'Product review and unboxing'
        }
      ];

      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .insert(campaigns)
        .select();

      if (campaignsError) {
        console.error('❌ Error inserting campaigns:', campaignsError);
      } else {
        console.log(`✅ Added ${campaignsData.length} campaigns`);
      }

      // Add some activities
      console.log('📝 Adding sample activities...');
      const activities = [
        {
          influencer_id: influencersData[0].id,
          activity_type: 'contract_signed',
          description: 'Signed contract for Fashion Nova Spring Collection'
        },
        {
          influencer_id: influencersData[1].id,
          activity_type: 'content_received',
          description: 'Received 3 workout videos for Nike campaign'
        },
        {
          influencer_id: influencersData[2].id,
          activity_type: 'meeting_scheduled',
          description: 'Campaign review meeting scheduled for next week'
        },
        {
          influencer_id: influencersData[3].id,
          activity_type: 'email_sent',
          description: 'Sent proposal for Q2 tech reviews'
        },
        {
          influencer_id: influencersData[4].id,
          activity_type: 'call_made',
          description: 'Discovery call for summer campaign'
        }
      ];

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .insert(activities)
        .select();

      if (activitiesError) {
        console.error('❌ Error inserting activities:', activitiesError);
      } else {
        console.log(`✅ Added ${activitiesData.length} activities`);
      }
    }

    console.log('\n🎉 Data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${brands.length} brands added`);
    console.log(`   - ${influencers.length} influencers added`);
    console.log(`   - 5 campaigns added`);
    console.log(`   - 5 activities added`);
    console.log('\n✨ Your CRM now has sample data! Login to see it.');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeding
seedData();