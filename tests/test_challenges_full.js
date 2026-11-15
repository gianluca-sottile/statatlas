/* Challenges full coverage · 31 labs x 3: independent rules and feedback. */
'use strict';
const assert = require('assert');
const fs=require('fs'), vm=require('vm'), path=require('path');
const dir=path.resolve(__dirname,'../src/core');
const ctx={window:{},document:{}};vm.createContext(ctx);
for(const name of ['pedagogy.js','challenges.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx,{filename:name});
ctx.window.SA.ui={runner: o=>({o})};
vm.runInContext(fs.readFileSync(path.join(dir,'challenges-curriculum.js'),'utf8'),ctx,{filename:'challenges-curriculum.js'});
const bank=ctx.window.SA.challenges.bank, C=ctx.window.SA.challenges;
const all=Object.keys(bank); assert.equal(all.length,31,'Every lesson needs three questions');
const pilots=new Set(['intervalli','validazione','kriging']);
let checks=0;
for(const id of all){
 const Q=bank[id];assert.equal(Q.length,3,id);checks++;
 assert.deepEqual([...Q.map(t=>t.level)],['Comprensione','Applicazione','Avanzato']);checks++;
 for(const q of Q){
  assert.equal(q.options.length,3);assert(new Set(q.options).size===3);checks+=2;
  assert(q.task.length>80 && q.explanation.length>65,q.id);checks++;
  assert(Number.isInteger(q.correct) && q.correct>=0 && q.correct<3,q.id);checks++;
  assert(typeof q.rule==='function',q.id);checks++;
  if(pilots.has(id))continue;
  let b={actions:0,changes:0}, s={actions:10,changes:3};
  assert.equal(C.evaluate(id,q.id,s,b,q.correct).ok,true,'Accept appropriate actions '+q.id);checks++;
  assert.equal(C.evaluate(id,q.id,s,b,(q.correct+1)%3).ok,false,'Reject wrong reply '+q.id);checks++;
  assert.equal(C.evaluate(id,q.id,{actions:0,changes:0},b,q.correct).ready,false,'Reject unperformed experiment '+q.id);checks++;
 }
}
console.log('OK: '+all.length+' labs, '+all.length*3+' tasks; '+checks+' assertions.');
