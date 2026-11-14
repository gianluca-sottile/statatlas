/* Node tests/gen_point_reference.js: snapshot deterministici JS per verifica R1. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{},console,Math,Float64Array,Uint32Array};vm.createContext(ctx);
for(const f of ['core/rng.js','core/spatial-points.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',f),'utf8'),ctx,{filename:f});
const SA=ctx.window.SA,PP=SA.spatialPoints;
function f(v){return Number.isFinite(v)?Number(v).toPrecision(17):'NA_real_';}
function vec(v){return 'c('+v.map(f).join(', ')+')';}
const models=['csr','thomas','inhibition','inhomogeneous'];
let src=`# StatAtlas - Lab 28 - Verifica indipendente R1: K translation, NN, quadrati e simulazioni.
# File generato da tests/gen_point_reference.js con i dati numerici JS, NON dati casuali generati in R.
# Per eseguire: source("verifica/verifica_processi_puntuali.R") oppure source(file.choose())
# Pacchetti obbligatori: nessuno. spatstat opzionale. R >= 4.1.
stopifnot(getRversion() >= "4.1.0")

# Identico algoritmo matematico, implementazione R indipendente.
K_translation_R <- function(x,y,r) {
 n<-length(x);if(n<2) return(rep(NA_real_,length(r)))
 ans<-numeric(length(r))
 for(i in seq_len(n-1L)) for(j in seq.int(i+1L,n)) {
   dx<-abs(x[i]-x[j]);dy<-abs(y[i]-y[j]);d<-sqrt(dx^2+dy^2)
   if(d<=max(r)) ans<-ans + (2/(n*(n-1)*(1-dx)*(1-dy)))*as.numeric(d<=r)
 }
 ans
}
nearest_R <- function(x,y) {
 n<-length(x)
 mean(vapply(seq_len(n),function(i) min(sqrt((x[i]-x[-i])^2+(y[i]-y[-i])^2)),numeric(1)))
}
quadrat_R <- function(x,y) {
 # Griglia 4x4 con indice ordinato dall'alto verso il basso
 row<-pmin(3L,floor((1-y)*4));col<-pmin(3L,floor(x*4))
 as.vector(tabulate(1L+row*4L+col,nbins=16))
}
check <- function(cond,msg) {if(!isTRUE(cond))stop(msg,call.=FALSE)}
rr<-seq(.0125,.25,by=.0125)
# Dataset con due punti a distanza 0.1: K(.15)=1/.9 con correzione translation.
check(abs(K_translation_R(c(.25,.35),c(.25,.25),c(.15))-1/.9)<1e-10,"K analitica (n=2)")
cat("OK: controllo analitico K translation con n=2\\n")

refs <- list(
`;
let blocks=[];
for(let i=0;i<models.length;i++){
 const m=models[i],o={type:m,lambda:100,sigma:.055,kappa:8,radius:.060,gradient:.85};
 const d=PP.generate(o,new SA.RRNG(2026));const pts=d.points, k=PP.curve(pts),nn=PP.nearest(pts),q=PP.quadrats(pts);
 blocks.push(`  ${m} = list(x=${vec(pts.map(p=>p.x))}, y=${vec(pts.map(p=>p.y))}, K=${vec(k.K)}, T=${f(k.T)}, nn=${f(nn.mean)}, counts=${vec(q.counts)} )`);
}
src+=blocks.join(',\n')+'\n)\n';
src+=`
for(id in names(refs)) {
 ref<-refs[[id]];x<-ref$x;y<-ref$y;n<-length(x)
 kr<-K_translation_R(x,y,rr)
 delta<-max(abs(kr-ref$K))
 check(delta<1e-9,paste("K JS-R differente:",id,delta))
 T<-max(abs(sqrt(kr/pi)-rr))
 check(abs(T-ref$T)<1e-9,paste("T JS-R differente:",id))
 nn<-nearest_R(x,y)
 check(abs(nn-ref$nn)<1e-9,paste("NN JS-R differente:",id))
 ct<-quadrat_R(x,y)
 check(identical(as.numeric(ct),as.numeric(ref$counts)),paste("conteggi quadrati JS-R differenti:",id))
 cat("OK:",id,"n=",n,"Kdiff=",signif(delta,5),"T=",signif(T,7),"NN=",signif(nn,7),"\\n")
}

# Test numerico indipendente di un processo Poisson R: E[N]=lambda e Var[N]=lambda.
set.seed(2026)
nn<-rpois(1500,100)
check(abs(mean(nn)-100)<5,"Poisson R: media lontana da lambda")
check(abs(var(nn)-100)<25,"Poisson R: varianza lontana da lambda")
cat("OK: media e varianza Poisson compatibili con lambda 100\\n")

# Test CSR condizionale: la K media converge alla funzione teorica pi*r^2.
set.seed(1798);rs<-c(.05,.10,.15);simK<-replicate(130,{
 xy<-matrix(runif(2*100),ncol=2)
 K_translation_R(xy[,1],xy[,2],rs)
})
check(max(abs(rowMeans(simK)-pi*rs^2)) < .012,"K CSR media lontana dalla teoria")
cat("OK: stima K sotto CSR, media Monte Carlo vicina a pi*r^2\\n")

# Controllo facoltativo R3: spatstat e' un confronto metodologico, non un vincolo R1.
if(requireNamespace("spatstat.geom",quietly=TRUE)&&requireNamespace("spatstat.explore",quietly=TRUE)){
  ref<-refs$csr
  X<-spatstat.geom::ppp(ref$x,ref$y,window=spatstat.geom::owin(c(0,1),c(0,1)))
  # spatstat richiede che la griglia dei raggi includa r=0 come primo valore.\n  Kp<-spatstat.explore::Kest(X,r=c(0,rr),correction="translate")
  cat("spatstat disponibile: Kest eseguito; verificare le convenzioni della stima.\\n")
}
cat("OK: tutti i quattro scenari JS-R, i controlli analitici e i controlli Monte Carlo R superati.\\n")
`;
fs.writeFileSync(path.join(root,'verifica/verifica_processi_puntuali.R'),src,'utf8');
console.log('R reference generato: 4 processi, n, K, NN, T, 16 quadrati.');
