/* Node: controlli del motore geostatistico del LAB 29, autonomi dalla UI. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ctx={window:{},console,Math,Float64Array,Uint32Array,Number,Array};vm.createContext(ctx);
for(const f of ['core/rng.js','core/spatial-geostat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f),'utf8'),ctx,{filename:f});
const SA=ctx.window.SA,G=SA.geostat;let checks=0;
function ok(a,msg){assert.ok(a,msg);checks++;}
function near(a,b,tol=1e-9){ok(Math.abs(a-b)<=tol,`${a} != ${b} tol=${tol}`);}
const a={x:.1,y:.2},b={x:.5,y:.2},c={x:.1,y:.6};
near(G.distance(a,b,{angle:0,ratio:1}),.4);
near(G.distance(a,c,{angle:0,ratio:.5}),.8);
near(G.distance(a,b,{angle:90,ratio:.5}),.8);
const p={sigma2:1.3,phi:.2,nugget:.1,ratio:1,angle:0,model:'exponential'};
near(G.cov(a,a,p,false),1.3);
near(G.cov(a,a,p,true),1.4);
near(G.cov(a,b,p,false),1.3*Math.exp(-2));
near(G.theoretical(.2,p,'all'),.1+1.3*(1-Math.exp(-1)));
near(G.theoretical(0,p,'all'),0);
near(G.theoretical(.2,Object.assign({},p,{model:'spherical'}),'all'),1.4);
near(G.theoretical(.2,Object.assign({},p,{model:'gaussian'}),'all'),.1+1.3*(1-Math.exp(-1)));
ok(Number.isNaN(G.theoretical(.2,Object.assign({},p,{ratio:.5}),'all')),'direzione omnidirezionale anisotropa senza curva teorica unica');
const cov=G.covariance([a,b,c],p,true),L=G.cholesky(cov);
for(let i=0;i<3;i++)for(let j=0;j<=i;j++){
 let m=0;for(let k=0;k<=j;k++)m+=L[i][k]*L[j][k];near(m,cov[i][j]);
}
const e=G.empirical([{x:0,y:0},{x:.2,y:0}],[1,3],{bins:4,maxDist:.4});
ok(e.counts.join(',')==='0,0,1,0','coppia assegnata al bin 3');near(e.gamma[2],2);ok(Number.isNaN(e.gamma[0]),'bin vuoto non zero');
const h=G.empirical([{x:0,y:0},{x:.2,y:0}],[1,3],{bins:4,maxDist:.4,direction:'horizontal'});
const v=G.empirical([{x:0,y:0},{x:.2,y:0}],[1,3],{bins:4,maxDist:.4,direction:'vertical'});
ok(h.pairs.length===1&&v.pairs.length===0,'filtri direzionali');
const options={seed:2026,n:48,phi:.25,sigma2:1,ratio:1,angle:0,nugget:.12};
for(const model of ['exponential','spherical','gaussian']){
 const x=G.generate(Object.assign({},options,{model})),z=G.generate(Object.assign({},options,{model}));
 ok(JSON.stringify(x.y)===JSON.stringify(z.y),'riproducibile '+model);
 ok(x.field.length===144&&x.sites.length===48&&x.y.length===48,'dimensioni '+model);
 ok(x.sites.every(q=>q.x>0&&q.x<1&&q.y>0&&q.y<1),'siti interni '+model);
 let obs=G.empirical(x.sites,x.y);ok(obs.gamma.length===10&&obs.counts.every(q=>q>=0),'variogramma '+model);
 let rng=new SA.RRNG(9),draw=G.drawObservation(x,rng);ok(draw.length===48&&draw.every(Number.isFinite),'replica '+model);
}
for(const ratio of [1,.6])for(const phi of [.1,.25,.5])for(const model of ['exponential','spherical','gaussian']){
 let x=G.generate({seed:2026,n:72,phi,model,ratio,angle:45,nugget:0,sigma2:1});
 ok(x.y.every(Number.isFinite),`cholesky campo ${model} phi=${phi} ratio=${ratio}`);
 ok(x.jitter>=0&&x.jitter<=1e-8,'regolarizzazione piccola e dichiarata');
}
let r=G.summarize([[1,2,3],[2,3,4],[3,4,5]],3);near(r.mean[0],2);near(r.mean[2],4);ok(r.lo[0]<=r.mean[0]&&r.mean[0]<=r.hi[0],'intervalli MC ordinati');
// Test di calibrazione Monte Carlo indipendente su due siti: covarianze empiriche vicine al bersaglio.
let site=[{x:0,y:0},{x:.2,y:0}],cc=G.covariance(site,p,true),LL=G.cholesky(cc),rng=new SA.RRNG(437),N=1500,ss=[0,0,0];
for(let i=0;i<N;i++){let y=G.sample(LL,rng);ss[0]+=y[0]*y[0];ss[1]+=y[0]*y[1];ss[2]+=y[1]*y[1];}
near(ss[0]/N,cc[0][0],.15);near(ss[1]/N,cc[1][0],.13);near(ss[2]/N,cc[1][1],.15);
console.log('PASSATI '+checks+' controlli geostatistici LAB 29, 0 fallimenti');
