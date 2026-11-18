'use strict';
/* Presentation-only structural gate for UX workbench. Browser tests verify interactions. */
const fs=require('fs'), path=require('path'), assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const build=read('build.py'), html=read('index.html'), wb=read('src/core/workbench.js');
const ts=read('src/core/teachers.js'), style=read('src/styles/workbench.css');
assert(build.includes('workbench.js')&&build.includes('workbench.css'));
assert(html.includes('ux-workbench')&&html.includes('teacher-ux-panel')&&html.includes('student-reflection-panel'));
assert(wb.includes("setAttribute('role','dialog')")&&wb.includes("setAttribute('aria-modal','true')"));
assert(wb.includes('document.addEventListener(\'keydown\',keys)'));
assert(style.includes('position:fixed')&&style.includes('scrollbar-gutter:stable'));
assert(ts.includes('teacher-outline-item')&&ts.includes('teacher-editor-pane'));
assert(ts.includes('student-reflection-panel')&&ts.includes('student-reflection-toggle'));
assert(html.includes('window.SA.buildId = '));
console.log('PASS UX static contract: unified workbench, non-reflow overlays, keyboard support, teacher and student modes');
