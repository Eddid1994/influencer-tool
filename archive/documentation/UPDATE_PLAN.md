# UI Update Plan - 10 Steps to Implement New Database Schema

## Overview
Update the Visca CRM UI to work with the new optimized database schema, focusing on the engagements workflow and related features.

## Step 1: Update Database Types
**Files to update:**
- `/types/database.ts` - Add new table types
- `/types/engagement.ts` - Create engagement-specific types

**New Tables to Add:**
```typescript
- brand_contacts
- influencer_accounts
- influencer_account_stats
- engagements (replaces campaigns)
- deliverables
- deliverable_metrics
- engagement_tasks
- invoices
- coupon_codes
```

## Step 2: Create Engagement List Page
**Location:** `/app/(dashboard)/engagements/page.tsx`
**Features:**
- List all engagements with status badges
- Filter by brand, influencer, status, period
- Quick actions: View, Edit, Add Deliverable
- Replace the current campaigns page

## Step 3: Create Engagement Detail Page
**Location:** `/app/(dashboard)/engagements/[id]/page.tsx`
**Features:**
- Overview tab with key metrics
- Deliverables tab with content tracking
- Tasks & Reminders tab
- Invoice & Payments tab
- Performance metrics

## Step 4: Add Deliverables Management
**Component:** `/components/engagements/deliverables-table.tsx`
**Features:**
- List all deliverables for an engagement
- Track status: briefing → content creation → approval → live
- Add/Edit deliverable dialog
- Bulk status updates

## Step 5: Implement Workflow Pipeline View
**Component:** `/components/engagements/pipeline-view.tsx`
**Features:**
- Kanban-style view of engagement stages
- Drag & drop to change status
- Quick filters by brand/period
- Visual progress indicators

## Step 6: Create Metrics Dashboard
**Component:** `/components/engagements/metrics-panel.tsx`
**Features:**
- Real-time TKP calculation
- Views vs target tracking
- ROI/ROAS calculation
- Engagement rate trends

## Step 7: Add Task Management
**Component:** `/components/engagements/tasks-list.tsx`
**Features:**
- List upcoming tasks/reminders
- Mark as complete
- Create follow-up tasks
- Calendar view of deadlines

## Step 8: Implement Invoice Tracking
**Component:** `/components/engagements/invoice-section.tsx`
**Features:**
- Create/Edit invoices
- Track payment status
- Generate invoice numbers
- Export to PDF (future)

## Step 9: Update Navigation & Dashboard
**Files:**
- `/components/layout/sidebar.tsx` - Change "Campaigns" to "Engagements"
- `/app/(dashboard)/dashboard/page.tsx` - Update metrics to use new tables
**Changes:**
- Update menu items
- Fix dashboard queries
- Add engagement statistics

## Step 10: Create Quick Actions & Bulk Operations
**Component:** `/components/engagements/quick-actions.tsx`
**Features:**
- Bulk create engagements
- Import from CSV
- Export monthly report
- Batch status updates

## Implementation Order & Priority

### Phase 1: Core Updates (Steps 1-3)
**Priority: HIGH**
- Update types
- Create basic engagement pages
- Ensure data flows correctly

### Phase 2: Feature Addition (Steps 4-6)
**Priority: MEDIUM**
- Add deliverables tracking
- Implement pipeline view
- Show performance metrics

### Phase 3: Enhanced Features (Steps 7-10)
**Priority: LOW**
- Task management
- Invoice tracking
- Navigation updates
- Bulk operations

## Key UI Components to Create

### 1. Engagement Card
```tsx
<EngagementCard
  engagement={engagement}
  showMetrics={true}
  onEdit={() => {}}
  onViewDetails={() => {}}
/>
```

### 2. Deliverable Row
```tsx
<DeliverableRow
  deliverable={deliverable}
  onStatusChange={() => {}}
  onMetricsUpdate={() => {}}
/>
```

### 3. Status Pipeline
```tsx
<StatusPipeline
  engagements={engagements}
  onStatusChange={() => {}}
  groupBy="status"
/>
```

### 4. Metrics Widget
```tsx
<MetricsWidget
  type="tkp"
  value={45.20}
  trend={-5.4}
  comparison="lastMonth"
/>
```

## Database Query Examples

### Get Engagements with Details
```sql
SELECT 
  e.*,
  b.name as brand_name,
  i.name as influencer_name,
  COUNT(d.id) as deliverable_count
FROM engagements e
LEFT JOIN brands b ON e.brand_id = b.id
LEFT JOIN influencers i ON e.influencer_id = i.id
LEFT JOIN deliverables d ON d.engagement_id = e.id
GROUP BY e.id, b.name, i.name
```

### Get Deliverables with Metrics
```sql
SELECT 
  d.*,
  m.views,
  m.clicks,
  m.engagement_rate
FROM deliverables d
LEFT JOIN deliverable_metrics_final m ON m.deliverable_id = d.id
WHERE d.engagement_id = $1
```

## Success Criteria

✅ Users can create and manage engagements (not campaigns)
✅ Deliverables are tracked with status workflow
✅ Metrics are calculated automatically (TKP, ROI, ROAS)
✅ Tasks and reminders are visible and actionable
✅ Invoice tracking is integrated
✅ Monthly grid view (v_monthly_grid) displays correctly
✅ All CRUD operations work with new schema
✅ Performance is maintained or improved
✅ Mobile responsive design
✅ No breaking changes for existing users

## Notes
- Keep the UI similar to existing design for consistency
- Use existing shadcn/ui components
- Implement optimistic updates for better UX
- Add loading states and error handling
- Use React Query for data fetching where possible