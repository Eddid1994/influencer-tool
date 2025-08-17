'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, Eye, Target, TrendingUp, Calendar, BarChart } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface PerformancePanelProps {
  influencerId: string
  influencerName: string
}

export function PerformancePanel({ influencerId, influencerName }: PerformancePanelProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    campaigns: [],
    negotiations: [],
    metrics: {
      totalCampaigns: 0,
      completedCampaigns: 0,
      activeCampaigns: 0,
      totalEarnings: 0,
      totalViews: 0,
      avgCampaignValue: 0,
      avgTKP: 0,
      brandsWorkedWith: 0,
      successRate: 0
    }
  })

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Get all campaigns for this influencer
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          *,
          brands:brand_id (id, name, industry)
        `)
        .eq('influencer_id', influencerId)
        .order('start_date', { ascending: false })

      // Get negotiation history
      const { data: negotiations } = await supabase
        .from('negotiations')
        .select(`
          *,
          brands:brand_id (id, name)
        `)
        .eq('influencer_id', influencerId)
        .order('negotiation_date', { ascending: false })
        .limit(5)

      // Calculate metrics
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

      setData({ campaigns, negotiations, metrics })
      setLoading(false)
    }

    if (influencerId) {
      fetchData()
    }
  }, [influencerId])

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
  const campaignsByBrand = data.campaigns?.reduce((acc: any, campaign: any) => {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(data.metrics.avgCampaignValue)}/campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg TKP: {formatCurrency(data.metrics.avgTKP)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.completedCampaigns} done, {data.metrics.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.successRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.brandsWorkedWith} brands
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="brands">By Brand</TabsTrigger>
          <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-2">
            {data.campaigns?.slice(0, 10).map((campaign: any) => (
              <div key={campaign.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      href={`/campaigns/${campaign.id}`}
                      className="font-medium hover:underline text-sm"
                    >
                      {campaign.campaign_name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {campaign.brands?.name} • {campaign.start_date && formatDate(campaign.start_date)}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(campaign.status)} className="text-xs">
                    {campaign.status}
                  </Badge>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-gray-600">
                  {campaign.actual_cost && (
                    <span>💰 {formatCurrency(campaign.actual_cost)}</span>
                  )}
                  {campaign.actual_views && (
                    <span>👁 {campaign.actual_views.toLocaleString()}</span>
                  )}
                  {campaign.tkp && (
                    <span>📊 TKP: {formatCurrency(campaign.tkp)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Brands Tab */}
        <TabsContent value="brands" className="space-y-4">
          <div className="space-y-3">
            {Object.entries(campaignsByBrand || {}).map(([brandName, data]: [string, any]) => (
              <div key={brandName} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{brandName}</h4>
                    <p className="text-xs text-gray-500">
                      {data.campaigns.length} campaign{data.campaigns.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(data.totalSpent)}</p>
                    <p className="text-xs text-gray-500">{data.totalViews.toLocaleString()} views</p>
                  </div>
                </div>
                
                <div className="space-y-1 mt-2">
                  {data.campaigns.slice(0, 3).map((campaign: any) => (
                    <div key={campaign.id} className="text-xs text-gray-600">
                      • {campaign.campaign_name}
                      {campaign.actual_cost && ` - ${formatCurrency(campaign.actual_cost)}`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Negotiations Tab */}
        <TabsContent value="negotiations" className="space-y-4">
          {data.negotiations && data.negotiations.length > 0 ? (
            <div className="space-y-3">
              {data.negotiations.map((negotiation: any) => (
                <div key={negotiation.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{negotiation.brands?.name || 'Unknown'}</h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(negotiation.negotiation_date)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(negotiation.status)} className="text-xs">
                      {negotiation.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Offered:</span>
                      <p className="font-medium">{formatCurrency(negotiation.proposed_budget)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Asked:</span>
                      <p className="font-medium">{formatCurrency(negotiation.influencer_rate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Agreed:</span>
                      <p className="font-medium">
                        {negotiation.final_agreed_rate ? 
                          formatCurrency(negotiation.final_agreed_rate) : 
                          '-'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {negotiation.notes && (
                    <p className="text-xs text-gray-600 mt-2">{negotiation.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No negotiation history yet</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}