#!/usr/bin/env python3
"""D: actual interactive observations in classic regression laboratories 10/14."""
from pathlib import Path
from playwright.sync_api import sync_playwright

html=(Path(__file__).resolve().parents[1]/'index.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':900})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(html)
    for lab in ['regressione','quantilica']:
        page.evaluate('(lab)=>location.hash="#/"+lab',lab)
        page.wait_for_function('(lab)=>SA.currentLab===lab&&document.querySelector(".experiment-panel")',arg=lab)
        page.evaluate('()=>{SA.ui.activeRunner.stepOnce();SA.ui.activeRunner.stepOnce()}')
        # Real lab control adds a user observation, instead of mutating internal state in the test.
        add=page.locator('.controls button').filter(has_text='Aggiungi un valore anomalo')
        add.click()
        a=page.evaluate('SA.experiments.capture()')
        assert a['manualData']['kind']=='manual-xy-v1' and a['manualData']['manual'],lab
        assert a['checkpoint']['steps']>=2,lab
        table=page.locator('table.tv tbody').inner_text()
        numpoints=len(a['manualData']['points'])
        add.click()
        assert len(page.evaluate('SA.experiments.capture().manualData.points'))==numpoints+1
        page.evaluate('async x=>await SA.experiments.restore(x)',a)
        b=page.evaluate('SA.experiments.capture()')
        assert a['manualData']==b['manualData'],(lab,'actual points')
        assert a['checkpoint']==b['checkpoint'],(lab,'replications')
        assert table==page.locator('table.tv tbody').inner_text(),(lab,'numeric table')
        # Validation rejects tampered observations before mutating the lab.
        bad=page.evaluate('''x=>{let y=JSON.parse(JSON.stringify(x));y.manualData.points[0][0]=100000000;return y}''',a)
        try:
            page.evaluate('async x=>await SA.experiments.restore(x)',bad)
            raise AssertionError(f'{lab}: accepted an invalid x coordinate')
        except Exception as e:
            assert 'Invalid or unsupported manually edited observations' in str(e),str(e)
        assert page.evaluate('SA.experiments.capture().manualData')==a['manualData']
        print('PASS D manually edited sample',lab,'n=',numpoints, 'checkpoint steps=',a['checkpoint']['steps'],flush=True)
    assert not errors,errors
    browser.close()
