/* Structural acceptance after removing the old areal UI; mathematical Moran
 * algorithms and the new unified map are tested independently elsewhere. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const files=['26-moran.js','27-lisa.js','28-processi-puntuali.js','29-variogrammi.js','30-kriging.js','31-regressione-spaziale.js'];
const reg=[];const ctx={SA:{spatialUnified:{register:(id,type)=>reg.push([id,type])}}};
files.forEach(f=>{const src=fs.readFileSync('src/labs/'+f,'utf8');
  assert.ok(src.includes('SA.spatialUnified.register'),f+' non usa il laboratorio unificato');
  assert.ok(!src.includes('SA.ui.runner'),f+' contiene ancora il runner legacy');
  vm.runInNewContext(src,ctx,{filename:f});
});
assert.deepEqual(reg.map(p=>p[0]),['moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']);
assert.equal(new Set(reg.map(p=>p[1])).size,6);
const core=fs.readFileSync('src/core/spatial-unified.js','utf8');
assert.ok(core.includes('updateCurriculum(id)') && core.includes('installMapChallenges(id)'));
console.log('PASS sei laboratori unificati e assenza di UI legacy');
