#!/usr/bin/env bash
# Google's page-experience numbers for a page, from the PageSpeed Insights API, phone and desktop:
#   field: the Chrome UX Report, real Chrome visitors over 28 days at the 75th percentile, for
#          the URL and the whole origin. This is what Search uses; it has none for low-traffic URLs.
#   lab:   one Lighthouse run from Google's servers. It does not rank, but it shows why.
#   scripts/vitals.sh [url ...]     default: the homepage
# Without PSI_API_KEY the keyless quota is shared and often used up (HTTP 429); create a key in
# Google Cloud (APIs & Services, PageSpeed Insights API) and export it.
set -euo pipefail
urls=("${@:-https://happy.engineering/}")
# Search counts a metric good at p75 under these: LCP 2.5s, INP 200ms, CLS 0.1.
REPORT='
import json, os, sys
data = json.load(sys.stdin)
print("\n%s  %s" % (os.environ["URL"], os.environ["STRATEGY"]))
if "error" in data:
    print("  PageSpeed Insights: %s" % data["error"].get("message", data["error"]))
    sys.exit(0)
for label, key in (("field, this URL", "loadingExperience"), ("field, whole site", "originLoadingExperience")):
    metrics = data.get(key, {}).get("metrics", {})
    if not metrics:
        print("  %s: no data (too few Chrome visitors)" % label)
        continue
    row = []
    for name, metric in (("LCP", "LARGEST_CONTENTFUL_PAINT_MS"), ("INP", "INTERACTION_TO_NEXT_PAINT"),
                         ("CLS", "CUMULATIVE_LAYOUT_SHIFT_SCORE"), ("FCP", "FIRST_CONTENTFUL_PAINT_MS"),
                         ("TTFB", "EXPERIMENTAL_TIME_TO_FIRST_BYTE")):
        m = metrics.get(metric)
        if m:
            value = "%.2f" % (m["percentile"] / 100) if name == "CLS" else "%dms" % m["percentile"]
            row.append("%s %s %s" % (name, value, m.get("category", "").lower()))
    print("  %s: %s  %s" % (label, data[key].get("overall_category", "").lower(), " | ".join(row)))
lab = data.get("lighthouseResult", {})
audits = lab.get("audits", {})
score = lab.get("categories", {}).get("performance", {}).get("score")
row = ["%s %s" % (name, audits[a]["displayValue"]) for name, a in (("LCP", "largest-contentful-paint"),
       ("TBT", "total-blocking-time"), ("CLS", "cumulative-layout-shift"), ("FCP", "first-contentful-paint"),
       ("SI", "speed-index")) if a in audits]
print("  lab: score %s  %s" % (round(score * 100) if score is not None else "?", " | ".join(row)))
items = audits.get("largest-contentful-paint-element", {}).get("details", {}).get("items", [])
if items:
    node = (items[0].get("items") or [items[0]])[0].get("node", {})
    print("  lab LCP element: %s" % node.get("snippet", "?")[:120])
'
for url in "${urls[@]}"; do
  for strategy in mobile desktop; do
    query="url=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$url")&strategy=$strategy&category=performance"
    [ -n "${PSI_API_KEY:-}" ] && query+="&key=$PSI_API_KEY"
    curl -sS -m 180 "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?$query" |
      URL="$url" STRATEGY="$strategy" python3 -c "$REPORT"
  done
done
