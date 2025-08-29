'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, Eye, Target, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { Database } from '@/types/database'
import FinancialKPICards from '@/components/kpi/financial-kpi-cards'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useDateFilter, calculatePerformanceMetrics } from '@/hooks/use-date-filter'

type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  brands?: { id: string; name: string; industry: string | null }
}

type Engagement = Database['public']['Tables']['engagements']['Row'] & {
  brand?: { id: string; name: string; industry: string | null }
}

type Negotiation = Database['public']['Tables']['negotiation_entries']['Row'] & {
  brand?: { id: string; name: string; industry: string | null }
  pool?: { id: string; name: string | null }
}

type CampaignsByBrand = Record<string, {
  brand?: { id: string; name: string; industry: string | null }
  campaigns: Campaign[]
  totalSpent: number
  totalViews: number
}>

interface ClientPerformancePageProps {
  influencer: Database['public']['Tables']['influencers']['Row']
  campaigns: Campaign[]
  engagements: Engagement[]
  negotiations: Negotiation[]
}

export default function ClientPerformancePage({
  influencer,
  campaigns,
  engagements,
  negotiations,
}: ClientPerformancePageProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Use custom hooks for filtering
  const filteredEngagements = useDateFilter(engagements, dateRange, 'opened_at')
  const filteredCampaigns = useDateFilter(campaigns, dateRange, 'start_date')
  const filteredNegotiations = useDateFilter(negotiations, dateRange, 'created_at')

  const filteredData = {
    engagements: filteredEngagements,
    campaigns: filteredCampaigns,
    negotiations: filteredNegotiations
  }

  // Calculate metrics using the shared function
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(filteredEngagements, filteredCampaigns)
  }, [filteredEngagements, filteredCampaigns])

  const getStatusColor = (status: string | null) => {
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
  const campaignsByBrand = filteredData.campaigns?.reduce((acc: CampaignsByBrand, campaign: Campaign) => {
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

  // Format date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    : 'All time'

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/influencers/${influencer.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Influencer
          </Button>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{dateRangeText}</span>
          </div>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{influencer.name} - Performance Overview</h1>
        <p className="text-gray-600 mt-2">
          {dateRange?.from && dateRange?.to 
            ? `Performance metrics for selected period`
            : 'Complete campaign history and performance metrics'}
        </p>
      </div>

      {/* Financial KPIs */}
      <FinancialKPICards
        spent={metrics.totalSpent}
        revenue={metrics.totalRevenue}
        roas={metrics.avgRoas}
        currency="EUR"
        className="mb-8"
      />

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg CPM: {formatCurrency(metrics.avgCPM / 100)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEngagements}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedEngagements} completed, {metrics.activeEngagements} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.brandsWorkedWith}</div>
            <p className="text-xs text-muted-foreground">
              Total partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avgEngagementValue / 100)}</div>
            <p className="text-xs text-muted-foreground">
              Per engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data count indicator */}
      {(dateRange?.from || dateRange?.to) && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.engagements.length} engagements, {filteredData.campaigns.length} campaigns, 
            and {filteredData.negotiations.length} negotiations for the selected period
            {filteredData.engagements.length === 0 && filteredData.campaigns.length === 0 && (
              <span className="ml-2 text-amber-600">• No data found for this period</span>
            )}
          </p>
        </div>
      )}

      {/* Brand Collaborations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Brand Collaborations</CardTitle>
          <CardDescription>
            {dateRange?.from && dateRange?.to 
              ? `Brands ${influencer.name} has worked with in selected period`
              : `All brands ${influencer.name} has worked with`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(campaignsByBrand || {}).length > 0 ? (
            <div className="space-y-4">
              {(Object.entries(campaignsByBrand || {}) as [string, CampaignsByBrand[string]][]).map(([brandName, data]) => (
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
                    {data.campaigns.map((campaign) => (
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
          ) : (
            <p className="text-gray-500">No brand collaborations found for the selected period</p>
          )}
        </CardContent>
      </Card>

      {/* Negotiation History */}
      <Card>
        <CardHeader>
          <CardTitle>Negotiation History</CardTitle>
          <CardDescription>
            {dateRange?.from && dateRange?.to 
              ? `Negotiations in selected period`
              : `Track all negotiations and rate discussions`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.negotiations && filteredData.negotiations.length > 0 ? (
            <div className="space-y-4">
              {filteredData.negotiations.map((negotiation) => (
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
            <p className="text-gray-500">No negotiation history recorded for the selected period</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}