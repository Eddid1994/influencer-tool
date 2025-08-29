import { createClient } from '@/lib/supabase/server'
import ClientInfluencersPage from './client-page'

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  // Build query with filters
  let query = supabase.from('influencers').select('*', { count: 'exact' })
  
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,instagram_handle.ilike.%${params.search}%`)
  }
  
  // Pagination
  const page = parseInt(params.page || '1')
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  query = query.range(from, to).order('created_at', { ascending: false })
  
  const { data: influencers, count } = await query
  
  // Get ALL engagement stats (not filtered by page) for date filtering
  const { data: engagementStats } = await supabase
    .from('engagements')
    .select('influencer_id, agreed_total_cents, total_revenue_cents, opened_at')
  
  return (
    <ClientInfluencersPage
      influencers={influencers || []}
      engagementStats={engagementStats || []}
      totalCount={count || 0}
      currentPage={page}
      pageSize={pageSize}
    />
  )
}