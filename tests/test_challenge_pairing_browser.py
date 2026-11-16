#!/usr/bin/env python3
"""Real-browser check: paired boosting paths on fixed data and seed.
NN is also covered by the full 84-challenge browser suite.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=which('chromium') or which('google-chrome'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for lab in ['boost']:
            page=browser.new_page(viewport={'width':1280,'height':900},reduced_motion='reduce')
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto('about:blank#/'+lab)
            page.set_content((ROOT/'index.html').read_text(),wait_until='load',timeout=60000)
            page.wait_for_function('(id)=>SA.currentLab===id',arg=lab,timeout=30000)
            q=page.locator('.challenge-card').nth(2);q.locator('summary').click()
            page.locator('.controls button[aria-label="Ricomincia"]').click()
            for _ in range(3):page.locator('.controls .transport button').nth(1).click()
            if lab=='boost':
                page.locator('.controls select').nth(2).select_option('1')
            else:
                inp=page.locator('.controls input[aria-label="Learning rate η"]')
                inp.evaluate('''el=>{el.value='0.1';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}''')
            for _ in range(3):page.locator('.controls .transport button').nth(1).click()
            result=page.evaluate('''(id)=>{
                const q=SA.challenges.bank[id][2], t=SA.challenges.traces[id];
                const s={actions:t.steps,changes:t.edits.length,edits:t.edits,samples:t.samples,
                   controls:t.current};
                return {data:q.rule(s,{actions:0,changes:0,edits:[],controls:{}}),samples:t.samples};
            }''',lab)
            comp=result['data']['comparison']
            assert result['data']['ready'] and comp['paired'] and comp['nPairs']==3,(lab,result['data'])
            a,b=result['samples'][:3],result['samples'][3:6]
            assert [s['metric']['iteration'] for s in a]==[1,2,3],(lab,a)
            assert [s['metric']['iteration'] for s in b]==[1,2,3],(lab,b)
            assert {s['metric']['dataKey'] for s in a+b}.__len__()==1,(lab,'data key differs')
            assert not errors,(lab,errors)
            print('PASS paired same-data, same-seed, aligned-checkpoint experiment:',lab,flush=True)
            if lab=='boost':
                q.scroll_into_view_if_needed();
                page.screenshot(path=str(ROOT/'docs/CHALLENGES_AB_PAIRED_21.png'),full_page=False)
            page.close()
    finally:browser.close()
