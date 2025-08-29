'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageNumbers: number[]
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  pageNumbers,
  className
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => (
          page === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  className?: string
}

export function PaginationInfo({
  startIndex,
  endIndex,
  totalItems,
  className
}: PaginationInfoProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      Showing {startIndex + 1} to {endIndex} of {totalItems} results
    </p>
  )
}