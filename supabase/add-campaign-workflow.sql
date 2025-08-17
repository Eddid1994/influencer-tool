-- ============================================
-- Campaign Workflow System
-- ============================================

-- Campaign Workflows Table (Main workflow container)
CREATE TABLE IF NOT EXISTS campaign_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id),
  name text NOT NULL,
  description text,
  status text CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  
  -- Settings
  auto_reminders boolean DEFAULT true,
  reminder_1_days integer DEFAULT 3,
  reminder_2_days integer DEFAULT 7,
  reminder_3_days integer DEFAULT 14,
  auto_archive_no_response boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workflow Participants (Influencers in the workflow)
CREATE TABLE IF NOT EXISTS workflow_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES campaign_workflows(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES influencers(id),
  
  -- Current stage in the workflow
  stage text CHECK (stage IN (
    'selected',           -- Stage 1: Added to workflow
    'outreach_sent',      -- Stage 2: Initial email sent
    'reminder_1_sent',    -- Stage 3: First reminder
    'reminder_2_sent',    -- Stage 3: Second reminder
    'reminder_3_sent',    -- Stage 3: Third reminder
    'no_response',        -- Stage 3: Archived after no response
    'responded',          -- Stage 4: Influencer responded
    'negotiating',        -- Stage 4: In negotiation
    'agreed',            -- Stage 4: Terms agreed
    'rejected',          -- Stage 4: Influencer declined
    'contracted',        -- Stage 5: Contract signed
    'creating_content',  -- Stage 6: Content in production
    'content_approved',  -- Stage 6: Content approved
    'campaign_live',     -- Stage 7: Campaign is live
    'completed'          -- Stage 8: Campaign completed
  )) DEFAULT 'selected',
  
  -- Outreach tracking
  outreach_sent_at timestamp with time zone,
  reminder_1_sent_at timestamp with time zone,
  reminder_2_sent_at timestamp with time zone,
  reminder_3_sent_at timestamp with time zone,
  responded_at timestamp with time zone,
  
  -- Email content used
  outreach_template_id uuid,
  outreach_subject text,
  outreach_body text,
  
  -- Response tracking
  response_type text CHECK (response_type IN ('interested', 'not_interested', 'need_more_info', 'counter_offer')),
  response_notes text,
  initial_offer decimal(10,2),
  counter_offer decimal(10,2),
  final_agreement decimal(10,2),
  
  -- Deliverables tracking
  deliverables jsonb, -- Array of deliverable objects
  deliverables_completed integer DEFAULT 0,
  deliverables_total integer DEFAULT 0,
  
  -- Performance metrics
  engagement_rate decimal(5,2),
  total_reach integer,
  total_impressions integer,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Email Templates Library
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  template_type text CHECK (template_type IN (
    'outreach',
    'reminder_1', 
    'reminder_2', 
    'reminder_3',
    'negotiation',
    'agreement',
    'contract',
    'content_brief',
    'thank_you'
  )) NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  
  -- Available variables for this template
  variables text[], -- e.g., {influencer_name}, {brand_name}, {campaign_name}
  
  -- Usage tracking
  times_used integer DEFAULT 0,
  last_used_at timestamp with time zone,
  success_rate decimal(5,2), -- Response rate when using this template
  
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workflow Activity Log
CREATE TABLE IF NOT EXISTS workflow_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES campaign_workflows(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES workflow_participants(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES influencers(id),
  
  activity_type text NOT NULL, -- 'stage_changed', 'email_sent', 'response_received', etc.
  from_stage text,
  to_stage text,
  description text,
  metadata jsonb, -- Additional data about the activity
  
  performed_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reminder Queue for Automated Follow-ups
CREATE TABLE IF NOT EXISTS reminder_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES workflow_participants(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES campaign_workflows(id) ON DELETE CASCADE,
  
  reminder_type text CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'reminder_3')) NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  
  -- Email content
  email_subject text,
  email_body text,
  template_id uuid REFERENCES email_templates(id),
  
  -- Status
  status text CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')) DEFAULT 'pending',
  sent_at timestamp with time zone,
  error_message text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_workflow_participants_workflow_id ON workflow_participants(workflow_id);
CREATE INDEX idx_workflow_participants_influencer_id ON workflow_participants(influencer_id);
CREATE INDEX idx_workflow_participants_stage ON workflow_participants(stage);
CREATE INDEX idx_workflow_activities_workflow_id ON workflow_activities(workflow_id);
CREATE INDEX idx_reminder_queue_scheduled ON reminder_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_reminder_queue_participant ON reminder_queue(participant_id);

-- Enable Row Level Security
ALTER TABLE campaign_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all workflows" ON campaign_workflows FOR SELECT USING (true);
CREATE POLICY "Users can create workflows" ON campaign_workflows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update workflows" ON campaign_workflows FOR UPDATE USING (true);

CREATE POLICY "Users can view all participants" ON workflow_participants FOR SELECT USING (true);
CREATE POLICY "Users can manage participants" ON workflow_participants FOR ALL USING (true);

CREATE POLICY "Users can view templates" ON email_templates FOR SELECT USING (true);
CREATE POLICY "Users can manage templates" ON email_templates FOR ALL USING (true);

-- ============================================
-- Default Email Templates
-- ============================================

-- Insert default outreach template
INSERT INTO email_templates (
  template_type,
  name,
  subject,
  body,
  variables,
  is_default
) VALUES (
  'outreach',
  'Default Outreach Template',
  'Partnership Opportunity with {brand_name}',
  E'Hi {influencer_name},\n\nI hope this message finds you well! I''m {sender_name} from {brand_name}, and I''ve been following your amazing content on {platform}.\n\nYour posts about {niche} really resonate with our brand values, and we''d love to explore a partnership opportunity for our upcoming {campaign_name} campaign.\n\nWe''re looking for influencers who can create authentic content that connects with their audience, and you''re exactly what we''re looking for!\n\nCampaign Details:\n- Timeline: {timeline}\n- Deliverables: {deliverables}\n- Compensation: {budget_range}\n\nWould you be interested in learning more about this opportunity? I''d love to schedule a quick call to discuss the details.\n\nLooking forward to hearing from you!\n\nBest regards,\n{sender_name}\n{brand_name}',
  ARRAY['influencer_name', 'brand_name', 'sender_name', 'platform', 'niche', 'campaign_name', 'timeline', 'deliverables', 'budget_range'],
  true
);

-- Insert first reminder template
INSERT INTO email_templates (
  template_type,
  name,
  subject,
  body,
  variables,
  is_default
) VALUES (
  'reminder_1',
  'First Follow-up Template',
  'Re: Partnership Opportunity with {brand_name}',
  E'Hi {influencer_name},\n\nI wanted to follow up on my previous email about the partnership opportunity with {brand_name}.\n\nI know your inbox is probably busy, so I wanted to make sure you saw our proposal for {campaign_name}.\n\nWe''re really excited about the possibility of working together and think this could be a great fit for both of us.\n\nIf you''re interested, just reply to this email and we can set up a time to chat. If this isn''t the right fit for you right now, no worries at all - just let me know!\n\nBest,\n{sender_name}',
  ARRAY['influencer_name', 'brand_name', 'sender_name', 'campaign_name'],
  true
);

-- Insert second reminder template
INSERT INTO email_templates (
  template_type,
  name,
  subject,
  body,
  variables,
  is_default
) VALUES (
  'reminder_2',
  'Second Follow-up Template',
  'Quick check-in: {brand_name} partnership',
  E'Hi {influencer_name},\n\nJust wanted to send a quick check-in about our partnership proposal.\n\nWe''re finalizing our influencer roster for {campaign_name} this week, and I''d hate for you to miss out on this opportunity.\n\nIf you have any questions about the campaign or would like to discuss different terms, I''m completely open to that conversation.\n\nWould you have 15 minutes this week for a quick call?\n\nThanks,\n{sender_name}',
  ARRAY['influencer_name', 'brand_name', 'sender_name', 'campaign_name'],
  true
);

-- Insert third reminder template
INSERT INTO email_templates (
  template_type,
  name,
  subject,
  body,
  variables,
  is_default
) VALUES (
  'reminder_3',
  'Final Follow-up Template',
  'Last check: {brand_name} collaboration',
  E'Hi {influencer_name},\n\nI''ll keep this short - this is my last follow-up about the {brand_name} partnership.\n\nIf you''re interested, we''d still love to have you on board for {campaign_name}. Just reply with a quick "yes" and we can move forward.\n\nIf not, no problem at all! I''ll assume you''re not interested if I don''t hear back, and I won''t bother you again.\n\nEither way, keep creating amazing content!\n\nBest,\n{sender_name}',
  ARRAY['influencer_name', 'brand_name', 'sender_name', 'campaign_name'],
  true
);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to automatically create reminders when outreach is sent
CREATE OR REPLACE FUNCTION create_reminder_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create reminders if outreach was just sent and auto_reminders is enabled
  IF NEW.stage = 'outreach_sent' AND OLD.stage = 'selected' THEN
    -- Get workflow settings
    DECLARE
      workflow_settings RECORD;
    BEGIN
      SELECT auto_reminders, reminder_1_days, reminder_2_days, reminder_3_days
      INTO workflow_settings
      FROM campaign_workflows
      WHERE id = NEW.workflow_id;
      
      IF workflow_settings.auto_reminders THEN
        -- Create reminder 1
        INSERT INTO reminder_queue (
          participant_id,
          workflow_id,
          reminder_type,
          scheduled_for
        ) VALUES (
          NEW.id,
          NEW.workflow_id,
          'reminder_1',
          NEW.outreach_sent_at + (workflow_settings.reminder_1_days || ' days')::interval
        );
        
        -- Create reminder 2
        INSERT INTO reminder_queue (
          participant_id,
          workflow_id,
          reminder_type,
          scheduled_for
        ) VALUES (
          NEW.id,
          NEW.workflow_id,
          'reminder_2',
          NEW.outreach_sent_at + (workflow_settings.reminder_2_days || ' days')::interval
        );
        
        -- Create reminder 3
        INSERT INTO reminder_queue (
          participant_id,
          workflow_id,
          reminder_type,
          scheduled_for
        ) VALUES (
          NEW.id,
          NEW.workflow_id,
          'reminder_3',
          NEW.outreach_sent_at + (workflow_settings.reminder_3_days || ' days')::interval
        );
      END IF;
    END;
  END IF;
  
  -- Cancel pending reminders if influencer responded
  IF NEW.stage IN ('responded', 'negotiating', 'agreed', 'rejected') AND OLD.stage != NEW.stage THEN
    UPDATE reminder_queue
    SET status = 'cancelled'
    WHERE participant_id = NEW.id
    AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reminder queue
CREATE TRIGGER create_reminders_on_outreach
  AFTER UPDATE ON workflow_participants
  FOR EACH ROW
  EXECUTE FUNCTION create_reminder_queue();

-- Function to log stage changes
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage != NEW.stage THEN
    INSERT INTO workflow_activities (
      workflow_id,
      participant_id,
      influencer_id,
      activity_type,
      from_stage,
      to_stage,
      description
    ) VALUES (
      NEW.workflow_id,
      NEW.id,
      NEW.influencer_id,
      'stage_changed',
      OLD.stage,
      NEW.stage,
      'Influencer moved from ' || OLD.stage || ' to ' || NEW.stage
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logging
CREATE TRIGGER log_participant_stage_changes
  AFTER UPDATE ON workflow_participants
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_change();