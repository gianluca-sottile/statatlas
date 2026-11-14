#!/usr/bin/env python3
"""StatAtlas LAB31: end-to-end Chromium QA, no autoplay, controls, R/CSV, mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
root=Path(__file__).resolve().parents[2]
(root/'docs').mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.getenv('STATATLAS_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 page.set_content((root/'index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
 page.evaluate("location.hash='#/regressione-spaziale';dispatchEvent(new HashChangeEvent('hashchange'))")
 page.locator('.lab-head h1').wait_for(timeout=30000)
 assert 'Regressione spaziale' in page.locator('.lab-head h1').inner_text()
 assert page.locator('.lab-cover svg').count()==1,'copertina'
 assert page.locator('.lab-head ul.chips li').count()==5,'obiettivi'
 assert page.locator('details.predict input[type=radio]').count()==3,'previsione'
 assert page.locator('.figure .fig svg').count()==4,'grafici'
 assert page.locator('table.tv tbody tr').count()>=10,'tabella'
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /'),'autoplay vietato'
 assert 'Avvia' in page.locator('.transport button').first.inner_text(),'transport'
 page.screenshot(path=str(root/'docs/LAB31_BROWSER_DESKTOP.png'),full_page=True)
 print('OK: titolo, copertina, 5 obiettivi, 3 risposte, 4 grafici, 11 righe, no autoplay')
 page.locator('details.predict').click()
 page.locator('#spreg-0').check()
 assert 'Corretto' in page.locator('.feedback').inner_text(),'feedback'
 ctl=lambda name:page.locator('label.field').filter(has_text=name).locator('select')
 ctl('Modello da ispezionare').select_option('sem')
 ctl('Mappa visualizzata').select_option('innovation')
 ctl('Colora i fold').select_option('block')
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /'),'visual options started MC'
 ctl('Generatore').select_option('sem')
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /'),'new data started MC'
 ctl('Generatore').select_option('independent')
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /'),'independent data started MC'
 ctl('Generatore').select_option('sar')
 ctl('Vicini k del predittore CV').select_option('5')
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /'),'k update started MC'
 page.locator('.panel.controls .transport button').nth(1).click()
 assert page.locator('.moran-perm-status').inner_text().startswith('1 /'),'one-step'
 ctl('Colora i fold').select_option('random')
 assert page.locator('.moran-perm-status').inner_text().startswith('1 /'),'presentation must preserve reps'
 ctl('Repliche B').select_option('29')
 assert page.locator('.moran-perm-status').inner_text().startswith('1 /'),'changing B must preserve reps'
 page.locator('.panel.controls .transport button').nth(2).click()
 page.wait_for_function("() => document.querySelector('.moran-perm-status')?.textContent.startsWith('29 / 29')",timeout=45000)
 print('OK: SAR/SEM, independent, k, fold, Passo e Completa; no autoplay after controls')
 page.locator('.lab-head .head-actions button').click()
 assert page.locator('.drawer.open').count()==1,'drawer'
 page.locator('.seg-tabs [data-level="adv"]').click()
 assert 'Jacobiano' in page.locator('.drawer-body').inner_text(),'advanced'
 page.keyboard.press('Escape')
 with page.expect_download() as d1:page.get_by_role('button',name='Dati e fold CSV').click()
 assert d1.value.suggested_filename=='statatlas_lab31_regressione_spaziale.csv'
 with page.expect_download() as d2:page.get_by_role('button',name='Scarica .R').click()
 assert d2.value.suggested_filename=='statatlas_lab31_regressione_spaziale.R'
 page.set_viewport_size({'width':390,'height':844})
 page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
 page.wait_for_timeout(400)
 assert page.locator('.figure .fig svg').count()==4
 page.screenshot(path=str(root/'docs/LAB31_BROWSER_MOBILE.png'),full_page=True)
 print('OK: teorie, R/CSV, mobile dark')
 page.evaluate("location.hash='#/kriging';dispatchEvent(new HashChangeEvent('hashchange'))")
 page.locator('.lab-head h1').wait_for(timeout=30000)
 assert page.locator('.moran-perm-status').inner_text().startswith('0 /')
 page.evaluate("location.hash='#/regressione-spaziale';dispatchEvent(new HashChangeEvent('hashchange'))")
 assert page.locator('.lab-head h1').count()==1
 assert not errors,errors
 print('OK: navigazione LAB30↔LAB31, nessun errore JavaScript')
 browser.close()
