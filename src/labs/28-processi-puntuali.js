/* StatAtlas | LAB 28 — Processi puntuali, struttura spaziale e CSR.
 * K translation-corrected su [0,1]^2; test Monte Carlo globale T=max_r |Lhat(r)-r|.
 * La null CSR condiziona su n, quindi i processi alternativi non richiedono un'intensita stimata.
 */
(function(){
  'use strict';
  var el,S,runner,controls,mapBox,curveBox,quadratBox,mcBox,guide,mcStatus,tableBody,kpis,interp,code,predBox,predFeedback,modelNote;
  var PP=SA.spatialPoints;
  var TYPES={csr:'Poisson omogeneo (CSR)',thomas:'Aggregato: Thomas',inhibition:'Repulsivo: inibizione sequenziale',inhomogeneous:'Poisson non omogeneo'};
  function fmt(v,d){return Number.isFinite(v)?SA.fmt(v,d==null?3:d):'—';}
  function initial(old){var s={type:'csr',lambda:100,sigma:.055,kappa:8,radius:.060,gradient:.85,B:99,seed:2026,display:'L',edit:'select',selected:0,prediction:null};if(old)Object.keys(s).forEach(function(k){if(old[k]!==undefined)s[k]=old[k];});return s;}
  function resetEnvelope(){S.sims=[];S.rng=new SA.RRNG(S.seed+7303);}
  function recompute(){S.obs=PP.curve(S.pts);S.quad=PP.quadrats(S.pts,4);S.nn=PP.nearest(S.pts);S.selected=Math.min(Math.max(S.selected,0),Math.max(0,S.pts.length-1));resetEnvelope();}
  // Un cambio ai dati invalida gli envelope precedenti, ma lascia la nuova
  // configurazione pronta: Avvia/Passo/Completa sono sempre azioni esplicite.
  function rebuild(regen){runner.stop();if(regen){S.gen=PP.generate(S,new SA.RRNG(S.seed));S.pts=S.gen.points.slice();S.edited=false;}recompute();render();code.refresh();runner.refresh();}
  function completed(){return Math.min(S.sims.length,S.B);}
  function simulations(){return S.sims.length>S.B?S.sims.slice(0,S.B):S.sims;}
  function refreshInference(){runner.stop();render();code.refresh();runner.refresh();}
  function step(){if(S.sims.length>=S.B || !S.obs.valid)return false;S.sims.push(PP.curve(PP.fixed(S.pts.length,S.rng),S.obs.r));return true;}
  function infer(){var sims=simulations();return {env:PP.envelope(sims,S.obs.r),p:PP.globalP(S.obs,sims)};}
  function svgText(root,x,y,str,opts){var a=Object.assign({x:x,y:y,fill:SA.theme().ink_2,'font-size':12},opts||{});return SA.plot.text(root,x,y,str,a);}
  function drawPattern(){
    var P=SA.plot,t=SA.theme();mapBox.innerHTML='';var root=P.svg('svg',{viewBox:'0 0 650 375',role:'group','aria-label':'Punti nel quadrato unitario: selezionabili o modificabili'},mapBox);
    var left=78,top=28,side=305;
    P.svg('rect',{x:left,y:top,width:side,height:side,rx:4,fill:t.paper_2,stroke:t.rule_2,'stroke-width':1.5},root);
    for(var z=1;z<4;z++){
      P.svg('line',{x1:left+z*side/4,x2:left+z*side/4,y1:top,y2:top+side,stroke:t.rule,'stroke-dasharray':'2 4'},root);
      P.svg('line',{x1:left,x2:left+side,y1:top+z*side/4,y2:top+z*side/4,stroke:t.rule,'stroke-dasharray':'2 4'},root);
    }
    P.svg('rect',{x:left,y:top,width:side,height:side,fill:'transparent',style:'cursor:'+(S.edit==='add'?'crosshair':'default')},root)
      .addEventListener('click',function(ev){if(S.edit!=='add')return;var pt=root.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;var inv=root.getScreenCTM().inverse(),q=pt.matrixTransform(inv);var x=(q.x-left)/side,y=1-(q.y-top)/side;if(x<0||x>1||y<0||y>1)return;S.pts.push({x:x,y:y});S.edited=true;S.selected=S.pts.length-1;rebuild(false);});
    S.pts.forEach(function(p,i){var x=left+p.x*side,y=top+(1-p.y)*side,selected=S.selected===i;
      var c=P.svg('circle',{cx:x,cy:y,r:selected?5.4:3.1,fill:selected?t.accent:t.c1,stroke:selected?t.ink:t.paper_2,'stroke-width':selected?2:0.55,
        tabindex:0,role:'button',style:'cursor:pointer','aria-label':'Evento '+(i+1)+', x '+fmt(p.x,3)+', y '+fmt(p.y,3)},root);
      (function(index){function choose(){if(S.edit==='remove'){S.pts.splice(index,1);S.edited=true;S.selected=Math.min(index,S.pts.length-1);rebuild(false);}else{S.selected=index;render();}}c.addEventListener('click',function(e){e.stopPropagation();choose();});c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});})(i);
    });
    if(S.pts.length>1){var src=S.pts[S.selected],best=Infinity,nn=-1;S.pts.forEach(function(q,i){if(i===S.selected)return;var d=Math.hypot(q.x-src.x,q.y-src.y);if(d<best){best=d;nn=i;}});
      if(nn>=0){var dst=S.pts[nn];P.svg('line',{x1:left+src.x*side,y1:top+(1-src.y)*side,x2:left+dst.x*side,y2:top+(1-dst.y)*side,stroke:t.c2,'stroke-width':2.2,'stroke-dasharray':'5 4'},root);}}
    [0,.25,.5,.75,1].forEach(function(v){svgText(root,left+side*v,top+side+19,fmt(v,2),{'text-anchor':'middle'});svgText(root,left-11,top+side*(1-v)+4,fmt(v,2),{'text-anchor':'end'});});
    svgText(root,left+side/2,371,'Coordinata x',{'text-anchor':'middle','font-style':'italic'});
    var ox=417;
    svgText(root,ox,45,'REALIZZAZIONE',{'font-size':11,'font-weight':700,fill:t.ink_3});
    svgText(root,ox,77,S.pts.length+' eventi',{'font-size':23,'font-weight':600,fill:t.ink});
    svgText(root,ox,108,'Area della finestra: 1');
    svgText(root,ox,133,'Densità osservata: '+S.pts.length);
    svgText(root,ox,165,'EVENTO SELEZIONATO',{'font-size':11,'font-weight':700,fill:t.ink_3});
    if(S.pts.length){var pp=S.pts[S.selected];svgText(root,ox,192,'n. '+(S.selected+1)+' · ('+fmt(pp.x,2)+'; '+fmt(pp.y,2)+')');svgText(root,ox,214,'Vicino più prossimo: '+fmt(S.nn.distances[S.selected],3));}
    svgText(root,ox,258,'COME INTERAGIRE',{'font-size':11,'font-weight':700,fill:t.ink_3});
    svgText(root,ox,282,S.edit==='add'?'Clicca nello spazio per aggiungere':S.edit==='remove'?'Clicca un punto per rimuoverlo':'Clicca un punto per selezionarlo');
    svgText(root,ox,304,'La linea tratteggiata collega i vicini');
    guide.textContent='Modello iniziale: '+TYPES[S.type]+' · '+S.pts.length+' eventi. '+(S.edited?'Configurazione modificata manualmente: non è più una realizzazione pura del generatore. ':'')+(S.edit==='add'?'Clicca un punto libero sulla mappa per aggiungere un evento.':S.edit==='remove'?'Clicca un evento per eliminarlo.':'Clicca un evento per evidenziare il suo vicino più prossimo.')+' La banda precedente viene invalidata quando cambi i dati: premi Avvia per calcolarne una nuova.';
  }
  function drawCurve(){
    if(!S.obs.valid){curveBox.innerHTML='<p class="muted">Servono almeno due punti per stimare K e L.</p>';return;}
    var P=SA.plot,t=SA.theme(),rr=S.obs.r,isL=S.display==='L',arr=isL?S.obs.L:S.obs.K,reference=rr.map(function(r){return isL?0:Math.PI*r*r;});
    var env=infer().env,lo=isL?env.lo:env.lo.map(function(v,i){return Math.PI*Math.pow(v+rr[i],2);}),hi=isL?env.hi:env.hi.map(function(v,i){return Math.PI*Math.pow(v+rr[i],2);});
    var all=arr.concat(reference,lo,hi).filter(Number.isFinite),min=Math.min.apply(null,all),max=Math.max.apply(null,all),dy=Math.max(.025,(max-min)*.17);
    if(!isL)min=Math.min(0,min);
    var F=P.frame(curveBox,{W:700,H:280,x:[0,.26],y:[min-dy,max+dy],xlabel:'Distanza r',ylabel:isL?'L(r) − r':'K(r)',label:'Statistica osservata e envelope sotto CSR condizionata sul numero di eventi'});
    function path(vals){return vals.map(function(y,i){return (i?'L':'M')+F.x(rr[i])+','+F.y(y);}).join(' ');}
    if(completed()>=5){var outline=path(hi)+' '+lo.map(function(_,j){var i=lo.length-1-j;return 'L'+F.x(rr[i])+','+F.y(lo[i]);}).join(' ')+' Z';
      P.svg('path',{d:outline,fill:t.c3,'fill-opacity':.17,stroke:'none'},F.g);
      P.svg('path',{d:path(lo),fill:'none',stroke:t.c3,'stroke-dasharray':'4 3','stroke-width':1.4},F.g);
      P.svg('path',{d:path(hi),fill:'none',stroke:t.c3,'stroke-dasharray':'4 3','stroke-width':1.4},F.g);
    }
    P.svg('path',{d:path(reference),fill:'none',stroke:t.ink_3,'stroke-width':1.8,'stroke-dasharray':'5 4'},F.g);
    P.svg('path',{d:path(arr),fill:'none',stroke:t.c1,'stroke-width':2.6},F.g);
    svgText(F.root,F.m.l+8,24,'Blu: dati · tratteggio grigio: CSR · banda: envelope 95% puntuale',{fill:t.ink_2,'font-size':12});
  }
  function drawQuadrats(){
    var P=SA.plot,t=SA.theme(),q=S.quad,counts=q.counts,max=Math.max(1,...counts),root;
    quadratBox.innerHTML='';root=P.svg('svg',{viewBox:'0 0 650 205',role:'img','aria-label':'Conteggi dei punti nelle sedici celle della griglia 4 per 4'},quadratBox);
    var side=45,ox=85,oy=11;
    counts.forEach(function(n,i){var row=Math.floor(i/4),col=i%4,x=ox+col*side,y=oy+row*side;
      P.svg('rect',{x:x,y:y,width:43,height:43,rx:3,fill:t.c1,'fill-opacity':.10+.82*(n/max),stroke:t.card,'stroke-width':1},root);
      svgText(root,x+21.5,y+27,String(n),{'text-anchor':'middle',fill:t.ink,'font-size':13,'font-weight':700});
    });
    svgText(root,320,37,'INDICE DI DISPERSIONE',{'font-size':11,'font-weight':700,fill:t.ink_3});
    svgText(root,320,79,fmt(q.dispersion,3),{'font-size':27,'font-weight':600,fill:t.ink});
    svgText(root,320,109,'Varianza campionaria dei conteggi / media');
    svgText(root,320,139,'Riferimento CSR: 1 (in media)');
    svgText(root,320,169,'Solo 16 celle: forte variabilità campionaria');
  }
  function drawMonteCarlo(){
    var P=SA.plot,t=SA.theme(),v=simulations().map(function(q){return q.T;}).filter(Number.isFinite),ob=S.obs.T;
    if(!Number.isFinite(ob)){mcBox.innerHTML='<p class="muted">La statistica globale non è definita.</p>';return;}
    var hi=Math.max(.02,ob,...v)*1.14,N=20,h=new Array(N).fill(0);
    v.forEach(function(q){h[Math.min(N-1,Math.floor(q/hi*N))]++;});
    var top=Math.max(2,...h)*1.2,F=P.frame(mcBox,{W:700,H:250,x:[0,hi],y:[0,top],xlabel:'T = max |L(r) − r|',ylabel:'Frequenza',label:'Distribuzione Monte Carlo di una statistica globale contro CSR'});
    h.forEach(function(n,i){if(n)P.svg('rect',{x:F.x(i*hi/N)+1,y:F.y(n),width:Math.max(1,F.x((i+1)*hi/N)-F.x(i*hi/N)-2),height:F.y(0)-F.y(n),fill:t.c1,'fill-opacity':.67},F.g);});
    P.svg('line',{x1:F.x(ob),x2:F.x(ob),y1:F.m.t,y2:F.y(0),stroke:t.c2,'stroke-width':2.6},F.g);
    svgText(F.root,F.m.l+7,24,'Arancio: T osservata · confronto con CSR condizionata su n',{fill:t.ink_2,'font-size':12});
    mcStatus.textContent=v.length+' / '+S.B+' simulazioni CSR'+(v.length<S.B?' · risultati provvisori':' · completate');
  }
  function updateTable(){
    var result=infer(),p=result.p,ready=completed()>=S.B;
    var rows=[
      ['Numero di eventi','Variabile per Poisson; fissato per inibizione',S.pts.length,'osservato'],
      ['Densità empirica N/|W|','Area unitaria',fmt(S.pts.length,1),'esatto'],
      ['Distanza media al vicino più prossimo','Dipende da intensità, bordo e interazione',fmt(S.nn.mean,4),'descrittivo'],
      ['Dispersione dei conteggi in 16 celle','E[indice] = 1 sotto CSR',fmt(S.quad.dispersion,3),'descrittivo'],
      ['K(r) osservato per r = 0,125','CSR: πr² = '+fmt(Math.PI*.125*.125,4),fmt(S.obs.valid?S.obs.K[9]:NaN,4),'stima'],
      ['L(r) − r per r = 0,125','CSR: 0 nel limite teorico',fmt(S.obs.valid?S.obs.L[9]:NaN,4),'stima'],
      ['T globale = massimo |L(r)−r|','r ∈ {0,0125, …, 0,25}',fmt(S.obs.T,4),'stima'],
      ['p-value Monte Carlo globale','CSR, n fissato, B = '+S.B,ready?fmt(p,4):'provvisorio '+fmt(p,4),'Monte Carlo'],
      ['Repliche CSR completate',String(S.B),String(completed()),'Monte Carlo']
    ];
    tableBody.innerHTML='';rows.forEach(function(r){tableBody.appendChild(el('tr',r.map(function(v){return el('td',v);})))});
    kpis.innerHTML='';kpis.append(el('div.kpi',el('b',String(S.pts.length)),el('span','eventi nel dominio')),
      el('div.kpi',el('b',fmt(S.obs.T,3)),el('span','statistica globale T')),
      el('div.kpi',el('b',ready?fmt(p,3):'…'),el('span','p-value CSR · B='+S.B)));
    interp.innerHTML='';
    interp.append(el('p','Il modello generatore è '+TYPES[S.type]+'. La statistica K corretta per il bordo descrive la struttura di secondo ordine; il grafico mostra '+(S.display==='L'?'L(r)−r, la cui curva teorica vale zero sotto CSR':'K(r), che sotto CSR vale πr²')+'.'),
      el('p','Le bande al 95% sono envelope puntuali ottenuti con simulazioni CSR aventi lo stesso numero n di eventi. Superarle in qualche r non equivale a un test globale al 5%. Il p-value della tabella usa invece la statistica T = max_r |L(r)−r| e la sua distribuzione Monte Carlo.'),
      el('p',S.type==='inhomogeneous'?'Il generatore non omogeneo ha intensità crescente in x ma non impone interazione fra eventi: una deviazione dalla CSR omogenea non dimostra di per sé clustering da interazione.':
      S.type==='inhibition'?'Il generatore repulsivo arresta la simulazione a un numero obiettivo di punti (o dopo un limite di tentativi): NON è un processo di Poisson. Il numero effettivo può essere inferiore al target.':
      S.type==='thomas'?'Il processo di Thomas genera centri parentali Poisson e gruppi di figli gaussiani. Il numero dei punti osservati è casuale e l’intensità marginale è circa λ, fatta salva la troncatura dell’estensione dei parentali.':
      'Nel processo di Poisson omogeneo gli eventi sono indipendenti e il numero nel quadrato ha distribuzione Poisson. In un campione può comunque comparire un addensamento visivo.'),
      el('p',(S.edited?'Hai aggiunto o rimosso eventi: il campione non segue necessariamente più il meccanismo selezionato. ':'')+'La funzione K utilizza qui la correzione translation nel quadrato. Le distanze e il risultato dipendono dalla finestra di osservazione, dalla risoluzione dei raggi e dall’assunzione di stazionarietà. Non identificano automaticamente un meccanismo causale.'));
  }
  function render(){drawPattern();drawCurve();drawQuadrats();drawMonteCarlo();updateTable();}
  function buildControls(){
    controls.innerHTML='';
    function select(label,key,arr,regen){return el('label.field',el('span',label),el('select',{onchange:function(){S[key]=this.value;if(key==='display'||key==='edit')render();else if(key==='B')refreshInference();else rebuild(!!regen);}},arr.map(function(a){return el('option',{value:a[0],selected:String(a[0])===String(S[key])},a[1]);})));}
    controls.append(
      select('Meccanismo generatore','type',Object.keys(TYPES).map(function(k){return[k,TYPES[k]];}),true),
      select('Intensità attesa λ / target repulsione','lambda',[[50,'50'],[80,'80'],[100,'100'],[140,'140']],true),
      SA.ui.slider('Thomas · dispersione σ',{min:.025,max:.11,step:.005,value:S.sigma,format:function(v){return fmt(v,3);},onchange:function(v){S.sigma=v;rebuild(true);}}),
      select('Thomas · intensità centri κ','kappa',[[4,'4'],[8,'8'],[12,'12'],[20,'20']],true),
      SA.ui.slider('Inibizione · distanza minima',{min:.025,max:.095,step:.005,value:S.radius,format:function(v){return fmt(v,3);},onchange:function(v){S.radius=v;rebuild(true);}}),
      SA.ui.slider('Non omogeneo · gradiente',{min:0,max:.95,step:.05,value:S.gradient,format:function(v){return fmt(v,2);},onchange:function(v){S.gradient=v;rebuild(true);}}),
      select('Curva da confrontare','display',[['L','L(r) − r'],['K','K(r)']],false),
      select('Interazione con la mappa','edit',[['select','Seleziona un punto'],['add','Aggiungi un punto'],['remove','Rimuovi un punto']],false),
      select('Simulazioni sotto CSR','B',[[49,'49'],[99,'99'],[199,'199']],false),
      el('label.field',el('span','Seed'),el('input',{type:'number',min:1,value:S.seed,onchange:function(){S.seed=Math.max(1,Math.floor(+this.value||1));rebuild(true);}})),
      SA.ui.button('Genera una nuova realizzazione',{cls:'btn-ghost',onclick:function(){S.seed++;buildControls();rebuild(true);}}),
      SA.ui.button('Ripristina i dati del seed',{cls:'btn-ghost',onclick:function(){rebuild(true);}}));
    runner.controls('Simula una configurazione CSR').forEach(function(e){controls.appendChild(e);});
    modelNote=el('p.muted',{style:'font-size:.78rem'},'I parametri σ e κ sono attivi solo per Thomas, il raggio per la repulsione, il gradiente per Poisson non omogeneo.');
    controls.append(modelNote);
  }
  function buildPrediction(){
    predBox.innerHTML='';
    var answers=[['yes','Sì: gli addensamenti dimostrano sempre interazione'],['no','No: servono un modello nullo e una valutazione della variabilità'],['fixed','Sì, purché ci siano almeno 100 punti']];
    var items=answers.map(function(a,i){
      var inp=el('input',{type:'radio',name:'points-pred',id:'points-pred-'+i,value:a[0],onchange:function(){
        S.prediction=this.value;predFeedback.hidden=false;
        predFeedback.textContent=a[0]==='no'?'✓ Corretto. La CSR può produrre addensamenti apparenti; un’intensità variabile può fare lo stesso senza interazione.':'Non proprio. Un pattern raggruppato può emergere per caso o per un gradiente d’intensità senza interazione tra eventi.';
      }});
      return el('div.choice',inp,el('label',{for:'points-pred-'+i},a[1]));
    });
    var grp=el('div.choices',{role:'radiogroup','aria-label':'Previsione sulle configurazioni puntuali'},items);
    predBox.append(el('p.prose','Un insieme di eventi appare raggruppato: possiamo dedurre che esiste interazione attrattiva?'),grp);
    predFeedback=el('div.feedback',{role:'status',hidden:true});predBox.appendChild(predFeedback);
  }
  function codeR(){
    if(S.pts.length<2)return '# Non ci sono eventi sufficienti per stimare K. Ripristina i dati o aggiungi punti.\n';
    var pts=S.pts, x=pts.map(function(p){return p.x.toPrecision(17);}).join(', '),y=pts.map(function(p){return p.y.toPrecision(17);}).join(', '), K=S.obs.K.map(function(v){return Number.isFinite(v)?v.toPrecision(17):'NA_real_';}).join(', ');
    return [
      '# StatAtlas · Lab 28 · Processi puntuali · dati mostrati espliciti (R0), K translation (R1)',
      '# Per i processi alternativi e le envelope si confronta il metodo (R3), non la sequenza RNG.',
      'x <- c('+x+'); y <- c('+y+')',
      'rr <- seq(0.0125, 0.25, by=0.0125)',
      'js_K <- c('+K+')',
      'n <- length(x); stopifnot(n >= 2)',
      'K_translation <- function(x,y,r) {',
      ' n <- length(x); ans <- numeric(length(r))',
      ' if(n<2) return(rep(NA_real_, length(r)))',
      ' for(i in seq_len(n-1L)) for(j in (i+1L):n) {',
      '   dx <- abs(x[i]-x[j]);dy <- abs(y[i]-y[j]);d <- sqrt(dx^2+dy^2)',
      '   if(d <= max(r)) ans <- ans + 2/(n*(n-1)*(1-dx)*(1-dy)) * as.numeric(d <= r)',
      ' }',
      ' ans',
      '}',
      'K <- K_translation(x,y,rr);stopifnot(max(abs(K-js_K)) < 1e-8)',
      'Lminus <- sqrt(K/pi)-rr;Tobs <- max(abs(Lminus))',
      'cat("OK: K translation e T globali coincidono con StatAtlas JS\\n")',
      'nq <- 4; ic <- pmin(3L, floor(x*4)); ir <- pmin(3L, floor((1-y)*4))',
      'counts <- tabulate(1L + ir*4L + ic, nbins=16L)',
      'disp <- var(counts)/mean(counts)',
      'nn <- vapply(seq_len(n),function(i) min(sqrt((x[i]-x[-i])^2+(y[i]-y[-i])^2)),numeric(1))',
      'cat("N:",n,"| media NN:",mean(nn),"| indice quadrati:",disp,"| T:",Tobs,"\\n")',
      'set.seed('+S.seed+'); B <- '+S.B+'; Ts <- numeric(B); Ls <- matrix(NA_real_, B,length(rr))',
      'for(b in seq_len(B)) {',
      '  # Null condizionale su n: n coordinate uniformi indipendenti nel quadrato',
      '  u <- runif(n); v <- runif(n)',
      '  kk <- K_translation(u,v,rr)',
      '  Ls[b,] <- sqrt(kk/pi)-rr;Ts[b] <- max(abs(Ls[b,]))',
      '}',
      'p_mc <- (1+sum(Ts >= Tobs))/(B+1)',
      'envelope <- rbind(apply(Ls,2,quantile,.025),apply(Ls,2,quantile,.975))',
      'plot(rr,Lminus,type="l",col="steelblue",lwd=2,xlab="r",ylab="L(r) - r")',
      'abline(h=0,lty=2);lines(rr,envelope[1,],lty=3);lines(rr,envelope[2,],lty=3)',
      'cat("p-value globale simulato in R (R3):",p_mc,"\\n")',
      'if(requireNamespace("spatstat.geom",quietly=TRUE) && requireNamespace("spatstat.explore",quietly=TRUE)){',
      '  pp <- spatstat.geom::ppp(x,y,window=spatstat.geom::owin(c(0,1),c(0,1)))',
      '  kest <- spatstat.explore::Kest(pp,r=c(0,rr),correction="translate")',
      '  cat("Confronto facoltativo con spatstat: differenze di convenzione/numeriche possibili.\\n")',
      '  print(head(as.data.frame(kest)))',
      '}',
      '# Il superamento della banda PUNTUALE in un r non e un test globale al 5%. '
    ].join('\n');
  }
  var THEORY={
    base:function(){return el('div.prose',{html:'<h3>1. Che cosa osserviamo?</h3><p>Un pattern puntuale è un insieme di posizioni osservate in una finestra W. L’intensità λ(s) esprime il numero medio di eventi per unità di area presso s, non la probabilità che un punto cada esattamente in quella posizione.</p><h3>2. Casualità spaziale completa</h3><p>Con CSR (processo di Poisson omogeneo), N(W) ha distribuzione Poisson(λ|W|) e, condizionatamente a N=n, le n posizioni sono indipendenti e uniformi nella finestra. Perciò possono comparire addensamenti visivi anche senza attrazione tra eventi.</p><h3>3. Un esperimento con tre alternative</h3><p>Il processo di Thomas genera eventi attorno a centri parentali; il modello di inibizione sequenziale impone una distanza minima tra eventi accettati; il Poisson non omogeneo aumenta l’intensità lungo l’asse x senza aggiungere interazione tra eventi.</p><h3>4. K e L di Ripley</h3><div class="eq" data-tex="K_{CSR}(r)=\\pi r^2,\\qquad L(r)=\\sqrt{K(r)/\\pi}"></div><p>Per CSR, L(r)−r è teoricamente zero. Una curva osservata positiva può suggerire un eccesso di vicini a quella distanza, una negativa un deficit. Le curve sono stime casuali e dipendono dalla correzione del bordo.</p><h3>5. Inferenza mediante simulazione</h3><p>Conserviamo il numero di eventi osservati e rigeneriamo configurazioni uniformi indipendenti. Le bande al 95% sono envelope <em>puntuali</em>. Il test globale, invece, confronta T = max |L(r)−r| con lo stesso massimo calcolato sulle repliche CSR: evita di interpretare un solo superamento della banda come significativo.</p><div class="callout warn"><strong>Attenzione:</strong> rifiutare la CSR omogenea non dimostra interazione spaziale. Anche un’intensità di fondo variabile può produrre cluster apparenti.</div>'});},
    adv:function(){return el('div.prose',{html:'<h3>Processi puntuali e misure fattoriali</h3><p>Per un processo stazionario di intensità λ, la funzione K si definisce tramite il numero atteso di altri eventi entro r da un evento tipico, diviso λ. Con funzione di correlazione a coppie isotropa g(r), K(r)=2π∫₀ʳ t g(t)dt. Sotto CSR g(r)=1 e K(r)=πr². Questa relazione richiede le opportune ipotesi di stazionarietà/isotropia per la forma radiale.</p><h3>Stima e correzione translation</h3><p>Nel quadrato unitario si considerano le coppie ordinate a distanza ≤r, pesate con l’inverso della frazione di area di sovrapposizione della finestra traslata: eᵢⱼ=(1−|Δx|)(1−|Δy|). L’implementazione usa K̂(r)= Σᵢ≠ⱼ 1(dᵢⱼ≤r)/[n(n−1)eᵢⱼ]. Poiché il denominatore usa n(n−1), la normalizzazione è particolarmente adatta al confronto CSR condizionale su n; alcuni estimatori software hanno convenzioni diverse.</p><h3>Poisson non omogeneo</h3><p>Nel simulatore λ(x,y)=λ[1+a(2x−1)], 0≤a&lt;1, con intensità media λ. Le posizioni sono generate mediante thinning di un processo Poisson omogeneo a intensità λ(1+a). L’inferenza riportata testa sempre CSR <em>omogenea</em>, non l’indipendenza condizionale a questa intensità spazialmente variabile.</p><h3>Processo di Thomas</h3><p>I genitori sono un processo Poisson con intensità κ; ciascuno genera un numero Poisson(μ) di figli, distribuiti con scarti gaussiani isotropi di deviazione σ. L’intensità marginale ideale è κμ=λ. Per evitare forti effetti ai bordi, i genitori vengono simulati su una finestra estesa di 4σ e poi i figli vengono ritagliati sul quadrato: l’errore residuo dovuto alla coda gaussiana è limitato ma non esattamente nullo.</p><h3>Inibizione sequenziale</h3><p>Si propongono uniformemente punti nel quadrato e si accetta un punto soltanto se dista almeno ρ da quelli già accettati, fino a raggiungere n obiettivo oppure il limite di tentativi. Questo è un modello sequenziale didattico e non un processo hard-core Gibbs stazionario campionato all’equilibrio. N non segue una legge Poisson e λ è un obiettivo, non l’intensità del processo.</p><h3>Envelope e validità del test</h3><p>L’envelope fra i quantili empirici 0,025 e 0,975 in ciascun r è puntuale. Il test globale usa T=sup sui 20 raggi discreti |L̂(r)−r|, con p=(1+#{Tᵦ≥Tobs})/(B+1). Condizionando su n e usando lo stesso stimatore per dati e simulazioni, il test di Monte Carlo è valido sotto CSR (a meno della discreteness/numero finito di repliche). La funzione K delle singole realizzazioni non coincide esattamente con il valore teorico πr², anche sotto CSR.</p><h3>Limiti metodologici</h3><p>L’interpretazione della K omogenea si altera con intensità non costante, finestre irregolari, scelta dei raggi o dati di eventi con localizzazione incerta. Una funzione K inhomogeneous richiede stima/definizione dell’intensità λ(s) e ulteriori assunzioni. Distanza media al vicino più prossimo e indice di dispersione per quadrati sono statistiche descrittive influenzate da bordo e dimensione delle celle; da sole non dimostrano clustering.</p>'});}
  };
  SA.registerLab('processi-puntuali',{
    mount:function(page,info){
      el=SA.ui.el;S=initial(S);S.gen=PP.generate(S,new SA.RRNG(S.seed));S.pts=S.gen.points.slice();S.edited=false;recompute();
      runner=SA.ui.runner({speed:2,coop:true,step:step,render:render,done:function(){return S.sims.length>=S.B||!S.obs.valid;},progress:function(){return completed()/S.B;},reset:resetEnvelope});
      function theory(level){SA.ui.openDrawer('Processi puntuali spaziali',THEORY,level);}
      page.append(el('header.lab-head',el('div',el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),el('h1',info.lab.title),el('p.lede','Dove cadono gli eventi? Dalla casualità completa ai gruppi e alla repulsione, con funzioni K/L e inferenza Monte Carlo.')),SA.ui.button('Approfondisci',{icon:'book',onclick:function(){theory();}})));
      var q=SA.ui.step('1','Domanda');q.body.append(el('p.question','Quando i punti sembrano raggruppati, è vera attrazione spaziale oppure può essere soltanto il caso?'));
      var pred=SA.ui.step('2','La tua previsione');predBox=el('div');pred.body.append(predBox);
      var ex=SA.ui.step('3','Esperimento','Genera, modifica gli eventi e confrontali con la CSR');controls=el('div.panel.controls');mapBox=el('div');curveBox=el('div');quadratBox=el('div');mcBox=el('div');guide=el('p.moran-map-info');mcStatus=el('span.moran-perm-status');
      ex.body.append(el('div.moran-guide',{role:'note'},el('strong','Come giocare con il laboratorio'),el('ol',
        el('li','Osserva il Poisson omogeneo e la curva L(r)−r: parti dalla banda simulata, non soltanto dalla forma della nuvola.'),
        el('li','Scegli Thomas o repulsione: modifica i parametri specifici del generatore e confronta le curve.'),
        el('li','Clicca un evento per vedere il vicino più prossimo, oppure seleziona Aggiungi/Rimuovi punto.'),
        el('li','Le repliche CSR restano ferme all’apertura: premi Avvia, Passo o Completa. Dopo aver cambiato i dati riavvia manualmente; interpreta il p-value solo dopo aver calcolato repliche.'),
        el('li','Prova il Poisson non omogeneo: una violazione della CSR omogenea non prova interazione fra gli eventi.'))));
      ex.body.append(el('div.lab-grid',controls,el('div.figure',
        el('div.fig',el('div.fig-title',el('h3','Posizione degli eventi nel quadrato unitario')),mapBox,guide),
        el('div.fig',el('div.fig-title',el('h3','K di Ripley e trasformazione L: dati ed envelope')),curveBox),
        el('div.fig',el('div.fig-title',el('h3','Conteggi in quadrati e indice di dispersione')),quadratBox),
        el('div.fig',el('div.fig-title',el('h3','Test globale Monte Carlo contro CSR'),mcStatus),mcBox),
        el('div.toolbar',SA.ui.button('Punti e curve CSV',{icon:'download',cls:'btn-ghost',onclick:function(){var rows=[['tipo','indice','x','y','r','K','L_meno_r']];S.pts.forEach(function(p,i){rows.push(['evento',i+1,p.x,p.y,'','','']);});S.obs.r.forEach(function(r,i){rows.push(['curva','','','',r,S.obs.K[i],S.obs.L[i]]);});SA.ui.download('statatlas_lab28_processi.csv',SA.ui.csv(rows),'text/csv');}}),
          SA.ui.button('Grafici PNG',{icon:'download',cls:'btn-ghost',onclick:function(){SA.ui.exportPNG([mapBox,curveBox,quadratBox,mcBox].map(function(b){return b.querySelector('svg');}),'statatlas_lab28_processi.png',['Processi puntuali','seed '+S.seed+' · '+S.pts.length+' eventi']);}})))));
      var th=SA.ui.step('4','Teoria e simulazione a confronto');tableBody=el('tbody');kpis=el('div.kpis');th.body.append(el('div.tbl-wrap',el('table.tv',el('thead',el('tr',el('th','Quantità'),el('th','Riferimento'),el('th','Risultato'),el('th','Natura'))),tableBody)),kpis);
      var it=SA.ui.step('5','Interpretazione');interp=el('div.prose');it.body.append(interp,el('p',SA.ui.button('Teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:function(){theory('adv');}})));
      var rep=SA.ui.step('6','Riproduci in R','Stessi eventi, stessa stima K corretta per il bordo');code=SA.ui.codeBlock(codeR,'statatlas_lab28_processi.R');rep.body.append(el('p.prose','R0: coordinate esplicite identiche. R1: stessa formula K, curva L e statistica T. R3: le repliche Monte Carlo R e i processi generati da spatstat non utilizzano la stessa sequenza casuale.'),code);
      page.append(q,pred,ex,th,it,rep);buildControls();buildPrediction();render();code.refresh();runner.refresh();document.addEventListener('keydown',runner.key);
    },
    unmount:function(){if(runner){runner.stop();document.removeEventListener('keydown',runner.key);}},
    redraw:function(){if(S)render();}
  });
})();
