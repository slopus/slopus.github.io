import { useEffect, useRef, type RefObject } from 'react'
import type { DotLottie, DotLottieWorker } from '@lottiefiles/dotlottie-web'
// Served from this site: the worker must never fall back to fetching the renderer from a CDN.
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'
import counterclockwiseArrows from './assets/emoji/counterclockwise-arrows.json?url'
import alienMonster from './assets/emoji/alien-monster.json?url'
import openSource from './assets/emoji/open-source.json?url'
import closedLock from './assets/emoji/closed-lock.json?url'

/** Telegram's animated emoji, as Lottie: the ones Happy Desktop draws, plus Kirill's open-source one. */
const SOURCES = {
  'counterclockwise-arrows': counterclockwiseArrows,
  'alien-monster': alienMonster,
  'open-source': openSource,
  'closed-lock': closedLock,
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

/**
 * One animated emoji, drawn by the renderer Happy Desktop uses (dotLottie, on a worker where the
 * browser can hand it a canvas). It rests on its last frame, the pose it was drawn to return to,
 * and plays once each time its section reaches the middle of the viewport or the pointer enters
 * the section. A play is never restarted while it runs. With reduced motion it never moves.
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

    const play = () => {
      if (reducedMotion.matches) return
      if (!ready) { owed = true; return }
      if (playing || !player) return
      playing = true
      element.dataset.plays = String(Number(element.dataset.plays ?? '0') + 1)
      void player.setFrame(0)
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
        src: new URL(SOURCES[name], location.href).href,
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
        if (owed) { owed = false; play() }
      })
      instance.addEventListener('complete', () => {
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
    const middle = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) play()
    }, { rootMargin: '-50% 0px -50% 0px' })
    middle.observe(host)
    host.addEventListener('pointerenter', play)
    reducedMotion.addEventListener('change', hold)

    return () => {
      disposed = true
      near.disconnect()
      middle.disconnect()
      host.removeEventListener('pointerenter', play)
      reducedMotion.removeEventListener('change', hold)
      if (ready) void player?.destroy()
    }
  }, [name, section])

  return <canvas ref={canvas} className="one-emoji" width="256" height="256" />
}
