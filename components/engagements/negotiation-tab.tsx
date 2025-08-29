'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import SmartTimeline from './smart-timeline'
import { 
  NegotiationData
} from '@/types/negotiation'

interface NegotiationTabProps {
  engagementId: string
  engagement?: any
  onUpdate?: () => void
}

export default function NegotiationTab({ engagementId, engagement, onUpdate }: NegotiationTabProps) {
  // Use smart timeline for all negotiation functionality
  return (
    <SmartTimeline 
      engagementId={engagementId}
      engagement={engagement}
      onUpdate={onUpdate}
    />
  )
}