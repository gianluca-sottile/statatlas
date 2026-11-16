/* Experimental comparison QA: no pseudo-pairing or false controlled claim. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.resolve(__dirname,'../src/core');
const ctx={window:{},document:{}};vm.createContext(ctx);
['pedagogy.js','challenges.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx));
ctx.window.SA.ui={runner:cfg=>cfg};
vm.runInContext(fs.readFileSync(path.join(dir,'challenges-curriculum.js'),'utf8'),ctx);
const C=ctx.window.SA.challenges;
const key=C.keyOf('Profondità');
const q=C.bank.boost[2];
const baseline={actions:0,edits:[],controls:{[key]:'2','learning rate ν':'0.1',seed:'2026'}};
function rows({keyB='data1',same=true,confound=false,mismatch=false,nA=3,nB=3}={}){
 const out=[];
 for(const [v,n] of [['2',nA],['1',nB]]){
  for(let i=1;i<=n;i++)out.push({seq:out.length+1,
    values:{[key]:v,'learning rate ν':confound&&v==='1'?'0.16':'0.1',seed:'2026'},
    metric:{label:'Loss di validazione del boosting',value:(v==='2'?.9:1)+i*.02,
      design:'paired-trajectory',dataKey:v==='2'?'data1':keyB,iteration:mismatch&&v==='1'?i+20:i}});
 }
 return out;
}
function state(samples){return {actions:samples.length,edits:[{key,from:'2',to:'1'}],controls:{[key]:'1'},samples};}
function assess(o){return q.rule(state(rows(o)),baseline);}
assert(assess().ready,'3+3 equal checkpoints are valid');
assert(assess().comparison.paired && assess().comparison.nPairs===3);
assert.equal(assess().comparison.correct,1);
assert(!assess({nA:2}).ready,'unbalanced A/B rejected');
assert(!assess({confound:true}).ready,'confounded comparison must never pass');
assert(!assess({keyB:'other-data'}).ready,'same checkpoint is insufficient if training data differ');
assert(!assess({mismatch:true}).ready,'same data is insufficient if checkpoints differ');
const desc=C.bank.distribuzioni[2];const fk=C.keyOf(desc.focus);
const generalA={actions:0,edits:[],controls:{[fk]:'normal'}};
const ordinary=Array.from({length:6},(_,i)=>({seq:i+1,values:{[fk]:i<3?'normal':'cauchy'},metric:{label:'Osservazione X',value:i}}));
const r=desc.rule({controls:{[fk]:'cauchy'},edits:[{key:fk,from:'normal',to:'cauchy'}],samples:ordinary,actions:6},generalA);
assert(r.ready,'observational (unpaired) comparison remains possible');
assert.equal(r.comparison.paired,false);
assert(/descrittivo/i.test(r.quality),'must state descriptive limitations');
assert.equal(C.evaluate('boost',q.id,state(rows()),baseline,q.correct,2).ok,false,'wrong empirical answer rejected');
assert.equal(C.evaluate('boost',q.id,state(rows()),baseline,q.correct,1).ok,true,'correct conceptual and empirical answer passes');
console.log('PASS: experimental-design checks: balance, strict controls, exact seed+checkpoint, no pseudo-pairing, numerical interpretation.');
