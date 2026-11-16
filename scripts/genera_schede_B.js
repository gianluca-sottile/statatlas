/* Generates the 31 student worksheets from the exact same metadata as the UI.
   Run: node scripts/genera_schede_B.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: { addEventListener() {} }, document: { addEventListener() {} } };
ctx.window.SA = {};
vm.createContext(ctx);
for (const name of ['course-bridge.js','app.js']) vm.runInContext(fs.readFileSync(path.join(root,'src/core',name),'utf8'),ctx);
const sa=ctx.window.SA;
const dir=path.join(root,'docs','schede_studenti_B');
fs.mkdirSync(dir,{recursive:true});
for (const l of sa.catalog.flatMap(p=>p.labs)) {
 const name=`${l.num}_${l.id}.md`;
 fs.writeFileSync(path.join(dir,name),sa.courseBridge.worksheet(l.id,{lab:l}), 'utf8');
}
console.log(`GENERATE: ${sa.catalog.flatMap(p=>p.labs).length} worksheets → docs/schede_studenti_B/`);
