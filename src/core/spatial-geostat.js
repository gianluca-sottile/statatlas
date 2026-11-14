/* StatAtlas · core/spatial-geostat.js
 * Campi gaussiani su griglie piccole, variogramma per classi di distanza,
 * anisotropia geometrica. Nessuna dipendenza da librerie remote. */
var SA = window.SA || (window.SA = {});
SA.geostat = (function () {
  'use strict';
  function defaults(o) { return Object.assign({model:'exponential',sigma2:1,phi:.25,nugget:.12,ratio:1,angle:0,trend:0,n:48,seed:2026},o||{}); }
  function positions(side) {
    var q=[]; for(var j=0;j<side;j++)for(var i=0;i<side;i++)q.push({x:(i+.5)/side,y:(j+.5)/side});
    return q;
  }
  function distance(a,b,o) {
    var dx=a.x-b.x,dy=a.y-b.y,ang=(o.angle||0)*Math.PI/180,c=Math.cos(ang),s=Math.sin(ang);
    var u=c*dx+s*dy,v=-s*dx+c*dy;
    return Math.hypot(u,v/o.ratio);
  }
  function correlation(d,o) {
    var t=d/o.phi;
    if(o.model==='gaussian')return Math.exp(-t*t);
    if(o.model==='spherical')return t>=1?0:1-1.5*t+.5*t*t*t;
    return Math.exp(-t);
  }
  function cov(a,b,o,diagonal) {
    return o.sigma2*correlation(distance(a,b,o),o)+(diagonal?o.nugget:0);
  }
  function covariance(sites,opt,noise) {
    var o=defaults(opt),A=[];
    for(var i=0;i<sites.length;i++) {
      var row=new Float64Array(i+1);
      for(var j=0;j<=i;j++)row[j]=cov(sites[i],sites[j],o,i===j&&noise);
      A.push(row);
    }
    return A;
  }
  function cholesky(lower) {
    var n=lower.length,L=[];
    for(var i=0;i<n;i++) {
      var row=new Float64Array(i+1);
      for(var j=0;j<=i;j++) {
        var s=lower[i][j];for(var k=0;k<j;k++)s-=row[k]*(i===j?row[k]:L[j][k]);
        if(i===j) {
          if(s<=1e-13)throw new Error('Matrice di covarianza non definita positiva; controllare nugget e siti.');
          row[j]=Math.sqrt(s);
        } else row[j]=s/L[j][j];
      }
      L.push(row);
    }
    return L;
  }
  function sample(L,rng) {
    var z=Array.from({length:L.length},function(){return rng.norm();}),out=new Float64Array(L.length);
    for(var i=0;i<L.length;i++)for(var j=0;j<=i;j++)out[i]+=L[i][j]*z[j];
    return out;
  }
  function generate(opt) {
    var o=defaults(opt),grid=positions(12),baseRng=new SA.RRNG(o.seed);
    // Un unico campo latente condiviso tra mappa e sensori. Il nugget e' solo osservazionale.
    var mat=covariance(grid,o,false), L, jitter=0;
    try { L=cholesky(mat); }
    catch(err) {
      // Griglia molto fitta + kernel gaussiano liscio: matrice quasi singolare.
      // Regolarizzazione numerica esplicita, riportata alla UI e nei test.
      jitter=1e-9*o.sigma2;
      for(var a=0;a<mat.length;a++)mat[a][a]+=jitter;
      L=cholesky(mat);
    }
    var latent=sample(L,baseRng);
    var pickRng=new SA.RRNG(o.seed+101),id=grid.map(function(_,i){return i;});
    for(var k=id.length-1;k>0;k--){var j=Math.floor(pickRng.unif()*(k+1)),v=id[k];id[k]=id[j];id[j]=v;}
    id=id.slice(0,Math.min(o.n,grid.length));
    var sites=id.map(function(i){return {x:grid[i].x,y:grid[i].y};});
    var noiseRng=new SA.RRNG(o.seed+809),y=id.map(function(i){return latent[i]+Math.sqrt(o.nugget)*noiseRng.norm()+o.trend*(grid[i].x-.5);});
    var observedField=Array.from(latent,function(v,i){return v+o.trend*(grid[i].x-.5);});
    var Lobs=cholesky(covariance(sites,o,true));
    return {grid:grid,field:observedField,latent:latent,sites:sites,y:y,Lobs:Lobs,params:o,ids:id,jitter:jitter};
  }
  function pairDirection(a,b,dir,tol) {
    if(dir==='all')return true;
    var theta=Math.atan2(b.y-a.y,b.x-a.x),v=Math.abs(theta);
    if(v>Math.PI/2)v=Math.PI-v;
    return Math.abs(v-(dir==='horizontal'?0:Math.PI/2))<=tol;
  }
  function empirical(sites,y,opt) {
    var o=Object.assign({bins:10,maxDist:.85,direction:'all',tol:Math.PI/8},opt||{}),s=new Array(o.bins).fill(0),n=new Array(o.bins).fill(0),pairs=[];
    for(var i=0;i<sites.length;i++)for(var j=i+1;j<sites.length;j++) {
      var dx=sites[i].x-sites[j].x,dy=sites[i].y-sites[j].y,d=Math.hypot(dx,dy);
      if(d>o.maxDist||!pairDirection(sites[i],sites[j],o.direction,o.tol))continue;
      var b=Math.min(o.bins-1,Math.floor(d/o.maxDist*o.bins));
      var gamma=.5*(y[i]-y[j])**2;s[b]+=gamma;n[b]++;
      pairs.push({i:i,j:j,d:d,gamma:gamma,bin:b});
    }
    return {r:n.map(function(_,i){return (i+.5)*o.maxDist/o.bins;}),gamma:s.map(function(v,i){return n[i]?v/n[i]:NaN;}),counts:n,pairs:pairs,bins:o.bins,maxDist:o.maxDist,direction:o.direction};
  }
  function theoretical(h,opt,dir) {
    var o=defaults(opt);if(h===0)return 0;
    if(o.ratio!==1 && dir==='all')return NaN;
    var theta=dir==='vertical'?Math.PI/2:0;
    var p={x:0,y:0},q={x:h*Math.cos(theta),y:h*Math.sin(theta)};
    return o.sigma2*(1-correlation(distance(p,q,o),o))+o.nugget;
  }
  function drawObservation(field,rng) {
    var z=sample(field.Lobs,rng);
    return Array.from(z,function(v,i){return v+field.params.trend*(field.sites[i].x-.5);});
  }
  function quantile(a,p) {
    if(!a.length)return NaN;
    var b=a.slice().sort(function(x,y){return x-y;}),x=(b.length-1)*p,k=Math.floor(x),t=x-k;
    return b[k]*(1-t)+b[Math.min(k+1,b.length-1)]*t;
  }
  function summarize(curves,nbins) {
    var result={lo:[],hi:[],mean:[],n:curves.length};
    for(var k=0;k<nbins;k++) {
      var v=curves.map(function(a){return a[k];}).filter(Number.isFinite);
      result.lo.push(quantile(v,.025));result.hi.push(quantile(v,.975));
      result.mean.push(v.length?v.reduce(function(a,b){return a+b;},0)/v.length:NaN);
    }
    return result;
  }
  return {defaults:defaults,positions:positions,distance:distance,correlation:correlation,cov:cov,covariance:covariance,cholesky:cholesky,sample:sample,generate:generate,empirical:empirical,theoretical:theoretical,drawObservation:drawObservation,summarize:summarize};
})();
