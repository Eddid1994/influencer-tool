'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useCallback } from 'react'

export default function InfluencerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.set('page', '1') // Reset to first page when filtering
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (value: string) => {
    router.push(`?${createQueryString('search', value)}`)
  }

  const handleStatusFilter = (value: string) => {
    router.push(`?${createQueryString('status', value)}`)
  }

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, email, or handle..."
          className="pl-9"
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => {
            if (e.target.value === '') {
              handleSearch('')
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e.currentTarget.value)
            }
          }}
        />
      </div>
      
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="negotiating">Negotiating</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}