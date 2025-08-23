#!/usr/bin/env python3
import csv
import json
from datetime import datetime

# Read the CSV file
csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

# Parse German date format
def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    # Handle YYYY-MM-DD format
    if '-' in date_str and len(date_str.split('-')[0]) == 4:
        # Fix year 2025 typo (should be 2024)
        if date_str.startswith('2025-12'):
            date_str = date_str.replace('2025', '2024')
        return date_str
    return None

# Parse numeric values
def parse_numeric(value):
    if not value or value == '':
        return None
    return float(str(value).replace(',', '.'))

# Parse integer values
def parse_integer(value):
    if not value or value == '':
        return None
    # Handle float strings (e.g., "10000.0")
    value_str = str(value).replace(',', '')
    if '.' in value_str:
        return int(float(value_str))
    return int(value_str)

# Read CSV and prepare data
brands = {}
influencers = {}
campaigns = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Skip rows without brand or influencer
        if not row['Brand'] or not row['Influencer']:
            continue
        
        # Collect unique brands
        if row['Brand'] not in brands:
            brands[row['Brand']] = {
                'name': row['Brand']
            }
        
        # Collect unique influencers
        if row['Influencer'] not in influencers:
            handle = row['Influencer'].lower().replace(' ', '').replace('.', '').replace('_', '')
            influencers[row['Influencer']] = {
                'name': row['Influencer'],
                'instagram_handle': row['Influencer'].lower(),
                'status': 'active'
            }
        
        # Parse campaign data
        public_date = parse_date(row.get('Story_Public_Date'))
        reminder_date = parse_date(row.get('Wann?'))
        teaser_date = parse_date(row.get('Wann?'))
        
        content_type = row.get('Content', '')
        has_reminder = 'rem.' in content_type if content_type else False
        has_teaser = 'teaser' in content_type if content_type else False
        
        # Determine campaign month and year
        campaign_month = row.get('Monat')
        campaign_year = 2024  # Default year
        
        if public_date:
            date_obj = datetime.strptime(public_date, '%Y-%m-%d')
            campaign_year = date_obj.year
            if not campaign_month:
                months = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December']
                campaign_month = months[date_obj.month - 1]
        
        campaign = {
            'brand_name': row['Brand'],
            'influencer_name': row['Influencer'],
            'channel': 'instagram' if row.get('Channel') == 'ig' else 'youtube' if row.get('Channel') == 'yt' else None,
            'content_type': content_type,
            'story_public_date': public_date,
            'reminder_date': reminder_date if row.get('Reminder_oder__Teaser?') == 'reminder' else None,
            'teaser_date': teaser_date if row.get('Reminder_oder__Teaser?') == 'teaser' else None,
            'has_reminder': has_reminder,
            'has_teaser': has_teaser,
            'actual_cost': parse_numeric(row.get('Preis')),
            'target_views': parse_integer(row.get('Est._Views')),
            'cpm_estimated': parse_numeric(row.get('CPM')),
            'link_clicks': parse_integer(row.get('Link_Klicks')),
            'actual_views': parse_integer(row.get('Real_Views')),
            'revenue': parse_numeric(row.get('Umsatz')),
            'roas': parse_numeric(row.get('ROAS')),
            'promoted_product': row.get('Beworbenes__Produkt') if row.get('Beworbenes__Produkt') else None,
            'campaign_month': campaign_month,
            'campaign_year': campaign_year,
            'manager_code': row.get('Zuständigkeit') if row.get('Zuständigkeit') else None,
            'status': 'completed' if row.get('Status') == 'done' else 'planned' if row.get('Status') == 'tbd' else 'active'
        }
        campaigns.append(campaign)

print(f"Found {len(brands)} unique brands")
print(f"Found {len(influencers)} unique influencers")
print(f"Found {len(campaigns)} campaigns to import")

# Generate SQL for brands
print("\n-- Inserting Brands --")
for brand_name, brand in brands.items():
    sql = f"""
INSERT INTO brands (name, created_at) 
VALUES ('{brand_name.replace("'", "''")}', NOW())
ON CONFLICT (name) DO NOTHING;"""
    print(sql)

# Generate SQL for influencers
print("\n-- Inserting Influencers --")
for influencer_name, influencer in influencers.items():
    sql = f"""
INSERT INTO influencers (name, instagram_handle, status, created_at, updated_at)
VALUES ('{influencer_name.replace("'", "''")}', '{influencer['instagram_handle'].replace("'", "''")}', '{influencer['status']}', NOW(), NOW())
ON CONFLICT (instagram_handle) DO UPDATE SET name = EXCLUDED.name;"""
    print(sql)

# Generate SQL for campaigns
print("\n-- Inserting Campaigns --")
for i, campaign in enumerate(campaigns):
    # Build the SQL with proper NULL handling
    values = []
    brand_name_escaped = campaign['brand_name'].replace("'", "''")
    influencer_name_escaped = campaign['influencer_name'].replace("'", "''")
    
    values.append(f"(SELECT id FROM brands WHERE name = '{brand_name_escaped}' LIMIT 1)")
    values.append(f"(SELECT id FROM influencers WHERE name = '{influencer_name_escaped}' LIMIT 1)")
    
    campaign_name = f"{campaign['brand_name']} - {campaign['influencer_name']} - {campaign['campaign_month'] or ''} {campaign['campaign_year'] or ''}".strip()
    campaign_name_escaped = campaign_name.replace("'", "''")
    values.append(f"'{campaign_name_escaped}'")
    
    # Add nullable fields
    fields = ['channel', 'content_type', 'story_public_date', 'reminder_date', 'teaser_date',
              'actual_cost', 'target_views', 'cpm_estimated', 'link_clicks', 'actual_views',
              'revenue', 'roas', 'promoted_product', 'campaign_month', 'manager_code', 'status']
    
    for field in fields:
        val = campaign.get(field)
        if val is None:
            values.append('NULL')
        elif isinstance(val, str):
            val_escaped = val.replace("'", "''")
            values.append(f"'{val_escaped}'")
        elif isinstance(val, bool):
            values.append('TRUE' if val else 'FALSE')
        else:
            values.append(str(val))
    
    values.append(str(campaign.get('campaign_year', 2024)))
    values.append('TRUE' if campaign.get('has_reminder') else 'FALSE')
    values.append('TRUE' if campaign.get('has_teaser') else 'FALSE')
    
    sql = f"""
INSERT INTO campaigns (
    brand_id, influencer_id, campaign_name, channel, content_type,
    story_public_date, reminder_date, teaser_date, actual_cost, target_views,
    cpm_estimated, link_clicks, actual_views, revenue, roas,
    promoted_product, campaign_month, manager_code, status, campaign_year,
    has_reminder, has_teaser, created_at
) VALUES (
    {values[0]}, {values[1]}, {values[2]}, {values[3]}, {values[4]},
    {values[5]}, {values[6]}, {values[7]}, {values[8]}, {values[9]},
    {values[10]}, {values[11]}, {values[12]}, {values[13]}, {values[14]},
    {values[15]}, {values[16]}, {values[17]}, {values[18]}, {values[19]},
    {values[20]}, {values[21]}, NOW()
)
ON CONFLICT DO NOTHING;"""
    
    if i < 5:  # Print first 5 as examples
        print(sql)

print(f"\n-- Total: {len(campaigns)} campaigns to insert --")