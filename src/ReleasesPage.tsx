import { useEffect, useState } from 'react'
import { GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { DownloadOptions, MobileDownloads } from './DownloadOptions'
import { channelDesktopDownloads, GITHUB_RELEASES, type DesktopDownloads, type MacArchitecture, type ReleaseChannel } from './desktopDownloads'
import './happy-one.css'
import './releases.css'

const CHANNELS = [
  { value: 'stable', label: 'Stable', note: 'Production releases for macOS, Windows, and Linux.' },
  { value: 'preview', label: 'Preview', note: 'Help us test Happy on macOS by installing the preview build.' },
] as const satisfies ReadonlyArray<{ value: ReleaseChannel; label: string; note: string }>

/** The name and the date each stay on one line; a phone wraps between them. */
function releaseLine(channel: ReleaseChannel, downloads: DesktopDownloads) {
  const name = <span>{channel === 'preview' ? 'Happy Nightly' : 'Happy'} {downloads.tag.slice(1)}</span>
  if (!downloads.publishedAt) return name
  const date = new Date(downloads.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return <>{name} · <span>{date}</span></>
}

function ReleaseVersion({ channel }: { channel: ReleaseChannel }) {
  // undefined while GitHub answers; null when it has no release to offer.
  const [downloads, setDownloads] = useState<DesktopDownloads | null | undefined>(undefined)
  useEffect(() => {
    let active = true
    void channelDesktopDownloads(channel).then(value => { if (active) setDownloads(value) })
    return () => { active = false }
  }, [channel])
  return (
    <p className="releases-version" aria-live="polite">
      {downloads === undefined ? '' : downloads ? releaseLine(channel, downloads) : 'The newest preview is listed on GitHub, below.'}
    </p>
  )
}

/** Stable and Preview side by side, the phone apps they share, and every release on GitHub. */
export default function ReleasesPage() {
  // Both columns' Mac downloads follow one architecture choice.
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="site-shell happy-one releases-page">
      <SiteHeader product={HAPPY_DESKTOP} />
      <main className="releases-main page-width">
        <h1>Download Happy.</h1>
        <div className="releases-channels">
          {CHANNELS.map(channel => (
            <section key={channel.value} className="releases-channel" aria-labelledby={`releases-${channel.value}`}>
              <h2 id={`releases-${channel.value}`}>{channel.label}</h2>
              <p className="releases-note">{channel.note}</p>
              <ReleaseVersion channel={channel.value} />
              <DownloadOptions channel={channel.value} releasesLink={false} mobile={false}
                macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
            </section>
          ))}
        </div>
        <section className="releases-mobile" aria-labelledby="releases-mobile">
          <h2 id="releases-mobile">Phone app</h2>
          <MobileDownloads />
        </section>
        <a className="releases-github" href={GITHUB_RELEASES}><GithubMark />All releases on GitHub</a>
      </main>
      <SiteFooter product={HAPPY_DESKTOP} />
    </div>
  )
}
