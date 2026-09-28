import { useState } from 'react'
import { SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { absoluteDate, benchmarkCatalog, publicationAge, selectSources, TIERS, type BenchmarkCatalog } from './modelBenchmarks'
import { XPostEmbed } from './XPostEmbed'
import './model-benchmarks.css'

export default function ModelBenchmarksPage({ catalog = benchmarkCatalog }: { catalog?: BenchmarkCatalog }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dismissedNotes, setDismissedNotes] = useState<string>()
  const [now] = useState(() => Date.now())
  const sources = selectSources(catalog, selected)

  function toggleModel(id: string) {
    setSelected(previous => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="benchmark-page">
      <SiteHeader product={HAPPY_DESKTOP} />
      <main className="benchmark-main page-width">
        <header className="benchmark-heading">
          <h1>The <em>trust me bro</em> tier list.</h1>
          <div className="benchmark-meta">
            <span>Updated <time dateTime={catalog.updatedAt} title={absoluteDate(catalog.updatedAt)}>{new Date(catalog.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></span>
            <span aria-hidden="true">·</span>
            <a href="https://github.com/slopus/slopus.github.io/tree/main/.agents/skills/model-benchmarks-refresh" target="_blank" rel="noopener noreferrer">pipeline <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <table className="benchmark-table">
          <caption className="benchmark-sr-only">Select models to filter posts. Hover or focus for notes. Unranked means insufficient evidence.</caption>
          <tbody>{TIERS.map(tier => {
            const models = catalog.models.filter(model => model.tier === tier)
            return <tr key={tier} className={`benchmark-tier benchmark-tier-${tier.toLowerCase()}`} data-empty={models.length === 0}>
              <th scope="row"><span>{tier}</span></th>
              <td>{models.length ? <div className="benchmark-models">{models.map(model => <div className="benchmark-model-wrap" key={model.id} data-notes-hidden={dismissedNotes === model.id} onMouseEnter={() => setDismissedNotes(undefined)}>
                <button type="button" className="benchmark-model" aria-pressed={selected.has(model.id)} aria-describedby={`notes-${model.id.replaceAll('/', '-')}`} onFocus={() => setDismissedNotes(undefined)} onKeyDown={event => { if (event.key === 'Escape') setDismissedNotes(model.id) }} onClick={() => toggleModel(model.id)}>
                  {model.name}<span aria-hidden="true">{selected.has(model.id) ? '−' : '+'}</span>
                </button>
                <div className="benchmark-tooltip" role="tooltip" id={`notes-${model.id.replaceAll('/', '-')}`}>
                  <strong>{model.name}</strong>
                  <ul>{model.points.map((point, index) => <li key={point} className={index === model.points.length - 1 ? 'benchmark-note-caveat' : undefined}>{point}</li>)}</ul>
                </div>
              </div>)}</div> : <span className="benchmark-empty-tier">—</span>}</td>
            </tr>
          })}</tbody>
        </table>

        <section className="benchmark-evidence" aria-label="Source posts" id="benchmark-evidence">
          <div className="benchmark-filters">
            <p role="status" className="benchmark-sr-only">{sources.length} {sources.length === 1 ? 'post' : 'posts'}</p>
            {selected.size ? <button type="button" className="benchmark-text-button" onClick={() => setSelected(new Set())}>Clear selection</button> : null}
          </div>
          {sources.length ? <div className="benchmark-source-list">{sources.map(source => <article className="benchmark-source" key={source.id} aria-label={`Post by ${source.author}`}>
            <XPostEmbed postId={source.id} fallback={<div className="benchmark-fallback">
              <a href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.author}</strong><span>@{source.handle}</span></a>
              <p>{source.summary}</p>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="benchmark-fallback-link">Read post on X ↗</a>
            </div>} />
            <footer>
              <time dateTime={source.publishedAt} title={absoluteDate(source.publishedAt)} aria-label={`Published ${absoluteDate(source.publishedAt)}`}>{publicationAge(source.publishedAt, now)}</time>
            </footer>
          </article>)}</div> : <p className="benchmark-no-evidence">No reviewed posts match this selection.</p>}
        </section>
      </main>
    </div>
  )
}