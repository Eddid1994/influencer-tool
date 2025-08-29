-- Add automation fields to engagements table
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS automation_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS messages_sent JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scheduled_messages JSONB DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN engagements.automation_paused IS 'Whether automated follow-ups are paused for this engagement';
COMMENT ON COLUMN engagements.messages_sent IS 'History of messages sent for this engagement';
COMMENT ON COLUMN engagements.scheduled_messages IS 'Queue of scheduled automated messages';