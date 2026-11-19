#!/usr/bin/env python3
"""Mobile transport contract: native runner proxies and spatial map controls.

This is UX/event-layer evidence, not a replacement for R numerical parity or
native iPhone Safari safe-area/keyboard testing.
"""
import argparse
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
LABS='distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split()
SPATIAL=set('moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split())

def inspect(width,language='it',all_labs=True):
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=which('chromium') or which('google-chrome') or None,
            headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
        page=ctx.new_page()
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content((ROOT/'index.html').read_text(encoding='utf-8'),wait_until='load')
        if language=='en':
            page.evaluate('SA.i18n.setLanguage("en",SA.catalog)')
        targets=LABS if all_labs else ['intervalli','reti-neurali','moran','kriging']
        for lab in targets:
            page.evaluate('(name)=>location.hash="#/"+name',lab)
            page.wait_for_function('(name)=>SA.currentLab===name && document.querySelector(".sa-mobile-transport")',arg=lab)
            bar=page.locator('.sa-mobile-transport')
            assert bar.count()==1,(lab,'missing or duplicate transport')
            assert page.locator('.lab-mobile-nav').count()==1,(lab,'native bottom navigation missing')
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),(width,lab,'horizontal overflow')
            surface='.spatial-studio-map' if lab in SPATIAL else '.lab-grid .figure'
            page.locator(surface).first.scroll_into_view_if_needed()
            page.wait_for_timeout(35)
            if width>640:
                assert bar.is_hidden(),(width,lab,'transport visible outside mobile')
                continue
            if lab=='penalizzata':
                # Geometrical view has no runner actions; dynamically changing
                # to the regularization-path view installs the real transport.
                assert bar.is_hidden(),(width,'no stale controls in geometric view')
                page.locator('.controls .seg').first.locator('button').nth(1).click()
                page.locator('.lab-grid .figure').first.scroll_into_view_if_needed()
            page.wait_for_function('!document.querySelector(".sa-mobile-transport").hidden',timeout=4000)
            mode=bar.get_attribute('data-transport-mode')
            assert mode==('spatial' if lab in SPATIAL else 'runner'),(width,lab,mode)
            keys=page.locator('.sa-mobile-transport-btn').evaluate_all('(a)=>a.map(x=>x.dataset.transportAction)')
            if lab not in SPATIAL: assert keys==['play','step','finish','reset'],(width,lab,keys)
            else: assert len(keys)==4 and keys[-2:]==['params','reset'],(width,lab,keys)
            assert page.evaluate('''() => {
                const bar=document.querySelector('.sa-mobile-transport').getBoundingClientRect();
                const nav=document.querySelector('.lab-mobile-nav');
                const r=nav.getBoundingClientRect();
                return bar.bottom<=innerHeight+2 && bar.top>=innerHeight-140 &&
                       getComputedStyle(nav).visibility==='hidden' &&
                       [...document.querySelectorAll('.sa-mobile-transport-btn')].every(b=>b.getBoundingClientRect().height>=44);
            }'''),(width,lab,'overlap, target too small or stacked nav')
            if lab in ('intervalli','reti-neurali'):
                start=page.locator('.sa-mobile-transport-btn[data-transport-action="play"]')
                assert not page.evaluate('SA.ui.activeRunner.running')
                start.click()
                assert page.evaluate('SA.ui.activeRunner.running'),(lab,'start not forwarded')
                page.wait_for_timeout(50)
                assert start.inner_text().strip()==('Pause' if language=='en' else 'Pausa'),(lab,'play/pause not synchronized')
                start.click()
                assert not page.evaluate('SA.ui.activeRunner.running'),(lab,'pause not forwarded')
                # Avoid reading state via experimental checkpoint: it pauses the source runner.
                original=page.locator('.controls .progress i').first.get_attribute('style')
                page.locator('[data-transport-action="step"]').click()
                after=page.locator('.controls .progress i').first.get_attribute('style')
                assert original!=after,(lab,'step did not advance native runner')
                page.locator('[data-transport-action="reset"]').click()
                assert '0%' in page.locator('.controls .progress i').first.get_attribute('style'),(lab,'reset failed')
            if lab in ('moran','kriging'):
                root=page.locator('.spatial-studio')
                second=page.locator('.sa-mobile-transport-btn').nth(1)
                second.click()
                tool=second.get_attribute('data-source-action')
                # Every map action dispatches through the original spatial-study tool.
                target=page.locator('.spatial-studio-tools [data-tool]').nth(1)
                assert target.get_attribute('aria-pressed')=='true',(lab,'map tool not updated')
                assert second.get_attribute('aria-pressed')=='true',(lab,'floating tool not synchronized')
                if lab=='moran':
                    root.locator('.spatial-studio-map svg').first.click(position={'x':180,'y':130})
                    assert root.locator('.spatial-studio-stats').is_visible()
            # Drawer opens without the floating controls overlapping its interactive content.
            if lab=='intervalli':
                page.evaluate('document.querySelector("[data-ux-action=guide]").click()')
                assert page.locator('.ux-dialog').is_visible()
                assert bar.is_hidden(),(width,'bar overlaps guide')
                page.keyboard.press('Escape')
                assert page.locator('.ux-dialog').is_hidden()
                page.wait_for_function('!document.querySelector(".sa-mobile-transport").hidden && getComputedStyle(document.querySelector(".sa-mobile-transport")).display!=="none"',timeout=2500)
                assert bar.is_visible(),(width,'bar not restored after guide')
                # Theory uses a separate, lazily created drawer. Its close
                # must also restore transport without scrolling to the header.
                y=page.evaluate('scrollY')
                page.evaluate('document.querySelector("[data-ux-action=theory]").click()')
                assert page.locator('.drawer.open').count()==1 and bar.is_hidden()
                page.keyboard.press('Escape')
                page.wait_for_function('!document.querySelector(".sa-mobile-transport").hidden',timeout=2500)
                assert abs(page.evaluate('scrollY')-y)<2,(width,'theory drawer changed scroll position')
            assert not errors,(width,lab,errors[-1])
        if width<=640:
            # Route change disposes listeners and the old element.
            page.evaluate('location.hash="#/"')
            page.wait_for_function('SA.currentLab===null')
            assert page.locator('.sa-mobile-transport').count()==0,'leaked transport on home'
            page.evaluate('location.hash="#/intervalli"')
            page.wait_for_function('SA.currentLab==="intervalli"')
            assert page.locator('.sa-mobile-transport').count()==1,'duplicate after remount'
        assert not errors,errors
        print('PASS mobile transport',width,language,':',len(targets),'labs; real play/pause/step/reset, spatial tools, bottom nav switching, drawers and teardown',flush=True)
        ctx.close();browser.close()

def check_student():
    import json
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=which('chromium') or which('google-chrome') or None,
            headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx=browser.new_context(viewport={'width':390,'height':844})
        author=ctx.new_page()
        author.set_content((ROOT/'index.html').read_text(encoding='utf-8'))
        project=json.loads((ROOT/'examples/E_progetto_campionamento.json').read_text(encoding='utf-8'))
        html=author.evaluate('(p)=>{p.engine=SA.buildId;return SA.teachers.buildStudentHTML(p)}',project)
        student=ctx.new_page(); errors=[]
        student.on('pageerror',lambda e:errors.append(str(e)))
        student.set_content(html,wait_until='load')
        student.wait_for_function('SA.currentLab==="lgn-tcl"')
        student.locator('.lab-grid .figure').scroll_into_view_if_needed()
        student.wait_for_function('document.querySelector(".sa-mobile-transport") && !document.querySelector(".sa-mobile-transport").hidden')
        assert student.locator('.sa-mobile-transport-btn').count()==4
        before=student.locator('.controls .progress i').first.get_attribute('style')
        student.locator('[data-transport-action="step"]').click()
        after=student.locator('.controls .progress i').first.get_attribute('style')
        assert before!=after,('standalone student runner did not advance',before,after)
        assert not errors,errors
        print('PASS standalone student HTML: mobile transport and checkpoint-compatible native runner',flush=True)
        ctx.close();browser.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--width',type=int,default=390)
    parser.add_argument('--language',choices=['it','en'],default='it')
    parser.add_argument('--spot',action='store_true')
    args=parser.parse_args()
    inspect(args.width,args.language,not args.spot)
    if args.width==390 and args.language=='it':check_student()
