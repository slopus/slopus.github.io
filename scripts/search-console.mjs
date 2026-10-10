// Search Console snapshot for the weekly marketing loop: top queries and pages
// for the last 28 days against the 28 before, plus sitemap status. Read-only.
// Writes Markdown and JSON to marketing/data/, which is gitignored: the numbers are private.
//
//   GSC_CREDENTIALS_FILE=~/keys/happy-gsc.json pnpm gsc
//   pnpm gsc --list-sites           # which properties the service account can read
//   pnpm gsc --property https://happy.engineering/
//   pnpm gsc --dry-run              # no credentials, no network: prints the requests
//
// Setup is in marketing/README.md. No dependencies: the JWT is signed with node:crypto.
import { createSign, generateKeyPairSync } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_PROPERTY = 'sc-domain:happy.engineering'
export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://searchconsole.googleapis.com/webmasters/v3'
const WINDOW_DAYS = 28
// Search Console data is final about three days after the fact.
const LAG_DAYS = 3
const ROW_LIMIT = 1000
const SHOWN_ROWS = 25

const day = (date, offset) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + offset))
const isoDate = (date) => date.toISOString().slice(0, 10)

/** The last full 28 days with final data, and the 28 days before them. */
export function periods(now) {
  const end = day(now, -LAG_DAYS)
  return {
    current: { startDate: isoDate(day(end, 1 - WINDOW_DAYS)), endDate: isoDate(end) },
    previous: { startDate: isoDate(day(end, 1 - 2 * WINDOW_DAYS)), endDate: isoDate(day(end, -WINDOW_DAYS)) },
  }
}

function signJwt(credentials, nowSeconds) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: credentials.client_email,
    scope: SCOPE,
    aud: credentials.token_uri ?? TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  })}`
  return `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(credentials.private_key, 'base64url')}`
}

async function call(fetch, url, init) {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body.error_description ?? body.error?.message ?? JSON.stringify(body)
    throw new Error(`${response.status} from ${url}: ${message}`)
  }
  return body
}

/** A Search Console client authorized as the service account. */
export async function connect(credentials, { fetch = globalThis.fetch, now = new Date() } = {}) {
  const token = await call(fetch, credentials.token_uri ?? TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signJwt(credentials, Math.floor(now.getTime() / 1000)),
    }),
  })
  const headers = { authorization: `Bearer ${token.access_token}` }
  const site = (property) => `${API}/sites/${encodeURIComponent(property)}`
  return {
    listSites: async () => (await call(fetch, `${API}/sites`, { headers })).siteEntry ?? [],
    sitemaps: async (property) => (await call(fetch, `${site(property)}/sitemaps`, { headers })).sitemap ?? [],
    query: async (property, body) => (await call(fetch, `${site(property)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'web', dataState: 'final', ...body }),
    })).rows ?? [],
  }
}

const metrics = (row) => ({
  clicks: row?.clicks ?? 0,
  impressions: row?.impressions ?? 0,
  ctr: row?.ctr ?? 0,
  position: row?.position ?? null,
})

/** Current rows with the previous period's numbers beside them, by clicks then impressions. */
function compare(currentRows, previousRows) {
  const previous = new Map(previousRows.map((row) => [row.keys[0], row]))
  return currentRows
    .map((row) => ({ key: row.keys[0], ...metrics(row), previous: previous.has(row.keys[0]) ? metrics(previous.get(row.keys[0])) : null }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
}

export async function collect(client, property, now = new Date()) {
  const { current, previous } = periods(now)
  const [totals, previousTotals, queries, previousQueries, pages, previousPages, sitemaps] = await Promise.all([
    client.query(property, { ...current }),
    client.query(property, { ...previous }),
    client.query(property, { ...current, dimensions: ['query'], rowLimit: ROW_LIMIT }),
    client.query(property, { ...previous, dimensions: ['query'], rowLimit: ROW_LIMIT }),
    client.query(property, { ...current, dimensions: ['page'], rowLimit: ROW_LIMIT }),
    client.query(property, { ...previous, dimensions: ['page'], rowLimit: ROW_LIMIT }),
    client.sitemaps(property),
  ])
  return {
    property,
    generatedAt: now.toISOString(),
    periods: { current, previous },
    totals: { ...metrics(totals[0]), previous: metrics(previousTotals[0]) },
    queries: compare(queries, previousQueries),
    pages: compare(pages, previousPages),
    sitemaps: sitemaps.map((sitemap) => ({
      path: sitemap.path,
      lastSubmitted: sitemap.lastSubmitted ?? null,
      lastDownloaded: sitemap.lastDownloaded ?? null,
      isPending: sitemap.isPending ?? false,
      errors: Number(sitemap.errors ?? 0),
      warnings: Number(sitemap.warnings ?? 0),
      submitted: (sitemap.contents ?? []).reduce((sum, entry) => sum + Number(entry.submitted ?? 0), 0),
    })),
  }
}

const integer = (value) => Math.round(value).toLocaleString('en-US')
const percent = (value) => `${(value * 100).toFixed(1)}%`
const rank = (value) => (value == null ? '–' : value.toFixed(1))
function delta(now, before, format = integer) {
  const change = now - before
  if (Math.abs(change) < 0.05) return ''
  return ` (${change > 0 ? '+' : '−'}${format(Math.abs(change))})`
}

function table(rows, label) {
  const lines = [
    `| ${label} | Clicks | Impressions | CTR | Position |`,
    '| --- | ---: | ---: | ---: | ---: |',
  ]
  for (const row of rows.slice(0, SHOWN_ROWS)) {
    const before = row.previous
    lines.push(`| ${row.key.replace(/\|/g, '\\|')} | ${integer(row.clicks)}${before ? delta(row.clicks, before.clicks) : ' (new)'} | ${integer(row.impressions)}${before ? delta(row.impressions, before.impressions) : ''} | ${percent(row.ctr)} | ${rank(row.position)}${before?.position != null ? delta(row.position, before.position, (value) => value.toFixed(1)) : ''} |`)
  }
  return lines.join('\n')
}

export function toMarkdown(report) {
  const { current, previous } = report.periods
  const { totals } = report
  // Ranked 8–20 with real impressions: one better page or title away from page one.
  const strikingDistance = report.queries
    .filter((row) => row.position >= 8 && row.position <= 20 && row.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions)
  return `# Search Console: ${report.property}

${current.startDate} to ${current.endDate}, against ${previous.startDate} to ${previous.endDate}. Generated ${report.generatedAt}.

| | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| Last 28 days | ${integer(totals.clicks)}${delta(totals.clicks, totals.previous.clicks)} | ${integer(totals.impressions)}${delta(totals.impressions, totals.previous.impressions)} | ${percent(totals.ctr)} | ${rank(totals.position)} |
| 28 days before | ${integer(totals.previous.clicks)} | ${integer(totals.previous.impressions)} | ${percent(totals.previous.ctr)} | ${rank(totals.previous.position)} |

Changes in brackets are against the previous 28 days. A lower position is better.

## Top queries

${table(report.queries, 'Query')}

## Striking distance

Queries ranked 8–20 with at least 20 impressions.

${strikingDistance.length ? table(strikingDistance, 'Query') : 'None this period.'}

## Top pages

${table(report.pages, 'Page')}

## Sitemaps

${report.sitemaps.length
    ? ['| Sitemap | Last downloaded | URLs submitted | Errors | Warnings |', '| --- | --- | ---: | ---: | ---: |',
      ...report.sitemaps.map((sitemap) => `| ${sitemap.path} | ${sitemap.lastDownloaded ?? 'never'}${sitemap.isPending ? ' (pending)' : ''} | ${sitemap.submitted} | ${sitemap.errors} | ${sitemap.warnings} |`)].join('\n')
    : 'No sitemap submitted. Submit https://happy.engineering/sitemap.xml in Search Console → Sitemaps.'}
`
}

/** Stands in for Google in --dry-run and the test: a throwaway key, canned rows, every request recorded. */
export function fakeGoogle() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const credentials = {
    type: 'service_account',
    client_email: 'search-console@example-project.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    token_uri: TOKEN_URL,
  }
  const requests = []
  const respond = (body) => ({ ok: true, status: 200, json: async () => body })
  const row = (key, clicks, impressions, position) => ({ keys: key ? [key] : undefined, clicks, impressions, ctr: clicks / impressions, position })
  async function fetch(url, init = {}) {
    const body = init.body instanceof URLSearchParams ? Object.fromEntries(init.body) : init.body ? JSON.parse(init.body) : undefined
    requests.push({ url: String(url), method: init.method ?? 'GET', headers: init.headers ?? {}, body })
    if (url === TOKEN_URL) return respond({ access_token: 'fake-access-token', expires_in: 3600, token_type: 'Bearer' })
    if (url.endsWith('/sites')) return respond({ siteEntry: [{ siteUrl: DEFAULT_PROPERTY, permissionLevel: 'siteRestrictedUser' }] })
    if (url.endsWith('/sitemaps')) {
      return respond({ sitemap: [{ path: 'https://happy.engineering/sitemap.xml', lastDownloaded: '2026-10-08T10:00:00.000Z', isPending: false, warnings: '0', errors: '0', contents: [{ type: 'web', submitted: '40' }] }] })
    }
    const recent = body.endDate === periods(new Date()).current.endDate
    const scale = recent ? 1 : 0.5
    if (!body.dimensions) return respond({ rows: [row(null, 120 * scale, 4000 * scale, 14.2)] })
    if (body.dimensions[0] === 'query') {
      return respond({ rows: [row('happy coder', 60 * scale, 400, 1.2), row('claude code mobile app', 9 * scale, 600, 11.4), ...(recent ? [row('codex gui', 1, 90, 17.8)] : [])] })
    }
    return respond({ rows: [row('https://happy.engineering/', 80 * scale, 2000, 6.1), row('https://happy.engineering/mobile-app/', 20 * scale, 900, 9.3)] })
  }
  return { credentials, fetch, publicKey, requests }
}

function option(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const property = option('--property') ?? process.env.GSC_PROPERTY ?? DEFAULT_PROPERTY
  const fake = dryRun ? fakeGoogle() : null
  let credentials = fake?.credentials
  if (!credentials) {
    const file = process.env.GSC_CREDENTIALS_FILE
    if (!file) throw new Error('Set GSC_CREDENTIALS_FILE to the service account JSON key (kept outside the repo). See marketing/README.md.')
    credentials = JSON.parse(await readFile(file, 'utf8'))
  }
  const client = await connect(credentials, { fetch: fake?.fetch })

  if (process.argv.includes('--list-sites')) {
    for (const entry of await client.listSites()) console.log(`${entry.siteUrl}\t${entry.permissionLevel}`)
    return
  }

  let report
  try {
    report = await collect(client, property)
  } catch (error) {
    if (/^(403|404) /.test(error.message)) {
      error.message += `\nThe service account cannot read ${property}. Run \`pnpm gsc --list-sites\` and pass one of those with --property or GSC_PROPERTY.`
    }
    throw error
  }
  const markdown = toMarkdown(report)

  if (fake) {
    for (const request of fake.requests) {
      console.log(`${request.method} ${request.url}${request.body ? `\n  ${JSON.stringify(request.body.assertion ? { ...request.body, assertion: '<signed JWT>' } : request.body)}` : ''}`)
    }
    console.log(`\n${markdown}`)
    console.log('Dry run: canned data, nothing written.')
    return
  }

  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'marketing', 'data')
  await mkdir(outDir, { recursive: true })
  const base = path.join(outDir, `gsc-${localDate(new Date())}`)
  await writeFile(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`)
  await writeFile(`${base}.md`, markdown)
  console.log(`Wrote ${path.relative(process.cwd(), base)}.md and .json`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
