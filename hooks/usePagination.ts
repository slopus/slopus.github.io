import { useState, useMemo, useEffect } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  pageSize: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  paginatedItems: T[]
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export function usePagination<T>({ 
  items, 
  pageSize 
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)

  // Reset to page 1 when items or pageSize changes
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length, pageSize])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, pageSize])

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
    canGoNext,
    canGoPrevious
  }
}