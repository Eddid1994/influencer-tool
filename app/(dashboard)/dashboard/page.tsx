import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Megaphone, 
  TrendingUp, 
  DollarSign,
  Activity,
  Building2,
  UserCheck,
  Target
} from 'lucide-react'
import RecentActivities from '@/components/dashboard/recent-activities'
import StatusChart from '@/components/dashboard/status-chart'
import TopInfluencers from '@/components/dashboard/top-influencers'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch dashboard metrics
  const [
    { count: totalInfluencers },
    { count: activeCampaigns },
    { count: totalBrands },
    { data: recentActivities }
  ] = await Promise.all([
    supabase.from('influencers').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  const metrics = [
    {
      title: 'Total Influencers',
      value: totalInfluencers || 0,
      icon: Users,
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns || 0,
      icon: Megaphone,
      change: '+23.1%',
      trend: 'up'
    },
    {
      title: 'Average TKP',
      value: '$45.20',
      icon: DollarSign,
      change: '-5.4%',
      trend: 'down'
    },
    {
      title: 'Total Brands',
      value: totalBrands || 0,
      icon: Building2,
      change: '+18.2%',
      trend: 'up'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Track your influencer marketing performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Influencer Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopInfluencers />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivities activities={recentActivities || []} />
        </CardContent>
      </Card>
    </div>
  )
}