const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parse/sync');

// Supabase configuration
const supabaseUrl = 'https://yaxwwlntgnnmykipshps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheHd3bG50Z25ubXlraXBzaHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjI2ODYsImV4cCI6MjA3MDkzODY4Nn0.whGkBLdfwhOsu-6dMMq40sMOGT5QS7zT0RaUz9O83Qg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importAllData() {
  // Read CSV
  const csvContent = fs.readFileSync('/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv', 'utf-8');
  const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  // Collect unique brands and influencers
  const brandsSet = new Set();
  const influencersSet = new Set();
  
  records.forEach(record => {
    if (record.Brand) brandsSet.add(record.Brand.trim());
    if (record.Influencer) influencersSet.add(record.Influencer.trim());
  });

  console.log(`Found ${brandsSet.size} unique brands`);
  console.log(`Found ${influencersSet.size} unique influencers`);
  console.log(`Found ${records.length} total records`);

  // Get existing brands and influencers from database
  const { data: existingBrands } = await supabase
    .from('brands')
    .select('id, name');
  
  const { data: existingInfluencers } = await supabase
    .from('influencers')
    .select('id, name');

  // Create maps for quick lookup
  const brandMap = new Map();
  existingBrands?.forEach(b => brandMap.set(b.name, b.id));
  
  const influencerMap = new Map();
  existingInfluencers?.forEach(i => influencerMap.set(i.name, i.id));

  // Insert missing brands
  const missingBrands = Array.from(brandsSet).filter(b => !brandMap.has(b));
  if (missingBrands.length > 0) {
    console.log(`Inserting ${missingBrands.length} missing brands...`);
    const { data: newBrands, error } = await supabase
      .from('brands')
      .insert(missingBrands.map(name => ({ name })))
      .select();
    
    if (error) {
      console.error('Error inserting brands:', error);
    } else {
      newBrands?.forEach(b => brandMap.set(b.name, b.id));
    }
  }

  // Insert missing influencers
  const missingInfluencers = Array.from(influencersSet).filter(i => !influencerMap.has(i));
  if (missingInfluencers.length > 0) {
    console.log(`Inserting ${missingInfluencers.length} missing influencers...`);
    
    // Batch insert in chunks of 50
    for (let i = 0; i < missingInfluencers.length; i += 50) {
      const chunk = missingInfluencers.slice(i, i + 50);
      const { data: newInfluencers, error } = await supabase
        .from('influencers')
        .insert(chunk.map(name => ({
          name,
          instagram_handle: name.toLowerCase().replace(/[^a-z0-9._]/g, ''),
          status: 'active'
        })))
        .select();
      
      if (error) {
        console.error(`Error inserting influencers batch ${i/50 + 1}:`, error);
      } else {
        newInfluencers?.forEach(inf => influencerMap.set(inf.name, inf.id));
        console.log(`  Inserted batch ${i/50 + 1} (${chunk.length} influencers)`);
      }
    }
  }

  // Prepare campaigns for import
  const campaigns = [];
  records.forEach(record => {
    if (!record.Brand || !record.Influencer) return;
    
    const brandId = brandMap.get(record.Brand.trim());
    const influencerId = influencerMap.get(record.Influencer.trim());
    
    if (!brandId || !influencerId) {
      console.error(`Missing IDs for: ${record.Brand} / ${record.Influencer}`);
      return;
    }

    // Parse date
    let storyDate = record.Story_Public_Date;
    if (storyDate && storyDate.startsWith('2025-12')) {
      storyDate = storyDate.replace('2025', '2024');
    }

    // Parse numbers
    const parseNum = (val) => {
      if (!val || val === '') return null;
      const num = parseFloat(val.toString().replace(',', '.'));
      return isNaN(num) ? null : num;
    };

    const parseInt = (val) => {
      if (!val || val === '') return null;
      const num = parseInt(val.toString().replace(',', ''));
      return isNaN(num) ? null : num;
    };

    // Determine month and year
    let month = record.Monat;
    let year = 2024;
    if (storyDate) {
      const dateObj = new Date(storyDate);
      if (!isNaN(dateObj)) {
        year = dateObj.getFullYear();
        if (!month) {
          const months = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
          month = months[dateObj.getMonth()];
        }
      }
    }

    campaigns.push({
      brand_id: brandId,
      influencer_id: influencerId,
      campaign_name: `${record.Brand} - ${record.Influencer} - ${month || ''} ${year}`.trim(),
      channel: record.Channel === 'ig' ? 'instagram' : record.Channel === 'yt' ? 'youtube' : null,
      content_type: record.Content,
      story_public_date: storyDate || null,
      reminder_date: record['Reminder_oder__Teaser?'] === 'reminder' ? record['Wann?'] : null,
      teaser_date: record['Reminder_oder__Teaser?'] === 'teaser' ? record['Wann?'] : null,
      has_reminder: record.Content?.includes('rem.') || false,
      has_teaser: record.Content?.includes('teaser') || false,
      actual_cost: parseNum(record.Preis),
      target_views: parseInt(record['Est._Views']),
      actual_views: parseInt(record.Real_Views),
      cpm_estimated: parseNum(record.CPM),
      link_clicks: parseInt(record.Link_Klicks),
      revenue: parseNum(record.Umsatz),
      roas: parseNum(record.ROAS),
      promoted_product: record['Beworbenes__Produkt'] || null,
      campaign_month: month,
      campaign_year: year,
      manager_code: record['Zuständigkeit'] || null,
      status: record.Status === 'done' ? 'completed' : record.Status === 'tbd' ? 'planned' : 'active'
    });
  });

  console.log(`\nPrepared ${campaigns.length} campaigns for import`);

  // Import campaigns in batches
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < campaigns.length; i += batchSize) {
    const batch = campaigns.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('campaigns')
      .upsert(batch, {
        onConflict: 'brand_id,influencer_id,story_public_date,content_type',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`  Batch ${Math.floor(i/batchSize) + 1}: Imported ${batch.length} campaigns`);
    }
  }

  console.log(`\n✅ Import completed!`);
  console.log(`   - ${successCount} campaigns processed successfully`);
  console.log(`   - ${errorCount} campaigns had errors`);

  // Final count check
  const { count: finalBrands } = await supabase.from('brands').select('*', { count: 'exact', head: true });
  const { count: finalInfluencers } = await supabase.from('influencers').select('*', { count: 'exact', head: true });
  const { count: finalCampaigns } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });

  console.log(`\n📊 Final database counts:`);
  console.log(`   - Brands: ${finalBrands}`);
  console.log(`   - Influencers: ${finalInfluencers}`);
  console.log(`   - Campaigns: ${finalCampaigns}`);
}

importAllData().catch(console.error);