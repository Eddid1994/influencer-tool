import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, Eye, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface PageProps {
  params: { id: string }
}

async function getInfluencerPerformance(id: string) {
  const supabase = await createClient()
  
  // Get influencer details
  const { data: influencer } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single()

  // Get all campaigns for this influencer
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (id, name, industry)
    `)
    .eq('influencer_id', id)
    .order('start_date', { ascending: false })

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

  // Calculate performance metrics
  const metrics = {
    totalCampaigns: campaigns?.length || 0,
    completedCampaigns: campaigns?.filter(c => c.status === 'completed').length || 0,
    activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
    totalEarnings: campaigns?.reduce((sum, c) => sum + (c.actual_cost || 0), 0) || 0,
    totalViews: campaigns?.reduce((sum, c) => sum + (c.actual_views || 0), 0) || 0,
    avgCampaignValue: campaigns?.length ? 
      (campaigns.reduce((sum, c) => sum + (c.actual_cost || 0), 0) / campaigns.length) : 0,
    avgTKP: campaigns?.length ? 
      (campaigns.reduce((sum, c) => sum + (c.tkp || 0), 0) / campaigns.filter(c => c.tkp).length) : 0,
    brandsWorkedWith: new Set(campaigns?.map(c => c.brand_id)).size,
    successRate: campaigns?.length ? 
      (campaigns.filter(c => c.actual_views && c.target_views && c.actual_views >= c.target_views).length / campaigns.length * 100) : 0
  }

  return { influencer, campaigns, negotiations, metrics }
}

export default async function InfluencerPerformancePage({ params }: PageProps) {
  const { influencer, campaigns, negotiations, metrics } = await getInfluencerPerformance(params.id)

  if (!influencer) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'outline'
      case 'active': return 'default'
      case 'planned': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'agreed': return 'default'
      case 'rejected': return 'destructive'
      case 'negotiating': return 'secondary'
      default: return 'secondary'
    }
  }

  // Group campaigns by brand
  const campaignsByBrand = campaigns?.reduce((acc: any, campaign: any) => {
    const brandName = campaign.brands?.name || 'Unknown'
    if (!acc[brandName]) {
      acc[brandName] = {
        brand: campaign.brands,
        campaigns: [],
        totalSpent: 0,
        totalViews: 0
      }
    }
    acc[brandName].campaigns.push(campaign)
    acc[brandName].totalSpent += campaign.actual_cost || 0
    acc[brandName].totalViews += campaign.actual_views || 0
    return acc
  }, {})

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/influencers/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Influencer
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{influencer.name} - Performance Overview</h1>
        <p className="text-gray-600 mt-2">
          Complete campaign history and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(metrics.avgCampaignValue)} per campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg TKP: {formatCurrency(metrics.avgTKP)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedCampaigns} completed, {metrics.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.brandsWorkedWith} brands total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Collaborations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Brand Collaborations</CardTitle>
          <CardDescription>All brands {influencer.name} has worked with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(campaignsByBrand || {}).map(([brandName, data]: [string, any]) => (
              <div key={brandName} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{brandName}</h3>
                    <p className="text-sm text-gray-500">
                      {data.campaigns.length} campaign{data.campaigns.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(data.totalSpent)}</p>
                    <p className="text-sm text-gray-500">{data.totalViews.toLocaleString()} views</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {data.campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                          {campaign.campaign_name}
                        </Link>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="text-gray-500">
                        {campaign.start_date && formatDate(campaign.start_date)}
                        {campaign.actual_cost && ` • ${formatCurrency(campaign.actual_cost)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Negotiation History */}
      <Card>
        <CardHeader>
          <CardTitle>Negotiation History</CardTitle>
          <CardDescription>Track all negotiations and rate discussions</CardDescription>
        </CardHeader>
        <CardContent>
          {negotiations && negotiations.length > 0 ? (
            <div className="space-y-4">
              {negotiations.map((negotiation: any) => (
                <div key={negotiation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{negotiation.brand?.name || 'No brand assigned'}</h4>
                        <Badge variant={getStatusColor(negotiation.status)}>
                          {negotiation.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Pool: {negotiation.pool?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(negotiation.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {negotiation.final_offer ? (
                        <>
                          <p className="text-sm text-gray-500">Final Agreement</p>
                          <p className="font-semibold text-green-600">{formatCurrency(negotiation.final_offer)}</p>
                        </>
                      ) : negotiation.current_offer ? (
                        <>
                          <p className="text-sm text-gray-500">Current Offer</p>
                          <p className="font-semibold">{formatCurrency(negotiation.current_offer)}</p>
                        </>
                      ) : negotiation.initial_offer ? (
                        <>
                          <p className="text-sm text-gray-500">Initial Offer</p>
                          <p className="font-semibold">{formatCurrency(negotiation.initial_offer)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">No offer yet</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {(negotiation.initial_offer || negotiation.current_offer || negotiation.final_offer) && (
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Initial:</span>
                        <p className="font-medium">
                          {negotiation.initial_offer ? formatCurrency(negotiation.initial_offer) : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <p className="font-medium">
                          {negotiation.current_offer ? formatCurrency(negotiation.current_offer) : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Final:</span>
                        <p className="font-medium">
                          {negotiation.final_offer ? formatCurrency(negotiation.final_offer) : '-'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {negotiation.notes && (
                    <p className="text-sm text-gray-600 mt-3">{negotiation.notes}</p>
                  )}
                  
                  {negotiation.last_contact_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last contact: {formatDate(negotiation.last_contact_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No negotiation history recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}