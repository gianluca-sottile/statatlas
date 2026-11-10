/* StatAtlas · Lab 13 — Serie temporali ARMA(2, 1): generazione, ACF, PACF, stazionarietà.
 * Spunto da Simul2000 (ARMA); implementazione e testi originali. */
(function () {
  var el, S, BURN = 200, LAGS = 20;
  var PRESETS = {
    ar1: { label: 'AR(1) persistente', p1: 0.8, p2: 0, th: 0 },
    ar2: { label: 'AR(2) pseudo-ciclico', p1: 1.2, p2: -0.6, th: 0 },
    ma1: { label: 'MA(1)', p1: 0, p2: 0, th: 0.7 },
    arma: { label: 'ARMA(1, 1)', p1: 0.6, p2: 0, th: -0.4 },
    unit: { label: 'Vicino a una radice unitaria', p1: 0.98, p2: 0, th: 0 },
    explo: { label: 'Non stazionario (φ₁ = 1,02)', p1: 1.02, p2: 0, th: 0 }
  };
  function stationary(p1, p2) { return p2 + p1 < 1 && p2 - p1 < 1 && Math.abs(p2) < 1; }
  /* radici reciproche di 1 − φ₁z − φ₂z² (devono stare dentro il cerchio unitario) */
  function arRoots(p1, p2) {
    if (p2 === 0) return p1 === 0 ? [] : [[p1, 0]];
    var d = p1 * p1 + 4 * p2;
    return d >= 0 ? [[(p1 + Math.sqrt(d)) / 2, 0], [(p1 - Math.sqrt(d)) / 2, 0]] : [[p1 / 2, Math.sqrt(-d) / 2], [p1 / 2, -Math.sqrt(-d) / 2]];
  }
  /* ACF teorica dai pesi ψ della rappresentazione MA(∞) */
  function theoryAcf(p1, p2, th) {
    if (!stationary(p1, p2)) return null;
    var N = 4000, psi = new Float64Array(N); psi[0] = 1; if (N > 1) psi[1] = p1 + th;
    for (var j = 2; j < N; j++) psi[j] = p1 * psi[j - 1] + p2 * psi[j - 2];
    var g = [];
    for (var h = 0; h <= LAGS; h++) { var s = 0; for (j = 0; j + h < N; j++) s += psi[j] * psi[j + h]; g.push(s); }
    return { g0: g[0], rho: g.map(function (v) { return v / g[0]; }) };
  }
  /* PACF via Durbin–Levinson */
  function pacf(rho) {
    var out = [], phi = [], prev = [];
    for (var k = 1; k <= LAGS; k++) {
      var num = rho[k], den = 1;
      for (var j = 1; j < k; j++) { num -= prev[j - 1] * rho[k - j]; den -= prev[j - 1] * rho[j]; }
      var pkk = num / den; phi = [];
      for (j = 1; j < k; j++) phi.push(prev[j - 1] - pkk * prev[k - j - 1]);
      phi.push(pkk); prev = phi; out.push(pkk);
    }
    return out;
  }

  function newState(prev) {
    var s = { preset: 'ar2', p1: 1.2, p2: -0.6, th: 0, T: 400, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.x = new Float64Array(s.T);
    var x1 = 0, x2 = 0, e1 = 0; // burn-in: stesse innovazioni e stessa ricorsione dello script R
    for (var t = 0; t < BURN; t++) { var e = s.rng.norm(), x = s.p1 * x1 + s.p2 * x2 + e + s.th * e1; x2 = x1; x1 = x; e1 = e; }
    s.state = [x1, x2, e1]; s.th0 = theoryAcf(s.p1, s.p2, s.th);
    return s;
  }
  function step() {
    if (S.k >= S.T) return false;
    var st = S.state, e = S.rng.norm(), x = S.p1 * st[0] + S.p2 * st[1] + e + S.th * st[2];
    S.state = [x, st[0], e]; S.x[S.k++] = x; return true;
  }
  function sampleAcf() {
    var n = S.k; if (n < LAGS + 5) return null;
    var x = S.x.subarray(0, n), m = SA.stat.mean(x), g = [];
    for (var h = 0; h <= LAGS; h++) { var s = 0; for (var t = 0; t + h < n; t++) s += (x[t] - m) * (x[t + h] - m); g.push(s / n); }
    return { g0: g[0], rho: g.map(function (v) { return v / g[0]; }) };
  }

  var figA, figB, figC, figD, legA, legB;
  function drawSeries() {
    var P = SA.plot, th = S.th0, sd = th ? Math.sqrt(th.g0) : 5, lim = 3.5 * sd, i;
    if (S.k) { var mx = 0; for (i = 0; i < S.k; i++) mx = Math.max(mx, Math.abs(S.x[i])); lim = Math.max(lim, mx * 1.05); }
    var f = P.frame(figA, { W: 720, H: 240, x: [0, S.T], y: [-+lim.toPrecision(2), +lim.toPrecision(2)], xlabel: 't', ylabel: 'xₜ', label: 'Serie generata' });
    var t = f.t, g = f.g;
    if (th) [-1.96, 1.96].forEach(function (z) { P.svg('line', { x1: f.x(0), x2: f.x(S.T), y1: f.y(z * sd), y2: f.y(z * sd), stroke: t.c3, 'stroke-dasharray': '4 3' }, g); });
    if (!S.k) { P.text(g, 360, 110, 'Premi ▶: la serie cresce un istante alla volta', { 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }); return; }
    var pts = []; for (i = 0; i < S.k; i++) pts.push([f.x(i + 1), f.y(S.x[i])]);
    P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c1, 'stroke-width': 1.3 }, g);
    P.svg('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 3.5, fill: t.accent }, g);
  }
  function drawCorr(fig, kind) {
    var P = SA.plot, sa = sampleAcf(), th = S.th0, emp = sa ? (kind === 'acf' ? sa.rho.slice(1) : pacf(sa.rho)) : null, teo = th ? (kind === 'acf' ? th.rho.slice(1) : pacf(th.rho)) : null;
    var f = P.frame(fig, { W: 350, H: 220, x: [0, LAGS + 1], y: [-1, 1], xlabel: 'ritardo h', label: kind === 'acf' ? 'Autocorrelazione' : 'Autocorrelazione parziale', m: { t: 14, r: 10, b: 40, l: 38 }, xTicks: 5 });
    var t = f.t, g = f.g, band = S.k ? 1.96 / Math.sqrt(S.k) : 0;
    if (band) { P.svg('rect', { x: f.x(0), width: f.x(LAGS + 1) - f.x(0), y: f.y(band), height: f.y(-band) - f.y(band), fill: t.c3, 'fill-opacity': 0.1 }, g); }
    for (var h = 1; h <= LAGS; h++) {
      if (emp) P.svg('line', { x1: f.x(h), x2: f.x(h), y1: f.y(0), y2: f.y(emp[h - 1]), stroke: t.c1, 'stroke-width': 4, 'stroke-opacity': 0.7 }, g);
      if (teo) P.marker(g, 'diamond', f.x(h) + 0.01, f.y(teo[h - 1]), 9, t.c2);
    }
  }
  function drawRoots() {
    var P = SA.plot, f = P.frame(figD, { W: 350, H: 220, x: [-1.5, 1.5], y: [-1.1, 1.1], xlabel: 'parte reale', label: 'Radici reciproche nel piano complesso', m: { t: 14, r: 10, b: 40, l: 38 }, xTicks: 6 });
    var t = f.t, g = f.g, circ = [];
    for (var i = 0; i <= 120; i++) { var a = 2 * Math.PI * i / 120; circ.push([f.x(Math.cos(a)), f.y(Math.sin(a))]); }
    P.svg('path', { d: P.path(circ), fill: t.c3, 'fill-opacity': 0.06, stroke: t.ink_3 }, g);
    arRoots(S.p1, S.p2).forEach(function (r) { var out = Math.hypot(r[0], r[1]) >= 1; P.marker(g, 'tri', f.x(r[0]), f.y(Math.max(-1.05, Math.min(1.05, r[1]))), 13, out ? t.accent : t.c1); });
    if (S.th !== 0) P.marker(g, 'circle', f.x(-S.th), f.y(0), 12, 'none', Math.abs(S.th) >= 1 ? t.accent : t.c2);
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c1, null), 'serie'), el('span', sw(t.c3, '4 3'), '±1,96 dev. std stazionaria'));
    legB.append(el('span', sw(t.c1, null), 'empirica'), el('span', sw(t.c2, null, 'diamond'), 'teorica'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c3 + ';opacity:.3;border-radius:2px' }), '±1,96/√T (rumore bianco)'),
      el('span', sw(t.c1, null, 'tri'), 'radici AR'), el('span', sw(t.c2, null, 'circle'), 'radice MA'));
  }

  var tblBody, kpiBox, fbBox, interpBox, predBox, codeBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, th = S.th0, sa = sampleAcf(), pt = th ? pacf(th.rho) : null, ps = sa ? pacf(sa.rho) : null;
    tblBody.innerHTML = '';
    [['Varianza γ(0)', th && th.g0, sa && sa.g0], ['ρ(1)', th && th.rho[1], sa && sa.rho[1]], ['ρ(2)', th && th.rho[2], sa && sa.rho[2]], ['ρ(5)', th && th.rho[5], sa && sa.rho[5]],
      ['Autocorrelazione parziale φ₂₂', pt && pt[1], ps && ps[1]], ['Autocorrelazione parziale φ₃₃', pt && pt[2], ps && ps[2]]].forEach(function (r) {
      tblBody.appendChild(el('tr', el('td', r[0]), el('td', th ? fmt(r[1], 4) : 'non definita'), el('td', sa ? fmt(r[2], 4) : '—'), el('td', b(th ? 'exact' : 'none'))));
    });
    var st = stationary(S.p1, S.p2), inv = Math.abs(S.th) < 1;
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.T), el('span', 'osservazioni (dopo ' + BURN + ' di riscaldamento)')),
      el('div.kpi', el('b', st ? 'stazionario' : 'non stazionario'), el('span', 'radici reciproche AR ' + (st ? 'dentro' : 'non tutte dentro') + ' il cerchio')),
      el('div.kpi', el('b', inv ? 'invertibile' : 'non invertibile'), el('span', '|θ₁| ' + (inv ? '<' : '≥') + ' 1')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p13-' + Date.now();
    predBox.append(el('p.prose', 'Per un processo MA(1) l’autocorrelazione è nulla oltre il ritardo 1. Che cosa farà invece l’autocorrelazione parziale?'),
      el('div.choices', { role: 'radiogroup' }, [['cut', 'Si annulla anch’essa dopo il ritardo 1'], ['decay', 'Decresce gradualmente, senza annullarsi'], ['const', 'Resta costante']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'decay' ? '✓ ' : '✗ ') + 'È la dualità tra AR e MA: per un AR(p) la PACF si annulla dopo p e l’ACF decresce; per un MA(q) l’ACF si annulla dopo q e la PACF decresce (con segni alterni se θ > 0). Scegli il modello MA(1) e confronta i due grafici.';
  }
  function interpretation() {
    var st = stationary(S.p1, S.p2);
    interpBox.innerHTML = '<p>Ogni valore della serie è una combinazione dei valori passati (parte <strong>AR</strong>, coefficienti φ) e degli shock passati (parte <strong>MA</strong>, coefficiente θ), più uno shock nuovo. L’<strong>ACF</strong> misura la memoria complessiva, la <strong>PACF</strong> quella diretta, depurata dai ritardi intermedi.</p>' +
      (st ? '<p>Qui le radici reciproche del polinomio AR stanno dentro il cerchio unitario: il processo è <strong>stazionario</strong>, oscilla attorno a 0 con varianza costante, e le autocorrelazioni empiriche convergono a quelle teoriche. Più una radice è vicina al bordo, più lunga è la memoria e più osservazioni servono per stimarla.' + (S.p2 < 0 && S.p1 * S.p1 + 4 * S.p2 < 0 ? ' Radici complesse producono un andamento pseudo-ciclico.' : '') + '</p>'
        : '<p>Una radice reciproca sta fuori (o sul bordo) del cerchio: il processo <strong>non è stazionario</strong>. La serie esplode o vaga senza tornare, le autocorrelazioni teoriche non sono definite e quelle empiriche dipendono da T: non stimano nulla.</p>') +
      '<p class="muted">La banda ±1,96/√T vale per il rumore bianco: barre empiriche fuori dalla banda suggeriscono dipendenza, ma su 20 ritardi circa una esce per caso.</p>';
  }
  function codeR() {
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 13 — ARMA(2, 1): φ₁ = ' + S.p1 + ', φ₂ = ' + S.p2 + ', θ₁ = ' + S.th,
      '# Generazione esplicita (non arima.sim) per avere gli stessi numeri di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'phi <- c(' + S.p1 + ', ' + S.p2 + '); theta <- ' + S.th + '; T <- ' + S.T + '; burn <- ' + BURN, '',
      'e <- rnorm(burn + T)', 'x <- numeric(burn + T)', 'for (t in seq_along(x)) {',
      '  x1 <- if (t > 1) x[t - 1] else 0; x2 <- if (t > 2) x[t - 2] else 0; e1 <- if (t > 1) e[t - 1] else 0',
      '  x[t] <- phi[1] * x1 + phi[2] * x2 + e[t] + theta * e1', '}', 'x <- x[-seq_len(burn)]   # scarta il riscaldamento', '',
      '# Stazionarietà e invertibilità: moduli delle radici (devono superare 1)',
      'Mod(polyroot(c(1, -phi)))', 'abs(theta) < 1', '',
      '# ACF e PACF: empiriche e teoriche',
      'confronto <- tibble(ritardo = 1:' + LAGS + ',',
      '  acf_emp  = acf(x, lag.max = ' + LAGS + ', plot = FALSE)$acf[-1],',
      '  acf_teo  = ARMAacf(ar = phi, ma = theta, lag.max = ' + LAGS + ')[-1],',
      '  pacf_emp = pacf(x, lag.max = ' + LAGS + ', plot = FALSE)$acf[, 1, 1],',
      '  pacf_teo = ARMAacf(ar = phi, ma = theta, lag.max = ' + LAGS + ', pacf = TRUE))', 'confronto', '',
      '# Stima di massima verosimiglianza del modello che ha generato i dati',
      'arima(x, order = c(2, 0, 1), include.mean = FALSE)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'tibble(t = seq_along(x), x = x) |> ggplot(aes(t, x)) + geom_line(colour = "#0072B2") + theme_statatlas()',
      'confronto |>', '  pivot_longer(-ritardo, names_to = c("funzione", "tipo"), names_sep = "_") |>',
      '  ggplot(aes(ritardo, value, colour = tipo)) +', '  geom_hline(yintercept = c(-1, 1) * 1.96 / sqrt(T), linetype = "dashed", colour = "grey60") +',
      '  geom_point() + geom_line() + facet_wrap(~ funzione) +', '  scale_colour_manual(values = c(emp = "#0072B2", teo = "#D55E00")) +', '  labs(y = NULL) + theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Il modello</h3><div class="eq">Xₜ = φ₁Xₜ₋₁ + φ₂Xₜ₋₂ + εₜ + θ₁εₜ₋₁, &nbsp; εₜ rumore bianco N(0, 1)</div>' +
        '<h3>Stazionarietà</h3><p>Il processo è stazionario se le radici di 1 − φ₁z − φ₂z² stanno fuori dal cerchio unitario (equivalentemente, le reciproche dentro). Per l’AR(2): φ₁ + φ₂ &lt; 1, φ₂ − φ₁ &lt; 1, |φ₂| &lt; 1.</p>' +
        '<h3>Riconoscere il modello</h3><table class="tv"><thead><tr><th></th><th>ACF</th><th>PACF</th></tr></thead><tbody><tr><td>AR(p)</td><td>decresce</td><td>zero dopo p</td></tr><tr><td>MA(q)</td><td>zero dopo q</td><td>decresce</td></tr><tr><td>ARMA</td><td>decresce</td><td>decresce</td></tr></tbody></table>' +
        '<div class="callout warn">Il riscaldamento (burn-in) serve a dimenticare il valore iniziale arbitrario xₜ = 0: senza, i primi valori non seguono la legge stazionaria.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Rappresentazione MA(∞)</h3><p>Se il processo è stazionario Xₜ = Σ ψⱼ εₜ₋ⱼ con ψ₀ = 1, ψ₁ = φ₁ + θ₁, ψⱼ = φ₁ψⱼ₋₁ + φ₂ψⱼ₋₂. Allora γ(h) = Σ ψⱼψⱼ₊ₕ: è così che StatAtlas calcola l’ACF teorica.</p>' +
        '<h3>Durbin–Levinson</h3><p>La PACF φₖₖ è l’ultimo coefficiente della migliore previsione lineare di Xₜ da Xₜ₋₁, …, Xₜ₋ₖ, e si ottiene ricorsivamente dalle autocorrelazioni.</p>' +
        '<h3>Invertibilità</h3><p>Se |θ₁| &lt; 1 gli shock si ricostruiscono dalle osservazioni passate (εₜ = Σ (−θ₁)ʲ …). Per |θ₁| &gt; 1 esiste un modello invertibile con θ₁ sostituito da 1/θ₁ e la stessa ACF: senza la condizione il modello non è identificabile.</p>' +
        '<h3>Distribuzione delle autocorrelazioni empiriche</h3><p>Per rumore bianco ρ̂(h) ≈ N(0, 1/T) (da qui la banda). Per un processo generico la varianza è data dalla formula di Bartlett e dipende da tutte le autocorrelazioni: con memoria lunga la ρ̂ è molto più variabile, ed è distorta verso zero per T finito.</p>' });
    }
  };

  var run, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { drawSeries(); if (full || run.frame % 3 === 0 || !run.running) { drawCorr(figB, 'acf'); drawCorr(figC, 'pacf'); drawRoots(); updateTable(); } }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sl = function (lab, key, mn, mx) { return SA.ui.slider(lab, { min: mn, max: mx, step: 0.02, value: S[key], format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S[key] = v; S.preset = 'custom'; buildControls(); restart(); } }); };
    ctrlBox.append(
      el('label.field', el('span', 'Modello di partenza'), el('select', { onchange: function () { var p = PRESETS[this.value]; S.preset = this.value; S.p1 = p.p1; S.p2 = p.p2; S.th = p.th; buildControls(); restart(); } },
        [el('option', { value: 'custom', selected: S.preset === 'custom' }, 'Personalizzato')].concat(Object.keys(PRESETS).map(function (k) { return el('option', { value: k, selected: k === S.preset }, PRESETS[k].label); })))),
      sl('φ₁', 'p1', -2, 2), sl('φ₂', 'p2', -1, 1), sl('θ₁', 'th', -1.5, 1.5),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Lunghezza T'), el('select', { onchange: function () { S.T = +this.value; restart(); } }, [100, 400, 1000, 3000].map(function (v) { return el('option', { value: v, selected: v === S.T }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un istante').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('arma', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 2, step: step, render: render, done: function () { return S.k >= S.T; }, progress: function () { return S.k / S.T; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Serie temporali ARMA', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Dati che ricordano il proprio passato. La memoria si legge nelle autocorrelazioni, e la stabilità nelle radici di un polinomio.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Come si riconosce dalla sola serie osservata il meccanismo che l’ha generata?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Una serie che cresce un istante alla volta');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); figD = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'La serie'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Memoria della serie'), legB),
          el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px' },
            el('div', el('div.muted', { style: 'font-size:.8rem;margin-bottom:2px' }, 'ACF'), figB), el('div', el('div.muted', { style: 'font-size:.8rem;margin-bottom:2px' }, 'PACF'), figC),
            el('div', el('div.muted', { style: 'font-size:.8rem;margin-bottom:2px' }, 'Radici reciproche: dentro il cerchio = stazionario/invertibile'), figD))),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['t', 'x']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.x[i]]); SA.ui.download('statatlas_lab13_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab13.png', ['ARMA(2, 1): φ₁ = ' + S.p1 + ', φ₂ = ' + S.p2 + ', θ₁ = ' + S.th, 'T = ' + S.k + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Serie simulata'), el('th', 'Natura'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Pesi ψ, Durbin–Levinson, invertibilità e Bartlett (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessa ricorsione, stesse innovazioni'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab13_arma.R');
      s6.body.append(el('p.prose', 'Usa ARMAacf() per la teoria e arima() per la stima. Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
