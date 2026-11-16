/* Macrofase B — validazione curricolare offline per i 31 laboratori. */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { window: { addEventListener() {} }, document: { addEventListener() {} }, console };
ctx.window.SA = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/course-bridge.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/app.js'), 'utf8'), ctx);
const sa = ctx.window.SA;
const catalog = sa.catalog.flatMap(p => p.labs);
const entries = sa.courseBridge.map;
assert.strictEqual(catalog.length, 31);
assert.strictEqual(JSON.stringify(Object.keys(entries).sort()), JSON.stringify(catalog.map(x => x.id).sort()));
const kinds = new Set();
let links = 0;
for (const l of catalog) {
  const e = entries[l.id];
  assert(['direct', 'foundation'].includes(e.alignment), l.id);
  kinds.add(e.alignment);
  assert(e.lessons.length === 2, l.id);
  for (const n of e.lessons) {
    const x = sa.courseBridge.lesson(n);
    assert(x && x.url.endsWith('.html') && x.url.startsWith('https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/'), l.id);
    assert((n>=61 ? 'en' : 'it') === x.lang, l.id);
    links++;
  }
  for (const k of ['question', 'experiment', 'check', 'caution']) assert(e[k].length>35,l.id + ': ' + k);
  const ws = sa.courseBridge.worksheet(l.id, {lab:l});
  assert(ws.includes('## Riproducibilità in R') && ws.includes('## Consegna') && ws.includes(l.title),l.id);
  assert.strictEqual(fs.readFileSync(path.join(ROOT,'docs/schede_studenti_B', `${l.num}_${l.id}.md`),'utf8'),ws, l.id+' stale worksheet');
}
assert(kinds.size===2);
assert(entries['reti-neurali'].lessons.includes(62));
assert(['moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']
  .every(id => entries[id].alignment === 'foundation'));
console.log(`PASS: ${catalog.length} lab course bridges, ${links} mapped lesson links, 31 reproducible worksheets`);
