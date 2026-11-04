import { useEffect, useState } from 'react'
import { GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { DownloadOptions, MobileDownloads } from './DownloadOptions'
import { GrainGradient, SITE_SURFACE } from './GrainGradient'
import { channelDesktopDownloads, GITHUB_RELEASES, releaseNotesUrl, type DesktopDownloads, type MacArchitecture, type ReleaseChannel } from './desktopDownloads'
import './happy-one.css'
import './releases.css'

const CHANNELS = [
  { value: 'stable', label: 'Stable', note: 'Production releases for macOS, Windows, and Linux.' },
  { value: 'preview', label: 'Preview', note: 'Help us test Happy by installing a preview build. Happy Nightly installs beside Happy.' },
] as const satisfies ReadonlyArray<{ value: ReleaseChannel; label: string; note: string }>

/** The name and the date each stay on one line; a phone wraps between them. The notes link gets a line of its own. */
function releaseLine(channel: ReleaseChannel, downloads: DesktopDownloads) {
  const name = <span>{channel === 'preview' ? 'Happy Nightly' : 'Happy'} {downloads.tag.slice(1)}</span>
  const notes = <a href={releaseNotesUrl(downloads.tag)}>Release notes</a>
  if (!downloads.publishedAt) return <>{name}{notes}</>
  const date = new Date(downloads.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return <>{name} · <span>{date}</span>{notes}</>
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

/** Both channels reserve their height so switching never moves the shared phone apps. */
export default function ReleasesPage() {
  const [selectedChannel, setSelectedChannel] = useState<ReleaseChannel>('stable')
  // Both channels' Mac downloads follow one architecture choice.
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="site-shell happy-one releases-page site-theme">
      <GrainGradient surface={SITE_SURFACE} className="site-grain" />
      <SiteHeader product={HAPPY_DESKTOP} />
      <main className="releases-main page-width">
        <h1>Download Happy</h1>
        <div className="releases-toggle" role="radiogroup" aria-label="Release channel">
          {CHANNELS.map(channel => (
            <label key={channel.value}>
              <input type="radio" name="release-channel" value={channel.value}
                checked={selectedChannel === channel.value} aria-controls={`releases-panel-${channel.value}`}
                onChange={() => setSelectedChannel(channel.value)} />
              <span id={`releases-${channel.value}`}>{channel.label}</span>
            </label>
          ))}
        </div>
        <div className="releases-channels">
          {CHANNELS.map(channel => (
            <section key={channel.value} id={`releases-panel-${channel.value}`} className="releases-channel"
              aria-labelledby={`releases-${channel.value}`} aria-hidden={selectedChannel !== channel.value}
              inert={selectedChannel !== channel.value} data-active={selectedChannel === channel.value}>
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
