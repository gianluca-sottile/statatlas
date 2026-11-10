/* StatAtlas · Lab 02 — Variabili bivariate: congiunta, marginali, condizionate.
 * Spunto da Simul2000 (nuvola + istogramma congiunto); implementazione e testi originali. */
(function () {
  var el, S, NB = 30, SHOW = 2500, LIM = 3.6;
  var MODELS = {
    norm: { label: 'Normale bivariata standard con correlazione ρ', par: 'ρ', min: -0.95, max: 0.95, step: 0.05, def: 0.6,
      pair: function (z1, z2, a) { return [z1, a * z1 + Math.sqrt(1 - a * a) * z2]; },
      ylim: [-LIM, LIM],
      dens: function (x, y, a) { var k = 1 - a * a; return Math.exp(-(x * x - 2 * a * x * y + y * y) / (2 * k)) / (2 * Math.PI * Math.sqrt(k)); },
      cmean: function (x, a) { return a * x; }, csd: function (x, a) { return Math.sqrt(1 - a * a); },
      corr: function (a) { return a; }, rY: 'rho * z1 + sqrt(1 - rho^2) * z2', rX: 'z1' },
    quad: { label: 'Dipendenza quadratica: Y = X² − 1 + τZ', par: 'τ', min: 0.1, max: 1.5, step: 0.05, def: 0.4,
      pair: function (z1, z2, a) { return [z1, z1 * z1 - 1 + a * z2]; },
      ylim: [-2, 7],
      dens: function (x, y, a) { return SA.dens.norm(x, 0, 1) * SA.dens.norm(y, x * x - 1, a); },
      cmean: function (x) { return x * x - 1; }, csd: function (x, a) { return a; },
      corr: function () { return 0; }, rY: 'z1^2 - 1 + tau * z2', rX: 'z1' }
  };
  function M() { return MODELS[S.model]; }
  function newState(prev) {
    var s = { model: 'norm', N: 2000, seed: 2026, x0: 1, h: 0.25, pred: null, view: '2d', a: null };
    if (prev) for (var k in s) if (prev[k] !== undefined && prev[k] !== null) s[k] = prev[k];
    if (s.a == null) s.a = MODELS[s.model].def;
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.x = new Float64Array(s.N); s.y = new Float64Array(s.N);
    return s;
  }
  function step() {
    if (S.k >= S.N) return false;
    var z1 = S.rng.norm(), z2 = S.rng.norm(), p = M().pair(z1, z2, S.a);
    S.x[S.k] = p[0]; S.y[S.k] = p[1]; S.k++; return true;
  }
  function inBand(x) { return Math.abs(x - S.x0) <= S.h; }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB, view3 = { az: -0.6, el: 0.55 };
  function drawScatter() {
    var m = M(), P = SA.plot, W = 720, H = 430, ml = 52, mr = 110, mt = 96, mb = 44, yl = m.ylim;
    figA.innerHTML = '';
    var t = SA.theme(), root = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Nuvola di punti con istogrammi marginali', 'font-family': t.sans, 'font-size': 12, xmlns: 'http://www.w3.org/2000/svg' }, figA);
    var x = P.scale(-LIM, LIM, ml, W - mr), y = P.scale(yl[0], yl[1], H - mb, mt), g = P.svg('g', null, root);
    // assi
    P.svg('rect', { x: ml, y: mt, width: W - mr - ml, height: H - mb - mt, fill: 'none', stroke: t.rule }, g);
    P.ticks(-LIM, LIM, 8).forEach(function (v) { P.text(g, x(v), H - mb + 17, String(v).replace('-', '−'), { 'text-anchor': 'middle', fill: t.ink_3 }); });
    P.ticks(yl[0], yl[1], 6).forEach(function (v) { P.text(g, ml - 8, y(v) + 4, String(v).replace('-', '−'), { 'text-anchor': 'end', fill: t.ink_3 }); });
    P.text(g, (ml + W - mr) / 2, H - 8, 'x', { 'text-anchor': 'middle', fill: t.ink_2, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 });
    P.text(g, ml + 6, mt + 14, 'y', { fill: t.ink_2, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 });
    // banda condizionata
    P.svg('rect', { x: x(S.x0 - S.h), y: mt, width: x(S.x0 + S.h) - x(S.x0 - S.h), height: H - mb - mt, fill: t.accent, 'fill-opacity': 0.1, stroke: t.accent, 'stroke-dasharray': '3 3' }, g);
    // punti
    var from = Math.max(0, S.k - SHOW), i, pOut = [], pIn = [];
    for (i = from; i < S.k; i++) {
      var xi = S.x[i], yi = S.y[i]; if (xi < -LIM || xi > LIM || yi < yl[0] || yi > yl[1]) continue;
      (inBand(xi) ? pIn : pOut).push([x(xi), y(yi)]);
    }
    P.dots(g, pOut, 2, t.c1, 0.45); P.dots(g, pIn, 2.2, t.accent, 0.85); // un solo tracciato per gruppo: animazione fluida
    if (S.k) P.svg('circle', { cx: x(S.x[S.k - 1]), cy: y(S.y[S.k - 1]), r: 5, fill: t.accent, stroke: t.card, 'stroke-width': 1.5 }, g);
    // curva di regressione E(Y | X = x)
    var pts = []; for (i = 0; i <= 120; i++) { var xv = -LIM + 2 * LIM * i / 120, yv = m.cmean(xv, S.a); if (yv >= yl[0] && yv <= yl[1]) pts.push([x(xv), y(yv)]); }
    P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
    // istogrammi marginali (sopra: X, a destra: Y) con densità N(0,1) o teorica
    var cx = new Uint32Array(NB), cy = new Uint32Array(NB), bx = 2 * LIM / NB, by = (yl[1] - yl[0]) / NB;
    for (i = 0; i < S.k; i++) {
      var a1 = Math.floor((S.x[i] + LIM) / bx), a2 = Math.floor((S.y[i] - yl[0]) / by);
      if (a1 >= 0 && a1 < NB) cx[a1]++; if (a2 >= 0 && a2 < NB) cy[a2]++;
    }
    var hTop = 70, sTop = hTop / 0.5, wR = 80, sR = wR / (S.model === 'norm' ? 0.5 : 0.6);
    for (i = 0; i < NB; i++) {
      if (S.k) {
        var hx = Math.min(hTop, sTop * cx[i] / (S.k * bx)), hy = Math.min(wR, sR * cy[i] / (S.k * by));
        P.svg('rect', { x: x(-LIM + i * bx), y: mt - 8 - hx, width: x(bx) - x(0), height: hx, fill: t.c1, 'fill-opacity': 0.25, stroke: t.c1, 'stroke-width': 0.6 }, g);
        P.svg('rect', { x: W - mr + 8, y: y(yl[0] + (i + 1) * by), width: hy, height: y(0) - y(by), fill: t.c1, 'fill-opacity': 0.25, stroke: t.c1, 'stroke-width': 0.6 }, g);
      }
    }
    var mx = []; for (i = 0; i <= 120; i++) { var u = -LIM + 2 * LIM * i / 120; mx.push([x(u), mt - 8 - Math.min(hTop, sTop * SA.dens.norm(u, 0, 1))]); }
    P.svg('path', { d: P.path(mx), fill: 'none', stroke: t.c_theory, 'stroke-width': 1.6 }, g);
    var my = []; for (i = 0; i <= 120; i++) { var vv = yl[0] + (yl[1] - yl[0]) * i / 120; my.push([W - mr + 8 + Math.min(wR, sR * margY(vv)), y(vv)]); }
    P.svg('path', { d: P.path(my), fill: 'none', stroke: t.c_theory, 'stroke-width': 1.6 }, g);
    P.text(g, ml, 14, 'marginale di X', { fill: t.ink_3, 'font-size': 11 });
    P.text(g, W - mr + 8, H - mb + 17, 'marginale di Y', { fill: t.ink_3, 'font-size': 11 });
  }
  var margCache = {};
  function margY(v) { // densità marginale di Y: esatta per la normale, integrata numericamente per il modello quadratico
    if (S.model === 'norm') return SA.dens.norm(v, 0, 1);
    var key = S.a + '|' + v.toFixed(3); if (margCache[key] != null) return margCache[key];
    var s = 0, n = 400; for (var i = 0; i <= n; i++) { var u = -6 + 12 * i / n; s += (i % n ? 1 : 0.5) * M().dens(u, v, S.a); }
    return (margCache[key] = s * 12 / n);
  }
  function draw3d() {
    var m = M(), yl = m.ylim, n = 30, xs = [], ys = [], i, j;
    for (i = 0; i < n; i++) { xs.push(-LIM + 2 * LIM * i / (n - 1)); ys.push(yl[0] + (yl[1] - yl[0]) * i / (n - 1)); }
    var Z = xs.map(function (xv) { return ys.map(function (yv) { return m.dens(xv, yv, S.a); }); }), zmax = 0;
    Z.forEach(function (r) { r.forEach(function (v) { zmax = Math.max(zmax, v); }); });
    var B = 14, wx = 2 * LIM / B, wy = (yl[1] - yl[0]) / B, cnt = new Uint32Array(B * B), bars = [];
    for (i = 0; i < S.k; i++) { var a = Math.floor((S.x[i] + LIM) / wx), b = Math.floor((S.y[i] - yl[0]) / wy); if (a >= 0 && a < B && b >= 0 && b < B) cnt[a * B + b]++; }
    if (S.k) for (i = 0; i < B; i++) for (j = 0; j < B; j++) if (cnt[i * B + j]) bars.push([-LIM + (i + 0.5) * wx, yl[0] + (j + 0.5) * wy, cnt[i * B + j] / (S.k * wx * wy)]);
    SA.plot3d.draw(figA, { xs: xs, ys: ys, z: function (a2, b2) { return Z[a2][b2]; }, zmax: +(zmax * 1.05).toPrecision(3), bars: bars, barWidth: 5,
      labels: { x: 'x', y: 'y', z: 'f' }, view: view3, label: 'Densità congiunta e istogramma 3D' });
  }
  function drawCond() {
    var m = M(), P = SA.plot, cm = m.cmean(S.x0, S.a), cs = m.csd(S.x0, S.a), lo = cm - 4.5 * cs, hi = cm + 4.5 * cs, NBc = 30, c = new Uint32Array(NBc), nb = 0, bw = (hi - lo) / NBc;
    for (var i = 0; i < S.k; i++) if (inBand(S.x[i])) { nb++; var b = Math.floor((S.y[i] - lo) / bw); if (b >= 0 && b < NBc) c[b]++; }
    var f = P.frame(figB, { W: 720, H: 240, x: [+lo.toPrecision(3), +hi.toPrecision(3)], y: [0, +(1.45 / (cs * Math.sqrt(2 * Math.PI))).toPrecision(2)], xlabel: 'y', ylabel: 'densità', label: 'Distribuzione condizionata di Y' });
    var t = f.t;
    P.hist(f, c, lo, hi, nb, t.accent, { opacity: 0.2 });
    P.curve(f, function (v) { return SA.dens.norm(v, cm, cs); }, lo, hi, { stroke: t.c_theory });
    P.text(f.g, f.m.l + 8, f.m.t + 12, nb + ' punti con |x − ' + SA.fmt(S.x0, 2) + '| ≤ ' + SA.fmt(S.h, 2), { fill: t.ink_3, 'font-size': 11.5 });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    if (S.view === '3d') legA.append(SA.plot3d.colorbar(1, 'densità relativa'), el('span', sw(t.c1, null), 'istogramma 3D dei punti'));
    else legA.append(el('span', sw(t.c1, null, 'circle'), 'punti simulati'), el('span', sw(t.accent, null, 'circle'), 'punti nella striscia'), el('span', sw(t.c_theory, '7 4'), 'E(Y | X = x)'));
    legB.append(el('span', sw(t.accent, null), 'Y nella striscia'), el('span', sw(t.c_theory, null), 'legge condizionata teorica in x₀'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function stats() {
    var n = S.k; if (n < 3) return null;
    var x = S.x.subarray(0, n), y = S.y.subarray(0, n), mx = SA.stat.mean(x), my = SA.stat.mean(y), sxy = 0, sxx = 0, syy = 0, x2 = [], i, bandY = [];
    for (i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); x2.push(x[i] * x[i]); if (inBand(x[i])) bandY.push(y[i]); }
    var mq = SA.stat.mean(x2), sqq = 0, sqy = 0; for (i = 0; i < n; i++) { sqq += (x2[i] - mq) * (x2[i] - mq); sqy += (x2[i] - mq) * (y[i] - my); }
    return { r: sxy / Math.sqrt(sxx * syy), rq: sqy / Math.sqrt(sqq * syy), cov: sxy / (n - 1), bm: bandY.length ? SA.stat.mean(bandY) : NaN, bs: bandY.length > 1 ? SA.stat.sd(bandY) : NaN, nb: bandY.length };
  }
  function updateTable() {
    var m = M(), s = stats(), fmt = SA.fmt, b = SA.ui.badge, rq = S.model === 'quad' ? Math.sqrt(2 / (2 + S.a * S.a)) : S.a * S.a === 1 ? 1 : NaN;
    var rqTh = S.model === 'norm' ? 0 : rq; // per la normale bivariata Cov(X², Y) = E[X²Y] − E[X²]E[Y] = 0
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Correlazione ρ(X, Y)'), el('td', fmt(m.corr(S.a), 3)), el('td', s ? fmt(s.r, 3) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Correlazione ρ(X², Y)'), el('td', fmt(rqTh, 3)), el('td', s ? fmt(s.rq, 3) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'E(Y | X = x₀)'), el('td', fmt(m.cmean(S.x0, S.a), 3)), el('td', s ? fmt(s.bm, 3) : '—'), el('td', b('approx'))),
      el('tr', el('td', 'Dev. std di Y | X = x₀'), el('td', fmt(m.csd(S.x0, S.a), 3)), el('td', s ? fmt(s.bs, 3) : '—'), el('td', b('approx'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.N), el('span', 'coppie generate')),
      el('div.kpi', el('b', s ? String(s.nb) : '—'), el('span', 'punti nella striscia attorno a x₀')),
      el('div.kpi', el('b', s ? fmt(s.r * s.r, 3) : '—'), el('span', 'r²: quota di varianza di Y spiegata da una retta ')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p02-' + Date.now();
    predBox.append(el('p.prose', 'Se la correlazione tra X e Y è zero, le due variabili sono indipendenti?'),
      el('div.choices', { role: 'radiogroup' }, [['always', 'Sì, sempre'], ['normal', 'Non in generale; sì se la coppia è normale bivariata'], ['never', 'No, mai']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'normal' ? '✓ ' : '✗ ') + 'L’indipendenza implica correlazione nulla, ma non il contrario. Nel modello quadratico ρ(X, Y) = 0 eppure Y è quasi una funzione di X: la correlazione misura solo la dipendenza lineare. Per la normale bivariata, invece, ρ = 0 equivale all’indipendenza. Prova entrambi i modelli.';
  }
  function interpretation() {
    interpBox.innerHTML = S.model === 'norm'
      ? '<p>Nella normale bivariata tutto è governato da ρ: le marginali sono N(0, 1) qualunque sia ρ, mentre la <strong>condizionata</strong> Y | X = x è N(ρx, 1 − ρ²). La media condizionata è una retta (la retta di regressione) e la varianza condizionata non dipende da x: conoscere X riduce l’incertezza su Y del fattore 1 − ρ².</p><p>La striscia arancione approssima il condizionamento a un punto: è un’approssimazione, tanto migliore quanto più la striscia è stretta, ma con meno punti.</p>'
      : '<p>Qui Y dipende fortemente da X, ma la <strong>correlazione è esattamente zero</strong>: Cov(X, X²) = E(X³) = 0 per simmetria. La correlazione cattura solo l’andamento lineare. ρ(X², Y) = √(2/(2 + τ²)), invece, è alta: la dipendenza era lì, ma nella scala sbagliata.</p><p>La condizionata Y | X = x è N(x² − 1, τ²): media che varia con x, varianza costante. Le marginali non rivelano nulla di questo legame.</p>';
  }
  function codeR() {
    var m = M(), par = S.model === 'norm' ? 'rho' : 'tau';
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 02 — ' + m.label,
      '# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse coppie di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'N <- ' + S.N + '; ' + par + ' <- ' + S.a + '; x0 <- ' + S.x0 + '; h <- ' + S.h, '',
      '# Due normali standard per coppia, nell’ordine z1, z2 (riempimento per righe)',
      'z <- matrix(rnorm(2 * N), ncol = 2, byrow = TRUE)', 'z1 <- z[, 1]; z2 <- z[, 2]',
      'coppie <- tibble(x = ' + m.rX + ', y = ' + m.rY + ')', '',
      '# Correlazioni: lineare e con X²',
      'coppie |> summarise(r = cor(x, y), r_x2 = cor(x^2, y))', '',
      '# Distribuzione condizionata approssimata: punti con |x − x0| ≤ h',
      'striscia <- coppie |> filter(abs(x - x0) <= h)',
      'striscia |> summarise(n = n(), media = mean(y), dev_std = sd(y))',
      '# Teoria: E(Y | X = x0) = ' + +m.cmean(S.x0, S.a).toFixed(4) + ', sd = ' + +m.csd(S.x0, S.a).toFixed(4), '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'ggplot(coppie, aes(x, y)) +', '  annotate("rect", xmin = x0 - h, xmax = x0 + h, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.1) +',
      '  geom_point(alpha = 0.35, size = 0.8, colour = "#0072B2") +',
      '  geom_function(fun = \\(x) ' + (S.model === 'norm' ? 'rho * x' : 'x^2 - 1') + ', linetype = "dashed", linewidth = 0.9) +',
      '  geom_density_2d(colour = "grey30", linewidth = 0.3) +',
      '  labs(title = "' + m.label + '", subtitle = "Linea tratteggiata: E(Y | X = x)") +', '  theme_statatlas()', '',
      'ggplot(striscia, aes(y)) +', '  geom_histogram(aes(y = after_stat(density)), bins = 25, fill = "#9A3412", alpha = 0.25, colour = "#9A3412") +',
      '  stat_function(fun = dnorm, args = list(mean = ' + +m.cmean(S.x0, S.a).toFixed(6) + ', sd = ' + +m.csd(S.x0, S.a).toFixed(6) + '), linewidth = 1) +',
      '  labs(title = "Y condizionata a X vicino a x0", x = "y", y = "densità") +', '  theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Congiunta, marginali, condizionate</h3><p>La legge <strong>congiunta</strong> di (X, Y) descrive tutto. Le <strong>marginali</strong> si ottengono integrando: f<sub>X</sub>(x) = ∫ f(x, y) dy. La <strong>condizionata</strong> è una sezione della congiunta, rinormalizzata: f(y | x) = f(x, y)/f<sub>X</sub>(x).</p>' +
        '<h3>Covarianza e correlazione</h3><p>Cov(X, Y) = E[(X − μ<sub>X</sub>)(Y − μ<sub>Y</sub>)], ρ = Cov/(σ<sub>X</sub>σ<sub>Y</sub>) ∈ [−1, 1]. |ρ| = 1 se e solo se Y è funzione lineare di X.</p>' +
        '<div class="callout warn">Indipendenza ⇒ ρ = 0, ma ρ = 0 ⇏ indipendenza. Le marginali non determinano la congiunta.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Normale bivariata</h3><div class="eq">f(x, y) = [2π√(1 − ρ²)]<sup>−1</sup> exp{−(x² − 2ρxy + y²) / (2(1 − ρ²))}</div><p>Costruzione: X = Z₁, Y = ρZ₁ + √(1 − ρ²)Z₂ con Z₁, Z₂ indipendenti N(0, 1). Allora Y | X = x ~ N(ρx, 1 − ρ²): regressione lineare e omoschedastica. Per vettori normali ρ = 0 ⇔ indipendenza, perché la densità si fattorizza.</p>' +
        '<h3>Il modello quadratico</h3><p>Cov(X, X² − 1 + τZ) = E(X³) = 0. Ma Var(Y) = Var(X²) + τ² = 2 + τ² e Cov(X², Y) = Var(X²) = 2, quindi ρ(X², Y) = √(2/(2 + τ²)).</p>' +
        '<h3>Condizionare a un punto</h3><p>Per X continua P(X = x₀) = 0: la striscia |X − x₀| ≤ h stima f(y | x₀) con un errore di ordine h (distorsione) e una varianza di ordine 1/(n h). È lo stesso compromesso dei metodi di regressione non parametrica.</p>' });
    }
  };

  var run, codeBox, ctrlBox, viewSeg;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (S.view === '3d') { if (full || run.frame % 4 === 0) draw3d(); } else drawScatter();
    drawCond(); if (full || run.frame % 6 === 0 || !run.running) updateTable();
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var m = M();
    ctrlBox.append(
      el('label.field', el('span', 'Modello'), el('select', { onchange: function () { S.model = this.value; S.a = MODELS[S.model].def; buildControls(); restart(); } },
        Object.keys(MODELS).map(function (k) { return el('option', { value: k, selected: k === S.model }, MODELS[k].label); }))),
      SA.ui.slider(m.par, { min: m.min, max: m.max, step: m.step, value: S.a, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.a = v; restart(); } }),
      SA.ui.slider('Punto di condizionamento x₀', { min: -2.5, max: 2.5, step: 0.05, value: S.x0, format: function (v) { return SA.fmt(v, 2); }, oninput: function (v) { S.x0 = v; render(true); }, onchange: function () { codeBox.refresh(); } }),
      SA.ui.slider('Semiampiezza della striscia h', { min: 0.05, max: 0.8, step: 0.05, value: S.h, format: function (v) { return SA.fmt(v, 2); }, oninput: function (v) { S.h = v; render(true); }, onchange: function () { codeBox.refresh(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Coppie N'), el('select', { onchange: function () { S.N = +this.value; restart(); } }, [500, 2000, 5000, 20000].map(function (v) { return el('option', { value: v, selected: v === S.N }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Una coppia').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('bivariata', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 2, step: step, render: render, done: function () { return S.k >= S.N; }, progress: function () { return S.k / S.N; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Variabili bivariate', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Due variabili insieme: la nuvola, le sue proiezioni e le sue sezioni. E perché una correlazione nulla può nascondere un legame fortissimo.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Che cosa ci dice X su Y, e quanto ce lo dice la correlazione?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Coppie che si accumulano');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      viewSeg = el('div.seg', { role: 'group', 'aria-label': 'Vista', style: 'margin:6px 0' });
      [['2d', 'Nuvola e marginali'], ['3d', 'Densità 3D']].forEach(function (v) {
        viewSeg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.view === v[0]), onclick: function () {
          S.view = v[0]; viewSeg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.textContent === v[1])); }); legends(); render(true); } }, v[1]));
      });
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'La legge congiunta'), legA), viewSeg, figA),
        el('div.fig', el('div.fig-title', el('h3', 'Sezione: Y quando X è vicino a x₀'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['i', 'x', 'y']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.x[i], S.y[i]]);
          SA.ui.download('statatlas_lab02_' + S.model + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab02.png', [M().label, S.k + ' coppie · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' teoria esatta'), el('span', SA.ui.badge('approx'), ' la striscia approssima il condizionamento a un punto')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Costruzione della normale bivariata e condizionamento (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stesse coppie'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab02_bivariata.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
