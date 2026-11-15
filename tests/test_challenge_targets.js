/* Keep experimentally relevant challenge targets tied to their questions. */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.resolve(__dirname,'../src/core');
const ctx={window:{}}; vm.createContext(ctx);
for(const name of ['pedagogy.js','challenges.js']) vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx);
ctx.window.SA.ui={runner:o=>({o})};
vm.runInContext(fs.readFileSync(path.join(dir,'challenges-curriculum.js'),'utf8'),ctx);
const expected={
  'distribuzioni':['Numero di osservazioni','Legge'],
  'simulazione':['Estrazioni N','Legge da generare'],
  'regressione':['Punto x₀','Errori'],
  'knn':['Scala di x₂','k mostrato'],
  'alberi':['Alberi B','mtry'],
  'pca':['Standardizza','Varianza del primo asse'],
  'clustering':['Legame (gerarchico)','Popolazioni'],
  'lisa':['Correzione multipla','Unità di analisi'],
  'variogrammi':['Rapporto anisotropia','Trend lungo x']
};
for(const id of Object.keys(expected)){
  const tasks=ctx.window.SA.challenges.bank[id];
  assert.deepStrictEqual(Array.from(tasks.slice(1),q=>q.focus),expected[id],id);
}
console.log('PASS: nine aligned pairs of application/advanced challenge targets');
