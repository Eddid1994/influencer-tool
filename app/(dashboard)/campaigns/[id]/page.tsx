import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface PageProps {
  params: { id: string }
}

async function getCampaign(id: string) {
  const supabase = await createClient()
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (
        id,
        name,
        website,
        industry,
        contact_email,
        contact_phone
      ),
      influencers:influencer_id (
        id,
        name,
        email,
        phone,
        instagram_handle,
        instagram_followers,
        tiktok_handle,
        tiktok_followers,
        status,
        niche
      )
    `)
    .eq('id', id)
    .single()

  if (error || !campaign) {
    return null
  }

  return campaign
}

export default async function CampaignPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    notFound()
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'planned':
        return 'secondary'
      case 'active':
        return 'default'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Calculate campaign metrics
  const budgetUtilization = campaign.budget && campaign.actual_cost
    ? (campaign.actual_cost / campaign.budget * 100).toFixed(1)
    : null

  const viewsAchievement = campaign.target_views && campaign.actual_views
    ? (campaign.actual_views / campaign.target_views * 100).toFixed(1)
    : null

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
        <Link href={`/campaigns/${params.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Campaign
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Campaign Header */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{campaign.campaign_name}</h1>
            <Badge variant={getStatusColor(campaign.status)}>
              {campaign.status || 'planned'}
            </Badge>
          </div>
          {campaign.notes && (
            <p className="text-gray-600 mt-2">{campaign.notes}</p>
          )}
        </div>

        {/* Main Info Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Brand Information */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Brand</h2>
            {campaign.brands ? (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{campaign.brands.name}</span>
                </div>
                {campaign.brands.industry && (
                  <div>
                    <span className="text-gray-500">Industry:</span>
                    <span className="ml-2">{campaign.brands.industry}</span>
                  </div>
                )}
                {campaign.brands.website && (
                  <div>
                    <span className="text-gray-500">Website:</span>
                    <a 
                      href={campaign.brands.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {campaign.brands.website}
                    </a>
                  </div>
                )}
                {campaign.brands.contact_email && (
                  <div>
                    <span className="text-gray-500">Contact:</span>
                    <span className="ml-2">{campaign.brands.contact_email}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No brand selected</p>
            )}
          </div>

          {/* Influencer Information */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Influencer</h2>
            {campaign.influencers ? (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{campaign.influencers.name}</span>
                </div>
                {campaign.influencers.instagram_handle && (
                  <div>
                    <span className="text-gray-500">Instagram:</span>
                    <span className="ml-2">{campaign.influencers.instagram_handle}</span>
                    {campaign.influencers.instagram_followers && (
                      <span className="ml-2 text-gray-500">
                        ({campaign.influencers.instagram_followers.toLocaleString()} followers)
                      </span>
                    )}
                  </div>
                )}
                {campaign.influencers.tiktok_handle && (
                  <div>
                    <span className="text-gray-500">TikTok:</span>
                    <span className="ml-2">{campaign.influencers.tiktok_handle}</span>
                    {campaign.influencers.tiktok_followers && (
                      <span className="ml-2 text-gray-500">
                        ({campaign.influencers.tiktok_followers.toLocaleString()} followers)
                      </span>
                    )}
                  </div>
                )}
                {campaign.influencers.niche && campaign.influencers.niche.length > 0 && (
                  <div>
                    <span className="text-gray-500">Niche:</span>
                    <span className="ml-2">{campaign.influencers.niche.join(', ')}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No influencer selected</p>
            )}
          </div>
        </div>

        {/* Campaign Details */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Dates */}
            <div>
              <span className="text-gray-500">Duration:</span>
              {campaign.start_date && campaign.end_date ? (
                <span className="ml-2">
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </span>
              ) : (
                <span className="ml-2">Not set</span>
              )}
            </div>

            {/* Budget */}
            <div>
              <span className="text-gray-500">Budget:</span>
              {campaign.budget ? (
                <span className="ml-2">{formatCurrency(campaign.budget)}</span>
              ) : (
                <span className="ml-2">Not set</span>
              )}
            </div>

            {/* Actual Cost */}
            <div>
              <span className="text-gray-500">Actual Cost:</span>
              {campaign.actual_cost ? (
                <span className="ml-2">
                  {formatCurrency(campaign.actual_cost)}
                  {budgetUtilization && (
                    <span className="ml-2 text-gray-500">({budgetUtilization}% of budget)</span>
                  )}
                </span>
              ) : (
                <span className="ml-2">Not set</span>
              )}
            </div>

            {/* TKP */}
            <div>
              <span className="text-gray-500">TKP (Cost per 1000 views):</span>
              {campaign.tkp ? (
                <span className="ml-2">{formatCurrency(campaign.tkp)}</span>
              ) : (
                <span className="ml-2">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Performance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Target Views */}
            <div>
              <span className="text-gray-500">Target Views:</span>
              {campaign.target_views ? (
                <span className="ml-2">{campaign.target_views.toLocaleString()}</span>
              ) : (
                <span className="ml-2">Not set</span>
              )}
            </div>

            {/* Actual Views */}
            <div>
              <span className="text-gray-500">Actual Views:</span>
              {campaign.actual_views ? (
                <span className="ml-2">
                  {campaign.actual_views.toLocaleString()}
                  {viewsAchievement && (
                    <span className="ml-2 text-gray-500">({viewsAchievement}% of target)</span>
                  )}
                </span>
              ) : (
                <span className="ml-2">Not tracked yet</span>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          {campaign.status === 'completed' && campaign.actual_views && campaign.target_views && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm">
                Campaign {campaign.actual_views >= campaign.target_views ? 
                  <span className="text-green-600 font-medium">exceeded targets</span> : 
                  <span className="text-orange-600 font-medium">underperformed</span>
                } by {Math.abs(campaign.actual_views - campaign.target_views).toLocaleString()} views
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}