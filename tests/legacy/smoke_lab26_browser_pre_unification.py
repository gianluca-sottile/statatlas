# HISTORICAL TEST (read-only reference) - assumes removed 2.0 spatial UI.
"""Real-browser regression test for Lab 26 (optional development dependency: playwright).

Usage (from repo root):
  python3 -m pip install playwright
  python3 -m playwright install chromium
  python3 tests/smoke/smoke_lab26_browser.py

Set STATATLAS_CHROMIUM=/usr/bin/chromium to use a system installation.
No server is needed: the self-contained index.html is injected in a local browser page.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
HTML = ROOT / 'index.html'
ARTIFACTS = Path(os.environ.get('STATATLAS_SCREENSHOT_DIR', '/tmp'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
errors = []

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
    if os.environ.get('STATATLAS_CHROMIUM'):
        options['executable_path'] = os.environ['STATATLAS_CHROMIUM']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width': 1460, 'height': 960}, device_scale_factor=1)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content(HTML.read_text(encoding='utf-8'), wait_until='domcontentloaded')
    page.evaluate("window.location.hash='#/moran';window.dispatchEvent(new HashChangeEvent('hashchange')); ")
    page.locator('.lab-head h1').wait_for()

    assert page.locator('.lab-cover svg').count() == 1, 'Hero illustration missing'
    assert page.locator('.lab-head ul.chips li').count() >= 4, 'Learning objectives missing'
    assert page.locator('details.predict').count() == 1, 'Expandable prediction missing'
    page.locator('details.predict summary').click()
    assert page.locator('details.predict .choice input[type=radio]').count() == 3, 'Three answers missing'
    page.locator('details.predict .choice input[type=radio]').first.check()
    assert page.locator('details.predict .feedback').is_visible(), 'Prediction feedback missing'
    assert page.locator('.focus-box').count() == 1, 'What are we studying missing'
    assert page.locator('.moran-guide').count() == 1, 'Interactive guide missing'
    assert page.locator('.fig svg').count() == 3, 'One or more of the three charts missing'
    assert page.locator('.fig').first.locator('rect[role=button]').count() == 64, '64 editable territories missing'
    assert page.locator('table.tv tbody tr').count() == 7, 'Results table missing'
    assert page.locator('.kpis .kpi').count() == 3, 'Summary metrics missing'
    assert page.locator('.moran-perm-status').first.inner_text().lstrip().startswith('0 /'), 'Lab 26 started without a click'
    page.locator('.panel.controls .transport button').nth(1).click()
    assert page.locator('.moran-perm-status').first.inner_text().lstrip().startswith('1 /'), 'One manual step was not executed'
    assert page.locator('.transport .btn-primary').count() == 1, 'Playback controls missing'
    page.screenshot(path=str(ARTIFACTS/'moran_desktop.png'), full_page=True)

    cell = page.locator('.fig').first.locator('rect[role=button]').first
    old = cell.get_attribute('aria-label')
    cell.click()
    new = page.locator('.fig').first.locator('rect[role=button]').first.get_attribute('aria-label')
    assert old != new, 'Click did not modify the territory'

    page.locator('.controls label.field').filter(has_text='Vicinato').locator('select').select_option('queen')
    assert page.locator('.fig svg').count() == 3 and page.locator('table.tv tbody tr').count() == 7
    page.locator('.controls label.field').filter(has_text='Meccanismo generatore').locator('select').select_option('trend')
    assert page.locator('.controls label.field').filter(has_text='Trend simulato').count() == 1
    page.locator('.controls label.field').filter(has_text='Trend simulato').locator('select').select_option('detrended')
    assert page.locator('.prose').filter(has_text='trend vero').count() > 0

    page.locator('.head-actions button').click()
    assert page.locator('.drawer.open').count() == 1, 'Advanced drawer did not open'
    assert page.locator('.drawer-body').get_by_text('Il problema statistico').count() > 0
    page.locator('.drawer-head button[data-level=adv]').click()
    assert page.locator('.drawer-body').get_by_text('Forma matriciale e speranza permutazionale').count() > 0
    page.locator('.drawer-head button[aria-label=Chiudi]').click()

    page.evaluate("window.location.hash='#/dbscan';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('DBSCAN e confronto tra metodi').wait_for()
    assert page.locator('.fig svg').count() >= 4, 'Existing lab failed after navigation'
    page.evaluate("window.location.hash='#/moran';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('Autocorrelazione spaziale e Moran').wait_for()
    assert page.locator('.fig svg').count() == 3

    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    page.wait_for_timeout(650)  # let the responsive sidebar transition finish
    assert page.locator('.sidebar').evaluate('(e) => e.getBoundingClientRect().right') <= 2
    page.screenshot(path=str(ARTIFACTS/'moran_mobile_dark.png'), full_page=True)
    assert page.locator('.lab-cover svg').count() == 1
    assert not errors, 'JavaScript errors: ' + '; '.join(errors)
    print('OK browser LAB 26: hero, goals, prediction, 3 charts, 7 rows, no autoplay, manual step, changes, drawer, navigation, mobile/dark')
    browser.close()
