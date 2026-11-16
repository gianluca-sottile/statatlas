"""Browser acceptance tests: real interactions for the six spatial map studios."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text()
LABS = 'moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split()

with sync_playwright() as p:
    browser = p.chromium.launch(**dict(headless=True, args=['--no-sandbox','--disable-dev-shm-usage'], **({'executable_path':'/usr/bin/chromium'} if Path('/usr/bin/chromium').exists() else {})))
    try:
        for width in (390,768,1366):
            page = browser.new_page(viewport={'width':width,'height':900},is_mobile=width==390,has_touch=width<=768)
            failures=[]
            page.on('pageerror',lambda x: failures.append(str(x)))
            page.set_content(HTML,wait_until='load')
            for lab in LABS:
                page.evaluate('(id)=>location.hash="#/"+id',lab)
                studio = page.locator('.spatial-studio')
                studio.wait_for(timeout=20000)
                before = studio.get_attribute('data-points')
                assert int(before)>2,(width,lab,before)
                assert studio.locator('.spatial-studio-map svg').count()==1,(width,lab)
                assert page.locator('.spatial-studio').count()==1 and page.locator('.lab-grid').count()==0,(width,lab,'legacy ancora montata')
                assert page.locator('.challenge-card').count()==3,(width,lab,'Challenges assenti')
                assert studio.locator('.spatial-studio-stat').count()>=3,(width,lab)
                assert studio.locator('.spatial-studio-map svg rect').count()>700,(width,lab)
                assert not failures,(width,lab,failures)
                assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<2,(width,lab,'overflow')
                # Single add point on an unused location. Tools stay active on click.
                bg=studio.locator('[data-action="map"]')
                box=bg.bounding_box()
                bg.click(position={'x':box['width']*.85,'y':box['height']*.12})
                now=studio.get_attribute('data-points')
                assert int(now)==int(before)+1,(width,lab,'add',before,now,studio.locator('.spatial-studio-status').inner_text())
                # Remove a point and re-add another one.
                studio.locator('[data-tool="remove"]').click()
                studio.locator('[data-point="0"]').click()
                assert int(studio.get_attribute('data-points'))==int(before),(width,lab,'remove')
                studio.locator('.spatial-studio-reset').first.click()
                assert int(studio.get_attribute('data-points'))==int(before),(width,lab,'reset')
                assert not failures,(width,lab,failures)
                if width==390 and lab in ('moran','kriging','regressione-spaziale'):
                    screenshot=ROOT/'docs'/('SPATIAL_STUDIO_'+lab.replace('-','_')+'_mobile.png')
                    studio.screenshot(path=str(screenshot),animations='disabled',timeout=30000)
                print('PASS',width,lab,'points',before,'add/remove/reset')
            page.close()
    finally:browser.close()
