'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import InfluencersTableWithSelection from '@/components/influencers/influencers-table-with-selection'
import InfluencerFilters from '@/components/influencers/influencer-filters'
import ImportExport from '@/components/influencers/import-export'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { format, isWithinInterval, parseISO } from 'date-fns'

interface Engagement {
  influencer_id: string
  agreed_total_cents: number | null
  total_revenue_cents: number | null
  opened_at: string | null
}

interface Influencer {
  id: string
  name: string
  email: string | null
  instagram_handle: string | null
  instagram_followers: number | null
  status: string
  [key: string]: any
}

interface ClientInfluencersPageProps {
  influencers: Influencer[]
  engagementStats: Engagement[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export default function ClientInfluencersPage({
  influencers,
  engagementStats,
  totalCount,
  currentPage,
  pageSize
}: ClientInfluencersPageProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Filter engagement stats based on date range
  const filteredEngagementStats = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return engagementStats
    }

    const interval = { start: dateRange.from, end: dateRange.to }

    return engagementStats.filter(engagement => {
      if (!engagement.opened_at) return false
      try {
        const date = parseISO(engagement.opened_at)
        return isWithinInterval(date, interval)
      } catch {
        return false
      }
    })
  }, [engagementStats, dateRange])

  // Calculate KPIs based on filtered engagement stats
  const influencersWithKPIs = useMemo(() => {
    const influencerKPIs = new Map()
    
    filteredEngagementStats?.forEach(engagement => {
      if (!influencerKPIs.has(engagement.influencer_id)) {
        influencerKPIs.set(engagement.influencer_id, {
          totalSpent: 0,
          totalRevenue: 0
        })
      }
      const kpi = influencerKPIs.get(engagement.influencer_id)
      kpi.totalSpent += engagement.agreed_total_cents || 0
      kpi.totalRevenue += engagement.total_revenue_cents || 0
    })

    return influencers?.map(influencer => {
      const kpi = influencerKPIs.get(influencer.id) || { totalSpent: 0, totalRevenue: 0 }
      return {
        ...influencer,
        totalSpent: kpi.totalSpent,
        totalRevenue: kpi.totalRevenue,
        roas: kpi.totalSpent > 0 ? kpi.totalRevenue / kpi.totalSpent : 0
      }
    })
  }, [influencers, filteredEngagementStats])

  // Format date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    : 'All time'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencers</h1>
          <p className="text-gray-500">
            {dateRange?.from && dateRange?.to 
              ? `Performance metrics for ${dateRangeText}`
              : 'Manage your influencer relationships'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 mr-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{dateRangeText}</span>
          </div>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <div className="border-l pl-2 ml-2 flex gap-2">
            <ImportExport currentData={influencers || []} />
            <Link href="/influencers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Influencer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Show filter indicator */}
      {dateRange?.from && dateRange?.to && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Showing performance metrics for <strong>{dateRangeText}</strong>
            {filteredEngagementStats.length === 0 && (
              <span className="ml-2 text-amber-600">• No engagement data found in this period</span>
            )}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {filteredEngagementStats.length} engagements found in selected period 
            (out of {engagementStats.length} total)
          </p>
        </div>
      )}

      <InfluencerFilters />
      
      <InfluencersTableWithSelection 
        influencers={influencersWithKPIs || []} 
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  )
}