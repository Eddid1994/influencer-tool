'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function StatusChart() {
  const [data, setData] = useState<{ status: string; count: number }[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: influencers } = await supabase
        .from('influencers')
        .select('status')
      
      if (influencers) {
        const statusCounts = influencers.reduce((acc, curr) => {
          const status = curr.status || 'new'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const chartData = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }))

        setData(chartData)
      }
    }

    fetchData()
  }, [])

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    negotiating: 'bg-orange-500',
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    rejected: 'bg-red-500'
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.status} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize">{item.status}</span>
            <span className="font-medium">{item.count}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${statusColors[item.status] || 'bg-gray-400'}`}
              style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      )}
    </div>
  )
}