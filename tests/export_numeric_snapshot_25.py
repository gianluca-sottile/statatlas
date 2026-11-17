#!/usr/bin/env python3
"""Capture LIVE numerical evidence for R/JS comparison, labs 01-25.

The generated JSON includes exactly the browser table cells, KPI text, and
exported R code for the selected build. A later R check must parse and execute
those scripts; this file alone does NOT establish numerical R/JS equivalence.
"""
import argparse
import hashlib
import json
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
LABS=('distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
      'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
      'spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan').split()

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--start',type=int,default=1)
 ap.add_argument('--stop',type=int,default=25)
 ap.add_argument('--output',default='verifica/snapshots_C_01_25.json')
 a=ap.parse_args()
 assert 1<=a.start<=a.stop<=25
 html=(ROOT/'index.html').read_text('utf-8')
 out={}
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,
                             args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1500,'height':980})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.goto('about:blank#/distribuzioni');page.set_content(html,wait_until='load')
   for i in range(a.start-1,a.stop):
    name=LABS[i]
    page.evaluate('(id) => location.hash="#/" + id',name)
    page.wait_for_function('(id) => window.SA && SA.currentLab === id',arg=name,timeout=30000)
    if name=='penalizzata':
     # Keep the same default view as the existing source benchmark unless
     # an explicit path activation is needed in the recorded scenario.
     pass
    finish=page.locator('button[aria-label^="Completa"]')
    if finish.count():
     finish.first.click()
     page.wait_for_function('() => !document.querySelector("[data-busy]")',timeout=120000)
    if name in ('segmentata','reti-neurali'):
     extra=page.get_by_role('button',name='Test bootstrap',exact=False)
     if name=='reti-neurali': extra=page.get_by_role('button',name='20 inizializzazioni',exact=False)
     if extra.count():
      extra.first.click()
      if name=='segmentata':
       page.wait_for_function('() => !document.querySelector("table.tv tbody").textContent.includes("premi il pulsante")',timeout=120000)
      else:
       page.wait_for_function('() => !document.querySelector("[data-busy]")',timeout=120000)
    code=page.locator('pre[aria-label="Codice R"]').first.text_content() or ''
    rows=page.locator('table.tv tbody tr').evaluate_all('(trs) => trs.map(t => [...t.children].map(c => c.textContent))')
    kpi=page.locator('.kpi').all_text_contents()
    if not code or len(code)<80:raise RuntimeError(name+' missing R script')
    if not rows:raise RuntimeError(name+' missing numerical table')
    if errors:raise RuntimeError(name+' JS error '+errors[-1])
    out[name]={'code':code,'rows':rows,'kpi':kpi}
    print('SNAPSHOT',i+1,name,'rows',len(rows),'kpi',len(kpi), 'bytes',len(code),flush=True)
  finally: browser.close()
 path=ROOT/a.output;path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps({'build_sha256':hashlib.sha256(html.encode('utf-8')).hexdigest(),'labs':out},ensure_ascii=False),encoding='utf-8')
 print('EXPORTED',len(out),'labs to',path)
if __name__=='__main__': main()
