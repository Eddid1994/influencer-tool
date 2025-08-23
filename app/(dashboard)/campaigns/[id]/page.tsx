import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, DollarSign, Eye, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { NegotiationTab } from '@/components/campaigns/negotiation-tab'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string) {
  const supabase = await createClient()
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (*),
      influencers:influencer_id (*),
      campaign_negotiations (*)
    `)
    .eq('id', id)
    .single()

  if (error || !campaign) {
    return null
  }

  // Get negotiation details if exists
  let negotiationData = null
  if (campaign.campaign_negotiations?.[0]) {
    const negotiationId = campaign.campaign_negotiations[0].id
    
    // Get offers
    const { data: offers } = await supabase
      .from('negotiation_offers')
      .select('*')
      .eq('negotiation_id', negotiationId)
      .order('created_at', { ascending: false })

    // Get communications
    const { data: communications } = await supabase
      .from('negotiation_communications')
      .select('*')
      .eq('negotiation_id', negotiationId)
      .order('created_at', { ascending: false })

    // Get tasks
    const { data: tasks } = await supabase
      .from('negotiation_tasks')
      .select('*')
      .eq('negotiation_id', negotiationId)
      .eq('status', 'open')
      .order('due_at', { ascending: true })

    negotiationData = {
      ...campaign.campaign_negotiations[0],
      offers: offers || [],
      communications: communications || [],
      tasks: tasks || []
    }
  }

  return {
    ...campaign,
    negotiation: negotiationData
  }
}

export default async function CampaignPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.campaign_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusColor(campaign.status)}>
                {campaign.status || 'planned'}
              </Badge>
              {campaign.channel && (
                <Badge variant="outline">{campaign.channel}</Badge>
              )}
            </div>
          </div>
        </div>
        <Link href={`/campaigns/${id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Campaign
          </Button>
        </Link>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.budget ? formatCurrency(campaign.budget) : '-'}
            </div>
            {campaign.actual_cost && (
              <p className="text-xs text-muted-foreground">
                Actual: {formatCurrency(campaign.actual_cost)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.actual_views?.toLocaleString() || '-'}
            </div>
            {campaign.target_views && (
              <p className="text-xs text-muted-foreground">
                Target: {campaign.target_views.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TKP/CPM</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.tkp ? formatCurrency(campaign.tkp) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per 1000 views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {campaign.start_date ? formatDate(campaign.start_date) : 'Not set'}
            </div>
            {campaign.end_date && (
              <p className="text-xs text-muted-foreground">
                to {formatDate(campaign.end_date)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Brand Information */}
            <Card>
              <CardHeader>
                <CardTitle>Brand</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Influencer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Influencer</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
        </div>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Negotiation Tab */}
        <TabsContent value="negotiation">
          <NegotiationTab 
            campaignId={campaign.id}
            negotiation={campaign.negotiation}
          />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Track the performance and ROI of this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}