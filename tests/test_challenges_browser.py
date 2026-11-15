"""Browser smoke test for Challenges and unchanged numerical labs.
Run: python3 tests/test_challenges_browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
       args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in (390,768,1366):
        page=browser.new_page(viewport={'width':width,'height':860}, reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.goto('about:blank#/intervalli')
        page.set_content(html,wait_until='domcontentloaded',timeout=30000)
        page.locator('.challenge-section').wait_for(timeout=30000)
        assert page.locator('.challenge-card').count()==3
        assert page.locator('.lab-head h1').inner_text()=='Intervalli di confidenza'
        overflow=page.evaluate('document.documentElement.scrollWidth>window.innerWidth+2')
        assert not overflow,('horizontal overflow',width)
        if width==1366:
            card=page.locator('.challenge-card').first
            card.locator('summary').click()
            assert 'almeno 100 intervalli' in card.inner_text().lower()
            # Test ready/feedback on default inputs; no arbitrary score.
            card.locator('.challenge-answer').nth(1).click()
            card.get_by_role('button',name='Verifica la sfida').click()
            assert 'Imposta t' in card.locator('.challenge-feedback').inner_text()
            # Valid configuration and actual 100 Monte Carlo replications.
            page.locator('label.field').filter(has_text='Parametro e metodo').locator('select').select_option('t')
            page.locator('label.field').filter(has_text='Intervalli B').locator('select').select_option('100')
            page.get_by_role('button',name='Completa l’esperimento').click()
            assert page.evaluate("window.SA.labs['intervalli'].challengeState().k")>=100
            card.get_by_role('button',name='Verifica la sfida').click()
            assert 'Sfida completata' in card.locator('.challenge-feedback').inner_text()
            assert '1 di 3 sfide completate' in page.locator('.challenge-progress').inner_text()
            page.wait_for_timeout(1000)  # let the editorial reveal animation finish
            page.screenshot(path=str(ROOT/'docs/CHALLENGES_08_DESKTOP.png'),full_page=True)
            page.locator('.challenge-section').screenshot(path=str(ROOT/'docs/CHALLENGES_PREVIEW.png'))
        page.evaluate("location.hash='#/validazione'")
        page.locator('.lab-head h1').filter(has_text='Validazione').wait_for(timeout=30000)
        assert page.locator('.challenge-card').count()==3
        if width==1366:
            # A real exercise on the validation lab, using its existing Step control.
            c2=page.locator('[data-challenge-id="cv-choice"]')
            c2.locator('summary').click()
            for _ in range(19):
                page.locator('.controls button[aria-label="Una nuova replica"]').evaluate('(b)=>b.click()')
            assert page.evaluate("window.SA.labs['validazione'].challengeState().k")>=20
            c2.locator('.challenge-answer').nth(1).click()
            c2.get_by_role('button',name='Verifica la sfida').click()
            assert 'Sfida completata' in c2.locator('.challenge-feedback').inner_text()
        page.evaluate("location.hash='#/kriging'")
        page.locator('.lab-head h1').filter(has_text='Kriging').wait_for(timeout=30000)
        assert page.locator('.challenge-card').count()==3
        assert page.evaluate("window.SA.labs['kriging'].challengeState().reps")==0
        if width==1366:
            c3=page.locator('[data-challenge-id="kr-added"]')
            c3.locator('summary').click()
            before=page.evaluate("window.SA.labs['kriging'].challengeState()")
            page.evaluate('''() => {
                const cell=Array.from(document.querySelectorAll('[data-grid-index]'))
                  .find(x=>!x.getAttribute('aria-label').includes('sensore presente'));
                if(!cell)throw Error('no free sensor positions');
                cell.dispatchEvent(new MouseEvent("click",{bubbles:true}));
            }''')
            after=page.evaluate("window.SA.labs['kriging'].challengeState()")
            assert after['nSensor']==before['nSensor']+1
            assert after['fieldKey']==before['fieldKey']
            assert after['meanVar']<=before['meanVar']+1e-8
            c3.locator('.challenge-answer').first.click()
            c3.get_by_role('button',name='Verifica la sfida').click()
            feedback=c3.locator('.challenge-feedback').inner_text()
            assert 'Sfida completata' in feedback
        if width==390:
            page.screenshot(path=str(ROOT/'docs/CHALLENGES_30_MOBILE.png'),full_page=True)
        assert not errors,(width,errors[:4])
        print(f'PASS width={width}, three labs, no JS errors, no overflow')
        page.close()
    browser.close()
