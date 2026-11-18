#!/usr/bin/env python3
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
LABS='''distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'''.split()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':850},accept_downloads=True)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML)
    page.locator('button.lang-toggle').first.click()
    assert page.evaluate('document.documentElement.lang')=='en'
    for lab in LABS:
        page.evaluate('(lab)=>location.hash="#/"+lab',lab)
        page.wait_for_function('(id)=>SA.currentLab===id&&document.querySelector("[data-course-bridge]")?.dataset.courseBridge===id',arg=lab)
        links=page.locator('.course-bridge-links a').evaluate_all('(a)=>a.map(x=>({url:x.href,lang:x.lang,title:x.textContent}))')
        assert len(links)==2,(lab,links)
        assert all('/it/lessons/' not in x['url'] and x['lang']=='en' and 'Lesson' in x['title'] for x in links),(lab,links)
    page.evaluate('location.hash="#/distribuzioni"')
    page.wait_for_function('SA.currentLab==="distribuzioni"')
    page.locator('[data-ux-action="course"]').click()
    with page.expect_download() as d:
        page.locator('[data-course-bridge="distribuzioni"] button.course-bridge-download').click()
    page.locator('.ux-close').click()
    worksheet=d.value.path().read_text(encoding='utf-8')
    assert '/it/lessons/' not in worksheet
    assert 'lessons/07-probability/29-distributions.html' in worksheet
    page.locator('button.lang-toggle').first.click()
    page.wait_for_function('document.documentElement.lang==="it"')
    page.evaluate('location.hash="#/reti-neurali"')
    page.wait_for_function('SA.currentLab==="reti-neurali"')
    links=page.locator('.course-bridge-links a').evaluate_all('(a)=>a.map(x=>({url:x.href,lang:x.lang}))')
    assert links[0]['lang']=='it' and '/it/lessons/' in links[0]['url']
    assert links[1]['lang']=='en' and '/it/' not in links[1]['url']
    assert not errors,errors
    print('PASS D browser 31/31 EN R lesson links, EN worksheet, Italian+deep learning exception')
    browser.close()
