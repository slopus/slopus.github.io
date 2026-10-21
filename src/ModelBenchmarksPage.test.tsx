import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ModelBenchmarksPage from './ModelBenchmarksPage'
import { absoluteDate, benchmarkCatalog, labOf, LANES, leaderOf, MAJOR_LABS, MAX_S_MODELS, MAX_SHOWN_MODELS, publicationAge, selectSources, TIERS, type BenchmarkCatalog, type BenchmarkSource } from './modelBenchmarks'
import { Router } from './Router'
import { modelBenchmarksMetadata } from './siteMetadata'

const source = (id: string, modelIds: string[], comparisonModelIds: string[] = []): BenchmarkSource => ({
  id, url: `https://x.com/researcher/status/${id}`, author: `Researcher ${id}`, handle: 'researcher',
  publishedAt: '2026-09-22T12:00:00Z', verifiedAt: '2026-09-23T10:00:00Z', kind: 'independent',
  summary: `Reviewed finding ${id}`, caveat: 'Scoped evaluation.', modelIds, comparisonModelIds,
  scope: { task: 'Coding', harness: 'Declared harness', effort: 'high' }, verification: { method: 'X oEmbed', text: 'Exact text verified.' },
})
const fixture: BenchmarkCatalog = {
  schemaVersion: 2, revision: 'test.1', updatedAt: '2026-09-23T10:00:00Z', evidenceCutoff: '2026-09-23T10:00:00Z', reviewNote: 'Reviewed fixture.',
  models: [
    { id: 'test/alpha', name: 'Alpha', tier: 'S', lane: 'frontier', points: ['Strong on coding.', 'Limited evidence elsewhere.'], sourceIds: ['100', '200'], rationale: 'Fixture.',
      leadCheck: { reconfirmedAt: '2026-09-23', heldAgainst: ['test/beta'], sourceIds: ['100'], note: 'Still #1 after Beta launched.', reason: 'Fixture head-to-head.' } },
    { id: 'test/beta', name: 'Beta', tier: 'S', lane: 'chores', points: ['Useful for small tasks.', 'Effort matters.'], sourceIds: ['100', '300'], rationale: 'Fixture.' },
    { id: 'test/gamma', name: 'Gamma', tier: 'B', points: ['Narrow evidence.', 'Fixture caveat.'], sourceIds: [], rationale: 'Fixture without posts.' },
  ],
  notShown: [],
  sources: [source('300', ['test/beta']), source('100', ['test/alpha', 'test/beta'], ['test/alpha', 'test/beta']), { ...source('200', ['test/alpha']), kind: 'provider-reported' }],
}
// jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
beforeAll(() => { vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }) })
afterAll(() => { vi.unstubAllGlobals() })
beforeEach(() => { window.twttr = { widgets: { createTweet: vi.fn().mockResolvedValue(undefined) } } })
afterEach(() => { cleanup(); delete window.twttr; vi.restoreAllMocks() })

describe('reviewed catalog integrity', () => {
  it('has unique exact models with at most four reviewed posts each', () => {
    expect(benchmarkCatalog.schemaVersion).toBe(2)
    expect(new Set(benchmarkCatalog.models.map(model => model.id)).size).toBe(benchmarkCatalog.models.length)
    for (const model of benchmarkCatalog.models) {
      expect(model.id).toMatch(/^[a-z0-9]+\/[a-z0-9.-]+$/)
      expect(TIERS).toContain(model.tier)
      expect(model.sourceIds.length).toBeGreaterThan(0)
      expect(model.sourceIds.length).toBeLessThanOrEqual(4)
      expect(new Set(model.sourceIds).size).toBe(model.sourceIds.length)
      expect(model.points.length).toBeGreaterThanOrEqual(2)
      expect(model.points.length + (model.leadCheck ? 1 : 0)).toBeLessThanOrEqual(3)
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

describe('stable filtering', () => {
  it('shows all sources in editorial order without a selection', () => {
    expect(selectSources(fixture, new Set()).map(entry => entry.id)).toEqual(['300', '100', '200'])
  })
  it('returns a deduplicated union independent of click order', () => {
    expect(selectSources(fixture, new Set(['test/alpha'])).map(entry => entry.id)).toEqual(['100', '200'])
    expect(selectSources(fixture, new Set(['test/beta', 'test/alpha'])).map(entry => entry.id)).toEqual(['300', '100', '200'])
  })
  it('does not show unrelated evidence for a model without posts', () => {
    expect(selectSources(fixture, new Set(['test/gamma']))).toEqual([])
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
    expect(screen.getByRole('table')).toBeTruthy()
    expect(modelBenchmarksMetadata.canonicalPath).toBe('/model-benchmarks/')
  })
  it('supports accessible notes, multi-selection and clearing', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const alpha = screen.getByRole('button', { name: 'Alpha' })
    expect(document.getElementById(alpha.getAttribute('aria-describedby')!)?.textContent).toContain('Strong on coding.')
    fireEvent.click(alpha)
    expect(alpha.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('2 posts')
    fireEvent.keyDown(alpha, { key: 'Escape' })
    expect(alpha.parentElement?.getAttribute('data-notes-hidden')).toBe('true')
    fireEvent.mouseEnter(alpha.parentElement!)
    expect(alpha.parentElement?.getAttribute('data-notes-hidden')).toBe('false')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Beta' }))
    expect(screen.getAllByRole('article')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }))
    expect(screen.getByRole('status').textContent).toBe('2 posts')
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(screen.getByRole('status').textContent).toBe('3 posts')
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })
  it('keeps first-party fallback and accessible publication times when embeds fail', async () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    expect(await screen.findByText('Reviewed finding 100')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Read post on X/ })).toHaveLength(3)
    expect(screen.getAllByLabelText(/Published September 22, 2026/)).toHaveLength(3)
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
    expect(screen.getByRole('status').className).toBe('benchmark-sr-only')
    expect(screen.queryByText('Alpha', { selector: 'article *' })).toBeNull()
    expect(screen.getByRole('link', { name: /pipeline/ }).getAttribute('href')).toContain('model-benchmarks-refresh')
  })
  it('shows the leader’s lead check as one line and a first hover bullet', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const line = screen.getByText(/Alpha still #1/)
    expect(line.textContent).toBe('Alpha still #1 · rechecked vs Beta, Sep 23')
    expect(line.closest('td')?.className).toContain('benchmark-lane-frontier')
    const notes = document.getElementById(screen.getByRole('button', { name: 'Alpha' }).getAttribute('aria-describedby')!)!
    expect(notes.querySelector('li')?.textContent).toBe('Still #1 after Beta launched.')
    expect(notes.querySelectorAll('li')).toHaveLength(3)
    expect(screen.getAllByText(/still #1/)).toHaveLength(1)
  })
  it('splits S into Frontier and Chores and never renders an empty tier', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    const rows = screen.getAllByRole('row')
    expect(rows.map(row => row.querySelector('th')?.textContent)).toEqual(['S', 'B'])
    const [frontier, chores] = rows[0].querySelectorAll('td')
    expect(frontier.textContent).toContain('Frontier')
    expect(frontier.textContent).toContain('Alpha')
    expect(chores.textContent).toContain('Chores')
    expect(chores.textContent).toContain('Beta')
    expect(rows[1].querySelector('td')?.getAttribute('colspan')).toBe('2')
    expect(screen.queryByText('—')).toBeNull()
    expect(screen.queryByText(/Unranked/)).toBeNull()
  })
  it('renders a single S lane across the row when the other is empty', () => {
    render(<ModelBenchmarksPage catalog={{ ...fixture, models: fixture.models.map(model => model.id === 'test/beta' ? { ...model, tier: 'A' as const, lane: undefined } : model) }} />)
    const s = screen.getAllByRole('row')[0]
    expect(s.querySelectorAll('td')).toHaveLength(1)
    expect(s.querySelector('td')?.getAttribute('colspan')).toBe('2')
    expect(s.textContent).toContain('Frontier')
    expect(s.textContent).not.toContain('Chores')
  })
  it('shows no lead line when the leader has no lead check', () => {
    render(<ModelBenchmarksPage catalog={{ ...fixture, models: fixture.models.map(({ leadCheck: _leadCheck, ...model }) => model) }} />)
    expect(screen.queryByText(/still #1/)).toBeNull()
  })
  it('explains no matches without adding filler sources', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gamma' }))
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('No reviewed posts match this selection.')).toBeTruthy()
  })
})