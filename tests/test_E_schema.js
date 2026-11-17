'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ids='distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher intervalli test regressione regressione-lp glm arma quantilica penalizzata spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'.split(' ');
const S={buildId:'a'.repeat(64),i18n:{isEnglish:()=>false},catalog:[{labs:ids.map((id,i)=>({id,num:String(i+1).padStart(2,'0'),title:id}))}],
  challenges:{bank:Object.fromEntries(ids.map(id=>[id,[1,2,3].map(i=>({id:'task-'+i,title:'Test '+i}))]))},
  experiments:{validate(v){if(!v||v.engine!==S.buildId)throw Error('Bad preset')}}};
S.findLab=id=>ids.includes(id)?{lab:{id,title:id}}:null;
let ctx={window:{SA:S},console,Date,Math,Set,JSON};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/core/teachers.js','utf8'),ctx);
const make=(lab)=>({id:'s-'+lab,lab,title:lab,instructions:'',minutes:20,challengeIds:['task-1','task-2'],preset:null});
const base={format:S.teachers.FORMAT,version:S.teachers.VERSION,engine:S.buildId,id:'teacher-test',language:'it',title:'Our teaching sequence',description:'',audience:'',steps:[make('distribuzioni'),make('regressione')]};
assert.ok(S.teachers.validate(base));
for(const mod of [p=>p.engine='other',p=>p.version=99,p=>p.steps.push({...p.steps[0]}),p=>p.steps[1].lab='unknown',
  p=>p.steps[0].challengeIds.push('incorrect'),p=>p.steps[0].minutes=0,p=>p.steps[0].instructions='x'.repeat(2401),
  p=>p.steps[0].preset={engine:'forged'}]){
  const p=JSON.parse(JSON.stringify(base));mod(p);assert.throws(()=>S.teachers.validate(p));
}
assert.equal(S.teachers.parse(JSON.stringify(base)).steps.length,2);
assert.throws(()=>S.teachers.parse('{bad'));
assert.throws(()=>S.teachers.parse('x'.repeat(260001)));
console.log('PASS E teacher project schema, allowed Challenge IDs, engine/preset integrity and hostile imports');
