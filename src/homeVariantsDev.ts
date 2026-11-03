import { HOME_HEADLINE, HOME_VARIANTS_CHANGE, PALETTE_DEFAULT, type Headline } from './homeVariants'

/**
 * The variants still under review, for the dev server only: DesktopApp reads them behind
 * `import.meta.env.DEV`, so the build leaves this file out. The palettes' colours are in
 * homeVariantsDev.css, loaded with the switcher.
 */
export const PALETTES = [PALETTE_DEFAULT, 'ocean', 'sunset', 'mint', 'mono'] as const

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
  c1: HOME_HEADLINE,
}
export const HERO_DEFAULT = 'c1'

export type HomeVariants = { palette: string; hero: string; headline: Headline }

export function homeVariantsDev(search: string): HomeVariants {
  const params = new URLSearchParams(search)
  const palette = PALETTES.find(name => name === params.get('palette')) ?? PALETTE_DEFAULT
  const key = params.get('hero') ?? ''
  const hero = Object.hasOwn(HEADLINES, key) ? key : HERO_DEFAULT
  return { palette, hero, headline: HEADLINES[hero] }
}

/** Switches one variant in place, without a navigation; the default of each leaves the URL. */
export function homeVariantSet(name: 'palette' | 'hero', value: string) {
  const url = new URL(window.location.href)
  if (value === { palette: PALETTE_DEFAULT, hero: HERO_DEFAULT }[name]) url.searchParams.delete(name)
  else url.searchParams.set(name, value)
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new Event(HOME_VARIANTS_CHANGE))
}
