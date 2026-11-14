/* StatAtlas · LAB 29 — Variogrammi e campi aleatori spaziali.
 * Campo gaussiano stazionario latente, nugget osservazionale indipendente,
 * variogramma empirico di Matheron e repliche Monte Carlo a siti fissati.
 * Il laboratorio non avvia repliche in automatico: lo studente controlla il runner.
 */
(function(){
 'use strict';
 var el,S,run,controls,fieldBox,variogramBox,pairsBox,mcBox,pairNote,mcNote,tbody,kpis,interp,code,predBox,predFeedback;
 var G=SA.geostat;
 var MODELS={exponential:'Esponenziale',spherical:'Sferico',gaussian:'Gaussiano'};
 var DIRS={all:'Tutte le direzioni',horizontal:'Orizzontale (±22,5°)',vertical:'Verticale (±22,5°)'};
 function fmt(x,d){return Number.isFinite(x)?SA.fmt(x,d==null?3:d):'—';}
 function init(old){var s={model:'exponential',sigma2:1,phi:.25,nugget:.12,ratio:1,angle:0,trend:0,n:48,seed:2026,direction:'all',bins:10,B:99,showField:true,first:0,second:1,selectNext:0,prediction:null};if(old)Object.keys(s).forEach(function(k){if(old[k]!==undefined)s[k]=old[k];});return s;}
 function resetSamples(){S.samples=[];S.rng=new SA.RRNG(S.seed+1117);S.summKey=null;}
 function configure(){S.data=G.generate(S);S.obs=G.empirical(S.data.sites,S.data.y,{bins:S.bins,direction:S.direction});S.first=0;S.second=1;S.selectNext=0;resetSamples();}
 function rebuild(){run.stop();configure();buildControls();render();code.refresh();run.refresh();}
 function rebin(){run.stop();S.obs=G.empirical(S.data.sites,S.data.y,{bins:S.bins,direction:S.direction});render();code.refresh();run.refresh();}
 function samples(){return S.samples.slice(0,S.B);}
 function simsSummary(){var key=[S.samples.length,S.B,S.direction,S.bins].join('|');if(S.summKey!==key){S.summ=G.summarize(samples().map(function(y){return G.empirical(S.data.sites,y,{bins:S.bins,direction:S.direction}).gamma;}),S.bins);S.summKey=key;}return S.summ;}
 function done(){return S.samples.length>=S.B;}
 function step(){if(done())return false;S.samples.push(G.drawObservation(S.data,S.rng));return true;}
 function render(){drawField();drawVariogram();drawPairs();drawMC();updateTable();}
 function text(svg,x,y,value,attrs){var a=Object.assign({x:x,y:y,fill:SA.theme().ink_2,'font-size':12},attrs||{});return SA.plot.text(svg,x,y,String(value),a);}
 function selectedPair(){var a=S.data.sites[S.first],b=S.data.sites[S.second],v=S.data.y;
   var d=Math.hypot(a.x-b.x,a.y-b.y),g=.5*(v[S.first]-v[S.second])**2,
     match=G.empirical([a,b],[v[S.first],v[S.second]],{bins:S.bins,direction:S.direction}).pairs.length>0;
   return {d:d,gamma:g,inDirection:match};
 }
 function drawField(){
   var t=SA.theme(),P=SA.plot,d=S.data,root,ox=56,oy=18,side=326,cs=side/12;
   fieldBox.innerHTML='';root=P.svg('svg',{viewBox:'0 0 690 375',role:'img','aria-label':'Campo gaussiano simulato e sensori con valori osservati'},fieldBox);
   var max=Math.max(.8,...d.field.map(Math.abs)),z=S.showField;
   d.field.forEach(function(v,i){var a=Math.min(1,Math.abs(v)/max),fill=v>=0?t.c1:t.c2;
     P.svg('rect',{x:ox+(i%12)*cs,y:oy+(11-Math.floor(i/12))*cs,width:cs+.5,height:cs+.5,
       fill:z?fill:t.paper_2,'fill-opacity':z?.12+.73*a:1,stroke:t.rule,'stroke-width':.45},root);
   });
   if(S.first!==S.second){var a=d.sites[S.first],b=d.sites[S.second];P.svg('line',{x1:ox+a.x*side,y1:oy+(1-a.y)*side,x2:ox+b.x*side,y2:oy+(1-b.y)*side,stroke:t.c3,'stroke-width':2.6,'stroke-dasharray':'6 4'},root);}
   d.sites.forEach(function(p,i){var special=(i===S.first||i===S.second),c=P.svg('circle',{
     cx:ox+p.x*side,cy:oy+(1-p.y)*side,r:special?7.5:4.1,
     fill:special?t.c3:t.ink,stroke:t.card,'stroke-width':special?2.4:1.2,
     tabindex:0,role:'button','aria-label':'Seleziona sensore '+(i+1)},root);
     var choose=function(){if(S.selectNext===0){S.first=i;S.selectNext=1;}else{S.second=i;S.selectNext=0;}render();};
     c.addEventListener('click',choose);c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
   });
   [0,.25,.5,.75,1].forEach(function(v){text(root,ox+side*v,oy+side+20,fmt(v,2),{'text-anchor':'middle'});text(root,ox-8,oy+(1-v)*side+3,fmt(v,2),{'text-anchor':'end'});});
   text(root,ox+side/2,374,'Coordinata x',{'text-anchor':'middle','font-style':'italic'});
   var px=418,pair=selectedPair();
   text(root,px,42,'REALIZZAZIONE',{'font-size':11,'font-weight':700,fill:t.ink_3});
   text(root,px,79,d.sites.length+' sensori',{'font-size':23,'font-weight':600,fill:t.ink});
   text(root,px,106,'Campo su 12 × 12 siti');
   text(root,px,139,'COPPIA SELEZIONATA',{'font-size':11,'font-weight':700,fill:t.ink_3});
   text(root,px,170,'Sensori '+(S.first+1)+' e '+(S.second+1));
   text(root,px,194,'Distanza: '+fmt(pair.d,3));
   text(root,px,217,'½ differenza²: '+fmt(pair.gamma,3));
   text(root,px,250,'COME INTERAGIRE',{'font-size':11,'font-weight':700,fill:t.ink_3});
   text(root,px,273,'Clicca due sensori in sequenza');
   text(root,px,295,'La linea collega la coppia');
   text(root,px,320,'Confronta i variogrammi sotto');
   pairNote.textContent='La mappa '+(S.showField?'mostra una realizzazione del campo simulato (non una stima).':'nasconde il campo latente, ma mantiene i sensori osservati.')+
      ' Clicca su due sensori per ispezionare distanza e contributo alla semivarianza. I sensori contengono eventualmente un nugget osservazionale.';
 }
 function drawVariogram(){
   var e=S.obs,t=SA.theme(),P=SA.plot,mcs=simsSummary(),r=e.r,
       curves=[e.gamma,mcs.lo,mcs.hi,mcs.mean].flat().filter(Number.isFinite),
       theoretical=r.map(function(q){return G.theoretical(q,S,S.direction);});
   curves=curves.concat(theoretical.filter(Number.isFinite));
   var max=Math.max(.3,...curves)*1.18;
   var f=P.frame(variogramBox,{W:720,H:330,x:[0,e.maxDist*1.05],y:[0,max],xlabel:'Distanza h',ylabel:'Semivarianza',label:'Variogramma empirico, riferimento teorico e dispersione Monte Carlo'});
   function line(y,style){var pts=[];y.forEach(function(v,i){if(Number.isFinite(v)){pts.push((pts.length?'L':'M')+f.x(r[i])+','+f.y(v));}else{if(pts.length){P.svg('path',Object.assign({d:pts.join(' '),fill:'none'},style),f.g);pts=[];}}});if(pts.length)P.svg('path',Object.assign({d:pts.join(' '),fill:'none'},style),f.g);}
   if(samples().length>=5){line(mcs.lo,{stroke:t.c3,'stroke-width':1.3,'stroke-dasharray':'4 3'});line(mcs.hi,{stroke:t.c3,'stroke-width':1.3,'stroke-dasharray':'4 3'});line(mcs.mean,{stroke:t.c3,'stroke-width':2});}
   if(S.ratio!==1&&S.direction==='all'){
     line(r.map(function(q){return G.theoretical(q,S,'horizontal');}),{stroke:t.c2,'stroke-width':1.5,'stroke-dasharray':'5 4'});
     line(r.map(function(q){return G.theoretical(q,S,'vertical');}),{stroke:t.c1,'stroke-width':1.5,'stroke-dasharray':'5 4'});
   }else line(theoretical,{stroke:t.ink_2,'stroke-width':2,'stroke-dasharray':'5 4'});
   e.gamma.forEach(function(v,i){if(!Number.isFinite(v))return;P.svg('circle',{cx:f.x(r[i]),cy:f.y(v),r:4.5,fill:t.c1,stroke:t.paper,'stroke-width':1.3},f.g);});
   var s=selectedPair();if(s.inDirection&&s.d<=e.maxDist){P.svg('circle',{cx:f.x(s.d),cy:f.y(s.gamma),r:6,fill:t.c2,stroke:t.ink,'stroke-width':1.3},f.g);}
   text(f.root,f.m.l+5,23,'● Campione  ·  – – Teoria  ·  Viola: repliche',{'font-size':12,fill:t.ink_2});
   if(S.ratio!==1&&S.direction==='all')text(f.root,f.m.l+5,43,'Anisotropia: riferimenti orizzontale e verticale, non una curva unica',{'font-size':11,fill:t.ink_3});
 }
 function drawPairs(){
   var e=S.obs,P=SA.plot,t=SA.theme(),x=e.r,y=e.counts,top=Math.max(2,...y)*1.2,
    f=P.frame(pairsBox,{W:720,H:220,x:[0,e.maxDist*1.05],y:[0,top],xlabel:'Centro della classe di distanza',ylabel:'Coppie',label:'Numero di coppie per classe di distanza'});
   var w=f.x(e.maxDist/e.bins)-f.x(0)-4;
   y.forEach(function(n,i){P.svg('rect',{x:f.x(i*e.maxDist/e.bins)+2,y:f.y(n),width:Math.max(2,w),height:f.y(0)-f.y(n),fill:t.c1,'fill-opacity':.75},f.g);});
   var pair=selectedPair();if(pair.inDirection&&pair.d<=e.maxDist)P.svg('line',{x1:f.x(pair.d),x2:f.x(pair.d),y1:f.m.t,y2:f.y(0),stroke:t.c2,'stroke-width':2.5,'stroke-dasharray':'6 4'},f.g);
   text(f.root,f.m.l+6,20,'Coppie utilizzate: '+e.counts.reduce(function(a,b){return a+b;},0)+' · ogni punto contribuisce a più coppie',{'font-size':11,fill:t.ink_2});
 }
 function drawMC(){
   var ss=simsSummary(),r=S.obs.r,t=SA.theme(),P=SA.plot,vals=[S.obs.gamma,ss.lo,ss.hi,ss.mean].flat().filter(Number.isFinite),max=Math.max(.3,...vals)*1.2,
    f=P.frame(mcBox,{W:720,H:240,x:[0,S.obs.maxDist*1.05],y:[0,max],xlabel:'Distanza',ylabel:'Semivarianza',label:'Distribuzione Monte Carlo del variogramma a siti fissi'});
   function path(a){return a.map(function(v,i){return Number.isFinite(v)?[i,v]:null;}).filter(Boolean).map(function(z,i){return (i?'L':'M')+f.x(r[z[0]])+','+f.y(z[1]);}).join(' ');}
   if(samples().length>=5){
     P.svg('path',{d:path(ss.lo),stroke:t.c3,fill:'none','stroke-width':1.5,'stroke-dasharray':'4 4'},f.g);
     P.svg('path',{d:path(ss.hi),stroke:t.c3,fill:'none','stroke-width':1.5,'stroke-dasharray':'4 4'},f.g);
     P.svg('path',{d:path(ss.mean),stroke:t.c3,fill:'none','stroke-width':2.3},f.g);
   }
   P.svg('path',{d:path(S.obs.gamma),stroke:t.c1,fill:'none','stroke-width':2},f.g);
   mcNote.textContent=samples().length+' / '+S.B+' repliche · intervalli puntuali al 95%'+(samples().length<S.B?' · simulazione ferma finché non premi Avvia':' · completate');
 }
 function updateTable(){
   var o=S.data.params,e=S.obs,ss=simsSummary(),pair=selectedPair(),total=e.counts.reduce(function(a,b){return a+b;},0),
    effective=o.model==='exponential'?3*o.phi:o.model==='gaussian'?Math.sqrt(3)*o.phi:o.phi;
   var rows=[
    ['Modello di covarianza',MODELS[o.model],MODELS[S.model],'modello'],
    ['Varianza parziale (partial sill)',fmt(o.sigma2,2),fmt(o.sigma2,2),'parametro'],
    ['Nugget osservazionale',fmt(o.nugget,2),fmt(o.nugget,2),'parametro'],
    ['Range pratico (correlazione ≈ 0,05)',o.model==='spherical'?'Supporto compatto': 'Convenzione ≈ 95% di decadimento',fmt(effective,3),'derivato'],
    ['Regolarizzazione numerica della simulazione','Zero salvo covarianze molto mal condizionate',S.data.jitter?S.data.jitter.toExponential(1):'0','numerico'],
    ['Sensori e coppie usate','Campionamento non uniforme di una griglia 12 × 12',o.n+' · '+total,'esatto'],
    ['Coppia selezionata: distanza h','Distanza euclidea dei sensori',fmt(pair.d,3),'esatto'],
    ['Coppia selezionata: ½ differenza²','Contributo empirico non mediato',fmt(pair.gamma,3),'esatto'],
    ['Classi con almeno una coppia',S.bins,e.counts.filter(function(n){return n>0;}).length,'esatto'],
    ['Repliche del variogramma','B = '+S.B+' · siti fissati',samples().length,'Monte Carlo'],
    ['Semivarianza stimata nella classe 5','Dipende dal modello e dalla direzione',fmt(e.gamma[Math.min(4,S.bins-1)],3),'stima']
   ];tbody.innerHTML='';rows.forEach(function(a){tbody.append(el('tr',a.map(function(x){return el('td',String(x));})));});
   kpis.innerHTML='';kpis.append(el('div.kpi',el('b',String(o.n)),el('span','sensori osservati')),
      el('div.kpi',el('b',String(total)),el('span','coppie nelle classi')),
      el('div.kpi',el('b',String(samples().length)+' / '+S.B),el('span','repliche Monte Carlo')));
   interp.innerHTML='';
   interp.append(el('p','Il modello '+MODELS[o.model].toLowerCase()+' genera un campo gaussiano con varianza parziale '+fmt(o.sigma2,2)+', nugget osservazionale '+fmt(o.nugget,2)+' e parametro di scala '+fmt(o.phi,2)+'. La stessa realizzazione latente produce tutti i sensori. Il variogramma empirico è la media delle semivarianze delle coppie nella stessa classe.'),
    el('p','Con '+DIRS[S.direction].toLowerCase()+' si utilizzano '+total+' coppie. La semivarianza non stimata nelle classi prive di coppie rimane indefinita (non zero). Le bande Monte Carlo, quando disponibili, sono PUNTUALI: non rappresentano intervalli simultanei né una regione di confidenza per i parametri.'),
    el('p',o.ratio!==1?'È presente anisotropia geometrica: non esiste una singola curva teorica indipendente dalla direzione. Compara orizzontale e verticale, e ruota l’asse principale.':'In assenza di anisotropia geometrica la semivarianza dipende soltanto dalla distanza, a parità di parametri del modello.'),
    el('p',o.trend!==0?'ATTENZIONE: è stato aggiunto un trend della media. La curva del variogramma stazionario non descrive più il contributo totale delle differenze; la crescita della semivarianza può dipendere dal trend, non dalla covarianza residua.':'Il campo è stazionario del secondo ordine (modello gaussiano latente); il nugget rappresenta rumore di misura indipendente sui sensori. '+(S.data.jitter?'È stata applicata una regolarizzazione diagonale numerica di '+S.data.jitter.toExponential(1)+' per campionare una covarianza quasi singolare.':'Nessuna regolarizzazione numerica aggiuntiva alla covarianza latente.')));
 }
 function buildControls(){
   controls.innerHTML='';
   function selector(label,key,options,action){return el('label.field',el('span',label),el('select',{onchange:function(){S[key]=typeof options[0][0]==='number'?+this.value:this.value;action();}},options.map(function(a){return el('option',{value:a[0],selected:String(S[key])===String(a[0])},a[1]);})));}
   function slide(label,key,min,max,step,action){return SA.ui.slider(label,{min:min,max:max,step:step,value:S[key],format:function(v){return fmt(v,2);},onchange:function(v){S[key]=v;action();}});}
   controls.append(
     selector('Modello di covarianza','model',Object.keys(MODELS).map(function(k){return[k,MODELS[k]];}),rebuild),
     slide('Varianza parziale σ²','sigma2',.3,2.5,.1,rebuild),
     slide('Scala di correlazione φ','phi',.09,.50,.01,rebuild),
     slide('Nugget τ²','nugget',0,.65,.05,rebuild),
     slide('Rapporto anisotropia','ratio',.35,1,.05,rebuild),
     slide('Rotazione dell’asse (gradi)','angle',0,150,15,rebuild),
     slide('Trend lungo x','trend',0,2,.25,rebuild),
     selector('Sensori osservati','n',[[24,'24'],[48,'48'],[72,'72']],rebuild),
     selector('Direzione del variogramma','direction',Object.keys(DIRS).map(function(k){return[k,DIRS[k]];}),rebin),
     selector('Classi di distanza','bins',[[8,'8'],[10,'10'],[12,'12']],rebin),
     selector('Repliche B','B',[[49,'49'],[99,'99'],[199,'199']],function(){run.stop();render();run.refresh();}),
     selector('Mostra il campo simulato','showField',[[true,'Sì'],[false,'No']],function(){S.showField=String(S.showField)==='true';render();}),
     el('label.field',el('span','Seed'),el('input',{type:'number',min:1,value:S.seed,onchange:function(){S.seed=Math.max(1,Math.floor(+this.value||1));rebuild();}})),
     SA.ui.button('Rigenera il campo',{cls:'btn-ghost',onclick:function(){S.seed++;rebuild();}})
   );
   run.controls('Una replica di campo').forEach(function(a){controls.append(a);});
 }
 function buildPrediction(){
   predBox.innerHTML='';
   var options=[['a','Un range maggiore produce in genere un campo più liscio alla stessa scala'],['b','Aumentare il nugget rende il campo latente più liscio'],['c','Il variogramma empirico coincide sempre con quello teorico']];
   predBox.append(el('p.prose','Quando aumentiamo la correlazione spaziale a parità di varianza, che cosa ci aspettiamo dalla mappa e dal variogramma?'),
     el('div.choices',{role:'radiogroup','aria-label':'Previsione sul variogramma'},options.map(function(q,i){return el('div.choice',el('input',{type:'radio',name:'variogram-pred',id:'variogram-pred-'+i,value:q[0],onchange:function(){S.prediction=this.value;predFeedback.hidden=false;predFeedback.textContent=q[0]==='a'?'✓ Corretto: a distanza fissata una maggiore correlazione tende a ridurre la semivarianza; attenzione alla parametrizzazione del range.':'Non proprio: nugget è rumore osservazionale e un variogramma empirico è una statistica campionaria, soggetta a variabilità.';}}),el('label',{for:'variogram-pred-'+i},q[1]));})));
   predFeedback=el('div.feedback',{role:'status',hidden:true});predBox.append(predFeedback);
 }
 function codeR(){
   var d=S.data,e=S.obs;
   return [
     '# StatAtlas · LAB 29 · Variogrammi e campi gaussiani · riproduzione R1',
     '# Gli stessi dati e le stesse classi danno la stessa stima empirica.',
     'x <- c('+d.sites.map(function(p){return p.x.toPrecision(17);}).join(', ')+')',
     'y <- c('+d.sites.map(function(p){return p.y.toPrecision(17);}).join(', ')+')',
     'z <- c('+d.y.map(function(v){return v.toPrecision(17);}).join(', ')+')',
     'direction <- "'+S.direction+'"; nbins <- '+S.bins+'L; max_dist <- 0.85',
     'js_gamma <- c('+e.gamma.map(function(v){return Number.isFinite(v)?v.toPrecision(17):'NA_real_';}).join(', ')+')',
     'js_n <- c('+e.counts.join(', ')+')',
     'v <- numeric(nbins); nn <- integer(nbins)',
     'for(i in seq_len(length(z)-1L)) for(j in (i+1L):length(z)) {',
     ' dx <- x[i]-x[j];dy <- y[i]-y[j]; h <- sqrt(dx^2+dy^2)',
     ' if(h > max_dist) next',
     ' theta <- abs(atan2(dy,dx)); if(theta > pi/2) theta <- pi-theta',
     ' good <- direction == "all" || (direction == "horizontal" && theta <= pi/8) || (direction == "vertical" && abs(theta-pi/2) <= pi/8)',
     ' if(!good) next',
     ' k <- min(nbins, floor(h/max_dist*nbins)+1L)',
     ' v[k] <- v[k]+(z[i]-z[j])^2/2;nn[k] <- nn[k]+1L',
     '}',
     'gamma_hat <- ifelse(nn>0, v/pmax(nn,1), NA_real_)',
     'stopifnot(identical(as.integer(nn),as.integer(js_n)))',
     'stopifnot(all(abs(gamma_hat[is.finite(js_gamma)]-js_gamma[is.finite(js_gamma)])<1e-8))',
     'stopifnot(identical(is.na(gamma_hat),is.na(js_gamma)))',
     'cat("OK: variogramma empirico (coppie, classi, direzioni) coincide con JavaScript\\n")',
     'rr <- (seq_len(nbins)-0.5)*max_dist/nbins',
     'plot(rr,gamma_hat,type="b",pch=19,col="steelblue",xlab="distanza",ylab="semivarianza")',
     'if(requireNamespace("gstat",quietly=TRUE) && requireNamespace("sp",quietly=TRUE)) {',
     '  dd <- sp::SpatialPointsDataFrame(coords=cbind(x,y), data=data.frame(z=z))',
     '  vg <- gstat::variogram(z~1,dd,cutoff=max_dist,width=max_dist/nbins)',
     '  print(vg[,c("np","dist","gamma")])',
     '  cat("Confronto gstat: convenzioni dei confini, distanze e direzioni da verificare.\\n")',
     '}',
     '# Modello simulato: '+MODELS[S.model]+'; sigma2='+S.sigma2+'; phi='+S.phi+'; nugget='+S.nugget+'; ratio='+S.ratio+'; angolo='+S.angle+'; trend='+S.trend,
     '# R2 della simulazione richiede replicare la fattorizzazione di Cholesky e l ordine RNG JS; qui si garantisce R1 sui dati osservati.'
   ].join('\n');
 }
 var THEORY={
   base:function(){return el('div.prose',{html:'<h3>1. Problema statistico</h3><p>Osserviamo una variabile continua in un insieme limitato di posizioni. Vogliamo descrivere come cambia la somiglianza al variare della distanza, prima di prevedere il fenomeno dove non abbiamo sensori.</p><h3>2. Campo aleatorio e covarianza</h3><p>Il simulatore genera un campo gaussiano latente Z(s), stazionario del secondo ordine e a media nulla, con covarianza C(s,t)=σ²ρ(dₐ(s,t)). Ai sensori osserviamo Y(s)=Z(s)+ε(s)+m(s), con ε indipendenti di varianza τ² e un trend m(s) opzionale. Il nugget non viene aggiunto al campo latente rappresentato nella mappa.</p><h3>3. Stimare il variogramma</h3><div class="eq" data-tex="\\widehat{\\gamma}(h_k)=\\frac{1}{2N_k}\\sum_{(i,j)\\in B_k}\\{Y(s_i)-Y(s_j)\\}^2"></div><p>Le coppie sono raggruppate in intervalli di distanza. Una classe vuota NON ha semivarianza zero: la stima non è definita. Cambiando numero di classi o direzione cambia anche il numero di coppie in ciascuna classe.</p><h3>4. Parametri e interpretazione</h3><p>σ² è la varianza parziale, τ² il nugget e φ la scala di correlazione, che NON coincide sempre col range pratico. Il modello esponenziale ha correlazione e<sup>−h/φ</sup>, il gaussiano e<sup>−(h/φ)²</sup>; il sferico raggiunge covarianza nulla per h≥φ.</p><h3>5. Esperimento e confronto</h3><p>Seleziona due sensori sulla mappa, osserva distanza e ½ differenza²; confronta la curva empirica col riferimento teorico, poi premi Avvia per simulare nuovi campioni <em>sui medesimi siti</em>. La variabilità delle curve spiega perché un singolo variogramma è rumoroso.</p><div class="callout warn"><strong>Attenzione:</strong> una tendenza spaziale della media o l’anisotropia possono rendere fuorviante una lettura isotropa del variogramma grezzo. Le bande Monte Carlo sono puntuali e condizionate al modello impostato.</div>'});},
   adv:function(){return el('div.prose',{html:'<h3>Definizioni rigorose</h3><p>La semivarianza è γ(h)=½Var{Z(s+h)−Z(s)}. Sotto stazionarietà del secondo ordine della componente residua, γ(h)=C(0)−C(h), quando la media è costante. Per osservazioni con nugget indipendente, γ<sub>Y</sub>(h)=τ²+σ²[1−ρ(h)] se h&gt;0, mentre γ<sub>Y</sub>(0)=0 per la differenza della stessa osservazione; il limite destro è τ².</p><h3>Validità delle funzioni di covarianza</h3><p>Il modello gaussiano, esponenziale e sferico utilizzati hanno matrici di covarianza positive definite (almeno semidefinite) nelle dimensioni considerate. Il motore genera un campo latente comune usando la Cholesky della covarianza; gli errori di misura sono generati indipendentemente. Se la covarianza campionata sulla griglia è numericamente quasi singolare, il simulatore dichiara una regolarizzazione diagonale inferiore a 10<sup>−8</sup> della varianza parziale per ottenere una fattorizzazione stabile; la regolarizzazione non è il nugget osservazionale e viene riportata nella tabella.</p><h3>Anisotropia geometrica</h3><p>Una rotazione degli assi, seguita dalla scala 1/ratio lungo l’asse minore, trasforma la distanza euclidea in una distanza anisotropa dₐ. Di conseguenza γ dipende non soltanto da |h| ma anche dalla direzione. Per il variogramma omnidirezionale anisotropo non si visualizza una singola curva teorica come se il processo fosse isotropo.</p><h3>Statistica delle coppie</h3><p>L’estimatore classico di Matheron usa una media delle differenze quadratiche sulle coppie dentro la classe. Le coppie non sono indipendenti perché condividono osservazioni: N<sub>k</sub> grande non comporta automaticamente una varianza di ordine 1/N<sub>k</sub>. L’errore di campionamento dipende inoltre da rete dei siti, struttura di quarto ordine e scelta dei bin.</p><h3>Range e nugget</h3><p>Il parametro φ è il range del modello sferico; per l’esponenziale il decadimento al 5% si osserva intorno a 3φ e per il gaussiano intorno a √3 φ. Il sill totale delle osservazioni è σ²+τ². Stime numericamente vicine a zero a distanza elevata non implicano indipendenza matematica nel modello esponenziale o gaussiano.</p><h3>Monte Carlo, trend e simulazione</h3><p>Il simulatore ripete il processo sugli stessi siti: i sensori non vengono ridisegnati. Il confronto in R può riprodurre esattamente il variogramma degli stessi valori (R1), mentre per ripetere l’identica realizzazione casuale della Cholesky serve un accordo su ordine di estrazione, algoritmo e convenzioni. Con trend m(s)=a(x−½), i quadrati delle differenze includono (m(sᵢ)−m(sⱼ))² e il variogramma osservato non coincide con il solo variogramma residuo stazionario.</p><h3>Avvertenza sull’inferenza</h3><p>Gli envelope puntuali al 95% basati su repliche parametriche con parametri noti non sono intervalli di confidenza per φ o τ² e non incorporano incertezza di stima. Una selezione del modello di covarianza richiede ulteriori verifiche e non può basarsi sul solo aspetto della curva empirica.</p>'});}
 };
 SA.registerLab('variogrammi',{
   mount:function(page,info){
     el=SA.ui.el;S=init(S);configure();run=SA.ui.runner({speed:2,coop:true,step:step,render:render,done:done,progress:function(){return samples().length/S.B;},reset:resetSamples});
     function theory(level){SA.ui.openDrawer('Variogrammi e campi aleatori spaziali',THEORY,level);}
     page.append(el('header.lab-head',el('div',el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),el('h1',info.lab.title),el('p.lede','Dalle differenze fra sensori alle proprietà di un campo aleatorio: distanza, nugget, range e anisotropia.')),SA.ui.button('Approfondisci',{icon:'book',onclick:function(){theory();}})));
     var q=SA.ui.step('1','Domanda');q.body.append(el('p.question','Quanto devono essere lontani due sensori perché le loro misure smettano di assomigliarsi?'));
     var p=SA.ui.step('2','La tua previsione');predBox=el('div');p.body.append(predBox);
     var ex=SA.ui.step('3','Esperimento','Genera un campo, confronta le coppie e simula variogrammi');
     controls=el('div.panel.controls');fieldBox=el('div');variogramBox=el('div');pairsBox=el('div');mcBox=el('div');pairNote=el('p.moran-map-info');mcNote=el('span.moran-perm-status');
     ex.body.append(el('div.moran-guide',{role:'note'},el('strong','Come utilizzare il laboratorio'),el('ol',
       el('li','Osserva il campo simulato e le posizioni dei sensori. Clicca due punti: la loro differenza quadratica contribuisce a una classe di distanza.'),
       el('li','Modifica la scala φ, il nugget o il modello. Dati e curve cambiano, ma le simulazioni non si avviano da sole.'),
       el('li','Scegli direzione e numero di classi per vedere come cambiano le medie empiriche e le coppie disponibili.'),
       el('li','Premi Avvia, Passo o Completa per vedere la variabilità campionaria del variogramma sugli stessi siti.'),
       el('li','Attiva l’anisotropia e il trend, poi confronta ciò che accade alla curva empirica e alla sua interpretazione.'))));
     ex.body.append(el('div.lab-grid',controls,el('div.figure',
       el('div.fig',el('div.fig-title',el('h3','Campo spaziale e sensori osservati')),fieldBox,pairNote),
       el('div.fig',el('div.fig-title',el('h3','Variogramma empirico e teorico')),variogramBox),
       el('div.fig',el('div.fig-title',el('h3','Numero di coppie nelle classi')),pairsBox),
       el('div.fig',el('div.fig-title',el('h3','Variabilità delle stime in Monte Carlo'),mcNote),mcBox),
       el('div.toolbar',
         SA.ui.button('Dati e variogramma CSV',{icon:'download',cls:'btn-ghost',onclick:function(){var rows=[['tipo','id','x','y','valore','classe','distanza','semivarianza','n_coppie']];S.data.sites.forEach(function(p,i){rows.push(['sensore',i+1,p.x,p.y,S.data.y[i],'','','','']);});S.obs.r.forEach(function(v,i){rows.push(['bin','','','','',i+1,v,S.obs.gamma[i],S.obs.counts[i]]);});SA.ui.download('statatlas_lab29_variogrammi.csv',SA.ui.csv(rows),'text/csv');}}),
         SA.ui.button('Grafici PNG',{icon:'download',cls:'btn-ghost',onclick:function(){SA.ui.exportPNG([fieldBox,variogramBox,pairsBox,mcBox].map(function(x){return x.querySelector('svg');}),'statatlas_lab29_variogrammi.png',['Variogrammi','seed '+S.seed]);}})))));
     var th=SA.ui.step('4','Teoria e simulazione a confronto');tbody=el('tbody');kpis=el('div.kpis');th.body.append(el('div.tbl-wrap',el('table.tv',el('thead',el('tr',el('th','Quantità'),el('th','Riferimento'),el('th','Risultato'),el('th','Natura'))),tbody)),kpis);
     var it=SA.ui.step('5','Interpretazione');interp=el('div.prose');it.body.append(interp,el('p',SA.ui.button('Teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:function(){theory('adv');}})));
     var rep=SA.ui.step('6','Riproduci in R','Stessi sensori, stessi valori, stesso variogramma');code=SA.ui.codeBlock(codeR,'statatlas_lab29_variogrammi.R');rep.body.append(el('p.prose','R0: coordinate e misure esplicite. R1: stesse classi e stessa formula di Matheron. R3: il confronto facoltativo con gstat può utilizzare convenzioni differenti sui confini e sulla direzione.'),code);
     page.append(q,p,ex,th,it,rep);buildControls();buildPrediction();render();code.refresh();run.refresh();document.addEventListener('keydown',run.key);
   },
   unmount:function(){if(run){run.stop();document.removeEventListener('keydown',run.key);}},
   redraw:function(){if(S)render();}
 });
})();
