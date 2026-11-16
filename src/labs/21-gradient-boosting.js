/* StatAtlas · Lab 21 — Gradient boosting con alberi di regressione.
 * Si osserva il boosting funzionale su dati 1D, usando SSE oppure log loss.
 * Un passo = un CART di regressione sui gradienti negativi, poi shrinkage eta.
 * Il test indipendente non è mai usato per selezionare il numero di alberi.
 */
(function () {
  var el, S, run, ctrlBox, predBox, feedbackBox, figFit, figGrad, figLoss, figStages, tblBody, kpiBox, interpBox, codeBox;
  var NVAL = 100, NTEST = 220, NG = 140;
  var MODELS = {
    sine: { label: 'Regressione: curva sinusoidale', family: 'gaussian', f: function (x) { return 1.4 * Math.sin(1.6 * x) + 0.25 * x; },
      r: '1.4 * sin(1.6 * x) + 0.25 * x' },
    step: { label: 'Regressione: salto e andamento lineare', family: 'gaussian', f: function (x) { return 0.35 * x + (x > 0.25 ? 1 : -0.5); },
      r: '0.35 * x + ifelse(x > 0.25, 1, -0.5)' },
    binary: { label: 'Classificazione: probabilità non lineare', family: 'binary', f: function (x) { return SA.boost.sigmoid(2.5 * Math.sin(1.5 * x) + 0.45 * x); },
      r: 'plogis(2.5 * sin(1.5 * x) + 0.45 * x)' }
  };
  function ar(n, f) { var z = []; for (var i = 0; i < n; i++) z.push(f(i)); return z; }
  function getX(g, n) { return ar(n, function () { return -2 + 4 * g.unif(); }); }
  function getY(g, xx, sc, sig) {
    if (sc === 'binary') return xx.map(function (x) { return +(g.unif() < MODELS.binary.f(x)); });
    return xx.map(function (x) { return MODELS[sc].f(x) + sig * g.norm(); });
  }
  function newState(prev) {
    var s = { sc: 'sine', n: 120, sigma: 0.4, eta: 0.1, depth: 2, minLeaf: 8, B: 100, seed: 2026, showBest: false, pred: null };
    if (prev) for (var key in s) if (prev[key] !== undefined) s[key] = prev[key];
    s.family = MODELS[s.sc].family;
    var g = new SA.RRNG(s.seed);
    s.tr = { x: getX(g, s.n) }; s.va = { x: getX(g, NVAL) }; s.te = { x: getX(g, NTEST) };
    s.tr.y = getY(g, s.tr.x, s.sc, s.sigma);
    s.va.y = getY(g, s.va.x, s.sc, s.sigma);
    s.te.y = getY(g, s.te.x, s.sc, s.sigma);
    s.grid = ar(NG, function (i) { return -2 + 4 * i / (NG - 1); });
    s.base = SA.boost.intercept(s.tr.y, s.family);
    s.tr.raw = ar(s.n, function () { return s.base; });
    s.va.raw = ar(NVAL, function () { return s.base; });
    s.te.raw = ar(NTEST, function () { return s.base; });
    s.gr = ar(NG, function () { return s.base; });
    s.trees = []; s.hist = []; s.k = 0; s.ok = true;
    saveLoss(s);
    return s;
  }
  function saveLoss(s) {
    s.hist.push({ tr: SA.boost.loss(s.tr.y, s.tr.raw, s.family), va: SA.boost.loss(s.va.y, s.va.raw, s.family),
      te: SA.boost.loss(s.te.y, s.te.raw, s.family) });
  }
  function bestStep() { var b = 0; for (var i = 1; i < S.hist.length; i++) if (S.hist[i].va < S.hist[b].va) b = i; return b; }
  function treeInvariant(t, minLeaf, depth) {
    return t.every(function (v) { return (v.leaf ? v.n >= minLeaf : v.gain > 0 && v.depth < depth && t[v.l].n + t[v.r].n === v.n); });
  }
  function step() {
    if (S.k >= S.B) return false;
    var r = SA.boost.pseudo(S.tr.y, S.tr.raw, S.family);
    var t = SA.boost.tree1D(S.tr.x, r, S.depth, S.minLeaf);
    S.ok = S.ok && treeInvariant(t, S.minLeaf, S.depth);
    S.trees.push(t);
    SA.boost.update(S.tr.raw, t, S.tr.x, S.eta);
    SA.boost.update(S.va.raw, t, S.va.x, S.eta);
    SA.boost.update(S.te.raw, t, S.te.x, S.eta);
    SA.boost.update(S.gr, t, S.grid, S.eta);
    S.k++; saveLoss(S);
    return true;
  }
  function gridRaw(b) {
    if (b === S.k) return S.gr;
    return S.grid.map(function (x) { var f = S.base; for (var j = 0; j < b; j++) f += S.eta * SA.boost.treePredict(S.trees[j], x); return f; });
  }
  function shown() { return S.showBest ? bestStep() : S.k; }
  function drawFit() {
    var P = SA.plot, binary = S.family === 'binary', yy = binary ? [-0.12, 1.12] : [-2.9, 2.9];
    var F = P.frame(figFit, { W: 720, H: 325, x: [-2, 2], y: yy, xlabel: 'x', ylabel: binary ? 'probabilità / classe' : 'y', label: 'Funzione vera, dati e boosting' });
    var t = F.t, g = F.g, sel = shown(), show = gridRaw(sel), clamp = function (v) { return Math.max(yy[0], Math.min(yy[1], v)); };
    P.dots(g, S.tr.x.map(function (x, i) { return [F.x(x), F.y(clamp(S.tr.y[i]))]; }), binary ? 2.5 : 2.1, t.ink, 0.37);
    S.va.x.forEach(function (x, i) { P.svg('circle', { cx: F.x(x), cy: F.y(clamp(S.va.y[i])), r: 3.2, fill: 'none', stroke: t.c3, 'stroke-width': 1.2, 'stroke-opacity': .65 }, g); });
    P.curve(F, MODELS[S.sc].f, -2, 2, { stroke: t.c_theory, 'stroke-width': 2.5, 'stroke-dasharray': '7 4' });
    P.svg('path', { d: P.path(S.grid.map(function (x, i) { return [F.x(x), F.y(clamp(SA.boost.response(show[i], S.family)))]; })), fill: 'none', stroke: t.accent, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    P.text(g, F.m.l + 8, F.m.t + 12, 'Alberi applicati: ' + sel + (S.showBest ? ' · minimo in validazione' : ''), { fill: t.ink_2, 'font-weight': 600, 'font-size': 12 });
  }
  function drawGrad() {
    var P = SA.plot, r = SA.boost.pseudo(S.tr.y, S.tr.raw, S.family), lo = -2.1, hi = 2.1;
    if (S.family === 'gaussian') { lo = -2.5; hi = 2.5; } else { lo = -1.05; hi = 1.05; }
    var F = P.frame(figGrad, { W: 720, H: 245, x: [-2, 2], y: [lo, hi], xlabel: 'x', ylabel: 'pseudo-residuo', label: 'Direzione del prossimo passo' });
    var t = F.t;
    P.svg('line', { x1: F.x(-2), x2: F.x(2), y1: F.y(0), y2: F.y(0), stroke: t.rule_2, 'stroke-width': 1.5 }, F.g);
    P.dots(F.g, S.tr.x.map(function (x, i) { return [F.x(x), F.y(Math.max(lo, Math.min(hi, r[i])))]; }), 2.4, t.c1, .55);
    if (S.k < S.B) {
      var tree = SA.boost.tree1D(S.tr.x, r, S.depth, S.minLeaf);
      var vv = S.grid.map(function (x) { return Math.max(lo, Math.min(hi, SA.boost.treePredict(tree, x))); });
      P.svg('path', { d: P.path(S.grid.map(function (x, i) { return [F.x(x), F.y(vv[i])]; })), fill: 'none', stroke: t.c2, 'stroke-width': 2.7 }, F.g);
      P.text(F.g, F.m.l + 6, F.m.t + 12, 'Blu: −∂Loss/∂F · Arancio: albero adattato ai gradienti', { fill: t.ink_2, 'font-size': 11 });
    } else P.text(F.g, F.m.l + 6, F.m.t + 12, 'Budget di alberi completato: cambia B per continuare.', { fill: t.ink_2, 'font-size': 11 });
  }
  function drawLoss() {
    var P = SA.plot, M = 0.01, b = bestStep();
    S.hist.forEach(function (h) { M = Math.max(M, h.tr, h.va, h.te); });
    var F = P.frame(figLoss, { W: 720, H: 265, x: [0, S.B], y: [0, M * 1.12], xlabel: 'numero di alberi B', ylabel: S.family === 'binary' ? 'log loss media' : 'MSE', label: 'Prestazioni su insiemi indipendenti' });
    var t = F.t, g = F.g, lines = [['tr', t.c1, null], ['va', t.c2, '8 4'], ['te', t.c3, '3 4']];
    lines.forEach(function (a) { P.svg('path', { d: P.path(S.hist.map(function (h, i) { return [F.x(i), F.y(h[a[0]])]; })), fill: 'none', stroke: a[1], 'stroke-width': 2.4, 'stroke-dasharray': a[2] }, g); });
    P.svg('line', { x1: F.x(b), x2: F.x(b), y1: F.m.t, y2: F.y(0), stroke: t.c2, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, g);
    P.text(g, Math.min(F.x(b) + 8, F.W - 135), F.m.t + 14, 'min. validazione: B = ' + b, { fill: t.c2, 'font-size': 11, 'font-weight': 600 });
  }
  function drawStages() {
    var P = SA.plot, t = SA.theme(), b = bestStep(); figStages.innerHTML = '';
    var svg = P.svg('svg', { viewBox: '0 0 700 106', role: 'img', 'aria-label': 'Sequenza degli alberi e aggiornamento del modello' }, figStages);
    var steps = [0, Math.floor(S.k / 3), Math.floor(2 * S.k / 3), S.k].filter(function (n, i, arr) { return arr.indexOf(n) === i; });
    steps.forEach(function (n, i) {
      var cx = 68 + i * 160, a = gridRaw(n), vals = a.map(function (f) { return SA.boost.response(f, S.family); });
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), yy = function (v) { return 78 - 47 * (v + 2.9) / 5.8; };
      if (S.family === 'binary') yy = function (v) { return 79 - 45 * v; };
      P.svg('rect', { x: cx - 45, y: 15, width: 128, height: 76, rx: 7, fill: t.card, stroke: n === b ? t.c2 : t.rule_2 }, svg);
      P.svg('path', { d: P.path(vals.map(function (v, q) { return [cx - 42 + q * 124 / (NG - 1), yy(v)]; })), stroke: t.accent, 'stroke-width': 1.8, fill: 'none' }, svg);
      P.text(svg, cx - 38, 9, 'B = ' + n, { fill: t.ink_2, 'font-size': 11, 'font-weight': 600 });
    });
  }
  function updateTable() {
    var F = SA.fmt, B = SA.ui.badge, last = S.hist[S.k], first = S.hist[0], b = bestStep(), min = S.hist[b];
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Intercetta iniziale F₀'), el('td', S.family === 'binary' ? 'logit della proporzione training' : 'media di training'), el('td', F(S.base, 4)), el('td', B('exact'))),
      el('tr', el('td', 'Perdita iniziale: train · validazione · test'), el('td', 'solo il modello costante'), el('td', F(first.tr, 4) + ' · ' + F(first.va, 4) + ' · ' + F(first.te, 4)), el('td', B('none'))),
      el('tr', el('td', 'Ultimo passo B = ' + S.k + ': train · validazione · test'), el('td', 'test indipendente, non usato nel tuning'), el('td', F(last.tr, 4) + ' · ' + F(last.va, 4) + ' · ' + F(last.te, 4)), el('td', B('none'))),
      el('tr', el('td', 'Minimo in validazione: passo e perdita'), el('td', 'argmin su 0…B, a parità il primo'), el('td', b + ' · ' + F(min.va, 4)), el('td', B('approx'))),
      el('tr', el('td', 'Test al minimo di validazione'), el('td', 'valutazione su punti mai usati per la selezione'), el('td', F(min.te, 4)), el('td', B('approx'))),
      el('tr', el('td', 'Controllo strutturale degli alberi'), el('td', 'foglie ≥ minLeaf; guadagno SSE > 0'), el('td', S.ok ? '✓ superato' : '✗ violazione'), el('td', B('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + '/' + S.B), el('span', 'alberi costruiti')),
      el('div.kpi', el('b', 'B* = ' + b), el('span', 'minimo di validazione')),
      el('div.kpi', el('b', F(last.va - min.va, 3)), el('span', 'eccesso di loss rispetto al minimo')));
    updateFeedback();
  }
  function buildPrediction() {
    var name = 'p21-' + Date.now(); predBox.innerHTML = '';
    predBox.append(el('p.prose', 'Aggiungendo sempre più alberi piccoli, la loss su training continua a diminuire. La loss su dati nuovi deve fare lo stesso?'),
      el('div.choices', { role: 'radiogroup' }, [
        ['maybe', 'Non necessariamente: può raggiungere un minimo e poi aumentare'],
        ['always', 'Sì: migliorare il training garantisce miglioramento sui dati nuovi'],
        ['constant', 'No: la validazione resta identica in tutti i passi']
      ].map(function (o, i) { return el('div.choice', el('input', { type: 'radio', id: name + i, name: name, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1])); }))); 
    feedbackBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(feedbackBox);
  }
  function updateFeedback() {
    if (!feedbackBox || !S.pred) { if (feedbackBox) feedbackBox.hidden = true; return; }
    feedbackBox.hidden = false;
    feedbackBox.textContent = (S.pred === 'maybe' ? '✓ ' : '✗ ') + 'Ogni passo segue una direzione appresa sul training. Il test indipendente e la validazione misurano la generalizzazione, che non è garantita. In questa realizzazione il minimo della loss di validazione è al passo ' + bestStep() + ' (su ' + S.k + ' passi eseguiti).';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Il <strong>gradient boosting</strong> costruisce una sequenza di funzioni. Ogni albero approssima la direzione di discesa della perdita nello spazio delle funzioni, e il learning rate riduce il contributo di ogni passo. Non si tratta di alberi indipendenti aggregati per voto, come in bagging e random forest.</p>' +
      '<p>La curva blu scuro è la funzione generatrice (o probabilità condizionata nel caso binario), quella color accento è la stima corrente. Il test resta <strong>completamente esterno</strong> alla selezione di B*: si sceglie B* dalla validazione e solo poi si valuta il test.</p>' +
      '<p>La riduzione della perdita di training non implica una riduzione monotona della perdita di validazione; il minimo osservato in validazione è una stima dipendente dal campione, non una garanzia di ottimalità. Il codice del laboratorio illustra boosting di primo ordine, <em>non</em> XGBoost o aggiornamenti di Newton.</p>';
  }
  var THEORY = {
    base: function () { return el('div.prose', { html:
      '<h3>Perché un insieme di alberi?</h3><p>Un albero di regressione produce una funzione a gradini. Nel boosting si parte da una costante F₀ e si aggiungono alberi piccoli in sequenza: ciascuno cerca di correggere gli errori ancora presenti. A differenza del bagging, ogni nuovo albero dipende dai precedenti.</p>' +
      '<div class="eq" data-tex="F_m(x)=F_{m-1}(x)+\\nu h_m(x),\\qquad 0<\\nu\\le 1"></div>' +
      '<h3>Regressione: residui</h3><p>Con perdita quadratica media, la direzione di discesa corrisponde a yᵢ−F(xᵢ). L’albero hₘ approssima questi residui per minimi quadrati. La soluzione iniziale è la media di training.</p>' +
      '<h3>Classificazione: pseudo-residui</h3><p>Per una risposta 0/1 si lavora sulla scala del logit: p(x)=expit(F(x)). Con la devianza binomiale, la direzione negativa del gradiente è yᵢ−p(xᵢ). I valori di foglia sono medie di questi pseudo-residui: non si applica qui l’aggiornamento di Newton.</p>' +
      '<h3>Validazione e arresto anticipato</h3><p>Il numero di alberi è una misura della complessità. Si sceglie B* minimizzando la perdita su validazione, usando soltanto training per adattare gli alberi. L’insieme test, mai consultato nella scelta, serve a valutare l’errore di generalizzazione.</p>' +
      '<div class="callout warn">Ridurre il learning rate può richiedere più alberi: confrontare configurazioni con lo stesso B non equivale a confrontarle a parità di grado di adattamento.</div>' }); },
    adv: function () { return el('div.prose', { html:
      '<h3>Gradient boosting come discesa nel funzionale</h3><p>Si cerca una funzione F che minimizzi la perdita empirica L(F)=n⁻¹Σᵢℓ(yᵢ,F(xᵢ)). Al passo m si valutano i gradienti negativi nei punti di training e si proiettano approssimativamente nello spazio degli alberi di regressione con profondità limitata.</p>' +
      '<div class="eq" data-tex="r_{im}=-\\left.\\frac{\\partial\\ell(y_i,F)}{\\partial F}\\right|_{F=F_{m-1}(x_i)},\\qquad h_m=\\arg\\min_{h\\in\\mathcal H}\\sum_i(r_{im}-h(x_i))^2"></div>' +
      '<h3>Perdita quadratica e logistica</h3><p>Per ℓ=(y−F)²/2 si ha r=y−F. Per ℓ(y,F)=log(1+exp F)−yF si ha r=y−expit(F). L’implementazione esegue un passo funzionale di primo ordine; valori delle foglie, line search e regolarizzazioni di altri sistemi (GBM, XGBoost, LightGBM) possono essere differenti.</p>' +
      '<h3>Alberi CART di regressione</h3><p>Una partizione è scelta minimizzando Σ(yᵢ−media del nodo)²; gli split sono nei punti medi fra x distinti, le foglie hanno almeno minLeaf osservazioni, e si accetta soltanto una riduzione della SSE positiva. L’algoritmo è greedy: non garantisce il miglior albero globale.</p>' +
      '<h3>Regolarizzazione e ottimizzazione</h3><p>Shrinkage ν, profondità, dimensione minima delle foglie e numero di iterazioni controllano capacità e velocità di apprendimento. Con loss logistica e passo troppo grande si possono ottenere oscillazioni o un adattamento eccessivo; con passo piccolo la convergenza può essere lenta.</p>' +
      '<h3>Inferenza e generalizzazione</h3><p>Gli alberi e la selezione iterativa rendono non banale derivare errori standard ordinari per F̂(x). Le curve di loss del test sono stime su un campione finito e non sono una proprietà esatta. L’early stopping scelto su un unico validation set ha variabilità: per una stima meno distorta della prestazione dopo tuning occorre un test indipendente o una validazione esterna/nidificata.</p>' +
      '<h3>Bagging, random forest e boosting</h3><p>Bagging e random forest aggregano alberi bootstrap resi meno correlati; nel boosting gli alberi sono adattati sequenzialmente in modo dipendente. La riduzione di varianza spiega un aspetto delle foreste, la riduzione iterativa di una perdita spiega il boosting. Non esiste una graduatoria universale fra le famiglie.</p>' }); }
  };
  function codeR() {
    var s = S, model = MODELS[s.sc];
    return [
      '# StatAtlas · Lab 21 — Gradient boosting didattico (R0 dati, R2 regole CART)',
      '# Regole identiche al browser per le foglie e gli split; non eguaglianza con gbm/xgboost.',
      'RNGkind("Mersenne-Twister", "Inversion", "Rejection"); set.seed(' + s.seed + ')',
      'n <- ' + s.n + '; nval <- ' + NVAL + '; ntest <- ' + NTEST,
      'B <- ' + s.B + '; eta <- ' + s.eta + '; maxDepth <- ' + s.depth + '; minLeaf <- ' + s.minLeaf,
      'family <- "' + s.family + '"; sigma <- ' + s.sigma,
      'f <- function(x) ' + model.r,
      'xtr <- runif(n, -2, 2); xva <- runif(nval, -2, 2); xte <- runif(ntest, -2, 2)',
      'ygen <- function(x) if (family == "binary") as.integer(runif(length(x)) < f(x)) else f(x) + sigma * rnorm(length(x))',
      'ytr <- ygen(xtr); yva <- ygen(xva); yte <- ygen(xte)',
      'xgrid <- seq(-2, 2, length.out = ' + NG + ')',
      'sigmoid <- function(z) ifelse(z >= 0, 1 / (1 + exp(-z)), exp(z) / (1 + exp(z)))',
      'risk <- function(y, v) if (family == "binary") mean(pmax(v, 0) + log1p(exp(-abs(v))) - y * v) else mean((y - v)^2)',
      'response <- function(v) if (family == "binary") sigmoid(v) else v',
      'tree1D <- function(x, y, maxDepth, minLeaf) {',
      '  ord <- order(x, seq_along(x))',
      '  grow <- function(ids, depth) {',
      '    n <- length(ids); z <- y[ids]; sm <- sum(z); sq <- sum(z*z); parent <- sq - sm*sm/n',
      '    nd <- list(leaf = TRUE, value = sm/n, n = n, depth = depth)',
      '    if (depth >= maxDepth || n < 2*minLeaf || parent < 1e-12) return(nd)',
      '    ls <- 0; lq <- 0; best <- parent - 1e-10; pos <- 0L; split <- NA_real_',
      '    for (i in seq_len(n-1L)) {',
      '      r <- y[ids[i]]; nl <- i; nr <- n-i; ls <- ls+r; lq <- lq+r*r',
      '      if (nl < minLeaf || nr < minLeaf || !(x[ids[i]] < x[ids[i+1L]])) next',
      '      rss <- lq-ls*ls/nl + (sq-lq) - (sm-ls)^2/nr',
      '      if (rss < best) { best <- rss; pos <- i; split <- (x[ids[i]] + x[ids[i+1L]])/2 }',
      '    }',
      '    if (!pos) return(nd)',
      '    nd$leaf <- FALSE; nd$thr <- split',
      '    nd$left <- grow(ids[seq_len(pos)], depth+1L)',
      '    nd$right <- grow(ids[(pos+1L):n], depth+1L)',
      '    nd',
      '  }',
      '  grow(ord, 0L)',
      '}',
      'predictTree <- function(nd, x) {',
      '  vapply(x, function(xx) { p <- nd; while (!p$leaf) p <- if (xx < p$thr) p$left else p$right; p$value }, 0.0)',
      '}',
      'F0 <- if (family == "binary") { p <- max(1e-6, min(1-1e-6, mean(ytr))); log(p/(1-p)) } else mean(ytr)',
      'Ftr <- rep(F0, n); Fva <- rep(F0, nval); Fte <- rep(F0, ntest); Fgrid <- rep(F0, length(xgrid))',
      'hist <- data.frame(passo = 0L, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte))',
      'alberi <- vector("list", B)',
      'for (b in seq_len(B)) {',
      '  residui <- ytr - response(Ftr)',
      '  t <- tree1D(xtr, residui, maxDepth, minLeaf); alberi[[b]] <- t',
      '  Ftr <- Ftr + eta * predictTree(t, xtr)',
      '  Fva <- Fva + eta * predictTree(t, xva)',
      '  Fte <- Fte + eta * predictTree(t, xte)',
      '  Fgrid <- Fgrid + eta * predictTree(t, xgrid)',
      '  hist <- rbind(hist, data.frame(passo = b, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte)))',
      '}',
      'best <- which.min(hist$validazione) - 1L',
      'cat("Miglior passo validazione:", best, "· loss:", hist$validazione[best + 1L], "\\n")',
      'print(tail(hist, 1)); print(hist[best + 1L, ])',
      'matplot(hist$passo, hist[, c("training", "validazione", "test")], type = "l", lty = c(1,2,3),',
      '        col = c("#327EAA", "#CE8747", "#51846D"), xlab = "Alberi", ylab = if (family == "binary") "Log loss" else "MSE")',
      'legend("topright", legend = c("training", "validazione", "test"), col = c("#327EAA", "#CE8747", "#51846D"), lty = c(1,2,3), bty = "n")',
      '# Fine: confrontare con gbm/xgboost richiede specificare obiettivo e update di foglia (R3).',
      ''
    ].join('\n');
  }
  function restart() { run.stop(); S = newState(S); buildControls(); buildPrediction(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (full || !run.running || run.frame % 2 === 0) { drawFit(); drawLoss(); }
    if (full || !run.running || run.frame % 4 === 0) { drawGrad(); drawStages(); updateTable(); }
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (label, key, vals, disp) { return el('label.field', el('span', label), el('select', { onchange: function () { S[key] = +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, disp ? disp(v) : String(v)); }))); };
    ctrlBox.append(
      el('label.field', el('span', 'Scenario'), el('select', { onchange: function () { S.sc = this.value; restart(); } }, Object.keys(MODELS).map(function (id) { return el('option', { value: id, selected: id === S.sc }, MODELS[id].label); }))),
      SA.ui.slider('Learning rate ν', { min: 0.02, max: 0.4, step: 0.02, value: S.eta, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.eta = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n (training)', 'n', [80, 120, 200]), sel('Profondità', 'depth', [1, 2, 3]),
        sel('Min. osservazioni foglia', 'minLeaf', [5, 8, 15, 25]), sel('Alberi B', 'B', [30, 60, 100, 150]),
        sel('Rumore σ (solo regressione)', 'sigma', [0.2, 0.4, 0.7]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', min: 1, value: S.seed, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      el('label.field', el('span', el('input', { type: 'checkbox', checked: S.showBest, onchange: function () { S.showBest = this.checked; drawFit(); drawStages(); } }), ' Mostra la stima al minimo di validazione')));
    run.controls('Aggiungi un albero').forEach(function (n) { ctrlBox.appendChild(n); });
  }
  SA.registerLab('boost', {
    challengeEvidence: function () {
      return { label: 'Loss di validazione del boosting', value: S && S.k && S.hist[S.k] ? S.hist[S.k].va : NaN,
        bounds: [0, Infinity], design: 'paired-trajectory', iteration: S && S.k,
        // The generating sample is replayed from the same seed after a depth edit.
        dataKey: S ? JSON.stringify([S.sc,S.n,S.sigma,S.seed]) : '' };
    },
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ coop: true, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Gradient boosting', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num), el('h1', info.lab.title),
        el('p.lede', 'Un albero corregge gli errori del precedente: osserva come una sequenza di alberi di regressione segue i gradienti della perdita, e quando la validazione suggerisce di fermarsi.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.append(el('p.question', 'Perché aggiungere piccoli alberi in sequenza può migliorare la previsione, e perché non conviene aggiungerne un numero illimitato?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Un nuovo albero segue i pseudo-residui');
      ctrlBox = el('div.panel.controls'); figFit = el('div'); figGrad = el('div'); figLoss = el('div'); figStages = el('div');
      s3.body.append(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Dati, funzione vera e stima iterativa'), el('div.legend', el('span', SA.plot.legendSwatch(SA.theme().c_theory, '7 4'), 'verità'), el('span', SA.plot.legendSwatch(SA.theme().accent, null), 'boosting'))), figFit),
        el('div.fig', el('div.fig-title', el('h3', 'Pseudo-residui e prossimo albero'), el('span.muted', 'direzione di discesa locale')), figGrad),
        el('div.fig', el('div.fig-title', el('h3', 'Evoluzione delle perdite'), el('div.legend', el('span', SA.plot.legendSwatch(SA.theme().c1, null), 'training'), el('span', SA.plot.legendSwatch(SA.theme().c2, '8 4'), 'validazione'), el('span', SA.plot.legendSwatch(SA.theme().c3, '3 4'), 'test'))), figLoss),
        el('div.fig', el('div.fig-title', el('h3', 'La funzione cresce un albero alla volta')), figStages),
        el('div.toolbar',
          SA.ui.button('Training CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.download('statatlas_lab21_boost_dati.csv', SA.ui.csv([['x', 'y', 'insieme']].concat(S.tr.x.map(function (x, i) { return [x, S.tr.y[i], 'training']; }), S.va.x.map(function (x, i) { return [x, S.va.y[i], 'validazione']; }), S.te.x.map(function (x, i) { return [x, S.te.y[i], 'test']; }))), 'text/csv'); } }),
          SA.ui.button('Perdite CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.download('statatlas_lab21_boost_loss.csv', SA.ui.csv([['alberi', 'training', 'validazione', 'test']].concat(S.hist.map(function (h, i) { return [i, h.tr, h.va, h.te]; }))), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figFit.querySelector('svg'), figLoss.querySelector('svg')], 'statatlas_lab21_boost.png', ['Gradient boosting', MODELS[S.sc].label + ' · eta = ' + S.eta + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Riferimento / procedura'), el('th', 'Stima / simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' proprietà algoritmica'), el('span', SA.ui.badge('approx'), ' selezione dalla validazione')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Derivazione del gradient boosting e confronto con random forest')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi dati e stesse regole per gli alberi'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab21_gradient_boosting.R');
      s6.body.append(el('p.prose', 'Riproducibilità: R0 per i dati simulati e R2 per l’implementazione didattica degli alberi di regressione e degli update. I pacchetti gbm/xgboost sono confronti R3 e non devono essere considerati numericamente equivalenti. Non richiede librerie R aggiuntive.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); interpretation(); render(true); run.refresh(); document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { render(true); }
  });
})();
