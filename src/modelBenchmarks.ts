import rawCatalog from './model-benchmarks.json'

export const TIERS = ['S', 'A', 'B', 'C', 'D', 'Unranked'] as const
export type Tier = typeof TIERS[number]

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
  points: string[]
  sourceIds: string[]
  rationale: string
  leadCheck?: LeadCheck
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

/** The first model of the highest non-empty tier. */
export function leaderOf(catalog: BenchmarkCatalog) {
  for (const tier of TIERS.filter(tier => tier !== 'Unranked')) {
    const leader = catalog.models.find(model => model.tier === tier)
    if (leader) return leader
  }
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