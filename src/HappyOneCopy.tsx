import { useEffect, useState } from 'react'

const tasks = ['a bug fix', 'a release', 'a Stripe integration', 'a sign-in flow']

function TaskSlot() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    const update = () => {
      window.clearInterval(timer)
      if (!motion.matches && !document.hidden) {
        timer = window.setInterval(() => setIndex(value => (value + 1) % tasks.length), 4000)
      }
    }
    update()
    motion.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      motion.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <>
      <span className="one-task-slot" aria-hidden="true"><span key={index}>{tasks[index]}</span></span>
      <span className="one-sr-only">a release</span>
    </>
  )
}

/** Review-only: replace with the chosen plain copy before promoting this page. */
export function HappyOneCopy() {
  const [variant, setVariant] = useState(0)

  return (
    <div className="one-copy-wrap">
      <button
        type="button"
        className="one-copy-switch"
        aria-describedby="one-copy-help"
        onClick={() => setVariant(value => (value + 1) % 3)}
      >
        <span className="one-copy-lead">
          {variant === 0 && <>Build fast with Astra. Review the UI with Fable. <strong>Just ask.</strong></>}
          {variant === 1 && <>Prefer Astra for speed and Fable for UI review? <strong>Just ask.</strong></>}
          {variant === 2 && <>Plan <TaskSlot /> with Astra. Review the changes with Fable. <strong>Just ask.</strong></>}
        </span>
        <span className="one-copy-team">
          {variant === 0 && 'Want a second opinion? Invite a colleague or friend to your Happy server.'}
          {variant === 1 && 'Bring a colleague or friend into the work. Invite them to your Happy server.'}
          {variant === 2 && 'Need another perspective? Invite a colleague or friend to your Happy server.'}
        </span>
        <span className="one-copy-mobile">Left your desk? Use the end-to-end encrypted mobile client.</span>
      </button>
      <span id="one-copy-help" className="one-sr-only">Preview copy {variant + 1} of 3. Activate to read the next version.</span>
    </div>
  )
}