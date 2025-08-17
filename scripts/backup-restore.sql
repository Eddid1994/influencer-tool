-- ============================================
-- BACKUP & RESTORE SCRIPTS FOR VISCA CRM
-- ============================================

-- ============================================
-- BACKUP QUERIES
-- ============================================

-- Export all influencers to CSV format
-- Run this in Supabase SQL editor and export results
SELECT 
  name,
  email,
  phone,
  instagram_handle,
  instagram_followers,
  tiktok_handle,
  tiktok_followers,
  youtube_handle,
  youtube_subscribers,
  array_to_string(niche, ', ') as niche,
  status,
  notes,
  created_at
FROM influencers
ORDER BY created_at DESC;

-- Export all brands
SELECT 
  name,
  website,
  contact_email,
  contact_phone,
  industry,
  notes,
  created_at
FROM brands
ORDER BY created_at DESC;

-- Export all campaigns with relationships
SELECT 
  c.campaign_name,
  b.name as brand_name,
  i.name as influencer_name,
  c.status,
  c.start_date,
  c.end_date,
  c.budget,
  c.actual_cost,
  c.target_views,
  c.actual_views,
  c.tkp,
  c.notes,
  c.created_at
FROM campaigns c
LEFT JOIN brands b ON c.brand_id = b.id
LEFT JOIN influencers i ON c.influencer_id = i.id
ORDER BY c.created_at DESC;

-- ============================================
-- FULL DATABASE BACKUP
-- ============================================

-- Create a complete backup of all data with relationships preserved
-- This creates a JSON backup that can be restored later

WITH backup_data AS (
  SELECT 
    jsonb_build_object(
      'timestamp', NOW(),
      'version', '1.0.0',
      'profiles', (SELECT jsonb_agg(p.*) FROM profiles p),
      'influencers', (SELECT jsonb_agg(i.*) FROM influencers i),
      'brands', (SELECT jsonb_agg(b.*) FROM brands b),
      'campaigns', (SELECT jsonb_agg(c.*) FROM campaigns c),
      'activities', (SELECT jsonb_agg(a.*) FROM activities a)
    ) as backup
)
SELECT backup FROM backup_data;

-- ============================================
-- RESTORE PROCEDURES
-- ============================================

-- Clear existing data (USE WITH CAUTION!)
-- Only run this if you want to completely reset your database
/*
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE influencers CASCADE;
TRUNCATE TABLE brands CASCADE;
-- Don't truncate profiles as they're linked to auth.users
*/

-- ============================================
-- RESTORE FROM BACKUP
-- ============================================

-- Example: Restore influencers from JSON backup
-- Replace $1 with your actual JSON data
/*
INSERT INTO influencers (
  id, name, email, phone, 
  instagram_handle, instagram_followers,
  tiktok_handle, tiktok_followers,
  youtube_handle, youtube_subscribers,
  niche, status, assigned_manager, notes,
  created_at, updated_at
)
SELECT 
  (elem->>'id')::uuid,
  elem->>'name',
  elem->>'email',
  elem->>'phone',
  elem->>'instagram_handle',
  (elem->>'instagram_followers')::integer,
  elem->>'tiktok_handle',
  (elem->>'tiktok_followers')::integer,
  elem->>'youtube_handle',
  (elem->>'youtube_subscribers')::integer,
  ARRAY(SELECT jsonb_array_elements_text(elem->'niche')),
  elem->>'status',
  (elem->>'assigned_manager')::uuid,
  elem->>'notes',
  (elem->>'created_at')::timestamptz,
  (elem->>'updated_at')::timestamptz
FROM jsonb_array_elements($1->'influencers') AS elem
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();
*/

-- ============================================
-- CLEANUP & MAINTENANCE
-- ============================================

-- Remove old activities (older than 6 months)
DELETE FROM activities 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Archive completed campaigns older than 1 year
UPDATE campaigns 
SET status = 'archived'
WHERE status = 'completed' 
  AND end_date < NOW() - INTERVAL '1 year';

-- Clean up inactive influencers with no campaigns
DELETE FROM influencers 
WHERE status = 'inactive' 
  AND id NOT IN (SELECT DISTINCT influencer_id FROM campaigns WHERE influencer_id IS NOT NULL)
  AND created_at < NOW() - INTERVAL '1 year';

-- ============================================
-- DATABASE STATISTICS
-- ============================================

-- Get database size and table statistics
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Get total database size
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;

-- ============================================
-- MIGRATION HELPERS
-- ============================================

-- Add a new column safely (example)
-- ALTER TABLE influencers 
-- ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Create safe migration for new enum value
-- ALTER TYPE status_type ADD VALUE IF NOT EXISTS 'archived';

-- ============================================
-- PERFORMANCE OPTIMIZATION
-- ============================================

-- Analyze tables for query optimization
ANALYZE influencers;
ANALYZE brands;
ANALYZE campaigns;
ANALYZE activities;

-- Vacuum to reclaim storage
VACUUM ANALYZE;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;