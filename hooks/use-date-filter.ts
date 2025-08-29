import { useMemo } from 'react'
import { DateRange } from 'react-day-picker'
import { isWithinInterval, parseISO } from 'date-fns'

/**
 * Custom hook for filtering data by date range
 * Reduces code duplication across performance components
 */
export function useDateFilter<T extends Record<string, any>>(
  data: T[],
  dateRange: DateRange | undefined,
  dateField: keyof T
): T[] {
  return useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !data) {
      return data || []
    }

    const interval = { start: dateRange.from, end: dateRange.to }

    return data.filter(item => {
      const dateValue = item[dateField]
      if (!dateValue) return false
      
      try {
        const date = typeof dateValue === 'string' 
          ? parseISO(dateValue)
          : dateValue
        return isWithinInterval(date, interval)
      } catch {
        return false
      }
    })
  }, [data, dateRange, dateField])
}

/**
 * Calculate performance metrics from filtered data
 */
export function calculatePerformanceMetrics(
  engagements: any[],
  campaigns: any[]
) {
  const totalSpent = engagements.reduce((sum, e) => sum + (e.agreed_total_cents || 0), 0)
  const totalRevenue = engagements.reduce((sum, e) => sum + (e.total_revenue_cents || 0), 0)
  const totalViews = engagements.reduce((sum, e) => sum + (e.total_views || 0), 0)
  const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0

  return {
    totalEngagements: engagements.length,
    completedEngagements: engagements.filter(e => e.status === 'completed').length,
    activeEngagements: engagements.filter(e => e.status === 'active').length,
    totalSpent,
    totalRevenue,
    totalViews,
    avgEngagementValue: engagements.length ? (totalSpent / engagements.length) : 0,
    avgCPM: totalViews > 0 ? (totalSpent / totalViews * 1000) : 0,
    brandsWorkedWith: new Set(engagements.map(e => e.brand_id)).size,
    avgRoas,
    // Legacy campaign metrics
    totalCampaigns: campaigns.length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalEarnings: campaigns.reduce((sum, c) => sum + (c.actual_cost || 0), 0)
  }
}