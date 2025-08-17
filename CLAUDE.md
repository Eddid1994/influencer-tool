# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visca CRM is an influencer management system built with Next.js 15, Supabase, and TypeScript. It tracks influencer relationships, campaign performance, brand partnerships, and provides detailed analytics with focus on TKP (Tausend-Kontakt-Preis) metrics.

## Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle
npm run lint         # Run ESLint
npm run verify       # Verify Supabase setup
npm run seed         # Seed database with dummy data (requires SUPABASE_SERVICE_ROLE_KEY)
```

## Architecture & Key Concepts

### Database Structure
- **Supabase PostgreSQL** with Row Level Security (RLS)
- Core tables: `profiles`, `influencers`, `brands`, `campaigns`, `activities`
- Extended tables: `negotiations`, `campaign_workflows`, `workflow_participants`, `email_templates`
- Views: `influencer_performance`, `brand_collaboration_history`
- TKP calculation is stored as a generated column in campaigns table

### Authentication Flow
- Supabase Auth handles user authentication
- Protected routes use middleware in `app/(dashboard)` layout
- Service role key required for bypassing RLS (seeding, admin operations)

### State Management Pattern
- React Query (`@tanstack/react-query`) for server state
- Form state managed by React Hook Form + Zod validation
- Optimistic updates with toast notifications via Sonner

### Component Architecture
- **Sliding panels**: Used for quick data views without navigation (performance metrics, etc.)
- **Workflow pipeline**: Drag-and-drop Kanban board with 7 stages for campaign management
- **Data tables**: Built with `@tanstack/react-table` for sorting, filtering, pagination
- **Form dialogs**: Modal-based forms for CRUD operations

### Key UI/UX Patterns
1. **Performance Panel**: Slides from right, shows influencer metrics across campaigns/brands
2. **Campaign Workflow**: Visual pipeline with stages (Selected → Outreach → Follow-up → Negotiation → Live)
3. **Brand Detail View**: Comprehensive view showing all campaigns, influencers, and financial metrics
4. **Bulk Actions**: Email composer for batch outreach, CSV import for data migration

## Critical Implementation Details

### Supabase Configuration
- Project URL: `https://yaxwwlntgnnmykipshps.supabase.co`
- Two keys needed:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: For client-side operations (public)
  - `SUPABASE_SERVICE_ROLE_KEY`: For bypassing RLS (keep secret, server-only)

### Tailwind CSS Version
- **Important**: Use Tailwind CSS v3.4.1 (v4 has compatibility issues)
- shadcn/ui components require v3.x

### Form Validation Pattern
```typescript
// Always use Zod schemas with React Hook Form
const schema = z.object({
  field: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email')
})
```

### Drag & Drop Implementation
- Uses `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)
- Required for workflow pipeline stage management

### Date/Currency Formatting
- Utility functions in `lib/utils/formatters.ts`:
  - `formatCurrency()`: Formats numbers as EUR currency
  - `formatDate()`: Formats dates consistently
  - `formatFollowerCount()`: Formats large numbers (1.2M, 500K)

## Common Patterns to Follow

### Adding New CRUD Features
1. Create database table/columns in Supabase
2. Generate TypeScript types with Supabase CLI
3. Create table component with actions (view/edit/delete)
4. Implement form dialog with React Hook Form + Zod
5. Add detail page showing related data

### Creating Sliding Panels
Use the `SlidingPanel` component wrapper:
```tsx
<SlidingPanel isOpen={isOpen} onClose={onClose} title="Title">
  <Content />
</SlidingPanel>
```

### Adding to Campaign Workflow
1. Update workflow stages in `PIPELINE_STAGES` constant
2. Modify participant movement logic in `handleDrop`
3. Add stage-specific actions (email templates, reminders)

## Testing Approach
- Manual testing in development
- Use seed data for consistent test scenarios
- Verify RLS policies in Supabase dashboard

## Deployment Checklist
1. Ensure environment variables are set in production
2. Run database migrations in Supabase
3. Verify RLS policies are enabled
4. Test authentication flow
5. Check that service role key is NOT exposed client-side