import { useState } from 'react'
import { GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { DownloadOptions, MobileDownloads, useDesktopDownloadSelection } from './DownloadOptions'
import { GrainGradient, SITE_SURFACE } from './GrainGradient'
import { GITHUB_RELEASES, releaseNotesUrl, type DesktopDownloads, type MacArchitecture, type ReleaseChannel } from './desktopDownloads'
import './happy-one.css'
import './releases.css'

const CHANNELS = [
  { value: 'stable', label: 'Stable', note: 'Production releases for macOS, Windows, and Linux.' },
  { value: 'preview', label: 'Preview', note: 'Help us test Happy. Happy Nightly installs beside Happy.' },
] as const satisfies ReadonlyArray<{ value: ReleaseChannel; label: string; note: string }>

/** The name and the date each stay on one line; a phone wraps between them. The notes link gets a line of its own. */
function releaseLine(channel: ReleaseChannel, downloads: DesktopDownloads, primaryStandard: boolean) {
  const name = <span>{channel === 'preview' && !primaryStandard ? 'Happy Nightly' : 'Happy'} {downloads.tag.slice(1)}</span>
  const notes = <a href={releaseNotesUrl(downloads.tag)}>Release notes</a>
  if (!downloads.publishedAt) return <>{name}{notes}</>
  const date = new Date(downloads.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return <>{name} · <span>{date}</span>{notes}</>
}

function ReleasePanel({ channel, active, macArchitecture, onMacArchitectureChange }: {
  channel: typeof CHANNELS[number]; active: boolean; macArchitecture: MacArchitecture; onMacArchitectureChange: (architecture: MacArchitecture) => void
}) {
  const { downloads, loading, primaryStandard } = useDesktopDownloadSelection(channel.value, macArchitecture)
  return (
    <section id={`releases-panel-${channel.value}`} className="releases-channel"
      aria-labelledby={`releases-${channel.value}`} aria-hidden={!active} inert={!active} data-active={active}>
      <p className="releases-note">{primaryStandard ? 'Help us test Happy. This preview build replaces Happy.' : channel.note}</p>
      <p className="releases-version" aria-live="polite">
        {loading ? '' : downloads ? releaseLine(channel.value, downloads, primaryStandard) : 'The newest preview is listed on GitHub, below.'}
      </p>
      <DownloadOptions channel={channel.value} releasesLink={false} mobile={false}
        macArchitecture={macArchitecture} onMacArchitectureChange={onMacArchitectureChange} />
    </section>
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
      <main className="releases-main page-width" data-analytics-location="releases">
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
            <ReleasePanel key={channel.value} channel={channel} active={selectedChannel === channel.value}
              macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
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
