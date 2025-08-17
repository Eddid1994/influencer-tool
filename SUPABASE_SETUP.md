# Complete Supabase Setup Guide for Visca CRM

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
   - Save the `service_role` key somewhere secure (for admin operations)

## Step 3: Set Up Database Schema

### Option A: Using SQL Editor (Recommended for MVP)

1. **Go to SQL Editor** in the left sidebar
2. Click **"New query"**
3. **Copy and paste** the entire contents of `/supabase/schema.sql`
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Option B: Using Migrations (Better for Production)

1. **Install Supabase CLI:**
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

2. **Initialize Supabase locally:**
```bash
supabase init
```

3. **Link to your project:**
```bash
supabase link --project-ref your-project-ref
# (find project-ref in Settings → General)
```

4. **Run migrations:**
```bash
supabase db push
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

Run this in the SQL Editor to add sample data:

```sql
-- Insert sample brands
INSERT INTO brands (name, website, industry, contact_email) VALUES
('Fashion Co', 'https://fashionco.com', 'Fashion', 'contact@fashionco.com'),
('Tech Gadgets', 'https://techgadgets.com', 'Technology', 'hello@techgadgets.com'),
('Beauty Brand', 'https://beautybrand.com', 'Beauty', 'info@beautybrand.com');

-- Insert sample influencers (make sure to replace user_id with your actual user ID)
INSERT INTO influencers (name, email, instagram_handle, instagram_followers, status, niche) VALUES
('Sarah Johnson', 'sarah@email.com', '@sarahjohnson', 125000, 'active', ARRAY['fashion', 'lifestyle']),
('Mike Chen', 'mike@email.com', '@mikechen', 85000, 'active', ARRAY['tech', 'gaming']),
('Emma Wilson', 'emma@email.com', '@emmawilson', 200000, 'new', ARRAY['beauty', 'fashion']);
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

**2. "Permission denied for table"**
- Check RLS policies are created
- Ensure user is authenticated
- Verify the user's role in profiles table

**3. "Email not sending"**
- Check Authentication → Settings
- Verify SMTP settings if using custom
- Check spam folder

**4. "Cannot connect to database"**
- Verify project is running (not paused)
- Check network/firewall settings
- Ensure correct project URL

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

-- View all influencers
SELECT * FROM influencers ORDER BY created_at DESC;

-- Check campaigns with calculations
SELECT 
  c.*,
  b.name as brand_name,
  i.name as influencer_name
FROM campaigns c
LEFT JOIN brands b ON c.brand_id = b.id
LEFT JOIN influencers i ON c.influencer_id = i.id;

-- Database size
SELECT pg_database_size('postgres') / 1024 / 1024 as size_mb;
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