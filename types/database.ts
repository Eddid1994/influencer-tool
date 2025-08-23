export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaign_negotiations: {
        Row: {
          id: string
          campaign_id: string
          status: 'pending_outreach' | 'outreach_sent' | 'awaiting_response' | 'negotiating' | 'agreed' | 'declined' | 'on_hold' | null
          current_stage: string | null
          priority: 'low' | 'medium' | 'high' | null
          last_contact_date: string | null
          final_agreed_amount_cents: number | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          status?: 'pending_outreach' | 'outreach_sent' | 'awaiting_response' | 'negotiating' | 'agreed' | 'declined' | 'on_hold' | null
          current_stage?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          last_contact_date?: string | null
          final_agreed_amount_cents?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          status?: 'pending_outreach' | 'outreach_sent' | 'awaiting_response' | 'negotiating' | 'agreed' | 'declined' | 'on_hold' | null
          current_stage?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          last_contact_date?: string | null
          final_agreed_amount_cents?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      negotiation_offers: {
        Row: {
          id: string
          negotiation_id: string
          offer_type: 'initial' | 'counter' | 'final'
          offered_by: 'brand' | 'influencer'
          amount_cents: number
          currency: string | null
          terms: Json | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          negotiation_id: string
          offer_type: 'initial' | 'counter' | 'final'
          offered_by: 'brand' | 'influencer'
          amount_cents: number
          currency?: string | null
          terms?: Json | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          negotiation_id?: string
          offer_type?: 'initial' | 'counter' | 'final'
          offered_by?: 'brand' | 'influencer'
          amount_cents?: number
          currency?: string | null
          terms?: Json | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      negotiation_communications: {
        Row: {
          id: string
          negotiation_id: string
          communication_type: 'email' | 'phone' | 'message'
          direction: 'inbound' | 'outbound'
          subject: string | null
          content: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          negotiation_id: string
          communication_type: 'email' | 'phone' | 'message'
          direction?: 'inbound' | 'outbound'
          subject?: string | null
          content: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          negotiation_id?: string
          communication_type?: 'email' | 'phone' | 'message'
          direction?: 'inbound' | 'outbound'
          subject?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
        }
      }
      negotiation_tasks: {
        Row: {
          id: string
          negotiation_id: string
          type: 'follow_up' | 'internal_review' | 'send_offer' | 'send_contract'
          title: string
          description: string | null
          due_at: string
          status: 'open' | 'completed'
          assignee_id: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          negotiation_id: string
          type: 'follow_up' | 'internal_review' | 'send_offer' | 'send_contract'
          title: string
          description?: string | null
          due_at: string
          status?: 'open' | 'completed'
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          negotiation_id?: string
          type?: 'follow_up' | 'internal_review' | 'send_offer' | 'send_contract'
          title?: string
          description?: string | null
          due_at?: string
          status?: 'open' | 'completed'
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'viewer' | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'viewer' | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'viewer' | null
          created_at?: string
        }
      }
      influencers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          instagram_handle: string | null
          instagram_followers: number | null
          tiktok_handle: string | null
          tiktok_followers: number | null
          youtube_handle: string | null
          youtube_subscribers: number | null
          niche: string[] | null
          status: 'new' | 'contacted' | 'negotiating' | 'active' | 'inactive' | 'rejected' | null
          assigned_manager: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          instagram_handle?: string | null
          instagram_followers?: number | null
          tiktok_handle?: string | null
          tiktok_followers?: number | null
          youtube_handle?: string | null
          youtube_subscribers?: number | null
          niche?: string[] | null
          status?: 'new' | 'contacted' | 'negotiating' | 'active' | 'inactive' | 'rejected' | null
          assigned_manager?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          instagram_handle?: string | null
          instagram_followers?: number | null
          tiktok_handle?: string | null
          tiktok_followers?: number | null
          youtube_handle?: string | null
          youtube_subscribers?: number | null
          niche?: string[] | null
          status?: 'new' | 'contacted' | 'negotiating' | 'active' | 'inactive' | 'rejected' | null
          assigned_manager?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          industry: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          industry?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          industry?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string | null
          influencer_id: string | null
          campaign_name: string
          status: 'planned' | 'active' | 'completed' | 'cancelled' | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          actual_cost: number | null
          target_views: number | null
          actual_views: number | null
          tkp: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id?: string | null
          influencer_id?: string | null
          campaign_name: string
          status?: 'planned' | 'active' | 'completed' | 'cancelled' | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          actual_cost?: number | null
          target_views?: number | null
          actual_views?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string | null
          influencer_id?: string | null
          campaign_name?: string
          status?: 'planned' | 'active' | 'completed' | 'cancelled' | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          actual_cost?: number | null
          target_views?: number | null
          actual_views?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          influencer_id: string | null
          user_id: string | null
          activity_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          influencer_id?: string | null
          user_id?: string | null
          activity_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string | null
          user_id?: string | null
          activity_type?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}