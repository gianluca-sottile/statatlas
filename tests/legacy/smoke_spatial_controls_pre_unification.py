# HISTORICAL TEST (read-only reference) - assumes removed 2.0 spatial UI.
#!/usr/bin/env python3
"""LAB 26-29: nessun autoplay dopo apertura o modifica dei controlli.

Eseguire dopo python3 build.py. Richiede playwright + Chromium.
"""
from pathlib import Path
import os, re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path=os.getenv('STATATLAS_CHROMIUM','/usr/bin/chromium'), args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1360,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded')

    def enter(name):
        page.evaluate("name => {location.hash='#/'+name;dispatchEvent(new HashChangeEvent('hashchange'));}",name)
        page.locator('.lab-head h1').wait_for(timeout=20000)
        page.locator('.panel.controls .transport button').first.wait_for(timeout=20000)
        assert 'Avvia' in page.locator('.panel.controls .transport button').first.inner_text(),f'{name}: autoplay'
        page.wait_for_timeout(550)
        assert 'Avvia' in page.locator('.panel.controls .transport button').first.inner_text(),f'{name}: partenza ritardata'
        assert page.locator('.figure .fig svg').count()>=3,f'{name}: grafici mancanti'
        assert page.locator('table.tv tbody tr').count()>=6,f'{name}: tabella vuota'
        assert count()==0,f'{name}: simulazioni non attese'
    def count():
        a=page.locator('.moran-perm-status').first.inner_text()
        m=re.search(r'^\s*(\d+)\s*/',a)
        assert m,a
        return int(m.group(1))
    def select(label,val):
        page.locator('.panel.controls label.field').filter(has_text=label).locator('select').first.select_option(str(val))
    def idle():
        page.wait_for_timeout(480)
        assert 'Avvia' in page.locator('.panel.controls .transport button').first.inner_text(), 'Avvio non richiesto'
        assert count()==0,'Contatore aggiornato senza clic'
    def next_step():
        page.locator('.panel.controls .transport button').nth(1).click()
        assert count()==1,f'Passo doveva produrre una replica, ottenute {count()}'

    enter('moran');select('Vicinato','queen');idle();next_step()
    select('Alternativa','less');assert count()==1
    select('Meccanismo generatore','checker');idle()
    print('OK LAB 26: apertura ferma, step esplicito, cambio parametri fermo')

    enter('lisa');select('Unità di analisi','2');idle();next_step()
    select('Correzione multipla','BY');assert count()==1
    select('Vicinato','queen');idle()
    print('OK LAB 27: apertura ferma, MAUP e vicinato non riavviano')

    enter('processi-puntuali');select('Meccanismo generatore','thomas');idle();next_step()
    select('Curva da confrontare','K');assert count()==1
    select('Simulazioni sotto CSR','49');assert count()==1
    select('Meccanismo generatore','csr');idle()
    print('OK LAB 28: apertura ferma, modifica DGP non riavvia, visualizzazione conserva')

    enter('variogrammi');assert page.locator('.figure .fig svg').count()==4
    assert page.locator('table.tv tbody tr').count()>=10
    page.locator('.panel.controls .transport button').nth(1).click()
    assert count()==1
    select('Direzione del variogramma','vertical');assert count()==1
    select('Classi di distanza','8');assert count()==1
    select('Modello di covarianza','spherical');idle()
    # L'esperimento puo' essere completato ma non deve avviarsi da solo.
    page.locator('.panel.controls .transport button').nth(2).click()
    page.wait_for_function("() => document.querySelector('.moran-perm-status')?.textContent.startsWith('99 / 99')",timeout=20000)
    assert count()==99
    select('Repliche B','49');assert count()==49
    select('Repliche B','99');assert count()==99
    print('OK LAB 29: copertina, tabelle, simulazione manuale, cache B')

    # Riapertura laboratorio dopo navigazione: sempre fermo
    enter('moran');enter('variogrammi')
    page.locator('.fig svg circle[aria-label^="Seleziona sensore"]').first.click()
    assert not errors,f'Errori JavaScript: {errors}'
    print('PASS: zero errori JavaScript, quattro laboratori aprono senza autoplay')
    browser.close()
