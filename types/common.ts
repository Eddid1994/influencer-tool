/**
 * Common type definitions used across the application
 * This file helps avoid using 'any' types
 */

import { Database } from './database'

// Database row types
export type Influencer = Database['public']['Tables']['influencers']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Engagement = Database['public']['Tables']['engagements']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Deliverable = Database['public']['Tables']['deliverables']['Row']
export type EngagementTask = Database['public']['Tables']['engagement_tasks']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']

// Form data types
export type FormData<T> = Partial<T>

// Supabase error type
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// Performance metrics types
export interface PerformanceMetrics {
  totalRevenue: number
  totalCampaigns: number
  averageTKP: number
  totalReach: number
}

// Brand collaboration history
export interface BrandCollaboration {
  brand_id: string
  brand_name: string
  campaign_count: number
  total_revenue: number
  last_campaign_date: string
}

// Influencer performance
export interface InfluencerPerformance {
  influencer_id: string
  influencer_name: string
  total_campaigns: number
  total_revenue: number
  average_tkp: number
  total_reach: number
}

// Email template data
export interface EmailTemplateData {
  influencerName: string
  campaignName: string
  brandName: string
  proposedAmount: number
  deliverables: string
  timeline: string
  [key: string]: string | number
}

// Negotiation timeline event
export interface TimelineEvent {
  date: string
  type: 'offer' | 'communication' | 'status_change'
  title: string
  description: string
  amount?: number
}

// Engagement with relations
export interface EngagementWithRelations extends Engagement {
  influencer?: Influencer
  brand?: Brand
  deliverables?: Deliverable[]
  tasks?: EngagementTask[]
  invoices?: Invoice[]
}

// Generic response type for Supabase queries
export type SupabaseResponse<T> = {
  data: T | null
  error: SupabaseError | null
}

// Pagination params
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Filter params
export interface FilterParams {
  search?: string
  status?: string
  brandId?: string
  influencerId?: string
  dateFrom?: string
  dateTo?: string
}