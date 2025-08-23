#!/usr/bin/env python3
import csv

csv_file = '/Users/edvin/Test/visca-crm/Information-CSV-Booking/Fully_Cleaned_Bookings_Data.csv'

# Collect ALL unique influencers
all_influencers = []
seen = set()

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['Influencer'] and row['Influencer'] not in seen:
            seen.add(row['Influencer'])
            name = row['Influencer'].replace("'", "''")
            handle = row['Influencer'].lower().replace("'", "''")
            all_influencers.append(f"('{name}', '{handle}', 'active', NOW(), NOW())")

# Print single massive insert
print(f"-- Inserting {len(all_influencers)} unique influencers")
print("INSERT INTO influencers (name, instagram_handle, status, created_at, updated_at) VALUES")
print(",\n".join(all_influencers))
print("ON CONFLICT (instagram_handle) DO UPDATE SET name = EXCLUDED.name;")