-- =====================================================
-- ENGAGEMENT KPI TRACKING IMPLEMENTATION
-- =====================================================
-- This migration adds comprehensive KPI tracking to the engagement system
-- following the hybrid approach recommended by the database architect.

-- =====================================================
-- PHASE 1: Add core KPI columns to engagements table
-- =====================================================

-- Add responsibility tracking (Zuständigkeit)
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS responsible_name TEXT;

-- Add channel and content metadata
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS primary_channel TEXT 
    CHECK (primary_channel IN ('instagram','tiktok','youtube','twitter','linkedin')),
ADD COLUMN IF NOT EXISTS content_type TEXT 
    CHECK (content_type IN ('reminder','teaser','standard')),
ADD COLUMN IF NOT EXISTS reminder_date DATE;

-- Add performance metrics (will be updated via triggers)
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS total_link_clicks INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_revenue_cents INTEGER DEFAULT 0 NOT NULL;

-- Add story publication date
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS story_publish_date TIMESTAMPTZ;

-- =====================================================
-- PHASE 2: Create engagement_kpis table for detailed tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS engagement_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    
    -- Snapshot metadata
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    snapshot_type TEXT DEFAULT 'manual' CHECK (snapshot_type IN ('daily','weekly','monthly','manual')),
    
    -- Extended KPIs from your requirements
    estimated_views INTEGER, -- Est. Views
    real_views INTEGER, -- Real Views (can differ from actual_views)
    promoted_products TEXT[], -- Beworbenes Produkt (array for multiple)
    
    -- Performance metrics snapshot
    views_by_platform JSONB, -- Platform-specific view breakdown
    clicks_by_source JSONB,  -- Source-specific click breakdown  
    revenue_by_product JSONB, -- Product-specific revenue breakdown
    
    -- Additional calculated metrics
    engagement_rate DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    avg_order_value_cents INTEGER,
    
    -- Quality metrics
    sentiment_score DECIMAL(3,2), -- -1 to 1 scale
    brand_mention_count INTEGER,
    user_generated_content_count INTEGER,
    
    -- Metadata
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one current snapshot per engagement for each type
    is_current BOOLEAN DEFAULT false,
    
    UNIQUE(engagement_id, snapshot_date, snapshot_type)
);

-- =====================================================
-- PHASE 3: Add generated columns for calculated KPIs
-- =====================================================

-- CPM calculation (Cost Per Mille / thousand impressions)
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS cpm_cents INTEGER 
GENERATED ALWAYS AS (
    CASE 
        WHEN actual_views > 0 AND agreed_total_cents > 0 
        THEN (agreed_total_cents::DECIMAL / actual_views * 1000)::INTEGER
        ELSE NULL 
    END
) STORED;

-- ROAS calculation (Return on Ad Spend)
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2) 
GENERATED ALWAYS AS (
    CASE 
        WHEN agreed_total_cents > 0 AND total_revenue_cents > 0
        THEN (total_revenue_cents::DECIMAL / agreed_total_cents)
        ELSE NULL
    END
) STORED;

-- =====================================================
-- PHASE 4: Create performance indexes
-- =====================================================

-- Index for responsibility-based queries
CREATE INDEX IF NOT EXISTS idx_engagements_responsible 
ON engagements(responsible_user_id, status)
WHERE status IN ('active', 'negotiating');

-- Index for channel-based performance queries
CREATE INDEX IF NOT EXISTS idx_engagements_channel_performance 
ON engagements(primary_channel, period_year, period_month);

-- Index for financial KPI queries
CREATE INDEX IF NOT EXISTS idx_engagements_financial_kpis 
ON engagements(brand_id, total_revenue_cents, roas) 
WHERE total_revenue_cents > 0;

-- Index for content type filtering
CREATE INDEX IF NOT EXISTS idx_engagements_content_type 
ON engagements(content_type, reminder_date) 
WHERE content_type IN ('reminder', 'teaser');

-- Index for KPI table performance
CREATE INDEX IF NOT EXISTS idx_engagement_kpis_engagement_current 
ON engagement_kpis(engagement_id) 
WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_engagement_kpis_snapshot_date 
ON engagement_kpis(snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_engagement_kpis_performance 
ON engagement_kpis(engagement_id, real_views, revenue_by_product)
WHERE is_current = true;

-- =====================================================
-- PHASE 5: Create triggers for real-time KPI updates
-- =====================================================

-- Function to update engagement KPIs when deliverable metrics change
CREATE OR REPLACE FUNCTION update_engagement_kpis()
RETURNS TRIGGER AS $$
DECLARE
    v_engagement_id UUID;
BEGIN
    -- Get engagement ID from the affected deliverable
    SELECT d.engagement_id INTO v_engagement_id
    FROM deliverables d
    WHERE d.id = COALESCE(NEW.deliverable_id, OLD.deliverable_id);
    
    -- Update aggregated metrics in engagements table
    UPDATE engagements e
    SET 
        total_link_clicks = (
            SELECT COALESCE(SUM(dm.clicks), 0)
            FROM deliverables d
            JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
            WHERE d.engagement_id = v_engagement_id
        ),
        total_revenue_cents = (
            SELECT COALESCE(SUM(dm.revenue_cents), 0)
            FROM deliverables d
            JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
            WHERE d.engagement_id = v_engagement_id
        ),
        actual_views = (
            SELECT COALESCE(SUM(dm.views), 0)
            FROM deliverables d
            JOIN deliverable_metrics dm ON dm.deliverable_id = d.id
            WHERE d.engagement_id = v_engagement_id
        ),
        updated_at = NOW()
    WHERE e.id = v_engagement_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_engagement_kpis ON deliverable_metrics;
CREATE TRIGGER trigger_update_engagement_kpis
    AFTER INSERT OR UPDATE OR DELETE ON deliverable_metrics
    FOR EACH ROW EXECUTE FUNCTION update_engagement_kpis();

-- Function to update KPI table updated_at timestamp
CREATE OR REPLACE FUNCTION update_kpi_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for KPI table
DROP TRIGGER IF EXISTS trigger_update_kpi_timestamp ON engagement_kpis;
CREATE TRIGGER trigger_update_kpi_timestamp
    BEFORE UPDATE ON engagement_kpis
    FOR EACH ROW EXECUTE FUNCTION update_kpi_timestamp();

-- =====================================================
-- PHASE 6: Create materialized view for KPI summary
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_engagement_kpi_summary AS
SELECT 
    e.id,
    e.brand_id,
    e.influencer_id,
    e.responsible_name,
    e.primary_channel,
    e.content_type,
    e.agreed_total_cents,
    e.cpm_cents,
    e.total_link_clicks,
    e.total_revenue_cents,
    e.roas,
    e.actual_views,
    e.target_views,
    e.story_publish_date,
    e.reminder_date,
    
    -- Brand and influencer names for easier querying
    b.name as brand_name,
    i.name as influencer_name,
    
    -- Aggregate from deliverables
    COUNT(DISTINCT d.id) as deliverable_count,
    string_agg(DISTINCT d.platform, ', ') as platforms_used,
    string_agg(DISTINCT d.deliverable, ', ') as deliverable_types,
    
    -- Performance calculations
    CASE 
        WHEN e.target_views > 0 AND e.actual_views > 0
        THEN ((e.actual_views::DECIMAL - e.target_views) / e.target_views * 100)::NUMERIC(5,2)
        ELSE NULL 
    END as view_accuracy_percent,
    
    -- CTR calculation
    CASE 
        WHEN e.actual_views > 0 AND e.total_link_clicks > 0
        THEN (e.total_link_clicks::DECIMAL / e.actual_views * 100)::NUMERIC(5,2)
        ELSE NULL 
    END as click_through_rate_percent,
    
    -- Latest KPI snapshot data
    kpi.estimated_views,
    kpi.real_views,
    kpi.promoted_products,
    kpi.engagement_rate as latest_engagement_rate,
    kpi.conversion_rate,
    kpi.sentiment_score,
    kpi.snapshot_date as last_kpi_update

FROM engagements e
LEFT JOIN brands b ON b.id = e.brand_id
LEFT JOIN influencers i ON i.id = e.influencer_id
LEFT JOIN deliverables d ON d.engagement_id = e.id
LEFT JOIN LATERAL (
    SELECT * FROM engagement_kpis 
    WHERE engagement_id = e.id AND is_current = true 
    ORDER BY snapshot_date DESC
    LIMIT 1
) kpi ON true
GROUP BY 
    e.id, e.brand_id, e.influencer_id, e.responsible_name,
    e.primary_channel, e.content_type, e.agreed_total_cents,
    e.cpm_cents, e.total_link_clicks, e.total_revenue_cents, e.roas,
    e.actual_views, e.target_views, e.story_publish_date, e.reminder_date,
    b.name, i.name,
    kpi.estimated_views, kpi.real_views, kpi.promoted_products,
    kpi.engagement_rate, kpi.conversion_rate, kpi.sentiment_score, kpi.snapshot_date;

-- Create unique index on materialized view for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_engagement_kpi_summary_id 
ON mv_engagement_kpi_summary(id);

-- Function to refresh KPI summary
CREATE OR REPLACE FUNCTION refresh_engagement_kpi_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_engagement_kpi_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 7: Create performance views for stakeholders
-- =====================================================

-- Influencer performance view with all KPIs
CREATE OR REPLACE VIEW v_influencer_kpi_performance AS
SELECT 
    i.id as influencer_id,
    i.name as influencer_name,
    i.niche,
    COUNT(DISTINCT e.id) as total_engagements,
    COUNT(DISTINCT e.brand_id) as brands_worked_with,
    
    -- Financial KPIs
    SUM(e.agreed_total_cents) / 100.0 as total_earnings,
    AVG(e.agreed_total_cents) / 100.0 as avg_engagement_value,
    SUM(e.total_revenue_cents) / 100.0 as total_revenue_generated,
    
    -- Performance KPIs
    AVG(e.cpm_cents) / 100.0 as avg_cpm,
    SUM(e.total_link_clicks) as total_clicks,
    AVG(e.roas) as avg_roas,
    SUM(e.actual_views) as total_views,
    
    -- Success metrics
    COUNT(*) FILTER (WHERE e.roas >= 1.0) as profitable_engagements,
    COUNT(*) FILTER (WHERE e.actual_views >= e.target_views) as target_met_engagements,
    
    -- Channel distribution
    jsonb_object_agg(
        COALESCE(e.primary_channel, 'unknown'), 
        COUNT(*)
    ) FILTER (WHERE e.primary_channel IS NOT NULL) as channel_distribution,
    
    -- Recent activity
    MAX(e.opened_at) as last_engagement_date,
    AVG(CASE WHEN e.opened_at >= CURRENT_DATE - INTERVAL '90 days' 
        THEN e.roas ELSE NULL END) as recent_avg_roas

FROM influencers i
LEFT JOIN engagements e ON e.influencer_id = i.id
WHERE e.status NOT IN ('cancelled')
GROUP BY i.id, i.name, i.niche;

-- Brand performance view with KPI focus
CREATE OR REPLACE VIEW v_brand_kpi_performance AS
SELECT 
    b.id as brand_id,
    b.name as brand_name,
    b.industry,
    COUNT(DISTINCT e.id) as total_engagements,
    COUNT(DISTINCT e.influencer_id) as influencers_count,
    
    -- Investment and returns
    SUM(e.agreed_total_cents) / 100.0 as total_invested,
    SUM(e.total_revenue_cents) / 100.0 as total_revenue,
    AVG(e.roas) as avg_roas,
    
    -- Performance metrics
    SUM(e.total_link_clicks) as total_clicks,
    SUM(e.actual_views) as total_views,
    AVG(e.cpm_cents) / 100.0 as avg_cpm,
    
    -- Effectiveness metrics
    COUNT(*) FILTER (WHERE e.roas >= 2.0) as high_roas_campaigns,
    COUNT(*) FILTER (WHERE e.total_link_clicks > 100) as high_engagement_campaigns,
    
    -- Best performing channel for this brand
    (SELECT primary_channel 
     FROM engagements 
     WHERE brand_id = b.id AND roas IS NOT NULL AND primary_channel IS NOT NULL
     GROUP BY primary_channel 
     ORDER BY AVG(roas) DESC 
     LIMIT 1) as best_performing_channel,
    
    -- Recent performance
    MAX(e.opened_at) as last_campaign_date,
    AVG(CASE WHEN e.opened_at >= CURRENT_DATE - INTERVAL '90 days' 
        THEN e.roas ELSE NULL END) as recent_avg_roas

FROM brands b
LEFT JOIN engagements e ON e.brand_id = b.id
WHERE e.status NOT IN ('cancelled')
GROUP BY b.id, b.name, b.industry;

-- =====================================================
-- PHASE 8: Update monthly grid view with new KPIs
-- =====================================================

-- Drop and recreate the monthly grid view with all KPI columns
DROP VIEW IF EXISTS v_monthly_grid CASCADE;

CREATE VIEW v_monthly_grid AS
WITH 
-- Get latest stats for each influencer account
latest_stats AS (
    SELECT DISTINCT ON (ia.id)
        ia.id AS account_id,
        ia.influencer_id,
        ia.platform,
        ia.handle,
        ias.followers,
        ias.engagement_rate,
        ias.follower_growth
    FROM influencer_accounts ia
    LEFT JOIN influencer_account_stats ias ON ias.account_id = ia.id
    ORDER BY ia.id, ias.snapshot_at DESC
),
-- Get primary deliverable info per engagement
primary_deliverable AS (
    SELECT DISTINCT ON (d.engagement_id)
        d.engagement_id,
        d.platform as channel,
        d.deliverable as format,
        d.actual_publish_at as story_datum,
        d.promoted_product as beworbenes_produkt,
        d.tracking_link as link,
        d.briefing_sent,
        d.content_approved,
        d.product_sent
    FROM deliverables d
    ORDER BY d.engagement_id, d.created_at
)

SELECT 
    -- Original German column names as requested
    e.period_label AS monat,
    b.name AS brand,
    e.id AS engagement_id,
    
    -- Zuständigkeit (Responsibility)
    COALESCE(e.responsible_name, bc.name) AS ansprechpartner,
    
    -- Channel and Content
    COALESCE(e.primary_channel, pd.channel) AS channel,
    pd.format,
    
    -- Dates and reminders  
    pd.story_datum,
    CASE 
        WHEN e.content_type = 'reminder' THEN e.reminder_date::text
        WHEN e.content_type = 'teaser' THEN 'Teaser'
        ELSE null
    END AS reminder,
    
    -- Status
    e.status AS kooperationsstatus,
    
    -- Performance metrics (your KPIs)
    e.agreed_total_cents / 100.0 AS preis, -- Preis
    e.target_views AS est_views, -- Est. Views
    e.actual_views AS real_views, -- Real Views
    e.cpm_cents / 100.0 AS cpm, -- CPM
    e.total_link_clicks AS link_klicks, -- Link Klicks
    e.total_revenue_cents / 100.0 AS umsatz, -- Umsatz
    e.roas, -- ROAS
    
    -- Content and product info
    COALESCE(pd.beworbenes_produkt, ekpi.promoted_products[1]) AS beworbenes_produkt,
    pd.link,
    
    -- Influencer data
    ls.handle AS instagram_name,
    ls.followers AS followeranzahl,
    COALESCE(ekpi.engagement_rate, ls.engagement_rate) AS engagement_rate,
    ls.follower_growth,
    
    -- Additional performance metrics
    CASE 
        WHEN e.target_views > 0 AND e.actual_views IS NOT NULL
        THEN ((e.actual_views::DECIMAL - e.target_views) / e.target_views * 100)::NUMERIC(5,2)
        ELSE NULL 
    END AS prozent_abweichung,
    
    -- Process status flags
    COALESCE(pd.product_sent, false) AS produkt_versendet,
    COALESCE(pd.briefing_sent, false) AS briefing_versendet,
    COALESCE(pd.content_approved, false) AS content_freigegeben,
    
    -- Contract and invoice data
    CASE WHEN e.contract_status = 'signed' THEN true ELSE false END AS vertrag_ja_nein,
    
    -- Additional fields for context
    i.niche,
    e.tags,
    e.notes

FROM engagements e
LEFT JOIN brands b ON b.id = e.brand_id
LEFT JOIN brand_contacts bc ON bc.id = e.brand_contact_id
LEFT JOIN influencers i ON i.id = e.influencer_id
LEFT JOIN latest_stats ls ON ls.influencer_id = i.id AND ls.platform = e.primary_channel
LEFT JOIN primary_deliverable pd ON pd.engagement_id = e.id
LEFT JOIN LATERAL (
    SELECT * FROM engagement_kpis 
    WHERE engagement_id = e.id AND is_current = true 
    LIMIT 1
) ekpi ON true;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE engagement_kpis IS 'Stores detailed KPI snapshots and historical tracking data for engagements';
COMMENT ON COLUMN engagements.responsible_user_id IS 'User responsible for this engagement (Zuständigkeit)';
COMMENT ON COLUMN engagements.responsible_name IS 'Denormalized name of responsible user for performance';
COMMENT ON COLUMN engagements.primary_channel IS 'Main platform/channel for this engagement';
COMMENT ON COLUMN engagements.content_type IS 'Type of content: reminder, teaser, or standard';
COMMENT ON COLUMN engagements.total_link_clicks IS 'Aggregated link clicks from all deliverables';
COMMENT ON COLUMN engagements.total_revenue_cents IS 'Total revenue generated in cents (Umsatz)';
COMMENT ON COLUMN engagements.cpm_cents IS 'Cost per mille (thousand views) in cents - calculated';
COMMENT ON COLUMN engagements.roas IS 'Return on ad spend ratio - calculated';
COMMENT ON VIEW v_monthly_grid IS 'Monthly grid view showing all engagement KPIs in German column names';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log successful migration
INSERT INTO migration_log (migration_name, completed_at) 
VALUES ('003_add_engagement_kpis', NOW())
ON CONFLICT DO NOTHING;