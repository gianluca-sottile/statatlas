/* Audit documentale trasversale: completezza per 31 laboratori. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const c={window:{}};
for(const file of ['src/core/content.js','src/core/pedagogy.js','src/core/pedagogy-theory.js','src/core/pedagogy-formulas.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
}
const content=c.window.SA.content, pedagogy=c.window.SA.pedagogy;
const app=fs.readFileSync(path.join(root,'src/core/app.js'),'utf8');
const ids=[...app.matchAll(/\{\s*id:\s*'([^']+)',\s*num:\s*'(\d+)'/g)].map(x=>x[1]);
assert.strictEqual(ids.length,31,'catalogo diverso da 31');
assert.strictEqual(new Set(ids).size,31,'id duplicati');
assert.deepStrictEqual(Object.keys(content).sort(),ids.slice().sort(),'contenuto incompleto');
assert.deepStrictEqual(Object.keys(pedagogy).sort(),ids.slice().sort(),'scheda supplementare incompleta');
let checks=0;
for(let i=0;i<ids.length;i++){
  const id=ids[i],p=pedagogy[id],s=content[id];
  assert(Array.isArray(p.guida) && p.guida.length===4,`guida incompleta ${id}`);checks++;
  assert(p.guida.every(x=>typeof x==='string' && x.length>35),`passaggio ambiguo ${id}`);checks++;
  assert(typeof p.essenziale==='string'&&p.essenziale.length>350,`essenziale breve ${id}`);checks++;
  assert(typeof p.avanzato==='string'&&p.avanzato.length>400,`avanzato breve ${id}`);checks++;
  assert(s.obiettivi.length>=4 && s.valutiamo.length>=4,`obiettivi/valutiamo ${id}`);checks++;
  assert(s.esercizi.length>=3 && s.riferimenti.length>=3,`esercizi/fonti ${id}`);checks++;
  assert(!/<script/i.test(p.essenziale+p.avanzato),`markup non previsto ${id}`);checks++;
  assert(typeof p.formula==='string' && p.formula.length>6,`formula mancante ${id}`);checks++;
  const source=fs.readFileSync(path.join(root,'src/labs',String(i+1).padStart(2,'0')+'-'+(
    fs.readdirSync(path.join(root,'src/labs')).find(x=>x.startsWith(String(i+1).padStart(2,'0')+'-'))||'').slice(3)),'utf8');
  assert(/Esperimento/.test(source),`nessuna sezione Esperimento ${id}`);checks++;
}
const ui=fs.readFileSync(path.join(root,'src/core/ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles/editorial.css'),'utf8');
assert(app.includes('details.lab-howto'),'guida non connessa all app');checks++;
// Independent typographical check for quantile regression check loss.
const mathCtx={SA:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/core/math.js'),'utf8'),mathCtx,{filename:'src/core/math.js'});
assert(pedagogy.quantilica.formula.includes('\\mathbf{1}'), 'indicatrice della check loss ambigua');checks++;
assert(mathCtx.SA.math.tex(pedagogy.quantilica.formula).includes('m-bf'),
  'indicatrice della check loss non composta correttamente');checks++;
assert(ui.includes('d && d.essenziale')&&ui.includes('d && d.avanzato'),'livelli teorici non connessi');checks++;
assert(css.includes('.lab-howto-list')&&css.includes('@media(max-width:760px)'),'layout non responsive');checks++;
console.log('PASS: 31 laboratori, 31 guide, 62 approfondimenti, 31 formule, '+checks+' controlli editoriali');
