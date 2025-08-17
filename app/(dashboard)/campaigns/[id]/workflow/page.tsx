import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import WorkflowPipeline from '@/components/campaigns/workflow-pipeline'

interface PageProps {
  params: { id: string }
}

async function getCampaignWorkflow(campaignId: string) {
  const supabase = await createClient()
  
  // Get campaign details
  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (id, name),
      influencers:influencer_id (id, name)
    `)
    .eq('id', campaignId)
    .single()

  if (!campaign) return null

  // Check if workflow exists for this campaign
  const { data: workflow } = await supabase
    .from('campaign_workflows')
    .select('*')
    .eq('campaign_id', campaignId)
    .single()

  // Get workflow participants if workflow exists
  let participants = []
  if (workflow) {
    const { data } = await supabase
      .from('workflow_participants')
      .select(`
        *,
        influencer:influencer_id (
          id,
          name,
          email,
          instagram_handle,
          instagram_followers,
          tiktok_followers,
          status
        )
      `)
      .eq('workflow_id', workflow.id)
      .order('created_at', { ascending: false })

    participants = data || []
  }

  // Get all influencers for selection
  const { data: allInfluencers } = await supabase
    .from('influencers')
    .select('id, name, email, instagram_handle, instagram_followers, status')
    .eq('status', 'active')
    .order('name')

  return {
    campaign,
    workflow,
    participants,
    allInfluencers: allInfluencers || []
  }
}

export default async function CampaignWorkflowPage({ params }: PageProps) {
  const data = await getCampaignWorkflow(params.id)

  if (!data || !data.campaign) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/campaigns/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Campaign Workflow</h1>
              <p className="text-gray-600">
                {data.campaign.campaign_name} • {data.campaign.brands?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <WorkflowPipeline
        campaignId={params.id}
        campaign={data.campaign}
        workflow={data.workflow}
        participants={data.participants}
        allInfluencers={data.allInfluencers}
      />
    </div>
  )
}