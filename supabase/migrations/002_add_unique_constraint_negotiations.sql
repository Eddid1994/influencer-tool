-- Add unique constraint to prevent multiple negotiations per campaign
-- This ensures data integrity at the database level

-- First, check if there are any duplicate campaign_id values
-- If duplicates exist, keep only the most recent one
DELETE FROM campaign_negotiations cn1
WHERE cn1.created_at < (
  SELECT MAX(cn2.created_at)
  FROM campaign_negotiations cn2
  WHERE cn2.campaign_id = cn1.campaign_id
)
AND EXISTS (
  SELECT 1
  FROM campaign_negotiations cn3
  WHERE cn3.campaign_id = cn1.campaign_id
  AND cn3.id != cn1.id
);

-- Now add the unique constraint
ALTER TABLE campaign_negotiations
ADD CONSTRAINT unique_campaign_negotiation 
UNIQUE (campaign_id);

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_negotiations_campaign_unique
ON campaign_negotiations(campaign_id)
WHERE campaign_id IS NOT NULL;

-- Update the RLS policies to be more specific
DROP POLICY IF EXISTS "Insert campaign negotiations" ON campaign_negotiations;
CREATE POLICY "Insert campaign negotiations" ON campaign_negotiations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM campaign_negotiations 
      WHERE campaign_id = NEW.campaign_id
    )
  );

-- Add a helpful comment
COMMENT ON CONSTRAINT unique_campaign_negotiation ON campaign_negotiations 
IS 'Ensures only one negotiation can exist per campaign';