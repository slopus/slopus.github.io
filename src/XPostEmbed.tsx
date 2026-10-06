import { useEffect, useRef, useState, type ReactNode } from 'react'

interface XWidgets {
  widgets: {
    createTweet: (id: string, element: HTMLElement, options: Record<string, unknown>) => Promise<HTMLElement | undefined>
    /** Upgrades the official `blockquote.twitter-tweet` markup inside `element`. */
    load?: (element?: HTMLElement) => void
  }
}

declare global {
  interface Window { twttr?: XWidgets }
}

let widgetPromise: Promise<XWidgets> | undefined

/** Shared official widget loader. Never accept third-party HTML. */
export function loadWidgets() {
  if (window.twttr?.widgets) return Promise.resolve(window.twttr)
  if (widgetPromise) return widgetPromise
  widgetPromise = new Promise<XWidgets>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.referrerPolicy = 'no-referrer'
    script.dataset.happyXWidgets = 'true'
    const timer = window.setTimeout(() => reject(new Error('X widgets timed out')), 12_000)
    script.onload = () => {
      window.clearTimeout(timer)
      if (window.twttr?.widgets) resolve(window.twttr)
      else reject(new Error('X widgets unavailable'))
    }
    script.onerror = () => { window.clearTimeout(timer); reject(new Error('X widgets blocked')) }
    document.head.appendChild(script)
  })
  return widgetPromise
}

export function XPostEmbed({ postId, fallback }: { postId: string; fallback: ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'loaded' | 'unavailable'>('loading')

  useEffect(() => {
    const element = host.current
    if (!element) return
    let cancelled = false
    let started = false
    let timeout: number | undefined
    const start = async () => {
      if (started || cancelled) return
      started = true
      timeout = window.setTimeout(() => { if (!cancelled) setState('unavailable') }, 16_000)
      try {
        const widgets = await loadWidgets()
        if (cancelled) return
        const result = await widgets.widgets.createTweet(postId, element, {
          dnt: true, conversation: 'none', theme: 'light', align: 'center', width: Math.min(330, element.clientWidth || 330),
        })
        if (!cancelled) setState(result ? 'loaded' : 'unavailable')
      } catch {
        if (!cancelled) setState('unavailable')
      } finally {
        window.clearTimeout(timeout)
      }
    }
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); void start() }
    }, { rootMargin: '300px' })
    if (observer) observer.observe(element)
    else void start()
    return () => { cancelled = true; observer?.disconnect(); window.clearTimeout(timeout); element.replaceChildren() }
  }, [postId])

  return (
    <div className="benchmark-embed">
      <div ref={host} />
      {state === 'loading' ? <div className="benchmark-loading">Loading post…</div> : null}
      {state === 'unavailable' ? fallback : null}
    </div>
  )
}