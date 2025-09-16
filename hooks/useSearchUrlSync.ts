'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchQuery, type ToolKind } from '@/utils/search-core'

/**
 * CLIENT-SIDE SEARCH URL SYNCHRONIZATION
 * 
 * This hook exists because we have a client-side search engine with no server backend.
 * We're serving static files, but we want users to be able to share links to search results.
 * This means the entire state of the search query needs to be encoded in the URL.
 * 
 * Features supported:
 * - Full text search (the 'q' parameter)
 * - Faceted search starting with 'kind' facet
 * - Future facets planned: tags, license, etc.
 * 
 * Special business rule: SEO-friendly URLs like /tools/agents are equivalent to 
 * /tools/?kind=agent, but we don't update the browser URL until user interaction
 * to preserve clean URLs for crawlers and direct links.
 */

/**
 * Converts SearchQuery to URL search params
 */
export function searchQueryToUrl(query: SearchQuery, basePath = '/tools'): string {
  const params = new URLSearchParams()
  
  if (query.kindFilter.length > 0) {
    params.set('kind', query.kindFilter.join(','))
  }
  
  if (query.categoryFilter.length > 0) {
    params.set('category', query.categoryFilter.join(','))
  }
  
  if (query.text.trim()) {
    params.set('q', query.text.trim())
  }
  
  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

/**
 * Parses URL search params to SearchQuery
 */
export function urlToSearchQuery(url: string): SearchQuery {
  const urlObj = new URL(url, window.location.origin)
  const params = urlObj.searchParams
  
  const kindFilter: ToolKind[] = []
  for (const candidate of params.get('kind')?.split(',').filter(Boolean) || []) {
    switch (candidate) {
      case 'mcp':
      case 'agent':
      case 'command':
      case 'setting':
      case 'hook':
      case 'template':
        kindFilter.push(candidate)
        break;
    }
  }
  
  // Parse category filter - no validation needed since categories are dynamic
  const categoryFilter: string[] = params.get('category')?.split(',').filter(Boolean) || []
  
  return {
    text: params.get('q') || '',
    kindFilter,
    categoryFilter,
    limit: undefined
  }
}

/**
 * Pure URL sync hook - handles bidirectional SearchQuery <-> URL synchronization
 * 
 * Returns [query, setQuery] similar to useState, but with automatic URL sync.
 * 
 * Special behavior:
 * - On mount, reads from URL if it has search params
 * - When setQuery is called, immediately updates browser URL (becoming "URL controlled")
 * - Handles browser back/forward navigation by parsing URL and updating state
 * - Preserves SEO-friendly URLs until user interaction
 */
export function useSearchQuery(initialQuery: SearchQuery): [SearchQuery, (query: SearchQuery | ((prev: SearchQuery) => SearchQuery)) => void] {
  const [query, setQueryState] = useState<SearchQuery>(initialQuery)
  const [isUrlControlled, setIsUrlControlled] = useState(false)
  const lastUrlRef = useRef<string>('')

  // Initialize from current URL on mount if it has search params
  useEffect(() => {
    const currentUrl = window.location.href
    const urlQuery = urlToSearchQuery(currentUrl)
    
    // Only become URL controlled if URL has meaningful search params
    // This preserves SEO-friendly URLs like /tools/agents
    if (urlQuery.text || urlQuery.kindFilter.length > 0 || urlQuery.categoryFilter.length > 0) {
      setQueryState(urlQuery)
      setIsUrlControlled(true)
    }
    
    lastUrlRef.current = currentUrl
  }, [])

  // Update URL when query changes (only if we're URL controlled)
  useEffect(() => {
    if (!isUrlControlled) return

    const newUrl = searchQueryToUrl(query)
    const currentUrl = window.location.pathname + window.location.search
    
    // Only update URL if it actually changed
    if (newUrl !== currentUrl) {
      window.history.pushState({ query }, '', newUrl)
      lastUrlRef.current = window.location.href
    }
  }, [query, isUrlControlled])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const newUrl = window.location.href
      
      // Only process if URL actually changed (avoid duplicate events)
      if (newUrl !== lastUrlRef.current) {
        const urlQuery = urlToSearchQuery(newUrl)
        setQueryState(urlQuery)
        lastUrlRef.current = newUrl
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // setQuery wrapper that makes us URL controlled
  const setQuery = useCallback((newQuery: SearchQuery | ((prev: SearchQuery) => SearchQuery)) => {
    setQueryState(prev => {
      const next = typeof newQuery === 'function' ? newQuery(prev) : newQuery
      
      // First call to setQuery makes us URL controlled
      // This is when we switch from SEO-friendly URLs to query param URLs
      if (!isUrlControlled) {
        setIsUrlControlled(true)
      }
      
      return next
    })
  }, [isUrlControlled])

  return [query, setQuery]
}
