/* Node: node tests/test_spatial_points.js — controlli Lab 28 */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');let checks=0;
const ctx={window:{},console,Math,Uint32Array,Float64Array,Number,Array};vm.createContext(ctx);
for(const p of ['src/core/rng.js','src/core/spatial-points.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',p),'utf8'),ctx,{filename:p});
const SA=ctx.window.SA,PP=SA.spatialPoints;
function ok(a,b){assert.ok(a,b);checks++;}
function near(a,b,tol=1e-9){ok(Math.abs(a-b)<=tol,`${a} != ${b} tol ${tol}`);}
function opt(type,seed=2026){return {type,lambda:100,sigma:.055,kappa:8,radius:.06,gradient:.85,seed};}
let rng=new SA.RRNG(2026);
for(const m of [0,1,2,10,60,130,250]){
 const n=PP.poisson(m,rng);ok(Number.isInteger(n)&&n>=0&&n<500,'Poisson valido, m='+m);
}
const a=PP.fixed(30,new SA.RRNG(7)), b=PP.fixed(30,new SA.RRNG(7));
near(JSON.stringify(a)===JSON.stringify(b)?1:0,1);
ok(a.every(p=>p.x>0&&p.x<1&&p.y>0&&p.y<1),'Uniformi nel quadrato');
let c=PP.curve([{x:.25,y:.25},{x:.35,y:.25}],[.05,.1,.15]);
ok(c.valid&&c.K.length===3,'K con n=2');near(c.K[0],0);near(c.K[1],1/.9,1e-12);near(c.K[2],1/.9,1e-12);
near(c.L[2],Math.sqrt((1/.9)/Math.PI)-.15);
ok(Number.isFinite(c.T),'T finito');
ok(!PP.curve([]).valid && !PP.curve([{x:.2,y:.2}]).valid,'n<2 non definito');
const cases={};
for(const type of ['csr','thomas','inhibition','inhomogeneous']){
 const o=opt(type);const d=PP.generate(o,new SA.RRNG(2026));cases[type]=d;
 ok(d.points.length>3&&d.points.length<500,'N ragionevole per '+type);
 ok(d.points.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1),'Punti nel dominio '+type);
 near(JSON.stringify(d.points)===JSON.stringify(PP.generate(o,new SA.RRNG(2026)).points)?1:0,1);
 const q=PP.quadrats(d.points,4),n=PP.nearest(d.points),curve=PP.curve(d.points);
 near(q.counts.reduce((a,b)=>a+b,0),d.points.length);
 ok(Number.isFinite(q.dispersion)&&q.dispersion>=0,'dispersion '+type);
 ok(n.distances.length===d.points.length&&Number.isFinite(n.mean),'NN '+type);
 ok(curve.K.every((v,i)=>i===0||v>=curve.K[i-1]-1e-12),'monotonic K '+type);
 ok(curve.L.every((v,i)=>Math.abs(v-(Math.sqrt(curve.K[i]/Math.PI)-curve.r[i]))<1e-12),'L compatibile '+type);
 ok(curve.T===Math.max(...curve.L.map(Math.abs)),'T max '+type);
 if(type==='inhibition'){
   const dmin=Math.min(...d.points.slice(1).flatMap((a,i)=>d.points.slice(0,i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y))));
   ok(dmin>=.06-1e-10,'minimum hard core');
   ok(d.points.length<=o.lambda,'N non supera il target repulsivo');
 }
}
let curves=[];let fixedRng=new SA.RRNG(521);
for(let i=0;i<25;i++)curves.push(PP.curve(PP.fixed(100,fixedRng)));
const e=PP.envelope(curves,PP.radii());
ok(e.lo.length===20&&e.hi.length===20&&e.mean.length===20,'Envelopes 20 raggi');
ok(e.lo.every((v,i)=>v<=e.mean[i]&&e.mean[i]<=e.hi[i]),'quantili ordinati');
near(PP.globalP({T:0},curves),1);ok(Number.isNaN(PP.globalP({T:Infinity},curves)),"T non finita -> p non definito"); // il p non e definito per T non finita
const observed=PP.curve(PP.fixed(100,new SA.RRNG(91)));
let pval=PP.globalP(observed,curves);ok(pval>=1/26&&pval<=1,'p MC range');
let q4=PP.quadrats([{x:0.1,y:0.1},{x:.9,y:.9},{x:.5,y:.5},{x:.1,y:.9}],4);near(q4.counts.reduce((a,b)=>a+b,0),4);
// Più repliche: media di N ~ lambda; Poisson non omogeneo aumenta E[X].
let nnCsr=0,nnInhom=0,sumXInhom=0,total=0;
for(let z=1;z<=160;z++){
 let x=PP.generate(opt('csr',z),new SA.RRNG(z));nnCsr+=x.points.length;
 let y=PP.generate(opt('inhomogeneous',z),new SA.RRNG(z));nnInhom+=y.points.length;
 for(const pt of y.points){sumXInhom+=pt.x;total++;}
}
ok(Math.abs(nnCsr/160-100)<5,'E[N] Poisson sim');
ok(Math.abs(nnInhom/160-100)<5,'E[N] non omogeneo sim');
ok(Math.abs(sumXInhom/total-(.5+.85/6))<.025,'E[X] per gradiente');
for(const bad of [{type:'unknown',lambda:100},{type:'csr',lambda:-1}]){
 let threw=false;try{PP.generate(bad,new SA.RRNG(1));}catch(e){threw=true;}ok(threw,'rifiuta configurazione invalida');
}
console.log(`PASSATI ${checks} controlli: processo puntuale, correzione bordo, repulsione, statistiche, envelope, RNG`);
