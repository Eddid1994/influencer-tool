#!/usr/bin/env python3
import csv
import sys

# Read the CSV file
csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

print("-- ============================================")
print("-- COMPLETE CAMPAIGN IMPORT FOR SUPABASE")
print("-- Generated from CSV file")
print("-- Run this in Supabase SQL Editor after the base script")
print("-- ============================================\n")

with open(csv_file, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    campaign_count = 0
    
    for row in reader:
        # Skip empty rows
        if not row.get('Brand') or not row.get('Influencer'):
            continue
            
        # Clean and prepare values
        brand = row['Brand'].strip().replace("'", "''") if row['Brand'] else 'NULL'
        influencer = row['Influencer'].strip().replace("'", "''") if row['Influencer'] else 'NULL'
        channel = row.get('Channel', '').strip() or 'NULL'
        content_type = row.get('Content', '').strip().replace("'", "''") if row.get('Content') else 'NULL'
        
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
        
        product = f"'{row['Beworbenes__Produkt'].strip().replace(chr(39), chr(39)*2)}'" if row.get('Beworbenes__Produkt') and row['Beworbenes__Produkt'].strip() else 'NULL'
        month = f"'{row['Monat'].strip()}'" if row.get('Monat') and row['Monat'].strip() else 'NULL'
        year = 2024  # Default year
        
        # Try to extract year from date
        if story_date != 'NULL':
            try:
                year_str = story_date.strip("'").split('-')[0]
                year = int(year_str) if year_str.isdigit() else 2024
            except:
                year = 2024
                
        manager = f"'{row['Zuständigkeit'].strip()}'" if row.get('Zuständigkeit') and row['Zuständigkeit'].strip() else 'NULL'
        status = f"'{row['Status'].strip()}'" if row.get('Status') and row['Status'].strip() else "'active'"
        
        # Generate the SQL function call
        print(f"SELECT import_campaign_batch('{brand}', '{influencer}', '{channel}', '{content_type}', "
              f"{story_date}, {reminder_date}, {teaser_date}, {has_reminder}, {has_teaser}, "
              f"{cost}, {est_views}, {real_views}, {cpm}, {link_clicks}, {revenue}, {roas}, "
              f"{product}, {month}, {year}, {manager}, {status});")
        
        campaign_count += 1

print(f"\n-- Total campaigns to import: {campaign_count}")
print("\n-- Clean up function after import")
print("DROP FUNCTION IF EXISTS import_campaign_batch;")
print("\n-- Verify final counts")
print("SELECT 'Total Campaigns' as metric, COUNT(*) as count FROM campaigns;")