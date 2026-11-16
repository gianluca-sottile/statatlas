# HISTORICAL TEST (read-only reference) - assumes removed 2.0 spatial UI.
#!/usr/bin/env python3
"""Chromium: QA reale del LAB 30, stato fermo, UI, manipolazione sensori, R/CSV, mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
root=Path(__file__).resolve().parents[2]
(root/'docs').mkdir(exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.getenv('STATATLAS_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':940},accept_downloads=True)
    errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.set_content((root/'index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
    page.evaluate("location.hash='#/kriging';dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('.lab-head h1').wait_for(timeout=30000)
    assert page.locator('.lab-cover svg').count()==1,'manca copertina'
    assert page.locator('.lab-head ul.chips li').count()==5,'mancano obiettivi'
    assert page.locator('details.predict input[type=radio]').count()==3,'previsione'
    assert page.locator('.figure .fig svg').count()==4,'grafici'
    assert page.locator('table.tv tbody tr').count()>=10,'tabella'
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /'), 'autoplay vietato'
    assert 'Avvia' in page.locator('.transport button').first.inner_text(),'simulazione deve essere ferma'
    page.screenshot(path=str(root/'docs/LAB30_BROWSER_DESKTOP.png'),full_page=True)
    print('OK: testata, SVG, obiettivi, previsione, 4 grafici, tabella e no autoplay')
    page.locator('details.predict').click()
    page.locator('#kriging-pred-0').check()
    assert 'Corretto' in page.locator('.feedback').inner_text()
    # Add a sensor, keep same field, no Monte Carlo starting.
    before=page.locator('.kpis .kpi').first.locator('b').inner_text()
    page.locator('[data-grid-index="0"]').click()
    after=page.locator('.kpis .kpi').first.locator('b').inner_text()
    assert int(after)==int(before)+1,(before,after)
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    # Move the new sensor from site 0 to site 143.
    mode=page.locator('label.field').filter(has_text='Strumento sui sensori').locator('select')
    mode.select_option('move');page.locator('[data-grid-index="0"]').click();page.locator('[data-grid-index="143"]').click()
    assert page.locator('.kpis .kpi').first.locator('b').inner_text()==after
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    mode.select_option('remove');page.locator('[data-grid-index="143"]').click()
    assert int(page.locator('.kpis .kpi').first.locator('b').inner_text())==int(before)
    print('OK: aggiungi, sposta, rimuovi con campo fisso e simulazione ferma')
    # Different model or method cannot relaunch MC.
    page.locator('label.field').filter(has_text='Metodo di previsione').locator('select').select_option('simple')
    page.locator('label.field').filter(has_text='Range assunto').locator('input[type=range]').fill('0.35')
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    page.locator('label.field').filter(has_text='Metodo di previsione').locator('select').select_option('idw')
    assert 'NESSUNA VARIANZA' in page.locator('.fig').nth(2).inner_text() or 'NESSUNA VARIANZA' in page.locator('.fig').nth(2).locator('svg').inner_text()
    page.locator('label.field').filter(has_text='Metodo di previsione').locator('select').select_option('ordinary')
    page.locator('label.field').filter(has_text='Mostra campo vero').locator('select').select_option('true')
    assert page.locator('.figure .fig svg').count()==4
    page.locator('.panel.controls .transport button').nth(1).click()
    assert page.locator('.moran-perm-status').inner_text().startswith('1 /')
    page.locator('.panel.controls .transport button').nth(2).click()
    page.wait_for_function("() => document.querySelector('.moran-perm-status')?.textContent.startsWith('49 / 49')",timeout=45000)
    print('OK: 49 repliche soltanto dopo comando manuale')
    page.locator('.lab-head .head-actions button').click()
    assert page.locator('.drawer.open').count()==1
    page.keyboard.press('Escape')
    with page.expect_download() as d1:page.get_by_role('button',name='Dati e previsioni CSV').click()
    assert d1.value.suggested_filename=='statatlas_lab30_kriging.csv'
    with page.expect_download() as d2:page.get_by_role('button',name='Scarica .R').click()
    assert d2.value.suggested_filename=='statatlas_lab30_kriging.R'
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    page.wait_for_timeout(500)
    assert page.locator('.figure .fig svg').count()==4
    page.screenshot(path=str(root/'docs/LAB30_BROWSER_MOBILE.png'),full_page=True)
    assert not errors,errors
    print('OK: approfondimenti, download, mobile scuro e zero errori JavaScript')
    browser.close()
