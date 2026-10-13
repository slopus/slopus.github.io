#!/usr/bin/env bash
# Search Console for happy.engineering with no key file: mints a 1-hour token by
# impersonating the SEO service account with your gcloud login (GSC_ACCOUNT, or
# the active one), which needs roles/iam.serviceAccountTokenCreator on it.
# "Request indexing" has no API; it is UI-only.
#   scripts/gsc.sh sitemaps                 sitemap status: lastDownloaded, isPending, errors
#   scripts/gsc.sh inspect [url ...]        index status per URL; no URLs = every URL in the live sitemap
#   scripts/gsc.sh GET|POST <path> [json]   any Search Console v3 call, e.g.
#     scripts/gsc.sh POST /sites/https%3A%2F%2Fhappy.engineering%2F/searchAnalytics/query \
#       '{"startDate":"2026-09-01","endDate":"2026-10-01","dimensions":["query"]}'
#   scripts/gsc.sh token                    prints the access token
set -euo pipefail

SA="kirill-bra1ndump-happy-eng-seo@happy-engineering-511409.iam.gserviceaccount.com"
SITE="https://happy.engineering/"
SITE_PATH="/sites/https%3A%2F%2Fhappy.engineering%2F"
BASE="https://www.googleapis.com/webmasters/v3"

token() {
  curl -sf -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token ${GSC_ACCOUNT:+--account="$GSC_ACCOUNT"})" \
    -H "Content-Type: application/json" \
    "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SA}:generateAccessToken" \
    -d '{"scope":["https://www.googleapis.com/auth/webmasters"],"lifetime":"3600s"}' |
    python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])'
}

call() {
  local method=$1 path=$2 body=${3:-}
  local args=(-s -X "$method" -H "Authorization: Bearer $(token)")
  [ -n "$body" ] && args+=(-H "Content-Type: application/json" -d "$body")
  curl "${args[@]}" "${BASE}${path}"
}

# Results for the same URL can flip between calls minutes apart, so one "unknown" proves nothing.
inspect() {
  local urls
  if [ $# -gt 0 ]; then urls=$(printf '%s\n' "$@")
  else urls=$(curl -sf "${SITE}sitemap.xml" | grep -o '<loc>[^<]*' | sed 's/<loc>//'); fi
  GSC_TOKEN=$(token) GSC_SITE=$SITE python3 -I -c '
import json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

def inspect(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                data=json.dumps({"inspectionUrl": url, "siteUrl": os.environ["GSC_SITE"]}).encode(),
                headers={"Authorization": "Bearer " + os.environ["GSC_TOKEN"], "Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=60))["inspectionResult"]["indexStatusResult"]
            return r.get("coverageState", "?"), r.get("lastCrawlTime", "-")[:10], url
        except Exception as e:
            err = str(e)
            time.sleep(2)
    return "ERROR " + err[:60], "-", url

urls = sys.stdin.read().split()
with ThreadPoolExecutor(5) as pool:
    rows = sorted(pool.map(inspect, urls))
for state, crawled, url in rows:
    print(f"{state:42} {crawled:10} {url}")
' <<<"$urls"
}

case "${1:-}" in
  token) token ;;
  sitemaps) call GET "${SITE_PATH}/sitemaps" ;;
  inspect) shift; inspect "$@" ;;
  GET|POST|PUT|DELETE) call "$@" ;;
  *) echo "usage: $0 sitemaps | inspect [url ...] | GET|POST|PUT|DELETE <path> [json-body] | token" >&2; exit 1 ;;
esac
