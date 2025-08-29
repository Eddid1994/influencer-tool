'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UnifiedTemplateSender from '@/components/templates/unified-template-sender'
import {
  MessageSquare,
  Clock,
  Send,
  Mail,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  X,
  Zap,
  Package,
  FileText,
  DollarSign
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import { toast } from 'sonner'

interface SmartTimelineProps {
  engagementId: string
  engagement: any
  onUpdate?: () => void
}

interface TimelineEvent {
  id: string
  type: 'message' | 'scheduled' | 'offer' | 'deliverable' | 'status_change'
  phase: string
  title: string
  description?: string
  timestamp: Date
  icon?: any
  status?: 'completed' | 'scheduled' | 'cancelled'
  data?: any
}

const phaseOrder = [
  'outreach',
  'negotiation', 
  'briefing',
  'content',
  'publishing',
  'completion'
]

const phaseConfig = {
  outreach: { 
    name: 'Outreach', 
    icon: Mail, 
    color: 'text-blue-600 bg-blue-50' 
  },
  negotiation: { 
    name: 'Negotiation', 
    icon: MessageSquare, 
    color: 'text-purple-600 bg-purple-50' 
  },
  briefing: { 
    name: 'Briefing', 
    icon: FileText, 
    color: 'text-yellow-600 bg-yellow-50' 
  },
  content: { 
    name: 'Content', 
    icon: Package, 
    color: 'text-green-600 bg-green-50' 
  },
  publishing: { 
    name: 'Publishing', 
    icon: Send, 
    color: 'text-indigo-600 bg-indigo-50' 
  },
  completion: { 
    name: 'Completion', 
    icon: CheckCircle, 
    color: 'text-gray-600 bg-gray-50' 
  }
}

export default function SmartTimeline({ engagementId, engagement, onUpdate }: SmartTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['outreach'])
  const [showTemplateSender, setShowTemplateSender] = useState(false)
  const [automationPaused, setAutomationPaused] = useState(engagement?.automation_paused || false)
  const [cancellingMessage, setCancellingMessage] = useState<string | null>(null)
  
  const supabase = createClientComponentClient<Database>()

  // Helper functions - define before using in useMemo
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100)
  }

  const determinePhase = (message: any): string => {
    // Logic to determine which phase a message belongs to
    if (message.template_type === 'initial_outreach' || message.template_type === 'follow_up') {
      return 'outreach'
    }
    if (message.template_type === 'offer' || message.template_type === 'counter_offer') {
      return 'negotiation'
    }
    if (message.template_type === 'brief' || message.subject?.toLowerCase().includes('brief')) {
      return 'briefing'
    }
    return 'outreach'
  }

  // Build timeline from engagement data
  const timeline = useMemo(() => {
    const events: TimelineEvent[] = []
    
    // Add sent messages
    const messagesSent = engagement?.messages_sent || []
    messagesSent.forEach((msg: any) => {
      events.push({
        id: msg.id,
        type: 'message',
        phase: determinePhase(msg),
        title: msg.subject || 'Message sent',
        description: msg.content?.substring(0, 100) + '...',
        timestamp: new Date(msg.sent_at),
        icon: Mail,
        status: 'completed',
        data: msg
      })
    })

    // Add scheduled messages
    const scheduledMessages = engagement?.scheduled_messages || []
    scheduledMessages.forEach((msg: any) => {
      if (!msg.cancelled_at) {
        events.push({
          id: msg.id,
          type: 'scheduled',
          phase: 'outreach',
          title: `Scheduled: ${msg.template_name}`,
          description: `Will send if no response`,
          timestamp: new Date(msg.scheduled_for),
          icon: Clock,
          status: 'scheduled',
          data: msg
        })
      }
    })

    // Add offers from negotiation_data
    const offers = engagement?.negotiation_data?.offers || []
    offers.forEach((offer: any) => {
      events.push({
        id: offer.id,
        type: 'offer',
        phase: 'negotiation',
        title: `${offer.offer_type} offer: ${formatCurrency(offer.amount_cents)}`,
        description: offer.notes,
        timestamp: new Date(offer.created_at),
        icon: DollarSign,
        status: 'completed',
        data: offer
      })
    })

    // Add deliverable events
    const deliverables = engagement?.deliverables || []
    deliverables.forEach((del: any) => {
      if (del.briefing_sent_at) {
        events.push({
          id: `${del.id}-brief`,
          type: 'deliverable',
          phase: 'briefing',
          title: `Brief sent: ${del.platform} ${del.deliverable}`,
          timestamp: new Date(del.briefing_sent_at),
          icon: FileText,
          status: 'completed'
        })
      }
      if (del.content_submitted_at) {
        events.push({
          id: `${del.id}-submit`,
          type: 'deliverable',
          phase: 'content',
          title: `Content submitted: ${del.platform} ${del.deliverable}`,
          timestamp: new Date(del.content_submitted_at),
          icon: Package,
          status: 'completed'
        })
      }
      if (del.published_at) {
        events.push({
          id: `${del.id}-publish`,
          type: 'deliverable',
          phase: 'publishing',
          title: `Published: ${del.platform} ${del.deliverable}`,
          description: del.content_url,
          timestamp: new Date(del.published_at),
          icon: Send,
          status: 'completed'
        })
      }
    })

    // Sort by timestamp
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [engagement])

  // Group timeline by phase
  const groupedTimeline = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {}
    
    phaseOrder.forEach(phase => {
      grouped[phase] = timeline.filter(event => event.phase === phase)
    })
    
    return grouped
  }, [timeline])

  // Get current phase based on latest activity
  const currentPhase = useMemo(() => {
    const latestEvent = timeline
      .filter(e => e.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    
    return latestEvent?.phase || 'outreach'
  }, [timeline])


  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    )
  }

  const handleCancelScheduled = async (messageId: string) => {
    setCancellingMessage(messageId)
    try {
      const scheduledMessages = engagement.scheduled_messages || []
      const updatedScheduled = scheduledMessages.map((msg: any) =>
        msg.id === messageId 
          ? { ...msg, cancelled_at: new Date().toISOString() }
          : msg
      )

      const { error } = await supabase
        .from('engagements')
        .update({ scheduled_messages: updatedScheduled })
        .eq('id', engagementId)

      if (error) throw error
      
      toast.success('Scheduled message cancelled')
      onUpdate?.()
    } catch (error) {
      console.error('Error cancelling message:', error)
      toast.error('Failed to cancel message')
    } finally {
      setCancellingMessage(null)
    }
  }

  const handleToggleAutomation = async () => {
    try {
      const newPausedState = !automationPaused
      const { data, error } = await supabase
        .from('engagements')
        .update({ automation_paused: newPausedState })
        .eq('id', engagementId)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new Error(error.message || 'Failed to update automation state')
      }
      
      setAutomationPaused(newPausedState)
      toast.success(newPausedState ? 'Automation paused' : 'Automation resumed')
      onUpdate?.()
    } catch (error: any) {
      console.error('Error toggling automation:', error)
      toast.error(error.message || 'Failed to update automation')
    }
  }

  const getNextScheduledMessage = () => {
    return timeline
      .filter(e => e.type === 'scheduled' && e.status === 'scheduled')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0]
  }

  const nextMessage = getNextScheduledMessage()

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="text-sm">
                Current: {phaseConfig[currentPhase as keyof typeof phaseConfig]?.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last Contact: {engagement?.last_contact_date 
                  ? formatDistanceToNow(new Date(engagement.last_contact_date), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTemplateSender(true)}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant={automationPaused ? "outline" : "default"}
                size="sm"
                onClick={handleToggleAutomation}
              >
                {automationPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
                Automation
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Next Scheduled Alert */}
      {nextMessage && !automationPaused && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Next automated message: <strong>{nextMessage.title}</strong> scheduled {formatDistanceToNow(nextMessage.timestamp, { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleCancelScheduled(nextMessage.id)}
                disabled={cancellingMessage === nextMessage.id}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Smart Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {phaseOrder.map(phase => {
                const phaseEvents = groupedTimeline[phase] || []
                const isExpanded = expandedPhases.includes(phase)
                const config = phaseConfig[phase as keyof typeof phaseConfig]
                const Icon = config?.icon || MessageSquare
                const hasEvents = phaseEvents.length > 0
                const isCurrentPhase = phase === currentPhase

                return (
                  <div key={phase} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => togglePhase(phase)}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        isCurrentPhase ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config?.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{config?.name}</span>
                        {hasEvents && (
                          <Badge variant="secondary" className="text-xs">
                            {phaseEvents.filter(e => e.status === 'completed').length}/{phaseEvents.length}
                          </Badge>
                        )}
                        {isCurrentPhase && (
                          <Badge className="text-xs">Current</Badge>
                        )}
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-3 bg-gray-50 space-y-3">
                        {hasEvents ? (
                          phaseEvents.map(event => (
                            <div key={event.id} className="flex gap-3 bg-white p-3 rounded-lg">
                              <div className={`p-2 rounded-lg ${
                                event.status === 'scheduled' ? 'bg-yellow-50' : 'bg-green-50'
                              }`}>
                                <event.icon className={`h-4 w-4 ${
                                  event.status === 'scheduled' ? 'text-yellow-600' : 'text-green-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{event.title}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {format(event.timestamp, 'MMM d, HH:mm')}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {event.description}
                                  </p>
                                )}
                                {event.status === 'scheduled' && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs"
                                      onClick={() => handleCancelScheduled(event.id)}
                                      disabled={cancellingMessage === event.id}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            No activity in this phase yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Unified Template Sender */}
      <UnifiedTemplateSender
        open={showTemplateSender}
        onClose={() => setShowTemplateSender(false)}
        engagements={[engagement]}
        mode="single"
        onSuccess={onUpdate}
      />
    </div>
  )
}