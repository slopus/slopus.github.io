import rawCatalog from './model-benchmarks.json'

export const TIERS = ['S', 'A', 'B', 'F'] as const
export type Tier = typeof TIERS[number]

/** S splits into two lanes: the most capable models, and the best value for routine work. */
export const LANES = ['frontier', 'chores'] as const
export type Lane = typeof LANES[number]

/** Labs whose latest releases every refresh checks; each appears as a shown or not-shown model. */
export const MAJOR_LABS = ['anthropic', 'openai', 'google', 'xai', 'meta', 'deepseek'] as const

/** At most this many models are shown; S holds at most three across both lanes. */
export const MAX_SHOWN_MODELS = 7
export const MAX_S_MODELS = 3

/** The leader's record that it was rechecked against challengers and kept the top spot. */
export interface LeadCheck {
  /** UTC date (YYYY-MM-DD) of the review that kept the leader first. */
  reconfirmedAt: string
  /** Exact IDs of challengers that tried for the top spot; each is ranked on this page. */
  heldAgainst: string[]
  /** Head-to-head posts from the leader's own sources that cover every challenger. */
  sourceIds: string[]
  /** One terse hover bullet. */
  note: string
  /** Provenance only, not rendered: the evidence on both sides. */
  reason: string
}

export interface RankedModel {
  id: string
  name: string
  tier: Tier
  /** Set on S models only. */
  lane?: Lane
  points: string[]
  sourceIds: string[]
  rationale: string
  leadCheck?: LeadCheck
}

/** A reviewed model that the page does not show, and why. Provenance only, not rendered. */
export interface HiddenModel {
  id: string
  name: string
  reason: 'superseded' | 'outranked' | 'over-limit' | 'thin-evidence'
  /** The newer model of the same line (superseded) or the shown model that beats it (outranked). */
  by?: string
  note: string
}

export interface BenchmarkSource {
  id: string
  url: string
  author: string
  handle: string
  publishedAt: string
  verifiedAt: string
  kind: 'provider-reported' | 'independent'
  summary: string
  caveat: string
  modelIds: string[]
  /** Provenance only, not rendered: actual reviewed head-to-head claims; mere co-mentions do not qualify. */
  comparisonModelIds: string[]
  scope: { task: string; harness: string; effort: string }
  verification: { method: string; text: string }
}

export interface BenchmarkCatalog {
  schemaVersion: number
  revision: string
  updatedAt: string
  evidenceCutoff: string
  reviewNote: string
  models: RankedModel[]
  notShown: HiddenModel[]
  sources: BenchmarkSource[]
}

export const benchmarkCatalog = rawCatalog as BenchmarkCatalog

/** Preserve editorial order. Filtering never scores, reorders, or fetches sources. */
export function selectSources(catalog: BenchmarkCatalog, selected: ReadonlySet<string>) {
  const selectedSourceIds = new Set(catalog.models
    .filter(model => selected.size === 0 || selected.has(model.id))
    .flatMap(model => model.sourceIds))

  return catalog.sources.filter(source => selectedSourceIds.has(source.id))
}

/** The first S Frontier model. */
export function leaderOf(catalog: BenchmarkCatalog) {
  return catalog.models.find(model => model.tier === 'S' && model.lane === 'frontier')
}

/** The lab prefix of a `<lab>/<model>` ID. */
export function labOf(id: string) {
  return id.split('/')[0]
}

export function shortDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function publicationAge(publishedAt: string, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(publishedAt).getTime())
  const hours = Math.floor(elapsed / 3_600_000)
  if (hours < 1) return 'today'
  if (hours < 24) return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export function absoluteDate(iso: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC',
  }).format(new Date(iso)) + ' UTC'
}