import { Fragment, useState, type CSSProperties, type ReactNode } from 'react'
import { SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { absoluteDate, benchmarkCatalog, groupSourcesByTier, LANES, leaderOf, newModelAge, publicationAge, selectSources, shortDate, TIERS, type BenchmarkCatalog, type RankedModel } from './modelBenchmarks'
import { XPostEmbed } from './XPostEmbed'
import './model-benchmarks.css'

/** Lucide's `baby` icon (ISC license). */
function BabyIcon() {
  return <svg className="benchmark-new-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    <path d="M15 12h.01" />
    <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    <path d="M9 12h.01" />
  </svg>
}

export default function ModelBenchmarksPage({ catalog = benchmarkCatalog }: { catalog?: BenchmarkCatalog }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  // Read once at page load, so badge ages and post ages stay current without a redeploy.
  const [now] = useState(() => Date.now())
  const sources = selectSources(catalog, selected)
  const groups = groupSourcesByTier(catalog, sources, selected)
  const leader = leaderOf(catalog)
  const sourceUrl = (id: string) => catalog.sources.find(source => source.id === id)?.url ?? `https://x.com/i/status/${id}`

  function toggleModel(id: string) {
    setSelected(previous => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /** A claim linked to its post. The arrow stays on the line of the claim's last word. */
  function claim(sourceId: string, text: string, lead?: ReactNode) {
    const lastWord = text.lastIndexOf(' ') + 1
    return <a className={lead ? 'benchmark-claim benchmark-headline' : 'benchmark-claim'} href={sourceUrl(sourceId)} target="_blank" rel="noopener noreferrer">
      {lead}{text.slice(0, lastWord)}<span className="benchmark-claim-end">{text.slice(lastWord)}<span className="benchmark-claim-arrow" aria-hidden="true">↗</span></span>
    </a>
  }

  function card(model: RankedModel) {
    const notesId = `notes-${model.id.replaceAll('/', '-')}`
    const age = newModelAge(model.releasedAt, now)
    const leadCheck = model === leader ? model.leadCheck : undefined
    return <div className="benchmark-card" key={model.id} data-selected={selected.has(model.id)}>
      {age === undefined ? null : <span className="benchmark-new" title={`Released ${absoluteDate(model.releasedAt)}`}>
        <BabyIcon />{age}d<span className="benchmark-sr-only"> since release</span>
      </span>}
      <button type="button" className="benchmark-model" aria-pressed={selected.has(model.id)} aria-describedby={notesId} onClick={() => toggleModel(model.id)}>{model.name}</button>
      {claim(model.headline.sourceId, model.headline.label, <><strong>{model.headline.value}</strong> </>)}
      <ul id={notesId}>
        {leadCheck ? <li className="benchmark-note-lead">
          {claim(leadCheck.sourceIds[0], leadCheck.note)} Rechecked <time dateTime={leadCheck.reconfirmedAt}>{shortDate(leadCheck.reconfirmedAt)}</time>.
        </li> : null}
        {model.points.map((point, index) => <li key={point.text} className={index === model.points.length - 1 ? 'benchmark-note-caveat' : undefined}>{claim(point.sourceId, point.text)}</li>)}
      </ul>
    </div>
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
          <caption className="benchmark-sr-only">Select models to filter posts. S splits into Frontier, for hard work, and Chores, the best value for routine work.</caption>
          <tbody>{TIERS.map(tier => {
            const models = catalog.models.filter(model => model.tier === tier)
            if (!models.length) return null
            const lanes = tier === 'S'
              ? LANES.map(lane => ({ lane, models: models.filter(model => model.lane === lane) })).filter(cell => cell.models.length)
              : []
            return <tr key={tier} className={`benchmark-tier benchmark-tier-${tier.toLowerCase()}`}>
              <th scope="row"><span>{tier}</span></th>
              {lanes.length
                ? lanes.map(cell => <Fragment key={cell.lane}>
                  <td className={`benchmark-lane-label benchmark-lane-label-${cell.lane}`}><span>{cell.lane === 'frontier' ? 'Frontier' : 'Chores'}</span></td>
                  <td colSpan={lanes.length === 1 ? 3 : undefined} className={`benchmark-lane benchmark-lane-${cell.lane}`} style={{ '--cards': cell.models.length } as CSSProperties}>
                    <div className="benchmark-models">{cell.models.map(card)}</div>
                  </td>
                </Fragment>)
                : <td colSpan={4}><div className="benchmark-models">{models.map(card)}</div></td>}
            </tr>
          })}</tbody>
        </table>

        <section className="benchmark-evidence" aria-label="Source posts" id="benchmark-evidence">
          <div className="benchmark-filters">
            <p role="status" className="benchmark-sr-only">{sources.length} {sources.length === 1 ? 'post' : 'posts'}</p>
            {selected.size ? <button type="button" className="benchmark-text-button" onClick={() => setSelected(new Set())}>Clear selection</button> : null}
          </div>
          {groups.length ? groups.map(group => <section className={`benchmark-source-group benchmark-source-group-${group.tier.toLowerCase()}`} key={group.tier} aria-labelledby={`posts-${group.tier}`}>
            <h2 id={`posts-${group.tier}`} className="benchmark-group-heading">
              <span className="benchmark-group-tier">{group.tier}</span>
              <span className="benchmark-sr-only">{' tier: '}</span>
              {catalog.models.filter(model => model.tier === group.tier && (selected.size === 0 || selected.has(model.id))).map(model => model.name).join(' · ')}
            </h2>
            <div className="benchmark-source-list">{group.sources.map(source => <article className="benchmark-source" key={source.id} aria-label={`Post by ${source.author}`}>
              <XPostEmbed postId={source.id} fallback={<div className="benchmark-fallback">
                <a href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.author}</strong><span>@{source.handle}</span></a>
                <p>{source.summary}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="benchmark-fallback-link">Read post on X ↗</a>
              </div>} />
              <footer>
                <time dateTime={source.publishedAt} title={absoluteDate(source.publishedAt)} aria-label={`Published ${absoluteDate(source.publishedAt)}`}>{publicationAge(source.publishedAt, now)}</time>
              </footer>
            </article>)}</div>
          </section>) : <p className="benchmark-no-evidence">No reviewed posts match this selection.</p>}
        </section>
      </main>
    </div>
  )
}
