'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash, Eye, TrendingUp, MessageSquare } from 'lucide-react'
import { formatFollowerCount } from '@/lib/utils/formatters'
import { Database } from '@/types/database'
import { SlidingPanel } from '@/components/ui/sliding-panel'
import { PerformancePanel } from '@/components/influencers/performance-panel'

type Influencer = Database['public']['Tables']['influencers']['Row']

interface InfluencersTableProps {
  influencers: Influencer[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export default function InfluencersTable({
  influencers,
  totalCount,
  currentPage,
  pageSize,
}: InfluencersTableProps) {
  const router = useRouter()
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Total Followers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No influencers found
                </TableCell>
              </TableRow>
            ) : (
              influencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{influencer.name}</div>
                      {influencer.email && (
                        <div className="text-sm text-gray-500">{influencer.email}</div>
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
                          onClick={() => router.push(`/influencers/${influencer.id}/negotiate`)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Negotiate
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