# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visca CRM is an influencer management system built with Next.js 15, Supabase, and TypeScript. It manages influencer collaborations, tracks deliverables, monitors performance metrics, and handles financial data with focus on TKP (Tausend-Kontakt-Preis) calculations.

## Development Commands

```bash
npm run dev                    # Start development server with Turbopack
npm run build                  # Build production bundle
npm run lint                   # Run ESLint (configured with Next.js core-web-vitals)
npm run verify                 # Verify Supabase connection
npm run seed                   # Seed database with test data
npm run migrate:engagements    # Apply engagements migration
npx tsc --noEmit              # Type check without building
```

## Architecture & Key Concepts

### Database Structure (Updated January 2025)
- **Supabase PostgreSQL** with Row Level Security (RLS)
- Core tables:
  - `engagements`: Influencer collaborations (replaces simple campaigns)
  - `deliverables`: Content tracking with approval workflow
  - `influencer_accounts`: Multi-platform social media support
  - `deliverable_metrics`: Performance tracking (views, clicks, ROI)
  - `engagement_tasks`: Reminders and follow-ups
  - `invoices`: Financial tracking
  - `coupon_codes`: Campaign attribution
- Views: `v_monthly_grid`, `influencer_performance`, `brand_collaboration_history`

### Authentication Flow
- Supabase Auth with email/password
- Protected routes via `app/(dashboard)/layout.tsx` server component
- User check with redirect: `if (!user) redirect('/login')`
- Service role key required for admin operations (never expose client-side)

### State Management Pattern
- **Server Components by default** for data fetching
- **Client Components** (`'use client'`) for interactivity
- React Query (`@tanstack/react-query`) for server state caching
- React Hook Form + Zod for form validation
- Sonner for toast notifications

### Component Architecture
- **Sliding Panels**: `components/ui/sliding-panel.tsx` for detail views
- **Data Tables**: `@tanstack/react-table` with sorting/filtering/pagination
- **Error Boundaries**: Graceful error handling
- **Loading Skeletons**: Better perceived performance

### Import Paths
- Use `@/` alias for imports (configured in tsconfig.json)
- Example: `import { createClient } from '@/lib/supabase/server'`

## Critical Implementation Details

### Supabase Client Usage
```typescript
// Server Component (app directory)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yaxwwlntgnnmykipshps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...  # Public, safe for client
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...      # Secret, server-only
```

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Target: ES2017 for compatibility

### Tailwind CSS
- Version 3.4.1 (v4 has breaking changes with shadcn/ui)
- Custom animations in `tailwind.config.ts`
- shadcn/ui components in `components/ui/`

### Form Validation Pattern
```typescript
const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  amount: z.number().positive('Must be positive')
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
})
```

### Date/Currency Formatting
```typescript
import { formatCurrency, formatDate, formatFollowerCount } from '@/lib/utils/formatters'
// formatCurrency(1500) => "$1,500.00"
// formatDate('2025-01-15') => "Jan 15, 2025"
// formatFollowerCount(125000) => "125K"
```

## Common Patterns to Follow

### Server vs Client Components
- **Server by default**: Data fetching, SEO, initial render
- **Client when needed**: Forms, modals, real-time updates, browser APIs

### Error Handling in Server Components
```typescript
const { data, error } = await supabase.from('table').select()
if (error) {
  console.error('Error:', error.message)
  // Show user-friendly error UI
}
```

### Creating CRUD Features
1. Design database schema in Supabase
2. Update `types/database.ts` with TypeScript types
3. Create server component for data fetching
4. Build client component for interactions
5. Implement form with validation
6. Add optimistic updates for better UX

### Sliding Panel Usage
```tsx
const [isOpen, setIsOpen] = useState(false)

<SlidingPanel 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Details"
  width="lg"
>
  <PanelContent />
</SlidingPanel>
```

## Testing & Debugging

### Common Issues
- **"Table does not exist"**: Run migrations with `npm run migrate:engagements`
- **RLS errors**: Check user authentication and policies in Supabase dashboard
- **Type errors**: Run `npx tsc --noEmit` to check types
- **ESLint warnings**: Run `npm run lint` to check code quality

### Debugging Supabase Queries
```typescript
// Log full error details
console.error('Query failed:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint
})
```

## Project Structure
```
app/
├── (auth)/              # Public auth pages
├── (dashboard)/         # Protected pages
│   ├── engagements/    # Collaboration management
│   ├── influencers/    # Influencer profiles
│   └── brands/         # Brand management
components/
├── ui/                 # shadcn/ui components
├── engagements/        # Engagement-specific components
├── influencers/        # Influencer components
└── kpi/                # Analytics components
lib/
├── supabase/          # Database clients
└── utils/             # Helpers and formatters
hooks/                 # Custom React hooks
types/                 # TypeScript definitions
```

## Deployment Notes
- Verify all environment variables in production
- Enable RLS policies in Supabase
- Run database migrations before deploying
- Test authentication flow end-to-end
- Monitor Supabase usage (free tier limits)