"""Smoke check: every lab emits finite quantitative evidence after a real step."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
ids=['distribuzioni','bivariata','simulazione','lgn-tcl','adattamento','stimatori','fisher','intervalli','test','regressione','regressione-lp','glm','arma','quantilica','penalizzata','spline','segmentata','validazione','knn','alberi','boost','reti-neurali','pca','clustering','dbscan','moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']
ids=ids[int(sys.argv[1]):int(sys.argv[2])] if len(sys.argv)>2 else ids
fails=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':880})
 page.goto('about:blank#/distribuzioni')
 page.set_content((root/'index.html').read_text(),wait_until='load',timeout=60000)
 for id in ids:
  try:
   page.evaluate('(lab)=>location.hash="#/"+lab',id)
   page.wait_for_function('(lab)=>SA.currentLab===lab',arg=id,timeout=60000)
   page.locator('.challenge-card').first.wait_for(timeout=60000)
   if id=='penalizzata':
    page.locator('.controls .seg[aria-label="Vista"] button').last.click()
   step=page.locator('.controls .transport button').nth(1)
   for n in range(3 if id in ['clustering','dbscan'] else 1):step.click(timeout=30000)
   metric=page.evaluate('(lab)=>{let t=SA.challenges.traces[lab];return {steps:t?.steps,observations:t?.samples.map(s=>s.metric)}}',id)
   if not metric['steps'] or not metric['observations'] or not any(m and isinstance(m.get('value'),(float,int)) for m in metric['observations']):
    raise AssertionError(metric)
   print('PASS',id, metric['observations'][-1],flush=True)
  except Exception as e:
   print('FAIL',id,str(e)[:220],flush=True);fails.append((id,str(e)))
 browser.close()
print('FINAL',len(ids)-len(fails),'/',len(ids),flush=True)
if fails:raise RuntimeError(fails)
