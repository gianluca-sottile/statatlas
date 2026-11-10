/* StatAtlas · Lab 09 — Test Z, errore di primo tipo e potenza */
(function () {
  var el, S, BINS = 48, Phi = SA.sf.pnorm, q = SA.qnorm;

  function newState(prev) {
    var s = { n: 20, delta: 0.5, alpha: 0.05, alt: 'two', B: 1000, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.rej0 = 0; s.rej1 = 0;
    s.z0 = new Float64Array(s.B); s.z1 = new Float64Array(s.B);
    var r = range(s); s.lo = r[0]; s.hi = r[1]; s.c0 = new Uint32Array(BINS); s.c1 = new Uint32Array(BINS);
    return s;
  }
  function nc(s) { s = s || S; return s.delta * Math.sqrt(s.n); }
  function range(s) { var m = nc(s); return [Math.min(-4, m - 4), Math.max(4, m + 4)]; }
  function crit(s) { s = s || S; return s.alt === 'two' ? q(1 - s.alpha / 2) : q(1 - s.alpha); }
  function reject(z) { return S.alt === 'two' ? Math.abs(z) > crit() : z > crit(); }
  function power(delta, n) {
    var m = delta * Math.sqrt(n), c = crit();
    return S.alt === 'two' ? Phi(-c + m) + Phi(-c - m) : Phi(m - c);
  }

  function step() {
    if (S.k >= S.B) return false;
    var x0 = S.rng.rnorm(S.n, 0, 1), x1 = S.rng.rnorm(S.n, S.delta, 1); // prima sotto H0, poi sotto H1
    var z0 = Math.sqrt(S.n) * SA.stat.mean(x0), z1 = Math.sqrt(S.n) * SA.stat.mean(x1), bw = (S.hi - S.lo) / BINS;
    S.z0[S.k] = z0; S.z1[S.k] = z1;
    if (reject(z0)) S.rej0++; if (reject(z1)) S.rej1++;
    var b0 = Math.floor((z0 - S.lo) / bw), b1 = Math.floor((z1 - S.lo) / bw);
    if (b0 >= 0 && b0 < BINS) S.c0[b0]++; if (b1 >= 0 && b1 < BINS) S.c1[b1]++;
    S.k++; return true;
  }

  var figA, figB, legA, legB;
  function drawZ() {
    var P = SA.plot, m = nc(), c = crit();
    var f = P.frame(figA, { W: 720, H: 300, x: [S.lo, S.hi], y: [0, 0.5], xlabel: 'statistica z = √n (x̄ − μ₀) / σ', ylabel: 'densità', label: 'Distribuzioni della statistica test' });
    var t = f.t, g = f.g, yb = f.y(0);
    function area(mu, a, b, col) {
      a = Math.max(a, S.lo); b = Math.min(b, S.hi); if (b <= a) return;
      var pts = [[f.x(a), yb]];
      for (var i = 0; i <= 80; i++) { var x = a + (b - a) * i / 80; pts.push([f.x(x), f.y(SA.dens.norm(x, mu, 1))]); }
      pts.push([f.x(b), yb]);
      P.svg('path', { d: P.path(pts) + 'Z', fill: col, 'fill-opacity': 0.28 }, g);
    }
    var regs = S.alt === 'two' ? [[S.lo, -c], [c, S.hi]] : [[c, S.hi]];
    regs.forEach(function (r) { area(m, r[0], r[1], t.c1); area(0, r[0], r[1], t.c2); });
    P.hist(f, S.c0, S.lo, S.hi, S.k, t.c2, { opacity: 0.08, dash: '3 2' });
    P.hist(f, S.c1, S.lo, S.hi, S.k, t.c1, { opacity: 0.08 });
    P.curve(f, function (x) { return SA.dens.norm(x, 0, 1); }, S.lo, S.hi, { stroke: t.c2, 'stroke-dasharray': '7 4' });
    P.curve(f, function (x) { return SA.dens.norm(x, m, 1); }, S.lo, S.hi, { stroke: t.c1 });
    (S.alt === 'two' ? [-c, c] : [c]).forEach(function (v) {
      P.svg('line', { x1: f.x(v), x2: f.x(v), y1: f.m.t, y2: yb, stroke: t.ink, 'stroke-width': 1.2 }, g);
      P.text(g, f.x(v) + 4, f.m.t + 10, (v < 0 ? '−' : '') + 'z* = ' + SA.fmt(Math.abs(v), 3), { fill: t.ink_2, 'font-size': 11.5 });
    });
    P.text(g, f.x(0), f.y(0.41), 'H₀: μ = μ₀', { 'text-anchor': 'middle', fill: t.c2, 'font-size': 12, 'font-weight': 600 });
    P.text(g, f.x(m), f.y(0.41) - (Math.abs(m) < 1.2 ? 16 : 0), 'H₁: μ = μ₀ + ' + SA.fmt(S.delta, 2) + 'σ', { 'text-anchor': 'middle', fill: t.c1, 'font-size': 12, 'font-weight': 600 });
  }
  function drawPower() {
    var P = SA.plot, f = P.frame(figB, { W: 720, H: 250, x: [0, 1.5], y: [0, 1], xlabel: 'effetto δ = (μ − μ₀)/σ', ylabel: 'potenza', label: 'Curva di potenza' });
    var t = f.t, g = f.g;
    P.svg('line', { x1: f.x(0), x2: f.x(1.5), y1: f.y(S.alpha), y2: f.y(S.alpha), stroke: t.c2, 'stroke-dasharray': '3 3' }, g);
    P.svg('line', { x1: f.x(0), x2: f.x(1.5), y1: f.y(0.8), y2: f.y(0.8), stroke: t.rule_2, 'stroke-dasharray': '2 4' }, g);
    P.text(g, f.x(1.5) - 4, f.y(0.8) - 5, '80%', { 'text-anchor': 'end', fill: t.ink_3, 'font-size': 11 });
    P.curve(f, function (d) { return power(d, Math.max(2, Math.round(S.n / 2))); }, 0, 1.5, { stroke: t.ink_3, 'stroke-width': 1.4, 'stroke-dasharray': '2 3' });
    P.curve(f, function (d) { return power(d, S.n * 2); }, 0, 1.5, { stroke: t.c3, 'stroke-width': 1.6, 'stroke-dasharray': '7 4' });
    P.curve(f, function (d) { return power(d, S.n); }, 0, 1.5, { stroke: t.c1 });
    var pw = power(S.delta, S.n);
    P.marker(g, 'circle', f.x(S.delta), f.y(pw), 11, t.card, t.c1);
    if (S.k) {
      var ps = S.rej1 / S.k, se = 1.96 * Math.sqrt(Math.max(ps * (1 - ps), 1e-9) / S.k);
      P.svg('line', { x1: f.x(S.delta) + 12, x2: f.x(S.delta) + 12, y1: f.y(Math.min(1, ps + se)), y2: f.y(Math.max(0, ps - se)), stroke: t.accent, 'stroke-width': 2 }, g);
      P.marker(g, 'diamond', f.x(S.delta) + 12, f.y(ps), 11, t.accent);
    }
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch;
    legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c2, '7 4'), 'sotto H₀ (area = α)'), el('span', sw(t.c1, null), 'sotto H₁ (area = potenza)'), el('span.muted', 'istogrammi: simulazione'));
    legB.append(el('span', sw(t.c1, null), 'n = ' + S.n), el('span', sw(t.c3, '7 4'), 'n = ' + 2 * S.n), el('span', sw(t.ink_3, '2 3'), 'n = ' + Math.max(2, Math.round(S.n / 2))),
      el('span', sw(t.accent, null, 'diamond'), 'potenza simulata ± 1,96 e.s.'));
  }

  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, pw = power(S.delta, S.n), k = S.k, z8 = q(0.8);
    var mcs = function (p) { return k ? ' ± ' + fmt(1.96 * Math.sqrt(p * (1 - p) / k), 3) : ''; };
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Errore di primo tipo P(rifiuto | H₀)'), el('td', fmt(S.alpha, 3)), el('td', k ? fmt(S.rej0 / k, 3) + mcs(S.alpha) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Potenza P(rifiuto | H₁)'), el('td', fmt(pw, 3)), el('td', k ? fmt(S.rej1 / k, 3) + mcs(pw) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Errore di secondo tipo β = 1 − potenza'), el('td', fmt(1 - pw, 3)), el('td', k ? fmt(1 - S.rej1 / k, 3) : '—'), el('td', b('exact'))));
    var nNeed = S.delta > 0 ? Math.ceil(Math.pow((crit() + z8) / S.delta, 2)) : Infinity;
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', fmt(nc(), 3)), el('span', 'spostamento atteso della statistica: δ√n')),
      el('div.kpi', el('b', isFinite(nNeed) ? String(nNeed) : '—'), el('span', 'n per potenza 80% ((z* + z₀.₈)/δ)² '), b(S.alt === 'two' ? 'approx' : 'exact')),
      el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'coppie di campioni (H₀, H₁)')));
    updateFeedback();
  }

  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p09-' + Date.now();
    predBox.append(el('p.prose', 'Il vero effetto è δ = ' + SA.fmt(S.delta, 2) + ' deviazioni standard, con n = ' + S.n + ' osservazioni e α = ' + S.alpha + '. Con che probabilità il test rifiuterà H₀?'),
      el('div.choices', { role: 'radiogroup' }, [['a', 'Meno del 20%'], ['b', 'Tra 20% e 50%'], ['c', 'Tra 50% e 80%'], ['d', 'Più dell’80%']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    var pw = power(S.delta, S.n), truth = pw < 0.2 ? 'a' : pw < 0.5 ? 'b' : pw < 0.8 ? 'c' : 'd';
    fbBox.textContent = (S.pred === truth ? '✓ ' : '✗ ') + 'La potenza teorica è ' + SA.fmt(100 * pw, 1) + '%' + (S.k ? ', quella simulata ' + SA.fmt(100 * S.rej1 / S.k, 1) + '% su ' + S.k + ' campioni' : '') +
      '. ' + (pw < 0.5 ? 'Un effetto reale può facilmente passare inosservato: “non rifiuto H₀” non significa “H₀ è vera”.' : 'Aumentando n la curva di potenza si sposta verso sinistra: effetti più piccoli diventano rilevabili.');
  }

  function interpretation() {
    interpBox.innerHTML = '<p>Il test rifiuta H₀ quando la statistica cade nella regione critica. Sotto H₀ questo accade con probabilità α, <strong>esattamente</strong> (dati normali, σ nota): è un rischio scelto prima di vedere i dati. Sotto H₁ la statistica è spostata di δ√n = ' + SA.fmt(nc(), 2) + ' e la probabilità di rifiuto è la <strong>potenza</strong>.</p>' +
      '<p>La potenza dipende da tre leve: l’effetto δ, la numerosità n e il livello α. Raddoppiare n moltiplica lo spostamento per √2, non per 2. ' + (S.alt === 'two' ? 'Il test bilaterale divide α tra le due code: a parità di α, contro un’alternativa unilaterale è meno potente del test unilaterale.' : 'Il test unilaterale concentra α in una sola coda: è più potente se l’effetto va nella direzione attesa, ma cieco all’altra.') + '</p>' +
      '<p class="muted">Il p-value è P(statistica almeno così estrema | H₀). Non è la probabilità che H₀ sia vera, e un p-value grande non prova l’assenza di effetto: guarda la potenza.</p>';
  }

  function codeR() {
    var two = S.alt === 'two';
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 09 — Test Z ' + (two ? 'bilaterale' : 'unilaterale destro') + ': livello e potenza',
      '# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse statistiche di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')',
      'n <- ' + S.n + '; B <- ' + S.B + '; alpha <- ' + S.alpha + '; delta <- ' + S.delta + '   # effetto in unità di σ (σ = 1, μ₀ = 0)',
      'z_crit <- qnorm(1 - alpha' + (two ? ' / 2' : '') + ')',
      'rifiuta <- function(z) ' + (two ? 'abs(z) > z_crit' : 'z > z_crit'), '',
      '# Per ogni replica: un campione sotto H0, poi uno sotto H1 (stesso ordine di StatAtlas)',
      'sim <- tibble(replica = seq_len(B)) |>',
      '  mutate(z = map(replica, \\(r) c(z0 = sqrt(n) * mean(rnorm(n, 0, 1)),',
      '                                 z1 = sqrt(n) * mean(rnorm(n, delta, 1))))) |>',
      '  unnest_wider(z)', '',
      'potenza_teorica <- function(d, n) ' + (two ? 'pnorm(-z_crit + d * sqrt(n)) + pnorm(-z_crit - d * sqrt(n))' : 'pnorm(d * sqrt(n) - z_crit)'),
      'sim |> summarise(errore_I = mean(rifiuta(z0)), potenza = mean(rifiuta(z1))) |>',
      '  mutate(alpha = alpha, potenza_teorica = potenza_teorica(delta, n))', '',
      '# n per potenza 80%' + (two ? ' (approssimato: trascura la coda opposta)' : ' (esatto)'),
      'ceiling(((z_crit + qnorm(0.8)) / delta)^2)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      '# Curve di potenza per n/2, n, 2n',
      'expand_grid(d = seq(0, 1.5, by = 0.01), n_ = c(max(2, round(n / 2)), n, 2 * n)) |>',
      '  mutate(potenza = potenza_teorica(d, n_), n_ = factor(n_)) |>',
      '  ggplot(aes(d, potenza, colour = n_, linetype = n_)) +',
      '  geom_hline(yintercept = c(alpha, 0.8), linetype = "dotted", colour = "grey50") +',
      '  geom_line(linewidth = 0.9) +',
      '  annotate("point", x = delta, y = mean(rifiuta(sim$z1)), shape = 18, size = 4, colour = "#9A3412") +',
      '  scale_colour_manual(values = c("grey55", "#0072B2", "#009E73")) +',
      '  labs(title = "Curva di potenza del test Z", x = expression(delta == (mu - mu[0]) / sigma), y = "potenza", colour = "n", linetype = "n") +',
      '  theme_statatlas()', ''].join('\n');
  }

  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Due ipotesi, due errori</h3><table class="tv"><thead><tr><th></th><th>Non rifiuto H₀</th><th>Rifiuto H₀</th></tr></thead><tbody>' +
        '<tr><td>H₀ vera</td><td>corretto</td><td>errore di I tipo (α)</td></tr><tr><td>H₁ vera</td><td>errore di II tipo (β)</td><td>corretto: potenza 1 − β</td></tr></tbody></table>' +
        '<h3>Il test Z</h3><p>Con dati N(μ, σ²) e σ nota, z = √n (x̄ − μ₀)/σ ha legge N(0, 1) se μ = μ₀ e N(δ√n, 1) se μ = μ₀ + δσ. Si rifiuta se |z| &gt; z<sub>1−α/2</sub> (bilaterale) o z &gt; z<sub>1−α</sub> (unilaterale).</p>' +
        '<div class="eq">potenza(δ) = Φ(δ√n − z<sub>1−α/2</sub>) + Φ(−δ√n − z<sub>1−α/2</sub>)</div>' +
        '<div class="callout warn">“Statisticamente significativo” non vuol dire “importante”: con n enorme anche un effetto irrilevante dà un p-value piccolo. Riporta sempre la stima dell’effetto e un intervallo.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Distribuzione del p-value</h3><p>Se la statistica è continua, sotto H₀ il p-value è U(0, 1): per questo P(p ≤ α) = α. Sotto H₁ la sua legge si concentra verso 0, tanto più quanto maggiore è la potenza.</p>' +
        '<h3>Ottimalità</h3><p>Per H₀: μ = μ₀ contro H₁: μ = μ₁ &gt; μ₀ il lemma di Neyman–Pearson indica il test che rifiuta per x̄ grande; poiché non dipende da μ₁, è uniformemente più potente per tutte le alternative unilaterali (famiglia a rapporto di verosimiglianza monotono). Per alternative bilaterali non esiste un test UMP; il test Z bilaterale è UMP tra i test non distorti.</p>' +
        '<h3>Numerosità campionaria</h3><p>Nel caso unilaterale potenza = Φ(δ√n − z<sub>1−α</sub>) = 1 − β dà esattamente n = ((z<sub>1−α</sub> + z<sub>1−β</sub>)/δ)². Nel bilaterale la stessa formula con z<sub>1−α/2</sub> trascura la coda opposta, di probabilità Φ(−δ√n − z<sub>1−α/2</sub>), trascurabile salvo δ√n piccolo.</p>' +
        '<h3>Quando σ non è nota</h3><p>Si usa la statistica t, che sotto H₁ ha legge t non centrale con parametro δ√n: la potenza è un po’ minore e si calcola con <code>power.t.test()</code>.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); buildPrediction(); }
  function render(full) { drawZ(); drawPower(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (label, key, vals, fmt) {
      return el('label.field', el('span', label), el('select', { onchange: function () { S[key] = isNaN(+this.value) ? this.value : +this.value; restart(); } },
        vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmt ? fmt(v) : String(v)); })));
    };
    ctrlBox.append(
      SA.ui.slider('Effetto vero δ (in σ)', { min: 0, max: 1.5, step: 0.05, value: S.delta, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.delta = v; restart(); } }),
      SA.ui.slider('Numerosità n', { min: 2, max: 200, step: 1, value: S.n, onchange: function (v) { S.n = v; legends(); restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('Livello α', 'alpha', [0.01, 0.05, 0.1]), sel('Alternativa', 'alt', ['two', 'greater'], function (v) { return v === 'two' ? 'μ ≠ μ₀' : 'μ > μ₀'; }),
        sel('Repliche B', 'B', [200, 1000, 5000]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Una coppia di campioni').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('test', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Test e potenza', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Ogni replica simula due mondi: uno in cui H₀ è vera e uno in cui non lo è. Il test sbaglia in entrambi, con frequenze che possiamo controllare.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Se un effetto esiste davvero, quanto è probabile che un test lo veda?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'La stessa procedura in due mondi');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'La statistica test sotto H₀ e sotto H₁'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Potenza in funzione dell’effetto'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['replica', 'z0', 'z1', 'rifiuto0', 'rifiuto1']];
          for (var i = 0; i < S.k; i++) rows.push([i + 1, S.z0[i], S.z1[i], reject(S.z0[i]) ? 1 : 0, reject(S.z1[i]) ? 1 : 0]);
          SA.ui.download('statatlas_lab09_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab09.png', ['Test Z: livello e potenza', 'n = ' + S.n + ' · δ = ' + S.delta + ' · α = ' + S.alpha + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione ± 1,96 e.s.'), el('th', 'Natura'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' p-value, Neyman–Pearson e numerosità (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stesse statistiche, stesse decisioni'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab09_test.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
