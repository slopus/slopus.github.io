import { Metadata } from 'next'
import ToolsClient from './ToolsClient'

const TOOL_CATEGORIES = [
  'mcp',
  'agents', 
  'commands',
  'settings',
  'hooks',
  'templates'
] as const

type ToolCategory = typeof TOOL_CATEGORIES[number]

// Static generation for SEO - these create the entry point routes
export async function generateStaticParams() {
  return [
    { category: [] },
    ...TOOL_CATEGORIES.map(cat => ({ category: [cat] }))
  ]
}

export async function generateMetadata(props: {
  params: Promise<{ category?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const category = params.category?.[0]
  
  if (!category) {
    return {
      title: 'Claude Code Tools & Resources',
      description: 'Discover tools, agents, MCP servers, and resources for Claude Code'
    }
  }
  
  const categoryTitles: Record<ToolCategory, string> = {
    'mcp': 'MCP Servers',
    'agents': 'Agents',
    'commands': 'Commands', 
    'settings': 'Settings',
    'hooks': 'Hooks',
    'templates': 'Templates'
  }
  
  const title = categoryTitles[category as ToolCategory] || 'Tools'
  
  return {
    title: `${title} | Claude Code Tools`,
    description: `Browse ${title.toLowerCase()} for Claude Code`
  }
}

interface ToolsPageProps {
  params: Promise<{ category?: string[] }>
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const resolvedParams = await params
  const initialCategory = resolvedParams.category?.[0] as ToolCategory | undefined
  
  return <ToolsClient initialCategory={initialCategory || null} />
}