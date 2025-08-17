# Visca CRM - Influencer Management System

A modern, fast, and intuitive CRM built specifically for managing influencer relationships, campaigns, and performance metrics.

## Features

### Core Functionality
- **Influencer Management**: Complete CRUD operations for managing influencer profiles
- **Campaign Tracking**: Monitor campaign performance, budgets, and TKP metrics
- **Brand Management**: Organize and track brand partnerships
- **Dashboard Analytics**: Real-time metrics and performance insights
- **Import/Export**: Bulk import influencers via CSV and export data

### Technical Features
- **Authentication**: Secure email/password authentication with Supabase
- **Real-time Updates**: Live data synchronization across users
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Type Safety**: Full TypeScript implementation for reliability

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/visca-crm.git
cd visca-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in the SQL editor
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
visca-crm/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/      # Protected dashboard pages
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard specific components
│   ├── influencers/     # Influencer module components
│   ├── brands/          # Brand module components
│   └── campaigns/       # Campaign module components
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
└── supabase/           # Database schema
```

## Usage Guide

### Adding Influencers

1. Navigate to the Influencers section
2. Click "Add Influencer"
3. Fill in the required information
4. Add social media profiles and follower counts
5. Assign relevant niches/tags
6. Save the influencer profile

### Managing Campaigns

1. Go to Campaigns section
2. Click "New Campaign"
3. Select a brand and influencer
4. Set budget and timeline
5. Track performance metrics
6. Monitor TKP (Tausend-Kontakt-Preis) automatically

### Importing Data

1. Download the CSV template from the Influencers page
2. Fill in your data following the template format
3. Click "Import CSV" and select your file
4. Review imported data

### CSV Import Format

```csv
name,email,instagram_handle,instagram_followers,niche
Jane Doe,jane@email.com,@janedoe,125000,"fashion,lifestyle"
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy --prod
```

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Self-hosted with Docker

## Database Management

### Backup Database
```bash
pg_dump your_database_url > backup.sql
```

### Reset Database
Run the schema file in Supabase SQL editor to reset tables.

## Performance Optimization

- Images are optimized automatically by Next.js
- Database queries use indexes for fast lookups
- React Query caches data to minimize API calls
- Pagination limits data loaded per page

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all dashboard routes
- API keys stored securely in environment variables
- Input validation on all forms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Future Enhancements

- [ ] Email automation integration
- [ ] Advanced analytics dashboard
- [ ] Chrome extension for data capture
- [ ] Mobile application
- [ ] AI-powered influencer recommendations
- [ ] Automated outreach sequences
- [ ] Contract management
- [ ] Payment tracking

## Support

For issues and questions:
- Open an issue on GitHub
- Contact support@visca-crm.com

## License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for influencer marketing teams