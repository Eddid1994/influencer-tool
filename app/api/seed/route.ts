import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const brands = [
  { name: 'Nike Sports', website: 'https://nike.com', industry: 'Sports & Fashion', contact_email: 'partnerships@nike.com', contact_phone: '+1-503-671-6453', notes: 'Global sports brand' },
  { name: 'Sephora Beauty', website: 'https://sephora.com', industry: 'Beauty & Cosmetics', contact_email: 'influencer@sephora.com', contact_phone: '+1-877-737-4672', notes: 'Beauty retailer' },
  { name: 'Apple Tech', website: 'https://apple.com', industry: 'Technology', contact_email: 'marketing@apple.com', contact_phone: '+1-800-275-2273', notes: 'Tech brand' },
  { name: 'Fashion Nova', website: 'https://fashionnova.com', industry: 'Fashion', contact_email: 'collabs@fashionnova.com', contact_phone: '+1-888-442-5830', notes: 'Fast fashion' },
  { name: 'Gymshark', website: 'https://gymshark.com', industry: 'Fitness', contact_email: 'athletes@gymshark.com', contact_phone: '+44-121-820-7575', notes: 'Fitness apparel' },
  { name: 'Daniel Wellington', website: 'https://danielwellington.com', industry: 'Accessories', contact_email: 'influencer@dw.com', contact_phone: '+46-8-410-385-30', notes: 'Watches' },
  { name: 'HelloFresh', website: 'https://hellofresh.com', industry: 'Food', contact_email: 'partnerships@hellofresh.com', contact_phone: '+1-646-846-3663', notes: 'Meal kits' },
  { name: 'Airbnb', website: 'https://airbnb.com', industry: 'Travel', contact_email: 'partnerships@airbnb.com', contact_phone: '+1-855-424-7262', notes: 'Travel platform' },
  { name: 'Glossier', website: 'https://glossier.com', industry: 'Beauty', contact_email: 'gteam@glossier.com', contact_phone: '+1-877-945-6774', notes: 'Beauty brand' },
  { name: 'Spotify', website: 'https://spotify.com', industry: 'Entertainment', contact_email: 'creators@spotify.com', contact_phone: '+1-866-679-9129', notes: 'Music streaming' }
]

const influencers = [
  { name: 'Emma Rodriguez', email: 'emma@email.com', phone: '+1-310-555-0101', instagram_handle: '@emmarodriguez', instagram_followers: 2500000, tiktok_handle: '@emmarodriguez', tiktok_followers: 1800000, niche: ['fashion', 'lifestyle'], status: 'active', notes: 'Top fashion influencer' },
  { name: 'James Mitchell', email: 'james@email.com', phone: '+1-415-555-0102', instagram_handle: '@jamesmitchell', instagram_followers: 1800000, tiktok_handle: '@jamesmitchell', tiktok_followers: 2200000, niche: ['fitness', 'health'], status: 'active', notes: 'Fitness coach' },
  { name: 'Sophia Chen', email: 'sophia@email.com', phone: '+1-212-555-0103', instagram_handle: '@sophiachen', instagram_followers: 890000, tiktok_handle: '@sophiachen', tiktok_followers: 1200000, niche: ['beauty', 'skincare'], status: 'active', notes: 'Beauty guru' },
  { name: 'Michael Johnson', email: 'michael@email.com', phone: '+1-305-555-0104', instagram_handle: '@michaeljtech', instagram_followers: 650000, tiktok_handle: '@michaeljtech', tiktok_followers: 980000, niche: ['tech', 'gaming'], status: 'negotiating', notes: 'Tech reviewer' },
  { name: 'Isabella Martinez', email: 'isabella@email.com', phone: '+1-323-555-0105', instagram_handle: '@isabellamartinez', instagram_followers: 1200000, tiktok_handle: '@isabellamartinez', tiktok_followers: 950000, niche: ['fashion', 'luxury'], status: 'active', notes: 'Luxury fashion' },
  { name: 'David Park', email: 'david@email.com', phone: '+1-206-555-0201', instagram_handle: '@davidpark', instagram_followers: 450000, tiktok_handle: '@davidparkfood', tiktok_followers: 380000, niche: ['food', 'cooking'], status: 'active', notes: 'Food blogger' },
  { name: 'Olivia Thompson', email: 'olivia@email.com', phone: '+1-617-555-0202', instagram_handle: '@oliviathompson', instagram_followers: 320000, tiktok_handle: '@oliviathompson', tiktok_followers: 410000, niche: ['travel', 'photography'], status: 'contacted', notes: 'Travel photographer' },
  { name: 'Ryan Garcia', email: 'ryan@email.com', phone: '+1-512-555-0203', instagram_handle: '@ryangarcia', instagram_followers: 280000, tiktok_handle: '@ryangarciafit', tiktok_followers: 350000, niche: ['fitness', 'sports'], status: 'active', notes: 'CrossFit athlete' },
  { name: 'Ava Wilson', email: 'ava@email.com', phone: '+1-404-555-0204', instagram_handle: '@avawilson', instagram_followers: 520000, tiktok_handle: '@avawilson', tiktok_followers: 680000, niche: ['fashion', 'sustainable'], status: 'active', notes: 'Sustainable fashion' },
  { name: 'Nathan Brown', email: 'nathan@email.com', phone: '+1-602-555-0205', instagram_handle: '@nathanbrown', instagram_followers: 180000, tiktok_handle: '@nathanbrownmusic', tiktok_followers: 220000, niche: ['music', 'lifestyle'], status: 'new', notes: 'Musician' },
  { name: 'Sarah Kim', email: 'sarah@email.com', phone: '+1-408-555-0301', instagram_handle: '@sarahkimstyle', instagram_followers: 85000, tiktok_handle: '@sarahkimstyle', tiktok_followers: 120000, niche: ['fashion', 'minimalist'], status: 'active', notes: 'Minimalist fashion' },
  { name: 'Alex Turner', email: 'alex@email.com', phone: '+1-503-555-0302', instagram_handle: '@alexturner', instagram_followers: 62000, tiktok_handle: '@alexturnereats', tiktok_followers: 95000, niche: ['food', 'vegan'], status: 'active', notes: 'Vegan blogger' },
  { name: 'Maya Patel', email: 'maya@email.com', phone: '+1-214-555-0303', instagram_handle: '@mayapatel', instagram_followers: 78000, tiktok_handle: '@mayapatelbeauty', tiktok_followers: 110000, niche: ['beauty', 'tutorials'], status: 'negotiating', notes: 'Beauty tutorials' },
  { name: 'Lucas Anderson', email: 'lucas@email.com', phone: '+1-303-555-0304', instagram_handle: '@lucasanderson', instagram_followers: 42000, tiktok_handle: '@lucasandersonfit', tiktok_followers: 58000, niche: ['fitness', 'yoga'], status: 'contacted', notes: 'Yoga instructor' },
  { name: 'Chloe Davis', email: 'chloe@email.com', phone: '+1-702-555-0305', instagram_handle: '@chloedavis', instagram_followers: 95000, tiktok_handle: '@chloedavisart', tiktok_followers: 130000, niche: ['art', 'diy'], status: 'active', notes: 'DIY creator' },
  { name: 'Jordan Lee', email: 'jordan@email.com', phone: '+1-619-555-0401', instagram_handle: '@jordanlee', instagram_followers: 28000, tiktok_handle: '@jordanleetravel', tiktok_followers: 35000, niche: ['travel', 'budget'], status: 'new', notes: 'Budget travel' },
  { name: 'Rachel Green', email: 'rachel@email.com', phone: '+1-916-555-0402', instagram_handle: '@rachelgreen', instagram_followers: 31000, tiktok_handle: '@rachelgreencooks', tiktok_followers: 42000, niche: ['food', 'baking'], status: 'new', notes: 'Pastry chef' },
  { name: 'Tyler Martinez', email: 'tyler@email.com', phone: '+1-480-555-0403', instagram_handle: '@tylermartinez', instagram_followers: 19000, tiktok_handle: '@tylermartinezgaming', tiktok_followers: 45000, niche: ['gaming', 'esports'], status: 'contacted', notes: 'Gaming streamer' },
  { name: 'Zoe Taylor', email: 'zoe@email.com', phone: '+1-813-555-0404', instagram_handle: '@zoetaylor', instagram_followers: 52000, tiktok_handle: '@zoetaylorfashion', tiktok_followers: 68000, niche: ['fashion', 'vintage'], status: 'inactive', notes: 'Vintage fashion' },
  { name: 'Marcus White', email: 'marcus@email.com', phone: '+1-330-555-0405', instagram_handle: '@marcuswhite', instagram_followers: 37000, tiktok_handle: '@marcuswhitetech', tiktok_followers: 48000, niche: ['tech', 'coding'], status: 'rejected', notes: 'Tech educator' }
]

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Skip authentication check for seeding
    // In production, you'd want to check for a secret key or admin role

    // Clear existing data
    await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('influencers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert brands
    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .insert(brands)
      .select()

    if (brandsError) {
      console.error('Brands error:', brandsError)
      return NextResponse.json({ error: 'Failed to insert brands', details: brandsError }, { status: 500 })
    }

    // Insert influencers
    const { data: influencersData, error: influencersError } = await supabase
      .from('influencers')
      .insert(influencers)
      .select()

    if (influencersError) {
      console.error('Influencers error:', influencersError)
      return NextResponse.json({ error: 'Failed to insert influencers', details: influencersError }, { status: 500 })
    }

    // Add sample campaigns
    const campaigns = [
      {
        brand_id: brandsData[0].id,
        influencer_id: influencersData[1].id,
        campaign_name: 'Nike Summer Fitness 2024',
        status: 'active',
        start_date: '2024-02-01',
        end_date: '2024-04-30',
        budget: 50000,
        actual_cost: 45000,
        target_views: 1000000,
        actual_views: 850000,
        notes: 'Fitness campaign'
      },
      {
        brand_id: brandsData[1].id,
        influencer_id: influencersData[2].id,
        campaign_name: 'Sephora Spring Beauty',
        status: 'active',
        start_date: '2024-02-15',
        end_date: '2024-05-15',
        budget: 35000,
        target_views: 750000,
        notes: 'Beauty campaign'
      },
      {
        brand_id: brandsData[3].id,
        influencer_id: influencersData[0].id,
        campaign_name: 'Fashion Nova Collection',
        status: 'completed',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        budget: 75000,
        actual_cost: 70000,
        target_views: 2000000,
        actual_views: 2150000,
        notes: 'Fashion campaign'
      }
    ]

    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .insert(campaigns)
      .select()

    if (campaignsError) {
      console.error('Campaigns error:', campaignsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        brands: brandsData?.length || 0,
        influencers: influencersData?.length || 0,
        campaigns: campaignsData?.length || 0
      },
      message: 'Sample data added successfully!'
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}