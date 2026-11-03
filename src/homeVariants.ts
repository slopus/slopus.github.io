/**
 * The homepage's variants under review, chosen in the URL: `?palette=` names the surface's
 * colours (happy-home.css), `?hero=` numbers the headline. The prerendered page, and any URL
 * without them, is the first of each.
 */
export const PALETTES = ['lavender', 'ocean', 'sunset', 'mint', 'mono'] as const
export type Palette = (typeof PALETTES)[number]

/** Each headline's lines, the last one in the accent colour. */
export const HEADLINES: readonly (readonly string[])[] = [
  ['Any Model.', 'Your Subscription.', 'Happy Harness.'],
  ['Any subscription.', 'Your team.'],
  ['Any AI subscription.', 'Your team.', 'One app.'],
  ['Stop working', 'with AI alone.'],
  ['Where your team and its agents', 'work together.'],
]

export type HomeVariants = { palette: Palette; hero: number; preview: boolean }

export function homeVariants(search: string): HomeVariants {
  const params = new URLSearchParams(search)
  const palette = PALETTES.find(name => name === params.get('palette')) ?? PALETTES[0]
  const hero = Number(params.get('hero'))
  return {
    palette,
    hero: Number.isInteger(hero) && hero >= 1 && hero <= HEADLINES.length ? hero : 1,
    preview: params.get('preview') === 'og',
  }
}

const CHANGE = 'happy-home-variants'

export function homeVariantsSubscribe(listener: () => void) {
  window.addEventListener('popstate', listener)
  window.addEventListener(CHANGE, listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener(CHANGE, listener)
  }
}

export const homeVariantsSearch = () => window.location.search

/** Switches one variant in place, without a navigation; the first of each leaves the URL. */
export function homeVariantSet(name: 'palette' | 'hero', value: string) {
  const url = new URL(window.location.href)
  if (value === (name === 'palette' ? PALETTES[0] : '1')) url.searchParams.delete(name)
  else url.searchParams.set(name, value)
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new Event(CHANGE))
}
