-- ============================================
-- Add Negotiations Table for Tracking All Discussions
-- ============================================

-- Create negotiations table to track every negotiation attempt
CREATE TABLE IF NOT EXISTS negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid REFERENCES influencers(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL, -- Links to campaign if deal closes
  
  -- Negotiation details
  negotiation_date date DEFAULT CURRENT_DATE,
  proposed_budget decimal(10,2),
  influencer_rate decimal(10,2), -- What influencer asked for
  final_agreed_rate decimal(10,2), -- What was agreed (if any)
  
  -- Deliverables discussed
  proposed_deliverables text,
  posts_count integer,
  stories_count integer,
  videos_count integer,
  
  -- Status tracking
  status text CHECK (status IN ('initial_contact', 'negotiating', 'agreed', 'rejected', 'counter_offer')) DEFAULT 'initial_contact',
  rejection_reason text,
  
  -- Performance expectations
  expected_reach integer,
  expected_engagement_rate decimal(5,2),
  
  -- Notes and context
  notes text,
  next_followup_date date,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_negotiations_influencer_id ON negotiations(influencer_id);
CREATE INDEX idx_negotiations_brand_id ON negotiations(brand_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiations_date ON negotiations(negotiation_date);

-- Enable RLS
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all negotiations" ON negotiations
  FOR SELECT USING (true);

CREATE POLICY "Users can create negotiations" ON negotiations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update negotiations" ON negotiations
  FOR UPDATE USING (true);

-- ============================================
-- Create View for Influencer Performance History
-- ============================================
CREATE OR REPLACE VIEW influencer_performance AS
SELECT 
  i.id as influencer_id,
  i.name as influencer_name,
  i.instagram_handle,
  i.instagram_followers,
  i.tiktok_followers,
  
  -- Campaign statistics
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT c.brand_id) as brands_worked_with,
  COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_campaigns,
  COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns,
  
  -- Financial metrics
  SUM(c.actual_cost) as total_earnings,
  AVG(c.actual_cost) as avg_campaign_value,
  MAX(c.actual_cost) as highest_campaign_value,
  MIN(c.actual_cost) as lowest_campaign_value,
  
  -- Performance metrics
  SUM(c.actual_views) as total_views_generated,
  AVG(c.actual_views) as avg_views_per_campaign,
  AVG(c.tkp) as avg_tkp,
  
  -- Success rate
  AVG(CASE 
    WHEN c.actual_views > 0 AND c.target_views > 0 
    THEN (c.actual_views::float / c.target_views * 100) 
    ELSE NULL 
  END) as avg_target_achievement_rate,
  
  -- Recent activity
  MAX(c.end_date) as last_campaign_date,
  
  -- Negotiation history
  (SELECT COUNT(*) FROM negotiations n WHERE n.influencer_id = i.id) as total_negotiations,
  (SELECT COUNT(*) FROM negotiations n WHERE n.influencer_id = i.id AND n.status = 'agreed') as successful_negotiations,
  (SELECT AVG(final_agreed_rate) FROM negotiations n WHERE n.influencer_id = i.id AND n.status = 'agreed') as avg_negotiated_rate

FROM influencers i
LEFT JOIN campaigns c ON i.id = c.influencer_id
GROUP BY i.id, i.name, i.instagram_handle, i.instagram_followers, i.tiktok_followers;

-- ============================================
-- Create View for Brand Collaboration History
-- ============================================
CREATE OR REPLACE VIEW brand_collaboration_history AS
SELECT 
  b.id as brand_id,
  b.name as brand_name,
  i.id as influencer_id,
  i.name as influencer_name,
  
  -- Collaboration metrics
  COUNT(DISTINCT c.id) as campaigns_together,
  MIN(c.start_date) as first_collaboration,
  MAX(c.end_date) as latest_collaboration,
  
  -- Financial history
  SUM(c.actual_cost) as total_spent,
  AVG(c.actual_cost) as avg_spend_per_campaign,
  
  -- Performance
  SUM(c.actual_views) as total_views,
  AVG(c.tkp) as avg_tkp,
  
  -- ROI indicators
  AVG(CASE 
    WHEN c.actual_views > 0 AND c.target_views > 0 
    THEN (c.actual_views::float / c.target_views * 100) 
    ELSE NULL 
  END) as avg_performance_rate,
  
  -- Latest campaign details
  (SELECT c2.campaign_name FROM campaigns c2 
   WHERE c2.brand_id = b.id AND c2.influencer_id = i.id 
   ORDER BY c2.created_at DESC LIMIT 1) as latest_campaign_name,
  
  (SELECT c2.actual_cost FROM campaigns c2 
   WHERE c2.brand_id = b.id AND c2.influencer_id = i.id 
   ORDER BY c2.created_at DESC LIMIT 1) as latest_campaign_cost,
   
  -- Negotiation context
  (SELECT n.final_agreed_rate FROM negotiations n 
   WHERE n.brand_id = b.id AND n.influencer_id = i.id 
   ORDER BY n.created_at DESC LIMIT 1) as last_agreed_rate,
   
  (SELECT n.negotiation_date FROM negotiations n 
   WHERE n.brand_id = b.id AND n.influencer_id = i.id 
   ORDER BY n.created_at DESC LIMIT 1) as last_negotiation_date

FROM brands b
JOIN campaigns c ON b.id = c.brand_id
JOIN influencers i ON c.influencer_id = i.id
GROUP BY b.id, b.name, i.id, i.name;

-- ============================================
-- Sample Negotiation Data
-- ============================================
INSERT INTO negotiations (
  influencer_id, 
  brand_id, 
  negotiation_date,
  proposed_budget,
  influencer_rate,
  final_agreed_rate,
  proposed_deliverables,
  posts_count,
  stories_count,
  status,
  expected_reach,
  notes
)
SELECT 
  i.id,
  b.id,
  '2024-01-10',
  70000,
  80000,
  75000,
  '3 Instagram posts, 5 stories, 1 reel',
  3,
  5,
  'agreed',
  1500000,
  'Negotiated down from 80k to 75k by offering long-term partnership'
FROM influencers i, brands b
WHERE i.name = 'James Mitchell' AND b.name = 'Nike Sports'
LIMIT 1;

INSERT INTO negotiations (
  influencer_id, 
  brand_id, 
  negotiation_date,
  proposed_budget,
  influencer_rate,
  final_agreed_rate,
  proposed_deliverables,
  posts_count,
  stories_count,
  status,
  expected_reach,
  notes
)
SELECT 
  i.id,
  b.id,
  '2023-12-15',
  100000,
  150000,
  120000,
  '5 posts, 10 stories, 2 reels',
  5,
  10,
  'agreed',
  3000000,
  'Emma initially asked for 150k, settled at 120k with performance bonus'
FROM influencers i, brands b
WHERE i.name = 'Emma Rodriguez' AND b.name = 'Fashion Nova'
LIMIT 1;

-- Example of a rejected negotiation
INSERT INTO negotiations (
  influencer_id, 
  brand_id, 
  negotiation_date,
  proposed_budget,
  influencer_rate,
  status,
  rejection_reason,
  notes
)
SELECT 
  i.id,
  b.id,
  '2024-02-01',
  30000,
  50000,
  'rejected',
  'Budget gap too large',
  'Influencer wanted 50k minimum, our max budget was 30k'
FROM influencers i, brands b
WHERE i.name = 'Sophia Chen' AND b.name = 'Glossier'
LIMIT 1;

-- ============================================
-- Helpful Queries for Analytics
-- ============================================

-- Query to see all campaigns an influencer has done with different brands
-- SELECT * FROM campaigns 
-- WHERE influencer_id = '[influencer_id]'
-- ORDER BY start_date DESC;

-- Query to see negotiation history for an influencer
-- SELECT * FROM negotiations 
-- WHERE influencer_id = '[influencer_id]'
-- ORDER BY negotiation_date DESC;

-- Query to see brand-influencer collaboration history
-- SELECT * FROM brand_collaboration_history
-- WHERE brand_id = '[brand_id]' AND influencer_id = '[influencer_id]';

-- Query to see influencer performance metrics
-- SELECT * FROM influencer_performance
-- WHERE influencer_id = '[influencer_id]';