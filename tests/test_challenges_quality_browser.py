#!/usr/bin/env python3
"""Browser QA: controlled-vs-confounded comparison feedback, Lab 21 boosting."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                               args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank#/boost')
        page.set_content((ROOT/'index.html').read_text(encoding='utf8'),wait_until='load')
        page.wait_for_function("SA.currentLab==='boost'")
        q=page.locator('.challenge-card').nth(2)
        q.locator('summary').click()
        def steps(k):
            for _ in range(k): page.locator('.controls .transport button').nth(1).click()
        steps(2)
        page.locator('.controls select').nth(2).select_option('1')
        steps(3)
        progress=q.locator('.challenge-activity').inner_text()
        assert 'Confronto controllato' in progress,progress
        # Start a new baseline on the current configuration, then let a second
        # parameter vary alongside depth: cannot attribute the difference to depth.
        q.get_by_role('button',name='Aggiorna punto di partenza').click()
        steps(2)
        rate=page.locator('.controls input[type="range"]').first
        rate.evaluate("el=>{el.value='0.16';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}")
        page.locator('.controls select').nth(2).select_option('3')
        steps(5)
        progress=q.locator('.challenge-activity').inner_text()
        assert 'confronto resta esplorativo' in progress,progress
        assert not errors,errors
        print('PASS: GBM advanced challenge distinguishes controlled and confounded comparisons, no JS errors')
    finally: browser.close()
