/* StatAtlas · Lab 18 — Validazione e overfitting.
 * Regressione polinomiale di grado d = 0…D su x ~ U(0, 1). Per ogni replica: dati (runif, rnorm), suddivisione
 * training/test con sample(n, n_test), fold con sample(rep_len(1:K, m)) — stesso ordine di R (SA.rs).
 * I modelli di grado crescente sono annidati: una sola ortogonalizzazione per insieme di stima (SA.la.nestedPredict).
 * Err(d) = σ² + media su 200 punti di (f − f̂_d)²: errore di generalizzazione del modello stimato. */
(function () {
  var el, S, DMAX = 12, NG = 200, HB = 30;
  var FUN = {
    sin: { label: 'Sinusoide sin(2πx)', f: function (x) { return Math.sin(2 * Math.PI * x); }, r: 'sin(2 * pi * x)' },
    cubic: { label: 'Polinomio di grado 3 (nella famiglia)', f: function (x) { return 10 * (x - 0.2) * (x - 0.5) * (x - 0.9); }, r: '10 * (x - 0.2) * (x - 0.5) * (x - 0.9)' },
    bump: { label: 'Picco localizzato (difficile per i polinomi)', f: function (x) { return Math.exp(-50 * (x - 0.6) * (x - 0.6)); }, r: 'exp(-50 * (x - 0.6)^2)' }
  };
  /* polinomi di Legendre in u = 2x − 1: stesso spazio di poly(x, d), quindi stesse previsioni */
  function row(x, D) { var u = 2 * x - 1, r = [1, u]; for (var k = 1; k < D; k++) r.push(((2 * k + 1) * u * r[k] - k * r[k - 1]) / (k + 1)); return r.slice(0, D + 1); }

  function newState(prev) {
    var s = { fun: 'sin', n: 60, pt: 0.3, sigma: 0.3, K: 5, B: 200, seed: 2026, dShow: 3, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.nTest = Math.round(s.pt * s.n); s.m = s.n - s.nTest;
    s.D = Math.min(DMAX, s.m - Math.ceil(s.m / s.K) - 2); s.dShow = Math.min(s.dShow, s.D);
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.partOK = true;
    s.gx = []; s.fg = []; s.GR = [];
    for (var i = 0; i < NG; i++) { var x = (i + 0.5) / NG; s.gx.push(x); s.fg.push(FUN[s.fun].f(x)); s.GR.push(row(x, s.D)); }
    s.fmin = Math.min.apply(null, s.fg); s.fmax = Math.max.apply(null, s.fg);
    var L = s.D + 1; s.sum = { tr: new Float64Array(L), cv: new Float64Array(L), te: new Float64Array(L), err: new Float64Array(L) };
    s.cntCV = new Uint32Array(L); s.cntTe = new Uint32Array(L);
    s.dC = new Float64Array(s.B); s.dW = new Float64Array(s.B); s.opt = new Float64Array(s.B); s.errCV = new Float64Array(s.B);
    return s;
  }
  function argmin(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] < a[b]) b = i; return b; } // a parità vince il grado più basso
  function step() {
    if (S.k >= S.B) return false;
    var g = S.rng, n = S.n, D = S.D, L = D + 1, F = FUN[S.fun].f, i, d, j;
    var x = new Float64Array(n), y = new Float64Array(n);
    for (i = 0; i < n; i++) x[i] = g.unif();
    for (i = 0; i < n; i++) y[i] = F(x[i]) + S.sigma * g.norm();
    var sp = SA.rs.split(g, n, S.nTest), fold = SA.rs.folds(g, S.m, S.K);
    if (!SA.rs.checkFolds(fold, S.K).ok) S.partOK = false;
    var tr = sp.train.map(function (k) { return k - 1; }), te = sp.test.map(function (k) { return k - 1; });
    var Xtr = tr.map(function (k) { return row(x[k], D); }), ytr = tr.map(function (k) { return y[k]; });
    // stima su tutto il training; previsioni sul test e sulla griglia
    var full = SA.la.nestedPredict(Xtr, ytr, te.map(function (k) { return row(x[k], D); }).concat(S.GR));
    var trm = new Float64Array(L), tem = new Float64Array(L), err = new Float64Array(L), cv = new Float64Array(L);
    for (d = 0; d < L; d++) {
      var p = full.pred[d], s1 = 0, s2 = 0;
      trm[d] = full.rss[d] / S.m;
      for (j = 0; j < te.length; j++) s1 += (y[te[j]] - p[j]) * (y[te[j]] - p[j]);
      for (j = 0; j < NG; j++) { var q = S.fg[j] - p[te.length + j]; s2 += q * q; }
      tem[d] = s1 / te.length; err[d] = S.sigma * S.sigma + s2 / NG;
    }
    // validazione incrociata a K fold, soltanto sul training (previsioni fuori fold)
    for (var f = 1; f <= S.K; f++) {
      var inA = [], inB = [];
      fold.forEach(function (lab, t) { (lab === f ? inB : inA).push(t); });
      var fit = SA.la.nestedPredict(inA.map(function (t) { return Xtr[t]; }), inA.map(function (t) { return ytr[t]; }), inB.map(function (t) { return Xtr[t]; }));
      for (d = 0; d < L; d++) for (j = 0; j < inB.length; j++) { var r = ytr[inB[j]] - fit.pred[d][j]; cv[d] += r * r; }
    }
    for (d = 0; d < L; d++) cv[d] /= S.m;
    var dCV = argmin(cv), dTe = argmin(tem);
    for (d = 0; d < L; d++) { S.sum.tr[d] += trm[d]; S.sum.cv[d] += cv[d]; S.sum.te[d] += tem[d]; S.sum.err[d] += err[d]; }
    S.cntCV[dCV]++; S.cntTe[dTe]++;
    S.dC[S.k] = tem[dCV] - err[dCV]; S.dW[S.k] = tem[dTe] - err[dTe]; S.opt[S.k] = trm[dCV] - err[dCV]; S.errCV[S.k] = err[dCV];
    S.cur = { x: x, y: y, tr: tr, te: te, fold: fold, trm: trm, tem: tem, cv: cv, err: err, dCV: dCV, dTe: dTe, grid: full.pred.map(function (p) { return p.subarray(te.length); }) };
    S.k++; return true;
  }
  function meanOf(a, k) { var s = 0; for (var i = 0; i < k; i++) s += a[i]; return k ? s / k : NaN; }
  function seOf(a, k) { var m = meanOf(a, k), s = 0; for (var i = 0; i < k; i++) s += (a[i] - m) * (a[i] - m); return k > 1 ? Math.sqrt(s / (k - 1) / k) : NaN; }
  function avg(key) { var k = Math.max(1, S.k); return Array.prototype.map.call(S.sum[key], function (v) { return v / k; }); }

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, legA, legB, legC, legD;
  function clampPath(F, xs, ys, lo, hi) { return SA.plot.path(xs.map(function (x, i) { return [F.x(x), F.y(Math.max(lo, Math.min(hi, ys[i])))]; })); }
  function drawFit() {
    var P = SA.plot, a = S.cur, pad = 2.6 * S.sigma, lo = +(S.fmin - pad).toFixed(1), hi = +(S.fmax + pad).toFixed(1);
    var F = P.frame(figA, { W: 720, H: 330, x: [0, 1], y: [lo, hi], xlabel: 'x', ylabel: 'y', label: 'Training, test e polinomio stimato' });
    var t = F.t, g = F.g;
    P.dots(g, a.tr.map(function (k) { return [F.x(a.x[k]), F.y(Math.max(lo, Math.min(hi, a.y[k])))]; }), 3, t.ink, 0.55);
    a.te.forEach(function (k) { P.svg('circle', { cx: F.x(a.x[k]), cy: F.y(Math.max(lo, Math.min(hi, a.y[k]))), r: 4, fill: 'none', stroke: t.c2, 'stroke-width': 1.8 }, g); });
    P.curve(F, FUN[S.fun].f, 0, 1, { stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, 200);
    if (a.dCV !== S.dShow) P.svg('path', { d: clampPath(F, S.gx, a.grid[a.dCV], lo, hi), fill: 'none', stroke: t.c3, 'stroke-width': 2, 'stroke-dasharray': '10 4' }, g);
    P.svg('path', { d: clampPath(F, S.gx, a.grid[S.dShow], lo, hi), fill: 'none', stroke: t.accent, 'stroke-width': 3 }, g);
    P.text(g, F.m.l + 8, F.m.t + 12, 'grado mostrato d = ' + S.dShow + ' · scelto dalla CV d̂ = ' + a.dCV, { fill: t.ink_2, 'font-size': 12, 'font-weight': 600 });
  }
  function drawCurves() {
    var P = SA.plot, a = S.cur, D = S.D, s2 = S.sigma * S.sigma, mErr = avg('err');
    var top = +(1.35 * Math.max(mErr[0], a.err[0], 2 * s2)).toPrecision(2);
    var F = P.frame(figB, { W: 720, H: 300, x: [0, D], y: [0, top], xlabel: 'grado del polinomio d', ylabel: 'errore quadratico medio', label: 'Errori di training, validazione incrociata, test e generalizzazione' });
    var t = F.t, g = F.g, ds = []; for (var d = 0; d <= D; d++) ds.push(d);
    P.svg('line', { x1: F.x(0), x2: F.x(D), y1: F.y(s2), y2: F.y(s2), stroke: t.ink_3, 'stroke-dasharray': '2 3' }, g);
    P.text(g, F.x(D) - 4, F.y(s2) - 5, 'σ² (errore irriducibile)', { 'text-anchor': 'end', fill: t.ink_3, 'font-size': 11 });
    P.svg('line', { x1: F.x(S.dShow), x2: F.x(S.dShow), y1: F.m.t, y2: F.y(0), stroke: t.accent, 'stroke-dasharray': '3 3' }, g);
    var series = [['tr', 'trm', t.c1, null], ['cv', 'cv', t.c3, null], ['te', 'tem', t.c2, '9 4'], ['err', 'err', t.c_theory, '7 4']];
    series.forEach(function (q) { P.svg('path', { d: clampPath(F, ds, a[q[1]], 0, top), fill: 'none', stroke: q[2], 'stroke-width': 1.2, 'stroke-opacity': 0.35, 'stroke-dasharray': q[3] }, g); });
    if (S.k > 1) series.forEach(function (q) { P.svg('path', { d: clampPath(F, ds, avg(q[0]), 0, top), fill: 'none', stroke: q[2], 'stroke-width': 2.8, 'stroke-dasharray': q[3] }, g); });
    P.marker(g, 'circle', F.x(a.dCV), F.y(Math.min(top, a.cv[a.dCV])), 11, t.c3);
    P.marker(g, 'diamond', F.x(a.dTe), F.y(Math.min(top, a.tem[a.dTe])), 11, t.c2);
  }
  function drawBias() {
    var P = SA.plot, k = S.k, lim = 1e-3, i;
    // scala robusta: il 98° percentile dei valori assoluti; i valori oltre finiscono nelle classi estreme
    var ab = []; for (i = 0; i < k; i++) ab.push(Math.abs(S.dC[i]), Math.abs(S.dW[i]));
    ab.sort(function (u, v) { return u - v; }); if (ab.length) lim = Math.max(lim, ab[Math.min(ab.length - 1, Math.floor(0.98 * ab.length))]);
    lim = +(1.1 * lim).toPrecision(2);
    var cC = new Uint32Array(HB), cW = new Uint32Array(HB), bw = 2 * lim / HB, mx = 0, out = 0, bin = function (v) { if (Math.abs(v) > lim) out++; return Math.max(0, Math.min(HB - 1, Math.floor((v + lim) / bw))); };
    for (i = 0; i < k; i++) { cC[bin(S.dC[i])]++; cW[bin(S.dW[i])]++; }
    for (i = 0; i < HB; i++) mx = Math.max(mx, cC[i], cW[i]);
    var F = P.frame(figC, { W: 720, H: 240, x: [-lim, lim], y: [0, +(1.15 * Math.max(1, mx) / Math.max(1, k) / bw).toPrecision(2)], xlabel: 'errore stimato − errore vero del modello scelto', ylabel: 'densità', label: 'Distorsione delle due valutazioni' });
    var t = F.t;
    P.hist(F, cC, -lim, lim, k, t.c3, { opacity: 0.25 }); P.hist(F, cW, -lim, lim, k, t.c2, { opacity: 0.25 });
    P.svg('line', { x1: F.x(0), x2: F.x(0), y1: F.m.t, y2: F.y(0), stroke: t.ink, 'stroke-width': 1.4 }, F.g);
    if (out) P.text(F.g, F.m.l + 8, F.m.t + 12, out + ' valori fuori scala, contati nelle classi estreme', { fill: t.ink_3, 'font-size': 11.5 });
    [[meanOf(S.dC, k), t.c3, null], [meanOf(S.dW, k), t.c2, '6 3']].forEach(function (q) { if (k && Math.abs(q[0]) <= lim) P.svg('line', { x1: F.x(q[0]), x2: F.x(q[0]), y1: F.m.t, y2: F.y(0), stroke: q[1], 'stroke-width': 2.4, 'stroke-dasharray': q[2] }, F.g); });
  }
  function drawChoice() {
    var P = SA.plot, D = S.D, mx = 1, d, k = Math.max(1, S.k), mErr = avg('err'), best = argmin(mErr);
    for (d = 0; d <= D; d++) mx = Math.max(mx, S.cntCV[d], S.cntTe[d]);
    var F = P.frame(figD, { W: 720, H: 220, x: [-0.5, D + 0.5], y: [0, +(1.15 * mx / k).toPrecision(2)], xlabel: 'grado scelto', ylabel: 'frequenza', label: 'Gradi scelti nelle repliche' });
    var t = F.t, w = (F.x(1) - F.x(0)) * 0.36;
    for (d = 0; d <= D; d++) {
      P.svg('rect', { x: F.x(d) - w, width: w, y: F.y(S.cntCV[d] / k), height: F.y(0) - F.y(S.cntCV[d] / k), fill: t.c3, 'fill-opacity': 0.7 }, F.g);
      P.svg('rect', { x: F.x(d), width: w, y: F.y(S.cntTe[d] / k), height: F.y(0) - F.y(S.cntTe[d] / k), fill: t.c2, 'fill-opacity': 0.45 }, F.g);
    }
    if (S.k > 1) { P.marker(F.g, 'tri', F.x(best), F.m.t + 6, 12, t.ink); P.text(F.g, F.x(best) + 9, F.m.t + 10, 'miglior grado in media (Err)', { fill: t.ink_2, 'font-size': 11 }); }
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch, box = function (c, o) { return el('i', { style: 'display:inline-block;width:14px;height:10px;border-radius:2px;background:' + c + ';opacity:' + o }); };
    legA.innerHTML = ''; legB.innerHTML = ''; legC.innerHTML = ''; legD.innerHTML = '';
    legA.append(el('span', sw(t.ink, null, 'circle'), 'training'), el('span', el('i', { style: 'display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid ' + t.c2 }), 'test'), el('span', sw(t.c_theory, '7 4'), 'f vera'), el('span', sw(t.accent, null), 'grado mostrato'), el('span', sw(t.c3, '10 4'), 'grado scelto dalla CV'));
    legB.append(el('span', sw(t.c1, null), 'training'), el('span', sw(t.c3, null, 'circle'), 'validazione incrociata'), el('span', sw(t.c2, '9 4', 'diamond'), 'test'), el('span', sw(t.c_theory, '7 4'), 'Err vero'), el('span.muted', 'tratto spesso: media sulle repliche'));
    legC.append(el('span', box(t.c3, 0.5), 'corretto: scelta con CV, test usato una volta'), el('span', box(t.c2, 0.5), 'scorretto: scelta e stima sul test'));
    legD.append(el('span', box(t.c3, 0.8), 'scelto dalla CV'), el('span', box(t.c2, 0.6), 'scelto sul test'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var a = S.cur, fmt = SA.fmt, b = SA.ui.badge, k = S.k, s2 = S.sigma * S.sigma, mErr = avg('err'), best = argmin(mErr);
    var pm = function (arr) { return k ? fmt(meanOf(arr, k), 4) + (k > 1 ? ' ± ' + fmt(seOf(arr, k), 4) : '') : '—'; };
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Errore irriducibile σ²'), el('td', fmt(s2, 4)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Modello scelto dalla CV (replica corrente): Err(d̂) e stima sul test'), el('td', 'd̂ = ' + a.dCV + ' · Err = ' + fmt(a.err[a.dCV], 4)), el('td', fmt(a.tem[a.dCV], 4) + ' su ' + S.nTest + ' punti di test'), el('td', b('approx'))),
      el('tr', el('td', 'Err medio del modello scelto dalla CV · miglior grado in media'), el('td', 'd* = ' + best + ' · Err = ' + fmt(mErr[best], 4)), el('td', k ? fmt(meanOf(S.errCV, k), 4) : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Protocollo corretto: stima sul test − Err'), el('td', '0 (test indipendente dalla scelta)'), el('td', pm(S.dC)), el('td', b('mc'))),
      el('tr', el('td', 'Protocollo scorretto: min errore sul test − Err'), el('td', '< 0 (ottimistica)'), el('td', pm(S.dW)), el('td', b('mc'))),
      el('tr', el('td', 'Errore di training al grado scelto − Err'), el('td', '< 0 (ottimistica)'), el('td', pm(S.opt)), el('td', b('mc'))),
      el('tr', el('td', 'Controlli del protocollo'), el('td', 'fold disgiunti e completi; test fuori dalla scelta'), el('td', S.partOK ? '✓ verificato in tutte le ' + k + ' repliche' : '✗ partizione non valida'), el('td', b('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'repliche')),
      el('div.kpi', el('b', S.m + ' / ' + S.nTest), el('span', 'osservazioni di training / test · K = ' + S.K + ' fold')),
      el('div.kpi', el('b', k ? fmt(100 * meanOf(S.dW, k) / s2, 1) + '% di σ²' : '—'), el('span', 'ottimismo medio della scelta sul test '), b('mc')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p18-' + Date.now();
    predBox.append(el('p.prose', 'Scegli il grado che rende minimo l’errore sul test e riporti quell’errore come stima della qualità del modello. In media, rispetto all’errore vero, la stima sarà…'),
      el('div.choices', { role: 'radiogroup' }, [['ok', 'Corretta: il test è indipendente dal training'], ['low', 'Troppo bassa: la scelta sfrutta il caso a proprio favore'], ['high', 'Troppo alta: il test ha pochi punti']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'low' ? '✓ ' : '✗ ') + 'Ogni errore sul test, preso da solo, è non distorto. Ma il minimo di 13 stime rumorose tende a cadere su quella fortunata: dopo la scelta, il test non è più indipendente dalla decisione. Nell’istogramma arancio la media cade a sinistra dello zero (' + (S.k ? SA.fmt(meanOf(S.dW, S.k), 4) : '—') + '), quello verde è centrato. L’effetto cresce con pochi punti di test: prova n = 30 e quota di test 0,2.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>L’errore di <strong>training</strong> diminuisce sempre con il grado: i modelli sono annidati e ogni grado in più può solo adattarsi meglio ai dati già visti. L’errore di <strong>generalizzazione</strong> Err(d) ha invece la forma a U: scende finché il polinomio cattura la forma di f, poi sale perché la varianza della stima prevale (overfitting).</p>' +
      '<p>La <strong>validazione incrociata</strong> stima la curva a U usando solo il training: ogni osservazione è prevista da un modello che non l’ha vista. Il grado scelto varia molto tra le repliche, ma l’errore del modello scelto resta vicino al migliore possibile. Il <strong>test</strong> serve a una cosa sola: stimare, una volta, l’errore del modello finale.</p>' +
      '<p class="muted">Se il test viene usato anche per scegliere, la stima diventa ottimistica: è lo stesso meccanismo per cui l’errore di training sottostima Err, in scala più piccola. Con molti modelli candidati o con un test piccolo l’ottimismo cresce.</p>';
  }
  function codeR() {
    var Fn = FUN[S.fun];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 18 — Validazione e overfitting',
      '# R0: stessi dati, stessa suddivisione training/test e stessi fold di StatAtlas (R ≥ 3.6, stesso seed).',
      '# R1: stesse metriche (errore di training, CV, test, Err su 200 punti); poly() e i polinomi',
      '#     di Legendre generano lo stesso spazio, quindi le stesse previsioni a meno dell’arrotondamento.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'f <- function(x) ' + Fn.r,
      'n <- ' + S.n + '; n_test <- ' + S.nTest + '; K <- ' + S.K + '; sigma <- ' + S.sigma + '; D <- ' + S.D + '; B <- ' + S.B,
      'griglia <- tibble(x = (seq_len(' + NG + ') - 0.5) / ' + NG + ')', '',
      'adatta <- function(d, dati) if (d == 0) lm(y ~ 1, data = dati) else lm(y ~ poly(x, d), data = dati)',
      'errore <- function(fit, dati) mean((dati$y - predict(fit, newdata = dati))^2)', '',
      'una_replica <- function() {', '  x <- runif(n); y <- f(x) + sigma * rnorm(n)', '  dati <- tibble(x, y)',
      '  id_test <- sample(n, n_test)                       # il test si mette da parte subito', '  train <- dati[-id_test, ]; test <- dati[id_test, ]',
      '  fold <- sample(rep_len(1:K, nrow(train)))           # fold generati una volta, per tutti i gradi',
      '  curve <- map_dfr(0:D, \\(d) {', '    fuori <- numeric(nrow(train))',
      '    for (k in 1:K) fuori[fold == k] <- predict(adatta(d, train[fold != k, ]), newdata = train[fold == k, ])',
      '    fit <- adatta(d, train)', '    tibble(d = d, training = errore(fit, train), cv = mean((train$y - fuori)^2), test = errore(fit, test),',
      '           err = sigma^2 + mean((f(griglia$x) - predict(fit, newdata = griglia))^2))', '  })',
      '  d_cv <- curve$d[which.min(curve$cv)]; d_test <- curve$d[which.min(curve$test)]',
      '  list(curve = curve, sintesi = tibble(d_cv, d_test,', '    corretto = curve$test[d_cv + 1] - curve$err[d_cv + 1],      # scelta con CV, test usato una volta',
      '    scorretto = curve$test[d_test + 1] - curve$err[d_test + 1], # scelta e stima sul test', '    training = curve$training[d_cv + 1] - curve$err[d_cv + 1]))', '}', '',
      'repliche <- map(seq_len(B), \\(b) una_replica())', 'sintesi <- map_dfr(repliche, "sintesi")',
      'sintesi |> summarise(across(c(corretto, scorretto, training), list(media = mean, es = \\(v) sd(v) / sqrt(B))))', 'count(sintesi, d_cv)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      '# Curve medie sulle repliche', 'map_dfr(repliche, "curve") |> group_by(d) |> summarise(across(everything(), mean)) |>',
      '  pivot_longer(-d, names_to = "errore", values_to = "valore") |>', '  ggplot(aes(d, valore, colour = errore)) + geom_line(linewidth = 1) + geom_point() +',
      '  geom_hline(yintercept = sigma^2, linetype = "dotted") + coord_cartesian(ylim = c(0, NA)) +', '  labs(x = "grado del polinomio", y = "errore quadratico medio") + theme_statatlas()', '',
      '# Replica numero ' + Math.max(1, S.k) + ' (quella mostrata)', 'repliche[[' + Math.max(1, S.k) + ']]$curve', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Tre errori diversi</h3><p>Per un modello stimato f̂: l’errore di <strong>training</strong> è la media dei residui al quadrato sui dati usati per stimarlo; l’errore di <strong>generalizzazione</strong> è</p><div class="eq">Err = E[(Y − f̂(X))²] = σ² + E[(f(X) − f̂(X))²]</div><p>su una nuova coppia (X, Y), con f̂ fissata; l’errore sul <strong>test</strong> è la sua stima con punti mai usati.</p>' +
        '<h3>Validazione incrociata a K fold</h3><p>Il training si divide in K parti; ogni parte viene prevista dal modello stimato sulle altre K − 1. La media degli errori fuori fold stima Err per ogni complessità e permette di scegliere senza toccare il test.</p>' +
        '<h3>Protocollo</h3><ol><li>Separare subito il test.</li><li>Generare i fold una sola volta, indipendentemente dal grado.</li><li>Ogni trasformazione (standardizzazione, selezione) si stima dentro il training di ciascun fold.</li><li>Scegliere con la CV, ristimare su tutto il training, valutare sul test <em>una volta</em>.</li></ol>' +
        '<div class="callout warn">Usare il test per scegliere e poi riportarne l’errore produce una stima ottimistica: il test diventa parte dell’addestramento.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Ottimismo dell’errore di training</h3><p>Con x fissi e un lisciatore lineare ŷ = Sy, l’errore atteso in-sample supera quello di training di 2σ² tr(S)/n (Efron, 2004). Per il polinomio di grado d, tr(S) = d + 1: è il termine che Cp e AIC aggiungono.</p>' +
        '<h3>Che cosa stima la CV</h3><p>La CV è quasi non distorta per l’errore <em>atteso</em> su insiemi di training di numerosità (K − 1)m/K, non per l’errore del modello stimato sui dati in mano (Bates, Hastie e Tibshirani, 2024). Per questo la sua variabilità non si riduce a quella tra fold.</p>' +
        '<h3>Selezione e valutazione: CV annidata</h3><p>Se la scelta dell’iperparametro fa parte del metodo, valutarla richiede due livelli: un ciclo esterno per l’errore e, dentro ciascun fold esterno, una CV interna per la scelta (Varma e Simon, 2006). Con un solo ciclo, il minimo della CV è anch’esso ottimistico, come il minimo del test.</p>' +
        '<h3>Regola di un errore standard</h3><p>Tra i gradi la cui CV è entro un errore standard dal minimo, si sceglie il più semplice: riduce la variabilità della scelta con una perdita minima.</p>' });
    }
  };

  var run, codeBox, ctrlBox, showSlider;
  function restart() { var D0 = S.D; run.stop(); S = newState(S); step(); legends(); interpretation(); codeBox.refresh(); if (S.D !== D0) buildControls(); render(true); run.refresh(); }
  function render(full) { drawFit(); drawCurves(); if (full || run.frame % 3 === 0 || !run.running) { drawBias(); drawChoice(); updateTable(); } if (full && !run.running && codeBox) codeBox.refresh(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (lab, key, vals, fmtv) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    showSlider = SA.ui.slider('Grado mostrato nel grafico', { min: 0, max: S.D, step: 1, value: S.dShow, format: function (v) { return String(v); }, onchange: function (v) { S.dShow = v; drawFit(); drawCurves(); } });
    ctrlBox.append(
      el('label.field', el('span', 'Funzione vera f'), el('select', { onchange: function () { S.fun = this.value; restart(); } }, Object.keys(FUN).map(function (k) { return el('option', { value: k, selected: k === S.fun }, FUN[k].label); }))),
      SA.ui.slider('Rumore σ', { min: 0.1, max: 1, step: 0.05, value: S.sigma, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.sigma = v; restart(); } }),
      showSlider,
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n', 'n', [30, 60, 120, 250]), sel('Quota di test', 'pt', [0.2, 0.3, 0.5], function (v) { return SA.fmt(v, 1); }),
        sel('Fold K', 'K', [5, 10]), sel('Repliche B', 'B', [100, 200, 500, 1000]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      el('p.muted', { style: 'font-size:.85rem;margin:0' }, 'Gradi da 0 a ' + S.D + (S.D < DMAX ? ' (limitato dalla numerosità dei fold)' : '') + '.'));
    run.controls('Una nuova replica').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('validazione', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, coop: true, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Validazione e overfitting', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Un modello più flessibile si adatta sempre meglio ai dati che ha visto. Su quelli nuovi, no. Come lo si scopre senza ingannarsi?')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Perché un modello che si adatta meglio ai dati di training può prevedere peggio?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Training, validazione incrociata e test');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); figD = el('div');
      legA = el('div.legend'); legB = el('div.legend'); legC = el('div.legend'); legD = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'I dati divisi e il polinomio stimato'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Errore in funzione della complessità'), legB), figB),
        el('div.fig', el('div.fig-title', el('h3', 'Quanto è onesta la stima dell’errore?'), legC), figC),
        el('div.fig', el('div.fig-title', el('h3', 'Quale grado viene scelto'), legD), figD),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var a = S.cur, rows = [['x', 'y', 'insieme', 'fold']], fl = {}; a.tr.forEach(function (k, t) { fl[k] = a.fold[t]; }); for (var i = 0; i < S.n; i++) rows.push([a.x[i], a.y[i], fl[i] ? 'training' : 'test', fl[i] || '']); SA.ui.download('statatlas_lab18_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Curve CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var a = S.cur, rows = [['d', 'training', 'cv', 'test', 'err']]; for (var d = 0; d <= S.D; d++) rows.push([d, a.trm[d], a.cv[d], a.tem[d], a.err[d]]); SA.ui.download('statatlas_lab18_curve.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab18.png', ['Validazione e overfitting', FUN[S.fun].label + ' · σ = ' + S.sigma + ' · n = ' + S.n + ' · K = ' + S.K + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Valore vero'), el('th', 'Stima / simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' esatto'), el('span', SA.ui.badge('approx'), ' Err con quadratura su 200 punti'), el('span', SA.ui.badge('mc'), ' Monte Carlo: media ± errore standard sulle repliche')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Ottimismo, che cosa stima la CV, CV annidata (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessa suddivisione, stessi fold'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab18_validazione.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati, stessa suddivisione training/test e stessi fold (R0), stesse metriche (R1). Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
