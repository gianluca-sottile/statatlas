/* StatAtlas · Lab 05 — Adattamento di un modello: istogramma, QQ plot, X² di Pearson, test Monte Carlo.
 * Spunto da Simul2000 (frequenze osservate/attese e test X²); implementazione e testi originali. */
(function () {
  var el, S, LAWS = SA.laws, MCB = 199;
  var DATA = {
    norm:   { label: 'Normale(0, 1)', law: 'norm', p: { mean: 0, sd: 1 }, pos: false },
    t5:     { label: 't di Student, ν = 5 (code pesanti)', law: 't', p: { df: 5 }, pos: false },
    exp:    { label: 'Esponenziale(1)', law: 'exp', p: { rate: 1 }, pos: true },
    gamma:  { label: 'Gamma(2, 1)', law: 'gamma', p: { shape: 2, rate: 1 }, pos: true },
    lnorm:  { label: 'Lognormale(0, 0,6)', law: 'lnorm', p: { meanlog: 0, sdlog: 0.6 }, pos: true },
    pois:   { label: 'Poisson(4)', law: 'pois', p: { lambda: 4 }, disc: true },
    binom:  { label: 'Binomiale(10, 0,3)', law: 'binom', p: { size: 10, prob: 0.3 }, disc: true, max10: true },
    nbinom: { label: 'Binomiale negativa(3, 0,4) (sovradispersa)', law: 'nbinom', p: { size: 3, prob: 0.4 }, disc: true }
  };
  /* Modelli ipotizzati, con parametri stimati per massima verosimiglianza */
  var HYP = {
    norm:  { label: 'Normale (μ, σ stimati)', law: 'norm', k: 2, fit: function (x) { var m = SA.stat.mean(x), v = 0; for (var i = 0; i < x.length; i++) v += (x[i] - m) * (x[i] - m); return { mean: m, sd: Math.sqrt(v / x.length) }; },
      r: 'list(mean = mean(x), sd = sqrt(mean((x - mean(x))^2)))', rq: 'qnorm' },
    exp:   { label: 'Esponenziale (λ stimato)', law: 'exp', k: 1, pos: true, fit: function (x) { return { rate: 1 / SA.stat.mean(x) }; }, r: 'list(rate = 1 / mean(x))', rq: 'qexp' },
    lnorm: { label: 'Lognormale (μ, σ di log X stimati)', law: 'lnorm', k: 2, pos: true, fit: function (x) { var l = Array.prototype.map.call(x, Math.log), m = SA.stat.mean(l), v = 0; l.forEach(function (u) { v += (u - m) * (u - m); }); return { meanlog: m, sdlog: Math.sqrt(v / l.length) }; },
      r: 'list(meanlog = mean(log(x)), sdlog = sqrt(mean((log(x) - mean(log(x)))^2)))', rq: 'qlnorm' },
    pois:  { label: 'Poisson (λ stimato)', law: 'pois', k: 1, disc: true, fit: function (x) { return { lambda: Math.max(1e-6, SA.stat.mean(x)) }; }, r: 'list(lambda = mean(x))', rq: 'qpois' },
    binom: { label: 'Binomiale(10, p stimato)', law: 'binom', k: 1, disc: true, max10: true, fit: function (x) { return { size: 10, prob: Math.min(1 - 1e-6, Math.max(1e-6, SA.stat.mean(x) / 10)) }; }, r: 'list(size = 10, prob = mean(x) / 10)', rq: 'qbinom' }
  };
  function D() { return DATA[S.data]; }
  function H() { return HYP[S.hyp]; }
  function hypOptions(dk) {
    var d = DATA[dk];
    return Object.keys(HYP).filter(function (h) { var m = HYP[h]; return !!m.disc === !!d.disc && (!m.pos || d.pos) && (!m.max10 || d.max10); });
  }
  function newState(prev) {
    var s = { data: 'norm', hyp: 'norm', N: 200, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    if (hypOptions(s.data).indexOf(s.hyp) < 0) s.hyp = hypOptions(s.data)[0];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.x = new Float64Array(s.N); s.mc = null;
    return s;
  }
  function step() { if (S.k >= S.N) return false; var d = D(); S.x[S.k++] = LAWS.get(d.law).q(S.rng.unif(), d.p); S.mc = null; return true; }

  /* ---------- classi e statistica X² ---------- */
  function chisq(x, hp) {
    var h = H(), L = LAWS.get(h.law), n = x.length, cls = [], i;
    if (h.disc) {
      var top = Math.max.apply(null, x), lo = 0, hi = Math.max(top, L.q(0.9999, hp)), cells = [];
      for (var v = lo; v <= hi; v++) cells.push({ a: v, b: v, e: n * L.pmf(v, hp) });
      cells[cells.length - 1].e = n * (1 - L.cdf(hi - 1, hp)); // ultima classe: coda superiore
      // fusione di classi adiacenti finché l'attesa è ≥ 5
      var cur = null;
      cells.forEach(function (c) { if (!cur) cur = { a: c.a, b: c.b, e: c.e }; else { cur.b = c.b; cur.e += c.e; } if (cur.e >= 5) { cls.push(cur); cur = null; } });
      if (cur) { if (cls.length) { cls[cls.length - 1].b = cur.b; cls[cls.length - 1].e += cur.e; } else cls.push(cur); }
      cls[cls.length - 1].b = Infinity;
      cls.forEach(function (c) { c.o = 0; });
      for (i = 0; i < n; i++) for (var j = 0; j < cls.length; j++) if (x[i] >= cls[j].a && x[i] <= cls[j].b) { cls[j].o++; break; }
    } else {
      var K = Math.max(3, Math.min(20, Math.floor(n / 5))), br = [-Infinity];
      for (i = 1; i < K; i++) br.push(L.q(i / K, hp)); br.push(Infinity);
      for (i = 0; i < K; i++) cls.push({ a: br[i], b: br[i + 1], e: n / K, o: 0 });
      for (i = 0; i < n; i++) { var t = 0; while (t < K - 1 && x[i] > br[t + 1]) t++; cls[t].o++; }
    }
    var X2 = 0; cls.forEach(function (c) { X2 += (c.o - c.e) * (c.o - c.e) / c.e; });
    var df = cls.length - 1 - h.k;
    return { X2: X2, df: df, cls: cls, p: df > 0 ? 1 - LAWS.get('chisq').cdf(X2, { df: df }) : NaN };
  }
  function current() {
    if (S.k < 10) return null;
    var x = S.x.subarray(0, S.k), hp = H().fit(x), c = chisq(x, hp), srt = SA.stat.sorted(x), L = LAWS.get(H().law), Dm = 0;
    if (H().disc) { // con valori ripetuti: confronto sui punti del supporto
      for (var v = 0, j = 0; v <= srt[srt.length - 1]; v++) { while (j < srt.length && srt[j] <= v) j++; Dm = Math.max(Dm, Math.abs(j / srt.length - L.cdf(v, hp))); }
    } else for (var i = 0; i < srt.length; i++) { var F = L.cdf(srt[i], hp); Dm = Math.max(Dm, (i + 1) / srt.length - F, F - i / srt.length); }
    c.hp = hp; c.sorted = srt; c.D = Dm; return c;
  }
  /* p-value Monte Carlo (bootstrap parametrico): si riparte dal generatore dopo i dati */
  function monteCarlo() {
    var c = current(); if (!c) return;
    var L = LAWS.get(H().law), ge = 0, n = S.k, g = S.rng;
    for (var b = 0; b < MCB; b++) {
      var xb = new Float64Array(n); for (var i = 0; i < n; i++) xb[i] = L.q(g.unif(), c.hp);
      if (chisq(xb, H().fit(xb)).X2 >= c.X2) ge++;
    }
    S.mc = { p: (1 + ge) / (MCB + 1), X2: c.X2 };
    S.rng = new SA.RRNG(S.seed); for (var j = 0; j < S.k; j++) S.rng.unif(); // il flusso dei dati resta invariato
    updateTable();
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB, cache = null;
  function drawHist() {
    var P = SA.plot, c = cache, h = H(), L = LAWS.get(h.law), d = D();
    var Ld = LAWS.get(d.law), lo = d.disc ? -0.6 : Ld.q(0.002, d.p), hi = d.disc ? Ld.q(0.999, d.p) + 0.6 : Ld.q(0.998, d.p);
    if (d.disc) lo = -0.6;
    var f = P.frame(figA, { W: 720, H: 260, x: [+lo.toPrecision(3), +hi.toPrecision(3)], y: [0, d.disc ? 0.4 : +(1.3 * maxDens(Ld, d.p, lo, hi)).toPrecision(2)], xlabel: 'x', ylabel: d.disc ? 'frequenza relativa' : 'densità', label: 'Dati e modello stimato' });
    var t = f.t, g = f.g, i;
    if (!c) { P.text(g, 360, 120, 'Servono almeno 10 osservazioni: premi ▶', { 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }); return; }
    var x = c.sorted, n = x.length;
    if (d.disc) {
      for (var v = 0; v <= hi; v++) {
        var cnt = 0; for (i = 0; i < n; i++) if (x[i] === v) cnt++;
        var top = Math.max(f.m.t, f.y(cnt / n)), pv = L.pmf(v, c.hp);
        P.svg('rect', { x: f.x(v) - 10, width: 20, y: top, height: f.y(0) - top, fill: t.c1, 'fill-opacity': 0.25, stroke: t.c1 }, g);
        P.svg('line', { x1: f.x(v), x2: f.x(v), y1: f.y(0), y2: Math.max(f.m.t, f.y(pv)), stroke: t.c2, 'stroke-width': 2 }, g);
        P.svg('circle', { cx: f.x(v), cy: Math.max(f.m.t, f.y(pv)), r: 4, fill: t.c2 }, g);
      }
    } else {
      var B = 30, cnts = new Uint32Array(B), bw = (hi - lo) / B;
      for (i = 0; i < n; i++) { var b = Math.floor((x[i] - lo) / bw); if (b >= 0 && b < B) cnts[b]++; }
      P.hist(f, cnts, lo, hi, n, t.c1);
      P.curve(f, function (u) { return L.pdf(u, c.hp); }, lo, hi, { stroke: t.c2, 'stroke-dasharray': '7 4' });
      P.curve(f, function (u) { return Ld.pdf(u, d.p); }, lo, hi, { stroke: t.c_theory, 'stroke-width': 1.4, 'stroke-opacity': 0.6 });
    }
  }
  function maxDens(L, p, lo, hi) { var m = 0; for (var i = 1; i < 200; i++) { var v = L.pdf(lo + (hi - lo) * i / 200, p); if (isFinite(v)) m = Math.max(m, v); } return m; }
  function drawQQ() {
    var P = SA.plot, c = cache, h = H(), L = LAWS.get(h.law), d = D();
    if (d.disc) return drawCells();
    if (!c) { P.frame(figB, { W: 720, H: 300, x: [0, 1], y: [0, 1], label: 'Grafico quantile-quantile' }); return; }
    var x = c.sorted, n = x.length, Bq = LAWS.get('beta'), lo = Math.min(x[0], L.q(0.5 / n, c.hp)), hi = Math.max(x[n - 1], L.q(1 - 0.5 / n, c.hp)), pad = 0.05 * (hi - lo);
    lo -= pad; hi += pad;
    var f = P.frame(figB, { W: 720, H: 300, x: [+lo.toPrecision(3), +hi.toPrecision(3)], y: [+lo.toPrecision(3), +hi.toPrecision(3)], xlabel: 'quantili del modello stimato', ylabel: 'quantili osservati', label: 'Grafico quantile-quantile' });
    var t = f.t, g = f.g, i, cl = function (v) { return Math.max(f.m.t, Math.min(f.y(f.y.domain[0]), f.y(v))); };
    // banda puntuale al 95% esatta: X(i) ha la legge di F⁻¹(Beta(i, n − i + 1))
    var up = [], dn = [], idx = [];
    for (i = 1; i <= n; i += Math.max(1, Math.floor(n / 80))) idx.push(i); if (idx[idx.length - 1] !== n) idx.push(n);
    idx.forEach(function (j) {
      var q = L.q((j - 0.5) / n, c.hp), a = Bq.q(0.025, { shape1: j, shape2: n - j + 1 }), b = Bq.q(0.975, { shape1: j, shape2: n - j + 1 });
      up.push([f.x(q), cl(L.q(b, c.hp))]); dn.push([f.x(q), cl(L.q(a, c.hp))]);
    });
    P.svg('path', { d: P.path(up.concat(dn.reverse())) + 'Z', fill: t.c3, 'fill-opacity': 0.14 }, g);
    P.svg('line', { x1: f.x(lo), y1: f.y(lo), x2: f.x(hi), y2: f.y(hi), stroke: t.c2, 'stroke-dasharray': '7 4', 'stroke-width': 1.6 }, g);
    var qq = []; for (i = 0; i < n; i++) qq.push([f.x(L.q((i + 0.5) / n, c.hp)), cl(x[i])]);
    P.dots(g, qq, n > 500 ? 1.8 : 2.8, t.c1, 0.8);
  }
  function drawCells() {
    var P = SA.plot, c = cache;
    if (!c) { P.frame(figB, { W: 720, H: 300, x: [0, 1], y: [0, 1], label: 'Frequenze per classe' }); return; }
    var K = c.cls.length, ym = 0; c.cls.forEach(function (q) { ym = Math.max(ym, q.o, q.e); });
    var f = P.frame(figB, { W: 720, H: 300, x: [-0.5, K - 0.5], y: [0, +(ym * 1.2).toPrecision(2)], xlabel: 'classe', ylabel: 'frequenze', xTicks: Math.min(K, 12), label: 'Frequenze osservate e attese per classe' });
    var t = f.t, g = f.g;
    c.cls.forEach(function (q, i) {
      var top = f.y(q.o);
      P.svg('rect', { x: f.x(i) - 14, width: 28, y: top, height: f.y(0) - top, fill: t.c1, 'fill-opacity': 0.25, stroke: t.c1 }, g);
      P.marker(g, 'diamond', f.x(i), f.y(q.e), 12, t.c2);
      P.text(g, f.x(i), f.y(0) + 30, q.b === Infinity ? '≥' + q.a : q.a === q.b ? String(q.a) : q.a + '–' + q.b, { 'text-anchor': 'middle', fill: t.ink_2, 'font-size': 10.5 });
    });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c1, null), 'dati'), el('span', sw(t.c2, '7 4', D().disc ? 'circle' : null), 'modello ipotizzato, parametri stimati'));
    if (!D().disc) legA.append(el('span', sw(t.c_theory, null), 'legge vera (in genere ignota)'));
    if (D().disc) legB.append(el('span', sw(t.c1, null), 'osservate'), el('span', sw(t.c2, null, 'diamond'), 'attese (≥ 5 per classe)'));
    else legB.append(el('span', sw(t.c1, null, 'circle'), 'quantili osservati'), el('span', sw(t.c2, '7 4'), 'retta y = x'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c3 + ';opacity:.3;border-radius:2px' }), 'banda puntuale 95%'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox, mcBtn;
  function updateTable() {
    var c = cache, fmt = SA.fmt, b = SA.ui.badge;
    tblBody.innerHTML = '';
    if (!c) { tblBody.appendChild(el('tr', el('td', { colspan: 3 }, 'Servono almeno 10 osservazioni.'))); kpiBox.innerHTML = ''; updateFeedback(); return; }
    tblBody.append(
      el('tr', el('td', 'Statistica X² di Pearson'), el('td', fmt(c.X2, 3)), el('td', c.cls.length + ' classi, ' + H().k + ' parametri stimati')),
      el('tr', el('td', 'Gradi di libertà'), el('td', String(c.df)), el('td', 'classi − 1 − parametri stimati')),
      el('tr', el('td', 'p-value asintotico (χ²)'), el('td', fmt(c.p, 4)), el('td', b('asym'))),
      el('tr', el('td', 'p-value Monte Carlo (' + MCB + ' campioni)'), el('td', S.mc ? fmt(S.mc.p, 4) : '—'), el('td', S.mc ? b('mc') : 'premi il pulsante sotto')),
      el('tr', el('td', 'Distanza di Kolmogorov sup|F̂ − F̂₀|'), el('td', fmt(c.D, 4)), el('td', 'con parametri stimati la tabella di Kolmogorov non vale')));
    kpiBox.innerHTML = '';
    var hp = c.hp, ptxt = Object.keys(hp).map(function (k) { return k + ' = ' + SA.fmt(hp[k], 3); }).join(', ');
    kpiBox.append(el('div.kpi', el('b', String(S.k)), el('span', 'osservazioni')), el('div.kpi', el('b', { style: 'font-size:1.05rem' }, ptxt), el('span', 'stime ML del modello ipotizzato')),
      el('div.kpi', el('b', c.p < 0.05 ? 'rifiuto' : 'non rifiuto'), el('span', 'decisione al 5% (asintotica)')));
    if (mcBtn) mcBtn.disabled = S.k < 10;
    updateFeedback();
  }
  function sameFamily() { return DATA[S.data].law === HYP[S.hyp].law; }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p05-' + Date.now();
    predBox.append(el('p.prose', 'Dati da ' + D().label + ', modello ipotizzato «' + H().label + '». Con ' + S.N + ' osservazioni, il test X² al 5% rifiuterà il modello?'),
      el('div.choices', { role: 'radiogroup' }, [['no', 'No: il modello è adeguato'], ['yes', 'Sì: il modello è sbagliato e i dati bastano a vederlo'], ['weak', 'Il modello è sbagliato, ma con questi dati il test non se ne accorge']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    if (S.k < S.N) { fbBox.textContent = 'Previsione registrata: il confronto compare al termine (ora ' + S.k + ' / ' + S.N + ').'; return; }
    var c = cache, rej = c.p < 0.05, truth = sameFamily() ? 'no' : rej ? 'yes' : 'weak';
    fbBox.textContent = (S.pred === truth ? '✓ ' : '✗ ') + 'p-value = ' + SA.fmt(c.p, 4) + '. ' + (sameFamily()
      ? (rej ? 'Il modello è giusto, eppure il test rifiuta: succede nel 5% dei casi (errore di primo tipo). Cambia seed.' : 'Il modello è quello vero: non rifiutare è l’esito atteso nel 95% dei casi.')
      : (rej ? 'Il modello è sbagliato e con ' + S.N + ' osservazioni il test lo rileva.' : 'Il modello è sbagliato ma la potenza è insufficiente: non rifiutare non significa che il modello sia giusto. Aumenta N.'));
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Tre strumenti, tre domande diverse. L’<strong>istogramma</strong> mostra la forma; il <strong>grafico quantile-quantile</strong> mostra <em>dove</em> il modello sbaglia (code, asimmetria) ed è il più sensibile agli scostamenti nelle code; il <strong>test X²</strong> riassume tutto in un numero.</p>' +
      '<p>Le classi sono costruite in modo che ogni frequenza attesa sia almeno 5 (equiprobabili per i modelli continui, fuse per quelli discreti), e i gradi di libertà tolgono un grado per ogni parametro stimato. Con stime dai dati non raggruppati il χ² con k − 1 − p gradi è solo un’approssimazione (Chernoff–Lehmann): il <strong>p-value Monte Carlo</strong>, che ripete stima e test su campioni generati dal modello stimato, non ha questo problema.</p>' +
      '<p class="muted">Un test di adattamento non “dimostra” il modello: con pochi dati quasi tutto passa, con moltissimi quasi niente. Usa sempre anche i grafici.</p>';
  }
  function codeR() {
    var d = D(), h = H(), Ld = LAWS.get(d.law), cont = !h.disc;
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 05 — Adattamento: dati ' + d.label + ', modello ' + h.label,
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'N <- ' + S.N,
      'x <- ' + Ld.rq + '(runif(N), ' + Ld.rargs(d.p) + ')', '',
      '# Stima ML del modello ipotizzato',
      'fit <- function(x) ' + h.r, 'par <- fit(x); par', '',
      '# Classi con frequenza attesa ≥ 5 e statistica X² di Pearson',
      cont ? 'chi2 <- function(x, par) {\n  K <- max(3, min(20, floor(length(x) / 5)))\n  br <- c(-Inf, do.call(' + h.rq + ', c(list((1:(K - 1)) / K), par)), Inf)\n  o <- table(cut(x, br))\n  e <- length(x) / K\n  sum((o - e)^2 / e)\n}\nK <- max(3, min(20, floor(N / 5)))'
        : 'chi2 <- function(x, par) {\n  pf <- function(q) do.call(p' + h.rq.slice(1) + ', c(list(q), par)); dd <- function(v) do.call(d' + h.rq.slice(1) + ', c(list(v), par))\n  hi <- max(max(x), do.call(' + h.rq + ', c(list(0.9999), par)))\n  e <- length(x) * c(dd(0:(hi - 1)), 1 - pf(hi - 1))\n  o <- tabulate(pmin(x, hi) + 1, nbins = hi + 1)\n  # fusione di classi adiacenti finché l\'attesa è ≥ 5\n  gruppo <- integer(length(e)); g <- 1; acc <- 0\n  for (i in seq_along(e)) { gruppo[i] <- g; acc <- acc + e[i]; if (acc >= 5) { g <- g + 1; acc <- 0 } }\n  if (acc > 0 && g > 1) gruppo[gruppo == g] <- g - 1\n  E <- tapply(e, gruppo, sum); O <- tapply(o, gruppo, sum)\n  structure(sum((O - E)^2 / E), K = length(E))\n}\nK <- attr(chi2(x, par), "K")',
      'X2 <- as.numeric(chi2(x, par))', 'gdl <- K - 1 - ' + h.k,
      'c(X2 = X2, gdl = gdl, p_asintotico = pchisq(X2, gdl, lower.tail = FALSE))', '',
      '# p-value Monte Carlo (bootstrap parametrico, ' + MCB + ' repliche): stessa sequenza di StatAtlas',
      'X2_b <- map_dbl(seq_len(' + MCB + '), \\(b) {',
      '  xb <- do.call(' + h.rq + ', c(list(runif(N)), par))',
      '  as.numeric(chi2(xb, fit(xb)))', '})',
      '(1 + sum(X2_b >= X2)) / (' + MCB + ' + 1)', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      cont ? '# Grafico quantile-quantile rispetto al modello stimato\ntibble(x = sort(x), q = do.call(' + h.rq + ', c(list(ppoints(N, a = 0.5)), par))) |>\n  ggplot(aes(q, x)) +\n  geom_abline(linetype = "dashed", colour = "#D55E00") +\n  geom_point(colour = "#0072B2", alpha = 0.7) +\n  labs(x = "quantili del modello stimato", y = "quantili osservati", title = "QQ plot: ' + h.label + '") +\n  theme_statatlas()'
        : '# Frequenze osservate e attese\ntibble(x = x) |> count(x) |>\n  mutate(attese = N * do.call(d' + h.rq.slice(1) + ', c(list(x), par))) |>\n  ggplot(aes(x)) +\n  geom_col(aes(y = n), fill = "#0072B2", alpha = 0.3, colour = "#0072B2") +\n  geom_point(aes(y = attese), shape = 18, size = 4, colour = "#D55E00") +\n  labs(y = "frequenze", title = "Osservate (barre) e attese (rombi)") +\n  theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>La domanda</h3><p>I dati sono compatibili con un modello F₀? Se F₀ ha parametri ignoti, li si stima prima: la domanda diventa “esiste un membro della famiglia compatibile con i dati?”.</p>' +
        '<h3>Test X² di Pearson</h3><div class="eq" data-tex="X^2 = \\sum_{j} \\frac{(O_j - E_j)^2}{E_j}"></div><p>Oⱼ frequenze osservate, Eⱼ attese sotto il modello. Sotto H₀, per n grande, X² ≈ χ² con k − 1 − p gradi di libertà (k classi, p parametri stimati). Regola pratica: Eⱼ ≥ 5.</p>' +
        '<h3>Il grafico quantile-quantile</h3><p>Ordina i dati e confrontali con i quantili del modello: se il modello è giusto, i punti stanno sulla retta. Una curva a “S” indica code diverse, una curvatura indica asimmetria. La banda verde è al 95% punto per punto.</p>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Gradi di libertà e stima dei parametri</h3><p>Il risultato χ²<sub>k−1−p</sub> vale se i parametri sono stimati per massima verosimiglianza <em>dai dati raggruppati</em>. Con stime dai dati originali (come qui), Chernoff e Lehmann (1954) mostrano che il limite sta tra χ²<sub>k−1−p</sub> e χ²<sub>k−1</sub>: il p-value asintotico è leggermente anticonservativo.</p>' +
        '<h3>Bootstrap parametrico</h3><p>Si generano B campioni dal modello stimato F(·; θ̂), si ripete su ciascuno <em>stima e test</em>, e p = (1 + #{X²ᵦ ≥ X²}) / (B + 1). Così si tiene conto esattamente della stima, e non serve l’approssimazione asintotica (Stute, Gonzáles Manteiga e Presedo Quindimil, 1993).</p>' +
        '<h3>Banda del QQ plot</h3><p>Se X ~ F continua, F(X₍ᵢ₎) ~ Beta(i, n − i + 1): la banda [F⁻¹(b<sub>0,025</sub>), F⁻¹(b<sub>0,975</sub>)] è esatta punto per punto per F nota, approssimata con parametri stimati. Non è una banda simultanea.</p>' +
        '<h3>Kolmogorov–Smirnov e Lilliefors</h3><p>D = sup|F̂ − F₀|. Con parametri stimati la distribuzione di D cambia (Lilliefors, 1967): le tabelle classiche danno p-value troppo grandi. Anche qui il bootstrap parametrico è la soluzione generale.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); cache = null; legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (full || run.frame % 5 === 0 || !run.running) { cache = current(); updateTable(); }
    drawHist(); drawQQ();
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    ctrlBox.append(
      el('label.field', el('span', 'Legge che genera i dati'), el('select', { onchange: function () { S.data = this.value; S.pred = null; if (hypOptions(S.data).indexOf(S.hyp) < 0) S.hyp = hypOptions(S.data)[0]; buildControls(); buildPrediction(); restart(); } },
        Object.keys(DATA).map(function (k) { return el('option', { value: k, selected: k === S.data }, DATA[k].label); }))),
      el('label.field', el('span', 'Modello ipotizzato'), el('select', { onchange: function () { S.hyp = this.value; S.pred = null; buildPrediction(); restart(); } },
        hypOptions(S.data).map(function (k) { return el('option', { value: k, selected: k === S.hyp }, HYP[k].label); }))),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Osservazioni N'), el('select', { onchange: function () { S.N = +this.value; buildPrediction(); restart(); } }, [30, 100, 200, 500, 2000].map(function (v) { return el('option', { value: v, selected: v === S.N }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Una osservazione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('adattamento', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 2, step: step, render: render, done: function () { return S.k >= S.N; }, progress: function () { return S.k / S.N; }, reset: function () { S = newState(S); cache = null; } });
      var openT = function (l) { SA.ui.openDrawer('Adattamento di un modello', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Un modello è una scommessa sulla forma dei dati. Istogramma, QQ plot e test X² dicono, in modi diversi, quando la scommessa è persa.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Come si capisce se un modello è adatto ai dati, e quanti dati servono per accorgersene?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'I dati arrivano, il modello viene ristimato');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Dati e modello stimato'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Dove il modello sbaglia'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['i', 'x']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.x[i]]); SA.ui.download('statatlas_lab05_' + S.data + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab05.png', ['Dati ' + D().label + ' · modello ' + H().label, S.k + ' osservazioni · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Il test');
      tblBody = el('tbody'); kpiBox = el('div.kpis');
      mcBtn = SA.ui.button('Calcola il p-value Monte Carlo', { onclick: function () { mcBtn.disabled = true; mcBtn.textContent = 'Calcolo…'; setTimeout(function () { monteCarlo(); mcBtn.textContent = 'Ricalcola il p-value Monte Carlo'; mcBtn.disabled = false; }, 30); } });
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Valore'), el('th', 'Nota'))), tblBody)), el('p', { style: 'margin-top:12px' }, mcBtn), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Chernoff–Lehmann, bootstrap parametrico, Lilliefors (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi dati, stesso test'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab05_adattamento.R');
      s6.body.append(el('p.prose', 'Il p-value Monte Carlo in R usa la stessa sequenza di numeri casuali, generata dopo i dati. Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
