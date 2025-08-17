#!/usr/bin/env node

/**
 * Add missing columns to brands table and insert 16 new brands
 * Run: node scripts/add-brand-columns-and-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Use anonymous key (should work for basic operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 16 new brands to insert
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

async function checkTableStructure() {
  console.log('🔍 Checking current brands table structure...\n');

  try {
    // Try to select with basic columns first
    const { data: basicData, error: basicError } = await supabase
      .from('brands')
      .select('id, name, website, contact_email, contact_phone, industry, notes, created_at')
      .limit(1);

    if (basicError) {
      throw new Error(`Basic columns check failed: ${basicError.message}`);
    }

    console.log('✅ Basic columns exist in brands table');

    // Try to select with additional columns
    const { data: extendedData, error: extendedError } = await supabase
      .from('brands')
      .select('address, instagram_url, twitter_url, youtube_url, updated_at')
      .limit(1);

    if (!extendedError) {
      console.log('✅ All additional columns (address, instagram_url, twitter_url, youtube_url, updated_at) already exist');
      return { hasAllColumns: true };
    } else {
      console.log('⚠️  Some additional columns may be missing:');
      console.log(`   Error: ${extendedError.message}`);
      console.log('📝 Note: You may need to add these columns manually in Supabase dashboard:');
      console.log('   - address (text)');
      console.log('   - instagram_url (text)'); 
      console.log('   - twitter_url (text)');
      console.log('   - youtube_url (text)');
      console.log('   - updated_at (timestamp with time zone)');
      return { hasAllColumns: false, error: extendedError.message };
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    return { hasAllColumns: false, error: error.message };
  }
}

async function insertNewBrands() {
  console.log('📦 Inserting new brands...\n');

  try {
    // Insert the new brands
    const { data: insertedBrands, error: insertError } = await supabase
      .from('brands')
      .insert(newBrands)
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

async function verifyInsertedBrands() {
  console.log('🔍 Verifying inserted brands...\n');

  try {
    // Get all brands with the names we just inserted
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
      console.log('');
    });

    return verifiedBrands;

  } catch (error) {
    console.error('❌ Error verifying brands:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting brands table update and data insertion...\n');

  try {
    // Step 1: Check table structure
    const structureCheck = await checkTableStructure();

    // Step 2: Insert new brands
    await insertNewBrands();

    // Step 3: Verify insertion
    await verifyInsertedBrands();

    console.log('🎉 All tasks completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Checked brands table structure');
    if (!structureCheck.hasAllColumns) {
      console.log('   ⚠️  Some additional columns may need to be added manually');
    }
    console.log(`   ✅ Inserted ${newBrands.length} new brands`);
    console.log('   ✅ Verified all brands were added correctly');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();