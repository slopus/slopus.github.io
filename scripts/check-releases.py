"""Check release radios, platform selection and layout with live GitHub data.

After pnpm build: uv run --with playwright python scripts/check-releases.py
Pass an optional site URL to check a deployment. Requires Playwright Chromium;
set CHROMIUM to use an existing executable. Results go in .context/.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
(ROOT / '.context').mkdir(exist_ok=True)
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4178'
PREFIX = 'live-' if BASE.startswith('https://') else ''
server = None
if BASE.startswith('http://127.0.0.1'):
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '4178', '--bind', '127.0.0.1', '--directory', str(ROOT / 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try:
            urllib.request.urlopen(BASE, timeout=1)
            break
        except OSError:
            time.sleep(.1)

cases = [
    ('mac', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 1440, 1100, 'macos'),
    ('linux', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 1440, 1100, 'linux'),
    ('mobile', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 390, 844, 'macos'),
]
results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, headless=True)
        for name, ua, width, height, expected in cases:
            context = browser.new_context(viewport={'width': width, 'height': height}, user_agent=ua, color_scheme='light', reduced_motion='reduce', device_scale_factor=1)
            page = context.new_page()
            responses = []
            errors = []
            page.on('response', lambda response: responses.append({'url': response.url, 'status': response.status}) if 'api.github.com/repos/slopus/happy-desktop/releases' in response.url else None)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + '/releases/', wait_until='networkidle')
            page.locator('#releases-panel-stable .one-desktop-button[href*="/download/"]').wait_for(state='visible')
            page.wait_for_function("document.querySelector('#releases-panel-preview .releases-version').textContent.length > 0")
            page.evaluate('document.fonts.ready')
            assert page.get_by_role('heading', name='Download Happy', exact=True).count() == 1
            assert page.get_by_role('radio', name='Stable', exact=True).is_checked()
            assert not errors, errors
            assert len(responses) == 2 and all(r['status'] == 200 for r in responses), responses
            phone = page.locator('.releases-mobile')
            stable_top = phone.evaluate('(el) => el.offsetTop')
            stable_link = page.locator('#releases-panel-stable .one-desktop-button')
            assert stable_link.get_attribute('data-download-platform') == expected
            page.screenshot(path=str(ROOT / '.context' / f'{PREFIX}releases-{name}-stable.png'), full_page=True)
            # Native radios must select with arrow keys and wrap in both directions.
            page.get_by_role('radio', name='Stable', exact=True).focus()
            page.keyboard.press('ArrowRight')
            assert page.get_by_role('radio', name='Preview', exact=True).is_checked()
            assert page.get_by_role('region', name='Stable', exact=True).count() == 0
            assert page.get_by_role('region', name='Preview', exact=True).count() == 1
            preview_top = phone.evaluate('(el) => el.offsetTop')
            assert stable_top == preview_top, (name, stable_top, preview_top)
            primary = page.locator('#releases-panel-preview .one-desktop-button')
            assert primary.get_attribute('data-download-platform') == expected
            assert page.get_by_role('combobox').count() == (1 if expected == 'macos' else 0)
            href = primary.get_attribute('href')
            if name == 'linux':
                assert href.endswith('-x64.AppImage') and '/Happy-' in href and '/Happy-Nightly-' not in href, href
                assert 'This preview build replaces Happy.' in page.locator('#releases-panel-preview .releases-note').inner_text()
                assert page.locator('#releases-panel-preview .releases-version').inner_text().startswith('Happy 0.')
            if name == 'mac':
                page.get_by_role('combobox', name='Preview Mac architecture', exact=True).select_option('x64')
                assert primary.get_attribute('href').endswith('-x64.dmg')
                page.get_by_role('radio', name='Stable', exact=True).click()
                assert stable_link.get_attribute('href').endswith('-x64.dmg')
                page.get_by_role('radio', name='Preview', exact=True).click()
                page.get_by_role('combobox', name='Preview Mac architecture', exact=True).select_option('arm64')
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            page.get_by_role('radio', name='Preview', exact=True).blur()
            page.screenshot(path=str(ROOT / '.context' / f'{PREFIX}releases-{name}-preview.png'), full_page=True)
            page.get_by_role('radio', name='Preview', exact=True).focus()
            page.keyboard.press('ArrowRight')
            assert page.get_by_role('radio', name='Stable', exact=True).is_checked()
            assert phone.evaluate('(el) => el.offsetTop') == stable_top
            page.keyboard.press('ArrowLeft')
            assert page.get_by_role('radio', name='Preview', exact=True).is_checked()
            results.append({'device': name, 'viewport': [width, height], 'stablePhoneOffsetTop': stable_top, 'previewPhoneOffsetTop': preview_top, 'previewPrimary': href, 'githubResponses': responses, 'errors': errors})
            context.close()
        browser.close()
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
(ROOT / '.context' / f'{PREFIX}releases-browser-results.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results, indent=2))