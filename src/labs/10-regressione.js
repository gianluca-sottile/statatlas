/* StatAtlas · Lab 10 — Regressione lineare interattiva.
 * Spunto da Simul2000 (regressione interattiva); implementazione e testi originali. */
(function () {
  var el, S, BINS = 36, X0 = 0, X1 = 10;
  var tq = function (p, df) { return SA.laws.get('t').q(p, { df: df }); };
  var ERR = {
    norm: { label: 'Normali', gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = g.norm(); return o; }, r: 'rnorm(n)' },
    t3: { label: 't₃ standardizzati (code pesanti)', gen: function (g, n) { var o = new Float64Array(n), L = SA.laws.get('t'); for (var i = 0; i < n; i++) o[i] = L.q(g.unif(), { df: 3 }) / Math.sqrt(3); return o; }, r: 'qt(runif(n), df = 3) / sqrt(3)' },
    skew: { label: 'Esponenziali centrati (asimmetrici)', gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = -Math.log1p(-g.unif()) - 1; return o; }, r: 'qexp(runif(n)) - 1' }
  };

  function design(n) { var x = []; for (var i = 0; i < n; i++) x.push(X0 + (X1 - X0) * (i + 0.5) / n); return x; }
  function newState(prev) {
    var s = { n: 12, b0: 2, b1: 0.8, sigma: 1.5, err: 'norm', x0: 8, B: 1000, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.manual = false;
    s.slopes = new Float64Array(s.B); s.covM = 0; s.covP = 0; s.counts = new Uint32Array(BINS);
    var xs = design(s.n); s.pts = xs.map(function (x) { return [x, 0]; });
    var sxx = 0, xm = (X0 + X1) / 2; xs.forEach(function (x) { sxx += (x - xm) * (x - xm); }); s.sdSlope = s.sigma / Math.sqrt(sxx);
    s.hlo = s.b1 - 4.5 * s.sdSlope; s.hhi = s.b1 + 4.5 * s.sdSlope;
    return s;
  }
  /* minimi quadrati con diagnostiche */
  function ols(pts) {
    var n = pts.length, xm = 0, ym = 0, sxx = 0, sxy = 0, i;
    pts.forEach(function (p) { xm += p[0] / n; ym += p[1] / n; });
    pts.forEach(function (p) { sxx += (p[0] - xm) * (p[0] - xm); sxy += (p[0] - xm) * (p[1] - ym); });
    var b1 = sxx > 0 ? sxy / sxx : 0, b0 = ym - b1 * xm, rss = 0, syy = 0, res = [];
    pts.forEach(function (p) { var e = p[1] - b0 - b1 * p[0]; res.push(e); rss += e * e; syy += (p[1] - ym) * (p[1] - ym); });
    var df = n - 2, s2 = df > 0 ? rss / df : NaN, s = Math.sqrt(s2), tc = df > 0 ? tq(0.975, df) : NaN, diag = [];
    for (i = 0; i < n; i++) {
      var h = 1 / n + (pts[i][0] - xm) * (pts[i][0] - xm) / sxx, r = res[i] / (s * Math.sqrt(1 - h));
      diag.push({ h: h, r: r, cook: r * r * h / (2 * (1 - h)) });
    }
    return { n: n, xm: xm, sxx: sxx, b0: b0, b1: b1, s: s, df: df, tc: tc, r2: syy > 0 ? 1 - rss / syy : NaN, diag: diag,
      seMean: function (x) { return s * Math.sqrt(1 / n + (x - xm) * (x - xm) / sxx); },
      sePred: function (x) { return s * Math.sqrt(1 + 1 / n + (x - xm) * (x - xm) / sxx); } };
  }
  /* una replica: nuove risposte agli stessi x, poi una nuova Y₀ in x₀ (ordine identico in R) */
  function step() {
    if (S.k >= S.B) return false;
    var xs = design(S.n), e = ERR[S.err].gen(S.rng, S.n), e0 = ERR[S.err].gen(S.rng, 1)[0];
    S.pts = xs.map(function (x, i) { return [x, S.b0 + S.b1 * x + S.sigma * e[i]]; }); S.manual = false;
    var f = ols(S.pts), y0 = S.b0 + S.b1 * S.x0 + S.sigma * e0, m0 = S.b0 + S.b1 * S.x0, fit0 = f.b0 + f.b1 * S.x0;
    if (Math.abs(fit0 - m0) <= f.tc * f.seMean(S.x0)) S.covM++;
    if (Math.abs(y0 - fit0) <= f.tc * f.sePred(S.x0)) S.covP++;
    S.slopes[S.k] = f.b1;
    var b = Math.floor((f.b1 - S.hlo) / ((S.hhi - S.hlo) / BINS)); if (b >= 0 && b < BINS) S.counts[b]++;
    S.k++; return true;
  }

  /* ---------- grafico interattivo ---------- */
  var figA, figB, figC, legA, legB, legC, frameA = null, drag = null;
  function yRange() {
    var lo = Math.min(S.b0, S.b0 + S.b1 * X1) - 4 * S.sigma - 1, hi = Math.max(S.b0, S.b0 + S.b1 * X1) + 4 * S.sigma + 1;
    S.pts.forEach(function (p) { lo = Math.min(lo, p[1] - 1); hi = Math.max(hi, p[1] + 1); });
    return [Math.floor(lo), Math.ceil(hi)];
  }
  function drawMain() {
    var P = SA.plot, f = ols(S.pts), yr = S.yr || (S.yr = yRange());
    var F = frameA = P.frame(figA, { W: 720, H: 380, x: [-0.5, 10.5], y: yr, xlabel: 'x', ylabel: 'y', label: 'Dati, retta dei minimi quadrati e bande al 95%' });
    var t = F.t, g = F.g, i, up = [], dn = [], pu = [], pd = [];
    F.root.style.touchAction = 'none'; F.root.style.cursor = 'crosshair';
    if (f.df > 0 && isFinite(f.s)) {
      for (i = 0; i <= 80; i++) { var x = -0.5 + 11 * i / 80, yh = f.b0 + f.b1 * x, cm = f.tc * f.seMean(x), cp = f.tc * f.sePred(x);
        up.push([F.x(x), F.y(yh + cm)]); dn.push([F.x(x), F.y(yh - cm)]); pu.push([F.x(x), F.y(yh + cp)]); pd.push([F.x(x), F.y(yh - cp)]); }
      P.svg('path', { d: P.path(pu.concat(pd.slice().reverse())) + 'Z', fill: t.c3, 'fill-opacity': 0.08, stroke: t.c3, 'stroke-dasharray': '3 3', 'stroke-width': 1 }, g);
      P.svg('path', { d: P.path(up.concat(dn.slice().reverse())) + 'Z', fill: t.c1, 'fill-opacity': 0.18 }, g);
    }
    P.curve(F, function (x) { return S.b0 + S.b1 * x; }, -0.5, 10.5, { stroke: t.ink_3, 'stroke-width': 1.2, 'stroke-dasharray': '2 3' });
    P.curve(F, function (x) { return f.b0 + f.b1 * x; }, -0.5, 10.5, { stroke: t.c1, 'stroke-width': 2.4 });
    P.svg('line', { x1: F.x(S.x0), x2: F.x(S.x0), y1: F.m.t, y2: F.y(yr[0]), stroke: t.accent, 'stroke-dasharray': '4 3' }, g);
    P.text(g, F.x(S.x0) + 4, F.m.t + 10, 'x₀', { fill: t.accent, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 });
    var maxC = 0, imax = -1; f.diag.forEach(function (d, j) { if (d.cook > maxC) { maxC = d.cook; imax = j; } });
    S.pts.forEach(function (p, j) {
      var d = f.diag[j], yh = f.b0 + f.b1 * p[0], infl = d.cook > 0.5;
      P.svg('line', { x1: F.x(p[0]), x2: F.x(p[0]), y1: F.y(p[1]), y2: F.y(yh), stroke: t.c2, 'stroke-opacity': 0.6, 'stroke-width': 1 }, g);
      P.svg('circle', { cx: F.x(p[0]), cy: F.y(p[1]), r: 4 + 14 * Math.min(1, d.h), fill: infl ? t.c2 : t.c1, 'fill-opacity': 0.35, stroke: infl ? t.c2 : t.c1, 'stroke-width': j === imax && maxC > 0.5 ? 2.5 : 1.2,
        'data-i': j, style: 'cursor:grab' }, g);
    });
    P.text(g, F.m.l + 8, F.m.t + 12, S.manual ? 'Dati modificati a mano · ' + f.n + ' punti' : 'Campione ' + S.k + ' dal modello · ' + f.n + ' punti', { fill: t.ink_3, 'font-size': 11.5 });
  }
  function toData(ev) {
    var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !frameA) return null;
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse()), yr = S.yr;
    return [Math.max(-0.5, Math.min(10.5, frameA.x.invert(p.x))), Math.max(yr[0], Math.min(yr[1], frameA.y.invert(p.y)))];
  }
  function bindDrag() {
    figA.addEventListener('pointerdown', function (ev) {
      var c = ev.target.closest && ev.target.closest('circle[data-i]'), q = toData(ev); if (!q) return;
      run.stop();
      if (c) { drag = +c.getAttribute('data-i'); figA.setPointerCapture(ev.pointerId); }
      else { S.pts.push(q); S.manual = true; refresh(); }
    });
    figA.addEventListener('pointermove', function (ev) { if (drag == null) return; var q = toData(ev); if (!q) return; S.pts[drag] = q; S.manual = true; refresh(true); });
    figA.addEventListener('pointerup', function () { if (drag != null) { drag = null; refresh(); } });
    figA.addEventListener('dblclick', function (ev) {
      var c = ev.target.closest && ev.target.closest('circle[data-i]'); if (!c || S.pts.length <= 3) return;
      S.pts.splice(+c.getAttribute('data-i'), 1); S.manual = true; refresh();
    });
  }
  function drawInfluence() {
    var P = SA.plot, f = ols(S.pts), hmax = Math.max(0.5, Math.max.apply(null, f.diag.map(function (d) { return d.h; })) * 1.1);
    var rmax = Math.max(3, Math.max.apply(null, f.diag.map(function (d) { return isFinite(d.r) ? Math.abs(d.r) : 0; })) * 1.1);
    var F = P.frame(figB, { W: 720, H: 230, x: [0, +hmax.toFixed(2)], y: [-+rmax.toFixed(1), +rmax.toFixed(1)], xlabel: 'leverage hᵢ', ylabel: 'residuo standardizzato', label: 'Residui e leverage' });
    var t = F.t, g = F.g;
    [0.5, 1].forEach(function (D) {
      var h0 = 2 * D / (rmax * rmax + 2 * D) + 1e-4; // da qui la curva |r| = √(2D(1−h)/h) è dentro il grafico
      [1, -1].forEach(function (sg) { P.curve(F, function (h) { return h <= 0 || h >= 1 ? NaN : sg * Math.sqrt(2 * D * (1 - h) / h); }, h0, Math.min(0.99, hmax), { stroke: D === 1 ? t.c2 : t.ink_3, 'stroke-width': 1, 'stroke-dasharray': '4 3' }); });
      P.text(g, F.x(Math.min(0.97 * hmax, 0.95)) - 4, F.y(Math.min(rmax * 0.95, Math.sqrt(2 * D * (1 - Math.min(0.95, hmax * 0.97)) / Math.min(0.95, hmax * 0.97)))) - 4, 'Cook ' + SA.fmt(D, 1), { 'text-anchor': 'end', fill: t.ink_3, 'font-size': 10.5 });
    });
    f.diag.forEach(function (d) { if (isFinite(d.r)) P.marker(g, d.cook > 0.5 ? 'diamond' : 'circle', F.x(d.h), F.y(Math.max(-rmax, Math.min(rmax, d.r))), 10, d.cook > 0.5 ? t.c2 : t.c1); });
  }
  function drawSlopes() {
    var P = SA.plot, sd = S.sdSlope, F = P.frame(figC, { W: 720, H: 220, x: [+S.hlo.toPrecision(3), +S.hhi.toPrecision(3)], y: [0, +(1.4 / (sd * Math.sqrt(2 * Math.PI))).toPrecision(2)], xlabel: 'β̂₁', ylabel: 'densità', label: 'Distribuzione della pendenza stimata' });
    var t = F.t;
    P.hist(F, S.counts, S.hlo, S.hhi, S.k, t.c1);
    P.curve(F, function (b) { return SA.dens.norm(b, S.b1, sd); }, S.hlo, S.hhi, { stroke: t.c_theory });
    P.svg('line', { x1: F.x(S.b1), x2: F.x(S.b1), y1: F.m.t, y2: F.y(0), stroke: t.ink, 'stroke-dasharray': '3 3' }, F.g);
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = ''; legC.innerHTML = '';
    legA.append(el('span', sw(t.c1, null), 'retta stimata'), el('span', sw(t.ink_3, '2 3'), 'retta vera'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c1 + ';opacity:.3;border-radius:2px' }), 'banda per E(Y | x)'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;border:1px dashed ' + t.c3 + ';border-radius:2px' }), 'intervallo di previsione'));
    legB.append(el('span', sw(t.c1, null, 'circle'), 'osservazioni'), el('span', sw(t.c2, null, 'diamond'), 'influenti (Cook > 0,5)'), el('span', sw(t.ink_3, '4 3'), 'curve di livello di Cook'));
    legC.append(el('span', sw(t.c1, null), 'pendenze stimate'), el('span', sw(t.c_theory, null), 'N(β₁, σ²/Sxx)'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var f = ols(S.pts), fmt = SA.fmt, b = SA.ui.badge, k = S.k, ex = S.err === 'norm', sl = S.slopes.subarray(0, k);
    var maxH = Math.max.apply(null, f.diag.map(function (d) { return d.h; })), maxC = Math.max.apply(null, f.diag.map(function (d) { return isFinite(d.cook) ? d.cook : 0; }));
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Media di β̂₁'), el('td', fmt(S.b1, 4)), el('td', k ? fmt(SA.stat.mean(sl), 4) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Dev. std di β̂₁ = σ/√Sxx'), el('td', fmt(S.sdSlope, 4)), el('td', k > 1 ? fmt(SA.stat.sd(sl), 4) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Copertura dell’intervallo per E(Y | x₀)'), el('td', '0,95'), el('td', k ? fmt(S.covM / k, 3) : '—'), el('td', b(ex ? 'exact' : 'asym'))),
      el('tr', el('td', 'Copertura dell’intervallo di previsione per Y₀'), el('td', '0,95'), el('td', k ? fmt(S.covP / k, 3) : '—'), el('td', b(ex ? 'exact' : 'approx'))));
    kpiBox.innerHTML = '';
    kpiBox.append(
      el('div.kpi', el('b', { style: 'font-size:1.15rem' }, 'ŷ = ' + fmt(f.b0, 2) + ' + ' + fmt(f.b1, 3) + ' x'), el('span', 'retta dei minimi quadrati, R² = ' + fmt(f.r2, 3))),
      el('div.kpi', el('b', fmt(maxH, 3)), el('span', 'leverage massimo (media 2/n = ' + fmt(2 / f.n, 3) + ')')),
      el('div.kpi', el('b', fmt(maxC, 3)), el('span', 'distanza di Cook massima')),
      el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'campioni dal modello')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p10-' + Date.now();
    predBox.append(el('p.prose', 'Un solo punto può spostare molto la retta. Quale punto ha più potere?'),
      el('div.choices', { role: 'radiogroup' }, [['far_y', 'Quello con il residuo più grande, ovunque si trovi'], ['far_x', 'Un punto lontano dagli altri lungo l’asse x, se non segue la tendenza'], ['center', 'Un punto al centro dei dati']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'far_x' ? '✓ ' : '✗ ') + 'L’influenza combina residuo e leverage: la distanza di Cook cresce con entrambi. Un punto al centro (leverage basso) sposta la retta solo in su o in giù; un punto lontano in x agisce come una leva sulla pendenza. Prova: trascina il punto più a destra verso l’alto, poi uno centrale.';
  }
  function interpretation() {
    var ex = S.err === 'norm';
    interpBox.innerHTML = '<p>La <strong>banda scura</strong> è l’intervallo di confidenza per la retta vera, E(Y | x) = β₀ + β₁x: si stringe al centro dei dati e si allarga ai bordi, perché lì un errore sulla pendenza pesa di più. La <strong>banda chiara</strong> è l’intervallo di previsione per una nuova osservazione Y₀: contiene anche il rumore σ, e non si restringe a zero nemmeno con infiniti dati.</p>' +
      '<p>Le coperture al 95% sono esatte solo se gli errori sono <strong>indipendenti, omoschedastici e normali</strong>. ' + (ex ? 'Qui lo sono: la simulazione lo conferma.' : 'Qui non sono normali: l’intervallo per E(Y | x₀) resta buono per il teorema centrale, mentre quello di previsione, che dipende dalla forma della singola Y₀, può sbagliare.') + '</p>' +
      '<p>Nella vista dei residui, il <strong>leverage</strong> hᵢ misura quanto xᵢ è lontano da x̄; la <strong>distanza di Cook</strong> quanto cambierebbero le stime togliendo il punto. Fai doppio clic su un punto per eliminarlo, clicca su un’area vuota per aggiungerne uno.</p>';
  }
  function codeR() {
    var e = ERR[S.err];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 10 — Regressione lineare: bande, influenza, copertura',
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')',
      'n <- ' + S.n + '; b0 <- ' + S.b0 + '; b1 <- ' + S.b1 + '; sigma <- ' + S.sigma + '; x0 <- ' + S.x0 + '; B <- ' + S.B,
      'x <- (seq_len(n) - 0.5) / n * 10          # disegno fisso in [0, 10]',
      'errori <- function(n) ' + e.r + '   # errori ' + e.label.toLowerCase(), '',
      '# Una replica: nuove risposte agli stessi x, poi una nuova osservazione in x0',
      'replica <- function() {',
      '  y  <- b0 + b1 * x + sigma * errori(n)',
      '  y0 <- b0 + b1 * x0 + sigma * errori(1)',
      '  fit <- lm(y ~ x)',
      '  ci <- predict(fit, tibble(x = x0), interval = "confidence")',
      '  pi <- predict(fit, tibble(x = x0), interval = "prediction")',
      '  tibble(pendenza = coef(fit)[2],',
      '         copre_media = ci[2] <= b0 + b1 * x0 & b0 + b1 * x0 <= ci[3],',
      '         copre_y0    = pi[2] <= y0 & y0 <= pi[3])',
      '}', 'sim <- map(seq_len(B), \\(b) replica()) |> list_rbind()', '',
      'sim |> summarise(media_pendenza = mean(pendenza), sd_pendenza = sd(pendenza),',
      '                 copertura_media = mean(copre_media), copertura_previsione = mean(copre_y0))',
      'c(sd_teorica = sigma / sqrt(sum((x - mean(x))^2)))', '',
      '# Diagnostiche di un campione: leva e distanza di Cook',
      'set.seed(' + S.seed + ')', 'y <- b0 + b1 * x + sigma * errori(n)', 'fit <- lm(y ~ x)',
      'tibble(x, y, leva = hatvalues(fit), cook = cooks.distance(fit), res_std = rstandard(fit)) |> arrange(desc(cook)) |> head()', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'griglia <- tibble(x = seq(-0.5, 10.5, length.out = 200))',
      'bande <- bind_cols(griglia,',
      '  as_tibble(predict(fit, griglia, interval = "confidence")) |> rename(ci_lo = lwr, ci_hi = upr),',
      '  as_tibble(predict(fit, griglia, interval = "prediction")) |> dplyr::select(pi_lo = lwr, pi_hi = upr))',
      'ggplot(bande, aes(x)) +',
      '  geom_ribbon(aes(ymin = pi_lo, ymax = pi_hi), fill = "#009E73", alpha = 0.12) +',
      '  geom_ribbon(aes(ymin = ci_lo, ymax = ci_hi), fill = "#0072B2", alpha = 0.25) +',
      '  geom_line(aes(y = fit), colour = "#0072B2", linewidth = 1) +',
      '  geom_abline(intercept = b0, slope = b1, linetype = "dotted") +',
      '  geom_point(data = tibble(x, y), aes(x, y), size = 2) +',
      '  labs(title = "Retta dei minimi quadrati", subtitle = "Scura: E(Y | x) al 95% · chiara: previsione al 95%", y = "y") +',
      '  theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Il modello</h3><div class="eq" data-tex="Y_i = \\beta_0 + \\beta_1 x_i + \\varepsilon_i, \\quad \\varepsilon_i \\text{ indipendenti}, \\; \\E(\\varepsilon_i) = 0, \\; \\Var(\\varepsilon_i) = \\sigma^2"></div>' +
        '<p>I minimi quadrati scelgono la retta che rende minima Σ(yᵢ − b₀ − b₁xᵢ)²: β̂₁ = Sxy/Sxx, β̂₀ = ȳ − β̂₁x̄. Sono non distorti e, tra gli stimatori lineari non distorti, hanno varianza minima (Gauss–Markov), senza bisogno della normalità.</p>' +
        '<h3>Due intervalli diversi</h3><div class="eq" data-tex="\\hat{y}(x) \\pm t_{n-2}\\, s\\sqrt{\\frac{1}{n} + \\frac{(x - \\bar{x})^2}{S_{xx}}} \\qquad \\hat{y}(x) \\pm t_{n-2}\\, s\\sqrt{1 + \\frac{1}{n} + \\frac{(x - \\bar{x})^2}{S_{xx}}}"></div>' +
        '<p>Il primo riguarda la retta (un parametro); il secondo una futura osservazione (una variabile aleatoria). L’1 in più sotto radice è il rumore della nuova osservazione.</p>' +
        '<div class="callout warn">La normalità serve per gli intervalli t esatti; l’indipendenza e la varianza costante servono sempre.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Hat matrix e leverage</h3><p>ŷ = Hy con H = X(XᵀX)⁻¹Xᵀ, la hat matrix, cioè la matrice di proiezione ortogonale sullo spazio generato dalle colonne di X. L’elemento diagonale hᵢ = 1/n + (xᵢ − x̄)²/Sxx è il leverage del punto i: Σhᵢ = 2, quindi il leverage medio è 2/n. Var(eᵢ) = σ²(1 − hᵢ): i punti ad alto leverage hanno residui piccoli <em>perché</em> attirano la retta.</p>' +
        '<h3>Distanza di Cook</h3><div class="eq" data-tex="D_i = \\frac{r_i^2 h_i}{p(1 - h_i)}, \\quad r_i = \\frac{e_i}{s\\sqrt{1 - h_i}}"></div><p>con p = 2 parametri. Misura lo spostamento delle stime quando si toglie il punto i; soglie usuali 0,5 e 1. Le curve nel grafico sono i luoghi a D costante.</p>' +
        '<h3>Distribuzioni esatte</h3><p>Con errori normali: β̂₁ ~ N(β₁, σ²/Sxx), (n − 2)s²/σ² ~ χ²<sub>n−2</sub> indipendente da β̂, da cui le statistiche t. Senza normalità β̂₁ è comunque approssimativamente normale per n grande (TCL di Lindeberg, se nessun xᵢ domina Sxx), ma l’intervallo di previsione resta legato alla legge dell’errore.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function refresh(light) { S.yr = drag != null ? S.yr : null; drawMain(); drawInfluence(); if (!light) { updateTable(); } }
  function restart() { run.stop(); S = newState(S); step(); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { S.yr = null; drawMain(); drawInfluence(); drawSlopes(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sl = function (lab, key, mn, mx, st, d) { return SA.ui.slider(lab, { min: mn, max: mx, step: st, value: S[key], format: function (v) { return SA.fmt(v, d); }, onchange: function (v) { S[key] = v; restart(); } }); };
    ctrlBox.append(
      el('label.field', el('span', 'Errori'), el('select', { onchange: function () { S.err = this.value; restart(); interpretation(); } },
        Object.keys(ERR).map(function (k) { return el('option', { value: k, selected: k === S.err }, ERR[k].label); }))),
      sl('Pendenza vera β₁', 'b1', -1.5, 1.5, 0.05, 2), sl('Rumore σ', 'sigma', 0.2, 4, 0.1, 1), sl('Numerosità n', 'n', 4, 60, 1, 0), sl('Punto x₀', 'x0', 0, 10, 0.5, 1),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Campioni B'), el('select', { onchange: function () { S.B = +this.value; restart(); } }, [200, 1000, 5000].map(function (v) { return el('option', { value: v, selected: v === S.B }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      SA.ui.button('Aggiungi un valore anomalo', { onclick: function () { run.stop(); S.pts.push([9.8, S.b0 + S.b1 * 9.8 - 5 * S.sigma]); S.manual = true; refresh(); } }));
    run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('regressione', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione lineare', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Trascina i punti e guarda la retta reagire. Poi ripeti l’esperimento molte volte e controlla se le bande mantengono le loro promesse.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Quanto è stabile una retta di regressione, e quale incertezza le attribuiamo?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Punti da toccare, campioni da ripetere');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); legA = el('div.legend'); legB = el('div.legend'); legC = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Dati e retta'), legA), el('p.muted', { style: 'margin:2px 0 4px;font-size:.8rem' }, 'Trascina un punto · clic su un’area vuota per aggiungerne uno · doppio clic per eliminarlo'), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Residui standardizzati e leverage'), legB), figB),
        el('div.fig', el('div.fig-title', el('h3', 'Pendenza stimata nei campioni ripetuti'), legC), figC),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['x', 'y']]; S.pts.forEach(function (p) { rows.push([p[0], p[1]]); }); SA.ui.download('statatlas_lab10_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab10.png', ['Regressione lineare', S.pts.length + ' punti · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' esatto con errori normali'), el('span', SA.ui.badge('asym'), ' vale per n grande'), el('span', SA.ui.badge('approx'), ' dipende dalla legge degli errori')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Hat matrix, distanza di Cook e distribuzioni esatte (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'lm(), predict() e diagnostiche'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab10_regressione.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh(); bindDrag();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
