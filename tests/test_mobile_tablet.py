"""Visual regression/functional smoke test for the offline StatAtlas build.

Runs without a web server by supplying the complete self-contained index.html
as page content. Requires Python playwright and Chromium (optional for users).
No source code, model parameters or simulation datasets are modified.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
LABS = '''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher
intervalli test regressione regressione-lp glm arma quantilica penalizzata spline
segmentata validazione knn alberi boost reti-neurali pca clustering dbscan
moran lisa processi-puntuali variogrammi kriging regressione-spaziale'''.split()
SPATIAL = set(LABS[-6:])


def main():
    with sync_playwright() as p:
        opts = {'headless': True}
        if Path('/usr/bin/chromium').exists():
            opts.update(executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
        browser = p.chromium.launch(**opts)
        try:
            for width, height in ((320, 740), (390, 844), (768, 1024), (1024, 768)):
                page = browser.new_page(viewport={'width': width, 'height': height},
                                        is_mobile=width <= 640, has_touch=width <= 1024)
                failures = []
                page.on('pageerror', lambda exc: failures.append(str(exc)))
                page.set_content(HTML, wait_until='load')
                for lab in LABS:
                    failures.clear()
                    page.evaluate('(id) => { location.hash = "#/" + id; }', lab)
                    state = page.evaluate('''() => ({
                        width: innerWidth, scroll: document.documentElement.scrollWidth,
                        figures: document.querySelectorAll('.fig').length,
                        guides: document.querySelectorAll('.lab-howto').length,
                        studios: document.querySelectorAll('.spatial-studio').length,
                        maps: document.querySelectorAll('.spatial-studio-map svg').length,
                        stats: document.querySelectorAll('.spatial-studio-stat').length,
                        quick: document.querySelectorAll('.lab-mobile-nav button').length,
                        running: !!document.querySelector('.transport .btn-primary[aria-pressed="true"]')
                    })''')
                    assert state['scroll'] <= width + 1, (width, lab, 'horizontal overflow', state)
                    assert state['guides'] == 1, (width, lab, 'missing guide')
                    if lab in SPATIAL:
                        assert state['figures'] == 0, (width, lab, 'legacy figure reintroduced')
                        assert state['studios'] == 1 and state['maps'] == 1 and state['stats'] >= 3, (width, lab, 'missing spatial studio', state)
                    else:
                        assert state['figures'] > 0 and state['studios'] == 0, (width, lab, 'missing classic figures', state)
                    if width <= 860:
                        assert state['quick'] >= 3, (width, lab, 'quick-navigation missing')
                        labels = page.locator('.lab-mobile-nav button').all_text_contents()
                        expected = ['Parametri', 'Mappa', 'Risultati', 'Inizio'] if lab in SPATIAL else ['Parametri', 'Grafici', 'Inizio']
                        assert all(label in labels for label in expected), (width, lab, 'wrong navigation targets', labels)
                    if lab in SPATIAL:
                        assert not state['running'], (width, lab, 'unexpected autoplay')
                    assert not failures, (width, lab, failures)
                print(f'PASS {width}px: {len(LABS)}/{len(LABS)} labs, no overflow / JS exceptions')
                page.close()

            page = browser.new_page(viewport={'width': 390, 'height': 844},
                                    has_touch=True, is_mobile=True)
            page.set_content(HTML, wait_until='load')
            page.evaluate("location.hash='#/kriging'")
            menu = page.locator('#menuBtn')
            menu.click()
            assert menu.get_attribute('aria-expanded') == 'true'
            assert page.locator('.nav-backdrop').is_visible()
            page.keyboard.press('Escape')
            assert menu.get_attribute('aria-expanded') == 'false'
            assert page.locator('#sidebar').evaluate('(el) => el.inert')
            # The new contextual map transport is deliberately visible on a
            # 390px Kriging screen even at scrollY=0 (the map begins inside the
            # first viewport). It hides the old section-navigation bar by
            # design. Verify the absence of stacked navs, then test the
            # historical section jump links on a touch tablet (768px), where
            # they are intentionally used instead of the floating transport.
            page.wait_for_function('''() => {
                const bar=document.querySelector('.sa-mobile-transport');
                return bar && !bar.hidden && getComputedStyle(bar).display!=='none';
            }''')
            assert not page.locator('.lab-mobile-nav').is_visible(), 'stacked smartphone navs'
            page.set_viewport_size({'width': 768, 'height': 1024})
            page.wait_for_function('''() => {
                const nav=document.querySelector('.lab-mobile-nav');
                const bar=document.querySelector('.sa-mobile-transport');
                return nav && getComputedStyle(nav).visibility==='visible'
                       && bar && getComputedStyle(bar).display==='none';
            }''')
            # On the unified spatial studio the navigation targets the single
            # controls panel and map, not a legacy chart/transport widget.
            page.locator('.lab-mobile-nav button').filter(has_text='Parametri').click()
            page.wait_for_timeout(420)
            assert page.locator('.spatial-studio-panel').evaluate('(el) => el.getBoundingClientRect().top < innerHeight')
            assert page.locator('.spatial-studio-panel .spatial-studio-btn').first.is_visible()
            page.locator('.lab-mobile-nav button').filter(has_text='Mappa').click()
            page.wait_for_timeout(420)
            assert page.locator('.spatial-studio-map').evaluate('(el) => el.getBoundingClientRect().top < innerHeight')
            page.locator('.lab-mobile-nav button').filter(has_text='Risultati').click()
            page.wait_for_timeout(420)
            assert page.locator('.spatial-studio-stats').evaluate('(el) => el.getBoundingClientRect().top < innerHeight')
            page.locator('.lab-mobile-nav button').filter(has_text='Inizio').click()
            page.wait_for_timeout(420)
            page.locator('.ux-action-theory').first.click()
            assert page.locator('.drawer.open').count() == 1
            tabs = page.locator('.seg-tabs button')
            assert tabs.count() == 4
            for i in range(4):
                assert tabs.nth(i).evaluate('(el) => el.getBoundingClientRect().height') >= 44
            tabs.nth(1).click()
            assert tabs.nth(1).get_attribute('aria-pressed') == 'true'
            page.locator('.drawer-head button').last.click()
            print('PASS touch: spatial menu, map/results jump links and theory tabs')
            page.close()

            # Regression guard for legacy labs: chart zoom is supported there,
            # and must not be falsely demanded of the unified spatial map.
            page = browser.new_page(viewport={'width': 390, 'height': 844},
                                    has_touch=True, is_mobile=True)
            page.set_content(HTML, wait_until='load')
            page.evaluate("location.hash='#/regressione'")
            page.locator('.lab-mobile-nav button').filter(has_text='Grafici').click()
            page.wait_for_timeout(420)
            assert page.locator('.fig').first.evaluate('(el) => el.getBoundingClientRect().top < innerHeight')
            page.locator('.fig-zoom-btn').first.click()
            assert page.locator('.fig.fig-in-modal').evaluate('(el) => el.getBoundingClientRect().width >= 610')
            page.locator('.fig-modal-close').click()
            assert page.locator('.fig-modal').count() == 0
            print('PASS touch: classic lab charts, navigation and chart zoom')
            page.close()
        finally:
            browser.close()


if __name__ == '__main__':
    main()
