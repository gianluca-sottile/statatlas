/* StatAtlas · Kriging: simple/ordinary predictors of LATENT Z(s), and IDW.
 * Uses covariance of the observations C_Z + tau2 I and cross-covariance C_Z.
 * All algorithms are deterministic on supplied geometry, values and parameters.
 * The Lagrange multiplier uses the convention Cw + nu*1 = c. */
var SA = window.SA || (window.SA = {});
SA.kriging = (function(){
 'use strict';
 var G=SA.geostat;
 function forward(L,b) {var n=b.length,y=new Float64Array(n);for(var i=0;i<n;i++){var s=b[i];for(var j=0;j<i;j++)s-=L[i][j]*y[j];y[i]=s/L[i][i];}return y;}
 function backward(L,b){var n=b.length,x=new Float64Array(n);for(var i=n-1;i>=0;i--){var s=b[i];for(var j=i+1;j<n;j++)s-=L[j][i]*x[j];x[i]=s/L[i][i];}return x;}
 function factor(sites,opt) {
  if(!sites.length)throw new Error('Servono almeno un sensore e coordinate valide.');
  for(var i=0;i<sites.length;i++)for(var j=0;j<i;j++)if(sites[i].x===sites[j].x&&sites[i].y===sites[j].y)throw new Error('Due sensori non possono occupare la stessa posizione.');
  return G.cholesky(G.covariance(sites,opt,true));
 }
 function dot(a,b){var s=0;for(var j=0;j<a.length;j++)s+=a[j]*b[j];return s;}
 function solve(L,b){return backward(L,forward(L,b));}
 function geometry(sites,targets,opt,method,exponent){
  method=method||'ordinary';var o=G.defaults(opt),n=sites.length,weights=[],variances=[],multipliers=[];
  if(!n)throw new Error('Nessun sensore');
  if(method!=='ordinary'&&method!=='simple'&&method!=='idw')throw new Error('Metodo non supportato');
  var L=method==='idw'?null:factor(sites,o);
  var ones=new Float64Array(n).fill(1),b=L?solve(L,ones):null,denom=b?dot(ones,b):0;
  if(L&&method==='ordinary'&&denom<=0)throw new Error('Sistema di kriging ordinario non identificato');
  targets.forEach(function(target){
    var w,nu=0,var0=NaN;
    if(method==='idw'){
      var d=sites.map(function(p){return Math.hypot(p.x-target.x,p.y-target.y);}),at=d.findIndex(function(v){return v<=1e-12;});
      if(at>=0){w=new Float64Array(n);w[at]=1;}
      else {var pow=exponent||2,a=d.map(function(v){return 1/Math.pow(v,pow);}),s=a.reduce(function(u,v){return u+v;},0);w=Float64Array.from(a,function(v){return v/s;});}
    }else{
      var c=Float64Array.from(sites,function(p){return G.cov(p,target,o,false);});
      var a=solve(L,c);w=a;
      if(method==='ordinary') {nu=(dot(ones,a)-1)/denom;w=Float64Array.from(a,function(v,i){return v-nu*b[i];});}
      // Var(Z0 - w'Y) under the fitted covariance; for ordinary kriging the
      // generalized unbiasedness constraint adds -nu under our convention.
      var0=o.sigma2-dot(w,c)-(method==='ordinary'?nu:0);
      if(var0<0&&var0>-1e-8)var0=0;
      if(!Number.isFinite(var0)||var0<0)throw new Error('Varianza di kriging non valida: controllare il condizionamento.');
    }
    weights.push(w);variances.push(var0);multipliers.push(nu);
  });
  return {method:method,weights:weights,variances:variances,multipliers:multipliers,targets:targets,sites:sites,options:o};
 }
 function predict(design,y){
  if(y.length!==design.sites.length)throw new Error('Numero di valori diverso dai sensori');
  return design.weights.map(function(w){return dot(w,y);});
 }
 function rmse(pred,trueY){var s=0;for(var i=0;i<pred.length;i++)s+=(pred[i]-trueY[i])**2;return Math.sqrt(s/pred.length);}
 function mae(pred,trueY){var s=0;for(var i=0;i<pred.length;i++)s+=Math.abs(pred[i]-trueY[i]);return s/pred.length;}
 function meanFinite(a){var v=a.filter(Number.isFinite);return v.length?v.reduce(function(s,x){return s+x;},0)/v.length:NaN;}
 return {factor:factor,solve:solve,geometry:geometry,predict:predict,rmse:rmse,mae:mae,meanFinite:meanFinite};
})();
