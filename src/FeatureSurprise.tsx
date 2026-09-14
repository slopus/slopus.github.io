import { useEffect, useRef, useState } from 'react'

type Effect = 'providers' | 'multiplayer' | 'subscriptions' | 'opensource' | 'security'

export function useFeatureSurprise() {
  const [hovered, setHovered] = useState<Effect | null>(null)
  const [focused, setFocused] = useState<Effect | null>(null)
  const [tapped, setTapped] = useState<Effect | null>(null)
  const active = hovered ?? focused ?? tapped

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
    active,
    enter: setHovered,
    leave: (effect: Effect) => setHovered(current => current === effect ? null : current),
    focus: setFocused,
    blur: (effect: Effect) => setFocused(current => current === effect ? null : current),
    tap: (effect: Effect) => setTapped(current => current === effect ? null : effect),
  }
}

export function FeatureSurprise({ effect, surprise }: {
  effect: Effect
  surprise: ReturnType<typeof useFeatureSurprise>
}) {
  const active = surprise.active === effect
  const pointerType = useRef('mouse')
  const labels = {
    providers: 'Show OpenAI, Anthropic, and xAI providers',
    multiplayer: 'Show a teammate’s review',
    subscriptions: 'Animate reuse subscriptions',
    opensource: 'Animate open source MIT',
    security: 'Animate the encryption key',
  }
  const animated = effect === 'security' ? 'key' : 'graduation-cap'
  return (
    <>
      <button
        type="button"
        className={`one-feature-trigger one-feature-${effect}`}
        aria-label={labels[effect]}
        aria-expanded={effect === 'providers' || effect === 'multiplayer' ? active : undefined}
        aria-controls={effect === 'providers' || effect === 'multiplayer' ? `one-${effect}-surprise` : undefined}
        onPointerDown={event => { pointerType.current = event.pointerType }}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) surprise.focus(effect)
        }}
        onBlur={() => surprise.blur(effect)}
        onClick={event => {
          if (event.detail === 0) surprise.focus(effect)
          else if (pointerType.current !== 'mouse') surprise.tap(effect)
        }}
      >
        {effect === 'providers' && (
          <span id="one-providers-surprise" className="one-provider-stack" aria-hidden="true">
            {['openai', 'claude', 'grok'].map(provider => (
              <img key={provider} src={`/img/happy-one/providers/${provider}.svg`} alt="" width="18" height="18" />
            ))}
          </span>
        )}
        {effect === 'multiplayer' && (
          <img className="one-teammate-icon" src="/img/happy-one/croodles-teammate.svg" alt="" width="26" height="26" />
        )}
        {effect === 'subscriptions' && <span className="one-recycle" aria-hidden="true">♻️</span>}
        {(effect === 'security' || effect === 'opensource') && (
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={`/img/happy-one/stickers/${animated}-still.png`} />
            <img src={`/img/happy-one/stickers/${animated}${active ? '.webp' : '-still.png'}`} alt="" width="26" height="26" />
          </picture>
        )}
      </button>
      {effect === 'multiplayer' && (
        <div id="one-multiplayer-surprise" className="one-teammate" aria-hidden={!active}>
          <span className="one-teammate-message">LGTM</span>
          <img src="/img/happy-one/croodles-teammate.svg" width="88" height="88" alt="" title="Croodles by vijay verma, via DiceBear (CC BY 4.0)" />
        </div>
      )}
    </>
  )
}