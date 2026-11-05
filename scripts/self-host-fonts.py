#!/usr/bin/env python3
"""Fetches the site's faces from Google Fonts into public/fonts/ and writes src/fonts.css.

The files and @font-face rules are Google's own, subset by unicode-range, as a modern Chrome
gets them; only the URLs change, to /fonts/<face>-<subset>-<hash>.woff2. Change FAMILIES to
add a face or weight, run this from the repository root, and delete the files it no longer
names. The faces are under the SIL Open Font License 1.1 (THIRD_PARTY_NOTICES.md).
"""
import hashlib
import os
import re
import urllib.request

FAMILIES = (
    'family=Bricolage+Grotesque:opsz,wght@12..96,700&family=DM+Mono:wght@400;500'
    '&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700'
    '&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700'
    '&family=Space+Grotesk:wght@400;500;600;700&display=swap'
)
CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': CHROME})).read()


css = fetch(f'https://fonts.googleapis.com/css2?{FAMILIES}').decode()
os.makedirs('public/fonts', exist_ok=True)
names = {}


def local(url, family, subset):
    if url not in names:
        data = fetch(url)
        name = f"{family.lower().replace(' ', '-')}-{subset}-{hashlib.sha256(data).hexdigest()[:8]}.woff2"
        with open(f'public/fonts/{name}', 'wb') as file:
            file.write(data)
        names[url] = name
    return names[url]


def rule(match):
    subset, block = match.group(1), match.group(2)
    family = re.search(r"font-family: '([^']+)'", block).group(1)
    block = re.sub(r'url\((https://[^)]+)\)', lambda found: f"url('/fonts/{local(found.group(1), family, subset)}')", block)
    return f'/* {subset} */\n@font-face {{{block}}}'


body = re.sub(r'/\* ([\w-]+) \*/\n@font-face \{(.*?)\}', rule, css, flags=re.S)
with open('src/fonts.css', 'w') as file:
    file.write(
        "/* The site's faces, self-hosted: Google Fonts' own files and rules, subset by\n"
        '   unicode-range, so a page needs no other origin to draw its text (public/fonts/, OFL).\n'
        '   Written by scripts/self-host-fonts.py; the latin Plex Sans is preloaded in index.html. */\n'
        + body.strip() + '\n'
    )
print(f'{len(names)} files')
