/* StatAtlas | Lab 27 — LISA, hotspot e MAUP.
 * Inferenza locale via permutazioni condizionali dei n-1 valori, cella i fissata;
 * p bilaterali centrati sulla speranza condizionale, con correzione BH/BY.
 */
(function () {
  'use strict';
  var el, S, run, controls, valueMap, lisaMap, distBox, maupBox, distStatus, mapHelp, lisaLegend, tableBody, kpis, interp, code, prediction, predFeedback;
  var TYPES = { hotspot:'Hotspot e coldspot', outlier:'Valore anomalo locale', iid:'Rumore indipendente', checker:'Scacchiera', trend:'Gradiente spaziale', sar:'Processo SAR' };
  function fmt(v, d) { return Number.isFinite(v) ? SA.fmt(v, d == null ? 3 : d) : '—'; }
  function makeBase(pattern, seed) { return SA.spatialLocal.generatePattern(pattern, seed); }
  function init(previous) {
    var s = { pattern:'hotspot', kind:'rook', style:'row', scale:'none', zoning:'regular', radius:1.5, B:199, alpha:0.05, correction:'BH', seed:2026, focus:27, prediction:null };
    if (previous) Object.keys(s).forEach(function (k) { if (previous[k] !== undefined) s[k] = previous[k]; });
    s.base = makeBase(s.pattern, s.seed); return s;
  }
  function configure() {
    S.agg = SA.spatialLocal.aggregate(S.base, S.scale, S.zoning);
    S.W = SA.spatial.weights(S.agg.rows, S.agg.cols, S.kind, S.style, S.radius);
    S.local = SA.spatialLocal.local(S.agg.x, S.W);
    S.global = SA.spatialAreal.moran(S.agg.x, S.W);
    S.originalW = SA.spatial.weights(8, 8, S.kind, S.style, S.radius);
    S.originalGlobal = SA.spatialAreal.moran(S.base, S.originalW);
    S.focus = Math.max(0, Math.min(S.agg.x.length-1, S.focus));
    S.samples = []; S.rng = new SA.RRNG(S.seed + 2907);
  }
  function step() {
    if (S.samples.length >= S.B || !S.local.valid) return false;
    S.samples.push(SA.spatialLocal.conditionalOne(S.local.z, S.W, S.local.m2, S.rng));
    return true;
  }
  function completed() { return Math.min(S.samples.length, S.B); }
  function samples() { return S.samples.length > S.B ? S.samples.slice(0, S.B) : S.samples; }
  function inference() {
    var p = S.local.valid ? SA.spatialLocal.pValues(S.local.I, S.local.expected, samples(), S.W) : [];
    return { raw:p, adjusted:SA.spatialLocal.adjust(p, S.correction) };
  }
  function palette() { var t=SA.theme(); return { HH:t.c1, LL:t.c2, HL:t.c3, LH:t.c4 || t.accent, NA:t.rule_2 }; }
  function drawZones(box, mode) {
    var P=SA.plot,t=SA.theme(), colors=palette(), a=S.agg, n=a.x.length, vals=a.x, mean=vals.reduce(function(z,v){return z+v;},0)/n;
    var span=Math.max(0.0001,...vals.map(function(v){return Math.abs(v-mean);}));
    box.innerHTML=''; var root=P.svg('svg',{ viewBox:'0 0 550 380',role:'group','aria-label':mode==='values'?'Valori dei territori, selezionabili':'Quadranti LISA e aree significative' },box);
    var inf=inference(), left=100,top=12,side=40, focused=S.focus, neigh=S.W[focused].map(function(e){return e.j;});
    a.zones.forEach(function(z,i){
      var v=(vals[i]-mean)/span, q=S.local.valid?S.local.quadrant[i]:'NA';
      var sig= completed()>=49 && Number.isFinite(inf.adjusted[i]) && inf.adjusted[i]<=S.alpha;
      var fill=mode==='values'?(v>=0?t.c1:t.c2):colors[q];
      var op=mode==='values' ? 0.2+0.78*Math.abs(v) : (q==='NA'?0.16:sig?0.84:0.20);
      var rect=P.svg('rect',{x:left+z.col0*side,y:top+z.row0*side,width:z.w*side-2,height:z.h*side-2,rx:3,
        fill:fill,'fill-opacity':op,stroke:i===focused?t.accent:neigh.indexOf(i)>=0?t.ink_2:t.card,
        'stroke-width':i===focused?3:neigh.indexOf(i)>=0?1.8:1.1,tabindex:0,role:'button',
        'aria-label':'Zona '+(i+1)+', valore '+fmt(vals[i],2)+', quadrante '+q+'. Seleziona la zona' },root);
      (function(index,nd){function choose(){S.focus=index;render();}nd.addEventListener('click',choose);nd.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});})(i,rect);
      if(mode==='lisa' && z.w*side>=62 && z.h*side>=55) P.text(root,left+(z.col0+z.w/2)*side-2,top+(z.row0+z.h/2)*side+4,q==='NA'?'':q,{fill:t.ink,'font-size':12,'font-weight':700,'text-anchor':'middle'});
    });
    P.text(root,12,354,mode==='values'?'Blu: valori sopra la media · arancio: sotto la media':'Bordo marcato: zona selezionata · colore saturo: test significativo', {fill:t.ink_2,'font-size':12});
    P.text(root,12,372,'Numero di zone: '+n+' · scala '+(S.scale==='none'?'8×8':S.scale==='2'?'4×4':'2×2'),{fill:t.ink_3,'font-size':12});
  }
  function drawDistribution() {
    var P=SA.plot, i=S.focus, arr=samples().map(function(s){return s[i];}).filter(Number.isFinite), obs=S.local.I[i], ex=S.local.expected[i],t=SA.theme();
    if(!S.local.valid || !S.W[i].length){distBox.innerHTML='<p>Per questa zona la statistica non è definita.</p>';return;}
    var lo=Math.min(obs,ex,...arr),hi=Math.max(obs,ex,...arr);var dd=Math.max(0.1,(hi-lo)*.12);lo-=dd;hi+=dd;
    var N=18,counts=Array(N).fill(0),width=(hi-lo)/N;
    arr.forEach(function(v){counts[Math.max(0,Math.min(N-1,Math.floor((v-lo)/width)))]++;});
    var max=Math.max(1,...counts)*1.15;
    var F=P.frame(distBox,{W:700,H:270,x:[lo,hi],y:[0,max],xlabel:'Moran I locale della zona selezionata',ylabel:'Frequenza',label:'Distribuzione condizionale per permutazione'});
    counts.forEach(function(v,b){if(v)P.svg('rect',{x:F.x(lo+b*width)+1,y:F.y(v),width:Math.max(1,F.x(lo+(b+1)*width)-F.x(lo+b*width)-2),height:F.y(0)-F.y(v),fill:t.c1,'fill-opacity':.65},F.g);});
    P.svg('line',{x1:F.x(obs),x2:F.x(obs),y1:F.m.t,y2:F.y(0),stroke:t.c2,'stroke-width':2.7},F.g);
    P.svg('line',{x1:F.x(ex),x2:F.x(ex),y1:F.m.t,y2:F.y(0),stroke:t.ink_3,'stroke-dasharray':'6 4','stroke-width':1.8},F.g);
    P.text(F.g,F.m.l+6,F.m.t+15,'Arancio: osservato · tratteggio: speranza condizionale',{fill:t.ink_2,'font-size':12});
  }
  function drawMaup() {
    var P=SA.plot,t=SA.theme(),g0=S.originalGlobal.I,g1=S.global.I;
    if(!Number.isFinite(g1)){maupBox.innerHTML='<p>Il valore aggregato è costante: Moran globale non definito. Prova altre zonizzazioni.</p>';return;}
    var lo=Math.min(-0.1,g0,g1)-0.08,hi=Math.max(0.1,g0,g1)+0.08;
    var F=P.frame(maupBox,{W:700,H:210,x:[0,3],y:[lo,hi],xlabel:'1 = celle originarie · 2 = aggregazione corrente',ylabel:'Moran I globale',label:'Effetto di scala e zonizzazione sull’indice globale'});
    P.svg('line',{x1:F.x(.5),x2:F.x(2.5),y1:F.y(0),y2:F.y(0),stroke:t.ink_3,'stroke-dasharray':'3 4'},F.g);
    [{v:g0,x:1,col:t.c1,label:'64 celle'},{v:g1,x:2,col:t.c2,label:S.agg.x.length+' zone'}].forEach(function(d){
      P.svg('line',{x1:F.x(d.x),x2:F.x(d.x),y1:F.y(0),y2:F.y(d.v),stroke:d.col,'stroke-width':18,'stroke-opacity':.45},F.g);
      P.text(F.g,F.x(d.x),F.y(d.v)+(d.v>=0?-10:18),d.label+' · '+fmt(d.v,3),{fill:t.ink,'text-anchor':'middle','font-size':12});
    });
  }
  function updateTable() {
    tableBody.innerHTML='';var inf=inference(),local=S.local;
    var p=inf.raw[S.focus],pa=inf.adjusted[S.focus],sig=inf.adjusted.filter(function(v){return Number.isFinite(v)&&v<=S.alpha;}).length;
    var q=local.quadrant[S.focus]||'NA';
    [
      ['Numero di unità territoriali', '64 celle', String(S.agg.x.length), 'esatto'],
      ['Moran I globale · originario / aggregato',fmt(S.originalGlobal.I,4),fmt(S.global.I,4),'esatto'],
      ['Zona selezionata',String(S.focus+1),q==='NA'?'non classificabile':q,'descrittivo'],
      ['I locale osservato · E[Iᵢ|xᵢ]',fmt(local.I[S.focus],4),fmt(local.expected[S.focus],4),'esatto'],
      ['p-value locale bilaterale (condizionale)', 'permutazioni B = '+S.B,fmt(p,4),'Monte Carlo'],
      ['p-value corretto · '+S.correction, 'soglia α = '+fmt(S.alpha,2),fmt(pa,4),'Monte Carlo'],
      ['Aree significative · '+S.correction,'tra '+S.agg.x.length+' aree',completed()>=49?String(sig):'attendere ≥ 49 permutazioni','Monte Carlo'],
      ['Permutazioni completate',String(S.B),String(completed()),'Monte Carlo']
    ].forEach(function(r){tableBody.appendChild(el('tr',el('td',r[0]),el('td',r[1]),el('td',r[2]),el('td',r[3])));});
    kpis.innerHTML='';kpis.append(el('div.kpi',el('b',fmt(local.I[S.focus],3)),el('span','Moran I locale · zona '+(S.focus+1))),
      el('div.kpi',el('b',Number.isFinite(pa)?fmt(pa,3):'—'),el('span','p-value '+S.correction)),
      el('div.kpi',el('b',completed()+' / '+S.B),el('span','permutazioni condizionali')));
    interp.innerHTML='';
    interp.append(el('p','La zona '+(S.focus+1)+' appartiene al quadrante '+q+'. Il quadrante descrive il segno del valore centrato e del lag spaziale; non è un test. '+
      (completed()<S.B?'La significatività corrente è provvisoria: completa le permutazioni prima di concludere. ':'Il p-value è valutato rispetto alla distribuzione condizionale, mantenendo fisso il valore della zona selezionata.')),
      el('p','Per ogni zona è utilizzato un test bilaterale basato su |Iᵢ − E[Iᵢ|xᵢ]|. La mappa evidenzia soltanto le zone con p-value corretto ≤ α. I risultati dipendono dalla matrice W, dalla scelta della null e dal numero di permutazioni.'),
      el('p','Nel vicinato per distanza, dopo aggregazione il raggio è misurato sulla griglia delle zone, non sulla distanza fisica dei centroidi. L’aggregazione nel MAUP sostituisce ogni gruppo di celle con la sua media e ricostruisce i vicinati. Perciò non si stanno semplicemente ricalcolando le statistiche sulle stesse osservazioni; cambia anche l’unità di analisi.'));
    if(S.correction==='BH')interp.append(el('p','BH controlla il false discovery rate sotto condizioni di dipendenza appropriate; la sola presenza di autocorrelazione non ne garantisce la validità universale. BY è più prudente in presenza di dipendenza arbitraria.'));
    mapHelp.textContent='Zona '+(S.focus+1)+' · '+S.agg.zones[S.focus].ids.length+' celle originali · valore '+fmt(S.agg.x[S.focus],2)+' · '+S.W[S.focus].length+' vicini. Clicca un’altra zona nella mappa per aggiornarne istogramma e risultati.';
    distStatus.textContent=completed()+' / '+S.B+' permutazioni condizionali'+(completed()<S.B?' · risultati provvisori':' · simulazione completata');
  }
  function render() {
    drawZones(valueMap,'values'); drawZones(lisaMap,'lisa');
    lisaLegend.innerHTML = '';
    var colors=palette(),sw=SA.plot.legendSwatch;
    [['HH','High–High'],['LL','Low–Low'],['HL','High–Low'],['LH','Low–High']].forEach(function(q){
      lisaLegend.appendChild(el('span',sw(colors[q[0]],null,'circle'),q[0]+' · '+q[1]));
    });
    drawDistribution(); drawMaup(); updateTable();
  }
  // Ricostruisci il modello solo quando i dati o W cambiano. In questo
  // caso la distribuzione nulla precedente non e' piu' applicabile.
  function rerun(regen) {
    run.stop(); if(regen)S.base=makeBase(S.pattern,S.seed);
    configure();render();code.refresh();run.refresh();
  }
  // Alpha, BH/BY e B non cambiano il campione: conserva tutte le repliche
  // gia' calcolate (anche oltre B, in cache per eventuale aumento futuro).
  function refreshInference() { run.stop();render();code.refresh();run.refresh(); }
  function buildControls() {
    controls.innerHTML='';
    function select(label,key,options,regen){return el('label.field',el('span',label),el('select',{onchange:function(){S[key]=this.value;if(key==='correction'||key==='alpha'||key==='B')refreshInference();else rerun(!!regen);}},options.map(function(o){return el('option',{value:o[0],selected:String(o[0])===String(S[key])},o[1]);})));}
    controls.append(
      select('Meccanismo generatore','pattern',Object.keys(TYPES).map(function(k){return[k,TYPES[k]];}),true),
      select('Unità di analisi','scale',[['none','64 celle (8 × 8)'],['2','16 zone (4 × 4)'],['4','4 macrozone (2 × 2)']],false),
      select('Zonizzazione (16 zone)','zoning',[['regular','Confini regolari'],['shifted','Confini spostati']],false),
      select('Vicinato','kind',[['rook','Rook: lato comune'],['queen','Queen: lato o vertice'],['distance','Distanza ≤ r']],false),
      select('Pesi','style',[['row','Standardizzati per riga'],['binary','Binari']],false),
      SA.ui.slider('Raggio (solo distanza)',{min:1,max:2.5,step:.5,value:S.radius,format:function(v){return fmt(v,1);},onchange:function(v){S.radius=v;rerun(false);}}),
      select('Correzione multipla','correction',[['none','Nessuna'],['BH','Benjamini–Hochberg'],['BY','Benjamini–Yekutieli']],false),
      select('Soglia α','alpha',[[0.05,'0,05'],[0.10,'0,10']],false),
      select('Permutazioni B','B',[[199,'199'],[499,'499']],false),
      el('label.field',el('span','Seed'),el('input',{type:'number',min:1,value:S.seed,onchange:function(){S.seed=Math.max(1,Math.floor(+this.value||1));rerun(true);}})),
      SA.ui.button('Modifica la zona selezionata',{cls:'btn-ghost',onclick:function(){var m=S.agg.members[S.focus],change=S.agg.x[S.focus]>0?-1.8:1.8;m.forEach(function(i){S.base[i]+=change;});rerun(false);}}),
      SA.ui.button('Ripristina i dati',{cls:'btn-ghost',onclick:function(){rerun(true);}}));
    run.controls('Una permutazione per ciascuna zona').forEach(function(b){controls.appendChild(b);});
  }
  function buildPrediction() {
    prediction.innerHTML='';var name='lisa-pred';
    prediction.append(el('p.prose','Se un territorio ha un valore alto ma i suoi vicini sono prevalentemente bassi, come verrà classificato?'),
      el('div.choices',{role:'radiogroup','aria-label':'Previsione sulla classificazione LISA'},
        [['HH','High–High (hotspot)'],['HL','High–Low (outlier spaziale)'],['LL','Low–Low (coldspot)']].map(function(o,i){return el('div.choice',el('input',{type:'radio',id:name+'-'+i,name:name,value:o[0],onchange:function(){S.prediction=this.value;predFeedback.hidden=false;predFeedback.textContent=S.prediction==='HL'?'✓ Corretto. Il valore centrato è positivo, il lag spaziale negativo: quadrante High–Low. La significatività richiede un test separato.':'Non proprio: il valore alto ha vicini bassi, quindi il prodotto tra valore centrato e lag è negativo (HL).';}}),el('label',{for:name+'-'+i},o[1]));})));
    predFeedback=el('div.feedback',{role:'status',hidden:true});prediction.appendChild(predFeedback);
  }
  function rCode() {
    var a=S.agg,x=a.x,I=S.local.I;
    if (!S.local.valid) return '# LAB 27: varianza aggregata nulla; Moran locale non definito.\n# Modifica scala, zonizzazione o generatore.\n';
    var xs=x.map(function(v){return Number(v).toPrecision(17);}).join(', ');
    var ref=I.map(function(v){return Number(v).toPrecision(17);}).join(', ');
    return [
      '# StatAtlas · Lab 27 · LISA e MAUP · riproduzione dei valori correnti',
      '# R0: stessi dati espliciti; R1: identica formula locale; le permutazioni hanno una sequenza RNG differente.',
      'x <- c('+xs+')', 'js_local <- c('+ref+')',
      'nr <- '+a.rows+'; nc <- '+a.cols,
      'kind <- "'+S.kind+'"; style <- "'+S.style+'"; radius <- '+S.radius,
      'W <- matrix(0, length(x), length(x))',
      'for (i in seq_along(x)) {',
      '  ri <- (i-1) %/% nc; ci <- (i-1) %% nc',
      '  for (j in seq_along(x)) {',
      '    if (i == j) next',
      '    rj <- (j-1) %/% nc; cj <- (j-1) %% nc',
      '    d <- sqrt((ri-rj)^2 + (ci-cj)^2)',
      '    yes <- if (kind == "rook") abs(ri-rj)+abs(ci-cj)==1 else',
      '      if (kind == "queen") max(abs(ri-rj),abs(ci-cj))==1 else d<=radius+1e-12',
      '    if (yes) W[i,j] <- 1',
      '  }',
      '  if (style == "row" && sum(W[i,])>0) W[i,] <- W[i,]/sum(W[i,])',
      '}',
      'n <- length(x); z <- x-mean(x); m2 <- mean(z^2); lag <- as.vector(W %*% z)',
      'Ii <- z*lag/m2',
      'Ei <- -z^2*rowSums(W)/((n-1)*m2)',
      'stopifnot(max(abs(Ii-js_local)) < 1e-8)',
      'cat("OK: statistiche LISA corrispondenti al motore JS\\n")',
      '# Randomizzazione condizionale: x_i resta fermo; tutti gli altri valori permutati.',
      'set.seed('+S.seed+'); B <- '+S.B+'; sims <- matrix(NA_real_, B, n)',
      'for (i in seq_len(n)) {',
      '  if (!sum(W[i,])) next',
      '  other <- setdiff(seq_len(n),i)',
      '  for (b in seq_len(B)) {',
      '    zp <- z; zp[other] <- sample(z[other], length(other), replace=FALSE)',
      '    sims[b,i] <- z[i]*sum(W[i,]*zp)/m2',
      '  }',
      '}',
      'p <- vapply(seq_len(n),function(i) {',
      '  if (all(is.na(sims[,i]))) return(NA_real_)',
      '  (1+sum(abs(sims[,i]-Ei[i])>=abs(Ii[i]-Ei[i])-1e-12))/(B+1)',
      '},numeric(1))',
      'padj <- p.adjust(p, method="'+(S.correction==='none'?'none':S.correction)+'")',
      'result <- data.frame(zone=seq_len(n), quadrante=ifelse(z>0,ifelse(lag>0,"HH","HL"),ifelse(lag<0,"LL","LH")), Ii, Ei, p, padj)',
      'print(result); cat("Aree segnalate (alpha='+S.alpha+'):",sum(padj <= '+S.alpha+',na.rm=TRUE),"\\n")',
      '# Per confrontare localmoran_perm di spdep: specificare rigorosamente',
      '# variance scaling, schema condizionale e definizione del test; non si impone l’identità dei p-value.'
    ].join('\n');
  }
  var THEORY = {
    base:function(){return el('div.prose',{html:'<h3>Dal globale al locale</h3><p>Moran globale fornisce una sintesi dell’intero dominio. Il Moran locale Iᵢ identifica quanto il territorio i contribuisce all’associazione spaziale secondo una matrice W definita. Questa statistica non è una misura della sola altezza del valore osservato.</p><h3>Quattro quadranti descrittivi</h3><p>Con zᵢ = xᵢ − media e lag spaziale (Wz)ᵢ, otteniamo HH (alto con vicini alti), LL (basso con vicini bassi), HL e LH (discordanza). Essere HH non rende una zona automaticamente un hotspot statisticamente significativo.</p><div class="eq" data-tex="I_i=\\frac{z_i}{m_2}\\sum_jw_{ij}z_j,\\quad m_2=\\frac{1}{n}\\sum_i z_i^2"></div><h3>Permutazioni condizionali</h3><p>Fissiamo il valore del territorio i e permutiamo quelli delle altre n−1 unità. Il confronto è bilaterale attorno alla speranza condizionale E[Iᵢ|zᵢ] e usa la correzione Monte Carlo +1. Applicando molti test locali occorre considerare i confronti multipli: sono disponibili risultati grezzi, BH e BY.</p><h3>MAUP</h3><p>Il Modifiable Areal Unit Problem si manifesta quando cambiamo scala o confini delle unità geografiche. Nel laboratorio le celle di un gruppo sono sostituite dalla loro media: variano n, W, variabilità e statistiche. Non è un’operazione neutrale.</p><div class="callout warn"><strong>Avvertenza:</strong> un quadrante non è un’ipotesi testata. I p-value dipendono dalla null di randomizzazione; BH controlla il FDR sotto assunzioni di dipendenza, non sempre soddisfatte da dati spaziali.</div>'});},
    adv:function(){return el('div.prose',{html:'<h3>Normalizzazione e relazione con Moran globale</h3><p>Posto m₂ = Σzᵢ²/n, Iᵢ = zᵢ Σⱼwᵢⱼzⱼ/m₂. La somma delle statistiche locali è ΣIᵢ = (S₀)I globale per la stessa W. La relazione vale per la versione del Moran globale definita nel laboratorio 26 e per m₂ calcolato con divisore n.</p><h3>Speranza delle permutazioni condizionali</h3><p>Fissando zᵢ, la media dei restanti valori centrati è −zᵢ/(n−1); quindi E[Iᵢ|zᵢ] = −zᵢ² Σⱼwᵢⱼ/[(n−1)m₂]. Il test qui usato considera |Iᵢ−E[Iᵢ|zᵢ]| e confronta le distanze con quelle delle permutazioni condizionali. È un test bilaterale intorno alla speranza e non un’unica definizione universale di p-value LISA.</p><h3>Molteplicità</h3><p>Il metodo BH ordina i p-value e applica q₍ₖ₎ = min₍ⱼ≥ₖ₎ mp₍ⱼ₎/j (troncato a 1); BY sostituisce m con mHₘ, dove Hₘ = Σⱼ1/j. BY protegge il FDR per dipendenze arbitrarie sotto le ordinarie condizioni di validità dei p-value individuali, risultando più conservativo.</p><h3>Null, dipendenza e interpretazione causale</h3><p>La randomizzazione condizionale non rende automaticamente validi i test quando i valori non sono scambiabili, la media è non stazionaria, i siti sono selezionati in modo informativo o l’eteroschedasticità dipende dalla posizione. Hotspot significativi non indicano un meccanismo causale, né identificano di per sé un rischio sanitario elevato.</p><h3>MAUP: effetto scala e effetto zonizzazione</h3><p>L’aggregazione modifica simultaneamente la numerosità delle aree, la definizione di media, la rete di adiacenza, la varianza e la struttura osservata. Confrontare Moran prima e dopo non è un test formale del MAUP. Il caso con confini spostati illustra il zoning effect, distinto dal cambiamento di risoluzione.</p><h3>Limiti numerici</h3><p>Per campioni ridotti la distribuzione locale può essere discreta; il minimo p Monte Carlo è 1/(B+1) e la correzione per 64 test può rendere poco probabile ottenere risultati BH significativi con B=199. Pesi isolati, valori centrati nulli e diverse convenzioni per m₂ vanno trattati esplicitamente.</p>'});}
  };
  SA.registerLab('lisa', {
    challengeEvidence: function () {
      return { label: 'Moran I locale permutato nella zona selezionata', value: S && S.samples.length ? S.samples[S.samples.length-1][S.focus] : NaN };
    },
    mount:function(page,info){
      el=SA.ui.el; S=init(S);configure();
      run=SA.ui.runner({speed:2,coop:true,step:step,render:render,done:function(){return S.samples.length>=S.B||!S.local.valid;},progress:function(){return completed()/S.B;},reset:function(){configure();}});
      function openTheory(level){SA.ui.openDrawer('Autocorrelazione locale, hotspot e MAUP',THEORY,level);}
      page.append(el('header.lab-head',el('div',el('div.kicker',info.part.part+' · '+info.part.title+' · Laboratorio '+info.lab.num),el('h1',info.lab.title),el('p.lede','Dal colore delle mappe alla significatività locale: quadranti, permutazioni, test multipli e aggregazione dei territori.')),SA.ui.button('Approfondisci',{icon:'book',onclick:function(){openTheory();}})));
      var s1=SA.ui.step('1','Domanda');s1.body.append(el('p.question','Un territorio con un valore elevato è sempre un hotspot? Che cosa succede alla diagnosi quando cambiano i confini territoriali?'));
      var s2=SA.ui.step('2','La tua previsione');prediction=el('div');s2.body.append(prediction);
      var s3=SA.ui.step('3','Esperimento','Seleziona una zona, osserva i quadranti e testa la struttura locale');
      controls=el('div.panel.controls');valueMap=el('div');lisaMap=el('div');distBox=el('div');maupBox=el('div');mapHelp=el('p.moran-map-info');distStatus=el('span.moran-perm-status');lisaLegend=el('div.legend');
      s3.body.append(el('div.moran-guide',{role:'note'},el('strong','Come usare il laboratorio'),el('ol',
        el('li','Parti dalle 64 celle: confronta la mappa dei valori con i quadranti LISA.'),
        el('li','Clicca una zona: l’istogramma e la tabella si riferiscono a quella zona.'),
        el('li','Le permutazioni non partono automaticamente: premi Avvia, Passo o Completa. Dopo modifiche a dati, pesi o zonizzazione riavvia manualmente; BH/BY, α e B conservano le repliche già calcolate.'),
        el('li','Prova BH/BY, quindi aggrega in 16 zone e sposta i confini per vedere il MAUP.'))));
      s3.body.append(el('div.lab-grid',controls,el('div.figure',
        el('div.fig',el('div.fig-title',el('h3','Territori e valori osservati')),valueMap,mapHelp),
        el('div.fig',el('div.fig-title',el('h3','Quadranti LISA e significatività')),lisaMap,lisaLegend,
          el('p.moran-map-info','HH: alto–alto · LL: basso–basso · HL: alto–basso · LH: basso–alto. Colore intenso = p corretto ≤ α (solo dopo almeno 49 permutazioni).')),
        el('div.fig',el('div.fig-title',el('h3','Test locale della zona selezionata'),distStatus),distBox),
        el('div.fig',el('div.fig-title',el('h3','MAUP: Moran globale prima e dopo aggregazione')),maupBox),
        el('div.toolbar',SA.ui.button('Dati e statistiche CSV',{icon:'download',cls:'btn-ghost',onclick:function(){var f=inference(),rows=[['zona','valore','quadrante','I_locale','E_condizionale','p','p_corretto']];S.agg.x.forEach(function(v,i){rows.push([i+1,v,S.local.quadrant[i],S.local.I[i],S.local.expected[i],f.raw[i],f.adjusted[i]]);});SA.ui.download('statatlas_lab27_lisa.csv',SA.ui.csv(rows),'text/csv');}}),
          SA.ui.button('Grafici PNG',{icon:'download',cls:'btn-ghost',onclick:function(){SA.ui.exportPNG([valueMap,lisaMap,distBox,maupBox].map(function(b){return b.querySelector('svg');}),'statatlas_lab27_lisa.png',['LISA e MAUP','seed '+S.seed+' · '+S.agg.x.length+' zone']);}})))));
      var s4=SA.ui.step('4','Teoria e simulazione a confronto');tableBody=el('tbody');kpis=el('div.kpis');
      s4.body.append(el('div.tbl-wrap',el('table.tv',el('thead',el('tr',el('th','Quantità'),el('th','Riferimento'),el('th','Risultato'),el('th','Natura'))),tableBody)),kpis);
      var s5=SA.ui.step('5','Interpretazione');interp=el('div.prose');s5.body.append(interp,el('p',SA.ui.button('Teoria avanzata e limiti',{icon:'book',cls:'btn-ghost',onclick:function(){openTheory('adv');}})));
      var s6=SA.ui.step('6','Riproduci in R','Stessi dati, stessa W e stessa statistica locale');code=SA.ui.codeBlock(rCode,'statatlas_lab27_lisa.R');
      s6.body.append(el('p.prose','R0: stessi valori e aggregazioni già applicate. R1: Moran locale e speranza condizionale identici. Le simulazioni R usano permutazioni diverse; i p-value possono oscillare intorno agli stessi valori teorici.'),code);
      page.append(s1,s2,s3,s4,s5,s6);
      buildControls();buildPrediction();render();code.refresh();run.refresh();document.addEventListener('keydown',run.key);
    },
    unmount:function(){if(run){run.stop();document.removeEventListener('keydown',run.key);}},
    redraw:function(){if(S)render();}
  });
})();
