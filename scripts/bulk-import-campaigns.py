#!/usr/bin/env python3
import csv
import json
from datetime import datetime

csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    if date_str.startswith('2025-12'):
        date_str = date_str.replace('2025', '2024')
    return date_str

def parse_numeric(value):
    if not value or value == '':
        return None
    return float(str(value).replace(',', '.'))

def parse_integer(value):
    if not value or value == '':
        return None
    value_str = str(value).replace(',', '')
    if '.' in value_str:
        return int(float(value_str))
    return int(value_str)

def escape_string(s):
    if s is None:
        return ''
    return s.replace("'", "''")

# Read CSV and collect data
brands = {}
influencers = {}
campaigns = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        if not row['Brand'] or not row['Influencer']:
            continue
            
        # Track brands and influencers
        brands[row['Brand']] = True
        influencers[row['Influencer'].lower()] = row['Influencer']
        
        # Parse campaign data
        public_date = parse_date(row.get('Story_Public_Date'))
        reminder_date = parse_date(row.get('Wann?')) if row.get('Reminder_oder__Teaser?') == 'reminder' else None
        teaser_date = parse_date(row.get('Wann?')) if row.get('Reminder_oder__Teaser?') == 'teaser' else None
        
        content_type = row.get('Content', '')
        has_reminder = 'rem.' in content_type if content_type else False
        has_teaser = 'teaser' in content_type if content_type else False
        
        channel = 'instagram' if row.get('Channel') == 'ig' else 'youtube' if row.get('Channel') == 'yt' else None
        
        actual_cost = parse_numeric(row.get('Preis'))
        target_views = parse_integer(row.get('Est._Views'))
        cpm = parse_numeric(row.get('CPM'))
        link_clicks = parse_integer(row.get('Link_Klicks'))
        actual_views = parse_integer(row.get('Real_Views'))
        revenue = parse_numeric(row.get('Umsatz'))
        roas = parse_numeric(row.get('ROAS'))
        
        product = row.get('Beworbenes__Produkt') if row.get('Beworbenes__Produkt') else None
        month = row.get('Monat') if row.get('Monat') else None
        
        year = 2024
        if public_date:
            try:
                date_obj = datetime.strptime(public_date, '%Y-%m-%d')
                year = date_obj.year
            except:
                pass
        
        manager = row.get('Zuständigkeit') if row.get('Zuständigkeit') else None
        status = 'completed' if row.get('Status') == 'done' else 'planned' if row.get('Status') == 'tbd' else 'active'
        
        campaign_name = f"{row['Brand']} - {row['Influencer']} - {month or ''} {year}".strip()
        
        campaigns.append({
            'brand_name': row['Brand'],
            'influencer_handle': row['Influencer'].lower(),
            'campaign_name': campaign_name,
            'channel': channel,
            'content_type': content_type,
            'story_public_date': public_date,
            'reminder_date': reminder_date,
            'teaser_date': teaser_date,
            'actual_cost': actual_cost,
            'target_views': target_views,
            'cpm_estimated': cpm,
            'link_clicks': link_clicks,
            'actual_views': actual_views,
            'revenue': revenue,
            'roas': roas,
            'promoted_product': product,
            'campaign_month': month,
            'campaign_year': year,
            'manager_code': manager,
            'status': status,
            'has_reminder': has_reminder,
            'has_teaser': has_teaser
        })

print(f"Total campaigns to import: {len(campaigns)}")
print(f"Unique brands: {len(brands)}")
print(f"Unique influencers: {len(influencers)}")

# Output campaigns as JSON for easier processing
with open('/tmp/campaigns.json', 'w') as f:
    json.dump(campaigns, f, indent=2, default=str)
    
print(f"Campaigns data saved to /tmp/campaigns.json")

# Generate SQL in smaller batches
batch_size = 10
for i in range(0, min(100, len(campaigns)), batch_size):  # First 100 campaigns
    batch = campaigns[i:i+batch_size]
    print(f"\n-- Batch {i//batch_size + 1}")
    
    values = []
    for c in batch:
        brand = escape_string(c['brand_name'])
        influencer = escape_string(c['influencer_handle'])
        name = escape_string(c['campaign_name'])
        
        val_parts = [
            f"(SELECT id FROM brands WHERE name = '{brand}' LIMIT 1)",
            f"(SELECT id FROM influencers WHERE instagram_handle = '{influencer}' LIMIT 1)",
            f"'{name}'",
            f"'{c['channel']}'" if c['channel'] else "NULL",
            f"'{escape_string(c['content_type'])}'" if c['content_type'] else "NULL",
            f"'{c['story_public_date']}'" if c['story_public_date'] else "NULL",
            f"'{c['reminder_date']}'" if c['reminder_date'] else "NULL",
            f"'{c['teaser_date']}'" if c['teaser_date'] else "NULL",
            str(c['actual_cost']) if c['actual_cost'] is not None else "NULL",
            str(c['target_views']) if c['target_views'] is not None else "NULL",
            str(c['cpm_estimated']) if c['cpm_estimated'] is not None else "NULL",
            str(c['link_clicks']) if c['link_clicks'] is not None else "NULL",
            str(c['actual_views']) if c['actual_views'] is not None else "NULL",
            str(c['revenue']) if c['revenue'] is not None else "NULL",
            str(c['roas']) if c['roas'] is not None else "NULL",
            f"'{escape_string(c['promoted_product'])}'" if c['promoted_product'] else "NULL",
            f"'{escape_string(c['campaign_month'])}'" if c['campaign_month'] else "NULL",
            str(c['campaign_year']) if c['campaign_year'] else "NULL",
            f"'{escape_string(c['manager_code'])}'" if c['manager_code'] else "NULL",
            f"'{c['status']}'",
            "TRUE" if c['has_reminder'] else "FALSE",
            "TRUE" if c['has_teaser'] else "FALSE",
            "NOW()"
        ]
        
        values.append(f"({','.join(val_parts)})")
    
    sql = f"""INSERT INTO campaigns (
    brand_id, influencer_id, campaign_name, channel, content_type,
    story_public_date, reminder_date, teaser_date,
    actual_cost, target_views, cpm_estimated,
    link_clicks, actual_views, revenue, roas,
    promoted_product, campaign_month, campaign_year,
    manager_code, status, has_reminder, has_teaser, created_at
) VALUES
{','.join(values)}
ON CONFLICT DO NOTHING;"""
    
    print(sql)