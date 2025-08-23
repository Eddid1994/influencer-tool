# Visca CRM Data Model Relationships

## Core Entities and Relationships

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   BRANDS    │         │  CAMPAIGNS   │         │ INFLUENCERS  │
├─────────────┤         ├──────────────┤         ├──────────────┤
│ id (uuid)   │────┐    │ id (uuid)    │    ┌───│ id (uuid)    │
│ name        │    │    │ brand_id  ───│────┘   │ name         │
│ website     │    └───│ influencer_id│────────│ email        │
│ industry    │         │ created_by───│────┐   │ instagram    │
│ contact_*   │         │ campaign_name│    │   │ tiktok       │
│ notes       │         │ status       │    │   │ youtube      │
└─────────────┘         │ dates        │    │   │ niche[]      │
                        │ budget/cost  │    │   │ status       │
                        │ views        │    │   │ assigned_mgr │
                        │ TKP (calc)   │    │   └──────────────┘
                        └──────────────┘    │
                                                          │
                        ┌──────────────┐                 │
                        │  ACTIVITIES  │                 │
                        ├──────────────┤                 │
                        │ id (uuid)    │                 │
                        │ influencer_id│─────────────────┘
                        │ user_id      │
                        │ activity_type│
                        │ description  │
                        │ created_at   │
                        └──────────────┘

                        ┌──────────────┐
                        │   PROFILES   │
                        ├──────────────┤
                        │ id (uuid)    │───── Manages influencers
                        │ email        │───── Creates activities  
                        │ full_name    │───── Creates campaigns
                        │ role         │
                        └──────────────┘
```

## Relationship Explanations

### 1. **Brands ←→ Campaigns (One-to-Many)**
- A Brand can have MANY Campaigns
- Each Campaign belongs to ONE Brand
- Example: Nike has multiple campaigns throughout the year

### 2. **Influencers ←→ Campaigns (One-to-Many)**
- An Influencer can participate in MANY Campaigns
- Each Campaign works with ONE Influencer
- Example: Emma Rodriguez works with Fashion Nova, Adidas, and Zara

### 3. **Campaigns (Junction/Bridge)**
- Campaigns act as the bridge between Brands and Influencers
- Records the business relationship: when a Brand books an Influencer
- Tracks all campaign details: budget, dates, performance metrics, TKP
- **NEW:** Records who created the campaign via `created_by` field

### 4. **Influencers ←→ Activities (One-to-Many)**
- Each Influencer can have MANY Activities (emails, calls, meetings)
- Each Activity relates to ONE Influencer
- Tracks all interactions with an influencer

### 5. **Profiles ←→ Influencers (One-to-Many)**
- A Profile (user/manager) can manage MANY Influencers
- Each Influencer can have ONE assigned manager
- The `assigned_manager` field in influencers references profiles.id

### 6. **Profiles ←→ Activities (One-to-Many)**
- A Profile (user) creates MANY Activities
- Each Activity is created by ONE user
- Tracks who performed each interaction

### 7. **Profiles ←→ Campaigns (One-to-Many)** [NEW]
- A Profile (user) can create MANY Campaigns
- Each Campaign is created by ONE user
- The `created_by` field tracks who initiated the campaign

## Business Logic Flow

1. **Profile (user) creates a campaign:**
   - Profile searches for suitable influencers for a brand
   - Brand is created/selected in the system
   - Influencer is identified and contacted
   - Profile creates Campaign linking Brand + Influencer
   - Campaign's `created_by` field records which profile created it
   - Campaign tracks all details of this collaboration

2. **Campaign Lifecycle:**
   ```
   Brand → Creates Campaign → Assigns Influencer
                ↓
   Campaign Status: planned → active → completed
                ↓
   Track: Budget, Views, Cost, TKP (Cost per 1000 views)
   ```

3. **Activity Tracking:**
   - Every interaction with an influencer is logged
   - Managers can see full history of communications
   - Helps track relationship progress

## Key Points

- **Campaigns** are the central entity that connects brands with influencers
- **Profiles** (users) are the ones who create and manage campaigns
- One campaign = One brand booking one influencer for a specific purpose
- If Nike wants to work with 3 influencers, that's 3 separate campaigns
- If an influencer works with Nike on 2 different projects, that's 2 campaigns
- TKP (Tausend-Kontakt-Preis) is automatically calculated: (cost/views) × 1000
- The `created_by` field ensures accountability and tracks which user initiated each campaign

## Example Scenarios

### Scenario 1: Nike Summer Campaign
- Brand: Nike
- Influencers: James Mitchell, Ryan Garcia
- Creates: 2 Campaigns (one for each influencer)
- Each campaign tracks its own budget, performance, dates

### Scenario 2: Emma Rodriguez Multi-Brand
- Influencer: Emma Rodriguez
- Brands: Fashion Nova, Zara, H&M
- Creates: 3 Campaigns (one for each brand collaboration)
- Emma's profile shows all her campaign history

### Scenario 3: Campaign Performance
- Campaign: "Fashion Nova Spring 2024"
- Brand: Fashion Nova (brand_id)
- Influencer: Emma Rodriguez (influencer_id)
- Created By: John Smith (created_by → profiles.id)
- Budget: $75,000
- Actual Cost: $70,000
- Target Views: 2,000,000
- Actual Views: 2,150,000
- TKP: $32.56 (automatically calculated)

## Updated Workflow

The complete workflow with the new `created_by` field:

1. **Profile** (manager/user) logs into the system
2. **Profile** searches for suitable **Influencers** for a **Brand**
3. **Profile** creates a **Campaign** that:
   - Links to the **Brand** (brand_id)
   - Links to the **Influencer** (influencer_id)
   - Records the **Profile** who created it (created_by)
4. **Activities** track all interactions during the campaign
5. The system maintains full accountability of who created what