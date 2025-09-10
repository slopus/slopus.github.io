import { ToolCategory } from '@/utils/search-core'
import { DevResource } from '../types/dev-resource'
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize'
import { usePagination } from '@/hooks/usePagination'

interface SearchResult {
  item: DevResource
  score?: number
  matches?: readonly any[]
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  categoryFilter: ToolCategory[]
}

export function SearchResults({ 
  results, 
  isLoading, 
  error, 
  searchQuery, 
  categoryFilter,
}: SearchResultsProps) {
  const pageSize = useResponsivePageSize()
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
    canGoNext,
    canGoPrevious
  } = usePagination({ items: results, pageSize })

  console.log("SearchResults: Rendering with", { 
    resultsLength: results.length, 
    isLoading, 
    error, 
    searchQuery, 
    categoryFilter,
    searchQueryTrimmed: searchQuery.trim(),
    currentPage,
    totalPages,
    pageSize
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading resources...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading resources
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Always show the actual results - this is a directory site, not a search engine!

  if (results.length === 0) {
    const hasCategoryFilter = categoryFilter.length > 0
    const categoryText = hasCategoryFilter 
      ? categoryFilter.length === 1 
        ? categoryFilter[0] 
        : categoryFilter.join(', ')
      : ''
    
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">No results found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No resources found for "{searchQuery}"{hasCategoryFilter ? ` in ${categoryText}` : ''}.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Try adjusting your search terms or browse all resources.
        </p>
      </div>
    )
  }

  const hasCategoryFilter = categoryFilter.length > 0
  const categoryText = hasCategoryFilter 
    ? categoryFilter.length === 1 
      ? categoryFilter[0] 
      : categoryFilter.join(', ')
    : ''

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {searchQuery.trim() ? (
            // When there's a search query, show "X results for 'query'"
            <>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
              {hasCategoryFilter && ` in ${categoryText}`}
            </>
          ) : (
            // When there's no search query but category filters, show "X CategoryName Resources"
            <>
              {results.length} {categoryText} Resource{results.length !== 1 ? 's' : ''}
            </>
          )}
        </h2>
        {results.length > 0 && searchQuery.trim() && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Score: {results[0].score ? (1 - results[0].score).toFixed(2) : 'N/A'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedItems.map((result, index) => (
          <SearchResultCard key={`${result.item.type}-${result.item.name}-${index}`} result={result} />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={previousPage}
          onNext={nextPage}
          onGoToPage={goToPage}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          totalItems={results.length}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const { item } = result
  const isTemplate = item.type === 'template'
  const templateItem = isTemplate ? item as any : null

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {item.type}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {item.category}
            </span>
            {isTemplate && templateItem?.subtype && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {templateItem.subtype}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {item.name}
          </h3>
          
          {item.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {item.description}
            </p>
          )}
          
          {isTemplate && templateItem?.installCommand && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {templateItem.installCommand}
              </code>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {'path' in item && <span>Path: {item.path}</span>}
            {isTemplate && templateItem?.files && (
              <span className={`${'path' in item ? 'ml-4' : ''}`}>
                {templateItem.files.length} file{templateItem.files.length !== 1 ? 's' : ''}
              </span>
            )}
            {isTemplate && templateItem?.id && !('path' in item) && (
              <span>ID: {templateItem.id}</span>
            )}
          </div>
        </div>
        
        {result.score && (
          <div className="ml-4 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Match: {((1 - result.score) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onGoToPage: (page: number) => void
  canGoNext: boolean
  canGoPrevious: boolean
  totalItems: number
  pageSize: number
}

function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onGoToPage,
  canGoNext,
  canGoPrevious,
  totalItems,
  pageSize
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )
            }

            const pageNumber = page as number
            const isCurrentPage = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => onGoToPage(pageNumber)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md ${
                  isCurrentPage
                    ? 'text-blue-600 bg-blue-50 border-blue-500 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
