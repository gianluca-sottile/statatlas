/* Kriging lab 30: deterministic independent numerical tests; no browser required. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ctx={window:{},console,Math,Float64Array,Uint32Array,Number,Array};vm.createContext(ctx);
for(const file of ['rng.js','spatial-geostat.js','spatial-kriging.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core',file),'utf8'),ctx,{filename:file});
const G=ctx.window.SA.geostat,K=ctx.window.SA.kriging;let count=0;
function ok(a,msg){assert.ok(a,msg);count++;}
function near(a,b,tol=1e-9){ok(Math.abs(a-b)<=tol,`${a} != ${b} (tol ${tol})`);}
const a={x:0,y:0},b={x:.6,y:.2},c={x:.2,y:.7},sites=[a,b,c],tar=[a,b,c,{x:.3,y:.4}];
for(const model of ['exponential','spherical','gaussian'])for(const nugget of [0,.12,.4]){
 const o={model,phi:.35,sigma2:1.2,nugget,ratio:1,angle:0};
 const sm=K.geometry(sites,tar,o,'simple'),ord=K.geometry(sites,tar,o,'ordinary'),idw=K.geometry(sites,tar,o,'idw');
 ok(sm.weights.length===4&&ord.weights.length===4&&idw.weights.length===4,'dimensioni');
 for(const d of [sm,ord])for(const v of d.variances)ok(Number.isFinite(v)&&v>=0,'varianza non negativa');
 for(const w of ord.weights)near(Array.from(w).reduce((u,v)=>u+v,0),1,1e-10);
 for(const w of idw.weights)near(Array.from(w).reduce((u,v)=>u+v,0),1,1e-12);
 for(let j=0;j<3;j++){near(K.predict(idw,[4,5,7])[j],[4,5,7][j],1e-12);if(nugget===0){near(sm.variances[j],0,1e-9);near(ord.variances[j],0,1e-9);}}
 if(nugget===0)for(let j=0;j<3;j++)near(K.predict(sm,[4,5,7])[j],[4,5,7][j],1e-9);
}
const one={model:'exponential',sigma2:1,phi:.2,nugget:.25,ratio:1,angle:0};
const solo=K.geometry([{x:0,y:0}],[{x:0,y:0},{x:.2,y:0}],one,'simple');
near(solo.weights[0][0],.8);near(solo.variances[0],.2);
near(solo.weights[1][0],Math.exp(-1)/1.25);
near(solo.variances[1],1-Math.exp(-2)/1.25);
const soloO=K.geometry([{x:0,y:0}],[{x:.2,y:0}],one,'ordinary');
near(soloO.weights[0][0],1);near(soloO.variances[0],2.25-2*Math.exp(-1));
const s3=[a,b,c], tgrid=Array.from({length:16},(_,i)=>({x:(i%4+.5)/4,y:(Math.floor(i/4)+.5)/4}));
for(const method of ['simple','ordinary']){
 const o={model:'exponential',phi:.3,sigma2:1.1,nugget:.12,ratio:1,angle:0};
 const d0=K.geometry(s3,tgrid,o,method),d1=K.geometry([...s3,{x:.2,y:.2}],tgrid,o,method);
 for(let i=0;i<tgrid.length;i++)ok(d1.variances[i]<=d0.variances[i]+1e-9,'aggiunta sensore non aumenta la varianza');
}
for(const bad of [['none',a],[null,a]]){
 try{K.geometry(sites,tar,one,bad[0]);ok(bad[0]===null,'metodo nullo usa default');}catch(e){ok(bad[0]==='none','rifiuta metodo non supportato');}
}
try{K.geometry([a,a],[a],one,'ordinary');assert.fail('duplicati accettati');}catch(e){ok(/stessa posizione/.test(e.message),'duplicati respinti');}
let pred=K.predict(K.geometry(sites,tar,one,'ordinary'),[1,2,3]);ok(pred.length===4&&pred.every(Number.isFinite),'predizioni finite');
near(K.rmse([1,2],[1,4]),Math.sqrt(2));near(K.mae([1,2],[1,4]),1);
// Empirical model calibration of simple kriging with genuine independent fields.
const smallSites=[{x:0,y:0},{x:.2,y:0},{x:0,y:.3}],target=[{x:.12,y:.18}],o={model:'exponential',phi:.25,sigma2:1,nugget:.2,ratio:1,angle:0};
const L=G.cholesky(G.covariance([...smallSites,...target],o,false));
const d=K.geometry(smallSites,target,o,'simple'),rng=new ctx.window.SA.RRNG(2244);
let mse=0,N=1800;
for(let k=0;k<N;k++){const latent=G.sample(L,rng),noisy=Array.from(latent.slice(0,3),x=>x+Math.sqrt(o.nugget)*rng.norm());const e=K.predict(d,noisy)[0]-latent[3];mse+=e*e;}
ok(Math.abs(mse/N-d.variances[0])<.07,'calibrazione Monte Carlo simple kriging');
console.log('PASSATI '+count+' controlli kriging LAB 30, 0 fallimenti');
