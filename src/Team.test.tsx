import { cleanup, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'

vi.mock('./HappyOneDemo', () => ({ HappyOneDemo: () => <figure data-testid="demo" /> }))

beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false, addEventListener() {}, removeEventListener() {},
  }))
})

afterAll(() => {
  vi.unstubAllGlobals()
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

  it('is not marked current on the landing page', () => {
    render(<Router pathname="/" />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBeNull()
  })

  it('points at the Happy docs from the homepage', () => {
    render(<Router pathname="/" />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/desktop/docs/')
  })
})
