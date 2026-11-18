#!/usr/bin/env python3
"""StatAtlas UX toolbar acceptance: real challenge and R-code DOM, no reflow.

Tests visible controls and actual interaction, not merely text presence.
Does not replace GNU R runtime numerical parity or manual Safari file:// QA.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
import sys

ROOT=Path(__file__).resolve().parents[1]
LABS='distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split()
EXPECTED=['guide','theory','challenges','course','code','share']

def run(width):
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':width,'height':880},accept_downloads=True,reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content((ROOT/'index.html').read_text(encoding='utf8'))
        for lab in LABS:
            page.evaluate('(lab)=>location.hash="#/"+lab',lab)
            page.wait_for_function('(lab)=>SA.currentLab===lab&&document.querySelector(".ux-actions")',arg=lab)
            kinds=page.locator('.ux-actions [data-ux-action]').evaluate_all('(xs)=>xs.map(x=>x.dataset.uxAction)')
            assert kinds==EXPECTED,(width,lab,'wrong toolbar order',kinds)
            assert page.locator('.ux-actions .ux-action-simulate').count()==0,(width,lab,'redundant Simula')
            assert page.locator('.ux-dialog-pane[data-ux-pane="challenges"] .challenge-card').count()==3,(width,lab)
            assert page.locator('.ux-dialog-pane[data-ux-pane="code"] .code').count()==1,(width,lab,'R exporter moved or lost')
            assert page.locator('.course-bridge').count()==1 and page.locator('.experiment-panel').count()==1,(width,lab)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,lab,'horizontal overflow')
            assert not errors,(width,lab,errors[-1])
        page.evaluate('location.hash="#/intervalli"')
        page.wait_for_function('SA.currentLab==="intervalli"')
        y=lambda: page.evaluate('document.querySelector(".lab-grid").getBoundingClientRect().top+scrollY')
        initial=y()
        for kind in ('guide','course','share','challenges','code'):
            page.locator(f'[data-ux-action="{kind}"]').click()
            assert page.locator('.ux-dialog:not([hidden])').is_visible(),(width,kind)
            assert page.locator(f'.ux-dialog-pane[data-ux-pane="{kind}"]').is_visible(),(width,kind)
            assert abs(y()-initial)<2,(width,kind,'laboratory reflow')
            if kind=='challenges':
                first=page.locator('.challenge-card').first
                first.locator('summary').click()
                assert first.locator('.challenge-activity').is_visible(),(width,'challenge baseline not started')
                # Switching challenges closes the previous one, but retains its state.
                second=page.locator('.challenge-card').nth(1)
                second.locator('summary').click()
                page.wait_for_function('!document.querySelectorAll(".challenge-card")[0].open')
                assert first.get_attribute('open') is None,(width,'multiple expanded challenges')
                second.locator('summary').click()
                first.locator('summary').click()
                first.get_by_role('button',name='Vai ai controlli').click()
                assert page.locator('.ux-dialog').is_hidden(),(width,'control return must close drawer')
                assert page.locator('.challenge-return').is_visible()
                page.locator('.challenge-return').click()
                assert page.locator('.ux-dialog').is_visible(),(width,'challenge continuation failed')
                assert first.get_attribute('open') is not None,(width,'challenge state lost')
            if kind=='code':
                code=page.locator('.ux-dialog-pane[data-ux-pane="code"] .code pre')
                assert len(code.inner_text())>1000
                assert 'set.seed' in code.inner_text(),(width,'R generator missing seed')
                with page.expect_download() as download:
                    page.locator('.ux-dialog-pane[data-ux-pane="code"] .code .toolbar button').last.click()
                assert download.value.suggested_filename.endswith('.R')
            if kind=='course':
                assert page.locator('.ux-dialog-pane[data-ux-pane="course"] .course-bridge-links a').count()==2
            page.keyboard.press('Escape')
            assert page.locator('.ux-dialog').is_hidden(),(width,kind,'Escape failure')
            assert abs(y()-initial)<2,(width,kind,'post-close reflow')
        # R code is live, not an initial static example: modifying the seed changes the script.
        page.locator('[data-ux-action="code"]').click()
        old=page.locator('.ux-dialog-pane[data-ux-pane="code"] .code pre').inner_text()
        page.keyboard.press('Escape')
        page.locator('.controls input[type="number"]').first.fill('2027')
        page.locator('.controls input[type="number"]').first.press('Tab')
        page.locator('[data-ux-action="code"]').click()
        fresh=page.locator('.ux-dialog-pane[data-ux-pane="code"] .code pre').inner_text()
        assert old!=fresh and '2027' in fresh,(width,'stale R script after setting change')
        page.keyboard.press('Escape')
        # Unmodified native theory drawer remains the only theory source.
        page.locator('[data-ux-action="theory"]').click()
        assert page.locator('.drawer.open').count()==1
        page.keyboard.press('Escape')
        assert page.locator('.drawer.open').count()==0
        assert not errors,(width,errors)
        print('PASS UX toolbar',width,'px: 31 labs; groups, Challenges, live R, downloads, focus and no reflow')
        browser.close()

if __name__=='__main__':
    if len(sys.argv)>1:run(int(sys.argv[1]))
    else:
        run(390)
        run(1366)
