#!/usr/bin/env node

/**
 * Simple seed script for Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Hardcode the credentials temporarily for seeding
const SUPABASE_URL = 'https://yaxwwlntgnnmykipshps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheHd3bG50Z25ubXlraXBzaHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjI2ODYsImV4cCI6MjA3MDkzODY4Nn0.whGkBLdfwhOsu-6dMMq40sMOGT5QS7zT0RaUz9O83Qg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedData() {
  console.log('🌱 Starting simple seed...\n');

  try {
    // First, sign in with a test user or create one
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'edvin@mabted.com',
      password: 'snocks123',
    });

    if (authError && authError.message !== 'User already registered') {
      console.error('Auth error:', authError);
      return;
    }

    // If user exists, sign in
    if (authError?.message === 'User already registered') {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'edvin@mabted.com',
        password: 'snocks123',
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        return;
      }
      console.log('✅ Signed in successfully');
    } else {
      console.log('✅ User created/signed in');
    }

    // Simple test data
    const testBrand = {
      name: 'Test Brand ' + Date.now(),
      website: 'https://test.com',
      industry: 'Test',
      contact_email: 'test@test.com',
      notes: 'Test brand for seeding'
    };

    // Try inserting a brand
    console.log('📦 Testing brand insertion...');
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .insert([testBrand])
      .select();

    if (brandError) {
      console.error('❌ Brand error:', brandError);
    } else {
      console.log('✅ Brand inserted:', brandData);
    }

    // Try inserting an influencer
    const testInfluencer = {
      name: 'Test Influencer ' + Date.now(),
      email: 'test@influencer.com',
      instagram_handle: '@test',
      instagram_followers: 1000,
      niche: ['test'],
      status: 'active',
      notes: 'Test influencer'
    };

    console.log('👥 Testing influencer insertion...');
    const { data: influencerData, error: influencerError } = await supabase
      .from('influencers')
      .insert([testInfluencer])
      .select();

    if (influencerError) {
      console.error('❌ Influencer error:', influencerError);
    } else {
      console.log('✅ Influencer inserted:', influencerData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedData();