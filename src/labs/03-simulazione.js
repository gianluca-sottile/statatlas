/* StatAtlas · Lab 03 — Metodi di simulazione: inversione e integrazione Monte Carlo.
 * Spunto didattico da Simul2000 (M. Chiodi); implementazione e testi originali. */
(function () {
  var el, S, LAWS = SA.laws, BINS = 36;
  var FUNS = {
    sq:   { label: 'f(x) = x²', f: function (x) { return x * x; }, I: 1 / 3, I2: 1 / 5, r: 'x^2', Itxt: '1/3' },
    par:  { label: 'f(x) = 4x(1 − x)', f: function (x) { return 4 * x * (1 - x); }, I: 2 / 3, I2: 8 / 15, r: '4 * x * (1 - x)', Itxt: '2/3' },
    sin:  { label: 'f(x) = sin(πx)', f: function (x) { return Math.sin(Math.PI * x); }, I: 2 / Math.PI, I2: 0.5, r: 'sin(pi * x)', Itxt: '2/π' },
    pow4: { label: 'f(x) = (1 − x)⁴', f: function (x) { return Math.pow(1 - x, 4); }, I: 0.2, I2: 1 / 9, r: '(1 - x)^4', Itxt: '1/5' }
  };
  var INV_LAWS = ['exp', 'norm', 'weibull', 'cauchy', 'beta', 'geom', 'pois', 'binom'];

  function defaults(L) { var p = {}; L.params.forEach(function (q) { p[q.key] = q.value; }); return p; }
  function newState(prev) {
    var s = { mode: 'inv', law: 'norm', fun: 'sq', N: 1000, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0;
    if (s.mode === 'inv') {
      var L = LAWS.get(s.law); s.p = defaults(L);
      s.u = new Float64Array(s.N); s.x = new Float64Array(s.N);
      if (L.kind === 'discrete') { s.lo = L.q(0.0005, s.p); s.hi = Math.max(s.lo + 1, L.q(0.9995, s.p)); s.counts = new Uint32Array(s.hi - s.lo + 1); }
      else { var r = L.range(s.p); s.lo = r[0]; s.hi = r[1]; s.counts = new Uint32Array(BINS); }
    } else {
      s.u = new Float64Array(s.N); s.v = new Float64Array(s.N); s.sumF = 0; s.sumF2 = 0; s.hits = 0;
      s.trace = []; // [n, stima media, stima hit-or-miss]
    }
    return s;
  }
  function law() { return LAWS.get(S.law); }
  function fun() { return FUNS[S.fun]; }

  function step() {
    if (S.k >= S.N) return false;
    if (S.mode === 'inv') {
      var L = law(), u = S.rng.unif(), x = L.q(u, S.p);
      S.u[S.k] = u; S.x[S.k] = x;
      if (L.kind === 'discrete') { var i = x - S.lo; if (i >= 0 && i < S.counts.length) S.counts[i]++; }
      else { var b = Math.floor((x - S.lo) / ((S.hi - S.lo) / BINS)); if (b >= 0 && b < BINS) S.counts[b]++; }
    } else {
      var U = S.rng.unif(), V = S.rng.unif(), fu = fun().f(U);
      S.u[S.k] = U; S.v[S.k] = V; S.sumF += fu; S.sumF2 += fu * fu; if (V <= fu) S.hits++;
      var n = S.k + 1;
      if (n <= 50 || n % Math.max(1, Math.floor(S.N / 400)) === 0 || n === S.N) S.trace.push([n, S.sumF / n, S.hits / n]);
    }
    S.k++;
    return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB, titA, titB;
  function drawInvCdf() {
    var L = law(), P = SA.plot, disc = L.kind === 'discrete', xr = disc ? [S.lo - 1, S.hi + 1] : [S.lo, S.hi];
    var f = P.frame(figA, { W: 720, H: 300, x: xr, y: [0, 1], xlabel: 'x', ylabel: 'u = F(x)', label: 'Funzione di ripartizione e inversione' });
    var t = f.t, g = f.g, i;
    if (disc) for (i = xr[0]; i <= xr[1]; i++) {
      var F = L.cdf(i, S.p), F0 = L.cdf(i - 1, S.p);
      P.svg('line', { x1: f.x(i), x2: f.x(i + 1), y1: f.y(F), y2: f.y(F), stroke: t.c_theory, 'stroke-width': 2.2 }, g);
      P.svg('line', { x1: f.x(i), x2: f.x(i), y1: f.y(F0), y2: f.y(F), stroke: t.rule_2, 'stroke-dasharray': '2 3' }, g);
    } else P.curve(f, function (x) { return L.cdf(x, S.p); }, xr[0], xr[1], { stroke: t.c_theory });
    var from = Math.max(0, S.k - 25);
    for (i = from; i < S.k; i++) {
      var last = i === S.k - 1, u = S.u[i], x = Math.max(xr[0], Math.min(xr[1], S.x[i])), op = last ? 1 : 0.12 + 0.5 * (i - from) / 25;
      P.svg('path', { d: 'M' + f.x(xr[0]) + ',' + f.y(u) + 'L' + f.x(x) + ',' + f.y(u) + 'L' + f.x(x) + ',' + f.y(0), fill: 'none',
        stroke: last ? t.accent : t.c1, 'stroke-opacity': op, 'stroke-width': last ? 2.2 : 1 }, g);
      if (last) {
        P.marker(g, 'circle', f.x(xr[0]), f.y(u), 10, t.accent);
        P.marker(g, 'tri', f.x(x), f.y(0) - 6, 12, t.accent);
        P.text(g, f.x(xr[0]) + 8, f.y(u) - 7, 'u = ' + SA.fmt(u, 3), { fill: t.accent, 'font-size': 12, 'font-weight': 600 });
        P.text(g, f.x(x) + 8, f.y(0) - 14, 'x = F⁻¹(u) = ' + SA.fmt(S.x[i], disc ? 0 : 3), { fill: t.accent, 'font-size': 12, 'font-weight': 600 });
      }
    }
  }
  function drawInvHist() {
    var L = law(), P = SA.plot, disc = L.kind === 'discrete', i, ymax = 0;
    var xr = disc ? [S.lo - 0.6, S.hi + 0.6] : [S.lo, S.hi];
    if (disc) for (i = S.lo; i <= S.hi; i++) ymax = Math.max(ymax, L.pmf(i, S.p));
    else for (i = 1; i < 200; i++) { var d = L.pdf(S.lo + (S.hi - S.lo) * i / 200, S.p); if (isFinite(d)) ymax = Math.max(ymax, d); }
    var f = P.frame(figB, { W: 720, H: 240, x: xr, y: [0, +(ymax * 1.3).toPrecision(2)], xlabel: 'x', ylabel: disc ? 'P(X = x)' : 'f(x)', xTicks: disc ? Math.min(12, S.hi - S.lo + 1) : 8, label: 'Istogramma dei valori generati' });
    var t = f.t, g = f.g;
    if (disc) for (i = S.lo; i <= S.hi; i++) {
      if (S.k) { var h = S.counts[i - S.lo] / S.k; P.svg('rect', { x: f.x(i) - 9, width: 18, y: Math.max(f.m.t, f.y(h)), height: f.y(0) - Math.max(f.m.t, f.y(h)), fill: t.c1, 'fill-opacity': 0.22, stroke: t.c1 }, g); }
      var pv = L.pmf(i, S.p);
      P.svg('line', { x1: f.x(i), x2: f.x(i), y1: f.y(0), y2: f.y(pv), stroke: t.c_theory, 'stroke-width': 2 }, g);
      P.svg('circle', { cx: f.x(i), cy: f.y(pv), r: 3.5, fill: t.c_theory }, g);
    } else { P.hist(f, S.counts, S.lo, S.hi, S.k, t.c1); P.curve(f, function (x) { return L.pdf(x, S.p); }, S.lo, S.hi, { stroke: t.c_theory }); }
  }
  function drawMcSquare() {
    var P = SA.plot, F = fun();
    var f = P.frame(figA, { W: 720, H: 330, x: [0, 1], y: [0, 1], xlabel: 'u', ylabel: 'v', m: { t: 16, r: 210, b: 42, l: 230 }, label: 'Punti nel quadrato unitario' });
    var t = f.t, g = f.g, i, from = Math.max(0, S.k - 1500);
    P.svg('path', { d: P.path([[f.x(0), f.y(0)]].concat((function () { var a = []; for (var j = 0; j <= 120; j++) a.push([f.x(j / 120), f.y(F.f(j / 120))]); return a; })(), [[f.x(1), f.y(0)]])) + 'Z', fill: t.c3, 'fill-opacity': 0.08 }, g);
    var hits = [], miss = '';
    for (i = from; i < S.k; i++) {
      var cx = f.x(S.u[i]), cy = f.y(S.v[i]);
      if (S.v[i] <= F.f(S.u[i])) hits.push([cx, cy]); else miss += 'M' + (cx - 2).toFixed(1) + ',' + (cy - 2).toFixed(1) + 'l4,4m0,-4l-4,4';
    }
    P.dots(g, hits, 2.2, t.c3, 0.8);
    if (miss) P.svg('path', { d: miss, stroke: t.c2, 'stroke-width': 1, 'stroke-opacity': 0.75, fill: 'none' }, g);
    P.curve(f, F.f, 0, 1, { stroke: t.c_theory });
    if (S.k) {
      var lu = S.u[S.k - 1], lv = S.v[S.k - 1];
      P.svg('line', { x1: f.x(lu), x2: f.x(lu), y1: f.y(0), y2: f.y(F.f(lu)), stroke: t.c1, 'stroke-width': 2 }, g);
      P.marker(g, 'circle', f.x(lu), f.y(lv), 11, 'none', t.accent);
    }
  }
  function drawMcTrace() {
    var P = SA.plot, F = fun(), sdM = Math.sqrt(F.I2 - F.I * F.I), sdH = Math.sqrt(F.I * (1 - F.I)), N = S.N;
    var f = P.frame(figB, { W: 720, H: 260, x: [0, N], y: [+(F.I - 0.35).toFixed(2), +(F.I + 0.35).toFixed(2)], xlabel: 'n (coppie generate)', ylabel: 'stima di I', label: 'Stime al crescere di n' });
    var t = f.t, g = f.g;
    [[sdH, t.c2, '7 4'], [sdM, t.c1, null]].forEach(function (b) {
      P.curve(f, function (n) { return F.I + 1.96 * b[0] / Math.sqrt(Math.max(1, n)); }, 1, N, { stroke: b[1], 'stroke-width': 1, 'stroke-opacity': 0.55, 'stroke-dasharray': '2 3' }, 300);
      P.curve(f, function (n) { return F.I - 1.96 * b[0] / Math.sqrt(Math.max(1, n)); }, 1, N, { stroke: b[1], 'stroke-width': 1, 'stroke-opacity': 0.55, 'stroke-dasharray': '2 3' }, 300);
    });
    P.svg('line', { x1: f.x(0), x2: f.x(N), y1: f.y(F.I), y2: f.y(F.I), stroke: t.ink, 'stroke-dasharray': '6 4' }, g);
    P.text(g, f.x(N) - 4, f.y(F.I) - 6, 'I = ' + F.Itxt + ' = ' + SA.fmt(F.I, 4), { 'text-anchor': 'end', fill: t.ink_2, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 });
    if (S.trace.length) {
      var lo = f.y.domain[0], hi = f.y.domain[1], cl = function (v) { return f.y(Math.max(lo, Math.min(hi, v))); };
      P.svg('path', { d: P.path(S.trace.map(function (r) { return [f.x(r[0]), cl(r[2])]; })), fill: 'none', stroke: t.c2, 'stroke-width': 1.8, 'stroke-dasharray': '7 4' }, g);
      P.svg('path', { d: P.path(S.trace.map(function (r) { return [f.x(r[0]), cl(r[1])]; })), fill: 'none', stroke: t.c1, 'stroke-width': 2 }, g);
    }
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch;
    legA.innerHTML = ''; legB.innerHTML = '';
    if (S.mode === 'inv') {
      titA.textContent = 'Da u a x: il percorso dell’inversione'; titB.textContent = 'I valori generati ricostruiscono la legge';
      legA.append(el('span', sw(t.c_theory, null), 'F(x)'), el('span', sw(t.accent, null, 'circle'), 'ultima estrazione'), el('span', sw(t.c1, null), 'estrazioni precedenti'));
      legB.append(el('span', sw(t.c1, null), 'simulazione'), el('span', sw(t.c_theory, null), 'teoria'));
    } else {
      titA.textContent = 'Le coppie (u, v) nel quadrato unitario'; titB.textContent = 'Due stime dello stesso integrale';
      legA.append(el('span', sw(t.c3, null, 'circle'), 'v ≤ f(u): successo'), el('span', sw(t.c2, null), '× v > f(u)'), el('span', sw(t.c1, null), 'valore f(u) dell’ultima coppia'));
      legB.append(el('span', sw(t.c1, null), 'media di f(U)'), el('span', sw(t.c2, '7 4'), 'hit-or-miss'), el('span', sw(t.ink_3, '2 3'), 'I ± 1,96 σ/√n'));
    }
  }

  /* ---------- tabella ---------- */
  var tblHead, tblBody, kpiBox, fbBox, interpBox;
  function tr(c) { return el('tr', c.map(function (x) { return el('td', x); })); }
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge;
    tblBody.innerHTML = ''; kpiBox.innerHTML = '';
    if (S.mode === 'inv') {
      var L = law(), x = S.x.subarray(0, S.k), m = S.k ? SA.stat.mean(x) : NaN, sd = S.k > 1 ? SA.stat.sd(x) : NaN, mu = L.mean(S.p), v = L.var(S.p);
      var med = L.q(0.5, S.p), ub = 0; for (var i = 0; i < S.k; i++) ub += S.x[i] <= med ? 1 : 0;
      tblHead.innerHTML = '<tr><th>Quantità</th><th>Teoria</th><th>Simulazione</th><th>Natura</th></tr>';
      tblBody.append(
        tr(['Media', isNaN(mu) ? 'non esiste' : fmt(mu, 4), fmt(m, 4), b('exact')]),
        tr(['Varianza', isNaN(v) ? 'non esiste' : !isFinite(v) ? 'infinita' : fmt(v, 4), fmt(sd * sd, 4), b('exact')]),
        tr(['P(X ≤ mediana) = F(F⁻¹(½))' + (L.kind === 'discrete' ? ' ≥ ½' : ''), fmt(L.cdf(med, S.p), 4), S.k ? fmt(ub / S.k, 4) : '—', b('exact')]));
      kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.N), el('span', 'valori generati')),
        el('div.kpi', el('b', S.k ? fmt(S.u[S.k - 1], 4) : '—'), el('span', 'ultima u ~ U(0, 1)')),
        el('div.kpi', el('b', S.k ? fmt(S.x[S.k - 1], L.kind === 'discrete' ? 0 : 4) : '—'), el('span', 'ultima x = F⁻¹(u)')));
    } else {
      var F = fun(), n = S.k, mM = n ? S.sumF / n : NaN, mH = n ? S.hits / n : NaN;
      var vM = F.I2 - F.I * F.I, vH = F.I * (1 - F.I), sM = n > 1 ? Math.sqrt((S.sumF2 - n * mM * mM) / (n - 1) / n) : NaN, sH = n > 1 ? Math.sqrt(mH * (1 - mH) / n) : NaN;
      tblHead.innerHTML = '<tr><th>Stimatore</th><th>Stima</th><th>Errore standard stimato</th><th>Varianza teorica per coppia</th><th>Natura</th></tr>';
      tblBody.append(
        el('tr', el('td', el('span.est', SA.plot.legendSwatch(SA.theme().c1, null), 'Media di f(U)')), el('td', fmt(mM, 4)), el('td', fmt(sM, 4)), el('td', fmt(vM, 4) + ' = ∫f² − I²'), el('td', b('exact'))),
        el('tr', el('td', el('span.est', SA.plot.legendSwatch(SA.theme().c2, '7 4'), 'Hit-or-miss')), el('td', fmt(mH, 4)), el('td', fmt(sH, 4)), el('td', fmt(vH, 4) + ' = I(1 − I)'), el('td', b('exact'))));
      kpiBox.append(el('div.kpi', el('b', fmt(F.I, 4)), el('span', 'integrale esatto I = ' + F.Itxt)),
        el('div.kpi', el('b', fmt(vH / vM, 2)), el('span', 'rapporto delle varianze: coppie necessarie all’hit-or-miss per ogni coppia della media '), b('exact')),
        el('div.kpi', el('b', n ? fmt(Math.abs(mM - F.I), 4) + ' · ' + fmt(Math.abs(mH - F.I), 4) : '—'), el('span', 'errori attuali: media · hit-or-miss '), b('mc')));
    }
    updateFeedback();
  }

  /* ---------- previsione ---------- */
  var predBox;
  function opts() {
    return S.mode === 'inv'
      ? [['unif', 'Uniformi in (0, 1)'], ['law', 'Con la legge scelta, ' + law().label], ['norm', 'Approssimativamente normali']]
      : [['mean', 'La media di f(U)'], ['hm', 'L’hit-or-miss'], ['tie', 'Sono ugualmente precise']];
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p03-' + Date.now();
    predBox.append(el('p.prose', S.mode === 'inv'
      ? 'Generiamo u uniformi e calcoliamo x = F⁻¹(u), con F la ripartizione della ' + law().label + '. Come saranno distribuiti i valori x?'
      : 'Con le stesse coppie (u, v), quale stima di I = ∫₀¹ f(x) dx sarà più precisa?'),
      el('div.choices', { role: 'radiogroup', 'aria-label': 'Previsione' }, opts().map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    if (S.k < 200) { fbBox.textContent = 'Previsione registrata: il confronto compare dopo 200 estrazioni (ora ' + S.k + ').'; return; }
    var truth = S.mode === 'inv' ? 'law' : 'mean';
    fbBox.textContent = (S.pred === truth ? '✓ Corretto. ' : '✗ Non proprio. ') + (S.mode === 'inv'
      ? 'P(F⁻¹(U) ≤ x) = P(U ≤ F(x)) = F(x): l’inversione trasforma l’uniforme esattamente nella legge voluta. L’istogramma lo conferma.'
      : 'Per 0 ≤ f ≤ 1 vale Var f(U) ≤ I(1 − I): la media usa il valore di f, l’hit-or-miss solo un sì/no. Qui il rapporto è ' + SA.fmt(fun().I * (1 - fun().I) / (fun().I2 - fun().I * fun().I), 2) + '.');
  }

  function interpretation() {
    interpBox.innerHTML = S.mode === 'inv'
      ? '<p>L’inversione è il ponte tra il generatore di numeri casuali, che produce solo uniformi, e qualunque legge: basta conoscere F⁻¹. Per le leggi <strong>discrete</strong> F ha salti e l’inversa va presa in senso generalizzato, F⁻¹(u) = min{x : F(x) ≥ u}: un intero intervallo di u viene mandato nello stesso valore x, di lunghezza pari a P(X = x).</p><p>È il metodo usato da StatAtlas in tutti i laboratori, ed è il motivo per cui <code>' + law().rq + '(runif(n), …)</code> in R produce gli stessi numeri. Non è sempre il più veloce: per la Normale, ad esempio, F⁻¹ non ha forma chiusa e va calcolata numericamente.</p>'
      : '<p>Entrambi gli stimatori sono <strong>non distorti</strong> e convergono a I, ma con varianze diverse. Per 0 ≤ f ≤ 1 la media di f(U) non è mai peggiore: Var f(U) = ∫f² − I² ≤ ∫f − I² = I(1 − I). Questo non significa che in <em>ogni</em> simulazione la media sia più vicina a I: lo è in media quadratica.</p><p>L’errore Monte Carlo decresce come 1/√n: per dimezzarlo servono quattro volte più punti. Le bande tratteggiate nel grafico sono I ± 1,96 σ/√n per ciascun metodo.</p>';
  }

  function codeR() {
    var L = [], head = ['# ───────────────────────────────────────────────────────────────',
      '# StatAtlas · Lab 03 — ' + (S.mode === 'inv' ? 'Metodo di inversione' : 'Integrazione Monte Carlo'),
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi numeri di StatAtlas.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      'set.seed(' + S.seed + ')', 'N <- ' + S.N];
    L = L.concat(head);
    if (S.mode === 'inv') {
      var Lw = law(), args = Lw.rargs(S.p), d = 'd' + Lw.rq.slice(1), disc = Lw.kind === 'discrete';
      L.push('', '# 1. Uniformi, poi inversione della ripartizione', 'sim <- tibble(u = runif(N)) |>', '  mutate(x = ' + Lw.rq + '(u, ' + args + '))', '',
        '# 2. Controllo: momenti empirici e teorici', 'sim |> summarise(media = mean(x), varianza = var(x))', '');
      if (disc) L.push('# 3. Frequenze relative vs probabilità teoriche',
        'teoria <- tibble(x = ' + S.lo + ':' + S.hi + ', p = ' + d + '(x, ' + args + '))',
        'sim |> count(x) |> mutate(freq = n / N) |>', '  ggplot(aes(x, freq)) +', '  geom_col(fill = "#0072B2", alpha = 0.3, colour = "#0072B2", width = 0.6) +',
        '  geom_point(data = teoria, aes(x, p), size = 2) +');
      else L.push('# 3. Istogramma vs densità teorica', 'ggplot(sim, aes(x)) +',
        '  geom_histogram(aes(y = after_stat(density)), bins = ' + BINS + ', fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +',
        '  stat_function(fun = ' + d + ', args = list(' + args + '), linewidth = 1, n = 400) +',
        '  coord_cartesian(xlim = c(' + +S.lo.toPrecision(6) + ', ' + +S.hi.toPrecision(6) + ')) +');
      L.push('  labs(title = "Inversione: x = F^{-1}(u)", subtitle = "' + Lw.label + '(' + args + ')", x = "x", y = NULL) +', '  theme_statatlas()', '',
        '# 4. Il percorso dell’inversione per le prime 20 estrazioni',
        'ggplot(slice_head(sim, n = 20)) +', '  stat_function(fun = p' + Lw.rq.slice(1) + ', args = list(' + args + ')' + (disc ? ', geom = "step"' : '') + ', n = 400,',
        '                xlim = c(' + +S.lo.toPrecision(6) + ', ' + +S.hi.toPrecision(6) + ')) +',
        '  geom_segment(aes(x = ' + +S.lo.toPrecision(6) + ', xend = x, y = u, yend = u), colour = "#0072B2", alpha = 0.5) +',
        '  geom_segment(aes(x = x, xend = x, y = u, yend = 0), colour = "#0072B2", alpha = 0.5) +',
        '  labs(x = "x", y = "u = F(x)") +', '  theme_statatlas()', '');
    } else {
      var F = fun();
      L.push('f <- function(x) ' + F.r + '     # integranda su [0, 1]', 'I <- ' + F.Itxt.replace('π', 'pi') + '              # valore esatto', '',
        '# Coppie (u, v): matrice riempita per righe, nello stesso ordine di StatAtlas',
        'uv  <- matrix(runif(2 * N), ncol = 2, byrow = TRUE)',
        'sim <- tibble(n = seq_len(N), u = uv[, 1], v = uv[, 2]) |>',
        '  mutate(',
        '    media      = cummean(f(u)),          # stimatore della media',
        '    hit_or_miss = cummean(v <= f(u))      # proporzione di successi',
        '  )', '',
        '# Varianze teoriche per coppia: ∫f² − I² e I(1 − I)',
        'var_media <- integrate(\\(x) f(x)^2, 0, 1)$value - I^2',
        'var_hm    <- I * (1 - I)',
        'c(var_media = var_media, var_hm = var_hm, rapporto = var_hm / var_media)', '',
        'sim |> slice_tail(n = 1) |> select(media, hit_or_miss)', '',
        'sim |>', '  pivot_longer(c(media, hit_or_miss), names_to = "metodo", values_to = "stima") |>',
        '  ggplot(aes(n, stima, colour = metodo, linetype = metodo)) +',
        '  geom_hline(yintercept = I, linetype = "dashed") +',
        '  geom_line() +',
        '  scale_colour_manual(values = c(media = "#0072B2", hit_or_miss = "#D55E00")) +',
        '  coord_cartesian(ylim = I + c(-0.35, 0.35)) +',
        '  labs(title = "Integrazione Monte Carlo di ' + F.label.replace('f(x) = ', '') + '", x = "n", y = "stima di I") +',
        '  theme_statatlas()', '');
    }
    return L.join('\n');
  }

  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Tutto parte dall’uniforme</h3><p>Un computer genera numeri pseudocasuali che imitano U(0, 1). Ogni altra legge si ottiene trasformandoli. Il metodo più generale è l’<strong>inversione</strong>: X = F⁻¹(U).</p>' +
        '<div class="eq">P(F⁻¹(U) ≤ x) = P(U ≤ F(x)) = F(x)</div>' +
        '<p>Esempio: per l’Esponenziale F(x) = 1 − e<sup>−λx</sup>, quindi F⁻¹(u) = −log(1 − u)/λ.</p>' +
        '<h3>Integrare con il caso</h3><p>Se U ~ U(0, 1), allora E[f(U)] = ∫₀¹ f(x) dx = I. La media di f(Uᵢ) stima quindi I, e per la legge dei grandi numeri converge. L’<strong>hit-or-miss</strong> invece lancia punti (U, V) nel quadrato e conta quanti cadono sotto la curva: la proporzione stima l’area I.</p>' +
        '<div class="callout">Entrambi i metodi hanno errore dell’ordine di 1/√n, indipendentemente dalla dimensione del problema: per questo il Monte Carlo è prezioso negli integrali in molte variabili.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Inversa generalizzata</h3><p>F⁻¹(u) = inf{x : F(x) ≥ u}. Per la continuità a destra di F vale F⁻¹(u) ≤ x ⟺ u ≤ F(x), da cui la tesi anche con salti e tratti piatti. Viceversa, se F è continua, F(X) ~ U(0, 1) (trasformazione integrale di probabilità).</p>' +
        '<h3>Confronto delle varianze</h3><p>Per la media: Var f(U) = ∫f² − I². Per l’hit-or-miss l’indicatore 1{V ≤ f(U)} è Bernoulli(I), con varianza I(1 − I). Se 0 ≤ f ≤ 1, allora f² ≤ f e</p>' +
        '<div class="eq">Var f(U) = ∫f² − I² ≤ ∫f − I² = I(1 − I)</div><p>con uguaglianza solo se f assume i soli valori 0 e 1. Il rapporto delle varianze dice quante coppie in più servono all’hit-or-miss per la stessa precisione. È il primo esempio di <em>riduzione della varianza</em> per condizionamento: E[1{V ≤ f(U)} | U] = f(U), e condizionare non aumenta mai la varianza (Rao–Blackwell).</p>' +
        '<h3>Errore Monte Carlo</h3><p>Per il teorema centrale, Î<sub>n</sub> ≈ N(I, σ²/n): l’intervallo Î ± 1,96 σ̂/√n ha copertura approssimativa 95%. Le bande del grafico usano la σ teorica.</p>' });
    }
  };

  var run, ctrl, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (S.mode === 'inv') { drawInvCdf(); drawInvHist(); } else { drawMcSquare(); drawMcTrace(); }
    if (full || run.frame % 6 === 0 || !run.running) updateTable();
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var seg = el('div.seg', { role: 'group', 'aria-label': 'Metodo' });
    [['inv', 'Inversione'], ['mc', 'Monte Carlo']].forEach(function (m) {
      seg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.mode === m[0]), onclick: function () { if (S.mode === m[0]) return; S.mode = m[0]; S.pred = null; buildControls(); buildPrediction(); restart(); } }, m[1]));
    });
    var pick = S.mode === 'inv'
      ? el('label.field', el('span', 'Legge da generare'), el('select', { onchange: function () { S.law = this.value; S.pred = null; buildPrediction(); restart(); } },
          INV_LAWS.map(function (id) { return el('option', { value: id, selected: id === S.law }, LAWS.get(id).label); })))
      : el('label.field', el('span', 'Funzione da integrare su [0, 1]'), el('select', { onchange: function () { S.fun = this.value; restart(); } },
          Object.keys(FUNS).map(function (k) { return el('option', { value: k, selected: k === S.fun }, FUNS[k].label); })));
    ctrlBox.append(el('div.field', el('span', 'Metodo'), seg), pick,
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Estrazioni N'), el('select', { onchange: function () { S.N = +this.value; restart(); } }, [200, 1000, 5000, 20000].map(function (v) { return el('option', { value: v, selected: v === S.N }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls(S.mode === 'inv' ? 'Una estrazione' : 'Una coppia (u, v)').forEach(function (n) { ctrlBox.appendChild(n); });
  }
  function exportCSV() {
    var rows = S.mode === 'inv' ? [['i', 'u', 'x']] : [['i', 'u', 'v', 'f_u', 'successo']];
    for (var i = 0; i < S.k; i++) rows.push(S.mode === 'inv' ? [i + 1, S.u[i], S.x[i]] : [i + 1, S.u[i], S.v[i], fun().f(S.u[i]), S.v[i] <= fun().f(S.u[i]) ? 1 : 0]);
    SA.ui.download('statatlas_lab03_' + S.mode + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv');
  }

  SA.registerLab('simulazione', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.N; }, progress: function () { return S.k / S.N; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Metodi di simulazione', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Come un generatore di numeri uniformi diventa qualunque legge, e come il caso calcola un integrale.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Se un computer sa produrre solo numeri uniformi, come ottiene tutto il resto?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Una estrazione alla volta');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend'); titA = el('h3'); titB = el('h3');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure', el('div.fig', el('div.fig-title', titA, legA), figA), el('div.fig', el('div.fig-title', titB, legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: exportCSV }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab03_' + S.mode + '.png', [info.lab.title, S.k + ' estrazioni · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblHead = el('thead'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', tblHead, tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Inversa generalizzata e riduzione della varianza (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stesse uniformi, stessi risultati'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab03_simulazione.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
