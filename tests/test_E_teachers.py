#!/usr/bin/env python3
"""Macrofase E: author, validate, export/import editable project, one-file offline student path.
Uses the fully compiled HTML; no network or server is needed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, sys, os

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()

def run(width=1366):
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROME_BIN') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx=browser.new_context(viewport={'width':width,'height':900},accept_downloads=True)
        page=ctx.new_page()
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML,wait_until='load')
        page.evaluate('location.hash="#/teachers"')
        page.wait_for_selector('.teacher-builder')
        assert page.locator('.teacher-builder h1').count()==1
        assert page.locator('.teacher-nav').count()==1
        # Teacher UI: add, reorder, edit a path and select specific challenges.
        selector=page.locator('.teacher-card select[aria-label*="Laboratorio"]')
        selector.select_option('distribuzioni')
        page.locator('.teacher-card button').filter(has_text='Aggiungi laboratorio').click()
        page.get_by_role('button',name='Impostazioni del percorso').click()
        page.locator('input[aria-label="Titolo del percorso"]').fill('Capire le probabilità')
        page.locator('textarea[aria-label="Obiettivi e descrizione"]').fill('Un esempio riproducibile')
        page.locator('.teacher-ux-panel-head button').click()
        assert page.locator('.teacher-step').count()==1
        step_id=page.evaluate('SA.teachers.getDraft().steps[0].id')
        page.locator('.teacher-step .teacher-check input').last.uncheck()
        pr=page.evaluate('SA.teachers.getDraft()')
        assert len(pr['steps'][0]['challengeIds'])==2
        page.evaluate('SA.teachers.validate(SA.teachers.getDraft())')
        exported=page.evaluate('SA.teachers.buildStudentHTML(SA.teachers.getDraft())')
        assert len(exported)>1_000_000 and len(exported)<4_000_000
        assert 'Capire le probabilità' in exported and 'teacherStudent' in exported
        assert 'https://' not in exported[:200]  # Offline HTML does not link to a CDN.
        assert 'src="http' not in exported
        # Invalid schema, bad references, HTML injection in notes stays inert.
        problem=page.evaluate('''()=>{
          let p=JSON.parse(JSON.stringify(SA.teachers.getDraft()));p.steps[0].challengeIds=['wrong'];
          try {SA.teachers.validate(p);return 'bad'}catch(e){return e.message}
        }''')
        assert problem !='bad',problem
        hostile=page.evaluate('''()=>{
          let p=JSON.parse(JSON.stringify(SA.teachers.getDraft()));
          p.steps[0].instructions='<img src=x onerror=window.injection=1>';
          return SA.teachers.buildStudentHTML(p);
        }''')
        assert '<img src=x onerror' not in hostile
        assert '\\u003cimg' in hostile
        print('PASS E teacher UI, project contract, challenge selection, safe export',flush=True)
        student=ctx.new_page()
        student_errors=[];student.on('pageerror',lambda e:student_errors.append(str(e)))
        student.set_content(exported,wait_until='load')
        student.wait_for_function('window.SA.currentLab==="distribuzioni"&&!!document.querySelector("#teacherStudent .student-status")',timeout=25000)
        student.wait_for_function('document.querySelectorAll("#main .challenge-card").length===3',timeout=25000)
        student.wait_for_timeout(200)
        assert student.locator('.teacher-student-banner').is_visible()
        assert student.locator('.sidebar').is_hidden()
        assert student.locator('.challenge-card:not([hidden])').count()==2
        student.locator('.student-reflection-toggle').click()
        student.locator('.teacher-student-banner textarea').fill('La probabilità è un limite di frequenze, sotto opportune ipotesi.')
        student.locator('.teacher-student-banner button').filter(has_text='Segna attività completata').click()
        assert 'completata' in student.locator('.student-status').inner_text()
        with student.expect_download() as download_info:
            student.locator('.teacher-student-banner button').filter(has_text='Esporta report JSON').click()
        file=download_info.value
        assert file.suggested_filename.startswith('StatAtlas_student_report_')
        path=ROOT/'verifica'/'student_report_E_test.json'
        file.save_as(path)
        data=json.loads(path.read_text())
        assert data['records'][0]['completed'] is True
        assert data['records'][0]['reflection'].startswith('La probabilità')
        assert len(data['records'][0]['challengeIds'])==2
        path.unlink()
        assert not student_errors,student_errors
        # A second lab/step and a D preset from an interactive experiment.
        page.evaluate('location.hash="#/regressione"')
        page.wait_for_function('SA.currentLab==="regressione"')
        page.evaluate('SA.teachers.addCurrent()')
        page.wait_for_function('location.hash==="#/teachers"')
        page.wait_for_selector('.teacher-step:nth-of-type(2)') if False else None
        draft=page.evaluate('SA.teachers.getDraft()')
        assert len(draft['steps'])==2
        assert draft['steps'][-1]['lab']=='regressione' and draft['steps'][-1]['preset']
        page.evaluate('SA.teachers.validate(SA.teachers.getDraft())')
        assert not errors,errors
        print(f'PASS E student offline report, lab restrictions, second lab preset @ {width}px',flush=True)
        ctx.close();browser.close()

if __name__=='__main__':run(int(sys.argv[1]) if len(sys.argv)>1 else 1366)
