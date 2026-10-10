import { type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugifyHeading } from './documents'

function textFromNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(textFromNode).join('')
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return textFromNode((node.props as { children?: ReactNode }).children)
  }

  return ''
}

/**
 * The original CLI docs link their own pages without the /docs prefix. The
 * desktop docs are top-level pages, so their links stay as written.
 */
function normalizeHref(href: string | undefined, originalDocsLinks: boolean) {
  if (!href || !originalDocsLinks || href.startsWith('#') || /^(?:https?:|mailto:)/.test(href)) {
    return href
  }

  const aliases: Record<string, string> = {
    '/guides/quick-start': '/docs/quick-start/',
    '/guides/self-hosting': '/docs/guides/self-hosting/',
    '/how-it-works': '/docs/how-it-works/',
  }
  const aliasedHref = aliases[href] ?? href

  if (aliasedHref.startsWith('/docs/')) {
    return aliasedHref.endsWith('/') ? aliasedHref : `${aliasedHref}/`
  }

  if (/^\/(?:guides|features|comparisons|use-cases|versions|distribution)(?:\/|$)/.test(aliasedHref)) {
    return `/docs${aliasedHref}${aliasedHref.endsWith('/') ? '' : '/'}`
  }

  return aliasedHref
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function hastText(node: HastNode): string {
  return node.type === 'text' ? node.value ?? '' : (node.children ?? []).map(hastText).join('')
}

/**
 * Gives each table body cell its row's first-cell text as data-label, so a
 * table can be restacked into labeled cards on narrow screens with CSS alone.
 */
function rehypeTableCellLabels() {
  const visit = (node: HastNode) => {
    if (node.type === 'element' && node.tagName === 'tr') {
      const cells = (node.children ?? []).filter((child) => child.tagName === 'td')
      const label = cells[0] ? hastText(cells[0]).trim() : ''
      for (const cell of cells.slice(1)) cell.properties = { ...cell.properties, dataLabel: label }
    }
    for (const child of node.children ?? []) visit(child)
  }
  return (tree: HastNode) => visit(tree)
}

export function MarkdownDocument({
  markdown,
  components: overrides,
  originalDocsLinks = false,
}: {
  markdown: string
  /** Replaces the default renderer for these elements. */
  components?: Components
  /** Resolve the original CLI docs' unprefixed links under /docs. */
  originalDocsLinks?: boolean
}) {
  const usedHeadingIds = new Map<string, number>()
  // Keyed by source offset so a repeat render of a heading (StrictMode, hydration) keeps its id.
  const headingIdsByOffset = new Map<number, string>()

  function heading(depth: 1 | 2 | 3) {
    const Heading = `h${depth}` as const

    return function DocumentHeading({
      children,
      node,
    }: {
      children?: ReactNode
      node?: { position?: { start: { offset?: number } } }
    }) {
      const text = textFromNode(children)
      const offset = node?.position?.start.offset
      let id = offset === undefined ? undefined : headingIdsByOffset.get(offset)

      if (id === undefined) {
        const baseId = slugifyHeading(text)
        const count = usedHeadingIds.get(baseId) ?? 0
        id = count === 0 ? baseId : `${baseId}-${count}`
        usedHeadingIds.set(baseId, count + 1)
        if (offset !== undefined) headingIdsByOffset.set(offset, id)
      }

      return (
        <Heading id={id}>
          {children}
          <a className="heading-anchor" href={`#${id}`} aria-label={`Link to ${text}`}>
            <span aria-hidden="true">#</span>
          </a>
        </Heading>
      )
    }
  }

  const components: Components = {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    // `node` is react-markdown's syntax tree, not an HTML attribute; keep it out of the markup.
    a: ({ href, children, node: _node, ...props }) => {
      const normalizedHref = normalizeHref(href, originalDocsLinks)
      const external = normalizedHref?.startsWith('http')

      return (
        <a
          {...props}
          href={normalizedHref}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
    table: ({ children, node: _node, ...props }) => (
      <div className="document-table-wrap">
        <table {...props}>{children}</table>
      </div>
    ),
    img: ({ alt, src, node: _node, ...props }) => {
      if (typeof src === 'string' && /\.(mp4|webm)$/.test(src)) {
        return (
          <video src={src} controls muted autoPlay loop playsInline aria-label={alt ?? ''} />
        )
      }
      return <img {...props} src={src} alt={alt ?? ''} loading="lazy" />
    },
  }

  return (
    <div className="document-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeTableCellLabels]} components={{ ...components, ...overrides }}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}