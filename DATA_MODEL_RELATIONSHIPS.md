# Visca CRM Data Model Relationships

## Core Entities and Relationships

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   BRANDS    │         │  CAMPAIGNS   │         │ INFLUENCERS  │
├─────────────┤         ├──────────────┤         ├──────────────┤
│ id (uuid)   │────┐    │ id (uuid)    │    ┌───│ id (uuid)    │
│ name        │    │    │ brand_id  ───│────┘   │ name         │
│ website     │    └───│ influencer_id│────────│ email        │
│ industry    │         │ campaign_name│         │ instagram    │
│ contact_*   │         │ status       │         │ tiktok       │
│ notes       │         │ dates        │         │ youtube      │
└─────────────┘         │ budget/cost  │         │ niche[]      │
                        │ views        │         │ status       │
                        │ TKP (calc)   │         │ assigned_mgr │
                        └──────────────┘         └──────────────┘
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
                        │ full_name    │
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

## Business Logic Flow

1. **Brand wants to run a campaign:**
   - Brand is created/selected in the system
   - Influencer is identified and contacted
   - Campaign is created linking Brand + Influencer
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
- One campaign = One brand booking one influencer for a specific purpose
- If Nike wants to work with 3 influencers, that's 3 separate campaigns
- If an influencer works with Nike on 2 different projects, that's 2 campaigns
- TKP (Tausend-Kontakt-Preis) is automatically calculated: (cost/views) × 1000

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
- Budget: $75,000
- Actual Cost: $70,000
- Target Views: 2,000,000
- Actual Views: 2,150,000
- TKP: $32.56 (automatically calculated)