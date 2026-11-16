#!/usr/bin/env python3
"""Offline browser test of editorial content in all 31 labs.

Loads the built single-file index.html directly: no HTTP or external network,
therefore it also validates the promised offline usage model. The six unified
spatial labs have a single continuous map, not a legacy simulation runner.
"""
import asyncio
import argparse
from pathlib import Path
from shutil import which
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
LABS = (
    'distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
    'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
    'spline segmentata validazione knn alberi boost reti-neurali pca clustering '
    'dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'
).split()
SPATIAL = set(LABS[-6:])

async def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--start',type=int,default=1)
    parser.add_argument('--stop',type=int,default=31)
    args=parser.parse_args()
    assert 1<=args.start<=args.stop<=31
    failures=[]
    source=(ROOT/'index.html').read_text(encoding='utf-8')
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,
            executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox','--disable-dev-shm-usage'])
        try:
            page=await browser.new_page(viewport={'width':1420,'height':900})
            problems=[]
            page.on('pageerror',lambda e: problems.append(str(e)))
            await page.goto('about:blank#/distribuzioni')
            await page.set_content(source,wait_until='load')
            for i,lab in enumerate(LABS,1):
                if not args.start<=i<=args.stop: continue
                problems.clear()
                if i>1:
                    await page.evaluate('(id)=>location.hash="#/"+id',lab)
                await page.wait_for_function('(id)=>SA.currentLab===id',arg=lab)
                guide=page.locator(f'details.lab-howto[data-lab-guide="{lab}"]')
                try:
                    assert await guide.count()==1,'missing/duplicate lab guide'
                    assert await guide.locator('ol li').count()==4,'guide must have four steps'
                    assert await page.locator('.lab-head .lab-cover svg').count()>0,'cover svg missing'
                    assert await page.locator('.lab-head ul.chips li').count()>=4,'objectives missing'
                    assert await page.locator('section.step').count()>=4,'step layout missing'
                    assert await page.locator('.moran-guide').count()==0,'legacy guide still visible'
                    await page.locator('.head-actions button').first.click()
                    await page.locator('.drawer.open').wait_for()
                    base=page.locator('.drawer-body .pedagogy-extension')
                    assert await base.count()==1,'missing essential supplement'
                    await page.locator('.drawer button[data-level="adv"]').click()
                    assert await base.count()==1,'missing advanced supplement'
                    assert 'ipotesi, derivazioni e limiti' in (await base.inner_text()),'wrong advanced heading'
                    await page.locator('.drawer-head button[aria-label="Chiudi"]').click()
                    if lab in SPATIAL:
                        assert await page.locator('.spatial-studio').count()==1,'unified studio missing'
                        assert await page.locator('.spatial-studio-map svg').count()==1,'single map missing'
                        assert await page.locator('.transport button').count()==0,'legacy transport reintroduced'
                    assert not problems,'; '.join(problems)
                    print(f'OK {i:02d} {lab}: guida, cover, obiettivi, base, avanzato, mappa',flush=True)
                except Exception as e:
                    failure=f'{i:02d} {lab}: {e} errors={problems}'
                    print('FAIL',failure,flush=True)
                    failures.append(failure)
            # Screenshots are optional evidence and are stored in docs/.
            await page.evaluate('location.hash="#/regressione-spaziale"')
            await page.wait_for_function('SA.currentLab==="regressione-spaziale"')
            await page.screenshot(path=str(ROOT/'docs/AUDIT31_DESKTOP.png'),full_page=False)
            await page.set_viewport_size({'width':390,'height':844})
            await page.screenshot(path=str(ROOT/'docs/AUDIT31_MOBILE.png'),full_page=False)
            await page.close()
        finally:
            await browser.close()
    print(f'RISULTATO {args.stop-args.start+1-len(failures)}/{args.stop-args.start+1} laboratori ({args.start}-{args.stop})')
    if failures:
        print('\n'.join(failures))
        raise SystemExit(1)

if __name__=='__main__':
    asyncio.run(main())
