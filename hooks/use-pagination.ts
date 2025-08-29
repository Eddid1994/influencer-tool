import { useState, useMemo, useCallback } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  paginatedItems: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageNumbers: number[]
}

/**
 * Custom hook for handling pagination logic
 */
export function usePagination<T>(
  items: T[],
  { itemsPerPage = 10, initialPage = 1 }: Partial<UsePaginationProps> = {}
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  // Get paginated items
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // Generate page numbers for pagination controls
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push(-1) // Ellipsis marker
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push(-1)
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push(-1)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push(-1)
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [currentPage, totalPages])

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    pageNumbers
  }
}