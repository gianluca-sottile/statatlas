#!/usr/bin/env python3
"""Bilingual-interface and accessibility smoke test (no external services)."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LABS = ('distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
        'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
        'spline segmentata validazione knn alberi boost reti-neurali pca clustering '
        'dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale').split()

def main():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None,
                              args=['--no-sandbox', '--disable-dev-shm-usage'])
        try:
            for width in (390, 1366):
                page = b.new_page(viewport={'width':width, 'height':900})
                problems = []
                page.on('pageerror', lambda x: problems.append(str(x)))
                page.set_content(html, wait_until='load')
                assert page.locator('html').get_attribute('lang') == 'it'
                if width == 390:
                    page.locator('#menuBtn').click()
                page.locator('.lang-toggle').click()
                assert page.locator('html').get_attribute('lang') == 'en'
                assert 'Probability' in page.locator('#sidebar').inner_text()
                assert page.locator('h1').count() > 0
                if width == 390:
                    page.locator('#menuBtn').click()
                for id in LABS:
                    page.evaluate('(x) => { history.replaceState({}, "", "#/" + x); dispatchEvent(new Event("hashchange")); }', id)
                    assert page.evaluate('(x) => SA.currentLab === x', id), id
                    assert page.locator('section.en-companion').count() == 1, (width,id,'English companion missing')
                    assert page.locator('section.en-companion').get_attribute('lang') == 'en'
                    assert page.locator('section.en-companion dt').count() == 2
                    assert page.locator('section.en-companion p').count() >= 4
                    essential = page.locator('section.en-companion h3 + p').inner_text()
                    assert len(essential) > 60 and essential == page.evaluate('(lab) => SA.english.labs[lab].essential',id), (id,'Essential guide absent')
                    assert page.locator('.lab-head h1').count() == 1
                    assert page.locator('.lab-grid').count() <= 1
                    assert page.locator('section.step').count() >= 4
                    assert page.locator('.challenge-card').count() == 3
                    assert page.locator('.lab-head .lede').text_content() == page.evaluate('(lab) => SA.english.labs[lab].blurb',id)
                    assert not problems, (width,id,problems)
                page.locator('.lang-toggle').click() if width == 1366 else None
                if width == 1366:
                    assert page.locator('html').get_attribute('lang') == 'it'
                    assert page.locator('.en-companion').count() == 0
                print(f'PASS language {width}px: 31/31 English companions, original Italian preserved')
                page.close()
        finally:
            b.close()
if __name__ == '__main__': main()
