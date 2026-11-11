/* StatAtlas · Lab 14 — Regressione quantilica interattiva.
 * Stima esatta: con due parametri esiste una soluzione che interpola due osservazioni
 * (vertice del problema di programmazione lineare); si cercano tutte le coppie. */
(function () {
  var el, S, BINS = 36, TAUS = [0.1, 0.25, 0.5, 0.75, 0.9], B0 = 2, B1 = 0.6, S0 = 0.3, S1 = 0.25;
  var TCOL = { 0.1: 'c4', 0.25: 'c3', 0.5: 'accent', 0.75: 'c3', 0.9: 'c4' }, TDASH = { 0.1: '2 3', 0.25: '7 4', 0.5: null, 0.75: '7 4', 0.9: '2 3' };
  var ERR = {
    norm: { label: 'Normali', q: function (t) { return SA.qnorm(t); }, gen: function (g) { return g.norm(); }, r: 'rnorm(n)', rq: 'qnorm(tau)' },
    t3: { label: 't₃ (code pesanti)', q: function (t) { return SA.laws.get('t').q(t, { df: 3 }); }, gen: function (g) { return SA.laws.get('t').q(g.unif(), { df: 3 }); }, r: 'qt(runif(n), df = 3)', rq: 'qt(tau, df = 3)' },
    skew: { label: 'Esponenziali centrati (asimmetrici)', q: function (t) { return -Math.log1p(-t) - 1; }, gen: function (g) { return -Math.log1p(-g.unif()) - 1; }, r: 'qexp(runif(n)) - 1', rq: 'qexp(tau) - 1' }
  };
  function rho(u, t) { return u * (t - (u < 0 ? 1 : 0)); }
  /* soluzione esatta di min Σ ρ_τ(yᵢ − b₀ − b₁xᵢ) per due parametri */
  function rqFit(pts, t) {
    var n = pts.length, best = Infinity, b0 = 0, b1 = 0;
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      var dx = pts[j][0] - pts[i][0]; if (Math.abs(dx) < 1e-9) continue;
      var s = (pts[j][1] - pts[i][1]) / dx, a = pts[i][1] - s * pts[i][0], L = 0;
      for (var k = 0; k < n; k++) { L += rho(pts[k][1] - a - s * pts[k][0], t); if (L >= best) break; }
      if (L < best) { best = L; b0 = a; b1 = s; }
    }
    return { b0: b0, b1: b1, loss: best };
  }
  function ols(pts) {
    var n = pts.length, mx = 0, my = 0, sxx = 0, sxy = 0;
    pts.forEach(function (p) { mx += p[0] / n; my += p[1] / n; });
    pts.forEach(function (p) { sxx += (p[0] - mx) * (p[0] - mx); sxy += (p[0] - mx) * (p[1] - my); });
    var b1 = sxy / sxx; return { b0: my - b1 * mx, b1: b1 };
  }
  function trueLine(t) { var q = ERR[S.err].q(t); return { b0: B0 + S0 * q, b1: B1 + S1 * q }; }
  function design(n) { var x = []; for (var i = 0; i < n; i++) x.push(10 * (i + 0.5) / n); return x; }

  function newState(prev) {
    var s = { n: 50, err: 'norm', tau: 0.5, M: 500, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.manual = false; s.pts = [];
    s.est = new Float64Array(s.M); s.ols = new Float64Array(s.M); s.counts = new Uint32Array(BINS); s.countsO = new Uint32Array(BINS);
    return s;
  }
  function setRange() { var tl = trueLine(S.tau), sd = 0.9 * (S0 + 5 * S1) / Math.sqrt(S.n) * 1.6; S.hlo = tl.b1 - 4.5 * sd; S.hhi = tl.b1 + 4.5 * sd; }
  function step() {
    if (S.k >= S.M) return false;
    var x = design(S.n), E = ERR[S.err];
    S.pts = x.map(function (xi) { return [xi, B0 + B1 * xi + (S0 + S1 * xi) * E.gen(S.rng)]; }); S.manual = false;
    var f = rqFit(S.pts, S.tau), o = ols(S.pts), bw = (S.hhi - S.hlo) / BINS;
    S.est[S.k] = f.b1; S.ols[S.k] = o.b1;
    var b = Math.floor((f.b1 - S.hlo) / bw); if (b >= 0 && b < BINS) S.counts[b]++;
    var c = Math.floor((o.b1 - S.hlo) / bw); if (c >= 0 && c < BINS) S.countsO[c]++;
    S.k++; return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, figC, legA, legC, frameA = null, drag = null, fitsCache = null;
  function fits() {
    if (fitsCache) return fitsCache;
    var f = {}; TAUS.forEach(function (t) { f[t] = rqFit(S.pts, t); });
    if (TAUS.indexOf(S.tau) < 0) f[S.tau] = rqFit(S.pts, S.tau);
    f.ols = ols(S.pts); return (fitsCache = f);
  }
  function drawMain() {
    var P = SA.plot, F = fits(), yr = S.yr || (S.yr = [-2, Math.ceil(Math.max(12, Math.max.apply(null, S.pts.map(function (p) { return p[1]; })) + 1))]);
    var f = frameA = P.frame(figA, { W: 720, H: 400, x: [-0.3, 10.3], y: yr, xlabel: 'x', ylabel: 'y', label: 'Dati e rette quantiliche' });
    var t = f.t, g = f.g; f.root.style.touchAction = 'none'; f.root.style.cursor = 'crosshair';
    TAUS.concat(TAUS.indexOf(S.tau) < 0 ? [S.tau] : []).forEach(function (tau) {
      var c = F[tau], sel = Math.abs(tau - S.tau) < 1e-9, col = sel ? t.accent : t[TCOL[tau] || 'c4'];
      P.curve(f, function (x) { return c.b0 + c.b1 * x; }, -0.3, 10.3, { stroke: col, 'stroke-width': sel ? 3 : 1.6, 'stroke-dasharray': sel ? null : (TDASH[tau] || '4 3'), 'stroke-opacity': sel ? 1 : 0.85 });
      P.text(g, f.x(10.3) - 4, f.y(c.b0 + c.b1 * 10.3) - 5, 'τ = ' + SA.fmt(tau, 2).replace(/0+$/, '').replace(/,$/, ''), { 'text-anchor': 'end', fill: col, 'font-size': 12, 'font-weight': sel ? 700 : 500 });
    });
    P.curve(f, function (x) { return F.ols.b0 + F.ols.b1 * x; }, -0.3, 10.3, { stroke: t.c1, 'stroke-width': 2, 'stroke-dasharray': '10 4' });
    var sel = F[S.tau];
    S.pts.forEach(function (p, i) {
      var r = p[1] - sel.b0 - sel.b1 * p[0], on = Math.abs(r) < 1e-7;
      P.svg('circle', { cx: f.x(p[0]), cy: f.y(Math.max(yr[0], Math.min(yr[1], p[1]))), r: on ? 6 : 4.2, fill: on ? t.accent : r < 0 ? t.ink : t.card, 'fill-opacity': on ? 1 : 0.55, stroke: on ? t.card : t.ink, 'stroke-width': on ? 2 : 1, 'data-i': i, style: 'cursor:grab' }, g);
    });
    P.text(g, f.m.l + 8, f.m.t + 12, (S.manual ? 'Dati modificati a mano' : 'Campione ' + S.k + ' dal modello') + ' · punti pieni: sotto la retta τ selezionata · arancioni: interpolati', { fill: t.ink_3, 'font-size': 11.5 });
  }
  function drawLoss() {
    var P = SA.plot, f = P.frame(figB, { W: 720, H: 200, x: [-3, 3], y: [0, 2.8], xlabel: 'residuo u', ylabel: 'ρτ(u)', label: 'Funzione di perdita asimmetrica' });
    var t = f.t;
    P.curve(f, function (u) { return Math.abs(u); }, -3, 3, { stroke: t.ink_3, 'stroke-dasharray': '3 3', 'stroke-width': 1.2 });
    P.curve(f, function (u) { return u * u / 3.2; }, -3, 3, { stroke: t.c1, 'stroke-dasharray': '10 4', 'stroke-width': 1.4 });
    P.curve(f, function (u) { return rho(u, S.tau) * 2; }, -3, 3, { stroke: t.accent, 'stroke-width': 3 });
    P.text(f.g, f.x(-2.9), f.y(2.55), 'pendenza a sinistra −' + SA.fmt(1 - S.tau, 2) + ' · a destra ' + SA.fmt(S.tau, 2) + ' (scala ×2)', { fill: t.accent, 'font-size': 12, 'font-weight': 600 });
  }
  function drawSlopes() {
    var P = SA.plot, tl = trueLine(S.tau), sd = (S.hhi - S.hlo) / 9, f = P.frame(figC, { W: 720, H: 230, x: [+S.hlo.toPrecision(3), +S.hhi.toPrecision(3)], y: [0, +(1.6 / (sd * Math.sqrt(2 * Math.PI))).toPrecision(2)], xlabel: 'pendenza stimata', ylabel: 'densità', label: 'Distribuzione della pendenza stimata' });
    var t = f.t;
    P.hist(f, S.countsO, S.hlo, S.hhi, S.k, t.c1, { opacity: 0.08, dash: '6 3' });
    P.hist(f, S.counts, S.hlo, S.hhi, S.k, t.accent, { opacity: 0.18 });
    [[tl.b1, t.accent, 'β₁(τ) vero'], [B1, t.c1, 'pendenza della media']].forEach(function (v, i) {
      P.svg('line', { x1: f.x(v[0]), x2: f.x(v[0]), y1: f.m.t, y2: f.y(0), stroke: v[1], 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, f.g);
      P.text(f.g, f.x(v[0]) + 4, f.m.t + 12 + 14 * i, v[2], { fill: v[1], 'font-size': 11.5 });
    });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legC.innerHTML = '';
    legA.append(el('span', sw(t.accent, null), 'τ selezionato'), el('span', sw(t.c3, '7 4'), 'τ = 0,25 e 0,75'), el('span', sw(t.c4, '2 3'), 'τ = 0,1 e 0,9'), el('span', sw(t.c1, '10 4'), 'minimi quadrati (media)'));
    legC.append(el('span', sw(t.accent, null), 'regressione quantilica, τ = ' + SA.fmt(S.tau, 2)), el('span', sw(t.c1, '6 3'), 'minimi quadrati'));
  }

  /* interazione: trascina, aggiungi, elimina */
  function toData(ev) {
    var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !frameA) return null;
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.max(0, Math.min(10, frameA.x.invert(p.x))), Math.max(S.yr[0], Math.min(S.yr[1], frameA.y.invert(p.y)))];
  }
  function refresh(light) { fitsCache = null; if (drag == null) S.yr = null; drawMain(); if (!light) updateTable(); }
  function bind() {
    figA.addEventListener('pointerdown', function (ev) {
      var c = ev.target.closest && ev.target.closest('circle[data-i]'), q = toData(ev); if (!q) return; run.stop();
      if (c) { drag = +c.getAttribute('data-i'); figA.setPointerCapture(ev.pointerId); } else { S.pts.push(q); S.manual = true; refresh(); }
    });
    figA.addEventListener('pointermove', function (ev) { if (drag == null) return; var q = toData(ev); if (!q) return; S.pts[drag] = q; S.manual = true; refresh(true); });
    figA.addEventListener('pointerup', function () { if (drag != null) { drag = null; refresh(); } });
    figA.addEventListener('dblclick', function (ev) { var c = ev.target.closest && ev.target.closest('circle[data-i]'); if (!c || S.pts.length <= 4) return; S.pts.splice(+c.getAttribute('data-i'), 1); S.manual = true; refresh(); });
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var F = fits(), fmt = SA.fmt, n = S.pts.length;
    tblBody.innerHTML = '';
    TAUS.forEach(function (tau) {
      var c = F[tau], below = 0; S.pts.forEach(function (p) { if (p[1] - c.b0 - c.b1 * p[0] < -1e-9) below++; });
      tblBody.appendChild(el('tr' + (Math.abs(tau - S.tau) < 1e-9 ? '.row-sel' : ''), el('td', 'τ = ' + fmt(tau, 2)), el('td', fmt(trueLine(tau).b1, 3)), el('td', fmt(c.b1, 3)),
        el('td', fmt(below / n, 3) + ' (≤ ' + fmt(tau, 2) + ')'), el('td', SA.ui.badge('exact'))));
    });
    var v = S.est.subarray(0, S.k), o = S.ols.subarray(0, S.k);
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni dal modello')),
      el('div.kpi', el('b', S.k > 1 ? fmt(SA.stat.mean(v), 3) + ' ± ' + fmt(SA.stat.sd(v), 3) : '—'), el('span', 'pendenza quantilica τ = ' + fmt(S.tau, 2) + ': media ± dev. std '), SA.ui.badge('mc')),
      el('div.kpi', el('b', S.k > 1 ? fmt(SA.stat.mean(o), 3) + ' ± ' + fmt(SA.stat.sd(o), 3) : '—'), el('span', 'pendenza dei minimi quadrati ')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p14-' + Date.now();
    predBox.append(el('p.prose', 'In questi dati la variabilità di y cresce con x. Come saranno le rette dei quantili 0,1 e 0,9 rispetto alla retta della mediana?'),
      el('div.choices', { role: 'radiogroup' }, [['parallel', 'Parallele alla mediana, solo spostate'], ['fan', 'Sempre più distanti al crescere di x (a ventaglio)'], ['same', 'Coincidenti con la mediana']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'fan' ? '✓ ' : '✗ ') + 'Il quantile condizionato è β₀ + β₁x + (' + S0 + ' + ' + S1 + 'x)·q_τ: la pendenza dipende da τ (β₁(0,9) − β₁(0,1) = ' + SA.fmt(trueLine(0.9).b1 - trueLine(0.1).b1, 2) + '). Con errori omoschedastici le rette sarebbero parallele: la regressione quantilica rivela l’eteroschedasticità che la media nasconde.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Ogni retta descrive un <strong>quantile condizionato</strong> di y dato x: la retta τ = 0,9 lascia sotto di sé circa il 90% dei punti, a ogni x. Insieme, le rette raccontano l’intera distribuzione condizionata, non solo la sua media.</p>' +
      '<p>La stima minimizza la perdita asimmetrica ρ<sub>τ</sub>: i residui positivi pesano τ, quelli negativi 1 − τ. Una conseguenza esatta: la retta passa per almeno due osservazioni (in arancione) e la quota di punti sotto di essa è al più τ. Trascina un punto lontano verso l’alto: la retta mediana quasi non si muove finché il punto resta dalla stessa parte, la retta dei minimi quadrati sì.</p>' +
      '<p class="muted">Con errori asimmetrici la mediana condizionata e la media condizionata hanno pendenze diverse; con errori a code pesanti la pendenza mediana è più stabile di quella dei minimi quadrati.</p>';
  }
  function codeR() {
    var E = ERR[S.err];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 14 — Regressione quantilica', '# Errori: ' + E.label + ' · stessi campioni di StatAtlas con R ≥ 4.1',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', 'library(quantreg)   # install.packages("quantreg")', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; M <- ' + S.M + '; tau <- ' + S.tau,
      'b0 <- ' + B0 + '; b1 <- ' + B1 + '; s0 <- ' + S0 + '; s1 <- ' + S1 + '   # y = b0 + b1 x + (s0 + s1 x) e', 'x <- 10 * (seq_len(n) - 0.5) / n',
      'errori <- function(n) ' + E.r, '', '# Pendenza vera del quantile tau: b1 + s1 * q_tau(e)', 'pendenza_vera <- b1 + s1 * ' + E.rq, '',
      '# Primo campione e rette per cinque quantili',
      'dati <- tibble(x = x, y = b0 + b1 * x + (s0 + s1 * x) * errori(n))',
      'taus <- c(0.1, 0.25, 0.5, 0.75, 0.9)', 'fit <- rq(y ~ x, tau = taus, data = dati)', 'coef(fit)', '',
      '# Quota di punti sotto ciascuna retta (≈ tau)', 'colMeans(dati$y < fitted(fit))', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'rette <- tibble(tau = factor(taus), intercetta = coef(fit)[1, ], pendenza = coef(fit)[2, ])',
      'ggplot(dati, aes(x, y)) +', '  geom_point(alpha = 0.6) +',
      '  geom_abline(data = rette, aes(intercept = intercetta, slope = pendenza, colour = tau), linewidth = 0.9) +',
      '  geom_smooth(method = "lm", se = FALSE, colour = "#0072B2", linetype = "dashed") +',
      '  scale_colour_viridis_d(end = 0.85) +', '  labs(title = "Rette quantiliche e retta dei minimi quadrati", colour = expression(tau)) +', '  theme_statatlas()', '',
      '# Campioni ripetuti: distribuzione della pendenza quantilica (il primo campione è già stato generato)',
      'set.seed(' + S.seed + ')',
      'sim <- map(seq_len(M), \\(m) {', '  y <- b0 + b1 * x + (s0 + s1 * x) * errori(n)',
      '  tibble(quantilica = coef(rq(y ~ x, tau = tau))[2], minimi_quadrati = coef(lm(y ~ x))[2])', '}) |> list_rbind()',
      'sim |> summarise(across(everything(), list(media = mean, dev_std = sd)))', 'pendenza_vera', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Dalla media ai quantili</h3><p>La regressione lineare classica modella E(Y | x). La regressione quantilica modella il quantile condizionato Q<sub>τ</sub>(Y | x) = β₀(τ) + β₁(τ)x per ogni τ in (0, 1): la mediana per τ = 0,5, le code per τ vicino a 0 o 1.</p>' +
        '<div class="eq">β̂(τ) = argmin Σ ρ<sub>τ</sub>(yᵢ − b₀ − b₁xᵢ), &nbsp; ρ<sub>τ</sub>(u) = u (τ − 1{u &lt; 0})</div>' +
        '<p>Per τ = 0,5 si ritrova la regressione L1 del laboratorio 11. Non serve alcuna ipotesi sulla legge degli errori, ed è robusta ai valori anomali nella y.</p>' +
        '<div class="callout">Quando le rette per τ diversi hanno pendenze diverse, la x non sposta solo il centro della distribuzione ma ne cambia la dispersione o la forma: è eteroschedasticità, o asimmetria che varia con x.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Programmazione lineare</h3><p>Scrivendo yᵢ − xᵢᵀb = uᵢ⁺ − uᵢ⁻ il problema diventa min Σ τuᵢ⁺ + (1 − τ)uᵢ⁻ con vincoli lineari: un problema di programmazione lineare. Una soluzione ottima sta su un vertice, cioè interpola p osservazioni (qui p = 2): StatAtlas esplora tutte le coppie e trova la soluzione esatta. R usa l’algoritmo del simplesso di Barrodale e Roberts (<code>rq(method = "br")</code>).</p>' +
        '<h3>Proprietà di sottogradiente</h3><p>All’ottimo la quota di residui negativi è ≤ τ e quella di residui non positivi è ≥ τ: per questo circa una quota τ di punti sta sotto la retta.</p>' +
        '<h3>Distribuzione asintotica</h3><div class="eq">√n (β̂(τ) − β(τ)) → N(0, τ(1 − τ) H⁻¹ J H⁻¹)</div><p>con J = E[xxᵀ] e H = E[f<sub>Y|x</sub>(Q<sub>τ</sub>) xxᵀ]: la precisione dipende dalla densità condizionata nel quantile, che va stimata (metodi di Hendricks–Koenker o bootstrap; in R <code>summary(fit, se = "nid")</code>).</p>' +
        '<h3>Attraversamento dei quantili</h3><p>Stimate separatamente, le rette per τ diversi possono incrociarsi all’interno del campo dei dati, il che è incoerente. Rimedi: riordinamento (Chernozhukov, Fernández-Val e Galichon, 2010) o stima congiunta con vincoli di non attraversamento.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); setRange(); step(); fitsCache = null; legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { fitsCache = null; S.yr = null; drawMain(); drawLoss(); drawSlopes(); if (full || run.frame % 4 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    ctrlBox.append(
      el('label.field', el('span', 'Errori'), el('select', { onchange: function () { S.err = this.value; restart(); } }, Object.keys(ERR).map(function (k) { return el('option', { value: k, selected: k === S.err }, ERR[k].label); }))),
      SA.ui.slider('Quantile τ evidenziato', { min: 0.05, max: 0.95, step: 0.05, value: S.tau, format: function (v) { return SA.fmt(v, 2); }, oninput: function (v) { S.tau = v; fitsCache = null; drawMain(); drawLoss(); }, onchange: function (v) { S.tau = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [20, 50, 80].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
        el('label.field', el('span', 'Campioni M'), el('select', { onchange: function () { S.M = +this.value; restart(); } }, [200, 500, 1000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      SA.ui.button('Aggiungi un valore anomalo', { onclick: function () { run.stop(); S.pts.push([9.5, -1.5]); S.manual = true; refresh(); } }));
    run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('quantilica', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S); setRange();
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.M; }, progress: function () { return S.k / S.M; }, reset: function () { S = newState(S); setRange(); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione quantilica', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Non solo la media: ogni quantile della risposta ha la sua retta. Insieme descrivono come x cambia l’intera distribuzione di y.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Che cosa ci sfugge se della relazione tra x e y guardiamo solo la media?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Rette quantiliche da toccare');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); legA = el('div.legend'); legC = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Dati e rette quantiliche'), legA), el('p.muted', { style: 'margin:2px 0 4px;font-size:.8rem' }, 'Trascina un punto · clic su un’area vuota per aggiungerne uno · doppio clic per eliminarlo'), figA),
        el('div.fig', el('div.fig-title', el('h3', 'La perdita asimmetrica ρτ'), el('div.legend', el('span.muted', 'arancione: ρτ · tratteggio blu: quadrato (minimi quadrati) · grigio: valore assoluto'))), figB),
        el('div.fig', el('div.fig-title', el('h3', 'Pendenza stimata nei campioni ripetuti'), legC), figC),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['x', 'y']]; S.pts.forEach(function (p) { rows.push(p); }); SA.ui.download('statatlas_lab14_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab14.png', ['Regressione quantilica', S.pts.length + ' punti · τ = ' + S.tau + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantile'), el('th', 'Pendenza vera'), el('th', 'Pendenza stimata (campione corrente)'), el('th', 'Quota di punti sotto la retta'), el('th', 'Proprietà'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Programmazione lineare, distribuzione asintotica, attraversamento (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'quantreg::rq()'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab14_quantilica.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1, tidyverse e quantreg.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh(); bind();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
