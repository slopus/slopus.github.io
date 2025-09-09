'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/*
* Faceted Search URL Strategy:
 * - SEO Entry Points: Clean URLs like /tools/agents for crawlers and direct links
 * - Interactive State: Once user interacts with ANY facet, switch to /tools?category=X&q=Y
 * 
 * This gives us:
 * - Clean URLs for SEO (/tools/mcp-servers, /tools/agents)
 * - Faceted search state in query params after interaction (/tools?category=hooks&q=search)
 * - Category treated as just another search facet alongside query
 * - Extensible for future facets (tags, license, etc.)
 */

const TOOL_CATEGORIES = [
  'mcp',
  'agents', 
  'commands',
  'settings',
  'hooks',
  'templates'
] as const

type ToolCategory = typeof TOOL_CATEGORIES[number]

interface ToolsClientProps {
  initialCategory?: ToolCategory | null
}

export default function ToolsClient({ initialCategory }: ToolsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentCategory, setCurrentCategory] = useState<ToolCategory | null>(initialCategory || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  const categoryDisplayNames: Record<ToolCategory, string> = {
    'mcp': 'MCP Servers',
    'agents': 'Agents',
    'commands': 'Commands',
    'settings': 'Settings', 
    'hooks': 'Hooks',
    'templates': 'Templates'
  }

  // Initialize from URL params after mount
  useEffect(() => {
    const queryCategory = searchParams.get('category') as ToolCategory | null
    const querySearch = searchParams.get('q') || ''

    // If we have query params, we're in interactive mode
    if (queryCategory || querySearch) {
      setHasInteracted(true)
      setCurrentCategory(queryCategory || null)
      setSearchQuery(querySearch)
    } else {
      // Use initial category from path, not yet interactive
      setCurrentCategory(initialCategory || null)
      setSearchQuery('')
    }
    
    setMounted(true)
  }, [initialCategory, searchParams])

  // Handle category changes - switches to faceted search mode
  const handleCategoryChange = (category: ToolCategory | null) => {
    setCurrentCategory(category)
    setHasInteracted(true) // Mark as interactive - switch to query param URLs
    
    const newParams = new URLSearchParams()
    if (category) newParams.set('category', category)
    if (searchQuery) newParams.set('q', searchQuery)
    
    const queryString = newParams.toString()
    const newUrl = queryString ? `/tools?${queryString}` : '/tools'
    
    router.push(newUrl, { scroll: false })
  }

  // Handle search changes - switches to faceted search mode
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setHasInteracted(true) // Mark as interactive - switch to query param URLs
    
    const newParams = new URLSearchParams()
    if (currentCategory) newParams.set('category', currentCategory)
    if (query) newParams.set('q', query)
    
    const queryString = newParams.toString()
    const newUrl = queryString ? `/tools?${queryString}` : '/tools'
    
    router.push(newUrl, { scroll: false })
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
              onClick={() => handleCategoryChange(null)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                !currentCategory
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All
            </button>
            {TOOL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentCategory === category
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {categoryDisplayNames[category]}
              </button>
            ))}
          </nav>
        </div>
      </div>

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
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Search ${currentCategory ? categoryDisplayNames[currentCategory].toLowerCase() : 'all tools'}...`}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {currentCategory ? `${categoryDisplayNames[currentCategory]} Coming Soon` : 'Tools Coming Soon'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentCategory 
            ? `We're building a comprehensive directory of ${categoryDisplayNames[currentCategory].toLowerCase()} for Claude Code.`
            : "We're building a comprehensive directory of tools and resources for Claude Code."
          }
        </p>
        {currentCategory === 'mcp' && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This will showcase MCP servers similar to the design you provided, with search, filtering, and easy installation.
          </p>
        )}
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Searching for: "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  )
}