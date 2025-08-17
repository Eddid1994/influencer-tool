'use client'

import { useState } from 'react'
import { X, Search, Check, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatFollowerCount } from '@/lib/utils/formatters'

interface InfluencerSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (influencerIds: string[]) => void
  allInfluencers: any[]
  existingParticipants: any[]
}

export default function InfluencerSelector({
  isOpen,
  onClose,
  onSelect,
  allInfluencers,
  existingParticipants
}: InfluencerSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  if (!isOpen) return null

  // Filter out already added influencers
  const existingIds = existingParticipants.map(p => p.influencer_id)
  const availableInfluencers = allInfluencers.filter(i => !existingIds.includes(i.id))
  
  // Apply search filter
  const filteredInfluencers = availableInfluencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredInfluencers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredInfluencers.map(i => i.id))
    }
  }

  const handleAdd = () => {
    if (selectedIds.length > 0) {
      onSelect(selectedIds)
      setSelectedIds([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Add Influencers to Workflow</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select influencers to add to your campaign workflow
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search influencers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.length === filteredInfluencers.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredInfluencers.length} available influencers
            </span>
          </div>
        </div>

        {/* Influencer List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredInfluencers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm ? 'No influencers found matching your search' : 'No available influencers'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInfluencers.map(influencer => (
                <div
                  key={influencer.id}
                  className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer ${
                    selectedIds.includes(influencer.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleToggle(influencer.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.includes(influencer.id)}
                      onCheckedChange={() => handleToggle(influencer.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="font-medium">{influencer.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {influencer.instagram_handle && (
                          <span>{influencer.instagram_handle}</span>
                        )}
                        {influencer.instagram_followers && (
                          <span>• {formatFollowerCount(influencer.instagram_followers)} followers</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={influencer.status === 'active' ? 'default' : 'secondary'}>
                    {influencer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
          >
            Add {selectedIds.length} Influencer{selectedIds.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}