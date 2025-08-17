import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import CampaignsTable from '@/components/campaigns/campaigns-table'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands (name),
      influencers (name, instagram_handle)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500">Track and manage influencer campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>
      
      <CampaignsTable campaigns={campaigns || []} />
    </div>
  )
}