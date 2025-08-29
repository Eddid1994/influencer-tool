import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientPerformancePage from './client-page'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getInfluencerPerformance(id: string) {
  const supabase = await createClient()
  
  // Get influencer details
  const { data: influencer } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single()

  // Get all engagements for this influencer  
  const { data: engagements } = await supabase
    .from('engagements')
    .select(`
      *,
      brand:brands (id, name, industry)
    `)
    .eq('influencer_id', id)
    .order('opened_at', { ascending: false })

  // Set campaigns to empty array (table no longer exists)
  const campaigns: any[] = []

  // Get negotiation history from negotiation_entries
  const { data: negotiations } = await supabase
    .from('negotiation_entries')
    .select(`
      *,
      brand:brand_id (id, name, industry),
      pool:pool_id (id, name)
    `)
    .eq('influencer_id', id)
    .order('created_at', { ascending: false })

  return { influencer, campaigns, engagements, negotiations }
}

export default async function InfluencerPerformancePage({ params }: PageProps) {
  const { id } = await params
  const { influencer, campaigns, engagements, negotiations } = await getInfluencerPerformance(id)

  if (!influencer) {
    notFound()
  }

  return (
    <ClientPerformancePage 
      influencer={influencer}
      campaigns={campaigns || []}
      engagements={engagements || []}
      negotiations={negotiations || []}
    />
  )
}