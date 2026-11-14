/* Rigenera il confronto indipendente R1 del LAB 30 da casi deterministici JS. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{},console,Float64Array,Uint32Array,Number,Math};vm.createContext(ctx);
for(const f of ['rng.js','spatial-geostat.js','spatial-kriging.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/core',f),'utf8'),ctx,{filename:f});
const K=ctx.window.SA.kriging;
const cases=[
 {name:'simple_exponential_nugget',model:'exponential',method:'simple',phi:.23,sigma2:1,nugget:.2,sites:[[0,0],[.7,.1],[.2,.85],[.9,.7]],targets:[[0,0],[.2,.2],[.5,.4],[.85,.85]],y:[1.4,-.9,.5,.2]},
 {name:'ordinary_exponential_zero_nugget',model:'exponential',method:'ordinary',phi:.31,sigma2:1.2,nugget:0,sites:[[0,0],[.7,.1],[.2,.85],[.9,.7]],targets:[[0,0],[.2,.2],[.5,.4],[.85,.85]],y:[1.4,-.9,.5,.2]},
 {name:'ordinary_spherical_nugget',model:'spherical',method:'ordinary',phi:.65,sigma2:2,nugget:.15,sites:[[0,0],[.7,.1],[.2,.85],[.9,.7]],targets:[[0,0],[.2,.2],[.5,.4],[.85,.85]],y:[1.4,-.9,.5,.2]},
 {name:'simple_gaussian_nugget',model:'gaussian',method:'simple',phi:.28,sigma2:.8,nugget:.05,sites:[[0,0],[.7,.1],[.2,.85],[.9,.7]],targets:[[0,0],[.2,.2],[.5,.4],[.85,.85]],y:[1.4,-.9,.5,.2]},
 {name:'IDW_exact_and_interior',model:'exponential',method:'idw',phi:.3,sigma2:1,nugget:.1,sites:[[0,0],[.7,.1],[.2,.85],[.9,.7]],targets:[[0,0],[.2,.2],[.5,.4],[.85,.85]],y:[1.4,-.9,.5,.2]}
];
function vec(a){return 'c('+a.map(x=>Number.isFinite(x)?x.toPrecision(17):'NA_real_').join(', ')+')';}
function mat(a){return 'matrix('+vec(a.flat())+',ncol=2,byrow=TRUE)';}
const out=[
 '# StatAtlas LAB 30: confronto indipendente R base vs JS, five deterministic fixtures.',
 '# Lo script ricostruisce covarianze e predizioni con solve() di R, senza riusare il solver JS.',
 '# Per IDW NON esiste la varianza di kriging: i NA sono attesi.',
 'distance <- function(A,B) sqrt(outer(A[,1],B[,1],"-")^2 + outer(A[,2],B[,2],"-")^2)',
 'fit_one <- function(sites,targets,y,model,phi,sig2,nugget,method){',
 '  corfun <- function(D) {t <- D/phi; if(model=="gaussian") return(exp(-t*t));',
 '    if(model=="spherical") return(ifelse(t>=1,0,1-1.5*t+.5*t^3)); exp(-t) }',
 '  if(method=="idw") {',
 '    W <- sapply(seq_len(nrow(targets)),function(j){ D <- sqrt(rowSums((sites-matrix(targets[j,],nrow(sites),2,byrow=TRUE))^2));',
 '      at <- which(D<=1e-12); if(length(at)){w<-rep(0,length(D));w[at[1]]<-1;return(w)}',
 '      a<-1/D^2; a/sum(a)})',
 '    return(list(pred=as.numeric(crossprod(W,y)),pv=rep(NA_real_,nrow(targets)),W=W))',
 '  }',
 '  C <- sig2*corfun(distance(sites,sites))+diag(nugget,nrow(sites))',
 '  c0 <- sig2*corfun(distance(sites,targets))',
 '  A <- solve(C,c0)',
 '  if(method=="ordinary") {b<-solve(C,rep(1,nrow(sites)));nu<-(colSums(A)-1)/sum(b);W<-A-b%o%nu}',
 '  else {nu<-rep(0,ncol(A));W<-A}',
 '  list(pred=as.numeric(crossprod(W,y)),pv=pmax(0,sig2-colSums(W*c0)-nu),W=W)',
 '}',
 'tests <- 0L'
];
for(const a of cases){
 const o={model:a.model,phi:a.phi,sigma2:a.sigma2,nugget:a.nugget,ratio:1,angle:0};
 const sit=a.sites.map(([x,y])=>({x,y})),tar=a.targets.map(([x,y])=>({x,y}));
 const d=K.geometry(sit,tar,o,a.method,2),pred=K.predict(d,a.y);
 out.push('{ # '+a.name,'  sites <- '+mat(a.sites),'  targets <- '+mat(a.targets), '  y <- '+vec(a.y),
   `  result <- fit_one(sites,targets,y,"${a.model}",${a.phi},${a.sigma2},${a.nugget},"${a.method}")`,
   '  ref_pred <- '+vec(pred),'  ref_pv <- '+vec(d.variances),
   '  stopifnot(max(abs(result$pred-ref_pred))<1e-8)',
   '  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))',
   '  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)',
   '  if("'+a.method+'"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)',
   '  tests <- tests+1L;cat("OK: '+a.name+' — previsioni, varianze, vincoli R1 JS-R\\n")','}');
}
out.push('stopifnot(tests==5L)',
 'cat("OK: LAB 30: cinque scenari JS-R, identità numeriche R1 confermate\\n")',
 '# gstat è un riferimento metodologico ulteriore, non richiesto per i cinque benchmark.',
 '# Per gstat il parametro psill/nugget va configurato coerentemente con l’obiettivo LATENTE.');
fs.writeFileSync(path.join(root,'verifica/verifica_kriging.R'),out.join('\n')+'\n');
console.log('Generati 5 scenari R1 LAB 30');
