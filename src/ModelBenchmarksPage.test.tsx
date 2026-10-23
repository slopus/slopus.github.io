import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ModelBenchmarksPage from './ModelBenchmarksPage'
import { absoluteDate, arenaGap, benchmarkCatalog, labOf, LANES, leaderOf, MAJOR_LABS, MAX_S_MODELS, MAX_SHOWN_MODELS, MAX_WALL_POSTS, NEW_MODEL_DAYS, newModelAge, publicationAge, TIERS, wallSources, type BenchmarkCatalog, type BenchmarkSource, type RankedModel } from './modelBenchmarks'
import { Router } from './Router'
import { modelBenchmarksMetadata } from './siteMetadata'

const source = (id: string, modelIds: string[], comparisonModelIds: string[] = []): BenchmarkSource => ({
  id, url: `https://x.com/researcher/status/${id}`, author: `Researcher ${id}`, handle: 'researcher',
  publishedAt: '2026-09-22T12:00:00Z', verifiedAt: '2026-09-23T10:00:00Z', kind: 'independent',
  summary: `Reviewed finding ${id}`, caveat: 'Scoped evaluation.', modelIds, comparisonModelIds,
  scope: { task: 'Coding', harness: 'Declared harness', effort: 'high' }, verification: { method: 'X oEmbed', text: 'Exact text verified.' },
})
const model = (id: string, name: string, tier: RankedModel['tier'], points: [string, string][], extra: Partial<RankedModel> = {}): RankedModel => ({
  id, name, tier, releasedAt: '2026-08-01T12:00:00Z', releaseUrl: `https://x.com/lab/status/1${id.length}`,
  points: points.map(([text, sourceId]) => ({ text, sourceId })), sourceIds: [...new Set(points.map(([, sourceId]) => sourceId))], rationale: 'Fixture.', ...extra,
})
const fixture: BenchmarkCatalog = {
  schemaVersion: 5, revision: 'test.1', updatedAt: '2026-09-23T10:00:00Z', evidenceCutoff: '2026-09-23T10:00:00Z', reviewNote: 'Reviewed fixture.',
  arenaBoard: { sourceId: '100', top: [{ name: 'Alpha', effort: 'Max', score: 20 }, { name: 'Fable', effort: 'High', score: 15.5 }] },
  pricing: { source: 'Fixture cost per task', url: 'https://prices.test/models/', verifiedAt: '2026-09-23T10:00:00Z', note: 'Fixture.' },
  wall: ['100', '200', '300'],
  models: [
    model('test/alpha', 'Alpha', 'S', [['Strong on coding.', '100'], ['Limited evidence elsewhere.', '200']], { lane: 'frontier',
      arena: { rank: 1, effort: 'Max', score: 20 },
      leadCheck: { reconfirmedAt: '2026-09-23', heldAgainst: ['test/beta'], sourceIds: ['100'], note: 'Still #1 after Beta launched.', reason: 'Fixture head-to-head.' } }),
    model('test/beta', 'Beta', 'S', [['Useful for small tasks.', '300'], ['Effort matters.', '100']], { lane: 'chores', releasedAt: '2026-09-20T12:00:00Z', arena: { rank: 4, effort: 'xHigh', score: 13.4 }, price: { usd: 0.72, page: 'beta' } }),
    { ...model('test/gamma', 'Gamma', 'B', [['Narrow evidence.', '100'], ['Fixture caveat.', '100']]), price: { usd: null, page: 'gamma' }, sourceIds: [], rationale: 'Fixture without posts.' },
  ],
  notShown: [],
  sources: [{ ...source('300', ['test/beta']), publishedAt: '2026-09-21T12:00:00Z' }, source('100', ['test/alpha', 'test/beta'], ['test/alpha', 'test/beta']), { ...source('200', ['test/alpha']), kind: 'provider-reported', publishedAt: '2026-09-22T18:00:00Z' }],
}
const cardOf = (name: string) => screen.getByText(name, { selector: '.benchmark-model' }).closest('.benchmark-card')!
const notesOf = (name: string) => cardOf(name).querySelector('ul')!
// jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
beforeAll(() => { vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }) })
afterAll(() => { vi.unstubAllGlobals() })
beforeEach(() => { window.twttr = { widgets: { createTweet: vi.fn().mockResolvedValue(undefined) } } })
afterEach(() => { cleanup(); delete window.twttr; vi.restoreAllMocks() })

describe('reviewed catalog integrity', () => {
  it('has unique exact models with at most four reviewed posts each', () => {
    expect(benchmarkCatalog.schemaVersion).toBe(5)
    expect(new Set(benchmarkCatalog.models.map(model => model.id)).size).toBe(benchmarkCatalog.models.length)
    for (const model of benchmarkCatalog.models) {
      expect(model.id).toMatch(/^[a-z0-9]+\/[a-z0-9.-]+$/)
      expect(TIERS).toContain(model.tier)
      expect(model.sourceIds.length).toBeGreaterThan(0)
      expect(model.sourceIds.length).toBeLessThanOrEqual(4)
      expect(new Set(model.sourceIds).size).toBe(model.sourceIds.length)
      expect(model.points.length).toBeGreaterThanOrEqual(2)
      expect(model.points.length + (model.leadCheck ? 1 : 0)).toBeLessThanOrEqual(3)
      // Every claim on a card links to one of the model's own posts and fits two card lines.
      expect(new Set(model.points.map(point => point.text)).size).toBe(model.points.length)
      for (const point of model.points) {
        expect(model.sourceIds).toContain(point.sourceId)
        expect(point.text.length).toBeLessThanOrEqual(72)
      }
      // The release time comes from the lab's own post, by its snowflake, and drives the new-model badge.
      const release = model.releaseUrl.match(/^https:\/\/x\.com\/\w+\/status\/(\d+)$/)
      expect(release).toBeTruthy()
      expect(Date.parse(model.releasedAt)).toBe(Math.floor((Number(BigInt(release![1]) >> 22n) + 1288834974657) / 1000) * 1000)
      expect(Date.parse(model.releasedAt)).toBeLessThanOrEqual(Date.parse(benchmarkCatalog.updatedAt))
      expect(model.rationale.length).toBeGreaterThan(15)
      for (const id of model.sourceIds) expect(benchmarkCatalog.sources.find(entry => entry.id === id)?.modelIds).toContain(model.id)
    }
  })
  it('shows a short chart: S holds one to three models split into lanes, nothing else has a lane', () => {
    const models = benchmarkCatalog.models
    expect(models.length).toBeLessThanOrEqual(MAX_SHOWN_MODELS)
    const s = models.filter(model => model.tier === 'S')
    expect(s.length).toBeGreaterThanOrEqual(1)
    expect(s.length).toBeLessThanOrEqual(MAX_S_MODELS)
    for (const model of models) {
      if (model.tier === 'S') expect(LANES).toContain(model.lane)
      else expect(model.lane).toBeUndefined()
    }
    expect(s.some(model => model.lane === 'frontier')).toBe(true)
    // Models are grouped by tier in tier order, so the JSON reads like the page.
    const tierIndexes = models.map(model => TIERS.indexOf(model.tier))
    expect(tierIndexes).toEqual([...tierIndexes].sort((a, b) => a - b))
  })
  it('covers every major lab and records why reviewed models are not shown', () => {
    const shown = new Set(benchmarkCatalog.models.map(model => model.id))
    const hidden = benchmarkCatalog.notShown
    expect(new Set(hidden.map(model => model.id)).size).toBe(hidden.length)
    for (const lab of MAJOR_LABS) expect([...shown, ...hidden.map(model => model.id)].some(id => labOf(id) === lab)).toBe(true)
    for (const model of hidden) {
      expect(model.id).toMatch(/^[a-z0-9]+\/[a-z0-9.-]+$/)
      expect(shown.has(model.id)).toBe(false)
      expect(model.note.length).toBeGreaterThan(30)
      if (model.reason === 'superseded') {
        expect(labOf(model.by!)).toBe(labOf(model.id))
        expect([...shown, ...hidden.map(entry => entry.id)]).toContain(model.by)
      }
      if (model.reason === 'outranked') expect(shown.has(model.by!)).toBe(true)
    }
    // A superseded model never appears beside its successor.
    for (const model of hidden.filter(entry => entry.reason === 'superseded')) expect(shown.has(model.id)).toBe(false)
    for (const source of benchmarkCatalog.sources) for (const id of source.modelIds) expect(shown.has(id)).toBe(true)
  })
  it('validates source identity, dates, attribution and reciprocal membership', () => {
    expect(new Set(benchmarkCatalog.sources.map(entry => entry.id)).size).toBe(benchmarkCatalog.sources.length)
    for (const entry of benchmarkCatalog.sources) {
      expect(entry.id).toMatch(/^\d+$/)
      expect(entry.url).toBe(`https://x.com/${entry.handle}/status/${entry.id}`)
      expect(['provider-reported', 'independent']).toContain(entry.kind)
      expect(Date.parse(entry.publishedAt)).toBeLessThanOrEqual(Date.parse(entry.verifiedAt))
      expect(entry.verification.method.length).toBeGreaterThan(0)
      expect(entry.verification.text.length).toBeGreaterThan(0)
      expect(entry.modelIds.length).toBeGreaterThan(0)
      expect(new Set(entry.modelIds).size).toBe(entry.modelIds.length)
      expect(new Set(entry.comparisonModelIds).size).toBe(entry.comparisonModelIds.length)
      expect(entry.comparisonModelIds.length).not.toBe(1)
      for (const id of entry.modelIds) expect(benchmarkCatalog.models.find(model => model.id === id)?.sourceIds).toContain(entry.id)
      for (const id of entry.comparisonModelIds) expect(entry.modelIds).toContain(id)
    }
  })
  it('keeps a lead check only on the leader, dated, against ranked challengers its own head-to-heads cover', () => {
    const leader = leaderOf(benchmarkCatalog)!
    for (const model of benchmarkCatalog.models) if (model !== leader) expect(model.leadCheck).toBeUndefined()
    const check = leader.leadCheck
    if (!check) return
    expect(check.reconfirmedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const reconfirmed = Date.parse(`${check.reconfirmedAt}T23:59:59Z`)
    expect(reconfirmed).toBeLessThanOrEqual(Date.now() + 86_400_000)
    expect(Date.parse(check.reconfirmedAt)).toBeLessThanOrEqual(Date.parse(benchmarkCatalog.updatedAt))
    expect(check.note.length).toBeGreaterThan(10)
    expect(check.note.length).toBeLessThanOrEqual(52)
    expect(check.reason.length).toBeGreaterThan(40)
    expect(check.heldAgainst.length).toBeGreaterThan(0)
    expect(new Set(check.heldAgainst).size).toBe(check.heldAgainst.length)
    expect(check.heldAgainst).not.toContain(leader.id)
    for (const id of check.heldAgainst) {
      expect(benchmarkCatalog.models.map(model => model.id)).toContain(id)
    }
    expect(check.sourceIds.length).toBeGreaterThan(0)
    const covered = new Set<string>()
    for (const id of check.sourceIds) {
      expect(leader.sourceIds).toContain(id)
      const entry = benchmarkCatalog.sources.find(source => source.id === id)!
      expect(entry.comparisonModelIds).toContain(leader.id)
      expect(Date.parse(entry.publishedAt)).toBeLessThanOrEqual(reconfirmed)
      for (const challenger of entry.comparisonModelIds) covered.add(challenger)
    }
    for (const id of check.heldAgainst) expect(covered).toContain(id)
  })
})

describe('numbers in context', () => {
  // Every number names its metric, its source and its scale, in words a reader new to the source follows.
  const METRIC = /FrontierCode|Intelligence Index|coding-agent index|Terminal-Bench|Agent Arena|Code Arena|audit|a task|cost/
  const texts = () => benchmarkCatalog.models.flatMap(model => [...model.points.map(point => point.text), ...(model.leadCheck ? [model.leadCheck.note] : [])])
  it('names a metric beside every number on a card', () => {
    for (const text of texts().filter(text => /\d/.test(text.replace(/\b(GPT|Opus|Sonnet|Fable|Haiku|Gemini|Grok|DeepSeek|Muse|V)[\s-]?[\d.]+(\s(Sol|Astra|Argon|Flash|1017))*/g, '')))) {
      expect(text, text).toMatch(METRIC)
    }
  })
  it('spells out sources and never leaves a bare score or fraction', () => {
    for (const text of texts()) {
      expect(text, text).not.toMatch(/\bAA\b/)
      expect(text, text).not.toMatch(/\bTheo\b(?! Browne)/)
      // "47 of 92" must say 92 what.
      expect(text, text).not.toMatch(/\d+\s*(\/|of)\s*(its\s+)?\d+(?![\d.])(?!\s+[a-z])/)
      // A bullet is a sentence, not just a number with a label.
      expect(text.replace(/[^A-Za-z]/g, '').length, text).toBeGreaterThan(20)
    }
  })
})

describe('Agent Arena headline', () => {
  it('comes from one board for every card, each entry checked against the board post', () => {
    const board = benchmarkCatalog.arenaBoard
    const post = benchmarkCatalog.sources.find(source => source.id === board.sourceId)!
    expect(post.handle).toBe('arena')
    const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const entry = (rank: number, name: string, effort: string, score: number) => new RegExp(`#${rank} ${escape(name)} \\(${escape(effort)}\\) \\+${score.toFixed(1)}%`)
    const [first, second] = board.top
    expect(first.score).toBeGreaterThanOrEqual(second.score)
    expect(post.summary).toMatch(entry(1, first.name, first.effort, first.score))
    expect(post.summary).toMatch(entry(2, second.name, second.effort, second.score))
    const ranked = benchmarkCatalog.models.filter(model => model.arena)
    // Every shown model is on the current board; a model not ranked yet would show "Not on Agent Arena yet".
    expect(ranked).toHaveLength(benchmarkCatalog.models.length)
    expect(new Set(ranked.map(model => model.arena!.rank)).size).toBe(ranked.length)
    for (const model of ranked) {
      const { rank, effort, score } = model.arena!
      expect(model.sourceIds).toContain(board.sourceId)
      expect(['Low', 'Medium', 'High', 'xHigh', 'Max']).toContain(effort)
      expect(post.summary).toMatch(new RegExp(`#${rank} [^,#]+ \\(${effort}\\) \\+${score.toFixed(1)}%`))
      expect(score).toBeLessThanOrEqual(first.score)
      if (rank === 1) expect([model.name, effort, score]).toEqual([first.name, first.effort, first.score])
      if (rank === 2) expect([model.name, effort, score]).toEqual([second.name, second.effort, second.score])
    }
    const byRank = [...ranked].sort((a, b) => a.arena!.rank - b.arena!.rank)
    for (let index = 1; index < byRank.length; index++) expect(byRank[index].arena!.score).toBeLessThanOrEqual(byRank[index - 1].arena!.score)
  })
  it('gives #1 its lead over #2 and everyone else their gap to #1, in points with efforts named', () => {
    const board = fixture.arenaBoard
    expect(arenaGap(board, { rank: 1, effort: 'Max', score: 20 })).toBe('4.5 points ahead of #2 Fable (High) in real users’ agent sessions')
    expect(arenaGap(board, { rank: 4, effort: 'xHigh', score: 13.4 })).toBe('6.6 points behind #1 Alpha (Max) in real users’ agent sessions')
    expect(arenaGap(benchmarkCatalog.arenaBoard, leaderOf(benchmarkCatalog)!.arena!)).toBe('6.2 points ahead of #2 GPT-6 Astra (Max) in real users’ agent sessions')
  })
  it('shows rank, board, effort and gap on each card and explains the metric once', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const headlines = [...document.querySelectorAll('.benchmark-headline')].map(element => element.textContent)
    expect(headlines).toEqual(['#1 Agent Arena, Max effort4.5 points ahead of #2 Fable (High) in real users’ agent sessions↗', '#4 Agent Arena, xHigh effort6.6 points behind #1 Alpha (Max) in real users’ agent sessions↗', 'Not on Agent Arena yet'])
    const legend = document.querySelector('.benchmark-legend')!
    expect(legend.textContent).toContain('than with the average model')
    expect(legend.textContent).toContain('percentage points')
    expect(legend.querySelector('a')?.getAttribute('href')).toBe('https://x.com/researcher/status/100')
  })
})

describe('posts wall', () => {
  it('holds at most eight unique standalone posts, none showing another wall post inside it', () => {
    const wall = benchmarkCatalog.wall
    expect(wall.length).toBeLessThanOrEqual(MAX_WALL_POSTS)
    expect(MAX_WALL_POSTS).toBe(8)
    expect(new Set(wall).size).toBe(wall.length)
    for (const id of wall) {
      const post = benchmarkCatalog.sources.find(source => source.id === id)!
      expect(post).toBeTruthy()
      // A quote embeds the quoted post as a second block; prefer posts that stand alone.
      expect(post.quotes).toBeUndefined()
      expect(post.replyTo).toBeUndefined()
    }
    const quoted = benchmarkCatalog.sources.map(source => source.quotes).filter(Boolean)
    for (const id of wall) expect(quoted).not.toContain(id)
  })
  it('is picked for S first: the lead check and the Chores pick’s value lead the list', () => {
    const leader = leaderOf(benchmarkCatalog)!
    const chores = benchmarkCatalog.models.find(model => model.lane === 'chores')!
    const wall = benchmarkCatalog.wall
    expect(leader.leadCheck!.sourceIds.some(id => wall.slice(0, 2).includes(id))).toBe(true)
    expect(wall.slice(0, 4).filter(id => chores.sourceIds.includes(id)).length).toBeGreaterThanOrEqual(2)
    // Every shown model has at least one post on the wall.
    for (const model of benchmarkCatalog.models) expect(model.sourceIds.some(id => wall.includes(id))).toBe(true)
  })
  it('renders newest first, once each, whatever order the posts were picked in', () => {
    expect(wallSources(fixture).map(source => source.id)).toEqual(['200', '100', '300'])
    expect(wallSources({ ...fixture, wall: ['300', '100', '300', '200'] }).map(source => source.id)).toEqual(['200', '100', '300'])
    const dates = wallSources(benchmarkCatalog).map(source => Date.parse(source.publishedAt))
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
    render(<ModelBenchmarksPage catalog={fixture} />)
    expect(screen.getAllByRole('article').map(article => article.getAttribute('aria-label'))).toEqual(['Post by Researcher 200', 'Post by Researcher 100', 'Post by Researcher 300'])
  })
  it('never cites Agents on Rails on the page', () => {
    for (const source of benchmarkCatalog.sources) expect(source.handle.toLowerCase()).not.toBe('rails')
    for (const model of benchmarkCatalog.models) for (const point of model.points) expect(point.text).not.toMatch(/Rails/)
  })
})

describe('price per task', () => {
  it('comes from one source, AA’s cost per Intelligence Index task, and never sits on a Frontier card', () => {
    expect(benchmarkCatalog.pricing.url).toBe('https://artificialanalysis.ai/models/')
    expect(benchmarkCatalog.pricing.source).toMatch(/Artificial Analysis cost per Intelligence Index task/)
    for (const model of benchmarkCatalog.models) {
      if (model.lane === 'frontier') expect(model.price).toBeUndefined()
      else expect(model.price).toBeTruthy()
      if (model.price) {
        expect(model.price.page).toMatch(/^[a-z0-9-]+$/)
        if (model.price.usd !== null) expect(model.price.usd).toBeGreaterThan(0)
      }
    }
    expect(benchmarkCatalog.models.find(model => model.lane === 'chores')!.price!.usd).toBeTypeOf('number')
  })
  it('shows the price on the Chores card and other non-Frontier cards, linked to its page', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const price = cardOf('Beta').querySelector('.benchmark-price')!
    expect(price.textContent).toBe('$0.72 a task↗Artificial Analysis')
    expect(price.getAttribute('href')).toBe('https://prices.test/models/beta')
    expect(cardOf('Alpha').querySelector('.benchmark-price')).toBeNull()
    expect(cardOf('Gamma').querySelector('.benchmark-price')?.textContent).toBe('No API price')
    expect(document.querySelector('.benchmark-legend')?.textContent).toContain('cost per task')
  })
})

describe('new-model badge', () => {
  it('counts whole days since release up to the cutoff', () => {
    expect(NEW_MODEL_DAYS).toBe(14)
    const release = '2026-10-17T08:35:54Z'
    expect(newModelAge(release, Date.parse('2026-10-17T20:00:00Z'))).toBe(0)
    expect(newModelAge(release, Date.parse('2026-10-21T10:00:00Z'))).toBe(4)
    expect(newModelAge(release, Date.parse('2026-10-31T09:00:00Z'))).toBe(14)
    expect(newModelAge(release, Date.parse('2026-11-01T09:00:00Z'))).toBeUndefined()
  })
  it('shows the age on new models’ cards only, from the clock at page load', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-23T13:00:00Z'))
    render(<ModelBenchmarksPage catalog={fixture} />)
    const badges = document.querySelectorAll('.benchmark-new')
    expect(badges).toHaveLength(1)
    expect(badges[0].closest('.benchmark-card')?.querySelector('.benchmark-model')?.textContent).toBe('Beta')
    expect(badges[0].textContent).toBe('3 days old')
    expect(badges[0].querySelector('svg')).toBeTruthy()
  })
})

describe('publication age', () => {
  it('has subtle relative labels and an absolute UTC counterpart', () => {
    const now = Date.parse('2026-09-23T12:00:00Z')
    expect(publicationAge('2026-09-23T11:50:00Z', now)).toBe('today')
    expect(publicationAge('2026-09-23T09:00:00Z', now)).toBe('3 hrs ago')
    expect(publicationAge('2026-09-22T12:00:00Z', now)).toBe('1 day ago')
    expect(publicationAge('2026-09-17T12:00:00Z', now)).toBe('6 days ago')
    expect(publicationAge('2026-09-24T12:00:00Z', now)).toBe('today')
    expect(absoluteDate('2026-09-23T09:00:00Z')).toContain('UTC')
  })
})

describe('model benchmarks page', () => {
  it('renders both URL spellings and canonicals to the one that answers 200', () => {
    const { rerender } = render(<Router pathname="/model-benchmarks" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('trust me bro')
    rerender(<Router pathname="/model-benchmarks/" />)
    expect(document.querySelector('.benchmark-table')).toBeTruthy()
    expect(modelBenchmarksMetadata.canonicalPath).toBe('/model-benchmarks/')
  })
  it('shows each model’s facts on its card, every claim linked to its post, with no popover', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const card = cardOf('Alpha')
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    expect(card.querySelector('button')).toBeNull()
    const links = [...card.querySelectorAll('a')]
    expect(links.map(link => link.textContent)).toEqual(['#1 Agent Arena, Max effort4.5 points ahead of #2 Fable (High) in real users’ agent sessions↗', 'Still #1 after Beta launched.↗', 'Strong on coding.↗', 'Limited evidence elsewhere.↗'])
    expect(links.map(link => link.getAttribute('href'))).toEqual(['100', '100', '100', '200'].map(id => `https://x.com/researcher/status/${id}`))
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.querySelector('[aria-hidden="true"]')?.textContent).toBe('↗')
    }
  })
  it('keeps first-party fallback and accessible publication times when embeds fail', async () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    expect(await screen.findByText('Reviewed finding 100')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Read post on X/ })).toHaveLength(3)
    expect(screen.getAllByLabelText(/Published September 2[12], 2026/)).toHaveLength(3)
  })
  it('automatically requests compact official embeds with privacy options', async () => {
    const createTweet = vi.fn().mockResolvedValue(undefined)
    window.twttr = { widgets: { createTweet } }
    render(<ModelBenchmarksPage catalog={fixture} />)
    await vi.waitFor(() => expect(createTweet).toHaveBeenCalledTimes(3))
    expect(createTweet.mock.calls[0][2]).toMatchObject({ dnt: true, conversation: 'none', width: 330 })
    expect(screen.queryByRole('button', { name: 'Load X embeds' })).toBeNull()
    expect(screen.getByText('Reviewed finding 100')).toBeTruthy()
  })
  it('shows only embeds and compact metadata on successful load, not curator essays', async () => {
    window.twttr = { widgets: { createTweet: vi.fn().mockResolvedValue(document.createElement('iframe')) } }
    render(<ModelBenchmarksPage catalog={fixture} />)
    await vi.waitFor(() => expect(screen.queryByText('Loading post…')).toBeNull())
    expect(screen.queryByText('Reviewed finding 100')).toBeNull()
    expect(screen.queryByText('Happy’s read')).toBeNull()
    expect(screen.queryByText('How we curate this')).toBeNull()
    expect(screen.queryByText(/provider-reported/i)).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByText('Alpha', { selector: 'article *' })).toBeNull()
    expect(screen.getByRole('link', { name: /pipeline/ }).getAttribute('href')).toContain('model-benchmarks-refresh')
  })
  it('shows the leader’s lead check once, as the first bullet on its card with the recheck date', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const notes = notesOf('Alpha')
    expect(notes.querySelector('li')?.textContent).toBe('Still #1 after Beta launched.↗ Rechecked Sep 23.')
    expect(notes.querySelectorAll('li')).toHaveLength(3)
    expect(screen.getAllByText(/still #1/i)).toHaveLength(1)
  })
  it('nests S in a one-row table, a labelled column per lane, and never renders an empty tier', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const rows = [...document.querySelectorAll('.benchmark-table > tbody > tr')]
    expect(rows.map(row => row.querySelector(':scope > th')?.textContent)).toEqual(['S', 'B'])
    // Every row is a tier letter and one cell, so the letter column is one width for all tiers.
    for (const row of rows) expect(row.querySelectorAll(':scope > td')).toHaveLength(1)
    const lanes = rows[0].querySelector(':scope > td > table.benchmark-lane-table')!
    expect([...lanes.querySelectorAll('thead th')].map(th => [th.textContent, th.getAttribute('scope')])).toEqual([['Frontier', 'col'], ['Chores', 'col']])
    expect(lanes.querySelectorAll(':scope > tbody > tr')).toHaveLength(1)
    expect([...lanes.querySelectorAll('tbody td')].map(cell => [cell.className, [...cell.querySelectorAll('.benchmark-model')].map(name => name.textContent)]))
      .toEqual([['benchmark-lane benchmark-lane-frontier', ['Alpha']], ['benchmark-lane benchmark-lane-chores', ['Beta']]])
    expect((lanes.querySelector('thead th') as HTMLElement).style.getPropertyValue('--cards')).toBe('1')
    expect(document.querySelector('[style*="writing-mode"], .benchmark-lane-label span')).toBeNull()
    expect(screen.queryByText('—')).toBeNull()
    expect(screen.queryByText(/Unranked/)).toBeNull()
  })
  it('renders a single S lane across the row when the other is empty', () => {
    render(<ModelBenchmarksPage catalog={{ ...fixture, models: fixture.models.map(model => model.id === 'test/beta' ? { ...model, tier: 'A' as const, lane: undefined } : model) }} />)
    const lanes = document.querySelector('.benchmark-tier-s .benchmark-lane-table')!
    expect([...lanes.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['Frontier'])
    expect(lanes.querySelectorAll('tbody td')).toHaveLength(1)
  })
  it('puts S cards on the card columns of the rows below: lane rules fall in the card gaps', () => {
    // jsdom has no layout; the screenshot check measures the x positions. This pins the arithmetic:
    // a gap is a cell's padding, the 1px rule and the next cell's padding, and the Frontier
    // column spans whole card columns, so Chores starts on the next card column.
    const css = readFileSync('src/model-benchmarks.css', 'utf8')
    expect(css).toContain('--card-gap: calc(2 * var(--cell-pad) + 1px)')
    expect(css).toMatch(/\.benchmark-models \{[^}]*gap: [^;]* var\(--card-gap\)/)
    expect(css).toMatch(/th\.benchmark-lane-label-frontier \{ box-sizing: border-box; width: calc\(var\(--cards\) \* \(var\(--card-width\) \+ var\(--card-gap\)\)\); \}/)
    expect(css).toMatch(/\.benchmark-table td \{ padding: var\(--cell-pad\);/)
    expect(css).toMatch(/\.benchmark-table td\.benchmark-lanes \{ padding: 0; \}/)
  })
  it('shows no lead bullet when the leader has no lead check', () => {
    render(<ModelBenchmarksPage catalog={{ ...fixture, models: fixture.models.map(({ leadCheck: _leadCheck, ...model }) => model) }} />)
    expect(screen.queryByText(/still #1/i)).toBeNull()
    expect(document.querySelector('.benchmark-note-lead')).toBeNull()
  })
  it('has no filter: no toggles, no selection, no tier headings over the posts', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByText('Clear selection')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['Posts, newest first'])
  })
})
