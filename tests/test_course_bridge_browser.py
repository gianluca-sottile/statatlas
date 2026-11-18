#!/usr/bin/env python3
"""Offline browser QA for the 31 per-lab links and worksheets.

Validates the locally bundled bridge only; does not claim remote HTTP 200 checks.
"""
from pathlib import Path
import argparse
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT/'index.html').read_text(encoding='utf-8')
LABS = '''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli
 test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione
 knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi
 kriging regressione-spaziale'''.split()


def run(width):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True,
            executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox','--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width':width,'height':844},accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        try:
            page.set_content(HTML, wait_until='load')
            for i,lab in enumerate(LABS,1):
                errors.clear()
                page.evaluate('(id)=>location.hash="#/"+id',lab)
                page.wait_for_function('(id)=>window.SA.currentLab===id',arg=lab)
                panel=page.locator(f'[data-course-bridge="{lab}"]')
                assert panel.count()==1, (lab,'panel missing/duplicate')
                assert panel.locator('a').count()==2, (lab,'course links')
                links=panel.locator('a').evaluate_all('nodes=>nodes.map(e=>({href:e.href,target:e.target,rel:e.rel,lang:e.lang}))')
                assert all(l['href'].startswith('https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/')
                           and l['href'].endswith('.html') and l['target']=='_blank'
                           and 'noopener' in l['rel'] and 'noreferrer' in l['rel'] for l in links), (lab,links)
                assert panel.locator('details > summary').count()==1,lab
                assert panel.locator('.course-bridge-steps > p').count()==4,lab
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),(width,lab,'overflow')
                assert not errors, (lab,errors)
                if i in (1,22,26,31):
                    page.locator('[data-ux-action="course"]').click()
                    with page.expect_download() as d:
                        panel.locator('button.course-bridge-download').click()
                    page.locator('.ux-close').click()
                    download=d.value
                    assert download.suggested_filename==f'StatAtlas_{i:02d}_scheda_studente.md'
                    text=download.path().read_text(encoding='utf-8')
                    assert '## Riproducibilità in R' in text and '## Interpretazione e limitazioni' in text
                    assert 'https://gianluca-sottile.github.io/' in text
            # Regression guard: an Italian worksheet keeps the pre-C filename,
            # while the English edition offers a separate localized download.
            if width < 700:
                page.locator('#menuBtn').click()
            page.locator('button.lang-toggle').first.click()
            page.wait_for_function('document.documentElement.lang === "en"')
            if width < 700:
                page.locator('#menuBtn').click()
            page.evaluate('location.hash="#/distribuzioni"')
            page.wait_for_function('window.SA.currentLab==="distribuzioni"')
            page.locator('[data-ux-action="course"]').click()
            with page.expect_download() as d:
                page.locator('[data-course-bridge="distribuzioni"] button.course-bridge-download').click()
            page.locator('.ux-close').click()
            download = d.value
            assert download.suggested_filename == 'StatAtlas_01_EN_student_worksheet.md', download.suggested_filename
            text = download.path().read_text(encoding='utf-8')
            assert '## Research question' in text and '## Reproducing the experiment in R' in text
            assert '## Assumptions and limitations' in text
            assert not errors, ('en', errors)
            print(f'PASS course bridge: {len(LABS)} labs at {width}px, 4 IT + 1 EN downloads, no JS exceptions')
        finally:
            page.close();browser.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--width',type=int,default=390)
    run(parser.parse_args().width)
