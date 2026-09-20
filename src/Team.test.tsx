import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { Router } from './Router'

function teamNames() {
  // Anchored to the section's own label, so hero copy mentioning "team" cannot match instead.
  const section = document.getElementById('team-heading')?.closest('section')
  if (!section) {
    throw new Error('team section not found')
  }
  return within(section as HTMLElement)
    .getAllByRole('listitem')
    .map((item) => item.querySelector('.team-name')?.textContent)
}

describe('team section', () => {
  afterEach(() => {
    cleanup()
  })

  it('lists all three on the Happy homepage, in order', () => {
    render(<App />)

    expect(teamNames()).toEqual(['Steve Korshakov', 'Karl Marx', 'Kirill Dubovitskiy'])
  })

  it('links each person to their own place on the internet', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /Steve Korshakov/ }).getAttribute('href')).toBe('https://x.com/Ex3NDR')
    expect(screen.getByRole('link', { name: /Kirill Dubovitskiy/ }).getAttribute('href')).toBe('https://x.com/bra1n_dump')
    expect(screen.getByRole('link', { name: /Karl Marx/ }).getAttribute('href')).toBe('https://peoplesgrocers.com/en/projects')
  })
})

describe('header docs link', () => {
  afterEach(() => {
    cleanup()
  })

  it('is marked current on a documentation route', () => {
    render(<Router pathname="/desktop/docs/extending/" />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page')
  })

  it('is not marked current on a landing page', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBeNull()
  })
})
