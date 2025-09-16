import Fuse, {type IFuseOptions, type Expression} from 'fuse.js'
import { DevResource } from '../types/dev-resource'

export const TOOL_KINDS = [
    'mcp',
    'agent', 
    'command',
    'setting',
    'hook',
    'template'
  ] as const
  
  export type ToolKind = typeof TOOL_KINDS[number]

// Search configuration with extended search enabled
export const SEARCH_CONFIG: IFuseOptions<DevResource> = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'description', weight: 0.4 },
    { name: 'content', weight: 0.2 },
    { name: 'category', weight: 0.1 },
    { name: 'type', weight: 0.05 }  // Add type for faceted search
  ],
  // search only the first 4kb of text. I think that this number should be
  // increased if people want to search inside the contents of an agent
  // markdown.
  distance: 4096,
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true,
  // Very important, I decided to use Fuse.js to handle the facets as well
  useExtendedSearch: true 
} as const

// Search query data structure
export interface SearchQuery {
  text: string
  kindFilter: ToolKind[]
  categoryFilter: string[]
  limit?: number
}

// Search result interface
export interface SearchResult {
  item: DevResource
  score?: number
  matches?: readonly any[]
}

/**
 * Build logical search expression combining text and facet filters
 * Uses Fuse.js Expression objects for precise field control:
 * - Text fields (name, description, content) get fuzzy search
 * - Type and category fields get exact matching with extended search operators
 * 
 * Examples:
 * - buildSearchExpression("auth", ["mcp"], ["api"]) → 
 *   { $and: [{ $or: [{ name: "auth" }, ...] }, { type: "=mcp" }, { category: "=api" }] }
 * - buildSearchExpression("database", ["mcp", "agent"], []) →
 *   { $and: [{ $or: [{ name: "database" }, ...] }, { type: "=mcp | =agent" }] }
 */
export function buildSearchExpression(text: string, kindFilter: string[], categoryFilter: string[]): Expression | null {
  text = text.trim()
  
  // Build text search part - search across content fields with fuzzy matching
  let textExpression: Expression | null = null
  if (text) {
    textExpression = {
      $or: [
        { name: text },
        { description: text },
        { content: text },
        { category: text }
      ]
    }
  }
  
  // Build type filter using exact matching with extended search operators
  let typeExpression: Expression | null = null
  if (kindFilter && kindFilter.length > 0) {
    if (kindFilter.length === 1) {
      typeExpression = { type: `=${kindFilter[0]}` }
    } else {
      // Multiple types: =mcp | =agent
      const typeQuery = kindFilter.map(type => `=${type}`).join(' | ')
      typeExpression = { type: typeQuery }
    }
  }
  
  // Build category filter using exact matching with extended search operators
  let categoryExpression: Expression | null = null
  if (categoryFilter && categoryFilter.length > 0) {
    if (categoryFilter.length === 1) {
      categoryExpression = { category: `=${categoryFilter[0]}` }
    } else {
      // Multiple categories: =api | =web
      const categoryQuery = categoryFilter.map(cat => `=${cat}`).join(' | ')
      categoryExpression = { category: categoryQuery }
    }
  }
  
  // Combine expressions
  const expressions: Expression[] = []
  if (textExpression) expressions.push(textExpression)
  if (typeExpression) expressions.push(typeExpression)
  if (categoryExpression) expressions.push(categoryExpression)
  
  if (expressions.length === 0) {
    return null
  } else if (expressions.length === 1) {
    return expressions[0]
  } else {
    return { $and: expressions }
  }
}

/**
 * Pure function to perform search using Fuse.js logical expressions
 */
export function performSearch(
  allResources: DevResource[],
  fuse: Fuse<DevResource> | null,
  query: SearchQuery
): SearchResult[] {
  console.log("original limit", query.limit)
  const { text, kindFilter, categoryFilter, limit = allResources.length } = query

  // Build logical search expression that combines text and facets
  const searchExpression = buildSearchExpression(text, kindFilter, categoryFilter)
  console.log("searchExpression", searchExpression)
  
  // If no query at all, return all resources
  if (!searchExpression) {
    console.log("just slice it")
    return allResources.slice(0, limit).map(item => ({ item }))
  }

  // Need Fuse instance for search
  if (!fuse) {
    console.log("no fuse instance")
    return []
  }

  // Perform logical search - Fuse handles text + facets with precise field control
  const results = fuse.search(searchExpression)
  console.log(limit, "results", results.length)
  return results.slice(0, limit)
}

/**
 * Create a Fuse instance from resources
 */
export function createFuseInstance(
  resources: DevResource[],
): Fuse<DevResource> {
  return new Fuse(resources, SEARCH_CONFIG)
}


/**
 * Debug function to see the generated search expression
 */
export function debugSearchExpression(text: string, kindFilter: string[], categoryFilter: string[]): Expression | null {
  return buildSearchExpression(text, kindFilter, categoryFilter)
}

/**
 * Optimized search engine that builds index once and reuses it
 */
export class FacetedSearchEngine {
  private fuse: Fuse<DevResource> | null = null
  private resources: DevResource[] = []

  /**
   * Initialize with resources and build the search index once
   */
  initialize(resources: DevResource[]): void {
    this.resources = resources
    this.fuse = createFuseInstance(resources)
  }

  /**
   * Perform search using the pre-built index
   */
  search(query: SearchQuery): SearchResult[] {
    return performSearch(this.resources, this.fuse, query)
  }

  /**
   * Check if the engine is ready to search
   */
  isReady(): boolean {
    return this.resources.length > 0
  }

  /**
   * Get total resource count
   */
  getTotalCount(): number {
    return this.resources.length
  }
}

/**
 * Extract unique categories for a given kind from resources
 */
export function getAvailableCategories(
  resources: DevResource[], 
  kindFilter: ToolKind[]
): string[] {
  // If no kind filter specified, don't show categories
  // Categories should be specific to selected kinds
  if (kindFilter.length === 0) {
    return []
  }
  
  // Filter resources by kind and extract unique categories
  const filteredResources = resources.filter(resource => 
    kindFilter.includes(resource.type as ToolKind)
  )
  
  const categories = new Set(filteredResources.map(r => r.category))
  return Array.from(categories).sort()
}
