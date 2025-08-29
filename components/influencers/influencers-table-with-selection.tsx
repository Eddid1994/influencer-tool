'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  TrendingUp, 
  MessageSquare,
  Users,
  Handshake
} from 'lucide-react'
import { formatFollowerCount, formatCurrency } from '@/lib/utils/formatters'
import { Database } from '@/types/database'
import { SlidingPanel } from '@/components/ui/sliding-panel'
import { PerformancePanel } from '@/components/influencers/performance-panel'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type Influencer = Database['public']['Tables']['influencers']['Row'] & {
  negotiationCount?: {
    active: number
    total: number
  }
  totalSpent?: number
  totalRevenue?: number
  roas?: number
}

interface InfluencersTableProps {
  influencers: Influencer[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export default function InfluencersTableWithSelection({
  influencers,
  totalCount,
  currentPage,
  pageSize,
}: InfluencersTableProps) {
  const router = useRouter()
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(new Set())
  const [isProcessing] = useState(false)
  const totalPages = Math.ceil(totalCount / pageSize)

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new':
        return 'default'
      case 'contacted':
        return 'secondary'
      case 'negotiating':
        return 'outline'
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getTotalFollowers = (influencer: Influencer) => {
    return (
      (influencer.instagram_followers || 0) +
      (influencer.tiktok_followers || 0) +
      (influencer.youtube_subscribers || 0)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInfluencers(new Set(influencers.map(i => i.id)))
    } else {
      setSelectedInfluencers(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedInfluencers)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedInfluencers(newSet)
  }

  const handleCreateCampaigns = () => {
    if (selectedInfluencers.size === 0) {
      toast.error('Please select at least one influencer')
      return
    }

    // Store selected influencer IDs in sessionStorage for the bulk create page
    sessionStorage.setItem('selectedInfluencerIds', JSON.stringify(Array.from(selectedInfluencers)))
    
    // Navigate to bulk campaign creation with pre-selected influencers
    router.push('/campaigns/bulk-create?preselected=true')
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedInfluencers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default">{selectedInfluencers.size} selected</Badge>
            <span className="text-sm text-gray-600">
              Select influencers to create campaigns in bulk
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedInfluencers(new Set())}
            >
              Clear Selection
            </Button>
            <Button
              size="sm"
              onClick={handleCreateCampaigns}
              disabled={isProcessing}
            >
              <Users className="h-4 w-4 mr-2" />
              Create Campaigns
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedInfluencers.size === influencers.length && influencers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Total Followers</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No influencers found
                </TableCell>
              </TableRow>
            ) : (
              influencers.map((influencer) => (
                <TableRow 
                  key={influencer.id}
                  className={selectedInfluencers.has(influencer.id) ? 'bg-blue-50/50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedInfluencers.has(influencer.id)}
                      onCheckedChange={(checked) => handleSelectOne(influencer.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{influencer.name}</span>
                        {influencer.negotiationCount && influencer.negotiationCount.active > 0 && (
                          <Badge variant="default" className="text-xs">
                            <Handshake className="h-3 w-3 mr-1" />
                            {influencer.negotiationCount.active} active
                          </Badge>
                        )}
                      </div>
                      {influencer.email && (
                        <div className="text-sm text-gray-500">{influencer.email}</div>
                      )}
                      {influencer.negotiationCount && influencer.negotiationCount.total > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {influencer.negotiationCount.total} total negotiations
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {influencer.instagram_handle && (
                        <Badge variant="outline" className="text-xs">
                          IG: {formatFollowerCount(influencer.instagram_followers || 0)}
                        </Badge>
                      )}
                      {influencer.tiktok_handle && (
                        <Badge variant="outline" className="text-xs">
                          TT: {formatFollowerCount(influencer.tiktok_followers || 0)}
                        </Badge>
                      )}
                      {influencer.youtube_handle && (
                        <Badge variant="outline" className="text-xs">
                          YT: {formatFollowerCount(influencer.youtube_subscribers || 0)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatFollowerCount(getTotalFollowers(influencer))}
                  </TableCell>
                  <TableCell>
                    <div className={influencer.totalSpent && influencer.totalSpent > 0 ? 'font-medium' : 'text-gray-400'}>
                      {influencer.totalSpent && influencer.totalSpent > 0 
                        ? formatCurrency(influencer.totalSpent / 100)
                        : '-'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={influencer.totalRevenue && influencer.totalRevenue > 0 ? 'font-medium text-green-600' : 'text-gray-400'}>
                      {influencer.totalRevenue && influencer.totalRevenue > 0
                        ? formatCurrency(influencer.totalRevenue / 100)
                        : '-'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={
                      !influencer.roas || influencer.roas === 0 ? 'text-gray-400' :
                      influencer.roas >= 2 ? 'font-bold text-green-600' :
                      influencer.roas >= 1 ? 'font-medium text-blue-600' :
                      'font-medium text-red-600'
                    }>
                      {influencer.roas && influencer.roas > 0
                        ? `${influencer.roas.toFixed(2)}x`
                        : '-'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(influencer.status)}>
                      {influencer.status || 'new'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {influencer.niche?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {influencer.niche && influencer.niche.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{influencer.niche.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/influencers/${influencer.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/influencers/${influencer.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedInfluencer(influencer)
                            setIsPanelOpen(true)
                          }}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            handleSelectOne(influencer.id, true)
                            // TODO: Implement negotiation start
                            toast.info('Negotiation feature coming soon')
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Start Negotiation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${currentPage - 1}`)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${currentPage + 1}`)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Sliding Performance Panel */}
      <SlidingPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
          setSelectedInfluencer(null)
        }}
        title={`${selectedInfluencer?.name || 'Influencer'} Performance`}
        width="lg"
      >
        {selectedInfluencer && (
          <PerformancePanel
            influencerId={selectedInfluencer.id}
            influencerName={selectedInfluencer.name}
          />
        )}
      </SlidingPanel>
    </div>
  )
}