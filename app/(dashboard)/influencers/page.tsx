import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import InfluencersTableWithSelection from '@/components/influencers/influencers-table-with-selection'
import InfluencerFilters from '@/components/influencers/influencer-filters'
import ImportExport from '@/components/influencers/import-export'

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
  
  // Get all influencers for export (without pagination)
  const { data: allInfluencers } = await supabase
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false })
  
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencers</h1>
          <p className="text-gray-500">Manage your influencer relationships</p>
        </div>
        <div className="flex gap-2">
          <ImportExport currentData={allInfluencers || []} />
          <Link href="/influencers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Influencer
            </Button>
          </Link>
        </div>
      </div>

      <InfluencerFilters />
      
      <InfluencersTableWithSelection 
        influencers={influencers || []} 
        totalCount={count || 0}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  )
}