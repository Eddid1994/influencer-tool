-- Migration: Initial Schema Setup for Visca CRM
-- Version: 001
-- Description: Creates all tables, indexes, RLS policies, and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Influencers table
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  youtube_handle TEXT,
  youtube_subscribers INTEGER DEFAULT 0,
  niche TEXT[],
  status TEXT CHECK (status IN ('new', 'contacted', 'negotiating', 'active', 'inactive', 'rejected')) DEFAULT 'new',
  assigned_manager UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  target_views INTEGER,
  actual_views INTEGER,
  tkp DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN actual_views > 0 AND actual_cost IS NOT NULL
      THEN (actual_cost / actual_views * 1000)
      ELSE NULL 
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_influencers_status ON influencers(status);
CREATE INDEX IF NOT EXISTS idx_influencers_assigned_manager ON influencers(assigned_manager);
CREATE INDEX IF NOT EXISTS idx_influencers_created_at ON influencers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_influencers_name ON influencers(name);
CREATE INDEX IF NOT EXISTS idx_influencers_email ON influencers(email);

CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_influencer_id ON campaigns(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_activities_influencer_id ON activities(influencer_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view influencers" ON influencers;
DROP POLICY IF EXISTS "Authenticated users can insert influencers" ON influencers;
DROP POLICY IF EXISTS "Authenticated users can update influencers" ON influencers;
DROP POLICY IF EXISTS "Admin can delete influencers" ON influencers;
DROP POLICY IF EXISTS "Authenticated users can view brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can view activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Influencers policies
CREATE POLICY "Authenticated users can view influencers" ON influencers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert influencers" ON influencers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update influencers" ON influencers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete influencers" ON influencers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Brands policies
CREATE POLICY "Authenticated users can view brands" ON brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage brands" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- Campaigns policies
CREATE POLICY "Authenticated users can view campaigns" ON campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage campaigns" ON campaigns
  FOR ALL USING (auth.role() = 'authenticated');

-- Activities policies
CREATE POLICY "Authenticated users can view activities" ON activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create activities" ON activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencers_updated_at ON influencers;
CREATE TRIGGER update_influencers_updated_at 
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at 
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_influencers', (SELECT COUNT(*) FROM influencers),
    'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE status = 'active'),
    'total_brands', (SELECT COUNT(*) FROM brands),
    'new_influencers_this_month', (
      SELECT COUNT(*) FROM influencers 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'avg_tkp', (
      SELECT ROUND(AVG(tkp)::numeric, 2) 
      FROM campaigns 
      WHERE tkp IS NOT NULL
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;