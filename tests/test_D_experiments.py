#!/usr/bin/env python3
"""Macrofase D: same-build JSON round-trip / offline links / hostile input."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
LABS='''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'''.split()


def run(width=1366):
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':width,'height':850},accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content(HTML,wait_until='load')
        for i,lab in enumerate(LABS,1):
            page.evaluate('(lab)=>{location.hash="#/"+lab}',lab)
            page.wait_for_function('(lab)=>window.SA.currentLab===lab&&!!document.querySelector(".experiment-panel")',arg=lab)
            snap=page.evaluate('SA.experiments.capture()')
            assert snap['lab']==lab and len(snap['engine'])==64,(i,lab,'fingerprint')
            assert snap['configuration']['fields'] is not None,(i,lab)
            assert snap['checkpoint'] is None or snap['checkpoint']['steps']>=0,(i,lab,'runner')
            page.evaluate('async x=>await SA.experiments.restore(x)',snap)
            snap2=page.evaluate('SA.experiments.capture()')
            assert snap2['lab']==lab,(i,lab)
            if snap['spatial']:
                assert snap2['spatial']['points']==snap['spatial']['points'],(lab,'spatial')
            elif snap['checkpoint']:
                assert snap2['checkpoint']['steps']==snap['checkpoint']['steps'],(lab,'steps')
            assert not errors,(lab,errors)
            if i%6==0 or i==31: print('PASS D default round-trip:',i,'/31',flush=True)
        # Full checkpoint: same seed, same progress, same experimental data.
        page.evaluate('location.hash="#/distribuzioni"')
        page.wait_for_function('SA.currentLab==="distribuzioni"')
        page.evaluate('()=>{for(let j=0;j<7;j++)SA.ui.activeRunner.stepOnce()}')
        snap=page.evaluate('SA.experiments.capture()')
        assert snap['checkpoint']['steps']==7,snap['checkpoint']
        before=page.locator('table.tv tbody').inner_text()
        page.evaluate('async x=>await SA.experiments.restore(x)',snap)
        after=page.locator('table.tv tbody').inner_text()
        assert before==after, ('checkpoint numeric mismatch',before,after)
        assert page.evaluate('SA.experiments.capture().checkpoint.steps')==7
        print('PASS D deterministic runner checkpoint, 7 observations')
        # Non-default numerical parameter: n=100, 4 draws.
        page.locator('.controls select[aria-label="Numero di osservazioni"]').select_option('100')
        page.evaluate('()=>{for(let j=0;j<4;j++)SA.ui.activeRunner.stepOnce()}')
        snap=page.evaluate('SA.experiments.capture()')
        before=page.locator('table.tv tbody').inner_text()
        page.evaluate('async x=>await SA.experiments.restore(x)',snap)
        assert before==page.locator('table.tv tbody').inner_text(),('changed parameter numeric mismatch')
        print('PASS D changed configuration + checkpoint')
        # URL compact round-trip and language independence.
        link=page.evaluate('SA.experiments.linkFor(SA.experiments.capture())')
        token=link.split('/exp/')[1]
        assert len(link)<1900
        if width<1180: page.locator('#menuBtn').click()
        page.locator('button.lang-toggle').first.click()
        page.wait_for_function('document.documentElement.lang === "en"')
        page.evaluate('(t)=>location.hash="#/distribuzioni/exp/"+t',token)
        page.wait_for_function('()=>window.SA.currentLab==="distribuzioni" && document.querySelector(".experiment-status").textContent.includes("restored")',timeout=20000)
        print('PASS D compact share link offline')
        # Invalid build, schema, out-of-range input, untrusted lab names.
        snapshot=page.evaluate('SA.experiments.capture()')
        for corrupt in ({**snapshot,'engine':'forged'}, {**snapshot,'version':999}, {**snapshot,'lab':'__proto__'}):
            assert page.evaluate('(x)=>{try{SA.experiments.validate(x);return false}catch(e){return true}}',corrupt)
        print('PASS D incompatible schema/engine/lab rejected')
        assert not errors,errors
        page.close();browser.close()

if __name__=='__main__':
    run(int(sys.argv[1]) if len(sys.argv)>1 else 1366)
