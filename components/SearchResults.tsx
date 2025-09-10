import { ToolCategory } from '@/utils/search-core'
import { DevResource } from '../types/dev-resource'

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
  console.log("SearchResults: Rendering with", { 
    resultsLength: results.length, 
    isLoading, 
    error, 
    searchQuery, 
    categoryFilter,
    searchQueryTrimmed: searchQuery.trim()
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

      <div className="grid gap-4">
        {results.map((result, index) => (
          <SearchResultCard key={`${result.item.type}-${result.item.name}-${index}`} result={result} />
        ))}
      </div>
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
