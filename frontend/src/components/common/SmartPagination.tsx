// src/components/SmartPagination.tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface SmartPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

const SmartPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: SmartPaginationProps) => {
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Always show first page with ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )

      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Show visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} className='cursor-pointer'>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Always show last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pages
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem className='cursor-pointer'>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem className='cursor-pointer'>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default SmartPagination