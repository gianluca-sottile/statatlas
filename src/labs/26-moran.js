/* StatAtlas | Lab 26 - autocorrelazione spaziale e I di Moran.
 * Mappe e statistiche sullo stesso dataset; randomizzazione condizionata su x.
 */
(function () {
  'use strict';
  var el, S, run, controls, mapBox, scatterBox, permBox, tableBox, textBox, codeBox, predBox, feedbackBox, mapInfoBox, permStatusBox, kpiBox;
  var ROWS = 8, COLS = 8;
  var TYPES = {
    blocks: 'Due regioni omogenee', checker: 'Alternanza a scacchiera',
    iid: 'Rumore indipendente', trend: 'Gradiente spaziale + rumore indipendente', sar: 'Processo SAR simulato'
  };
  function init(prev) {
    var cfg = { pattern: 'blocks', kind: 'rook', style: 'row', radius: 1.5, rho: 0.65, B: 499, seed: 2026, alt: 'greater', view: 'raw', focus: 27, pred: null };
    if (prev) Object.keys(cfg).forEach(function (k) { if (prev[k] !== undefined) cfg[k] = prev[k]; });
    var dg = SA.spatialAreal.generate(ROWS, COLS, cfg.pattern, cfg.seed, cfg.rho);
    if (cfg.pattern !== 'trend') cfg.view = 'raw';
    cfg.x = cfg.view === 'detrended' ? dg.noise.map(function (v) { return 0.35*v; }) : dg.x.slice();
    cfg.noise = dg.noise; cfg.trend = dg.trend;
    cfg.edited = false;
    configure(cfg);
    return cfg;
  }
  function configure(s) {
    s.W = SA.spatial.weights(ROWS, COLS, s.kind, s.style, s.radius);
    s.stats = SA.spatialAreal.moran(s.x, s.W);
    s.perm = []; s.prng = new SA.RRNG(s.seed + 1027);
  }
  function step() {
    if (S.perm.length >= S.B || !S.stats.valid) return false;
    S.perm.push(SA.spatialAreal.permuteOnce(S.x, S.W, S.prng));
    return true;
  }
  // I parametri strutturali invalidano il confronto permutazionale, ma non
  // devono avviare un nuovo esperimento senza un comando esplicito dell'utente.
  function reconfigure() { run.stop(); configure(S); render(); codeBox.refresh(); run.refresh(); }
  function restart() { run.stop(); S = init(S); renderControls(); buildPrediction(); render(); codeBox.refresh(); run.refresh(); }
  function completed() { return Math.min(S.perm.length, S.B); }
  // Mantieni in cache le repliche già simulate quando cambia soltanto B:
  // ridurre B usa il prefisso; rialzarlo riutilizza la coda e lo stato RNG.
  function permutations() { return S.perm.length > S.B ? S.perm.slice(0, S.B) : S.perm; }
  function refreshInference() { run.stop(); render(); codeBox.refresh(); run.refresh(); }
  function fmt(v, d) { return Number.isFinite(v) ? SA.fmt(v, d == null ? 3 : d) : 'non definito'; }
  function drawMap() {
    var P = SA.plot, t = SA.theme(); mapBox.innerHTML = '';
    var root = P.svg('svg', { viewBox: '0 0 520 420', role: 'group', 'aria-label': 'Griglia di 64 territori: premi Invio o clicca per modificare il valore' }, mapBox);
    var mean = S.stats.mean, range = Math.max.apply(null, S.x.map(function (v) { return Math.abs(v - mean); })) || 1;
    var d = 43, startX = 78, startY = 32, neighbors = S.W[S.focus].map(function (e) { return e.j; });
    for (var i = 0; i < S.x.length; i++) {
      var r = Math.floor(i / COLS), c = i % COLS, v = (S.x[i] - mean) / range;
      var positive = v >= 0, color = positive ? t.c1 : t.c2;
      var tile = P.svg('rect', { x: startX + c * d, y: startY + r * d, width: d - 3, height: d - 3, rx: 4,
        fill: color, 'fill-opacity': (0.24 + 0.72 * Math.abs(v)).toFixed(3), stroke: i === S.focus ? t.accent : (neighbors.indexOf(i) >= 0 ? t.ink_2 : t.card), 'stroke-width': i === S.focus ? 3 : (neighbors.indexOf(i) >= 0 ? 2 : 1.3),
        tabindex: 0, role: 'button', 'aria-label': 'Territorio riga ' + (r + 1) + ', colonna ' + (c + 1) + ', valore ' + fmt(S.x[i], 2) + '. Modifica valore' }, root);
      (function (idx, nd) {
        var change = function () { run.stop(); S.focus = idx; S.x[idx] = S.x[idx] > mean ? mean - range * 0.85 : mean + range * 0.85; S.edited = true; configure(S); render(); codeBox.refresh(); run.refresh(); };
        nd.addEventListener('click', change);
        nd.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); change(); } });
      })(i, tile);
    }
    P.text(root, 84, 17, 'Clic: modifica valore · contorno: cella scelta e vicini', { fill: t.ink_2, 'font-size': 14, 'font-weight': 600 });
    P.text(root, 80, 404, 'Basso rispetto alla media', { fill: t.c2, 'font-size': 12 });
    P.text(root, 340, 404, 'Alto', { fill: t.c1, 'font-size': 12 });
    if (mapInfoBox) {
      var r0 = Math.floor(S.focus / COLS) + 1, c0 = S.focus % COLS + 1;
      mapInfoBox.textContent = 'Cella selezionata: riga ' + r0 + ', colonna ' + c0 + ' · valore ' + fmt(S.x[S.focus], 2) + ' · ' + S.W[S.focus].length + ' vicini. Clicca su una cella per invertire il suo valore rispetto alla media.';
    }
  }
  function drawScatter() {
    var P = SA.plot, z = S.stats.z, lag = S.stats.lag;
    if (!S.stats.valid) { scatterBox.innerHTML = '<p>Variabilità nulla: lo scatterplot non è definito.</p>'; return; }
    var mz = Math.max(1e-4, ...z.map(Math.abs), ...lag.map(Math.abs)) * 1.15;
    var F = P.frame(scatterBox, { W: 700, H: 310, x: [-mz, mz], y: [-mz, mz], xlabel: 'xᵢ − media', ylabel: 'Lag spaziale di x centrato', label: 'Moran scatterplot' });
    var t = F.t, g = F.g;
    P.svg('line', { x1: F.x(0), x2: F.x(0), y1: F.y(-mz), y2: F.y(mz), stroke: t.rule_2, 'stroke-width': 1.5 }, g);
    P.svg('line', { x1: F.x(-mz), x2: F.x(mz), y1: F.y(0), y2: F.y(0), stroke: t.rule_2, 'stroke-width': 1.5 }, g);
    P.dots(g, z.map(function (v, i) { return [F.x(v), F.y(lag[i])]; }), 4, t.c1, 0.65);
    var slope = z.reduce(function (s, v, i) { return s + v * lag[i]; }, 0) / S.stats.ss;
    P.svg('line', { x1: F.x(-mz), x2: F.x(mz), y1: F.y(-mz * slope), y2: F.y(mz * slope), stroke: t.accent, 'stroke-width': 2.5 }, g);
    P.text(g, F.m.l + 10, F.m.t + 18, 'Pendenza OLS = ' + fmt(slope, 3) + '; Moran I = ' + fmt(S.stats.I, 3), { fill: t.ink_2, 'font-size': 12 });
    // Con pesi normalizzati per riga e nessun isolato, S0=n e pendenza=I.
    // Con pesi binari, la pendenza dello scatterplot NON coincide generalmente con I.
  }
  function drawPerm() {
    if (!S.stats.valid) { permBox.innerHTML = '<p>Il test richiede varianza non nulla.</p>'; if (permStatusBox) permStatusBox.textContent = 'Indice non definito: la variabile non ha variabilità.'; return; }
    var P = SA.plot, t, values = permutations(), obs = S.stats.I;
    var lo = Math.min(-0.6, obs - 0.12, ...values), hi = Math.max(0.6, obs + 0.12, ...values);
    var gap = hi - lo; lo -= 0.04 * gap; hi += 0.04 * gap;
    var N = 22, cnt = Array(N).fill(0), width = (hi - lo) / N;
    values.forEach(function (v) { var b = Math.max(0, Math.min(N - 1, Math.floor((v - lo) / width))); cnt[b]++; });
    var ymax = Math.max(1, ...cnt) * 1.17;
    var F = P.frame(permBox, { W: 700, H: 280, x: [lo, hi], y: [0, ymax], xlabel: 'I sotto H₀ per permutazione', ylabel: 'frequenza', label: 'Distribuzione permutazionale dell’indice di Moran' }); t = F.t;
    cnt.forEach(function (v, i) { if (v) P.svg('rect', { x: F.x(lo + i * width) + 1, y: F.y(v), width: Math.max(1, F.x(lo + (i + 1) * width) - F.x(lo + i * width) - 2), height: F.y(0) - F.y(v), fill: t.c1, 'fill-opacity': .55 }, F.g); });
    P.svg('line', { x1: F.x(obs), x2: F.x(obs), y1: F.m.t, y2: F.y(0), stroke: t.c2, 'stroke-width': 2.8 }, F.g);
    P.svg('line', { x1: F.x(S.stats.expected), x2: F.x(S.stats.expected), y1: F.m.t, y2: F.y(0), stroke: t.ink_3, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, F.g);
    P.text(F.g, F.m.l + 10, F.m.t + 14, 'Arancio: osservato · Tratteggio: E[I|permutazione]', { fill: t.ink_2, 'font-size': 12 });
    if (permStatusBox) permStatusBox.textContent = values.length + ' / ' + S.B + ' permutazioni · ' + (values.length ? 'distribuzione nulla aggiornata in tempo reale' : 'usa Avvia per generare la distribuzione nulla');
  }
  function updateTable() {
    var m = S.stats, draws = permutations(), count = draws.length, p = count ? SA.spatialAreal.pMonteCarlo(m.I, draws, S.alt) : NaN;
    tableBox.innerHTML = '';
    var rows = [
      ['Indice di Moran I', fmt(m.I, 4), m.valid ? 'statistica osservata' : 'non definito'],
      ['E[I] per permutazione', fmt(m.expected, 4), 'identità condizionata ai valori'],
      ['Somma dei pesi S₀', fmt(m.s0, 2), 'calcolo esatto'],
      ['Vicini della cella selezionata', String(S.W[S.focus].length), 'definiti da W'],
      ['Lag spaziale centrato nella cella', m.valid ? fmt(m.lag[S.focus], 4) : 'non definito', 'somma pesata dei valori centrati'],
      ['Permutazioni completate', String(count) + ' / ' + S.B, 'Monte Carlo'],
      ['p-value ' + (S.alt === 'less' ? 'unilaterale a sinistra' : 'unilaterale a destra'), fmt(p, 4), 'con correzione +1']
    ];
    rows.forEach(function (r) { tableBox.appendChild(el('tr', el('td', r[0]), el('td', r[1]), el('td', r[2]))); });
    textBox.innerHTML = '';
    var msg = !m.valid ? 'La variabile è costante e l’indice non è definito.' :
      count ? 'La distribuzione nulla deriva dalla permutazione dei valori fissati sulle unità territoriali: H₀ richiede scambiabilità spaziale. Il p-value non è la probabilità che H₀ sia vera.' :
        'La statistica osservata è disponibile. Premi Avvia o Passo per studiare la sua distribuzione permutazionale.';
    textBox.appendChild(el('p', msg));
    if (S.pattern === 'trend' && S.view === 'detrended') textBox.appendChild(el('p', 'Sono mostrati gli errori noti del generatore, dopo sottrazione del trend vero: non è una procedura di detrending stimata sui dati e non implica che il test per permutazione dei residui stimati sarebbe sempre valido.'));
    if (S.pattern === 'trend' && S.view === 'raw' && !S.edited) textBox.appendChild(el('p', 'Attenzione: un trend spaziale sistematico può produrre I positivo anche con errori indipendenti. L’indice non prova, da solo, che gli errori siano spazialmente correlati.'));
    if (S.style === 'binary') textBox.appendChild(el('p', 'Con pesi binari, la pendenza della retta nel Moran scatterplot non coincide generalmente con I: la scala è moltiplicata per n/S₀.'));
    if (kpiBox) {
      kpiBox.innerHTML = '';
      kpiBox.append(
        el('div.kpi', el('b', fmt(m.I, 3)), el('span', 'Moran I osservato')),
        el('div.kpi', el('b', String(count) + ' / ' + S.B), el('span', 'permutazioni della null')),
        el('div.kpi', el('b', fmt(p, 4)), el('span', 'p-value Monte Carlo (+' + '1)')));
    }
  }
  function render() { drawMap(); drawScatter(); drawPerm(); updateTable(); }
  function rCode() {
    var x = S.x.map(function (v) { return Number(v).toPrecision(17); }).join(', ');
    var lines = [
      '# StatAtlas Lab 26 · Moran globale · riproduzione del campione visualizzato',
      '# R0: stessi valori, inseriti come costanti; R1: formula e W.',
      '# Le permutazioni R generano una nuova sequenza (confronto di metodo, non R0).',
      'nr <- ' + ROWS + 'L; nc <- ' + COLS + 'L', 'x <- c(' + x + ')',
      'kind <- "' + S.kind + '"; style <- "' + S.style + '"; radius <- ' + S.radius,
      'nb <- lapply(seq_along(x), function(i) {',
      '  r <- (i - 1L) %/% nc; c <- (i - 1L) %% nc',
      '  rr <- (seq_along(x) - 1L) %/% nc; cc <- (seq_along(x) - 1L) %% nc',
      '  d <- sqrt((rr-r)^2 + (cc-c)^2)',
      '  j <- if (kind == "rook") which(abs(rr-r)+abs(cc-c) == 1) else',
      '    if (kind == "queen") which(pmax(abs(rr-r),abs(cc-c)) == 1) else which(d <= radius + 1e-12 & d > 0)',
      '  j', '})',
      'W <- matrix(0, length(x), length(x))',
      'for (i in seq_along(nb)) if (length(nb[[i]])) {',
      '  W[i, nb[[i]]] <- if (style == "row") 1 / length(nb[[i]]) else 1',
      '}',
      'z <- x - mean(x); S0 <- sum(W)',
      'if (sum(z^2) < 1e-24) stop("Moran non definito per variabile costante")',
      'I <- length(x) / S0 * sum(z * drop(W %*% z)) / sum(z^2)',
      'cat("Moran I:", I, "· atteso:", -1/(length(x)-1), "\\n")',
      'stopifnot(isTRUE(all.equal(I, ' + (Number.isFinite(S.stats.I) ? S.stats.I.toPrecision(17) : 'NaN') + ', tolerance=1e-9)))',
      'if (requireNamespace("spdep", quietly=TRUE)) {',
      '  nblist <- lapply(nb, as.integer); class(nblist) <- "nb"',
      '  attr(nblist, "region.id") <- as.character(seq_along(nb))',
      '  attr(nblist, "type") <- kind',
      '  attr(nblist, "sym") <- TRUE',
      '  lw <- spdep::nb2listw(nblist, style=if (style == "row") "W" else "B", zero.policy=TRUE)',
      '  print(spdep::moran.test(x, lw, zero.policy=TRUE, randomisation=TRUE))',
      '}',
      'set.seed(' + (S.seed + 1027) + ')',
      'B <- ' + S.B + 'L; Is <- replicate(B, { zp <- sample(z); length(z) / S0 * sum(zp * drop(W %*% zp)) / sum(zp^2) })',
      'p <- (1 + sum(Is ' + (S.alt === 'less' ? '<=' : '>=') + ' I)) / (B + 1)',
      'cat("p Monte Carlo (sequenza R):", p, "\\n")',
      'hist(Is, breaks=20, main="Distribuzione permutazionale di Moran I", xlab="I")',
      'abline(v=I, col="firebrick", lwd=2)'
    ];
    return lines.join('\n');
  }
  function renderControls() {
    controls.innerHTML = '';
    var select = function (label, key, opts, regen) {
      return el('label.field', el('span', label), el('select', { onchange: function () { S[key] = opts.find(function (o) { return String(o[0]) === this.value; }, this)[0]; if (key === 'pattern') S.pred = null; if (regen) restart(); else if (key === 'alt' || key === 'B') refreshInference(); else reconfigure(); } },
        opts.map(function (o) { return el('option', { value: o[0], selected: String(o[0]) === String(S[key]) }, o[1]); })));
    };
    controls.append(
      select('Meccanismo generatore', 'pattern', Object.keys(TYPES).map(function (k) { return [k, TYPES[k]]; }), true),
      select('Vicinato', 'kind', [['rook','Rook: lato comune'],['queen','Queen: lato o vertice'],['distance','Distanza ≤ r']], false),
      select('Pesi spaziali', 'style', [['row','Standardizzati per riga'],['binary','Binari (0/1)']], false),
      SA.ui.slider('Raggio (solo per distanza)', { min: 1, max: 2.5, step: .5, value: S.radius, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.radius = v; reconfigure(); } }),
      SA.ui.slider('Parametro SAR ρ (solo SAR)', { min: -.8, max: .8, step: .1, value: S.rho, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.rho = v; restart(); } }),
      select('Permutazioni B', 'B', [[199, '199'], [499, '499'], [999, '999']], false),
      select('Alternativa', 'alt', [['greater','Autocorrelazione positiva'],['less','Autocorrelazione negativa']], false),
      el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } })),
      SA.ui.button('Ripristina la mappa', { cls: 'btn-ghost', onclick: restart }));
    if (S.pattern === 'trend') controls.appendChild(select('Trend simulato', 'view', [['raw', 'Valori osservati'], ['detrended', 'Errori: trend vero rimosso']], true));
    run.controls('Una permutazione').forEach(function (b) { controls.appendChild(b); });
  }
  /* Il contenitore viene spostato automaticamente in details.predict da enhanceLab().
   * Tre risposte reali, con feedback specifico per il meccanismo generatore. */
  function buildPrediction() {
    if (!predBox) return;
    predBox.innerHTML = '';
    var name = 'moran-pred-' + Date.now();
    var options = [['positive', 'Moran I sarà positivo: prevalgono territori simili vicini'],
      ['negative', 'Moran I sarà negativo: prevalgono territori discordanti vicini'],
      ['neutral', 'Moran I sarà vicino alla speranza nulla E[I] = −1/(n−1)']];
    predBox.append(
      el('p.prose', 'Osserva la configurazione selezionata, prima delle permutazioni. Quale valore ti aspetti per Moran I?'),
      el('div.choices', { role: 'radiogroup', 'aria-label': 'Previsione del segno di Moran I' }, options.map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + '-' + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updatePredictionFeedback(); } }),
          el('label', { for: name + '-' + i }, o[1]));
      })));
    feedbackBox = el('div.feedback', { role: 'status', hidden: true });
    predBox.appendChild(feedbackBox);
    updatePredictionFeedback();
  }
  function updatePredictionFeedback() {
    if (!feedbackBox) return;
    if (!S.pred) { feedbackBox.hidden = true; return; }
    feedbackBox.hidden = false;
    var expected = S.pattern === 'blocks' || S.pattern === 'trend' ? 'positive' :
      S.pattern === 'checker' ? 'negative' : S.pattern === 'iid' || Math.abs(S.rho) < 0.15 ? 'neutral' :
        S.rho > 0 ? 'positive' : 'negative';
    var details = S.pattern === 'blocks' ? 'Le due regioni omogenee presentano molte coppie di vicini concordanti; il valore osservato dipende dai bordi e da W.' :
      S.pattern === 'checker' ? 'La scacchiera produce soprattutto vicini discordanti con rook. Prova queen: la definizione di vicinato può cambiare anche il segno.' :
        S.pattern === 'iid' ? 'Sotto rumore indipendente non c’è una struttura spaziale imposta; un singolo I può comunque allontanarsi dalla sua speranza per variabilità campionaria.' :
          S.pattern === 'trend' ? 'Il gradiente può generare I positivo anche con errori indipendenti. Prova anche la modalità «trend vero rimosso».' :
            'Il parametro ρ del generatore SAR non coincide con Moran I; confronta più realizzazioni variando seed e ρ.';
    feedbackBox.textContent = (S.pred === expected ? '✓ Previsione coerente con il meccanismo iniziale. ' : 'Confronta la previsione con il risultato. ') + details;
  }
  var THEORY = {
    base: function () { return el('div.prose', { html: '<h3>Il problema statistico</h3><p>Su unità territoriali distinte osserviamo una variabile xᵢ. Per descrivere la somiglianza tra territori vicini è necessario definire una matrice W = (wᵢⱼ): valori e vicinati sono oggetti differenti.</p>' +
      '<h3>L’indice globale di Moran</h3><div class="eq" data-tex="I=\\frac{n}{S_0}\\frac{\\sum_i\\sum_jw_{ij}(x_i-\\bar x)(x_j-\\bar x)}{\\sum_i(x_i-\\bar x)^2},\\quad S_0=\\sum_i\\sum_jw_{ij}"></div>' +
      '<p>Valori positivi indicano prevalenza di vicini simili rispetto alla media; valori negativi indicano vicini discordanti. Non esistono limiti universalmente uguali a −1 e +1: dipendono da W. Lo scatterplot presenta x centrato contro il suo lag spaziale; con W normalizzata per riga e nessun isolato la pendenza OLS coincide con I.</p>' +
      '<h3>Permutare per formulare un test</h3><p>Tenendo fissi i valori osservati, li riassegniamo casualmente alle posizioni. Il test riguarda la scambiabilità rispetto alla geografia considerata. Con B simulazioni si calcola p = (1 + numero di I* almeno estremi quanto I osservato)/(B + 1), utilizzando un’alternativa specificata.</p>' +
      '<div class="callout warn"><strong>Interpretazione:</strong> I positivo non dimostra una dipendenza residua: un trend della media può generare un I positivo anche con errori indipendenti. Inoltre, la permutazione non rappresenta necessariamente un valido nullo per dati con covariate, eteroschedasticità o non stazionarietà.</div>' }); },
    adv: function () { return el('div.prose', { html: '<h3>Forma matriciale e speranza permutazionale</h3><p>Ponendo z = x − x̄1, I = (n/S₀)(zᵀWz)/(zᵀz). Sotto permutazione uniforme dei valori, con diagonale nulla, E[I | x] = −1/(n−1), purché la variabilità campionaria sia non nulla e S₀ &gt; 0. Non è una conseguenza dell’indipendenza probabilistica senza ulteriori assunzioni sulla distribuzione.</p>' +
      '<h3>Moran scatterplot e normalizzazione</h3><p>La regressione senza intercetta di Wz su z ha pendenza b = zᵀWz/(zᵀz). Perciò I = (n/S₀)b. Solo quando S₀ = n, ad esempio con W normalizzata per riga e senza isolati, b = I. I pesi binari e quelli standardizzati rispondono a convenzioni diverse e non sempre forniscono gli stessi risultati.</p>' +
      '<h3>Validità dell’inferenza</h3><p>Il p-value Monte Carlo usa la correzione +1 e contiene il dato osservato tra le configurazioni possibili. Il test globale richiede una null di randomizzazione giustificabile. Con un trend o con covariate, la permutazione indiscriminata dei dati grezzi può essere fuorviante; occorre definire un modello nullo adatto e, quando giustificato, studiare opportunamente i residui.</p>' +
      '<h3>Un modello generativo distinto</h3><p>Il laboratorio mostra inoltre un DGP z = (I − ρW)⁻¹ε, con ε indipendenti. Quando W è normalizzata per riga e |ρ| &lt; 1, la serie di Neumann converge. Il parametro ρ del processo generatore non è numericamente uguale all’indice di Moran osservato e può produrre molte realizzazioni differenti.</p>' +
      '<h3>Limiti</h3><p>Unità isolate, bordi, scale geografiche, aggregazione dei territori e struttura della matrice W cambiano l’interpretazione. I test asintotici normali richiedono ulteriori ipotesi; qui si privilegia una distribuzione condizionata per permutazione, non una calibrazione universale.</p>' }); }
  };
  SA.registerLab('moran', {
    mount: function (page, info) {
      el = SA.ui.el; S = init(S);
      run = SA.ui.runner({ speed: 2, coop: true, step: step, render: render, done: function () { return S.perm.length >= S.B || !S.stats.valid; }, progress: function () { return completed() / S.B; }, reset: function () { configure(S); } });
      var openTheory = function (level) { SA.ui.openDrawer('Autocorrelazione spaziale e Moran', THEORY, level); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Quando la geografia cambia il significato dei dati: mappe, vicinati, indice I e randomizzazione condizionata.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openTheory(); } })));
      var s1 = SA.ui.step('1','Domanda'); s1.body.appendChild(el('p.question','Territori con valori simili si trovano vicini più spesso di quanto ci aspetteremmo permutando i valori osservati?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3','Esperimento','Modifica la configurazione e simula l’ipotesi nulla');
      controls = el('div.panel.controls'); mapBox = el('div'); scatterBox = el('div'); permBox = el('div'); mapInfoBox = el('p.moran-map-info'); permStatusBox = el('span.moran-perm-status');
      s3.body.appendChild(el('div.moran-guide', { role: 'note' },
        el('strong', 'Come usare il laboratorio'),
        el('ol', el('li', 'Osserva la mappa e il valore iniziale di Moran I.'),
          el('li', 'Clicca sulle celle per modificarne i valori, oppure cambia il meccanismo generatore.'),
          el('li', 'La simulazione è inizialmente ferma: premi Avvia, Passo o Completa per eseguire le permutazioni. Dopo modifiche a dati o vicinati, avvia manualmente il nuovo esperimento; alternativa e B conservano le repliche già calcolate.'),
          el('li', 'Confronta il p-value con la statistica e prova altri vicinati o pesi.'))));
      s3.body.appendChild(el('div.lab-grid', controls, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3','Territori e valori osservati')), mapBox, mapInfoBox),
        el('div.fig', el('div.fig-title', el('h3','Moran scatterplot')), scatterBox),
        el('div.fig', el('div.fig-title', el('h3','La distribuzione nulla per permutazione'), permStatusBox), permBox),
        el('div.toolbar',
          SA.ui.button('Dati e vicini CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
            var rows = [['id','riga','colonna','valore','vicini','pesi']]; S.x.forEach(function (v, i) { rows.push([i + 1, Math.floor(i / COLS) + 1, i % COLS + 1, v, S.W[i].map(function(e){return e.j+1;}).join(';'), S.W[i].map(function(e){return e.w;}).join(';')]); });
            SA.ui.download('statatlas_lab26_moran.csv', SA.ui.csv(rows), 'text/csv');
          } }),
          SA.ui.button('Permutazioni CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.download('statatlas_lab26_permutazioni.csv', SA.ui.csv([['replica','I']].concat(permutations().map(function (v,i) { return [i+1,v]; }))), 'text/csv'); } }),
          SA.ui.button('Grafici PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([mapBox.querySelector('svg'),scatterBox.querySelector('svg'),permBox.querySelector('svg')], 'statatlas_lab26_moran.png', ['Autocorrelazione spaziale', 'Moran I = ' + fmt(S.stats.I,3) + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4','Teoria e simulazione a confronto'); tableBox = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead',el('tr',el('th','Quantità'),el('th','Valore'),el('th','Interpretazione'))),tableBox)),
        el('div.status-key', el('span',SA.ui.badge('exact'),' identità esatta'),el('span',SA.ui.badge('mc'),' Monte Carlo')), kpiBox);
      var s5 = SA.ui.step('5','Interpretazione'); textBox = el('div.prose'); s5.body.append(textBox,el('p',SA.ui.button('Teoria avanzata e limiti', { icon:'book', cls:'btn-ghost', onclick: function () { openTheory('adv'); } })));
      var s6 = SA.ui.step('6','Riproduci in R','Stessi valori, stessa W, stessa statistica'); codeBox = SA.ui.codeBlock(rCode,'statatlas_lab26_moran.R');
      s6.body.append(el('p.prose','R0: dati visualizzati come valori espliciti; R1: matrice dei pesi e indice identici. Le permutazioni R non seguono la stessa sequenza Fisher–Yates del browser e non sono un confronto R0.'),codeBox);
      page.append(s1,s2,s3,s4,s5,s6);
      renderControls(); buildPrediction(); render(); codeBox.refresh(); run.refresh(); document.addEventListener('keydown',run.key);
      // Campione subito visibile, e permutazioni avviate senza richiedere un clic iniziale.
      // Il motore si ferma automaticamente a B, o manualmente con Pausa.
    },
    unmount: function () { if (run) { run.stop(); document.removeEventListener('keydown',run.key); } },
    redraw: function () { if (S) render(); }
  });
})();
