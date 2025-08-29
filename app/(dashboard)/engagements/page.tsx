import { createClient } from '@/lib/supabase/server'
import ClientEngagementsPage from './client-page'

export default async function EngagementsPage() {
  const supabase = await createClient()
  
  // Fetch engagements with related data
  const { data: engagements, error } = await supabase
    .from('engagements')
    .select(`
      *,
      brands (name, website),
      influencers (name, email, instagram_handle),
      brand_contacts (name, email),
      deliverables (id, platform, deliverable, content_approved),
      engagement_tasks (id, completed_at),
      negotiation_status,
      negotiation_priority,
      last_contact_date
    `)
    .order('opened_at', { ascending: false })

  if (error) {
    // Enhanced error logging with more context
    console.error('Error fetching engagements:', {
      message: error.message || 'Unknown error',
      details: error.details || 'No details available',
      hint: error.hint || 'Table might not exist or RLS policies might be blocking access',
      code: error.code || 'No error code',
      fullError: JSON.stringify(error, null, 2)
    })
    
    // If the table doesn't exist, show a helpful message
    if (error.code === '42P01' || Object.keys(error).length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Engagements</h1>
              <p className="text-gray-500">Manage influencer collaborations and track deliverables</p>
            </div>
          </div>
          
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Database Setup Required</h3>
            <p className="text-orange-700 mb-4">
              The engagements table hasn't been created yet. Please run the database migration to set up the required tables.
            </p>
            <div className="bg-white rounded-md p-4 font-mono text-sm">
              <p className="text-gray-600 mb-2">Run this command in your terminal:</p>
              <code className="text-gray-900">
                npx supabase db push --db-url=$SUPABASE_DB_URL ./migrations/001_optimize_database_mvp.sql
              </code>
            </div>
            <p className="text-orange-600 mt-4 text-sm">
              After running the migration, refresh this page to see your engagements.
            </p>
          </div>
        </div>
      )
    }
  }

  return <ClientEngagementsPage engagements={engagements || []} />
}