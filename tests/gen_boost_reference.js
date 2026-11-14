/* Produce lo script R autonomo e le verifiche numeriche del Lab 21
 * senza dipendenze browser. Utilizza le funzioni del laboratorio stesso,
 * con una temporanea esportazione nel contesto VM (non modifica i sorgenti). */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT=path.join(__dirname,'..');
const C={window:{}};C.window.window=C.window;
for(const f of ['src/core/rng.js','src/core/boost.js'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,f),'utf8'),C.window,{filename:f});
C.window.SA.registerLab=function(){};
let lab=fs.readFileSync(path.join(ROOT,'src/labs/21-gradient-boosting.js'),'utf8');
const marker="  SA.registerLab('boost', {";
if(!lab.includes(marker))throw Error('Marker del laboratorio boost non trovato');
lab=lab.replace(marker,"  SA.__boostFixture = function(scenario) { S = newState(scenario ? {sc: scenario} : null); while (step()) {} return {code:codeR(), hist:S.hist, base:S.base, k:S.k, ok:S.ok}; };\n"+marker);
vm.runInNewContext(lab,C.window,{filename:'21-gradient-boosting.js'});
const f=C.window.SA.__boostFixture;
const scenarios=['sine','step','binary'];
function fmt(n){return Number(n).toPrecision(17);}
const mkCheck=(sc,a)=>{
 const last=a.hist.at(-1), first=a.hist[0], b=a.hist.reduce((idx,v,i)=>v.va<a.hist[idx].va?i:idx,0), best=a.hist[b];
 return `# R2: confronto dei risultati del browser sullo stesso scenario di riferimento\n`+
 `atteso_F0 <- ${fmt(a.base)}\n`+
 `atteso_iniziale <- c(${[first.tr,first.va,first.te].map(fmt).join(', ')})\n`+
 `atteso_ultimo <- c(${[last.tr,last.va,last.te].map(fmt).join(', ')})\n`+
 `atteso_best <- ${b}L; atteso_loss_best <- c(${[best.va,best.te].map(fmt).join(', ')})\n`+
 `tolleranza <- 1e-6\n`+
 `stopifnot(abs(F0 - atteso_F0) < tolleranza)\n`+
 `stopifnot(max(abs(as.numeric(hist[1, 2:4]) - atteso_iniziale)) < tolleranza)\n`+
 `stopifnot(max(abs(as.numeric(tail(hist[, 2:4], 1)) - atteso_ultimo)) < tolleranza)\n`+
 `stopifnot(best == atteso_best)\n`+
 `stopifnot(max(abs(c(hist$validazione[best+1L], hist$test[best+1L]) - atteso_loss_best)) < tolleranza)\n`+
 `cat('OK: scenario ${sc} — baseline, perdite, selezione e test indipendente corrispondono al motore JS.\\n')\n`;
};
const dest=path.join(ROOT,'verifica','verifica_gradient_boosting.R');
const contents=scenarios.map(sc=>{const a=f(sc);if(!a.ok)throw Error('invariante alberi fallito: '+sc);return '# ───────────────────── Scenario '+sc+' ─────────────────────\nlocal({\n'+a.code+'\n'+mkCheck(sc,a)+'\n})\n';});
fs.writeFileSync(dest,'# StatAtlas · LAB 21 — verifica autonoma JS ↔ R (generata da tests/gen_boost_reference.js)\n# Avvio: Rscript verifica/verifica_gradient_boosting.R\n# Nessuna dipendenza aggiuntiva. I tre scenari hanno dati e seed deterministici.\n'+contents.join('\n'));
fs.writeFileSync(path.join(ROOT,'verifica','boost_riferimento_js.json'),JSON.stringify(Object.fromEntries(scenarios.map(sc=>{const a=f(sc);return [sc,{base:a.base,first:a.hist[0],last:a.hist.at(-1),best:a.hist.reduce((i,v,j)=>v.va<a.hist[i].va?j:i,0)}];})),null,2)+'\n');
console.log('Generato verifica/verifica_gradient_boosting.R; scenari',scenarios.join(', '));
