import manifest from './docStills.json'

/**
 * A docs still from the capture script's manifest (`src/docStills.json`, DESIGN.md, Screenshots):
 * `![](/img/docs/<name> "still")`. Each still has a desktop and a phone cut, each in light and dark,
 * in one picture element, so the browser fetches exactly one file: the desktop cut where the article
 * leaves it `needsWidth` clear px, the phone cut elsewhere, in the system's scheme. Every file is 2x,
 * shown at its display size, hanging from the column's left edge. Real window edges get a hairline
 * (and a radius where two meet); the manifest's fades are CSS masks; past the article's edge the
 * picture is cut and its last `edge` px dissolve (src/site-theme.css, .doc-still).
 */
type Side = 'top' | 'right' | 'bottom' | 'left'

export type DocStillCut = {
  files: { light: string; dark: string }
} & DocCut

/** A cut's place on the page: what a still and a clip (src/DocClip.tsx) have in common. */
export type DocCut = {
  alt: string
  displayWidth: number
  displayHeight: number
  pixels: [number, number]
  /** x, y, width, height in the window's app px. */
  crop: [number, number, number, number]
  at: string
  inset: number
  overhang: number
  real: Side[]
  divider: Side[]
  /** Per side, app px in window coordinates: transparent at the first, fully shown at the second. */
  fade: Partial<Record<Side, [number, number]>>
  edge: number
  /** CSS px the desktop cut needs from the column's left edge to where the article starts cutting it. */
  needsWidth?: number
  /** The capture keeps the window's title bar empty, where the traffic lights go: the site draws them. */
  chrome?: boolean
}

/** A still without a phone cut is shown only where its desktop cut fits, and hidden elsewhere. */
export const DOC_STILLS = manifest as unknown as Record<string, { page: string; section: string | null; desktop: DocStillCut; phone?: DocStillCut | null }>

const STILL_SRC = /^\/img\/docs\/([a-z0-9-]+)$/

export function docStillName(src: string | undefined, title: string | null | undefined) {
  const name = title === 'still' ? STILL_SRC.exec(src ?? '')?.[1] : undefined
  return name && DOC_STILLS[name] ? name : undefined
}

/**
 * The narrowest viewport at which the wide docs layout (src/style.css) leaves a desktop cut `needs`
 * clear px from the column's left edge: the layout's left padding is max(32px, (100% - 1180px) / 2),
 * then the 210px sidebar and the article's 4rem padding (190px and 2.5rem up to 900px). 12px spare
 * covers a classic scrollbar on the article.
 */
export function desktopCutMinWidth(needs: number) {
  for (let width = 761; width < 4000; width++) {
    const narrow = width <= 900
    const clear = width - Math.max(32, (width - 1180) / 2) - (narrow ? 190 : 210) - (narrow ? 40 : 64) - 12
    if (clear >= needs) return width
  }
  return 4000
}

const TOWARD: Record<Side, string> = { top: 'to bottom', bottom: 'to top', left: 'to right', right: 'to left' }
// Smoothstep at quarter steps: the fade eases in and out.
const EASED = [[0, 0], [0.25, 0.156], [0.5, 0.5], [0.75, 0.844], [1, 1]]

function fadeMask({ crop: [x, y, width, height], fade }: DocCut) {
  return (Object.entries(fade) as [Side, [number, number]][]).map(([side, [from, to]]) => {
    // Distance in from that side of the picture.
    const inward = (value: number) => side === 'top' ? value - y : side === 'bottom' ? y + height - value
      : side === 'left' ? value - x : x + width - value
    const [start, end] = [inward(from), inward(to)]
    const stops = EASED.map(([at, alpha]) => `rgb(0 0 0 / ${alpha}) ${start + (end - start) * at}px`)
    return `linear-gradient(${TOWARD[side]}, ${stops.join(', ')})`
  }).join(', ')
}

/** One cut's frame: its size, corners, edges and fades. */
export function cutCss(still: string, cut: DocCut, lights = false) {
  const edges = cut.real.filter((side) => !cut.divider.includes(side))
  const corner = (a: Side, b: Side) => edges.includes(a) && edges.includes(b) ? '12px' : '0'
  const lines = [...cut.real, ...cut.divider]
  const border = (['top', 'right', 'bottom', 'left'] as const).map((side) => lines.includes(side) ? '1px' : '0').join(' ')
  const mask = fadeMask(cut)
  const self = `.site-theme .document-content .doc-still[data-still="${still}"]`
  return `${self} { --still-width: ${cut.displayWidth}px; --still-edge: ${cut.edge}px }`
    + `${self} .doc-still-frame { width: ${cut.displayWidth}px; height: ${cut.displayHeight}px; border-radius: ${corner('top', 'left')} ${corner('top', 'right')} ${corner('bottom', 'right')} ${corner('bottom', 'left')}`
    + (mask ? `; mask-image: ${mask}; -webkit-mask-image: ${mask}; mask-composite: intersect; -webkit-mask-composite: source-in` : '') + ' }'
    + `${self} .doc-still-frame::after { border-width: ${border} }`
    // The lights sit where they do in the 1133-wide window, which the cut shows at one CSS px per app px.
    + (!lights ? '' : `${self} .doc-still-chrome { display: ${cut.chrome ? 'block' : 'none'}; left: ${-cut.crop[0]}px; top: ${-cut.crop[1]}px }`)
}

/** The media query where a still shows its desktop cut. */
export function desktopCutQuery({ desktop }: { desktop: DocCut }) {
  // It needs its clear width plus the edge that dissolves where the article cuts it.
  return `(min-width: ${desktopCutMinWidth((desktop.needsWidth ?? desktop.displayWidth) + desktop.edge)}px)`
}

// What a still without a phone cut loads where it is hidden: nothing.
export const NOTHING = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export function DocStill({ name, loading = 'lazy' }: { name: string; loading?: 'eager' | 'lazy' }) {
  const still = DOC_STILLS[name]
  const { desktop, phone } = still
  const wide = desktopCutQuery(still)
  const dark = '(prefers-color-scheme: dark)'
  const self = `.site-theme .document-content .doc-still[data-still="${name}"]`
  const lights = Boolean(desktop.chrome || phone?.chrome)
  const narrow = phone ? cutCss(name, phone, lights) : `${self} { display: none }`
  const shown = phone ? cutCss(name, desktop, lights) : `${self} { display: block }${cutCss(name, desktop, lights)}`
  const fallback = phone ?? desktop
  return (
    <span className="doc-still" data-still={name}>
      <style>{`${narrow}@media ${wide} { ${shown} }`}</style>
      <span className="doc-still-frame">
        <picture>
          <source media={`${dark} and ${wide}`} srcSet={`/img/docs/${desktop.files.dark}`} width={desktop.displayWidth} height={desktop.displayHeight} />
          <source media={wide} srcSet={`/img/docs/${desktop.files.light}`} width={desktop.displayWidth} height={desktop.displayHeight} />
          {phone && <source media={dark} srcSet={`/img/docs/${phone.files.dark}`} />}
          {/* The desktop cut's alt: the phone cut shows a part of the same picture. */}
          <img src={phone ? `/img/docs/${phone.files.light}` : NOTHING} alt={desktop.alt} width={fallback.displayWidth} height={fallback.displayHeight}
            loading={loading} fetchPriority={loading === 'eager' ? 'high' : undefined} decoding={loading === 'eager' ? undefined : 'async'} />
        </picture>
        {lights && <TrafficLights />}
      </span>
    </span>
  )
}

/** The traffic lights, as src/AppWindowImage.tsx draws them on the recorder's captures. */
export function TrafficLights() {
  return (
    <svg className="doc-still-chrome" viewBox="0 0 80 40" width="80" height="40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="6" fill="#ff5f57" stroke="#e0443e" />
      <circle cx="40" cy="20" r="6" fill="#febc2e" stroke="#dea123" />
      <circle cx="60" cy="20" r="6" fill="#28c840" stroke="#1aab29" />
    </svg>
  )
}
