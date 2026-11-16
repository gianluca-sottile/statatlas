# HISTORICAL TEST (read-only reference) - assumes removed 2.0 spatial UI.
"""Collaudo reale in Chromium del LAB 27, usando il file HTML offline.
Avviare: STATATLAS_CHROMIUM=/usr/bin/chromium python3 tests/smoke/smoke_lab27_browser.py
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[2]
shots = Path(os.environ.get('STATATLAS_SCREENSHOT_DIR', '/tmp'))
shots.mkdir(parents=True, exist_ok=True)
errors=[]
with sync_playwright() as p:
    args={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
    if os.environ.get('STATATLAS_CHROMIUM'): args['executable_path']=os.environ['STATATLAS_CHROMIUM']
    browser=p.chromium.launch(**args)
    page=browser.new_page(viewport={'width':1460,'height':960})
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content((root/'index.html').read_text(encoding='utf-8'), wait_until='domcontentloaded')
    page.evaluate("window.location.hash='#/lisa';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('.lab-head h1').wait_for()
    assert page.locator('.lab-cover svg').count()==1, 'Copertina SVG assente'
    assert page.locator('.lab-head ul.chips li').count()>=4, 'Obiettivi assenti'
    assert page.locator('details.predict').count()==1, 'Previsione non espandibile'
    page.locator('details.predict summary').click()
    assert page.locator('details.predict input[type=radio]').count()==3, 'Tre risposte assenti'
    page.locator('details.predict input[type=radio]').nth(1).check()
    assert page.locator('details.predict .feedback').is_visible(), 'Feedback assente'
    assert page.locator('.focus-box').count()==1, 'Box valutiamo assente'
    assert page.locator('.legend').get_by_text('High–High').count()>=1, 'Legenda LISA assente'
    assert page.locator('.moran-guide').count()==1, 'Guida interattiva assente'
    assert page.locator('.fig svg').count()>=4, 'Grafici assenti'
    assert page.locator('.fig').first.locator('rect[role=button]').count()==64, 'Mappa 64 celle assente'
    assert page.locator('table.tv tbody tr').count()==8, 'Tabella risultati assente'
    assert page.locator('.kpis .kpi').count()==3, 'KPI assenti'
    assert page.locator('.moran-perm-status').first.inner_text().lstrip().startswith('0 /'), 'Lab 27 started without a click'
    page.locator('.panel.controls .transport button').nth(1).click()
    assert page.locator('.moran-perm-status').first.inner_text().lstrip().startswith('1 /'), 'One manual step was not executed'
    with page.expect_download() as dl:
        page.get_by_role('button',name='Dati e statistiche CSV').click()
    assert dl.value.suggested_filename=='statatlas_lab27_lisa.csv'
    with page.expect_download() as rdl:
        page.get_by_role('button',name='Scarica .R').click()
    assert rdl.value.suggested_filename=='statatlas_lab27_lisa.R'
    page.screenshot(path=str(shots/'lisa_desktop.png'),full_page=True)
    page.locator('.fig').first.locator('rect[role=button]').nth(3).click()
    assert 'Zona 4' in page.locator('.moran-map-info').first.inner_text()
    page.locator('.controls label.field').filter(has_text='Unità di analisi').locator('select').select_option('2')
    assert page.locator('.fig').first.locator('rect[role=button]').count()==16,'Aggregazione fallita'
    page.locator('.controls label.field').filter(has_text='Zonizzazione').locator('select').select_option('shifted')
    assert page.locator('.fig svg').count()>=4,'Zonizzazione ha compromesso i grafici'
    page.locator('.controls label.field').filter(has_text='Correzione multipla').locator('select').select_option('BY')
    assert 'BY' in page.locator('table.tv tbody').inner_text()
    page.locator('.controls label.field').filter(has_text='Meccanismo generatore').locator('select').select_option('checker')
    page.locator('.controls label.field').filter(has_text='Unità di analisi').locator('select').select_option('4')
    # Scacchiera aggregata costante: deve essere informativa e senza crash.
    assert page.locator('.fig').first.locator('rect[role=button]').count()==4
    page.locator('.controls label.field').filter(has_text='Meccanismo generatore').locator('select').select_option('hotspot')
    page.locator('.controls label.field').filter(has_text='Unità di analisi').locator('select').select_option('none')
    page.locator('.head-actions button').click()
    assert page.locator('.drawer.open').count()==1,'Approfondimenti non aperti'
    assert page.locator('.drawer-body').get_by_text('Dal globale al locale').count()>0
    page.locator('.drawer-head button[data-level=adv]').click()
    assert page.locator('.drawer-body').get_by_text('Speranza delle permutazioni condizionali').count()>0
    page.locator('.drawer-head button[aria-label=Chiudi]').click()
    page.evaluate("window.location.hash='#/moran';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('Autocorrelazione spaziale e Moran').wait_for()
    assert page.locator('.fig svg').count()==3
    page.evaluate("window.location.hash='#/lisa';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('Autocorrelazione locale, hotspot e MAUP').wait_for()
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    page.wait_for_timeout(500)
    page.screenshot(path=str(shots/'lisa_mobile_dark.png'),full_page=True)
    assert page.locator('.lab-cover svg').count()==1
    assert not errors, 'Eccezioni JS: '+repr(errors)
    print('OK LAB 27 Chromium: grafici, guida, previsione, MAUP, BH/BY, non-varianza, drawer, navigazione, mobile/dark')
    browser.close()
