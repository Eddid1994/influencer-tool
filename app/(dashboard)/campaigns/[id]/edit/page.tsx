import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CampaignEditForm from '@/components/campaigns/campaign-edit-form'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { id: string }
}

async function getCampaign(id: string) {
  const supabase = await createClient()
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (id, name),
      influencers:influencer_id (id, name, instagram_handle)
    `)
    .eq('id', id)
    .single()

  if (error || !campaign) {
    return null
  }

  return campaign
}

async function getBrands() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('id, name')
    .order('name')
  
  return data || []
}

async function getInfluencers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('influencers')
    .select('id, name, instagram_handle')
    .order('name')
  
  return data || []
}

export default async function EditCampaignPage({ params }: PageProps) {
  const [campaign, brands, influencers] = await Promise.all([
    getCampaign(params.id),
    getBrands(),
    getInfluencers()
  ])

  if (!campaign) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>
        
        <Suspense fallback={<div>Loading...</div>}>
          <CampaignEditForm 
            campaign={campaign}
            brands={brands}
            influencers={influencers}
          />
        </Suspense>
      </div>
    </div>
  )
}