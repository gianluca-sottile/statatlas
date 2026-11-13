/* StatAtlas · Lab 11 — Regressione L1, L2 e Lp: criteri di stima e robustezza.
 * Spunto da Simul2000 (regressione in norma Lp); implementazione e testi originali. */
(function () {
  var el, S, BINS = 40, B0 = 1, B1 = 0.5;
  var ERRS = { // e standardizzato (dove possibile varianza 1); ε = σ e
    norm:    { label: 'Normali', f0: 1 / Math.sqrt(2 * Math.PI), v: 1, dens: function (e) { return SA.dens.norm(e, 0, 1); },
      gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = g.norm(); return o; }, r: 'rnorm(n)' },
    laplace: { label: 'Laplace (code esponenziali)', f0: 1 / Math.sqrt(2), v: 1, dens: function (e) { return SA.dens.laplace(e, 0, Math.SQRT1_2); },
      gen: function (g, n) { var o = new Float64Array(n), b = Math.SQRT1_2; for (var i = 0; i < n; i++) { var u = g.unif() - 0.5; o[i] = -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u)); } return o; },
      r: '{ u <- runif(n) - 0.5; -sqrt(0.5) * sign(u) * log(1 - 2 * abs(u)) }' },
    t2:      { label: 't₂ (varianza infinita)', f0: 1 / (2 * Math.SQRT2), v: Infinity, dens: function (e) { return SA.laws.get('t').pdf(e, { df: 2 }); },
      gen: function (g, n) { var o = new Float64Array(n), L = SA.laws.get('t'); for (var i = 0; i < n; i++) o[i] = L.q(g.unif(), { df: 2 }); return o; }, r: 'qt(runif(n), df = 2)' },
    contam:  { label: 'Normali contaminate (10% con scala 10)', f0: 0.9 / Math.sqrt(2 * Math.PI) + 0.1 / (10 * Math.sqrt(2 * Math.PI)), v: 0.9 + 0.1 * 100,
      dens: function (e) { return 0.9 * SA.dens.norm(e, 0, 1) + 0.1 * SA.dens.norm(e, 0, 10); },
      gen: function (g, n) { var z = new Float64Array(n), i; for (i = 0; i < n; i++) z[i] = g.norm(); for (i = 0; i < n; i++) if (g.unif() < 0.1) z[i] *= 10; return z; },
      r: '{ z <- rnorm(n); u <- runif(n); ifelse(u < 0.1, 10 * z, z) }' }
  };
  var METH = [
    { key: 'l2', label: 'L2 · minimi quadrati', col: 'c1', dash: null, shape: 'tri' },
    { key: 'l1', label: 'L1 · minimi valori assoluti', col: 'c2', dash: '7 4', shape: 'diamond' },
    { key: 'lp', label: 'Lp', col: 'c3', dash: '2 3', shape: 'circle' }];

  function xs(n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = 10 * (i + 0.5) / n; return o; }
  /* Lp con minimi quadrati ponderati iterativi (IRLS) (IRLS): pesi |rᵢ|^(p−2), con soglia per p < 2. Identico nello script R. */
  function fitLp(x, y, p) {
    var n = x.length, b0, b1, it;
    function wls(w) {
      var sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (var i = 0; i < n; i++) { sw += w[i]; sx += w[i] * x[i]; sy += w[i] * y[i]; }
      var mx = sx / sw, my = sy / sw;
      for (i = 0; i < n; i++) { sxx += w[i] * (x[i] - mx) * (x[i] - mx); sxy += w[i] * (x[i] - mx) * (y[i] - my); }
      b1 = sxy / sxx; b0 = my - b1 * mx;
    }
    var w = new Float64Array(n).fill(1); wls(w);
    if (p === 2) return [b0, b1];
    for (it = 0; it < 500; it++) {
      var o0 = b0, o1 = b1;
      for (var i = 0; i < n; i++) w[i] = Math.pow(Math.max(Math.abs(y[i] - b0 - b1 * x[i]), 1e-6), p - 2);
      wls(w);
      if (Math.abs(b0 - o0) + Math.abs(b1 - o1) < 1e-10) break;
    }
    return [b0, b1];
  }
  /* varianza asintotica di uno M-stimatore con ψ(e) = |e|^(p−1) sign(e): E ψ² / (E ψ')², per il fattore 1/Sxx */
  function lpAsymVar(errKey, p) {
    var E = ERRS[errKey];
    if (p === 1) return 1 / (4 * E.f0 * E.f0);
    if (errKey === 't2' && p >= 2) return Infinity; // E|e|^(2p−2) diverge per la t₂
    function integ(q) { // 2 ∫₀^∞ e^q f(e) de, con e = (u/(1−u))^k e k = 1/(p−1) che toglie la singolarità in 0
      var k = 1 / (p - 1), N = 20000, s = 0;
      for (var i = 0; i < N; i++) { var u = (i + 0.5) / N, r = u / (1 - u), e = Math.pow(r, k), de = k * Math.pow(r, k - 1) / ((1 - u) * (1 - u)); var v = Math.pow(e, q) * E.dens(e) * de; if (isFinite(v)) s += v; }
      return 2 * s / N;
    }
    var num = integ(2 * p - 2), den = (p - 1) * integ(p - 2);
    return num / (den * den);
  }

  function newState(prev) {
    var s = { n: 30, err: 'norm', sigma: 1, p: 1.5, M: 1000, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.last = null; s.x = xs(s.n);
    var sxx = 0; for (var i = 0; i < s.n; i++) sxx += (s.x[i] - 5) * (s.x[i] - 5); s.sxx = sxx;
    s.th = { l2: s.sigma * s.sigma * ERRS[s.err].v / sxx, l1: s.sigma * s.sigma * lpAsymVar(s.err, 1) / sxx, lp: s.sigma * s.sigma * lpAsymVar(s.err, s.p) / sxx };
    var ref = Math.sqrt(s.th.l1); s.hlo = B1 - 5 * ref; s.hhi = B1 + 5 * ref;
    s.est = {}; s.counts = {}; s.out = {};
    METH.forEach(function (m) { s.est[m.key] = new Float64Array(s.M); s.counts[m.key] = new Uint32Array(BINS); s.out[m.key] = 0; });
    return s;
  }
  function step() {
    if (S.k >= S.M) return false;
    var e = ERRS[S.err].gen(S.rng, S.n), y = new Float64Array(S.n), i;
    for (i = 0; i < S.n; i++) y[i] = B0 + B1 * S.x[i] + S.sigma * e[i];
    var fits = { l2: fitLp(S.x, y, 2), l1: fitLp(S.x, y, 1), lp: fitLp(S.x, y, S.p) }, bw = (S.hhi - S.hlo) / BINS;
    METH.forEach(function (m) {
      var b = fits[m.key][1]; S.est[m.key][S.k] = b;
      var j = Math.floor((b - S.hlo) / bw); if (j >= 0 && j < BINS) S.counts[m.key][j]++; else S.out[m.key]++;
    });
    S.last = { y: y, fits: fits }; S.k++; return true;
  }

  var figA, figB, legA, legB;
  function drawData() {
    var P = SA.plot, yl = [B0 - 6 * S.sigma, B0 + B1 * 10 + 6 * S.sigma];
    var F = P.frame(figA, { W: 720, H: 320, x: [0, 10], y: [+yl[0].toFixed(0), +yl[1].toFixed(0)], xlabel: 'x', ylabel: 'y', label: 'Campione corrente e rette stimate' });
    var t = F.t, g = F.g;
    P.curve(F, function (x) { return B0 + B1 * x; }, 0, 10, { stroke: t.ink_3, 'stroke-dasharray': '2 3', 'stroke-width': 1.2 });
    if (!S.last) { P.text(g, 360, 140, 'Premi ▶: ogni passo genera un nuovo campione e tre stime', { 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }); return; }
    var y = S.last.y, out = 0;
    for (var i = 0; i < S.n; i++) {
      if (y[i] < yl[0] || y[i] > yl[1]) { out++; P.svg('path', { d: 'M' + F.x(S.x[i]) + ',' + (y[i] > yl[1] ? F.m.t + 2 : F.y(yl[0]) - 2) + 'l-4,' + (y[i] > yl[1] ? 7 : -7) + 'h8z', fill: t.accent }, g); continue; }
      P.svg('circle', { cx: F.x(S.x[i]), cy: F.y(y[i]), r: 3.4, fill: t.ink, 'fill-opacity': 0.55 }, g);
    }
    METH.forEach(function (m) { var c = S.last.fits[m.key]; P.curve(F, function (x) { return c[0] + c[1] * x; }, 0, 10, { stroke: t[m.col], 'stroke-dasharray': m.dash, 'stroke-width': 2.2 }); });
    if (out) P.text(g, F.W - F.m.r, F.m.t + 12, out + ' punti fuori scala (triangoli)', { 'text-anchor': 'end', fill: t.accent, 'font-size': 11.5 });
  }
  function drawSlopes() {
    var P = SA.plot, peak = 0; METH.forEach(function (m) { peak = Math.max(peak, 1 / Math.sqrt(2 * Math.PI * S.th[m.key])); });
    if (!isFinite(peak) || !(peak > 0)) peak = 1 / Math.sqrt(2 * Math.PI * S.th.l1);
    var F = P.frame(figB, { W: 720, H: 270, x: [+S.hlo.toPrecision(3), +S.hhi.toPrecision(3)], y: [0, +(1.35 * peak).toPrecision(2)], xlabel: 'pendenza stimata', ylabel: 'densità', label: 'Distribuzioni campionarie delle pendenze' });
    var t = F.t;
    METH.forEach(function (m) { P.hist(F, S.counts[m.key], S.hlo, S.hhi, S.k, t[m.col], { opacity: 0.1, dash: m.dash }); });
    METH.forEach(function (m) { var v = S.th[m.key]; if (isFinite(v)) P.curve(F, function (b) { return SA.dens.norm(b, B1, Math.sqrt(v)); }, S.hlo, S.hhi, { stroke: t[m.col], 'stroke-dasharray': m.dash, 'stroke-width': 2 }); });
    P.svg('line', { x1: F.x(B1), x2: F.x(B1), y1: F.m.t, y2: F.y(0), stroke: t.ink, 'stroke-dasharray': '3 3' }, F.g);
    var notes = METH.filter(function (m) { return S.out[m.key]; }).map(function (m) { return m.key.toUpperCase() + ' ' + S.out[m.key]; });
    if (notes.length) P.text(F.g, F.W - F.m.r, F.m.t + 12, 'Fuori scala: ' + notes.join(' · '), { 'text-anchor': 'end', fill: t.accent, 'font-size': 11.5 });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    METH.forEach(function (m) { legA.appendChild(el('span', sw(t[m.col], m.dash), m.key === 'lp' ? 'Lp, p = ' + SA.fmt(S.p, 2) : m.label)); });
    legA.appendChild(el('span', sw(t.ink_3, '2 3'), 'retta vera'));
    legB.append(el('span.muted', 'aree: simulazione · curve: normale asintotica'));
  }

  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function summary(key) {
    if (S.k < 3) return null;
    var v = S.est[key].subarray(0, S.k), srt = SA.stat.sorted(v), mse = 0; for (var i = 0; i < v.length; i++) mse += (v[i] - B1) * (v[i] - B1);
    return { m: SA.stat.mean(v), sd: SA.stat.sd(v), iqr: SA.stat.quantile(srt, 0.75, true) - SA.stat.quantile(srt, 0.25, true), mse: mse / v.length };
  }
  function updateTable() {
    var fmt = SA.fmt, sw = SA.plot.legendSwatch, t = SA.theme();
    tblBody.innerHTML = '';
    METH.forEach(function (m) {
      var s = summary(m.key), v = S.th[m.key];
      tblBody.appendChild(el('tr', el('td', el('span.est', sw(t[m.col], m.dash, m.shape), m.key === 'lp' ? 'Lp (p = ' + SA.fmt(S.p, 2) + ')' : m.label)),
        el('td', s ? fmt(s.m, 4) : '—'), el('td', s ? fmt(s.sd, 4) : '—', el('span.th', { style: 'display:block;color:var(--ink-3);font-size:.85em' }, 'asintotica ' + (isFinite(v) ? fmt(Math.sqrt(v), 4) : 'non esiste'))),
        el('td', s ? fmt(s.iqr, 4) : '—'), el('td', s ? fmt(s.mse, 5) : '—'), el('td', SA.ui.badge(m.key === 'l2' && S.err === 'norm' ? 'exact' : 'asym'))));
    });
    var best = null, bv = Infinity; METH.forEach(function (m) { var s = summary(m.key); if (s && s.iqr < bv) { bv = s.iqr; best = m; } });
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni di n = ' + S.n)),
      el('div.kpi', el('b', fmt(S.th.l2 / S.th.l1, 3)), el('span', 'efficienza asintotica L1 rispetto a L2 ')),
      el('div.kpi', el('b', best ? (best.key === 'lp' ? 'Lp' : best.key.toUpperCase()) : '—'), el('span', 'stimatore più concentrato (scarto interquartile)')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p11-' + Date.now();
    predBox.append(el('p.prose', 'Con errori «' + ERRS[S.err].label + '», quale criterio stima la pendenza con meno variabilità?'),
      el('div.choices', { role: 'radiogroup' }, [['l2', 'L2: minimi quadrati'], ['l1', 'L1: minimi valori assoluti'], ['lp', 'Lp con 1 < p < 2, una via di mezzo']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    if (S.k < 200) { fbBox.textContent = 'Previsione registrata: il confronto compare dopo 200 campioni (ora ' + S.k + ').'; return; }
    var best = null, bv = Infinity; METH.forEach(function (m) { var s = summary(m.key); if (s.iqr < bv) { bv = s.iqr; best = m.key; } });
    fbBox.textContent = (S.pred === best ? '✓ ' : '✗ ') + 'Nella simulazione vince ' + (best === 'lp' ? 'Lp' : best.toUpperCase()) + '. ' +
      (S.err === 'norm' ? 'Con errori normali i minimi quadrati sono lo stimatore di massima verosimiglianza ed efficiente.' : S.err === 'laplace' ? 'Con errori di Laplace L1 è la massima verosimiglianza.' : 'Con code pesanti o contaminazione i residui grandi dominano la somma dei quadrati: criteri che li pesano meno sono più stabili.');
  }
  function interpretation() {
    interpBox.innerHTML = '<p>I tre criteri cercano la retta che rende piccoli i residui, ma li misurano diversamente: <strong>L2</strong> somma i quadrati e quindi amplifica i residui grandi; <strong>L1</strong> somma i valori assoluti e tratta un residuo enorme come uno grande; <strong>Lp</strong> con 1 &lt; p &lt; 2 sta nel mezzo. Ciascuno è la massima verosimiglianza per una legge degli errori (Normale, Laplace, normale generalizzata di indice p).</p>' +
      '<p>' + (ERRS[S.err].v === Infinity ? 'Con errori t₂ la varianza non esiste: la varianza asintotica dei minimi quadrati è infinita e la loro dispersione simulata non si stabilizza, mentre L1 e Lp restano ben definiti.' : 'L’efficienza relativa L1/L2 = ' + SA.fmt(S.th.l2 / S.th.l1, 2) + ' indica quante osservazioni in più servirebbero a L2 (se > 1) o a L1 (se < 1) per la stessa precisione.') + '</p>' +
      '<p class="muted">Le curve sono approssimazioni asintotiche; per L1 e Lp la stima è calcolata numericamente con minimi quadrati ponderati iterativi (IRLS), lo stesso algoritmo dello script R.</p>';
  }
  function codeR() {
    var E = ERRS[S.err];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 11 — Regressione L1, L2 e Lp',
      '# Errori: ' + E.label + ' · con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')',
      'n <- ' + S.n + '; M <- ' + S.M + '; sigma <- ' + S.sigma + '; p <- ' + S.p + '; b0 <- ' + B0 + '; b1 <- ' + B1,
      'x <- (seq_len(n) - 0.5) / n * 10', 'errori <- function(n) ' + E.r, '',
      '# Regressione Lp per minimi quadrati ponderati iterativi (IRLS) (stesso algoritmo di StatAtlas)',
      'fit_lp <- function(x, y, p, maxit = 500) {',
      '  w <- rep(1, length(x))', '  wls <- function(w) { coef(lm(y ~ x, weights = w)) }',
      '  b <- wls(w)', '  if (p == 2) return(b)',
      '  for (i in seq_len(maxit)) {', '    w <- pmax(abs(y - b[1] - b[2] * x), 1e-6)^(p - 2)', '    b_new <- wls(w)',
      '    if (sum(abs(b_new - b)) < 1e-10) { b <- b_new; break }', '    b <- b_new', '  }', '  b', '}',
      '# Per L1 esiste anche l’algoritmo esatto: quantreg::rq(y ~ x, tau = 0.5)', '',
      'sim <- tibble(replica = seq_len(M)) |>',
      '  mutate(y  = map(replica, \\(r) b0 + b1 * x + sigma * errori(n)),',
      '         L2 = map_dbl(y, \\(y) fit_lp(x, y, 2)[2]),',
      '         L1 = map_dbl(y, \\(y) fit_lp(x, y, 1)[2]),',
      '         Lp = map_dbl(y, \\(y) fit_lp(x, y, p)[2]))', '',
      'stime <- sim |> dplyr::select(L2, L1, Lp) |> pivot_longer(everything(), names_to = "metodo", values_to = "pendenza")',
      'stime |> group_by(metodo) |>',
      '  summarise(media = mean(pendenza), dev_std = sd(pendenza), iqr = IQR(pendenza), mse = mean((pendenza - b1)^2))', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'ggplot(stime, aes(pendenza, colour = metodo, fill = metodo)) +',
      '  geom_density(alpha = 0.1) +', '  geom_vline(xintercept = b1, linetype = "dashed") +',
      '  scale_colour_manual(values = c(L2 = "#0072B2", L1 = "#D55E00", Lp = "#009E73"), aesthetics = c("colour", "fill")) +',
      '  coord_cartesian(xlim = b1 + c(-1, 1) * ' + +(5 * Math.sqrt(S.th.l1)).toFixed(4) + ') +',
      '  labs(title = "Pendenze stimate con tre criteri", x = "pendenza", y = "densità") +', '  theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Tre criteri</h3><div class="eq" data-tex="\\min_{b_0, b_1} \\sum_{i} |y_i - b_0 - b_1 x_i|^{p}"></div><p>p = 2: minimi quadrati; p = 1: minimi valori assoluti (regressione mediana); 1 &lt; p &lt; 2: compromesso. Più p è piccolo, meno pesano i residui grandi.</p>' +
        '<h3>Robustezza ed efficienza</h3><p>Un singolo valore anomalo può spostare arbitrariamente la retta L2. L1 resiste ai valori anomali nella y (non a quelli con alto leverage, cioè anomali nella x). Il prezzo: con errori normali L1 ha efficienza 2/π ≈ 0,64 rispetto a L2.</p>' +
        '<div class="callout">Ogni criterio corrisponde alla massima verosimiglianza per una legge degli errori: L2 ↔ Normale, L1 ↔ Laplace, Lp ↔ normale generalizzata f(e) ∝ exp(−|e|<sup>p</sup>/c).</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>M-stimatori</h3><p>Lp risolve Σ ψ(rᵢ) xᵢ = 0 con ψ(r) = |r|<sup>p−1</sup> sign(r). Per errori simmetrici e disegno fisso</p><div class="eq" data-tex="\\Var(\\hat{\\beta}_1) \\approx \\frac{\\E\\,\\psi(\\varepsilon)^2}{(\\E\\,\\psi\'(\\varepsilon))^2} \\cdot \\frac{1}{S_{xx}}"></div>' +
        '<p>Per p = 2 si ottiene σ²/Sxx; per p = 1 (ψ = sign) E ψ′ diventa 2f(0) e la varianza 1/(4 f(0)² Sxx). StatAtlas calcola i valori attesi per integrazione numerica.</p>' +
        '<h3>Minimi quadrati ripesati</h3><p>Il gradiente di Σ|rᵢ|<sup>p</sup> si annulla dove Σ wᵢ rᵢ xᵢ = 0 con wᵢ = |rᵢ|<sup>p−2</sup>: si alternano pesi e minimi quadrati ponderati. Per p &lt; 2 i pesi esplodono per residui nulli: si usa una soglia (10⁻⁶). Per p = 1 l’algoritmo converge lentamente; la soluzione esatta è un problema di programmazione lineare (Koenker e Bassett, 1978).</p>' +
        '<h3>Punto di rottura (breakdown point)</h3><p>Nella regressione L1 il punto di rottura è comunque 1/n se i valori anomali sono anche punti ad alto leverage: per una robustezza piena servono stimatori come LTS o MM.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); buildPrediction(); }
  function render(full) { drawData(); drawSlopes(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    ctrlBox.append(
      el('label.field', el('span', 'Errori'), el('select', { onchange: function () { S.err = this.value; restart(); } }, Object.keys(ERRS).map(function (k) { return el('option', { value: k, selected: k === S.err }, ERRS[k].label); }))),
      SA.ui.slider('Esponente p del criterio Lp', { min: 1.1, max: 3, step: 0.1, value: S.p, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.p = v; legends(); restart(); } }),
      SA.ui.slider('Scala degli errori σ', { min: 0.2, max: 3, step: 0.1, value: S.sigma, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.sigma = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [10, 20, 30, 50, 100].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
        el('label.field', el('span', 'Campioni M'), el('select', { onchange: function () { S.M = +this.value; restart(); } }, [200, 1000, 3000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('regressione-lp', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.M; }, progress: function () { return S.k / S.M; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione L1, L2, Lp', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Stessi dati, tre modi di misurare l’errore. Quando gli errori hanno code pesanti, la scelta del criterio conta più della numerosità.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Perché i minimi quadrati, e quando conviene abbandonarli?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Un campione, tre rette');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Il campione corrente'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Pendenze stimate nei campioni ripetuti'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['replica', 'L2', 'L1', 'Lp']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.est.l2[i], S.est.l1[i], S.est.lp[i]]); SA.ui.download('statatlas_lab11_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab11.png', ['Regressione L1, L2, Lp', ERRS[S.err].label + ' · n = ' + S.n + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Criterio'), el('th', 'Media'), el('th', 'Dev. std'), el('th', 'Scarto interquartile'), el('th', 'Errore quadr. medio'), el('th', 'Teoria'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' M-stimatori, IRLS e punto di rottura (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi campioni, stesso algoritmo'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab11_regressione_lp.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
