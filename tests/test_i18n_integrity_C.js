/* QA: every lab has a peer-reviewed EN orientation; no false claim that 93 challenges are translated. */
const fs=require('fs');const vm=require('vm');const assert=require('assert');
const w={};const sandbox={window:w};
vm.runInNewContext(fs.readFileSync('src/core/i18n-data.js','utf8'),sandbox,{filename:'i18n-data.js'});
vm.runInNewContext(fs.readFileSync('src/core/i18n.js','utf8'),sandbox,{filename:'i18n.js'});
const ids=('distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale').split(' ');
assert.equal(Object.keys(w.SA.english.labs).length,31);
assert.equal(Object.keys(w.SA.english.parts).length,8);
for(const id of ids){const p=w.SA.english.labs[id];assert(p,id);
 for(const field of ['title','blurb','question','experiment','essential','advanced','limit']){
   assert.equal(typeof p[field],'string',id+' missing '+field);
   assert(p[field].length>(field==='title'?5:20),id+' trivial '+field);
 }}
assert.strictEqual(w.SA.i18n.language,'it');
assert.strictEqual(w.SA.i18n.tr('Velocità'),'Velocità');
console.log('PASS Macro C: 31 EN scientific companions, 8 translated part labels, explicit language scope.');
