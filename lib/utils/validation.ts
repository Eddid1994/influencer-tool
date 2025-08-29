import { z } from 'zod'

// Negotiation validation schemas
export const negotiationOfferSchema = z.object({
  negotiation_id: z.string().uuid('Invalid negotiation ID'),
  offer_type: z.enum(['initial', 'counter', 'final']),
  offered_by: z.enum(['brand', 'influencer']),
  amount_cents: z.number()
    .int('Amount must be a whole number in cents')
    .positive('Amount must be positive')
    .max(100000000, 'Amount exceeds maximum limit'), // Max $1,000,000
  currency: z.string().default('USD'),
  terms: z.object({
    deliverables: z.array(z.string()).optional(),
    payment_terms: z.string().optional(),
  }).nullable().optional(),
  notes: z.string().max(1000, 'Notes too long').nullable().optional(),
  created_by: z.string().uuid('Invalid user ID').optional(),
})

export const negotiationCommunicationSchema = z.object({
  negotiation_id: z.string().uuid('Invalid negotiation ID'),
  communication_type: z.enum(['email', 'phone', 'message']),
  direction: z.enum(['inbound', 'outbound']),
  subject: z.string().max(200, 'Subject too long').nullable().optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content too long'),
  created_by: z.string().uuid('Invalid user ID').optional(),
})

export const negotiationTaskSchema = z.object({
  negotiation_id: z.string().uuid('Invalid negotiation ID'),
  type: z.enum(['follow_up', 'internal_review', 'send_offer', 'send_contract']),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').nullable().optional(),
  due_at: z.string().datetime('Invalid date format'),
  assignee_id: z.string().uuid('Invalid assignee ID'),
  created_by: z.string().uuid('Invalid user ID').optional(),
})

export const negotiationStatusSchema = z.enum([
  'pending_outreach',
  'outreach_sent',
  'awaiting_response',
  'negotiating',
  'agreed',
  'declined',
  'on_hold'
])

// Helper function to validate and format currency amounts
export function validateAndFormatAmount(amount: string | number): number | null {
  try {
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(parsed) || parsed < 0) return null
    // Convert to cents and round to avoid floating point issues
    return Math.round(parsed * 100)
  } catch {
    return null
  }
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate phone number (basic)
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's a valid length (10-15 digits internationally)
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Helper to sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}