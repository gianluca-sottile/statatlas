#!/usr/bin/env python3
"""E2E: covers all laboratory challenge cards, manual activity, desktop/mobile navigation.
Does not claim to check correctness of scientific theory or R concordance.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
labs=['distribuzioni','bivariata','simulazione','lgn-tcl','adattamento','stimatori','fisher','intervalli','test','regressione','regressione-lp','glm','arma','quantilica','penalizzata','spline','segmentata','validazione','knn','alberi','boost','reti-neurali','pca','clustering','dbscan','moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=which('chromium') or which('google-chrome') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [390,1024]:
  page=browser.new_page(viewport={'width':width,'height':860},is_mobile=(width==390),has_touch=(width==390))
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('about:blank#/distribuzioni'); page.set_content((root/'index.html').read_text(encoding='utf8'),wait_until='load',timeout=45000)
  for i,lab in enumerate(labs):
   print('CHECK',width,lab,flush=True)
   if i:
    page.evaluate('(lab)=>{location.hash="#/"+lab}',lab)
    page.wait_for_function('(lab)=>window.SA.currentLab===lab',arg=lab,timeout=30000)
   page.locator('.challenge-section .challenge-card').first.wait_for(state='attached',timeout=30000)
   assert page.locator('.challenge-card').count()==3,(lab,'cards')
   assert page.locator('.challenge-answer').count()==(9 if lab in ('intervalli','validazione','kriging') else 12),(lab,'answers')
   assert page.locator('.lab-head .lab-cover svg').count()>0,(lab,'cover')
   assert page.locator('.lab-howto').count()==1,(lab,'guide')
   assert page.locator('.tbl-wrap').count()>0,(lab,'table')
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),(lab,width,'overflow')
   if lab not in ('intervalli','validazione','kriging'):
    first=page.locator('.challenge-card').first
    first.locator('summary').click()
    verify=first.get_by_role('button',name='Verifica la sfida')
    first.locator('input[type=radio]').nth(1).check()
    verify.click()
    assert any(token in first.locator('.challenge-feedback').inner_text() for token in ('Esegui','Apri','Seleziona')),(lab,'missing precondition')
   if errors: raise Exception(f'Browser JS error {lab} {width}: {errors[-1]}')
  page.close()
 # Exercise one full challenge with live runner and changed controls
 page=browser.new_page(viewport={'width':1280,'height':900})
 page.goto('about:blank#/test'); page.set_content((root/'index.html').read_text(encoding='utf8'),wait_until='load')
 q=page.locator('.challenge-card').first;q.locator('summary').click()
 step=page.get_by_role('button',name='Un passo',exact=False)
 if step.count()==0: step=page.locator('.controls .transport button').nth(1)
 step.first.click()
 assert page.evaluate('window.SA.challenges.traces.test.steps')>=1,'runner instrumentation'
 q.locator('input[type=radio]').nth(1).check()
 q.get_by_role('button',name='Verifica la sfida').click()
 assert 'Sfida completata' in q.locator('.challenge-feedback').inner_text(),q.locator('.challenge-feedback').inner_text()
 browser.close()
print('OK: challenge browser 31/31, 2 viewports; manual runner on lab 09')
