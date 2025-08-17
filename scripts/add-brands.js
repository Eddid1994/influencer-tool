const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Using Supabase URL:', supabaseUrl)
console.log('Service key found:', !!supabaseServiceKey)

if (!supabaseUrl) {
  console.error('Missing Supabase URL')
  process.exit(1)
}

// Use the anon key since service key seems invalid
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!anonKey) {
  console.error('Missing Supabase anon key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

const brands = [
  { name: 'Bauhaus', industry: 'Home Improvement', notes: 'German home improvement and gardening retailer' },
  { name: 'Zahnheld', industry: 'Healthcare', notes: 'Dental care and oral health products' },
  { name: 'Vonmählen', industry: 'Tech Accessories', notes: 'Premium tech accessories and lifestyle products' },
  { name: '305 Care', industry: 'Beauty & Personal Care', notes: 'Personal care and wellness products' },
  { name: 'TerraCanis', industry: 'Pet Food', notes: 'Premium natural pet food and nutrition' },
  { name: 'Maica (IOS Suit)', industry: 'Fashion Tech', notes: 'Smart fashion and wearable technology' },
  { name: 'Lotto24', industry: 'Gaming & Lottery', notes: 'Online lottery platform' },
  { name: 'ImmoScout24', industry: 'Real Estate', notes: 'Leading real estate marketplace in Germany' },
  { name: 'Ethernal (Kiki Koala)', industry: 'Children Products', notes: 'Sustainable children products and toys' },
  { name: 'Rudelkönig', industry: 'Pet Products', notes: 'Pet accessories and lifestyle products' },
  { name: 'Hydraid', industry: 'Sports & Hydration', notes: 'Hydration and sports nutrition products' },
  { name: 'GirlGotLashes', industry: 'Beauty', notes: 'Lash and beauty products' },
  { name: 'IEA Medical', industry: 'Medical Devices', notes: 'Medical equipment and healthcare solutions' },
  { name: 'Farben Löwe', industry: 'Paint & Coatings', notes: 'Professional paint and coating products' },
  { name: 'Valktental', industry: 'Outdoor & Sports', notes: 'Outdoor gear and sporting equipment' },
  { name: 'Kulturwerke', industry: 'Arts & Culture', notes: 'Cultural events and creative services' }
]

async function addBrands() {
  console.log('🚀 Starting to add brands...\n')

  // First, check which brands already exist
  const { data: existingBrands, error: fetchError } = await supabase
    .from('brands')
    .select('name')

  if (fetchError) {
    console.error('Error fetching existing brands:', fetchError)
    return
  }

  const existingNames = new Set(existingBrands?.map(b => b.name) || [])
  const brandsToAdd = brands.filter(brand => !existingNames.has(brand.name))

  if (brandsToAdd.length === 0) {
    console.log('✅ All brands already exist in the database')
    return
  }

  console.log(`Adding ${brandsToAdd.length} new brands...`)

  // Add brands one by one to show progress
  for (const brand of brandsToAdd) {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()

    if (error) {
      console.error(`❌ Error adding ${brand.name}:`, error.message)
    } else {
      console.log(`✅ Added: ${brand.name} (${brand.industry})`)
    }
  }

  // Fetch and display all brands
  const { data: allBrands, error: allError } = await supabase
    .from('brands')
    .select('name, industry')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!allError && allBrands) {
    console.log('\n📊 Recent brands in database:')
    console.table(allBrands)
  }

  console.log('\n✨ Brand addition complete!')
}

addBrands().catch(console.error)