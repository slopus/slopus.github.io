// @vitest-environment node
import { createVerify } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { collect, connect, DEFAULT_PROPERTY, fakeGoogle, periods, SCOPE, toMarkdown } from './search-console.mjs'

describe('search console snapshot', () => {
  it('compares the last 28 final days with the 28 before', () => {
    expect(periods(new Date('2026-10-09T12:00:00Z'))).toEqual({
      current: { startDate: '2026-09-09', endDate: '2026-10-06' },
      previous: { startDate: '2026-08-12', endDate: '2026-09-08' },
    })
  })

  it('exchanges a signed service-account JWT for a read-only token', async () => {
    const google = fakeGoogle()
    const now = new Date('2026-10-09T12:00:00Z')
    await connect(google.credentials, { fetch: google.fetch, now })

    const [token] = google.requests
    expect(token).toMatchObject({ url: 'https://oauth2.googleapis.com/token', method: 'POST' })
    expect(token.body.grant_type).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer')
    const [header, claims, signature] = token.body.assertion.split('.')
    expect(JSON.parse(Buffer.from(header, 'base64url'))).toEqual({ alg: 'RS256', typ: 'JWT' })
    expect(JSON.parse(Buffer.from(claims, 'base64url'))).toEqual({
      iss: google.credentials.client_email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now.getTime() / 1000,
      exp: now.getTime() / 1000 + 3600,
    })
    expect(createVerify('RSA-SHA256').update(`${header}.${claims}`).verify(google.publicKey, signature, 'base64url')).toBe(true)
  })

  it('asks for queries, pages, totals and sitemaps of the encoded property', async () => {
    const google = fakeGoogle()
    const client = await connect(google.credentials, { fetch: google.fetch })
    const report = await collect(client, DEFAULT_PROPERTY)

    const site = 'https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Ahappy.engineering'
    const api = google.requests.slice(1)
    for (const request of api) expect(request.headers.authorization).toBe('Bearer fake-access-token')
    expect(api.filter((request) => request.method === 'GET').map((request) => request.url)).toEqual([`${site}/sitemaps`])
    const queries = api.filter((request) => request.method === 'POST')
    expect(queries).toHaveLength(6)
    for (const request of queries) {
      expect(request.url).toBe(`${site}/searchAnalytics/query`)
      expect(request.body).toMatchObject({ type: 'web', dataState: 'final' })
      expect(request.body.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    expect(queries.map((request) => request.body.dimensions?.[0] ?? 'totals').sort())
      .toEqual(['page', 'page', 'query', 'query', 'totals', 'totals'])

    expect(report.queries.find((row) => row.key === 'codex gui').previous).toBeNull()
    expect(report.totals).toMatchObject({ clicks: 120, previous: { clicks: 60 } })
    const markdown = toMarkdown(report)
    expect(markdown).toContain('| codex gui | 1 (new) |')
    expect(markdown).toContain('## Striking distance')
    expect(markdown).toContain('| https://happy.engineering/sitemap.xml |')
  })

  it('explains an API error', async () => {
    const google = fakeGoogle()
    const fetch = async (url, init) => (String(url).includes('/sites/')
      ? { ok: false, status: 403, json: async () => ({ error: { message: 'User does not have sufficient permission' } }) }
      : google.fetch(url, init))
    const client = await connect(google.credentials, { fetch })
    await expect(client.sitemaps(DEFAULT_PROPERTY)).rejects.toThrow(/^403 .*sufficient permission/)
  })
})
