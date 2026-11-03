import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import type { DotLottie, DotLottieWorker } from '@lottiefiles/dotlottie-web'
// Served from this site: the worker must never fall back to fetching the renderer from a CDN.
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'
import rainbow from './assets/emoji/rainbow.json?url'
import alienMonster from './assets/emoji/alien-monster.json?url'
import openSource from './assets/emoji/open-source.json?url'
import closedLock from './assets/emoji/closed-lock.json?url'

/**
 * Telegram's animated emoji, as Lottie: the ones Happy Desktop draws, plus Kirill's rainbow and
 * open-source ones. `left`, `right`, `top` and `bottom` are the empty margins around the drawing
 * at rest, as fractions of the box: a layout lines up the drawing's edge rather than the box's,
 * and the pointer replays it over the drawing, not over the margins.
 */
const SOURCES = {
  rainbow: { src: rainbow, left: .118, right: .104, top: .128, bottom: .052 },
  'alien-monster': { src: alienMonster, left: .111, right: .108, top: .18, bottom: .145 },
  'open-source': { src: openSource, left: .104, right: .111, top: .07, bottom: .081 },
  'closed-lock': { src: closedLock, left: .097, right: .097, top: .099, bottom: .11 },
}
export type AnimatedEmojiName = keyof typeof SOURCES

type Runtime = typeof import('@lottiefiles/dotlottie-web')
let runtime: Promise<Runtime> | undefined
/** One runtime, fetched when the first emoji comes near the viewport, never at page load. */
function runtimeLoad() {
  runtime ??= import('@lottiefiles/dotlottie-web').then(module => {
    // Absolute: the worker that fetches it has a blob: base URL.
    const wasm = new URL(wasmUrl, location.href).href
    module.DotLottie.setWasmUrl(wasm)
    module.DotLottieWorker.setWasmUrl(wasm)
    return module
  })
  return runtime
}

/** Every emoji on the page shares one worker. */
const WORKER_ID = 'happy-landing-emoji'

/** Where the pointer last moved, to tell a hover from the page scrolling under a still pointer. */
let pointer: { x: number; y: number } | undefined
let pointerTracked = false
function pointerTrack() {
  if (pointerTracked) return
  pointerTracked = true
  addEventListener('pointermove', event => { pointer = { x: event.clientX, y: event.clientY } }, { passive: true })
}

/**
 * One animated emoji, drawn by the renderer Happy Desktop uses (dotLottie, on a worker where the
 * browser can hand it a canvas). It rests on its last frame, the pose it was drawn to return to.
 * Scrolling plays it once as it crosses the middle of the viewport, and again only after it has
 * left the middle half of the viewport, so jitter at the line never replays it. The pointer
 * moving onto the drawing, or a tap on the emoji, restarts it from the first frame every time;
 * the words beside it do nothing. With reduced motion it never moves.
 */
export function AnimatedEmoji({ name, section }: { name: AnimatedEmojiName; section: RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const element = canvas.current!
    const host = section.current!
    // Older engines keep the empty box; the words beside it say everything.
    if (typeof IntersectionObserver === 'undefined') return
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let player: DotLottie | DotLottieWorker | undefined
    let ready = false
    let playing = false
    let owed = false
    let rest = 0
    let startedAt = -Infinity

    /** `restart` plays from the first frame even mid-play; otherwise a running play continues. */
    const play = (restart: boolean) => {
      if (reducedMotion.matches) return
      if (!ready) { owed = true; return }
      if ((playing && !restart) || !player) return
      playing = true
      startedAt = performance.now()
      element.dataset.plays = String(Number(element.dataset.plays ?? '0') + 1)
      void player.stop()
      void player.play()
    }
    const hold = () => {
      if (!reducedMotion.matches || !player || !ready) return
      playing = false
      void player.pause()
      void player.setFrame(rest)
    }

    const start = async () => {
      const module = await runtimeLoad()
      if (disposed) return
      const config = {
        autoplay: false,
        loop: false,
        src: new URL(SOURCES[name].src, location.href).href,
        renderConfig: { autoResize: true, devicePixelRatio: Math.min(devicePixelRatio || 1, 2), freezeOnOffscreen: true },
      }
      const instance = typeof element.transferControlToOffscreen === 'function'
        ? new module.DotLottieWorker({ ...config, canvas: element, workerId: WORKER_ID })
        : new module.DotLottie({ ...config, canvas: element })
      player = instance
      instance.addEventListener('load', () => {
        if (disposed) { void instance.destroy(); return }
        rest = Math.max(instance.totalFrames - 1, 0)
        void instance.setFrame(rest)
        ready = true
        element.dataset.ready = ''
        if (owed) { owed = false; play(false) }
      })
      instance.addEventListener('complete', () => {
        // Too soon after a restart: this completion is the play it cut short.
        if (performance.now() - startedAt < instance.duration * 900) return
        playing = false
        void instance.setFrame(rest)
      })
    }

    // Near the viewport: load. At its middle: play.
    let loading = false
    const near = new IntersectionObserver(entries => {
      if (loading || !entries.some(entry => entry.isIntersecting)) return
      loading = true
      near.disconnect()
      void start()
    }, { rootMargin: '800px 0px' })
    near.observe(host)
    // Scrolling: the emoji crossing the middle line plays it; leaving the middle half re-arms it.
    let armed = true
    const middle = new IntersectionObserver(entries => {
      if (armed && entries.at(-1)!.isIntersecting) { armed = false; play(false) }
    }, { rootMargin: '-50% 0px -50% 0px' })
    middle.observe(element)
    const band = new IntersectionObserver(entries => {
      if (!entries.at(-1)!.isIntersecting) armed = true
    }, { rootMargin: '-25% 0px -25% 0px' })
    band.observe(element)
    // The pointer moving onto the drawing: the canvas less its empty margins. A pointer the page
    // scrolled under, still where it last moved, only notes where it is.
    pointerTrack()
    let hovering = false
    const margins = SOURCES[name]
    const over = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const box = element.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width
      const y = (event.clientY - box.top) / box.height
      const inside = x >= margins.left && x <= 1 - margins.right && y >= margins.top && y <= 1 - margins.bottom
      const moved = pointer === undefined || pointer.x !== event.clientX || pointer.y !== event.clientY
      if (inside && !hovering && moved) play(true)
      hovering = inside
    }
    const away = () => { hovering = false }
    // Touch replays on a tap; a mouse has the hover.
    const tap = (event: MouseEvent) => {
      if ((event as PointerEvent).pointerType !== 'mouse') play(true)
    }
    element.addEventListener('pointerover', over)
    element.addEventListener('pointermove', over)
    element.addEventListener('pointerleave', away)
    element.addEventListener('click', tap)
    reducedMotion.addEventListener('change', hold)

    return () => {
      disposed = true
      near.disconnect()
      middle.disconnect()
      band.disconnect()
      element.removeEventListener('pointerover', over)
      element.removeEventListener('pointermove', over)
      element.removeEventListener('pointerleave', away)
      element.removeEventListener('click', tap)
      reducedMotion.removeEventListener('change', hold)
      if (ready) void player?.destroy()
    }
  }, [name, section])

  const { left, right } = SOURCES[name]
  return <canvas ref={canvas} className="one-emoji" width="256" height="256" aria-hidden="true"
    style={{ '--emoji-left': left, '--emoji-right': right } as CSSProperties} />
}
