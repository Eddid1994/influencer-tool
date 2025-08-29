'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import FinancialKPICards from '@/components/kpi/financial-kpi-cards'
import { 
  ArrowLeft, 
  Edit, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  BarChart3,
  Eye,
  Workflow,
  Building2,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react'
import { formatCurrency, formatDate, formatFollowerCount } from '@/lib/utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface BrandDetails {
  id: string
  name: string
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  notes: string | null
  instagram_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  created_at: string
  updated_at: string
}

interface EngagementData {
  id: string
  period_label: string
  status: string
  agreed_total_cents: number | null
  total_revenue_cents: number | null
  total_views: number | null
  influencer: {
    id: string
    name: string
    instagram_handle: string | null
  } | null
}

interface CampaignData {
  id: string
  campaign_name: string
  status: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  actual_cost: number | null
  target_views: number | null
  actual_views: number | null
  tkp: number | null
  influencer: {
    id: string
    name: string
    instagram_handle: string | null
  } | null
}

interface InfluencerCollaboration {
  influencer_id: string
  influencer_name: string
  instagram_handle: string | null
  campaigns_count: number
  total_spent: number
  total_views: number
  avg_tkp: number
  last_collaboration: string
}

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.id as string
  const [brand, setBrand] = useState<BrandDetails | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [engagements, setEngagements] = useState<EngagementData[]>([])
  const [influencerCollabs, setInfluencerCollabs] = useState<InfluencerCollaboration[]>([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalRevenue: 0,
    totalViews: 0,
    avgTKP: 0,
    totalInfluencers: 0,
    roas: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBrandData()
  }, [brandId])

  const fetchBrandData = async () => {
    try {
      // Fetch brand details
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single()

      if (brandError) throw brandError
      setBrand(brandData)

      // Fetch engagements for this brand
      const { data: engagementData, error: engagementError } = await supabase
        .from('engagements')
        .select(`
          id,
          period_label,
          status,
          agreed_total_cents,
          total_revenue_cents,
          total_views,
          influencer:influencers (id, name, instagram_handle)
        `)
        .eq('brand_id', brandId)
        .order('opened_at', { ascending: false })

      if (engagementError) console.error('Engagement error:', engagementError)
      setEngagements((engagementData as unknown as EngagementData[]) || [])

      // Set campaigns to empty array (table no longer exists)
      const campaignData: any[] = []
      setCampaigns([])

      // Calculate influencer collaborations
      const influencerMap = new Map<string, InfluencerCollaboration>()
      
      campaignData?.forEach((campaign: any) => {
        const influencerData = Array.isArray(campaign.influencer) ? campaign.influencer[0] : campaign.influencer
        if (influencerData) {
          const key = influencerData.id
          if (!influencerMap.has(key)) {
            influencerMap.set(key, {
              influencer_id: influencerData.id,
              influencer_name: influencerData.name,
              instagram_handle: influencerData.instagram_handle,
              campaigns_count: 0,
              total_spent: 0,
              total_views: 0,
              avg_tkp: 0,
              last_collaboration: campaign.start_date || ''
            })
          }
          
          const collab = influencerMap.get(key)!
          collab.campaigns_count++
          collab.total_spent += campaign.actual_cost || 0
          collab.total_views += campaign.actual_views || 0
          
          // Update last collaboration date
          if (campaign.start_date && campaign.start_date > collab.last_collaboration) {
            collab.last_collaboration = campaign.start_date
          }
        }
      })

      // Calculate average TKP for each influencer
      influencerMap.forEach(collab => {
        if (collab.total_views > 0) {
          collab.avg_tkp = (collab.total_spent / collab.total_views) * 1000
        }
      })

      setInfluencerCollabs(Array.from(influencerMap.values()))

      // Calculate statistics from engagements
      const totalEngagements = engagementData?.length || 0
      const activeEngagements = engagementData?.filter(e => e.status === 'active').length || 0
      const engagementSpent = engagementData?.reduce((sum, e) => sum + (e.agreed_total_cents || 0), 0) || 0
      const engagementRevenue = engagementData?.reduce((sum, e) => sum + (e.total_revenue_cents || 0), 0) || 0
      const engagementViews = engagementData?.reduce((sum, e) => sum + (e.total_views || 0), 0) || 0

      // Calculate statistics from campaigns (fallback)
      const totalCampaigns = campaignData?.length || 0
      const activeCampaigns = campaignData?.filter(c => c.status === 'active').length || 0
      const totalBudget = campaignData?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0
      const campaignSpent = campaignData?.reduce((sum, c) => sum + (c.actual_cost || 0), 0) || 0
      const campaignViews = campaignData?.reduce((sum, c) => sum + (c.actual_views || 0), 0) || 0
      
      // Combine stats (prioritize engagements)
      const totalSpent = engagementSpent || campaignSpent * 100 // Convert campaigns to cents
      const totalRevenue = engagementRevenue
      const totalViews = engagementViews || campaignViews
      const avgTKP = totalViews > 0 ? (totalSpent / 100 / totalViews) * 1000 : 0
      const totalInfluencers = influencerMap.size
      const roas = totalSpent > 0 ? totalRevenue / totalSpent : 0

      setStats({
        totalCampaigns: totalEngagements || totalCampaigns,
        activeCampaigns: activeEngagements || activeCampaigns,
        totalBudget,
        totalSpent,
        totalRevenue,
        totalViews,
        avgTKP,
        totalInfluencers,
        roas
      })

    } catch (error) {
      console.error('Error fetching brand data:', error)
      toast.error('Failed to load brand details')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading brand details...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Brand not found</p>
        <Button onClick={() => router.push('/brands')}>
          Back to Brands
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/brands')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {brand.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Partner since {formatDate(brand.created_at)}
            </p>
          </div>
        </div>
        <Link href={`/brands/${brandId}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Brand
          </Button>
        </Link>
      </div>

      {/* Financial KPIs */}
      <FinancialKPICards
        spent={stats.totalSpent}
        revenue={stats.totalRevenue}
        roas={stats.roas}
        currency="EUR"
        className="mb-6"
      />

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.activeCampaigns} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Budget: {formatCurrency(stats.totalBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFollowerCount(stats.totalViews)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg TKP: {formatCurrency(stats.avgTKP)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Est. ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.roi > 0 ? '+' : ''}{stats.roi.toFixed(1)}%
              {stats.roi > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalInfluencers} influencers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {brand.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{brand.contact_email}</span>
                </div>
              )}
              {brand.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{brand.contact_phone}</span>
                </div>
              )}
              {brand.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-blue-600 hover:underline">
                    {brand.website}
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {brand.instagram_url && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-gray-400" />
                  <a href={brand.instagram_url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-blue-600 hover:underline">
                    Instagram Profile
                  </a>
                </div>
              )}
              {brand.twitter_url && (
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-gray-400" />
                  <a href={brand.twitter_url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-blue-600 hover:underline">
                    Twitter Profile
                  </a>
                </div>
              )}
              {brand.youtube_url && (
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-gray-400" />
                  <a href={brand.youtube_url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-blue-600 hover:underline">
                    YouTube Channel
                  </a>
                </div>
              )}
            </div>
          </div>
          {brand.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">{brand.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Campaigns and Influencers */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">
            <Calendar className="h-4 w-4 mr-2" />
            Campaign History ({stats.totalCampaigns})
          </TabsTrigger>
          <TabsTrigger value="influencers">
            <Users className="h-4 w-4 mr-2" />
            Influencer Collaborations ({stats.totalInfluencers})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Campaigns</CardTitle>
                <Link href={`/campaigns/new?brand_id=${brandId}`}>
                  <Button size="sm">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>TKP</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No campaigns yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.campaign_name}
                          </TableCell>
                          <TableCell>
                            {campaign.influencer ? (
                              <div>
                                <div>{campaign.influencer.name}</div>
                                {campaign.influencer.instagram_handle && (
                                  <div className="text-xs text-gray-500">
                                    {campaign.influencer.instagram_handle}
                                  </div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(campaign.status)}>
                              {campaign.status || 'planned'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {campaign.start_date && campaign.end_date ? (
                              <div className="text-sm">
                                <div>{formatDate(campaign.start_date)}</div>
                                <div className="text-gray-500">to {formatDate(campaign.end_date)}</div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.budget ? (
                              <div>
                                <div>{formatCurrency(campaign.budget)}</div>
                                {campaign.actual_cost && (
                                  <div className="text-xs text-gray-500">
                                    Spent: {formatCurrency(campaign.actual_cost)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.actual_views ? formatFollowerCount(campaign.actual_views) : '-'}
                          </TableCell>
                          <TableCell>
                            {campaign.tkp ? formatCurrency(campaign.tkp) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/campaigns/${campaign.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/campaigns/${campaign.id}/workflow`}>
                                <Button variant="ghost" size="icon">
                                  <Workflow className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers">
          <Card>
            <CardHeader>
              <CardTitle>Influencer Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Total Views</TableHead>
                      <TableHead>Avg TKP</TableHead>
                      <TableHead>Last Collaboration</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencerCollabs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No influencer collaborations yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      influencerCollabs.map((collab) => (
                        <TableRow key={collab.influencer_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{collab.influencer_name}</div>
                              {collab.instagram_handle && (
                                <div className="text-xs text-gray-500">
                                  {collab.instagram_handle}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {collab.campaigns_count}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(collab.total_spent)}</TableCell>
                          <TableCell>{formatFollowerCount(collab.total_views)}</TableCell>
                          <TableCell>{formatCurrency(collab.avg_tkp)}</TableCell>
                          <TableCell>
                            {collab.last_collaboration ? formatDate(collab.last_collaboration) : '-'}
                          </TableCell>
                          <TableCell>
                            <Link href={`/influencers/${collab.influencer_id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}