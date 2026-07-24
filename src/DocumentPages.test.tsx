import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Router } from './Router'
import { documents, getDocumentSource, prepareMarkdown } from './documents'

describe('static document pages', () => {
  afterEach(() => {
    cleanup()
  })

  it('makes every copied documentation source renderable', () => {
    expect(documents).toHaveLength(19)

    for (const document of documents) {
      const markdown = prepareMarkdown(getDocumentSource(document))
      expect(markdown).toMatch(/^# /)
      expect(markdown).not.toMatch(/<(?:Card|Steps|Image)\b/)
    }
  })

  it('renders a documentation route with navigation', () => {
    render(<Router pathname="/docs/quick-start/" />)

    expect(screen.getByRole('heading', { level: 1, name: /quick start guide/i })).toBeTruthy()
    expect(screen.getAllByRole('navigation', { name: 'Documentation navigation' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /self-hosting/i }).length).toBeGreaterThan(0)
  })

  it('renders privacy and terms as site pages', () => {
    const { rerender } = render(<Router pathname="/privacy/" />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeTruthy()

    rerender(<Router pathname="/terms/" />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of use/i })).toBeTruthy()
  })

  it('handles same-page links without reloading the document', () => {
    window.history.replaceState({}, '', '/docs/')
    render(<Router />)

    const activeLink = screen.getAllByRole('link', { name: 'Welcome' })[0]
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    activeLink.dispatchEvent(click)

    expect(click.defaultPrevented).toBe(true)
    expect(window.location.pathname).toBe('/docs/')
  })
})