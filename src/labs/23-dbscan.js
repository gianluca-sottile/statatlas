/* StatAtlas · Lab 23 — DBSCAN e confronto tra metodi.
 * Dati in R²: lune, cerchi concentrici, tre gruppi di densità diversa, uniforme (nessun gruppo), più m punti anomali.
 * u = runif(n), Z = rnorm(2n) per righe, anomali = runif(2m, −2,5, 2,5) per righe. DBSCAN animato un punto alla volta,
 * con la stessa convenzione di SA.cluster.dbscan (verificata alla fine); k-means (Lloyd, 10 avvii) e Ward sugli stessi dati. */
(function () {
  var el, S, NE = 40;
  var DATA = {
    moons: { label: 'Due lune', K: 2 }, circles: { label: 'Cerchi concentrici', K: 2 },
    dens: { label: 'Tre gruppi di densità diversa', K: 3 }, unif: { label: 'Uniforme (nessun gruppo vero)', K: 2 }
  };
  function gen(s) {
    var g = s.rng, n = s.n, u = [], X = [], truth = [], i, DC = [[-1, 0, 0.15], [1, 0, 0.5], [0, 1.3, 0.15]];
    for (i = 0; i < n; i++) u.push(g.unif());
    for (i = 0; i < n; i++) {
      var z1 = g.norm(), z2 = g.norm(), x, gr;
      if (s.data === 'moons') { gr = i < n / 2 ? 1 : 2; var t = Math.PI * u[i]; x = gr === 1 ? [Math.cos(t), Math.sin(t)] : [1 - Math.cos(t), 0.5 - Math.sin(t)]; x[0] += s.sigma * z1; x[1] += s.sigma * z2; }
      else if (s.data === 'circles') { gr = i < n / 2 ? 1 : 2; var t2 = 2 * Math.PI * u[i], r = gr === 1 ? 1 : 0.35; x = [r * Math.cos(t2) + s.sigma * z1, r * Math.sin(t2) + s.sigma * z2]; }
      else if (s.data === 'dens') { gr = Math.floor(3 * i / n) + 1; var c = DC[gr - 1]; x = [c[0] + c[2] * z1, c[1] + c[2] * z2]; }
      else { gr = 1; x = [4 * u[i] - 2, 4 * SA.sf.pnorm(z2) - 2]; }
      X.push(x); truth.push(gr);
    }
    for (i = 0; i < s.out; i++) { X.push([-2.5 + 5 * g.unif(), -2.5 + 5 * g.unif()]); truth.push(0); }
    X.forEach(function (x) { x[1] *= s.scale; });
    if (s.std) for (var j = 0; j < 2; j++) { var m = 0, v = 0; X.forEach(function (x) { m += x[j] / X.length; }); X.forEach(function (x) { v += (x[j] - m) * (x[j] - m); }); v = Math.sqrt(v / (X.length - 1)); X.forEach(function (x) { x[j] = (x[j] - m) / v; }); }
    return { X: X, truth: truth };
  }
  function kmeansBest(X, K, g) {
    var CL = SA.cluster, best = null;
    for (var r = 0; r < 10; r++) {
      var C = SA.rs.sample(g, X.length, K).map(function (k) { return X[k - 1].slice(); }), lab = null;
      for (var it = 0; it < 100; it++) { var a = CL.assign(X, C, lab); if (!a.changed && lab) break; lab = a.lab; C = CL.update(X, lab, K, C).C; }
      var w = CL.wcss(X, lab, C); if (!best || w < best.w) best = { w: w, lab: Array.from(lab).map(function (v) { return v + 1; }) };
    }
    return best.lab;
  }
  function newState(prev) {
    var s = { data: 'moons', n: 300, sigma: 0.08, out: 10, eps: 0.2, minPts: 5, scale: 1, std: false, seed: 2026, pred: null, sel: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); var D = gen(s); s.X = D.X; s.truth = D.truth; s.N = s.X.length;
    var CL = SA.cluster; s.nb = CL.neighbors(s.X, s.eps); s.ref = CL.dbscan(s.X, s.eps, s.minPts, s.nb);
    s.K = DATA[s.data].K; s.km = kmeansBest(s.X, s.K, s.rng); s.ward = Array.from(CL.cutree(CL.hclust(s.X, 'ward.D2'), s.K));
    s.kd = CL.kdist(s.X, s.minPts - 1);
    // animazione: stessa procedura di SA.cluster.dbscan, un'operazione per passo
    s.cl = new Int32Array(s.N).fill(-1); s.ptr = 0; s.queue = []; s.qh = 0; s.id = 0; s.last = -1; s.finished = false;
    s.sweep = null;
    return s;
  }
  function step() {
    if (S.finished) return false;
    var core = S.ref.core;
    if (S.qh < S.queue.length) {
      var q = S.queue[S.qh++], L = S.nb[q]; S.last = q;
      for (var k = 0; k < L.length; k++) { var j = L[k]; if (S.cl[j] === -1 || S.cl[j] === 0) { var fresh = S.cl[j] === -1; S.cl[j] = S.id; if (core[j] && fresh) S.queue.push(j); } }
      return true;
    }
    while (S.ptr < S.N && S.cl[S.ptr] !== -1) S.ptr++;
    if (S.ptr >= S.N) { S.finished = true; S.last = -1; return false; }
    var i = S.ptr; S.last = i;
    if (!core[i]) S.cl[i] = 0; else { S.cl[i] = ++S.id; S.queue = [i]; S.qh = 0; }
    return true;
  }
  function sweep() { // ARI, quota di rumore e silhouette al variare di ε (minPts fisso)
    if (S.sweep) return S.sweep;
    var CL = SA.cluster, mx = S.kd[S.kd.length - 1] * 1.05, out = [];
    for (var i = 1; i <= NE; i++) {
      var e = mx * i / NE, r = CL.dbscan(S.X, e, S.minPts), noise = 0; for (var q = 0; q < S.N; q++) if (!r.cl[q]) noise++;
      out.push({ eps: e, ari: CL.ari(Array.from(r.cl), S.truth), noise: noise / S.N, k: r.k });
    }
    return (S.sweep = out);
  }

  /* ---------- grafici ---------- */
  var figA, figB, figC = [], figD, legA, legD, FA;
  function cols(t) { return [t.c1, t.c2, t.c3, t.accent, t.c4 || t.ink_2]; }
  function lims() { var a = [Infinity, -Infinity, Infinity, -Infinity]; S.X.forEach(function (x) { a[0] = Math.min(a[0], x[0]); a[1] = Math.max(a[1], x[0]); a[2] = Math.min(a[2], x[1]); a[3] = Math.max(a[3], x[1]); }); var px = 0.06 * (a[1] - a[0]), py = 0.06 * (a[3] - a[2]); return [[+(a[0] - px).toFixed(2), +(a[1] + px).toFixed(2)], [+(a[2] - py).toFixed(2), +(a[3] + py).toFixed(2)]]; }
  function drawMain() {
    var P = SA.plot, L = lims(), cl = S.cl, core = S.ref.core;
    FA = P.frame(figA, { W: 720, H: 460, x: L[0], y: L[1], xlabel: S.std ? 'z₁' : 'x₁', ylabel: S.std ? 'z₂' : 'x₂' + (S.scale !== 1 ? ' (× ' + S.scale + ')' : ''), label: 'DBSCAN: espansione per densità' });
    var t = FA.t, g = FA.g, cc = cols(t), un = [], noi = '';
    var sx = (FA.x(L[0][0] + S.eps) - FA.x(L[0][0])), sy = (FA.y(L[1][0]) - FA.y(L[1][0] + S.eps));
    if (S.last >= 0) P.svg('ellipse', { cx: FA.x(S.X[S.last][0]), cy: FA.y(S.X[S.last][1]), rx: sx, ry: sy, fill: t.accent, 'fill-opacity': 0.08, stroke: t.accent, 'stroke-width': 1.5 }, g);
    S.X.forEach(function (x, i) {
      var px = FA.x(x[0]), py = FA.y(x[1]);
      if (cl[i] === -1) un.push([px, py]);
      else if (cl[i] === 0) noi += 'M' + (px - 3.5) + ',' + (py - 3.5) + 'l7,7m-7,0l7,-7';
      else P.svg('circle', { cx: px, cy: py, r: core[i] ? 4.2 : 2.8, fill: cc[(cl[i] - 1) % cc.length], 'fill-opacity': core[i] ? 0.85 : 0.5, stroke: core[i] ? 'none' : cc[(cl[i] - 1) % cc.length] }, g);
    });
    P.dots(g, un, 2.4, t.rule_2, 0.9);
    if (noi) P.svg('path', { d: noi, stroke: t.ink_3, 'stroke-width': 1.4 }, g);
    if (S.sel != null && S.sel < S.N) {
      var p = S.X[S.sel], nn = S.nb[S.sel].length;
      P.svg('ellipse', { cx: FA.x(p[0]), cy: FA.y(p[1]), rx: sx, ry: sy, fill: 'none', stroke: t.ink, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, g);
      P.text(g, FA.x(p[0]) + sx + 4, FA.y(p[1]), nn + ' punti entro ε → ' + (S.ref.core[S.sel] ? 'core' : S.ref.cl[S.sel] ? 'bordo' : 'rumore'), { fill: t.ink, 'font-size': 12, 'font-weight': 700 });
    }
    var done = 0; for (var i = 0; i < S.N; i++) if (cl[i] !== -1) done++;
    P.text(g, FA.m.l + 6, FA.m.t + 13, (S.finished ? 'Completato: ' : 'In corso: ') + S.id + ' cluster · ' + done + ' / ' + S.N + ' punti esaminati' + (S.qh < S.queue.length ? ' · coda di espansione: ' + (S.queue.length - S.qh) : ''), { fill: t.ink, 'font-size': 12, 'font-weight': 600 });
  }
  function drawKdist() {
    var P = SA.plot, kd = S.kd, n = kd.length, top = +(kd[n - 1] * 1.05).toPrecision(2);
    var F = P.frame(figB, { W: 520, H: 260, x: [0, n], y: [0, top], xlabel: 'punti ordinati', ylabel: 'distanza dal ' + (S.minPts - 1) + '° vicino', label: 'Grafico delle k-distanze' });
    var t = F.t, g = F.g, nc = 0; kd.forEach(function (v) { if (v <= S.eps) nc++; });
    P.svg('path', { d: P.path(kd.map(function (v, i) { return [F.x(i + 1), F.y(v)]; })), fill: 'none', stroke: t.c1, 'stroke-width': 2.2 }, g);
    P.svg('line', { x1: F.x(0), x2: F.x(n), y1: F.y(Math.min(top, S.eps)), y2: F.y(Math.min(top, S.eps)), stroke: t.accent, 'stroke-width': 1.8, 'stroke-dasharray': '6 3' }, g);
    P.text(g, F.m.l + 6, F.y(Math.min(top, S.eps)) - 6, 'ε = ' + SA.fmt(S.eps, 2) + ': ' + nc + ' punti core (' + SA.fmt(100 * nc / n, 0) + '%)', { fill: t.accent, 'font-size': 11.5 });
  }
  function drawCompare() {
    var CL = SA.cluster, L = lims(), sets = [['k-means (K = ' + S.K + ')', S.km], ['Ward (K = ' + S.K + ')', S.ward], ['DBSCAN', Array.from(S.ref.cl)]];
    sets.forEach(function (q, k) {
      var P = SA.plot, F = P.frame(figC[k], { W: 340, H: 320, m: { t: 30, r: 8, b: 34, l: 36 }, x: L[0], y: L[1], xlabel: '', ylabel: '', label: q[0] }), t = F.t, cc = cols(t), noi = '';
      q[1].forEach(function (c, i) { var px = F.x(S.X[i][0]), py = F.y(S.X[i][1]); if (c === 0) noi += 'M' + (px - 3) + ',' + (py - 3) + 'l6,6m-6,0l6,-6'; else P.svg('circle', { cx: px, cy: py, r: 2.6, fill: cc[(c - 1) % cc.length], 'fill-opacity': 0.75 }, F.g); });
      if (noi) P.svg('path', { d: noi, stroke: t.ink_3, 'stroke-width': 1.2 }, F.g);
      P.text(F.g, F.m.l, 18, q[0] + ' · ARI ' + SA.fmt(CL.ari(q[1], S.truth), 2), { fill: t.ink, 'font-size': 12.5, 'font-weight': 700 });
    });
  }
  function drawSweep() {
    var P = SA.plot, sw = sweep(), mx = sw[sw.length - 1].eps, CL = SA.cluster;
    var F = P.frame(figD, { W: 520, H: 260, x: [0, +mx.toPrecision(2)], y: [-0.05, 1], xlabel: 'ε (minPts = ' + S.minPts + ')', ylabel: 'valore', label: 'ARI e quota di rumore al variare di ε' });
    var t = F.t, g = F.g;
    [[CL.ari(S.km, S.truth), t.c1, 'k-means'], [CL.ari(S.ward, S.truth), t.c3, 'Ward']].forEach(function (q) { P.svg('line', { x1: F.x(0), x2: F.x(mx), y1: F.y(q[0]), y2: F.y(q[0]), stroke: q[1], 'stroke-dasharray': '3 3', 'stroke-width': 1.4 }, g); P.text(g, F.x(mx) - 4, F.y(q[0]) - 4, q[2], { 'text-anchor': 'end', fill: q[1], 'font-size': 11 }); });
    P.svg('path', { d: P.path(sw.map(function (r) { return [F.x(r.eps), F.y(r.ari)]; })), fill: 'none', stroke: t.accent, 'stroke-width': 2.6 }, g);
    P.svg('path', { d: P.path(sw.map(function (r) { return [F.x(r.eps), F.y(r.noise)]; })), fill: 'none', stroke: t.ink_3, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
    P.svg('line', { x1: F.x(Math.min(mx, S.eps)), x2: F.x(Math.min(mx, S.eps)), y1: F.m.t, y2: F.y(-0.05), stroke: t.ink, 'stroke-dasharray': '2 3' }, g);
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legD.innerHTML = '';
    legA.append(el('span', sw(t.c1, null, 'circle'), 'core (pieno)'), el('span', el('i', { style: 'display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid ' + t.c1 + ';opacity:.7' }), 'bordo'), el('span', '✕ rumore'), el('span', sw(t.rule_2, null, 'circle'), 'non ancora esaminato'), el('span.muted', 'clic su un punto: il suo intorno ε'));
    legD.append(el('span', sw(t.accent, null), 'ARI di DBSCAN'), el('span', sw(t.ink_3, '7 4'), 'quota di rumore'), el('span', sw(t.c1, '3 3'), 'ARI k-means'), el('span', sw(t.c3, '3 3'), 'ARI Ward'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, CL = SA.cluster, r = S.ref, core = 0, border = 0, noise = 0, contested = 0, i;
    for (i = 0; i < S.N; i++) {
      if (r.core[i]) core++; else if (r.cl[i]) border++; else noise++;
      if (!r.core[i] && r.cl[i]) { var set = {}; S.nb[i].forEach(function (j) { if (r.core[j]) set[r.cl[j]] = 1; }); if (Object.keys(set).length > 1) contested++; }
    }
    var same = true; if (S.finished) for (i = 0; i < S.N; i++) if (S.cl[i] !== r.cl[i]) same = false;
    var okDef = true; for (i = 0; i < S.N; i++) { var hasCore = S.nb[i].some(function (j) { return r.core[j]; }); if (r.core[i] && r.cl[i] < 1) okDef = false; if (!r.cl[i] && hasCore) okDef = false; }
    var db = Array.from(r.cl), trueN = S.truth.filter(function (v) { return v === 0; }).length, caught = 0; S.truth.forEach(function (v, q) { if (v === 0 && db[q] === 0) caught++; });
    var sil = function (lab, s0) { var v = CL.silhouette(S.X, lab, s0); return isFinite(v) ? fmt(v, 3) : '—'; };
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Cluster trovati · punti core · bordo · rumore'), el('td', S.data === 'unif' ? 'nessun gruppo vero' : DATA[S.data].K + ' popolazioni'), el('td', r.k + ' · ' + core + ' · ' + border + ' · ' + noise), el('td', b('none'))),
      el('tr', el('td', 'Accordo con le popolazioni (ARI): k-means · Ward · DBSCAN'), el('td', '1 = stessa partizione (anomali = gruppo a parte, rumore = gruppo a parte)'), el('td', fmt(CL.ari(S.km, S.truth), 3) + ' · ' + fmt(CL.ari(S.ward, S.truth), 3) + ' · ' + fmt(CL.ari(db, S.truth), 3)), el('td', b('none'))),
      el('tr', el('td', 'Silhouette media: k-means · Ward · DBSCAN (rumore escluso)'), el('td', 'alta = gruppi compatti e separati'), el('td', sil(S.km) + ' · ' + sil(S.ward) + ' · ' + sil(db, true)), el('td', b('none'))),
      el('tr', el('td', 'Punti anomali generati riconosciuti come rumore'), el('td', String(trueN)), el('td', trueN ? caught + ' / ' + trueN : '—'), el('td', b('none'))),
      el('tr', el('td', 'Punti di bordo contesi tra più cluster'), el('td', 'assegnati al primo cluster che li raggiunge'), el('td', String(contested)), el('td', b('exact'))),
      el('tr', el('td', 'Controlli DBSCAN'), el('td', 'core in un cluster; il rumore non ha core entro ε; animazione = procedura di riferimento'), el('td', (okDef ? '✓' : '✗') + ' · ' + (S.finished ? (same ? '✓ stesse etichette' : '✗ etichette diverse') : 'animazione in corso')), el('td', b('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', 'ε = ' + fmt(S.eps, 2) + ' · minPts = ' + S.minPts), el('span', 'parametri di DBSCAN')),
      el('div.kpi', el('b', String(S.N)), el('span', 'punti, di cui ' + S.out + ' anomali')),
      el('div.kpi', el('b', String(r.k)), el('span', 'cluster di DBSCAN (k-means e Ward ne cercano ' + S.K + ')')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p23-' + Date.now();
    predBox.append(el('p.prose', 'Due lune intrecciate: con K = 2, che cosa fa k-means, e che cosa fa DBSCAN con un ε ragionevole?'),
      el('div.choices', { role: 'radiogroup' }, [['db', 'k-means taglia le lune con una retta; DBSCAN segue le lune e isola gli anomali'], ['km', 'Entrambi trovano le due lune'], ['none', 'Nessuno dei due: le lune si toccano']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'db' ? '✓ ' : '✗ ') + 'k-means divide il piano in regioni convesse (celle di Voronoi dei centri): non può seguire una forma a mezzaluna. DBSCAN unisce punti collegati da catene di punti densi, qualunque sia la forma, e lascia fuori i punti isolati. Ma prova ε = 0,08 o 0,5: con ε troppo piccolo tutto diventa rumore, con ε troppo grande le lune si fondono.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>DBSCAN definisce i cluster come regioni <strong>dense</strong>: un punto è <em>core</em> se entro distanza ε ci sono almeno minPts punti (lui compreso); i core vicini tra loro formano un cluster, i punti vicini a un core ma non core sono di <em>bordo</em>, gli altri sono <em>rumore</em>. Non serve scegliere il numero di gruppi, e i gruppi possono avere qualunque forma.</p>' +
      '<p>Il prezzo è la scelta di ε e minPts, e una sola ε non va bene per gruppi con densità molto diverse: prova il terzo insieme di dati. Le scale contano come in k-means: moltiplicare x₂ per 3 cambia le distanze e quindi gli intorni.</p>' +
      '<p class="muted">I punti core e il rumore non dipendono dall’ordine dei dati; un punto di bordo vicino a due cluster va al primo che lo raggiunge, quindi può cambiare cluster se si riordinano i dati. Su dati uniformi tutti i metodi restituiscono comunque qualcosa: un cluster trovato non è una prova di struttura.</p>';
  }
  function codeR() {
    var d = S.data;
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 23 — DBSCAN e confronto tra metodi',
      '# R0: stessi dati di StatAtlas (stesso seed). R2: DBSCAN didattico con la stessa convenzione',
      '#     (punti in ordine di indice, espansione FIFO, bordo al primo cluster che lo raggiunge) → stesse etichette.',
      '# R3: dbscan::dbscan() usa un altro ordine di visita: core e rumore coincidono, i bordi contesi possono differire.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; sigma <- ' + S.sigma + '; m <- ' + S.out + '; eps <- ' + S.eps + '; minPts <- ' + S.minPts + '; K <- ' + S.K,
      'u <- runif(n); Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)',
      d === 'moons' ? 'gruppo <- rep(1:2, each = n / 2); t <- pi * u\nX <- ifelse(gruppo == 1, 1, 0) * cbind(cos(t), sin(t)) + ifelse(gruppo == 2, 1, 0) * cbind(1 - cos(t), 0.5 - sin(t)) + sigma * Z'
        : d === 'circles' ? 'gruppo <- rep(1:2, each = n / 2); t <- 2 * pi * u; r <- ifelse(gruppo == 1, 1, 0.35)\nX <- cbind(r * cos(t), r * sin(t)) + sigma * Z'
        : d === 'dens' ? 'gruppo <- rep(1:3, each = n / 3)\ncentri <- rbind(c(-1, 0), c(1, 0), c(0, 1.3)); sdg <- c(0.15, 0.5, 0.15)\nX <- centri[gruppo, ] + sdg[gruppo] * Z'
        : 'gruppo <- rep(1, n)\nX <- cbind(4 * u - 2, 4 * pnorm(Z[, 2]) - 2)',
      'X <- rbind(X, matrix(runif(2 * m, -2.5, 2.5), ncol = 2, byrow = TRUE)); gruppo <- c(gruppo, rep(0, m))   # anomali = 0',
      'X[, 2] <- ' + S.scale + ' * X[, 2]', S.std ? 'X <- scale(X)' : '# (nessuna standardizzazione)', '',
      '# DBSCAN didattico', 'dbscan_did <- function(X, eps, minPts) {', '  D <- as.matrix(dist(X)); n <- nrow(X)', '  vic <- lapply(seq_len(n), \\(i) which(D[i, ] <= eps))   # i compreso, in ordine di indice',
      '  core <- lengths(vic) >= minPts; cl <- rep(NA_integer_, n); id <- 0L', '  for (i in seq_len(n)) {', '    if (!is.na(cl[i])) next', '    if (!core[i]) { cl[i] <- 0L; next }                     # rumore provvisorio',
      '    id <- id + 1L; cl[i] <- id; coda <- i', '    while (length(coda)) {', '      q <- coda[1]; coda <- coda[-1]',
      '      for (j in vic[[q]]) if (is.na(cl[j]) || cl[j] == 0L) { nuovo <- is.na(cl[j]); cl[j] <- id; if (core[j] && nuovo) coda <- c(coda, j) }', '    }', '  }',
      '  list(cluster = cl, core = core)', '}', 'db <- dbscan_did(X, eps, minPts)', 'table(tipo = ifelse(db$core, "core", ifelse(db$cluster > 0, "bordo", "rumore")))', '',
      '# Confronto con k-means (Lloyd, 10 avvii) e Ward sugli stessi dati', 'km <- kmeans(X, centers = K, nstart = 10, algorithm = "Lloyd", iter.max = 100)', 'ward <- cutree(hclust(dist(X), method = "ward.D2"), k = K)',
      'ari <- function(a, b) {', '  tab <- table(a, b); c2 <- function(x) sum(choose(x, 2))', '  e <- c2(rowSums(tab)) * c2(colSums(tab)) / choose(length(a), 2); mm <- (c2(rowSums(tab)) + c2(colSums(tab))) / 2', '  (c2(tab) - e) / (mm - e)', '}',
      'c(kmeans = ari(km$cluster, gruppo), ward = ari(ward, gruppo), dbscan = ari(db$cluster, gruppo))',
      'library(cluster)   # silhouette (pacchetto incluso nelle installazioni standard di R)', 'nr <- db$cluster > 0',
      'c(kmeans = mean(silhouette(km$cluster, dist(X))[, 3]), ward = mean(silhouette(ward, dist(X))[, 3]),', '  dbscan = mean(silhouette(db$cluster[nr], dist(X[nr, ]))[, 3]))', '',
      '# Grafico delle k-distanze e confronto di metodo (R3)', 'kd <- sort(apply(as.matrix(dist(X)), 1, \\(d) sort(d)[minPts]))   # minPts-esimo incluso il punto = (minPts − 1)-esimo vicino',
      'plot(kd, type = "l", ylab = "k-distanza"); abline(h = eps, lty = 2)', '# library(dbscan); dbscan::dbscan(X, eps = eps, minPts = minPts)', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Definizioni</h3><p>N<sub>ε</sub>(x) = punti a distanza ≤ ε da x (x compreso). x è <strong>core</strong> se |N<sub>ε</sub>(x)| ≥ minPts. y è <em>raggiungibile per densità</em> da x se esiste una catena di core x = p₁, …, p<sub>m</sub> con p<sub>i+1</sub> ∈ N<sub>ε</sub>(pᵢ) e y ∈ N<sub>ε</sub>(p<sub>m</sub>). Un cluster è un insieme massimale di punti connessi per densità; i punti non raggiungibili da nessun core sono rumore.</p>' +
        '<h3>Algoritmo</h3><p>Si visita ogni punto; da un core non ancora assegnato parte un nuovo cluster, che si espande aggiungendo i vicini e, se core, i loro vicini. È la costruzione animata nel grafico principale.</p>' +
        '<h3>Scegliere ε e minPts</h3><p>Il grafico delle k-distanze (k = minPts − 1) ordina le distanze dal k-esimo vicino: un ginocchio suggerisce ε. minPts cresce con la dimensione (regola pratica: almeno p + 1, spesso 2p).</p>' +
        '<div class="callout warn">I punti di bordo vicini a due cluster sono assegnati in base all’ordine di visita: core e rumore sono ben definiti, i bordi contesi no.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Densità variabili</h3><p>Una sola soglia ε non può separare un gruppo molto concentrato da uno diffuso senza spezzare il secondo o fondere i primi. OPTICS e HDBSCAN considerano tutti gli ε insieme e costruiscono una gerarchia di cluster per densità.</p>' +
        '<h3>Collegamento con il legame singolo</h3><p>Con minPts = 2 tutti i punti con almeno un vicino sono core, e i cluster sono le componenti connesse del grafo ε: è il taglio a quota ε del dendrogramma a legame singolo.</p>' +
        '<h3>Valutare un clustering</h3><p>Indici interni (silhouette, Calinski–Harabasz) premiano forme compatte e sferiche e penalizzano DBSCAN sulle lune anche quando trova le forme giuste; indici esterni (ARI) richiedono le classi vere, disponibili solo in simulazione o in casi annotati.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { var sel = S.sel; run.stop(); S = newState(S); S.sel = sel != null && sel < S.N ? sel : null; legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { drawMain(); if (full || run.frame % 4 === 0 || !run.running) { drawKdist(); drawCompare(); drawSweep(); updateTable(); } }
  function bindClick() {
    figA.addEventListener('pointerdown', function (ev) {
      var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !FA) return;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()), x = FA.x.invert(p.x), y = FA.y.invert(p.y), best = 0, bd = Infinity;
      S.X.forEach(function (q, i) { var dd = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (dd < bd) { bd = dd; best = i; } });
      S.sel = best; drawMain();
    });
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (lab, key, vals, fmtv, num) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = num === false ? this.value : +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    ctrlBox.append(
      sel('Dati', 'data', Object.keys(DATA), function (k) { return DATA[k].label; }, false),
      SA.ui.slider('Raggio ε', { min: 0.04, max: 1, step: 0.01, value: S.eps, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.eps = v; restart(); } }),
      SA.ui.slider('minPts (punto compreso)', { min: 2, max: 20, step: 1, value: S.minPts, format: function (v) { return String(v); }, onchange: function (v) { S.minPts = v; restart(); } }),
      SA.ui.slider('Rumore attorno alle forme σ', { min: 0.02, max: 0.3, step: 0.01, value: S.sigma, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.sigma = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n', 'n', [150, 300, 600]), sel('Punti anomali', 'out', [0, 10, 30]), sel('Scala di x₂', 'scale', [1, 3], function (v) { return '× ' + v; }),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      el('label.field', { style: 'flex-direction:row;display:flex;gap:8px;align-items:center' }, el('input', { type: 'checkbox', checked: S.std, onchange: function () { S.std = this.checked; restart(); } }), el('span', 'Standardizza le variabili')));
    run.controls('Un passo dell’espansione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('dbscan', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 2, step: step, render: render, done: function () { return S.finished; }, progress: function () { var d = 0; for (var i = 0; i < S.N; i++) if (S.cl[i] !== -1) d++; return S.finished ? 1 : d / S.N; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('DBSCAN', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Gruppi come regioni dense separate da zone vuote: forme qualunque, nessun K da scegliere, e un’etichetta onesta per i punti che non appartengono a nessuno.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Che cosa fare quando i gruppi non sono sferici, e che cosa consideriamo rumore?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Espansione per densità e confronto');
      ctrlBox = el('div.panel.controls'); figA = el('div', { style: 'touch-action:none' }); figB = el('div'); figC = [el('div'), el('div'), el('div')]; figD = el('div'); legA = el('div.legend'); legD = el('div.legend');
      var two = function (a, b) { return el('div.duo', a, b); };
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'DBSCAN passo dopo passo'), legA), figA),
        two(el('div.fig', el('div.fig-title', el('h3', 'Scegliere ε: k-distanze')), figB), el('div.fig', el('div.fig-title', el('h3', 'Sensibilità a ε'), legD), figD)),
        el('div.fig', el('div.fig-title', el('h3', 'Tre metodi sugli stessi dati'), el('div.legend', el('span.muted', '✕ = rumore di DBSCAN'))), el('div.trio', figC[0], figC[1], figC[2])),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['x1', 'x2', 'popolazione', 'dbscan', 'core', 'kmeans', 'ward']]; S.X.forEach(function (x, i) { rows.push([x[0], x[1], S.truth[i], S.ref.cl[i], S.ref.core[i], S.km[i], S.ward[i]]); }); SA.ui.download('statatlas_lab23_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figD.querySelector('svg')], 'statatlas_lab23.png', ['DBSCAN', DATA[S.data].label + ' · ε = ' + S.eps + ' · minPts = ' + S.minPts + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Riferimento'), el('th', 'Risultato'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' proprietà verificata'), el('span', SA.ui.badge('none'), ' valore sui dati correnti')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Densità variabili, legame singolo, valutazione (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'DBSCAN didattico e confronto'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab23_dbscan.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati (R0) e stesso DBSCAN con la stessa convenzione di visita (R2); kmeans (Lloyd) e hclust come nel lab 22; dbscan::dbscan come confronto (R3). Richiede R ≥ 3.6, tidyverse e cluster.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); bindClick(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
