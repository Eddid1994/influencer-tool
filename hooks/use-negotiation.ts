'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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

interface UseNegotiationReturn {
  negotiation: Negotiation | null
  isLoading: boolean
  isCreating: boolean
  isRefreshing: boolean
  error: Error | null
  createNegotiation: () => Promise<void>
  refreshNegotiation: () => Promise<void>
  updateStatus: (status: Negotiation['status']) => Promise<void>
}

export function useNegotiation(
  campaignId: string, 
  initialNegotiation?: Negotiation | null
): UseNegotiationReturn {
  const [negotiation, setNegotiation] = useState<Negotiation | null>(initialNegotiation || null)
  const [isLoading, setIsLoading] = useState(!initialNegotiation)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()

  // Fetch negotiation data
  const fetchNegotiation = useCallback(async (negotiationId: string) => {
    try {
      // Fetch all data in parallel
      const [negotiationResult, offersResult, communicationsResult, tasksResult] = await Promise.all([
        supabase
          .from('campaign_negotiations')
          .select('*')
          .eq('id', negotiationId)
          .single(),
        supabase
          .from('negotiation_offers')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false }),
        supabase
          .from('negotiation_communications')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false }),
        supabase
          .from('negotiation_tasks')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .eq('status', 'open')
          .order('due_at', { ascending: true })
      ])

      if (negotiationResult.error) {
        throw negotiationResult.error
      }

      if (negotiationResult.data) {
        setNegotiation({
          ...negotiationResult.data,
          offers: offersResult.data || [],
          communications: communicationsResult.data || [],
          tasks: tasksResult.data || []
        } as Negotiation)
      }
    } catch (err) {
      console.error('Error fetching negotiation:', err)
      setError(err as Error)
      throw err
    }
  }, [supabase])

  // Check for existing negotiation on mount
  useEffect(() => {
    if (!initialNegotiation && campaignId) {
      setIsLoading(true)
      supabase
        .from('campaign_negotiations')
        .select('id')
        .eq('campaign_id', campaignId)
        .single()
        .then(({ data }) => {
          if (data?.id) {
            return fetchNegotiation(data.id)
          }
        })
        .catch((err) => {
          // No existing negotiation is not an error
          console.log('No existing negotiation')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [campaignId, initialNegotiation, fetchNegotiation, supabase])

  // Create negotiation
  const createNegotiation = useCallback(async () => {
    setIsCreating(true)
    setError(null)
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Check for existing negotiation
      const { data: existing } = await supabase
        .from('campaign_negotiations')
        .select('id')
        .eq('campaign_id', campaignId)
        .single()

      if (existing) {
        // Fetch the existing negotiation instead
        await fetchNegotiation(existing.id)
        toast.info('Negotiation already exists for this campaign')
        return
      }

      // Create new negotiation
      const { data, error } = await supabase
        .from('campaign_negotiations')
        .insert({
          campaign_id: campaignId,
          status: 'pending_outreach',
          current_stage: 'initial_contact',
          priority: 'medium',
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setNegotiation({
          ...data,
          offers: [],
          communications: [],
          tasks: []
        } as Negotiation)
        toast.success('Negotiation tracking started')
      }
    } catch (err: any) {
      console.error('Error creating negotiation:', err)
      setError(err)
      
      // User-friendly error messages
      if (err.message === 'Authentication required') {
        toast.error('Please log in to start negotiation tracking')
      } else if (err.code === '23505') {
        toast.error('A negotiation already exists for this campaign')
      } else if (err.code === '42501') {
        toast.error('You do not have permission to create negotiations')
      } else {
        toast.error(`Failed to start negotiation: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsCreating(false)
    }
  }, [campaignId, supabase, fetchNegotiation])

  // Refresh negotiation data
  const refreshNegotiation = useCallback(async () => {
    if (!negotiation?.id) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      await fetchNegotiation(negotiation.id)
    } catch (err) {
      toast.error('Failed to refresh negotiation data')
    } finally {
      setIsRefreshing(false)
    }
  }, [negotiation?.id, fetchNegotiation])

  // Update negotiation status
  const updateStatus = useCallback(async (newStatus: Negotiation['status']) => {
    if (!negotiation?.id) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('campaign_negotiations')
        .update({ 
          status: newStatus,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', negotiation.id)

      if (error) {
        throw error
      }

      // Update local state optimistically
      setNegotiation(prev => prev ? { ...prev, status: newStatus } : null)
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      
      // Refresh to get latest data
      await fetchNegotiation(negotiation.id)
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err)
      toast.error(`Failed to update status: ${err.message || 'Unknown error'}`)
    } finally {
      setIsRefreshing(false)
    }
  }, [negotiation?.id, supabase, fetchNegotiation])

  return {
    negotiation,
    isLoading,
    isCreating,
    isRefreshing,
    error,
    createNegotiation,
    refreshNegotiation,
    updateStatus
  }
}