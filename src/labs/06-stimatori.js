/* StatAtlas · Lab 06 — Media, mediana e massima verosimiglianza
 * Idea ispirata a Simul2000 (M. Chiodi): confronto di stimatori sugli stessi campioni.
 * Implementazione e testi originali. */
(function () {
  var THETA = 0, BINS = 48, SQ2PI = Math.sqrt(2 * Math.PI);
  var N_VALUES = [5, 10, 15, 20, 30, 50, 100, 200];
  var SPEEDS = [ // [repliche per passo, frame tra passi]
    { label: 'Lenta', per: 1, every: 20 }, { label: 'Media', per: 1, every: 4 },
    { label: 'Veloce', per: 3, every: 1 }, { label: 'Turbo', per: 25, every: 1 }];

  var EST = {
    mean:   { r: 'media',   label: 'Media',   long: 'Media campionaria',   col: 'c1', dash: null,    shape: 'tri' },
    median: { r: 'mediana', label: 'Mediana', long: 'Mediana campionaria', col: 'c2', dash: '7 4',   shape: 'diamond' },
    mle:    { r: 'mle',     label: 'MLE',     long: 'Massima verosimiglianza (numerica)', col: 'c3', dash: '2 3', shape: 'circle' }
  };

  /* Ogni modello: generatore identico a R, densità, stimatori e leggi teoriche */
  var MODELS = {
    normal: {
      label: 'Normale', law: 'N(θ, 1)', est: ['mean', 'median'], mleIs: 'mean',
      gen: function (g, n) { return g.rnorm(n, THETA, 1); },
      dens: function (x) { return SA.dens.norm(x, THETA, 1); },
      rGen: 'genera <- function(n) rnorm(n, mean = theta, sd = 1)',
      theory: function (n) { return {
        mean:   { sd: Math.sqrt(1 / n), st: 'exact', r: 'dnorm(x, theta, sqrt(1 / n))', txt: '1/√n' },
        median: { sd: Math.sqrt(Math.PI / (2 * n)), st: 'asym', r: 'dnorm(x, theta, sqrt(pi / (2 * n)))', txt: '√(π/(2n))' } }; },
      are: { a: 'median', b: 'mean', val: 2 / Math.PI, txt: '2/π' }
    },
    laplace: {
      label: 'Laplace', law: 'Laplace(θ, 1)', est: ['mean', 'median'], mleIs: 'median',
      gen: function (g, n) { return g.rlaplace(n, THETA, 1); },
      dens: function (x) { return SA.dens.laplace(x, THETA, 1); },
      rGen: '# Laplace(θ, b) per inversione: la stessa formula usata nel browser\n' +
        'rlaplace <- function(n, theta = 0, b = 1) {\n  u <- runif(n) - 0.5\n  theta - b * sign(u) * log(1 - 2 * abs(u))\n}\n' +
        'genera <- function(n) rlaplace(n, theta = theta, b = 1)',
      theory: function (n) { return {
        mean:   { sd: Math.sqrt(2 / n), st: 'asym', r: 'dnorm(x, theta, sqrt(2 / n))', txt: '√(2/n)' },
        median: { sd: Math.sqrt(1 / n), st: 'asym', r: 'dnorm(x, theta, sqrt(1 / n))', txt: '1/√n' } }; },
      are: { a: 'median', b: 'mean', val: 2, txt: '2' }
    },
    cauchy: {
      label: 'Cauchy', law: 'Cauchy(θ, 1)', est: ['mean', 'median', 'mle'], mleIs: null,
      gen: function (g, n) { return g.rcauchy(n, THETA, 1); },
      dens: function (x) { return SA.dens.cauchy(x, THETA, 1); },
      rGen: 'genera <- function(n) rcauchy(n, location = theta, scale = 1)\n\n' +
        '# MLE della posizione (scala nota = 1): algoritmo MM/IRLS dalla mediana.\n' +
        '# Ogni passo aumenta la verosimiglianza; converge a un massimo locale.\n' +
        'mle_cauchy <- function(x, tol = 1e-10, maxit = 100) {\n  theta_k <- median(x)\n  for (i in seq_len(maxit)) {\n' +
        '    w <- 1 / (1 + (x - theta_k)^2)\n    theta_new <- sum(w * x) / sum(w)\n    if (abs(theta_new - theta_k) < tol) break\n' +
        '    theta_k <- theta_new\n  }\n  theta_new\n}',
      theory: function (n) { return {
        mean:   { sd: Infinity, cauchy: true, st: 'exact', r: 'dcauchy(x, theta, 1)', txt: 'non esiste' },
        median: { sd: Math.PI / (2 * Math.sqrt(n)), st: 'asym', r: 'dnorm(x, theta, pi / (2 * sqrt(n)))', txt: 'π/(2√n)' },
        mle:    { sd: Math.sqrt(2 / n), st: 'asym', r: 'dnorm(x, theta, sqrt(2 / n))', txt: '√(2/n)' } }; },
      are: { a: 'median', b: 'mle', val: 8 / (Math.PI * Math.PI), txt: '8/π²' }
    }
  };

  var el, S; // stato

  function newState(prev) {
    var s = { model: 'normal', nIdx: 3, M: 1000, seed: 2026, speed: 1, prediction: null };
    if (prev) ['model', 'nIdx', 'M', 'seed', 'speed', 'prediction'].forEach(function (k) { s[k] = prev[k]; });
    s.n = N_VALUES[s.nIdx];
    s.rng = new SA.RRNG(s.seed);
    s.k = 0; s.running = false; s.frame = 0; s.last = null;
    s.est = {}; s.bins = {}; s.out = {};
    var th = MODELS[s.model].theory(s.n), maxVar = 0;
    MODELS[s.model].est.forEach(function (e) {
      s.est[e] = new Float64Array(s.M); s.bins[e] = new Uint32Array(BINS); s.out[e] = 0;
      if (isFinite(th[e].sd)) maxVar = Math.max(maxVar, th[e].sd * th[e].sd);
    });
    s.lim = +(4.5 * Math.sqrt(maxVar)).toFixed(4);
    s.th = th;
    return s;
  }

  function replicate() {
    if (S.k >= S.M) return false;
    var x = MODELS[S.model].gen(S.rng, S.n), vals = {};
    vals.mean = SA.stat.mean(x); vals.median = SA.stat.median(x);
    if (S.est.mle) vals.mle = SA.stat.mleCauchy(x);
    var bw = 2 * S.lim / BINS;
    for (var e in S.est) {
      var v = vals[e]; S.est[e][S.k] = v;
      var b = Math.floor((v - (THETA - S.lim)) / bw);
      if (b >= 0 && b < BINS) S.bins[e][b]++; else S.out[e]++;
    }
    S.last = { x: x, vals: vals };
    S.k++;
    return true;
  }

  /* ---------- grafici ---------- */
  var figSample, figDist, legendBox;

  function drawSample() {
    var W = 720, H = 168, X0 = -6, X1 = 6;
    var f = SA.plot.frame(figSample, { W: W, H: H, x: [X0, X1], m: { t: 10, r: 18, b: 40, l: 18 }, xlabel: 'x', label: 'Campione corrente' });
    var P = SA.plot, t = f.t, g = f.g, bandTop = 14, bandBot = 92, estY = 112;
    // densità del modello come sagoma di fondo
    var pk = MODELS[S.model].dens(THETA), pts = [];
    for (var i = 0; i <= 200; i++) { var xx = X0 + (X1 - X0) * i / 200; pts.push([f.x(xx), bandBot - (bandBot - bandTop) * MODELS[S.model].dens(xx) / pk]); }
    P.svg('path', { d: P.path(pts) + 'L' + f.x(X1) + ',' + bandBot + 'L' + f.x(X0) + ',' + bandBot + 'Z', fill: t.paper_2, stroke: t.rule_2 }, g);
    P.svg('line', { x1: f.x(THETA), x2: f.x(THETA), y1: bandTop - 4, y2: estY + 10, stroke: t.ink, 'stroke-dasharray': '3 3' }, g);
    var lab = P.svg('text', { x: f.x(THETA) + 4, y: bandTop + 4, fill: t.ink_2, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 }, g);
    lab.textContent = 'θ';
    if (!S.last) {
      var msg = P.svg('text', { x: W / 2, y: 60, 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 }, g);
      msg.textContent = 'Premi ▶ o “passo” per estrarre il primo campione';
      return;
    }
    var x = S.last.x, left = 0, right = 0;
    for (var j = 0; j < x.length; j++) {
      if (x[j] < X0) { left++; continue; } if (x[j] > X1) { right++; continue; }
      var jit = ((j * 0.6180339887) % 1);
      P.svg('circle', { cx: f.x(x[j]), cy: bandTop + 18 + jit * (bandBot - bandTop - 26), r: 3.6, fill: t.ink, 'fill-opacity': 0.55, stroke: t.card, 'stroke-width': 0.8 }, g);
    }
    function edgeNote(cnt, side) {
      if (!cnt) return;
      var tx = P.svg('text', { x: side < 0 ? f.x(X0) : f.x(X1), y: bandTop + 6, 'text-anchor': side < 0 ? 'start' : 'end', fill: t.accent, 'font-size': 11, 'font-weight': 600 }, g);
      tx.textContent = side < 0 ? '◂ ' + cnt + ' fuori' : cnt + ' fuori ▸';
    }
    edgeNote(left, -1); edgeNote(right, 1);
    P.svg('line', { x1: f.x(X0), x2: f.x(X1), y1: estY, y2: estY, stroke: t.rule }, g);
    MODELS[S.model].est.forEach(function (e) {
      var v = S.last.vals[e], c = t[EST[e].col], cx = f.x(Math.max(X0, Math.min(X1, v)));
      P.svg('line', { x1: cx, x2: cx, y1: bandTop, y2: estY, stroke: c, 'stroke-width': 1.6, 'stroke-dasharray': EST[e].dash }, g);
      P.marker(g, EST[e].shape, cx, estY, 12, c, t.card);
    });
  }

  function drawDist() {
    var lim = S.lim, x0 = THETA - lim, x1 = THETA + lim, bw = 2 * lim / BINS, peak = 0;
    MODELS[S.model].est.forEach(function (e) {
      var th = S.th[e]; peak = Math.max(peak, th.cauchy ? 1 / Math.PI : 1 / (th.sd * SQ2PI));
    });
    var ymax = +(peak * 1.3).toPrecision(2);
    var f = SA.plot.frame(figDist, { W: 720, H: 300, x: [x0, x1], y: [0, ymax], xlabel: 'stima di θ', ylabel: 'densità', label: 'Distribuzioni campionarie degli stimatori' });
    var P = SA.plot, t = f.t, g = f.g, yb = f.y(0);
    P.svg('line', { x1: f.x(THETA), x2: f.x(THETA), y1: f.m.t, y2: yb, stroke: t.ink, 'stroke-dasharray': '3 3' }, g);
    var order = MODELS[S.model].est;
    // istogrammi (simulazione)
    if (S.k > 0) order.forEach(function (e) {
      var c = t[EST[e].col], d = 'M' + f.x(x0).toFixed(1) + ',' + yb.toFixed(1);
      for (var b = 0; b < BINS; b++) {
        var h = Math.max(f.m.t, f.y(S.bins[e][b] / (S.k * bw)));
        d += 'L' + f.x(x0 + b * bw).toFixed(1) + ',' + h.toFixed(1) + 'L' + f.x(x0 + (b + 1) * bw).toFixed(1) + ',' + h.toFixed(1);
      }
      d += 'L' + f.x(x1).toFixed(1) + ',' + yb.toFixed(1) + 'Z';
      P.svg('path', { d: d, fill: c, 'fill-opacity': 0.12, stroke: c, 'stroke-opacity': 0.7, 'stroke-width': 1 }, g);
    });
    // curve teoriche
    order.forEach(function (e) {
      var th = S.th[e], pts = [];
      for (var i = 0; i <= 240; i++) {
        var xx = x0 + (x1 - x0) * i / 240;
        var dv = th.cauchy ? SA.dens.cauchy(xx, THETA, 1) : SA.dens.norm(xx, THETA, th.sd);
        pts.push([f.x(xx), Math.max(f.m.t, f.y(dv))]);
      }
      P.svg('path', { d: P.path(pts), fill: 'none', stroke: t[EST[e].col], 'stroke-width': 2.4, 'stroke-dasharray': EST[e].dash, 'stroke-linejoin': 'round' }, g);
    });
    // stime fuori scala
    var notes = order.filter(function (e) { return S.out[e] > 0; }).map(function (e) {
      return EST[e].label.toLowerCase() + ' ' + S.out[e] + ' (' + SA.fmt(100 * S.out[e] / S.k, 1) + '%)';
    });
    if (notes.length) {
      var tx = P.svg('text', { x: f.W - f.m.r, y: f.m.t + 12, 'text-anchor': 'end', fill: t.accent, 'font-size': 11.5, 'font-weight': 600 }, g);
      tx.textContent = 'Fuori scala: ' + notes.join(' · ');
    }
    var cnt = P.svg('text', { x: f.m.l + 8, y: f.m.t + 12, fill: t.ink_3, 'font-size': 11.5 }, g);
    cnt.textContent = S.k + ' campioni su ' + S.M;
  }

  function buildLegend() {
    var t = SA.theme();
    legendBox.innerHTML = '';
    MODELS[S.model].est.forEach(function (e) {
      legendBox.appendChild(el('span', SA.plot.legendSwatch(t[EST[e].col], EST[e].dash, EST[e].shape), EST[e].label));
    });
    legendBox.appendChild(el('span.muted', 'area: simulazione · curva: teoria'));
  }

  /* ---------- tabella teoria vs simulazione ---------- */
  var tblBody, kpiBox, fbBox, interpBox;
  function summary() {
    var out = {};
    MODELS[S.model].est.forEach(function (e) {
      var v = S.est[e].subarray(0, S.k), s = { k: S.k };
      if (S.k >= 2) {
        var srt = SA.stat.sorted(v), mse = 0;
        for (var i = 0; i < v.length; i++) mse += (v[i] - THETA) * (v[i] - THETA);
        s.center = SA.stat.quantile(srt, 0.5, true);
        s.iqr = SA.stat.quantile(srt, 0.75, true) - SA.stat.quantile(srt, 0.25, true);
        s.sd = SA.stat.sd(v); s.mse = mse / v.length;
      }
      out[e] = s;
    });
    return out;
  }
  function updateTable() {
    var sm = summary(), fmt = SA.fmt;
    tblBody.innerHTML = '';
    MODELS[S.model].est.forEach(function (e) {
      var th = S.th[e], s = sm[e], noVar = !isFinite(th.sd);
      var iqrT = th.cauchy ? 2 : 2 * 0.6744897502 * th.sd;
      var swatch = SA.plot.legendSwatch(SA.theme()[EST[e].col], EST[e].dash, EST[e].shape);
      var dag = noVar ? el('sup', { title: 'La varianza teorica non esiste: questo numero non converge al crescere delle repliche' }, '†') : null;
      tblBody.appendChild(el('tr',
        el('td', el('span.est', swatch, EST[e].label), MODELS[S.model].mleIs === e ? el('span.th', '= MLE in questo modello') : null),
        el('td', fmt(s.center), el('span.th', 'teoria ' + fmt(THETA))),
        el('td', fmt(s.sd), dag, el('span.th', 'teoria ' + (noVar ? 'non esiste' : fmt(th.sd) + ' = ' + th.txt))),
        el('td', fmt(s.iqr), el('span.th', 'teoria ' + fmt(iqrT))),
        el('td', fmt(s.mse), dag, el('span.th', noVar ? 'teoria: non esiste' : 'teoria ≈ ' + fmt(th.sd * th.sd))),
        el('td', SA.ui.badge(th.st))));
    });
    // efficienza relativa
    var are = MODELS[S.model].are, sa = sm[are.a], sb = sm[are.b];
    var effSim = sa && sb && sa.sd ? (sb.sd * sb.sd) / (sa.sd * sa.sd) : NaN;
    kpiBox.innerHTML = '';
    kpiBox.append(
      el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni generati')),
      el('div.kpi', el('b', fmt(are.val, 3)), el('span', 'efficienza asintotica ' + EST[are.a].label.toLowerCase() + ' vs ' + EST[are.b].label.toLowerCase() + ' = ' + are.txt + ' '), SA.ui.badge('asym')),
      el('div.kpi', el('b', fmt(effSim, 3)), el('span', 'stessa quantità stimata: Var(' + EST[are.b].label.toLowerCase() + ') / Var(' + EST[are.a].label.toLowerCase() + ') '), SA.ui.badge('mc')));
    updateFeedback(sm);
  }

  /* ---------- previsione ---------- */
  function predOptions() {
    var o = [['mean', 'La media'], ['median', 'La mediana']];
    if (S.model === 'cauchy') o.push(['mle', 'L’MLE numerico']);
    o.push(['tie', 'Sono praticamente equivalenti']);
    return o;
  }
  function updateFeedback(sm) {
    if (!S.prediction) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    if (S.k < 200) { fbBox.textContent = 'Previsione registrata. Il confronto compare dopo almeno 200 campioni (ora ' + S.k + ').'; return; }
    var ests = MODELS[S.model].est, best = ests[0];
    ests.forEach(function (e) { if (sm[e].iqr < sm[best].iqr) best = e; });
    var sortedIqr = ests.map(function (e) { return sm[e].iqr; }).sort(function (a, b) { return a - b; });
    var tie = sortedIqr[1] / sortedIqr[0] < 1.05;
    var right = (S.prediction === 'tie' && tie) || S.prediction === best;
    var msg = (right ? '✓ La simulazione conferma la tua previsione. ' : '✗ La simulazione dice altro. ') +
      'Lo stimatore più concentrato attorno a θ (scarto interquartile minore) è ' + EST[best].label.toLowerCase() + ': ' +
      ests.map(function (e) { return EST[e].label.toLowerCase() + ' ' + SA.fmt(sm[e].iqr); }).join(', ') + '.';
    fbBox.textContent = msg;
  }

  /* ---------- interpretazione ---------- */
  function interpretation() {
    var n = S.n, mc = ' Le quantità simulate sono stime Monte Carlo: con M = ' + S.M + ' repliche la deviazione standard simulata ha un errore relativo dell’ordine di 1/√(2M) ≈ ' + SA.fmt(100 / Math.sqrt(2 * S.M), 1) + '%.';
    var txt = {
      normal: '<p>Con dati normali la <strong>media</strong> è lo stimatore di massima verosimiglianza ed è esattamente N(θ, 1/n): raggiunge il limite di Cramér–Rao, e nessuno stimatore non distorto fa meglio. La <strong>mediana</strong> ha varianza asintotica π/(2n): per ottenere la stessa precisione servono circa π/2 ≈ 1,57 volte più osservazioni.</p><p><strong>Condizione:</strong> il vantaggio della media dipende dall’ipotesi di normalità. Basta una piccola quota di osservazioni da code pesanti per ribaltare il confronto: prova il modello Laplace o Cauchy.</p>',
      laplace: '<p>Con code esponenziali il confronto si ribalta. La <strong>mediana</strong> è lo stimatore di massima verosimiglianza (minimizza Σ|xᵢ − θ|) e ha varianza asintotica 1/n, la metà di quella della <strong>media</strong> (2/n). La media resta non distorta e asintoticamente normale per il teorema del limite centrale, ma spreca informazione.</p><p><strong>Attenzione:</strong> per n = ' + n + ' le curve teoriche sono approssimazioni asintotiche; con n piccolo la distribuzione della mediana non è ancora normale.</p>',
      cauchy: '<p>La media di n osservazioni Cauchy ha <em>ancora</em> legge Cauchy(θ, 1): non si concentra al crescere di n, perché E|X| = ∞ e la legge dei grandi numeri non si applica. Per questo la sua deviazione standard simulata (†) non converge: ogni tanto un valore enorme la fa saltare.</p><p>La <strong>mediana</strong> è consistente, con varianza asintotica π²/(4n). L’<strong>MLE</strong>, calcolato numericamente, fa meglio ancora (2/n, il limite di Cramér–Rao). La mediana <em>non</em> è l’MLE della Cauchy: qui è solo il punto di partenza dell’algoritmo, e l’equazione di verosimiglianza può avere più radici.</p>'
    };
    interpBox.innerHTML = txt[S.model] + '<p class="muted">' + mc + '</p>';
  }

  /* ---------- codice R ---------- */
  function codeR() {
    var m = MODELS[S.model], ests = m.est, th = S.th, f4 = function (v) { return (+v.toFixed(4)).toString(); };
    var est = ests.map(function (e) {
      var fn = e === 'mean' ? 'mean' : e === 'median' ? 'median' : 'mle_cauchy';
      return '    ' + EST[e].r + ' '.repeat(8 - EST[e].r.length) + '= map_dbl(campione, ' + fn + ')';
    }).join(',\n');
    var teo = ests.map(function (e) { return '    ' + EST[e].r + ' '.repeat(8 - EST[e].r.length) + '= ' + th[e].r; }).join(',\n');
    var teoSd = ests.map(function (e) { return EST[e].r + ' ' + (isFinite(th[e].sd) ? f4(th[e].sd) : 'non esiste (media ~ Cauchy(θ, 1))'); }).join(', ');
    var cols = ests.map(function (e) { return EST[e].r + ' = "' + { c1: '#0072B2', c2: '#D55E00', c3: '#009E73' }[EST[e].col] + '"'; }).join(', ');
    var mleNote = m.mleIs ? '\n# Nel modello ' + m.label + ' lo stimatore di massima verosimiglianza coincide con la ' + EST[m.mleIs].r + '.' : '';
    return [
      '# ───────────────────────────────────────────────────────────────',
      '# StatAtlas · Lab 06 — Media, mediana e massima verosimiglianza',
      '# Modello: ' + m.law.replace('θ', 'θ = ' + THETA) + ' · n = ' + S.n + ' · M = ' + S.M + ' · seed = ' + S.seed,
      '# Con R ≥ 4.1 e il generatore predefinito (Mersenne-Twister,',
      '# normal.kind = "Inversion") i campioni coincidono con quelli di StatAtlas.',
      '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)',
      '',
      '# Parametri -------------------------------------------------------',
      'theta <- ' + THETA + '        # vero parametro di posizione',
      'n     <- ' + S.n + ' '.repeat(Math.max(1, 9 - String(S.n).length)) + '# numerosità di ogni campione',
      'M     <- ' + S.M + ' '.repeat(Math.max(1, 9 - String(S.M).length)) + '# numero di campioni (repliche)',
      'set.seed(' + S.seed + ')',
      '',
      '# Modello generatore ----------------------------------------------',
      m.rGen + mleNote,
      '',
      '# 1. Simulazione: M campioni generati uno dopo l’altro ------------',
      'sim <- tibble(replica = seq_len(M)) |>',
      '  mutate(campione = map(replica, \\(r) genera(n)))',
      '',
      'stime <- sim |>',
      '  transmute(',
      '    replica,',
      est,
      '  )',
      '',
      '# 2. Teoria vs simulazione ----------------------------------------',
      'stime_lunghe <- stime |>',
      '  pivot_longer(-replica, names_to = "stimatore", values_to = "stima")',
      '',
      'stime_lunghe |>',
      '  group_by(stimatore) |>',
      '  summarise(',
      '    centro  = median(stima),          # teoria: θ (per simmetria)',
      '    dev_std = sd(stima),',
      '    iqr     = IQR(stima),',
      '    mse     = mean((stima - theta)^2)',
      '  )',
      '# Dev. std teoriche: ' + teoSd,
      '',
      '# 3. Grafico: distribuzioni campionarie ---------------------------',
      'lim <- ' + f4(S.lim) + '   # finestra [θ − lim, θ + lim]',
      'bw  <- 2 * lim / ' + BINS,
      'colori <- c(' + cols + ')',
      '',
      'teoria <- tibble(x = seq(theta - lim, theta + lim, length.out = 400)) |>',
      '  mutate(',
      teo,
      '  ) |>',
      '  pivot_longer(-x, names_to = "stimatore", values_to = "densita")',
      '',
      'theme_statatlas <- function(base_size = 12) {',
      '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(',
      '      plot.title       = element_text(face = "bold"),',
      '      plot.subtitle    = element_text(colour = "grey35"),',
      '      panel.grid.minor = element_blank(),',
      '      legend.position  = "top",',
      '      plot.background  = element_rect(fill = "#FAF8F3", colour = NA)',
      '    )',
      '}',
      '',
      'stime_lunghe |>',
      '  filter(abs(stima - theta) <= lim) |>',
      '  ggplot(aes(stima, colour = stimatore, fill = stimatore)) +',
      '  geom_histogram(aes(y = after_stat(count) / (M * bw)),   # densità rispetto a tutte le M stime',
      '                 binwidth = bw, boundary = theta - lim,',
      '                 alpha = 0.15, position = "identity") +',
      '  geom_line(data = teoria, aes(x, densita), linewidth = 0.9) +',
      '  geom_vline(xintercept = theta, linetype = "dashed") +',
      '  scale_colour_manual(values = colori, aesthetics = c("colour", "fill")) +',
      '  labs(',
      '    title    = "Distribuzione campionaria degli stimatori di posizione",',
      '    subtitle = sprintf("' + m.label + '(θ = %g), n = %d, M = %d · area: simulazione, curva: teoria", theta, n, M),',
      '    x = "stima di θ", y = "densità", colour = NULL, fill = NULL',
      '  ) +',
      '  theme_statatlas()',
      '',
      '# Quota di stime fuori dalla finestra del grafico',
      'stime_lunghe |>',
      '  group_by(stimatore) |>',
      '  summarise(fuori_scala = mean(abs(stima - theta) > lim))',
      ''
    ].join('\n');
  }

  /* ---------- approfondimenti ---------- */
  var THEORY = {
    base: function () {
      return el('div.prose', { html:
        '<h3>Che cosa stiamo confrontando</h3>' +
        '<p>Uno <strong>stimatore</strong> è una regola che trasforma il campione in un numero. Poiché il campione è casuale, anche la stima lo è: la sua legge si chiama <strong>distribuzione campionaria</strong>. Il laboratorio la costruisce ripetendo lo stesso esperimento M volte.</p>' +
        '<p>Tre domande guidano il confronto:</p><ul>' +
        '<li><strong>Centro</strong> — la distribuzione campionaria è centrata su θ? (distorsione)</li>' +
        '<li><strong>Dispersione</strong> — quanto si allarga attorno a θ? (varianza, errore quadratico medio, scarto interquartile)</li>' +
        '<li><strong>Robustezza</strong> — quanto cambia la stima se alcune osservazioni sono estreme?</li></ul>' +
        '<h3>Media e mediana</h3>' +
        '<p>La media usa il <em>valore</em> di ogni osservazione: una sola osservazione molto grande la sposta quanto vuole. La mediana usa solo l’<em>ordine</em>: resta stabile finché meno di metà dei dati è anomala. Si dice che la media ha punto di rottura (breakdown point) 0 e la mediana 50%.</p>' +
        '<h3>Efficienza relativa</h3>' +
        '<p>Se due stimatori sono centrati su θ, è più <strong>efficiente</strong> quello con varianza minore. Il rapporto delle varianze dice quante osservazioni in più servono al meno efficiente per uguagliare l’altro.</p>' +
        '<table class="tv"><thead><tr><th>Modello</th><th>Var(media)</th><th>Var(mediana)</th><th>Efficienza mediana/media</th></tr></thead><tbody>' +
        '<tr><td>Normale</td><td>1/n</td><td>≈ π/(2n)</td><td>2/π ≈ 0,64</td></tr>' +
        '<tr><td>Laplace</td><td>2/n</td><td>≈ 1/n</td><td>2</td></tr>' +
        '<tr><td>Cauchy</td><td>non esiste</td><td>≈ π²/(4n)</td><td>—</td></tr></tbody></table>' +
        '<div class="callout warn"><strong>Che cosa la simulazione non dimostra.</strong> Un istogramma che “somiglia” alla curva teorica è un indizio, non una prova: le curve marcate <em>asintotico</em> valgono per n → ∞; quelle marcate <em>esatto</em> sono vere per ogni n.</div>' });
    },
    adv: function () {
      return el('div.prose', { html:
        '<h3>Normalità asintotica della mediana</h3>' +
        '<p>Se la densità <span class="m">f</span> è continua e positiva in θ (mediana della popolazione), allora</p>' +
        '<div class="eq">√n (M<sub>n</sub> − θ) &nbsp;→<sub>d</sub>&nbsp; N(0, 1 / (4 f(θ)²))</div>' +
        '<p>Idea della dimostrazione: M<sub>n</sub> ≤ θ + t/√n se e solo se almeno metà delle osservazioni cade sotto θ + t/√n. Il numero di tali osservazioni è binomiale con probabilità F(θ + t/√n) ≈ ½ + f(θ) t/√n; il teorema del limite centrale per la binomiale conclude.</p>' +
        '<p>Con f(θ) = 1/√(2π) (Normale) si ottiene π/(2n); con f(θ) = 1/2 (Laplace, b = 1) si ottiene 1/n; con f(θ) = 1/π (Cauchy) si ottiene π²/(4n).</p>' +
        '<h3>Laplace: la mediana è l’MLE</h3>' +
        '<div class="eq">ℓ(θ) = −n log 2b − (1/b) Σ |x<sub>i</sub> − θ|</div>' +
        '<p>Massimizzare ℓ equivale a minimizzare Σ|xᵢ − θ|, che ha minimo nella mediana campionaria. Per n pari ogni valore tra le due osservazioni centrali è un MLE: la convenzione usuale prende il punto medio. ℓ non è derivabile nelle osservazioni, ma l’informazione di Fisher esiste e vale I(θ) = 1/b², per cui la mediana raggiunge il limite 1/n.</p>' +
        '<h3>Cauchy: perché la media non funziona</h3>' +
        '<p>La funzione caratteristica è φ(t) = exp(iθt − |t|). Per la media di n osservazioni indipendenti</p>' +
        '<div class="eq">φ<sub>X̄</sub>(t) = φ(t/n)<sup>n</sup> = exp(iθt − |t|)</div>' +
        '<p>cioè X̄ ~ Cauchy(θ, 1) per ogni n: la media non è consistente. Non c’è contraddizione con la legge dei grandi numeri, che richiede E|X| &lt; ∞.</p>' +
        '<h3>Cauchy: l’MLE numerico</h3>' +
        '<p>Con scala nota pari a 1, l’equazione di verosimiglianza è</p>' +
        '<div class="eq">ℓ′(θ) = Σ 2(x<sub>i</sub> − θ) / (1 + (x<sub>i</sub> − θ)²) = 0</div>' +
        '<p>Può avere più radici (massimi locali). StatAtlas parte dalla mediana, stimatore consistente, e itera</p>' +
        '<div class="eq">θ<sub>k+1</sub> = Σ w<sub>i</sub> x<sub>i</sub> / Σ w<sub>i</sub>, &nbsp; w<sub>i</sub> = 1 / (1 + (x<sub>i</sub> − θ<sub>k</sub>)²)</div>' +
        '<p>È un algoritmo MM: poiché log(1 + u) è concava in u, ogni passo massimizza una minorante della log-verosimiglianza, che quindi non diminuisce. Converge a un massimo locale; partendo da un valore iniziale consistente si ottiene la radice efficiente. L’informazione di Fisher per osservazione è I(θ) = 1/2, quindi Var(MLE) ≈ 2/n e l’efficienza della mediana rispetto all’MLE è 8/π² ≈ 0,81.</p>' +
        '<h3>Errore Monte Carlo</h3>' +
        '<p>Con M repliche indipendenti e stimatore approssimativamente normale, la deviazione standard simulata ha errore standard ≈ σ/√(2(M − 1)). Quando la varianza teorica non esiste (media Cauchy) questa garanzia cade: la deviazione standard empirica non converge.</p>' +
        '<div class="callout">Lo script R usa lo stesso generatore e lo stesso seed: i campioni, e quindi le stime, coincidono con quelle mostrate qui (a meno di differenze nell’ultima cifra decimale).</div>' });
    }
  };

  /* ---------- controlli e ciclo ---------- */
  var playBtn, progress, codeBox, raf = null, figRoot;

  function render(full) {
    drawSample(); drawDist();
    progress.style.width = (100 * S.k / S.M) + '%';
    if (full || S.frame % 6 === 0 || !S.running) updateTable();
  }
  function setRunning(on) {
    if (on && S.k >= S.M) { reset(); } // simulazione finita: «Riavvia» ricomincia
    S.running = on && S.k < S.M;
    playBtn.innerHTML = ''; playBtn.appendChild(SA.ui.icon(S.running ? 'pause' : 'play'));
    playBtn.appendChild(document.createTextNode(S.running ? ' Pausa' : S.k >= S.M ? ' Riavvia' : S.k ? ' Riprendi' : ' Avvia'));
    playBtn.setAttribute('aria-pressed', String(S.running));
    if (S.running && !raf) raf = requestAnimationFrame(loop);
    if (!S.running) render(true);
  }
  function loop() {
    raf = null;
    if (!S.running) return;
    var sp = SPEEDS[S.speed]; S.frame++;
    if (S.frame % sp.every === 0) {
      for (var i = 0; i < sp.per; i++) if (!replicate()) break;
      render(false);
    }
    if (S.k >= S.M) { setRunning(false); return; }
    raf = requestAnimationFrame(loop);
  }
  function reset(changes) {
    var keep = S; if (changes) for (var k in changes) keep[k] = changes[k];
    S = newState(keep);
    buildLegend(); interpretation(); codeBox.refresh();
    setRunning(false);
  }
  function runAll() { while (replicate()); setRunning(false); }

  function controls() {
    var modelSeg = el('div.seg', { role: 'group', 'aria-label': 'Modello' });
    Object.keys(MODELS).forEach(function (k) {
      modelSeg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.model === k), onclick: function () {
        modelSeg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        this.setAttribute('aria-pressed', 'true'); reset({ model: k, prediction: null }); buildPrediction();
      } }, MODELS[k].label));
    });
    var nOut = el('output', String(S.n));
    var nIn = el('input', { type: 'range', min: 0, max: N_VALUES.length - 1, step: 1, value: S.nIdx, 'aria-label': 'Numerosità campionaria n',
      oninput: function () { nOut.textContent = N_VALUES[this.value]; }, onchange: function () { reset({ nIdx: +this.value }); } });
    var mSel = el('select', { 'aria-label': 'Numero di repliche M', onchange: function () { reset({ M: +this.value }); } },
      [200, 500, 1000, 2000, 5000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }));
    var seedIn = el('input', { type: 'number', value: S.seed, min: 1, max: 99999, step: 1, 'aria-label': 'Seed', onchange: function () { reset({ seed: Math.max(1, Math.floor(+this.value || 1)) }); } });
    var spOut = el('output', SPEEDS[S.speed].label);
    var spIn = el('input', { type: 'range', min: 0, max: SPEEDS.length - 1, step: 1, value: S.speed, 'aria-label': 'Velocità',
      oninput: function () { S.speed = +this.value; spOut.textContent = SPEEDS[S.speed].label; } });
    playBtn = SA.ui.button(' Avvia', { icon: 'play', cls: 'btn-primary', onclick: function () { setRunning(!S.running); } });
    var stepBtn = SA.ui.button('', { icon: 'step', cls: 'btn-icon', aria: 'Un campione alla volta', title: 'Un campione (→)', onclick: function () { setRunning(false); replicate(); render(true); } });
    var allBtn = SA.ui.button('', { icon: 'fast', cls: 'btn-icon', aria: 'Completa tutte le repliche', title: 'Completa tutte le repliche', onclick: runAll });
    var resetBtn = SA.ui.button('', { icon: 'reset', cls: 'btn-icon', aria: 'Ricomincia', title: 'Ricomincia con lo stesso seed', onclick: function () { reset(); } });
    progress = el('i');
    return el('div.panel.controls',
      el('div.field', el('span', 'Modello dei dati'), modelSeg),
      el('label.field', el('div.field-row', el('span', 'Numerosità n'), nOut), nIn),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'Repliche M'), mSel), el('label.field', el('span', 'Seed'), seedIn)),
      el('label.field', el('div.field-row', el('span', 'Velocità'), spOut), spIn),
      el('div.transport', playBtn, stepBtn, allBtn, resetBtn),
      el('div.progress', { 'aria-hidden': 'true' }, progress),
      el('p.muted', { style: 'margin:0;font-size:.78rem' }, 'Tastiera: spazio avvia/pausa, → un campione.'));
  }

  var predBox;
  function buildPrediction() {
    predBox.innerHTML = '';
    var name = 'pred-' + Date.now();
    predBox.appendChild(el('p.prose', 'Con dati ' + MODELS[S.model].label + ' e n = ' + S.n + ', quale stimatore avrà la distribuzione campionaria più concentrata attorno a θ?'));
    predBox.appendChild(el('div.choices', { role: 'radiogroup', 'aria-label': 'Previsione' }, predOptions().map(function (o, i) {
      var id = name + i;
      return el('div.choice',
        el('input', { type: 'radio', name: name, id: id, value: o[0], checked: S.prediction === o[0], onchange: function () { S.prediction = this.value; updateTable(); } }),
        el('label', { for: id }, o[1]));
    })));
    fbBox = el('div.feedback', { role: 'status', hidden: true });
    predBox.appendChild(fbBox);
  }

  function onKey(e) {
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) || e.metaKey || e.ctrlKey) return;
    if (e.code === 'Space') { e.preventDefault(); setRunning(!S.running); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setRunning(false); replicate(); render(true); }
  }

  function exportCSV() {
    var ests = MODELS[S.model].est, rows = [['replica'].concat(ests.map(function (e) { return EST[e].r; }))];
    for (var i = 0; i < S.k; i++) rows.push([i + 1].concat(ests.map(function (e) { return S.est[e][i]; })));
    SA.ui.download('statatlas_lab06_' + S.model + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv');
  }
  function exportSummary() {
    var sm = summary(), m = MODELS[S.model];
    var lines = ['# StatAtlas · Lab 06 — riepilogo esperimento', '',
      '- Modello: ' + m.law + ' con θ = ' + THETA, '- n = ' + S.n + ', M = ' + S.M + ' (generati ' + S.k + '), seed = ' + S.seed,
      '- Previsione: ' + (S.prediction || 'non indicata'), '',
      '| Stimatore | Centro | Dev. std (sim) | Dev. std (teoria) | IQR | MSE |', '|---|---|---|---|---|---|'];
    m.est.forEach(function (e) {
      var s = sm[e], th = S.th[e];
      lines.push('| ' + EST[e].label + ' | ' + SA.fmt(s.center) + ' | ' + SA.fmt(s.sd) + ' | ' + (isFinite(th.sd) ? SA.fmt(th.sd) : 'non esiste') + ' | ' + SA.fmt(s.iqr) + ' | ' + SA.fmt(s.mse) + ' |');
    });
    lines.push('', 'Generato da StatAtlas. Lo script R con lo stesso seed riproduce i campioni.');
    SA.ui.download('statatlas_lab06_riepilogo.md', lines.join('\n'), 'text/markdown');
  }
  function exportPNG() {
    SA.ui.exportPNG([figSample.querySelector('svg'), figDist.querySelector('svg')], 'statatlas_lab06_' + S.model + '.png',
      ['Media, mediana e massima verosimiglianza', MODELS[S.model].law + ' · n = ' + S.n + ' · ' + S.k + ' campioni · seed ' + S.seed]);
  }

  SA.registerLab('stimatori', {
    mount: function (page, info) {
      el = SA.ui.el;
      S = newState(S);
      var theoryBtn = SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { SA.ui.openDrawer('Stimatori di posizione', THEORY); } });
      page.appendChild(el('header.lab-head',
        el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
          el('h1', info.lab.title),
          el('p.lede', 'Tre modi di stimare il centro di una distribuzione, applicati agli stessi campioni. Quale vince dipende dalle code del modello.')),
        theoryBtn));

      var s1 = SA.ui.step('1', 'Domanda');
      s1.body.appendChild(el('p.question', 'La media campionaria è sempre il modo migliore di stimare il centro di una distribuzione?'));
      var s2 = SA.ui.step('2', 'La tua previsione');
      predBox = el('div'); s2.body.appendChild(predBox);

      var s3 = SA.ui.step('3', 'Esperimento', 'Genera campioni e osserva le stime');
      figSample = el('div'); figDist = el('div'); legendBox = el('div.legend');
      figRoot = el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Il campione corrente'), el('span.muted', 'punti: osservazioni · simboli: stime')), figSample),
        el('div.fig', el('div.fig-title', el('h3', 'Distribuzione campionaria delle stime'), legendBox), figDist),
        el('div.toolbar',
          SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: exportCSV }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: exportPNG }),
          SA.ui.button('Riepilogo', { icon: 'download', cls: 'btn-ghost', onclick: exportSummary })));
      s3.body.appendChild(el('div.lab-grid', controls(), figRoot));

      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto');
      tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(
        el('div.tbl-wrap', el('table.tv',
          el('thead', el('tr', el('th', 'Stimatore'), el('th', 'Centro'), el('th', 'Dev. std'), el('th', 'Scarto interquartile'), el('th', 'Errore quadr. medio'), el('th', 'Stato della teoria'))),
          tblBody)),
        el('div.status-key',
          el('span', SA.ui.badge('exact'), ' vale per ogni n'), el('span', SA.ui.badge('asym'), ' vale per n → ∞'),
          el('span', SA.ui.badge('mc'), ' stimato dalla simulazione'), el('span', '† non converge: il momento teorico non esiste')),
        kpiBox);

      var s5 = SA.ui.step('5', 'Interpretazione');
      interpBox = el('div.prose'); s5.body.appendChild(interpBox);
      s5.body.appendChild(el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { SA.ui.openDrawer('Stimatori di posizione', THEORY, 'adv'); } }, SA.ui.icon('book'), ' Derivazioni complete (livello avanzato)')));

      var s6 = SA.ui.step('6', 'Riproduci in R', 'Lo stesso esperimento, con gli stessi numeri');
      codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab06_stimatori.R');
      s6.body.append(el('p.prose', 'Lo script usa il seed e i parametri correnti e si aggiorna quando li cambi. Richiede R ≥ 4.1 e il pacchetto tidyverse.'), codeBox);

      page.append(s1, s2, s3, s4, s5, s6);
      buildPrediction(); buildLegend(); interpretation();
      setRunning(false);
      document.addEventListener('keydown', onKey);
    },
    unmount: function () {
      if (S) S.running = false;
      if (raf) cancelAnimationFrame(raf); raf = null;
      document.removeEventListener('keydown', onKey);
    },
    redraw: function () { buildLegend(); render(true); codeBox.refresh(); }
  });
})();
