#!/usr/bin/env python3
import csv
import sys

# Read the CSV file
csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

print("""-- ============================================
-- COMPLETE CAMPAIGN IMPORT FOR SUPABASE
-- Generated from CSV file with proper escaping
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the import function
CREATE OR REPLACE FUNCTION import_campaign_batch(
  p_brand_name text,
  p_influencer_name text,
  p_channel text,
  p_content_type text,
  p_story_date date,
  p_reminder_date date,
  p_teaser_date date,
  p_has_reminder boolean,
  p_has_teaser boolean,
  p_cost numeric,
  p_est_views integer,
  p_real_views integer,
  p_cpm numeric,
  p_link_clicks integer,
  p_revenue numeric,
  p_roas numeric,
  p_product text,
  p_month text,
  p_year integer,
  p_manager text,
  p_status text
) RETURNS void AS $$
DECLARE
  v_brand_id uuid;
  v_influencer_id uuid;
BEGIN
  -- Get brand ID
  SELECT id INTO v_brand_id FROM brands WHERE name = p_brand_name LIMIT 1;
  -- Get influencer ID
  SELECT id INTO v_influencer_id FROM influencers WHERE name = p_influencer_name LIMIT 1;
  
  -- Only insert if both IDs exist
  IF v_brand_id IS NOT NULL AND v_influencer_id IS NOT NULL THEN
    INSERT INTO campaigns (
      brand_id, influencer_id, campaign_name,
      channel, content_type, story_public_date,
      reminder_date, teaser_date, has_reminder, has_teaser,
      actual_cost, target_views, actual_views, cpm_estimated,
      link_clicks, revenue, roas, promoted_product,
      campaign_month, campaign_year, manager_code, status
    ) VALUES (
      v_brand_id, v_influencer_id, 
      p_brand_name || ' - ' || p_influencer_name || ' - ' || COALESCE(p_month, '') || ' ' || COALESCE(p_year::text, ''),
      CASE WHEN p_channel = 'ig' THEN 'instagram' WHEN p_channel = 'yt' THEN 'youtube' ELSE p_channel END,
      p_content_type, p_story_date,
      p_reminder_date, p_teaser_date, p_has_reminder, p_has_teaser,
      p_cost, p_est_views, p_real_views, p_cpm,
      p_link_clicks, p_revenue, p_roas, p_product,
      p_month, p_year, p_manager,
      CASE WHEN p_status = 'done' THEN 'completed' 
           WHEN p_status = 'tbd' THEN 'planned' 
           ELSE 'active' END
    )
    ON CONFLICT (brand_id, influencer_id, story_public_date, content_type) 
    WHERE story_public_date IS NOT NULL
    DO UPDATE SET
      actual_cost = EXCLUDED.actual_cost,
      target_views = EXCLUDED.target_views,
      actual_views = EXCLUDED.actual_views,
      cpm_estimated = EXCLUDED.cpm_estimated,
      link_clicks = EXCLUDED.link_clicks,
      revenue = EXCLUDED.revenue,
      roas = EXCLUDED.roas,
      promoted_product = EXCLUDED.promoted_product;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Import all campaigns
""")

with open(csv_file, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    campaign_count = 0
    
    for row in reader:
        # Skip empty rows
        if not row.get('Brand') or not row.get('Influencer'):
            continue
            
        # Clean and prepare values - properly escape single quotes
        def escape_string(val):
            if not val or val.strip() == '':
                return 'NULL'
            # Replace single quotes with doubled single quotes for SQL
            escaped = val.strip().replace("'", "''")
            return f"'{escaped}'"
        
        brand = escape_string(row.get('Brand', ''))
        influencer = escape_string(row.get('Influencer', ''))
        channel = escape_string(row.get('Channel', ''))
        content_type = escape_string(row.get('Content', ''))
        
        # Handle dates
        story_date = row.get('Story_Public_Date', '').strip()
        if story_date:
            if story_date.startswith('2025-12'):
                story_date = story_date.replace('2025', '2024')
            story_date = f"'{story_date}'"
        else:
            story_date = 'NULL'
            
        reminder_date = 'NULL'
        teaser_date = 'NULL'
        if row.get('Reminder_oder__Teaser?') == 'reminder' and row.get('Wann?'):
            reminder_date = f"'{row['Wann?'].strip()}'"
        elif row.get('Reminder_oder__Teaser?') == 'teaser' and row.get('Wann?'):
            teaser_date = f"'{row['Wann?'].strip()}'"
            
        # Boolean flags
        has_reminder = 'true' if 'rem.' in row.get('Content', '') else 'false'
        has_teaser = 'true' if 'teaser' in row.get('Content', '') else 'false'
        
        # Numeric values
        def format_numeric(val):
            if not val or val == '':
                return 'NULL'
            try:
                return str(float(val.replace(',', '.')))
            except:
                return 'NULL'
        
        def format_int(val):
            if not val or val == '':
                return 'NULL'
            try:
                return str(int(float(val.replace(',', '.'))))
            except:
                return 'NULL'
        
        cost = format_numeric(row.get('Preis', ''))
        est_views = format_int(row.get('Est._Views', ''))
        real_views = format_int(row.get('Real_Views', ''))
        cpm = format_numeric(row.get('CPM', ''))
        link_clicks = format_int(row.get('Link_Klicks', ''))
        revenue = format_numeric(row.get('Umsatz', ''))
        roas = format_numeric(row.get('ROAS', ''))
        
        # Product name - properly escape single quotes
        product = escape_string(row.get('Beworbenes__Produkt', ''))
        
        month = escape_string(row.get('Monat', ''))
        year = 2024  # Default year
        
        # Try to extract year from date
        if story_date != 'NULL':
            try:
                year_str = story_date.strip("'").split('-')[0]
                year = int(year_str) if year_str.isdigit() else 2024
            except:
                year = 2024
                
        manager = escape_string(row.get('Zuständigkeit', ''))
        status = escape_string(row.get('Status', 'active'))
        
        # Generate the SQL function call
        print(f"SELECT import_campaign_batch({brand}, {influencer}, {channel}, {content_type}, "
              f"{story_date}, {reminder_date}, {teaser_date}, {has_reminder}, {has_teaser}, "
              f"{cost}, {est_views}, {real_views}, {cpm}, {link_clicks}, {revenue}, {roas}, "
              f"{product}, {month}, {year}, {manager}, {status});")
        
        campaign_count += 1

print(f"\n-- Total campaigns imported: {campaign_count}")
print("\n-- Step 3: Clean up function after import")
print("DROP FUNCTION IF EXISTS import_campaign_batch;")
print("\n-- Step 4: Verify final counts")
print("SELECT 'Total Campaigns' as metric, COUNT(*) as count FROM campaigns;")