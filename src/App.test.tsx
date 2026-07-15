import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    cleanup()
  })

  it('leads with Happy as the primary product', () => {
    render(<App />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading.textContent).toMatch(/keep your agents moving/i)
  })

  it('offers the primary Download Happy call to action', () => {
    render(<App />)

    const downloadLinks = screen.getAllByRole('link', { name: /download happy/i })

    expect(downloadLinks.length).toBeGreaterThan(0)
  })

  it('renders semantic primary navigation', () => {
    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeTruthy()
  })

  it('does not reference Rig or Happy (2)', () => {
    const { container } = render(<App />)

    expect(container.querySelector('#rig')).toBeNull()
    expect(container.querySelector('#happy2')).toBeNull()
    expect(screen.queryByText(/also from happy engineering/i)).toBeNull()
  })
})
