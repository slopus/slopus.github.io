/**
 * The homepage's variants under review, chosen in the URL: `?palette=` names the surface's
 * colours (happy-home.css), `?hero=` the headline. The prerendered page, and any URL without
 * them, is the default of each.
 */
export const PALETTES = ['lavender', 'ocean', 'sunset', 'mint', 'mono'] as const
export type Palette = (typeof PALETTES)[number]

export type Headline = {
  /** The heading's lines; a *starred* run takes the accent colour. */
  lines: readonly string[]
  /** The one short line under it, if any; starred runs as in `lines`, `\n` breaks it. */
  sub?: string
  /** The name alone, set large. */
  name?: boolean
  /** The name, small in the wordmark's face, above a heading that says the rest. */
  kicker?: string
}

/** 1–6 are the first round of candidates; b1–b6 vary the one picked from them; c1 is Kirill's. */
export const HEADLINES: Readonly<Record<string, Headline>> = {
  '1': { lines: ['Any subscription.', '*Your team.*'] },
  '2': { lines: ['Any subscription.', 'Your team.', '*One app.*'] },
  '3': { lines: ['*Happy*'], sub: 'Where you, your agents and your team work together.', name: true },
  '4': { lines: ['AI work,', '*out of private chats.*'] },
  '5': { lines: ['*Happy*'], sub: 'One place for your team and its agents.', name: true },
  '6': { lines: ['The best way', 'for *teams* to use AI.'] },
  // 5, varied: the name as the phone apps' start screen sets it (ink, not accent), the accent
  // moved into the line, the line broken or reworded, and the line as the heading.
  b1: { lines: ['Happy'], sub: 'One place for your team and its agents.', name: true },
  b2: { lines: ['Happy'], sub: 'One place for *your team* and its agents.', name: true },
  b3: { lines: ['*Happy*'], sub: 'One place for your team\nand its agents.', name: true },
  b4: { lines: ['Happy'], sub: 'Your team and its agents, in *one place*.', name: true },
  b5: { lines: ['*Happy*'], sub: 'One place for you, your team and your agents.', name: true },
  b6: { kicker: 'Happy', lines: ['One place for your team', 'and its *agents*.'] },
  c1: { lines: ['Happy'], sub: 'One place for you, *your team*, and your agents.', name: true },
}
export const HERO_DEFAULT = 'c1'

/** The link-preview image's headline (`?preview=og`), until the card is regenerated. */
export const SOCIAL_HEADLINE: Headline = { lines: ['Any Model.', 'Your Subscription.', '*Happy Harness*'] }

export type HomeVariants = { palette: Palette; hero: string; preview: boolean }

export function homeVariants(search: string): HomeVariants {
  const params = new URLSearchParams(search)
  const palette = PALETTES.find(name => name === params.get('palette')) ?? PALETTES[0]
  const hero = params.get('hero') ?? ''
  return {
    palette,
    hero: Object.hasOwn(HEADLINES, hero) ? hero : HERO_DEFAULT,
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

/** Switches one variant in place, without a navigation; the default of each leaves the URL. */
export function homeVariantSet(name: 'palette' | 'hero', value: string) {
  const url = new URL(window.location.href)
  if (value === { palette: PALETTES[0], hero: HERO_DEFAULT }[name]) url.searchParams.delete(name)
  else url.searchParams.set(name, value)
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new Event(CHANGE))
}
