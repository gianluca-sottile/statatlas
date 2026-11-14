/* LAB 31: controlli numerici, forme ridotte, stima ML, impatti e CV senza leakage. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const ctx={window:{},console,Float64Array,Uint32Array,Number,Math,Array};vm.createContext(ctx);
for(const f of ['rng.js','linalg.js','spatial.js','spatial-regression.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/core',f),'utf8'),ctx,{filename:f});
const M=ctx.window.SA.spatialRegression,S=ctx.window.SA.spatial;let checks=0;
function ok(x,msg){assert.ok(x,msg);checks++;}function close(x,y,tol=1e-8){ok(Math.abs(x-y)<tol,`${x} not ${y}`);}
for(const type of ['sar','sem','independent'])for(const r of [-.6,0,.6]){
 const d=M.dataset(6,6,type,r,2026),n=d.y.length;ok(n===36,'sample size');
 const d2=M.dataset(6,6,type,r,2026);for(let i=0;i<n;i++)close(d.y[i],d2.y[i],1e-13);
 for(let i=0;i<n;i++)close(d.W[i].reduce((s,e)=>s+e.w,0),1,1e-12);
 const fit=M.profiles(d.W,d.X,d.y);for(const kind of ['ols','sar','sem']){
  const a=fit[kind];ok(a.beta.length===2&&a.beta.every(Number.isFinite),'coefficients');ok(Number.isFinite(a.logLik)&&a.sigma2>0,'loglik');ok(a.innovation.length===n,'innovations');
  if(kind!=='ols'){ok(a.trace.length===33,'profile grid');ok(a.trace.every(x=>Number.isFinite(x.ll)),'profile finite');close(a.logLik,Math.max(...a.trace.map(x=>x.ll)),1e-9);}
 }
 const ols=M.ols(d.X,d.y);close(ols.beta[0],fit.ols.beta[0],1e-8);close(ols.beta[1],fit.ols.beta[1],1e-8);
 const cv=M.cv(d.xy,6,d.y,M.foldsRandom(n,3,new ctx.window.SA.RRNG(303)),M.foldsSpatial(d.xy,6,3),3);
 ok(Number.isFinite(cv.random)&&Number.isFinite(cv.spatial),'cv finite');ok(cv.random>=0&&cv.spatial>=0,'mse nonnegative');
}
const d=M.dataset(6,6,'sar',.5,2026);const Z=d.W.map(x=>x.length);ok(Z.every(x=>x>=2&&x<=4),'rook grid');
const I=d.W.map(()=>0),b=d.X.map(row=>.35+1.15*row[1]);
for(const rho of [-.7,-.5,0,.5,.7]){
 const iy=M.inverseSpatial(d.W,b,rho);const b2=M.transform(d.W,iy,rho);for(let j=0;j<36;j++)close(b2[j],b[j],1e-10);
 const impact=M.impacts(d.W,rho,1.15);close(impact.total,1.15/(1-rho),2e-8);close(impact.indirect+impact.direct,impact.total,1e-10);
 if(rho===0){close(impact.direct,1.15,1e-12);close(impact.indirect,0,1e-12);}
 close(M.logDet(d.W,0),0,1e-12);
}
const ols=M.fitAt(d.W,d.X,d.y,'ols',0,0),sar0=M.fitAt(d.W,d.X,d.y,'sar',0,0),sem0=M.fitAt(d.W,d.X,d.y,'sem',0,0);
close(ols.logLik,sar0.logLik,1e-9);close(ols.logLik,sem0.logLik,1e-9);
for(let k=0;k<2;k++){close(ols.beta[k],sar0.beta[k]);close(ols.beta[k],sem0.beta[k]);}
const foldRandom=M.foldsRandom(36,3,new ctx.window.SA.RRNG(44)),foldSpatial=M.foldsSpatial(d.xy,6,3);
for(const fs of [foldRandom,foldSpatial])for(let i=0;i<3;i++)ok(fs.filter(x=>x===i).length===12,'balanced folds');
for(const k of [1,3,5]){
 const cv=M.cv(d.xy,6,d.y,foldRandom,foldSpatial,k);ok(cv.random>0&&cv.spatial>0,'cv positive');
 const shifted=d.y.map(y=>y+100);const c2=M.cv(d.xy,6,shifted,foldRandom,foldSpatial,k);close(cv.random,c2.random,1e-8);close(cv.spatial,c2.spatial,1e-8);
}
// OLS no spatial reliance: if y exactly in span(X), profile at rho=0 RSS≈0.
const exact=d.X.map(row=>2+3*row[1]);const exactFit=M.ols(d.X,exact);close(exactFit.rss,0,1e-10);
try{M.inverseSpatial(d.W,b,1);assert.fail('rho=1 accepted');}catch(e){ok(/rho/.test(e.message),'rho domain');}
console.log('PASSATI '+checks+' controlli LAB 31 SAR/SEM/CV, 0 fallimenti');
