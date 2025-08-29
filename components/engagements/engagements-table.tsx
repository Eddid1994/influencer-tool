'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Package, FileText, DollarSign, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { Checkbox } from '@/components/ui/checkbox'

interface Engagement {
  id: string
  period_label: string | null
  period_year: number | null
  period_month: number | null
  status: string | null
  negotiation_status?: string | null
  agreed_total_cents: number | null
  agreed_currency: string | null
  campaign_name: string | null
  budget: number | null
  target_views: number | null
  opened_at: string | null
  closed_at: string | null
  brands: { name: string; website: string | null } | null
  influencers: { name: string; email: string | null; instagram_handle: string | null } | null
  brand_contacts: { name: string; email: string | null } | null
  deliverables: { id: string; platform: string; deliverable: string; content_approved: boolean }[]
  engagement_tasks: { id: string; completed_at: string | null }[]
  invoices: { id: string; status: string; amount_cents: number }[]
}

interface EngagementsTableProps {
  engagements: Engagement[]
  selectedEngagements?: string[]
  onSelectionChange?: (selected: string[]) => void
  showSelection?: boolean
}

const statusColors = {
  negotiating: 'bg-yellow-100 text-yellow-800',
  agreed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  paused: 'bg-orange-100 text-orange-800',
}

const negotiationStatusColors = {
  pending_outreach: 'bg-blue-100 text-blue-800',
  outreach_sent: 'bg-yellow-100 text-yellow-800',
  awaiting_response: 'bg-amber-100 text-amber-800',
  negotiating: 'bg-purple-100 text-purple-800',
  agreed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  on_hold: 'bg-orange-100 text-orange-800',
}

export default function EngagementsTable({ 
  engagements, 
  selectedEngagements = [],
  onSelectionChange,
  showSelection = false
}: EngagementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [localSelection, setLocalSelection] = useState<string[]>(selectedEngagements)
  const itemsPerPage = 10
  
  // Calculate pagination
  const totalPages = Math.ceil(engagements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEngagements = engagements.slice(startIndex, endIndex)
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  useEffect(() => {
    setLocalSelection(selectedEngagements)
  }, [selectedEngagements])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedEngagements.map(e => e.id)
      const newSelection = [...new Set([...localSelection, ...allIds])]
      setLocalSelection(newSelection)
      onSelectionChange?.(newSelection)
    } else {
      const pageIds = paginatedEngagements.map(e => e.id)
      const newSelection = localSelection.filter(id => !pageIds.includes(id))
      setLocalSelection(newSelection)
      onSelectionChange?.(newSelection)
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      const newSelection = [...localSelection, id]
      setLocalSelection(newSelection)
      onSelectionChange?.(newSelection)
    } else {
      const newSelection = localSelection.filter(selectedId => selectedId !== id)
      setLocalSelection(newSelection)
      onSelectionChange?.(newSelection)
    }
  }

  const isAllSelected = paginatedEngagements.length > 0 && 
    paginatedEngagements.every(e => localSelection.includes(e.id))
  const isIndeterminate = paginatedEngagements.some(e => localSelection.includes(e.id)) && !isAllSelected

  const getDeliverableStatus = (deliverables: any[]) => {
    if (!deliverables || deliverables.length === 0) return { approved: 0, total: 0 }
    const approved = deliverables.filter(d => d.content_approved).length
    return { approved, total: deliverables.length }
  }

  const getTaskStatus = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return { completed: 0, total: 0 }
    const completed = tasks.filter(t => t.completed_at).length
    return { completed, total: tasks.length }
  }

  const getInvoiceStatus = (invoices: any[]) => {
    if (!invoices || invoices.length === 0) return null
    const paid = invoices.filter(i => i.status === 'paid').length
    const total = invoices.reduce((sum, i) => sum + (i.amount_cents || 0), 0)
    return { paid, count: invoices.length, total }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                  />
                </TableHead>
              )}
              <TableHead>Campaign/Period</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Influencer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Negotiation</TableHead>
              <TableHead>Budget/Agreed</TableHead>
              <TableHead>Target Views</TableHead>
              <TableHead>Deliverables</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEngagements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showSelection ? 11 : 10} className="text-center py-8">
                  No engagements found. Create your first engagement to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEngagements.map((engagement) => {
                const deliverableStatus = getDeliverableStatus(engagement.deliverables)
                const taskStatus = getTaskStatus(engagement.engagement_tasks)
                const invoiceStatus = getInvoiceStatus(engagement.invoices)
                
                return (
                  <TableRow key={engagement.id}>
                    {showSelection && (
                      <TableCell>
                        <Checkbox
                          checked={localSelection.includes(engagement.id)}
                          onCheckedChange={(checked) => handleSelectOne(engagement.id, checked as boolean)}
                          aria-label={`Select ${engagement.campaign_name || 'engagement'}`}
                          className="translate-y-[2px]"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium text-sm">{engagement.campaign_name || 'Unnamed Campaign'}</div>
                        <div className="text-xs text-gray-500">{engagement.period_label || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{engagement.brands?.name || '-'}</div>
                        {engagement.brand_contacts?.name && (
                          <div className="text-xs text-gray-500">
                            {engagement.brand_contacts.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{engagement.influencers?.name || '-'}</div>
                        {engagement.influencers?.instagram_handle && (
                          <div className="text-xs text-gray-500">
                            {engagement.influencers.instagram_handle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={statusColors[engagement.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                        variant="secondary"
                      >
                        {engagement.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={negotiationStatusColors[engagement.negotiation_status as keyof typeof negotiationStatusColors] || 'bg-gray-100 text-gray-800'}
                        variant="secondary"
                      >
                        {engagement.negotiation_status?.replace(/_/g, ' ') || 'pending outreach'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        {engagement.budget ? (
                          <div className="text-xs text-gray-500">
                            Budget: {formatCurrency(engagement.budget)}
                          </div>
                        ) : null}
                        {engagement.agreed_total_cents ? (
                          <div className="font-medium text-sm">
                            Agreed: {formatCurrency(engagement.agreed_total_cents / 100)}
                          </div>
                        ) : (
                          <span className="text-gray-400">No amount set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {engagement.target_views ? (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {engagement.target_views.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deliverableStatus.total > 0 ? (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {deliverableStatus.approved}/{deliverableStatus.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {taskStatus.total > 0 ? (
                        <div className="text-sm">
                          {taskStatus.completed}/{taskStatus.total}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/engagements/${engagement.id}`}>
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/engagements/${engagement.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/engagements/${engagement.id}/invoices`}>
                          <Button variant="ghost" size="icon" title="Invoices">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
Showing {startIndex + 1} to {Math.min(endIndex, engagements.length)} of {engagements.length} engagements
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}