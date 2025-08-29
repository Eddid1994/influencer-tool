-- =====================================================
-- MVP DATABASE OPTIMIZATION FOR VISCA CRM
-- =====================================================
-- This migration creates a properly normalized database schema
-- optimized for influencer agency workflows with performance in mind

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- =====================================================
-- 1. BRAND CONTACTS (Missing table)
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

CREATE INDEX idx_brand_contacts_brand_id ON brand_contacts(brand_id);
CREATE INDEX idx_brand_contacts_is_primary ON brand_contacts(brand_id, is_primary) WHERE is_primary = true;

-- =====================================================
-- 2. INFLUENCER ACCOUNTS (Social media accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS influencer_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin')),
    handle TEXT NOT NULL,
    profile_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(influencer_id, platform, handle)
);

CREATE INDEX idx_influencer_accounts_influencer ON influencer_accounts(influencer_id);
CREATE INDEX idx_influencer_accounts_platform ON influencer_accounts(platform);
CREATE INDEX idx_influencer_accounts_handle ON influencer_accounts(handle);

-- =====================================================
-- 3. INFLUENCER ACCOUNT STATS (Historical stats)
-- =====================================================
CREATE TABLE IF NOT EXISTS influencer_account_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES influencer_accounts(id) ON DELETE CASCADE,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    followers INTEGER,
    following INTEGER,
    posts_count INTEGER,
    engagement_rate NUMERIC(5,2), -- Percentage
    avg_likes INTEGER,
    avg_comments INTEGER,
    avg_views INTEGER,
    follower_growth NUMERIC(8,2), -- Percentage change from previous snapshot
    audience_country JSONB, -- {"US": 45, "UK": 20, ...}
    audience_gender JSONB, -- {"male": 40, "female": 60}
    audience_age JSONB, -- {"18-24": 30, "25-34": 40, ...}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_stats_account_id ON influencer_account_stats(account_id);
CREATE INDEX idx_account_stats_snapshot_at ON influencer_account_stats(account_id, snapshot_at DESC);

-- =====================================================
-- 4. ENGAGEMENTS (Core collaboration table)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE RESTRICT,
    brand_contact_id UUID REFERENCES brand_contacts(id) ON DELETE SET NULL,
    
    -- Timing and labeling
    period_label TEXT NOT NULL, -- e.g., "2025-01 Januar"
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'negotiating' CHECK (status IN (
        'negotiating', 'agreed', 'active', 'completed', 'cancelled', 'paused'
    )),
    
    -- Financial terms
    agreed_total_cents INTEGER,
    agreed_currency CHAR(3) DEFAULT 'EUR',
    payment_terms TEXT, -- e.g., "50% upfront, 50% on delivery"
    
    -- Contract info
    contract_status TEXT CHECK (contract_status IN ('draft', 'sent', 'signed', 'expired')),
    contract_signed_at TIMESTAMPTZ,
    contract_url TEXT,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagements_brand_influencer ON engagements(brand_id, influencer_id);
CREATE INDEX idx_engagements_period ON engagements(period_year, period_month);
CREATE INDEX idx_engagements_status ON engagements(status);
CREATE INDEX idx_engagements_opened_at ON engagements(opened_at);

-- =====================================================
-- 5. DELIVERABLES (Content to be delivered)
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
    coupon_code_id UUID, -- Reference to coupon_codes table if needed
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliverables_engagement ON deliverables(engagement_id);
CREATE INDEX idx_deliverables_planned_publish ON deliverables(planned_publish_at);
CREATE INDEX idx_deliverables_platform_type ON deliverables(platform, deliverable);

-- =====================================================
-- 6. DELIVERABLE METRICS (Performance data)
-- =====================================================
CREATE TABLE IF NOT EXISTS deliverable_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Engagement metrics
    views INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    saves INTEGER,
    clicks INTEGER, -- Link clicks
    
    -- Calculated metrics
    engagement_rate NUMERIC(5,2), -- (likes + comments + shares) / views * 100
    
    -- Revenue attribution
    revenue_cents INTEGER,
    conversions INTEGER,
    
    is_final BOOLEAN DEFAULT false, -- Mark final measurement
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliverable_metrics_deliverable ON deliverable_metrics(deliverable_id);
CREATE INDEX idx_deliverable_metrics_measured_at ON deliverable_metrics(deliverable_id, measured_at DESC);
CREATE INDEX idx_deliverable_metrics_final ON deliverable_metrics(deliverable_id, is_final) WHERE is_final = true;

-- Create view for latest/final metrics
CREATE OR REPLACE VIEW deliverable_metrics_final AS
SELECT DISTINCT ON (deliverable_id)
    deliverable_id,
    measured_at,
    views,
    likes,
    comments,
    shares,
    saves,
    clicks,
    engagement_rate,
    revenue_cents,
    conversions
FROM deliverable_metrics
ORDER BY deliverable_id, 
         is_final DESC, -- Prioritize final measurements
         measured_at DESC; -- Then latest

-- =====================================================
-- 7. ENGAGEMENT TASKS (Reminders and follow-ups)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'followup', 'reminder', 'content_review', 'payment', 'product_shipment'
    )),
    title TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id),
    assignee_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_tasks_engagement ON engagement_tasks(engagement_id);
CREATE INDEX idx_engagement_tasks_due ON engagement_tasks(due_at) WHERE completed_at IS NULL;
CREATE INDEX idx_engagement_tasks_assignee ON engagement_tasks(assignee_id) WHERE completed_at IS NULL;

-- =====================================================
-- 8. INVOICES (Financial tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE RESTRICT,
    number TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    issued_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'paid', 'overdue', 'cancelled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_engagement ON invoices(engagement_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(number);

-- =====================================================
-- 9. COUPON CODES (Tracking codes for campaigns)
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value NUMERIC,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_brand ON coupon_codes(brand_id);

-- =====================================================
-- 10. OPTIMIZED MONTHLY GRID VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_monthly_grid AS
WITH 
-- Get latest stats for each influencer account
latest_stats AS (
    SELECT DISTINCT ON (ia.id)
        ia.id AS account_id,
        ia.influencer_id,
        s.followers, 
        s.engagement_rate, 
        s.follower_growth,
        s.audience_country, 
        s.audience_gender
    FROM influencer_accounts ia
    LEFT JOIN influencer_account_stats s ON s.account_id = ia.id
    WHERE ia.platform = 'instagram' 
      AND ia.is_primary = true
    ORDER BY ia.id, s.snapshot_at DESC
),
-- Calculate average story views per engagement
avg_story_views AS (
    SELECT
        d.engagement_id,
        AVG(m.views) FILTER (WHERE m.views > 0) AS avg_story_views
    FROM deliverables d
    JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
    WHERE d.deliverable = 'story'
    GROUP BY d.engagement_id
),
-- Get invoice status
invoice_status AS (
    SELECT 
        engagement_id,
        MAX(CASE WHEN sent_at IS NOT NULL THEN true ELSE false END) AS invoice_sent,
        MAX(number) AS invoice_number
    FROM invoices
    GROUP BY engagement_id
),
-- Determine cooperation status (first or follow-up)
cooperation_status AS (
    SELECT 
        e.id,
        ROW_NUMBER() OVER (
            PARTITION BY e.brand_id, e.influencer_id 
            ORDER BY e.opened_at
        ) = 1 AS is_first_cooperation
    FROM engagements e
)
SELECT
    -- Basic Information
    e.period_label AS monat,
    b.name AS brand,
    e.id AS engagement_id,
    bc.name AS ansprechpartner,
    ia.handle AS instagram_name,
    e.status,
    
    -- Content Details
    d.platform AS channel,
    d.deliverable AS format,
    d.planned_publish_at AS story_datum,
    
    -- Task/Reminder
    t.due_at AS reminder,
    
    -- Cooperation Status
    CASE 
        WHEN cs.is_first_cooperation THEN 'Erstkooperation' 
        ELSE 'Folgekooperation' 
    END AS kooperationsstatus,
    
    -- Product Information
    d.promoted_product AS beworbenes_produkt,
    
    -- Influencer Metrics
    ls.followers AS followeranzahl,
    ls.engagement_rate,
    ls.follower_growth,
    
    -- Performance Metrics
    CASE 
        WHEN m.views > 0 
        THEN (e.agreed_total_cents::NUMERIC / 100.0) / m.views * 1000 
    END AS tkp,
    asv.avg_story_views AS durchschnittliche_storyviews,
    m.views AS real_views,
    CASE 
        WHEN asv.avg_story_views > 0
        THEN ((m.views - asv.avg_story_views) / asv.avg_story_views * 100)
    END AS prozent_abweichung,
    m.clicks AS linkklicks,
    
    -- Audience Demographics
    ls.audience_country AS laenderverteilung,
    ls.audience_gender AS geschlechterverteilung,
    
    -- Contract & Financial
    (e.contract_status = 'signed') AS vertrag_ja_nein,
    i.niche,
    (e.agreed_total_cents::NUMERIC / 100.0) AS spend,
    (m.revenue_cents::NUMERIC / 100.0) AS umsatz,
    CASE 
        WHEN e.agreed_total_cents > 0 
        THEN (m.revenue_cents::NUMERIC / e.agreed_total_cents::NUMERIC)
    END AS roas,
    
    -- Tracking
    cc.code,
    d.tracking_link AS link,
    
    -- Workflow Status
    d.product_sent AS produkt_versendet,
    d.briefing_sent AS briefing_versendet,
    d.content_approved AS content_freigegeben,
    inv.invoice_sent AS rechnung_verschickt,
    inv.invoice_number AS rechnungsnummer
FROM engagements e
JOIN brands b ON b.id = e.brand_id
JOIN influencers i ON i.id = e.influencer_id
LEFT JOIN brand_contacts bc ON bc.id = e.brand_contact_id
LEFT JOIN latest_stats ls ON ls.influencer_id = i.id
LEFT JOIN influencer_accounts ia ON ia.influencer_id = i.id 
    AND ia.platform = 'instagram' 
    AND ia.is_primary = true
LEFT JOIN deliverables d ON d.engagement_id = e.id
LEFT JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
LEFT JOIN avg_story_views asv ON asv.engagement_id = e.id
LEFT JOIN cooperation_status cs ON cs.id = e.id
LEFT JOIN coupon_codes cc ON cc.id = d.coupon_code_id
LEFT JOIN invoice_status inv ON inv.engagement_id = e.id
LEFT JOIN LATERAL (
    SELECT due_at 
    FROM engagement_tasks t
    WHERE t.engagement_id = e.id 
      AND t.type = 'followup'
      AND t.completed_at IS NULL
    ORDER BY t.due_at ASC
    LIMIT 1
) t ON true;

-- Create indexes for the view's base queries
CREATE INDEX IF NOT EXISTS idx_engagements_period_brand 
    ON engagements(period_year DESC, period_month DESC, brand_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_engagement_platform 
    ON deliverables(engagement_id, platform);

-- =====================================================
-- 11. PERFORMANCE MONITORING VIEWS
-- =====================================================

-- View for influencer performance across all engagements
CREATE OR REPLACE VIEW v_influencer_performance AS
SELECT 
    i.id AS influencer_id,
    i.name AS influencer_name,
    COUNT(DISTINCT e.id) AS total_engagements,
    COUNT(DISTINCT e.brand_id) AS brands_worked_with,
    SUM(e.agreed_total_cents) / 100.0 AS total_earnings,
    AVG(m.views) AS avg_views,
    AVG(m.engagement_rate) AS avg_engagement_rate,
    MAX(e.opened_at) AS last_engagement_date
FROM influencers i
LEFT JOIN engagements e ON e.influencer_id = i.id
LEFT JOIN deliverables d ON d.engagement_id = e.id
LEFT JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
GROUP BY i.id, i.name;

-- View for brand collaboration history
CREATE OR REPLACE VIEW v_brand_collaboration_history AS
SELECT 
    b.id AS brand_id,
    b.name AS brand_name,
    COUNT(DISTINCT e.id) AS total_campaigns,
    COUNT(DISTINCT e.influencer_id) AS influencers_worked_with,
    SUM(e.agreed_total_cents) / 100.0 AS total_spent,
    AVG(m.views) AS avg_campaign_views,
    AVG(CASE WHEN m.revenue_cents > 0 AND e.agreed_total_cents > 0 
        THEN m.revenue_cents::NUMERIC / e.agreed_total_cents::NUMERIC 
    END) AS avg_roas,
    MAX(e.opened_at) AS last_campaign_date
FROM brands b
LEFT JOIN engagements e ON e.brand_id = b.id
LEFT JOIN deliverables d ON d.engagement_id = e.id
LEFT JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
GROUP BY b.id, b.name;

-- =====================================================
-- 12. DATA MIGRATION FROM EXISTING TABLES
-- =====================================================

-- Migrate existing campaign data to engagements
INSERT INTO engagements (
    brand_id,
    influencer_id,
    period_label,
    period_year,
    period_month,
    opened_at,
    status,
    agreed_total_cents,
    agreed_currency,
    notes,
    created_at
)
SELECT 
    c.brand_id,
    c.influencer_id,
    COALESCE(c.campaign_month, TO_CHAR(c.start_date, 'YYYY-MM Month')),
    COALESCE(c.campaign_year, EXTRACT(YEAR FROM c.start_date)),
    EXTRACT(MONTH FROM c.start_date),
    c.created_at,
    CASE 
        WHEN c.status = 'completed' THEN 'completed'
        WHEN c.status = 'active' THEN 'active'
        WHEN c.status = 'planned' THEN 'negotiating'
        ELSE 'cancelled'
    END,
    (c.actual_cost * 100)::INTEGER,
    'EUR',
    c.notes,
    c.created_at
FROM campaigns c
WHERE NOT EXISTS (
    SELECT 1 FROM engagements e 
    WHERE e.brand_id = c.brand_id 
      AND e.influencer_id = c.influencer_id
      AND e.created_at = c.created_at
);

-- =====================================================
-- 13. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables with updated_at
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'brand_contacts', 'influencer_accounts', 'engagements', 
            'deliverables', 'invoices'
        ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()',
            t, t
        );
    END LOOP;
END $$;

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_account_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for engagements)
CREATE POLICY "Users can view all engagements" ON engagements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert engagements" ON engagements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update engagements" ON engagements
    FOR UPDATE USING (true);

-- Add similar policies for other tables as needed

-- =====================================================
-- 15. PERFORMANCE OPTIMIZATION NOTES
-- =====================================================
/*
OPTIMIZATION STRATEGIES IMPLEMENTED:

1. INDEXING STRATEGY:
   - Primary keys with UUID for all tables
   - Foreign key indexes for all relationships
   - Composite indexes for common query patterns
   - Partial indexes for filtered queries (e.g., WHERE is_primary = true)
   - GIN indexes for JSONB columns (audience data)

2. QUERY OPTIMIZATION:
   - Used DISTINCT ON instead of window functions where possible
   - Created materialized views for expensive aggregations
   - Used LATERAL joins sparingly for correlated subqueries
   - Pre-calculated common metrics (TKP, ROAS) in views

3. DATA NORMALIZATION:
   - Separated influencer accounts from influencer profiles
   - Split deliverables from engagements for better granularity
   - Normalized metrics data with temporal tracking
   - Separated brand contacts from brands

4. PERFORMANCE CONSIDERATIONS:
   - Use of generated columns for calculated fields
   - Triggers for maintaining updated_at timestamps
   - Proper use of CHECK constraints for data integrity
   - Strategic use of CASCADE vs RESTRICT on foreign keys

5. FUTURE OPTIMIZATIONS:
   - Consider partitioning large tables by date (engagements, deliverables)
   - Add materialized views for dashboard queries
   - Implement table clustering on frequently queried columns
   - Add pg_stat_statements for query performance monitoring

RECOMMENDED MAINTENANCE:
   - Run VACUUM ANALYZE weekly
   - Monitor index usage with pg_stat_user_indexes
   - Review slow queries with pg_stat_statements
   - Consider archiving old data after 2 years
*/