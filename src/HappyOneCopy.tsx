function Model({ name, provider }: { name: string; provider: string }) {
  return (
    <span className="one-model">
      <img src={`/img/happy-one/providers/${provider}.svg`} width="22" height="22" alt="" />
      {name}
    </span>
  )
}

export function HappyOneCopy() {
  // Review-only comparison: no visible selector or automatic layout switching.
  const aligned = new URLSearchParams(window.location.search).get('layout') === 'aligned'

  return (
    <div className="one-copy-wrap">
      <div className={`one-examples${aligned ? ' one-examples-aligned' : ''}`}>
        <p className="one-example">
          <span className="one-example-action one-reveal one-reveal-build">Build a Stripe integration</span>{' '}
          <span className="one-example-model one-reveal one-reveal-astra">with <Model name="Astra" provider="openai" /></span>
        </p>
        <p className="one-example one-reveal one-reveal-review">
          <span className="one-example-action">Review the UI</span>{' '}
          <span className="one-example-model">with <Model name="Fable" provider="claude" /></span>
        </p>
        <p className="one-example one-reveal one-reveal-research">
          <span className="one-example-action">Research trendy alternatives on Twitter</span>{' '}
          <span className="one-example-model">with <Model name="Grok" provider="grok" /></span>
        </p>
      </div>
      <p className="one-copy-ask">Just ask.</p>
      <p className="one-copy-team">Want a second opinion? Invite a colleague or friend to your Happy server.</p>
      <p className="one-copy-mobile">Left your desk? Use the end-to-end encrypted mobile client.</p>
    </div>
  )
}