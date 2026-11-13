/* StatAtlas · Lab 04 — Legge dei grandi numeri e teorema centrale del limite */
(function () {
  var el, S, K = 4, ZLIM = 4, BINS = 40, BE_C = 0.4748; // costante di Berry–Esseen (Shevtsova, 2011)
  var BERN = SA.laws.get('bern');
  var POPS = {
    norm:   { label: 'Normale N(0, 1)', mu: 0, v: 1, skew: 0, rho: 2 * Math.sqrt(2 / Math.PI),
      gen: function (g) { return g.norm(); }, r: 'rnorm(%n)', dens: function (x) { return SA.dens.norm(x, 0, 1); }, range: [-3.5, 3.5] },
    unif:   { label: 'Uniforme U(0, 1)', mu: 0.5, v: 1 / 12, skew: 0, rho: 1.2990381,
      gen: function (g) { return g.unif(); }, r: 'runif(%n)', dens: function (x) { return x >= 0 && x <= 1 ? 1 : 0; }, range: [-0.2, 1.2] },
    bern:   { label: 'Bernoulli(0,35)', mu: 0.35, v: 0.35 * 0.65, skew: (1 - 0.7) / Math.sqrt(0.35 * 0.65), rho: 1.1427, discrete: true,
      gen: function (g) { return BERN.q(g.unif(), { prob: 0.35 }); }, r: 'qbinom(runif(%n), size = 1, prob = 0.35)', range: [-0.5, 1.5] },
    exp:    { label: 'Esponenziale(1)', mu: 1, v: 1, skew: 2, rho: 2.4145533,
      gen: function (g) { return -Math.log1p(-g.unif()); }, r: 'qexp(runif(%n), rate = 1)', dens: function (x) { return x < 0 ? 0 : Math.exp(-x); }, range: [0, 6] },
    lnorm:  { label: 'Lognormale(0, 1)', mu: Math.exp(0.5), v: (Math.E - 1) * Math.E, skew: (Math.E + 2) * Math.sqrt(Math.E - 1), rho: 6.3499717,
      gen: function (g) { return Math.exp(g.norm()); }, r: 'rlnorm(%n)', dens: function (x) { return x <= 0 ? 0 : SA.dens.norm(Math.log(x), 0, 1) / x; }, range: [0, 8] },
    cauchy: { label: 'Cauchy(0, 1)', mu: NaN, v: NaN, cauchy: true,
      gen: function (g) { return Math.tan(Math.PI * g.unif()); }, r: 'rcauchy(%n)', dens: function (x) { return SA.dens.cauchy(x, 0, 1); }, range: [-8, 8] }
  };
  var COLORS = ['c1', 'c2', 'c3', 'c4'], DASH = [null, '7 4', '2 3', '10 3 2 3'];

  function newState(prev) {
    var s = { mode: 'lln', pop: 'norm', N: 1000, n: 10, B: 1000, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] != null) s[k] = prev[k];
    if (prev && prev.pred === null) s.pred = null;
    s.rng = new SA.RRNG(s.seed); s.k = 0;
    if (s.mode === 'lln') { s.sum = new Float64Array(K); s.path = []; for (var i = 0; i < K; i++) s.path.push(new Float64Array(s.N)); }
    else { s.vals = new Float64Array(s.B); s.bins = new Uint32Array(BINS); s.out = 0; s.sample = null; }
    return s;
  }
  function pop() { return POPS[S.pop]; }
  function total() { return S.mode === 'lln' ? S.N : S.B; }

  function step() {
    var P = pop(), i;
    if (S.k >= total()) return false;
    if (S.mode === 'lln') {
      for (i = 0; i < K; i++) { S.sum[i] += P.gen(S.rng); S.path[i][S.k] = S.sum[i] / (S.k + 1); }
    } else {
      var x = new Float64Array(S.n), s = 0;
      for (i = 0; i < S.n; i++) { x[i] = P.gen(S.rng); s += x[i]; }
      var m = s / S.n, z = P.cauchy ? m : Math.sqrt(S.n) * (m - P.mu) / Math.sqrt(P.v);
      S.vals[S.k] = z; S.sample = { x: x, m: m };
      var lim = P.cauchy ? 8 : ZLIM, b = Math.floor((z + lim) / (2 * lim / BINS));
      if (b >= 0 && b < BINS) S.bins[b]++; else S.out++;
    }
    S.k++;
    return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB, titleA, titleB;
  function drawLLN() {
    var P = pop(), t, Pl = SA.plot, N = S.N;
    var sd = Math.sqrt(P.v), y0 = P.cauchy ? -5 : P.mu - 2.2 * sd, y1 = P.cauchy ? 5 : P.mu + 2.2 * sd;
    var f = Pl.frame(figA, { W: 720, H: 300, x: [0, N], y: [+y0.toPrecision(3), +y1.toPrecision(3)], xlabel: 'n (osservazioni)', ylabel: 'media x̄ₙ', label: 'Traiettorie della media campionaria' });
    t = f.t; var g = f.g, i, j, clipY = function (v) { return Math.min(f.y(f.y.domain[0]), Math.max(f.m.t, f.y(v))); };
    if (!P.cauchy) {
      var up = [], dn = [];
      for (i = 1; i <= 300; i++) { var k = Math.max(1, Math.round(N * i / 300)), h = 1.96 * sd / Math.sqrt(k); up.push([f.x(k), clipY(P.mu + h)]); dn.push([f.x(k), clipY(P.mu - h)]); }
      Pl.svg('path', { d: Pl.path(up.concat(dn.reverse())) + 'Z', fill: t.ink, 'fill-opacity': 0.06, stroke: t.rule_2, 'stroke-dasharray': '3 3' }, g);
      Pl.svg('line', { x1: f.x(0), x2: f.x(N), y1: f.y(P.mu), y2: f.y(P.mu), stroke: t.ink, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g);
      var lb = Pl.svg('text', { x: f.x(N) - 4, y: f.y(P.mu) - 6, 'text-anchor': 'end', fill: t.ink_2, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 }, g);
      lb.textContent = 'μ = ' + SA.fmt(P.mu, 3);
    }
    var stride = Math.max(1, Math.floor(S.k / 600));
    for (j = 0; j < K; j++) {
      if (!S.k) break;
      var pts = [];
      for (i = 0; i < S.k; i += stride) pts.push([f.x(i + 1), clipY(S.path[j][i])]);
      pts.push([f.x(S.k), clipY(S.path[j][S.k - 1])]);
      Pl.svg('path', { d: Pl.path(pts), fill: 'none', stroke: t[COLORS[j]], 'stroke-width': 1.8, 'stroke-dasharray': DASH[j], 'stroke-linejoin': 'round' }, g);
    }
    if (!S.k) { var m = Pl.svg('text', { x: 360, y: 140, 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }, g); m.textContent = 'Premi ▶: a ogni passo ogni traiettoria riceve una nuova osservazione'; }
  }
  function drawSample() {
    var P = pop(), Pl = SA.plot, r = P.range;
    var f = Pl.frame(figA, { W: 720, H: 170, x: r, m: { t: 12, r: 18, b: 40, l: 18 }, xlabel: 'x', label: 'Campione corrente' });
    var t = f.t, g = f.g, top = 16, bot = 104, i;
    if (P.dens) {
      var pts = [], pk = 0, xs = [];
      for (i = 0; i <= 200; i++) { var xx = r[0] + (r[1] - r[0]) * i / 200, d = P.dens(xx); xs.push([xx, d]); pk = Math.max(pk, d); }
      xs.forEach(function (q) { pts.push([f.x(q[0]), bot - (bot - top) * q[1] / pk]); });
      Pl.svg('path', { d: Pl.path(pts) + 'L' + f.x(r[1]) + ',' + bot + 'L' + f.x(r[0]) + ',' + bot + 'Z', fill: t.paper_2, stroke: t.rule_2 }, g);
    } else {
      [[0, 0.65], [1, 0.35]].forEach(function (q) { Pl.svg('rect', { x: f.x(q[0]) - 30, width: 60, y: bot - (bot - top) * q[1] / 0.65, height: (bot - top) * q[1] / 0.65, fill: t.paper_2, stroke: t.rule_2 }, g); });
    }
    if (!P.cauchy) Pl.svg('line', { x1: f.x(P.mu), x2: f.x(P.mu), y1: top - 4, y2: bot + 18, stroke: t.ink, 'stroke-dasharray': '3 3' }, g);
    if (!S.sample) { var m = Pl.svg('text', { x: 360, y: 64, 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }, g); m.textContent = 'Ogni passo genera un intero campione di n osservazioni'; return; }
    var x = S.sample.x, out = 0, show = Math.min(x.length, 400);
    for (i = 0; i < show; i++) {
      if (x[i] < r[0] || x[i] > r[1]) { out++; continue; }
      var jit = (i * 0.6180339887) % 1, cx = f.x(x[i]) + (P.discrete ? (jit - 0.5) * 50 : 0);
      Pl.svg('circle', { cx: cx, cy: top + 10 + jit * (bot - top - 18), r: x.length > 100 ? 2.4 : 3.6, fill: t.ink, 'fill-opacity': 0.5 }, g);
    }
    var mx = Math.max(r[0], Math.min(r[1], S.sample.m));
    Pl.svg('line', { x1: f.x(mx), x2: f.x(mx), y1: top, y2: bot + 18, stroke: t.c1, 'stroke-width': 2 }, g);
    Pl.marker(g, 'tri', f.x(mx), bot + 18, 13, t.c1, t.card);
    var lb = Pl.svg('text', { x: f.x(mx) + 9, y: bot + 14, fill: t.c1, 'font-size': 12, 'font-weight': 600 }, g);
    lb.textContent = 'x̄ = ' + SA.fmt(S.sample.m, 3) + (out ? '   (' + out + ' oss. fuori scala)' : '');
  }
  function drawZ() {
    var P = pop(), Pl = SA.plot, lim = P.cauchy ? 8 : ZLIM, bw = 2 * lim / BINS;
    var peak = P.cauchy ? 1 / Math.PI : 0.3989, ymax = +(peak * 1.45).toPrecision(2);
    var f = Pl.frame(figB, { W: 720, H: 280, x: [-lim, lim], y: [0, ymax], xlabel: P.cauchy ? 'x̄ₙ' : 'zₙ = √n (x̄ₙ − μ) / σ', ylabel: 'densità', label: 'Distribuzione delle medie' });
    var t = f.t, g = f.g, yb = f.y(0), i;
    if (S.k) {
      var d = 'M' + f.x(-lim) + ',' + yb;
      for (i = 0; i < BINS; i++) { var h = Math.max(f.m.t, f.y(S.bins[i] / (S.k * bw))); d += 'L' + f.x(-lim + i * bw).toFixed(1) + ',' + h.toFixed(1) + 'L' + f.x(-lim + (i + 1) * bw).toFixed(1) + ',' + h.toFixed(1); }
      Pl.svg('path', { d: d + 'L' + f.x(lim) + ',' + yb + 'Z', fill: t.c1, 'fill-opacity': 0.16, stroke: t.c1, 'stroke-width': 1 }, g);
    }
    var pts = [];
    for (i = 0; i <= 240; i++) { var x = -lim + 2 * lim * i / 240; pts.push([f.x(x), Math.max(f.m.t, f.y(P.cauchy ? SA.dens.cauchy(x, 0, 1) : SA.dens.norm(x, 0, 1)))]); }
    Pl.svg('path', { d: Pl.path(pts), fill: 'none', stroke: t.c_theory, 'stroke-width': 2.2 }, g);
    var tx = Pl.svg('text', { x: f.m.l + 8, y: f.m.t + 12, fill: t.ink_3, 'font-size': 11.5 }, g);
    tx.textContent = S.k + ' medie su ' + S.B + (S.out ? ' · fuori scala ' + S.out : '');
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch, P = pop();
    legA.innerHTML = ''; legB.innerHTML = '';
    if (S.mode === 'lln') {
      titleA.textContent = 'Quattro traiettorie della media campionaria';
      for (var j = 0; j < K; j++) legA.appendChild(el('span', sw(t[COLORS[j]], DASH[j]), 'traiettoria ' + (j + 1)));
      if (!P.cauchy) legA.appendChild(el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.ink + ';opacity:.12;border-radius:2px' }), 'μ ± 1,96 σ/√n'));
    } else {
      titleA.textContent = 'Il campione corrente e la sua media';
      legA.appendChild(el('span', sw(t.c1, null, 'tri'), 'media x̄ del campione'));
      titleB.textContent = P.cauchy ? 'Distribuzione delle medie x̄ₙ' : 'Distribuzione delle medie standardizzate';
      legB.append(el('span', sw(t.c1, null), 'istogramma delle medie'), el('span', sw(t.c_theory, null), P.cauchy ? 'Cauchy(0, 1): esatta per ogni n' : 'N(0, 1): limite del TCL'));
    }
  }

  /* ---------- statistiche ---------- */
  var tblHead, tblBody, kpiBox, fbBox, interpBox;
  function zStats() {
    if (S.k < 3) return null;
    var v = S.vals.subarray(0, S.k), m = SA.stat.mean(v), sd = SA.stat.sd(v), m3 = 0, tail = 0, srt = SA.stat.sorted(v), D = 0, i, P = pop();
    for (i = 0; i < v.length; i++) { m3 += Math.pow(v[i] - m, 3); if (Math.abs(v[i]) > 1.96) tail++; }
    for (i = 0; i < srt.length; i++) {
      var F = P.cauchy ? 0.5 + Math.atan(srt[i]) / Math.PI : SA.sf.pnorm(srt[i]);
      D = Math.max(D, (i + 1) / srt.length - F, F - i / srt.length);
    }
    return { mean: m, var: sd * sd, skew: m3 / v.length / Math.pow(sd, 3), tail: tail / v.length, D: D,
      median: SA.stat.quantile(srt, 0.5, true), iqr: SA.stat.quantile(srt, 0.75, true) - SA.stat.quantile(srt, 0.25, true) };
  }
  function row(name, th, sim, st, dag) {
    return el('tr', el('td', name), el('td', th), el('td', sim, dag ? el('sup', { title: 'Non converge: il momento teorico non esiste' }, '†') : null), el('td', SA.ui.badge(st)));
  }
  function updateTable() {
    var P = pop(), fmt = SA.fmt, b = SA.ui.badge;
    tblBody.innerHTML = ''; kpiBox.innerHTML = '';
    if (S.mode === 'lln') {
      tblHead.innerHTML = '<tr><th>Traiettoria</th><th>x̄ₙ attuale</th><th>Scarto da μ</th><th>Entro μ ± 1,96σ/√n</th></tr>';
      for (var j = 0; j < K; j++) {
        var cur = S.k ? S.path[j][S.k - 1] : NaN, dev = cur - P.mu, inside = !P.cauchy && S.k && Math.abs(dev) <= 1.96 * Math.sqrt(P.v / S.k);
        tblBody.appendChild(el('tr', el('td', el('span.est', SA.plot.legendSwatch(SA.theme()[COLORS[j]], DASH[j]), String(j + 1))),
          el('td', fmt(cur, 4)), el('td', P.cauchy ? '— (μ non esiste)' : fmt(dev, 4)), el('td', P.cauchy || !S.k ? '—' : inside ? 'sì' : 'no')));
      }
      kpiBox.append(
        el('div.kpi', el('b', String(S.k)), el('span', 'osservazioni per traiettoria')),
        el('div.kpi', el('b', P.cauchy ? 'non esiste' : fmt(Math.sqrt(P.v / Math.max(1, S.k)), 4)), el('span', 'deviazione standard di x̄ₙ: σ/√n '), b('exact')),
        el('div.kpi', el('b', P.cauchy ? 'non esiste' : fmt(P.v / (Math.max(1, S.k) * 0.01), 3)), el('span', 'Chebyshev: P(|x̄ₙ − μ| ≥ 0,1) ≤ σ²/(0,01 n) '), b('exact')));
    } else {
      var z = zStats(), ns = S.n;
      tblHead.innerHTML = '<tr><th>Quantità</th><th>Teoria</th><th>Simulazione</th><th>Natura della teoria</th></tr>';
      if (P.cauchy) {
        var tailC = 1 - 2 * Math.atan(1.96) / Math.PI;
        tblBody.append(row('Mediana di x̄ₙ', '0', z ? fmt(z.median, 4) : '—', 'exact'),
          row('Scarto interquartile di x̄ₙ', '2', z ? fmt(z.iqr, 4) : '—', 'exact'),
          row('P(|x̄ₙ| > 1,96)', fmt(tailC, 4), z ? fmt(z.tail, 4) : '—', 'exact'),
          row('Varianza di x̄ₙ', 'non esiste', z ? fmt(z.var, 3) : '—', 'exact', true));
      } else {
        tblBody.append(row('Media di zₙ', '0', z ? fmt(z.mean, 4) : '—', 'exact'),
          row('Varianza di zₙ', '1', z ? fmt(z.var, 4) : '—', 'exact'),
          row('Asimmetria di zₙ', fmt(P.skew / Math.sqrt(ns), 4) + ' = γ/√n', z ? fmt(z.skew, 4) : '—', 'exact'),
          row('P(|zₙ| > 1,96)', '0,05', z ? fmt(z.tail, 4) : '—', 'asym'));
      }
      var be = P.cauchy ? NaN : Math.min(1, BE_C * P.rho / Math.sqrt(ns));
      kpiBox.append(
        el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'campioni di n = ' + ns)),
        el('div.kpi', el('b', z ? fmt(z.D, 4) : '—'), el('span', 'distanza sup|F̂ − ' + (P.cauchy ? 'F_Cauchy' : 'Φ') + '| osservata (include l’errore Monte Carlo ≈ 1/√B) '), b('mc')),
        el('div.kpi', el('b', P.cauchy ? 'non si applica' : fmt(be, 4)), el('span', 'limite di Berry–Esseen 0,4748·ρ/(σ³√n) '), b('exact')));
    }
    updateFeedback();
  }

  /* ---------- previsione ---------- */
  var predBox;
  function predOptions() {
    return S.mode === 'lln'
      ? [['conv', 'Si avvicina a μ e ci resta vicina'], ['no', 'Continua a oscillare senza stabilizzarsi']]
      : [['ok', 'Sì, quasi indistinguibile dalla N(0, 1)'], ['mid', 'Le somiglia, ma resta visibilmente asimmetrica o irregolare'], ['far', 'No, è ancora lontana']];
  }
  function buildPrediction() {
    predBox.innerHTML = '';
    var P = pop(), name = 'p04-' + Date.now();
    predBox.appendChild(el('p.prose', S.mode === 'lln'
      ? 'Con dati da ' + P.label + ', che cosa farà la media campionaria x̄ₙ quando n cresce fino a ' + S.N + '?'
      : 'Con dati da ' + P.label + ' e campioni di n = ' + S.n + ' osservazioni, ' + (P.cauchy ? 'le medie x̄ₙ' : 'le medie standardizzate') + ' avranno una distribuzione vicina alla normale standard?'));
    predBox.appendChild(el('div.choices', { role: 'radiogroup', 'aria-label': 'Previsione' }, predOptions().map(function (o, i) {
      return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }),
        el('label', { for: name + i }, o[1]));
    })));
    fbBox = el('div.feedback', { role: 'status', hidden: true });
    predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false; var P = pop();
    var need = S.mode === 'lln' ? Math.min(S.N, 200) : 300;
    if (S.k < need) { fbBox.textContent = 'Previsione registrata: il confronto compare dopo ' + need + (S.mode === 'lln' ? ' passi' : ' campioni') + ' (ora ' + S.k + ').'; return; }
    var truth, why;
    if (S.mode === 'lln') {
      truth = P.cauchy ? 'no' : 'conv';
      why = P.cauchy ? 'Per la Cauchy E|X| = ∞: la legge dei grandi numeri non si applica e la media di n osservazioni ha la stessa legge di una sola.'
        : 'E|X| è finito, quindi x̄ₙ → μ (legge forte dei grandi numeri). Le oscillazioni si riducono come σ/√n, ma non in modo monotono.';
    } else {
      var z = zStats();
      truth = P.cauchy ? 'far' : z.D < 0.04 ? 'ok' : z.D < 0.12 ? 'mid' : 'far';
      why = P.cauchy ? 'Le medie di Cauchy restano Cauchy(0, 1) per ogni n: niente teorema centrale, perché la varianza non esiste.'
        : 'Distanza osservata sup|F̂ − Φ| = ' + SA.fmt(z.D, 3) + ', asimmetria teorica γ/√n = ' + SA.fmt(P.skew / Math.sqrt(S.n), 3) + '. ' +
          (P.discrete ? 'Con dati discreti zₙ assume pochi valori: la distribuzione resta a gradini anche quando la forma è giusta.' : '');
    }
    fbBox.textContent = (S.pred === truth ? '✓ La simulazione conferma la tua previsione. ' : '✗ La simulazione suggerisce altro. ') + why;
  }

  /* ---------- interpretazione ---------- */
  function interpretation() {
    var P = pop(), html;
    if (S.mode === 'lln') html = P.cauchy
      ? '<p>Le traiettorie non si stabilizzano: ogni tanto un’osservazione enorme le sposta bruscamente, anche dopo migliaia di passi. Non è un difetto della simulazione: per la Cauchy E|X| = ∞, e la media di n osservazioni ha esattamente la legge Cauchy(0, 1) di una sola.</p>'
      : '<p>Ogni traiettoria è una realizzazione di x̄ₙ al crescere di n. La <strong>legge dei grandi numeri</strong> garantisce che ciascuna converga a μ = ' + SA.fmt(P.mu, 3) + '; la banda μ ± 1,96σ/√n mostra quanto in fretta, ed è un’approssimazione basata sul TCL valida per ogni n fissato in senso asintotico.</p><p>Attenzione a due errori comuni: la convergenza non è monotona (una traiettoria può allontanarsi per un po’), e non c’è “compensazione” degli scarti passati: le nuove osservazioni li diluiscono, non li correggono.</p>';
    else html = P.cauchy
      ? '<p>L’istogramma delle medie coincide con la Cauchy(0, 1) per ogni n: aumentare n non cambia nulla. Il teorema centrale richiede varianza finita, e qui neppure il valore atteso esiste.</p>'
      : '<p>Ogni passo genera un <em>nuovo</em> campione di n osservazioni e ne standardizza la media. Il <strong>teorema centrale</strong> dice che, per n → ∞, zₙ tende alla N(0, 1) qualunque sia la legge dei dati, purché abbia varianza finita.</p><p>Media 0 e varianza 1 sono esatte per ogni n; la forma normale no. L’asimmetria di zₙ vale esattamente γ/√n (γ = ' + SA.fmt(P.skew, 3) + ' per questa popolazione): con dati asimmetrici servono n grandi. Il limite di Berry–Esseen dà una garanzia esplicita sulla distanza da Φ.</p><p class="muted">Non confondere n e B: n cambia la legge di zₙ; il numero di campioni B (= ' + S.B + ') cambia solo quanto fedelmente l’istogramma la ricostruisce.</p>';
    interpBox.innerHTML = html;
  }

  /* ---------- codice R ---------- */
  function codeR() {
    var P = pop(), g = function (n) { return P.r.replace('%n', n); }, L = [];
    L.push('# ───────────────────────────────────────────────────────────────',
      '# StatAtlas · Lab 04 — ' + (S.mode === 'lln' ? 'Legge dei grandi numeri' : 'Teorema centrale del limite'),
      '# Popolazione: ' + P.label + ' · seed = ' + S.seed,
      '# Stesso generatore e stesso ordine di estrazione di StatAtlas:',
      '# con R ≥ 4.1 si ottengono gli stessi numeri.',
      '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '',
      'theme_statatlas <- function(base_size = 12) {',
      '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",',
      '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))',
      '}', '',
      'set.seed(' + S.seed + ')');
    if (!P.cauchy) L.push('mu    <- ' + +P.mu.toPrecision(8) + '   # valore atteso della popolazione', 'sigma <- sqrt(' + +P.v.toPrecision(8) + ')');
    else L.push('# Cauchy: valore atteso e varianza non esistono');
    if (S.mode === 'lln') {
      L.push('K <- ' + K + '      # traiettorie', 'N <- ' + S.N + '   # osservazioni per traiettoria', '',
        '# Matrice K × N riempita per colonne: al passo k ogni traiettoria riceve',
        '# una nuova osservazione, nello stesso ordine usato da StatAtlas.',
        'x <- matrix(' + g('K * N') + ', nrow = K)', '',
        'traiettorie <- tibble(',
        '  traiettoria = factor(rep(seq_len(K), times = N)),',
        '  n           = rep(seq_len(N), each = K),',
        '  x           = as.vector(x)',
        ') |>',
        '  group_by(traiettoria) |>',
        '  mutate(media = cummean(x)) |>',
        '  ungroup()', '',
        '# Valore finale di ciascuna traiettoria',
        'traiettorie |> filter(n == N) |> dplyr::select(traiettoria, media)', '');
      if (!P.cauchy) L.push('banda <- tibble(n = seq_len(N), basso = mu - 1.96 * sigma / sqrt(n), alto = mu + 1.96 * sigma / sqrt(n))', '',
        'ggplot(traiettorie, aes(n, media, colour = traiettoria)) +',
        '  geom_ribbon(data = banda, aes(n, ymin = basso, ymax = alto), inherit.aes = FALSE, fill = "grey60", alpha = 0.15) +',
        '  geom_hline(yintercept = mu, linetype = "dashed") +',
        '  geom_line(linewidth = 0.6) +',
        '  coord_cartesian(ylim = mu + c(-2.2, 2.2) * sigma) +');
      else L.push('ggplot(traiettorie, aes(n, media, colour = traiettoria)) +',
        '  geom_line(linewidth = 0.6) +',
        '  coord_cartesian(ylim = c(-5, 5)) +');
      L.push('  scale_colour_manual(values = c("#0072B2", "#D55E00", "#009E73", "#CC79A7")) +',
        '  labs(title = "Legge dei grandi numeri: ' + P.label + '",',
        '       x = "n", y = expression(bar(x)[n]), colour = "traiettoria") +',
        '  theme_statatlas()', '');
    } else {
      L.push('n <- ' + S.n + '      # osservazioni per campione', 'B <- ' + S.B + '   # numero di campioni', '',
        'medie <- tibble(campione = seq_len(B)) |>',
        '  mutate(media = map_dbl(campione, \\(b) mean(' + g('n') + ')))' + (P.cauchy ? '' : ' |>\n  mutate(z = sqrt(n) * (media - mu) / sigma)'), '');
      if (P.cauchy) L.push('# Le medie di Cauchy sono ancora Cauchy(0, 1)',
        'medie |> summarise(mediana = median(media), iqr = IQR(media), coda = mean(abs(media) > 1.96))',
        '1 - 2 * atan(1.96) / pi   # P(|X| > 1.96) teorica', '',
        'ggplot(filter(medie, abs(media) <= 8), aes(media)) +',
        '  geom_histogram(aes(y = after_stat(count) / (B * 0.4)), binwidth = 0.4, boundary = -8,',
        '                 fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +',
        '  stat_function(fun = dcauchy, linewidth = 1, n = 400) +',
        '  labs(title = "Le medie di Cauchy non diventano normali", subtitle = sprintf("n = %d, B = %d", n, B),',
        '       x = expression(bar(x)[n]), y = "densità") +',
        '  theme_statatlas()', '');
      else L.push('medie |>',
        '  summarise(',
        '    media_z    = mean(z),                        # teoria: 0 (esatto)',
        '    var_z      = var(z),                         # teoria: 1 (esatto)',
        '    asimmetria = mean((z - mean(z))^3) / sd(z)^3, # teoria: ' + +(P.skew / Math.sqrt(S.n)).toFixed(4) + ' (esatto)',
        '    coda       = mean(abs(z) > 1.96)             # teoria: 0.05 (asintotico)',
        '  )', '',
        '# Distanza massima dalla N(0, 1) e limite di Berry–Esseen',
        'D <- suppressWarnings(ks.test(medie$z, "pnorm")$statistic)',
        'c(D = unname(D), berry_esseen = min(1, 0.4748 * ' + +P.rho.toFixed(6) + ' / sqrt(n)))', '',
        'ggplot(medie, aes(z)) +',
        '  geom_histogram(aes(y = after_stat(count) / (B * 0.2)), binwidth = 0.2, boundary = -4,',
        '                 fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +',
        '  stat_function(fun = dnorm, linewidth = 1, n = 400) +',
        '  coord_cartesian(xlim = c(-4, 4)) +',
        '  labs(title = "Teorema centrale del limite: ' + P.label + '",',
        '       subtitle = sprintf("n = %d, B = %d · istogramma: medie standardizzate · curva: N(0, 1)", n, B),',
        '       x = expression(z[n]), y = "densità") +',
        '  theme_statatlas()', '');
    }
    return L.join('\n');
  }

  /* ---------- teoria ---------- */
  var THEORY = {
    base: function () {
      return el('div.prose', { html:
        '<h3>Due teoremi, due oggetti diversi</h3>' +
        '<p>La <strong>legge dei grandi numeri</strong> parla di <em>una</em> media che cresce con n: x̄ₙ si avvicina a μ. Il <strong>teorema centrale</strong> parla della <em>distribuzione</em> di x̄ₙ attraverso tanti campioni: centrata e riscalata, diventa normale.</p>' +
        '<div class="eq" data-tex="\\bar{x}_n \\to \\mu \\qquad \\frac{\\sqrt{n}\\,(\\bar{x}_n - \\mu)}{\\sigma} \\Rightarrow N(0, 1)"></div>' +
        '<h3>Che cosa è esatto e che cosa no</h3><ul>' +
        '<li>E(x̄ₙ) = μ e Var(x̄ₙ) = σ²/n valgono <strong>per ogni n</strong>.</li>' +
        '<li>La forma normale vale solo <strong>al limite</strong>: per n finito è un’approssimazione, buona o cattiva secondo l’asimmetria dei dati.</li>' +
        '<li>Se i dati sono normali, x̄ₙ è normale <strong>esattamente</strong> per ogni n.</li></ul>' +
        '<h3>Quando falliscono</h3>' +
        '<p>Entrambi richiedono ipotesi: la legge dei grandi numeri un valore atteso finito, il teorema centrale una varianza finita. La Cauchy non soddisfa nessuna delle due: la sua media campionaria ha la stessa legge di una singola osservazione.</p>' +
        '<div class="callout warn"><strong>n non è B.</strong> n è la numerosità di ciascun campione e determina la legge di x̄ₙ. B è il numero di campioni simulati: aumentarlo rende l’istogramma più fedele, non più normale.</div>' });
    },
    adv: function () {
      return el('div.prose', { html:
        '<h3>Legge debole: una dimostrazione in una riga</h3>' +
        '<p>Se Var(X) = σ² &lt; ∞, per la disuguaglianza di Chebyshev</p>' +
        '<div class="eq" data-tex="P(|\\bar{x}_n - \\mu| \\ge \\varepsilon) \\le \\frac{\\sigma^2}{n\\varepsilon^2} \\to 0"></div>' +
        '<p>La versione di Khinchin richiede solo E|X| &lt; ∞; la legge forte (Kolmogorov) afferma la convergenza quasi certa sotto la stessa ipotesi, ed è questa che descrive le singole traiettorie.</p>' +
        '<h3>Teorema centrale (Lindeberg–Lévy)</h3>' +
        '<p>Se X₁, X₂, … sono i.i.d. con 0 &lt; σ² &lt; ∞, la funzione caratteristica di zₙ è φ(t/(σ√n))ⁿ, con φ quella di X − μ. Sviluppando φ(s) = 1 − σ²s²/2 + o(s²) si ottiene</p>' +
        '<div class="eq" data-tex="\\varphi_{z_n}(t) = \\left(1 - \\frac{t^2}{2n} + o(1/n)\\right)^{n} \\to e^{-t^2/2}"></div>' +
        '<p>e il teorema di continuità di Lévy conclude.</p>' +
        '<h3>Quanto è buona l’approssimazione: Berry–Esseen</h3>' +
        '<p>Se ρ = E|X − μ|³ &lt; ∞,</p>' +
        '<div class="eq" data-tex="\\sup_{z} |P(z_n \\le z) - \\Phi(z)| \\le \\frac{C\\rho}{\\sigma^3\\sqrt{n}}, \\quad C \\le 0,4748"></div>' +
        '<p>(Shevtsova, 2011). È una garanzia valida per ogni n, ma spesso pessimistica: confrontala con la distanza osservata.</p>' +
        '<h3>Asimmetria della media</h3>' +
        '<p>Il terzo cumulante si somma su osservazioni indipendenti: κ₃(Σ Xᵢ) = n κ₃(X). Dividendo per (nσ²)<sup>3/2</sup> si ottiene γ(x̄ₙ) = γ/√n, esatto. Lo sviluppo di Edgeworth mostra che è il termine principale dell’errore del TCL: P(zₙ ≤ z) ≈ Φ(z) − γ(z² − 1)φ(z)/(6√n).</p>' +
        '<h3>Il caso Cauchy</h3>' +
        '<p>φ(t) = e<sup>−|t|</sup>, quindi φ<sub>x̄ₙ</sub>(t) = φ(t/n)ⁿ = e<sup>−|t|</sup>: la Cauchy è <em>stabile</em>. Esiste un teorema limite anche per code pesanti (leggi α-stabili), ma con normalizzazione n<sup>1/α</sup> e limite non normale.</p>' });
    }
  };

  /* ---------- montaggio ---------- */
  var run, codeBox, ctrlBox, figBWrap;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (S.mode === 'lln') drawLLN(); else { drawSample(); drawZ(); }
    if (full || run.frame % 6 === 0 || !run.running) updateTable();
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var modeSeg = el('div.seg', { role: 'group', 'aria-label': 'Teorema' });
    [['lln', 'Grandi numeri'], ['clt', 'Limite centrale']].forEach(function (m) {
      modeSeg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.mode === m[0]), onclick: function () {
        if (S.mode === m[0]) return; S.mode = m[0]; S.pred = null; figBWrap.hidden = S.mode === 'lln'; buildControls(); buildPrediction(); restart(); } }, m[1]));
    });
    var popSel = el('select', { 'aria-label': 'Popolazione', onchange: function () { S.pop = this.value; S.pred = null; buildPrediction(); restart(); } },
      Object.keys(POPS).map(function (k) { return el('option', { value: k, selected: k === S.pop }, POPS[k].label + (k === 'cauchy' ? ' — controesempio' : '')); }));
    var sizes = S.mode === 'lln'
      ? el('label.field', el('span', 'Osservazioni per traiettoria'), el('select', { onchange: function () { S.N = +this.value; buildPrediction(); restart(); } },
          [100, 500, 1000, 5000].map(function (v) { return el('option', { value: v, selected: v === S.N }, String(v)); })))
      : el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
          el('label.field', el('span', 'n per campione'), el('select', { onchange: function () { S.n = +this.value; buildPrediction(); restart(); } },
            [1, 2, 5, 10, 30, 100, 500].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
          el('label.field', el('span', 'Campioni B'), el('select', { onchange: function () { S.B = +this.value; restart(); } },
            [500, 1000, 5000].map(function (v) { return el('option', { value: v, selected: v === S.B }, String(v)); }))));
    var seedIn = el('input', { type: 'number', value: S.seed, min: 1, max: 99999, 'aria-label': 'Seed', onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } });
    ctrlBox.append(el('div.field', el('span', 'Teorema'), modeSeg),
      el('label.field', el('span', 'Popolazione'), popSel), sizes,
      el('label.field', el('span', 'Seed'), seedIn));
    run.controls(S.mode === 'lln' ? 'Una osservazione per traiettoria' : 'Un campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }
  function exportCSV() {
    var rows;
    if (S.mode === 'lln') { rows = [['n'].concat([1, 2, 3, 4].map(function (j) { return 'media_' + j; }))]; for (var i = 0; i < S.k; i++) rows.push([i + 1].concat(S.path.map(function (p) { return p[i]; }))); }
    else { rows = [['campione', pop().cauchy ? 'media' : 'z']]; for (var j = 0; j < S.k; j++) rows.push([j + 1, S.vals[j]]); }
    SA.ui.download('statatlas_lab04_' + S.mode + '_' + S.pop + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv');
  }
  function exportPNG() {
    var svgs = [figA.querySelector('svg')]; if (S.mode === 'clt') svgs.push(figB.querySelector('svg'));
    SA.ui.exportPNG(svgs, 'statatlas_lab04_' + S.mode + '.png', [S.mode === 'lln' ? 'Legge dei grandi numeri' : 'Teorema centrale del limite',
      pop().label + (S.mode === 'clt' ? ' · n = ' + S.n : '') + ' · seed ' + S.seed]);
  }

  SA.registerLab('lgn-tcl', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= total(); },
        progress: function () { return S.k / total(); }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Grandi numeri e limite centrale', THEORY, l); };
      page.appendChild(el('header.lab-head',
        el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
          el('h1', info.lab.title),
          el('p.lede', 'La media di molti dati si stabilizza, e la sua incertezza ha quasi sempre la forma di una campana. Quasi.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda');
      s1.body.appendChild(el('p.question', 'Perché la media di tanti dati è affidabile, e quando smette di esserlo?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Una media che cresce, molte medie a confronto');
      ctrlBox = el('div.panel.controls');
      figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend'); titleA = el('h3'); titleB = el('h3');
      figBWrap = el('div.fig', el('div.fig-title', titleB, legB), figB);
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', titleA, legA), figA), figBWrap,
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: exportCSV }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: exportPNG })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto');
      tblHead = el('thead'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', tblHead, tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' vale per ogni n'), el('span', SA.ui.badge('asym'), ' vale per n → ∞'),
          el('span', SA.ui.badge('mc'), ' stimato dalla simulazione')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Dimostrazioni, Berry–Esseen e leggi stabili (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stesse estrazioni, stesso ordine');
      codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab04_lgn_tcl.R');
      s6.body.append(el('p.prose', 'Lo script segue il teorema, la popolazione e i parametri selezionati. Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      figBWrap.hidden = S.mode === 'lln';
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
