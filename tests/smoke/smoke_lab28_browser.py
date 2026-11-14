#!/usr/bin/env python3
"""Smoke end-to-end per il laboratorio 28. Browser: Chromium/Playwright."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':950},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content((root/'index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
    page.evaluate("window.location.hash='#/processi-puntuali';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('.lab-head h1').wait_for(timeout=25000)
    page.wait_for_timeout(2400)
    print('PAGE:',page.title())
    print('H1:',page.locator('h1').all_text_contents())
    print('COVER:',page.locator('.lab-cover svg').count())
    print('CHIPS:',page.locator('.lab-head ul.chips li').count())
    print('PREDICT:',page.locator('details.predict input[type=radio]').count())
    print('FIGURES:',page.locator('.figure .fig').count())
    print('SVGs:',page.locator('.figure .fig svg').count())
    print('TABLE:',page.locator('table.tv tbody tr').count())
    print('MCSTATUS:',page.locator('.moran-perm-status').all_text_contents())
    print('ERRORS:',errors[:10])
    page.screenshot(path=str(root/'docs/LAB28_BROWSER_DESKTOP.png'),full_page=True)
    if not errors and page.locator('.figure .fig svg').count()==4 and page.locator('table.tv tbody tr').count()>=8:
        print('OK desktop')
    else: raise SystemExit(1)
    page.locator('details.predict').click()
    print('PRED OPEN:',page.locator('details.predict').get_attribute('open'))
    page.locator('input#points-pred-1').check()
    print('FEEDBACK:',page.locator('div.feedback').all_text_contents())
    page.screenshot(path=str(root/'docs/LAB28_BROWSER_PREDICTION.png'),full_page=False)
    # Cambia DGP e visualizzazioni e verifica i contatori in DOM.
    page.locator('.panel.controls select').first.select_option('thomas')
    page.wait_for_timeout(400)
    print('THOMAS SVGs:',page.locator('.figure .fig svg').count())
    page.locator('.panel.controls select').first.select_option('inhibition')
    page.wait_for_timeout(400)
    print('INHIBITION:',page.locator('table.tv tbody tr').count())
    page.locator('.panel.controls select').first.select_option('inhomogeneous')
    page.wait_for_timeout(400)
    print('NON HOMOGENEOUS:',page.locator('table.tv tbody tr').count())
    # Clicca selezione e prova aggiunta di un punto.
    page.locator('.panel.controls select').filter(has=page.locator('option[value="add"]')).select_option('add')
    n_before=page.locator('.figure .fig').first.locator('circle[role="button"]').count()
    svg=page.locator('.figure .fig svg').first
    svg.locator('rect[fill="transparent"]').click(position={'x':120,'y':90})
    n_after=page.locator('.figure .fig').first.locator('circle[role="button"]').count()
    print('ADD:',n_before,n_after)
    assert n_after==n_before+1,(n_before,n_after)
    page.locator('.panel.controls select').filter(has=page.locator('option[value="remove"]')).select_option('remove')
    page.locator('.figure .fig circle[role="button"]').first.click()
    assert page.locator('.figure .fig circle[role="button"]').count()==n_before
    # Controlla apertura teoria
    page.locator('.lab-head .head-actions button').first.click()
    assert page.locator('.drawer.open').count()==1
    print('DRAWER:',page.locator('.drawer.open .drawer-head').inner_text()[:75]);page.keyboard.press('Escape')
    # Esportazione e navigazione tra lezioni
    with page.expect_download() as d1: page.get_by_role('button',name='Punti e curve CSV').click()
    assert d1.value.suggested_filename=='statatlas_lab28_processi.csv'
    with page.expect_download() as d2: page.get_by_role('button',name='Scarica .R').click()
    assert d2.value.suggested_filename=='statatlas_lab28_processi.R'
    page.evaluate("window.location.hash='#/lisa';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('Autocorrelazione locale').wait_for()
    page.evaluate("window.location.hash='#/processi-puntuali';window.dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('h1').get_by_text('Processi puntuali spaziali').wait_for()
    assert page.locator('.figure .fig svg').count()==4
    # Mobile, tema
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(400)
    page.screenshot(path=str(root/'docs/LAB28_BROWSER_MOBILE.png'),full_page=True)
    print('MOBILE SVGS:',page.locator('.figure .fig svg').count())
    print('ERRORS FINAL:',errors[:10]);assert not errors
    browser.close()
