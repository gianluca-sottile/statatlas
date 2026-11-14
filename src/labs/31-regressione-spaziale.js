/* StatAtlas · LAB 31 — SAR, SEM e validazione geografica.
 * Le repliche di CV sono ferme all'apertura: nessun autostart.
 * Stima Gaussian ML mediante profilo discreto dichiarato; SAR impacts solo per il modello lag.
 * Fold geografici = fasce verticali; obiettivo: estrapolazione a una fascia esclusa.
 */
(function(){
'use strict';
var el,S,run,controls,mapBox,profileBox,impactBox,cvBox,tbody,kpis,interp,code,choice,feedback,mcInfo;
var M=SA.spatialRegression,P=SA.plot,A=SA.spatialAreal;
var NROWS=6,NCOLS=6;
function ff(v,d){return Number.isFinite(v)?SA.fmt(v,d===undefined?3:d):'—';}
function make(){return {seed:2026,type:'sar',rho:.55,view:'response',chosen:'sar',k:3,B:49,reps:[],cvRng:null,ref:null,model:null,randomFolds:null,blockFolds:null,showFolds:'none',lastError:''};}
function generate(){S.data=M.dataset(NROWS,NCOLS,S.type,S.rho,S.seed);S.randomFolds=M.foldsRandom(S.data.y.length,3,new SA.RRNG(S.seed+601));S.blockFolds=M.foldsSpatial(S.data.xy,NCOLS,3);S.fits=M.profiles(S.data.W,S.data.X,S.data.y);S.sampleCV=M.cv(S.data.xy,NCOLS,S.data.y,S.randomFolds,S.blockFolds,S.k);S.impacts=M.impacts(S.data.W,S.fits.sar.rho,S.fits.sar.beta[1]);S.ref={random:S.sampleCV.random,spatial:S.sampleCV.spatial};reset();}
function reset(){S.reps=[];S.cvRng=new SA.RRNG(S.seed+707);}
function update(){run.stop();generate();render();code.refresh();run.refresh();}
function updateK(){run.stop();S.sampleCV=M.cv(S.data.xy,NCOLS,S.data.y,S.randomFolds,S.blockFolds,S.k);S.ref={random:S.sampleCV.random,spatial:S.sampleCV.spatial};reset();render();code.refresh();run.refresh();}
function done(){return S.reps.length>=S.B;}
function visibleReps(){return S.reps.slice(0,S.B);}
function replicate(){if(done())return false;var d=S.data,W=d.W,y,e=Array.from({length:d.y.length},()=>.55*S.cvRng.norm());if(S.type==='sar')y=M.inverseSpatial(W,d.X.map((row,i)=>.35+1.15*row[1]+e[i]),S.rho);else if(S.type==='sem'){var u=M.inverseSpatial(W,e,S.rho);y=d.X.map((row,i)=>.35+1.15*row[1]+u[i]);}else y=d.X.map((row,i)=>.35+1.15*row[1]+e[i]);S.reps.push(M.cv(d.xy,NCOLS,y,S.randomFolds,S.blockFolds,S.k));return true;}
function svgText(root,x,y,txt,opts){return P.text(root,x,y,String(txt),Object.assign({'font-size':12,fill:SA.theme().ink_2},opts||{}));}
function drawMap(){mapBox.innerHTML='';var t=SA.theme(),fit=S.fits[S.chosen],v=S.view==='response'?S.data.y:S.view==='innovation'?fit.innovation:fit.residual;var max=Math.max(.01,...v.map(Math.abs)),root=P.svg('svg',{viewBox:'0 0 720 308',role:'img','aria-label':'Mappa dei valori o residui sul reticolo spaziale e partizioni di validazione'},mapBox),x0=38,y0=16,sz=42;
 v.forEach(function(z,i){var row=Math.floor(i/NCOLS),col=i%NCOLS,a=Math.abs(z)/max;var c=z>=0?t.c1:t.c2;P.svg('rect',{x:x0+sz*col,y:y0+sz*(NROWS-row-1),width:sz-1,height:sz-1,rx:3,fill:c,'fill-opacity':.14+.76*a,stroke:t.rule,'stroke-width':1},root);if(S.showFolds!=='none'){var fold=(S.showFolds==='block'?S.blockFolds:S.randomFolds)[i];svgText(root,x0+sz*col+sz/2,y0+sz*(NROWS-row-1)+sz/2+4,fold+1,{'text-anchor':'middle','font-size':15,'font-weight':700,fill:t.ink});}});
 svgText(root,340,30,S.view==='response'?'RISPOSTA OSSERVATA':S.view==='residual'?'RESIDUI DEL MODELLO':'INNOVAZIONI STIMATE',{'font-size':12,'font-weight':700,fill:t.ink});
 svgText(root,340,69,'Generatore: '+({sar:'SAR',sem:'SEM',independent:'Errori indipendenti'}[S.type]));
 svgText(root,340,94,'Modello scelto: '+S.chosen.toUpperCase());
 svgText(root,340,119,'Parametro vero: '+(S.type==='independent'?'0 (nessuna dipendenza)':ff(S.rho,2)));
 svgText(root,340,144,'Dipendenza stimata: '+(S.chosen==='ols'?'non prevista':ff(fit.rho,2)));
 svgText(root,340,184,'Moran residui: '+ff(A.moran(fit.innovation,S.data.W).I));
 svgText(root,340,213,'Scala simmetrica: ±'+ff(max,2));
 svgText(root,340,244,S.showFolds==='none'?'Seleziona una mappa dei fold':S.showFolds==='block'?'Blocchi geografici: colonne contigue':'Fold casuali: territori mescolati');
 svgText(root,340,272,'Pesi rook standardizzati per riga.',{'font-size':11});}
function drawProfile(){profileBox.innerHTML='';var fs=S.fits,t=SA.theme(),a=fs.sar.trace,b=fs.sem.trace,min=Math.min(...a.map(x=>x.ll),...b.map(x=>x.ll),fs.ols.logLik),max=Math.max(...a.map(x=>x.ll),...b.map(x=>x.ll),fs.ols.logLik);var p=P.frame(profileBox,{W:720,H:278,x:[-.82,.82],y:[min-1,max+1],xlabel:'Parametro spaziale ρ oppure λ',ylabel:'Log-verosimiglianza profilata',label:'Profili gaussiani SAR e SEM su griglia di parametri'});
 function curve(arr,col){P.svg('path',{d:arr.map((v,i)=>(i?'L':'M')+p.x(v.rho)+','+p.y(v.ll)).join(' '),stroke:col,'stroke-width':2.3,fill:'none'},p.g);}
 curve(a,t.c1);curve(b,t.c2);P.svg('line',{x1:p.x(-.8),x2:p.x(.8),y1:p.y(fs.ols.logLik),y2:p.y(fs.ols.logLik),stroke:t.ink_3,'stroke-dasharray':'5 4'},p.g);
 P.svg('line',{x1:106,x2:128,y1:19,y2:19,stroke:t.c1,'stroke-width':3},p.root);
 svgText(p.root,134,23,'SAR '+ff(fs.sar.rho,2),{'font-size':11,fill:t.ink});
 P.svg('line',{x1:228,x2:250,y1:19,y2:19,stroke:t.c2,'stroke-width':3},p.root);
 svgText(p.root,256,23,'SEM '+ff(fs.sem.rho,2),{'font-size':11,fill:t.ink});
 P.svg('line',{x1:358,x2:380,y1:19,y2:19,stroke:t.ink_3,'stroke-dasharray':'4 3','stroke-width':2},p.root);
 svgText(p.root,386,23,'OLS: riferimento',{'font-size':11,fill:t.ink});}
function drawImpacts(){impactBox.innerHTML='';var t=SA.theme(),imp=S.impacts,vals=[imp.direct,imp.indirect,imp.total],names=['Diretto','Indiretto','Totale'],max=Math.max(1.4,...vals.map(Math.abs))*1.3;var p=P.frame(impactBox,{W:720,H:255,x:[-.5,2.6],y:[-max,max],xlabel:'Effetti medi SAR (covariata X)',ylabel:'Derivata di E(y) rispetto a X',label:'Effetti medi diretti, indiretti e totali implicati dal modello SAR'});
 P.svg('line',{x1:p.x(-.5),x2:p.x(2.6),y1:p.y(0),y2:p.y(0),stroke:t.ink_2,'stroke-width':1},p.g);
 vals.forEach(function(v,i){var yy=p.y(v),zero=p.y(0);P.svg('rect',{x:p.x(i-.24),y:Math.min(yy,zero),width:p.x(i+.24)-p.x(i-.24),height:Math.max(1,Math.abs(yy-zero)),rx:3,fill:[t.c1,t.c2,t.c3][i],'fill-opacity':.77},p.g);svgText(p.root,p.x(i),p.y(-max*.90),names[i],{'text-anchor':'middle'});svgText(p.root,p.x(i),yy+(v>=0?-9:16),ff(v,2),{'text-anchor':'middle','font-size':13,'font-weight':700});});
 svgText(p.root,150,20,'Effetti del SAR STIMATO: non effetti causali',{'font-size':11,fill:t.ink_2});}
function drawCV(){cvBox.innerHTML='';var t=SA.theme(),arr=visibleReps(),random=arr.length?arr.reduce((a,b)=>a+b.random,0)/arr.length:NaN,block=arr.length?arr.reduce((a,b)=>a+b.spatial,0)/arr.length:NaN,max=Math.max(.1,S.sampleCV.random,S.sampleCV.spatial,random||0,block||0)*1.45;var p=P.frame(cvBox,{W:720,H:258,x:[0,3],y:[0,max],xlabel:'Schema di valutazione',ylabel:'MSE sui dati esclusi',label:'Confronto di errore di cross-validation casuale e per blocchi spaziali'});
 var bars=[{x:.6,v:S.sampleCV.random,c:t.c1},{x:1.35,v:S.sampleCV.spatial,c:t.c2},{x:2.05,v:random,c:t.c1},{x:2.72,v:block,c:t.c2}];bars.forEach(function(v){if(!Number.isFinite(v.v))return;P.svg('rect',{x:p.x(v.x-.20),y:p.y(v.v),width:p.x(v.x+.20)-p.x(v.x-.20),height:Math.max(1,p.y(0)-p.y(v.v)),rx:3,fill:v.c,'fill-opacity':v.x>2?.45:.85},p.g);svgText(p.root,p.x(v.x),p.y(v.v)-8,ff(v.v,2),{'text-anchor':'middle','font-size':11});});
 svgText(p.root,p.x(.98),p.y(0)+23,'Campione corrente',{'text-anchor':'middle'});svgText(p.root,p.x(2.35),p.y(0)+23,'Media MC',{'text-anchor':'middle'});
 svgText(p.root,106,21,'Blu: random CV  ·  arancio: spatial block CV',{'font-size':11});mcInfo.textContent=arr.length+' / '+S.B+' repliche · premi Avvia, Passo o Completa';}
function rows(){var fit=S.fits[S.chosen],ols=S.fits.ols,ar=S.fits.sar,er=S.fits.sem,r=visibleReps();var mR=r.length?r.reduce((s,x)=>s+x.random,0)/r.length:NaN,mS=r.length?r.reduce((s,x)=>s+x.spatial,0)/r.length:NaN;
 var list=[
 ['Generatore','SAR, SEM oppure errori indipendenti',S.type.toUpperCase()+' · ρ='+ff(S.data.rho,2),'simulazione'],
 ['Campione e pesi','Griglia 6 × 6; rook; somme di riga 1',S.data.y.length+' territori','esatto'],
 ['Parametro SAR stimato','Massimo della logL sulla griglia 33 punti',ff(ar.rho,2),'stima ML su griglia'],
 ['Parametro SEM stimato','Massimo della logL sulla griglia 33 punti',ff(er.rho,2),'stima ML su griglia'],
 ['β covariata: OLS / SAR / SEM','Modelli stimati sullo stesso campione',ff(ols.beta[1],2)+' / '+ff(ar.beta[1],2)+' / '+ff(er.beta[1],2),'stima'],
 ['LogL: OLS / SAR / SEM','Valori condizionati alla stessa n',ff(ols.logLik,2)+' / '+ff(ar.logLik,2)+' / '+ff(er.logLik,2),'profilo'],
 ['Moran delle innovazioni ('+S.chosen.toUpperCase()+')','Descrittivo: nessun p-value implicito',ff(A.moran(fit.innovation,S.data.W).I),'statistica'],
 ['Effetti SAR diretti / indiretti / totali','Moltiplicatori di (I−ρW)⁻¹',ff(S.impacts.direct,2)+' / '+ff(S.impacts.indirect,2)+' / '+ff(S.impacts.total,2),'modello'],
 ['MSE random / block CV','Stessa regressione kNN spaziale, k = '+S.k,ff(S.sampleCV.random,3)+' / '+ff(S.sampleCV.spatial,3),'test'],
 ['MSE medio MC random / block','Nuove innovazioni, stesso X e stessi fold',ff(mR,3)+' / '+ff(mS,3),'Monte Carlo'],
 ['Repliche eseguite','Target B='+S.B,r.length,'conteggio']
 ];tbody.innerHTML='';list.forEach(r=>{tbody.append(el('tr',r.map(x=>el('td',String(x)))));});kpis.innerHTML='';kpis.append(el('div.kpi',el('b',ff(ar.rho,2)),el('span','SAR: ρ stimato')),el('div.kpi',el('b',ff(er.rho,2)),el('span','SEM: λ stimato')),el('div.kpi',el('b',r.length+' / '+S.B),el('span','repliche CV')));
 interp.innerHTML='';interp.append(el('p','La risposta è stata generata dal modello '+S.type.toUpperCase()+'. La stima utilizza la log-verosimiglianza gaussiana con varianza profilata e una griglia fissa per il parametro spaziale; il massimo è quindi approssimato alla risoluzione della griglia, non ottenuto da un ottimizzatore continuo.'),el('p','Nel SAR, il coefficiente della covariata non coincide con l’effetto medio totale: la risposta si propaga tramite (I−ρW)⁻¹. Nel SEM la dipendenza riguarda l’errore, non produce automaticamente gli stessi spillover del SAR.'),el('p','La random CV mescola territori vicini tra training e test; i blocchi spaziali escludono invece fasce intere. Il secondo schema valuta una domanda di trasferimento geografico diversa: un errore maggiore non significa che sia sempre la scelta giusta per qualunque problema.'),el('p','Le curve Monte Carlo riguardano soltanto la performance kNN sui fold fissati. Non sono intervalli di confidenza per ρ, per i coefficienti o per gli effetti spaziali.'));
}
function render(){drawMap();drawProfile();drawImpacts();drawCV();rows();}
function select(label,key,options,callback){return el('label.field',el('span',label),el('select',{onchange:function(){S[key]=this.value;callback();}},options.map(x=>el('option',{value:x[0],selected:String(x[0])===String(S[key])},x[1]))));}
function slider(label,key,min,max,step,callback){return SA.ui.slider(label,{min:min,max:max,step:step,value:S[key],format:v=>ff(v,2),onchange:function(v){S[key]=v;callback();}});}
function controlsBuild(){controls.innerHTML='';controls.append(select('Generatore','type',[['sar','SAR: risposta dipendente'],['sem','SEM: errori dipendenti'],['independent','Errori indipendenti']],update),slider('Dipendenza vera ρ o λ','rho',-.7,.75,.05,update),select('Modello da ispezionare','chosen',[['ols','OLS'],['sar','SAR'],['sem','SEM']],render),select('Mappa visualizzata','view',[['response','Risposta osservata'],['residual','Residui grezzi'],['innovation','Innovazioni stimate']],render),select('Colora i fold','showFolds',[['none','No'],['random','Random CV'],['block','Spatial blocks']],render),select('Vicini k del predittore CV','k',[['1','1'],['3','3'],['5','5']],function(){S.k=+S.k;updateK();}),select('Repliche B','B',[['29','29'],['49','49'],['99','99']],function(){S.B=+S.B;run.stop();render();run.refresh();}),el('label.field',el('span','Seed'),el('input',{type:'number',min:1,value:S.seed,onchange:function(){S.seed=Math.max(1,Math.floor(+this.value||1));update();}})),SA.ui.button('Nuovo campione',{cls:'btn-ghost',onclick:function(){S.seed++;update();controlsBuild();}}));run.controls('Una replica di validazione').forEach(x=>controls.append(x));}
function prediction(){choice.innerHTML='';var opts=[['a','La dipendenza nella risposta (SAR) produce effetti indiretti, mentre il modello SEM agisce sulla struttura degli errori.'],['b','Un coefficiente SAR di regressione è già l’effetto medio totale, per ogni W.'],['c','La cross-validation spaziale garantisce errori sempre inferiori a quella casuale.']];choice.append(el('p.prose','Che cosa cambia tra dipendenza nella risposta e negli errori, e come la valuteresti?'),el('div.choices',{role:'radiogroup','aria-label':'Previsione sulla regressione spaziale'},opts.map((v,i)=>el('div.choice',el('input',{type:'radio',name:'spreg-pred',id:'spreg-'+i,value:v[0],onchange:function(){feedback.hidden=false;feedback.textContent=v[0]==='a'?'✓ Corretto: nel SAR la matrice moltiplicatrice trasmette anche effetti indiretti.':'Riconsidera le ipotesi: dipendenza negli errori e nella risposta non sono equivalenti; uno schema CV risponde a un preciso obiettivo predittivo.';}}),el('label',{for:'spreg-'+i},v[1])))));feedback=el('div.feedback',{role:'status',hidden:true});choice.append(feedback);}
function scriptR(){var d=S.data,fs=S.fits;var v=x=>Number(x).toPrecision(17);return [
 '# StatAtlas · LAB 31 — SAR, SEM, OLS e cross-validation spaziale',
 '# R1: stesse 36 risposte e covariate, stessa W rook normalizzata, stessa griglia rho.',
 'nrow_sp <- 6L; ncol_sp <- 6L; n <- 36L',
 'y <- c('+d.y.map(v).join(',')+')',
 'x <- c('+d.x.map(v).join(',')+')',
 'W <- matrix(0,n,n)',
 'for(i in seq_len(n)){r <- (i-1L)%/%ncol_sp; c0 <- (i-1L)%%ncol_sp;',
 '  for(j in seq_len(n)){rr <- (j-1L)%/%ncol_sp; cc <- (j-1L)%%ncol_sp;',
 '    if(abs(r-rr)+abs(c0-cc)==1L)W[i,j] <- 1 }}',
 'W <- W / rowSums(W); X <- cbind(1,x); rho_grid <- seq(-.8,.8,by=.05)',
 'fit_rho <- function(type,rho){ A<-diag(n)-rho*W; yt<-drop(A%*%y);',
 '  Xt<-if(type=="sem") A%*%X else X;',
 '  bh<-drop(solve(crossprod(Xt),crossprod(Xt,yt))); u<-drop(yt-Xt%*%bh);',
 '  s2<-sum(u^2)/n; ll<-if(type=="ols")0 else as.numeric(determinant(A,logarithm=TRUE)$modulus);',
 '  list(beta=bh,sigma2=s2,ll=ll-n/2*(log(2*pi*s2)+1), innovation=u) }',
 'ols<-fit_rho("ols",0)',
 'prof<-function(type){all<-lapply(rho_grid,function(r)fit_rho(type,r)); z<-which.max(vapply(all,function(a)a$ll,0.)); c(all[[z]],list(rho=rho_grid[z]))}',
 'sar<-prof("sar");sem<-prof("sem")',
 'stopifnot(abs(ols$ll-('+v(fs.ols.logLik)+'))<1e-7)',
 'stopifnot(abs(sar$rho-('+v(fs.sar.rho)+'))<1e-9,abs(sem$rho-('+v(fs.sem.rho)+'))<1e-9)',
 'stopifnot(max(abs(sar$beta-c('+fs.sar.beta.map(v).join(',')+')))<1e-7)',
 'stopifnot(max(abs(sem$beta-c('+fs.sem.beta.map(v).join(',')+')))<1e-7)',
 'stopifnot(abs(sar$ll-('+v(fs.sar.logLik)+'))<1e-7, abs(sem$ll-('+v(fs.sem.logLik)+'))<1e-7)',
 'H<-solve(diag(n)-sar$rho*W); direct<-mean(diag(H))*sar$beta[2]; total<-mean(rowSums(H))*sar$beta[2]',
 'stopifnot(abs(direct-('+v(S.impacts.direct)+'))<1e-7,abs(total-('+v(S.impacts.total)+'))<1e-7)',
 'cat("OK: stesso dataset, SAR/SEM, verosimiglianza, beta e impatti (R1)\\n")',
 'fold_random<-c('+S.randomFolds.map(x=>x+1).join(',')+'); fold_block<-c('+S.blockFolds.map(x=>x+1).join(',')+')',
 'coords<-cbind(rep(0:(ncol_sp-1L),times=nrow_sp),rep(0:(nrow_sp-1L),each=ncol_sp))',
 'cv <- function(folds,k){ss<-0;for(f in sort(unique(folds))){te<-which(folds==f);tr<-which(folds!=f);',
 '  for(i in te){dist<-sqrt(rowSums((coords[tr,,drop=FALSE]-matrix(coords[i,],length(tr),2,byrow=TRUE))^2));',
 '    ii<-order(dist,tr)[seq_len(k)];ww<-1/(dist[ii]+1e-9);pr<-sum(ww*y[tr[ii]])/sum(ww);ss<-ss+(y[i]-pr)^2 }};ss/n }',
 'stopifnot(abs(cv(fold_random,'+S.k+')-('+v(S.sampleCV.random)+'))<1e-9,abs(cv(fold_block,'+S.k+')-('+v(S.sampleCV.spatial)+'))<1e-9)',
 'cat("OK: random CV e spatial block CV sui medesimi dati e fold (R1)\\n")',
 '# Con spatialreg::lagsarlm/errorsarlm: confrontare come metodo (R3);',
 '# gli ottimizzatori continui non coincidono necessariamente con il profilo discreto a passo .05.',
 '# I fold geografici rappresentano tre bande verticali contigue; KNN usa le sole coordinate.'
 ].join('\n');}
var THEORY={base:function(){return el('div.prose',{html:'<h3>1. Perché la regressione spaziale?</h3><p>Nei dati territoriali i valori vicini possono dipendere l’uno dall’altro. La regressione OLS standard spiega y usando X ma non distingue la dipendenza della risposta dalla dipendenza degli errori. Una struttura spaziale non correttamente descritta può alterare inferenza e previsioni.</p><h3>2. Pesi e modelli</h3><p>W è la matrice rook dei 36 territori, normalizzata per riga, con diagonale zero. Il SAR assume y=ρWy+Xβ+ε: una variazione della covariata in un territorio può propagarsi agli altri tramite (I−ρW)⁻¹. Il SEM assume y=Xβ+u, u=λWu+ε: la dipendenza riguarda gli errori.</p><h3>3. Interpretare i grafici</h3><p>La mappa mostra y o i residui. I profili SAR e SEM rappresentano la log-verosimiglianza gaussian ML con σ²=RSS/n e la stessa griglia di 33 valori di ρ/λ fra −0,8 e 0,8. La linea OLS è il riferimento senza parametro spaziale. Il pannello degli impatti utilizza il SAR STIMATO, non il vero processo generatore.</p><h3>4. Validare lontano dai dati osservati</h3><p>Per la validazione confrontiamo lo stesso kNN spaziale (coordinate e distanza euclidea), con k selezionabile. Random CV mescola i siti, mentre spatial block CV esclude intere bande contigue. I due schemi misurano prestazioni per obiettivi predittivi differenti.</p><h3>5. Usa l’esperimento</h3><p>Modifica il generatore e la forza della dipendenza; confronta OLS, SAR e SEM senza cambiare dati. Mostra i fold sulla mappa, scegli k e osserva i due errori CV. Per replicare la validazione su nuovi campioni premi Passo o Completa: i dati visualizzati restano fissi.</p><div class="callout warn"><strong>Attenzione:</strong> la matrice W e la struttura di dipendenza sono assunzioni, non fatti stabiliti dalla sola prossimità geografica. La validazione spaziale non deve essere automaticamente preferita alla casuale: dipende dall’obiettivo della previsione.</div>'});},adv:function(){return el('div.prose',{html:'<h3>1. Esistenza e forma ridotta del SAR</h3><p>Per Aρ=I−ρW invertibile, y=Aρ⁻¹Xβ+Aρ⁻¹ε. Con W row-standardizzata e |ρ|<1, l’inversa esiste e si può espandere nella serie ∑ₕ₌₀∞ρʰWʰ. Pertanto β non coincide con una derivata marginale territoriale indipendente dallo spazio.</p><h3>2. Stima ML e Jacobiano</h3><p>Nel SAR, la trasformazione ε=Aρy−Xβ contribuisce con log|det Aρ| alla log-verosimiglianza. Nel SEM, la trasformazione ε=Aλ(y−Xβ) richiede trasformare anche la matrice delle covariate. I due profili differiscono in generale; la varianza ML profilata è RSS/n, non RSS/(n−p).</p><h3>3. Profilo su griglia: approssimazione dichiarata</h3><p>Per rendere visibile ogni punto della funzione obiettivo, il laboratorio massimizza su {−0,80,−0,75,…,0,80}; non calcola un massimo continuo né intervalli di confidenza, e una stima al bordo va interpretata con cautela. Il log-determinante è calcolato mediante eliminazione LU con pivoting; i coefficienti condizionati al parametro sono calcolati mediante QR.</p><h3>4. Diretti, indiretti, totali</h3><p>Per il SAR, le derivate rispetto alla covariata sono Hβ, con H=(I−ρW)⁻¹. L’effetto diretto medio è β·tr(H)/n; l’effetto totale medio è β·1ᵀH1/n e l’indiretto è la differenza. Con W row-standardizzata, il totale è β/(1−ρ). Non si attribuisce alcun significato causale senza ulteriori assunzioni.</p><h3>5. Residui e identificazione</h3><p>Un Moran residuo elevato può segnalare dipendenza residua, ma un valore basso non garantisce la correttezza dell’intero modello. SAR e SEM possono produrre pattern simili su campioni piccoli. La scelta della matrice W e la presenza di confondenti spaziali influenzano identificazione e interpretazione.</p><h3>6. Validazione e dipendenza</h3><p>Se dati di training e test sono geograficamente vicini, una validazione casuale può stimare una prestazione troppo ottimistica per un’applicazione a territori remoti. Il blocco spaziale, tuttavia, cambia la distribuzione delle distanze di previsione e può essere eccessivamente pessimista se l’uso finale è interpolare fra aree già osservate.</p><h3>7. Disegno e limiti</h3><p>La simulazione ha 36 territori, rook normalizzata, covariata e rumore gaussiani; i parametri reali sono noti al simulatore. Non implementa SEM con eteroschedasticità, covariate endogene, spillover causali, SARAR, panel spaziale o bootstrap per l’incertezza di ML. La Monte Carlo ripete solo la CV kNN sui medesimi fold, non la distribuzione degli stimatori spaziali.</p>'});}};
SA.registerLab('regressione-spaziale',{mount:function(page,info){el=SA.ui.el;S=make();generate();run=SA.ui.runner({speed:1,coop:true,step:replicate,render:render,done:done,progress:()=>Math.min(S.reps.length,S.B)/S.B,reset:reset});function theory(level){SA.ui.openDrawer('Regressione spaziale e validazione geografica',THEORY,level);}
 page.append(el('header.lab-head',el('div',el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),el('h1',info.lab.title),el('p.lede','Che cosa cambia se i territori non sono indipendenti? Modelli SAR/SEM, propagazione degli effetti e validazione geografica.')),SA.ui.button('Approfondisci',{icon:'book',onclick:()=>theory()})));
 var q=SA.ui.step('1','Domanda');q.body.append(el('p.question','Una regressione può ignorare l’autocorrelazione spaziale senza cambiare inferenza, interpretazione e capacità predittiva?'));
 var p=SA.ui.step('2','La tua previsione');choice=el('div');p.body.append(choice);
 var ex=SA.ui.step('3','Esperimento','Dalla dipendenza alle previsioni fuori regione');controls=el('div.panel.controls');mapBox=el('div');profileBox=el('div');impactBox=el('div');cvBox=el('div');mcInfo=el('span.moran-perm-status');
 ex.body.append(el('div.moran-guide',{role:'note'},el('strong','Come utilizzare il laboratorio'),el('ol',el('li','Osserva i territori e seleziona SAR, SEM o errori indipendenti: confronta i profili di verosimiglianza per lo stesso campione.'),el('li','Scegli OLS, SAR o SEM e visualizza risposta, residui o innovazioni: il Moran residuo aiuta a valutare la dipendenza rimasta.'),el('li','Mostra i fold random o i blocchi: i colori numerati indicano chi viene escluso a turno dalla stima.'),el('li','Scegli k del predittore spaziale e confronta gli errori sui dati non utilizzati nel training.'),el('li','Premi Avvia, Passo o Completa per nuovi campioni. Nessuna simulazione parte automaticamente e i dati mostrati rimangono fissi.'))));
 var graphCol=el('div.figure');
 graphCol.append(
  el('div.fig',el('div.fig-title',el('h3','Territori, residui e fold geografici')),mapBox),
  el('div.fig',el('div.fig-title',el('h3','Profili di verosimiglianza: SAR e SEM')),profileBox),
  el('div.fig',el('div.fig-title',el('h3','Effetti SAR diretti e indiretti')),impactBox),
  el('div.fig',el('div.fig-title',el('h3','Validazione casuale e spaziale'),mcInfo),cvBox)
 );
 var toolbar=el('div.toolbar');
 toolbar.append(SA.ui.button('Dati e fold CSV',{icon:'download',cls:'btn-ghost',onclick:function(){
  var d=S.data,rows=[['id','row','col','x','y','fold_random','fold_spatial','OLS_innovation','SAR_innovation','SEM_innovation']];
  d.xy.forEach((p,i)=>rows.push([i+1,p.row+1,p.col+1,d.x[i],d.y[i],S.randomFolds[i]+1,S.blockFolds[i]+1,S.fits.ols.innovation[i],S.fits.sar.innovation[i],S.fits.sem.innovation[i]]));
  SA.ui.download('statatlas_lab31_regressione_spaziale.csv',SA.ui.csv(rows),'text/csv');
 }}));
 toolbar.append(SA.ui.button('Grafici PNG',{icon:'download',cls:'btn-ghost',onclick:function(){
  SA.ui.exportPNG([mapBox,profileBox,impactBox,cvBox].map(x=>x.querySelector('svg')),'statatlas_lab31_spaziale.png',['Regressione spaziale','seed '+S.seed]);
 }}));
 graphCol.append(toolbar);
 ex.body.append(el('div.lab-grid',controls,graphCol));
 var th=SA.ui.step('4','Teoria e simulazione a confronto');tbody=el('tbody');kpis=el('div.kpis');th.body.append(el('div.tbl-wrap',el('table.tv',el('thead',el('tr',el('th','Quantità'),el('th','Riferimento'),el('th','Risultato'),el('th','Natura'))),tbody)),kpis);
 var it=SA.ui.step('5','Interpretazione');interp=el('div.prose');it.body.append(interp,el('p',SA.ui.button('Teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:()=>theory('adv')})));
 var rp=SA.ui.step('6','Riproduci in R','Stesso campione, stessa matrice W, stessi fold');code=SA.ui.codeBlock(scriptR,'statatlas_lab31_regressione_spaziale.R');rp.body.append(el('p.prose','R0: dati e fold identici. R1: coefficienti, profili Gaussian ML sulla stessa griglia, impatti e CV. R3: spatialreg utilizza ottimizzazione e convenzioni potenzialmente differenti.'),code);
 page.append(q,p,ex,th,it,rp);controlsBuild();prediction();render();code.refresh();run.refresh();document.addEventListener('keydown',run.key);},unmount:function(){if(run){run.stop();document.removeEventListener('keydown',run.key);}},redraw:function(){if(S)render();}});
})();
