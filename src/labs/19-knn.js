/* StatAtlas · Lab 19 — k vicini più prossimi e classificazione.
 * Due classi equiprobabili (n/2 ciascuna) in R²: scenario lineare (normali con medie ±δ/2 sull'asse x₁) o XOR
 * (miscela di quattro normali): regola ed errore di Bayes noti in forma chiusa. Vicini con SA.ml.nearest
 * (a parità di distanza vince l'indice minore, come order() in R); k dispari, quindi nessuna parità nei voti. */
(function () {
  var el, S, NT = 500, NG = 46;
  var SC = {
    lin: { label: 'Due normali (frontiera di Bayes lineare)', bayes: function (d) { return SA.sf.pnorm(-d / 2); } },
    xor: { label: 'XOR: miscela di quattro normali', bayes: function (d) { return 2 * SA.sf.pnorm(d / 2) * SA.sf.pnorm(-d / 2); } }
  };
  /* errore asintotico del vicino più prossimo (Cover e Hart): E[2η(1 − η)] = ∫ f₀f₁/(f₀ + f₁), per quadratura */
  function asym1nn() {
    var a = S.delta / 2, ph = function (u) { return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI); }, h, i, j, s = 0, M = S.sc === 'lin' ? 4000 : 400, L = a + 8;
    h = 2 * L / M;
    if (S.sc === 'lin') { for (i = 0; i < M; i++) { var x = -L + (i + 0.5) * h, f0 = ph(x + a), f1 = ph(x - a); if (f0 + f1 > 0) s += f0 * f1 / (f0 + f1) * h; } return s; }
    for (i = 0; i < M; i++) for (j = 0; j < M; j++) {
      var x1 = -L + (i + 0.5) * h, x2 = -L + (j + 0.5) * h, p1 = 0.5 * (ph(x1 - a) * ph(x2 - a) + ph(x1 + a) * ph(x2 + a)), p0 = 0.5 * (ph(x1 - a) * ph(x2 + a) + ph(x1 + a) * ph(x2 - a));
      if (p0 + p1 > 0) s += p0 * p1 / (p0 + p1) * h * h;
    }
    return s;
  }
  function lcosh(u) { u = Math.abs(u); return u + Math.log1p(Math.exp(-2 * u)) - Math.LN2; }
  function post1(x1, x2) { // P(Y = 1 | x) vera, nelle coordinate originali
    var a = S.delta / 2, z2 = x2 / S.scale;
    if (S.sc === 'lin') return 1 / (1 + Math.exp(-S.delta * x1));
    var l1 = lcosh(a * (x1 + z2)), l0 = lcosh(a * (x1 - z2)); return 1 / (1 + Math.exp(l0 - l1));
  }
  function gen(g, n) {
    var y = [], s = [], X = [], i, a = S.delta / 2;
    for (i = 0; i < n; i++) y.push(i < n / 2 ? 0 : 1);
    for (i = 0; i < n; i++) s.push(g.unif() < 0.5 ? -1 : 1);
    for (i = 0; i < n; i++) {
      var z1 = g.norm(), z2 = g.norm(), x1, x2;
      if (S.sc === 'lin') { x1 = (y[i] ? a : -a) + z1; x2 = z2; } else { x1 = s[i] * a + z1; x2 = s[i] * (y[i] ? 1 : -1) * a + z2; }
      X.push([x1, S.scale * x2]);
    }
    return { X: X, y: y };
  }
  function newState(prev) {
    var s = { sc: 'lin', delta: 2, n: 100, kShow: 15, scale: 1, std: true, B: 100, seed: 2026, q: [0.6, 0.4], pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.kmax = Math.min(99, s.n - 1); if (s.kmax % 2 === 0) s.kmax--; // il più grande k dispari ≤ n − 1
    s.kVals = []; for (var k2 = 1; k2 <= s.kmax; k2 += 2) s.kVals.push(k2);
    if (s.kShow > s.kmax) s.kShow = s.kmax;
    s.rng = new SA.RRNG(s.seed); s.k = 0; var L = s.kVals.length; var S0 = S; S = s; s.r1nn = asym1nn(); S = S0;
    s.sum = { tr: new Float64Array(L), loo: new Float64Array(L), te: new Float64Array(L) };
    s.cntK = new Uint32Array(L); s.teAtLoo = new Float64Array(s.B); s.teAtShow = new Float64Array(s.B);
    return s;
  }
  function ki(k) { return (k - 1) / 2; }
  function step() {
    if (S.k >= S.B) return false;
    var g = S.rng, tr = gen(g, S.n), te = gen(g, NT), L = S.kVals.length, K = S.kmax, i, r;
    var sc = S.std ? SA.ml.scaler(tr.X) : null, Ztr = sc ? sc.apply(tr.X) : tr.X, Zte = sc ? sc.apply(te.X) : te.X;
    var eTr = new Float64Array(L), eLoo = new Float64Array(L), eTe = new Float64Array(L), conf = [0, 0, 0, 0];
    for (i = 0; i < S.n; i++) {
      var nb = SA.ml.nearest(Ztr, Ztr[i], K, i).idx, cum = new Float64Array(nb.length + 1);
      for (var j = 0; j < nb.length; j++) cum[j + 1] = cum[j] + tr.y[nb[j]];
      for (r = 0; r < L; r++) { // leave-one-out: k vicini senza sé; training: sé più i k − 1 vicini
        var k = S.kVals[r];
        if ((cum[k] > k / 2 ? 1 : 0) !== tr.y[i]) eLoo[r]++;
        if ((tr.y[i] + cum[k - 1] > k / 2 ? 1 : 0) !== tr.y[i]) eTr[r]++;
      }
    }
    var rs = ki(S.kShow);
    for (i = 0; i < NT; i++) {
      var pv = SA.ml.votePath(SA.ml.nearest(Ztr, Zte[i], K).idx, tr.y, S.kVals);
      for (r = 0; r < L; r++) if (pv[r] !== te.y[i]) eTe[r]++;
      conf[2 * te.y[i] + pv[rs]]++; // [vero 0 prev 0, vero 0 prev 1, vero 1 prev 0, vero 1 prev 1]
    }
    var best = 0;
    for (r = 0; r < L; r++) { eTr[r] /= S.n; eLoo[r] /= S.n; eTe[r] /= NT; if (eLoo[r] < eLoo[best]) best = r; S.sum.tr[r] += eTr[r]; S.sum.loo[r] += eLoo[r]; S.sum.te[r] += eTe[r]; }
    S.cntK[best]++; S.teAtLoo[S.k] = eTe[best]; S.teAtShow[S.k] = eTe[rs];
    S.cur = { tr: tr, Ztr: Ztr, sc: sc, eTr: eTr, eLoo: eLoo, eTe: eTe, best: best, conf: conf, kConf: S.kShow };
    S.cur.grid = null;
    S.k++; return true;
  }
  /* quando cambia il k mostrato si ricalcola solo la matrice di confusione della replica corrente */
  function avg(key) { var k = Math.max(1, S.k); return Array.prototype.map.call(S.sum[key], function (v) { return v / k; }); }
  function meanOf(a, k) { var s = 0; for (var i = 0; i < k; i++) s += a[i]; return k ? s / k : NaN; }
  function seOf(a, k) { var m = meanOf(a, k), s = 0; for (var i = 0; i < k; i++) s += (a[i] - m) * (a[i] - m); return k > 1 ? Math.sqrt(s / (k - 1) / k) : NaN; }
  function toZ(p) { return S.cur.sc ? S.cur.sc.apply([p])[0] : p; }
  function queryVote() { var nb = SA.ml.nearest(S.cur.Ztr, toZ(S.q), S.kShow).idx, s = 0; for (var i = 0; i < nb.length; i++) s += S.cur.tr.y[nb[i]]; return { idx: nb, ones: s }; }

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, legA, legB, legD, FA;
  function ranges() { var r1 = S.delta / 2 + 3; return [[-r1, r1], [-r1 * S.scale, r1 * S.scale]]; }
  function drawMap() {
    var P = SA.plot, a = S.cur, R = ranges();
    FA = P.frame(figA, { W: 720, H: 520, x: R[0], y: R[1], xlabel: 'x₁', ylabel: 'x₂' + (S.scale !== 1 ? ' (scala × ' + S.scale + ')' : ''), label: 'Regioni di classificazione kNN, frontiera di Bayes e punto interrogato' });
    var t = FA.t, g = FA.g, i, j;
    if (!a.grid || a.grid.k !== S.kShow) { // regioni kNN su una griglia NG × NG
      var cells = new Uint8Array(NG * NG);
      for (i = 0; i < NG; i++) for (j = 0; j < NG; j++) {
        var p = [R[0][0] + (R[0][1] - R[0][0]) * (i + 0.5) / NG, R[1][0] + (R[1][1] - R[1][0]) * (j + 0.5) / NG];
        var nb = SA.ml.nearest(a.Ztr, toZ(p), S.kShow).idx, s = 0; for (var h = 0; h < nb.length; h++) s += a.tr.y[nb[h]];
        cells[i * NG + j] = s > S.kShow / 2 ? 1 : 0;
      }
      a.grid = { k: S.kShow, cells: cells };
    }
    var cw = (FA.x(R[0][1]) - FA.x(R[0][0])) / NG, ch = (FA.y(R[1][0]) - FA.y(R[1][1])) / NG, d0 = '', d1 = '';
    for (i = 0; i < NG; i++) for (j = 0; j < NG; j++) { var rc = 'M' + (FA.x(R[0][0]) + i * cw).toFixed(1) + ',' + (FA.y(R[1][0]) - (j + 1) * ch).toFixed(1) + 'h' + (cw + 0.3).toFixed(1) + 'v' + (ch + 0.3).toFixed(1) + 'h' + (-cw - 0.3).toFixed(1) + 'z'; if (a.grid.cells[i * NG + j]) d1 += rc; else d0 += rc; }
    P.svg('path', { d: d0, fill: t.c1, 'fill-opacity': 0.13 }, g); P.svg('path', { d: d1, fill: t.c2, 'fill-opacity': 0.13 }, g);
    // frontiera di Bayes
    var bl = { stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' };
    P.svg('line', Object.assign({ x1: FA.x(0), x2: FA.x(0), y1: FA.y(R[1][0]), y2: FA.y(R[1][1]) }, bl), g);
    if (S.sc === 'xor') P.svg('line', Object.assign({ x1: FA.x(R[0][0]), x2: FA.x(R[0][1]), y1: FA.y(0), y2: FA.y(0) }, bl), g);
    var X = a.tr.X, y = a.tr.y, cl = function (v, r) { return Math.max(r[0], Math.min(r[1], v)); };
    P.dots(g, X.filter(function (x, k) { return !y[k]; }).map(function (x) { return [FA.x(cl(x[0], R[0])), FA.y(cl(x[1], R[1]))]; }), 3.2, t.c1, 0.8);
    X.forEach(function (x, k) { if (y[k]) P.marker(g, 'tri', FA.x(cl(x[0], R[0])), FA.y(cl(x[1], R[1])), 8, t.c2); });
    // punto interrogato e suoi vicini
    var qv = queryVote(), qx = FA.x(S.q[0]), qy = FA.y(S.q[1]);
    Array.prototype.forEach.call(qv.idx, function (k) { P.svg('line', { x1: qx, y1: qy, x2: FA.x(cl(X[k][0], R[0])), y2: FA.y(cl(X[k][1], R[1])), stroke: y[k] ? t.c2 : t.c1, 'stroke-width': 1.2, 'stroke-opacity': 0.7 }, g); });
    P.svg('circle', { cx: qx, cy: qy, r: 9, fill: t.card, stroke: t.ink, 'stroke-width': 2.5, style: 'cursor:grab', 'data-q': 1 }, g);
    P.svg('circle', { cx: qx, cy: qy, r: 3, fill: t.ink }, g);
    P.text(g, FA.m.l + 8, FA.m.t + 14, 'k = ' + S.kShow + ': ' + qv.ones + ' voti per la classe 1, ' + (S.kShow - qv.ones) + ' per la classe 0 → classe ' + (qv.ones > S.kShow / 2 ? 1 : 0) + ' · P(Y = 1 | x) vera = ' + SA.fmt(post1(S.q[0], S.q[1]), 3), { fill: t.ink, 'font-size': 12.5, 'font-weight': 600 });
  }
  function drawCurves() {
    var P = SA.plot, a = S.cur, bay = SC[S.sc].bayes(S.delta), mt = avg('te'), top = Math.min(0.6, +(1.3 * Math.max(Math.max.apply(null, a.eTe), Math.max.apply(null, mt), bay + 0.05)).toPrecision(2));
    var F = P.frame(figB, { W: 720, H: 290, x: [0, S.kmax + 1], y: [0, top], xlabel: 'numero di vicini k (a sinistra il modello più flessibile)', ylabel: 'tasso di errore', label: 'Errore in funzione di k' });
    var t = F.t, g = F.g, ks = S.kVals, cp = function (v) { return Math.min(top, v); };
    P.svg('line', { x1: F.x(0), x2: F.x(S.kmax + 1), y1: F.y(bay), y2: F.y(bay), stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
    P.text(g, F.x(S.kmax + 1) - 4, F.y(bay) + 15, 'errore di Bayes ' + SA.fmt(bay, 3), { 'text-anchor': 'end', fill: t.c_theory, 'font-size': 11.5 });
    P.svg('line', { x1: F.x(S.kShow), x2: F.x(S.kShow), y1: F.m.t, y2: F.y(0), stroke: t.accent, 'stroke-dasharray': '3 3' }, g);
    var ser = [['tr', 'eTr', t.c1, null], ['loo', 'eLoo', t.c3, null], ['te', 'eTe', t.c2, '9 4']];
    ser.forEach(function (q) { P.svg('path', { d: P.path(ks.map(function (k, r) { return [F.x(k), F.y(cp(a[q[1]][r]))]; })), fill: 'none', stroke: q[2], 'stroke-width': 1.2, 'stroke-opacity': 0.4, 'stroke-dasharray': q[3] }, g); });
    if (S.k > 1) ser.forEach(function (q) { var m = avg(q[0]); P.svg('path', { d: P.path(ks.map(function (k, r) { return [F.x(k), F.y(cp(m[r]))]; })), fill: 'none', stroke: q[2], 'stroke-width': 2.8, 'stroke-dasharray': q[3] }, g); });
    P.marker(g, 'circle', F.x(ks[a.best]), F.y(cp(a.eLoo[a.best])), 11, t.c3);
  }
  function drawConf() {
    var P = SA.plot, t = SA.theme(), c = confusion(), tot = NT, svg;
    figC.innerHTML = ''; svg = P.svg('svg', { viewBox: '0 0 720 210', role: 'img', 'aria-label': 'Matrice di confusione sul test', 'font-family': t.sans, 'font-size': 13 }, figC);
    var lab = [['vera 0, prevista 0', 0, 0, t.c3], ['vera 0, prevista 1', 1, 0, t.c2], ['vera 1, prevista 0', 0, 1, t.c2], ['vera 1, prevista 1', 1, 1, t.c3]];
    P.text(svg, 150, 18, 'prevista 0', { 'text-anchor': 'middle', fill: t.ink_2 }); P.text(svg, 270, 18, 'prevista 1', { 'text-anchor': 'middle', fill: t.ink_2 });
    P.text(svg, 80, 70, 'vera 0', { 'text-anchor': 'end', fill: t.ink_2 }); P.text(svg, 80, 160, 'vera 1', { 'text-anchor': 'end', fill: t.ink_2 });
    lab.forEach(function (q, i) {
      var x = 92 + q[1] * 120, y = 28 + q[2] * 90;
      P.svg('rect', { x: x, y: y, width: 114, height: 84, rx: 6, fill: q[3], 'fill-opacity': 0.12 + 0.6 * c.m[i] / (tot / 2) }, svg);
      P.text(svg, x + 57, y + 50, String(c.m[i]), { 'text-anchor': 'middle', fill: t.ink, 'font-size': 22, 'font-weight': 700 });
    });
    var rows = [['accuratezza', c.acc, c.accCI], ['sensibilità (classe 1)', c.sens, c.sensCI], ['specificità (classe 0)', c.spec, c.specCI]];
    rows.forEach(function (q, i) {
      var y = 46 + i * 54, x0 = 380, w = 300;
      P.text(svg, x0, y, q[0] + ': ' + SA.fmt(q[1], 3) + '  [' + SA.fmt(q[2][0], 3) + '; ' + SA.fmt(q[2][1], 3) + ']', { fill: t.ink, 'font-size': 12.5 });
      P.svg('rect', { x: x0, y: y + 8, width: w, height: 10, rx: 3, fill: t.rule }, svg);
      P.svg('rect', { x: x0 + w * q[2][0], y: y + 8, width: Math.max(2, w * (q[2][1] - q[2][0])), height: 10, rx: 3, fill: t.accent, 'fill-opacity': 0.35 }, svg);
      P.svg('line', { x1: x0 + w * q[1], x2: x0 + w * q[1], y1: y + 4, y2: y + 22, stroke: t.accent, 'stroke-width': 3 }, svg);
    });
  }
  function confusion() {
    var a = S.cur;
    if (a.kConf !== S.kShow) { // ricalcolo sul test della replica corrente: rigenero lo stesso test dal flusso RNG
      var g = new SA.RRNG(S.seed); for (var r = 0; r < S.k - 1; r++) { gen(g, S.n); gen(g, NT); } gen(g, S.n);
      var te = gen(g, NT), Zte = a.sc ? a.sc.apply(te.X) : te.X, m = [0, 0, 0, 0];
      for (var i = 0; i < NT; i++) { var nb = SA.ml.nearest(a.Ztr, Zte[i], S.kShow).idx, s = 0; for (var h = 0; h < nb.length; h++) s += a.tr.y[nb[h]]; m[2 * te.y[i] + (s > S.kShow / 2 ? 1 : 0)]++; }
      a.conf = m; a.kConf = S.kShow;
    }
    var c = a.conf, W = SA.ml.wilson;
    return { m: c, acc: (c[0] + c[3]) / NT, accCI: W(c[0] + c[3], NT), sens: c[3] / (c[2] + c[3]), sensCI: W(c[3], c[2] + c[3]), spec: c[0] / (c[0] + c[1]), specCI: W(c[0], c[0] + c[1]) };
  }
  function drawChoice() {
    var P = SA.plot, k = Math.max(1, S.k), mx = 1, r;
    for (r = 0; r < S.kVals.length; r++) mx = Math.max(mx, S.cntK[r]);
    var F = P.frame(figD, { W: 720, H: 200, x: [0, S.kmax + 1], y: [0, +(1.15 * mx / k).toPrecision(2)], xlabel: 'k scelto dalla validazione leave-one-out', ylabel: 'frequenza', label: 'k scelto nelle repliche' });
    var t = F.t, w = Math.max(2, (F.x(2) - F.x(0)) * 0.7);
    for (r = 0; r < S.kVals.length; r++) if (S.cntK[r]) P.svg('rect', { x: F.x(S.kVals[r]) - w / 2, width: w, y: F.y(S.cntK[r] / k), height: F.y(0) - F.y(S.cntK[r] / k), fill: t.c3, 'fill-opacity': 0.7 }, F.g);
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch, box = function (c, o) { return el('i', { style: 'display:inline-block;width:14px;height:10px;border-radius:2px;background:' + c + ';opacity:' + o }); };
    legA.innerHTML = ''; legB.innerHTML = ''; legD.innerHTML = '';
    legA.append(el('span', sw(t.c1, null, 'circle'), 'classe 0'), el('span', sw(t.c2, null, 'tri'), 'classe 1'), el('span', box(t.c2, 0.3), box(t.c1, 0.3), ' regioni kNN'), el('span', sw(t.c_theory, '7 4'), 'frontiera di Bayes'), el('span.muted', 'trascina il punto cerchiato'));
    legB.append(el('span', sw(t.c1, null), 'training'), el('span', sw(t.c3, null, 'circle'), 'leave-one-out'), el('span', sw(t.c2, '9 4'), 'test (' + NT + ' punti nuovi)'), el('span.muted', 'tratto spesso: media sulle repliche'));
    legD.append(el('span', box(t.c3, 0.8), 'k̂ con l’errore leave-one-out minimo'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var a = S.cur, fmt = SA.fmt, b = SA.ui.badge, k = S.k, bay = SC[S.sc].bayes(S.delta), c = confusion(), r = ki(S.kShow), mt = avg('te'), mtr = avg('tr');
    var pm = function (arr) { return k ? fmt(meanOf(arr, k), 4) + (k > 1 ? ' ± ' + fmt(seOf(arr, k), 4) : '') : '—'; }, ci = function (q) { return '[' + fmt(q[0], 3) + '; ' + fmt(q[1], 3) + ']'; };
    var qv = queryVote();
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Errore di Bayes R*'), el('td', fmt(bay, 4)), el('td', '—'), el('td', b('exact'))),
      el('tr', el('td', 'Errore sul test con k = ' + S.kShow + ' (replica corrente, IC di Wilson 95%)'), el('td', '≥ R*'), el('td', fmt(1 - c.acc, 4) + ' ' + ci([1 - c.accCI[1], 1 - c.accCI[0]])), el('td', b('approx'))),
      el('tr', el('td', 'Sensibilità · specificità con k = ' + S.kShow), el('td', fmt(1 - bay, 3) + ' · ' + fmt(1 - bay, 3) + ' (regola di Bayes)'), el('td', fmt(c.sens, 3) + ' ' + ci(c.sensCI) + ' · ' + fmt(c.spec, 3) + ' ' + ci(c.specCI)), el('td', b('approx'))),
      el('tr', el('td', 'Errore medio sul test con k = ' + S.kShow), el('td', '—'), el('td', pm(S.teAtShow)), el('td', b('mc'))),
      el('tr', el('td', 'k scelto con leave-one-out: errore sul test'), el('td', 'k̂ = ' + S.kVals[a.best] + ' (replica corrente)'), el('td', pm(S.teAtLoo)), el('td', b('mc'))),
      el('tr', el('td', 'Errore di training con k = 1'), el('td', '0 (ogni punto è vicino di sé stesso)'), el('td', k ? fmt(mtr[0], 4) : '—'), el('td', b('exact'))),
      el('tr', el('td', 'Errore sul test con k = 1 per n → ∞ (Cover–Hart)'), el('td', '→ E[2η(1 − η)] = ' + fmt(S.r1nn, 4) + ' ≤ 2R*(1 − R*) = ' + fmt(2 * bay * (1 - bay), 4)), el('td', k ? fmt(mt[0], 4) : '—'), el('td', b('asym'))),
      el('tr', el('td', 'Punto interrogato: voto dei vicini e probabilità vera'), el('td', 'P(Y = 1 | x) = ' + fmt(post1(S.q[0], S.q[1]), 3)), el('td', qv.ones + ' / ' + S.kShow + ' = ' + fmt(qv.ones / S.kShow, 3)), el('td', b('none'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'repliche')),
      el('div.kpi', el('b', S.n + ' / ' + NT), el('span', 'punti di training / di test per replica')),
      el('div.kpi', el('b', S.std ? 'sì' : 'no'), el('span', 'standardizzazione (stimata sul solo training)')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p19-' + Date.now();
    predBox.append(el('p.prose', 'Con k = 1 ogni punto nuovo prende la classe del suo vicino più prossimo. Che cosa ti aspetti dall’errore di training e da quello sul test?'),
      el('div.choices', { role: 'radiogroup' }, [['zero', 'Training 0, test sopra l’errore di Bayes'], ['both', 'Entrambi vicini all’errore di Bayes'], ['low', 'Entrambi molto bassi: il modello è il più flessibile']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    var mt = avg('te'), bay = SC[S.sc].bayes(S.delta);
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'zero' ? '✓ ' : '✗ ') + 'Sul training ogni punto ha sé stesso come vicino: errore 0. Sul test il vicino più prossimo è un punto rumoroso, e l’errore (' + (S.k ? SA.fmt(mt[0], 3) : '—') + ') supera quello di Bayes (' + SA.fmt(bay, 3) + '); per n grande tende a E[2η(1 − η)] = ' + SA.fmt(S.r1nn, 3) + ', mai oltre 2R*(1 − R*) (Cover e Hart).';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>Il kNN stima P(Y = 1 | x) con la quota di vicini della classe 1 e assegna la classe più votata. <strong>k governa la complessità</strong>: con k piccolo la frontiera segue i singoli punti (varianza alta), con k grande si appiattisce verso la classe più frequente (distorsione alta). La curva dell’errore sul test ha di nuovo la forma a U del lab 18, ma rovesciata sull’asse: a sinistra c’è il modello più flessibile.</p>' +
      '<p>L’errore di Bayes è il <strong>limite inferiore</strong> per qualunque classificatore: nessun k lo supera in media. La validazione leave-one-out sceglie k sul solo training ed è quasi gratuita per il kNN, perché basta escludere il punto dai propri vicini.</p>' +
      '<p class="muted">Le distanze dipendono dalle unità di misura. Moltiplica x₂ per 10 e togli la standardizzazione: i vicini diventano quelli vicini in x₂, che nello scenario lineare non contiene informazione, e l’errore cresce. La standardizzazione va stimata sul training e applicata al test, mai stimata su tutti i dati.</p>';
  }
  function codeR() {
    var lin = S.sc === 'lin';
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 19 — k vicini più prossimi',
      '# R0: stessi dati di training e di test di StatAtlas (stesso seed, R ≥ 3.6).',
      '# R2: stesso algoritmo: distanza euclidea, a parità di distanza l’indice minore (order()), k dispari.',
      '# R3: class::knn() rompe le parità a caso e consuma numeri casuali: confronto di metodo, non stessi numeri.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; n_test <- ' + NT + '; delta <- ' + S.delta + '; scala <- ' + S.scale + '; standardizza <- ' + (S.std ? 'TRUE' : 'FALSE') + '; B <- ' + S.B,
      'k_val <- seq(1, ' + S.kmax + ', by = 2); kmax <- max(k_val)', '',
      'genera <- function(n) {', '  y <- rep(0:1, each = n / 2)', '  s <- ifelse(runif(n) < 0.5, -1, 1)' + (lin ? '                 # (usato solo nello scenario XOR)' : '                 # segno della componente della miscela'),
      '  z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)',
      lin ? '  x <- cbind(ifelse(y == 1, delta / 2, -delta / 2) + z[, 1], z[, 2])' : '  x <- cbind(s * delta / 2 + z[, 1], s * ifelse(y == 1, 1, -1) * delta / 2 + z[, 2])',
      '  x[, 2] <- scala * x[, 2]', '  list(x = x, y = y)', '}',
      'errore_bayes <- ' + (lin ? 'pnorm(-delta / 2)' : '2 * pnorm(delta / 2) * pnorm(-delta / 2)'), '',
      '# Classe prevista per ogni k: matrice (punti × k)', 'prevedi <- function(xtr, ytr, xnew, loo = FALSE) {', '  t(sapply(seq_len(nrow(xnew)), \\(i) {',
      '    d <- (xtr[, 1] - xnew[i, 1])^2 + (xtr[, 2] - xnew[i, 2])^2', '    o <- order(d); if (loo) o <- o[o != i]          # leave-one-out: il punto non vota per sé',
      '    v <- cumsum(ytr[o[seq_len(kmax)]])', '    as.integer(v[k_val] > k_val / 2)', '  }))', '}', '',
      'una_replica <- function() {', '  tr <- genera(n); te <- genera(n_test)',
      '  if (standardizza) {                                # medie e sd stimate sul solo training', '    m <- colMeans(tr$x); s <- apply(tr$x, 2, sd)', '    tr$x <- scale(tr$x, m, s); te$x <- scale(te$x, m, s)', '  }',
      '  err <- \\(P, y) colMeans(P != y)', '  tibble(k = k_val, training = err(prevedi(tr$x, tr$y, tr$x), tr$y),',
      '         loo = err(prevedi(tr$x, tr$y, tr$x, loo = TRUE), tr$y), test = err(prevedi(tr$x, tr$y, te$x), te$y))', '}', '',
      'repliche <- map(seq_len(B), \\(b) una_replica())', 'curve <- bind_rows(repliche, .id = "replica")',
      'curve |> group_by(replica) |> slice_min(loo, n = 1, with_ties = FALSE) |> ungroup() |>', '  summarise(k_medio = mean(k), test_al_k_scelto = mean(test))',
      'curve |> filter(k == 1) |> summarise(training = mean(training), test = mean(test), cover_hart = 2 * errore_bayes * (1 - errore_bayes))', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'curve |> dplyr::select(-replica) |> group_by(k) |> summarise(across(everything(), mean)) |>', '  pivot_longer(-k, names_to = "errore", values_to = "valore") |>',
      '  ggplot(aes(k, valore, colour = errore)) + geom_line(linewidth = 1) +', '  geom_hline(yintercept = errore_bayes, linetype = "dashed") +', '  labs(x = "k", y = "tasso di errore") + theme_statatlas()', '',
      '# Confronto di metodo (R3)', '# library(class); knn(train = tr$x, test = te$x, cl = factor(tr$y), k = ' + S.kShow + ')', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>La regola dei k vicini</h3><p>Dato un punto x, si prendono i k punti di training più vicini N<sub>k</sub>(x) e si stima</p><div class="eq" data-tex="\\hat{p}(x) = \\frac{1}{k}\\sum_{i \\in N_k(x)} \\mathbf{1}\\{y_i = 1\\}"></div><p>assegnando la classe 1 se p̂(x) &gt; 1/2. Con k dispari e due classi non ci sono parità nei voti.</p>' +
        '<h3>Errore di Bayes</h3><p>La regola di Bayes sceglie la classe con P(Y = 1 | x) più alta; il suo errore R* è il minimo possibile. Con due normali di medie ±δ/2 e varianza unitaria R* = Φ(−δ/2); nello scenario XOR R* = 2Φ(δ/2)Φ(−δ/2).</p>' +
        '<h3>Misure di qualità</h3><p>Accuratezza, sensibilità (veri 1 riconosciuti) e specificità (veri 0 riconosciuti) si stimano sul test; gli intervalli di Wilson tengono conto del numero di casi in ciascuna classe.</p>' +
        '<div class="callout warn">Le distanze cambiano con le unità di misura: senza standardizzazione una variabile con scala grande decide da sola i vicini.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Consistenza</h3><p>Se k → ∞ e k/n → 0, l’errore del kNN converge a R* per qualunque distribuzione (Stone, 1977). Con k = 1 fisso, invece, l’errore tende a un valore compreso tra R* e 2R*(1 − R*) (Cover e Hart, 1967).</p>' +
        '<h3>Maledizione della dimensionalità</h3><p>In p dimensioni, per catturare una frazione r dei dati con un cubo serve un lato r<sup>1/p</sup>: con p = 10 e r = 1% il lato è 0,63. I “vicini” smettono di essere locali, e la distorsione cresce.</p>' +
        '<h3>Leave-one-out per il kNN</h3><p>Escludere un punto dai propri vicini non richiede di ristimare nulla: la LOOCV costa quanto una previsione sul training, ed è uno dei rari casi in cui è esatta e gratuita.</p>' });
    }
  };

  var run, codeBox, ctrlBox, drag = false;
  function restart() { var k0 = S.kmax; run.stop(); S = newState(S); step(); legends(); interpretation(); codeBox.refresh(); if (S.kmax !== k0) buildControls(); render(true); run.refresh(); }
  function render(full) { drawMap(); drawCurves(); if (full || run.frame % 3 === 0 || !run.running) { drawConf(); drawChoice(); updateTable(); } }
  function bindDrag() {
    var toData = function (ev) { var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !FA) return null; var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()), R = ranges(); return [Math.max(R[0][0], Math.min(R[0][1], FA.x.invert(p.x))), Math.max(R[1][0], Math.min(R[1][1], FA.y.invert(p.y)))]; };
    figA.addEventListener('pointerdown', function (ev) { var q = toData(ev); if (!q) return; run.stop(); drag = true; S.q = q; if (figA.setPointerCapture) figA.setPointerCapture(ev.pointerId); drawMap(); });
    figA.addEventListener('pointermove', function (ev) { if (!drag) return; var q = toData(ev); if (q) { S.q = q; drawMap(); } });
    figA.addEventListener('pointerup', function () { if (drag) { drag = false; updateTable(); } });
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var sel = function (lab, key, vals, fmtv) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    ctrlBox.append(
      el('label.field', el('span', 'Scenario'), el('select', { onchange: function () { S.sc = this.value; restart(); } }, Object.keys(SC).map(function (k) { return el('option', { value: k, selected: k === S.sc }, SC[k].label); }))),
      SA.ui.slider('Separazione δ tra le classi', { min: 0.5, max: 4, step: 0.25, value: S.delta, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.delta = v; restart(); } }),
      SA.ui.slider('k mostrato (vicini)', { min: 1, max: S.kmax, step: 2, value: S.kShow, format: function (v) { return String(v); }, onchange: function (v) { S.kShow = v; drawMap(); drawCurves(); drawConf(); updateTable(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n training', 'n', [50, 100, 200, 400]), sel('Scala di x₂', 'scale', [1, 10], function (v) { return '× ' + v; }),
        sel('Repliche B', 'B', [50, 100, 200]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      el('label.field', { style: 'flex-direction:row;display:flex;gap:8px;align-items:center' }, el('input', { type: 'checkbox', checked: S.std, onchange: function () { S.std = this.checked; restart(); } }), el('span', 'Standardizza le variabili (medie e sd del training)')));
    run.controls('Una nuova replica').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('knn', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, coop: true, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); step(); } });
      var openT = function (l) { SA.ui.openDrawer('k vicini più prossimi', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Classificare un punto guardando i suoi vicini: l’idea più semplice dell’apprendimento supervisionato, e un laboratorio perfetto per vedere flessibilità, errore di Bayes e scelta di k.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Come cambia una frontiera di decisione quando usiamo i vicini più prossimi, e quanti vicini conviene ascoltare?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Frontiera, vicini e scelta di k');
      ctrlBox = el('div.panel.controls'); figA = el('div', { style: 'touch-action:none' }); figB = el('div'); figC = el('div'); figD = el('div');
      legA = el('div.legend'); legB = el('div.legend'); legD = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Training, regioni kNN e vicini del punto interrogato'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Errore in funzione di k'), legB), figB),
        el('div.fig', el('div.fig-title', el('h3', 'Matrice di confusione sul test (k mostrato, replica corrente)'), el('div.legend', el('span.muted', 'intervalli di Wilson al 95%'))), figC),
        el('div.fig', el('div.fig-title', el('h3', 'Quale k sceglie la validazione'), legD), figD),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [['x1', 'x2', 'classe']]; S.cur.tr.X.forEach(function (x, i) { rows.push([x[0], x[1], S.cur.tr.y[i]]); }); SA.ui.download('statatlas_lab19_training.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Curve CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var a = S.cur, rows = [['k', 'training', 'loo', 'test']]; S.kVals.forEach(function (k, r) { rows.push([k, a.eTr[r], a.eLoo[r], a.eTe[r]]); }); SA.ui.download('statatlas_lab19_curve.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab19.png', ['k vicini più prossimi', SC[S.sc].label + ' · δ = ' + S.delta + ' · n = ' + S.n + ' · k = ' + S.kShow + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Valore teorico'), el('th', 'Stima / simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' esatto'), el('span', SA.ui.badge('asym'), ' asintotico'), el('span', SA.ui.badge('approx'), ' intervallo di Wilson'), el('span', SA.ui.badge('mc'), ' Monte Carlo')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Consistenza, Cover–Hart, dimensionalità (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi dati, stesso algoritmo'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab19_knn.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati di training e di test (R0) e stesso algoritmo dei vicini (R2); class::knn è un confronto di metodo (R3). Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); bindDrag(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
