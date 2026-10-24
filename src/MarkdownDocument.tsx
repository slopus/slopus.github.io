import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChiefOfStaffPrompt, CHIEF_OF_STAFF_LANGUAGE } from './ChiefOfStaffPrompt'
import { HoverClip } from './HoverClip'
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
  /** A fence's info string after its language: ```chief-of-staff add skills. */
  data?: { meta?: string }
}

function hastText(node: HastNode): string {
  return node.type === 'text' ? node.value ?? '' : (node.children ?? []).map(hastText).join('')
}

function hastChildren(node: HastNode, tagName: string) {
  return (node.children ?? []).filter((child) => child.tagName === tagName)
}

/**
 * Marks each wide comparison table, five or more columns, for cards on narrow screens, which
 * CSS alone then restacks (data-cards on the table, data-label on each body cell):
 * - "columns" when the top-left header is empty: the columns are the things compared, so each
 *   column becomes a card, and a cell's label is its row's first cell.
 * - "rows" otherwise: each row becomes a card headed by its first cell, and a cell's label is
 *   its column's header.
 * Narrower tables stay tables and wrap their text to fit.
 */
function rehypeTableCards() {
  const label = (table: HastNode) => {
    const sections = (table.children ?? []).filter((child) => child.tagName === 'thead' || child.tagName === 'tbody')
    const rows = sections.flatMap((section) => hastChildren(section, 'tr'))
    const headers = hastChildren(rows[0] ?? { type: 'element' }, 'th').map((cell) => hastText(cell).trim())
    if (headers.length < 5) return
    const mode = headers[0] ? 'rows' : 'columns'
    table.properties = { ...table.properties, dataCards: mode }
    for (const row of rows) {
      const cells = hastChildren(row, 'td')
      const rowLabel = cells[0] ? hastText(cells[0]).trim() : ''
      cells.forEach((cell, index) => {
        if (index > 0) cell.properties = { ...cell.properties, dataLabel: mode === 'rows' ? headers[index] ?? '' : rowLabel }
      })
    }
  }
  const visit = (node: HastNode) => {
    if (node.type === 'element' && node.tagName === 'table') label(node)
    for (const child of node.children ?? []) visit(child)
  }
  return (tree: HastNode) => visit(tree)
}

export function MarkdownDocument({
  markdown,
  components: overrides,
  originalDocsLinks = false,
  resolveHref,
}: {
  markdown: string
  /** Replaces the default renderer for these elements. */
  components?: Components
  /** Resolve the original CLI docs' unprefixed links under /docs. */
  originalDocsLinks?: boolean
  /** Resolve links relative to an unmodified upstream document. */
  resolveHref?: (href: string | undefined) => string | undefined
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
      const normalizedHref = resolveHref ? resolveHref(href) : normalizeHref(href, originalDocsLinks)
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
      <div className={'data-cards' in props ? 'document-table-wrap document-table-cards' : 'document-table-wrap'}>
        <table {...props}>{children}</table>
      </div>
    ),
    // A ```chief-of-staff fence is a copyable request for the Chief of Staff, one per line; the rest
    // of its first line says what they do: ```chief-of-staff add skills.
    pre: ({ children, node, ...props }) => {
      const code = (node as HastNode | undefined)?.children?.find((child) => child.tagName === 'code')
      const className = code?.properties?.className
      if (code && Array.isArray(className) && className.includes(`language-${CHIEF_OF_STAFF_LANGUAGE}`)) {
        const prompts = hastText(code).split('\n').map((line) => line.trim()).filter(Boolean)
        return <ChiefOfStaffPrompt task={code.data?.meta?.trim() ?? ''} prompts={prompts} />
      }
      return <pre {...props}>{children}</pre>
    },
    // A quote that ends on "— Name, @handle, [date](link)" is a post someone made: drawn as a card
    // with the author on top, the way it looked where it was posted.
    blockquote: ({ children, node, ...props }) => {
      const paragraphs = ((node as HastNode | undefined)?.children ?? []).filter((child) => child.tagName === 'p')
      const byline = paragraphs.at(-1)
      const lead = byline?.children?.[0]
      const link = byline?.children?.find((child) => child.tagName === 'a')
      if (paragraphs.length < 2 || lead?.type !== 'text' || !lead.value?.startsWith('— ') || !link) {
        return <blockquote {...props}>{children}</blockquote>
      }
      const [author, ...where] = lead.value.slice(2).split(',').map((part) => part.trim()).filter(Boolean)
      const body = Children.toArray(children).filter(isValidElement)
      return (
        <blockquote {...props} className="quote-card">
          <p className="quote-card-byline">
            <strong>{author}</strong> <span>{where.join(', ')}</span> <span aria-hidden="true">·</span>{' '}
            <a href={String(link.properties?.href)} target="_blank" rel="noreferrer">{hastText(link)}</a>
          </p>
          {body.slice(0, -1)}
        </blockquote>
      )
    },
    img: ({ alt, src, title, node: _node, ...props }) => {
      // An image whose src is a folder is a clip that plays on hover (src/HoverClip.tsx).
      if (typeof src === 'string' && src.endsWith('/')) {
        return <HoverClip folder={src} label={alt ?? ''} />
      }
      // A video shows its poster, `<name>-poster.webp` beside it, until it plays. The served
      // markup carries `muted`, so it autoplays before hydration; a DOM that doesn't turn that
      // attribute into the `muted` property (jsdom) would otherwise report a mismatch.
      if (typeof src === 'string' && /\.(mp4|webm)$/.test(src)) {
        return (
          <video src={src} poster={src.replace(/\.(mp4|webm)$/, '-poster.webp')} controls muted autoPlay loop playsInline aria-label={alt ?? ''} suppressHydrationWarning />
        )
      }
      // A title labels the image under it, as Before and After do side by side.
      if (title) {
        return (
          <span className="labelled-image">
            <img {...props} src={src} alt={alt ?? ''} loading="lazy" />
            <span className="labelled-image-label">{title}</span>
          </span>
        )
      }
      return <img {...props} src={src} alt={alt ?? ''} loading="lazy" />
    },
  }

  return (
    <div className="document-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeTableCards]} components={{ ...components, ...overrides }}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}