/* Reproducible structural inventory of the 31 scientific content files.
 * This is NOT an automated proof-checker or a peer review of derivations. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const name of ['content.js','pedagogy.js','pedagogy-theory.js','pedagogy-formulas.js','pedagogy-rigorous.js']){
 const file=path.join(ROOT,'src/core',name);
 vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:name});
}
let a=fs.readFileSync(path.join(ROOT,'src/core/app.js'),'utf8');
a=a.slice(0,a.indexOf('SA.labs = {};'));vm.runInContext(a,ctx);
const SA=ctx.window.SA,ids=SA.catalog.flatMap(p=>p.labs.map(l=>({...l,part:p.part})));
const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const escape=s=>'"'+String(s==null?'':s).replaceAll('"','""')+'"';
const rows=[];
for(const item of ids){
 const c=SA.content[item.id],p=SA.pedagogy[item.id];
 if(!c||!p)throw new Error('missing content or guide '+item.id);
 const rec={number:item.num,id:item.id,part:item.part,title:item.title,
  objectives:c.obiettivi.length,exercises:c.esercizi.length,references:c.riferimenti.length,
  essentialWords:strip(p.essenziale).split(' ').length,
  supplementalAdvancedWords:(strip(c.avanzato)+' '+strip(p.avanzato)).split(' ').length,
  mistakes:c.errori.length,formula:Boolean(p.formula),qualification:Boolean(p.formulaNote),guide:p.guida.length};
 if(rec.objectives<3||rec.exercises<3||rec.references<3||rec.guide!==4||!rec.formula)throw new Error('editorial deficiency '+item.id);
 rows.push(rec);
}
if(rows.length!==31)throw new Error('expected 31 laboratories, found '+rows.length);
const fields=Object.keys(rows[0]);
const csv=fields.map(escape).join(',')+'\n'+rows.map(r=>fields.map(k=>escape(r[k])).join(',')).join('\n')+'\n';
fs.mkdirSync(path.join(ROOT,'docs'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'docs/AUDIT_31_MATRICE.csv'),csv);
const summary={labs:rows.length,objectives:rows.reduce((x,r)=>x+r.objectives,0),exercises:rows.reduce((x,r)=>x+r.exercises,0),references:rows.reduce((x,r)=>x+r.references,0),qualifiedEquations:rows.filter(r=>r.qualification).length,chapterMinimumAdvanced:Math.min(...rows.map(r=>r.supplementalAdvancedWords))};
console.log('Scientific structural audit:',summary);
console.log('Matrix written: docs/AUDIT_31_MATRICE.csv');
