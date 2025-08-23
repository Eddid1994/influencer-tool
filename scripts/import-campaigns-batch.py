#!/usr/bin/env python3
import csv
from datetime import datetime

csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

def parse_date(date_str):
    if not date_str or date_str == '':
        return 'NULL'
    if date_str.startswith('2025-12'):
        date_str = date_str.replace('2025', '2024')
    return f"'{date_str}'"

def parse_numeric(value):
    if not value or value == '':
        return 'NULL'
    return str(float(str(value).replace(',', '.')))

def parse_integer(value):
    if not value or value == '':
        return 'NULL'
    value_str = str(value).replace(',', '')
    if '.' in value_str:
        return str(int(float(value_str)))
    return str(int(value_str))

def escape_string(s):
    if s is None:
        return ''
    return s.replace("'", "''")

campaigns = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        if not row['Brand'] or not row['Influencer']:
            continue
            
        brand_name = escape_string(row['Brand'])
        influencer_name = escape_string(row['Influencer'])
        
        public_date = parse_date(row.get('Story_Public_Date'))
        reminder_date = parse_date(row.get('Wann?')) if row.get('Reminder_oder__Teaser?') == 'reminder' else 'NULL'
        teaser_date = parse_date(row.get('Wann?')) if row.get('Reminder_oder__Teaser?') == 'teaser' else 'NULL'
        
        content_type = row.get('Content', '')
        has_reminder = 'TRUE' if 'rem.' in content_type else 'FALSE'
        has_teaser = 'TRUE' if 'teaser' in content_type else 'FALSE'
        
        channel = "'instagram'" if row.get('Channel') == 'ig' else "'youtube'" if row.get('Channel') == 'yt' else 'NULL'
        content_type_val = f"'{escape_string(content_type)}'" if content_type else 'NULL'
        
        actual_cost = parse_numeric(row.get('Preis'))
        target_views = parse_integer(row.get('Est._Views'))
        cpm = parse_numeric(row.get('CPM'))
        link_clicks = parse_integer(row.get('Link_Klicks'))
        actual_views = parse_integer(row.get('Real_Views'))
        revenue = parse_numeric(row.get('Umsatz'))
        roas = parse_numeric(row.get('ROAS'))
        
        product = row.get('Beworbenes__Produkt')
        product_val = f"'{escape_string(product)}'" if product else 'NULL'
        
        month = row.get('Monat')
        month_val = f"'{escape_string(month)}'" if month else 'NULL'
        
        year = 2024
        if public_date != 'NULL':
            try:
                date_obj = datetime.strptime(public_date.strip("'"), '%Y-%m-%d')
                year = date_obj.year
            except:
                pass
        
        manager = row.get('Zuständigkeit')
        manager_val = f"'{escape_string(manager)}'" if manager else 'NULL'
        
        status = "'completed'" if row.get('Status') == 'done' else "'planned'" if row.get('Status') == 'tbd' else "'active'"
        
        campaign_name = f"{row['Brand']} - {row['Influencer']} - {month or ''} {year}".strip()
        campaign_name_val = f"'{escape_string(campaign_name)}'"
        
        campaigns.append(f"""(
    (SELECT id FROM brands WHERE name = '{brand_name}' LIMIT 1),
    (SELECT id FROM influencers WHERE instagram_handle = '{escape_string(row['Influencer'].lower())}' LIMIT 1),
    {campaign_name_val}, {channel}, {content_type_val},
    {public_date}, {reminder_date}, {teaser_date},
    {actual_cost}, {target_views}, {cpm},
    {link_clicks}, {actual_views}, {revenue}, {roas},
    {product_val}, {month_val}, {year},
    {manager_val}, {status}, {has_reminder}, {has_teaser}, NOW()
)""")

print(f"-- Total campaigns to import: {len(campaigns)}")

# Insert in batches of 20
batch_size = 20
for i in range(0, len(campaigns), batch_size):
    batch = campaigns[i:i+batch_size]
    print(f"\n-- Batch {i//batch_size + 1} (campaigns {i+1} to {min(i+batch_size, len(campaigns))})")
    print("""INSERT INTO campaigns (
    brand_id, influencer_id, campaign_name, channel, content_type,
    story_public_date, reminder_date, teaser_date,
    actual_cost, target_views, cpm_estimated,
    link_clicks, actual_views, revenue, roas,
    promoted_product, campaign_month, campaign_year,
    manager_code, status, has_reminder, has_teaser, created_at
) VALUES""")
    print(",\n".join(batch))
    print("ON CONFLICT DO NOTHING;")