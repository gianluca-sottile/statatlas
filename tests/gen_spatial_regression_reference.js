/* Generate independent R base benchmarks on exact JS-generated data, without the JS solver. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{},console,Float64Array,Uint32Array,Number,Math,Array};vm.createContext(ctx);
for(const f of ['rng.js','linalg.js','spatial.js','spatial-regression.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/core',f),'utf8'),ctx,{filename:f});
const M=ctx.window.SA.spatialRegression;
const jsonCases=[];
const cases=[{name:'SAR_positivo',kind:'sar',rho:.55,seed:2026},{name:'SAR_negativo',kind:'sar',rho:-.4,seed:2028},{name:'SEM_positivo',kind:'sem',rho:.65,seed:2031},{name:'SEM_negativo',kind:'sem',rho:-.45,seed:2039},{name:'Errori_indipendenti',kind:'independent',rho:0,seed:2043}];
function vec(a){return 'c('+Array.from(a,x=>Number(x).toPrecision(17)).join(', ')+')';}
const lines=[
 '# StatAtlas LAB 31: indipendente in R base; dati e fold prodotti dal JS.',
 '# R1: R ricostruisce W, QR, Jacobiano, coefficienti, profilo ML, impatti e fold CV.',
 '# L ottimizzazione avviene sulla stessa griglia discreta {-0.8,...,0.8}.',
 'n<-36L; nside<-6L; grid<-seq(-.8,.8,by=.05); W<-matrix(0,n,n)',
 'for(i in seq_len(n))for(j in seq_len(n)){',
 '  ri<-(i-1L)%/%nside;ci<-(i-1L)%%nside;rj<-(j-1L)%/%nside;cj<-(j-1L)%%nside',
 '  if(abs(ri-rj)+abs(ci-cj)==1L)W[i,j]<-1',
 '}',
 'W<-W/rowSums(W)',
 'stopifnot(max(abs(rowSums(W)-1))<1e-14,all(diag(W)==0))',
 'fit_at<-function(y,x,model,rho){',
 '  A<-diag(n)-rho*W; yy<-drop(A%*%y); X<-cbind(1,x); XX<-if(model=="sem")A%*%X else X',
 '  beta<-drop(qr.coef(qr(XX),yy)); innov<-drop(yy-XX%*%beta); s2<-sum(innov^2)/n',
 '  d<-if(model=="ols")0 else as.numeric(determinant(A,logarithm=TRUE)$modulus)',
 '  list(beta=beta,innov=innov,sigma2=s2,ll=d-n/2*(1+log(2*pi*s2)))',
 '}',
 'profile<-function(y,x,model){',
 '  fits<-lapply(grid,function(r)fit_at(y,x,model,r));i<-which.max(vapply(fits,function(f)f$ll,0.));',
 '  c(fits[[i]],list(rho=grid[i]))',
 '}',
 'cv<-function(y,coords,fold,k){err<-0;',
 '  for(f in sort(unique(fold))){te<-which(fold==f);tr<-which(fold!=f);',
 '    for(i in te){dd<-sqrt(rowSums((coords[tr,,drop=FALSE]-matrix(coords[i,],length(tr),2,byrow=TRUE))^2));',
 '      o<-order(dd,tr)[seq_len(k)];w<-1/(dd[o]+1e-9);p<-sum(w*y[tr[o]])/sum(w);err<-err+(y[i]-p)^2}',
 '  };err/n',
 '}',
 'coords<-cbind(rep(0:5,times=6),rep(0:5,each=6)); checks<-0L'
];
for(const c of cases){const d=M.dataset(6,6,c.kind,c.rho,c.seed),fit=M.profiles(d.W,d.X,d.y),imp=M.impacts(d.W,fit.sar.rho,fit.sar.beta[1]),fr=M.foldsRandom(36,3,new ctx.window.SA.RRNG(c.seed+601)),fb=M.foldsSpatial(d.xy,6,3),cv=M.cv(d.xy,6,d.y,fr,fb,3);
 jsonCases.push({name:c.name,kind:c.kind,rho:c.rho,seed:c.seed,x:d.x,y:d.y,foldRandom:fr,foldBlock:fb,ols:fit.ols,sar:{rho:fit.sar.rho,beta:fit.sar.beta,logLik:fit.sar.logLik},sem:{rho:fit.sem.rho,beta:fit.sem.beta,logLik:fit.sem.logLik},impacts:imp,cv:cv});
 lines.push('{ # '+c.name,
 '  y<-'+vec(d.y), '  x<-'+vec(d.x),
 '  ols<-fit_at(y,x,"ols",0);sar<-profile(y,x,"sar");sem<-profile(y,x,"sem")',
 '  stopifnot(abs(ols$ll-('+fit.ols.logLik.toPrecision(17)+'))<1e-7)',
 '  stopifnot(abs(sar$rho-('+fit.sar.rho.toPrecision(17)+'))<1e-9,abs(sem$rho-('+fit.sem.rho.toPrecision(17)+'))<1e-9)',
 '  stopifnot(max(abs(sar$beta-'+vec(fit.sar.beta)+'))<1e-7)',
 '  stopifnot(max(abs(sem$beta-'+vec(fit.sem.beta)+'))<1e-7)',
 '  stopifnot(abs(sar$ll-('+fit.sar.logLik.toPrecision(17)+'))<1e-7)',
 '  stopifnot(abs(sem$ll-('+fit.sem.logLik.toPrecision(17)+'))<1e-7)',
 '  H<-solve(diag(n)-sar$rho*W);dir<-mean(diag(H))*sar$beta[2];tot<-mean(rowSums(H))*sar$beta[2]',
 '  stopifnot(abs(dir-('+imp.direct.toPrecision(17)+'))<1e-7,abs(tot-('+imp.total.toPrecision(17)+'))<1e-7)',
 '  f_random<-'+vec(fr.map(x=>x+1)),'  f_block<-'+vec(fb.map(x=>x+1)),
 '  stopifnot(abs(cv(y,coords,f_random,3)-('+cv.random.toPrecision(17)+'))<1e-8)',
 '  stopifnot(abs(cv(y,coords,f_block,3)-('+cv.spatial.toPrecision(17)+'))<1e-8)',
 '  checks<-checks+1L;cat("OK: '+c.name+' — OLS/SAR/SEM, logL, impatti, CV R1\\n")',
 '}' );
}
lines.push('stopifnot(checks==5L)','cat("OK: LAB 31 — cinque scenari numerici JS–R confermati\\n")',
 '# spatialreg e blockCV opzionali per un confronto di metodo R3:',
 '# i risultati ML con ottimizzazione continua non coincidono necessariamente col massimo su griglia.',
 '# Non esiste una garanzia di ordinamento universale fra random CV e spatial block CV.');
fs.writeFileSync(path.join(root,'verifica/verifica_regressione_spaziale.R'),lines.join('\n')+'\n');
fs.writeFileSync(path.join(root,'tests/spatial_regression_js_reference.json'),JSON.stringify(jsonCases,null,2)+'\n');console.log('Generati 5 scenari R1 per LAB 31');
