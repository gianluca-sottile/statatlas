#!/usr/bin/env python3
"""Open a saved link payload in a fresh offline HTML document (no HTTP)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
HTML=(root/'index.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1366,'height':800})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML);page.evaluate('location.hash="#/distribuzioni"')
 page.wait_for_function('SA.currentLab==="distribuzioni"')
 page.locator('.controls select[aria-label="Numero di osservazioni"]').select_option('100')
 for j in range(4):page.evaluate('SA.ui.activeRunner.stepOnce()')
 link=page.evaluate('SA.experiments.linkFor(SA.experiments.capture())')
 print('link length',len(link))
 fresh=browser.new_page(viewport={'width':390,'height':850})
 errs=[];fresh.on('pageerror',lambda e:errs.append(str(e)))
 fresh.set_content(HTML);fresh.evaluate('(hash)=>location.hash=hash',link.split('#',1)[1])
 fresh.wait_for_function('SA.currentLab==="distribuzioni"&&document.querySelector(".experiment-status").textContent.includes("ripristinato")',timeout=20000)
 snap=fresh.evaluate('SA.experiments.capture()')
 assert snap['checkpoint']['steps']==4,snap['checkpoint']
 assert any(x['value']=='100' for x in snap['configuration']['fields'])
 assert not errors and not errs, (errors,errs)
 print('PASS D new in-memory HTML opened shared hash payload, checkpoint steps=4, controls restored')
 fresh.close();page.close();browser.close()
