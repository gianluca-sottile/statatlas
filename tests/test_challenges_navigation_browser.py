#!/usr/bin/env python3
"""Discoverability and context navigation, without modifying lab algorithms.
Default: five representative lessons at phone/tablet widths; --full: all 31.
Checks a complete focus-preserving return path and progress after answering.
"""
from pathlib import Path
import sys
from shutil import which
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
LABS = [
    'distribuzioni','bivariata','simulazione','lgn-tcl','adattamento','stimatori',
    'fisher','intervalli','test','regressione','regressione-lp','glm','arma',
    'quantilica','penalizzata','spline','segmentata','validazione','knn','alberi',
    'boost','reti-neurali','pca','clustering','dbscan','moran','lisa',
    'processi-puntuali','variogrammi','kriging','regressione-spaziale'
]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=which('chromium') or which('google-chrome'),
        headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for width in (390, 1024):
            page = browser.new_page(viewport={'width':width,'height':850},
                                    is_mobile=width==390,has_touch=width==390)
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto('about:blank#/test')
            page.set_content((ROOT/'index.html').read_text(),wait_until='load')
            for id in (LABS if '--full' in sys.argv else ['intervalli','boost','pca','kriging','regressione-spaziale']):
                page.evaluate('(id)=>location.hash="#/"+id',id)
                page.wait_for_function('(id)=>SA.currentLab===id',arg=id,timeout=30000)
                c=page.locator('.lab-head .challenge-shortcut')
                assert c.count()==1,(width,id,'missing header button')
                assert '0/3' in c.inner_text(),(width,id,'initial progress')
                section=page.locator('#sfide-'+id)
                assert section.count()==1,(width,id,'missing target section')
                c.click()
                assert page.evaluate('(id)=>document.activeElement?.id==="sfide-"+id',id),(width,id,'focus not on section')
                assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),(width,id,'overflow')
                if errors: raise AssertionError((width,id,errors[-1]))
            print('PASS: shortcuts and accessible destinations in all 31 labs at',width,'px',flush=True)
            page.close()
        page=browser.new_page(viewport={'width':1280,'height':900})
        page.goto('about:blank#/test')
        page.set_content((ROOT/'index.html').read_text(),wait_until='load')
        page.locator('.challenge-shortcut').click()
        q=page.locator('.challenge-card').first
        q.locator('summary').click()
        q.get_by_role('button',name='Vai ai controlli').click()
        r=page.locator('.controls .challenge-return')
        assert r.is_visible(),'return button not visible'
        r.click()
        assert page.evaluate('document.activeElement?.classList.contains("challenge-summary")'), 'return focus'
        page.locator('.controls .transport button').nth(1).click()
        q.locator('input[type=radio]').nth(1).check()
        q.get_by_role('button',name='Verifica la sfida').click()
        assert 'Sfida completata' in q.locator('.challenge-feedback').inner_text(),q.locator('.challenge-feedback').inner_text()
        assert '1/3' in page.locator('.challenge-shortcut').inner_text(),'header not updated after success'
        print('PASS: controls-return-focus and dynamic header progress',flush=True)
        page.close()
    finally:
        browser.close()
