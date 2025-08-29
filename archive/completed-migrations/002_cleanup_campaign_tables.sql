-- Migration: Cleanup Campaign Tables
-- This script removes the old campaign-related tables after successful migration
-- RUN ONLY AFTER VERIFYING MIGRATION SUCCESS AND UPDATING APPLICATION CODE

-- ==================================================================
-- STEP 1: Safety checks before deletion
-- ==================================================================

-- Verify all campaigns have been migrated
DO $$
DECLARE
  campaign_count INTEGER;
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campaign_count FROM campaigns;
  SELECT COUNT(*) INTO migrated_count FROM engagements WHERE migrated_from_campaign_id IS NOT NULL;
  
  IF campaign_count != migrated_count THEN
    RAISE EXCEPTION 'Migration incomplete: % campaigns exist but only % migrated. Do not run cleanup.', 
      campaign_count, migrated_count;
  END IF;
  
  RAISE NOTICE 'Safety check passed: % campaigns successfully migrated to engagements', campaign_count;
END $$;

-- ==================================================================
-- STEP 2: Create backup tables (for emergency rollback)
-- ==================================================================

-- Create backup of campaigns table
CREATE TABLE campaigns_backup AS SELECT * FROM campaigns;
CREATE TABLE campaign_negotiations_backup AS SELECT * FROM campaign_negotiations;
CREATE TABLE negotiation_offers_backup AS SELECT * FROM negotiation_offers;
CREATE TABLE negotiation_communications_backup AS SELECT * FROM negotiation_communications;
CREATE TABLE negotiation_tasks_backup AS SELECT * FROM negotiation_tasks;

-- Add indexes to backup tables for performance
CREATE INDEX idx_campaigns_backup_id ON campaigns_backup(id);
CREATE INDEX idx_campaign_negotiations_backup_campaign_id ON campaign_negotiations_backup(campaign_id);

RAISE NOTICE 'Backup tables created successfully';

-- ==================================================================
-- STEP 3: Drop dependent objects first (foreign keys, views, triggers)
-- ==================================================================

-- Drop any views that depend on campaigns
DROP VIEW IF EXISTS campaign_performance CASCADE;
DROP VIEW IF EXISTS campaign_summary CASCADE;

-- Drop foreign key constraints that reference campaigns
-- (These will cascade delete dependent records)

-- ==================================================================
-- STEP 4: Drop negotiation-related tables (in dependency order)
-- ==================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS negotiation_attachments CASCADE;
DROP TABLE IF EXISTS negotiation_communications CASCADE; 
DROP TABLE IF EXISTS negotiation_offers CASCADE;
DROP TABLE IF EXISTS negotiation_tasks CASCADE;
DROP TABLE IF EXISTS outreach_templates CASCADE; -- Not used in new system
DROP TABLE IF EXISTS campaign_negotiations CASCADE;

-- ==================================================================
-- STEP 5: Drop campaigns table
-- ==================================================================

DROP TABLE IF EXISTS campaigns CASCADE;

-- ==================================================================
-- STEP 6: Clean up old indexes and constraints
-- ==================================================================

-- Any indexes on dropped tables will be automatically removed

-- ==================================================================
-- STEP 7: Update views to use engagements instead of campaigns
-- ==================================================================

-- Recreate v_monthly_grid view to use engagements
DROP VIEW IF EXISTS v_monthly_grid CASCADE;

CREATE VIEW v_monthly_grid AS
SELECT 
  e.period_label AS monat,
  b.name AS brand,
  e.id AS engagement_id,
  bc.name AS ansprechpartner,
  i.name AS instagram_name,
  e.status,
  -- Extract platform from deliverables (prioritize instagram)
  COALESCE(
    (SELECT d.platform::text FROM deliverables d 
     WHERE d.engagement_id = e.id AND d.platform = 'instagram' LIMIT 1),
    (SELECT d.platform::text FROM deliverables d 
     WHERE d.engagement_id = e.id LIMIT 1)
  ) AS channel,
  -- Extract deliverable type
  COALESCE(
    (SELECT d.deliverable::text FROM deliverables d 
     WHERE d.engagement_id = e.id LIMIT 1)
  ) AS format,
  -- Get actual publish date from deliverables
  COALESCE(
    (SELECT d.actual_publish_at::date FROM deliverables d 
     WHERE d.engagement_id = e.id AND d.actual_publish_at IS NOT NULL LIMIT 1)
  ) AS story_datum,
  -- Check for pending tasks as reminder
  CASE WHEN EXISTS(
    SELECT 1 FROM engagement_tasks et 
    WHERE et.engagement_id = e.id AND et.completed_at IS NULL
  ) THEN 'Yes' ELSE NULL END AS reminder,
  e.status AS kooperationsstatus,
  -- Get promoted product from deliverables
  COALESCE(
    (SELECT d.promoted_product FROM deliverables d 
     WHERE d.engagement_id = e.id AND d.promoted_product IS NOT NULL LIMIT 1)
  ) AS beworbenes_produkt,
  -- Get follower count from latest stats
  COALESCE(
    (SELECT ias.followers FROM influencer_accounts ia
     JOIN influencer_account_stats ias ON ias.account_id = ia.id
     WHERE ia.influencer_id = e.influencer_id 
     ORDER BY ias.snapshot_at DESC LIMIT 1)
  ) AS followeranzahl,
  -- Get engagement rate from latest stats
  COALESCE(
    (SELECT ias.engagement_rate FROM influencer_accounts ia
     JOIN influencer_account_stats ias ON ias.account_id = ia.id
     WHERE ia.influencer_id = e.influencer_id 
     ORDER BY ias.snapshot_at DESC LIMIT 1)
  ) AS engagement_rate,
  -- Get follower growth
  COALESCE(
    (SELECT ias.follower_growth FROM influencer_accounts ia
     JOIN influencer_account_stats ias ON ias.account_id = ia.id
     WHERE ia.influencer_id = e.influencer_id 
     ORDER BY ias.snapshot_at DESC LIMIT 1)
  ) AS follower_growth,
  e.tkp_cents::decimal / 100 AS tkp,
  -- Average story views calculation (if available)
  COALESCE(
    (SELECT AVG(dm.views) FROM deliverables d
     JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
     WHERE d.engagement_id = e.id AND d.deliverable = 'story')
  ) AS durchschnittliche_storyviews,
  e.actual_views AS real_views,
  -- Calculate percentage deviation from target
  CASE 
    WHEN e.target_views > 0 AND e.actual_views IS NOT NULL THEN
      ((e.actual_views::decimal - e.target_views::decimal) / e.target_views::decimal * 100)::numeric(5,2)
    ELSE NULL
  END AS prozent_abweichung,
  -- Get link clicks from deliverable metrics
  COALESCE(
    (SELECT SUM(dm.clicks) FROM deliverables d
     JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
     WHERE d.engagement_id = e.id)
  ) AS linkklicks,
  -- Get audience data from latest account stats
  COALESCE(
    (SELECT ias.audience_country FROM influencer_accounts ia
     JOIN influencer_account_stats ias ON ias.account_id = ia.id
     WHERE ia.influencer_id = e.influencer_id 
     ORDER BY ias.snapshot_at DESC LIMIT 1)
  ) AS laenderverteilung,
  COALESCE(
    (SELECT ias.audience_gender FROM influencer_accounts ia
     JOIN influencer_account_stats ias ON ias.account_id = ia.id
     WHERE ia.influencer_id = e.influencer_id 
     ORDER BY ias.snapshot_at DESC LIMIT 1)
  ) AS geschlechterverteilung,
  CASE WHEN e.contract_status = 'signed' THEN true ELSE false END AS vertrag_ja_nein,
  i.niche,
  e.agreed_total_cents::decimal / 100 AS spend,
  -- Get revenue from deliverable metrics
  COALESCE(
    (SELECT SUM(dm.revenue_cents)::decimal / 100 FROM deliverables d
     JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
     WHERE d.engagement_id = e.id)
  ) AS umsatz,
  -- Calculate ROAS (Return on Ad Spend)
  CASE 
    WHEN e.agreed_total_cents > 0 THEN
      COALESCE(
        (SELECT SUM(dm.revenue_cents)::decimal / e.agreed_total_cents::decimal 
         FROM deliverables d
         JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
         WHERE d.engagement_id = e.id)
      )
    ELSE NULL
  END AS roas,
  -- Get coupon code
  COALESCE(
    (SELECT cc.code FROM deliverables d
     JOIN coupon_codes cc ON cc.id = d.coupon_code_id
     WHERE d.engagement_id = e.id LIMIT 1)
  ) AS code,
  -- Get tracking link
  COALESCE(
    (SELECT d.tracking_link FROM deliverables d
     WHERE d.engagement_id = e.id AND d.tracking_link IS NOT NULL LIMIT 1)
  ) AS link,
  -- Check if product was sent
  EXISTS(
    SELECT 1 FROM deliverables d 
    WHERE d.engagement_id = e.id AND d.product_sent = true
  ) AS produkt_versendet,
  -- Check if briefing was sent
  EXISTS(
    SELECT 1 FROM deliverables d 
    WHERE d.engagement_id = e.id AND d.briefing_sent = true
  ) AS briefing_versendet,
  -- Check if content was approved
  EXISTS(
    SELECT 1 FROM deliverables d 
    WHERE d.engagement_id = e.id AND d.content_approved = true
  ) AS content_freigegeben,
  -- Check if invoice was sent
  EXISTS(
    SELECT 1 FROM invoices inv 
    WHERE inv.engagement_id = e.id AND inv.status != 'draft'
  ) AS rechnung_verschickt,
  -- Get invoice number
  COALESCE(
    (SELECT inv.number FROM invoices inv 
     WHERE inv.engagement_id = e.id ORDER BY inv.created_at DESC LIMIT 1)
  ) AS rechnungsnummer
FROM engagements e
JOIN brands b ON b.id = e.brand_id
JOIN influencers i ON i.id = e.influencer_id
LEFT JOIN brand_contacts bc ON bc.id = e.brand_contact_id;

-- ==================================================================
-- STEP 8: Drop the migration tracking column (optional)
-- ==================================================================

-- Remove the temporary migration tracking column
-- ALTER TABLE engagements DROP COLUMN IF EXISTS migrated_from_campaign_id;

-- ==================================================================
-- STEP 9: Final verification
-- ==================================================================

-- Verify cleanup was successful
DO $$
BEGIN
  -- Check that campaign tables no longer exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    RAISE EXCEPTION 'Cleanup failed: campaigns table still exists';
  END IF;
  
  -- Verify backup tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns_backup') THEN
    RAISE EXCEPTION 'Cleanup error: backup table missing';
  END IF;
  
  RAISE NOTICE 'Cleanup completed successfully. Old campaign tables removed, backups preserved.';
END $$;

-- ==================================================================
-- ROLLBACK INSTRUCTIONS (for emergency use only)
-- ==================================================================

/*
-- EMERGENCY ROLLBACK (if needed):
-- 1. Restore tables from backup:
CREATE TABLE campaigns AS SELECT * FROM campaigns_backup;
CREATE TABLE campaign_negotiations AS SELECT * FROM campaign_negotiations_backup;
-- ... restore other tables

-- 2. Restore foreign key constraints:
ALTER TABLE campaigns ADD CONSTRAINT campaigns_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id);
-- ... restore other constraints

-- 3. Delete migrated engagements:
DELETE FROM engagements WHERE migrated_from_campaign_id IS NOT NULL;
*/