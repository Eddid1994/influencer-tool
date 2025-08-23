-- ============================================
-- Campaign Negotiations schema (tables + RLS)
-- ============================================

-- Main negotiation record tied to a campaign
CREATE TABLE IF NOT EXISTS campaign_negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- High-level status and stage
  status text CHECK (status IN (
    'pending_outreach',
    'outreach_sent',
    'awaiting_response',
    'negotiating',
    'agreed',
    'declined',
    'on_hold'
  )) DEFAULT 'pending_outreach',
  current_stage text, -- e.g. 'initial_contact', 'price_negotiation', 'contract'
  priority text CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  last_contact_date timestamp with time zone,
  final_agreed_amount_cents integer,

  -- Auditing
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_campaign_negotiations_campaign_id ON campaign_negotiations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_negotiations_status ON campaign_negotiations(status);

-- Offers made during negotiation
CREATE TABLE IF NOT EXISTS negotiation_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES campaign_negotiations(id) ON DELETE CASCADE,
  offer_type text CHECK (offer_type IN ('initial','counter','final')) NOT NULL,
  offered_by text CHECK (offered_by IN ('brand','influencer')) NOT NULL,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'USD',
  terms jsonb,
  notes text,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_negotiation_id ON negotiation_offers(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_created_at ON negotiation_offers(created_at DESC);

-- Communications log (emails, calls, DMs)
CREATE TABLE IF NOT EXISTS negotiation_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES campaign_negotiations(id) ON DELETE CASCADE,
  communication_type text CHECK (communication_type IN ('email','phone','message')) NOT NULL,
  direction text CHECK (direction IN ('inbound','outbound')) NOT NULL DEFAULT 'outbound',
  subject text,
  content text NOT NULL,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_negotiation_comms_negotiation_id ON negotiation_communications(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_comms_created_at ON negotiation_communications(created_at DESC);

-- Tasks/reminders related to negotiation
CREATE TABLE IF NOT EXISTS negotiation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES campaign_negotiations(id) ON DELETE CASCADE,
  type text CHECK (type IN ('follow_up','internal_review','send_offer','send_contract')) NOT NULL,
  title text NOT NULL,
  description text,
  due_at timestamp with time zone NOT NULL,
  status text CHECK (status IN ('open','completed')) NOT NULL DEFAULT 'open',
  assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_negotiation_tasks_negotiation_id ON negotiation_tasks(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_tasks_due_at ON negotiation_tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_negotiation_tasks_status ON negotiation_tasks(status);

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE campaign_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_tasks ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for now (tighten later)
CREATE POLICY IF NOT EXISTS "Read campaign negotiations" ON campaign_negotiations
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Insert campaign negotiations" ON campaign_negotiations
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update campaign negotiations" ON campaign_negotiations
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Read negotiation offers" ON negotiation_offers
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Insert negotiation offers" ON negotiation_offers
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update negotiation offers" ON negotiation_offers
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Read negotiation comms" ON negotiation_communications
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Insert negotiation comms" ON negotiation_communications
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update negotiation comms" ON negotiation_communications
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Read negotiation tasks" ON negotiation_tasks
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Insert negotiation tasks" ON negotiation_tasks
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Update negotiation tasks" ON negotiation_tasks
  FOR UPDATE USING (true);
