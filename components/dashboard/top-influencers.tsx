'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatFollowerCount } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'

interface Influencer {
  id: string
  name: string
  instagram_followers: number | null
  tiktok_followers: number | null
  youtube_subscribers: number | null
  status: string | null
}

export default function TopInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchTopInfluencers = async () => {
      const { data } = await supabase
        .from('influencers')
        .select('id, name, instagram_followers, tiktok_followers, youtube_subscribers, status')
        .eq('status', 'active')
        .order('instagram_followers', { ascending: false, nullsFirst: false })
        .limit(5)
      
      if (data) {
        setInfluencers(data)
      }
    }

    fetchTopInfluencers()
  }, [])

  const getTotalFollowers = (influencer: Influencer) => {
    return (
      (influencer.instagram_followers || 0) +
      (influencer.tiktok_followers || 0) +
      (influencer.youtube_subscribers || 0)
    )
  }

  if (influencers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active influencers yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {influencers.map((influencer, index) => (
        <div key={influencer.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{influencer.name}</p>
              <p className="text-xs text-gray-500">
                {formatFollowerCount(getTotalFollowers(influencer))} total followers
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {influencer.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}