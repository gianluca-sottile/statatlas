from playwright.sync_api import sync_playwright
from pathlib import Path
import sys
root=Path(__file__).resolve().parent.parent
ids=['distribuzioni','bivariata','simulazione','lgn-tcl','adattamento','stimatori','fisher','test','regressione','regressione-lp','glm','arma','quantilica','penalizzata','spline','segmentata','knn','alberi','boost','reti-neurali','pca','clustering','dbscan','moran','lisa','processi-puntuali','variogrammi','regressione-spaziale']
# Supports batch indices, e.g. `python3 tests/test_challenges_targeted_browser.py 0 10`.
CHANGER='''(focus)=>{
 const norm=s=>SA.challenges.keyOf(s);
 const keys=n=> n.getAttribute('aria-label') || (n.closest('label')?.querySelector(':scope > .field-row > span, :scope > span, :scope > .field-row > div > span')?.textContent||'');
 let target=Array.from(document.querySelectorAll('.controls input,.controls select,.controls textarea')).find(n=>norm(keys(n)).includes(norm(focus)));
 if (target) {
  let former=target.type==='checkbox'?String(target.checked):String(target.value);
  if(target.tagName==='SELECT') {
   let alternatives=Array.from(target.options).filter(o=>o.value!==target.value && !o.disabled);
   if(!alternatives.length)return {error:'no alternative'};
   target.value=alternatives[0].value;
  } else if (target.type==='checkbox')target.checked=!target.checked;
  else if(target.type==='range'){
   let v=Number(target.value),step=Number(target.step)||1, mx=Number(target.max), mi=Number(target.min);
   target.value=String(v+step<=mx?v+step:v-step>=mi?v-step:mi);
   target.dispatchEvent(new Event('input',{bubbles:true}));
  } else if(target.type==='number')target.value=String(Number(target.value)+1);
  let changed=String(target.type==='checkbox'?target.checked:target.value);
  target.dispatchEvent(new Event('change',{bubbles:true}));
  return {label:keys(target),from:former,to:changed};
 }
 let group=Array.from(document.querySelectorAll('.controls .seg[aria-label]')).find(g=>norm(g.getAttribute('aria-label')).includes(norm(focus)));
 if (group) {
  let btn=Array.from(group.querySelectorAll('button')).find(b=>b.getAttribute('aria-pressed')!=='true');
  if(!btn)return {error:'no secondary segment'};
  btn.click();return {label:group.getAttribute('aria-label'),to:btn.innerText};
 }
 return {error:'no matching DOM control for '+focus};
}'''
ids=ids[int(sys.argv[1]):int(sys.argv[2])] if len(sys.argv)>2 else ids
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':900});errors=[]
 page.on('pageerror', lambda err: errors.append(str(err)))
 page.goto('about:blank#/distribuzioni');page.set_content((root/'index.html').read_text(),wait_until='load',timeout=60000)
 done=0;fail=[]
 for lab in ids:
  try:
   page.evaluate('(lab)=>location.hash="#/"+lab',lab)
   page.wait_for_function('(lab)=>SA.currentLab===lab',arg=lab,timeout=25000)
   page.locator('.challenge-card').first.wait_for(timeout=30000)
   if lab=='penalizzata':
    page.evaluate("()=>document.querySelector('.controls .seg[aria-label=\"Vista\"] button:last-child').click()")
   for stage in range(3):
    q=page.locator('.challenge-card').nth(stage)
    q.locator('summary').click()
    f=page.evaluate('(obj)=>SA.challenges.bank[obj.lab][obj.stage].focus',{ 'lab':lab,'stage':stage })
    if stage==0:
     page.locator('.controls .transport button').nth(1).click()
    elif stage==1:
     result=page.evaluate(CHANGER,f)
     assert not result.get('error'),result
     for j in range(2):page.locator('.controls .transport button').nth(1).click()
    else:
     for j in range(2):page.locator('.controls .transport button').nth(1).click()
     result=page.evaluate(CHANGER,f)
     assert not result.get('error'),result
     for j in range(3):page.locator('.controls .transport button').nth(1).click()
    correct=page.evaluate('(obj)=>SA.challenges.bank[obj.lab][obj.stage].correct',{'lab':lab,'stage':stage})
    q.locator('input[type=radio]').nth(correct).check()
    q.get_by_role('button',name='Verifica la sfida').click()
    feedback=q.locator('.challenge-feedback').inner_text()
    if 'Sfida completata' not in feedback: raise AssertionError((lab,stage,f,result if stage else '',feedback))
    done+=1
    q.locator('summary').click()
   print('OK',lab,flush=True)
  except Exception as e:
   print('FAIL',lab,str(e)[:400],flush=True);fail.append((lab,str(e)))
 print('PASS',done,'/',len(ids)*3,'FAIL',len(fail),'JSERRORS',errors[:3]);browser.close()
 if fail: raise RuntimeError(fail[:10])
