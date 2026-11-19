#!/usr/bin/env python3
"""IT/EN teacher onboarding and centered footer visual/interaction regression."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')


def verify(width, english):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome'),
                                    args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': width, 'height': 900}, accept_downloads=True)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(HTML, wait_until='load')
        if english:
            page.evaluate('document.querySelector("button.lang-toggle").click()')
        page.evaluate('location.hash="#/teachers"')
        page.wait_for_selector('.teacher-page > .teacher-builder')
        guide = page.locator('.teacher-guide')
        assert guide.is_visible(), 'Teacher guide missing'
        assert guide.get_attribute('open') is not None, 'Guide should be expanded on initial visit'
        assert guide.locator('.teacher-guide-step').count() == 6
        assert guide.locator('summary').is_visible()
        text = guide.inner_text()
        assert ('No programming required' if english else 'Non occorre programmare') in text
        assert ('not saved automatically' if english else 'non viene salvato automaticamente') in text
        assert ('JSON = editable' if english else 'JSON = progetto') in text
        assert ('student HTML' if english else 'HTML studenti') in text
        assert ('24 activities' if english else '24 attività') in text
        assert ('31 laboratories' if english else '31 disponibili') in text
        # Confirm the old full-bleed footer regression cannot return.
        assert page.locator('.teacher-page > .foot').count() == 1
        assert page.locator('main > .foot').count() == 0
        sizes = page.evaluate('''() => {
          const b = document.querySelector('.teacher-builder').getBoundingClientRect();
          const f = document.querySelector('.teacher-page > .foot').getBoundingClientRect();
          const p = document.querySelector('.teacher-page').getBoundingClientRect();
          return {bl:b.left,fl:f.left,br:b.right,fr:f.right,pl:p.left,pr:p.right,
            by:b.bottom,fy:f.top, overflow:document.documentElement.scrollWidth-innerWidth};
        }''')
        assert abs(sizes['bl'] - sizes['fl']) <= 2, ('footer starts outside editor', sizes)
        assert abs(sizes['br'] - sizes['fr']) <= 2, ('footer ends outside editor', sizes)
        assert sizes['fy'] >= sizes['by'] - 2, ('footer overlaps editor', sizes)
        assert sizes['overflow'] <= 2, ('horizontal overflow', sizes)
        assert page.locator('.teacher-page > .foot a').count() == 4
        # The native disclosure is keyboard and pointer operable; preserve state across editor rerenders.
        guide.locator('summary').click()
        assert guide.get_attribute('open') is None
        add = 'Add laboratory' if english else 'Aggiungi laboratorio'
        page.get_by_role('button', name=add).click()
        assert page.locator('.teacher-guide').get_attribute('open') is None
        guide.locator('summary').click()
        assert guide.get_attribute('open') is not None
        # A teacher can still open settings and exports with the expanded help.
        settings = 'Path settings' if english else 'Impostazioni del percorso'
        page.get_by_role('button', name=settings).click()
        assert page.locator('.teacher-ux-panel:not([hidden])').is_visible()
        page.keyboard.press('Escape')
        assert page.locator('.teacher-ux-panel').is_hidden()
        assert not errors, errors
        label = ('EN' if english else 'IT')
        print(f'PASS teachers guide/footer {width}px {label}; aligned footer and live actions', flush=True)
        browser.close()


if __name__ == '__main__':
    for width in (320, 390, 768, 1366):
        for english in (False, True):
            verify(width, english)
