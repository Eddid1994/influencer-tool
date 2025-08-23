#!/usr/bin/env python3
import csv
import json
import os
from datetime import datetime

# Read the CSV file
csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

brands = set()
influencers = set()
campaigns = []

with open(csv_file, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row_num, row in enumerate(reader, start=2):
        # Skip empty rows
        if not row.get('Brand') or not row.get('Influencer'):
            continue
            
        # Collect unique brands
        brand = row['Brand'].strip() if row['Brand'] else None
        if brand:
            brands.add(brand)
        
        # Collect unique influencers
        influencer = row['Influencer'].strip() if row['Influencer'] else None
        if influencer:
            influencers.add(influencer)
        
        # Parse campaign data
        story_date = row.get('Story_Public_Date', '').strip()
        if story_date:
            # Fix year typos (2025-12 should be 2024-12)
            if story_date.startswith('2025-12'):
                story_date = story_date.replace('2025', '2024')
        
        # Parse numeric values
        def parse_float(val):
            if not val or val == '':
                return 'NULL'
            try:
                return float(val.replace(',', '.'))
            except:
                return 'NULL'
        
        def parse_int(val):
            if not val or val == '':
                return 'NULL'
            try:
                return int(float(val.replace(',', '.')))
            except:
                return 'NULL'
        
        campaigns.append({
            'brand': brand,
            'influencer': influencer,
            'channel': row.get('Channel', ''),
            'content_type': row.get('Content', ''),
            'story_date': story_date if story_date else 'NULL',
            'reminder_date': row.get('Wann?', '') if row.get('Reminder_oder__Teaser?') == 'reminder' else '',
            'teaser_date': row.get('Wann?', '') if row.get('Reminder_oder__Teaser?') == 'teaser' else '',
            'has_reminder': 'rem.' in row.get('Content', ''),
            'has_teaser': 'teaser' in row.get('Content', ''),
            'cost': parse_float(row.get('Preis', '')),
            'est_views': parse_int(row.get('Est._Views', '')),
            'cpm': parse_float(row.get('CPM', '')),
            'link_clicks': parse_int(row.get('Link_Klicks', '')),
            'real_views': parse_int(row.get('Real_Views', '')),
            'revenue': parse_float(row.get('Umsatz', '')),
            'roas': parse_float(row.get('ROAS', '')),
            'product': row.get('Beworbenes__Produkt', ''),
            'month': row.get('Monat', ''),
            'year': 2024,  # Default year
            'manager': row.get('Zuständigkeit', ''),
            'status': row.get('Status', '')
        })

# Generate SQL for brands
print(f"-- Found {len(brands)} unique brands")
print(f"-- Found {len(influencers)} unique influencers")
print(f"-- Found {len(campaigns)} campaigns to import")
print()

# SQL for brands
print("-- Insert all brands")
print("WITH brand_data AS (")
print("  SELECT DISTINCT brand_name FROM (VALUES")
brands_list = sorted(list(brands))
for i, brand in enumerate(brands_list):
    brand_escaped = brand.replace("'", "''")
    comma = "," if i < len(brands_list) - 1 else ""
    print(f"    ('{brand_escaped}'){comma}")
print("  ) AS t(brand_name)")
print(")")
print("INSERT INTO brands (name)")
print("SELECT brand_name FROM brand_data")
print("WHERE NOT EXISTS (")
print("  SELECT 1 FROM brands WHERE brands.name = brand_data.brand_name")
print(");")
print()

# SQL for influencers
print("-- Insert all influencers")
print("WITH influencer_data AS (")
print("  SELECT DISTINCT influencer_name, instagram_handle FROM (VALUES")
influencers_list = sorted(list(influencers))
for i, influencer in enumerate(influencers_list):
    influencer_escaped = influencer.replace("'", "''")
    # Create a simple handle from the name
    handle = influencer.lower().replace(' ', '').replace('.', '').replace('_', '')
    comma = "," if i < len(influencers_list) - 1 else ""
    print(f"    ('{influencer_escaped}', '{handle}'){comma}")
print("  ) AS t(influencer_name, instagram_handle)")
print(")")
print("INSERT INTO influencers (name, instagram_handle, status)")
print("SELECT influencer_name, instagram_handle, 'active' FROM influencer_data")
print("WHERE NOT EXISTS (")
print("  SELECT 1 FROM influencers")
print("  WHERE influencers.name = influencer_data.influencer_name")
print("     OR influencers.instagram_handle = influencer_data.instagram_handle")
print(");")
print()

print(f"-- Total campaigns to process: {len(campaigns)}")
print(f"-- Brands: {len(brands)}")
print(f"-- Influencers: {len(influencers)}")