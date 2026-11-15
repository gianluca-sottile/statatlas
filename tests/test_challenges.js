/* Challenges: deterministic, pure evaluations; no browser or external service. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').join(__dirname,'../src/core/challenges.js');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(root,'utf8'),ctx);
const C=ctx.window.SA.challenges;
assert.deepEqual(Object.keys(C.bank).sort(),['intervalli','kriging','validazione']);
let cases=0;
const fixtures={
 intervalli:[
  {s:{method:'t',n:20,level:.95,k:110,p:.1},good:1},
  {s:{method:'wald',n:10,level:.95,k:110,p:.1},good:0},
  {s:{method:'wilson',n:10,level:.95,k:110,p:.1},good:2}
 ],
 validazione:[
  {s:{fun:'sin',n:60,dShow:9,k:10},good:1},
  {s:{fun:'cubic',n:60,dShow:3,k:25},good:1},
  {s:{fun:'bump',n:30,dShow:7,k:15},good:1}
 ],
 kriging:[
  {s:{method:'ordinary',nSensor:13,sensorKey:'a,b,c',fieldKey:'fixed',reps:0,meanVar:.5,phi:.25,assumedPhi:.25,assumedModel:'exponential'},b:{nSensor:12,sensorKey:'a,b',fieldKey:'fixed',meanVar:.6,assumedPhi:.25,assumedModel:'exponential'},good:0},
  {s:{method:'idw',nSensor:12,sensorKey:'a,b,c',fieldKey:'fixed',reps:0},b:{nSensor:12,sensorKey:'a,b',fieldKey:'fixed'},good:1},
  {s:{method:'ordinary',nSensor:12,reps:5,phi:.25,assumedPhi:.5},good:1}
 ]
};
for(const id of Object.keys(fixtures)){
 const tasks=C.bank[id];assert.equal(tasks.length,3);
 fixtures[id].forEach((f,i)=>{
  const q=tasks[i],r=C.evaluate(id,q.id,f.s,f.b||{},f.good);
  assert.equal(r.ok,true,`${id}/${q.id}: ${r.message}`);cases++;
  assert.equal(C.evaluate(id,q.id,f.s,f.b||{},(f.good+1)%3).ok,false);cases++;
  const invalid={...f.s};
  if(id==='intervalli') invalid.k=0;
  if(id==='validazione') invalid.k=0;
  if(id==='kriging') invalid.method='simple';
  assert.equal(C.evaluate(id,q.id,invalid,f.b||{},f.good).ready,false);cases++;
 });
}
assert.equal(C.evaluate('intervalli','ci-t',fixtures.intervalli[0].s,{},null).ok,false);cases++;
console.log('Challenges: '+cases+' assertions; 3 labs x 3 tasks, success/error/preconditions.');
