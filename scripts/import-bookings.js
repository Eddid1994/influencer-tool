require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read and parse CSV
const csvContent = fs.readFileSync('/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// Helper function to parse German date format
function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  // Handle year 2025 typo (should be 2024)
  if (dateStr.startsWith('2025-12')) {
    dateStr = dateStr.replace('2025', '2024');
  }
  return dateStr;
}

// Helper function to parse numeric values
function parseNumeric(value) {
  if (!value || value === '') return null;
  return parseFloat(value.toString().replace(',', '.'));
}

// Helper function to parse integer values
function parseInteger(value) {
  if (!value || value === '') return null;
  return parseInt(value.toString().replace(',', ''));
}

async function importData() {
  const brands = new Map();
  const influencers = new Map();
  const campaigns = [];

  // Process records
  for (const record of records) {
    // Skip records without brand or influencer
    if (!record.Brand || !record.Influencer) continue;

    // Collect unique brands
    if (!brands.has(record.Brand)) {
      brands.set(record.Brand, {
        name: record.Brand
      });
    }

    // Collect unique influencers
    if (!influencers.has(record.Influencer)) {
      const handle = record.Influencer.toLowerCase().replace(/[^a-z0-9._]/g, '');
      influencers.set(record.Influencer, {
        name: record.Influencer,
        instagram_handle: handle,
        status: 'active'
      });
    }

    // Parse campaign data
    const publicDate = parseDate(record.Story_Public_Date);
    const reminderDate = parseDate(record['Wann?']);
    const teaserDate = parseDate(record['Wann?']);
    
    let contentType = record.Content;
    let hasReminder = false;
    let hasTeaser = false;
    
    if (contentType && contentType.includes('rem.')) {
      hasReminder = true;
    }
    if (contentType && contentType.includes('teaser')) {
      hasTeaser = true;
    }

    // Determine campaign month and year
    let campaignMonth = record.Monat || null;
    let campaignYear = 2024; // Default year
    
    if (publicDate) {
      const dateObj = new Date(publicDate);
      campaignYear = dateObj.getFullYear();
      if (!campaignMonth) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        campaignMonth = months[dateObj.getMonth()];
      }
    }

    campaigns.push({
      brand_name: record.Brand,
      influencer_name: record.Influencer,
      channel: record.Channel === 'ig' ? 'instagram' : record.Channel === 'yt' ? 'youtube' : null,
      content_type: contentType,
      story_public_date: publicDate,
      reminder_date: record['Reminder_oder__Teaser?'] === 'reminder' ? reminderDate : null,
      teaser_date: record['Reminder_oder__Teaser?'] === 'teaser' ? teaserDate : null,
      has_reminder: hasReminder,
      has_teaser: hasTeaser,
      actual_cost: parseNumeric(record.Preis),
      target_views: parseInteger(record['Est._Views']),
      cpm_estimated: parseNumeric(record.CPM),
      link_clicks: parseInteger(record.Link_Klicks),
      actual_views: parseInteger(record.Real_Views),
      revenue: parseNumeric(record.Umsatz),
      roas: parseNumeric(record.ROAS),
      promoted_product: record['Beworbenes__Produkt'] || null,
      campaign_month: campaignMonth,
      campaign_year: campaignYear,
      manager_code: record['Zuständigkeit'] || null,
      status: record.Status === 'done' ? 'completed' : record.Status === 'tbd' ? 'planned' : 'active'
    });
  }

  console.log(`Found ${brands.size} unique brands`);
  console.log(`Found ${influencers.size} unique influencers`);
  console.log(`Found ${campaigns.length} campaigns to import`);

  // Insert brands
  console.log('\nInserting brands...');
  for (const [name, brand] of brands) {
    const { data, error } = await supabase
      .from('brands')
      .upsert({ name: brand.name }, { onConflict: 'name', ignoreDuplicates: true })
      .select()
      .single();
    
    if (error && error.code !== '23505') { // Ignore unique constraint violations
      console.error(`Error inserting brand ${name}:`, error);
    } else if (data) {
      brands.set(name, { ...brand, id: data.id });
    } else {
      // Fetch existing brand
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', name)
        .single();
      if (existingBrand) {
        brands.set(name, { ...brand, id: existingBrand.id });
      }
    }
  }

  // Insert influencers
  console.log('\nInserting influencers...');
  for (const [name, influencer] of influencers) {
    const { data, error } = await supabase
      .from('influencers')
      .upsert({ 
        name: influencer.name,
        instagram_handle: influencer.instagram_handle,
        status: influencer.status
      }, { 
        onConflict: 'instagram_handle',
        ignoreDuplicates: true 
      })
      .select()
      .single();
    
    if (error && error.code !== '23505') {
      // Try without instagram_handle constraint
      const { data: insertData, error: insertError } = await supabase
        .from('influencers')
        .insert({ 
          name: influencer.name,
          instagram_handle: influencer.instagram_handle,
          status: influencer.status
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error inserting influencer ${name}:`, insertError);
      } else if (insertData) {
        influencers.set(name, { ...influencer, id: insertData.id });
      }
    } else if (data) {
      influencers.set(name, { ...influencer, id: data.id });
    } else {
      // Fetch existing influencer
      const { data: existingInfluencer } = await supabase
        .from('influencers')
        .select('id')
        .or(`name.eq.${name},instagram_handle.eq.${influencer.instagram_handle}`)
        .single();
      if (existingInfluencer) {
        influencers.set(name, { ...influencer, id: existingInfluencer.id });
      }
    }
  }

  // Insert campaigns
  console.log('\nInserting campaigns...');
  let successCount = 0;
  let errorCount = 0;

  for (const campaign of campaigns) {
    const brand = brands.get(campaign.brand_name);
    const influencer = influencers.get(campaign.influencer_name);

    if (!brand?.id || !influencer?.id) {
      console.error(`Missing IDs for campaign: ${campaign.brand_name} - ${campaign.influencer_name}`);
      errorCount++;
      continue;
    }

    // Create campaign name
    const campaignName = `${campaign.brand_name} - ${campaign.influencer_name} - ${campaign.campaign_month || ''} ${campaign.campaign_year || ''}`.trim();

    const campaignData = {
      brand_id: brand.id,
      influencer_id: influencer.id,
      campaign_name: campaignName,
      channel: campaign.channel,
      content_type: campaign.content_type,
      story_public_date: campaign.story_public_date,
      reminder_date: campaign.reminder_date,
      teaser_date: campaign.teaser_date,
      has_reminder: campaign.has_reminder,
      has_teaser: campaign.has_teaser,
      actual_cost: campaign.actual_cost,
      target_views: campaign.target_views,
      cpm_estimated: campaign.cpm_estimated,
      link_clicks: campaign.link_clicks,
      actual_views: campaign.actual_views,
      revenue: campaign.revenue,
      roas: campaign.roas,
      promoted_product: campaign.promoted_product,
      campaign_month: campaign.campaign_month,
      campaign_year: campaign.campaign_year,
      manager_code: campaign.manager_code,
      status: campaign.status
    };

    const { error } = await supabase
      .from('campaigns')
      .upsert(campaignData, {
        onConflict: 'brand_id,influencer_id,story_public_date,content_type',
        ignoreDuplicates: false // Update existing records
      });

    if (error) {
      console.error(`Error inserting campaign:`, error);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Import completed!`);
  console.log(`   - ${successCount} campaigns imported successfully`);
  console.log(`   - ${errorCount} campaigns had errors`);
}

// Run the import
importData().catch(console.error);