/* StatAtlas | core/spatial-points.js — processi puntuali nel quadrato unitario.
 * Coordinate [0,1]^2; Poisson via tempi d'attesa esponenziali;
 * K stimata con correzione translation, area=1 e denominatore n(n-1).
 * Gli envelope CSR condizionano sul numero osservato n di eventi.
 */
var SA = window.SA || (window.SA = {});
SA.spatialPoints = (function () {
  'use strict';
  function ensure(x, lo, hi, name) {
    if (!Number.isFinite(x) || x < lo || x > hi) throw new RangeError(name + ' non valido');
  }
  function poisson(mean, rng) {
    ensure(mean, 0, 3000, 'Intensita Poisson');
    // Gli incrementi di un processo di Poisson unitario sono Exp(1).
    var t = 0, n = 0;
    while (n < 10000) { t -= Math.log(rng.unif()); if (t > mean) return n; n++; }
    throw new RangeError('Numero di eventi troppo elevato');
  }
  function fixed(n, rng) {
    if (!Number.isInteger(n) || n < 0 || n > 2000) throw new RangeError('n non valido');
    var a = [];
    for (var i = 0; i < n; i++) a.push({x:rng.unif(), y:rng.unif()});
    return a;
  }
  function generate(o, rng) {
    var type=o.type, lambda=+o.lambda, sigma=+o.sigma, rho=+o.radius, kappa=+o.kappa, gradient=+o.gradient;
    ensure(lambda, 5, 300, 'Intensita');
    var points=[], parents=[], attempts=0, target=null;
    if (type === 'csr') points=fixed(poisson(lambda,rng),rng);
    else if (type === 'thomas') {
      ensure(sigma,.01,.25,'sigma');ensure(kappa,1,40,'kappa');
      var a=4*sigma, l=1+2*a, nParents=poisson(kappa*l*l,rng);
      for(var i=0;i<nParents;i++) {
        var px=-a+l*rng.unif(),py=-a+l*rng.unif();parents.push({x:px,y:py});
        var children=poisson(lambda/kappa,rng);
        for(var j=0;j<children;j++) {
          var x=px+sigma*rng.norm(),y=py+sigma*rng.norm();
          if(x>=0&&x<=1&&y>=0&&y<=1)points.push({x:x,y:y});
        }
      }
    } else if(type === 'inhibition') {
      ensure(rho,.015,.15,'Raggio inibizione');
      target=Math.round(lambda);var min2=rho*rho,maxAttempts=12000;
      while(points.length<target&&attempts<maxAttempts) {
        attempts++;
        var xx=rng.unif(), yy=rng.unif(), ok=true;
        for(var z=0;z<points.length;z++) {
          var dx=xx-points[z].x,dy=yy-points[z].y;
          if(dx*dx+dy*dy<min2-1e-14){ok=false;break;}
        }
        if(ok)points.push({x:xx,y:yy});
      }
    } else if(type === 'inhomogeneous') {
      ensure(gradient,0,.95,'Gradiente');
      var proposals=poisson(lambda*(1+gradient),rng);
      for(var p=0;p<proposals;p++) {
        var ux=rng.unif(),uy=rng.unif();
        if(rng.unif()< (1+gradient*(2*ux-1))/(1+gradient))points.push({x:ux,y:uy});
      }
    } else throw new Error('Processo puntuale sconosciuto');
    if(points.length>1000)throw new RangeError('Troppi eventi: ridurre intensita');
    return {points:points, parents:parents,attempts:attempts,target:target,type:type};
  }
  function radii() { var out=[];for(var i=1;i<=20;i++)out.push(i*.0125);return out; }
  function curve(points,rr) {
    rr=rr||radii();var n=points.length, k=new Array(rr.length).fill(0);
    if(n<2)return {r:rr.slice(),K:k.map(function(){return NaN;}),L:k.map(function(){return NaN;}),T:NaN, valid:false};
    for(var i=0;i<n;i++)for(var j=i+1;j<n;j++) {
      var dx=Math.abs(points[i].x-points[j].x),dy=Math.abs(points[i].y-points[j].y);
      var d=Math.hypot(dx,dy);if(d>rr[rr.length-1])continue;
      var overlap=(1-dx)*(1-dy);
      if(!(overlap>0))continue;
      // Due coppie ordinate i,j e j,i; correzione translation nel quadrato.
      var weight=2/(n*(n-1)*overlap),lo=0,hi=rr.length-1;
      while(lo<hi){var mid=(lo+hi)>>1;if(rr[mid]<d)lo=mid+1;else hi=mid;}
      k[lo]+=weight;
    }
    for(var b=1;b<k.length;b++)k[b]+=k[b-1];
    var L=k.map(function(v,b){return Math.sqrt(v/Math.PI)-rr[b];});
    return {r:rr.slice(),K:k,L:L,T:Math.max.apply(null,L.map(Math.abs)),valid:true};
  }
  function nearest(points) {
    var n=points.length,d=[];
    if(n<2)return {distances:[],mean:NaN};
    for(var i=0;i<n;i++) {
      var best=Infinity;
      for(var j=0;j<n;j++)if(j!==i){var q=Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y);if(q<best)best=q;}
      d.push(best);
    }
    return {distances:d,mean:d.reduce(function(a,b){return a+b;},0)/n};
  }
  function quadrats(points,side) {
    side=side||4; if(!Number.isInteger(side)||side<2||side>10)throw new RangeError('Griglia di quadrati non valida');
    var a=new Array(side*side).fill(0);
    points.forEach(function(p){var r=Math.min(side-1,Math.floor((1-p.y)*side)),c=Math.min(side-1,Math.floor(p.x*side));a[r*side+c]++;});
    var m=points.length/a.length,ss=a.reduce(function(s,v){return s+(v-m)*(v-m);},0);
    return {counts:a,side:side,mean:m,dispersion:m>0?ss/((a.length-1)*m):NaN};
  }
  function sortQuantile(a,p) { if(!a.length)return NaN;var b=a.slice().sort(function(x,y){return x-y;});var x=(b.length-1)*p,i=Math.floor(x),t=x-i;return b[i]*(1-t)+b[Math.min(i+1,b.length-1)]*t; }
  function envelope(curves,rr) {
    if(!curves.length)return {lo:[],hi:[],mean:[]};
    var lo=[],hi=[],mean=[];
    rr.forEach(function(_,i){var a=curves.map(function(q){return q.L[i];}).filter(Number.isFinite);lo.push(sortQuantile(a,.025));hi.push(sortQuantile(a,.975));mean.push(a.reduce(function(x,y){return x+y;},0)/a.length);});
    return {lo:lo,hi:hi,mean:mean};
  }
  function globalP(observed, simulations) {
    if(!Number.isFinite(observed.T)||!simulations.length)return NaN;
    return (1+simulations.filter(function(v){return v.T>=observed.T-1e-14;}).length)/(simulations.length+1);
  }
  return {poisson:poisson,fixed:fixed,generate:generate,radii:radii,curve:curve,nearest:nearest,quadrats:quadrats,quantile:sortQuantile,envelope:envelope,globalP:globalP};
})();
