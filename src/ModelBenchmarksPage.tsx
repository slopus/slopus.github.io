import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { absoluteDate, arenaGap, benchmarkCatalog, LANES, leaderOf, newModelAge, publicationAge, shortDate, TIERS, wallSources, type BenchmarkCatalog, type RankedModel } from './modelBenchmarks'
import { XPostEmbed } from './XPostEmbed'
import './model-benchmarks.css'

/** Hyphenated words ("GPT-6", "Coding-agent") never break at the hyphen. */
function keepHyphens(text: string) {
  return text.split(/(\S+-\S+)/).map((part, index) => index % 2 ? <span key={index} className="benchmark-claim-end">{part}</span> : part)
}

/** Text whose last word carries the raised link arrow, never wrapped onto a line of its own. */
function withArrow(text: string) {
  const lastWord = text.lastIndexOf(' ') + 1
  return <>{keepHyphens(text.slice(0, lastWord))}<span className="benchmark-claim-end">{text.slice(lastWord)}<span className="benchmark-claim-arrow" aria-hidden="true">↗</span></span></>
}

/** Lucide's `baby` icon (ISC license). */
function BabyIcon() {
  return <svg className="benchmark-new-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    <path d="M15 12h.01" />
    <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    <path d="M9 12h.01" />
  </svg>
}

/**
 * Two-column masonry that never splits a post: each post spans as many 4px grid rows as it is
 * tall, measured as its embed loads, so grid auto-placement keeps date order across the columns.
 */
function useMasonry() {
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = list.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const fit = (item: HTMLElement) => {
      const content = item.firstElementChild as HTMLElement | null
      if (content) item.style.gridRowEnd = `span ${Math.ceil(content.getBoundingClientRect().height / 4) + 7}`
    }
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) fit((entry.target as HTMLElement).parentElement!)
    })
    for (const item of element.children) observer.observe((item as HTMLElement).firstElementChild!)
    return () => observer.disconnect()
  }, [])
  return list
}

export default function ModelBenchmarksPage({ catalog = benchmarkCatalog }: { catalog?: BenchmarkCatalog }) {
  // Read once at page load, so badge ages and post ages stay current without a redeploy.
  const [now] = useState(() => Date.now())
  const wall = wallSources(catalog)
  const masonry = useMasonry()
  const leader = leaderOf(catalog)
  const board = catalog.sources.find(source => source.id === catalog.arenaBoard.sourceId)
  const sourceUrl = (id: string) => catalog.sources.find(source => source.id === id)?.url ?? `https://x.com/i/status/${id}`

  /** A claim linked to its post. The arrow stays on the line of the claim's last word. */
  function claim(sourceId: string, text: string, lead?: ReactNode) {
    return <a className={lead ? 'benchmark-claim benchmark-headline' : 'benchmark-claim'} href={sourceUrl(sourceId)} target="_blank" rel="noopener noreferrer">
      {lead}{lead ? <span className="benchmark-headline-gap">{withArrow(text)}</span> : withArrow(text)}
    </a>
  }

  function card(model: RankedModel) {
    const notesId = `notes-${model.id.replaceAll('/', '-')}`
    const age = newModelAge(model.releasedAt, now)
    const leadCheck = model === leader ? model.leadCheck : undefined
    return <div className="benchmark-card" key={model.id}>
      {age === undefined ? null : <span className="benchmark-new" title={`Released ${absoluteDate(model.releasedAt)}`}>
        <BabyIcon />{age} {age === 1 ? 'day' : 'days'} old
      </span>}
      <div className="benchmark-card-title">
        <strong className="benchmark-model" id={`${notesId}-name`}>{model.name}</strong>
      </div>
      {model.arena
        ? claim(catalog.arenaBoard.sourceId, arenaGap(catalog.arenaBoard, model.arena), <span className="benchmark-headline-rank">
          <strong>#{model.arena.rank}</strong> Agent Arena, {model.arena.effort} effort
        </span>)
        : <p className="benchmark-headline benchmark-headline-missing">Not on Agent Arena yet</p>}
      <ul id={notesId} aria-labelledby={`${notesId}-name`}>
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
          <caption className="benchmark-sr-only">S splits into Frontier, for hard work, and Chores, the best value for routine work.</caption>
          <tbody>{TIERS.map(tier => {
            const models = catalog.models.filter(model => model.tier === tier)
            if (!models.length) return null
            const lanes = tier === 'S'
              ? LANES.map(lane => ({ lane, models: models.filter(model => model.lane === lane) })).filter(cell => cell.models.length)
              : []
            return <tr key={tier} className={`benchmark-tier benchmark-tier-${tier.toLowerCase()}`}>
              <th scope="row"><span>{tier}</span></th>
              {lanes.length
                ? <td className="benchmark-lanes">
                  {/* One row, one column per lane; each lane's cards start on a card column of the rows below. */}
                  <table className="benchmark-lane-table">
                    <thead><tr>{lanes.map(cell => <th key={cell.lane} scope="col" className={`benchmark-lane-label benchmark-lane-label-${cell.lane}`} style={{ '--cards': cell.models.length } as CSSProperties}>{cell.lane === 'frontier' ? 'Frontier' : 'Chores'}</th>)}</tr></thead>
                    <tbody><tr>{lanes.map(cell => <td key={cell.lane} className={`benchmark-lane benchmark-lane-${cell.lane}`}>
                      <div className="benchmark-models">{cell.models.map(card)}</div>
                    </td>)}</tr></tbody>
                  </table>
                </td>
                : <td><div className="benchmark-models">{models.map(card)}</div></td>}
            </tr>
          })}</tbody>
        </table>
        {board ? <p className="benchmark-legend">
          Big number: rank on <a className="benchmark-claim" href={board.url} target="_blank" rel="noopener noreferrer">{withArrow(`Arena’s Agent Arena board of ${shortDate(board.publishedAt)}`)}</a>, at the effort shown. Arena scores how much better real users’ agent sessions go with a model than with the average model; the line below is the gap in percentage points of that score. Intelligence Index: Artificial Analysis’s ten tests of reasoning, knowledge and agent work. Its coding-agent index scores each model in its own coding agent on three agentic coding tests; FrontierCode is Cognition’s test of merge-ready code.
        </p> : null}

        <section className="benchmark-evidence" aria-label="Source posts" id="benchmark-evidence">
          <h2 className="benchmark-sr-only">Posts, newest first</h2>
          <div className="benchmark-source-list" ref={masonry}>{wall.map(source => <article className="benchmark-source" key={source.id} aria-label={`Post by ${source.author}`}>
            <div>
              <XPostEmbed postId={source.id} fallback={<div className="benchmark-fallback">
                <a href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.author}</strong><span>@{source.handle}</span></a>
                <p>{source.summary}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="benchmark-fallback-link">Read post on X ↗</a>
              </div>} />
              <footer>
                <time dateTime={source.publishedAt} title={absoluteDate(source.publishedAt)} aria-label={`Published ${absoluteDate(source.publishedAt)}`}>{publicationAge(source.publishedAt, now)}</time>
              </footer>
            </div>
          </article>)}</div>
        </section>
      </main>
    </div>
  )
}
