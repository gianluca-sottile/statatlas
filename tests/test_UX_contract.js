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
for (const key of ['guide','challenges','course','code','share'])
  assert(wb.includes(`pane('${key}')`) || wb.includes(`pane('${key}')`), `Missing pane ${key}`);
assert(!wb.includes("action(t('Simula'"), 'The navigation bar must not duplicate the simulation Start button');
assert(wb.includes('studyGroup.appendChild(challengeButton)') && wb.includes('rGroup.appendChild')===false);
assert(wb.includes("open('challenges',challengeButton)") && wb.includes("open('code',e.currentTarget)"));
assert(style.includes('.ux-action-group') && style.includes('.ux-study-group') && style.includes('.ux-r-group'));
assert(ts.includes("SA.workbench.open('challenges',jump)"));
assert(style.includes('position:fixed')&&style.includes('scrollbar-gutter:stable'));
assert(ts.includes('teacher-outline-item')&&ts.includes('teacher-editor-pane'));
assert(ts.includes('student-reflection-panel')&&ts.includes('student-reflection-toggle'));
const mt=read('src/core/mobile-transport.js'), mtcss=read('src/styles/mobile-transport.css');
assert(build.includes('mobile-transport.js')&&build.includes('mobile-transport.css'));
assert(html.includes('SA.mobileTransport.mount(page,id)')&&html.includes('SA.mobileTransport.teardown()'));
assert(mt.includes('target.click()') && mt.includes('lastMode') && mt.includes('MutationObserver'));
assert(mtcss.includes('safe-area-inset-bottom')&&mtcss.includes('max-width:640px'));
assert(html.includes('window.SA.buildId = '));
console.log('PASS UX static contract: unified workbench, non-reflow overlays, keyboard support, teacher and student modes');
