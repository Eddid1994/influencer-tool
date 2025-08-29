-- Migration: Add automation fields to outreach_templates
-- This enables templates to be chained together for automated follow-up sequences

-- Add automation fields to outreach_templates
ALTER TABLE outreach_templates 
ADD COLUMN IF NOT EXISTS automation_trigger TEXT CHECK (
  automation_trigger IN ('no_response', 'after_days', 'immediately')
),
ADD COLUMN IF NOT EXISTS automation_delay_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS automation_next_template_id UUID REFERENCES outreach_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS automation_stop_condition TEXT DEFAULT 'response_received' CHECK (
  automation_stop_condition IN ('response_received', 'status_changed', 'max_attempts', 'manual_only')
),
ADD COLUMN IF NOT EXISTS automation_max_attempts INTEGER DEFAULT 3;

-- Add index for finding next templates in chains
CREATE INDEX IF NOT EXISTS idx_templates_automation_next ON outreach_templates(automation_next_template_id);

-- Add fields to track sent messages directly in engagements
ALTER TABLE engagements
ADD COLUMN IF NOT EXISTS messages_sent JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scheduled_messages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS automation_paused BOOLEAN DEFAULT false;

-- Add published tracking to deliverables
ALTER TABLE deliverables
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Comment on new columns
COMMENT ON COLUMN outreach_templates.automation_trigger IS 'When to trigger the next template in sequence';
COMMENT ON COLUMN outreach_templates.automation_delay_days IS 'Days to wait before sending next template';
COMMENT ON COLUMN outreach_templates.automation_next_template_id IS 'Next template in the automation chain';
COMMENT ON COLUMN outreach_templates.automation_stop_condition IS 'Condition to stop the automation';
COMMENT ON COLUMN engagements.messages_sent IS 'Array of sent messages with template info and timestamps';
COMMENT ON COLUMN engagements.scheduled_messages IS 'Array of scheduled future messages';
COMMENT ON COLUMN deliverables.published IS 'Whether the content has been published';
COMMENT ON COLUMN deliverables.published_at IS 'When the content was published';

-- Create a function to get automation chain for a template
CREATE OR REPLACE FUNCTION get_template_automation_chain(start_template_id UUID)
RETURNS TABLE (
  step_number INTEGER,
  template_id UUID,
  template_name TEXT,
  delay_days INTEGER,
  trigger_type TEXT
) AS $$
DECLARE
  current_id UUID;
  step_count INTEGER := 1;
BEGIN
  current_id := start_template_id;
  
  WHILE current_id IS NOT NULL AND step_count <= 10 LOOP -- Prevent infinite loops
    RETURN QUERY
    SELECT 
      step_count,
      t.id,
      t.name,
      t.automation_delay_days,
      t.automation_trigger
    FROM outreach_templates t
    WHERE t.id = current_id;
    
    -- Get next template in chain
    SELECT automation_next_template_id INTO current_id
    FROM outreach_templates
    WHERE id = current_id;
    
    step_count := step_count + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_template_automation_chain(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_template_automation_chain(UUID) TO service_role;