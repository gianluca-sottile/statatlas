"""Single-dataset regression smoke for unified spatial laboratories 26-31.

Uses real mouse/touch UI and requires a live change in the *same* R export.
Not a replacement for the advanced legacy experimental procedures.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]


def run(lab):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True,
            executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox','--disable-dev-shm-usage'])
        try:
            page = browser.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto('about:blank#/'+lab)
            page.set_content((ROOT/'index.html').read_text(encoding='utf-8'))
            page.wait_for_function('(id)=>window.SA.currentLab===id',arg=lab)
            studio=page.locator('.spatial-studio')
            assert studio.count()==1 and page.locator('.lab-grid').count()==0,lab
            assert studio.locator('.spatial-studio-map svg').count()==1,lab
            assert studio.locator('.spatial-studio-stat').count()>=3,lab
            assert page.locator('.challenge-card').count()==3,lab
            assert page.locator('.transport button').count()==0,lab
            code=page.locator('pre[aria-label="Codice R"]').first
            original=code.text_content()
            oldn=int(studio.get_attribute('data-points'))
            oldvar=float(studio.get_attribute('data-mean-variance')) if lab=='kriging' else None
            button=studio.locator('[data-action="map"]')
            box=button.bounding_box()
            button.click(position={'x':.85*box['width'],'y':.16*box['height']})
            assert int(studio.get_attribute('data-points'))==oldn+1,lab
            assert code.text_content()!=original,lab+' R export not refreshed'
            if lab=='kriging':
                assert float(studio.get_attribute('data-mean-variance'))<=oldvar+1e-7
            studio.locator('.spatial-studio-reset').first.click()
            assert int(studio.get_attribute('data-points'))==oldn,lab
            assert not errors,(lab,errors)
            print('PASS unified spatial smoke',lab,'mobile add/reset, single map and live R')
        finally:
            browser.close()
