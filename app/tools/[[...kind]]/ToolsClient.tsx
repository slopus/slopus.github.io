'use client'

import { useEffect, useRef, useState } from 'react'
import { TierList } from '@/components/TierList'
import { TierListExample } from '@/components/TierListExample'
import { SearchResults } from '@/components/SearchResults'
import { resourceLoader } from '@/utils/resource-loader'
import { SearchQuery, SearchResult, getAvailableCategories } from '@/utils/search-core'
import { DevResource } from '@/types/dev-resource'
import { useSearchQuery } from '@/hooks/useSearchUrlSync'
import { type ToolKind, TOOL_KINDS } from '@/utils/search-core'

/*
* Faceted Search URL Strategy:
 * - SEO Entry Points: Clean URLs like /tools/agents for crawlers and direct links
 * - Interactive State: Once user interacts with ANY facet, switch to /tools?kind=X&q=Y
 * 
 * This gives us:
 * - Clean URLs for SEO (/tools/mcp-servers, /tools/agents)
 * - Faceted search state in query params after interaction (/tools?kind=hooks&q=search)
 * - Kind treated as just another search facet alongside query
 * - Extensible for future facets (tags, license, etc.)
 */




interface ToolsClientProps {
  initialKindFilter: ToolKind[]
  availableCategories: string[]
  searchResults: SearchResult[]
  totalCount: number
}

export default function ToolsClient({ 
  initialKindFilter,
  availableCategories,
  searchResults,
  totalCount
}: ToolsClientProps) {
  // Client-side state
  const [allResources, setAllResources] = useState<DevResource[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>(searchResults)
  const [mounted, setMounted] = useState(false)
  const [currentAvailableCategories, setCurrentAvailableCategories] = useState<string[]>(availableCategories)

  // URL-synced search query state
  const [query, setQuery] = useSearchQuery({
    text: '',
    kindFilter: initialKindFilter,
    categoryFilter: [],
    limit: undefined
  })

  // Debounced search execution (separate concern from URL sync)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  useEffect(() => {
    if (!resourceLoader.isSearchReady()) return

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce search execution by 300ms
    debounceTimeoutRef.current = setTimeout(() => {
      const newResults = resourceLoader.search(query)
      setResults(newResults)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query])
  
  // Load resources lazily on client
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const loadResources = async () => {
      if (allResources || isLoading) return
      
      try {
        setIsLoading(true)
        setError(null)
        const resources = await resourceLoader.loadResources()
        setAllResources(resources)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resources')
      } finally {
        setIsLoading(false)
      }
    }
    
    // Load immediately if user has searched, otherwise after 3 seconds
    if (query.text.trim() || query.kindFilter.length !== initialKindFilter.length || query.categoryFilter.length > 0) {
      loadResources()
    } else {
      timeoutId = setTimeout(loadResources, 3000)
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [allResources, isLoading, query ])
  
  // Perform immediate search when resources become available (no debouncing for resource loading)
  useEffect(() => {
    if (!resourceLoader.isSearchReady()) return
    const newResults = resourceLoader.search(query)
    setResults(newResults)
  }, [allResources]) // Only trigger when resources become available
  
  // Update available categories when kind filter or resources change
  useEffect(() => {
    if (!allResources) {
      // Use server-provided categories when client resources aren't loaded yet
      setCurrentAvailableCategories(availableCategories)
      return
    }
    
    // Dynamically calculate available categories based on current kind filter
    const newAvailableCategories = getAvailableCategories(allResources, query.kindFilter)
    setCurrentAvailableCategories(newAvailableCategories)
    
    // Clear category filter if selected categories are no longer available
    if (query.categoryFilter.length > 0) {
      const validCategories = query.categoryFilter.filter(cat => 
        newAvailableCategories.includes(cat)
      )
      if (validCategories.length !== query.categoryFilter.length) {
        setQuery(prev => ({ ...prev, categoryFilter: validCategories }))
      }
    }
  }, [query.kindFilter, allResources, availableCategories])
  
  const kindDisplayNames: Record<ToolKind, string> = {
    'mcp': 'MCP Servers',
    'agent': 'Agents',
    'command': 'Commands',
    'setting': 'Settings', 
    'hook': 'Hooks',
    'template': 'Templates'
  }

  // Simple mount tracker
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle kind changes
  const handleKindChange = (kind: ToolKind | null, isShiftClick = false) => {
    let newSelectedKinds: ToolKind[]
    const currentKinds = query.kindFilter
    
    if (kind === null) {
      // "All" button clicked - clear all selections
      newSelectedKinds = []
    } else if (isShiftClick) {
      // Shift+click: toggle the kind in the selection
      if (currentKinds.includes(kind)) {
        newSelectedKinds = currentKinds.filter(c => c !== kind)
      } else {
        newSelectedKinds = [...currentKinds, kind]
      }
    } else {
      // Regular click: select only this kind
      newSelectedKinds = [kind]
    }
    
    // Update query state - URL sync happens automatically
    setQuery(prev => ({ ...prev, kindFilter: newSelectedKinds }))
  }

  // Handle search text changes
  const handleSearchChange = (text: string) => {
    // Update query state - URL sync happens automatically
    setQuery(prev => ({ ...prev, text }))
  }

  // Handle category changes
  const handleCategoryChange = (category: string | null, isShiftClick = false) => {
    let newSelectedCategories: string[]
    const currentCategories = query.categoryFilter
    
    if (category === null) {
      // "All" button clicked - clear all selections
      newSelectedCategories = []
    } else if (isShiftClick) {
      // Shift+click: toggle the category in the selection
      if (currentCategories.includes(category)) {
        newSelectedCategories = currentCategories.filter(c => c !== category)
      } else {
        newSelectedCategories = [...currentCategories, category]
      }
    } else {
      // Regular click: select only this category
      newSelectedCategories = [category]
    }
    
    // Update query state - URL sync happens automatically
    setQuery(prev => ({ ...prev, categoryFilter: newSelectedCategories }))
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Claude Code Tools & Resources
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover tools, agents, MCP servers, and resources to enhance your Claude Code experience
        </p>
      </div>

      {/* Category Filter Tabs - Client-side navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={(e) => handleKindChange(null, e.shiftKey)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                query.kindFilter.length === 0
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All
            </button>
            {TOOL_KINDS.map((kind) => (
              <button
                key={kind}
                onClick={(e) => handleKindChange(kind, e.shiftKey)}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  (query.kindFilter as ToolKind[]).includes(kind)
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title={`Click to select only ${kindDisplayNames[kind]}, Shift+click to toggle selection`}
              >
                {kindDisplayNames[kind]}
                {(query.kindFilter).includes(kind) && query.kindFilter.length > 1 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-500 text-white rounded-full">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {query.kindFilter.length > 1 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Multiple filters active: {(query.kindFilter).map(cat => kindDisplayNames[cat]).join(', ')}
            <span className="ml-2 text-xs text-gray-500">
              (Shift+click tabs to toggle)
            </span>
          </div>
        )}
      </div>

      {/* Category Filter - Only show if categories are available */}
      {currentAvailableCategories.length > 1 && (
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
            </div>
            <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
              <button
                onClick={(e) => handleCategoryChange(null, e.shiftKey)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  query.categoryFilter.length === 0
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All Categories
              </button>
              {currentAvailableCategories.map((category) => (
                <button
                  key={category}
                  onClick={(e) => handleCategoryChange(category, e.shiftKey)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                    query.categoryFilter.includes(category)
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title={`Click to select only ${category}, Shift+click to toggle selection`}
                >
                  {category}
                  {query.categoryFilter.includes(category) && query.categoryFilter.length > 1 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs bg-green-500 text-white rounded-full">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          {query.categoryFilter.length > 1 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Multiple categories active: {query.categoryFilter.join(', ')}
              <span className="ml-2 text-xs text-gray-500">
                (Shift+click to toggle)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query.text}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Search ${
              query.kindFilter.length === 0 
                ? 'all tools' 
                : query.kindFilter.length === 1 
                  ? kindDisplayNames[(query.kindFilter as ToolKind[])[0]].toLowerCase()
                  : `${query.kindFilter.length} selected kinds`
            }...`}
          />
        </div>
      </div>

      {/* Search Results */}
      <SearchResults 
        results={results}
        isLoading={isLoading}
        error={error}
        searchQuery={query.text}
        kindFilter={query.kindFilter}
        categoryFilter={query.categoryFilter}
      />
      
      {/* Show total count when not searching */}
      {!query.text && !isLoading && !error && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {resourceLoader.isSearchReady() ? resourceLoader.getTotalCount() : totalCount} total resources available
        </div>
      )}
      
      <TierListExample />
    </div>
  )
}