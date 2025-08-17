#!/usr/bin/env node

/**
 * Insert 16 new brands using existing columns only
 * Run: node scripts/insert-brands-only.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Use service role key to bypass RLS policies
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 16 new brands to insert (using only existing columns)
const newBrands = [
  { name: 'Bauhaus', industry: 'Home Improvement' },
  { name: 'Zahnheld', industry: 'Healthcare' },
  { name: 'Vonmählen', industry: 'Tech Accessories' },
  { name: '305 Care', industry: 'Beauty & Personal Care' },
  { name: 'TerraCanis', industry: 'Pet Food' },
  { name: 'Maica (IOS Suit)', industry: 'Fashion Tech' },
  { name: 'Lotto24', industry: 'Gaming & Lottery' },
  { name: 'ImmoScout24', industry: 'Real Estate' },
  { name: 'Ethernal (Kiki Koala)', industry: 'Children Products' },
  { name: 'Rudelkönig', industry: 'Pet Products' },
  { name: 'Hydraid', industry: 'Sports & Hydration' },
  { name: 'GirlGotLashes', industry: 'Beauty' },
  { name: 'IEA Medical', industry: 'Medical Devices' },
  { name: 'Farben Löwe', industry: 'Paint & Coatings' },
  { name: 'Valktental', industry: 'Outdoor & Sports' },
  { name: 'Kulturwerke', industry: 'Arts & Culture' }
];

async function checkExistingBrands() {
  console.log('🔍 Checking for existing brands with the same names...\n');

  try {
    const brandNames = newBrands.map(brand => brand.name);
    
    const { data: existingBrands, error } = await supabase
      .from('brands')
      .select('name')
      .in('name', brandNames);

    if (error) {
      throw error;
    }

    if (existingBrands && existingBrands.length > 0) {
      console.log(`⚠️  Found ${existingBrands.length} brands that already exist:`);
      existingBrands.forEach(brand => {
        console.log(`   - ${brand.name}`);
      });
      console.log('\n   These will be skipped during insertion.\n');
      
      // Filter out existing brands
      const existingNames = existingBrands.map(b => b.name);
      const brandsToInsert = newBrands.filter(brand => !existingNames.includes(brand.name));
      return brandsToInsert;
    } else {
      console.log('✅ No duplicate brands found. All brands will be inserted.\n');
      return newBrands;
    }

  } catch (error) {
    console.error('❌ Error checking existing brands:', error.message);
    throw error;
  }
}

async function insertBrands(brandsToInsert) {
  if (brandsToInsert.length === 0) {
    console.log('📦 No new brands to insert.\n');
    return [];
  }

  console.log(`📦 Inserting ${brandsToInsert.length} new brands...\n`);

  try {
    const { data: insertedBrands, error: insertError } = await supabase
      .from('brands')
      .insert(brandsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Successfully inserted ${insertedBrands.length} new brands\n`);
    return insertedBrands;

  } catch (error) {
    console.error('❌ Error inserting brands:', error.message);
    throw error;
  }
}

async function verifyAllBrands() {
  console.log('🔍 Verifying all brands from our list...\n');

  try {
    const brandNames = newBrands.map(brand => brand.name);
    
    const { data: verifiedBrands, error: verifyError } = await supabase
      .from('brands')
      .select('*')
      .in('name', brandNames)
      .order('created_at', { ascending: false });

    if (verifyError) {
      throw verifyError;
    }

    console.log(`📊 Found ${verifiedBrands.length} brands in database:\n`);
    
    verifiedBrands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (${brand.industry})`);
      console.log(`   ID: ${brand.id}`);
      console.log(`   Created: ${new Date(brand.created_at).toLocaleString()}`);
      if (brand.website) console.log(`   Website: ${brand.website}`);
      if (brand.contact_email) console.log(`   Email: ${brand.contact_email}`);
      console.log('');
    });

    return verifiedBrands;

  } catch (error) {
    console.error('❌ Error verifying brands:', error.message);
    throw error;
  }
}

async function checkTableStructure() {
  console.log('🔍 Checking brands table structure...\n');

  try {
    // Try to get table structure information
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      console.log('✅ Brands table structure (existing columns):');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`   - ${col}`);
      });
      console.log('');

      // Check if additional columns exist
      const additionalColumns = ['address', 'instagram_url', 'twitter_url', 'youtube_url', 'updated_at'];
      const missingColumns = additionalColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️  Missing columns that need to be added:');
        missingColumns.forEach(col => {
          console.log(`   - ${col}`);
        });
        console.log('\n📝 To add these columns, run the SQL script: scripts/add-brand-columns.sql\n');
      } else {
        console.log('✅ All additional columns are present!\n');
      }
    } else {
      console.log('⚠️  Table is empty, cannot check column structure\n');
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting brand insertion process...\n');

  try {
    // Step 1: Check table structure
    await checkTableStructure();

    // Step 2: Check for existing brands
    const brandsToInsert = await checkExistingBrands();

    // Step 3: Insert new brands
    await insertBrands(brandsToInsert);

    // Step 4: Verify all brands
    await verifyAllBrands();

    console.log('🎉 Brand insertion process completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Checked brands table structure');
    console.log('   ✅ Checked for duplicate brands');
    console.log(`   ✅ Processed ${newBrands.length} brands from the list`);
    console.log('   ✅ Verified all brands in database');
    console.log('\n💡 Next steps:');
    console.log('   1. Run scripts/add-brand-columns.sql in Supabase to add missing columns');
    console.log('   2. Update brand records with additional information as needed');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();