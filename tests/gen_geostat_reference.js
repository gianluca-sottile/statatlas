/* Lab 29: dati deterministici JS -> verifiche statistiche R indipendenti (R1). */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),ctx={window:{},console,Math,Float64Array,Uint32Array,Number,Array};vm.createContext(ctx);
for(const name of ['core/rng.js','core/spatial-geostat.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,'src',name),'utf8'),ctx,{filename:name});
const G=ctx.window.SA.geostat,configs=[
 {id:'exp_iso',model:'exponential',sigma2:1,phi:.25,nugget:.12,ratio:1,angle:0,trend:0,n:48,seed:2026,direction:'all',bins:10},
 {id:'gauss_dir',model:'gaussian',sigma2:1.4,phi:.20,nugget:.04,ratio:.55,angle:30,trend:0,n:48,seed:115,direction:'horizontal',bins:8},
 {id:'spherical_dir',model:'spherical',sigma2:.9,phi:.35,nugget:.18,ratio:.65,angle:75,trend:0,n:24,seed:542,direction:'vertical',bins:12},
 {id:'exp_trend',model:'exponential',sigma2:1.2,phi:.35,nugget:0,ratio:1,angle:0,trend:1.5,n:72,seed:87,direction:'all',bins:10}
];
const f=x=>Number.isFinite(x)?Number(x).toPrecision(17):'NA_real_';
const v=a=>'c('+a.map(f).join(', ')+')';
let out=`# StatAtlas · LAB 29 · Verifica indipendente R1 del variogramma empirico
# Generato automaticamente da tests/gen_geostat_reference.js; nessuna dipendenza R obbligatoria.
# Uso: source('verifica/verifica_variogrammi.R') (oppure source(file.choose())).
# I dati sono snapshots dei valori JS osservati. Il confronto testa formula, classi e direzioni,
# non l'identita della sequenza delle simulazioni di campi gaussiani.
stopifnot(getRversion() >= '4.1.0')
check <- function(ok,msg) if(!isTRUE(ok))stop(msg,call.=FALSE)
variogram_R <- function(x,y,z,nbins,direction,max_dist=.85) {
  sums<-numeric(nbins); nn<-integer(nbins)
  for(i in seq_len(length(z)-1L)) for(j in seq.int(i+1L,length(z))) {
    dx<-x[i]-x[j];dy<-y[i]-y[j];h<-sqrt(dx*dx+dy*dy)
    if(h>max_dist)next
    theta<-abs(atan2(dy,dx));if(theta>pi/2)theta<-pi-theta
    good<-direction=='all' || (direction=='horizontal' && theta<=pi/8) ||
       (direction=='vertical' && abs(theta-pi/2)<=pi/8)
    if(!good)next
    k<-min(nbins, floor(h/max_dist*nbins)+1L)
    nn[k]<-nn[k]+1L;sums[k]<-sums[k]+(z[i]-z[j])^2/2
  }
  list(np=nn,gamma=ifelse(nn>0,sums/pmax(nn,1),NA_real_))
}
# Controllo analitico a 2 siti: (y1-y2)^2/2=2 nella classe 3 di quattro.
test<-variogram_R(c(0,.2),c(0,0),c(1,3),4,'horizontal',max_dist=.4)
check(test$np[3]==1L && abs(test$gamma[3]-2)<1e-14,'controllo analitico a due siti')
check(is.na(test$gamma[1]),'classe senza coppie non deve valere 0')
cat('OK: controllo analitico a due sensori, classe vuota\n')
refs <- list(
`;
let parts=[];
for(const o of configs){
 const data=G.generate(o),e=G.empirical(data.sites,data.y,o);
 parts.push(` ${o.id}=list(x=${v(data.sites.map(p=>p.x))},y=${v(data.sites.map(p=>p.y))},z=${v(data.y)},
   direction='${o.direction}',bins=${o.bins}L,np=${v(e.counts)},gamma=${v(e.gamma)},
   model='${o.model}',sigma2=${f(o.sigma2)},phi=${f(o.phi)},nugget=${f(o.nugget)},ratio=${f(o.ratio)},angle=${f(o.angle)})`);
}
out+=parts.join(',\n')+`\n)
for(id in names(refs)) {
  q<-refs[[id]];v<-variogram_R(q$x,q$y,q$z,q$bins,q$direction)
  check(identical(as.integer(q$np),v$np),paste(id,'numero di coppie differente JS vs R'))
  check(identical(is.na(q$gamma),is.na(v$gamma)),paste(id,'classi vuote differenti'))
  d<-max(abs(q$gamma[is.finite(q$gamma)]-v$gamma[is.finite(q$gamma)]))
  check(is.finite(d)&&d<1e-9,paste(id,'semivarianze differenti',d))
  cat('OK:',id,'n=',length(q$z),'coppie=',sum(v$np),'max-diff=',format(d,digits=7),'\\n')
}
# Modelli parametrici e covarianze sotto stazionarieta del residuo.
correlation_R<-function(h,model,phi){t<-h/phi
 if(model=='gaussian') exp(-t^2) else if(model=='spherical') ifelse(t>=1,0,1-1.5*t+.5*t^3) else exp(-t)
}
q<-refs$exp_iso
check(abs(q$nugget+q$sigma2*(1-correlation_R(q$phi,'exponential',q$phi))-
  (.12+1-exp(-1)))<1e-12,'formula teorica del variogramma esponenziale')
# La matrice di covarianza latente e' semidefinita positiva: prova R su tre siti.
sites<-cbind(c(.1,.3,.6),c(.1,.7,.8));D<-as.matrix(dist(sites))
CC<-q$sigma2*exp(-D/q$phi)+diag(q$nugget,3)
check(min(eigen(CC,symmetric=TRUE,only.values=TRUE)$values)>0,'matrice di covarianza SPD')
cat('OK: variogramma teorico e matrice di covarianza SPD\\n')
# Confronto facoltativo con gstat: binnings e convenzioni proprie NON sono test R1.
if(requireNamespace('gstat',quietly=TRUE) && requireNamespace('sp',quietly=TRUE)) {
 q<-refs$exp_iso;dat<-sp::SpatialPointsDataFrame(coords=cbind(q$x,q$y),data=data.frame(z=q$z))
 vg<-gstat::variogram(z~1,dat,cutoff=.85,width=.85/q$bins)
 print(utils::head(vg[,c('np','dist','gamma')],4))
 cat('gstat disponibile: confronto metodologico eseguito; classi e bordi possono differire.\\n')
}
cat('OK: tutti e quattro gli scenari JS-R del laboratorio 29 superati.\\n')
`;
fs.writeFileSync(path.join(ROOT,'verifica/verifica_variogrammi.R'),out,'utf8');
console.log('Generato verifica/verifica_variogrammi.R: 4 scenari, direzioni e classi.');
