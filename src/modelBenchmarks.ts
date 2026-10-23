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

/** The posts wall shows at most this many posts. */
export const MAX_WALL_POSTS = 8

/** A model released this many days ago or fewer carries the new-model badge. */
export const NEW_MODEL_DAYS = 14

/** The leader's record that it was rechecked against challengers and kept the top spot. */
export interface LeadCheck {
  /** UTC date (YYYY-MM-DD) of the review that kept the leader first. */
  reconfirmedAt: string
  /** Exact IDs of challengers that tried for the top spot; each is ranked on this page. */
  heldAgainst: string[]
  /** Head-to-head posts from the leader's own sources that cover every challenger. */
  sourceIds: string[]
  /** The first bullet on the leader's card, linked to the first of `sourceIds`. */
  note: string
  /** Provenance only, not rendered: the evidence on both sides. */
  reason: string
}

/** One claim on a model card, linked to the post that supports it. */
export interface ModelPoint {
  text: string
  /** One of the model's own `sourceIds`. */
  sourceId: string
}

/**
 * One entry on Arena's Agent Arena board. `score` is Arena's net improvement: how much better
 * real users' agent sessions go with the model than with the average model, in percent.
 * Gaps between scores are percentage points.
 */
export interface ArenaEntry {
  rank: number
  /** Reasoning effort as Arena labels the entry, e.g. `Max`, `High`, `xHigh`. */
  effort: string
  score: number
}

/** The one Agent Arena board every card's headline comes from. */
export interface ArenaBoard {
  /** The board's post; every model with an `arena` entry cites it. */
  sourceId: string
  /** The board's #1 and #2, shown or not, for the leader's lead and everyone's gap to #1. */
  top: [ArenaBoardEntry, ArenaBoardEntry]
}

export interface ArenaBoardEntry { name: string; effort: string; score: number }

export interface RankedModel {
  id: string
  name: string
  tier: Tier
  /** Set on S models only. */
  lane?: Lane
  /** UTC time of the lab's post announcing general availability; drives the new-model badge. */
  releasedAt: string
  releaseUrl: string
  /** The model's entry on `arenaBoard`; omitted while it is not on the board yet. */
  arena?: ArenaEntry
  /** The last point is the caveat. */
  points: ModelPoint[]
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
  /** The post this one quotes; its embed shows that post inside it. */
  quotes?: string
  /** The post this one replies to; embeds hide it with `conversation: 'none'`. */
  replyTo?: string
  scope: { task: string; harness: string; effort: string }
  verification: { method: string; text: string }
}

export interface BenchmarkCatalog {
  schemaVersion: number
  revision: string
  updatedAt: string
  evidenceCutoff: string
  reviewNote: string
  arenaBoard: ArenaBoard
  /** Post IDs on the wall, at most `MAX_WALL_POSTS`, picked in order of value to S; the page shows them newest first. */
  wall: string[]
  models: RankedModel[]
  notShown: HiddenModel[]
  sources: BenchmarkSource[]
}

export const benchmarkCatalog = rawCatalog as BenchmarkCatalog

/** The wall's posts, newest first; ties keep the order they were picked in. */
export function wallSources(catalog: BenchmarkCatalog) {
  return [...new Set(catalog.wall)]
    .map(id => catalog.sources.find(source => source.id === id))
    .filter(source => source !== undefined)
    .slice(0, MAX_WALL_POSTS)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}

/** Gap in percentage points, from one decimal place scores. */
function points(a: number, b: number) {
  return (Math.round((a - b) * 10) / 10).toFixed(1)
}

/** The card headline's second line: #1's lead over #2, or everyone else's gap to #1. */
export function arenaGap(board: ArenaBoard, entry: ArenaEntry) {
  const [first, second] = board.top
  return entry.rank === 1
    ? `${points(entry.score, second.score)} points ahead of #2 ${second.name} (${second.effort}) in real users’ agent sessions`
    : `${points(first.score, entry.score)} points behind #1 ${first.name} (${first.effort}) in real users’ agent sessions`
}

/** Whole days since release, or undefined once the model is no longer new. */
export function newModelAge(releasedAt: string, now = Date.now()) {
  const days = Math.floor(Math.max(0, now - Date.parse(releasedAt)) / 86_400_000)
  return days <= NEW_MODEL_DAYS ? days : undefined
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