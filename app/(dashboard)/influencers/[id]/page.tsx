import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, TrendingUp, DollarSign, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface PageProps {
  params: { id: string }
}

async function getInfluencer(id: string) {
  const supabase = await createClient()
  
  const { data: influencer, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !influencer) {
    return null
  }

  // Get recent campaigns
  const { data: recentCampaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      brands:brand_id (name)
    `)
    .eq('influencer_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('*')
    .eq('influencer_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate quick stats
  const { data: campaignStats } = await supabase
    .from('campaigns')
    .select('actual_cost, status')
    .eq('influencer_id', id)

  const totalEarnings = campaignStats?.reduce((sum, c) => sum + (c.actual_cost || 0), 0) || 0
  const activeCampaigns = campaignStats?.filter(c => c.status === 'active').length || 0
  const completedCampaigns = campaignStats?.filter(c => c.status === 'completed').length || 0

  return { 
    influencer, 
    recentCampaigns, 
    recentActivities,
    stats: {
      totalEarnings,
      activeCampaigns,
      completedCampaigns,
      totalCampaigns: campaignStats?.length || 0
    }
  }
}

export default async function InfluencerPage({ params }: PageProps) {
  const data = await getInfluencer(params.id)

  if (!data) {
    notFound()
  }

  const { influencer, recentCampaigns, recentActivities, stats } = data

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'default'
      case 'new': return 'secondary'
      case 'contacted': return 'outline'
      case 'negotiating': return 'secondary'
      case 'inactive': return 'destructive'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/influencers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Influencers
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/influencers/${params.id}/performance`}>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Performance
            </Button>
          </Link>
          <Link href={`/influencers/${params.id}/negotiate`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Negotiation
            </Button>
          </Link>
          <Link href={`/influencers/${params.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Influencer Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{influencer.name}</h1>
          <Badge variant={getStatusColor(influencer.status)}>
            {influencer.status || 'new'}
          </Badge>
        </div>
        {influencer.notes && (
          <p className="text-gray-600 mt-2">{influencer.notes}</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active, {stats.completedCampaigns} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {influencer.instagram_followers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {influencer.instagram_handle || 'No handle'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TikTok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {influencer.tiktok_followers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {influencer.tiktok_handle || 'No handle'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2">{influencer.email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2">{influencer.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Niche:</span>
              <span className="ml-2">
                {influencer.niche?.join(', ') || 'Not specified'}
              </span>
            </div>
            {influencer.youtube_handle && (
              <div>
                <span className="text-gray-500">YouTube:</span>
                <span className="ml-2">
                  {influencer.youtube_handle} 
                  {influencer.youtube_subscribers && 
                    ` (${influencer.youtube_subscribers.toLocaleString()} subs)`
                  }
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest campaign collaborations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCampaigns && recentCampaigns.length > 0 ? (
              <div className="space-y-2">
                {recentCampaigns.map((campaign: any) => (
                  <div key={campaign.id} className="flex justify-between items-center">
                    <div>
                      <Link 
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium hover:underline"
                      >
                        {campaign.campaign_name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {campaign.brands?.name}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No campaigns yet</p>
            )}
            {stats.totalCampaigns > 5 && (
              <Link href={`/influencers/${params.id}/performance`}>
                <Button variant="link" className="mt-4 p-0">
                  View all campaigns →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{activity.activity_type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activities recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}