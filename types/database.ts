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