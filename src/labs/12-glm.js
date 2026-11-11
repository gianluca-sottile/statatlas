/* StatAtlas · Lab 12 — Modelli lineari generalizzati: regressione logistica e di Poisson.
 * Spunto da Simul2000 (GLM); implementazione e testi originali. */
(function () {
  var el, S, BINS = 40, LAWS = SA.laws;
  var FAM = {
    logit: { label: 'Binomiale, legame logit (regressione logistica)', b0: -0.5, b1: 1.2,
      mu: function (eta) { return 1 / (1 + Math.exp(-eta)); }, dmu: function (m) { return m * (1 - m); }, V: function (m) { return m * (1 - m); },
      gen: function (g, m) { return LAWS.get('bern').q(g.unif(), { prob: m }); }, r: 'qbinom(runif(n), size = 1, prob = plogis(b0 + b1 * x))', fam: 'binomial', ylab: 'y (0/1)' },
    pois: { label: 'Poisson, legame logaritmico', b0: 0.5, b1: 0.6,
      mu: function (eta) { return Math.exp(eta); }, dmu: function (m) { return m; }, V: function (m) { return m; },
      gen: function (g, m) { return LAWS.get('pois').q(g.unif(), { lambda: m }); }, r: 'qpois(runif(n), lambda = exp(b0 + b1 * x))', fam: 'poisson', ylab: 'y (conteggi)' }
  };
  function F() { return FAM[S.fam]; }
  function design(n) { var x = new Float64Array(n); for (var i = 0; i < n; i++) x[i] = -2 + 4 * (i + 0.5) / n; return x; }
  /* informazione di Fisher attesa XᵀWX nel vero β, W = (dμ/dη)²/V = dμ/dη per i legami canonici */
  function fisherInv(fm, b0, b1, x) {
    var a = 0, b = 0, c = 0; for (var i = 0; i < x.length; i++) { var w = fm.dmu(fm.mu(b0 + b1 * x[i])); a += w; b += w * x[i]; c += w * x[i] * x[i]; }
    var det = a * c - b * b; return { v00: c / det, v11: a / det };
  }
  /* IRLS (scoring di Fisher): come glm() in R. Restituisce null se non converge (separazione o stime infinite). */
  function irls(x, y) {
    var n = x.length, b0 = 0, b1 = 0, i, it, ym = SA.stat.mean(y);
    if (S.fam === 'logit') { if (ym === 0 || ym === 1) return null; b0 = Math.log(ym / (1 - ym)); } else { if (ym === 0) return null; b0 = Math.log(ym); }
    for (it = 0; it < 50; it++) {
      var sw = 0, sx = 0, sz = 0, sxx = 0, sxz = 0;
      for (i = 0; i < n; i++) {
        var eta = b0 + b1 * x[i], m = F().mu(eta), d = F().dmu(m), w = d, z = eta + (y[i] - m) / Math.max(d, 1e-12);
        sw += w; sx += w * x[i]; sz += w * z; sxx += w * x[i] * x[i]; sxz += w * x[i] * z;
      }
      var det = sw * sxx - sx * sx, nb1 = (sw * sxz - sx * sz) / det, nb0 = (sz - nb1 * sx) / sw;
      if (!isFinite(nb1) || Math.abs(nb1) > 30) return null;
      var done = Math.abs(nb0 - b0) + Math.abs(nb1 - b1) < 1e-10; b0 = nb0; b1 = nb1;
      if (done) { var vi = 0, vb = 0, vc = 0; for (i = 0; i < n; i++) { var ww = F().dmu(F().mu(b0 + b1 * x[i])); vi += ww; vb += ww * x[i]; vc += ww * x[i] * x[i]; }
        return { b0: b0, b1: b1, se1: Math.sqrt(vi / (vi * vc - vb * vb)), it: it + 1 }; }
    }
    return null;
  }

  function newState(prev) {
    var s = { fam: 'logit', n: 40, M: 1000, seed: 2026, pred: null, b0: null, b1: null };
    if (prev) for (var k in s) if (prev[k] !== undefined && prev[k] !== null) s[k] = prev[k];
    if (s.b0 == null) { s.b0 = FAM[s.fam].b0; s.b1 = FAM[s.fam].b1; }
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.sep = 0; s.cov = 0; s.ok = 0; s.x = design(s.n); s.last = null;
    s.est = new Float64Array(s.M); s.counts = new Uint32Array(BINS); s.out = 0;
    var fi = fisherInv(FAM[s.fam], s.b0, s.b1, s.x); s.asd = Math.sqrt(fi.v11);
    s.hlo = s.b1 - 4.5 * s.asd; s.hhi = s.b1 + 4.5 * s.asd;
    return s;
  }
  function step() {
    if (S.k >= S.M) return false;
    var y = new Float64Array(S.n);
    for (var i = 0; i < S.n; i++) y[i] = F().gen(S.rng, F().mu(S.b0 + S.b1 * S.x[i]));
    var fit = irls(S.x, y);
    S.last = { y: y, fit: fit }; S.k++;
    if (!fit) { S.sep++; return true; }
    S.est[S.ok++] = fit.b1;
    if (Math.abs(fit.b1 - S.b1) <= 1.96 * fit.se1) S.cov++;
    var b = Math.floor((fit.b1 - S.hlo) / ((S.hhi - S.hlo) / BINS)); if (b >= 0 && b < BINS) S.counts[b]++; else S.out++;
    return true;
  }

  var figA, figB, legA, legB;
  function drawData() {
    var P = SA.plot, logit = S.fam === 'logit', ymax = logit ? 1.1 : Math.max(4, F().mu(S.b0 + 2 * Math.abs(S.b1)) * 1.6);
    if (S.last && !logit) ymax = Math.max(ymax, Math.max.apply(null, S.last.y) + 1);
    var f = P.frame(figA, { W: 720, H: 300, x: [-2.2, 2.2], y: [logit ? -0.1 : 0, +ymax.toPrecision(2)], xlabel: 'x', ylabel: F().ylab, label: 'Campione corrente e curva stimata' });
    var t = f.t, g = f.g;
    P.curve(f, function (x) { return F().mu(S.b0 + S.b1 * x); }, -2.2, 2.2, { stroke: t.ink_3, 'stroke-dasharray': '2 3', 'stroke-width': 1.4 });
    if (!S.last) { P.text(g, 360, 130, 'Premi ▶: ogni passo è un nuovo campione e un nuovo adattamento', { 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }); return; }
    for (var i = 0; i < S.n; i++) {
      var jit = logit ? ((i * 0.618034) % 1 - 0.5) * 0.06 : 0;
      P.svg('circle', { cx: f.x(S.x[i]), cy: f.y(S.last.y[i] + jit), r: 3.4, fill: t.ink, 'fill-opacity': 0.5 }, g);
    }
    var fit = S.last.fit;
    if (fit) P.curve(f, function (x) { return F().mu(fit.b0 + fit.b1 * x); }, -2.2, 2.2, { stroke: t.c1, 'stroke-width': 2.4 });
    else P.text(g, f.W - f.m.r, f.m.t + 12, 'Separazione: la stima di massima verosimiglianza non esiste (finita)', { 'text-anchor': 'end', fill: t.accent, 'font-size': 12, 'font-weight': 600 });
  }
  function drawEst() {
    var P = SA.plot, f = P.frame(figB, { W: 720, H: 250, x: [+S.hlo.toPrecision(3), +S.hhi.toPrecision(3)], y: [0, +(1.4 / (S.asd * Math.sqrt(2 * Math.PI))).toPrecision(2)], xlabel: 'β̂₁', ylabel: 'densità', label: 'Distribuzione della pendenza stimata' });
    var t = f.t;
    P.hist(f, S.counts, S.hlo, S.hhi, S.ok, t.c1);
    P.curve(f, function (b) { return SA.dens.norm(b, S.b1, S.asd); }, S.hlo, S.hhi, { stroke: t.c2, 'stroke-dasharray': '7 4' });
    P.svg('line', { x1: f.x(S.b1), x2: f.x(S.b1), y1: f.m.t, y2: f.y(0), stroke: t.ink, 'stroke-dasharray': '3 3' }, f.g);
    if (S.ok) { var m = SA.stat.mean(S.est.subarray(0, S.ok)); P.marker(f.g, 'tri', f.x(Math.max(S.hlo, Math.min(S.hhi, m))), f.y(0) - 6, 12, t.accent); }
    P.text(f.g, f.m.l + 8, f.m.t + 12, S.ok + ' stime finite' + (S.out ? ' · fuori scala ' + S.out : ''), { fill: t.ink_3, 'font-size': 11.5 });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c1, null), 'curva stimata'), el('span', sw(t.ink_3, '2 3'), 'curva vera'), el('span', sw(t.ink, null, 'circle'), 'osservazioni'));
    legB.append(el('span', sw(t.c1, null), 'stime simulate'), el('span', sw(t.c2, '7 4'), 'normale asintotica N(β₁, (XᵀWX)⁻¹)'), el('span', sw(t.accent, null, 'tri'), 'media delle stime'));
  }

  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, v = S.est.subarray(0, S.ok), m = S.ok ? SA.stat.mean(v) : NaN;
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Media di β̂₁ (stime finite)'), el('td', fmt(S.b1, 4)), el('td', fmt(m, 4)), el('td', b('asym'))),
      el('tr', el('td', 'Dev. std di β̂₁'), el('td', fmt(S.asd, 4) + ' = √[(XᵀWX)⁻¹]₁₁'), el('td', S.ok > 1 ? fmt(SA.stat.sd(v), 4) : '—'), el('td', b('asym'))),
      el('tr', el('td', 'Copertura di Wald β̂₁ ± 1,96 e.s.'), el('td', '0,95'), el('td', S.ok ? fmt(S.cov / S.ok, 3) : '—'), el('td', b('asym'))),
      el('tr', el('td', 'Campioni con separazione (stima ML non esistente)'), el('td', '—'), el('td', S.k ? S.sep + ' (' + fmt(100 * S.sep / S.k, 1) + '%)' : '—'), el('td', b('mc'))));
    kpiBox.innerHTML = '';
    var f = S.last && S.last.fit;
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni di n = ' + S.n)),
      el('div.kpi', el('b', { style: 'font-size:1.1rem' }, f ? 'η̂ = ' + fmt(f.b0, 2) + ' + ' + fmt(f.b1, 2) + ' x' : '—'), el('span', 'ultimo adattamento' + (f ? ' (' + f.it + ' iterazioni)' : ''))),
      el('div.kpi', el('b', S.ok ? fmt(m - S.b1, 4) : '—'), el('span', 'distorsione stimata '), b('mc')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p12-' + Date.now();
    predBox.append(el('p.prose', 'Con n = ' + S.n + ' osservazioni, in media la stima β̂₁ rispetto al vero β₁ = ' + SA.fmt(S.b1, 2) + ' sarà:'),
      el('div.choices', { role: 'radiogroup' }, [['eq', 'Praticamente uguale'], ['away', 'Più lontana da zero'], ['toward', 'Più vicina a zero']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    if (S.ok < 300) { fbBox.textContent = 'Previsione registrata: il confronto compare dopo 300 stime finite (ora ' + S.ok + ').'; return; }
    var v = S.est.subarray(0, S.ok), m = SA.stat.mean(v), se = SA.stat.sd(v) / Math.sqrt(S.ok), d = m - S.b1;
    var truth = Math.abs(d) < 2 * se ? 'eq' : (d * S.b1 > 0 ? 'away' : 'toward');
    fbBox.textContent = (S.pred === truth ? '✓ ' : '✗ ') + 'Distorsione stimata ' + SA.fmt(d, 3) + ' ± ' + SA.fmt(2 * se, 3) + '. ' +
      'Lo stimatore di massima verosimiglianza nei GLM è distorto per n finito, tipicamente verso valori più lontani da zero, con distorsione dell’ordine di 1/n. ' + (S.sep ? 'Inoltre ' + S.sep + ' campioni non hanno una stima di massima verosimiglianza finita: escluderli altera la distribuzione.' : '');
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Un GLM collega la media della risposta ai predittori attraverso una <strong>funzione di legame</strong>: logit(p) = β₀ + β₁x per dati binari, log(μ) = β₀ + β₁x per conteggi. La stima è di massima verosimiglianza, calcolata con i minimi quadrati ponderati iterativi (IRLS) (lo stesso algoritmo di <code>glm()</code>).</p>' +
      '<p>Le proprietà della stima sono solo <strong>asintotiche</strong>: normalità, varianza (XᵀWX)⁻¹, copertura di Wald al 95%. Con n piccolo la distribuzione è asimmetrica e distorta, e nella regressione logistica può capitare la <strong>separazione</strong>: se una retta divide perfettamente gli 0 dagli 1, la verosimiglianza cresce senza limite e la stima non esiste. R lo segnala con un avviso, non con un errore.</p>' +
      (S.fam === 'pois' ? '<p>Per la Poisson la varianza è uguale alla media: se i dati sono più dispersi, gli errori standard del modello sono troppo piccoli (si usa allora una famiglia quasi-Poisson o binomiale negativa).</p>' : '');
  }
  function codeR() {
    var f = F();
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 12 — GLM: ' + f.label,
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; M <- ' + S.M + '; b0 <- ' + S.b0 + '; b1 <- ' + S.b1,
      'x <- -2 + 4 * (seq_len(n) - 0.5) / n', '',
      '# Un campione, un adattamento: stima, errore standard, convergenza',
      'adatta <- function() {', '  y <- ' + f.r,
      '  fit <- suppressWarnings(glm(y ~ x, family = ' + f.fam + '))',
      '  s <- summary(fit)$coefficients',
      '  # stime enormi = separazione (logistica) o stima non finita',
      '  tibble(b1_hat = s[2, 1], se = s[2, 2], finita = fit$converged & abs(s[2, 1]) < 30)', '}',
      'sim <- map(seq_len(M), \\(m) adatta()) |> list_rbind()', '',
      'sim |> summarise(separazione = mean(!finita))',
      'sim |> filter(finita) |>',
      '  summarise(media = mean(b1_hat), dev_std = sd(b1_hat), copertura_wald = mean(abs(b1_hat - b1) <= 1.96 * se))', '',
      '# Deviazione standard asintotica dall’informazione di Fisher nel vero β',
      'mu <- ' + (S.fam === 'logit' ? 'plogis(b0 + b1 * x); w <- mu * (1 - mu)' : 'exp(b0 + b1 * x); w <- mu'),
      'X <- cbind(1, x)', 'sqrt(solve(t(X) %*% (w * X))[2, 2])', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'sim |> filter(finita) |>', '  ggplot(aes(b1_hat)) +', '  geom_histogram(aes(y = after_stat(density)), bins = 40, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +',
      '  stat_function(fun = dnorm, args = list(mean = b1, sd = sqrt(solve(t(X) %*% (w * X))[2, 2])), linetype = "dashed", colour = "#D55E00", linewidth = 1) +',
      '  geom_vline(xintercept = b1, linetype = "dotted") +', '  labs(title = "Distribuzione della pendenza stimata", x = expression(hat(beta)[1]), y = "densità") +', '  theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Tre ingredienti</h3><ul><li>una legge per la risposta nella famiglia esponenziale (Binomiale, Poisson, Normale, Gamma…);</li><li>un predittore lineare η = β₀ + β₁x;</li><li>un legame g(μ) = η.</li></ul>' +
        '<div class="eq">logit(p) = log(p/(1 − p)) = β₀ + β₁x &nbsp;&nbsp;&nbsp; log(μ) = β₀ + β₁x</div>' +
        '<p>Interpretazione: nella logistica e<sup>β₁</sup> è il odds ratio per un aumento unitario di x; nella Poisson e<sup>β₁</sup> è il fattore moltiplicativo della media.</p>' +
        '<div class="callout warn">Le inferenze standard (errori standard, test di Wald, intervalli) sono asintotiche. Con dati scarsi o separazione possono essere fuorvianti.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>scoring di Fisher</h3><p>Con legame canonico lo score è Xᵀ(y − μ) e l’informazione XᵀWX con W = diag(Var(Yᵢ)). Il passo di Newton coincide con una regressione ponderata della working response zᵢ = ηᵢ + (yᵢ − μᵢ)/(dμ/dη) sui predittori, con pesi wᵢ: da qui “minimi quadrati ponderati iterativi (IRLS)”.</p>' +
        '<h3>Normalità asintotica</h3><div class="eq">β̂ ≈ N(β, (XᵀWX)⁻¹)</div><p>La curva del grafico usa W calcolata nel vero β; R stima gli errori standard con W calcolata in β̂.</p>' +
        '<h3>Distorsione e separazione</h3><p>La distorsione di primo ordine è O(1/n) (Cox e Snell, 1968) e allontana le stime da zero nella logistica. Se esiste una retta che separa perfettamente 0 e 1 la log-verosimiglianza tende a 0 lungo una direzione: la stima diverge (Albert e Anderson, 1984). La verosimiglianza penalizzata di Firth corregge entrambi i problemi.</p>' +
        '<h3>Devianza</h3><p>D = 2[ℓ(saturo) − ℓ(β̂)]. Per la Poisson con medie grandi D ≈ χ²<sub>n−2</sub>; per dati binari individuali questa approssimazione non vale.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); buildPrediction(); }
  function render(full) { drawData(); drawEst(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sl = function (lab, key, mn, mx) { return SA.ui.slider(lab, { min: mn, max: mx, step: 0.1, value: S[key], format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S[key] = v; restart(); } }); };
    ctrlBox.append(
      el('label.field', el('span', 'Famiglia e legame'), el('select', { onchange: function () { S.fam = this.value; S.b0 = FAM[S.fam].b0; S.b1 = FAM[S.fam].b1; buildControls(); restart(); } },
        Object.keys(FAM).map(function (k) { return el('option', { value: k, selected: k === S.fam }, FAM[k].label); }))),
      sl('Intercetta vera β₀', 'b0', -2, 2), sl('Pendenza vera β₁', 'b1', S.fam === 'logit' ? -4 : -1, S.fam === 'logit' ? 4 : 1),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [10, 20, 40, 100, 300].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
        el('label.field', el('span', 'Campioni M'), el('select', { onchange: function () { S.M = +this.value; restart(); } }, [200, 1000, 3000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('glm', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.M; }, progress: function () { return S.k / S.M; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Modelli lineari generalizzati', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Quando la risposta è un sì/no o un conteggio, la retta non basta: serve un legame. E le garanzie diventano asintotiche.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Quanto ci si può fidare delle stime di un GLM quando i dati sono pochi?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Campioni dal modello, stime con IRLS');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Il campione corrente'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'La pendenza stimata nei campioni ripetuti'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['stima_finita', 'b1_hat']]; for (var i = 0; i < S.ok; i++) rows.push([i + 1, S.est[i]]); SA.ui.download('statatlas_lab12_' + S.fam + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab12.png', [F().label, 'n = ' + S.n + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' scoring di Fisher, distorsione, separazione (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'glm() sugli stessi campioni'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab12_glm.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse. Le stime coincidono con quelle di StatAtlas entro la tolleranza di convergenza.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
