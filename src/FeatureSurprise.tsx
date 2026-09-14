import { useEffect, useRef, useState } from 'react'

type Effect = 'providers' | 'multiplayer' | 'opensource' | 'security'

export function useFeatureSurprise() {
  const listRef = useRef<HTMLOListElement>(null)
  const [progress, setProgress] = useState<Record<Effect, number>>({ providers: 0, multiplayer: 0, opensource: 0, security: 0 })

  useEffect(() => {
    if (!listRef.current) return
    const rows = [...listRef.current.querySelectorAll<HTMLElement>('[data-effect]')].map(row => ({
      effect: row.dataset.effect as Effect,
      heading: row.querySelector<HTMLElement>('.one-benefit-heading')!,
    }))
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const viewport = window.visualViewport
    let frame = 0
    let disposed = false
    const update = () => {
      frame = 0
      const height = viewport?.height ?? window.innerHeight
      const offset = viewport?.offsetTop ?? 0
      const measured = rows.map(({ effect, heading }) => {
        const bounds = heading.getBoundingClientRect()
        // Reveal over the last 15% of viewport travel toward its center.
        const center = bounds.top + bounds.height / 2 - offset
        const value = Math.max(0, Math.min(1, (height * .65 - center) / (height * .15)))
        return { effect, value: Math.round(value * 1000) / 1000 }
      })
      setProgress(current => {
        let next = current
        for (const { effect, value } of measured) {
          // Discoveries only advance, including when scrolling back up.
          const target = motion.matches && (value > 0 || current[effect] > 0) ? 1 : value
          if (target > current[effect]) {
            if (next === current) next = { ...current }
            next[effect] = target
          }
        }
        return next
      })
    }
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    resize.observe(listRef.current)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    motion.addEventListener('change', schedule)
    document.fonts?.ready.then(schedule)
    schedule()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [])

  return {
    listRef,
    progress: (effect: Effect | null) => effect === null ? 0 : progress[effect],
    isActive: (effect: Effect | null) => effect !== null && progress[effect] > 0,
  }
}

export function FeatureSurprise({ effect, surprise }: {
  effect: Effect | null
  surprise: ReturnType<typeof useFeatureSurprise>
}) {
  const active = surprise.isActive(effect)
  if (effect === null || effect === 'opensource') return null
  return (
    <>
      {effect === 'providers' && (
        <div id="one-providers-surprise" className="one-provider-header">
          <img src="/img/happy-one/providers/openai.svg" alt="OpenAI" width="20" height="20" />
          <span className="one-provider-extra" aria-hidden={!active}>
            <img src="/img/happy-one/providers/claude.svg" alt="Anthropic" width="20" height="20" />
            <img src="/img/happy-one/providers/grok.svg" alt="xAI" width="20" height="20" />
          </span>
        </div>
      )}
      {effect === 'security' && (
        <picture className="one-security-sticker">
          <source media="(prefers-reduced-motion: reduce)" srcSet="/img/happy-one/stickers/closed-lock-still.webp" />
          <img src={`/img/happy-one/stickers/closed-lock${active ? '' : '-still'}.webp`} alt="" width="26" height="26" />
        </picture>
      )}
      {effect === 'multiplayer' && (
        <div id="one-multiplayer-surprise" className="one-teammate" aria-hidden={!active}>
          <span className="one-teammate-message">LGTM</span>
          <img src="/img/happy-one/croodles-teammate.svg" width="88" height="88" alt="" title="Croodles by vijay verma, via DiceBear (CC BY 4.0)" />
        </div>
      )}
    </>
  )
}