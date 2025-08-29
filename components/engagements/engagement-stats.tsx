'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, CheckCircle, DollarSign, Calendar, TrendingUp, Clock } from 'lucide-react'

interface Engagement {
  id: string
  status: string | null
  agreed_total_cents: number | null
  period_year: number | null
  period_month: number | null
  deliverables?: any[]
  invoices?: any[]
}

interface EngagementStatsProps {
  engagements: Engagement[]
}

export default function EngagementStats({ engagements }: EngagementStatsProps) {
  const activeCount = engagements.filter(e => e.status === 'active').length
  const completedCount = engagements.filter(e => e.status === 'completed').length
  const negotiatingCount = engagements.filter(e => e.status === 'negotiating').length
  
  const totalValue = engagements.reduce((sum, e) => sum + (e.agreed_total_cents || 0), 0)
  const paidValue = engagements.reduce((sum, e) => {
    const paidInvoices = e.invoices?.filter(i => i.status === 'paid') || []
    return sum + paidInvoices.reduce((invSum, inv) => invSum + (inv.total_cents || 0), 0)
  }, 0)
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const thisMonthCount = engagements.filter(e => 
    e.period_year === currentYear && e.period_month === currentMonth
  ).length
  
  const totalDeliverables = engagements.reduce((sum, e) => 
    sum + (e.deliverables?.length || 0), 0
  )
  
  const approvedDeliverables = engagements.reduce((sum, e) => 
    sum + (e.deliverables?.filter(d => d.content_approved).length || 0), 0
  )

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagements.length}</div>
          <p className="text-xs text-muted-foreground">All engagements</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Negotiating</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{negotiatingCount}</div>
          <p className="text-xs text-muted-foreground">In progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Paid: {formatCurrency(paidValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthCount}</div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {approvedDeliverables}/{totalDeliverables}
          </div>
          <p className="text-xs text-muted-foreground">Approved/Total</p>
        </CardContent>
      </Card>
    </div>
  )
}