-- Migration: Add Negotiation System to Engagements
-- Description: Add negotiation tracking fields directly to engagements table using JSONB for flexibility
-- This integrates negotiations into the unified engagement workflow

-- =============================================================================
-- ADD NEGOTIATION FIELDS TO ENGAGEMENTS TABLE
-- =============================================================================

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS negotiation_status TEXT DEFAULT 'pending_outreach' CHECK (
  negotiation_status IN (
    'pending_outreach',     -- Ready to reach out to influencer
    'outreach_sent',        -- Initial contact made
    'awaiting_response',    -- Waiting for influencer response
    'negotiating',          -- Active back-and-forth negotiations
    'agreed',               -- Terms agreed, ready for contract
    'declined',             -- Influencer declined
    'on_hold'               -- Negotiations paused
  )
);

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS negotiation_data JSONB DEFAULT '{}';

-- Add negotiation-specific fields for quick access
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS negotiation_priority TEXT DEFAULT 'medium' CHECK (
  negotiation_priority IN ('low', 'medium', 'high')
);

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- CREATE NEGOTIATION DATA STRUCTURE HELPERS
-- =============================================================================

-- Function to initialize negotiation data structure
CREATE OR REPLACE FUNCTION initialize_negotiation_data()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'offers', '[]'::jsonb,
    'communications', '[]'::jsonb,
    'timeline', '[]'::jsonb,
    'current_stage', 'initial_contact',
    'notes', '',
    'templates_used', '[]'::jsonb,
    'follow_up_count', 0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add communication to negotiation data
CREATE OR REPLACE FUNCTION add_negotiation_communication(
  engagement_id_param UUID,
  communication_type_param TEXT,
  direction_param TEXT,
  subject_param TEXT DEFAULT NULL,
  content_param TEXT DEFAULT NULL,
  user_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  new_communication JSONB;
  updated_data JSONB;
BEGIN
  -- Build communication object
  new_communication := jsonb_build_object(
    'id', gen_random_uuid(),
    'type', communication_type_param,
    'direction', direction_param,
    'subject', subject_param,
    'content', content_param,
    'created_at', NOW(),
    'created_by', user_id_param
  );
  
  -- Update the engagement's negotiation data
  UPDATE engagements 
  SET 
    negotiation_data = COALESCE(negotiation_data, initialize_negotiation_data()) || 
                      jsonb_build_object(
                        'communications', 
                        COALESCE(negotiation_data->'communications', '[]'::jsonb) || new_communication
                      ),
    last_contact_date = NOW(),
    updated_at = NOW()
  WHERE id = engagement_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to add offer to negotiation data
CREATE OR REPLACE FUNCTION add_negotiation_offer(
  engagement_id_param UUID,
  offer_type_param TEXT,
  offered_by_param TEXT,
  amount_cents_param INTEGER,
  currency_param TEXT DEFAULT 'EUR',
  notes_param TEXT DEFAULT NULL,
  user_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  new_offer JSONB;
BEGIN
  -- Build offer object
  new_offer := jsonb_build_object(
    'id', gen_random_uuid(),
    'offer_type', offer_type_param,
    'offered_by', offered_by_param,
    'amount_cents', amount_cents_param,
    'currency', currency_param,
    'notes', notes_param,
    'created_at', NOW(),
    'created_by', user_id_param
  );
  
  -- Update the engagement's negotiation data
  UPDATE engagements 
  SET 
    negotiation_data = COALESCE(negotiation_data, initialize_negotiation_data()) || 
                      jsonb_build_object(
                        'offers', 
                        COALESCE(negotiation_data->'offers', '[]'::jsonb) || new_offer
                      ),
    updated_at = NOW()
  WHERE id = engagement_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update negotiation status with timeline entry
CREATE OR REPLACE FUNCTION update_negotiation_status(
  engagement_id_param UUID,
  new_status TEXT,
  notes_param TEXT DEFAULT NULL,
  user_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  timeline_entry JSONB;
  old_status TEXT;
BEGIN
  -- Get current status for timeline
  SELECT negotiation_status INTO old_status 
  FROM engagements 
  WHERE id = engagement_id_param;
  
  -- Build timeline entry
  timeline_entry := jsonb_build_object(
    'id', gen_random_uuid(),
    'type', 'status_change',
    'from_status', old_status,
    'to_status', new_status,
    'notes', notes_param,
    'created_at', NOW(),
    'created_by', user_id_param
  );
  
  -- Update engagement
  UPDATE engagements 
  SET 
    negotiation_status = new_status,
    negotiation_data = COALESCE(negotiation_data, initialize_negotiation_data()) || 
                      jsonb_build_object(
                        'timeline', 
                        COALESCE(negotiation_data->'timeline', '[]'::jsonb) || timeline_entry
                      ),
    updated_at = NOW()
  WHERE id = engagement_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIALIZE EXISTING ENGAGEMENTS
-- =============================================================================

-- Initialize negotiation data for existing engagements based on their current status
UPDATE engagements 
SET 
  negotiation_data = initialize_negotiation_data(),
  negotiation_status = CASE 
    WHEN status = 'negotiating' THEN 'negotiating'
    WHEN status = 'agreed' THEN 'agreed'
    WHEN status = 'active' THEN 'agreed'
    WHEN status = 'completed' THEN 'agreed'
    WHEN status = 'cancelled' THEN 'declined'
    ELSE 'pending_outreach'
  END
WHERE negotiation_data IS NULL OR negotiation_data = '{}'::jsonb;

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for negotiation status filtering
CREATE INDEX IF NOT EXISTS idx_engagements_negotiation_status 
ON engagements(negotiation_status);

-- Index for follow-up date queries
CREATE INDEX IF NOT EXISTS idx_engagements_next_follow_up 
ON engagements(next_follow_up_date) 
WHERE next_follow_up_date IS NOT NULL;

-- GIN index for negotiation data JSONB queries
CREATE INDEX IF NOT EXISTS idx_engagements_negotiation_data_gin 
ON engagements USING GIN(negotiation_data);

-- =============================================================================
-- CREATE VIEWS FOR NEGOTIATION REPORTING
-- =============================================================================

-- View for negotiation dashboard/reporting
CREATE OR REPLACE VIEW v_negotiation_summary AS
SELECT 
  e.id,
  e.campaign_name,
  b.name as brand_name,
  i.name as influencer_name,
  e.negotiation_status,
  e.negotiation_priority,
  e.last_contact_date,
  e.next_follow_up_date,
  (e.negotiation_data->>'current_stage') as current_stage,
  jsonb_array_length(COALESCE(e.negotiation_data->'offers', '[]'::jsonb)) as offer_count,
  jsonb_array_length(COALESCE(e.negotiation_data->'communications', '[]'::jsonb)) as communication_count,
  e.agreed_total_cents,
  e.agreed_currency,
  e.created_at,
  e.updated_at
FROM engagements e
LEFT JOIN brands b ON e.brand_id = b.id
LEFT JOIN influencers i ON e.influencer_id = i.id
WHERE e.negotiation_status IS NOT NULL;

-- View for overdue follow-ups
CREATE OR REPLACE VIEW v_overdue_negotiations AS
SELECT 
  e.id,
  e.campaign_name,
  b.name as brand_name,
  i.name as influencer_name,
  e.negotiation_status,
  e.next_follow_up_date,
  CURRENT_DATE - e.next_follow_up_date::date as days_overdue
FROM engagements e
LEFT JOIN brands b ON e.brand_id = b.id
LEFT JOIN influencers i ON e.influencer_id = i.id
WHERE e.next_follow_up_date < CURRENT_DATE
  AND e.negotiation_status NOT IN ('agreed', 'declined');

-- =============================================================================
-- UPDATE RLS POLICIES
-- =============================================================================

-- Enable RLS on engagements (should already be enabled)
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- Update existing policies to include negotiation fields (assuming basic policies exist)
-- These are enhancements, not replacements

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify migration worked correctly
DO $$
DECLARE
  total_engagements INTEGER;
  initialized_negotiations INTEGER;
  migration_success BOOLEAN := TRUE;
BEGIN
  -- Count total engagements
  SELECT COUNT(*) INTO total_engagements FROM engagements;
  
  -- Count engagements with initialized negotiation data
  SELECT COUNT(*) INTO initialized_negotiations 
  FROM engagements 
  WHERE negotiation_data IS NOT NULL 
    AND negotiation_data != '{}'::jsonb
    AND negotiation_status IS NOT NULL;
  
  -- Check if migration was successful
  IF total_engagements = initialized_negotiations THEN
    RAISE NOTICE '✅ SUCCESS: Negotiation system added to % engagements', total_engagements;
    RAISE NOTICE '📊 Available negotiation statuses: pending_outreach, outreach_sent, awaiting_response, negotiating, agreed, declined, on_hold';
    RAISE NOTICE '🔧 Helper functions created: add_negotiation_communication(), add_negotiation_offer(), update_negotiation_status()';
    RAISE NOTICE '📈 Views created: v_negotiation_summary, v_overdue_negotiations';
  ELSE
    RAISE WARNING '⚠️  PARTIAL SUCCESS: % of % engagements initialized', initialized_negotiations, total_engagements;
  END IF;
  
  -- Sample the negotiation data structure
  PERFORM (
    SELECT negotiation_data 
    FROM engagements 
    WHERE negotiation_data IS NOT NULL 
    LIMIT 1
  );
  
  RAISE NOTICE '🚀 Negotiation system ready for use!';
END $$;