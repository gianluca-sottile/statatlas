#!/usr/bin/env python3
"""Targeted WCAG-oriented smoke checks; not an independent WCAG conformance audit."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text('utf-8')

def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,
                             args=['--no-sandbox','--disable-dev-shm-usage'])
  try:
   for mobile in (False, True):
    page=browser.new_page(viewport={'width':390 if mobile else 1366,'height':844},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda ex:errors.append(str(ex)))
    page.set_content(HTML,wait_until='load')
    assert page.locator('html').get_attribute('lang')=='it'
    assert page.locator('a[href="#main"].sr-only').count()==1
    assert page.locator('main#main[tabindex="-1"]').count()==1
    assert page.locator('#menuBtn[aria-controls="sidebar"]').count()==1
    if mobile:
     assert page.locator('aside#sidebar[inert]').count()==1
     page.locator('#menuBtn').click()
     assert page.locator('#menuBtn').get_attribute('aria-expanded')=='true'
     assert page.locator('aside#sidebar[inert]').count()==0
     page.keyboard.press('Escape')
     assert page.locator('aside#sidebar[inert]').count()==1
     page.locator('#menuBtn').click()
    toggle=page.locator('.lang-toggle')
    assert toggle.get_attribute('aria-label')=='Switch to English'
    toggle.focus();page.keyboard.press('Enter')
    assert page.locator('html').get_attribute('lang')=='en'
    assert page.locator('.lang-toggle').get_attribute('aria-label')=='Switch to Italian'
    assert page.locator('h1').count()==1
    assert not errors,errors
    # Exercise the dialog keyboard trap; cards and controls remain keyboard reachable.
    page.get_by_role('button',name='Explore the atlas: the laboratory map').click()
    dlg=page.get_by_role('dialog')
    assert dlg.count()==1
    assert dlg.get_attribute('aria-modal')=='true'
    assert dlg.locator('[role="link"][tabindex="0"]').count()==31
    last=dlg.locator('[role="link"][tabindex="0"]').last
    last.focus()
    page.keyboard.press('Tab')
    assert page.evaluate('document.activeElement.classList.contains("modal-close")'), 'dialog Tab focus must wrap to first control'
    page.keyboard.press('Escape')
    assert page.get_by_role('dialog').count()==0
    page.evaluate('location.hash="#/test"')
    page.wait_for_function("SA.currentLab === 'test'")
    assert page.locator('section.en-companion').count()==1
    assert page.locator('section.step').count()>=4
    assert page.locator('.challenge-card').count()==3
    assert page.locator('section.en-companion details').count()==1
    assert not errors,errors
    print('PASS accessibility smoke',390 if mobile else 1366,'px: lang, skip, focus, dialog, reduced motion and source language')
    page.close()
  finally:browser.close()
if __name__=='__main__':main()
