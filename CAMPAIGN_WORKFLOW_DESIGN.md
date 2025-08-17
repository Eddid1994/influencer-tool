# Campaign Workflow System Design

## Overview
A structured workflow system that guides brands through the entire influencer collaboration process, from discovery to campaign completion.

## Workflow Stages

### Stage 1: Discovery & Selection 🔍
**Purpose**: Brand identifies and selects influencers for campaign
- Browse influencer database
- Review performance metrics
- Create shortlist
- Add to campaign roster

### Stage 2: Initial Outreach 📧
**Purpose**: First contact with selected influencers
- Auto-generate personalized outreach emails
- Track email sent status
- Monitor open/click rates (if integrated)
- Set follow-up reminders

### Stage 3: Follow-up Sequence 🔄
**Purpose**: Automated reminder system
- **Reminder 1**: 3 days after initial (if no response)
- **Reminder 2**: 7 days after initial 
- **Reminder 3**: 14 days after initial
- **Auto-archive**: After 3rd reminder with no response

### Stage 4: Response & Negotiation 💬
**Purpose**: Handle influencer responses
- Mark as "Responded"
- Enter negotiation phase
- Track offers/counter-offers
- Document agreed terms

### Stage 5: Contract & Onboarding 📝
**Purpose**: Finalize agreement
- Generate contract terms
- Set deliverables
- Define timeline
- Share brand assets

### Stage 6: Content Creation 🎨
**Purpose**: Track content production
- Monitor deliverable progress
- Review and approve content
- Request revisions if needed
- Track posting schedule

### Stage 7: Campaign Live 🚀
**Purpose**: Monitor active campaign
- Track post performance
- Monitor engagement
- Calculate real-time metrics
- Generate reports

### Stage 8: Completion & Analysis 📊
**Purpose**: Wrap up and learn
- Final performance report
- ROI calculation
- Influencer rating
- Archive for future reference

## Database Schema

```sql
-- Campaign Workflows Table
CREATE TABLE campaign_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id),
  name text NOT NULL,
  status text CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at timestamp DEFAULT NOW()
);

-- Workflow Participants (Influencers in this workflow)
CREATE TABLE workflow_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES campaign_workflows(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES influencers(id),
  stage text CHECK (stage IN (
    'selected',           -- Stage 1
    'outreach_sent',      -- Stage 2
    'reminder_1',         -- Stage 3
    'reminder_2',         -- Stage 3
    'reminder_3',         -- Stage 3
    'no_response',        -- Stage 3 (archived)
    'responded',          -- Stage 4
    'negotiating',        -- Stage 4
    'agreed',            -- Stage 4
    'rejected',          -- Stage 4
    'contracted',        -- Stage 5
    'creating_content',  -- Stage 6
    'content_approved',  -- Stage 6
    'campaign_live',     -- Stage 7
    'completed'          -- Stage 8
  )),
  
  -- Outreach tracking
  outreach_sent_at timestamp,
  reminder_1_sent_at timestamp,
  reminder_2_sent_at timestamp,
  reminder_3_sent_at timestamp,
  responded_at timestamp,
  
  -- Email content
  outreach_subject text,
  outreach_body text,
  
  -- Response tracking
  response_type text CHECK (response_type IN ('interested', 'not_interested', 'need_more_info', 'counter_offer')),
  response_notes text,
  
  -- Progress tracking
  deliverables_completed integer DEFAULT 0,
  deliverables_total integer,
  
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Email Templates
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id),
  template_type text CHECK (template_type IN ('outreach', 'reminder_1', 'reminder_2', 'reminder_3', 'negotiation', 'contract')),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb, -- {influencer_name}, {brand_name}, {campaign_name}, etc.
  is_default boolean DEFAULT false,
  created_at timestamp DEFAULT NOW()
);

-- Workflow Activities Log
CREATE TABLE workflow_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES campaign_workflows(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES workflow_participants(id),
  activity_type text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamp DEFAULT NOW()
);

-- Automated Reminders Queue
CREATE TABLE reminder_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES workflow_participants(id) ON DELETE CASCADE,
  reminder_type text CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'reminder_3')),
  scheduled_for timestamp NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamp,
  created_at timestamp DEFAULT NOW()
);
```

## UI Components

### 1. Campaign Workflow Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Campaign: Summer Fashion 2024                           │
│ Brand: Fashion Nova                                     │
├─────────────────────────────────────────────────────────┤
│ Progress Overview                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Selected │ Outreach │ Response │ Negotiation │ Live│ │
│ │    20    │    18    │    12    │     8       │  5  │ │
│ └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ Stage Tabs                                             │
│ [Discovery] [Outreach] [Follow-up] [Negotiation] ...   │
└─────────────────────────────────────────────────────────┘
```

### 2. Influencer Pipeline View
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Selected    │  Outreach    │  Negotiating │  Active      │
│     (5)      │     (8)      │     (3)      │     (2)      │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ □ Emma R.    │ □ James M.   │ □ Sophia C.  │ □ Michael J. │
│ □ Isabella M.│   Sent 2d ago│   Offer: 50k │   Live now   │
│ □ David P.   │ □ Ryan G.    │ □ Ava W.     │ □ Nathan B.  │
│ □ Olivia T.  │   Sent 5d ago│   Offer: 35k │   2 posts    │
│ □ Sarah K.   │   🔔 Remind  │ □ Maya P.    │              │
│              │              │   Counter:40k │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 3. Email Outreach Interface
```
┌─────────────────────────────────────────────────────────┐
│ Send Outreach to 5 Selected Influencers                │
├─────────────────────────────────────────────────────────┤
│ Template: [Summer Campaign Outreach ▼]                 │
│                                                         │
│ Subject: Exciting Partnership with {brand_name}        │
│                                                         │
│ Hi {influencer_name},                                  │
│                                                         │
│ We love your content about {niche} and would like      │
│ to discuss a partnership for our {campaign_name}.      │
│                                                         │
│ Budget: ${budget_range}                                │
│ Timeline: {timeline}                                   │
│                                                         │
│ [Personalize] [Preview] [Send to All] [Send Individual]│
└─────────────────────────────────────────────────────────┘
```

### 4. Automated Follow-up Settings
```
┌─────────────────────────────────────────────────────────┐
│ Follow-up Automation Settings                          │
├─────────────────────────────────────────────────────────┤
│ ☑ Enable automatic reminders                           │
│                                                         │
│ Reminder 1: [3] days after initial outreach           │
│ Reminder 2: [7] days after initial outreach           │
│ Reminder 3: [14] days after initial outreach          │
│                                                         │
│ ☑ Auto-archive after 3rd reminder                      │
│ ☑ Notify me when influencer responds                   │
│ ☑ Track email opens (requires integration)             │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Database & Core Logic
1. Create workflow tables
2. Build email template system
3. Implement reminder queue

### Phase 2: UI Components
1. Campaign workflow dashboard
2. Pipeline kanban view
3. Email composer with templates
4. Progress tracking

### Phase 3: Automation
1. Automated reminder system
2. Email sending integration
3. Response tracking
4. Stage transitions

### Phase 4: Analytics
1. Response rate tracking
2. Time-to-response metrics
3. Conversion funnel analysis
4. ROI calculations

## Benefits

### For Brands
- **Structured Process**: No more chaos, follow a proven workflow
- **Time Saving**: Automated reminders and templates
- **Better Tracking**: Know exactly where each influencer is in the process
- **Higher Response Rates**: Systematic follow-up increases responses
- **Data-Driven**: Learn what works from analytics

### For Campaign Managers
- **Clear Overview**: See all influencers in one pipeline
- **Bulk Actions**: Send outreach to multiple influencers at once
- **Template Library**: Reuse successful email templates
- **Reminder Automation**: Never forget to follow up
- **Performance Insights**: Track what messages work best

## Key Features

1. **Visual Pipeline**: Drag-and-drop influencers between stages
2. **Smart Templates**: Variables auto-populate with influencer/brand data
3. **Bulk Operations**: Select multiple influencers for actions
4. **Response Tracking**: Automatically move to negotiation when they reply
5. **Reminder Queue**: System handles follow-ups automatically
6. **Analytics Dashboard**: Track response rates, conversion rates
7. **Email Integration**: Send directly from platform (or copy to email client)
8. **Mobile Responsive**: Manage campaigns on the go

## Success Metrics

- **Response Rate**: % of influencers who respond to outreach
- **Time to Response**: Average days until response
- **Conversion Rate**: % who move from outreach to agreement
- **Campaign Velocity**: Time from selection to going live
- **ROI**: Revenue generated vs. campaign cost