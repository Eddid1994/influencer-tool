'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  NegotiationStatus,
  NegotiationPriority,
  NegotiationData,
  EngagementWithNegotiation,
  UseNegotiationReturn
} from '@/types/negotiation'

export function useNegotiation(
  engagementId: string, 
  initialEngagement?: EngagementWithNegotiation | null
): UseNegotiationReturn {
  const [engagement, setEngagement] = useState<EngagementWithNegotiation | null>(initialEngagement || null)
  const [isLoading, setIsLoading] = useState(!initialEngagement)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()

  // Fetch engagement with negotiation data
  const fetchEngagement = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          brand:brands(name, website),
          influencer:influencers(name, email, instagram_handle),
          brand_contact:brand_contacts(name, email, role)
        `)
        .eq('id', engagementId)
        .single()

      if (error) {
        throw error
      }

      setEngagement(data as EngagementWithNegotiation)
      return data
    } catch (err) {
      console.error('Error fetching engagement:', err)
      setError(err as Error)
      throw err
    }
  }, [supabase, engagementId])

  // Load engagement data on mount
  useEffect(() => {
    if (!initialEngagement) {
      setIsLoading(true)
      fetchEngagement()
        .catch(() => {
          // Error already logged
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [engagementId, initialEngagement, fetchEngagement])

  // Add communication to negotiation data
  const addCommunication = useCallback(async (communication: any) => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .rpc('add_negotiation_communication', {
          engagement_id_param: engagementId,
          communication_type_param: communication.type,
          direction_param: communication.direction,
          subject_param: communication.subject || null,
          content_param: communication.content,
          user_id_param: user.id
        })

      if (error) {
        throw error
      }

      toast.success('Communication logged')
      await refresh()
    } catch (err: any) {
      console.error('Error adding communication:', err)
      setError(err)
      toast.error(`Failed to log communication: ${err.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [supabase, engagementId])

  // Add offer to negotiation data
  const addOffer = useCallback(async (offer: any) => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .rpc('add_negotiation_offer', {
          engagement_id_param: engagementId,
          offer_type_param: offer.offer_type,
          offered_by_param: offer.offered_by,
          amount_cents_param: offer.amount_cents,
          currency_param: offer.currency,
          notes_param: offer.notes || null,
          user_id_param: user.id
        })

      if (error) {
        throw error
      }

      toast.success('Offer recorded')
      await refresh()
    } catch (err: any) {
      console.error('Error adding offer:', err)
      setError(err)
      toast.error(`Failed to record offer: ${err.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [supabase, engagementId])

  // Update negotiation status
  const updateStatus = useCallback(async (newStatus: NegotiationStatus, notes?: string) => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .rpc('update_negotiation_status', {
          engagement_id_param: engagementId,
          new_status: newStatus,
          notes_param: notes || null,
          user_id_param: user.id
        })

      if (error) {
        throw error
      }

      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      await refresh()
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err)
      toast.error(`Failed to update status: ${err.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [supabase, engagementId])

  // Set follow-up date
  const setFollowUp = useCallback(async (date: string, notes?: string) => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('engagements')
        .update({
          next_follow_up_date: date,
          updated_at: new Date().toISOString()
        })
        .eq('id', engagementId)

      if (error) {
        throw error
      }

      // Add timeline entry if notes provided
      if (notes) {
        const currentData = engagement?.negotiation_data as NegotiationData || {
          offers: [],
          communications: [],
          timeline: [],
          current_stage: 'initial_contact',
          notes: '',
          templates_used: [],
          follow_up_count: 0
        }

        const timelineEntry = {
          id: crypto.randomUUID(),
          type: 'task' as const,
          title: 'Follow-up scheduled',
          description: `Follow-up set for ${new Date(date).toLocaleDateString()}`,
          notes,
          created_at: new Date().toISOString(),
          created_by: user.id
        }

        const updatedData = {
          ...currentData,
          timeline: [...(currentData.timeline || []), timelineEntry]
        }

        await supabase
          .from('engagements')
          .update({ negotiation_data: updatedData })
          .eq('id', engagementId)
      }

      toast.success('Follow-up scheduled')
      await refresh()
    } catch (err: any) {
      console.error('Error setting follow-up:', err)
      setError(err)
      toast.error(`Failed to set follow-up: ${err.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [supabase, engagementId, engagement])

  // Refresh engagement data
  const refresh = useCallback(async () => {
    setIsUpdating(true)
    setError(null)
    
    try {
      await fetchEngagement()
    } catch (err) {
      toast.error('Failed to refresh negotiation data')
    } finally {
      setIsUpdating(false)
    }
  }, [fetchEngagement])

  return {
    engagement,
    isLoading,
    isUpdating,
    error,
    addCommunication,
    addOffer,
    updateStatus,
    setFollowUp,
    refresh
  }
}