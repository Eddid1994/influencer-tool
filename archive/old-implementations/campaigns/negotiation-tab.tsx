'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NegotiationStatusBadge } from '@/components/negotiations/negotiation-status-badge'
import { NegotiationTimeline } from '@/components/negotiations/negotiation-timeline'
import { NegotiationQuickActions } from '@/components/negotiations/negotiation-quick-actions'
import { NegotiationSkeleton } from '@/components/negotiations/negotiation-skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { Plus, DollarSign, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Offer {
  id: string
  offer_type: 'initial' | 'counter' | 'final'
  offered_by: 'brand' | 'influencer'
  amount_cents: number
  currency: string
  notes?: string | null
  created_at: string
}

interface Communication {
  id: string
  communication_type: 'email' | 'phone' | 'message'
  direction: 'inbound' | 'outbound'
  subject?: string | null
  content: string
  created_at: string
}

interface Task {
  id: string
  type: 'follow_up' | 'internal_review' | 'send_offer' | 'send_contract'
  title: string
  description?: string | null
  due_at: string
  status: 'open' | 'completed'
}

interface Negotiation {
  id: string
  campaign_id: string
  status: 'pending_outreach' | 'outreach_sent' | 'awaiting_response' | 'negotiating' | 'agreed' | 'declined' | 'on_hold'
  current_stage?: string | null
  priority: 'low' | 'medium' | 'high'
  last_contact_date?: string | null
  final_agreed_amount_cents?: number | null
  created_at: string
  updated_at: string
  offers?: Offer[]
  communications?: Communication[]
  tasks?: Task[]
}

interface NegotiationTabProps {
  campaignId: string
  negotiation: Negotiation | null
}

export function NegotiationTab({ campaignId, negotiation: initialNegotiation }: NegotiationTabProps) {
  const [negotiation, setNegotiation] = useState<Negotiation | null>(initialNegotiation)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(!initialNegotiation)
  const [timelineItems, setTimelineItems] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (negotiation) {
      buildTimeline()
    }
  }, [negotiation])
  
  // Load negotiation data on mount if not provided
  useEffect(() => {
    if (!initialNegotiation && !isCreating) {
      checkForExistingNegotiation()
    }
  }, [])

  const buildTimeline = () => {
    const items: any[] = []
    
    // Add status changes
    if (negotiation) {
      items.push({
        id: `status-${negotiation.id}`,
        type: 'status_change',
        title: 'Negotiation Started',
        description: `Status: ${negotiation.status.replace('_', ' ')}`,
        timestamp: negotiation.created_at,
        metadata: { new_status: negotiation.status }
      })
    }

    // Add offers
    if (negotiation?.offers) {
      negotiation.offers.forEach((offer: any) => {
        items.push({
          id: `offer-${offer.id}`,
          type: 'offer',
          title: `${offer.offer_type.charAt(0).toUpperCase() + offer.offer_type.slice(1)} Offer`,
          description: offer.notes,
          timestamp: offer.created_at,
          metadata: {
            amount_cents: offer.amount_cents,
            currency: offer.currency,
            offered_by: offer.offered_by
          }
        })
      })
    }

    // Add communications
    if (negotiation?.communications) {
      negotiation.communications.forEach((comm: any) => {
        items.push({
          id: `comm-${comm.id}`,
          type: 'communication',
          title: comm.subject || `${comm.communication_type} ${comm.direction}`,
          description: comm.content,
          timestamp: comm.created_at,
          metadata: {
            communication_type: comm.communication_type,
            direction: comm.direction
          }
        })
      })
    }

    // Sort by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setTimelineItems(items)
  }

  const createNegotiation = async () => {
    setIsCreating(true)
    try {
      // Get current user with better error handling
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast.error('Please log in to start negotiation tracking')
        // Store current URL for redirect after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
          window.location.href = '/login'
        }
        return
      }

      // Check if negotiation already exists first
      const { data: existing, error: checkError } = await supabase
        .from('campaign_negotiations')
        .select('id')
        .eq('campaign_id', campaignId)
        .single()

      if (existing) {
        toast.error('Negotiation tracking already exists for this campaign')
        // Refresh to show the existing negotiation
        await refreshNegotiation(existing.id)
        return
      }
      
      // Create the negotiation with optimistic UI update
      const newNegotiation = {
        campaign_id: campaignId,
        status: 'pending_outreach' as const,
        current_stage: 'initial_contact',
        priority: 'medium' as const,
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('campaign_negotiations')
        .insert(newNegotiation)
        .select()
        .single()

      if (error) {
        // Improved error logging and handling
        const errorDetails = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          campaignId,
          userId: user.id
        }
        console.error('Error creating negotiation:', errorDetails)
        
        // Better error messages based on error codes
        switch (error.code) {
          case '23505':
            toast.error('A negotiation already exists for this campaign')
            break
          case '42501':
            toast.error('You do not have permission to create negotiations. Please contact your administrator.')
            break
          case '23503':
            toast.error('Unable to create negotiation. Please ensure your user profile is set up correctly.')
            break
          case '23514':
            toast.error('Invalid data provided. Please check your input and try again.')
            break
          default:
            toast.error(`Failed to start negotiation: ${error.message || 'Unknown error'}`)
        }
        return
      }

      // Set the negotiation data with proper typing
      setNegotiation({
        ...data,
        offers: [],
        communications: [],
        tasks: []
      } as Negotiation)
      
      toast.success('Negotiation tracking started successfully')
      
      // Refresh to get complete data
      if (data?.id) {
        await refreshNegotiation(data.id)
      }
    } catch (error) {
      // Handle unexpected errors
      const err = error as Error
      console.error('Unexpected error creating negotiation:', {
        message: err.message,
        stack: err.stack,
        campaignId
      })
      toast.error(`An unexpected error occurred: ${err.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const checkForExistingNegotiation = async () => {
    setIsInitialLoad(true)
    try {
      const { data: existing } = await supabase
        .from('campaign_negotiations')
        .select('id')
        .eq('campaign_id', campaignId)
        .single()

      if (existing?.id) {
        await refreshNegotiation(existing.id)
      }
    } catch (error) {
      console.log('No existing negotiation found')
    } finally {
      setIsInitialLoad(false)
    }
  }

  const refreshNegotiation = async (negotiationId?: string) => {
    const idToRefresh = negotiationId || negotiation?.id
    if (!idToRefresh) return

    setIsRefreshing(true)
    try {
      // Fetch all data in parallel for better performance
      const [negotiationResult, offersResult, communicationsResult, tasksResult] = await Promise.all([
        supabase
          .from('campaign_negotiations')
          .select('*')
          .eq('id', idToRefresh)
          .single(),
        supabase
          .from('negotiation_offers')
          .select('*')
          .eq('negotiation_id', idToRefresh)
          .order('created_at', { ascending: false }),
        supabase
          .from('negotiation_communications')
          .select('*')
          .eq('negotiation_id', idToRefresh)
          .order('created_at', { ascending: false }),
        supabase
          .from('negotiation_tasks')
          .select('*')
          .eq('negotiation_id', idToRefresh)
          .eq('status', 'open')
          .order('due_at', { ascending: true })
      ])

      const { data: updatedNegotiation, error: negotiationError } = negotiationResult
      const { data: offers, error: offersError } = offersResult
      const { data: communications, error: commsError } = communicationsResult
      const { data: tasks, error: tasksError } = tasksResult

      if (negotiationError) {
        console.error('Error fetching negotiation:', negotiationError)
        toast.error('Failed to refresh negotiation data')
        return
      }

      if (updatedNegotiation) {
        setNegotiation({
          ...updatedNegotiation,
          offers: offers || [],
          communications: communications || [],
          tasks: tasks || []
        } as Negotiation)
      }
    } catch (error) {
      console.error('Error refreshing negotiation:', error)
      toast.error('Failed to refresh negotiation data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show skeleton loader during initial load
  if (isInitialLoad) {
    return <NegotiationSkeleton />
  }

  if (!negotiation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negotiation Tracking</CardTitle>
          <CardDescription>
            Start tracking negotiations for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No negotiation tracking has been started for this campaign yet.
            </p>
            <Button onClick={createNegotiation} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Starting...' : 'Start Negotiation Tracking'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6" key={negotiation.id}>
      {/* Status and Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Negotiation Status</CardTitle>
              <CardDescription>
                Track and manage negotiation progress
              </CardDescription>
            </div>
            <NegotiationStatusBadge status={negotiation.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Stage</p>
                <p className="font-medium">{negotiation.current_stage?.replace('_', ' ') || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className="font-medium capitalize">{negotiation.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Contact</p>
                <p className="font-medium">
                  {negotiation.last_contact_date 
                    ? formatDate(negotiation.last_contact_date)
                    : 'No contact yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Final Amount</p>
                <p className="font-medium">
                  {negotiation.final_agreed_amount_cents
                    ? formatCurrency(negotiation.final_agreed_amount_cents / 100)
                    : 'Not agreed'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <NegotiationQuickActions
                negotiationId={negotiation.id}
                currentStatus={negotiation.status}
                onUpdate={() => refreshNegotiation()}
                disabled={isRefreshing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Offers Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {negotiation.offers && negotiation.offers.length > 0 ? (
              <div className="space-y-3">
                {negotiation.offers.slice(0, 3).map((offer: any) => (
                  <div key={offer.id} className="pb-3 border-b last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {offer.offer_type.charAt(0).toUpperCase() + offer.offer_type.slice(1)} Offer
                        </p>
                        <p className="text-xs text-gray-500">
                          From {offer.offered_by}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(offer.amount_cents / 100)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(offer.created_at)}
                    </p>
                  </div>
                ))}
                {negotiation.offers.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{negotiation.offers.length - 3} more offers
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No offers yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {negotiation.communications && negotiation.communications.length > 0 ? (
              <div className="space-y-3">
                {negotiation.communications.slice(0, 3).map((comm: any) => (
                  <div key={comm.id} className="pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">
                      {comm.subject || comm.communication_type}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {comm.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(comm.created_at)}
                    </p>
                  </div>
                ))}
                {negotiation.communications.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{negotiation.communications.length - 3} more messages
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No communications logged</p>
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {negotiation.tasks && negotiation.tasks.length > 0 ? (
              <div className="space-y-3">
                {negotiation.tasks.map((task: any) => (
                  <div key={task.id} className="pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {task.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Due: {formatDate(task.due_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No open tasks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Negotiation Timeline</CardTitle>
          <CardDescription>
            Complete history of all negotiation activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NegotiationTimeline items={timelineItems} />
        </CardContent>
      </Card>
    </div>
  )
}