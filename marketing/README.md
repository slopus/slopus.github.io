# Marketing

Where Happy's marketing and SEO work is coordinated. Nothing in `marketing/` is built or served; the site only reads `content/` and `public/`. This repository is public, so everything tracked here is public too: no secrets, contact details, private metrics, or anything we would not say to a competitor's face. Search Console numbers go to `marketing/data/`, which is gitignored.

| File | What it holds |
| --- | --- |
| [`positioning.md`](positioning.md) | Who Happy is for, the pitch per audience, and which claims the docs back |
| [`seo-backlog.md`](seo-backlog.md) | Remaining SEO work, with status, owner, and effort |
| [`channels.md`](channels.md) | How we show up on X, Reddit, Hacker News, directories, and video |
| [`log.md`](log.md) | What shipped, by date |
| `data/` | Search Console snapshots from `pnpm gsc`. Gitignored |

## Weekly loop

1. **Pull.** `GSC_CREDENTIALS_FILE=… pnpm gsc` writes `data/gsc-YYYY-MM-DD.md` and `.json`: top queries and pages for the last 28 days against the 28 before, queries in striking distance (positions 8–20), and sitemap status.
2. **Review.** Which queries grew or appeared? Which pages earn impressions but few clicks (a title or description fix)? Which queries rank 8–20 (a better page, or a section on an existing one)? Did the sitemap download, with no errors?
3. **Pick.** One or two items from `seo-backlog.md`, or new pages the queries ask for, and one or two posts from `channels.md`. Every product claim comes from `content/desktop/` (see `positioning.md`).
4. **Ship and log.** Add a dated line to `log.md` per launch, page, listing change, or post, so next month's numbers can be read against it.

## Search Console

`scripts/search-console.mjs` (`pnpm gsc`) reads the Search Console API as a Google service account. It signs its own JWT with `node:crypto` and calls the REST API with `fetch`; there are no dependencies to install.

### Setup

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com/), or reuse one.
2. **APIs & Services → Library**: enable the **Google Search Console API**.
3. **IAM & Admin → Service Accounts → Create service account.** No project roles are needed. Open it, then **Keys → Add key → Create new key → JSON**. The file downloads once.
4. In [Search Console](https://search.google.com/search-console), open the happy.engineering property, then **Settings → Users and permissions → Add user**. Enter the service account's email (`…@….iam.gserviceaccount.com`, also `client_email` in the key file) with **Restricted** permission. Use **Full** only if we later want the script to submit sitemaps; it is read-only today.
5. Keep the key file outside the repository, for example in `~/keys/`, and point the script at it:

   ```sh
   GSC_CREDENTIALS_FILE=~/keys/happy-gsc.json pnpm gsc --list-sites
   GSC_CREDENTIALS_FILE=~/keys/happy-gsc.json pnpm gsc
   ```

### Which property

Search Console has two kinds of property, and the API names them differently:

| Property type | Verified by | API name |
| --- | --- | --- |
| Domain | DNS TXT record; covers every subdomain and both protocols | `sc-domain:happy.engineering` |
| URL prefix | HTML file, tag, or Analytics; covers one origin | `https://happy.engineering/` |

The script defaults to `sc-domain:happy.engineering`. To check which one exists, look at the property picker in Search Console (a domain property shows the bare domain, a URL-prefix property shows `https://`), or run `pnpm gsc --list-sites` once the service account has been added. Pass the other with `--property https://happy.engineering/` or `GSC_PROPERTY`. If both exist, prefer the domain property.

### Without credentials

`pnpm gsc --dry-run` signs with a throwaway key, answers every request with canned data, prints each request and the resulting report, and writes nothing. `pnpm test` checks the JWT claims and signature, the request URLs and bodies, and the report.

### What the API cannot do

- No Core Web Vitals, no Links report, no crawl stats, no Page indexing report. Read those in the Search Console UI. The URL Inspection API exists (2,000 inspections a day per property) if we ever need indexing status per URL.
- Data is final about three days after the fact, so the script's window ends three days ago. Rows are capped by Google's privacy filtering: rare queries are dropped, so query totals add up to less than the site total.
- The **Indexing API** is not for us. Google accepts it only for pages with `JobPosting` or `BroadcastEvent` (livestream) structured data. New pages reach Google through the sitemap, which the build regenerates on every deploy.
