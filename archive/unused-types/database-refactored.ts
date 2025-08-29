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
      brand_contacts: {
        Row: {
          id: string
          brand_id: string
          name: string
          email: string | null
          phone: string | null
          position: string | null
          is_primary: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          email?: string | null
          phone?: string | null
          position?: string | null
          is_primary?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          position?: string | null
          is_primary?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      engagements: {
        Row: {
          id: string
          brand_id: string
          influencer_id: string
          brand_contact_id: string | null
          period_label: string
          period_year: number
          period_month: number
          opened_at: string
          closed_at: string | null
          status: 'negotiating' | 'agreed' | 'active' | 'completed' | 'cancelled' | 'paused'
          agreed_total_cents: number | null
          agreed_currency: string | null
          payment_terms: string | null
          contract_status: 'draft' | 'sent' | 'signed' | 'expired' | null
          contract_signed_at: string | null
          contract_url: string | null
          notes: string | null
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
          // New fields from campaign migration
          campaign_name: string | null
          budget_cents: number | null
          target_views: number | null
          actual_views: number | null
          tkp_cents: number | null
          migrated_from_campaign_id: string | null
        }
        Insert: {
          id?: string
          brand_id: string
          influencer_id: string
          brand_contact_id?: string | null
          period_label: string
          period_year: number
          period_month: number
          opened_at?: string
          closed_at?: string | null
          status?: 'negotiating' | 'agreed' | 'active' | 'completed' | 'cancelled' | 'paused'
          agreed_total_cents?: number | null
          agreed_currency?: string | null
          payment_terms?: string | null
          contract_status?: 'draft' | 'sent' | 'signed' | 'expired' | null
          contract_signed_at?: string | null
          contract_url?: string | null
          notes?: string | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          campaign_name?: string | null
          budget_cents?: number | null
          target_views?: number | null
          actual_views?: number | null
          tkp_cents?: number | null
          migrated_from_campaign_id?: string | null
        }
        Update: {
          id?: string
          brand_id?: string
          influencer_id?: string
          brand_contact_id?: string | null
          period_label?: string
          period_year?: number
          period_month?: number
          opened_at?: string
          closed_at?: string | null
          status?: 'negotiating' | 'agreed' | 'active' | 'completed' | 'cancelled' | 'paused'
          agreed_total_cents?: number | null
          agreed_currency?: string | null
          payment_terms?: string | null
          contract_status?: 'draft' | 'sent' | 'signed' | 'expired' | null
          contract_signed_at?: string | null
          contract_url?: string | null
          notes?: string | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          campaign_name?: string | null
          budget_cents?: number | null
          target_views?: number | null
          actual_views?: number | null
          tkp_cents?: number | null
          migrated_from_campaign_id?: string | null
        }
      }
      deliverables: {
        Row: {
          id: string
          engagement_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          deliverable: 'story' | 'post' | 'reel' | 'video' | 'live' | 'carousel' | 'igtv' | 'shorts'
          quantity: number | null
          planned_publish_at: string | null
          actual_publish_at: string | null
          content_url: string | null
          briefing_sent: boolean | null
          briefing_sent_at: string | null
          content_submitted: boolean | null
          content_submitted_at: string | null
          content_approved: boolean | null
          content_approved_at: string | null
          content_approved_by: string | null
          product_sent: boolean | null
          product_sent_at: string | null
          promoted_product: string | null
          tracking_link: string | null
          coupon_code_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          deliverable: 'story' | 'post' | 'reel' | 'video' | 'live' | 'carousel' | 'igtv' | 'shorts'
          quantity?: number | null
          planned_publish_at?: string | null
          actual_publish_at?: string | null
          content_url?: string | null
          briefing_sent?: boolean | null
          briefing_sent_at?: string | null
          content_submitted?: boolean | null
          content_submitted_at?: string | null
          content_approved?: boolean | null
          content_approved_at?: string | null
          content_approved_by?: string | null
          product_sent?: boolean | null
          product_sent_at?: string | null
          promoted_product?: string | null
          tracking_link?: string | null
          coupon_code_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          deliverable?: 'story' | 'post' | 'reel' | 'video' | 'live' | 'carousel' | 'igtv' | 'shorts'
          quantity?: number | null
          planned_publish_at?: string | null
          actual_publish_at?: string | null
          content_url?: string | null
          briefing_sent?: boolean | null
          briefing_sent_at?: string | null
          content_submitted?: boolean | null
          content_submitted_at?: string | null
          content_approved?: boolean | null
          content_approved_at?: string | null
          content_approved_by?: string | null
          product_sent?: boolean | null
          product_sent_at?: string | null
          promoted_product?: string | null
          tracking_link?: string | null
          coupon_code_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      engagement_tasks: {
        Row: {
          id: string
          engagement_id: string
          type: 'followup' | 'reminder' | 'content_review' | 'payment' | 'product_shipment'
          title: string
          description: string | null
          due_at: string
          completed_at: string | null
          completed_by: string | null
          assignee_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          type: 'followup' | 'reminder' | 'content_review' | 'payment' | 'product_shipment'
          title: string
          description?: string | null
          due_at: string
          completed_at?: string | null
          completed_by?: string | null
          assignee_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          type?: 'followup' | 'reminder' | 'content_review' | 'payment' | 'product_shipment'
          title?: string
          description?: string | null
          due_at?: string
          completed_at?: string | null
          completed_by?: string | null
          assignee_id?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          engagement_id: string
          number: string | null
          amount_cents: number
          total_cents: number
          currency: string
          issued_at: string | null
          sent_at: string | null
          paid_at: string | null
          due_at: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          number?: string | null
          amount_cents: number
          total_cents?: number
          currency?: string
          issued_at?: string | null
          sent_at?: string | null
          paid_at?: string | null
          due_at?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          number?: string | null
          amount_cents?: number
          total_cents?: number
          currency?: string
          issued_at?: string | null
          sent_at?: string | null
          paid_at?: string | null
          due_at?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_accounts: {
        Row: {
          id: string
          influencer_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          handle: string
          profile_url: string | null
          is_verified: boolean | null
          is_primary: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          handle: string
          profile_url?: string | null
          is_verified?: boolean | null
          is_primary?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
          handle?: string
          profile_url?: string | null
          is_verified?: boolean | null
          is_primary?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_account_stats: {
        Row: {
          id: string
          account_id: string
          snapshot_at: string
          followers: number | null
          following: number | null
          posts_count: number | null
          engagement_rate: number | null
          avg_likes: number | null
          avg_comments: number | null
          avg_views: number | null
          follower_growth: number | null
          audience_country: Json | null
          audience_gender: Json | null
          audience_age: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          snapshot_at?: string
          followers?: number | null
          following?: number | null
          posts_count?: number | null
          engagement_rate?: number | null
          avg_likes?: number | null
          avg_comments?: number | null
          avg_views?: number | null
          follower_growth?: number | null
          audience_country?: Json | null
          audience_gender?: Json | null
          audience_age?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          snapshot_at?: string
          followers?: number | null
          following?: number | null
          posts_count?: number | null
          engagement_rate?: number | null
          avg_likes?: number | null
          avg_comments?: number | null
          avg_views?: number | null
          follower_growth?: number | null
          audience_country?: Json | null
          audience_gender?: Json | null
          audience_age?: Json | null
          created_at?: string
        }
      }
      deliverable_metrics: {
        Row: {
          id: string
          deliverable_id: string
          measured_at: string
          views: number | null
          likes: number | null
          comments: number | null
          shares: number | null
          saves: number | null
          clicks: number | null
          engagement_rate: number | null
          revenue_cents: number | null
          conversions: number | null
          is_final: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          deliverable_id: string
          measured_at?: string
          views?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          saves?: number | null
          clicks?: number | null
          engagement_rate?: number | null
          revenue_cents?: number | null
          conversions?: number | null
          is_final?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          deliverable_id?: string
          measured_at?: string
          views?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          saves?: number | null
          clicks?: number | null
          engagement_rate?: number | null
          revenue_cents?: number | null
          conversions?: number | null
          is_final?: boolean | null
          created_at?: string
        }
      }
      coupon_codes: {
        Row: {
          id: string
          code: string
          brand_id: string | null
          description: string | null
          discount_type: 'percentage' | 'fixed' | 'free_shipping' | null
          discount_value: number | null
          valid_from: string | null
          valid_until: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          brand_id?: string | null
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'free_shipping' | null
          discount_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          brand_id?: string | null
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'free_shipping' | null
          discount_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      engagement_files: {
        Row: {
          id: string
          engagement_id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          engagement_id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          engagement_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_url?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
      }
      engagement_payments: {
        Row: {
          id: string
          engagement_id: string
          invoice_id: string | null
          amount_cents: number
          currency: string
          payment_date: string
          payment_method: string | null
          transaction_reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          invoice_id?: string | null
          amount_cents: number
          currency?: string
          payment_date: string
          payment_method?: string | null
          transaction_reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          invoice_id?: string | null
          amount_cents?: number
          currency?: string
          payment_date?: string
          payment_method?: string | null
          transaction_reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      deliverable_metrics_final: {
        Row: {
          deliverable_id: string
          measured_at: string
          views: number | null
          likes: number | null
          comments: number | null
          shares: number | null
          saves: number | null
          clicks: number | null
          engagement_rate: number | null
          revenue_cents: number | null
          conversions: number | null
        }
      }
      v_influencer_performance: {
        Row: {
          influencer_id: string
          influencer_name: string
          total_engagements: number
          brands_worked_with: number
          total_earnings: number
          avg_views: number | null
          avg_engagement_rate: number | null
          last_engagement_date: string | null
        }
      }
      v_brand_collaboration_history: {
        Row: {
          brand_id: string
          brand_name: string
          total_campaigns: number
          influencers_worked_with: number
          total_spent: number
          avg_campaign_views: number | null
          avg_roas: number | null
          last_campaign_date: string | null
        }
      }
      v_monthly_grid: {
        Row: {
          monat: string
          brand: string
          engagement_id: string
          ansprechpartner: string | null
          instagram_name: string | null
          status: string
          channel: string | null
          format: string | null
          story_datum: string | null
          reminder: string | null
          kooperationsstatus: string
          beworbenes_produkt: string | null
          followeranzahl: number | null
          engagement_rate: number | null
          follower_growth: number | null
          tkp: number | null
          durchschnittliche_storyviews: number | null
          real_views: number | null
          prozent_abweichung: number | null
          linkklicks: number | null
          laenderverteilung: Json | null
          geschlechterverteilung: Json | null
          vertrag_ja_nein: boolean | null
          niche: string[] | null
          spend: number | null
          umsatz: number | null
          roas: number | null
          code: string | null
          link: string | null
          produkt_versendet: boolean | null
          briefing_versendet: boolean | null
          content_freigegeben: boolean | null
          rechnung_verschickt: boolean | null
          rechnungsnummer: string | null
        }
      }
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