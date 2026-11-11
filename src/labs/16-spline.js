/* StatAtlas · Lab 16 — Regressione non parametrica e spline.
 * Tutti i metodi sono lisciatori lineari ŷ = S y: distorsione e varianza si calcolano esattamente
 * da S, la validazione incrociata leave-one-out ha forma chiusa. */
(function () {
  var el, S, NG = 201, NKP = 40, KEEP = 14;
  function f(x) { return Math.sin(2 * Math.PI * x) + 0.5 * x * Math.sin(6 * Math.PI * x); }
  var METHODS = {
    poly: { label: 'Polinomio globale', par: 'grado', grid: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], def: 3, fmt: function (v) { return String(v); } },
    regspline: { label: 'Spline di regressione (B-spline cubiche)', par: 'numero di basi', grid: [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32], def: 8, fmt: function (v) { return String(v); } },
    pspline: { label: 'Spline penalizzata (P-spline, ' + (NKP + 4) + ' basi)', par: 'λ della penalità', grid: logGrid(1e-5, 1e3, 17), def: 0.1, fmt: function (v) { return SA.fmt(v, 3); } },
    kernel: { label: 'Regressione locale lineare (kernel gaussiano)', par: 'ampiezza di banda h', grid: logGrid(0.008, 0.35, 17), def: 0.05, fmt: function (v) { return SA.fmt(v, 3); } }
  };
  function logGrid(a, b, k) { var g = []; for (var i = 0; i < k; i++) g.push(+(a * Math.pow(b / a, i / (k - 1))).toPrecision(3)); return g; }

  /* ---------- basi ---------- */
  function knots(K) { var t = [0, 0, 0, 0]; for (var i = 1; i <= K; i++) t.push(i / (K + 1)); return t.concat([1, 1, 1, 1]); }
  function bspline(x, t) { // Cox–de Boor, ordine 4; restituisce i valori di tutte le basi in x
    var nb = t.length - 4, xx = Math.min(x, 1 - 1e-12), B = [], i, k;
    for (i = 0; i < t.length - 1; i++) B.push(xx >= t[i] && xx < t[i + 1] ? 1 : 0);
    for (k = 2; k <= 4; k++) for (i = 0; i < t.length - k; i++) {
      var a = t[i + k - 1] - t[i], b = t[i + k] - t[i + 1];
      B[i] = (a > 0 ? (xx - t[i]) / a * B[i] : 0) + (b > 0 ? (t[i + k] - xx) / b * B[i + 1] : 0);
    }
    return B.slice(0, nb);
  }
  function legendre(x, d) { var u = 2 * x - 1, P = [1, u]; for (var k = 2; k <= d; k++) P.push(((2 * k - 1) * u * P[k - 1] - (k - 1) * P[k - 2]) / k); return P.slice(0, d + 1); }
  function basisFn(m, c) {
    if (m === 'poly') return function (x) { return legendre(x, c); };
    var t = knots(m === 'pspline' ? NKP : c - 4); return function (x) { return bspline(x, t); };
  }
  /* sistema lineare simmetrico definito positivo (Cholesky) */
  function cholSolve(A, Bm) {
    var p = A.length, L = [], i, j, k;
    for (i = 0; i < p; i++) { L.push(new Float64Array(p)); for (j = 0; j <= i; j++) { var s = A[i][j]; for (k = 0; k < j; k++) s -= L[i][k] * L[j][k]; L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j]; } }
    return Bm.map(function (b) { var y = new Float64Array(p), x = new Float64Array(p);
      for (i = 0; i < p; i++) { var s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; }
      for (i = p - 1; i >= 0; i--) { var s2 = y[i]; for (k = i + 1; k < p; k++) s2 -= L[k][i] * x[k]; x[i] = s2 / L[i][i]; }
      return x; });
  }
  /* lisciatore: restituisce H (coefficienti = H y), S (n × n) e la funzione per valutare la curva */
  function smoother(m, c) {
    var xs = S.x, n = xs.length, i, j, k;
    if (m === 'kernel') {
      var weights = function (x0) {
        var w = [], s1 = 0, s2 = 0, sw = 0;
        for (j = 0; j < n; j++) { var d = xs[j] - x0, wj = Math.exp(-0.5 * d * d / (c * c)); w.push(wj); s1 += wj * d; s2 += wj * d * d; }
        var l = w.map(function (wj, jj) { return wj * (s2 - (xs[jj] - x0) * s1); }); l.forEach(function (v) { sw += v; });
        return l.map(function (v) { return v / sw; });
      };
      var Sm = xs.map(weights);
      return { S: Sm, curve: function (y) { return S.grid.map(function (x0) { var l = weights(x0), s = 0; for (var q = 0; q < n; q++) s += l[q] * y[q]; return s; }); }, weights: weights };
    }
    var bf = basisFn(m, c), B = xs.map(bf), p = B[0].length, A = [];
    for (i = 0; i < p; i++) { A.push(new Float64Array(p)); for (j = 0; j < p; j++) { var s = 0; for (k = 0; k < n; k++) s += B[k][i] * B[k][j]; A[i][j] = s; } }
    if (m === 'pspline') for (i = 0; i < p - 2; i++) { var dv = [1, -2, 1]; for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) A[i + a][i + b] += c * dv[a] * dv[b]; }
    var rhs = []; for (k = 0; k < n; k++) { var e = new Float64Array(p); for (i = 0; i < p; i++) e[i] = B[k][i]; rhs.push(e); }
    var Hc = cholSolve(A, rhs); // colonne di H = A⁻¹ Bᵀ
    var Sm = B.map(function (bi) { return Hc.map(function (h) { var s = 0; for (var q = 0; q < p; q++) s += bi[q] * h[q]; return s; }); });
    var Bg = S.grid.map(bf);
    return { S: Sm, B: Bg, p: p, coef: function (y) { var cf = new Float64Array(p); for (var q = 0; q < n; q++) for (var r = 0; r < p; r++) cf[r] += Hc[q][r] * y[q]; return cf; },
      curve: function (y) { var cf = this.coef(y); return Bg.map(function (b) { var s = 0; for (var r = 0; r < p; r++) s += b[r] * cf[r]; return s; }); } };
  }
  /* quantità esatte di un lisciatore lineare */
  function exact(Sm) {
    var n = S.x.length, b2 = 0, v = 0, tr = 0;
    for (var i = 0; i < n; i++) { var sf = 0, ss = 0; for (var j = 0; j < n; j++) { sf += Sm[i][j] * S.fx[j]; ss += Sm[i][j] * Sm[i][j]; } b2 += (sf - S.fx[i]) * (sf - S.fx[i]); v += ss; tr += Sm[i][i]; }
    return { b2: b2 / n, v: S.sigma * S.sigma * v / n, mse: b2 / n + S.sigma * S.sigma * v / n, edf: tr };
  }
  function loocv(Sm, y) { var n = y.length, s = 0; for (var i = 0; i < n; i++) { var yh = 0; for (var j = 0; j < n; j++) yh += Sm[i][j] * y[j]; var r = (y[i] - yh) / (1 - Sm[i][i]); s += r * r; } return s / n; }

  function newState(prev) {
    var s = { method: 'regspline', n: 100, sigma: 0.3, M: 300, seed: 2026, comp: null, pred: null, showBasis: true };
    if (prev) for (var k in s) if (prev[k] !== undefined && prev[k] !== null) s[k] = prev[k];
    if (s.comp == null || METHODS[s.method].grid.indexOf(s.comp) < 0) { // valore della griglia più vicino al predefinito
      var Mm = METHODS[s.method]; s.comp = Mm.grid.reduce(function (b, v) { return Math.abs(Math.log(v / Mm.def)) < Math.abs(Math.log(b / Mm.def)) ? v : b; }, Mm.grid[0]);
    }
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.ise = 0; s.fits = [];
    s.x = []; for (var i = 0; i < s.n; i++) s.x.push((i + 0.5) / s.n);
    s.fx = s.x.map(f); s.grid = []; for (i = 0; i < NG; i++) s.grid.push(i / (NG - 1));
    return s;
  }
  function prepare() {
    S.sm = smoother(S.method, S.comp); S.ex = exact(S.sm.S);
    S.curveTable = METHODS[S.method].grid.map(function (c) { var sm = c === S.comp ? S.sm : smoother(S.method, c); var e = exact(sm.S); e.c = c; e.Sm = sm.S; return e; });
  }
  function step() {
    if (S.k >= S.M) return false;
    var y = S.fx.map(function (v) { return v + S.sigma * S.rng.norm(); }), n = y.length, ise = 0;
    for (var i = 0; i < n; i++) { var yh = 0; for (var j = 0; j < n; j++) yh += S.sm.S[i][j] * y[j]; ise += (yh - S.fx[i]) * (yh - S.fx[i]); }
    S.ise += ise / n; S.y = y; S.fits.push(S.sm.curve(y)); if (S.fits.length > KEEP) S.fits.shift();
    S.k++; return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB;
  function drawFit() {
    var P = SA.plot, F = P.frame(figA, { W: 720, H: 380, x: [0, 1], y: [-2.6, 2.6], xlabel: 'x', ylabel: 'y', label: 'Dati, curva vera e curva stimata' });
    var t = F.t, g = F.g, gx = S.grid.map(F.x), cl = function (v) { return Math.max(F.m.t, Math.min(F.y(-2.6), F.y(v))); };
    // basi pesate dai coefficienti (o pesi del kernel in x = 0,5)
    if (S.showBasis && S.y) {
      if (S.method === 'kernel') {
        var l = S.sm.weights(0.5), mx = Math.max.apply(null, l), pts = S.x.map(function (x, i) { return [F.x(x), F.y(-2.6) - 60 * l[i] / mx]; });
        P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c3, 'stroke-width': 1.6 }, g);
        P.text(g, F.x(0.5) + 6, F.y(-2.6) - 64, 'pesi locali in x = 0,5', { fill: t.c3, 'font-size': 11.5 });
      } else {
        var cf = S.sm.coef(S.y), cols = [t.c3, t.c4, t.c1, t.c2];
        for (var j = 0; j < S.sm.p; j++) P.svg('path', { d: P.path(S.sm.B.map(function (b, i) { return [gx[i], cl(cf[j] * b[j])]; })), fill: 'none', stroke: cols[j % 4], 'stroke-width': 1, 'stroke-opacity': 0.45 }, g);
      }
    }
    if (S.method === 'regspline') knots(S.comp - 4).slice(4, -4).forEach(function (k) { P.svg('line', { x1: F.x(k), x2: F.x(k), y1: F.y(-2.6), y2: F.y(-2.6) - 8, stroke: t.accent, 'stroke-width': 2 }, g); });
    S.fits.slice(0, -1).forEach(function (c) { P.svg('path', { d: P.path(c.map(function (v, i) { return [gx[i], cl(v)]; })), fill: 'none', stroke: t.c1, 'stroke-width': 1, 'stroke-opacity': 0.22 }, g); });
    if (S.y) P.dots(g, S.x.map(function (x, i) { return [F.x(x), cl(S.y[i])]; }), 2.6, t.ink, 0.45);
    P.svg('path', { d: P.path(S.grid.map(function (x, i) { return [gx[i], cl(f(x))]; })), fill: 'none', stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
    if (S.fits.length) P.svg('path', { d: P.path(S.fits[S.fits.length - 1].map(function (v, i) { return [gx[i], cl(v)]; })), fill: 'none', stroke: t.c1, 'stroke-width': 3 }, g);
    P.text(g, F.m.l + 8, F.m.t + 12, METHODS[S.method].label + ' · ' + METHODS[S.method].par + ' = ' + METHODS[S.method].fmt(S.comp) + ' · gradi di libertà effettivi ' + SA.fmt(S.ex.edf, 1), { fill: t.ink_3, 'font-size': 11.5 });
  }
  function drawBV() {
    var P = SA.plot, ct = S.curveTable, ed = ct.map(function (e) { return e.edf; }), xmin = Math.max(1, Math.min.apply(null, ed)), xmax = Math.max.apply(null, ed);
    var cv = S.y ? ct.map(function (e) { return loocv(e.Sm, S.y) - S.sigma * S.sigma; }) : null;
    var top = Math.min(1.2, Math.max.apply(null, ct.map(function (e) { return e.mse; })) * 1.1);
    var F = P.frame(figB, { W: 720, H: 270, x: [Math.floor(xmin), Math.ceil(xmax)], y: [0, +top.toPrecision(2)], xlabel: 'gradi di libertà effettivi tr(S)', ylabel: 'errore medio ai punti xᵢ', label: 'Distorsione e varianza' });
    var t = F.t, g = F.g, cl = function (v) { return Math.max(F.m.t, Math.min(F.y(0), F.y(v))); };
    var ord = ct.map(function (e, i) { return i; }).sort(function (a, b) { return ed[a] - ed[b]; });
    [['b2', t.c2, '7 4'], ['v', t.c1, '2 3'], ['mse', t.ink, null]].forEach(function (c) {
      P.svg('path', { d: P.path(ord.map(function (i) { return [F.x(ed[i]), cl(ct[i][c[0]])]; })), fill: 'none', stroke: c[1], 'stroke-width': c[0] === 'mse' ? 2.6 : 2, 'stroke-dasharray': c[2] }, g);
    });
    if (cv) { P.svg('path', { d: P.path(ord.map(function (i) { return [F.x(ed[i]), cl(cv[i])]; })), fill: 'none', stroke: t.c3, 'stroke-width': 1.8, 'stroke-dasharray': '4 2' }, g);
      var bc = 0; cv.forEach(function (v, i) { if (v < cv[bc]) bc = i; }); P.marker(g, 'diamond', F.x(ed[bc]), cl(cv[bc]), 11, t.c3); S.bestCV = ct[bc].c; }
    var bm = 0; ct.forEach(function (e, i) { if (e.mse < ct[bm].mse) bm = i; }); S.bestMse = ct[bm].c;
    P.marker(g, 'circle', F.x(ed[bm]), cl(ct[bm].mse), 11, t.ink);
    P.svg('line', { x1: F.x(S.ex.edf), x2: F.x(S.ex.edf), y1: F.m.t, y2: F.y(0), stroke: t.accent, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g);
    P.text(g, F.x(S.ex.edf) + 5, F.m.t + 12, 'scelta attuale', { fill: t.accent, 'font-size': 11.5, 'font-weight': 600 });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c_theory, '7 4'), 'funzione vera'), el('span', sw(t.c1, null), 'stima attuale'), el('span', el('i', { style: 'display:inline-block;width:18px;height:2px;background:' + t.c1 + ';opacity:.35' }), 'stime dei campioni precedenti'),
      el('span', sw(t.c3, null), S.method === 'kernel' ? 'pesi locali' : 'basi × coefficienti'));
    legB.append(el('span', sw(t.ink, null, 'circle'), 'errore quadratico medio (esatto)'), el('span', sw(t.c2, '7 4'), 'distorsione²'), el('span', sw(t.c1, '2 3'), 'varianza'), el('span', sw(t.c3, '4 2', 'diamond'), 'validazione incrociata − σ² (campione corrente)'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var e = S.ex, fmt = SA.fmt, b = SA.ui.badge, M = METHODS[S.method];
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Gradi di libertà effettivi tr(S)'), el('td', fmt(e.edf, 2)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Distorsione² media ai punti xᵢ'), el('td', fmt(e.b2, 4)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Varianza media σ² tr(SSᵀ)/n'), el('td', fmt(e.v, 4)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Errore quadratico medio'), el('td', fmt(e.mse, 4)), el('td', S.k ? fmt(S.ise / S.k, 4) : '—'), el('td', b('exact'), ' ', b('mc'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', M.fmt(S.bestMse)), el('span', M.par + ' con errore minimo (teoria) ')), el('div.kpi', el('b', S.bestCV != null ? M.fmt(S.bestCV) : '—'), el('span', M.par + ' scelto dalla validazione incrociata ')),
      el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni simulati')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p16-' + Date.now();
    predBox.append(el('p.prose', 'Aumentando il numero di basi della spline, che cosa succede all’errore con cui la curva stimata approssima quella vera?'),
      el('div.choices', { role: 'radiogroup' }, [['down', 'Diminuisce sempre'], ['up', 'Aumenta sempre'], ['u', 'Prima diminuisce, poi aumenta']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'u' ? '✓ ' : '✗ ') + 'Con poche basi la curva è troppo rigida (distorsione alta); con molte insegue il rumore (varianza alta). L’errore complessivo ha un minimo intermedio: guarda la curva nera nel secondo grafico, esatta per ogni scelta.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Tutti e quattro i metodi stimano la curva come <strong>combinazione lineare delle risposte</strong>, ŷ = S y. La matrice S riassume tutto: la sua traccia sono i <strong>gradi di libertà effettivi</strong>, misura comune della complessità che rende confrontabili grado del polinomio, numero di basi, λ e ampiezza di banda.</p>' +
      '<p>Le curve del secondo grafico sono <strong>esatte</strong>: distorsione² = ‖Sf − f‖²/n e varianza = σ² tr(SSᵀ)/n. La validazione incrociata, calcolata sul solo campione corrente senza conoscere f, ne approssima il minimo: è così che si sceglie la complessità con dati reali.</p>' +
      '<p class="muted">Confronta i metodi: il polinomio globale oscilla ai bordi (fenomeno di Runge) quando il grado cresce; le spline sono locali e restano stabili; la P-spline controlla la complessità con λ anziché con il numero di basi.</p>';
  }
  function codeR() {
    var m = S.method, c = S.comp, L = ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 16 — ' + METHODS[m].label, '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', 'library(splines)', '', 'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; sigma <- ' + S.sigma,
      'f <- function(x) sin(2 * pi * x) + 0.5 * x * sin(6 * pi * x)', 'x <- (seq_len(n) - 0.5) / n', 'y <- f(x) + sigma * rnorm(n)', 'griglia <- seq(0, 1, length.out = 201)', '',
      '# Matrice del lisciatore S (ŷ = S y) per il metodo scelto'];
    if (m === 'poly') L.push('grado <- ' + c, 'X <- outer(2 * x - 1, 0:grado, \\(u, k) sapply(k, \\(kk) 0)) # segnaposto', 'X <- cbind(1, poly(x, grado, raw = FALSE))   # base ortogonale (stesso spazio dei polinomi di Legendre)', 'S <- X %*% solve(crossprod(X), t(X))', 'fit <- lm(y ~ poly(x, grado))');
    else if (m === 'regspline') L.push('basi <- ' + c + '; K <- basi - 4', 'nodi <- c(rep(0, 4), seq_len(K) / (K + 1), rep(1, 4))', 'X <- splineDesign(nodi, x, ord = 4)', 'S <- X %*% solve(crossprod(X), t(X))', 'fit <- lm(y ~ X - 1)');
    else if (m === 'pspline') L.push('lambda <- ' + c + '; K <- ' + NKP, 'nodi <- c(rep(0, 4), seq_len(K) / (K + 1), rep(1, 4))', 'X <- splineDesign(nodi, x, ord = 4)', 'D <- diff(diag(ncol(X)), differences = 2)   # penalità sulle differenze seconde', 'S <- X %*% solve(crossprod(X) + lambda * crossprod(D), t(X))');
    else L.push('h <- ' + c, 'pesi_locali <- function(x0) {   # regressione locale lineare, kernel gaussiano', '  w <- dnorm((x - x0) / h); d <- x - x0', '  l <- w * (sum(w * d^2) - d * sum(w * d)); l / sum(l)', '}', 'S <- t(sapply(x, pesi_locali))');
    L.push('', '# Gradi di libertà effettivi, distorsione² e varianza (esatti)', 'c(gdl = sum(diag(S)), distorsione2 = mean((S %*% f(x) - f(x))^2), varianza = sigma^2 * sum(S^2) / n)', '',
      '# Validazione incrociata leave-one-out in forma chiusa', 'yhat <- drop(S %*% y)', 'mean(((y - yhat) / (1 - diag(S)))^2)', '',
      '# Errore Monte Carlo su ' + S.M + ' campioni (il primo è quello già generato)', 'set.seed(' + S.seed + ')', 'ise <- map_dbl(seq_len(' + S.M + '), \\(m) { yy <- f(x) + sigma * rnorm(n); mean((S %*% yy - f(x))^2) })', 'mean(ise)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'tibble(x, y, yhat) |>', '  ggplot(aes(x, y)) + geom_point(alpha = 0.5) +', '  geom_function(fun = f, linetype = "dashed") +', '  geom_line(aes(y = yhat), colour = "#0072B2", linewidth = 1.1) +',
      '  labs(title = "' + METHODS[m].label + '", subtitle = sprintf("gradi di libertà effettivi %.1f", sum(diag(S)))) +', '  theme_statatlas()', '');
    return L.filter(function (s) { return s.indexOf('segnaposto') < 0; }).join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Stimare una funzione</h3><p>Il modello è y = f(x) + ε con f ignota e liscia. Invece di fissare una forma (retta, parabola) si lascia ai dati il compito di stabilirla, controllando la <strong>complessità</strong>.</p>' +
        '<h3>Quattro strategie</h3><ul><li><strong>Polinomio globale</strong>: un’unica formula su tutto l’intervallo; la complessità è il grado.</li><li><strong>Spline di regressione</strong>: polinomi cubici a tratti raccordati nei nodi; la complessità è il numero di basi (nodi + 4).</li>' +
        '<li><strong>P-spline</strong>: molte basi e una penalità sulla rugosità dei coefficienti; la complessità è λ.</li><li><strong>Regressione locale</strong>: una retta pesata attorno a ogni punto; la complessità è l’ampiezza di banda h.</li></ul>' +
        '<div class="eq">EQM = distorsione² + varianza, &nbsp; gradi di libertà effettivi = tr(S)</div>' +
        '<div class="callout">Poca complessità: curva rigida, distorsione alta. Troppa: curva che insegue il rumore, varianza alta. Il minimo dell’errore sta nel mezzo, e lo si stima con la validazione incrociata.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Lisciatori lineari</h3><p>Per tutti i metodi ŷ = Sy con S che dipende solo dalle x e dal parametro di complessità. Ne seguono E ŷ = Sf e Var ŷ = σ²SSᵀ: distorsione e varianza sono esatte. Per le spline di regressione S è una matrice di proiezione (tr S = numero di basi); per P-spline e kernel no, e tr(S) è un numero non intero.</p>' +
        '<h3>Validazione incrociata in forma chiusa</h3><div class="eq">CV = (1/n) Σ [(yᵢ − ŷᵢ)/(1 − Sᵢᵢ)]²</div><p>vale per ogni lisciatore lineare che riproduce le costanti: non serve riadattare il modello n volte. La GCV sostituisce Sᵢᵢ con tr(S)/n.</p>' +
        '<h3>Spline di lisciamento</h3><p>La soluzione di min Σ(yᵢ − g(xᵢ))² + λ∫g″² è una spline cubica naturale con nodi in tutte le xᵢ (teorema di Reinsch). Le P-spline di Eilers e Marx approssimano la stessa idea con molte B-spline e una penalità sulle differenze dei coefficienti.</p>' +
        '<h3>Regressione locale e bordi</h3><p>La media locale (Nadaraya–Watson) ha distorsione di ordine h ai bordi; la retta locale la riduce a h², per questo è il default di <code>loess</code>. Con banda ottima l’errore decresce come n<sup>−4/5</sup>, più lentamente del 1/n parametrico: è il prezzo della flessibilità.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); prepare(); step(); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { drawFit(); if (full || run.frame % 6 === 0 || !run.running) { drawBV(); updateTable(); } }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var M = METHODS[S.method], gi = M.grid.indexOf(S.comp);
    ctrlBox.append(
      el('label.field', el('span', 'Metodo'), el('select', { onchange: function () { S.method = this.value; S.comp = null; buildControls(); restart(); } }, Object.keys(METHODS).map(function (k) { return el('option', { value: k, selected: k === S.method }, METHODS[k].label); }))),
      SA.ui.slider('Complessità: ' + M.par, { min: 0, max: M.grid.length - 1, step: 1, value: gi, format: function (v) { return M.fmt(M.grid[v]); },
        onchange: function (v) { S.comp = M.grid[v]; var keep = S.fits; run.stop(); S.sm = smoother(S.method, S.comp); S.ex = exact(S.sm.S); S.k = 0; S.ise = 0; S.fits = S.y ? [S.sm.curve(S.y)] : []; legends(); codeBox.refresh(); render(true); run.refresh(); } }),
      el('label.field', { style: 'flex-direction:row;display:flex;gap:8px;align-items:center' }, el('input', { type: 'checkbox', checked: S.showBasis, onchange: function () { S.showBasis = this.checked; drawFit(); } }), el('span', 'Mostra le basi (o i pesi locali)')),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [50, 100, 200].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
        el('label.field', el('span', 'Rumore σ'), el('select', { onchange: function () { S.sigma = +this.value; restart(); } }, [0.1, 0.3, 0.6].map(function (v) { return el('option', { value: v, selected: v === S.sigma }, SA.fmt(v, 1)); }))),
        el('label.field', el('span', 'Campioni M'), el('select', { onchange: function () { S.M = +this.value; restart(); } }, [100, 300, 1000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('spline', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S); prepare();
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.M; }, progress: function () { return S.k / S.M; }, reset: function () { S = newState(S); prepare(); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione non parametrica e spline', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Quando la relazione non è una retta, lasciamo che i dati disegnino la curva. Ma quanta libertà concedere?')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Quante basi servono per descrivere una curva, e quando sono troppe?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Complessità, distorsione e varianza');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'La curva stimata e le sue basi'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Errore al variare della complessità'), legB), figB),
        el('div.toolbar', SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab16_' + S.method + '.png', [METHODS[S.method].label, METHODS[S.method].par + ' = ' + METHODS[S.method].fmt(S.comp) + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità (scelta attuale)'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Lisciatori lineari, validazione incrociata, teorema di Reinsch (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessa matrice S, stessi numeri'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab16_spline.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1, tidyverse e splines (incluso in R).'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
