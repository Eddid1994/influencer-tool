#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Run this to verify your Supabase connection and database setup
 * Usage: node scripts/verify-setup.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifySetup() {
  log('\n🔍 Verifying Supabase Setup for Visca CRM\n', 'cyan');

  // Step 1: Check environment variables
  log('1. Checking environment variables...', 'blue');
  
  if (!SUPABASE_URL) {
    log('   ❌ NEXT_PUBLIC_SUPABASE_URL is not set', 'red');
    log('   Please add it to your .env.local file', 'yellow');
    process.exit(1);
  }
  log('   ✅ SUPABASE_URL found: ' + SUPABASE_URL, 'green');

  if (!SUPABASE_ANON_KEY) {
    log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set', 'red');
    log('   Please add it to your .env.local file', 'yellow');
    process.exit(1);
  }
  log('   ✅ SUPABASE_ANON_KEY found (hidden for security)', 'green');

  // Step 2: Test connection
  log('\n2. Testing connection to Supabase...', 'blue');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await supabase.from('brands').select('count', { count: 'exact', head: true });
    if (error) throw error;
    log('   ✅ Successfully connected to Supabase', 'green');
  } catch (error) {
    log('   ❌ Failed to connect to Supabase', 'red');
    log(`   Error: ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 3: Check tables exist
  log('\n3. Checking database tables...', 'blue');
  const tables = ['profiles', 'influencers', 'brands', 'campaigns', 'activities'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      log(`   ✅ Table '${table}' exists (${count || 0} records)`, 'green');
    } catch (error) {
      log(`   ❌ Table '${table}' not found or inaccessible`, 'red');
      log(`   Error: ${error.message}`, 'red');
      log('   Run the migration SQL in your Supabase dashboard', 'yellow');
    }
  }

  // Step 4: Test authentication
  log('\n4. Testing authentication setup...', 'blue');
  
  try {
    // Try to sign up a test user (will fail if email is taken, which is fine)
    const testEmail = `test-${Date.now()}@visca-crm.test`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    if (error && error.message.includes('email_address_not_authorized')) {
      log('   ⚠️  Email confirmation is required (good for production)', 'yellow');
    } else if (error && !error.message.includes('already registered')) {
      throw error;
    } else {
      log('   ✅ Authentication is configured correctly', 'green');
      
      // Clean up test user if created
      if (data?.user) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
        if (!deleteError) {
          log('   🧹 Test user cleaned up', 'cyan');
        }
      }
    }
  } catch (error) {
    log('   ❌ Authentication test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
  }

  // Step 5: Check RLS policies
  log('\n5. Checking Row Level Security...', 'blue');
  
  // This will fail if RLS is properly configured (which is good)
  const { data: rlsTest, error: rlsError } = await supabase
    .from('influencers')
    .select('*')
    .limit(1);
  
  if (rlsError && rlsError.message.includes('JWT')) {
    log('   ✅ RLS is enabled (authentication required)', 'green');
  } else if (!rlsError && !rlsTest?.length) {
    log('   ✅ RLS is enabled (no unauthorized access)', 'green');
  } else {
    log('   ⚠️  RLS might not be properly configured', 'yellow');
    log('   Make sure RLS policies are applied', 'yellow');
  }

  // Step 6: Performance check
  log('\n6. Checking database performance...', 'blue');
  
  const startTime = Date.now();
  try {
    await Promise.all([
      supabase.from('influencers').select('count', { count: 'exact', head: true }),
      supabase.from('brands').select('count', { count: 'exact', head: true }),
      supabase.from('campaigns').select('count', { count: 'exact', head: true })
    ]);
    const responseTime = Date.now() - startTime;
    
    if (responseTime < 500) {
      log(`   ✅ Database response time: ${responseTime}ms (excellent)`, 'green');
    } else if (responseTime < 1000) {
      log(`   ✅ Database response time: ${responseTime}ms (good)`, 'green');
    } else {
      log(`   ⚠️  Database response time: ${responseTime}ms (slow)`, 'yellow');
    }
  } catch (error) {
    log('   ❌ Performance check failed', 'red');
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('✨ Verification Complete!', 'cyan');
  log('='.repeat(50) + '\n', 'cyan');

  log('Next steps:', 'blue');
  log('1. Run the app: npm run dev', 'white');
  log('2. Visit: http://localhost:3000', 'white');
  log('3. Create an account and start using your CRM!', 'white');
  
  log('\nOptional:', 'blue');
  log('- Add sample data: Run seed.sql in Supabase SQL editor', 'white');
  log('- Configure email: Set up SMTP in Supabase dashboard', 'white');
  log('- Add custom domain: Configure in Authentication settings', 'white');
}

// Run verification
verifySetup().catch(error => {
  log('\n❌ Verification failed with unexpected error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});