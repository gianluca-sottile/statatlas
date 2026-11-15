/* Scientificly targeted challenge gating, independent of the browser. */
'use strict';
const assert=require('assert');
const fs=require('fs'),vm=require('vm'),path=require('path');
const dir=path.resolve(__dirname,'../src/core');
const ctx={window:{},document:{}};vm.createContext(ctx);
for(const name of ['pedagogy.js','challenges.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx,{filename:name});
ctx.window.SA.ui={runner:o=>({o})};
vm.runInContext(fs.readFileSync(path.join(dir,'challenges-curriculum.js'),'utf8'),ctx,{filename:'challenges-curriculum.js'});
const C=ctx.window.SA.challenges, bank=C.bank;
const ids=Object.keys(bank), pilots=new Set(['intervalli','validazione','kriging']);
assert.equal(ids.length,31);
let checks=0;
for (const id of ids) {
  const cards=bank[id];assert.equal(cards.length,3);checks++;
  assert.deepEqual(Array.from(cards,t=>t.level),['Comprensione','Applicazione','Avanzato']);checks++;
  cards.forEach((q,i)=>{
    assert.equal(q.options.length,3);checks++;
    assert.equal(new Set(q.options).size,3);checks++;
    assert(q.task.length>75 && q.explanation.length>60,q.id);checks++;
    assert(Number.isInteger(q.correct) && q.correct>=0 && q.correct<3);checks++;
    if(pilots.has(id))return;
    assert.equal(q.stage,i);checks++;
    if(i>0)assert(q.focus && q.focus.length>=1);checks++;
    const key=C.keyOf(q.focus||'test'), controls={[key]:'old', ...(id==='penalizzata'?{vista:'Percorsi'}:{})};
    const b={actions:0,changes:0,edits:[],samples:[],controls};
    const mkSamples=(values)=>values.map((v,j)=>({seq:j+1,values:{[key]:v}}));
    let s={actions:0,changes:0,edits:[],samples:[],controls};
    assert.equal(C.evaluate(id,q.id,s,b,q.correct).ready,false);checks++;
    if(i===0){
      s={...s,actions:1,samples:mkSamples(['old'])};
    }else if(i===1){
      s={actions:2,changes:1,edits:[{key,from:'old',to:'new'}],controls:{...controls,[key]:'new'},samples:mkSamples(['new','new'])};
      const falseEdit={...s,edits:[{key:'unrelated',from:'old',to:'new'}]};
      assert.equal(C.evaluate(id,q.id,falseEdit,b,q.correct).ready,false,'wrong parameter '+q.id);checks++;
      const noSim={...s,samples:mkSamples(['old','old'])};
      assert.equal(C.evaluate(id,q.id,noSim,b,q.correct).ready,false,'wrong configuration '+q.id);checks++;
    }else {
      s={actions:5,changes:1,edits:[{key,from:'old',to:'new'}],controls:{...controls,[key]:'new'},samples:mkSamples(['old','old','new','new','new'])};
      assert.equal(C.evaluate(id,q.id,{...s,samples:mkSamples(['new','new','new','new','new'])},b,q.correct).ready,false,'two configurations '+q.id);checks++;
    }
    assert.equal(C.evaluate(id,q.id,s,b,q.correct).ok,true,'valid evidence '+q.id);checks++;
    assert.equal(C.evaluate(id,q.id,s,b,(q.correct+1)%3).ok,false,'wrong answer '+q.id);checks++;
    if(i===2){
      const clean=q.rule(s,b);
      assert(clean.ready && clean.quality && clean.quality.includes('controllato'),
        'controlled comparison must be recognized '+q.id);checks++;
      const mixed={...s,samples:s.samples.map(sample=>({
        ...sample,values:{...sample.values,altro_parametro:sample.values[key]==='old'?'uno':'due'}
      }))};
      const warned=q.rule(mixed,b);
      assert(warned.ready && warned.quality && warned.quality.includes('esplorativo'),
        'a confounded comparison needs methodological warning '+q.id);checks++;
    }
  });
}
console.log('OK: '+ids.length+' labs, '+ids.length*3+' challenges, '+checks+' scientific-gate assertions.');
