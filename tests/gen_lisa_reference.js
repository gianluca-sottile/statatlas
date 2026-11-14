/* Genera verifica/verifica_lisa.R con scenari LISA calcolati dal motore JS.
 * Uso: node tests/gen_lisa_reference.js
 */
const fs=require('fs');global.window=global;
for(const f of ['rng.js','spatial.js','spatial-areal.js','spatial-local.js'])require('../src/core/'+f);
const sp=SA.spatial,ar=SA.spatialAreal,local=SA.spatialLocal;
const fmt=v=>Number.isFinite(v)?Number(v).toPrecision(17):'NA_real_';
const vec=a=>'c('+a.map(fmt).join(', ')+')';
const scenarios=[
  ['hotspot originale rook row','hotspot','none','regular','rook','row',2026],
  ['hotspot 16 zone regolari','hotspot','2','regular','rook','row',2026],
  ['hotspot 16 zone spostate queen binario','hotspot','2','shifted','queen','binary',2026],
  ['anomalia originale rook binario','outlier','none','regular','rook','binary',111],
  ['iid originale rook row','iid','none','regular','rook','row',2026],
  ['sar originale queen row','sar','none','regular','queen','row',42],
  ['checker 16 zone varianza nulla','checker','2','regular','rook','row',2026]
];
let lines=[
 '# StatAtlas LAB 27 — verifica autonoma in R base (senza pacchetti obbligatori)',
 '# Generato con: node tests/gen_lisa_reference.js',
 '# Confronta local Moran, attesa condizionale, aggregazione MAUP, BH/BY e p-values di riferimento.',
 '# Le permutazioni JS e R non sono rese identiche perché utilizzano sequenze RNG diverse.',
 'check <- function(label, got, expected, tol=1e-9) {',
 ' if (length(got)!=length(expected) || any(is.na(got)!=is.na(expected)) ||',
 '     any(abs(got[!is.na(got)]-expected[!is.na(expected)])>tol)) stop(paste("FAIL:",label))',
 ' cat("OK:", label,"\\n")',
 '}',
 'Wgrid <- function(nr,nc,kind,style) {',
 ' n <- nr*nc; W<-matrix(0,n,n)',
 ' for(i in seq_len(n)) for(j in seq_len(n)) {',
 '  if(i==j) next',
 '  ri<-(i-1)%/%nc; ci<-(i-1)%%nc; rj<-(j-1)%/%nc; cj<-(j-1)%%nc',
 '  yes<-if(kind=="rook") abs(ri-rj)+abs(ci-cj)==1 else',
 '    max(abs(ri-rj),abs(ci-cj))==1',
 '  if(yes) W[i,j]<-1',
 ' }',
 ' if(style=="row") for(i in seq_len(n)) if(sum(W[i,])>0) W[i,]<-W[i,]/sum(W[i,])',
 ' W',
 '}',
 'run_case <- function(label,x,nr,nc,kind,style,IJS,EJS,globalJS,invalid=FALSE){',
 ' W<-Wgrid(nr,nc,kind,style); z<-x-mean(x); m2<-mean(z^2)',
 ' if(invalid){if(m2>1e-24)stop("FAIL varianza attesa nulla");cat("OK:",label,"non definito\\n");return(invisible(NULL))}',
 ' lag<-drop(W%*%z); Ii<-z*lag/m2; Ei<- -z^2*rowSums(W)/((length(x)-1)*m2)',
 ' G<-length(x)*sum(z*lag)/(sum(W)*sum(z^2))',
 ' check(paste(label,"I locale"),Ii,IJS)',
 ' check(paste(label,"E condizionale"),Ei,EJS)',
 ' check(paste(label,"Moran globale"),G,globalJS)',
 ' check(paste(label,"somma LISA"),sum(Ii),sum(W)*G)',
 ' if (requireNamespace("spdep",quietly=TRUE)) {',
 '   lw <- spdep::mat2listw(W, style=if(style=="row") "W" else "B",zero.policy=TRUE)',
 '   lm <- spdep::localmoran(x,lw,mlvar=TRUE,zero.policy=TRUE)',
 '   check(paste(label,"spdep localmoran"),as.numeric(lm[,1]),Ii,tol=1e-8)',
 ' }',
 ' invisible(list(x=x,W=W,z=z,m2=m2,Ii=Ii,Ei=Ei))',
 '}'
];
scenarios.forEach(([label,pattern,scale,zoning,kind,style,seed])=>{
 const base=local.generatePattern(pattern,seed),agg=local.aggregate(base,scale,zoning),W=sp.weights(agg.rows,agg.cols,kind,style),L=local.local(agg.x,W),G=ar.moran(agg.x,W);
 lines.push('scenario <- run_case("'+label+'",'+vec(agg.x)+','+agg.rows+','+agg.cols+',"'+kind+'","'+style+'",'+vec(L.I)+','+vec(L.expected)+','+fmt(G.I)+','+(L.valid?'FALSE':'TRUE')+')');
 if(label==='hotspot originale rook row') {
   const rng=new SA.RRNG(seed+2907),B=199,samples=[];
   for(let b=0;b<B;b++)samples.push(local.conditionalOne(L.z,W,L.m2,rng));
   const p=local.pValues(L.I,L.expected,samples,W),BH=local.adjust(p,'BH'),BY=local.adjust(p,'BY');
   // Un campione di valori condizionali è fissato, così il calcolo del p-value è validato in R.
   const i=27, draw=samples.map(a=>a[i]);
   lines.push('if(!is.null(scenario)) {',
     '  pJS <- '+vec(p),
     '  bhJS <- '+vec(BH),
     '  byJS <- '+vec(BY),
     '  check("BH da p JS", p.adjust(pJS, "BH"), bhJS)',
     '  check("BY da p JS", p.adjust(pJS, "BY"), byJS)',
     '  selected <- '+(i+1),
     '  simulated <- '+vec(draw),
     '  pSelected <- (1+sum(abs(simulated-scenario$Ei[selected])>=abs(scenario$Ii[selected]-scenario$Ei[selected])-1e-12))/(length(simulated)+1)',
     '  check("p condizionale da medesimi campioni",pSelected,pJS[selected])',
     '  set.seed(2026); vals <- numeric(400)',
     '  for(b in seq_along(vals)) {',
     '    temp <- scenario$z; inds<-setdiff(seq_along(temp),selected)',
     '    temp[inds]<-sample(temp[inds],length(inds))',
     '    vals[b]<-scenario$z[selected]*sum(scenario$W[selected,]*temp)/scenario$m2',
     '  }',
     '  check("media permutazionale R vs E condizionale",mean(vals),scenario$Ei[selected],tol=0.15)',
     '}');
 }
});
lines.push('cat("\\nLAB 27: tutti i controlli R eseguiti sono superati.\\n")');
const dest='verifica/verifica_lisa.R';fs.writeFileSync(dest,lines.join('\n')+'\n');console.log(dest+': '+lines.length+' blocchi, '+scenarios.length+' scenari');
