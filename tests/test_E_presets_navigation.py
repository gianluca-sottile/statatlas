#!/usr/bin/env python3
"""Macrofase E: two different labs, exact D presets, reports and hostile inputs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,sys
ROOT=Path(__file__).resolve().parents[1]
def run(width=1366):
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROME_BIN') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx=browser.new_context(viewport={'width':width,'height':850},accept_downloads=True)
        author=ctx.new_page();author.on('pageerror',lambda e:errors.append(str(e)))
        author.set_content((ROOT/'index.html').read_text())
        # Real, non-default experiment: distribution checkpoint with 7 draws.
        author.evaluate('location.hash="#/distribuzioni"')
        author.wait_for_function('SA.currentLab==="distribuzioni"')
        author.evaluate('()=>{for(let j=0;j<7;j++) SA.ui.activeRunner.stepOnce()}')
        initial=author.evaluate('SA.experiments.capture()')
        assert initial['checkpoint']['steps']==7
        author.evaluate('location.hash="#/regressione"')
        author.wait_for_function('SA.currentLab==="regressione"')
        second=author.evaluate('SA.experiments.capture()')
        assert second['lab']=='regressione'
        author.evaluate('location.hash="#/teachers"')
        author.wait_for_selector('.teacher-builder')
        project=author.evaluate('''(presets)=>{
          const s1=SA.teachers.draftStep('distribuzioni',presets[0]);
          const s2=SA.teachers.draftStep('regressione',presets[1]);
          s1.challengeIds=[];s1.title='Step one';s1.instructions='Generate seven draws';
          s2.challengeIds=[SA.challenges.bank.regressione[0].id];s2.title='Step two';
          const p={format:SA.teachers.FORMAT,version:SA.teachers.VERSION,engine:SA.buildId,
            id:'training-2026-test',title:'Statistical reasoning',description:'Progress through two labs',audience:'Students',
            language:'en',steps:[s1,s2]};
          SA.teachers.setDraft(p);return p;
        }''',[initial,second])
        # Round-trip a teacher JSON file through the browser file input.
        author.locator('.teacher-actions input[type=file]').last.set_input_files({
            'name':'teacher.json','mimeType':'application/json','buffer':json.dumps(project).encode()})
        author.wait_for_function('SA.teachers.getDraft().id==="training-2026-test"')
        assert author.evaluate('SA.teachers.getDraft().steps.length')==2
        html=author.evaluate('SA.teachers.buildStudentHTML(SA.teachers.getDraft())')
        exported=ctx.new_page();exported.on('pageerror',lambda e:errors.append(str(e)))
        exported.set_content(html,wait_until='load')
        exported.wait_for_function('SA.currentLab==="distribuzioni" && document.documentElement.lang==="en"',timeout=30000)
        exported.wait_for_function('SA.ui.activeRunner && SA.ui.activeRunner.experimentCheckpoint().steps===7',timeout=30000)
        assert exported.locator('.challenge-section').is_hidden()
        assert exported.locator('.teacher-student-banner .student-status').is_visible()
        # Click the second activity: route, preview and preset stay consistent.
        exported.locator('.teacher-student-banner nav button').nth(1).click()
        exported.wait_for_function('SA.currentLab==="regressione"',timeout=30000)
        exported.wait_for_function('document.querySelectorAll("#main .challenge-card:not([hidden])").length===1',timeout=30000)
        assert exported.locator('.teacher-student-banner nav button[aria-current="step"]').inner_text().endswith('Step two')
        # Try navigating to a lab not assigned (UI normally hides sidebar).
        exported.evaluate('location.hash="#/kriging"')
        exported.wait_for_function('location.hash==="#/regressione"',timeout=15000)
        assert exported.locator('.teacher-student-banner h1').inner_text()=='Statistical reasoning'
        # Progress and local reflection are recorded for the second step.
        exported.locator('.teacher-student-banner textarea').fill('Estimation depends on the assumed model')
        exported.locator('.teacher-student-banner button').filter(has_text='Mark activity completed').click()
        with exported.expect_download() as event:
            exported.locator('.teacher-student-banner button').filter(has_text='Export report JSON').click()
        d=event.value
        report=ROOT/'verifica'/'E_student_report.json';d.save_as(report)
        result=json.loads(report.read_text());report.unlink()
        assert result['format']=='statatlas.student-report'
        assert len(result['records'])==2 and result['records'][1]['completed']
        assert result['records'][1]['reflection'].startswith('Estimation')
        assert result['records'][0]['challengeIds']==[]
        assert not errors,errors
        print('PASS E two labs, seeded D presets, challenge restriction, EN student report, route guard, editor reimport @',width,flush=True)
        ctx.close();browser.close()
if __name__=='__main__':run(int(sys.argv[1]) if len(sys.argv)>1 else 1366)
