/* Parte VIII · Sei laboratori unificati, con una sola mappa e un solo dataset.
 * I motori statistici in src/core/spatial-* restano separati e testabili.
 * Nessun vecchio pannello areale o Monte Carlo viene montato.
 */
var SA=window.SA||(window.SA={});
SA.spatialUnified=(function(){
'use strict';
var cfg={
 moran:{title:'Autocorrelazione spaziale e Moran I',type:'moran',question:'Se aggiungi osservazioni simili vicine, come cambia Moran I?',note:'L’indice è calcolato sui valori puntuali e sui vicini kNN, non sui pixel della heatmap.',short:'Vicinati e indice globale',focus:'Vicini kNN'},
 lisa:{title:'Autocorrelazione locale, LISA e hotspot',type:'lisa',question:'Un punto alto in mezzo a punti bassi è un hotspot?',note:'Le classi HH/LL/HL/LH descrivono il segno dei valori e dei loro lag; non sono dichiarazioni di significatività.',short:'Quadranti locali e vicini',focus:'Vicini kNN'},
 'processi-puntuali':{title:'Processi puntuali spaziali',type:'points',question:'Gli eventi sono dispersi, aggregati o regolari?',note:'La mappa KDE è una stima dell’intensità senza correzione ai bordi; L(r)−r è una descrizione della struttura per coppie.',short:'Eventi, densità e distanze',focus:'Larghezza del kernel KDE'},
 variogrammi:{title:'Variogrammi e dipendenza spaziale',type:'variogram',question:'A distanze maggiori corrispondono differenze più marcate tra misure?',note:'La mappa IDW è illustrativa; il variogramma si calcola dalle differenze dei valori nelle coppie di sensori.',short:'Sensori e semivarianza',focus:'Classi del variogramma'},
 kriging:{title:'Kriging e interpolazione spaziale',type:'kriging',question:'Dove conviene aggiungere un sensore per ridurre l’incertezza?',note:'La superficie e la varianza provengono dallo stesso sistema di kriging; il campo latente generatore rimane fisso.',short:'Sensori e incertezza',focus:'Range assunto φ'},
 'regressione-spaziale':{title:'Regressione spaziale e coordinate',type:'regression',question:'Che cosa cambia aggiungendo le coordinate alla relazione Y–X?',note:'Le coordinate possono assorbire un trend nella media, ma non rappresentano automaticamente errori spazialmente correlati o un modello SAR/SEM.',short:'Regressione e localizzazione',focus:'Previsione cartografica'}
};
var theory={
 moran:{base:[['Che cosa misuriamo','Moran I quantifica la concordanza fra i valori osservati e il lag spaziale definito dalla matrice dei pesi W. La superficie colorata è una visualizzazione, non entra direttamente nel calcolo di I.'],['Come interpretare','Un I positivo indica prevalenza di valori simili nel vicinato; un valore negativo prevalenza di contrasti. Cambiando il numero k di vicini cambia W e quindi la domanda statistica.'],['Attenzione','Un trend geografico può produrre autocorrelazione dei valori anche con errori indipendenti. Nessun test di significatività viene eseguito automaticamente nella mappa.']],adv:[['Definizione','I=(n/S₀)·(zᵀWz)/(zᵀz), zᵢ=xᵢ−x̄, S₀=∑ᵢⱼwᵢⱼ. Con kNN standardizzato per riga e nessun isolato, S₀=n. I non è universalmente limitato a [−1,1].'],['Randomizzazione','Sotto permutazione uniforme dei valori osservati, diagonale di W nulla, S₀>0 e variabilità non nulla, E[I|x]=−1/(n−1). La randomizzazione richiede una null di scambiabilità difendibile.'],['Distanze','Il kNN è diretto in generale: i→j non implica j→i. Le distanze sono euclidee su coordinate normalizzate, non geodetiche.']]},
 lisa:{base:[['Contrasto locale','Per ogni osservazione classifichiamo il segno del suo valore centrato e quello del lag spaziale. HH e LL sono concordanze locali; HL e LH sono osservazioni discordanti.'],['Come provare','Aggiungi osservazioni alte accanto ad altre alte; poi colloca un valore alto in una zona bassa e osserva cambiare il quadrante.'],['Quadrante non significa significativo','Per individuare hotspot significativi occorrono un modello nullo, permutazioni locali e il controllo dei confronti multipli. Qui non sono calcolati p-value locali.']],adv:[['Local Moran','Una convenzione comune è Iᵢ=(zᵢ/m₂)∑ⱼwᵢⱼzⱼ con m₂=(1/n)∑ᵢzᵢ². Il quadrante dipende dai segni di zᵢ e del lag ∑ⱼwᵢⱼzⱼ.'],['Test locali','Le null condizionate alla località e le permutazioni determinano distribuzioni differenti. BH e BY richiedono p-value validi e hanno condizioni diverse sul controllo FDR.'],['MAUP','Aggregare osservazioni in aree modifica la variabile aggregata e spesso anche W: non è equivalente a ricampionare la stessa superficie puntuale.']]},
 'processi-puntuali':{base:[['Eventi, non misure','Ogni punto rappresenta un evento; aggiungerne uno modifica la densità stimata. Il colore non codifica un valore misurato in quel punto.'],['KDE','La heatmap è una somma di kernel gaussiani. La larghezza h controlla la scala della concentrazione: una banda stretta evidenzia picchi locali, una banda ampia li fonde.'],['Aggregazione','Un gruppo di eventi può generare L(r)−r positivo a certe scale, ma una forte variazione dell’intensità può produrre lo stesso pattern senza interazione tra eventi.']],adv:[['Processo Poisson omogeneo','Sotto CSR nel piano, K(r)=πr² e L(r)−r=√(K(r)/π)−r=0 a livello teorico. Questa identità non trasforma una singola curva empirica in un test.'],['Effetti di bordo','Le coppie non osservabili oltre il dominio producono bias senza correzione di bordo. L’esperimento presenta una curva descrittiva dell’estimatore implementato; non un envelope di confidenza.'],['Intensità','La KDE impiegata non è corretta al bordo; K omogenea non separa automaticamente inhomogeneità di primo ordine e interazione di secondo ordine.']]},
 variogrammi:{base:[['Dalle coppie alla dipendenza','Il variogramma empirico raggruppa le coppie di punti per distanza e rappresenta metà della differenza quadratica media dei loro valori.'],['Che cosa mostra la superficie','La mappa utilizza una interpolazione IDW per comunicare la posizione delle misure. Non è una realizzazione kriging e non stima la varianza predittiva.'],['Esperimento','Sposta un sensore e verifica che alcune coppie cambino classe di distanza; aggiungi un valore estremo e osserva le semivarianze.']],adv:[['Stimatore di Matheron','γ̂(h)= (1/(2|N(h)|))∑_(i,j)∈N(h) (Z(sᵢ)−Z(sⱼ))², quando la classe N(h) non è vuota.'],['Modello teorico','Sotto stazionarietà intrinseca, 2γ(h)=Var[Z(s+h)−Z(s)]. Per un campo di secondo ordine stazionario γ(h)=C(0)−C(h).'],['Limiti','Una media geografica non costante, pochi accoppiamenti o anisotropia possono alterare la lettura di γ̂. Il numero di coppie per classe è parte integrante dell’interpretazione.']]},
 kriging:{base:[['Predizione e incertezza','Kriging utilizza una covarianza assunta per stimare la superficie fra i sensori e calcolare una varianza di errore del predittore sotto quel modello.'],['Disegno dei sensori','Aggiungi un sensore in una zona poco coperta: la varianza di previsione media, a parità di modello, non aumenta. Il valore stimato in un singolo punto può invece muoversi in entrambe le direzioni.'],['Modello contro realtà','La varianza mostrata dipende dal range e dal nugget assunti. Non è l’errore effettivamente commesso su una singola realizzazione del campo.']],adv:[['Kriging ordinario','Il sistema è Cw+ν1=c, 1ᵀw=1, dove C è la covarianza delle misure, c la covarianza tra misure e valore latente obiettivo.'],['Varianza','Con tale convenzione la varianza dell’errore è σ²−wᵀc−ν. Essa dipende dalle posizioni e dalla covarianza assunta, non dai valori osservati.'],['Nugget','Il rumore di misura entra in C e non nella covarianza incrociata con il campo latente. La varianza di previsione riguarda il latente, non una nuova osservazione rumorosa.']]},
 'regressione-spaziale':{base:[['Il problema','Vogliamo interpretare la relazione Y–X quando entrambi i valori possono variare nello spazio. Ogni osservazione sulla mappa ha coordinate, covariata X e risposta Y.'],['Due regressioni','Confronta Y~X con Y~X+x+y. Muovendo o inserendo punti cambia il campione; cambiando modello sullo stesso campione isoli l’effetto della specificazione.'],['Interpretazione','Con OLS la presenza di regressori aggiuntivi non riduce R² in campione. Una riduzione del Moran residuo non implica che la struttura di dipendenza sia correttamente modellata.']],adv:[['Trend contro dipendenza','Yᵢ=β₀+β₁Xᵢ+β₂xᵢ+β₃yᵢ+εᵢ descrive un trend lineare spaziale della media. Non è un SAR o SEM.'],['Modelli alternativi','SAR: Y=ρWY+Xβ+ε, e SEM: Y=Xβ+u con u=λWu+ε. Richiedono stima e identificazione ulteriori; sono spiegati teoricamente ma non sono simulati in questa interfaccia.'],['Geometria','x e y sono coordinate relative normalizzate su un quadrato. Non rappresentano gradi di latitudine/longitudine: con dati geografici reali servono distanze coerenti e spesso una proiezione metrica.']]}
};
function el(tag,text,cls){var e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=text;if(cls)e.className=cls;return e;}
function theoryNode(id,kind){var d=el('div',null,'prose');(theory[id][kind]||[]).forEach(function(row){d.append(el('h3',row[0]),el('p',row[1]));});return d;}
function toR(v){return typeof v==='number'&&isFinite(v)?v.toPrecision(16):'NA_real_';}
function numbers(p,key){
 var chunks=[];
 for(var i=0;i<p.length;i+=6){
   chunks.push(p.slice(i,i+6).map(function(x){return toR(x[key]);}).join(', '));
 }
 return p.length?'c(\n    '+chunks.join(',\n    ')+'\n  )':'numeric(0)';
}
function rScript(id,studio){
 var p=studio.state.points,head=['# StatAtlas · Parte VIII unificata · '+id,'# Snapshot dei punti modificati sulla mappa. Coordinate normalizzate, non geografiche.',
 'd <- data.frame(\n  x = '+numbers(p,'x')+',\n  y = '+numbers(p,'y')+',\n  z = '+numbers(p,'value')+',\n  X = '+numbers(p,'cov')+'\n)',
 'plot(d$x,d$y,asp=1,pch=19,cex=.7,col="steelblue",xlab="x",ylab="y")'];
 if(id==='moran'||id==='lisa'||id==='regressione-spaziale'){
   head.push('# k vicini più prossimi, normalizzati per riga; ordine di vicinanza non simmetrico.',
   'k <- '+studio.state.knn+'L',
   'D <- as.matrix(dist(as.matrix(d[,c("x","y")])))',
   'diag(D) <- Inf',
   'W <- matrix(0,nrow(d),nrow(d))',
   'for (i in seq_len(nrow(d))) { idx <- order(D[i,], seq_len(nrow(d)))[seq_len(k)]; W[i,idx] <- 1/k }',
   'moran <- function(z,W) { z <- z-mean(z); if(sum(z^2)<1e-12) return(NA_real_); length(z)/sum(W)*as.numeric(crossprod(z,W%*%z))/sum(z^2) }');
 }
 if(id==='moran'||id==='lisa'){
   head.push('cat("Moran I=",moran(d$z,W),"; E[I|permutazione]=",-1/(nrow(d)-1),"\\n")');
   if(id==='lisa')head.push('z <- d$z-mean(d$z); lag <- drop(W %*% z)',
    'quadrante <- ifelse(z>=0 & lag>=0,"HH",ifelse(z<0 & lag<0,"LL",ifelse(z>=0 & lag<0,"HL","LH")))',
    'print(table(quadrante))',
    '# Attenzione: queste classi NON sono hotspot significativi; nessun p-value locale è calcolato.');
 }
 if(id==='processi-puntuali')head.push('h <- '+toR(studio.state.band),
   'kde <- function(x,y) sum(exp(-((d$x-x)^2+(d$y-y)^2)/(2*h*h)))/(2*pi*h*h)',
   'g <- seq(0,1,length.out=29)',
   'intensita <- outer(g,g,Vectorize(kde))',
   'image(g,g,intensita,xlab="x",ylab="y",main="KDE gaussiana non corretta ai bordi")',
   '# K(r)=pi*r^2 solo per Poisson omogeneo nel piano; curve empiriche richiedono correzione bordo.');
 if(id==='variogrammi')head.push('p <- '+studio.state.bins+'L',
   'distPairs <- as.vector(dist(as.matrix(d[,c("x","y")])))',
   'sqDiff <- as.vector(dist(d$z))^2/2',
   '# Classi di distanza: [a,b), ultima chiusa in r=1 (coerenti con JS).',
   'binIndex <- ifelse(distPairs <= 1, pmin(p, floor(distPairs*p)+1L), NA_integer_)',
   'bin <- factor(binIndex, levels=seq_len(p))',
   'print(data.frame(classe=levels(bin),semivarianza=as.numeric(tapply(sqDiff,bin,mean)),coppie=as.numeric(table(bin))))',
   '# La mappa dell’app usa IDW: non va confusa con il variogramma.');
 if(id==='kriging')head.push('phi <- '+toR(studio.state.other.covOptions.phi),
   'sigma2 <- 1; nugget <- 0.12',
   'covF <- function(a,b) sigma2*exp(-as.matrix(dist(rbind(a,b)))[seq_len(nrow(a)), nrow(a)+seq_len(nrow(b)),drop=FALSE]/phi)',
   'loc <- as.matrix(d[,c("x","y")]); n <- nrow(loc)',
   'C <- covF(loc,loc)+diag(nugget,n)',
   'c0 <- covF(loc,matrix(c(.5,.5),nrow=1))[,1]',
   'A <- rbind(cbind(C,rep(1,n)),c(rep(1,n),0))',
   'weights <- solve(A,c(c0,1)); w <- weights[seq_len(n)]; nu <- weights[n+1]',
   'cat("Kriging al centro =",sum(w*d$z),"; varianza latente =",sigma2-sum(w*c0)-nu,"\\n")',
   '# Il campo sottostante è fisso mentre cambia il disegno dei sensori.');
 if(id==='regressione-spaziale')head.push('m0 <- lm(z ~ X,data=d)', 'm1 <- lm(z ~ X+x+y,data=d)',
   'print(coef(m0)); print(coef(m1))',
   'cat("R²: solo X",summary(m0)$r.squared,"; X+coordinate",summary(m1)$r.squared,"\\n")',
   'cat("Moran residui",moran(residuals(m0),W),moran(residuals(m1),W),"\\n")',
   '# La presenza di x,y nel modello OLS non equivale alla stima di SAR o SEM.');
 return head.join('\n');
}
function basePoints(type){
 if(type==='kriging'){
   var o={seed:2026,model:'exponential',sigma2:1,phi:.25,nugget:.12,n:12,ratio:1,angle:0,trend:0};
   var field=SA.geostat.generate(o),rng=new SA.RRNG(6129),all=field.field.map(function(v){return v+Math.sqrt(.12)*rng.norm();});
   var ids=field.ids.slice(0,12);if(ids.length<8)ids=[0,11,22,35,48,66,77,85,98,108,132,143];
   return {points:ids.map(function(i){return {x:field.grid[i].x,y:field.grid[i].y,value:all[i],id:i};}),grid:field.grid,values:all,seed:2026,covOptions:{model:'exponential',sigma2:1,phi:.25,nugget:.12,ratio:1,angle:0}};
 }
 var n=type==='points'?55:type==='regression'?45:38;
 var points=SA.spatialStudio.randomPoints(n,'uniform',2026);
 if(type==='points')return {points:points};
 var kind=type==='regression'?'regression':'cluster';
 return {points:SA.spatialStudio.preset(points,type,kind,2026)};
}
function installMapChallenges(id){
 // Le 15 sfide dei cinque studi non pilota sono riscritte per l'unico
 // esperimento realmente montato. Ogni confronto A/B usa lo stesso dataset.
 var focus=cfg[id].focus;
 var items={
  moran:[
   ['Pattern sul territorio','Aggiungi un gruppo di osservazioni simili e osserva Moran I.','Moran I dipende da:', ['Valori osservati e matrice dei pesi W.','Solo dai pixel della mappa.','Solo dalla numerosità del campione.'],0,'L’indice usa i valori centrati e i vicinati, non la superficie interpolata.'],
   ['Cambiare i vicini','Modifica il numero dei vicini kNN e registra il nuovo indice.','Perché I può cambiare?', ['Cambiano i pesi e le coppie del vicinato.','La media dei dati viene ricalcolata in modo arbitrario.','La mappa di calore è diventata il dataset.'],0,'I=kNN dipende da W anche a parità di valori.'],
   ['Stessi punti, due k','Registra la configurazione iniziale, modifica solo k e registra la seconda.','Un confronto di due k mantenendo fissi i punti misura:', ['Una differenza descrittiva dipendente da W, non una prova di significatività.','Un effetto causale sulla variabile misurata.','Una probabilità di H0 pari al p-value.'],0,'Cambiare k cambia la definizione di vicino; per i test servirebbe un nullo esplicito.']
  ],
  lisa:[
   ['Crea un outlier locale','Modifica un valore al centro di una zona di segno contrario.','Un quadrante HL significa:', ['Osservazione alta con lag spaziale basso.','Hotspot statisticamente significativo.','Unità alta circondata necessariamente da unità alte.'],0,'Il quadrante è una descrizione del segno, non un test.'],
   ['Vicinato e quadrante','Modifica kNN e osserva cambiare le classi locali.','Quale affermazione è corretta?', ['I quadranti non dipendono da W.','Cambiare W può cambiare il lag e il quadrante assegnato.','Ogni classe HH ha p-value inferiore a 0,05.'],1,'Il lag è una media pesata dei valori vicini, dipende da W.'],
   ['Confronta due vicinati','Registra due valori di k sugli stessi punti.','Per attribuire significatività agli hotspot servirebbe:', ['La sola classificazione HH/LL.','Un ordinamento dei punti per longitudine.','Un test locale con nullo esplicito e trattamento dei confronti multipli.'],2,'HH/LL sono classi descrittive; la significatività è una procedura inferenziale distinta.']
  ],
  'processi-puntuali':[
   ['Concentrazioni di eventi','Aggiungi un gruppo di eventi sulla mappa e osserva la KDE.','La KDE descrive:', ['La posizione stimata delle concentrazioni di eventi.','La probabilità esatta della null CSR.','Un valore Y misurato in ogni evento.'],0,'La KDE è una stima kernel della intensità, non il processo generatore.'],
   ['Allarga la banda','Modifica la larghezza del kernel KDE.','Che cosa cambia soprattutto?', ['Il numero di eventi osservati.','La scala di lisciamento della intensità stimata.','La posizione geografica effettiva degli eventi.'],1,'Con h maggiore i picchi si fondono; i dati restano gli stessi.'],
   ['Due bande, stessi eventi','Registra la KDE con una banda; varia solo h e registra nuovamente.','Una differenza della KDE al centro fra due bande dimostra:', ['Una modifica della scala di stima, non un cambiamento del campione.','Che è cambiato il generatore dei punti.','Che CSR è stata rifiutata al livello 5%.'],0,'La banda influenza lo smoothing; un test CSR richiede un nullo e un envelope coerenti.']
  ],
  variogrammi:[
   ['Coppie di sensori','Aggiungi un sensore con valore diverso e osserva la curva.','Una semivarianza empirica misura:', ['La distanza geografica media.','Metà della media dei quadrati delle differenze entro una classe di distanze.','La varianza del predittore kriging.'],1,'La semivarianza dipende dalle coppie di punti, non dalla superficie IDW.'],
   ['Raggruppare le distanze','Modifica il numero delle classi del variogramma.','Se cambiano le classi:', ['Cambiano le coordinate dei sensori.','Il campo latente viene rigenerato.','Cambiano le coppie per classe e la risoluzione della stima.'],2,'Lo stesso dataset può dare curve con risoluzione diversa al cambiare dei bin.'],
   ['Due partizioni, stessi sensori','Registra due numeri di classi lasciando fissi tutti i punti.','Una differenza fra le medie di classe implica:', ['Che è cambiata la definizione di lag; non prova una variazione della covarianza generatrice.','Che sono cambiate le misure originali.','Che lo stimatore IDW è diventato un BLUP.'],0,'La media non ponderata delle classi dipende dalla discretizzazione.']
  ],
  'regressione-spaziale':[
   ['Una osservazione cambia il fit','Aggiungi una osservazione e verifica coefficienti e residui.','Che cosa suggerisce una diversa stima di β(X)?',['Una prova che X provoca Y.','Che la stima OLS dipende dalle osservazioni incluse e dalla specificazione.','Che SAR e SEM sono identici.'],1,'La modifica del campione modifica la proiezione OLS e può cambiare il coefficiente.'],
   ['Aggiungere le coordinate','Conserva i punti e alterna la previsione Solo X / X+coordinate.','Perché R² non scende aggiungendo coordinate in OLS?',['Il modello più grande contiene il precedente come caso particolare.','Le coordinate rendono indipendenti i residui per definizione.','Si aggiungono inevitabilmente nuove osservazioni.'],0,'È una proprietà dell’adattamento in-sample, non una garanzia predittiva.'],
   ['Due formule, stessi dati','Registra Moran dei residui in Solo X, passa a X+coordinate e registra di nuovo.','Aggiungere lon/lat equivale a stimare SAR?',['Sì, perché qualunque modello con coordinate stima lo spillover.','Sì, se R² aumenta.','No: adatta un trend della media, mentre SAR/SEM specificano dipendenza nei dati o negli errori.'],2,'La dipendenza resta un problema distinto dall’inserimento delle coordinate come covariate.']
  ]
 };
 var raw=items[id];
 if(!raw)return;
 function norm(s){return SA.challenges.keyOf(s);}
 function lastMeasured(s,b){return (s.samples||[]).filter(function(r){return r.seq>b.actions&&r.metric&&Number.isFinite(r.metric.value);});}
 SA.challenges.bank[id]=raw.map(function(row,i){
   var focusKey=norm(focus);
   return {id:'map-'+id+'-'+(i+1),level:['Comprensione','Applicazione','Avanzato'][i],title:row[0],
     task:row[1]+(i===0?' Usa la mappa e rispondi.':i===1?' Dopo il cambiamento premi «Registra questa configurazione» per acquisire il risultato.':' Premi «Registra questa configurazione» per A, cambia soltanto «'+focus+'» e registra B. Non muovere o modificare i punti fra A e B.'),
     question:row[2],options:row[3],correct:row[4],explanation:row[5],baseline:true,stage:i,
     rule:function(s,b){
       if(!b)return {ready:false,message:'Apri la sfida per registrare la situazione iniziale.'};
       var all=lastMeasured(s,b);
       if(i===0){var moved=s.controls['versione dei dati spaziali']!==b.controls['versione dei dati spaziali'];return {ready:moved&&all.length>0,message:moved&&all.length?'Risultato osservato: '+all[all.length-1].metric.value.toFixed(4):'Aggiungi, sposta o modifica un punto sulla mappa; la sola modifica di un menu non basta.'};}
       var edits=(s.edits||[]).slice((b.edits||[]).length).filter(function(e){return e.key===focusKey;});
       if(!edits.length)return {ready:false,message:'Modifica «'+focus+'» sulla mappa.'};
       if(i===1){var post=all.filter(function(q){return q.values[focusKey]!==b.controls[focusKey];});return {ready:post.length>0,message:post.length?'Nuova statistica registrata.':'Modifica il controllo e registra il risultato.'};}
       var groups=[];all.forEach(function(x){var key=x.values[focusKey];if(key==null)return;var g=groups.filter(function(z){return z.control===key;})[0];if(!g){g={control:key,values:[],n:0};groups.push(g);}g.values.push(x.metric.value);g.n++;});
       if(groups.length<2)return {ready:false,message:'Registra il risultato A, modifica «'+focus+'» e registra B.'};
       var two=groups.slice(0,2),samples=all.filter(function(x){return x.values[focusKey]===two[0].control||x.values[focusKey]===two[1].control;});
       var controlKeys=Object.keys(samples[0].values).filter(function(k){return k!==focusKey&&k!=='velocita';});
       var confounds=controlKeys.filter(function(k){return samples.some(function(q){return q.values[k]!==samples[0].values[k];});});
       var controlled=confounds.length===0;
       two.forEach(function(g){g.mean=g.values[g.values.length-1];});
       var show=function(v){return Number(v).toLocaleString('it-IT',{maximumFractionDigits:4});};
       var sa=show(two[0].mean),sb=show(two[1].mean),correct=sa===sb?2:two[0].mean>two[1].mean?0:1;
       var comparison={label:samples[0].metric.label,groups:two,correct:correct,controlled:controlled,paired:false,nPairs:0,confounds:confounds,
         diagnostic:controlled?'Confronto descrittivo dello stesso dataset, non repliche indipendenti né test di significatività.':'Confronto non controllato: sono cambiati anche '+confounds.join(', '),
         text:'Indicatore: '+samples[0].metric.label+'. A ('+two[0].control+') = '+sa+'; B ('+two[1].control+') = '+sb+'. Dati '+(controlled?'invariati.':'modificati.')};
       return {ready:controlled,message:controlled?'Confronto A/B pronto. Interpreta i due risultati osservati.':'Mantieni fissi gli altri controlli e soprattutto gli stessi punti: '+confounds.join(', '),comparison:comparison};
     }
   };
 });
}
function installKrigingChallenges(){
 // Le vecchie sfide su IDW e repliche Monte Carlo appartenevano a un'interfaccia rimossa.
 // Questo nuovo banco verifica solo manipolazioni disponibili nel laboratorio unificato.
 SA.challenges.bank.kriging=[
  {id:'kr-map-1',level:'Comprensione',title:'Un sensore in più',baseline:true,
   task:'Apri la sfida, aggiungi un sensore e osserva come cambia la varianza media.',
   question:'A modello e campo invariati, la varianza ottimale dopo aver aggiunto un sensore:',
   options:['Non aumenta, anche se la predizione su una realizzazione può peggiorare.','Aumenta per forza.','È l’errore quadratico osservato sulla specifica mappa.'],correct:0,
   explanation:'La classe dei predittori lineari basati su più osservazioni contiene anche quelli che ignorano il nuovo sensore. L’errore realizzato può invece oscillare.',
   rule:function(s,b){var yes=b&&s.nSensor>b.nSensor&&s.fieldKey===b.fieldKey;return {ready:yes&&s.meanVar<=b.meanVar+1e-8,message:'Aggiungi almeno un sensore senza rigenerare il campo e controlla la varianza media.'};}},
  {id:'kr-map-2',level:'Applicazione',title:'Una previsione, due mappe',baseline:true,
   task:'Apri la sfida, passa alla visualizzazione del valore previsto e sposta un sensore.',
   question:'Quale affermazione è corretta?',options:['La varianza dipende direttamente dai valori Y osservati.','La previsione dipende da valori e geometria; la varianza condizionale dipende dalla geometria e dalla covarianza assunta.','La varianza del kriging coincide sempre con zero sui siti rumorosi.'],correct:1,
   explanation:'A parametri fissati, i pesi si ricavano dalla covarianza e dalle posizioni; la previsione combina i dati, mentre la varianza non dipende dai loro valori.',
   rule:function(s,b){var yes=b&&s.show==='value'&&s.fieldKey===b.fieldKey&&s.sensorKey!==b.sensorKey;return {ready:!!yes,message:'Visualizza il valore previsto e sposta, aggiungi oppure rimuovi un sensore.'};}},
  {id:'kr-map-3',level:'Avanzato',title:'Il range è un’ipotesi',baseline:true,
   task:'Apri la sfida, mantieni lo stesso disegno e varia il range assunto nel controllo della mappa.',
   question:'Come interpreti la varianza quando modifichi il range assunto?',options:['È l’errore della realizzazione nota.','Non può mai cambiare.','È condizionata alla covarianza assunta; cambiare il range può modificarla pur con gli stessi dati.'],correct:2,
   explanation:'L’incertezza è condizionata al modello. Non costituisce una stima universale dell’errore effettivo né tiene conto dell’incertezza sui parametri.',
   rule:function(s,b){var yes=b&&s.fieldKey===b.fieldKey&&s.sensorKey===b.sensorKey&&s.assumedPhi!==b.assumedPhi;return {ready:!!yes,message:'Modifica il range assunto senza spostare i sensori.'};}}
 ];
}
function updateCurriculum(id){
 var content=SA.content&&SA.content[id],pedagogy=SA.pedagogy&&SA.pedagogy[id],c=cfg[id];
 if(!content||!pedagogy)return;
 var outcomes={
  moran:['Intervenire sulle osservazioni puntuali e osservare come cambia Moran I','Definire k vicini e riconoscere che la scelta di W modifica la statistica','Distinguere mappa interpolata e valori osservati usati per il calcolo','Interpretare i cluster senza scambiare I per un test o parametro causale'],
  lisa:['Costruire cluster HH e LL e outlier HL e LH sulla mappa','Comprendere come il numero di vicini kNN cambia le classificazioni','Distinguere il quadrante locale dalla significatività di un test','Collegare l’indicatore locale alle ipotesi sulle matrici dei pesi'],
  'processi-puntuali':['Aggiungere e spostare eventi su una finestra continua','Variare la banda KDE e distinguere stima di intensità e dati','Esplorare L(r)−r in differenti configurazioni di eventi','Comprendere il ruolo degli effetti di bordo e la differenza fra descrizione e test CSR'],
  variogrammi:['Aggiungere e trascinare sensori aggiornando le semivarianze','Calcolare le differenze quadratiche di coppie a distanze simili','Variare le classi di distanza e osservarne l’effetto sul variogramma','Distinguere la superficie IDW illustrativa da un modello di covarianza o dal kriging'],
  kriging:['Aggiungere e rimuovere sensori su uno stesso campo fissato','Confrontare previsione e varianza del kriging ordinario','Studiare l’effetto del range assunto mantenendo immutati i dati','Distinguere incertezza condizionale al modello ed errore osservato'],
  'regressione-spaziale':['Aggiungere e rimuovere osservazioni con covariata X e coordinate','Confrontare OLS Y~X e OLS Y~X+coordinate sul medesimo campione','Interpretare coefficienti, R² e Moran dei residui','Distinguere un trend della media spaziale dalla dipendenza di tipo SAR o SEM']
 };
 content.obiettivi=outcomes[id];
 content.valutiamo=[['Campione','Punti e valori sul quadrato unitario, modificabili sulla mappa'],
  ['Parametro sperimentale',c.focus+' e scenari alternativi sugli stessi dati'],
  ['Indicatore',c.note],
  ['Validità','Confronto descrittivo a dati fissi; nessuna significatività automatica']];
 content.tabella='Tutte le statistiche del laboratorio unificato derivano dai medesimi punti e dagli stessi controlli. Le coordinate sono normalizzate nel quadrato unitario; i risultati non rappresentano, senza ulteriori ipotesi, effetti causali o test di significatività.';
 content.esempio='<p><strong>Esempio guidato.</strong> Apri la mappa, registra la statistica corrente, varia esclusivamente «'+c.focus+'» e registra nuovamente. Leggi i due risultati e chiediti se la definizione del modello o del vicinato è cambiata. Aggiungendo punti modifichi invece il campione: non attribuire automaticamente tutte le differenze al parametro.</p>';
 content.errori=['Confondere la superficie di colore, che è illustrativa o predittiva, con le osservazioni effettivamente analizzate',
  'Cambiare simultaneamente i punti e i parametri e interpretare il confronto come effetto isolato di un solo fattore',
  'Interpretare una differenza descrittiva come un test di significatività, senza modello nullo e calibrazione appropriata',
  'Leggere le coordinate normalizzate come latitudine e longitudine geografiche espresse in gradi',
  'Confondere trend spaziale, vicinato e dipendenza stocastica residua'];
 function block(pair){return '<h3>'+pair[0]+'</h3><p>'+pair[1]+'</p>';}
 var extra='<p><strong>Ambito dell’esperimento:</strong> modello sintetico e coordinate normalizzate. La mappa è un supporto visuale, non un inferitore universale. Le ipotesi cambiano fra autocorrelazione, processi puntuali, geostatistica e regressione; non è corretto trasferire automaticamente test e interpretazioni da un laboratorio all’altro.</p>';
 content.avanzato=theory[id].adv.map(block).join('')+extra;
 pedagogy.guida=[
   'Scegli uno scenario e osserva contemporaneamente i punti, la superficie e gli indicatori statistici riportati nel pannello.',
   'Seleziona una modalità e aggiungi, trascina o rimuovi punti direttamente sulla mappa; leggi come cambiano le statistiche.',
   'Modifica soltanto il controllo «'+c.focus+'» e usa «Registra questa configurazione» per confrontare i valori senza alterare i dati.',
   'Prima di rispondere alle Challenges apri i due livelli di teoria, interpreta i limiti del confronto e scarica lo script R aggiornato.'
 ];
 pedagogy.essenziale=theory[id].base.map(block).join('')+extra;
 pedagogy.avanzato=theory[id].adv.map(block).join('')+extra;
 var formulas={
  moran:String.raw`I=\frac{n}{S_0}\frac{z^{\mathsf T}Wz}{z^{\mathsf T}z}`,
  lisa:String.raw`I_i=\frac{z_i}{m_2}\sum_jw_{ij}z_j`,
  'processi-puntuali':String.raw`\widehat{\lambda}_h(s)=\sum_i\frac{1}{2\pi h^2}\exp\!\left(-\frac{\|s-s_i\|^2}{2h^2}\right)`,
  variogrammi:String.raw`\widehat\gamma(h)=\frac{1}{2|N(h)|}\sum_{(i,j)\in N(h)}(z_i-z_j)^2`,
  kriging:String.raw`\begin{bmatrix}C&\mathbf{1}\\mathbf{1}^{\mathsf T}&0\end{bmatrix}\!\begin{bmatrix}w\\nu\end{bmatrix}=\begin{bmatrix}c\\\mathbf{1}\end{bmatrix}`,
  'regressione-spaziale':String.raw`Y_i=\beta_0+\beta_1X_i+\beta_2x_i+\beta_3y_i+\varepsilon_i`
 };
 pedagogy.formula=formulas[id];
 pedagogy.formulaNote='Identità riferita al modello e alla statistica esplicitati qui; l’interfaccia calcola soltanto le quantità descritte nella mappa unificata.';
}
function register(id,type){
 updateCurriculum(id);
 var c=cfg[id],runtime=null,lab={
   challengeEvidence:function(){if(!runtime)return null;var s=runtime.studio,d=runtime.studio.calculate(),value=NaN,label='';
     if(type==='moran'||type==='lisa'){value=d.moran.I;label='Moran I dei punti';}
     else if(type==='points'){value=SA.spatialStudio.smooth(s.state.points,.5,.5,'kde',s.state.band);label='Intensità KDE stimata al centro';}
     else if(type==='variogram'){var v=d.variogram&&d.variogram.gamma.filter(isFinite);value=v&&v.length?v.reduce(function(a,b){return a+b;},0)/v.length:NaN;label='Media delle semivarianze per classe';}
     else if(type==='kriging'){value=d.maps&&d.maps.var.reduce(function(a,b){return a+b;},0)/d.maps.var.length;label='Varianza media kriging';}
     else if(type==='regression'){value=(s.state.model==='coords'?d.modelCoords:d.modelX)?.moran;label='Moran I dei residui OLS';}
     return {label:label,value:value};
   },
   challengeState:function(){if(!runtime)return {};var s=runtime.studio.state,d=runtime.studio.calculate(),kv=d.maps&&d.maps.var,vs=kv?kv.reduce(function(a,b){return a+b;},0)/kv.length:NaN;
     return {nSensor:s.points.length,meanVar:vs,fieldKey:'latent-2026',sensorKey:s.points.map(function(p){return p.id;}).join(','),show:s.show,assumedPhi:s.other.covOptions?.phi||.25,method:'ordinary',reps:0};
   },
   mount:function(page,info){
     var ui=SA.ui,head=ui.el('header.lab-head',ui.el('div',ui.el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),ui.el('h1',info.lab.title),ui.el('p.lede',c.question+' Esperimento unico: modifica direttamente i punti sulla mappa.')),
       ui.button('Approfondisci',{icon:'book',onclick:function(){ui.openDrawer(c.title,{base:function(){return theoryNode(id,'base');},adv:function(){return theoryNode(id,'adv');}});}}));
     page.append(head);
     var q=ui.step('1','Domanda');q.body.append(ui.el('p.question',c.question));page.append(q);
     var ex=ui.step('2','Esperimento','Disegna, sposta, confronta: gli indicatori usano gli stessi punti della mappa.');page.append(ex);
     var source=basePoints(type),site=null;
     var studio=SA.spatialStudio.create(type,{standalone:true,source:function(){return source;},onActivity:function(state,derived){
       if(!site)return;
       // Solo un cambiamento effettivo dei dati o il comando esplicito
       // «Registra questa configurazione» produce una nuova evidenza.
       // Selezionare un parametro aggiorna i controlli ma non crea una replica.
       var changed=site.revision!==state.dataVersion;
       if(changed){var tracker=site.tracker;if(tracker){tracker.value=String(state.dataVersion||0);tracker.dispatchEvent(new Event('change',{bubbles:true}));}site.revision=state.dataVersion;}
       var measured=(state.measureCount||0)>site.measureCount;
       site.measureCount=state.measureCount||0;
       if((changed||measured)&&SA.challenges&&SA.challenges.noteStep)SA.challenges.noteStep(id);
       if(site.code)site.code.refresh();
     }});
     ex.body.append(studio.root);
     var tracker=ui.el('label.field',{style:'display:none'},ui.el('span','Versione dei dati spaziali'),ui.el('input',{type:'text',value:'0','aria-label':'Versione dei dati spaziali'}));
     var input=tracker.querySelector('input');studio.root.querySelector('.controls').appendChild(tracker);
     site={studio:studio,code:null,tracker:input,revision:studio.state.dataVersion||0,measureCount:studio.state.measureCount||0};runtime=site;
     var note=ui.step('3','Come interpretare');note.body.append(ui.el('div.prose',ui.el('p',c.note),ui.el('p','Prova a cambiare un solo elemento per volta. Un pattern osservato non rappresenta automaticamente un test di significatività o una relazione causale.'),ui.button('Apri teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:function(){ui.openDrawer(c.title,{base:function(){return theoryNode(id,'base');},adv:function(){return theoryNode(id,'adv');}},'adv');}})));page.append(note);
     var r=ui.step('4','Riproduci in R','Dati della mappa esportati in uno script R aggiornabile');
     r.body.append(ui.el('p.prose','Il codice contiene esattamente le coordinate e i valori attuali. Si distinguono formule riprodotte in R e visualizzazioni illustrative; la corrispondenza numerica completa rimane soggetta alla Macrofase A.'));
     var code=ui.codeBlock(function(){return rScript(id,studio);},'statatlas_lab'+info.lab.num+'_mappa.R');r.body.append(code);page.append(r);site.code=code;code.refresh();
   },
   unmount:function(){runtime=null;},redraw:function(){if(runtime)runtime.studio.render();}
 };
 if(id==='kriging')installKrigingChallenges(); else installMapChallenges(id);
 SA.registerLab(id,lab);
}
return {register:register,rScript:rScript,basePoints:basePoints};
})();
