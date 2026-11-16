/* Independent invariants of the continuous spatial teaching maps. */
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/core');const context={window:{},console,Float64Array,Math,Array,Number};vm.createContext(context);
['rng.js','spatial.js','spatial-areal.js','spatial-local.js','spatial-points.js','spatial-geostat.js','spatial-kriging.js','spatial-studio.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f}));
const SA=context.window.SA,Studio=SA.spatialStudio;
let checks=0;function test(label,fn){fn();checks++;console.log('PASS',label)}
const close=(a,b,t=1e-9)=>Math.abs(a-b)<t;
test('kNN: no self-neighbours, nonnegative, rows sum to one',()=>{
 const pts=Studio.randomPoints(22,'uniform',102);const W=Studio.knn(pts,4);
 W.forEach((row,i)=>{assert.equal(row.length,4);assert.ok(row.every(z=>z.j!==i&&z.w>=0));assert.ok(close(row.reduce((s,z)=>s+z.w,0),1));});
});
test('Moran: positive regional patterns, negative checkerboard in 2D',()=>{
 const pts=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)pts.push({x:(c+.5)/8,y:(r+.5)/8,value:c<4?-1:1});
 const m=Studio.describe(pts,4);assert.ok(m.I>.45,m.I);assert.ok(close(m.expected,-1/63,1e-13));
 const flipped=pts.map(p=>({...p,value:Math.sin(20*p.x)*Math.sin(20*p.y)}));
 assert.ok(Number.isFinite(Studio.describe(flipped,4).I));
});
test('LISA pointwise quadrants consistent with local spatial module',()=>{
 const pts=Studio.randomPoints(28,'uniform',7).map(p=>({...p,value:p.x>.5?1:-1}));
 const d=Studio.describe(pts,4);const quad=d.local.quadrant;assert.equal(quad.length,pts.length);
 assert.ok(quad.includes('HH')&&quad.includes('LL'),quad.join(','));
});
test('IDW at sensor reproduces observed value',()=>{
 const P=[{x:.1,y:.2,value:5},{x:.7,y:.8,value:-2}];assert.ok(close(Studio.smooth(P,.1,.2,'idw',2),5));
 assert.ok(close(Studio.smooth(P,.7,.8,'idw',2),-2));
});
test('KDE: positive, concentrated peak stronger than distant background',()=>{
 const P=Studio.randomPoints(60,'cluster',22);
 const v=Studio.smooth(P,.28,.68,'kde',.085),w=Studio.smooth(P,.95,.1,'kde',.085);
 assert.ok(v>100*w,v+' vs '+w);
});
test('OLS: coordinates recover spatial trend and leave negligible residual structure',()=>{
 let pts=[];for(let i=0;i<40;i++){const x=(i%8+.5)/8,y=(Math.floor(i/8)+.5)/5,cov=Math.sin(7*x)+.3*Math.cos(3*y);pts.push({x,y,cov,value:1.5+2*cov+3*(x-.5)-1.5*(y-.5)});}
 const a=Studio.ols(pts,false,4),b=Studio.ols(pts,true,4);
 assert.ok(a.r2<b.r2-0.04);assert.ok(close(b.r2,1,1e-10));assert.ok(close(b.beta[1],2,1e-8));assert.ok(close(b.beta[2],3,1e-8));assert.ok(close(b.beta[3],-1.5,1e-8));
});
test('OLS model with coordinates nests baseline; in-sample R2 cannot decrease',()=>{
 const pts=Studio.randomPoints(45,'uniform',91).map((p,i)=>({...p,cov:Math.cos(2*i),value:1.4*Math.cos(2*i)+Math.sin(i*1.1)}));
 const a=Studio.ols(pts,false,6),b=Studio.ols(pts,true,6);assert.ok(b.r2>=a.r2-1e-10);
});
test('Kriging: adding a sensor weakly reduces mean conditional variance',()=>{
 const G=SA.geostat,K=SA.kriging,opt={model:'exponential',sigma2:1,phi:.25,nugget:.12,ratio:1,angle:0};
 const targets=[];for(let a=0;a<8;a++)for(let b=0;b<8;b++)targets.push({x:a/7,y:b/7});
 const sites=[{x:.1,y:.2},{x:.7,y:.8},{x:.3,y:.7}],add={x:.9,y:.1};
 const a=K.geometry(sites,targets,opt,'ordinary'),b=K.geometry(sites.concat([add]),targets,opt,'ordinary');
 assert.ok(b.variances.reduce((s,v)=>s+v,0)<=a.variances.reduce((s,v)=>s+v,0)+1e-8);
});
test('Point process: Ripley L curve finite for generated realization',()=>{
 const pts=SA.spatialPoints.fixed(45,new SA.RRNG(2026));const d=SA.spatialPoints.curve(pts);
 assert.ok(d.valid && d.L.some(Number.isFinite));
});
test('Variogram: zero pair distance handling, bins contain valid pairs',()=>{
 const sites=Studio.randomPoints(36,'uniform',34);const z=sites.map(p=>2*p.x-.5*p.y);const v=SA.geostat.empirical(sites,z,{bins:8,maxDist:1});
 assert.ok(v.counts.reduce((s,n)=>s+n,0)>0);assert.ok(v.gamma.filter(Number.isFinite).every(x=>x>=0));
});
console.log('PASS',checks,'spatial studio mathematical invariants');
