"""Optional browser smoke test of all 31 labs (requires playwright and Chromium).
Does not mutate sources or model data; checks guides and both theoretical levels.
"""
import asyncio
from pathlib import Path
import http.server
import socketserver
import threading
import os
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = None
LABS = [
'distribuzioni','bivariata','simulazione','lgn-tcl','adattamento','stimatori',
'fisher','intervalli','test','regressione','regressione-lp','glm','arma',
'quantilica','penalizzata','spline','segmentata','validazione','knn',
'alberi','boost','reti-neurali','pca','clustering','dbscan','moran','lisa',
'processi-puntuali','variogrammi','kriging','regressione-spaziale']

async def main():
    failures=[]
    os.chdir(ROOT)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    with socketserver.TCPServer(('127.0.0.1', 0), Quiet) as server:
      thread=threading.Thread(target=server.serve_forever,daemon=True)
      thread.start()
      html=f'http://127.0.0.1:{server.server_address[1]}/index.html'
      async with async_playwright() as p:
          browser_opts={'headless':True}
          if Path('/usr/bin/chromium').exists(): browser_opts.update({'executable_path':'/usr/bin/chromium','args':['--no-sandbox','--disable-dev-shm-usage']})
          browser=await p.chromium.launch(**browser_opts)
          page=await browser.new_page(viewport={'width':1420,'height':900},device_scale_factor=1)
          problems=[]
          page.on('pageerror', lambda e: problems.append(str(e)))
          for i,lab in enumerate(LABS,1):
              problems.clear()
              await page.goto(f'{html}#/{lab}',wait_until='load',timeout=45000)
              await page.wait_for_timeout(130)
              guide=page.locator(f'details.lab-howto[data-lab-guide="{lab}"]')
              try:
                  assert await guide.count()==1,'missing/duplicate lab guide'
                  assert await guide.locator('ol li').count()==4,'guide must have four steps'
                  assert await page.locator('.lab-head .lab-cover svg').count()>0,'cover svg missing'
                  assert await page.locator('.lab-head ul.chips li').count()>=4,'objectives missing'
                  assert await page.locator('section.step').count()>=4,'step layout missing'
                  assert await page.locator('.moran-guide').count()==0,'legacy guide still visible'
                  # Every current lab has a header action to open its drawer.
                  await page.locator('.head-actions button').first.click(timeout=7000)
                  await page.locator('.drawer.open').wait_for(timeout=5000)
                  base=page.locator('.drawer-body .pedagogy-extension')
                  assert await base.count()==1,'missing essential supplement'
                  await page.locator('.drawer button[data-level="adv"]').click()
                  assert await base.count()==1,'missing advanced supplement'
                  assert 'ipotesi, derivazioni e limiti' in (await base.inner_text()),'wrong advanced heading'
                  await page.locator('.drawer-head button[aria-label="Chiudi"]').click()
                  if i>=26:
                      assert await page.locator('.transport button').first.inner_text()!=' Pausa','spatial autoplay reintroduced'
                  assert not problems,'; '.join(problems)
                  print(f'OK {i:02d} {lab}: guida, cover, obiettivi, base, avanzato, console')
              except Exception as e:
                  failure=f'{i:02d} {lab}: {e} errors={problems}'
                  print('FAIL',failure)
                  failures.append(failure)
          # desktop + mobile screenshot controls, limit to representative labs
          await page.goto(f'{html}#/regressione-spaziale')
          await page.screenshot(path=str(ROOT/'docs/AUDIT31_DESKTOP.png'),full_page=False)
          await page.set_viewport_size({'width':390,'height':844})
          await page.reload()
          await page.screenshot(path=str(ROOT/'docs/AUDIT31_MOBILE.png'),full_page=False)
          await browser.close()
    print(f'RISULTATO {len(LABS)-len(failures)}/{len(LABS)} laboratori')
    if failures:
        print('\n'.join(failures))
        raise SystemExit(1)

if __name__=='__main__': asyncio.run(main())
