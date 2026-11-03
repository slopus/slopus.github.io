/**
 * The homepage's headline, and its link-preview card's: `?preview=og` is the card's screenshot
 * mode (docs/happy-one-demo.md). On the dev server only, `?palette=` and `?hero=` show the
 * variants still under review (homeVariantsDev.ts); the build leaves them out and ignores them.
 */
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

/** Kirill's line under the name, plain. */
export const HOME_HEADLINE: Headline = { lines: ['Happy'], sub: 'One place for you, your team, and your agents.', name: true }

/** The link-preview image's headline (`?preview=og`), until the card is regenerated. */
export const SOCIAL_HEADLINE: Headline = { lines: ['Any Model.', 'Your Subscription.', '*Happy Harness*'] }

/** The native start screens' palette (happy-home.css). */
export const PALETTE_DEFAULT = 'lavender'

export const homePreview = (search: string) => new URLSearchParams(search).get('preview') === 'og'

/** Fired when the dev switcher changes the URL in place. */
export const HOME_VARIANTS_CHANGE = 'happy-home-variants'

export function homeVariantsSubscribe(listener: () => void) {
  window.addEventListener('popstate', listener)
  window.addEventListener(HOME_VARIANTS_CHANGE, listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener(HOME_VARIANTS_CHANGE, listener)
  }
}

export const homeVariantsSearch = () => window.location.search
