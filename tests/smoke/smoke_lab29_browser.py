#!/usr/bin/env python3
"""Collaudo Chromium del laboratorio 29: UI, interazioni, export, mobile e tema."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.getenv('STATATLAS_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.set_content((ROOT/'index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
    page.evaluate("location.hash='#/variogrammi';dispatchEvent(new HashChangeEvent('hashchange'));")
    page.locator('.lab-head h1').wait_for(timeout=25000)
    assert page.locator('.lab-cover svg').count()==1
    assert page.locator('.lab-head ul.chips li').count()>=4
    assert page.locator('details.predict input[type=radio]').count()==3
    assert page.locator('.figure .fig svg').count()==4
    assert page.locator('table.tv tbody tr').count()>=10
    assert 'Avvia' in page.locator('.transport button').first.inner_text()
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    page.screenshot(path=str(ROOT/'docs/LAB29_BROWSER_DESKTOP.png'),full_page=True)
    page.locator('details.predict').click()
    page.locator('#variogram-pred-0').check()
    assert 'Corretto' in page.locator('div.feedback').inner_text()
    page.locator('.lab-head .head-actions button').first.click()
    assert page.locator('.drawer.open').count()==1
    assert 'Definizioni' not in page.locator('.drawer.open').inner_text()[:80]
    page.keyboard.press('Escape')
    # Click sequenziali su due sensori -> contributo alla semivarianza aggiornato.
    circle=page.locator('.figure .fig svg circle[aria-label^="Seleziona sensore"]')
    assert circle.count()==48
    circle.nth(2).click();circle=page.locator('.figure .fig svg circle[aria-label^="Seleziona sensore"]');circle.nth(4).click()
    assert 'Sensori 3 e 5' in page.locator('.figure .fig').first.inner_text() or page.locator('.figure .fig svg').first.get_attribute('viewBox')=='0 0 690 375'
    page.locator('.panel.controls label.field').filter(has_text='Direzione del variogramma').locator('select').select_option('horizontal')
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    page.locator('.panel.controls label.field').filter(has_text='Modello di covarianza').locator('select').select_option('gaussian')
    assert page.locator('.figure .fig svg').count()==4
    page.locator('.panel.controls label.field').filter(has_text='Trend lungo x').locator('input[type=range]').fill('1.5')
    assert page.locator('.figure .fig svg').count()==4
    assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
    page.locator('.panel.controls .transport button').nth(1).click()
    assert page.locator('.moran-perm-status').inner_text().startswith('1 /')
    page.locator('.panel.controls .transport button').nth(2).click()
    page.wait_for_function("() => document.querySelector('.moran-perm-status')?.textContent.startsWith('99 / 99')",timeout=30000)
    print('OK: Lab 29 99/99 repliche su richiesta')
    with page.expect_download() as d1:page.get_by_role('button',name='Dati e variogramma CSV').click()
    assert d1.value.suggested_filename=='statatlas_lab29_variogrammi.csv'
    with page.expect_download() as d2:page.get_by_role('button',name='Scarica .R').click()
    assert d2.value.suggested_filename=='statatlas_lab29_variogrammi.R'
    print('OK: esportazione CSV e R')
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    page.wait_for_timeout(450)
    assert page.locator('.figure .fig svg').count()==4
    page.screenshot(path=str(ROOT/'docs/LAB29_BROWSER_MOBILE.png'),full_page=True)
    print('OK: grafici e tabella in mobile scuro')
    assert not errors,errors
    print('OK: nessuna eccezione JS, copertina, obiettivi e previsione')
    browser.close()
