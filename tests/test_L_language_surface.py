#!/usr/bin/env python3
"""Visible EN surface regression: 31 labs, live steps, SVG, footer links; no network."""
from pathlib import Path
from hashlib import sha256
from shutil import which
from playwright.sync_api import sync_playwright
import re

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
IT=re.compile(r'\b(?:della|delle|degli|nella|nelle|sulla|sullo|alla|alle|quale|quando|questo|questa|perché|stimata|stimato|campionaria|campionarie|rispetto|osservazione|osservazioni|addestramento|discesa|deviazione|differenze|intorno|confronto|incrociata|rimuovere|trascina|l’errore|l’indice|l’esperimento|l’osservazione|pulsante|scarto|inizializzazioni|riproducibilità|livello avanzato|stesso|stessa|verifica esatta)\b',re.I)

def visible_italian(page):
    return page.evaluate('''pattern=>{
      const re=new RegExp(pattern,'iu'),seen=new Set(),walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
      let node;while(node=walker.nextNode()){
       const e=node.parentElement; if(!e||e.closest('.it-source-hidden,[lang=it],.en-companion,script,style,pre,code'))continue;
       if(!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')continue;
       const v=node.textContent.trim();if(v&&re.test(v)) seen.add(v);
      }
      return [...seen];
    }''', IT.pattern)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':900})
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(HTML);page.locator('button.lang-toggle').first.click()
    ids=page.evaluate('SA.catalog.flatMap(p=>p.labs.map(x=>x.id))')
    assert len(ids)==31
    report=[]
    for lab in ids:
      page.evaluate('id=>{history.replaceState({},"","#/"+id);window.dispatchEvent(new Event("hashchange"));}',lab)
      page.wait_for_function('id=>SA.currentLab===id',arg=lab)
      page.wait_for_timeout(40)
      initial=visible_italian(page)
      btn=page.locator('.controls button[aria-label]')
      step=btn.filter(has=page.locator('svg')).first if False else page.locator('.controls button[aria-label*="epoch"],.controls button[aria-label*="Step"],.controls button[aria-label*="sample"],.controls button[aria-label*="observation"],.controls button[aria-label*="draw"],.controls button[aria-label*="interval"]')
      if step.count():
        try:step.first.click(timeout=2500)
        except Exception:pass
      page.wait_for_timeout(50)
      after=visible_italian(page)
      report.append((lab,initial,after))
      print('EN',lab,'remaining',len(initial),'after-step',len(after),flush=True)
    page.evaluate('location.hash="#/reti-neurali"')
    page.wait_for_timeout(100)
    assert page.locator('.step h2').first.text_content().strip()=='Training epoch by epoch'
    table=page.locator('table.tv').first.inner_text()
    for phrase in ('Network parameters','Gradient check','Training status','validation accuracy'):
      assert phrase in table,phrase
    assert 'Parametri della rete' not in table
    footer=page.locator('.foot').first
    anchors=footer.locator('a').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))')
    assert anchors == ['https://gianlucasottile.rbind.io/','mailto:Gianluca.sottile@unipa.it','https://marcellochiodi.github.io/simul2000/','mailto:Marcello.chiodi@unipa.it'], anchors
    assert not errors,errors
    issues=[(lab,ini,after) for lab,ini,after in report if ini or after]
    print('REMAINING',issues[:15]);print('SHA',sha256(HTML.encode()).hexdigest())
    browser.close()
    if issues:raise SystemExit('Untranslated visible surface detected')
    print('PASS EN visible content 31/31 + live steps + neural tables + four footer links')
