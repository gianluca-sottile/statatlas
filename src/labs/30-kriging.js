/* StatAtlas · LAB 30 — Kriging e posizionamento interattivo dei sensori.
 * Campo vero congelato durante le modifiche del disegno e del modello assunto.
 * Nessun avvio automatico, neppure dopo le modifiche dei controlli.
 * La varianza mostrata e' quella condizionata al modello assunto, per Z latente.
 */
(function(){
'use strict';
var el,S,run,controlBox,mapBox,predBox,varBox,mcBox,noteBox,mcStatus,tbody,kpis,interp,code,choiceBox,feedback;
var G=SA.geostat,K=SA.kriging,P=SA.plot;
var MODEL={exponential:'Esponenziale',spherical:'Sferico',gaussian:'Gaussiano'};
var METHOD={ordinary:'Kriging ordinario',simple:'Kriging semplice (media 0)',idw:'IDW (senza varianza modellistica)'};
function f(v,d){return Number.isFinite(v)?SA.fmt(v,d==null?3:d):'—';}
function initial(){return {seed:2026,model:'exponential',sigma2:1,phi:.25,nugget:.12,assumedModel:'exponential',assumedPhi:.25,method:'ordinary',exponent:2,n:12,mode:'add',moving:null,recommended:null,selected:0,showTruth:false,B:49,rep:[],prediction:null,message:''};}
function field(){
 var o={seed:S.seed,model:S.model,sigma2:S.sigma2,phi:S.phi,nugget:S.nugget,n:S.n,ratio:1,angle:0,trend:0};
 S.field=G.generate(o);S.ids=S.field.ids.slice();
 var rng=new SA.RRNG(S.seed+4103);
 S.allObserved=S.field.field.map(function(v){return v+Math.sqrt(S.nugget)*rng.norm();});
 // Cholesky del vero processo sulla griglia, RIUSATA per tutte le repliche.
 var C=G.covariance(S.field.grid,o,false);
 try {S.Ltrue=G.cholesky(C);}catch(e){for(var i=0;i<C.length;i++)C[i][i]+=1e-9*S.sigma2;S.Ltrue=G.cholesky(C);}
 S.moving=null;S.recommended=null;S.selected=S.ids[0];
}
function targets(){return S.field.grid;}
function sites(){return S.ids.map(function(i){return S.field.grid[i];});}
function measurements(){return S.ids.map(function(i){return S.allObserved[i];});}
function fitted(){return {model:S.assumedModel,sigma2:S.sigma2,phi:S.assumedPhi,nugget:S.nugget,ratio:1,angle:0};}
function resetRep(){S.rep=[];S.mcRng=new SA.RRNG(S.seed+7189);}
function refit(){
 S.design=K.geometry(sites(),targets(),fitted(),S.method,S.exponent);
 S.pred=K.predict(S.design,measurements());
 S.rmse=K.rmse(S.pred,S.field.field);S.mae=K.mae(S.pred,S.field.field);
 S.meanVar=K.meanFinite(S.design.variances);
 S.recommended=null;resetRep();
}
function stopRefit(){run.stop();refit();render();code.refresh();run.refresh();}
function regenerate(){run.stop();field();refit();buildControls();render();code.refresh();run.refresh();}
function done(){return S.rep.length>=S.B;}
function repVisible(){return S.rep.slice(0,S.B);}
function step(){
 if(done())return false;
 var latent=Array.from(G.sample(S.Ltrue,S.mcRng));
 var yy=S.ids.map(function(i){return latent[i]+Math.sqrt(S.nugget)*S.mcRng.norm();});
 var pred=K.predict(S.design,yy);
 S.rep.push({rmse:K.rmse(pred,latent),mae:K.mae(pred,latent)});
 return true;
}
function updateDesign(index){
 var at=S.ids.indexOf(index);
 if(S.mode==='add'){
  if(at>=0){S.selected=index;S.message='Sensore già presente: selezionato.';render();return;}
  if(S.ids.length>=40){S.message='Limite didattico di 40 sensori raggiunto.';render();return;}
  S.ids.push(index);S.selected=index;S.message='Aggiunto il sensore nel sito '+(index+1)+'.';
 }else if(S.mode==='remove'){
  if(at<0){S.message='Clicca un sensore esistente per rimuoverlo.';render();return;}
  if(S.ids.length<=3){S.message='Servono almeno tre sensori.';render();return;}
  S.ids.splice(at,1);S.selected=S.ids[0];S.message='Sensore rimosso. Il campo vero non cambia.';
 }else if(S.mode==='move'){
  if(S.moving===null){if(at<0){S.message='Seleziona prima un sensore esistente.';render();return;}S.moving=index;S.selected=index;S.message='Ora scegli una cella libera per spostare il sensore.';render();return;}
  if(at>=0){S.message='La destinazione è occupata: scegli una cella libera.';render();return;}
  var origin=S.ids.indexOf(S.moving);if(origin>=0)S.ids[origin]=index;S.moving=null;S.selected=index;S.message='Sensore spostato: il campo è rimasto identico.';
 }else{S.selected=index;S.message='Cella '+(index+1)+': predizione '+f(S.pred[index])+', valore vero '+(S.showTruth?f(S.field.field[index]):'nascosto')+'.';render();return;}
 stopRefit();
}
function tx(parent,x,y,str,opts){return P.text(parent,x,y,String(str),Object.assign({fill:SA.theme().ink_2,'font-size':12},opts||{}));}
function surface(box,vals,opts){
 var t=SA.theme(),root=P.svg('svg',{viewBox:'0 0 710 360',role:'img','aria-label':opts.label,'font-family':t.sans},box);
 var x0=42,y0=12,cell=27,side=324,max=opts.max||Math.max(.5,...vals.filter(Number.isFinite).map(Math.abs));
 vals.forEach(function(v,i){
  var a=Math.min(1,Math.abs(v)/max),col=opts.positiveOnly?t.c3:(v>=0?t.c1:t.c2);
  P.svg('rect',{x:x0+(i%12)*cell,y:y0+(11-Math.floor(i/12))*cell,width:cell+.45,height:cell+.45,
     rx:.5,fill:opts.hidden?t.paper_2:col,'fill-opacity':opts.hidden?1:(.14+.75*a),stroke:t.rule,'stroke-width':.35},root);
 });
 [0,.5,1].forEach(function(v){tx(root,x0+v*side,y0+side+16,f(v,1),{'text-anchor':'middle'});tx(root,x0-8,y0+(1-v)*side+3,f(v,1),{'text-anchor':'end'});});
 tx(root,403,36,opts.heading,{'font-size':12,'font-weight':700,fill:t.ink});
 (opts.lines||[]).forEach(function(s,i){tx(root,403,70+27*i,s,{'font-size':13,fill:i===0?t.ink:t.ink_2});});
 tx(root,403,290,opts.footer||'',{'font-size':11,fill:t.ink_3});
 return {root:root,x0:x0,y0:y0,cell:cell,side:side};
}
function commonColorMax(){return Math.max(.5,...S.field.field.map(Math.abs),...S.pred.map(Math.abs));}
function drawMap(){
 mapBox.innerHTML='';var t=SA.theme(),s=surface(mapBox,S.field.field,{max:commonColorMax(),hidden:!S.showTruth,label:'Campo vero nascosto e disegno di campionamento modificabile',heading:'DISEGNO DEI SENSORI',lines:[S.ids.length+' sensori su 144 siti','Modalità: '+({add:'Aggiungi',move:'Sposta',remove:'Rimuovi',inspect:'Ispeziona'}[S.mode]),'Campo '+(S.showTruth?'svelato':'nascosto'),'Nugget osservazionale: '+f(S.nugget,2)],footer:'Scala ±'+f(commonColorMax(),2)+' · clicca una cella'});
 // Le celle trasparenti sono accessibili anche via tastiera.
 for(var i=0;i<144;i++)(function(i){
  var isSensor=S.ids.indexOf(i)>=0,elSvg=P.svg('rect',{x:s.x0+(i%12)*s.cell,y:s.y0+(11-Math.floor(i/12))*s.cell,width:s.cell,height:s.cell,
    fill:'transparent',tabindex:0,role:'button','aria-label':'Sito '+(i+1)+(isSensor?', sensore presente':''),'data-grid-index':i},s.root);
  var act=function(){updateDesign(i);};elSvg.addEventListener('click',act);
  elSvg.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
 })(i);
 if(S.recommended!==null){var p=S.field.grid[S.recommended];P.svg('circle',{cx:s.x0+p.x*s.side,cy:s.y0+(1-p.y)*s.side,r:12,fill:'none',stroke:t.c3,'stroke-width':3,'stroke-dasharray':'4 3','pointer-events':'none'},s.root);}
 S.ids.forEach(function(i){
  var g=S.field.grid[i],cx=s.x0+g.x*s.side,cy=s.y0+(1-g.y)*s.side;
  P.svg('circle',{cx:cx,cy:cy,r:S.selected===i?7.8:5.7,fill:t.ink,stroke:S.moving===i?t.c3:t.card,'stroke-width':S.selected===i?3:1.5,'pointer-events':'none'},s.root);
  if(S.selected===i)P.svg('circle',{cx:cx,cy:cy,r:11,fill:'none',stroke:t.c3,'stroke-width':1.3,'pointer-events':'none'},s.root);
 });
 noteBox.textContent=S.message||'Campo vero fisso: aggiungi, sposta o rimuovi sensori senza rigenerare i dati. Seleziona «Mostra campo vero» soltanto dopo aver formulato una previsione.';
}
function drawPrediction(){
 predBox.innerHTML='';surface(predBox,S.pred,{max:commonColorMax(),label:'Superficie prevista mediante '+METHOD[S.method],heading:'PREVISIONE DEL CAMPO',lines:[METHOD[S.method],'Range assunto φ = '+f(S.assumedPhi,2),'RMSE sul campo: '+f(S.rmse,3),'MAE sul campo: '+f(S.mae,3)],footer:'Scala ±'+f(commonColorMax(),2)+' identica alla mappa vera'});
}
function drawVariance(){
 varbox_clear();
 if(S.method==='idw'){
  surface(varBox,new Array(144).fill(0),{hidden:true,label:'Varianza non definita per IDW',heading:'NESSUNA VARIANZA',lines:['IDW non ha una varianza','di kriging derivata dal modello.','Cambia metodo per visualizzarla.'],footer:'Un proxy di distanza non è una varianza predittiva.'});
 }else{
  surface(varBox,S.design.variances,{positiveOnly:true,max:Math.max(.1,...S.design.variances),label:'Varianza di predizione del campo latente',heading:'INCERTEZZA MODELLISTICA',lines:['Media: '+f(S.meanVar,3),'SD media: '+f(Math.sqrt(S.meanVar),3),'Modello: '+MODEL[S.assumedModel],'Nugget: '+f(S.nugget,2)],footer:'Non è l’errore effettivo della realizzazione.'});
 }
}
function varbox_clear(){varBox.innerHTML='';}
function drawMC(){
 var r=repVisible(),v=r.map(function(x){return x.rmse;}),top=Math.max(.5,S.rmse*1.3,...v)*1.22,t=SA.theme();
 var p=P.frame(mcBox,{W:710,H:260,x:[0,Math.max(10,S.B)],y:[0,top],xlabel:'Numero di repliche',ylabel:'RMSE della previsione',label:'Distribuzione Monte Carlo della performance del disegno fissato'});
 var points=v.map(function(x,i){return(i?'L':'M')+p.x(i+1)+','+p.y(x);}).join(' ');
 if(points)P.svg('path',{d:points,fill:'none',stroke:t.c1,'stroke-width':1.6},p.g);
 v.forEach(function(x,i){if(i%5===0||i===v.length-1)P.svg('circle',{cx:p.x(i+1),cy:p.y(x),r:2.6,fill:t.c1},p.g);});
 P.svg('line',{x1:p.x(0),x2:p.x(S.B),y1:p.y(S.rmse),y2:p.y(S.rmse),stroke:t.c2,'stroke-width':2,'stroke-dasharray':'5 4'},p.g);
 if(Number.isFinite(S.meanVar))P.svg('line',{x1:p.x(0),x2:p.x(S.B),y1:p.y(Math.sqrt(S.meanVar)),y2:p.y(Math.sqrt(S.meanVar)),stroke:t.c3,'stroke-width':2,'stroke-dasharray':'4 3'},p.g);
 tx(p.root,70,24,'— RMSE MC   – – campione osservato   – – SD modello',{'font-size':11});
 mcStatus.textContent=r.length+' / '+S.B+' repliche · nessuna partenza automatica';
}
function drawTable(){
 var r=repVisible(),sRMSE=r.length?r.reduce(function(a,b){return a+b.rmse*b.rmse;},0)/r.length:NaN;
 var rows=[
 ['Meccanismo generatore','Campo gaussiano con parametri noti',MODEL[S.model]+' · φ='+f(S.phi,2),'modello'],
 ['Parametri usati nella previsione','Possono essere differenti dai veri',MODEL[S.assumedModel]+' · φ='+f(S.assumedPhi,2),'assunzione'],
 ['Sensori e copertura','Selezione di siti spaziali',S.ids.length+' / 144','esatto'],
 ['Procedura di interpolazione','Simple, ordinary kriging oppure IDW',METHOD[S.method],'algoritmo'],
 ['Nugget di misura τ²','Diverso dalla varianza del campo latente',f(S.nugget,2),'parametro'],
 ['Errore RMSE sul campo vero','Una singola realizzazione, non la media',f(S.rmse,3),'simulazione'],
 ['Errore MAE sul campo vero','Media degli errori assoluti sui 144 siti',f(S.mae,3),'simulazione'],
 ['Varianza di kriging media','Solo per kriging; condizionata al modello',f(S.meanVar,3),'modello'],
 ['RMSE² medio sulle repliche','Calcolato su campi nuovi, stessi sensori',f(sRMSE,3),'Monte Carlo'],
 ['Rapporto MSE MC / varianza media','≈ 1 se modello corretto e molte repliche',f(sRMSE/S.meanVar,3),'Monte Carlo'],
 ['Repliche eseguite','B = '+S.B,r.length,'conteggio']
 ];tbody.innerHTML='';rows.forEach(function(a){tbody.append(el('tr',a.map(function(x){return el('td',String(x));})));});
 kpis.innerHTML='';kpis.append(el('div.kpi',el('b',String(S.ids.length)),el('span','sensori osservati')),
  el('div.kpi',el('b',f(S.rmse,3)),el('span','RMSE del campo')),
  el('div.kpi',el('b',String(r.length)+' / '+S.B),el('span','repliche Monte Carlo')));
 interp.innerHTML='';interp.append(
  el('p','La previsione utilizza '+METHOD[S.method].toLowerCase()+' con '+S.ids.length+' sensori. Il campo vero rimane identico finché non chiedi di rigenerarlo: così puoi isolare l’effetto della posizione dei sensori.'),
  el('p','Con '+(S.method==='idw'?'IDW non esiste una varianza di kriging derivata dalle ipotesi del modello.':'kriging, la varianza di predizione è calcolata assumendo che i parametri di covarianza siano noti. Non incorpora l’incertezza di stima dei parametri.')),
  el('p','La simulazione Monte Carlo genera nuovi campi indipendenti sugli stessi siti osservati, mantenendo fissati i sensori e il metodo di previsione. Confronta RMSE² empirico e media della varianza teorica, non l’RMSE di una sola mappa.'),
  el('p',S.model===S.assumedModel&&S.phi===S.assumedPhi?'Il modello assunto coincide con il generatore: la calibrazione Monte Carlo dovrebbe migliorare al crescere di B.':'Il modello assunto è differente dal generatore: la varianza del kriging può essere mal calibrata. La discrepanza è parte dell’esperimento.')
 );
}
function render(){drawMap();drawPrediction();drawVariance();drawMC();drawTable();}
function buildControls(){
 controlBox.innerHTML='';
 function select(label,key,options,action){return el('label.field',el('span',label),el('select',{onchange:function(){S[key]=this.value;action();}},options.map(function(x){return el('option',{value:x[0],selected:String(S[key])===String(x[0])},x[1]);})));}
 function slider(label,key,min,max,step,action){return SA.ui.slider(label,{min:min,max:max,step:step,value:S[key],format:function(v){return f(v,2);},onchange:function(v){S[key]=v;action();}});}
 controlBox.append(
  select('Meccanismo generatore','model',Object.keys(MODEL).map(function(x){return [x,MODEL[x]];}),regenerate),
  slider('Range vero φ','phi',.09,.5,.01,regenerate),
  slider('Nugget di misura τ²','nugget',0,.5,.05,regenerate),
  select('Metodo di previsione','method',Object.keys(METHOD).map(function(x){return [x,METHOD[x]];}),stopRefit),
  select('Covarianza assunta','assumedModel',Object.keys(MODEL).map(function(x){return [x,MODEL[x]];}),stopRefit),
  slider('Range assunto φ','assumedPhi',.09,.5,.01,stopRefit),
  select('Strumento sui sensori','mode', [['add','Aggiungi'],['move','Sposta'],['remove','Rimuovi'],['inspect','Ispeziona']],function(){S.moving=null;render();}),
  select('Mostra campo vero','showTruth',[['false','No, tienilo nascosto'],['true','Sì, svela la risposta']],function(){S.showTruth=S.showTruth==='true';render();}),
  select('Repliche B','B',[['29','29'],['49','49'],['99','99']],function(){S.B=+S.B;run.stop();render();run.refresh();}),
  el('label.field',el('span','Seed'),el('input',{type:'number',min:1,value:S.seed,onchange:function(){S.seed=Math.max(1,Math.floor(+this.value||1));regenerate();}})),
  SA.ui.button('Rigenera il campo',{cls:'btn-ghost',onclick:function(){S.seed++;regenerate();}}),
  SA.ui.button('Indica la zona più incerta',{cls:'btn-ghost',onclick:function(){if(S.method==='idw'){S.message='IDW non fornisce una varianza di kriging. Seleziona un metodo di kriging.';render();return;}var best=-1,v=-Infinity;S.design.variances.forEach(function(x,i){if(S.ids.indexOf(i)<0&&x>v){best=i;v=x;}});S.recommended=best;S.message='Cerchio arancione: maggiore varianza PUNTUALE tra le celle libere. Non coincide necessariamente col disegno di minimo IMSE; clicca per aggiungere il sensore.';render();}}),
  SA.ui.button('Azzera il disegno (12 sensori)',{cls:'btn-ghost',onclick:function(){run.stop();S.ids=S.field.ids.slice();S.selected=S.ids[0];S.moving=null;S.message='Disegno iniziale ripristinato, senza rigenerare il campo.';refit();render();run.refresh();}})
 );
 run.controls('Un nuovo campo simulato').forEach(function(c){controlBox.append(c);});
}
function choices(){
 choiceBox.innerHTML='';var opts=[['a','Aggiungere un sensore può ridurre la varianza teorica di kriging se il modello rimane fissato.'],['b','Spostare un sensore deve sempre diminuire l’RMSE in una singola realizzazione.'],['c','IDW fornisce automaticamente la stessa varianza di previsione del kriging.']];
 choiceBox.append(el('p.prose','Che cosa prevedi quando aggiungi un nuovo sensore a una rete di misura?'),
  el('div.choices',{role:'radiogroup','aria-label':'Previsione sul kriging'},opts.map(function(q,i){return el('div.choice',el('input',{type:'radio',name:'kriging-pred',id:'kriging-pred-'+i,value:q[0],onchange:function(){S.prediction=this.value;feedback.hidden=false;feedback.textContent=q[0]==='a'?'✓ Corretto. Con parametri noti, l’informazione aggiuntiva non aumenta la varianza di kriging. L’RMSE su un campo particolare, invece, può aumentare.':'Non proprio. La varianza teorica non coincide con l’errore realizzato; IDW non fornisce una varianza di kriging.';}}),el('label',{for:'kriging-pred-'+i},q[1]));})));
 feedback=el('div.feedback',{role:'status',hidden:true});choiceBox.append(feedback);
}
function codeR(){
 var d=S.field.grid,ids=S.ids,obs=measurements(),o=fitted();
 return [
  '# StatAtlas · LAB 30 · stesso campo e stessi siti: R1 su predizioni e varianze',
  '# Il vettore truth e\' disponibile per la verifica del simulatore, non per la stima.',
  'grid <- cbind(x=c('+d.map(function(p){return p.x.toPrecision(16);}).join(',')+'),',
  '              y=c('+d.map(function(p){return p.y.toPrecision(16);}).join(',')+'))',
  'ids <- c('+ids.map(function(i){return i+1;}).join(',')+')',
  'z <- c('+obs.map(function(x){return x.toPrecision(17);}).join(',')+')',
  'truth <- c('+S.field.field.map(function(x){return x.toPrecision(17);}).join(',')+')',
  'ref_pred <- c('+S.pred.map(function(x){return x.toPrecision(17);}).join(',')+')',
  'ref_var <- c('+S.design.variances.map(function(x){return Number.isFinite(x)?x.toPrecision(17):'NA_real_';}).join(',')+')',
  'method <- "'+S.method+'"; cov_model <- "'+o.model+'"',
  'phi <- '+o.phi+'; sig2 <- '+o.sigma2+'; nugget <- '+o.nugget,
  'distance <- function(A,B) sqrt(outer(A[,1],B[,1],"-")^2 + outer(A[,2],B[,2],"-")^2)',
  'corfun <- function(D){u<-D/phi;if(cov_model=="gaussian")exp(-u*u) else if(cov_model=="spherical")ifelse(u>=1,0,1-1.5*u+.5*u^3) else exp(-u)}',
  'sites <- grid[ids,,drop=FALSE];D<-distance(sites,sites); C <- sig2*corfun(D)+diag(nugget,nrow(sites))',
  'cross <- sig2*corfun(distance(sites,grid))',
  'if(method=="idw") {',
  '  W <- sapply(seq_len(nrow(grid)),function(j){ d <- sqrt(rowSums((sites-matrix(grid[j,],nrow(sites),2,byrow=TRUE))^2)); if(any(d<1e-12)){w<-as.numeric(d==0);return(w/sum(w))};a<-1/d^'+S.exponent+';a/sum(a) })',
  '  pred <- as.numeric(crossprod(W,z)); pv <- rep(NA_real_,nrow(grid))',
  '}else{',
  '  A<-solve(C,cross)',
  '  if(method=="ordinary") {b<-solve(C,rep(1,nrow(sites)));nu<-(colSums(A)-1)/sum(b);W<-A-b%o%nu}else {nu<-rep(0,ncol(A));W<-A}',
  '  pred<-as.numeric(crossprod(W,z));pv<-pmax(0,sig2-colSums(W*cross)-nu)',
  '}',
  'stopifnot(max(abs(pred-ref_pred))<1e-7, isTRUE(all.equal(is.na(pv),is.na(ref_var))))',
  'stopifnot(max(abs(pv[is.finite(ref_var)]-ref_var[is.finite(ref_var)]),0)<1e-7)',
  'cat("OK: predizioni, varianze e identita R1 rispetto al motore JS\\n")',
  'cat("RMSE campo latente:",sqrt(mean((pred-truth)^2)),"\\n")',
  '# gstat::krige(): confronto facoltativo; attenzione alla distinzione latente / osservazione e alla parametrizzazione del nugget.'
 ].join('\n');
}
var THEORY={
base:function(){return el('div.prose',{html:'<h3>1. Qual è il problema?</h3><p>Osserviamo Y(sᵢ)=Z(sᵢ)+εᵢ in pochi sensori, ma vogliamo prevedere il campo latente Z(s₀) in tutta la regione. Il simulatore conserva una realizzazione vera per confrontare predizione ed errore, mentre lo studente non la conosce.</p><h3>2. Dipendenza, non solo distanza</h3><p>IDW media le osservazioni con pesi inversamente proporzionali a una potenza della distanza. Il kriging utilizza invece un modello di covarianza: la geometria di tutti i sensori e la dipendenza tra le misure entrano simultaneamente nei pesi.</p><h3>3. Due tipi di kriging</h3><p>Il kriging semplice assume nota la media, qui fissata a zero; il kriging ordinario assume una media costante ma ignota e impone che i pesi sommino a uno. La seconda ipotesi non significa che la media venga stimata da una semplice media non pesata.</p><h3>4. Rumore di misura</h3><p>La matrice di covarianza delle osservazioni è C<sub>Y</sub>=C<sub>Z</sub>+τ²I. La covarianza tra valore latente bersaglio e sensori contiene solo C<sub>Z</sub>. Con nugget positivo, la previsione del campo latente nel punto di un sensore non coincide necessariamente con la misura rumorosa.</p><h3>5. Progetta i sensori</h3><p>Clicca celle per aggiungere sensori, oppure scegli la modalità Sposta (origine e destinazione). La superficie prevista e la varianza teorica cambiano subito, ma l’esperimento Monte Carlo resta fermo finché non premi Avvia. Solo l’opzione Mostra campo vero rivela la realizzazione nascosta.</p><div class="callout warn"><strong>Attenzione:</strong> l’incertezza di kriging è condizionata al modello e ai parametri assunti; se la covarianza è errata può essere mal calibrata. L’RMSE osservato su una mappa è una realizzazione, non la varianza teorica.</div>'});},
adv:function(){return el('div.prose',{html:'<h3>Predittore lineare ottimo e covarianze</h3><p>Per Z₀ latente e Y vettore delle osservazioni, poniamo C=Cov(Y,Y), c=Cov(Y,Z₀) e σ²=Var(Z₀). Con media nota zero, w=C⁻¹c è il predittore lineare di errore quadratico minimo e la varianza è σ²−cᵀC⁻¹c. La normalità non è necessaria per la migliore predizione lineare, ma rende il predittore anche media condizionale.</p><h3>Kriging ordinario e moltiplicatore</h3><p>Richiedendo non distorsione per una media costante ignota, 1ᵀw=1, si risolve Cw+ν1=c, 1ᵀw=1. Con questa convenzione, Var(Z₀−wᵀY)=σ²−wᵀc−ν. La varianza della predizione di una nuova osservazione rumorosa sarebbe maggiore di τ² rispetto a quella del processo latente, assumendo rumore indipendente.</p><h3>Cholesky e stabilità numerica</h3><p>Il sistema è risolto mediante Cholesky di C e sostituzioni triangolari, senza calcolare esplicitamente l’inversa. Siti duplicati sono vietati; se τ²=0 e la geometria produce una matrice numericamente degenere, il laboratorio richiede una configurazione ammissibile anziché occultare il problema.</p><h3>Specificazione scorretta</h3><p>La superficie e la mappa della varianza sono costruite con il modello ASSUNTO, non necessariamente con quello generatore. Variando φ o la famiglia di covarianza assunta senza rigenerare il campo, si distingue la qualità della previsione sulla realizzazione corrente dalla calibrazione delle varianze su campi indipendenti.</p><h3>Ottimalità e disegno</h3><p>Sotto il modello corretto, aggiungere un’osservazione non aumenta la varianza minima teorica; questo NON implica diminuzione dell’errore realizzato in ogni campione. Un criterio per il disegno è l’integrated mean squared prediction error, approssimato dalla media delle varianze sulla griglia. La scelta del prossimo sensore non richiede necessariamente visitare il punto con valore previsto massimo.</p><h3>Confronto con IDW e validazione</h3><p>IDW non è, in generale, un BLUP e non fornisce la stessa varianza modellistica del kriging. Il confronto è sensato solo su uno stesso insieme di dati e bersagli. La simulazione su campi indipendenti verifica la calibrazione usando la media degli RMSE² (MSE), non la media dei soli RMSE.</p><h3>Limiti del laboratorio</h3><p>Parametri assunti noti, dominio quadrato sintetico, campo gaussiano a media zero, covariance esponenziale/sferica/gaussiana e nugget di misura. La stima del variogramma, il kriging universale con trend e la propagazione dell’incertezza dei parametri richiedono ulteriori strumenti e non sono implementati.</p>'});}
};
SA.registerLab('kriging',{
mount:function(page,info){
 el=SA.ui.el;S=initial();field();refit();run=SA.ui.runner({speed:1,coop:true,step:step,render:render,done:done,progress:function(){return Math.min(S.rep.length,S.B)/S.B;},reset:resetRep});
 function theory(level){SA.ui.openDrawer('Kriging e disegno dei sensori',THEORY,level);}
 page.append(el('header.lab-head',el('div',el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),el('h1',info.lab.title),el('p.lede','Dove misurare? Superficie prevista, varianza del kriging e conseguenze del disegno di campionamento.')),SA.ui.button('Approfondisci',{icon:'book',onclick:function(){theory();}})));
 var q=SA.ui.step('1','Domanda');q.body.append(el('p.question','Se puoi aggiungere un solo sensore, dove lo collocheresti per ridurre l’incertezza sulla superficie?'));
 var ch=SA.ui.step('2','La tua previsione');choiceBox=el('div');ch.body.append(choiceBox);
 var ex=SA.ui.step('3','Esperimento','Posiziona sensori, prevedi e verifica l’incertezza');
 controlBox=el('div.panel.controls');mapBox=el('div');predBox=el('div');varBox=el('div');mcBox=el('div');noteBox=el('p.moran-map-info');mcStatus=el('span.moran-perm-status');
 ex.body.append(el('div.moran-guide',{role:'note'},el('strong','Come utilizzare il laboratorio'),el('ol',
  el('li','La mappa parte con 12 sensori e il campo vero nascosto. Seleziona Aggiungi e clicca una cella libera, oppure Sposta (sensore di partenza e cella di destinazione).'),
  el('li','Confronta superficie prevista e varianza: «Indica la zona più incerta» evidenzia il sito con varianza puntuale massima; non è un ottimo globale di disegno.'),
  el('li','Passa da ordinary a simple kriging o IDW; modifica il range assunto lasciando invariato il campo vero per studiare la specificazione errata.'),
  el('li','Premi Passo o Completa per nuovi campi con gli stessi sensori e confronta MSE realizzato e varianza teorica.'),
  el('li','Attiva Mostra campo vero per verificare l’errore, oppure Rigenera il campo per creare un nuovo problema.'))));
 ex.body.append(el('div.lab-grid',controlBox,el('div.figure',
  el('div.fig',el('div.fig-title',el('h3','Posizionamento interattivo dei sensori')),mapBox,noteBox),
  el('div.fig',el('div.fig-title',el('h3','Superficie stimata e confronto con il campo vero')),predBox),
  el('div.fig',el('div.fig-title',el('h3','Varianza di kriging del processo latente')),varBox),
  el('div.fig',el('div.fig-title',el('h3','Errore predittivo in esperimenti ripetuti'),mcStatus),mcBox),
  el('div.toolbar',
   SA.ui.button('Dati e previsioni CSV',{icon:'download',cls:'btn-ghost',onclick:function(){var rows=[['sito','x','y','sensore','osservato','campo_vero','predizione','varianza_kriging']];S.field.grid.forEach(function(p,i){var ix=S.ids.indexOf(i);rows.push([i+1,p.x,p.y,ix>=0?1:0,ix>=0?S.allObserved[i]:'',S.field.field[i],S.pred[i],S.design.variances[i]]);});SA.ui.download('statatlas_lab30_kriging.csv',SA.ui.csv(rows),'text/csv');}}),
   SA.ui.button('Grafici PNG',{icon:'download',cls:'btn-ghost',onclick:function(){SA.ui.exportPNG([mapBox,predBox,varBox,mcBox].map(function(x){return x.querySelector('svg');}),'statatlas_lab30_kriging.png',['Kriging','seed '+S.seed]);}})
 ))));
 var th=SA.ui.step('4','Teoria e simulazione a confronto');tbody=el('tbody');kpis=el('div.kpis');th.body.append(el('div.tbl-wrap',el('table.tv',el('thead',el('tr',el('th','Quantità'),el('th','Riferimento'),el('th','Risultato'),el('th','Natura'))),tbody)),kpis);
 var it=SA.ui.step('5','Interpretazione');interp=el('div.prose');it.body.append(interp,el('p',SA.ui.button('Teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:function(){theory('adv');}})));
 var rr=SA.ui.step('6','Riproduci in R','Stessi sensori, stesse previsioni e varianze');code=SA.ui.codeBlock(codeR,'statatlas_lab30_kriging.R');rr.body.append(el('p.prose','R0: coordinate, misure e campo vero espliciti. R1: stesso modello assunto e formule di predizione e varianza in R base. Confronto gstat facoltativo da verificare sul proprio sistema.'),code);
 page.append(q,ch,ex,th,it,rr);buildControls();choices();render();code.refresh();run.refresh();document.addEventListener('keydown',run.key);
},
unmount:function(){if(run){run.stop();document.removeEventListener('keydown',run.key);}},
redraw:function(){if(S)render();}
});
})();
