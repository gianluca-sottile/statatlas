#!/usr/bin/env python3
from shutil import which
"""D: modified controls, 06 custom runner, spatial point/sensor data under EN and IT."""
from pathlib import Path
from playwright.sync_api import sync_playwright
HTML=(Path(__file__).resolve().parents[1]/'index.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1366,'height':900})
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(HTML)
 def route(lab):
  page.evaluate('(l)=>location.hash="#/"+l',lab)
  page.wait_for_function('(l)=>SA.currentLab===l&&document.querySelector(".experiment-panel")',arg=lab)
 def roundtrip(lab):
  a=page.evaluate('SA.experiments.capture()')
  row=page.locator('table.tv tbody').inner_text() if page.locator('table.tv tbody').count() else ''
  page.evaluate('async x=>await SA.experiments.restore(x)',a)
  b=page.evaluate('SA.experiments.capture()')
  assert a['configuration']==b['configuration'],(lab,'controls',a['configuration'],b['configuration'])
  assert a['checkpoint']==b['checkpoint'],(lab,'checkpoint',a['checkpoint'],b['checkpoint'])
  if a['spatial']:
   assert a['spatial']['points']==b['spatial']['points'],(lab,'points')
  if row: assert row==page.locator('table.tv tbody').inner_text(),(lab,'numeric')
 route('distribuzioni')
 page.locator('.controls select[aria-label="Legge"]').select_option('pois')
 page.locator('.controls select[aria-label="Numero di osservazioni"]').select_option('100')
 page.locator('.controls input[aria-label="Seed"]').fill('79')
 page.locator('.controls input[aria-label="Seed"]').dispatch_event('change')
 page.evaluate('()=>{for(let j=0;j<6;j++)SA.ui.activeRunner.stepOnce()}')
 roundtrip('distribuzioni')
 print('PASS D complex distribution changed law, n, seed, checkpoint')
 route('stimatori')
 page.locator('.controls .seg button').nth(1).click()
 page.locator('.controls select[aria-label="Numero di repliche M"]').select_option('200')
 page.locator('.controls input[aria-label="Seed"]').fill('42')
 page.locator('.controls input[aria-label="Seed"]').dispatch_event('change')
 for j in range(3): page.locator('.controls [title="Un campione (→)"]').click()
 roundtrip('stimatori')
 print('PASS D custom estimator 3 replications, model=Laplace, seed=42')
 # Try other map controls as well as two actual data changes.
 for lab in ['moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']:
  route(lab)
  keyboard=page.locator('.spatial-studio [data-action="map"]')
  keyboard.focus();page.keyboard.press('Enter')
  keyboard=page.locator('.spatial-studio [data-action="map"]')
  keyboard.focus();page.keyboard.press('Enter')
  row=page.locator('pre').last.inner_text()
  a=page.evaluate('SA.experiments.capture()')
  assert len(a['spatial']['points']) >= 5
  page.evaluate('async x=>await SA.experiments.restore(x)',a)
  b=page.evaluate('SA.experiments.capture()')
  assert a['spatial']==b['spatial'],(lab,'full spatial')
  assert row==page.locator('pre').last.inner_text(),(lab,'R output')
  print('PASS D modified spatial',lab)
 assert not errors,errors
 browser.close()
