#!/usr/bin/env python3
"""End-to-end: numeric evidence, deliberately wrong data interpretation, stale-answer invalidation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [390,1280]:
  page=b.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda ex:errors.append(str(ex)))
  page.goto('about:blank#/boost');page.set_content((root/'index.html').read_text(),wait_until='load')
  page.wait_for_function("SA.currentLab==='boost'")
  q=page.locator('.challenge-card').nth(2);q.locator('summary').click()
  for _ in range(3):page.locator('.controls .transport button').nth(1).click()
  page.locator('.controls select').nth(2).select_option('1')
  for _ in range(3):page.locator('.controls .transport button').nth(1).click()
  trace=page.evaluate("()=>SA.challenges.traces.boost.samples.slice(-6)")
  old=[x['metric']['value'] for x in trace if x['values'].get('profondita')=='2']
  new=[x['metric']['value'] for x in trace if x['values'].get('profondita')=='1']
  assert len(old)==3 and len(new)==3,(width,len(old),len(new))
  a=sum(old)/len(old);v=sum(new)/len(new)
  valid=0 if a>v else 1 if v>a else 2
  q.locator('.challenge-answers input[type=radio]').nth(0).check() # Correct theory
  q.locator('.challenge-observation input[type=radio]').nth((valid+1)%3).check()
  q.get_by_role('button',name='Verifica la sfida').click()
  assert 'Rivedi il confronto' in q.locator('.challenge-feedback').inner_text(),'Wrong numeric evidence was accepted'
  q.locator('.challenge-observation input[type=radio]').nth(valid).check()
  q.get_by_role('button',name='Verifica la sfida').click()
  assert 'Sfida completata' in q.locator('.challenge-feedback').inner_text()
  assert '1/3' in page.locator('.challenge-shortcut').inner_text()
  # A new step changes the estimate: previously selected empirical answer is invalidated.
  page.locator('.controls .transport button').nth(1).click()
  page.wait_for_function("document.querySelector('.challenge-observation input:checked')===null")
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
  print('PASS diagnostic GBM e2e',width,'px; A=',round(a,5),'B=',round(v,5),'JS errors:',len(errors),flush=True)
  page.close()
 b.close()
