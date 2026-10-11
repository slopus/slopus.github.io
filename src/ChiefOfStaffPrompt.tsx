import { useEffect, useRef, useState } from 'react'
import { CopyIcon } from './CopyIcon'

/** The fence that authors a prompt block in the docs: ```chief-of-staff, one prompt per line. */
export const CHIEF_OF_STAFF_LANGUAGE = 'chief-of-staff'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return
  } catch {
    // Some browsers deny the async API. Fall back to the native copy action, then put
    // the reader's focus and selection back where they were.
    const focused = document.activeElement
    const selection = window.getSelection()
    const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : []
    const input = document.createElement('textarea')
    input.value = text
    input.readOnly = true
    input.tabIndex = -1
    input.setAttribute('aria-hidden', 'true')
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;font-size:16px'
    document.body.append(input)
    try {
      input.focus({ preventScroll: true })
      input.select()
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable')
    } finally {
      input.remove()
      if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
      selection?.removeAllRanges()
      for (const range of ranges) selection?.addRange(range)
    }
  }
}

function PromptLine({ prompt }: { prompt: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await copyText(prompt)
      setState('copied')
      timer.current = setTimeout(() => setState('idle'), 1600)
    } catch {
      setState('failed')
    }
  }

  return (
    <li className="cos-prompt-line">
      {/* The button follows the prompt in the same line of text, so it never takes a column from it. */}
      <span className="cos-prompt-text">{prompt}</span>
      <button type="button" className="cos-prompt-copy" data-state={state} onClick={copy} aria-label={state === 'copied' ? `Copied: ${prompt}` : `Copy prompt: ${prompt}`}>
        {state === 'copied'
          ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          : <CopyIcon />}
        <span aria-hidden="true">{state === 'copied' ? 'Copied' : 'Copy'}</span>
      </button>
      <span className="cos-prompt-status" role="status">{state === 'copied' ? 'Copied.' : state === 'failed' ? 'Clipboard unavailable. Select the prompt to copy it.' : ''}</span>
    </li>
  )
}

/**
 * A ready-to-paste request for the Chief of Staff in Happy Desktop, each with its own Copy
 * button. The prompts are plain text in the served page, so they read and select without
 * JavaScript.
 */
export function ChiefOfStaffPrompt({ prompts }: { prompts: string[] }) {
  return (
    <aside className="cos-prompt" aria-label="Ask the Chief of Staff">
      <p className="cos-prompt-label">Ask the <a href="/chief-of-staff/">Chief of Staff</a></p>
      <ul>
        {prompts.map((prompt) => <PromptLine key={prompt} prompt={prompt} />)}
      </ul>
    </aside>
  )
}
