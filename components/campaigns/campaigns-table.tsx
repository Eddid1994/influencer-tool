'use client'

import Link from 'next/link'
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
import { Edit, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { NegotiationStatusBadge, type NegotiationStatus } from '@/components/negotiations/negotiation-status-badge'

interface Campaign {
  id: string
  campaign_name: string
  status: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  actual_cost: number | null
  target_views: number | null
  actual_views: number | null
  tkp: number | null
  brands: { name: string } | null
  influencers: { name: string; instagram_handle: string | null } | null
  campaign_negotiations?: {
    status: NegotiationStatus
    last_contact_date: string | null
  }[]
}

interface CampaignsTableProps {
  campaigns: Campaign[]
}

export default function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'planned':
        return 'secondary'
      case 'active':
        return 'default'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Influencer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Negotiation</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>TKP</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  {campaign.campaign_name}
                </TableCell>
                <TableCell>
                  {campaign.brands?.name || '-'}
                </TableCell>
                <TableCell>
                  <div>
                    <div>{campaign.influencers?.name || '-'}</div>
                    {campaign.influencers?.instagram_handle && (
                      <div className="text-xs text-gray-500">
                        {campaign.influencers.instagram_handle}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status || 'planned'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <NegotiationStatusBadge 
                    status={campaign.campaign_negotiations?.[0]?.status || null}
                    size="sm"
                    showIcon={false}
                  />
                </TableCell>
                <TableCell>
                  {campaign.start_date && campaign.end_date ? (
                    <div className="text-sm">
                      <div>{formatDate(campaign.start_date)}</div>
                      <div className="text-gray-500">to {formatDate(campaign.end_date)}</div>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {campaign.budget ? (
                    <div>
                      <div>{formatCurrency(campaign.budget)}</div>
                      {campaign.actual_cost && (
                        <div className="text-xs text-gray-500">
                          Actual: {formatCurrency(campaign.actual_cost)}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {campaign.tkp ? formatCurrency(campaign.tkp) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/campaigns/${campaign.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}