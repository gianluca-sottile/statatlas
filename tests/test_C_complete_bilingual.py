#!/usr/bin/env python3
from shutil import which
"""Complete EN educational content + Challenges + keyboard/accessibility smoke.

Offline and side-effect free: loads the HTML via set_content; it does not send
files to a remote web service or execute GNU R. Designed as a release gate.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')


def check(ok, msg):
    if not ok:
        raise AssertionError(msg)


def run(width):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width':width,'height':880}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(HTML, timeout=25000)
        if width < 700:
            page.locator('#menuBtn').click()
        page.locator('button.lang-toggle').first.click()
        if width < 700:
            page.locator('#menuBtn').click()
        check(page.evaluate('document.documentElement.lang') == 'en', 'Missing document lang=en')
        ids = page.evaluate('SA.catalog.flatMap(p => p.labs.map(l => l.id))')
        check(len(ids) == 31, f'Expected 31, got {len(ids)}')
        check(page.evaluate('Object.keys(SA.englishTheory).length') == 31,'Missing 31 deep EN methodological chapters')
        check(page.evaluate('Object.keys(SA.englishGoals).length') == 31,'Missing 31 topic-specific EN objective sets')
        check(page.evaluate('Object.values(SA.englishGoals).every(x=>x.length===4)'),'Missing one or more of the 124 EN objectives')
        check(page.evaluate('Object.keys(SA.englishChallenges).filter(k=>Array.isArray(SA.englishChallenges[k])).length') == 31,'Missing 31 EN challenge banks')
        exercises = page.evaluate('Object.values(SA.englishLessons).reduce((n,x)=>n+x.exercises.length,0)')
        check(exercises >= 93, f'Expected >=93 EN practice exercises, got {exercises}')
        for i, lab in enumerate(ids):
            page.evaluate('id => { history.replaceState({}, "", "#/" + id); window.dispatchEvent(new Event("hashchange")); }',lab)
            actual = page.evaluate('''id => {
                const source=SA.english.labs[id], cards=[...document.querySelectorAll('.challenge-card')];
                const bank=SA.challenges.bank[id];
                const t=SA.i18n.challengeTasks(id,bank);
                return {
                  h1:document.querySelector('.lab-head h1')?.textContent,
                  lead:document.querySelector('.lab-head .lede')?.textContent,
                  enComp:document.querySelectorAll('.en-companion').length,
                  n:cards.length,
                  challengeItems:t.length,
                  names:t.map(x=>x.title), correct:t.every((x,j)=>x.correct===bank[j].correct),
                  q:t.every(x=>x.question && x.options.length===3 && x.explanation),
                  labels:[...document.querySelectorAll('.controls label .field-row span:first-child')].map(x=>x.textContent),
                  links:document.querySelectorAll('a[href*="http"]').length,
                  speed:document.querySelector('.controls input[aria-label="Speed"]')?.value || null,
                  backHidden:document.querySelectorAll('.it-source-hidden').length,
                }
            }''',lab)
            check(actual['h1'] and not any(x in actual['h1'] for x in ('Distribuzioni e', 'Variabili bivariate','Stimatori')), f'Italian title: {lab}')
            check(actual['lead'] and len(actual['lead'])>40, f'Untranslated lab introduction {lab}')
            check(actual['enComp']==1, f'Missing EN companion {lab}')
            bridge = page.locator('[data-course-bridge="'+lab+'"]')
            check(bridge.count() == 1, f'Missing EN R-course bridge {lab}')
            check('From experiment to reproducible R' in bridge.inner_text(), f'Italian course bridge {lab}')
            check(bridge.locator('.course-bridge-download').inner_text().strip() == 'Download student worksheet', f'Untranslated course worksheet {lab}')
            worksheet = page.evaluate('''id => {
              const l=SA.catalog.flatMap(p=>p.labs).find(x=>x.id===id);
              return SA.courseBridge.worksheet(id,{lab:l});
            }''', lab)
            check('## Research question' in worksheet and '## Reproducing the experiment in R' in worksheet, f'Missing EN downloadable worksheet {lab}')
            check(actual['n']==3 and actual['challengeItems']==3, f'Missing Challenges {lab}')
            check(actual['correct'] and actual['q'], f'Challenge content/order mismatch {lab}')
            if i<25 and lab != 'penalizzata':
                check(actual['speed'] == '25', f'Invalid speed default {lab}: {actual["speed"]}')
            cards=page.locator('.challenge-card')
            for j in range(3):
                card=cards.nth(j)
                card.locator('summary').click()
                question=card.locator('.challenge-answers legend').text_content()
                check(question and len(question)>10, f'Empty question {lab}/{j}')
                opts=card.locator('.challenge-answers label').all_text_contents()
                check(len(opts)==3 and all(x.strip() for x in opts),f'Missing distractors {lab}/{j}')
                card.locator('summary').click()
            page.locator('.ux-action-theory').first.click()
            base=page.locator('.drawer-body').inner_text()
            check('Methodological foundations' in base and 'Worked numerical example' in base, f'Missing essential method {lab}')
            check(len(base)>1500, f'Essential English chapter too short {lab}: {len(base)}')
            page.locator('.drawer button[data-level="adv"]').click()
            adv=page.locator('.drawer-body').inner_text()
            check('Mathematical reasoning and inferential conditions' in adv and len(adv)>1200, f'Missing advanced text {lab}')
            page.locator('.drawer button[data-level="ex"]').click()
            check(page.locator('.english-exercises .exercise').count()>=3, f'Missing English exercises {lab}')
            check('Mostra la soluzione' not in page.locator('.drawer-body').inner_text(),f'IT exercise label {lab}')
            page.locator('.drawer button[data-level="ref"]').click()
            check(page.locator('.drawer-body .refs').count() == 1, f'Missing references {lab}')
            page.keyboard.press('Escape')
            check(page.locator('aside.drawer.open').count()==0, f'Escape dialog failure {lab}')
            check(not errors, 'JS error %s: %s' % (lab, errors[-1] if errors else 'none'))
            print(f'PASS EN {i+1:02d}/31 {lab}: 3 Challenges, essential, advanced, exercises, refs @ {width}px', flush=True)
        # IT source must remain intact and the language switch reversible.
        if width < 700: page.locator('#menuBtn').click()
        page.locator('button.lang-toggle').first.click()
        check(page.evaluate('document.documentElement.lang')=='it','Switch back to Italian failed')
        page.evaluate('''() => { history.replaceState({}, "", "#/distribuzioni"); window.dispatchEvent(new Event('hashchange')); }''')
        check('Distribuz' in page.locator('.lab-head h1').inner_text(), 'Italian source altered')
        check(page.locator('.en-companion').count()==0, 'English companion still shown in Italian mode')
        check(page.locator('.challenge-card').count()==3,'Italian challenges damaged')
        check(not errors, f'Browser JS errors: {errors}')
        print(f'PASS bilingual switch + 31 lab routes + 93 English Challenges + 62 theory views + {exercises} exercises @ {width}px',flush=True)
        browser.close()


if __name__ == '__main__':
    run(390)
    run(1366)
    print('PASS: MACROFASE C EN educational content + interactive challenges at mobile/desktop')
