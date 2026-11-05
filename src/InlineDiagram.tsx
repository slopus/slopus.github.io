// Diagrams drawn in the site's card style (notes/diagrams/cards.py) sit in the page as SVG rather
// than behind an <img>, so they take the page's fonts and its light or dark palette. A page names
// one as an image: ![what it shows](/diagrams/migrate.svg).
const DIAGRAMS = import.meta.glob<string>('./diagrams/*.svg', { query: '?raw', import: 'default', eager: true })

export function inlineDiagram(src: string): string | undefined {
  const match = /^\/diagrams\/([\w-]+\.svg)$/.exec(src)
  return match ? DIAGRAMS[`./diagrams/${match[1]}`] : undefined
}

/** The SVG itself, labelled with the image's alt text. */
export function InlineDiagram({ svg, label }: { svg: string; label: string }) {
  return <span className="inline-diagram" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
}
