#!/usr/bin/env python3
"""Exercise edited experiments, including user-generated points and R script snapshots."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from sys import argv
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
LABS='''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'''.split()
width=int(argv[1]) if len(argv)>1 else 1366
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':width,'height':820})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML)
 for i,lab in enumerate(LABS,1):
  page.evaluate('(id)=>location.hash="#/"+id',lab)
  page.wait_for_function('(id)=>SA.currentLab===id&&!!document.querySelector(".experiment-panel")',arg=lab)
  if i<=25:
   have=page.evaluate('!!SA.ui.activeRunner')
   if have:
    page.evaluate('()=>SA.ui.activeRunner.stepOnce()')
    snap=page.evaluate('SA.experiments.capture()')
    before=page.locator('table.tv tbody').inner_text() if page.locator('table.tv tbody').count() else ''
    page.evaluate('async x=>await SA.experiments.restore(x)',snap)
    after=page.locator('table.tv tbody').inner_text() if page.locator('table.tv tbody').count() else ''
    if before!=after:
     print('MISMATCH',lab,'before',repr(before[:150]),'after',repr(after[:150]),flush=True)
     raise AssertionError((lab,'numeric output changed'))
    assert page.evaluate('SA.experiments.capture().checkpoint.steps')==snap['checkpoint']['steps'],lab
   else: print('NO_RUNNER',lab,flush=True)
  else:
   # Trigger an actual map edit by pressing Enter on the interactive SVG map;
   # no DOM-only fake state mutation.
   page.locator('.spatial-studio [data-action="map"]').focus()
   page.keyboard.press('Enter')
   snap=page.evaluate('SA.experiments.capture()')
   before=page.locator('.spatial-studio').get_attribute('data-moran')
   code=page.locator('pre').last.inner_text()
   page.evaluate('async x=>await SA.experiments.restore(x)',snap)
   snap2=page.evaluate('SA.experiments.capture()')
   assert snap2['spatial']['points']==snap['spatial']['points'],(lab,'edited points')
   assert before==page.locator('.spatial-studio').get_attribute('data-moran'),(lab,'numeric map')
   assert code==page.locator('pre').last.inner_text(),(lab,'R script')
  assert not errors,(lab,errors)
  print('PASS changed D round-trip',i,lab,flush=True)
 page.close();browser.close()
