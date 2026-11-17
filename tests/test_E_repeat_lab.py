#!/usr/bin/env python3
"""Regression: a teacher can assign the same lab twice with different deterministic checkpoints."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROME_BIN') or None,headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    page.set_content((root/'index.html').read_text())
    page.evaluate('location.hash="#/distribuzioni"')
    page.wait_for_function('SA.currentLab==="distribuzioni"')
    default=page.evaluate('SA.experiments.capture()')
    page.evaluate('()=>{for(let i=0;i<5;i++)SA.ui.activeRunner.stepOnce()}')
    changed=page.evaluate('SA.experiments.capture()')
    html=page.evaluate('''(presets)=>{
      const steps=presets.map((x,i)=>{let s=SA.teachers.draftStep('distribuzioni',x);
        s.title='Repeated lab '+(i+1);s.challengeIds=[];return s;});
      return SA.teachers.buildStudentHTML({format:SA.teachers.FORMAT,version:1,engine:SA.buildId,
        id:'repeat-lab-2026',title:'Repeated lab',audience:'',description:'',language:'it',steps});
    }''',[default,changed])
    student=browser.new_page()
    student.set_content(html)
    student.wait_for_function('SA.currentLab==="distribuzioni"&&SA.ui.activeRunner.experimentCheckpoint().steps===0')
    student.locator('.teacher-student-banner nav button').nth(1).click()
    student.wait_for_function('SA.ui.activeRunner&&SA.ui.activeRunner.experimentCheckpoint().steps===5',timeout=18000)
    student.locator('.teacher-student-banner nav button').nth(0).click()
    student.wait_for_function('SA.ui.activeRunner&&SA.ui.activeRunner.experimentCheckpoint().steps===0',timeout=18000)
    print('PASS E repeated lab with distinct D checkpoints, navigation in both directions')
    browser.close()
