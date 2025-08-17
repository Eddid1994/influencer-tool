import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NegotiationForm from '@/components/influencers/negotiation-form'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { id: string }
}

async function getInfluencerData(id: string) {
  const supabase = await createClient()
  
  // Get influencer details
  const { data: influencer } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single()

  // Get brands for dropdown
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name')
    .order('name')

  // Get last negotiation for context
  const { data: lastNegotiation } = await supabase
    .from('negotiations')
    .select(`
      *,
      brands:brand_id (name)
    `)
    .eq('influencer_id', id)
    .order('negotiation_date', { ascending: false })
    .limit(1)
    .single()

  // Get last successful campaign for reference
  const { data: lastCampaign } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (name)
    `)
    .eq('influencer_id', id)
    .eq('status', 'completed')
    .order('end_date', { ascending: false })
    .limit(1)
    .single()

  return { influencer, brands, lastNegotiation, lastCampaign }
}

export default async function NegotiatePage({ params }: PageProps) {
  const { influencer, brands, lastNegotiation, lastCampaign } = await getInfluencerData(params.id)

  if (!influencer) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/influencers/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {influencer.name}
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">New Negotiation</h1>
        <p className="text-gray-600 mb-6">
          Track negotiation with {influencer.name}
        </p>

        {/* Context Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {lastNegotiation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Last Negotiation</h3>
              <div className="text-sm space-y-1">
                <p>Brand: {lastNegotiation.brands?.name}</p>
                <p>Date: {new Date(lastNegotiation.negotiation_date).toLocaleDateString()}</p>
                <p>They offered: ${lastNegotiation.proposed_budget?.toLocaleString()}</p>
                <p>We asked: ${lastNegotiation.influencer_rate?.toLocaleString()}</p>
                {lastNegotiation.final_agreed_rate && (
                  <p className="font-semibold">
                    Agreed: ${lastNegotiation.final_agreed_rate.toLocaleString()}
                  </p>
                )}
                {lastNegotiation.notes && (
                  <p className="mt-2 text-gray-700">{lastNegotiation.notes}</p>
                )}
              </div>
            </div>
          )}

          {lastCampaign && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Last Successful Campaign</h3>
              <div className="text-sm space-y-1">
                <p>Campaign: {lastCampaign.campaign_name}</p>
                <p>Brand: {lastCampaign.brands?.name}</p>
                <p>Paid: ${lastCampaign.actual_cost?.toLocaleString()}</p>
                {lastCampaign.actual_views && (
                  <p>Views: {lastCampaign.actual_views.toLocaleString()}</p>
                )}
                {lastCampaign.tkp && (
                  <p>TKP: ${lastCampaign.tkp.toFixed(2)}</p>
                )}
                {lastCampaign.actual_views && lastCampaign.target_views && (
                  <p className="font-semibold">
                    Performance: {((lastCampaign.actual_views / lastCampaign.target_views) * 100).toFixed(0)}% of target
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <NegotiationForm 
          influencerId={params.id}
          influencerName={influencer.name}
          brands={brands || []}
          lastNegotiation={lastNegotiation}
        />
      </div>
    </div>
  )
}