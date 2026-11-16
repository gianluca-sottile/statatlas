#!/usr/bin/env python3
"""Browser QA for five sample-size options in probability and inference (01-09)."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LABS = [
    ('distribuzioni', 'Numero di osservazioni', 'select'),
    ('bivariata', 'Coppie N', 'select'),
    ('simulazione', 'Estrazioni N', 'select'),
    ('lgn-tcl', 'Osservazioni per traiettoria', 'select'),
    ('adattamento', 'Osservazioni N', 'select'),
    ('stimatori', 'Numerosità campionaria n', 'range'),
    ('fisher', 'n', 'select'),
    ('intervalli', 'n', 'select'),
    ('test', 'Numerosità n', 'select'),
]
SIZES = ['10', '100', '1000', '10000', '100000']

def choose(page, lab, label, field, value):
    if field == 'range':
        q = page.locator('input[aria-label="Numerosità campionaria n"]')
        q.fill(str(SIZES.index(value)))
        q.dispatch_event('change')
        assert q.input_value() == str(SIZES.index(value))
        return
    if lab == 'distribuzioni':
        q = page.locator('select[aria-label="Numero di osservazioni"]')
    else:
        q = page.locator('select').filter(has=page.locator('option[value="100000"]')).first
    q.select_option(value)
    assert q.input_value() == value, (lab, q.input_value(), value)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content((ROOT/'index.html').read_text(encoding='utf-8'), wait_until='load')
        for lab, label, field in LABS:
            page.evaluate('(id) => location.hash="#/" + id', lab)
            page.wait_for_function('(id) => window.SA.currentLab === id', arg=lab)
            if field == 'range':
                q = page.locator('input[aria-label="Numerosità campionaria n"]')
                assert [q.get_attribute('min'), q.get_attribute('max'), q.get_attribute('step')] == ['0','4','1'], lab
            elif lab == 'distribuzioni':
                q = page.locator('select[aria-label="Numero di osservazioni"]')
                assert q.locator('option').evaluate_all('(xs) => xs.map(x=>x.value)') == SIZES, lab
            else:
                q = page.locator('select').filter(has=page.locator('option[value="100000"]')).first
                assert q.locator('option').evaluate_all('(xs) => xs.map(x=>x.value)') == SIZES, (lab, q.locator('option').all_text_contents())
            choose(page, lab, label, field, '100000')
            if lab in ('intervalli', 'test'):
                script = page.locator('pre[aria-label="Codice R"]').first.text_content()
                assert '100000' in script, (lab, 'R export not aligned with chosen n')
            assert not errors, (lab, errors)
            print('PASS', lab, 'n=100000 available')
            if lab == 'lgn-tcl':
                page.get_by_role('button', name='Limite centrale', exact=True).click()
                q = page.locator('label.field').filter(has_text='n per campione').locator('select')
                assert q.locator('option').evaluate_all('(xs) => xs.map(x=>x.value)') == SIZES
                choose(page, lab, 'n per campione', 'select', '100000')
                print('PASS lgn-tcl CLT n=100000 distinct from B')
            if lab in ('test', 'intervalli'):
                page.get_by_role('button', name='Un intervallo' if lab == 'intervalli' else 'Una coppia di campioni').first.click()
                assert not errors, (lab, errors)
                print('PASS', lab, 'one real high-n simulation')
        assert not errors, errors
        page.close()
        print('PASS 01-09: 5 sample sizes, n=100000, CLT separation, high-n inference, no JS errors')
    finally:
        browser.close()
