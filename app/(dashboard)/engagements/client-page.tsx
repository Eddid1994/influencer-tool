'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Handshake, Calendar, Send, X, Filter, CheckSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import EngagementsTable from '@/components/engagements/engagements-table'
import EngagementStats from '@/components/engagements/engagement-stats'
import UnifiedTemplateSender from '@/components/templates/unified-template-sender'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { format, isWithinInterval, parseISO } from 'date-fns'

interface Engagement {
  id: string
  opened_at: string | null
  closed_at: string | null
  status: string | null
  agreed_total_cents: number | null
  agreed_currency: string | null
  total_revenue_cents: number | null
  actual_views: number | null
  brand_id: string | null
  influencer_id: string | null
  negotiation_status?: string | null
  negotiation_priority?: string | null
  period_label: string | null
  period_year: number | null
  period_month: number | null
  campaign_name: string | null
  brands?: { name: string; website: string | null } | null
  influencers?: { name: string; email: string | null; instagram_handle: string | null } | null
  brand_contacts?: { name: string; email: string | null } | null
  deliverables?: any[]
  engagement_tasks?: any[]
  invoices?: any[]
  [key: string]: any
}

interface ClientEngagementsPageProps {
  engagements: Engagement[]
}

export default function ClientEngagementsPage({ engagements }: ClientEngagementsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedEngagements, setSelectedEngagements] = useState<string[]>([])
  const [showBulkOutreach, setShowBulkOutreach] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter engagements based on date range and status
  const filteredEngagements = useMemo(() => {
    let filtered = engagements

    // Apply date filter
    if (dateRange?.from && dateRange?.to) {
      const interval = { start: dateRange.from, end: dateRange.to }
      filtered = filtered.filter(engagement => {
        if (!engagement.opened_at) return false
        try {
          const date = parseISO(engagement.opened_at)
          return isWithinInterval(date, interval)
        } catch {
          return false
        }
      })
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'not_emailed') {
        filtered = filtered.filter(e => !e.negotiation_status || e.negotiation_status === 'pending_outreach')
      } else if (statusFilter === 'awaiting_reply') {
        filtered = filtered.filter(e => e.negotiation_status === 'outreach_sent' || e.negotiation_status === 'awaiting_response')
      } else if (statusFilter === 'in_progress') {
        filtered = filtered.filter(e => e.negotiation_status === 'negotiating')
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(e => e.negotiation_status === 'agreed')
      } else if (statusFilter === 'need_followup') {
        filtered = filtered.filter(e => e.negotiation_status === 'on_hold' || e.negotiation_status === 'declined')
      } else {
        filtered = filtered.filter(e => e.negotiation_status === statusFilter)
      }
    }

    return filtered
  }, [engagements, dateRange, statusFilter])

  // Format date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    : 'All time'

  // Get selected engagement objects for bulk outreach
  const selectedEngagementObjects = filteredEngagements.filter(e => 
    selectedEngagements.includes(e.id)
  )

  // Count engagements by status
  const statusCounts = useMemo(() => {
    return {
      all: engagements.length,
      not_emailed: engagements.filter(e => !e.negotiation_status || e.negotiation_status === 'pending_outreach').length,
      awaiting_reply: engagements.filter(e => e.negotiation_status === 'outreach_sent' || e.negotiation_status === 'awaiting_response').length,
      in_progress: engagements.filter(e => e.negotiation_status === 'negotiating').length,
      completed: engagements.filter(e => e.negotiation_status === 'agreed').length,
      need_followup: engagements.filter(e => e.negotiation_status === 'on_hold' || e.negotiation_status === 'declined').length,
    }
  }, [engagements])

  // Select all filtered engagements
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredEngagements.map(e => e.id)
    setSelectedEngagements(allFilteredIds)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagements</h1>
          <p className="text-gray-500">
            {dateRange?.from && dateRange?.to 
              ? `Showing engagements from ${dateRangeText}`
              : 'Manage influencer collaborations and track deliverables'}
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
            <Link href="/engagements/import">
              <Button variant="outline">
                <Handshake className="h-4 w-4 mr-2" />
                Import
              </Button>
            </Link>
            <Link href="/engagements/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Engagement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex gap-2 items-center flex-wrap p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
          className="gap-2"
        >
          All
          <Badge variant="secondary" className="ml-1">
            {statusCounts.all}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === 'not_emailed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('not_emailed')}
          className="gap-2"
        >
          Not Emailed
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
            {statusCounts.not_emailed}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === 'awaiting_reply' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('awaiting_reply')}
          className="gap-2"
        >
          Awaiting Reply
          <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
            {statusCounts.awaiting_reply}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('in_progress')}
          className="gap-2"
        >
          In Progress
          <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-800">
            {statusCounts.in_progress}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('completed')}
          className="gap-2"
        >
          Completed
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
            {statusCounts.completed}
          </Badge>
        </Button>
        <Button
          variant={statusFilter === 'need_followup' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('need_followup')}
          className="gap-2"
        >
          Need Follow-up
          <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-800">
            {statusCounts.need_followup}
          </Badge>
        </Button>
        
        {statusFilter !== 'all' && filteredEngagements.length > 0 && (
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllFiltered}
              disabled={selectedEngagements.length === filteredEngagements.length}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All {filteredEngagements.length} Filtered
            </Button>
          </div>
        )}
      </div>

      {/* Show filter indicator */}
      {(dateRange?.from && dateRange?.to) || statusFilter !== 'all' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Showing {filteredEngagements.length} of {engagements.length} engagements
            {dateRange?.from && dateRange?.to && (
              <span> for period: <strong>{dateRangeText}</strong></span>
            )}
            {statusFilter !== 'all' && (
              <span> with status filter applied</span>
            )}
            {filteredEngagements.length === 0 && (
              <span className="ml-2 text-amber-600">• No engagements found with current filters</span>
            )}
          </p>
        </div>
      ) : null}
      
      {/* Bulk Actions Toolbar */}
      {selectedEngagements.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedEngagements.length} engagement{selectedEngagements.length !== 1 ? 's' : ''} selected
              </span>
              {/* Show context-appropriate bulk actions */}
              {filteredEngagements.some(e => 
                selectedEngagements.includes(e.id) && 
                (e.negotiation_status === 'pending_outreach' || !e.negotiation_status)
              ) && (
                <Button 
                  onClick={() => setShowBulkOutreach(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Initial Outreach
                </Button>
              )}
              {filteredEngagements.some(e => 
                selectedEngagements.includes(e.id) && 
                (e.negotiation_status === 'outreach_sent' || e.negotiation_status === 'awaiting_response')
              ) && (
                <Button 
                  onClick={() => setShowBulkOutreach(true)}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Follow-up
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEngagements([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      
      <EngagementStats engagements={filteredEngagements} />
      <EngagementsTable 
        engagements={filteredEngagements} 
        selectedEngagements={selectedEngagements}
        onSelectionChange={setSelectedEngagements}
        showSelection={true}
      />
      
      {/* Unified Template Sender for Bulk Outreach */}
      <UnifiedTemplateSender
        open={showBulkOutreach}
        onClose={() => setShowBulkOutreach(false)}
        engagements={selectedEngagementObjects}
        mode="bulk"
        onSuccess={() => {
          setSelectedEngagements([])
          // Optionally refresh engagements here
          window.location.reload()
        }}
      />
    </div>
  )
}