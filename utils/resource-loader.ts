import { DevResource } from '../types/dev-resource'
import { parseDevResources } from './dev-resource-parser'
import { FacetedSearchEngine, SearchQuery, SearchResult } from './search-core'

/**
 * DataLoader class for client-side resource loading with promise caching and search optimization
 */
export class ResourceDataLoader {
  private loadPromise: Promise<DevResource[]> | null = null
  private searchEngine = new FacetedSearchEngine()

  /**
   * Load resources from the JSON file. Returns cached promise if already loading.
   */
  async loadResources(): Promise<DevResource[]> {
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = this.fetchAndParseResources()
    return this.loadPromise
  }

  /**
   * Perform optimized search using pre-built index
   */
  search(query: SearchQuery): SearchResult[] {
    if (!this.searchEngine.isReady()) {
      return []
    }
    return this.searchEngine.search(query)
  }

  /**
   * Check if resources are currently loading
   */
  isLoading(): boolean {
    return this.loadPromise !== null
  }

  /**
   * Check if search engine is ready
   */
  isSearchReady(): boolean {
    return this.searchEngine.isReady()
  }

  /**
   * Get total resource count
   */
  getTotalCount(): number {
    return this.searchEngine.getTotalCount()
  }

  /**
   * Reset the loader (useful for testing or error recovery)
   */
  reset(): void {
    this.loadPromise = null
    this.searchEngine = new FacetedSearchEngine()
  }

  private async fetchAndParseResources(): Promise<DevResource[]> {
    try {
      const response = await fetch('/data/components.json')
      if (!response.ok) {
        throw new Error(`Failed to load resources: ${response.statusText}`)
      }
      
      const rawData = await response.json()
      
      // Parse the data using our type-safe parser
      const resources: DevResource[] = []
      
      // The JSON structure has categories as keys, each containing arrays of resources
      Object.entries(rawData).forEach(([category, items]) => {
        if (Array.isArray(items)) {
            
            try {
              const parsed = parseDevResources(items)
              resources.push(...parsed)
            } catch (parseError) {
              console.warn(`Failed to parse resource in ${category}:`, items, parseError)
            }
        }
      })
      
      // Initialize search engine with parsed resources (builds index once)
      this.searchEngine.initialize(resources)
      
      return resources
    } catch (error) {
      // Reset promise on error so retry is possible
      this.loadPromise = null
      throw error
    }
  }
}

// Singleton instance for the entire app
export const resourceLoader = new ResourceDataLoader()
