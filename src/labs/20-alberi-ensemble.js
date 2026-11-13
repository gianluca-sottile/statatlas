/* StatAtlas · Lab 20 — Alberi, bagging e random forest.
 * x ~ U(−2, 2)^p (2 variabili informative + q di rumore); y = 1{g(x) > 0} scambiata con probabilità ε:
 * la regola di Bayes è sign g(x) e l'errore di Bayes vale esattamente ε. CART con Gini (SA.ml.tree), stesse regole
 * dello script R. A ogni passo: un albero di bagging (bootstrap, tutte le p variabili) e uno di foresta casuale
 * (bootstrap, mtry variabili estratte a ogni nodo), nell'ordine del generatore di R. */
(function () {
  var el, S, NT = 1000, NG = 50, R2 = 8 / Math.PI;
  var SC = {
    circle: { label: 'Cerchio (frontiera curva)', g: function (x) { return R2 - x[0] * x[0] - x[1] * x[1]; }, r: '8 / pi - X[, 1]^2 - X[, 2]^2' },
    diag: { label: 'Diagonale (difficile per gli split paralleli agli assi)', g: function (x) { return x[0] + x[1]; }, r: 'X[, 1] + X[, 2]' }
  };
  function gen(g, n) {
    var X = [], y = [], i, j, p = S.p;
    for (i = 0; i < n; i++) { var x = []; for (j = 0; j < p; j++) x.push(-2 + 4 * g.unif()); X.push(x); }
    for (i = 0; i < n; i++) y.push(((SC[S.sc].g(X[i]) > 0) !== (g.unif() < S.eps)) ? 1 : 0);
    return { X: X, y: y };
  }
  function newState(prev) {
    var s = { sc: 'circle', n: 200, eps: 0.1, q: 3, maxDepth: 30, minLeaf: 1, B: 100, mtry: 0, seed: 2026, show: 'rf', pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.p = 2 + s.q; if (!s.mtry || s.mtry > s.p) s.mtry = Math.max(1, Math.floor(Math.sqrt(s.p)));
    var S0 = S; S = s;
    s.rng = new SA.RRNG(s.seed); s.tr = gen(s.rng, s.n); s.te = gen(s.rng, NT);
    var all = []; for (var i = 0; i < s.n; i++) all.push(i);
    s.cart = SA.ml.tree(s.tr.X, s.tr.y, all, { maxDepth: s.maxDepth, minLeaf: s.minLeaf, mtry: s.p });
    s.cartErr = 0; for (i = 0; i < NT; i++) if (SA.ml.treePredict(s.cart, s.te.X[i]) !== s.te.y[i]) s.cartErr++; s.cartErr /= NT;
    s.k = 0; s.ok = true;
    s.M = ['bag', 'rf'].map(function () { return { trees: [], vt: new Uint16Array(NT), vo: new Uint16Array(s.n), co: new Uint16Array(s.n), root: new Uint32Array(s.p), teErr: [], oobErr: [] }; });
    S = S0; return s;
  }
  function grow(M, mtry) {
    var g = S.rng, n = S.n, idx = SA.rs.boot(g, n).map(function (k) { return k - 1; }), inb = new Uint8Array(n), i;
    idx.forEach(function (k) { inb[k] = 1; });
    var t = SA.ml.tree(S.tr.X, S.tr.y, idx, { maxDepth: S.maxDepth, minLeaf: S.minLeaf, mtry: mtry, g: g });
    t.forEach(function (nd) { if (!nd.leaf && !(nd.dec > 0)) S.ok = false; if (nd.leaf && nd.n < S.minLeaf) S.ok = false; });
    M.trees.push(t); if (!t[0].leaf) M.root[t[0].j]++;
    for (i = 0; i < NT; i++) M.vt[i] += SA.ml.treePredict(t, S.te.X[i]);
    for (i = 0; i < n; i++) if (!inb[i]) { M.vo[i] += SA.ml.treePredict(t, S.tr.X[i]); M.co[i]++; } // OOB: solo alberi che non hanno visto i
    var b = M.trees.length, e = 0, eo = 0, no = 0;
    for (i = 0; i < NT; i++) if ((2 * M.vt[i] > b ? 1 : 0) !== S.te.y[i]) e++;
    for (i = 0; i < n; i++) if (M.co[i]) { no++; if ((2 * M.vo[i] > M.co[i] ? 1 : 0) !== S.tr.y[i]) eo++; }
    M.teErr.push(e / NT); M.oobErr.push(no ? eo / no : NaN);
  }
  function step() { if (S.k >= S.B) return false; grow(S.M[0], S.p); grow(S.M[1], S.mtry); S.k++; return true; }
  function agreement(M) { // quota media di coppie di alberi concordi sui punti di test
    var b = M.trees.length, s = 0; if (b < 2) return NaN;
    for (var i = 0; i < NT; i++) { var v = M.vt[i]; s += (v * (v - 1) + (b - v) * (b - v - 1)) / (b * (b - 1)); }
    return s / NT;
  }
  function vname(j) { return 'x' + (j + 1); }

  /* ---------- grafici ---------- */
  var pA = [], figB1, figB2, figC, figD, legA, legC, legD, gridCache = null;
  function gridOf(predict) {
    var c = new Uint8Array(NG * NG), x = new Array(S.p).fill(0);
    for (var i = 0; i < NG; i++) for (var j = 0; j < NG; j++) { x[0] = -2 + 4 * (i + 0.5) / NG; x[1] = -2 + 4 * (j + 0.5) / NG; c[i * NG + j] = predict(x); }
    return c;
  }
  function drawPart(box, cells, title) {
    var P = SA.plot, F = P.frame(box, { W: 340, H: 330, m: { t: 28, r: 10, b: 38, l: 40 }, x: [-2, 2], y: [-2, 2], xlabel: 'x₁', ylabel: 'x₂', label: title });
    var t = F.t, g = F.g, cw = (F.x(2) - F.x(-2)) / NG, d0 = '', d1 = '';
    for (var i = 0; i < NG; i++) for (var j = 0; j < NG; j++) { var r = 'M' + (F.x(-2) + i * cw).toFixed(1) + ',' + (F.y(-2) - (j + 1) * cw).toFixed(1) + 'h' + (cw + 0.3).toFixed(1) + 'v' + (cw + 0.3).toFixed(1) + 'h' + (-cw - 0.3).toFixed(1) + 'z'; if (cells[i * NG + j]) d1 += r; else d0 += r; }
    P.svg('path', { d: d0, fill: t.c1, 'fill-opacity': 0.16 }, g); P.svg('path', { d: d1, fill: t.c2, 'fill-opacity': 0.16 }, g);
    if (S.sc === 'circle') P.svg('circle', { cx: F.x(0), cy: F.y(0), r: F.x(Math.sqrt(R2)) - F.x(0), fill: 'none', stroke: t.c_theory, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }, g);
    else P.svg('line', { x1: F.x(-2), y1: F.y(2), x2: F.x(2), y2: F.y(-2), stroke: t.c_theory, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }, g);
    var X = S.tr.X, y = S.tr.y;
    P.dots(g, X.filter(function (x, k) { return !y[k]; }).map(function (x) { return [F.x(x[0]), F.y(x[1])]; }), 2.3, t.c1, 0.7);
    P.dots(g, X.filter(function (x, k) { return y[k]; }).map(function (x) { return [F.x(x[0]), F.y(x[1])]; }), 2.3, t.c2, 0.7);
    P.text(g, F.m.l + 2, 18, title, { fill: t.ink, 'font-size': 13, 'font-weight': 700 });
  }
  function drawParts(full) {
    var M = S.M[S.show === 'bag' ? 0 : 1], last = S.M[0].trees[S.M[0].trees.length - 1];
    if (!S.cartGrid) S.cartGrid = gridOf(function (x) { return SA.ml.treePredict(S.cart, x); });
    drawPart(pA[0], S.cartGrid, 'Un albero (tutti i dati)');
    drawPart(pA[1], gridOf(function (x) { return SA.ml.treePredict(last, x); }), 'Albero bootstrap n. ' + S.k);
    if (full || !gridCache || run.frame % 5 === 0) { var b = M.trees.length; gridCache = gridOf(function (x) { var v = 0; for (var k = 0; k < b; k++) v += SA.ml.treePredict(M.trees[k], x); return 2 * v > b ? 1 : 0; }); }
    drawPart(pA[2], gridCache, (S.show === 'bag' ? 'Bagging' : 'Foresta casuale') + ', ' + M.trees.length + ' alberi');
  }
  function drawTree(box, nodes, title) {
    var P = SA.plot, t = SA.theme(), W = 720, H = 210, DMAX = 3, svg;
    box.innerHTML = ''; svg = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': title, 'font-family': t.sans, 'font-size': 11 }, box);
    P.text(svg, 8, 16, title, { fill: t.ink, 'font-size': 13, 'font-weight': 700 });
    var nLeaves = nodes.filter(function (nd) { return nd.leaf; }).length, nSplit = nodes.length - nLeaves;
    P.text(svg, W - 8, 16, nSplit + ' divisioni · ' + nLeaves + ' foglie · profondità ' + Math.max.apply(null, nodes.map(function (nd) { return nd.depth; })), { 'text-anchor': 'end', fill: t.ink_3 });
    (function draw(k, x0, x1, d, px, py) {
      var nd = nodes[k], cx = (x0 + x1) / 2, cy = 40 + d * 50;
      if (px != null) P.svg('line', { x1: px, y1: py + 11, x2: cx, y2: cy - 11, stroke: t.rule_2, 'stroke-width': 1.3 }, svg);
      var cut = !nd.leaf && d >= DMAX, lab = nd.leaf ? 'classe ' + nd.cls + ' · ' + nd.n : cut ? '… (' + nd.n + ')' : vname(nd.j) + ' < ' + SA.fmt(nd.thr, 2);
      var w = Math.min(x1 - x0 - 4, nd.leaf || cut ? 76 : 90);
      P.svg('rect', { x: cx - w / 2, y: cy - 11, width: w, height: 22, rx: 5, fill: nd.leaf ? (nd.cls ? t.c2 : t.c1) : t.card, 'fill-opacity': nd.leaf ? 0.22 : 1, stroke: nd.leaf ? 'none' : (nd.j >= 2 ? t.accent : t.rule_2) }, svg);
      P.text(svg, cx, cy + 4, lab, { 'text-anchor': 'middle', fill: nd.j >= 2 && !nd.leaf && !cut ? t.accent : t.ink, 'font-size': w < 60 ? 9 : 11 });
      if (!nd.leaf && !cut) { draw(nd.l, x0, cx, d + 1, cx, cy); draw(nd.r, cx, x1, d + 1, cx, cy); }
    })(0, 0, W, 0, null, null);
  }
  function drawErr() {
    var P = SA.plot, b = Math.max(2, S.k), all = [S.cartErr, S.eps];
    S.M.forEach(function (M) { all = all.concat(M.teErr, M.oobErr.filter(isFinite)); });
    var top = Math.min(0.6, +(1.15 * Math.max.apply(null, all)).toPrecision(2));
    var F = P.frame(figC, { W: 720, H: 280, x: [1, Math.max(2, S.B)], y: [0, top], xlabel: 'numero di alberi', ylabel: 'tasso di errore', label: 'Errore in funzione del numero di alberi' });
    var t = F.t, g = F.g, hl = function (v, c, dash, txt) { P.svg('line', { x1: F.x(1), x2: F.x(S.B), y1: F.y(v), y2: F.y(v), stroke: c, 'stroke-width': 1.8, 'stroke-dasharray': dash }, g); P.text(g, F.x(S.B) - 4, F.y(v) - 5, txt, { 'text-anchor': 'end', fill: c, 'font-size': 11.5 }); };
    hl(S.eps, t.c_theory, '7 4', 'errore di Bayes ε = ' + SA.fmt(S.eps, 2)); hl(S.cartErr, t.ink_3, '2 3', 'un solo albero ' + SA.fmt(S.cartErr, 3));
    [[S.M[0], t.c1], [S.M[1], t.c2]].forEach(function (q) {
      var M = q[0]; if (!M.teErr.length) return;
      P.svg('path', { d: P.path(M.teErr.map(function (e, i) { return [F.x(i + 1), F.y(Math.min(top, e))]; })), fill: 'none', stroke: q[1], 'stroke-width': 2.6 }, g);
      var oo = []; M.oobErr.forEach(function (e, i) { if (isFinite(e)) oo.push([F.x(i + 1), F.y(Math.min(top, e))]); });
      if (oo.length > 1) P.svg('path', { d: P.path(oo), fill: 'none', stroke: q[1], 'stroke-width': 1.6, 'stroke-dasharray': '6 3' }, g);
    });
  }
  function drawRoot() {
    var P = SA.plot, b = Math.max(1, S.k), mx = 0.1, j;
    for (j = 0; j < S.p; j++) mx = Math.max(mx, S.M[0].root[j] / b, S.M[1].root[j] / b);
    var F = P.frame(figD, { W: 720, H: 210, x: [0.5, S.p + 0.5], y: [0, +Math.min(1, 1.15 * mx).toPrecision(2)], xlabel: 'variabile della prima divisione (x₁, x₂ informative; le altre rumore)', ylabel: 'frequenza', label: 'Variabile della radice negli alberi' });
    var t = F.t, w = (F.x(1) - F.x(0)) * 0.36;
    for (j = 0; j < S.p; j++) {
      P.svg('rect', { x: F.x(j + 1) - w, width: w, y: F.y(S.M[0].root[j] / b), height: F.y(0) - F.y(S.M[0].root[j] / b), fill: t.c1, 'fill-opacity': 0.7 }, F.g);
      P.svg('rect', { x: F.x(j + 1), width: w, y: F.y(S.M[1].root[j] / b), height: F.y(0) - F.y(S.M[1].root[j] / b), fill: t.c2, 'fill-opacity': 0.7 }, F.g);
    }
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch, box = function (c, o) { return el('i', { style: 'display:inline-block;width:14px;height:10px;border-radius:2px;background:' + c + ';opacity:' + o }); };
    legA.innerHTML = ''; legC.innerHTML = ''; legD.innerHTML = '';
    legA.append(el('span', box(t.c1, 0.4), 'classe 0'), el('span', box(t.c2, 0.4), 'classe 1'), el('span', sw(t.c_theory, '6 4'), 'frontiera di Bayes'), S.q ? el('span.muted', 'variabili di rumore fissate a 0') : null);
    legC.append(el('span', sw(t.c1, null), 'bagging · test'), el('span', sw(t.c1, '6 3'), 'bagging · OOB'), el('span', sw(t.c2, null), 'foresta · test'), el('span', sw(t.c2, '6 3'), 'foresta · OOB'));
    legD.append(el('span', box(t.c1, 0.8), 'bagging'), el('span', box(t.c2, 0.8), 'foresta casuale (mtry = ' + S.mtry + ')'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, W = SA.ml.wilson, k = S.k, ci = function (e) { var c = W(Math.round(e * NT), NT); return fmt(e, 3) + ' [' + fmt(c[0], 3) + '; ' + fmt(c[1], 3) + ']'; };
    var last = function (a) { return a.length ? a[a.length - 1] : NaN; }, Bg = S.M[0], Rf = S.M[1];
    var noise = 0; for (var j = 2; j < S.p; j++) noise += Rf.root[j];
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Errore di Bayes'), el('td', fmt(S.eps, 3)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Un solo albero: errore sul test (IC di Wilson 95%)'), el('td', '≥ ε'), el('td', ci(S.cartErr)), el('td', b('approx'))),
      el('tr', el('td', 'Bagging, ' + k + ' alberi: test · OOB'), el('td', '≥ ε'), el('td', k ? ci(last(Bg.teErr)) + ' · OOB ' + fmt(last(Bg.oobErr), 3) : '—'), el('td', b('approx'))),
      el('tr', el('td', 'Foresta casuale, ' + k + ' alberi: test · OOB'), el('td', '≥ ε'), el('td', k ? ci(last(Rf.teErr)) + ' · OOB ' + fmt(last(Rf.oobErr), 3) : '—'), el('td', b('approx'))),
      el('tr', el('td', 'Accordo medio tra coppie di alberi (test): bagging · foresta'), el('td', 'minore = alberi meno correlati'), el('td', k > 1 ? fmt(agreement(Bg), 3) + ' · ' + fmt(agreement(Rf), 3) : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Foresta: alberi con una variabile di rumore nella radice'), el('td', S.q ? 'possibile solo se mtry < p' : 'nessuna variabile di rumore'), el('td', k ? fmt(100 * noise / k, 1) + '%' : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Controlli degli alberi'), el('td', 'riduzione d’impurità > 0, foglie ≥ min-leaf, OOB solo da alberi che non hanno visto il punto'), el('td', S.ok ? '✓ verificato su ' + 2 * k + ' alberi' : '✗ violazione'), el('td', b('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'alberi per metodo')),
      el('div.kpi', el('b', 'p = ' + S.p + ' · mtry = ' + S.mtry), el('span', 'predittori e candidati a ogni divisione')),
      el('div.kpi', el('b', k ? fmt(S.cartErr - last(Rf.teErr), 3) : '—'), el('span', 'errore guadagnato dalla foresta rispetto a un albero')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p20-' + Date.now();
    predBox.append(el('p.prose', 'Un albero profondo stimato su tutti i dati commette un certo errore sul test. Che cosa succede se si fa votare a maggioranza cento alberi, ciascuno stimato su un campione bootstrap?'),
      el('div.choices', { role: 'radiogroup' }, [['lower', 'L’errore scende, ma non sotto l’errore di Bayes'], ['same', 'Resta lo stesso: ogni albero è altrettanto buono'], ['zero', 'Scende fino a zero aumentando gli alberi']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    var e = S.M[0].teErr; fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'lower' ? '✓ ' : '✗ ') + 'Ogni albero bootstrap è instabile quanto quello originale (spesso un po’ peggiore), ma i loro errori non coincidono: la media dei voti ne riduce la varianza. Qui un albero sbaglia ' + SA.fmt(S.cartErr, 3) + ', il bagging ' + (e.length ? SA.fmt(e[e.length - 1], 3) : '—') + '. L’errore di Bayes ε = ' + SA.fmt(S.eps, 2) + ' resta un limite invalicabile, e la distorsione degli alberi (split paralleli agli assi) non si cancella.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Un albero profondo ha <strong>distorsione bassa e varianza alta</strong>: piccole variazioni dei dati cambiano la prima divisione e quindi tutto ciò che sta sotto. Confronta l’albero stimato su tutti i dati con quello dell’ultimo campione bootstrap: forme e soglie sono diverse, anche se i dati sono quasi gli stessi.</p>' +
      '<p>Il <strong>bagging</strong> media molti alberi bootstrap: la varianza della media di B previsioni con correlazione ρ è ρσ² + (1 − ρ)σ²/B, quindi aggiungere alberi non fa mai danno ma il guadagno si ferma a ρσ². La <strong>foresta casuale</strong> abbassa ρ scegliendo a caso mtry variabili candidate a ogni nodo: gli alberi si somigliano meno (accordo più basso), e la media funziona meglio.</p>' +
      '<p class="muted">L’errore <strong>out-of-bag</strong> usa, per ogni osservazione, solo gli alberi che non l’hanno vista (circa il 37%): è una stima dell’errore di previsione gratuita e simile a quella sul test, senza bisogno di separare dati.</p>';
  }
  function codeR() {
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 20 — Alberi, bagging e random forest',
      '# R0: stessi dati e stessi campioni bootstrap di StatAtlas (stesso seed, R ≥ 3.6).',
      '# R2: stesso CART didattico (Gini, soglie nei punti medi, prima variabile e soglia più piccola a parità),',
      '#     stessa estrazione di mtry variabili a ogni nodo: stessi alberi e stessi errori.',
      '# R3: rpart e ranger usano regole diverse (potatura, tie, campionamento): confronto di metodo, non stessi numeri.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; n_test <- ' + NT + '; p <- ' + S.p + '; eps <- ' + S.eps + '; mtry <- ' + S.mtry + '; B <- ' + S.B,
      'prof_max <- ' + S.maxDepth + '; min_foglia <- ' + S.minLeaf, 'confine <- function(X) ' + SC[S.sc].r, '',
      'genera <- function(n) {', '  X <- matrix(runif(n * p, -2, 2), ncol = p, byrow = TRUE)', '  y <- as.integer((confine(X) > 0) != (runif(n) < eps))   # etichette scambiate con probabilità eps', '  list(X = X, y = y)', '}',
      'tr <- genera(n); te <- genera(n_test)', '',
      '# CART per due classi: criterio G = n * Gini pesato dei figli, da minimizzare', 'cresci <- function(X, y, idx, mtry, prof = 0) {',
      '  yy <- y[idx]; m <- length(idx); c1 <- sum(yy); c0 <- m - c1', '  foglia <- list(foglia = TRUE, classe = as.integer(c1 > c0), n = m)',
      '  if (prof >= prof_max || m < 2 * min_foglia || c0 == 0 || c1 == 0) return(foglia)',
      '  vars <- if (mtry < p) sample(p, mtry) else seq_len(p)', '  G0 <- m - (c0^2 + c1^2) / m; best <- G0 - 1e-10; bj <- 0',
      '  for (j in vars) {', '    o <- order(X[idx, j]); v <- X[idx, j][o]; l1 <- cumsum(yy[o])[-m]',
      '    nl <- seq_len(m - 1); nr <- m - nl; l0 <- nl - l1; r1 <- c1 - l1; r0 <- nr - r1',
      '    G <- nl - (l0^2 + l1^2) / nl + nr - (r0^2 + r1^2) / nr', '    ok <- which(v[-m] < v[-1] & nl >= min_foglia & nr >= min_foglia)',
      '    if (length(ok)) { i <- ok[which.min(G[ok])]; if (G[i] < best) { best <- G[i]; bj <- j; soglia <- (v[i] + v[i + 1]) / 2 } }', '  }',
      '  if (bj == 0) return(foglia)', '  sx <- X[idx, bj] < soglia',
      '  list(foglia = FALSE, j = bj, soglia = soglia, sx = cresci(X, y, idx[sx], mtry, prof + 1), dx = cresci(X, y, idx[!sx], mtry, prof + 1))', '}',
      'prevedi <- function(t, X) {', '  if (t$foglia) return(rep(t$classe, nrow(X)))', '  out <- integer(nrow(X)); sx <- X[, t$j] < t$soglia',
      '  out[sx] <- prevedi(t$sx, X[sx, , drop = FALSE]); out[!sx] <- prevedi(t$dx, X[!sx, , drop = FALSE]); out', '}', '',
      'albero <- cresci(tr$X, tr$y, seq_len(n), mtry = p)', 'errore_albero <- mean(prevedi(albero, te$X) != te$y)', '',
      'metodi <- c(bagging = p, foresta = mtry)', 'voti_te <- matrix(0, n_test, 2); voti_oob <- matrix(0, n, 2); conta_oob <- matrix(0, n, 2)',
      'radice <- matrix(NA, B, 2, dimnames = list(NULL, names(metodi))); traiettoria <- vector("list", B)',
      'for (b in seq_len(B)) {', '  for (k in 1:2) {', '    idx <- sample(n, n, replace = TRUE)                  # campione bootstrap',
      '    t <- cresci(tr$X, tr$y, idx, mtry = metodi[k])', '    if (!t$foglia) radice[b, k] <- t$j',
      '    voti_te[, k] <- voti_te[, k] + prevedi(t, te$X)', '    fuori <- setdiff(seq_len(n), idx)                    # out-of-bag: mai visti da questo albero',
      '    voti_oob[fuori, k] <- voti_oob[fuori, k] + prevedi(t, tr$X[fuori, , drop = FALSE]); conta_oob[fuori, k] <- conta_oob[fuori, k] + 1', '  }',
      '  usati <- conta_oob > 0', '  traiettoria[[b]] <- tibble(alberi = b, metodo = names(metodi),',
      '    test = colMeans((2 * voti_te > b) != te$y),', '    oob = sapply(1:2, \\(k) mean((2 * voti_oob[usati[, k], k] > conta_oob[usati[, k], k]) != tr$y[usati[, k]])))', '}',
      'traiettoria <- bind_rows(traiettoria)', 'traiettoria |> filter(alberi == B)', 'apply(radice, 2, \\(r) table(factor(r, levels = seq_len(p))) / B)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'traiettoria |> pivot_longer(c(test, oob), names_to = "stima", values_to = "errore") |>', '  ggplot(aes(alberi, errore, colour = metodo, linetype = stima)) + geom_line() +',
      '  geom_hline(yintercept = c(eps, errore_albero), linetype = c("dashed", "dotted")) + theme_statatlas()', '',
      '# Confronto di metodo (R3)', '# library(ranger); ranger(y ~ ., data = data.frame(y = factor(tr$y), tr$X), num.trees = B, mtry = mtry)', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Alberi di classificazione</h3><p>Un albero divide lo spazio in rettangoli con domande del tipo x<sub>j</sub> &lt; s. A ogni nodo si sceglie la coppia (j, s) che riduce di più l’impurità di Gini, G(p) = 2p(1 − p), pesata per la numerosità dei figli; nelle foglie si prevede la classe più frequente.</p>' +
        '<h3>Bagging</h3><p>Si stimano B alberi su campioni bootstrap (n estrazioni con reinserimento) e si fa votare la maggioranza. Ogni campione lascia fuori in media (1 − 1/n)ⁿ ≈ 37% delle osservazioni: sono le osservazioni <em>out-of-bag</em>.</p>' +
        '<h3>Foresta casuale</h3><p>Come il bagging, ma a ogni nodo le variabili candidate sono solo mtry estratte a caso (di solito √p). Gli alberi diventano meno simili tra loro.</p>' +
        '<div class="callout warn">L’errore OOB va calcolato per ogni osservazione solo con gli alberi che non l’hanno vista; mescolare alberi che l’hanno usata lo rende ottimista come l’errore di training.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Perché la media aiuta</h3><p>Se B previsioni hanno varianza σ² e correlazione a coppie ρ, la loro media ha varianza ρσ² + (1 − ρ)σ²/B (Breiman, 2001). Il secondo termine sparisce con B; il primo si riduce solo diminuendo ρ: è il ruolo di mtry.</p>' +
        '<h3>Limiti</h3><p>La media non corregge la distorsione: con frontiere oblique (scenario diagonale) gli alberi costruiscono scalinate, e anche la foresta le approssima a gradini. Con molte variabili di rumore e mtry piccolo, molti nodi non trovano variabili utili e la foresta peggiora.</p>' +
        '<h3>Importanza delle variabili</h3><p>Sommando le riduzioni di Gini per variabile su tutti gli alberi, o permutando una variabile nei dati OOB e misurando quanto cresce l’errore, si ottengono misure d’importanza; la prima favorisce le variabili con molte soglie possibili.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { var p0 = S.p; run.stop(); S = newState(S); gridCache = null; step(); legends(); interpretation(); codeBox.refresh(); if (S.p !== p0) buildControls(); render(true); run.refresh(); }
  function render(full) {
    drawParts(full); drawErr();
    if (full || run.frame % 3 === 0 || !run.running) { drawTree(figB1, S.cart, 'Albero stimato su tutti i dati'); drawTree(figB2, S.M[0].trees[S.M[0].trees.length - 1], 'Albero sul campione bootstrap n. ' + S.k + ' (bagging)'); drawRoot(); updateTable(); }
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (lab, key, vals, fmtv) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    var mt = []; for (var m = 1; m <= S.p; m++) mt.push(m);
    ctrlBox.append(
      el('label.field', el('span', 'Frontiera vera'), el('select', { onchange: function () { S.sc = this.value; restart(); } }, Object.keys(SC).map(function (k) { return el('option', { value: k, selected: k === S.sc }, SC[k].label); }))),
      SA.ui.slider('Etichette scambiate ε (errore di Bayes)', { min: 0, max: 0.3, step: 0.05, value: S.eps, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.eps = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n', 'n', [100, 200, 400]), sel('Variabili di rumore', 'q', [0, 3, 8]),
        sel('Profondità massima', 'maxDepth', [2, 4, 6, 30], function (v) { return v === 30 ? 'nessun limite' : String(v); }), sel('Min. per foglia', 'minLeaf', [1, 3, 5, 10]),
        sel('mtry (foresta)', 'mtry', mt, function (v) { return v + (v === S.p ? ' = p (bagging)' : ''); }), sel('Alberi B', 'B', [50, 100, 200, 500]),
        el('label.field', el('span', 'Insieme mostrato'), el('select', { onchange: function () { S.show = this.value; gridCache = null; drawParts(true); } }, [['rf', 'foresta casuale'], ['bag', 'bagging']].map(function (o) { return el('option', { value: o[0], selected: o[0] === S.show }, o[1]); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un albero in più per metodo').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('alberi', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S); gridCache = null;
      run = SA.ui.runner({ speed: 1, coop: true, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); gridCache = null; step(); } });
      var openT = function (l) { SA.ui.openDrawer('Alberi ed ensemble', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Un albero di decisione è facile da leggere e difficile da fidarsi: basta poco per cambiarlo. Farne votare molti, resi diversi apposta, è una delle idee più efficaci della statistica moderna.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Perché un albero è instabile, e perché aggregarne molti migliora la previsione?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Un albero, molti alberi');
      ctrlBox = el('div.panel.controls'); pA = [el('div'), el('div'), el('div')]; figB1 = el('div'); figB2 = el('div'); figC = el('div'); figD = el('div');
      legA = el('div.legend'); legC = el('div.legend'); legD = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Partizioni del piano (x₁, x₂)'), legA), el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px' }, pA[0], pA[1], pA[2])),
        el('div.fig', el('div.fig-title', el('h3', 'Due alberi a confronto (primi tre livelli)'), el('div.legend', el('span.muted', 'in arancio le divisioni su variabili di rumore'))), figB1, figB2),
        el('div.fig', el('div.fig-title', el('h3', 'Errore al crescere del numero di alberi'), legC), figC),
        el('div.fig', el('div.fig-title', el('h3', 'Quanto si somigliano gli alberi: la prima divisione'), legD), figD),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [S.tr.X[0].map(function (v, j) { return vname(j); }).concat('y')]; S.tr.X.forEach(function (x, i) { rows.push(x.concat(S.tr.y[i])); }); SA.ui.download('statatlas_lab20_training.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Errori CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['alberi', 'bag_test', 'bag_oob', 'rf_test', 'rf_oob']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.M[0].teErr[i], S.M[0].oobErr[i], S.M[1].teErr[i], S.M[1].oobErr[i]]); SA.ui.download('statatlas_lab20_errori.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([pA[2].querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab20.png', ['Alberi, bagging e random forest', SC[S.sc].label + ' · n = ' + S.n + ' · p = ' + S.p + ' · mtry = ' + S.mtry + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Valore teorico'), el('th', 'Stima / simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' esatto'), el('span', SA.ui.badge('approx'), ' ' + NT + ' punti di test, intervallo di Wilson'), el('span', SA.ui.badge('mc'), ' Monte Carlo sugli alberi')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Varianza della media, limiti, importanza (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi dati, stessi alberi'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab20_alberi.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati e campioni bootstrap (R0), stesso CART e stessa estrazione delle variabili (R2); ranger e rpart sono un confronto di metodo (R3). Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
