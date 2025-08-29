-- =====================================================
-- ENGAGEMENTS TABLES FOR VISCA CRM
-- =====================================================
-- This is a simplified version that creates only the essential tables
-- needed for the engagements feature to work

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BRAND CONTACTS (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS brand_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ENGAGEMENTS (Core table)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE RESTRICT,
    brand_contact_id UUID REFERENCES brand_contacts(id) ON DELETE SET NULL,
    
    -- Timing and labeling
    period_label TEXT,
    period_year INTEGER,
    period_month INTEGER CHECK (period_month IS NULL OR period_month BETWEEN 1 AND 12),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Status tracking
    status TEXT DEFAULT 'negotiating' CHECK (status IN (
        'negotiating', 'agreed', 'active', 'completed', 'cancelled', 'paused'
    )),
    
    -- Financial terms
    agreed_total_cents INTEGER,
    agreed_currency CHAR(3) DEFAULT 'EUR',
    payment_terms TEXT,
    
    -- Contract info
    contract_status TEXT CHECK (contract_status IN ('draft', 'sent', 'signed', 'expired') OR contract_status IS NULL),
    contract_signed_at TIMESTAMPTZ,
    contract_url TEXT,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. DELIVERABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    
    -- Content details
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin')),
    deliverable TEXT NOT NULL CHECK (deliverable IN (
        'story', 'post', 'reel', 'video', 'live', 'carousel', 'igtv', 'shorts'
    )),
    quantity INTEGER DEFAULT 1,
    
    -- Scheduling
    planned_publish_at DATE,
    actual_publish_at TIMESTAMPTZ,
    content_url TEXT,
    
    -- Production tracking
    briefing_sent BOOLEAN DEFAULT false,
    briefing_sent_at TIMESTAMPTZ,
    content_submitted BOOLEAN DEFAULT false,
    content_submitted_at TIMESTAMPTZ,
    content_approved BOOLEAN DEFAULT false,
    content_approved_at TIMESTAMPTZ,
    content_approved_by UUID REFERENCES profiles(id),
    
    -- Product and tracking
    product_sent BOOLEAN DEFAULT false,
    product_sent_at TIMESTAMPTZ,
    promoted_product TEXT,
    tracking_link TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ENGAGEMENT TASKS
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    
    -- Task details
    task_type TEXT NOT NULL CHECK (task_type IN (
        'send_product', 'send_brief', 'review_content', 'approve_content', 
        'follow_up', 'send_invoice', 'process_payment', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Assignment and timing
    assigned_to UUID REFERENCES profiles(id),
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    
    -- Priority and status
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INVOICES
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    
    -- Invoice details
    invoice_number TEXT UNIQUE,
    invoice_date DATE NOT NULL,
    due_date DATE,
    
    -- Financial
    subtotal_cents INTEGER NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'
    )),
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    payment_method TEXT,
    
    -- Files and notes
    invoice_url TEXT,
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_brand_contacts_brand_id ON brand_contacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_engagements_brand_influencer ON engagements(brand_id, influencer_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON engagements(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_engagement ON deliverables(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_tasks_engagement ON engagement_tasks(engagement_id);
CREATE INDEX IF NOT EXISTS idx_invoices_engagement ON invoices(engagement_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users
-- (These are simple policies - adjust based on your security requirements)

-- Brand Contacts policies
CREATE POLICY "Authenticated users can view brand_contacts" ON brand_contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage brand_contacts" ON brand_contacts
    FOR ALL USING (auth.role() = 'authenticated');

-- Engagements policies
CREATE POLICY "Authenticated users can view engagements" ON engagements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage engagements" ON engagements
    FOR ALL USING (auth.role() = 'authenticated');

-- Deliverables policies
CREATE POLICY "Authenticated users can view deliverables" ON deliverables
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage deliverables" ON deliverables
    FOR ALL USING (auth.role() = 'authenticated');

-- Engagement Tasks policies
CREATE POLICY "Authenticated users can view engagement_tasks" ON engagement_tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage engagement_tasks" ON engagement_tasks
    FOR ALL USING (auth.role() = 'authenticated');

-- Invoices policies
CREATE POLICY "Authenticated users can view invoices" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage invoices" ON invoices
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_brand_contacts_updated_at BEFORE UPDATE ON brand_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at BEFORE UPDATE ON engagements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_tasks_updated_at BEFORE UPDATE ON engagement_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();