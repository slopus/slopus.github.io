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

function normalizeHref(href?: string) {
  if (!href || href.startsWith('#') || /^(?:https?:|mailto:)/.test(href)) {
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

export function MarkdownDocument({ markdown }: { markdown: string }) {
  const usedHeadingIds = new Map<string, number>()

  function heading(depth: 1 | 2 | 3) {
    const Heading = `h${depth}` as const

    return function DocumentHeading({ children }: { children?: ReactNode }) {
      const text = textFromNode(children)
      const baseId = slugifyHeading(text)
      const count = usedHeadingIds.get(baseId) ?? 0
      const id = count === 0 ? baseId : `${baseId}-${count}`
      usedHeadingIds.set(baseId, count + 1)

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
    a: ({ href, children, ...props }) => {
      const normalizedHref = normalizeHref(href)
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
    table: ({ children, ...props }) => (
      <div className="document-table-wrap">
        <table {...props}>{children}</table>
      </div>
    ),
    img: ({ alt, src, ...props }) => {
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}