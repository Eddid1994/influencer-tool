import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Send, 
  MessageSquare, 
  Handshake, 
  CheckCircle, 
  XCircle, 
  PauseCircle 
} from 'lucide-react'

export type NegotiationStatus = 
  | 'pending_outreach'
  | 'outreach_sent'
  | 'awaiting_response'
  | 'negotiating'
  | 'agreed'
  | 'declined'
  | 'on_hold'

interface NegotiationStatusBadgeProps {
  status: NegotiationStatus | null
  showIcon?: boolean
  size?: 'sm' | 'default'
}

export function NegotiationStatusBadge({ 
  status, 
  showIcon = true,
  size = 'default' 
}: NegotiationStatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="secondary" className={size === 'sm' ? 'text-xs' : ''}>
        No negotiation
      </Badge>
    )
  }

  const config = {
    pending_outreach: {
      label: 'Pending Outreach',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-gray-100 text-gray-700'
    },
    outreach_sent: {
      label: 'Outreach Sent',
      variant: 'default' as const,
      icon: Send,
      className: 'bg-blue-100 text-blue-700'
    },
    awaiting_response: {
      label: 'Awaiting Response',
      variant: 'outline' as const,
      icon: MessageSquare,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-300'
    },
    negotiating: {
      label: 'Negotiating',
      variant: 'default' as const,
      icon: Handshake,
      className: 'bg-purple-100 text-purple-700'
    },
    agreed: {
      label: 'Agreed',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700'
    },
    declined: {
      label: 'Declined',
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-red-100 text-red-700'
    },
    on_hold: {
      label: 'On Hold',
      variant: 'secondary' as const,
      icon: PauseCircle,
      className: 'bg-orange-100 text-orange-700'
    }
  }

  const { label, variant, icon: Icon, className } = config[status]

  return (
    <Badge 
      variant={variant} 
      className={`${className} ${size === 'sm' ? 'text-xs py-0 px-2' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />}
      {label}
    </Badge>
  )
}