import { useEffect, useRef, useState } from 'react'

type Effect = 'providers' | 'multiplayer' | 'opensource' | 'security'

export function useFeatureSurprise() {
  const [hovered, setHovered] = useState<Effect | null>(null)
  const [focused, setFocused] = useState<Effect | null>(null)
  const [tapped, setTapped] = useState<Effect | null>(null)
  const [revealed, setRevealed] = useState<Effect[]>([])
  const pointerType = useRef('mouse')
  const active = hovered ?? focused ?? tapped
  const reveal = (effect: Effect | null) => {
    if (effect && effect !== 'security') {
      setRevealed(current => current.includes(effect) ? current : [...current, effect])
    }
  }

  useEffect(() => {
    const clear = () => {
      setHovered(null)
      setFocused(null)
      setTapped(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clear()
    }
    const onPointerDown = (event: PointerEvent) => {
      const row = event.target instanceof Element ? event.target.closest('[data-effect]') : null
      setTapped(current => row?.getAttribute('data-effect') === current ? current : null)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return {
    isActive: (effect: Effect | null) => effect !== null && (revealed.includes(effect) || active === effect),
    enter: (effect: Effect | null) => { setHovered(effect); reveal(effect) },
    leave: (effect: Effect | null) => setHovered(current => current === effect ? null : current),
    focus: (effect: Effect | null) => { setFocused(effect); reveal(effect) },
    blur: (effect: Effect | null) => setFocused(current => current === effect ? null : current),
    pointerDown: (type: string) => { pointerType.current = type },
    activate: (effect: Effect | null, detail: number) => {
      if (!effect || window.getSelection()?.isCollapsed === false) return
      reveal(effect)
      if (detail === 0) setFocused(effect)
      else if (pointerType.current !== 'mouse') setTapped(current => current === effect ? null : effect)
    },
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