import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ModelBenchmarksPage from './ModelBenchmarksPage'
import { absoluteDate, benchmarkCatalog, publicationAge, selectSources, TIERS, type BenchmarkCatalog, type BenchmarkSource } from './modelBenchmarks'
import { Router } from './Router'
import { modelBenchmarksMetadata } from './siteMetadata'

const source = (id: string, modelIds: string[], comparisonModelIds: string[] = []): BenchmarkSource => ({
  id, url: `https://x.com/researcher/status/${id}`, author: `Researcher ${id}`, handle: 'researcher',
  publishedAt: '2026-09-22T12:00:00Z', verifiedAt: '2026-09-23T10:00:00Z', kind: 'independent',
  summary: `Reviewed finding ${id}`, caveat: 'Scoped evaluation.', modelIds, comparisonModelIds,
  scope: { task: 'Coding', harness: 'Declared harness', effort: 'high' }, verification: { method: 'X oEmbed', text: 'Exact text verified.' },
})
const fixture: BenchmarkCatalog = {
  schemaVersion: 1, revision: 'test.1', updatedAt: '2026-09-23T10:00:00Z', evidenceCutoff: '2026-09-23T10:00:00Z', reviewNote: 'Reviewed fixture.',
  models: [
    { id: 'test/alpha', name: 'Alpha', tier: 'S', points: ['Strong on coding.', 'Limited evidence elsewhere.'], sourceIds: ['100', '200'], rationale: 'Fixture.' },
    { id: 'test/beta', name: 'Beta', tier: 'A', points: ['Useful for small tasks.', 'Effort matters.'], sourceIds: ['100', '300'], rationale: 'Fixture.' },
    { id: 'test/gamma', name: 'Gamma', tier: 'Unranked', points: ['No reviewed source.', 'Not a negative judgment.'], sourceIds: [], rationale: 'Insufficient evidence.' },
  ],
  sources: [source('300', ['test/beta']), source('100', ['test/alpha', 'test/beta'], ['test/alpha', 'test/beta']), { ...source('200', ['test/alpha']), kind: 'provider-reported' }],
}
beforeEach(() => { window.twttr = { widgets: { createTweet: vi.fn().mockResolvedValue(undefined) } } })
afterEach(() => { cleanup(); delete window.twttr; vi.restoreAllMocks() })

describe('reviewed catalog integrity', () => {
  it('has ten unique exact models and at most four reviewed posts each', () => {
    expect(benchmarkCatalog.schemaVersion).toBe(1)
    expect(benchmarkCatalog.models).toHaveLength(10)
    expect(new Set(benchmarkCatalog.models.map(model => model.id)).size).toBe(10)
    for (const model of benchmarkCatalog.models) {
      expect(model.id).toMatch(/^(openai|anthropic|xai)\/[a-z0-9.-]+$/)
      expect(TIERS).toContain(model.tier)
      expect(model.sourceIds.length).toBeLessThanOrEqual(4)
      expect(new Set(model.sourceIds).size).toBe(model.sourceIds.length)
      expect(model.points.length).toBeGreaterThanOrEqual(2)
      expect(model.points.length).toBeLessThanOrEqual(3)
      expect(model.rationale.length).toBeGreaterThan(15)
      if (model.tier !== 'Unranked') expect(model.sourceIds.length).toBeGreaterThan(0)
      for (const id of model.sourceIds) expect(benchmarkCatalog.sources.find(entry => entry.id === id)?.modelIds).toContain(model.id)
    }
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
})

describe('stable filtering', () => {
  it('shows all sources in editorial order without a selection', () => {
    expect(selectSources(fixture, new Set()).map(entry => entry.id)).toEqual(['300', '100', '200'])
  })
  it('returns a deduplicated union independent of click order', () => {
    expect(selectSources(fixture, new Set(['test/alpha'])).map(entry => entry.id)).toEqual(['100', '200'])
    expect(selectSources(fixture, new Set(['test/beta', 'test/alpha'])).map(entry => entry.id)).toEqual(['300', '100', '200'])
  })
  it('does not show unrelated evidence for an uncovered model', () => {
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
  it('renders both URL spellings and defines the requested canonical URL', () => {
    const { rerender } = render(<Router pathname="/model-benchmarks" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('trust me bro')
    rerender(<Router pathname="/model-benchmarks/" />)
    expect(screen.getByRole('table')).toBeTruthy()
    expect(modelBenchmarksMetadata.canonicalPath).toBe('/model-benchmarks')
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
    expect(screen.getByRole('link', { name: /pipeline/ }).getAttribute('href')).toContain('model-benchmarks-refresh')
  })
  it('explains no matches without adding filler sources', () => {
    render(<ModelBenchmarksPage catalog={fixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gamma' }))
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('No reviewed posts match this selection.')).toBeTruthy()
  })
})