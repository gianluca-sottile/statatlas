/* StatAtlas · Lab 24 — Reti neurali artificiali e backpropagation.
 * Dati: U = runif(2n) e Z = rnorm(2n) letti per righe; etichetta calcolata dai punti puliti, poi x + σz.
 * Suddivisione training/validazione con sample(n, n_val). Rete 2 → H → 1 (SA.nn), inizializzata con un seed proprio,
 * discesa del gradiente a lotto intero: un passo del laboratorio = un'epoca. Nessun numero casuale durante l'addestramento. */
(function () {
  var el, S, NG = 50, SEEDS = 20;
  var DATA = { xor: 'XOR (quadranti)', line: 'Separabile da una retta', moons: 'Due lune' };
  function gen(s) {
    var g = new SA.RRNG(s.seed), n = s.n, U = [], Z = [], X = [], y = [], i;
    for (i = 0; i < n; i++) U.push([g.unif(), g.unif()]);
    for (i = 0; i < n; i++) Z.push([g.norm(), g.norm()]);
    for (i = 0; i < n; i++) {
      var x, lab;
      if (s.data === 'moons') { var two = i >= n / 2, t = Math.PI * U[i][0]; x = two ? [1 - Math.cos(t) - 0.5, 0.5 - Math.sin(t) - 0.25] : [Math.cos(t) - 0.5, Math.sin(t) - 0.25]; lab = two ? 1 : 0; }
      else { x = [2 * U[i][0] - 1, 2 * U[i][1] - 1]; lab = s.data === 'xor' ? (x[0] * x[1] > 0 ? 1 : 0) : (x[1] > 0.5 * x[0] ? 1 : 0); }
      X.push([x[0] + s.sigma * Z[i][0], x[1] + s.sigma * Z[i][1]]); y.push(lab);
    }
    var sp = SA.rs.split(g, n, Math.round(s.pv * n));
    var pick = function (ids) { return { X: ids.map(function (k) { return X[k - 1]; }), y: ids.map(function (k) { return y[k - 1]; }) }; };
    return { tr: pick(sp.train), va: pick(sp.test) };
  }
  function newState(prev) {
    var s = { data: 'xor', n: 200, sigma: 0.1, pv: 0.3, H: 4, act: 'tanh', eta: 0.5, lambda: 0, E: 2000, seed: 2026, iseed: 1, pred: null, sel: 0 };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    var D = gen(s); s.tr = D.tr; s.va = D.va;
    s.net = SA.nn.init(new SA.RRNG(s.iseed), s.H, s.act); s.net0 = SA.nn.clone(s.net);
    s.e = 0; s.hist = { tr: [], va: [], atr: [], ava: [] }; s.diverged = false; s.multi = null;
    record(s); return s;
  }
  function record(s) {
    var N = SA.nn; s.hist.tr.push(N.loss(s.net, s.tr.X, s.tr.y, 0)); s.hist.va.push(N.loss(s.net, s.va.X, s.va.y, 0));
    s.hist.atr.push(N.accuracy(s.net, s.tr.X, s.tr.y)); s.hist.ava.push(N.accuracy(s.net, s.va.X, s.va.y));
  }
  function step() {
    if (S.e >= S.E || S.diverged) return false;
    SA.nn.step(S.net, SA.nn.grad(S.net, S.tr.X, S.tr.y, S.lambda), S.eta); S.e++;
    if (!SA.nn.finite(S.net)) { S.diverged = true; return false; }
    record(S); return true;
  }
  /* più inizializzazioni sugli stessi dati: seed iseed + 1 … iseed + 20 (a blocchi, annullabile) */
  var multiTask = null;
  function runMulti(btn) {
    if (multiTask) multiTask.cancel();
    var res = []; btn.disabled = true;
    multiTask = SA.ui.chunked(SEEDS, function (r) {
      var net = SA.nn.init(new SA.RRNG(S.iseed + r + 1), S.H, S.act), ok = true;
      for (var e = 0; e < S.E && ok; e++) { SA.nn.step(net, SA.nn.grad(net, S.tr.X, S.tr.y, S.lambda), S.eta); ok = SA.nn.finite(net); }
      res.push(ok ? { tr: SA.nn.loss(net, S.tr.X, S.tr.y, 0), va: SA.nn.loss(net, S.va.X, S.va.y, 0), ava: SA.nn.accuracy(net, S.va.X, S.va.y) } : { div: true });
    }, function (i) { btn.textContent = 'Addestramento in corso… ' + i + ' / ' + SEEDS; },
    function () { S.multi = res; btn.disabled = false; btn.textContent = 'Ripeti con ' + SEEDS + ' inizializzazioni'; multiTask = null; drawMulti(); updateTable(); });
  }

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, legA, legC, FA, multiBtn;
  function drawSurface() {
    var P = SA.plot, R = S.data === 'moons' ? 1.9 : 1.5, net = S.net;
    FA = P.frame(figA, { W: 520, H: 480, x: [-R, R], y: [-R, R], xlabel: 'x₁', ylabel: 'x₂', label: 'Probabilità stimata e frontiera della rete' });
    var t = FA.t, g = FA.g, cw = (FA.x(R) - FA.x(-R)) / NG, i, j, d1 = [], d0 = [];
    for (i = 0; i < NG; i++) for (j = 0; j < NG; j++) {
      var x = [-R + 2 * R * (i + 0.5) / NG, -R + 2 * R * (j + 0.5) / NG], p = S.diverged ? 0.5 : SA.nn.forward(net, x).p, k = Math.min(4, Math.floor(Math.abs(p - 0.5) * 10));
      var r = 'M' + (FA.x(-R) + i * cw).toFixed(1) + ',' + (FA.y(-R) - (j + 1) * cw).toFixed(1) + 'h' + (cw + 0.3).toFixed(1) + 'v' + (cw + 0.3).toFixed(1) + 'h' + (-cw - 0.3).toFixed(1) + 'z';
      (p > 0.5 ? d1 : d0)[k] = ((p > 0.5 ? d1 : d0)[k] || '') + r;
    }
    for (k = 0; k < 5; k++) { if (d0[k]) P.svg('path', { d: d0[k], fill: t.c1, 'fill-opacity': 0.05 + 0.06 * k }, g); if (d1[k]) P.svg('path', { d: d1[k], fill: t.c2, 'fill-opacity': 0.05 + 0.06 * k }, g); }
    var cl = function (v) { return Math.max(-R, Math.min(R, v)); };
    S.tr.X.forEach(function (x, q) { P.marker(g, S.tr.y[q] ? 'tri' : 'circle', FA.x(cl(x[0])), FA.y(cl(x[1])), 7, S.tr.y[q] ? t.c2 : t.c1); });
    S.va.X.forEach(function (x, q) { P.svg('circle', { cx: FA.x(cl(x[0])), cy: FA.y(cl(x[1])), r: 3.6, fill: 'none', stroke: S.va.y[q] ? t.c2 : t.c1, 'stroke-width': 1.6 }, g); });
    var sx = S.tr.X[S.sel]; if (sx) P.svg('circle', { cx: FA.x(cl(sx[0])), cy: FA.y(cl(sx[1])), r: 8, fill: 'none', stroke: t.ink, 'stroke-width': 2.4 }, g);
    P.text(g, FA.m.l + 6, FA.m.t + 13, S.diverged ? 'Divergenza: pesi non finiti (learning rate troppo alto)' : 'epoca ' + S.e + ' di ' + S.E, { fill: S.diverged ? t.c2 : t.ink, 'font-size': 12, 'font-weight': 600 });
  }
  function drawNet() {
    var P = SA.plot, t = SA.theme(), net = S.net, H = net.H, W = 520, Hh = 330, svg, x = S.tr.X[S.sel] || [0, 0], yy = S.tr.y[S.sel];
    figB.innerHTML = ''; svg = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Schema della rete con pesi e passaggio in avanti', 'font-family': t.sans, 'font-size': 11 }, figB);
    if (S.diverged) { P.text(svg, 20, 40, 'Pesi non finiti: riduci il learning rate.', { fill: t.c2, 'font-size': 14 }); return; }
    var f = SA.nn.forward(net, x), dz = f.p - yy, mxw = 0.01, h;
    for (h = 0; h < H; h++) mxw = Math.max(mxw, Math.abs(net.W1[h][0]), Math.abs(net.W1[h][1]), Math.abs(net.W2[h]));
    var xin = [[70, 110], [70, 220]], yh = function (q) { return 40 + (Hh - 80) * (q + 0.5) / H; }, out = [430, Hh / 2];
    var edge = function (x1, y1, x2, y2, w) { P.svg('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: w >= 0 ? t.c2 : t.c1, 'stroke-width': 0.6 + 5 * Math.abs(w) / mxw, 'stroke-opacity': 0.75 }, svg); };
    for (h = 0; h < H; h++) { edge(xin[0][0], xin[0][1], 250, yh(h), net.W1[h][0]); edge(xin[1][0], xin[1][1], 250, yh(h), net.W1[h][1]); edge(250, yh(h), out[0], out[1], net.W2[h]); }
    [['x₁', x[0]], ['x₂', x[1]]].forEach(function (q, i) { P.svg('circle', { cx: xin[i][0], cy: xin[i][1], r: 20, fill: t.card, stroke: t.ink_2, 'stroke-width': 1.5 }, svg); P.text(svg, xin[i][0], xin[i][1] - 26, q[0], { 'text-anchor': 'middle', fill: t.ink_2 }); P.text(svg, xin[i][0], xin[i][1] + 4, SA.fmt(q[1], 2), { 'text-anchor': 'middle', fill: t.ink, 'font-weight': 700 }); });
    for (h = 0; h < H; h++) {
      var v = f.h[h], dh = dz * net.W2[h] * (net.act === 'tanh' ? 1 - v * v : (f.a[h] > 0 ? 1 : 0));
      P.svg('circle', { cx: 250, cy: yh(h), r: 17, fill: v >= 0 ? t.c2 : t.c1, 'fill-opacity': 0.12 + 0.6 * Math.min(1, Math.abs(v)), stroke: t.ink_2 }, svg);
      P.text(svg, 250, yh(h) + 4, SA.fmt(v, 2), { 'text-anchor': 'middle', fill: t.ink, 'font-weight': 600 });
      P.text(svg, 274, yh(h) - 6, 'δ = ' + SA.fmt(dh, 3), { fill: t.accent, 'font-size': 10 });
    }
    P.svg('circle', { cx: out[0], cy: out[1], r: 24, fill: t.c2, 'fill-opacity': 0.12 + 0.7 * f.p, stroke: t.ink_2, 'stroke-width': 1.5 }, svg);
    P.text(svg, out[0], out[1] + 4, 'p = ' + SA.fmt(f.p, 2), { 'text-anchor': 'middle', fill: t.ink, 'font-weight': 700 });
    P.text(svg, out[0], out[1] + 42, 'y = ' + yy + ' · δ = p − y = ' + SA.fmt(dz, 3), { 'text-anchor': 'middle', fill: t.accent, 'font-size': 11 });
    P.text(svg, 250, 18, 'strato nascosto (' + net.act + ')', { 'text-anchor': 'middle', fill: t.ink_3 });
    P.text(svg, 10, Hh - 10, 'spessore = |peso| · arancio/blu = segno · δ = errore propagato all’indietro per questa osservazione', { fill: t.ink_3, 'font-size': 10 });
  }
  function drawLoss() {
    var P = SA.plot, h = S.hist, top = 0; h.tr.concat(h.va).forEach(function (v) { if (isFinite(v)) top = Math.max(top, v); }); top = +(Math.min(5, 1.1 * top) || 1).toPrecision(2);
    var F = P.frame(figC, { W: 720, H: 260, x: [0, S.E], y: [0, top], xlabel: 'epoca', ylabel: 'entropia incrociata', label: 'Perdita di training e di validazione' });
    var t = F.t, g = F.g, path = function (a) { var st = Math.max(1, Math.floor(a.length / 400)), pts = []; for (var i = 0; i < a.length; i += st) pts.push([F.x(i), F.y(Math.min(top, a[i]))]); pts.push([F.x(a.length - 1), F.y(Math.min(top, a[a.length - 1]))]); return P.path(pts); };
    P.svg('path', { d: path(h.tr), fill: 'none', stroke: t.c1, 'stroke-width': 2.4 }, g);
    P.svg('path', { d: path(h.va), fill: 'none', stroke: t.c2, 'stroke-width': 2.4, 'stroke-dasharray': '8 4' }, g);
    var best = 0; h.va.forEach(function (v, i) { if (v < h.va[best]) best = i; });
    P.svg('line', { x1: F.x(best), x2: F.x(best), y1: F.m.t, y2: F.y(0), stroke: t.c3, 'stroke-dasharray': '3 3' }, g);
    P.text(g, F.x(best) + 4, F.m.t + 12, 'minimo in validazione (epoca ' + best + ')', { fill: t.c3, 'font-size': 11 });
  }
  function drawMulti() {
    var P = SA.plot, m = S.multi;
    if (!m) { figD.innerHTML = '<p class="muted" style="padding:12px">Premi il pulsante per addestrare la stessa rete, sugli stessi dati, da ' + SEEDS + ' inizializzazioni diverse.</p>'; return; }
    var ok = m.filter(function (r) { return !r.div; }), top = 0.1; ok.forEach(function (r) { top = Math.max(top, r.tr, r.va); }); top = +(1.1 * top).toPrecision(2);
    var F = P.frame(figD, { W: 720, H: 230, x: [0.5, SEEDS + 0.5], y: [0, top], xlabel: 'inizializzazione (seed ' + (S.iseed + 1) + '…' + (S.iseed + SEEDS) + ')', ylabel: 'perdita finale', label: 'Esiti su inizializzazioni diverse' });
    var t = F.t;
    m.forEach(function (r, i) {
      if (r.div) { P.text(F.g, F.x(i + 1), F.y(top / 2), '✕', { 'text-anchor': 'middle', fill: t.c2 }); return; }
      P.svg('line', { x1: F.x(i + 1), x2: F.x(i + 1), y1: F.y(r.tr), y2: F.y(r.va), stroke: t.rule_2 }, F.g);
      P.marker(F.g, 'circle', F.x(i + 1), F.y(r.tr), 9, t.c1); P.marker(F.g, 'diamond', F.x(i + 1), F.y(r.va), 10, t.c2);
    });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legC.innerHTML = '';
    legA.append(el('span', sw(t.c1, null, 'circle'), 'classe 0'), el('span', sw(t.c2, null, 'tri'), 'classe 1'), el('span', el('i', { style: 'display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid ' + t.ink_2 }), 'validazione'), el('span.muted', 'clic: scegli l’osservazione dello schema'));
    legC.append(el('span', sw(t.c1, null), 'training'), el('span', sw(t.c2, '8 4'), 'validazione'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, h = S.hist, L = h.tr.length - 1, gc = S.diverged ? NaN : SA.nn.gradCheck(S.net, S.tr.X, S.tr.y, S.lambda);
    var m = S.multi, okm = m ? m.filter(function (r) { return !r.div; }) : [], succ = okm.filter(function (r) { return r.ava >= 0.85; }).length;
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Parametri della rete'), el('td', '4H + 1 = ' + SA.nn.nParams(S.H)), el('td', S.tr.X.length + ' osservazioni di training'), el('td', b('exact'))),
      el('tr', el('td', 'Perdita: training · validazione (epoca ' + S.e + ')'), el('td', 'log 2 = 0,693 con p = 0,5 ovunque'), el('td', fmt(h.tr[L], 4) + ' · ' + fmt(h.va[L], 4)), el('td', b('none'))),
      el('tr', el('td', 'Accuratezza: training · validazione'), el('td', '—'), el('td', fmt(h.atr[L], 3) + ' · ' + fmt(h.ava[L], 3)), el('td', b('none'))),
      el('tr', el('td', 'Controllo del gradiente (differenze finite centrali)'), el('td', 'errore relativo ≈ 0 (< 1e−6)'), el('td', isFinite(gc) ? gc.toExponential(1).replace('.', ',').replace('e-', 'e−') : '— (divergenza)'), el('td', b('exact'))),
      el('tr', el('td', 'Stato dell’addestramento'), el('td', 'discesa a lotto intero, η = ' + String(S.eta).replace('.', ',')), el('td', S.diverged ? '✗ divergenza all’epoca ' + S.e : h.tr[L] > h.tr[0] ? 'perdita salita: η probabilmente troppo alto' : '✓ perdita scesa da ' + fmt(h.tr[0], 3)), el('td', b('none'))),
      el('tr', el('td', SEEDS + ' inizializzazioni: accuratezza di validazione ≥ 0,85 · perdita di training min–max'), el('td', 'la perdita non è convessa: esiti diversi'), el('td', m ? succ + ' / ' + SEEDS + ' · ' + (okm.length ? fmt(Math.min.apply(null, okm.map(function (r) { return r.tr; })), 3) + '–' + fmt(Math.max.apply(null, okm.map(function (r) { return r.tr; })), 3) : '—') + (okm.length < m.length ? ' · ' + (m.length - okm.length) + ' divergenze' : '') : 'premi il pulsante'), el('td', b('mc'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.e + ' / ' + S.E), el('span', 'epoche')),
      el('div.kpi', el('b', '2 → ' + S.H + ' → 1'), el('span', 'architettura (' + S.act + ')')),
      el('div.kpi', el('b', fmt(h.va[L] - h.tr[L], 3)), el('span', 'scarto validazione − training: segnale di sovradattamento')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p24-' + Date.now();
    predBox.append(el('p.prose', 'La stessa rete, con gli stessi dati, viene addestrata partendo da pesi iniziali diversi. Che cosa ti aspetti?'),
      el('div.choices', { role: 'radiogroup' }, [['diff', 'Esiti diversi: alcune partenze finiscono in soluzioni peggiori'], ['same', 'Sempre la stessa soluzione: la discesa del gradiente trova il minimo'], ['sym', 'Pesi identici, perché il problema è simmetrico']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'diff' ? '✓ ' : '✗ ') + 'La perdita di una rete neurale non è convessa: ha molti minimi e zone piatte, e la discesa del gradiente si ferma vicino a quello raggiungibile dal punto di partenza. Anche quando l’errore finale è simile, i pesi sono diversi (permutare i neuroni nascosti, o cambiare tutti i segni con tanh, dà la stessa funzione). Prova H = 2 su XOR con il pulsante delle ' + SEEDS + ' inizializzazioni.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Ogni neurone nascosto calcola una combinazione lineare degli ingressi e la trasforma con una funzione non lineare; l’uscita combina i neuroni e passa per la sigmoide, come una regressione logistica sulle variabili create dalla rete. Con abbastanza neuroni si può approssimare qualunque frontiera regolare.</p>' +
      '<p>L’addestramento minimizza l’entropia incrociata con la <strong>discesa del gradiente</strong>; la <strong>backpropagation</strong> calcola il gradiente propagando all’indietro l’errore p − y attraverso i pesi (i δ nello schema). Il controllo con le differenze finite verifica che il gradiente sia giusto.</p>' +
      '<p class="muted">Con un learning rate troppo alto la perdita oscilla o esplode; con molti neuroni, poco rumore e nessuna penalità la perdita di training continua a scendere mentre quella di validazione risale: è il sovradattamento, che si contrasta con la penalità L2 o fermandosi al minimo della validazione. Con η vicino al limite di stabilità (qui già η = 1 su XOR) la traiettoria diventa sensibile agli arrotondamenti: differenze nell’ultima cifra crescono epoca dopo epoca, e anche R e il browser possono separarsi nelle cifre finali.</p>';
  }
  function codeR() {
    var d = S.data;
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 24 — Rete neurale 2 → H → 1 e backpropagation',
      '# R0: stessi dati, stessa suddivisione e stessi pesi iniziali di StatAtlas (R ≥ 3.6).',
      '# R2: stessa discesa del gradiente a lotto intero: stesse perdite a meno dell’arrotondamento.',
      '# R3: nnet o torch usano ottimizzatori e inizializzazioni diversi: confronto di metodo, non stessi pesi.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'n <- ' + S.n + '; sigma <- ' + S.sigma + '; n_val <- ' + Math.round(S.pv * S.n) + '; H <- ' + S.H + '; eta <- ' + S.eta + '; lambda <- ' + S.lambda + '; E <- ' + S.E,
      'set.seed(' + S.seed + ')', 'U <- matrix(runif(2 * n), ncol = 2, byrow = TRUE); Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)',
      d === 'moons' ? 'due <- seq_len(n) > n / 2; t <- pi * U[, 1]\nX0 <- cbind(ifelse(due, 1 - cos(t) - 0.5, cos(t) - 0.5), ifelse(due, 0.5 - sin(t) - 0.25, sin(t) - 0.25)); y <- as.numeric(due)'
        : 'X0 <- 2 * U - 1; y <- as.numeric(' + (d === 'xor' ? 'X0[, 1] * X0[, 2] > 0' : 'X0[, 2] > 0.5 * X0[, 1]') + ')',
      'X <- X0 + sigma * Z                                   # etichetta dai punti puliti, poi rumore', 'id_val <- sample(n, n_val)',
      'Xtr <- X[-id_val, ]; ytr <- y[-id_val]; Xva <- X[id_val, ]; yva <- y[id_val]', '',
      '# Inizializzazione con un seed proprio', 'inizializza <- function(seme) {', '  set.seed(seme); a <- sqrt(6 / (2 + H)); c <- sqrt(6 / (H + 1))',
      '  list(W1 = matrix(runif(2 * H, -a, a), nrow = H, byrow = TRUE), b1 = rep(0, H), W2 = runif(H, -c, c), b2 = 0)', '}',
      S.act === 'tanh' ? 'att <- tanh; datt <- function(A, Hh) 1 - Hh^2' : 'att <- function(A) pmax(A, 0); datt <- function(A, Hh) (A > 0) * 1',
      'avanti <- function(par, X) { A <- sweep(X %*% t(par$W1), 2, par$b1, "+"); Hh <- att(A); list(A = A, H = Hh, z = drop(Hh %*% par$W2) + par$b2) }',
      'bce <- function(z, y) mean(pmax(z, 0) - y * z + log1p(exp(-abs(z))))   # forma stabile',
      'gradiente <- function(par, X, y) {', '  f <- avanti(par, X); dz <- (plogis(f$z) - y) / nrow(X)', '  dA <- outer(dz, par$W2) * datt(f$A, f$H)',
      '  list(W1 = t(dA) %*% X + lambda * par$W1, b1 = colSums(dA), W2 = drop(t(f$H) %*% dz) + lambda * par$W2, b2 = sum(dz))', '}',
      'addestra <- function(par) {', '  storia <- matrix(NA, E + 1, 2, dimnames = list(NULL, c("training", "validazione")))',
      '  storia[1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))',
      '  for (e in seq_len(E)) {', '    g <- gradiente(par, Xtr, ytr); par <- Map(\\(p, d) p - eta * d, par, g)',
      '    storia[e + 1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))', '  }', '  list(par = par, storia = storia)', '}', '',
      '# Controllo del gradiente con differenze finite (all’inizio)', 'par0 <- inizializza(' + S.iseed + ')', 'obiettivo <- function(v) { p <- relist(v, par0); bce(avanti(p, Xtr)$z, ytr) + lambda / 2 * (sum(p$W1^2) + sum(p$W2^2)) }',
      'v0 <- unlist(as.relistable(par0)); num <- sapply(seq_along(v0), \\(k) { h <- replace(numeric(length(v0)), k, 1e-5); (obiettivo(v0 + h) - obiettivo(v0 - h)) / 2e-5 })',
      'max(abs(num - unlist(gradiente(par0, Xtr, ytr)))) / max(abs(num))', '',
      'fit <- addestra(par0)', 'tail(fit$storia, 1)', 'mean((plogis(avanti(fit$par, Xva)$z) > 0.5) == yva)   # accuratezza di validazione', '',
      '# ' + SEEDS + ' inizializzazioni diverse sugli stessi dati', 'esiti <- map_dfr(seq_len(' + SEEDS + '), \\(r) { f <- addestra(inizializza(' + S.iseed + ' + r)); tibble(seed = ' + S.iseed + ' + r, training = f$storia[E + 1, 1], validazione = f$storia[E + 1, 2]) })', 'esiti', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'as_tibble(fit$storia) |> mutate(epoca = 0:E) |> pivot_longer(-epoca, names_to = "insieme", values_to = "perdita") |>', '  ggplot(aes(epoca, perdita, colour = insieme)) + geom_line() + theme_statatlas()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Il modello</h3><div class="eq" data-tex="h = \\varphi(W_1 x + b_1) \\qquad p = \\sigma(w_2^{\\top} h + b_2)"></div><p>φ = tanh o ReLU, σ = sigmoide. La perdita è l’entropia incrociata media −[y log p + (1 − y) log(1 − p)], calcolata in forma stabile a partire da z = w₂ᵀh + b₂, più (λ/2)‖W‖².</p>' +
        '<h3>Backpropagation</h3><p>Per un’osservazione: δ<sub>out</sub> = p − y; ∂ℓ/∂w₂ = δ<sub>out</sub> h; δ<sub>h</sub> = δ<sub>out</sub> w₂ ⊙ φ′(a); ∂ℓ/∂W₁ = δ<sub>h</sub> xᵀ. È la regola della catena applicata strato per strato, dall’uscita verso l’ingresso.</p>' +
        '<h3>Discesa del gradiente</h3><p>θ ← θ − η ∇L(θ), con il gradiente medio su tutto il training (lotto intero). Il learning rate η decide la lunghezza del passo: troppo piccolo è lento, troppo grande oscilla o diverge.</p>' +
        '<div class="callout warn">Una buona accuratezza di training non dice nulla sulla generalizzazione: si guarda la validazione, e il test si tiene da parte (lab 18).</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Non convessità e simmetrie</h3><p>Permutare i neuroni nascosti lascia la funzione invariata, e con tanh anche cambiare il segno di tutti i pesi di un neurone: la perdita ha molte copie di ogni minimo, e tra queste molti punti di sella e regioni piatte.</p>' +
        '<h3>Approssimazione universale</h3><p>Con un solo strato nascosto e abbastanza neuroni una rete approssima qualunque funzione continua su un compatto (Cybenko, 1989; Hornik, 1991): il problema pratico non è l’espressività ma la stima con dati finiti.</p>' +
        '<h3>Regolarizzazione</h3><p>La penalità L2 (weight decay) restringe i pesi verso zero come la ridge del lab 15; l’arresto anticipato al minimo della validazione ha un effetto simile. Varianti dell’ottimizzatore (mini-batch, momento, Adam) cambiano il percorso e spesso la soluzione raggiunta.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { if (multiTask) { multiTask.cancel(); multiTask = null; } run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); if (multiBtn) { multiBtn.disabled = false; multiBtn.textContent = 'Ripeti con ' + SEEDS + ' inizializzazioni'; } }
  function render(full) { drawSurface(); drawLoss(); if (full || run.frame % 5 === 0 || !run.running) { drawNet(); drawMulti(); updateTable(); } }
  function bindClick() {
    figA.addEventListener('pointerdown', function (ev) {
      var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !FA) return;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()), x = FA.x.invert(p.x), y = FA.y.invert(p.y), best = 0, bd = Infinity;
      S.tr.X.forEach(function (q, i) { var dd = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (dd < bd) { bd = dd; best = i; } });
      S.sel = best; drawSurface(); drawNet();
    });
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (lab, key, vals, fmtv, num) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = num === false ? this.value : +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    ctrlBox.append(
      sel('Dati', 'data', Object.keys(DATA), function (k) { return DATA[k]; }, false),
      SA.ui.slider('Rumore σ', { min: 0, max: 0.4, step: 0.02, value: S.sigma, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.sigma = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('Neuroni nascosti H', 'H', [2, 3, 4, 6, 8]), sel('Attivazione', 'act', ['tanh', 'relu'], function (v) { return v === 'tanh' ? 'tanh' : 'ReLU'; }, false),
        sel('Learning rate η', 'eta', [0.03, 0.1, 0.3, 0.5, 1, 3, 10, 30], function (v) { return SA.fmt(v, 2); }), sel('Penalità L2 λ', 'lambda', [0, 0.0001, 0.001, 0.01, 0.1], function (v) { return v ? String(v).replace('.', ',') : '0'; }),
        sel('Epoche', 'E', [500, 2000, 5000]), sel('n', 'n', [60, 200, 400]),
        sel('Quota di validazione', 'pv', [0.3, 0.5], function (v) { return SA.fmt(v, 1); }),
        el('label.field', el('span', 'Seed dei dati'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } })),
        el('label.field', el('span', 'Seed dei pesi'), el('input', { type: 'number', value: S.iseed, min: 1, onchange: function () { S.iseed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un’epoca').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('reti-neurali', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 3, coop: true, step: step, render: render, done: function () { return S.e >= S.E || S.diverged; }, progress: function () { return S.diverged ? 1 : S.e / S.E; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Reti neurali', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Una rete piccola, abbastanza da guardarla per intero: pesi, passaggio in avanti, errore propagato all’indietro, e una frontiera che si piega epoca dopo epoca.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Come impara una piccola rete neurale una relazione non lineare, e perché può sovradattarsi o dare esiti diversi da partenze diverse?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Addestramento epoca per epoca');
      ctrlBox = el('div.panel.controls'); figA = el('div', { style: 'touch-action:none' }); figB = el('div'); figC = el('div'); figD = el('div'); legA = el('div.legend'); legC = el('div.legend');
      multiBtn = SA.ui.button('Ripeti con ' + SEEDS + ' inizializzazioni', { onclick: function () { runMulti(multiBtn); } });
      var two = function (a, b) { return el('div.duo', a, b); };
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        two(el('div.fig', el('div.fig-title', el('h3', 'Frontiera e probabilità stimata'), legA), figA), el('div.fig', el('div.fig-title', el('h3', 'La rete: pesi, passaggio in avanti e δ')), figB)),
        el('div.fig', el('div.fig-title', el('h3', 'Perdita durante l’addestramento'), legC), figC),
        el('div.fig', el('div.fig-title', el('h3', 'Stessa rete, inizializzazioni diverse'), el('div.legend', el('span.muted', '● training · ◆ validazione · ✕ divergenza'))), figD, el('p', { style: 'margin-top:8px' }, multiBtn)),
        el('div.toolbar', SA.ui.button('Perdite CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['epoca', 'training', 'validazione', 'acc_training', 'acc_validazione']]; S.hist.tr.forEach(function (v, i) { rows.push([i, v, S.hist.va[i], S.hist.atr[i], S.hist.ava[i]]); }); SA.ui.download('statatlas_lab24_perdite.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Pesi CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var n = S.net, rows = [['neurone', 'w1', 'w2', 'b1', 'w_out']]; for (var h = 0; h < n.H; h++) rows.push([h + 1, n.W1[h][0], n.W1[h][1], n.b1[h], n.W2[h]]); rows.push(['uscita', '', '', '', n.b2]); SA.ui.download('statatlas_lab24_pesi.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab24.png', ['Rete neurale', DATA[S.data] + ' · H = ' + S.H + ' · ' + S.act + ' · η = ' + S.eta + ' · seed ' + S.seed + '/' + S.iseed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Riferimento'), el('th', 'Risultato'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' verifica esatta'), el('span', SA.ui.badge('mc'), ' su più inizializzazioni'), el('span', SA.ui.badge('none'), ' valore corrente')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Non convessità, approssimazione universale, regolarizzazione (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi pesi, stessa discesa'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab24_rete.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati e pesi iniziali (R0), stessa discesa del gradiente scritta in R (R2); nnet e torch sono un confronto di metodo (R3). Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); bindClick(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); if (multiTask) { multiTask.cancel(); multiTask = null; } document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
