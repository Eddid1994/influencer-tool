-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'manager', 'viewer')) default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Influencers table
create table influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  instagram_handle text,
  instagram_followers integer default 0,
  tiktok_handle text,
  tiktok_followers integer default 0,
  youtube_handle text,
  youtube_subscribers integer default 0,
  niche text[], -- array of tags like ['fashion', 'lifestyle']
  status text check (status in ('new', 'contacted', 'negotiating', 'active', 'inactive', 'rejected')) default 'new',
  assigned_manager uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brands table
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  contact_email text,
  contact_phone text,
  industry text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  influencer_id uuid references influencers(id) on delete cascade,
  campaign_name text not null,
  status text check (status in ('planned', 'active', 'completed', 'cancelled')) default 'planned',
  start_date date,
  end_date date,
  budget decimal(10,2),
  actual_cost decimal(10,2),
  target_views integer,
  actual_views integer,
  tkp decimal(10,2) generated always as (
    case when actual_views > 0 
    then (actual_cost / actual_views * 1000)
    else null end
  ) stored,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activities table for tracking interactions
create table activities (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid references influencers(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  activity_type text not null, -- 'email_sent', 'call_made', 'meeting_scheduled', 'contract_signed'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_influencers_status on influencers(status);
create index idx_influencers_assigned_manager on influencers(assigned_manager);
create index idx_campaigns_brand_id on campaigns(brand_id);
create index idx_campaigns_influencer_id on campaigns(influencer_id);
create index idx_campaigns_status on campaigns(status);
create index idx_activities_influencer_id on activities(influencer_id);
create index idx_activities_user_id on activities(user_id);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table influencers enable row level security;
alter table brands enable row level security;
alter table campaigns enable row level security;
alter table activities enable row level security;

-- Create policies for profiles
create policy "Users can view all profiles" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Create policies for influencers
create policy "Authenticated users can view all influencers" on influencers
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert influencers" on influencers
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update influencers" on influencers
  for update using (auth.role() = 'authenticated');

create policy "Admin can delete influencers" on influencers
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create policies for brands
create policy "Authenticated users can view all brands" on brands
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage brands" on brands
  for all using (auth.role() = 'authenticated');

-- Create policies for campaigns
create policy "Authenticated users can view all campaigns" on campaigns
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage campaigns" on campaigns
  for all using (auth.role() = 'authenticated');

-- Create policies for activities
create policy "Authenticated users can view all activities" on activities
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create activities" on activities
  for insert with check (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for influencers updated_at
create trigger update_influencers_updated_at before update on influencers
  for each row execute function update_updated_at_column();

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();