import { useEffect, useState } from 'react'
import { GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESKTOP } from './products'
import { DownloadOptions } from './DownloadOptions'
import { channelDesktopDownloads, GITHUB_RELEASES, type DesktopDownloads, type MacArchitecture, type ReleaseChannel } from './desktopDownloads'
import './happy-one.css'
import './releases.css'

const CHANNELS = [
  { value: 'stable', label: 'Stable', note: 'Production releases for macOS, Windows, and Linux.' },
  { value: 'preview', label: 'Preview', note: 'macOS builds ahead of Stable. Installs as Happy Nightly, beside Happy, and updates with every preview.' },
] as const satisfies ReadonlyArray<{ value: ReleaseChannel; label: string; note: string }>

/** `?channel=preview` opens on Preview, so a preview link can be shared. */
function requestedChannel(): ReleaseChannel {
  return new URLSearchParams(window.location.search).get('channel') === 'preview' ? 'preview' : 'stable'
}

/** The name and the date each stay on one line; a phone wraps between them. */
function releaseLine(channel: ReleaseChannel, downloads: DesktopDownloads) {
  const name = <span>{channel === 'preview' ? 'Happy Nightly' : 'Happy'} {downloads.tag.slice(1)}</span>
  if (!downloads.publishedAt) return name
  const date = new Date(downloads.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return <>{name} · <span>{date}</span></>
}

/** The download options for either release channel, and every release on GitHub. */
export default function ReleasesPage() {
  // The prerendered page is Stable; the address can ask for Preview once it hydrates.
  const [channel, setChannel] = useState<ReleaseChannel>('stable')
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  const [release, setRelease] = useState<{ channel: ReleaseChannel; downloads: DesktopDownloads | null } | null>(null)
  useEffect(() => setChannel(requestedChannel()), [])
  useEffect(() => {
    let active = true
    void channelDesktopDownloads(channel).then(downloads => { if (active) setRelease({ channel, downloads }) })
    return () => { active = false }
  }, [channel])

  const choose = (next: ReleaseChannel) => {
    setChannel(next)
    const url = new URL(window.location.href)
    if (next === 'preview') url.searchParams.set('channel', 'preview')
    else url.searchParams.delete('channel')
    window.history.replaceState(window.history.state, '', url)
  }

  const current = release?.channel === channel ? release : null
  const version = !current ? '' : current.downloads ? releaseLine(channel, current.downloads)
    : 'The newest preview is listed on GitHub, below.'

  return (
    <div className="site-shell happy-one releases-page">
      <SiteHeader product={HAPPY_DESKTOP} />
      <main className="releases-main page-width">
        <h1>Download Happy.</h1>
        <fieldset className="releases-channel">
          <legend className="one-download-sr">Release channel</legend>
          {CHANNELS.map(option => (
            <label key={option.value}>
              <input type="radio" name="release-channel" value={option.value}
                checked={channel === option.value} onChange={() => choose(option.value)} />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <p className="releases-note">{CHANNELS.find(option => option.value === channel)?.note}</p>
        <p className="releases-version" aria-live="polite">{version}</p>
        <DownloadOptions channel={channel} releasesLink={false} macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        <a className="releases-github" href={GITHUB_RELEASES}><GithubMark />All releases on GitHub</a>
      </main>
      <SiteFooter product={HAPPY_DESKTOP} />
    </div>
  )
}
