import type { PostHog } from 'posthog-js'

/**
 * Page analytics through PostHog: the project and host Happy Desktop sends to, with
 * `site` on every event to tell the two apart. The deploy workflow passes the key as
 * VITE_POSTHOG_KEY; without it, as in a local build, nothing loads and nothing is sent.
 * Browser only: src/main.tsx starts it, and the prerender never imports it.
 */
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = 'https://us.i.posthog.com'

type ClickEvent =
  | ['download_click', { platform: string; arch?: string }]
  | ['store_click', { store: 'ios' | 'android' }]
  | ['github_click', { repository: string }]

let loading: Promise<PostHog | undefined> | undefined

function load(key: string) {
  loading ??= import('posthog-js').then(
    ({ default: posthog }) => {
      posthog.init(key, {
        api_host: POSTHOG_HOST,
        // No cookies and no localStorage: a visitor is new on every page load.
        persistence: 'memory',
        person_profiles: 'identified_only',
        capture_pageview: 'history_change',
        capture_pageleave: true,
        autocapture: true,
        disable_session_recording: true,
        disable_surveys: true,
      })
      posthog.register({ site: 'happy.engineering' })
      return posthog
    },
    (error: unknown) => {
      console.error('Could not load analytics.', error)
      return undefined
    },
  )
  return loading
}

/** The download, store, and GitHub links, wherever they are on the page. */
export function clickEvent(link: HTMLAnchorElement): ClickEvent | null {
  const platform = link.dataset.downloadPlatform
  if (platform) {
    return ['download_click', link.dataset.downloadArch ? { platform, arch: link.dataset.downloadArch } : { platform }]
  }
  let url: URL
  try {
    url = new URL(link.href)
  } catch {
    return null
  }
  if (url.hostname === 'apps.apple.com') return ['store_click', { store: 'ios' }]
  if (url.hostname === 'play.google.com') return ['store_click', { store: 'android' }]
  if (url.hostname === 'github.com') {
    if (url.pathname.startsWith('/slopus/happy-desktop/releases')) return ['download_click', { platform: 'all' }]
    const repository = url.pathname.split('/').slice(1, 3).join('/')
    if (repository) return ['github_click', { repository }]
  }
  return null
}

function onClick(event: MouseEvent) {
  if (event.button > 1 || !(event.target instanceof Element)) return
  const link = event.target.closest('a')
  const found = link && clickEvent(link)
  if (!found || !POSTHOG_KEY) return
  const [name, properties] = found
  // Sent at once by beacon: a download or a store page may take the tab next.
  void load(POSTHOG_KEY).then((posthog) => posthog?.capture(name, properties, { transport: 'sendBeacon' }))
}

/** Loads PostHog once the page has painted, so it never slows the first screen. */
export function startAnalytics() {
  const key = POSTHOG_KEY
  if (!key) return
  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('auxclick', onClick, { capture: true })
  const idle = () => ('requestIdleCallback' in window ? window.requestIdleCallback(() => load(key), { timeout: 3000 }) : setTimeout(() => load(key), 1000))
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
}
