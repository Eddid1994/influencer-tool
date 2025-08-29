// Negotiation types for the engagement system
// These types define the structure of negotiation data stored in engagements.negotiation_data JSONB field

export type NegotiationStatus = 
  | 'pending_outreach'     // Ready to reach out to influencer
  | 'outreach_sent'        // Initial contact made
  | 'awaiting_response'    // Waiting for influencer response
  | 'negotiating'          // Active back-and-forth negotiations
  | 'agreed'               // Terms agreed, ready for contract
  | 'declined'             // Influencer declined
  | 'on_hold'              // Negotiations paused

export type NegotiationPriority = 'low' | 'medium' | 'high'

export interface NegotiationOffer {
  id: string
  offer_type: 'initial' | 'counter' | 'final'
  offered_by: 'brand' | 'influencer'
  amount_cents: number
  currency: string
  notes?: string
  created_at: string
  created_by?: string
}

export interface NegotiationCommunication {
  id: string
  type: 'email' | 'phone' | 'message' | 'meeting' | 'other'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  created_at: string
  created_by?: string
  // Optional metadata for specific communication types
  metadata?: {
    template_used?: string
    email_opened?: boolean
    email_clicked?: boolean
    response_time_hours?: number
  }
}

export interface NegotiationTimelineEntry {
  id: string
  type: 'status_change' | 'offer' | 'communication' | 'task' | 'note'
  title?: string
  description?: string
  from_status?: NegotiationStatus
  to_status?: NegotiationStatus
  notes?: string
  created_at: string
  created_by?: string
  metadata?: Record<string, any>
}

export interface NegotiationTemplate {
  id: string
  name: string
  type: 'initial_outreach' | 'follow_up' | 'offer_presentation' | 'contract_send'
  subject: string
  body: string
  variables?: string[] // List of variables that can be replaced in the template
}

export interface NegotiationData {
  offers: NegotiationOffer[]
  communications: NegotiationCommunication[]
  timeline: NegotiationTimelineEntry[]
  current_stage: string
  notes: string
  templates_used: string[] // IDs of templates used
  follow_up_count: number
  // Optional structured data for different negotiation approaches
  strategy?: {
    approach: 'direct' | 'relationship' | 'value_focused'
    key_points: string[]
    objections_addressed: string[]
  }
}

// Extended engagement type with negotiation data
export interface EngagementWithNegotiation {
  id: string
  campaign_name?: string
  brand_id: string
  influencer_id: string
  brand_contact_id?: string
  status: string
  negotiation_status: NegotiationStatus
  negotiation_priority: NegotiationPriority
  negotiation_data: NegotiationData
  last_contact_date?: string
  next_follow_up_date?: string
  agreed_total_cents?: number
  agreed_currency?: string
  // Relations
  brand?: { name: string; website?: string }
  influencer?: { name: string; email?: string; instagram_handle?: string }
  brand_contact?: { name: string; email?: string; role?: string }
}

// Negotiation dashboard/summary types
export interface NegotiationSummary {
  id: string
  campaign_name?: string
  brand_name: string
  influencer_name: string
  negotiation_status: NegotiationStatus
  negotiation_priority: NegotiationPriority
  last_contact_date?: string
  next_follow_up_date?: string
  current_stage: string
  offer_count: number
  communication_count: number
  agreed_total_cents?: number
  days_since_contact?: number
  is_overdue?: boolean
}

// Action types for negotiation operations
export type NegotiationAction = 
  | { type: 'ADD_COMMUNICATION'; payload: Omit<NegotiationCommunication, 'id' | 'created_at'> }
  | { type: 'ADD_OFFER'; payload: Omit<NegotiationOffer, 'id' | 'created_at'> }
  | { type: 'UPDATE_STATUS'; payload: { status: NegotiationStatus; notes?: string } }
  | { type: 'SET_FOLLOW_UP'; payload: { date: string; notes?: string } }
  | { type: 'ADD_NOTE'; payload: { content: string } }

// Hook return types
export interface UseNegotiationReturn {
  // State
  engagement: EngagementWithNegotiation | null
  isLoading: boolean
  isUpdating: boolean
  error: Error | null
  
  // Actions
  addCommunication: (communication: Omit<NegotiationCommunication, 'id' | 'created_at'>) => Promise<void>
  addOffer: (offer: Omit<NegotiationOffer, 'id' | 'created_at'>) => Promise<void>
  updateStatus: (status: NegotiationStatus, notes?: string) => Promise<void>
  setFollowUp: (date: string, notes?: string) => Promise<void>
  refresh: () => Promise<void>
}

// Component prop types
export interface NegotiationTabProps {
  engagementId: string
  engagement?: EngagementWithNegotiation
  onUpdate?: () => void
}

export interface NegotiationStatusBadgeProps {
  status: NegotiationStatus
  priority?: NegotiationPriority
  size?: 'sm' | 'md' | 'lg'
}

export interface NegotiationTimelineProps {
  items: NegotiationTimelineEntry[]
  showTypes?: ('status_change' | 'offer' | 'communication' | 'task' | 'note')[]
  limit?: number
}

export interface OutreachTemplateProps {
  engagementId: string
  onSend: (templateId: string, customizations?: Record<string, string>) => void
  templates: NegotiationTemplate[]
}

// Utility types
export type NegotiationStage = 
  | 'initial_contact'
  | 'interest_shown'
  | 'discussing_terms'
  | 'finalizing_details'
  | 'contract_review'
  | 'completed'

export interface NegotiationMetrics {
  total_negotiations: number
  by_status: Record<NegotiationStatus, number>
  by_priority: Record<NegotiationPriority, number>
  average_response_time_hours: number
  conversion_rate: number // percentage of negotiations that result in agreements
  overdue_follow_ups: number
}