-- Migration: Consolidate Campaigns into Engagements System
-- This migration performs a "big bang" consolidation of the dual campaign/engagement system
-- into a single engagements-based system for simpler maintenance.

-- ==================================================================
-- STEP 1: Add missing tables referenced in TypeScript types
-- ==================================================================

-- Add engagement_files table (referenced in types but missing)
CREATE TABLE IF NOT EXISTS engagement_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add engagement_payments table (referenced in types but missing)
CREATE TABLE IF NOT EXISTS engagement_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_date date NOT NULL,
  payment_method text,
  transaction_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==================================================================
-- STEP 2: Extend engagements table to accommodate campaign data
-- ==================================================================

-- Add columns to engagements to store campaign-specific data
DO $$
BEGIN
  -- Add campaign_name if not exists (some might be called differently)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='campaign_name') THEN
    ALTER TABLE engagements ADD COLUMN campaign_name text;
  END IF;
  
  -- Add budget fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='budget_cents') THEN
    ALTER TABLE engagements ADD COLUMN budget_cents integer;
  END IF;
  
  -- Add target/actual performance metrics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='target_views') THEN
    ALTER TABLE engagements ADD COLUMN target_views integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='actual_views') THEN
    ALTER TABLE engagements ADD COLUMN actual_views integer;
  END IF;
  
  -- Add TKP calculation (Tausend-Kontakt-Preis)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='tkp_cents') THEN
    ALTER TABLE engagements ADD COLUMN tkp_cents integer;
  END IF;
  
  -- Add source tracking for migration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='engagements' AND column_name='migrated_from_campaign_id') THEN
    ALTER TABLE engagements ADD COLUMN migrated_from_campaign_id uuid;
  END IF;
END $$;

-- ==================================================================
-- STEP 3: Create mapping function for campaign status to engagement status
-- ==================================================================

CREATE OR REPLACE FUNCTION map_campaign_status_to_engagement(campaign_status text)
RETURNS text AS $$
BEGIN
  RETURN CASE campaign_status
    WHEN 'planned' THEN 'negotiating'
    WHEN 'active' THEN 'active'
    WHEN 'completed' THEN 'completed'
    WHEN 'cancelled' THEN 'cancelled'
    ELSE 'negotiating'
  END;
END;
$$ LANGUAGE plpgsql;

-- ==================================================================
-- STEP 4: Migrate campaigns to engagements
-- ==================================================================

-- Insert campaigns as new engagements
INSERT INTO engagements (
  id,
  brand_id,
  influencer_id,
  brand_contact_id,
  period_label,
  period_year,
  period_month,
  opened_at,
  closed_at,
  status,
  agreed_total_cents,
  agreed_currency,
  campaign_name,
  budget_cents,
  target_views,
  actual_views,
  tkp_cents,
  notes,
  created_by,
  created_at,
  updated_at,
  migrated_from_campaign_id
)
SELECT 
  c.id,
  c.brand_id,
  c.influencer_id,
  -- Try to find primary brand contact, fallback to first contact
  COALESCE(
    (SELECT id FROM brand_contacts WHERE brand_id = c.brand_id AND is_primary = true LIMIT 1),
    (SELECT id FROM brand_contacts WHERE brand_id = c.brand_id LIMIT 1)
  ),
  -- Generate period label from campaign name and dates
  CASE 
    WHEN c.start_date IS NOT NULL THEN 
      c.campaign_name || ' ' || TO_CHAR(c.start_date::date, 'YYYY-MM')
    ELSE 
      c.campaign_name || ' ' || TO_CHAR(c.created_at::date, 'YYYY-MM')
  END,
  -- Extract year from start_date or created_at
  CASE 
    WHEN c.start_date IS NOT NULL THEN EXTRACT(YEAR FROM c.start_date::date)::integer
    ELSE EXTRACT(YEAR FROM c.created_at::date)::integer
  END,
  -- Extract month from start_date or created_at  
  CASE 
    WHEN c.start_date IS NOT NULL THEN EXTRACT(MONTH FROM c.start_date::date)::integer
    ELSE EXTRACT(MONTH FROM c.created_at::date)::integer
  END,
  COALESCE(c.start_date, c.created_at),
  c.end_date,
  map_campaign_status_to_engagement(c.status),
  -- Convert budget/actual_cost to cents (assuming they were in dollars)
  CASE WHEN c.actual_cost IS NOT NULL THEN (c.actual_cost * 100)::integer
       WHEN c.budget IS NOT NULL THEN (c.budget * 100)::integer
       ELSE NULL END,
  'USD',
  c.campaign_name,
  CASE WHEN c.budget IS NOT NULL THEN (c.budget * 100)::integer ELSE NULL END,
  c.target_views,
  c.actual_views,
  CASE WHEN c.tkp IS NOT NULL THEN (c.tkp * 100)::integer ELSE NULL END,
  c.notes,
  -- created_by might not exist in campaigns, use first admin user as fallback
  COALESCE(
    (SELECT id FROM profiles WHERE id = c.created_by LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
  ),
  c.created_at,
  COALESCE(c.updated_at, c.created_at),
  c.id -- Store original campaign ID for reference
FROM campaigns c
WHERE c.brand_id IS NOT NULL 
  AND c.influencer_id IS NOT NULL
  -- Don't migrate if already exists (avoid duplicates on re-run)
  AND NOT EXISTS (
    SELECT 1 FROM engagements e WHERE e.migrated_from_campaign_id = c.id
  );

-- ==================================================================
-- STEP 5: Migrate campaign negotiations to engagement-based system
-- ==================================================================

-- For each campaign negotiation, create corresponding deliverables and tasks
-- This preserves the negotiation workflow within the engagement system

INSERT INTO deliverables (
  id,
  engagement_id,
  platform,
  deliverable,
  quantity,
  planned_publish_at,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id, -- engagement id (mapped from campaign)
  'instagram', -- default platform, can be updated manually
  'post', -- default deliverable type
  1, -- default quantity
  e.opened_at + INTERVAL '7 days', -- default to week after engagement opened
  'Migrated from campaign negotiation: ' || COALESCE(cn.current_stage, cn.status::text),
  cn.created_at,
  cn.updated_at
FROM campaign_negotiations cn
JOIN engagements e ON e.migrated_from_campaign_id = cn.campaign_id
WHERE NOT EXISTS (
  SELECT 1 FROM deliverables d 
  WHERE d.engagement_id = e.id 
  AND d.notes LIKE 'Migrated from campaign negotiation:%'
);

-- Migrate negotiation tasks to engagement tasks
INSERT INTO engagement_tasks (
  id,
  engagement_id,
  type,
  title,
  description,
  due_at,
  completed_at,
  completed_by,
  assignee_id,
  created_at
)
SELECT 
  nt.id,
  e.id, -- engagement id
  CASE nt.type
    WHEN 'follow_up' THEN 'followup'
    WHEN 'send_offer' THEN 'payment'
    WHEN 'send_contract' THEN 'payment'
    ELSE 'followup'
  END,
  nt.title,
  COALESCE(nt.description, 'Migrated from campaign negotiation'),
  nt.due_at,
  CASE WHEN nt.status = 'completed' THEN nt.due_at ELSE NULL END,
  nt.created_by,
  nt.assignee_id,
  nt.created_at
FROM negotiation_tasks nt
JOIN campaign_negotiations cn ON cn.id = nt.negotiation_id
JOIN engagements e ON e.migrated_from_campaign_id = cn.campaign_id
WHERE NOT EXISTS (
  SELECT 1 FROM engagement_tasks et WHERE et.id = nt.id
);

-- ==================================================================
-- STEP 6: Add missing foreign key constraints
-- ==================================================================

-- Add the missing coupon_code relationship to deliverables
-- (This was referenced in types but constraint was missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deliverables_coupon_code_id_fkey'
  ) THEN
    ALTER TABLE deliverables 
    ADD CONSTRAINT deliverables_coupon_code_id_fkey 
    FOREIGN KEY (coupon_code_id) REFERENCES coupon_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==================================================================
-- STEP 7: Create performance indexes
-- ==================================================================

-- Indexes for frequently queried fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_brand_id ON engagements(brand_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_influencer_id ON engagements(influencer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_period ON engagements(period_year, period_month);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_status ON engagements(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_opened_at ON engagements(opened_at);

-- Time-series data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliverable_metrics_deliverable_measured 
ON deliverable_metrics(deliverable_id, measured_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencer_account_stats_account_snapshot 
ON influencer_account_stats(account_id, snapshot_at DESC);

-- Task management indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagement_tasks_engagement_due 
ON engagement_tasks(engagement_id, due_at) WHERE completed_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagement_tasks_assignee 
ON engagement_tasks(assignee_id) WHERE completed_at IS NULL;

-- ==================================================================
-- STEP 8: Update computed columns and triggers
-- ==================================================================

-- Update TKP calculation to be computed automatically
-- TKP = (Cost / Views) * 1000, stored in cents
CREATE OR REPLACE FUNCTION calculate_engagement_tkp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual_views IS NOT NULL AND NEW.actual_views > 0 
     AND NEW.agreed_total_cents IS NOT NULL THEN
    NEW.tkp_cents := ((NEW.agreed_total_cents::decimal / NEW.actual_views::decimal) * 1000)::integer;
  ELSE
    NEW.tkp_cents := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate TKP
DROP TRIGGER IF EXISTS trg_calculate_engagement_tkp ON engagements;
CREATE TRIGGER trg_calculate_engagement_tkp
  BEFORE INSERT OR UPDATE ON engagements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_engagement_tkp();

-- ==================================================================
-- STEP 9: Create migration summary view
-- ==================================================================

CREATE OR REPLACE VIEW migration_summary AS
SELECT 
  'campaigns_migrated' AS metric,
  COUNT(*)::text AS value
FROM engagements 
WHERE migrated_from_campaign_id IS NOT NULL

UNION ALL

SELECT 
  'total_engagements' AS metric,
  COUNT(*)::text AS value
FROM engagements

UNION ALL

SELECT 
  'negotiation_tasks_migrated' AS metric,
  COUNT(*)::text AS value
FROM engagement_tasks et
JOIN engagements e ON e.id = et.engagement_id
WHERE e.migrated_from_campaign_id IS NOT NULL;

-- ==================================================================
-- STEP 10: Cleanup helper functions
-- ==================================================================

-- Remove temporary mapping function
DROP FUNCTION IF EXISTS map_campaign_status_to_engagement(text);

-- ==================================================================
-- MIGRATION COMPLETE
-- ==================================================================

-- Display summary
SELECT * FROM migration_summary ORDER BY metric;

-- Verification queries (run these to check migration success)
-- SELECT COUNT(*) as "Total Engagements" FROM engagements;
-- SELECT COUNT(*) as "Migrated Campaigns" FROM engagements WHERE migrated_from_campaign_id IS NOT NULL;
-- SELECT status, COUNT(*) FROM engagements GROUP BY status ORDER BY status;