import fs from 'fs'
import path from 'path'
import { DevResource } from '../types/dev-resource'
import { parseDevResources } from './dev-resource-parser'

let cachedResources: DevResource[] | null = null

/**
 * Load and parse all dev resources from the JSON file (server-side only)
 * This runs server-side during build time
 */
export function loadAllDevResources(): DevResource[] {
  if (cachedResources) {
    return cachedResources
  }

  try {
    // Load the JSON file from the public directory
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'components.json')
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    const resources: DevResource[] = []
    
    // Parse the JSON structure - categories as keys, arrays of resources as values
    Object.entries(rawData).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          try {
            const parsed = parseDevResources([item])[0]
            resources.push(parsed)
          } catch (parseError) {
            console.warn(`Failed to parse resource in ${category}:`, item, parseError)
          }
        })
      }
    })
    
    cachedResources = resources
    return resources
  } catch (error) {
    console.error('Failed to load dev resources:', error)
    return []
  }
}
