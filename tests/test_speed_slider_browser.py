#!/usr/bin/env python3
"""Live 25-lab speed control QA, desktop and mobile (does not modify statistical engines)."""
from pathlib import Path
import argparse
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
LABS = ('distribuzioni bivariata simulazione lgn-tcl adattamento stimatori '
        'fisher intervalli test regressione regressione-lp glm arma quantilica '
        'penalizzata spline segmentata validazione knn alberi boost reti-neurali '
        'pca clustering dbscan').split()
SPATIAL = 'moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split()

parser=argparse.ArgumentParser()
parser.add_argument('--width',type=int, choices=(390,1366))
parser.add_argument('--no-motion-test',action='store_true')
args=parser.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None,
                          args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        for width in ((args.width,) if args.width else (390,1366)):
            page=b.new_page(viewport={'width':width,'height':844})
            failures=[]
            page.on('pageerror',lambda e:failures.append(str(e)))
            page.set_content(HTML,wait_until='load')
            for lab in LABS:
                page.evaluate('(id)=>location.hash="#/"+id',lab)
                page.wait_for_function('(id)=>window.SA.currentLab===id',arg=lab)
                if lab == 'penalizzata':
                    page.get_by_role('button',name='Percorsi',exact=True).first.click()
                slider=page.locator('input[aria-label="Velocità"]')
                assert slider.count()==1, (width,lab,'slider count',slider.count())
                assert slider.get_attribute('min')=='0'
                assert slider.get_attribute('max')=='100'
                assert slider.get_attribute('step')=='1'
                assert slider.input_value()=='25', (lab,slider.input_value())
                out=slider.locator('xpath=..').locator('output')
                assert out.text_content()=='25/100', (lab,out.text_content())
                slider.fill('26')
                assert slider.input_value()=='26' and out.text_content()=='26/100', lab
                slider.fill('25')
                assert not failures, (lab,failures)
            # LAB 06 has a custom runner. Reopening it must restore 25, not
            # carry over a previously selected speed.
            page.evaluate("location.hash='#/stimatori'")
            page.wait_for_function("window.SA.currentLab==='stimatori'")
            page.locator('input[aria-label="Velocità"]').fill('96')
            page.evaluate("location.hash='#/simulazione'")
            page.wait_for_function("window.SA.currentLab==='simulazione'")
            page.evaluate("location.hash='#/stimatori'")
            page.wait_for_function("window.SA.currentLab==='stimatori'")
            assert page.locator('input[aria-label="Velocità"]').input_value()=='25', 'LAB06 speed must reset on remount'
            for lab in SPATIAL:
                page.evaluate('(id)=>location.hash="#/"+id',lab)
                page.wait_for_function('(id)=>window.SA.currentLab===id',arg=lab)
                assert page.locator('input[aria-label="Velocità"]').count()==0, lab
                assert not failures,(lab,failures)
            print(f'PASS {width}px: 25 animated labs with 0..100 default25, 6 spatial maps without inert speed controls, no JS exceptions')
            page.close()

        if args.no_motion_test:
            exit(0)
        page=b.new_page()
        page.set_content(HTML,wait_until='load')
        page.evaluate("location.hash='#/distribuzioni'")
        page.wait_for_function("window.SA.currentLab==='distribuzioni'")
        slider=page.locator('input[aria-label="Velocità"]')
        progress=page.locator('.progress i').first
        def advance(level):
            page.get_by_role('button',name='Ricomincia').first.click()
            slider.fill(str(level))
            page.get_by_role('button',name='Avvia',exact=True).first.click()
            page.wait_for_timeout(450)
            page.get_by_role('button',name='Pausa',exact=True).first.click()
            return float(progress.evaluate('(e)=>parseFloat(e.style.width)||0'))
        slow=advance(0)
        fast=advance(100)
        assert fast>slow+1, ('speed slider has no measurable effect',slow,fast)
        print(f'PASS: actual animation at 0 vs 100: progress {slow:.2f}% vs {fast:.2f}%')
        page.close()
    finally:
        b.close()
