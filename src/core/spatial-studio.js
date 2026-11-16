/* StatAtlas · Parte VIII · Mappe esplorative continue.
 * Strato didattico autonomo: non sostituisce e non altera i motori 26–31.
 * Distanze euclidee su coordinate normalizzate; risultati descrittivi salvo
 * stime kriging condizionate a una covarianza esplicitamente specificata.
 */
var SA = window.SA || (window.SA = {});
SA.spatialStudio = (function () {
  'use strict';
  var conf = {
    moran: { title: 'Disegna l’autocorrelazione', question: 'Se aggiungi valori simili vicini fra loro, come cambia Moran I?', subtitle: 'La superficie è una visualizzazione continua dei valori campionati; Moran I è calcolato sui punti e sul loro vicinato kNN.' },
    lisa: { title: 'Costruisci un hotspot', question: 'Dove si formano cluster alti–alti, bassi–bassi o outlier spaziali?', subtitle: 'I colori della superficie rappresentano valori interpolati; HH/LL/HL/LH sono classificazioni descrittive ai punti, non test di significatività.' },
    points: { title: 'Dove si concentrano gli eventi?', question: 'Aggiungi eventi: come cambiano la densità stimata e la struttura dei punti?', subtitle: 'La superficie è una stima kernel (KDE) dell’intensità; non è il processo generatore né un test di CSR.' },
    variogram: { title: 'Da pochi sensori a una superficie', question: 'Spostando un sensore o aggiungendone uno, quali differenze entrano nel variogramma?', subtitle: 'La superficie è una interpolazione IDW puramente illustrativa; il variogramma empirico si calcola dalle coppie di misure.' },
    kriging: { title: 'Disegna la rete di monitoraggio', question: 'Dove aggiungeresti un sensore per ridurre l’incertezza predittiva?', subtitle: 'Le superfici di previsione e varianza sono calcolate con il motore di kriging sul medesimo campo simulato. Con IDW non esiste una varianza di kriging.' },
    regression: { title: 'Regressione su una mappa continua', question: 'Cosa accade alla relazione X–Y se aggiungi longitudine e latitudine come covariate?', subtitle: 'Confronto descrittivo OLS: Y ~ X contro Y ~ X + lon + lat. Le coordinate modellano un trend, non sostituiscono SAR o SEM.' }
  };
  function finite(x) { return typeof x === 'number' && Number.isFinite(x); }
  function fmt(x, digits) { return finite(x) ? x.toFixed(digits == null ? 3 : digits).replace('.', ',') : 'n.d.'; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / (a.length || 1); }
  function clone(p) { return {x:p.x, y:p.y, value:p.value, cov:p.cov, id:p.id}; }
  function randomPoints(n, kind, seed) {
    var rng = new SA.RRNG(seed || 2026), out = [];
    for (var i = 0; i < n; i++) {
      var x, y;
      if (kind === 'cluster') { x = clamp(0.28 + 0.095*rng.norm(), .025, .975); y = clamp(.68 + .095*rng.norm(), .025, .975); }
      else if (kind === 'regular') { var side = Math.ceil(Math.sqrt(n)); x = (i%side+.5)/side; y = (Math.floor(i/side)+.5)/side; }
      else { x = .04 + .92*rng.unif(); y = .04 + .92*rng.unif(); }
      out.push({x:x, y:y, value:0, cov:0});
    }
    return out;
  }
  function knn(points,k) {
    var n = points.length, out=[];
    if (n<3) return points.map(function () { return []; });
    for (var i=0;i<n;i++) {
      var near=[];
      for(var j=0;j<n;j++) if(i!==j) near.push({j:j, d:Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)});
      near.sort(function(a,b){return a.d-b.d||a.j-b.j;});
      var count=Math.min(Math.max(1,k),n-1);
      out.push(near.slice(0,count).map(function(e){return {j:e.j,w:1/count};}));
    }
    return out;
  }
  function describe(points,k) {
    if(points.length<3) return {W:[], I:NaN, local:null, valid:false};
    var W=knn(points,k), values=points.map(function(p){return p.value;});
    var m=SA.spatialAreal.moran(values,W),local=SA.spatialLocal.local(values,W);
    return {W:W,I:m.I,valid:m.valid,local:local,expected:m.expected};
  }
  function smooth(points,x,y,kind,band) {
    if(!points.length) return NaN;
    var num=0,den=0;
    for(var i=0;i<points.length;i++) {
      var p=points[i],d2=(p.x-x)**2+(p.y-y)**2;
      if(kind==='kde') { num+=Math.exp(-d2/(2*band*band))/(2*Math.PI*band*band); continue; }
      if(d2<1e-12) return p.value;
      var w=kind==='idw' ? 1/Math.pow(d2,band/2) : Math.exp(-d2/(2*band*band));
      num+=w*p.value; den+=w;
    }
    return kind==='kde'?num:(den?num/den:NaN);
  }
  function solve(A,b) {
    var n=b.length, m=A.map(function(row,i){return row.slice().concat(b[i]);});
    for(var i=0;i<n;i++) {
      var p=i;
      for(var r=i+1;r<n;r++)if(Math.abs(m[r][i])>Math.abs(m[p][i]))p=r;
      if(Math.abs(m[p][i])<1e-10)return null;
      var tmp=m[i];m[i]=m[p];m[p]=tmp;
      var piv=m[i][i];for(var j=i;j<=n;j++)m[i][j]/=piv;
      for(var a=0;a<n;a++)if(a!==i){var c=m[a][i];for(var h=i;h<=n;h++)m[a][h]-=c*m[i][h];}
    }
    return m.map(function(row){return row[n];});
  }
  function ols(points,coords,k) {
    var p=coords?4:2,n=points.length;
    if(n<p+1)return null;
    var X=points.map(function(pt){return coords?[1,pt.cov,pt.x-.5,pt.y-.5]:[1,pt.cov];});
    var A=Array.from({length:p},function(){return new Array(p).fill(0);}),b=new Array(p).fill(0);
    for(var i=0;i<n;i++)for(var j=0;j<p;j++){
      b[j]+=X[i][j]*points[i].value;
      for(var l=0;l<p;l++)A[j][l]+=X[i][j]*X[i][l];
    }
    var beta=solve(A,b);if(!beta)return null;
    var residual=points.map(function(pt,i){return pt.value-X[i].reduce(function(s,z,j){return s+z*beta[j];},0);});
    var ym=mean(points.map(function(pt){return pt.value;})),tss=points.reduce(function(s,pt){return s+(pt.value-ym)**2;},0);
    var rss=residual.reduce(function(s,v){return s+v*v;},0);
    var W=knn(points,Math.min(k||4,n-1));var m=SA.spatialAreal.moran(residual,W);
    return {beta:beta,residual:residual,r2:tss>1e-10?1-rss/tss:NaN,moran:m.I,rss:rss};
  }
  function xySVG(event,svg,x0,y0,side) {
    var ctm=svg.getScreenCTM(); if(!ctm)return null;
    var p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
    var q=p.matrixTransform(ctm.inverse());
    return {x:clamp((q.x-x0)/side,0,1),y:clamp(1-(q.y-y0)/side,0,1)};
  }
  function sampleInit(type, source) {
    if(source && typeof source==='function') {
      try { var data=source();if(data && data.points && data.points.length) return {points:data.points.map(clone), other:data}; } catch(e) { /* fallback */ }
    }
    var points=randomPoints(type==='points'?50:28,'uniform',2026);
    points.forEach(function(p,i){p.value=1.6*Math.exp(-((p.x-.3)**2+(p.y-.7)**2)/.025)-1.3*Math.exp(-((p.x-.73)**2+(p.y-.3)**2)/.03)+.17*Math.sin(i*1.7);p.cov=Math.sin(p.x*6)+Math.cos(p.y*4);});
    return {points:points,other:{}};
  }
  function preset(points,type,name,seed) {
    var rng=new SA.RRNG(seed||2026);
    if(type==='points')return randomPoints(70,name==='cluster'?'cluster':name==='regular'?'regular':'uniform',seed);
    return points.map(function(pt,i){
      var p=clone(pt),noise=.10*rng.norm();
      if(type==='regression') {
        p.cov=Math.sin(7*p.x)+.2*Math.cos(5*p.y);
        p.value=.6+1.15*p.cov+(name==='gradient'?2.8*(p.x-.5)-1.7*(p.y-.5):0)+noise;
      } else if(name==='cluster')p.value=2.4*Math.exp(-((p.x-.25)**2+(p.y-.72)**2)/.019)-2.2*Math.exp(-((p.x-.75)**2+(p.y-.26)**2)/.023)+noise;
      else if(name==='checker')p.value=((Math.floor(5*p.x)+Math.floor(5*p.y))%2?1.5:-1.5)+noise;
      else if(name==='gradient')p.value=3.0*(p.x-.5)-1.0*(p.y-.5)+noise;
      else p.value=1.1*rng.norm();
      return p;
    });
  }
  function mapColors(value,limit,positive) {
    if(!finite(value))return '#cbd5e1';
    var t=clamp(Math.abs(value)/(limit||1),0,1),alpha=.14+.82*t;
    var base=positive?[25,132,146]:value>=0?[38,115,168]:[215,92,65],paper=[238,241,244];
    return 'rgb('+base.map(function(v,i){return Math.round(alpha*v+(1-alpha)*paper[i]);}).join(',')+')';
  }
  function element(tag,text,cls) { var o=document.createElement(tag);if(text!=null)o.textContent=text;if(cls)o.className=cls;return o; }
  function button(text,action) {var b=element('button',text,'spatial-studio-btn');b.type='button';b.addEventListener('click',action);return b;}
  function create(type, opts) {
    if(!conf[type])throw new Error('Studio spaziale inesistente: '+type);
    opts=opts||{};
    var state={type:type,tool:type==='points'||type==='kriging'?'add':'high',knn:4,band:type==='variogram'?2:.085,show:type==='kriging'?'uncertainty':'value',model:'coords',shown:'regression',counter:0,source:opts.source,feedback:'',active:null};
    var initial=sampleInit(type,opts.source);state.points=initial.points;state.other=initial.other;
    if(type==='kriging' && initial.other && initial.other.grid)state.grid=initial.other.grid;
    var root=element('section',null,'spatial-studio');root.setAttribute('aria-label','Mappa interattiva: '+conf[type].title);
    var heading=element('div',null,'spatial-studio-heading');heading.append(element('span','ESPLORA SULLA MAPPA · PARTE VIII','spatial-studio-overline'),element('h2',conf[type].title),element('p',conf[type].question));root.append(heading);
    var body=element('div',null,'spatial-studio-layout');root.append(body);
    var main=element('div',null,'spatial-studio-main'), panel=element('div',null,'spatial-studio-panel');body.append(main,panel);
    var actions=element('div',null,'spatial-studio-tools');panel.append(element('h3','1 · Intervieni sui dati'),actions);
    var tools=type==='points'?[['add','+ Evento'],['cluster','+ Gruppo di eventi'],['move','Sposta'],['remove','Rimuovi']]:type==='kriging'?[['add','+ Sensore'],['move','Sposta'],['remove','Rimuovi']]:[['high','+ Valore alto'],['low','+ Valore basso'],['cluster','+ Gruppo simile'],['move','Sposta'],['remove','Rimuovi']];
    var toolBtns={};tools.forEach(function(pair){var b=button(pair[1],function(){state.tool=pair[0];state.feedback='Modalità: '+pair[1]+'. Usa la mappa.';render();});b.setAttribute('data-tool',pair[0]);toolBtns[pair[0]]=b;actions.append(b);});
    var optsBox=element('div',null,'spatial-studio-extra');panel.append(optsBox);
    function select(label,choices,onChange) {
      var wrap=element('label',null,'spatial-studio-field'),sp=element('span',label),sel=element('select');wrap.append(sp,sel);
      choices.forEach(function(a){var op=element('option',a[1]);op.value=a[0];sel.append(op);});sel.addEventListener('change',function(){onChange(sel.value);render();});optsBox.append(wrap);return sel;
    }
    if(type==='moran'||type==='lisa'||type==='regression')select('Vicini per le statistiche kNN',[['3','3'],['4','4'],['6','6'],['8','8']],function(v){state.knn=+v;}).value=String(state.knn);
    if(type==='points')select('Larghezza del kernel KDE',[['0.045','Stretta · 0,045'],['0.085','Media · 0,085'],['0.15','Ampia · 0,150']],function(v){state.band=+v;}).value=String(state.band);
    if(type==='variogram')select('Esponente per la sola mappa IDW',[['1','1'],['2','2'],['3','3']],function(v){state.band=+v;}).value=String(state.band);
    if(type==='kriging')select('Superficie da vedere',[['uncertainty','Incertezza del kriging'],['value','Valore previsto']],function(v){state.show=v;}).value=state.show;
    if(type==='regression')select('Previsione cartografica',[['coords','X + coordinate'],['x','Solo X']],function(v){state.model=v;}).value=state.model;
    var scenarioBox=element('div',null,'spatial-studio-scenarios');panel.append(element('h3','2 · Prova uno scenario'),scenarioBox);
    var options=type==='points'?[['uniform','Dispersione CSR'],['cluster','Aggregazione'],['regular','Regolarità']]:type==='regression'?[['gradient','Trend geografico'],['random','Nessun trend']]:type==='kriging'?[['spread','Sensori distribuiti'],['cluster','Sensori concentrati']]:[['cluster','Due zone simili'],['checker','Alternanza'],['random','Casuale']];
    options.forEach(function(pair){scenarioBox.append(button(pair[1],function(){
      syncIfExternal();
      if(type==='kriging'){
        var g=state.grid||[],size=Math.min(12,g.length);
        if(pair[0]==='cluster'){var base=g.map(function(p,i){return {i:i,d:Math.hypot(p.x-.28,p.y-.72)};}).sort(function(a,b){return a.d-b.d;});state.points=base.slice(0,size).map(function(o){return {x:g[o.i].x,y:g[o.i].y,value:state.other.values[o.i],id:o.i};});}
        else {var ids=[0,11,132,143,6,66,77,35,108,114,57,85].filter(function(i){return i<g.length;});state.points=ids.map(function(i){return {x:g[i].x,y:g[i].y,value:state.other.values[i],id:i};});}
      } else state.points=preset(state.points,type,pair[0],2026);
      state.feedback='Scenario «'+pair[1]+'» applicato. Le statistiche si riferiscono ai nuovi dati.';state.counter++;notify();render();
    }));});
    var resetBtn=button('Ripristina mappa iniziale',function(){if(type==='kriging'&&typeof opts.source==='function'){var now=sampleInit(type,opts.source);if(initial.other.seed!==now.other.seed)initial={points:now.points.map(clone),other:now.other};}state.points=initial.points.map(clone);state.other=initial.other;if(type==='kriging')state.grid=initial.other.grid;state.counter++;state.feedback='Configurazione iniziale ripristinata.';notify();state.baseline=calculate();render();});resetBtn.className+=' spatial-studio-reset';panel.append(resetBtn);
    var syncBtn=button('Sincronizza con la lezione sotto',function(){var ini=sampleInit(type,opts.source);state.points=ini.points;state.other=ini.other;if(type==='kriging')state.grid=ini.other.grid;initial={points:ini.points.map(clone),other:ini.other};state.counter++;state.baseline=calculate();state.feedback='Mappa aggiornata dai dati del laboratorio sottostante.';render();});syncBtn.className+=' spatial-studio-reset';panel.append(syncBtn);
    var exportBtn=button('Esporta i punti della mappa (CSV)',function(){var rows=[['id','x_normalizzata','y_normalizzata','valore','covariata_X','id_sensore']];state.points.forEach(function(p,i){rows.push([i+1,p.x,p.y,finite(p.value)?p.value:'',finite(p.cov)?p.cov:'',p.id==null?'':p.id]);});SA.ui.download('statatlas_parte_viii_mappa_'+type+'.csv',SA.ui.csv(rows),'text/csv');});exportBtn.className+=' spatial-studio-reset';panel.append(exportBtn);
    var stats=element('div',null,'spatial-studio-stats');panel.append(element('h3','3 · Leggi il cambiamento'),stats);
    var mini=element('div',null,'spatial-studio-minichart');panel.append(mini);
    var reading=element('p',null,'spatial-studio-reading');panel.append(reading);
    var svgWrap=element('div',null,'spatial-studio-map');main.append(svgWrap);
    var legend=element('div',null,'spatial-studio-legend');main.append(legend);
    var scope=(type==='points'||type==='kriging')?' Le modifiche in questa mappa aggiornano anche il laboratorio sottostante.':' Questa esplorazione è uno scenario puntuale autonomo: il modello e i test della lezione sottostante non cambiano finché non li modifichi con i loro controlli.';scope+=' Se modifichi il generatore o il modello nei controlli sottostanti, premi «Sincronizza con la lezione sotto».';var explanation=element('p',conf[type].subtitle+scope,'spatial-studio-caption');root.append(explanation);
    var live=element('p','', 'spatial-studio-status');live.setAttribute('role','status');live.setAttribute('aria-live','polite');root.append(live);
    function notify(){if(typeof opts.onEdit==='function')opts.onEdit(state.points.map(clone));}
    function syncIfExternal(){
      if((type!=='kriging'&&type!=='points')||typeof opts.source!=='function')return;
      var fresh=sampleInit(type,opts.source),different=state.points.length!==fresh.points.length;
      if(!different) for(var z=0;z<fresh.points.length;z++){
        var a=state.points[z],b=fresh.points[z];
        if(Math.abs(a.x-b.x)>1e-10||Math.abs(a.y-b.y)>1e-10||(type==='kriging'&&a.id!==b.id)){different=true;break;}
      }
      if(type==='kriging'&&(state.other.seed!==fresh.other.seed||JSON.stringify(state.other.covOptions)!==JSON.stringify(fresh.other.covOptions)))different=true;
      if(different){state.points=fresh.points;state.other=fresh.other;if(type==='kriging')state.grid=fresh.other.grid;initial={points:fresh.points.map(clone),other:fresh.other};state.baseline=calculate();state.feedback='Dati e modello aggiornati automaticamente dalla lezione sottostante.';}
    }
    function changePoint(index,newXY) {
      syncIfExternal();
      if(index<0||index>=state.points.length)return;
      if(type==='kriging'){
        var nearest=nearestAvailable(newXY,index);if(nearest<0)return;state.points[index]={x:state.grid[nearest].x,y:state.grid[nearest].y,value:state.other.values[nearest],id:nearest};
      }else {state.points[index].x=clamp(newXY.x,.006,.994);state.points[index].y=clamp(newXY.y,.006,.994);}
      state.counter++;state.feedback='Punto spostato. Superficie e statistiche aggiornate.';notify();render();
    }
    function nearestAvailable(p,except) {
      var g=state.grid||[],best=-1,dist=Infinity;
      g.forEach(function(v,i){if(state.points.some(function(q,j){return j!==except&&q.id===i;}))return;var d=Math.hypot(v.x-p.x,v.y-p.y);if(d<dist){dist=d;best=i;}});
      return best;
    }
    function addPoint(p) {
      syncIfExternal();
      if(state.tool==='cluster') {
        var n=type==='points'?9:7;
        for(var t=0;t<n && state.points.length<(type==='kriging'?40:175);t++){
          var ang=2*Math.PI*t/n,rad=.012+.052*((t%3)+1)/3;
          var q={x:clamp(p.x+rad*Math.cos(ang),.01,.99),y:clamp(p.y+rad*Math.sin(ang),.01,.99)};
          state.points.push({x:q.x,y:q.y,value:type==='points'?0:2.5,cov:Math.sin(7*q.x)+.2*Math.cos(5*q.y)});
        }
        state.counter++;state.feedback='Gruppo di punti vicini aggiunto. Osserva la variazione delle statistiche.';notify();render();return;
      }
      if(state.points.length >= (type==='kriging'?40:175)){state.feedback='Limite didattico di osservazioni raggiunto.';render();return;}
      if(type==='kriging'){
        var ix=nearestAvailable(p,-1);if(ix<0)return;
        state.points.push({x:state.grid[ix].x,y:state.grid[ix].y,value:state.other.values[ix],id:ix});
      } else if(type==='points')state.points.push({x:p.x,y:p.y,value:0,cov:0});
      else {
        var near=state.points.length?smooth(state.points,p.x,p.y,'idw',2):0;
        var value=state.tool==='high'?2.5:state.tool==='low'?-2.5:near;
        var cov=Math.sin(7*p.x)+.2*Math.cos(5*p.y);
        if(type==='regression')value=.4+1.15*cov+2.1*(p.x-.5)-1.2*(p.y-.5)+(state.tool==='high'?1.3:-1.3);
        state.points.push({x:p.x,y:p.y,value:value,cov:cov});
      }
      state.counter++;state.feedback='Osservazione aggiunta in ('+fmt(p.x,2)+'; '+fmt(p.y,2)+').';notify();render();
    }
    function pointAction(i) {
      syncIfExternal();
      if(state.tool==='remove'){
        if(state.points.length <= (type==='kriging'?3:5)){state.feedback='Conserva almeno '+(type==='kriging'?3:5)+' osservazioni.';render();return;}
        state.points.splice(i,1);state.counter++;state.feedback='Osservazione rimossa.';notify();render();return;
      }
      if(state.tool==='high'||state.tool==='low'){
        state.points[i].value=state.tool==='high'?2.5:-2.5;state.counter++;state.feedback='Valore osservato modificato sul punto '+(i+1)+'.';notify();render();return;
      }
      state.active=i;state.feedback='Punto '+(i+1)+' selezionato. Usa le frecce per spostarlo, o trascinalo.';render();
    }
    function heat(mode,p,x,y,derived) {
      if(type==='points')return smooth(p,x,y,'kde',state.band);
      if(type==='kriging'){
        var v=derived.maps;if(!v)return NaN;
        var col=Math.min(v.n-1,Math.floor(x*v.n)),row=Math.min(v.n-1,Math.floor((1-y)*v.n));
        return (state.show==='uncertainty'?v.var:v.pred)[row*v.n+col];
      }
      if(type==='regression'){
        var r=state.model==='coords'?derived.modelCoords:derived.modelX;if(!r)return NaN;
        var xmean=mean(p.map(function(q){return q.cov;}));return r.beta[0]+r.beta[1]*xmean+(state.model==='coords'?r.beta[2]*(x-.5)+r.beta[3]*(y-.5):0);
      }
      return smooth(p,x,y,type==='variogram'?'idw':'kernel',type==='variogram'?state.band:.13);
    }
    function calculate() {
      var p=state.points, out={};
      if(type==='moran'||type==='lisa')out.moran=describe(p,state.knn);
      if(type==='points'){
        if(p.length>=3){out.curve=SA.spatialPoints.curve(p);out.nearest=SA.spatialPoints.nearest(p);}
      }
      if(type==='variogram' && p.length>=3)out.variogram=SA.geostat.empirical(p,p.map(function(q){return q.value;}),{bins:8,maxDist:1.0});
      if(type==='kriging' && p.length>=3) {
        var o=state.other, n=28, targets=[];
        for(var row=0;row<n;row++)for(var col=0;col<n;col++)targets.push({x:(col+.5)/n,y:1-(row+.5)/n});
        try {
          var design=SA.kriging.geometry(p,targets,o.covOptions||{model:'exponential',sigma2:1,phi:.25,nugget:.12},'ordinary',2);
          out.maps={pred:SA.kriging.predict(design,p.map(function(q){return q.value;})),var:design.variances,n:n};
        } catch(e) {out.error=e.message;}
      }
      if(type==='regression'){
        out.modelX=ols(p,false,state.knn);out.modelCoords=ols(p,true,state.knn);
        var residual=out.modelCoords&&out.modelCoords.residual;
        
      }
      return out;
    }
    function renderStats(d) {
      stats.innerHTML='';
      var lines=[['Osservazioni',state.points.length]];
      if(type==='moran'){
        var m=d.moran;lines.push(['Moran I (kNN)',fmt(m.I)],['Δ I rispetto all’inizio',fmt(m.I-(state.baseline&&state.baseline.moran?state.baseline.moran.I:m.I))],['E[I] sotto permutazione',fmt(m.expected)]);
        reading.textContent=!m.valid?'Serve variabilità tra i valori per definire Moran I.':m.I>.15?'Valori simili tendono a essere vicini (I positivo).':m.I<-.15?'Valori opposti tendono a essere vicini (I negativo).':'Autocorrelazione globale debole in questa configurazione. Nessun test è stato eseguito.';
      } else if(type==='lisa'){
        var lc=d.moran.local,counts={HH:0,LL:0,HL:0,LH:0};if(lc&&lc.valid)lc.quadrant.forEach(function(q){if(counts[q]!==undefined)counts[q]++;});
        lines.push(['Moran I globale',fmt(d.moran.I)],['Alto–alto (HH)',counts.HH],['Basso–basso (LL)',counts.LL],['Outlier HL + LH',counts.HL+counts.LH]);
        reading.textContent='Cerchi: HH blu, LL arancio, outlier viola. Le classi locali non sono automaticamente hotspot statisticamente significativi: usa le permutazioni della lezione sotto.';
      } else if(type==='points'){
        var nn=d.nearest,cur=d.curve;var avg=nn&&nn.distances&&nn.distances.length?mean(nn.distances.filter(finite)):NaN;
        lines.push(['Distanza media al vicino',fmt(avg)],['Riferimento CSR approssimato',fmt(1/(2*Math.sqrt(state.points.length)))],['KDE: banda h',fmt(state.band,3)]);
        reading.textContent='Blu intenso = intensità kernel più elevata. KDE non corretta al bordo; il riferimento CSR della distanza media è soltanto euristico. Per un test usa la curva K/L con envelope Monte Carlo nella lezione.';
      } else if(type==='variogram'){
        var v=d.variogram,valid=v?v.gamma.filter(finite):[];lines.push(['Coppie in r ≤ 1',v?v.counts.reduce(function(a,b){return a+b;},0):0],['Semivarianza media per classe',valid.length?fmt(mean(valid)):'n.d.'],['Classi con coppie',valid.length]);
        reading.textContent='La media tra classi non è una stima globale del sill. Per verificare l’effetto delle distanze osserva anche la curva del variogramma nella sezione Esperimento.';
      } else if(type==='kriging'){
        var vs=d.maps&&d.maps.var;lines.push(['Varianza media condizionale',vs?fmt(mean(vs)):'n.d.'],['Δ varianza rispetto all’inizio',vs&&state.baseline&&state.baseline.maps?fmt(mean(vs)-mean(state.baseline.maps.var)):'n.d.'],['Varianza massima',vs?fmt(Math.max.apply(null,vs)):'n.d.'],['Modello', 'Kriging ordinario']);
        reading.textContent=vs?'Aggiungi sensori nelle zone scoperte: la varianza condizionale dipende da posizioni e covarianza, non dai valori osservati. Il campo vero resta fisso.':'Sistema di kriging non definito: '+(d.error||'controlla le posizioni');
      } else if(type==='regression'){
        var a=d.modelX,b=d.modelCoords;
        lines.push(['β(X) senza coordinate',a?fmt(a.beta[1]):'n.d.'],['β(X) con lon + lat',b?fmt(b.beta[1]):'n.d.'],['R²: solo X / con coordinate',(a?fmt(a.r2,2):'—')+' / '+(b?fmt(b.r2,2):'—')],['Moran residui: X / X + lon + lat',(a?fmt(a.moran):'—')+' / '+(b?fmt(b.moran):'—')]);
        reading.textContent='Con OLS, aggiungere covariate non può diminuire R² in campione: non prova un miglioramento predittivo. Lon/lat possono assorbire un trend e cambiare β(X), ma non garantiscono residui indipendenti e non equivalgono a SAR/SEM. Con dati reali usa una proiezione metrica.';
      }
      lines.forEach(function(pair){var div=element('div',null,'spatial-studio-stat');div.append(element('span',pair[0]),element('strong',String(pair[1])));stats.append(div);});
    }
    function renderMini(d){
      mini.innerHTML='';
      if(type!=='points'&&type!=='variogram')return;
      var x=[],y=[],reference=0,title='';
      if(type==='points' && d.curve && d.curve.valid){x=d.curve.r;y=d.curve.L;title='L(r) − r: sopra zero = aggregazione relativa a CSR';}
      if(type==='variogram' && d.variogram){x=d.variogram.r;y=d.variogram.gamma;title='Semivarianza media per intervallo di distanza';reference=NaN;}
      if(!x.length)return;
      var N='http://www.w3.org/2000/svg',sg=document.createElementNS(N,'svg');sg.setAttribute('viewBox','0 0 310 130');sg.setAttribute('role','img');sg.setAttribute('aria-label',title);var arr=y.filter(finite);if(!arr.length)return;
      var yl=Math.min.apply(null,arr),yh=Math.max.apply(null,arr);if(finite(reference)){yl=Math.min(yl,reference);yh=Math.max(yh,reference);}if(yh-yl<.0001)yh=yl+.01;var padding=.12*(yh-yl);yl-=padding;yh+=padding;
      function E(tag,attrs){var e=document.createElementNS(N,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k]);});sg.appendChild(e);return e;}
      var xx=function(i){return 22+266*i/(x.length-1);},yy=function(v){return 107-84*(v-yl)/(yh-yl);};
      if(finite(reference))E('line',{x1:22,y1:yy(reference),x2:288,y2:yy(reference),stroke:'#718096','stroke-dasharray':'5 4'});
      var path='',open=false;y.forEach(function(v,i){if(!finite(v)){open=false;return;}path+=(open?'L':'M')+xx(i).toFixed(2)+' '+yy(v).toFixed(2)+' ';open=true;});E('path',{d:path,stroke:'#17759e','stroke-width':2.7,fill:'none'});
      var tx=E('text',{x:22,y:15,fill:'currentColor','font-size':11});tx.textContent=title;
      mini.append(sg);
    }
    function render() {
      Object.keys(toolBtns).forEach(function(k){toolBtns[k].classList.toggle('is-active',k===state.tool);toolBtns[k].setAttribute('aria-pressed',k===state.tool?'true':'false');});
      var d=calculate(),p=state.points;
      renderStats(d);renderMini(d);
      svgWrap.innerHTML='';
      var ns='http://www.w3.org/2000/svg';function svgEl(tag,attrs,parent){var v=document.createElementNS(ns,tag);Object.keys(attrs||{}).forEach(function(k){v.setAttribute(k,String(attrs[k]));});(parent||svg).appendChild(v);return v;}
      var svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 560 440');svg.setAttribute('role','group');svg.setAttribute('aria-label','Mappa continua interattiva. Scegli una modalità e clicca o trascina i punti.');svgWrap.append(svg);
      var x0=46,y0=36,side=340,N=29,vals=[];
      for(var row=0;row<N;row++)for(var col=0;col<N;col++)vals.push(heat(type,p,(col+.5)/N,1-(row+.5)/N,d));
      var pos=type==='points'||(type==='kriging'&&state.show==='uncertainty'),mi=finite(Math.min.apply(null,vals))?Math.min.apply(null,vals):0,ma=finite(Math.max.apply(null,vals))?Math.max.apply(null,vals):1;
      var limit=pos?Math.max(.00001,ma):Math.max(.25,...vals.filter(finite).map(function(v){return Math.abs(v); }));
      svgEl('rect',{x:x0,y:y0,width:side,height:side,fill:'#eef1f4',rx:5},svg);
      for(var iy=0;iy<N;iy++)for(var ix=0;ix<N;ix++){
        var v=vals[iy*N+ix],color=mapColors(pos?v:v,limit,pos);
        svgEl('rect',{x:x0+ix*side/N,y:y0+iy*side/N,width:side/N+.7,height:side/N+.7,fill:color,'pointer-events':'none'},svg);
      }
      for(var g=1;g<4;g++){
        svgEl('line',{x1:x0+g*side/4,y1:y0,x2:x0+g*side/4,y2:y0+side,stroke:'#475569','stroke-opacity':.17,'pointer-events':'none'},svg);
        svgEl('line',{x1:x0,y1:y0+g*side/4,x2:x0+side,y2:y0+g*side/4,stroke:'#475569','stroke-opacity':.17,'pointer-events':'none'},svg);
      }
      var bg=svgEl('rect',{x:x0,y:y0,width:side,height:side,fill:'transparent',stroke:'#52657a','stroke-width':1.2,role:'button',tabindex:0,'aria-label':'Aggiungi qui un’osservazione','data-action':'map',style:'touch-action:none;cursor:crosshair'},svg);
      function nearestPoint(q) {
        if(!q)return -1;
        var index=-1,dist=.092;
        p.forEach(function(pt,i){var d=Math.hypot(pt.x-q.x,pt.y-q.y);if(d<dist){dist=d;index=i;}});
        return index;
      }
      function clickAdd(ev){
        var q=xySVG(ev,svg,x0,y0,side);if(!q)return;
        if(state.tool==='move')return;
        if(state.tool==='remove') { var i=nearestPoint(q);if(i>=0)pointAction(i);return; }
        addPoint(q);
      }
      var dragBackground=null,dragIndex=-1;
      bg.addEventListener('pointerdown',function(ev){
        if(state.tool!=='move')return;
        var q=xySVG(ev,svg,x0,y0,side),i=nearestPoint(q);
        if(i>=0){dragBackground=q;dragIndex=i;ev.preventDefault();if(bg.setPointerCapture)bg.setPointerCapture(ev.pointerId);}
      });
      bg.addEventListener('pointerup',function(ev){
        if(dragIndex<0)return;
        var q=xySVG(ev,svg,x0,y0,side),i=dragIndex;dragIndex=-1;
        if(q&&Math.hypot(q.x-dragBackground.x,q.y-dragBackground.y)>.01)changePoint(i,q);
        else pointAction(i);
        dragBackground=null;ev.stopPropagation();
      });
      bg.addEventListener('click',clickAdd);
      bg.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();if(state.tool!=='remove'&&state.tool!=='move')addPoint({x:.5,y:.5});}});
      var palette={HH:'#1a73a8',LL:'#d76a40',HL:'#995ec9',LH:'#995ec9',NA:'#64748b'};
      p.forEach(function(pt,i){var sel=state.active===i,local=d.moran&&d.moran.local,q=local&&local.valid?local.quadrant[i]:null;
        if(type==='lisa'&&q&&q!=='NA')svgEl('circle',{cx:x0+pt.x*side,cy:y0+(1-pt.y)*side,r:10,fill:'none',stroke:palette[q],'stroke-width':3,'pointer-events':'none'},svg);
        var node=svgEl('circle',{cx:x0+pt.x*side,cy:y0+(1-pt.y)*side,r:sel?7.2:5.4,fill:type==='points'?'#183d62':type==='kriging'?'#273b53':pt.value>=0?'#186e9e':'#c15937',stroke:'#ffffff','stroke-width':1.8,tabindex:0,role:'button','data-point':i,'aria-label':(type==='points'?'Evento ':'Osservazione ')+(i+1)+', x '+fmt(pt.x,2)+', y '+fmt(pt.y,2)+(type==='points'?'':', valore '+fmt(pt.value,2)),'style':'cursor:pointer;touch-action:none'},svg);
        (function(idx,circle){var down=null,moved=false;
          circle.addEventListener('pointerdown',function(ev){if(state.tool==='move'){down=xySVG(ev,svg,x0,y0,side);moved=false;ev.preventDefault();if(circle.setPointerCapture)circle.setPointerCapture(ev.pointerId);}});
          circle.addEventListener('pointermove',function(ev){if(!down)return;var q=xySVG(ev,svg,x0,y0,side);if(!q)return;if(Math.hypot(q.x-down.x,q.y-down.y)>.01)moved=true;circle.setAttribute('cx',x0+q.x*side);circle.setAttribute('cy',y0+(1-q.y)*side);});
          circle.addEventListener('pointerup',function(ev){if(!down)return;var q=xySVG(ev,svg,x0,y0,side);down=null;if(q&&moved){moved=false;changePoint(idx,q);}else{moved=false;pointAction(idx);}ev.stopPropagation();});
          circle.addEventListener('click',function(ev){ev.stopPropagation();if(state.tool!=='move')pointAction(idx);});
          circle.addEventListener('keydown',function(ev){if(state.tool==='move' && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(ev.key)>=0){ev.preventDefault();var next={x:state.points[idx].x+(ev.key==='ArrowRight'?.035:ev.key==='ArrowLeft'?-.035:0),y:state.points[idx].y+(ev.key==='ArrowUp'?.035:ev.key==='ArrowDown'?-.035:0)};changePoint(idx,next);}else if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pointAction(idx);}});
        })(i,node);
      });
      function label(x,y,s,attrs){var t=svgEl('text',Object.assign({x:x,y:y,fill:'#33465e','font-size':13,'font-family':'system-ui,sans-serif'},attrs||{}),svg);t.textContent=s;}
      label(x0+side/2,418,'Longitudine / posizione x (normalizzata)',{'text-anchor':'middle'});
      label(12,y0+side/2,'Lat / y',{'text-anchor':'middle',transform:'rotate(-90 12 '+(y0+side/2)+')'});
      label(418,61,type==='points'?'DENSITÀ KDE':type==='kriging'?'SUPERFICIE':'VALORI');
      label(418,95,pos?'Massimo':'Ampiezza');label(418,119,fmt(limit,2),{'font-size':22,'font-weight':700});
      label(418,178,'PUNTI');label(418,205,String(p.length),{'font-size':22,'font-weight':700});
      label(418,262,'TOCCA LA MAPPA');
      ['Tocca per aggiungere,','trascina per spostare,','tocca vicino per','rimuovere i punti.'].forEach(function(s,i){label(418,285+i*21,s,{'font-size':12});});
      legend.textContent=type==='points'?'Blu intenso: concentrazione kernel elevata.':type==='kriging'&&state.show==='uncertainty'?'Blu intenso: incertezza predittiva più elevata.':type==='lisa'?'Blu: valori alti; arancio: bassi. Contorni locali HH / LL / outlier.':type==='regression'?'Superficie prevista a X fissata sulla media campionaria.':'Blu: valori sopra zero; arancio: sotto zero. La scala è relativa allo scenario.';
      live.textContent=state.feedback||'Modifica un punto oppure seleziona uno scenario e osserva subito la mappa e le statistiche.';
      root.dataset.points=String(p.length);root.dataset.updates=String(state.counter);
      if(d.moran)root.dataset.moran=String(d.moran.I);
      if(d.modelCoords)root.dataset.r2coords=String(d.modelCoords.r2);
      if(d.maps)root.dataset.meanVariance=String(mean(d.maps.var));
    }
    state.baseline=calculate();render();
    return {root:root,state:state,render:render,calculate:calculate};
  }
  function attach(page,type,source,onEdit) {
    var studio=create(type,{source:source,onEdit:onEdit});
    var head=page.querySelector('header.lab-head');
    if(head&&head.nextSibling)page.insertBefore(studio.root,head.nextSibling);
    else page.appendChild(studio.root);
    return studio;
  }
  return {create:create,attach:attach,knn:knn,describe:describe,smooth:smooth,ols:ols,preset:preset,randomPoints:randomPoints};
})();
