'use client'

import { formatDate, formatCurrency } from '@/lib/utils/formatters'
import { 
  Clock, 
  Send, 
  MessageSquare, 
  DollarSign,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  type: 'status_change' | 'offer' | 'communication' | 'task'
  title: string
  description?: string
  timestamp: string
  user?: string
  metadata?: {
    amount_cents?: number
    currency?: string
    offered_by?: string
    communication_type?: string
    direction?: string
    old_status?: string
    new_status?: string
  }
}

interface NegotiationTimelineProps {
  items: TimelineItem[]
  className?: string
}

export function NegotiationTimeline({ items, className }: NegotiationTimelineProps) {
  const getIcon = (item: TimelineItem) => {
    if (item.type === 'offer') {
      return DollarSign
    }
    if (item.type === 'communication') {
      switch (item.metadata?.communication_type) {
        case 'email': return Mail
        case 'phone': return Phone
        case 'message': return MessageSquare
        default: return MessageSquare
      }
    }
    if (item.type === 'task') {
      return Clock
    }
    if (item.type === 'status_change') {
      switch (item.metadata?.new_status) {
        case 'agreed': return CheckCircle
        case 'declined': return XCircle
        case 'outreach_sent': return Send
        default: return AlertCircle
      }
    }
    return FileText
  }

  const getIconColor = (item: TimelineItem) => {
    if (item.type === 'offer') return 'text-green-600'
    if (item.type === 'communication') return 'text-blue-600'
    if (item.type === 'task') return 'text-purple-600'
    if (item.type === 'status_change') {
      if (item.metadata?.new_status === 'agreed') return 'text-green-600'
      if (item.metadata?.new_status === 'declined') return 'text-red-600'
      return 'text-gray-600'
    }
    return 'text-gray-400'
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No negotiation activity yet
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const Icon = getIcon(item)
        const iconColor = getIconColor(item)
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="flex gap-4">
            {/* Icon and line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                item.type === 'offer' && "bg-green-100",
                item.type === 'communication' && "bg-blue-100",
                item.type === 'task' && "bg-purple-100",
                item.type === 'status_change' && item.metadata?.new_status === 'agreed' && "bg-green-100",
                item.type === 'status_change' && item.metadata?.new_status === 'declined' && "bg-red-100",
                item.type === 'status_change' && !['agreed', 'declined'].includes(item.metadata?.new_status || '') && "bg-gray-100"
              )}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{formatDate(item.timestamp)}</div>
                    {item.user && (
                      <div className="text-xs text-gray-400 mt-1">by {item.user}</div>
                    )}
                  </div>
                </div>

                {/* Metadata badges */}
                {item.metadata && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.metadata.amount_cents && (
                      <Badge variant="secondary">
                        {formatCurrency(item.metadata.amount_cents / 100)} {item.metadata.currency}
                      </Badge>
                    )}
                    {item.metadata.offered_by && (
                      <Badge variant="outline">
                        From: {item.metadata.offered_by}
                      </Badge>
                    )}
                    {item.metadata.direction && (
                      <Badge variant={item.metadata.direction === 'inbound' ? 'default' : 'secondary'}>
                        {item.metadata.direction}
                      </Badge>
                    )}
                    {item.metadata.new_status && (
                      <Badge variant="outline">
                        → {item.metadata.new_status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )
      })}
    </div>
  )
}