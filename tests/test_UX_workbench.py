#!/usr/bin/env python3
"""UX redesign functional and visual acceptance: 31 labs, overlays, path editor.

Uses one-file offline HTML; tests interaction rather than relying on CSS snapshots
alone. It does not replace scientific R/JS validation or manual Safari QA.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
import argparse

ROOT=Path(__file__).resolve().parents[1]
LABS='''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'''.split()

def check(width, shot=False):
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':width,'height':900},accept_downloads=True)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content((ROOT/'index.html').read_text(),wait_until='load')
        # Home catalogue should be prioritized before explanatory methodology.
        assert page.evaluate('''() => {
          const x=document.querySelector('.part-tiles'),y=document.querySelector('.ux-home-help');
          return x&&y&&x.compareDocumentPosition(y)&Node.DOCUMENT_POSITION_FOLLOWING;
        }'''), 'Home catalogue is not prioritized'
        # Full-text sidebar filtering, without altering navigation state.
        if width<=1180:page.locator('#menuBtn').click()
        search=page.locator('.ux-sidebar-search')
        search.fill('kriging')
        assert page.locator('.sidebar .nav-list li:not([hidden])').count()==1
        assert page.locator('.sidebar a[data-id="kriging"]').count()==1
        search.fill('')
        assert page.locator('.sidebar .nav-list li:not([hidden])').count()==31
        if width<=1180:page.keyboard.press('Escape')
        tops=[]
        for lab in LABS:
            page.evaluate('(x)=>location.hash="#/"+x',lab)
            page.wait_for_function('(x)=>SA.currentLab===x&&document.querySelector(".ux-actions")',arg=lab)
            assert page.locator('.ux-actions').count()==1,lab
            assert page.locator('.experiment-panel').count()==1,lab
            assert page.locator('.course-bridge').count()==1,lab
            assert page.locator('.focus-box').count()<=1,lab
            assert page.locator('.lab-cover svg').count()==1,lab
            assert page.locator('.challenge-card').count()==3,lab
            assert page.locator('.ux-dialog').is_hidden(),lab
            pos=page.evaluate('''() => {
              const studio=document.querySelector('.lab-grid,.spatial-studio');
              return studio ? studio.getBoundingClientRect().top+scrollY : -1;
            }''')
            assert 0<pos<1000,(width,lab,'experiment too low',pos)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),(width,lab,'overflow')
            tops.append(round(pos))
            assert not errors,(width,lab,errors[-1] if errors else '')
        # Drawer opens as an overlay: the simulation never changes its document Y.
        page.evaluate('location.hash="#/intervalli"')
        page.wait_for_function('SA.currentLab==="intervalli"')
        original=page.evaluate('document.querySelector(".lab-grid").getBoundingClientRect().top+scrollY')
        for action in ('course','share','guide'):
            page.locator('[data-ux-action="'+action+'"]').click()
            assert page.locator('.ux-dialog:not([hidden])').is_visible(),action
            assert page.locator('.ux-dialog-pane:not([hidden])').count()==1
            unchanged=page.evaluate('document.querySelector(".lab-grid").getBoundingClientRect().top+scrollY')
            assert abs(original-unchanged)<2,(action,original,unchanged)
            if action=='course':
                assert page.locator('.ux-dialog-pane:not([hidden]) .course-bridge-links a').count()==2
            if action=='share':
                assert page.locator('.ux-dialog-pane:not([hidden]) .experiment-actions button').count()>=2
            if action=='guide':
                assert page.locator('.ux-dialog-pane:not([hidden]) .chips li').count()>=4
            page.keyboard.press('Escape')
            assert page.locator('.ux-dialog').is_hidden()
        if shot:
            (ROOT/'docs').mkdir(exist_ok=True)
            page.screenshot(path=str(ROOT/'docs'/f'UX_LAB08_{width}.png'))
            page.locator('[data-ux-action="course"]').click()
            page.screenshot(path=str(ROOT/'docs'/f'UX_LAB08_R_DRAWER_{width}.png'))
            page.keyboard.press('Escape')
        # An inaccessible teacher add button must never occupy the top bar.
        assert page.locator('.ux-actions .ux-teacher-add').count()==0
        page.evaluate('location.hash="#/teachers"')
        page.wait_for_selector('.teacher-builder')
        assert page.locator('.teacher-editor-grid').count()==1
        assert page.locator('.teacher-ux-toolbar').is_visible()
        page.get_by_role('button',name='Impostazioni del percorso').click()
        assert page.locator('.teacher-ux-panel:not([hidden])').is_visible()
        page.locator('input[aria-label="Titolo del percorso"]').fill('A teaching experiment')
        page.keyboard.press('Escape')
        assert page.locator('.teacher-ux-panel').is_hidden()
        assert 'A teaching experiment' in page.locator('.teacher-ux-summary').inner_text()
        page.locator('select[aria-label="Laboratorio da aggiungere"]').select_option('intervalli')
        page.get_by_role('button',name='Aggiungi laboratorio').click()
        page.locator('select[aria-label="Laboratorio da aggiungere"]').select_option('moran')
        page.get_by_role('button',name='Aggiungi laboratorio').click()
        assert page.locator('.teacher-outline-item').count()==2
        assert page.locator('.teacher-step:not([hidden])').count()==1
        page.locator('.teacher-outline-item').first.click()
        assert page.locator('.teacher-step:not([hidden])').count()==1
        assert 'Intervalli' in page.locator('.teacher-step:not([hidden])').inner_text()
        page.get_by_role('button',name='Esporta / Apri progetto').click()
        assert page.locator('.teacher-ux-panel:not([hidden]) .teacher-actions input[type=file]').count()==1
        page.keyboard.press('Escape')
        assert not errors,errors
        print('PASS UX',width,'px: 31 labs, workbench max',max(tops),'px, overlays/no reflow, sidebar, teacher editor')
        page.close();browser.close()

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--width',type=int,default=390)
    p.add_argument('--screenshots',action='store_true');a=p.parse_args()
    check(a.width,a.screenshots)
