/* StatAtlas · Lab 17 — Regressione segmentata e breakpoint.
 * Stima per ricerca su griglia: per ogni ψ candidato, minimi quadrati (QR) sul disegno [1, x, (x − ψ)+];
 * ψ̂ = argmin RSS(ψ), a parità il ψ più piccolo. Stesso algoritmo nello script R (riproducibilità R2). */
(function () {
  var el, S, G = 200, BINS = 40, KEEP = 12, B0 = 1, BOOT = 199, CHI = 3.841459;
  var ERR = {
    norm: { label: 'Normali', gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = g.norm(); return o; }, r: 'rnorm(n)' },
    t3: { label: 't₃ standardizzati (code pesanti)', gen: function (g, n) { var o = new Float64Array(n), L = SA.laws.get('t'); for (var i = 0; i < n; i++) o[i] = L.q(g.unif(), { df: 3 }) / Math.sqrt(3); return o; }, r: 'qt(runif(n), df = 3) / sqrt(3)' },
    het: { label: 'Normali eteroschedastici (σ cresce con x)', gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = (0.4 + 0.12 * S.x[i]) * g.norm(); return o; }, r: '(0.4 + 0.12 * x) * rnorm(n)' }
  };
  function mean(x) { return B0 + S.b1 * x + S.delta * Math.max(0, x - S.psi); }

  function newState(prev) {
    var s = { n: 80, b1: 0.5, delta: 1.2, psi: 6, sigma: 1, err: 'norm', B: 300, seed: 2026, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.fits = []; s.boot = null;
    s.x = []; for (var i = 0; i < s.n; i++) s.x.push(10 * (i + 0.5) / s.n);
    var m = Math.max(3, Math.ceil(0.05 * s.n)); s.glo = s.x[m - 1]; s.ghi = s.x[s.n - m];
    s.grid = []; for (i = 0; i < G; i++) s.grid.push(s.glo + (s.ghi - s.glo) * i / (G - 1));
    // il disegno è fisso: una base ortonormale per ogni ψ della griglia, calcolata una volta sola
    s.Q = s.grid.map(function (p) { return SA.la.orthoBasis(s.x.map(function (xi) { return [1, xi, Math.max(0, xi - p)]; })); });
    s.psiHat = new Float64Array(s.B); s.counts = new Uint32Array(BINS); s.edge = 0;
    s.ise = { lin: 0, seg: 0, spl: 0 };
    return s;
  }
  /* profilo RSS(ψ), stima segmentata, retta e spline cubica di confronto */
  function analyse(y) {
    var x = S.x, rss = new Float64Array(G), best = 0, yy = 0;
    for (var i = 0; i < y.length; i++) yy += y[i] * y[i];
    for (var g = 0; g < G; g++) { rss[g] = SA.la.rssQ(S.Q[g], y, yy); if (rss[g] < rss[best]) best = g; } // a parità vince il ψ più piccolo
    var pb = S.grid[best], bfit = SA.la.lsq(x.map(function (xi) { return [1, xi, Math.max(0, xi - pb)]; }), y);
    rss[best] = bfit.rss; // valore del minimo ricalcolato con QR
    var lin = SA.la.lsq(x.map(function (xi) { return [1, xi]; }), y);
    var spl = SA.la.lsq(x.map(function (xi) { var u = xi / 10; return [1, u, u * u, u * u * u, Math.pow(Math.max(0, u - 0.25), 3), Math.pow(Math.max(0, u - 0.5), 3), Math.pow(Math.max(0, u - 0.75), 3)]; }), y);
    return { rss: rss, best: best, psi: S.grid[best], beta: bfit.beta, rssMin: rss[best], lin: lin, spl: spl, y: y };
  }
  function errors(g) { return ERR[S.err].gen(g, S.n); }
  function step() {
    if (S.k >= S.B) return false;
    var e = errors(S.rng), y = S.x.map(function (xi, i) { return mean(xi) + S.sigma * e[i]; });
    var a = analyse(y); S.cur = a; S.boot = null;
    S.psiHat[S.k] = a.psi; if (a.best === 0 || a.best === G - 1) S.edge++;
    var b = Math.floor((a.psi - S.glo) / ((S.ghi - S.glo) / BINS)); S.counts[Math.max(0, Math.min(BINS - 1, b))]++;
    var n = S.n, il = 0, is = 0, ip = 0;
    for (var i = 0; i < n; i++) { var m = mean(S.x[i]), fs = a.beta[0] + a.beta[1] * S.x[i] + a.beta[2] * Math.max(0, S.x[i] - a.psi); il += (a.lin.fitted[i] - m) * (a.lin.fitted[i] - m); is += (fs - m) * (fs - m); ip += (a.spl.fitted[i] - m) * (a.spl.fitted[i] - m); }
    S.ise.lin += il / n; S.ise.seg += is / n; S.ise.spl += ip / n;
    S.fits.push([a.beta[0], a.beta[1], a.beta[2], a.psi]); if (S.fits.length > KEEP) S.fits.shift();
    S.k++; return true;
  }
  function plausible(a) { var lo = null, hi = null; for (var g = 0; g < G; g++) if (S.n * Math.log(a.rss[g] / a.rssMin) <= CHI) { if (lo === null) lo = S.grid[g]; hi = S.grid[g]; } return [lo, hi]; }

  /* ---------- test bootstrap dell'esistenza del cambiamento (sotto H0: δ = 0) ---------- */
  var bootTask = null;
  function runBoot(btn) {
    if (bootTask) bootTask.cancel();
    var a = S.cur, n = S.n, T = n * Math.log(a.lin.rss / a.rssMin), s = Math.sqrt(a.lin.rss / (n - 2)), b0 = a.lin.beta[0], b1 = a.lin.beta[1];
    var g = new SA.RRNG(S.seed); for (var r = 0; r < S.k; r++) errors(g); // flusso del generatore dopo il campione corrente (come in R)
    var ge = 0; btn.disabled = true;
    bootTask = SA.ui.chunked(BOOT, function () {
      var y = S.x.map(function (xi) { return b0 + b1 * xi + s * g.norm(); }), aa = analyse(y);
      if (n * Math.log(aa.lin.rss / aa.rssMin) >= T) ge++;
    }, function (i) { btn.textContent = 'Bootstrap in corso… ' + i + ' / ' + BOOT; },
    function () { S.boot = { T: T, p: (1 + ge) / (BOOT + 1), k: S.k }; btn.disabled = false; btn.textContent = 'Ricalcola il test bootstrap'; bootTask = null; updateTable(); });
  }

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, legA, legB;
  function drawFit() {
    var P = SA.plot, a = S.cur, ys = a.y, ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys), pad = 0.08 * (ymax - ymin);
    var F = P.frame(figA, { W: 720, H: 340, x: [0, 10], y: [+(ymin - pad).toFixed(1), +(ymax + pad).toFixed(1)], xlabel: 'x', ylabel: 'y', label: 'Campione, funzione vera e stime' });
    var t = F.t, g = F.g, seg = function (b) { return function (x) { return b[0] + b[1] * x + b[2] * Math.max(0, x - b[3]); }; };
    S.fits.slice(0, -1).forEach(function (b) { P.curve(F, seg(b), 0, 10, { stroke: t.accent, 'stroke-width': 1, 'stroke-opacity': 0.22 }, 120); });
    P.dots(g, S.x.map(function (x, i) { return [F.x(x), F.y(ys[i])]; }), 2.6, t.ink, 0.5);
    P.curve(F, mean, 0, 10, { stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, 200);
    P.curve(F, function (x) { return a.lin.beta[0] + a.lin.beta[1] * x; }, 0, 10, { stroke: t.c1, 'stroke-width': 2, 'stroke-dasharray': '10 4' });
    P.curve(F, seg([a.beta[0], a.beta[1], a.beta[2], a.psi]), 0, 10, { stroke: t.accent, 'stroke-width': 3 }, 200);
    if (S.delta !== 0) P.svg('line', { x1: F.x(S.psi), x2: F.x(S.psi), y1: F.m.t, y2: F.y(F.y.domain[0]), stroke: t.ink, 'stroke-dasharray': '2 3' }, g);
    P.svg('line', { x1: F.x(a.psi), x2: F.x(a.psi), y1: F.m.t, y2: F.y(F.y.domain[0]), stroke: t.accent, 'stroke-dasharray': '5 3' }, g);
    P.text(g, F.x(a.psi) + 5, F.m.t + 12, 'ψ̂ = ' + SA.fmt(a.psi, 2), { fill: t.accent, 'font-size': 12, 'font-weight': 700 });
  }
  function drawProfile() {
    var P = SA.plot, a = S.cur, dev = Array.prototype.map.call(a.rss, function (r) { return S.n * Math.log(r / a.rssMin); }), top = 14;
    var F = P.frame(figB, { W: 720, H: 230, x: [0, 10], y: [0, top], xlabel: 'ψ candidato', ylabel: 'n·log(RSS(ψ)/RSS min)', label: 'Profilo della somma dei quadrati dei residui' });
    var t = F.t, g = F.g, pl = plausible(a);
    P.svg('rect', { x: F.x(pl[0]), width: Math.max(2, F.x(pl[1]) - F.x(pl[0])), y: F.m.t, height: F.y(0) - F.m.t, fill: t.c3, 'fill-opacity': 0.12 }, g);
    P.svg('line', { x1: F.x(0), x2: F.x(10), y1: F.y(CHI), y2: F.y(CHI), stroke: t.c3, 'stroke-dasharray': '4 3' }, g);
    P.text(g, F.x(10) - 4, F.y(CHI) - 5, '3,84 (soglia indicativa)', { 'text-anchor': 'end', fill: t.c3, 'font-size': 11 });
    [S.glo, S.ghi].forEach(function (v) { P.svg('line', { x1: F.x(v), x2: F.x(v), y1: F.m.t, y2: F.y(0), stroke: t.rule_2, 'stroke-dasharray': '2 2' }, g); });
    P.svg('path', { d: P.path(S.grid.map(function (p, i) { return [F.x(p), Math.max(F.m.t, F.y(Math.min(top, dev[i])))]; })), fill: 'none', stroke: t.accent, 'stroke-width': 2.4 }, g);
    if (S.delta !== 0) P.svg('line', { x1: F.x(S.psi), x2: F.x(S.psi), y1: F.m.t, y2: F.y(0), stroke: t.ink, 'stroke-dasharray': '2 3' }, g);
    P.marker(g, 'circle', F.x(a.psi), F.y(0), 10, t.accent);
  }
  function drawMC() {
    var P = SA.plot, bw = (S.ghi - S.glo) / BINS, mx = 0; for (var i = 0; i < BINS; i++) mx = Math.max(mx, S.counts[i]);
    var F = P.frame(figC, { W: 720, H: 220, x: [0, 10], y: [0, +(1.15 * Math.max(1, mx) / Math.max(1, S.k) / bw).toPrecision(2)], xlabel: 'ψ̂', ylabel: 'densità', label: 'Distribuzione Monte Carlo di ψ̂' });
    var t = F.t;
    P.hist(F, S.counts, S.glo, S.ghi, S.k, t.accent, { opacity: 0.2 });
    [0, BINS - 1].forEach(function (b) { if (S.counts[b]) P.svg('rect', { x: F.x(S.glo + b * bw), width: F.x(S.glo + bw) - F.x(S.glo), y: F.y(S.counts[b] / (S.k * bw)), height: F.y(0) - F.y(S.counts[b] / (S.k * bw)), fill: t.c2, 'fill-opacity': 0.5 }, F.g); });
    if (S.delta !== 0) P.svg('line', { x1: F.x(S.psi), x2: F.x(S.psi), y1: F.m.t, y2: F.y(0), stroke: t.ink, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, F.g);
    P.text(F.g, F.m.l + 8, F.m.t + 12, S.k + ' campioni' + (S.edge ? ' · ' + S.edge + ' stime sul bordo della griglia (in arancio)' : ''), { fill: t.ink_3, 'font-size': 11.5 });
  }
  function drawCompare() {
    var P = SA.plot, k = Math.max(1, S.k), v = [['Retta', S.ise.lin / k, 'c1'], ['Segmentata', S.ise.seg / k, 'accent'], ['Spline cubica (7 parametri)', S.ise.spl / k, 'c3']], mx = Math.max.apply(null, v.map(function (q) { return q[1]; })) * 1.15 || 1;
    figD.innerHTML = ''; var t = SA.theme(), svg = P.svg('svg', { viewBox: '0 0 720 150', role: 'img', 'aria-label': 'Errore di stima della funzione media', 'font-family': t.sans, 'font-size': 13 }, figD);
    v.forEach(function (q, i) {
      var y = 18 + i * 42, w = 470 * q[1] / mx;
      P.text(svg, 196, y + 18, q[0], { 'text-anchor': 'end', fill: t.ink_2 });
      P.svg('rect', { x: 206, y: y, width: Math.max(1, w), height: 26, rx: 4, fill: t[q[2]], 'fill-opacity': 0.75 }, svg);
      P.text(svg, 212 + w, y + 18, SA.fmt(q[1], 4), { fill: t.ink, 'font-weight': 600 });
    });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c_theory, '7 4'), 'funzione media vera'), el('span', sw(t.accent, null), 'segmentata stimata'), el('span', sw(t.c1, '10 4'), 'retta dei minimi quadrati'), el('span', el('i', { style: 'display:inline-block;width:18px;height:2px;background:' + t.accent + ';opacity:.3' }), 'stime precedenti'));
    legB.append(el('span', sw(t.accent, null), 'profilo'), el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c3 + ';opacity:.3;border-radius:2px' }), 'insieme plausibile (indicativo)'), el('span', sw(t.ink, '2 3'), 'ψ vero'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox, bootBtn;
  function updateTable() {
    var a = S.cur, fmt = SA.fmt, b = SA.ui.badge, k = S.k, v = S.psiHat.subarray(0, k), m = k ? SA.stat.mean(v) : NaN, rmse = 0, noid = S.delta === 0;
    for (var i = 0; i < k; i++) rmse += (v[i] - S.psi) * (v[i] - S.psi); rmse = Math.sqrt(rmse / Math.max(1, k));
    var pl = plausible(a);
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Breakpoint ψ'), el('td', noid ? 'non identificato (δ = 0)' : fmt(S.psi, 2)), el('td', fmt(a.psi, 2) + ' · insieme plausibile [' + fmt(pl[0], 2) + '; ' + fmt(pl[1], 2) + ']'), el('td', b('approx'))),
      el('tr', el('td', 'Pendenza prima di ψ'), el('td', fmt(S.b1, 3)), el('td', fmt(a.beta[1], 3)), el('td', b('none'))),
      el('tr', el('td', 'Pendenza dopo ψ'), el('td', fmt(S.b1 + S.delta, 3)), el('td', fmt(a.beta[1] + a.beta[2], 3)), el('td', b('none'))),
      el('tr', el('td', 'Media di ψ̂ · distorsione · RMSE'), el('td', noid ? '—' : fmt(S.psi, 2) + ' · 0 · —'), el('td', k ? fmt(m, 2) + ' · ' + (noid ? '—' : fmt(m - S.psi, 3)) + ' · ' + (noid ? '—' : fmt(rmse, 3)) : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Stime sul bordo della griglia'), el('td', '—'), el('td', k ? fmt(100 * S.edge / k, 1) + '%' : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Test di esistenza del cambiamento (bootstrap, ' + BOOT + ' campioni)'), el('td', 'H₀: δ = 0'), el('td', S.boot && S.boot.k === S.k ? 'p = ' + fmt(S.boot.p, 3) + ' (T = ' + fmt(S.boot.T, 2) + ')' : 'premi il pulsante'), el('td', b('mc'))));
    kpiBox.innerHTML = '';
    var k1 = Math.max(1, k);
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'campioni simulati')),
      el('div.kpi', el('b', fmt(Math.abs(S.delta) / S.sigma, 2)), el('span', 'segnale |δ|/σ: quanto è visibile il cambio di pendenza')),
      el('div.kpi', el('b', fmt(S.ise.seg / k1, 4) + ' / ' + fmt(S.ise.lin / k1, 4)), el('span', 'errore sulla media: segmentata / retta '), b('mc')));
    updateFeedback(rmse);
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p17-' + Date.now();
    predBox.append(el('p.prose', 'Se il cambio di pendenza è piccolo rispetto al rumore, come si distribuirà la stima del breakpoint nei campioni ripetuti?'),
      el('div.choices', { role: 'radiogroup' }, [['near', 'Concentrata vicino al valore vero'], ['spread', 'Molto dispersa, spesso vicino ai bordi della griglia'], ['center', 'Sempre al centro dell’intervallo delle x']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback(rmse) {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'spread' ? '✓ ' : '✗ ') + 'Con segnale debole il profilo RSS(ψ) è piatto: piccole fluttuazioni del rumore spostano il minimo anche lontano, e i bordi della griglia raccolgono stime spurie. Prova δ = 0,3 o δ = 0 (breakpoint non identificato) e guarda la distribuzione di ψ̂; poi δ = 2.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Il modello è una spezzata continua: pendenza β₁ prima di ψ e β₁ + δ dopo. Per ψ fissato è un modello lineare; per questo ψ si stima <strong>profilando</strong>: per ogni candidato si adatta il modello lineare e si sceglie il ψ con la somma dei quadrati dei residui minima.</p>' +
      '<p>L’inferenza su ψ <strong>non è regolare</strong>: se δ = 0 il breakpoint non esiste e ψ non è identificato, quindi un intervallo di Wald o un test standard su ψ non hanno la distribuzione nominale. L’insieme “plausibile” del profilo è solo indicativo. Per decidere se il cambio di pendenza esiste si usa un test che tenga conto di ψ ignoto: qui un bootstrap parametrico sotto H₀, in R anche il test di Davies.</p>' +
      '<p class="muted">Quando il segnale |δ|/σ è forte ψ̂ si concentra attorno al vero valore; con segnale debole la distribuzione si allarga e compaiono stime ai bordi. La spline cubica di confronto non ha un parametro interpretabile come ψ, ma può avere un errore di stima della curva simile.</p>';
  }
  function codeR() {
    var E = ERR[S.err];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 17 — Regressione segmentata e breakpoint',
      '# R0: stessi dati di StatAtlas con R ≥ 4.1 e lo stesso seed.', '# R2: stessa ricerca su griglia (200 candidati, minimo con il ψ più piccolo a parità).',
      '# R3: segmented::segmented() usa un algoritmo diverso (Muggeo, 2003): confronto di metodo, non stessi numeri.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; b0 <- ' + B0 + '; b1 <- ' + S.b1 + '; delta <- ' + S.delta + '; psi <- ' + S.psi + '; sigma <- ' + S.sigma + '; B <- ' + S.B,
      'x <- 10 * (seq_len(n) - 0.5) / n', 'media <- b0 + b1 * x + delta * pmax(0, x - psi)', 'errori <- function(n) ' + E.r, 'genera <- function() media + sigma * errori(n)', '',
      '# Griglia dei candidati: almeno m osservazioni da ciascun lato', 'm <- max(3, ceiling(0.05 * n))', 'griglia <- seq(x[m], x[n - m + 1], length.out = ' + G + ')',
      'profilo <- function(y) sapply(griglia, \\(p) sum(lm.fit(cbind(1, x, pmax(0, x - p)), y)$residuals^2))', '',
      '# Campioni ripetuti: stima di psi in ciascuno', 'stime <- map_dbl(seq_len(B), \\(b) griglia[which.min(profilo(genera()))])',
      'tibble(media = mean(stime), distorsione = mean(stime) - psi, rmse = sqrt(mean((stime - psi)^2)),', '       bordo = mean(stime %in% range(griglia)))', '',
      '# Campione numero ' + Math.max(1, S.k) + ' (quello mostrato) e test bootstrap sotto H0: delta = 0', 'set.seed(' + S.seed + ')', 'for (r in seq_len(' + Math.max(1, S.k) + ')) y <- genera()',
      'rss <- profilo(y); psi_hat <- griglia[which.min(rss)]', 'fit_lin <- lm(y ~ x)', 'T_oss <- n * log(sum(resid(fit_lin)^2) / min(rss))',
      's <- sqrt(sum(resid(fit_lin)^2) / (n - 2))', 'T_boot <- map_dbl(seq_len(' + BOOT + '), \\(b) {', '  yb <- fitted(fit_lin) + s * rnorm(n)', '  n * log(sum(lm.fit(cbind(1, x), yb)$residuals^2) / min(profilo(yb)))', '})',
      'c(psi_hat = psi_hat, T = T_oss, p_bootstrap = (1 + sum(T_boot >= T_oss)) / (' + BOOT + ' + 1))', '',
      '# Confronto di metodo (R3): pacchetto segmented', '# install.packages("segmented")', 'library(segmented)',
      'fit_seg <- segmented(fit_lin, seg.Z = ~x, psi = psi_hat)', 'summary(fit_seg)', 'davies.test(fit_lin, seg.Z = ~x)   # test di esistenza con psi ignoto', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'tibble(psi = griglia, devianza = n * log(rss / min(rss))) |>', '  ggplot(aes(psi, devianza)) + geom_line(colour = "#9A3412", linewidth = 1) +',
      '  geom_hline(yintercept = qchisq(0.95, 1), linetype = "dashed") +', '  labs(title = "Profilo RSS(psi)", y = "n log(RSS(psi) / RSS min)") + theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Il modello</h3><div class="eq">Yᵢ = β₀ + β₁xᵢ + δ(xᵢ − ψ)₊ + εᵢ</div><p>(u)₊ = max(0, u). La media è continua in ψ, con pendenza β₁ a sinistra e β₁ + δ a destra. Se ψ fosse noto, il modello sarebbe lineare nei parametri (β₀, β₁, δ).</p>' +
        '<h3>Stima per profilo</h3><p>Per ogni ψ candidato si calcolano i minimi quadrati e la somma dei quadrati dei residui RSS(ψ); la stima è il ψ che la rende minima. Si escludono i candidati troppo vicini ai bordi, dove da un lato resterebbero pochissime osservazioni.</p>' +
        '<div class="callout warn">Il breakpoint è un parametro <strong>non regolare</strong>: RSS(ψ) non è derivabile nei punti xᵢ e, se δ = 0, ψ scompare dal modello. Gli intervalli e i test “di routine” non hanno la copertura o il livello dichiarati.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Proprietà asintotiche</h3><p>Se δ ≠ 0 e il modello è continuo, ψ̂ è consistente e asintoticamente normale con velocità √n (Feder, 1975); l’approssimazione è però lenta quando |δ|/σ è piccolo. Nei modelli <em>discontinui</em> (salto nella media) la velocità diventa n e la legge limite non è normale.</p>' +
        '<h3>Il problema di Davies</h3><p>Sotto H₀: δ = 0 il parametro ψ è presente solo sotto l’alternativa. La statistica sup<sub>ψ</sub> del rapporto di verosimiglianza non ha legge χ²: Davies (1987) ne fornisce un’approssimazione, il bootstrap parametrico sotto H₀ (rifacendo anche la ricerca di ψ) una calibrazione Monte Carlo. Muggeo (2016) propone un test score con ψ ignoto (<code>pscore.test</code>).</p>' +
        '<h3>Algoritmo di Muggeo</h3><p>Il pacchetto <code>segmented</code> linearizza (x − ψ)₊ attorno al valore corrente di ψ e itera minimi quadrati: è rapido e fornisce un errore standard per ψ̂ basato sulla linearizzazione, da usare con cautela quando il segnale è debole.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { if (bootTask) { bootTask.cancel(); bootTask = null; } run.stop(); S = newState(S); step(); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); if (bootBtn) { bootBtn.disabled = false; bootBtn.textContent = 'Test bootstrap dell’esistenza del cambiamento'; } }
  function render(full) { drawFit(); if (full || run.frame % 3 === 0 || !run.running) { drawProfile(); drawMC(); drawCompare(); updateTable(); } if (full && !run.running && codeBox) codeBox.refresh(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sl = function (lab, key, mn, mx, st, d) { return SA.ui.slider(lab, { min: mn, max: mx, step: st, value: S[key], format: function (v) { return SA.fmt(v, d); }, onchange: function (v) { S[key] = v; restart(); } }); };
    ctrlBox.append(
      el('label.field', el('span', 'Errori'), el('select', { onchange: function () { S.err = this.value; restart(); } }, Object.keys(ERR).map(function (k) { return el('option', { value: k, selected: k === S.err }, ERR[k].label); }))),
      sl('Cambio di pendenza δ (0 = nessun breakpoint)', 'delta', -2, 2, 0.1, 1), sl('Posizione vera ψ', 'psi', 1.5, 8.5, 0.5, 1), sl('Pendenza iniziale β₁', 'b1', -1, 1, 0.1, 1), sl('Rumore σ', 'sigma', 0.2, 3, 0.1, 1),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [40, 80, 150, 300].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
        el('label.field', el('span', 'Campioni B'), el('select', { onchange: function () { S.B = +this.value; restart(); } }, [100, 300, 1000].map(function (v) { return el('option', { value: v, selected: v === S.B }, String(v)); }))),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('segmentata', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione segmentata', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Una relazione che a un certo punto cambia pendenza. Dove? E come distinguere un vero cambiamento da una fluttuazione del caso?')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Quando una relazione cambia pendenza, e come si stima un punto di cambiamento ignoto?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Profilo, stima e campioni ripetuti');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); figD = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Il campione e la spezzata stimata'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Profilo RSS(ψ)'), legB), figB),
        el('div.fig', el('div.fig-title', el('h3', 'Dove cade ψ̂ nei campioni ripetuti')), figC),
        el('div.fig', el('div.fig-title', el('h3', 'Errore nella stima della funzione media'), el('div.legend', el('span.muted', 'media su ' + 'tutti i campioni simulati, ai punti xᵢ'))), figD),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['x', 'y']]; S.x.forEach(function (x, i) { rows.push([x, S.cur.y[i]]); }); SA.ui.download('statatlas_lab17_campione.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Stime ψ̂ CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['replica', 'psi_hat']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.psiHat[i]]); SA.ui.download('statatlas_lab17_psi.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab17.png', ['Regressione segmentata', 'δ = ' + S.delta + ' · ψ = ' + S.psi + ' · n = ' + S.n + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      bootBtn = SA.ui.button('Test bootstrap dell’esistenza del cambiamento', { onclick: function () { runBoot(bootBtn); } });
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Valore vero'), el('th', 'Stima / simulazione'), el('th', 'Natura'))), tblBody)),
        el('p', { style: 'margin-top:12px' }, bootBtn), el('div.status-key', el('span', SA.ui.badge('approx'), ' indicativo: inferenza non regolare'), el('span', SA.ui.badge('mc'), ' Monte Carlo'), el('span', SA.ui.badge('none'), ' stima puntuale del campione corrente')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Asintotica, problema di Davies, algoritmo di Muggeo (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessa griglia, stessi dati'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab17_segmentata.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati (R0) e stessa ricerca su griglia (R2); il pacchetto segmented è un confronto di metodo (R3). Richiede R ≥ 4.1, tidyverse e segmented.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); if (bootTask) { bootTask.cancel(); bootTask = null; } document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
