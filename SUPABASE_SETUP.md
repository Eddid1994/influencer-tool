# Complete Supabase Setup Guide for Visca CRM

> **⚠️ IMPORTANT UPDATE (January 2025):** The database schema has been significantly optimized with new tables for better performance and workflow management. Please use the new migration approach below.

## Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)** and click "Start your project"
2. **Sign up** with GitHub or email
3. **Create a new project:**
   - Click "New Project"
   - **Project name:** `visca-crm` (or your preferred name)
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is perfect for MVP
   - Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your API Keys

Once your project is ready:

1. **Go to Settings → API** in the left sidebar
2. **Copy these values:**
   - `Project URL` (looks like: https://xxxxx.supabase.co)
   - `anon public` key (safe for browser)
   - Save the `service_role` key somewhere secure (for admin operations - needed for data seeding)

## Step 3: Set Up Database Schema (Updated January 2025)

### Option A: Automated Migration Script (Recommended)

1. **Set up environment variables:**
```bash
# Create .env.local file with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ... # Required for migrations
```

2. **Run the optimization migration:**
```bash
# Check current schema without changes
node scripts/apply-database-optimization.js --check

# Apply the optimized schema
node scripts/apply-database-optimization.js
```

### Option B: Manual SQL Migration

1. **Go to SQL Editor** in the left sidebar
2. Click **"New query"**
3. **Run migrations in order:**
   - First run `/migrations/001_optimize_database_mvp.sql`
   - This creates the new optimized schema with:
     - `engagements` table (replaces simple campaigns)
     - `deliverables` table (content tracking)
     - `influencer_accounts` (multi-platform support)
     - `deliverable_metrics` (performance tracking)
     - And more...

### New Database Structure (January 2025)

The optimized schema includes:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User accounts | RLS enabled, role-based access |
| `influencers` | Influencer profiles | Core contact info |
| `influencer_accounts` | Social accounts | Multiple platforms per influencer |
| `influencer_account_stats` | Historical metrics | Track growth over time |
| `brands` | Brand information | Client management |
| `brand_contacts` | Contact persons | Multiple contacts per brand |
| `engagements` | Collaborations | Core workflow table |
| `deliverables` | Content tracking | Per-engagement deliverables |
| `deliverable_metrics` | Performance data | Views, clicks, ROI |
| `engagement_tasks` | Reminders | Follow-ups, deadlines |
| `invoices` | Financial tracking | Payment management |
| `coupon_codes` | Campaign codes | Attribution tracking |

### Option C: Using Supabase CLI (Production)

1. **Install Supabase CLI:**
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

2. **Initialize and link:**
```bash
supabase init
supabase link --project-ref your-project-ref
```

3. **Apply migrations:**
```bash
supabase migration up
```

## Step 4: Configure Authentication

1. **Go to Authentication → Providers** in Supabase dashboard
2. **Email Provider** should be enabled by default
3. **Configure email settings:**
   - Go to Authentication → Email Templates
   - Customize confirmation email if desired
   - Set redirect URLs for your domain

4. **Add your site URL:**
   - Go to Authentication → URL Configuration
   - Add `http://localhost:3000` to Redirect URLs
   - Add your production URL when ready (e.g., `https://your-app.vercel.app`)

## Step 5: Set Up Row Level Security (RLS)

RLS is already configured in our schema, but verify it's working:

1. **Go to Authentication → Policies**
2. You should see policies for each table
3. **Test RLS:**
   - Go to SQL Editor
   - Run: `SELECT * FROM influencers;`
   - Should return empty (no auth)

## Step 6: Configure Your Application

1. **Copy the example environment file:**
```bash
cp .env.local.example .env.local
```

2. **Edit `.env.local` with your values:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

3. **Test the connection:**
```bash
npm run dev
```
Visit http://localhost:3000 - you should see the login page

## Step 7: Create Your First User

1. **Go to your app** at http://localhost:3000/signup
2. **Sign up** with your email
3. **Check your email** for confirmation link
4. **Click the link** to verify your account
5. **Log in** at http://localhost:3000/login

## Step 8: Add Sample Data (Optional)

### For New Optimized Schema:

Run this in the SQL Editor to add sample data:

```sql
-- Insert sample brands
INSERT INTO brands (name, website, industry, contact_email) VALUES
('Fashion Co', 'https://fashionco.com', 'Fashion', 'contact@fashionco.com'),
('Tech Gadgets', 'https://techgadgets.com', 'Technology', 'hello@techgadgets.com'),
('Beauty Brand', 'https://beautybrand.com', 'Beauty', 'info@beautybrand.com');

-- Insert sample influencers
INSERT INTO influencers (name, email, instagram_handle, instagram_followers, status, niche) VALUES
('Sarah Johnson', 'sarah@email.com', '@sarahjohnson', 125000, 'active', ARRAY['fashion', 'lifestyle']),
('Mike Chen', 'mike@email.com', '@mikechen', 85000, 'active', ARRAY['tech', 'gaming']),
('Emma Wilson', 'emma@email.com', '@emmawilson', 200000, 'new', ARRAY['beauty', 'fashion']);

-- Add influencer social accounts (new structure)
INSERT INTO influencer_accounts (influencer_id, platform, handle, is_primary)
SELECT 
    i.id,
    'instagram',
    i.instagram_handle,
    true
FROM influencers i
WHERE i.instagram_handle IS NOT NULL;

-- Create sample engagement
INSERT INTO engagements (brand_id, influencer_id, period_label, period_year, period_month, status, agreed_total_cents)
SELECT 
    b.id,
    i.id,
    '2025-01 Januar',
    2025,
    1,
    'active',
    150000 -- €1,500
FROM brands b, influencers i
WHERE b.name = 'Fashion Co' AND i.name = 'Sarah Johnson';

-- Add deliverables to engagement
INSERT INTO deliverables (engagement_id, platform, deliverable, planned_publish_at, promoted_product)
SELECT 
    e.id,
    'instagram',
    'story',
    '2025-01-15',
    'Spring Collection'
FROM engagements e
LIMIT 1;
```

### Or use the seed script:
```bash
npm run seed
# or
node scripts/seed-data.js
```

## Step 9: Verify Everything Works

### Quick Checklist:
- [ ] Can create an account
- [ ] Can log in
- [ ] Dashboard loads with metrics
- [ ] Can add an influencer
- [ ] Can create a campaign
- [ ] Can import/export CSV

## Step 10: Production Deployment

### For Vercel:
1. **Push your code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy!**

### Security Checklist:
- [ ] RLS policies are enabled
- [ ] API keys are in environment variables
- [ ] Email confirmation is required
- [ ] CORS is configured for your domain

## Troubleshooting

### Common Issues:

**1. "Invalid API key"**
- Double-check you copied the entire key
- Make sure you're using the `anon` key, not `service_role`
- Service role key is only needed for migrations and seeding

**2. "Permission denied for table"**
- Check RLS policies are created
- Ensure user is authenticated
- Verify the user's role in profiles table
- New tables need RLS policies (already included in migration)

**3. "Table does not exist" errors**
- Run the database migration first: `node scripts/apply-database-optimization.js`
- Check migration status: `node scripts/apply-database-optimization.js --check`
- The app now uses new tables like `engagements` instead of just `campaigns`

**4. "Email not sending"**
- Check Authentication → Settings
- Verify SMTP settings if using custom
- Check spam folder

**5. "Cannot connect to database"**
- Verify project is running (not paused)
- Check network/firewall settings
- Ensure correct project URL

**6. "View v_monthly_grid is empty"**
- This is normal if you have no data
- Add sample data using Step 8
- The view requires data in `engagements` and `deliverables` tables

## Backup Your Database

### Manual Backup:
1. Go to Settings → Backups
2. Click "Download backup"

### Scheduled Backups (Pro feature):
- Automatic daily backups
- Point-in-time recovery

## Monitoring

1. **Go to Reports** in Supabase dashboard
2. Monitor:
   - API usage
   - Database size
   - Active users
   - Query performance

## Next Steps

1. **Set up custom domain** (optional)
2. **Configure email templates**
3. **Add social login providers** (Google, GitHub)
4. **Set up real-time subscriptions** for live updates
5. **Configure storage** for file uploads

## Useful SQL Queries

```sql
-- Check total users
SELECT COUNT(*) FROM auth.users;

-- View all influencers with their accounts
SELECT 
    i.*,
    array_agg(
        json_build_object(
            'platform', ia.platform,
            'handle', ia.handle,
            'is_primary', ia.is_primary
        )
    ) as accounts
FROM influencers i
LEFT JOIN influencer_accounts ia ON ia.influencer_id = i.id
GROUP BY i.id
ORDER BY i.created_at DESC;

-- Check engagements with full details (new structure)
SELECT 
    e.*,
    b.name as brand_name,
    i.name as influencer_name,
    bc.name as contact_name,
    COUNT(d.id) as deliverable_count,
    SUM(CASE WHEN d.content_approved THEN 1 ELSE 0 END) as approved_count
FROM engagements e
LEFT JOIN brands b ON e.brand_id = b.id
LEFT JOIN influencers i ON e.influencer_id = i.id
LEFT JOIN brand_contacts bc ON e.brand_contact_id = bc.id
LEFT JOIN deliverables d ON d.engagement_id = e.id
GROUP BY e.id, b.name, i.name, bc.name
ORDER BY e.opened_at DESC;

-- Monthly performance overview (using new view)
SELECT * FROM v_monthly_grid 
WHERE monat LIKE '2025%'
ORDER BY monat DESC, brand;

-- Check deliverables with metrics
SELECT 
    d.*,
    m.views,
    m.clicks,
    m.engagement_rate,
    (m.revenue_cents::numeric / 100) as revenue
FROM deliverables d
LEFT JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
WHERE d.planned_publish_at >= CURRENT_DATE - INTERVAL '30 days';

-- Database size and table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Performance: Find slow queries (requires pg_stat_statements extension)
-- SELECT query, calls, mean_exec_time, total_exec_time 
-- FROM pg_stat_statements 
-- ORDER BY mean_exec_time DESC 
-- LIMIT 10;
```

## Support Resources

- **Supabase Discord:** https://discord.supabase.com
- **Documentation:** https://supabase.com/docs
- **Status Page:** https://status.supabase.com

---

**Remember:** The free tier includes:
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

This is more than enough for your MVP and initial growth!