/* Regression guards for corrected formal-theory assumptions and equations. */
'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const root = path.resolve(__dirname, '..');
const c = {window: {}};
for (const f of ['src/core/pedagogy.js','src/core/pedagogy-formulas.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, f),'utf8'), c, {filename:f});
}
const ped = c.window.SA.pedagogy;
assert.strictEqual(Object.keys(ped).length,31);
assert(ped.bivariata.formula.includes('\\sigma_Y^2'), 'missing conditional variance scale');
assert(ped['lgn-tcl'].formula.includes('\\xrightarrow{d}'), 'CLT arrow must be in distribution');
assert(ped.arma.formula.includes('AR(1)'), 'ARMA formula applies to AR(1) only');
assert(ped.penalizzata.formula.includes('\\tfrac{1}{2n}'), 'elastic net scale missing');
assert(ped.validazione.formula.includes('n_k R_k'), 'CV must be weighted by fold sizes');
assert(ped.penalizzata.formulaNote.includes('non penalizzata'), 'intercept convention absent');
assert(ped.kriging.formulaNote.includes('simple kriging'), 'simple/ordinary kriging must be distinguished');
assert(ped['processi-puntuali'].formulaNote.includes('Poisson omogeneo'), 'Poisson CSR assumption absent');
assert(ped.variogrammi.formulaNote.includes('stazionario'), 'stationarity condition absent');
const audit = fs.readFileSync(path.join(root,'docs/AUDIT_FORMALE_TEORICO_31.md'),'utf8');
const n = [...audit.matchAll(/^### \d\d /gm)].length;
assert.strictEqual(n,31,'formal audit must contain 31 lab sections');
const math = {SA:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/core/math.js'),'utf8'),math);
assert(math.SA.math.tex(ped['lgn-tcl'].formula).includes('m-xarrow'),'renderer fails CLT arrow');
console.log('PASS: 31 theoretical audit sections and 11 scientific-equation guards');
