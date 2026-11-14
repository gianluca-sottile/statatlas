/* StatAtlas | LAB 31 — Gaussian SAR/SEM and geographical cross-validation.
 * Small n, dense LU profile likelihood for auditability. No external dependency.
 * Gaussian ML profiles sigma^2=RSS/n (not the unbiased residual variance).
 * SAR: (I-rho W)y=X beta+eps; SEM: y=X beta+(I-lambda W)^(-1)eps.
 */
var SA = window.SA || (window.SA = {});
SA.spatialRegression = (function(){
'use strict';
var sp=SA.spatial,la=SA.la;
function dense(W){var n=W.length,A=Array.from({length:n},(_,i)=>{var row=new Float64Array(n);W[i].forEach(e=>{row[e.j]+=e.w;});return row;});return A;}
function transform(W,v,rho){var lag=sp.lag(W,v);return v.map((a,i)=>a-rho*lag[i]);}
function inverseSpatial(W,v,rho,tol){if(!(Math.abs(rho)<.95))throw new RangeError('|rho| deve essere < 0.95');var a=Array.from(v),n=v.length;for(var t=0;t<350;t++){var w=sp.lag(W,a),err=0,next=v.map((x,i)=>x+rho*w[i]);for(var i=0;i<n;i++)err=Math.max(err,Math.abs(next[i]-a[i]));a=next;if(err<(tol||1e-12))return a;}throw new Error('Convergenza soluzione spaziale non raggiunta');}
function logDet(W,rho){var n=W.length,A=Array.from({length:n},(_,i)=>{var row=new Float64Array(n);row[i]=1;W[i].forEach(e=>{row[e.j]-=rho*e.w;});return row;}),sign=1,out=0;
 for(var k=0;k<n;k++){var pivot=k;for(var i=k+1;i<n;i++)if(Math.abs(A[i][k])>Math.abs(A[pivot][k]))pivot=i;var v=A[pivot][k];if(Math.abs(v)<1e-13)throw new Error('I-rho W singolare');if(pivot!==k){var tmp=A[k];A[k]=A[pivot];A[pivot]=tmp;sign=-sign;}if(v<0)sign=-sign;out+=Math.log(Math.abs(v));for(var j=k+1;j<n;j++){var z=A[j][k]/v;A[j][k]=0;for(var h=k+1;h<n;h++)A[j][h]-=z*A[k][h];}}if(sign<=0)throw new Error('Determinante non positivo nel dominio scelto');return out;}
function ols(X,y){var fit=la.lsq(X,y);if(fit.rank!==X[0].length||!Array.from(fit.beta).every(Number.isFinite))throw new Error('Disegno non di rango pieno');var resid=y.map((v,i)=>v-fit.fitted[i]);return {beta:Array.from(fit.beta),rss:resid.reduce((s,v)=>s+v*v,0),resid:resid,fitted:Array.from(fit.fitted)};}
function fitAt(W,X,y,kind,rho,det){var Ay=transform(W,y,rho),AX=X; if(kind==='sem'){var transformedColumns=Array.from({length:X[0].length},(_,j)=>transform(W,X.map(z=>z[j]),rho));AX=X.map((r,i)=>r.map((v,j)=>transformedColumns[j][i]));} // SEM transforms each X column
 var fit=ols(AX,Ay),sigma2=Math.max(1e-14,fit.rss/y.length),ll=(kind==='ols'?0:(det==null?logDet(W,rho):det))-0.5*y.length*(1+Math.log(2*Math.PI*sigma2));
 var residual=kind==='sem'?y.map((v,i)=>v-X[i].reduce((s,x,j)=>s+x*fit.beta[j],0)):(kind==='sar'?Ay.map((v,i)=>v-X[i].reduce((s,x,j)=>s+x*fit.beta[j],0)):fit.resid);
 return {kind:kind,rho:rho,beta:fit.beta,sigma2:sigma2,logLik:ll,innovation:kind==='sem'?transform(W,residual,rho):residual,residual:residual,spatialLag:sp.lag(W,y)};
}
function profiles(W,X,y,grid){grid=grid||Array.from({length:33},(_,i)=>-0.8+i*.05);var a={ols:fitAt(W,X,y,'ols',0,0)};for(const kind of ['sar','sem']){var trace=[],best=null;for(var i=0;i<grid.length;i++){var rho=grid[i],det=logDet(W,rho),fit=fitAt(W,X,y,kind,rho,det);trace.push({rho:rho,ll:fit.logLik});if(!best||fit.logLik>best.logLik)best=fit;}a[kind]=best;a[kind].trace=trace;}return a;}
function impacts(W,rho,beta){var n=W.length,ones=Array(n).fill(1),total=inverseSpatial(W,ones,rho),tr=0;
 for(var j=0;j<n;j++){var unit=Array(n).fill(0);unit[j]=1;tr+=inverseSpatial(W,unit,rho)[j];}
 var direct=beta*tr/n,overall=beta*total.reduce((s,v)=>s+v,0)/n;return {direct:direct,indirect:overall-direct,total:overall,multiplier:tr/n};}
function dataset(rows,cols,type,rho,seed){rows=rows||6;cols=cols||6;var W=sp.weights(rows,cols,'rook','row'),rng=new SA.RRNG(seed||2026),xy=sp.grid(rows,cols),n=xy.length;
 var x=xy.map(p=>1.25*(p.col/(cols-1)-.5)+.6*rng.norm()),eps=x.map(()=>.55*rng.norm()),X=x.map(v=>[1,v]),linear=x.map(v=>.35+1.15*v);var y;
 if(type==='sar')y=inverseSpatial(W,linear.map((v,i)=>v+eps[i]),rho);
 else if(type==='sem') {var u=inverseSpatial(W,eps,rho);y=linear.map((v,i)=>v+u[i]);}
 else y=linear.map((v,i)=>v+eps[i]);
 return {W:W,xy:xy,x:x,y:y,X:X,eps:eps,rho:type==='independent'?0:rho,type:type,rows:rows,cols:cols,seed:seed};}
function foldsRandom(n,K,rng){var ids=Array.from({length:n},(_,i)=>i);for(var i=n-1;i>0;i--){var j=Math.floor(rng.unif()*(i+1)),tmp=ids[i];ids[i]=ids[j];ids[j]=tmp;}var folds=Array(n);ids.forEach((idx,i)=>{folds[idx]=i%K;});return folds;}
function foldsSpatial(xy,cols,K){return xy.map(p=>Math.min(K-1,Math.floor(K*p.col/cols)));}
function knnPredict(train,test,xy,y,k){return test.map(i=>{var d=train.map(j=>({d:Math.hypot(xy[i].x-xy[j].x,xy[i].y-xy[j].y),j:j})).sort((a,b)=>a.d-b.d||a.j-b.j);var cnt=Math.min(k,d.length),z=0,ww=0;for(var h=0;h<cnt;h++){var w=1/(d[h].d+1e-9);z+=w*y[d[h].j];ww+=w;}return z/ww;});}
function cv(xy,cols,y,randomFolds,spatialFolds,k){function score(folds){var sse=0,n=y.length,unique=Array.from(new Set(folds)).sort();unique.forEach(f=>{var tr=[],te=[];for(var i=0;i<n;i++){(folds[i]===f?te:tr).push(i);}if(tr.length<k||!te.length)throw Error('Fold vuoto o training insufficiente');var p=knnPredict(tr,te,xy,y,k);te.forEach((i,j)=>{var e=y[i]-p[j];sse+=e*e;});});return sse/n;}return {random:score(randomFolds),spatial:score(spatialFolds)};}
return {dense:dense,transform:transform,inverseSpatial:inverseSpatial,logDet:logDet,ols:ols,fitAt:fitAt,profiles:profiles,impacts:impacts,dataset:dataset,foldsRandom:foldsRandom,foldsSpatial:foldsSpatial,knnPredict:knnPredict,cv:cv};
})();
