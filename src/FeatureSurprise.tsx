import { useEffect, useState } from 'react'

type Effect = 'providers' | 'multiplayer' | 'security'

export function useFeatureSurprise() {
  const [active, setActive] = useState<Effect | null>(null)
  const [activation, setActivation] = useState(0)
  const [peekCount, setPeekCount] = useState(0)

  function reveal(effect: Effect | null, replay = false) {
    if (!effect || (active === effect && !replay)) return
    if (effect === 'multiplayer') setPeekCount(count => count + 1)
    setActive(effect)
    setActivation(count => count + 1)
  }

  function dismiss(effect: Effect | null) {
    setActive(current => current === effect ? null : current)
  }

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => setActive(null), 4000)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, activation])

  return { active, peekCount, reveal, dismiss }
}

export function FeatureSurprise({ effect, surprise }: {
  effect: Effect
  surprise: ReturnType<typeof useFeatureSurprise>
}) {
  const active = surprise.active === effect
  return (
    <>
      <button
        type="button"
        className={`one-feature-trigger one-feature-${effect}`}
        aria-label={effect === 'providers' ? 'Show model providers' : effect === 'multiplayer' ? 'Peek at a teammate' : 'Animate the encryption key'}
        aria-expanded={effect !== 'security' ? active : undefined}
        aria-controls={effect !== 'security' ? `one-${effect}-surprise` : undefined}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) surprise.reveal(effect)
        }}
        onBlur={() => surprise.dismiss(effect)}
        onClick={() => surprise.reveal(effect, true)}
      >
        {effect === 'providers' && (
          <span className="one-provider-stack" aria-hidden="true">
            {['openai', 'claude', 'grok'].map(provider => (
              <img key={provider} src={`/img/happy-one/providers/${provider}.svg`} alt="" width="18" height="18" />
            ))}
          </span>
        )}
        {effect === 'multiplayer' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 3h12a2 2 0 0 1 2 2v8l-7 7H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 17v-5a2 2 0 0 1 2-2h5" />
          </svg>
        )}
        {effect === 'security' && (
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/img/happy-one/stickers/closed-lock-still.webp" />
            <img src={`/img/happy-one/stickers/closed-lock${active ? '' : '-still'}.webp`} alt="" width="26" height="26" />
          </picture>
        )}
      </button>
      {effect === 'providers' && (
        <span id="one-providers-surprise" className="one-provider-note" hidden={!active}>
          your skills can choose which model does what
        </span>
      )}
      {effect === 'multiplayer' && (
        <div id="one-multiplayer-surprise" className="one-page-peek" aria-hidden={!active}>
          <span className="one-peek-message">
            {surprise.peekCount % 2 === 1 ? 'i saw that' : 'have you thought about doing it this other way?'}
          </span>
          <div className="one-peek-window">
            <img src="/img/happy-one/croodles-teammate.svg" width="88" height="88" alt="" title="Croodles by vijay verma, via DiceBear (CC BY 4.0)" />
          </div>
          <span className="one-page-fold" />
        </div>
      )}
    </>
  )
}