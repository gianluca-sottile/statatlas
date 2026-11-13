/* StatAtlas · Lab 21 — PCA: geometria, varianza e ricostruzione.
 * Popolazione normale p-variata: Σ = V diag(λ) Vᵀ, λ = (ρ, 1; 0,6; 0,35; 0,2; 0,1)₁…ₚ, V = rotazione di θ nel piano (1, 2).
 * Righe xᵢ = μ + V diag(√λ) eᵢ con eᵢ = rnorm(p) letto per righe; la seconda colonna è moltiplicata per l'unità u.
 * PCA campionaria: centratura (e standardizzazione facoltativa), S = ZᵀZ/(n − 1), autodecomposizione di Jacobi
 * (SA.la.symEig: autovalori decrescenti, segno con la componente di modulo massimo positiva). */
(function () {
  var el, S, LAM = [1, 1, 0.6, 0.35, 0.2, 0.1], MU = [3, -2, 1, 0, 0, 0], BINS = 30;
  function popCov(s) { // Σ_X = D V Λ Vᵀ D, D = diag(1, u, 1, …)
    var p = s.p, V = s.V, lam = s.lam, C = [], i, j, k;
    for (i = 0; i < p; i++) { C.push(new Array(p).fill(0)); for (j = 0; j < p; j++) for (k = 0; k < p; k++) C[i][j] += V[i][k] * lam[k] * V[j][k]; }
    for (i = 0; i < p; i++) { C[i][1] *= s.unit; C[1][i] *= s.unit; }
    if (s.std) { var d = C.map(function (r, q) { return Math.sqrt(r[q]); }); C = C.map(function (r, a) { return r.map(function (v, b) { return v / (d[a] * d[b]); }); }); }
    return C;
  }
  function newState(prev) {
    var s = { p: 2, rho: 4, theta: 30, n: 80, k: 1, std: false, unit: 1, outlier: false, B: 500, seed: 2026, pred: null };
    if (prev) for (var key in s) if (prev[key] !== undefined) s[key] = prev[key];
    if (s.k > s.p) s.k = s.p;
    s.lam = LAM.slice(0, s.p); s.lam[0] = s.rho;
    var c = Math.cos(s.theta * Math.PI / 180), sn = Math.sin(s.theta * Math.PI / 180);
    s.V = []; for (var i = 0; i < s.p; i++) { s.V.push(new Array(s.p).fill(0)); s.V[i][i] = 1; }
    s.V[0][0] = c; s.V[1][0] = sn; s.V[0][1] = -sn; s.V[1][1] = c;
    s.pop = SA.la.symEig(popCov(s)); // bersaglio: autovalori e assi della popolazione (dello stesso oggetto: covarianza o correlazione)
    var pl = s.pop.values, tot = pl.reduce(function (a, b) { return a + b; }, 0);
    s.popPVE = pl.map(function (v) { return v / tot; });
    // asintotica (Anderson, 1963; dati normali, PCA sulla covarianza, λ₁ semplice)
    s.asy = null;
    if (!s.std && !s.outlier && pl.length > 1 && pl[0] > pl[1] * (1 + 1e-9)) {
      var es = 0, bias = 0; for (i = 1; i < pl.length; i++) { es += pl[0] * pl[i] / Math.pow(pl[0] - pl[i], 2); bias += pl[0] * pl[i] / (pl[0] - pl[i]); }
      s.asy = { sin2: es / s.n, l1: pl[0] + bias / s.n, sd1: pl[0] * Math.sqrt(2 / s.n) };
    }
    s.rng = new SA.RRNG(s.seed); s.k0 = 0; s.ang = new Float64Array(s.B); s.l1 = new Float64Array(s.B); s.sub = new Float64Array(s.B); s.pve1 = new Float64Array(s.B);
    return s;
  }
  function sample() {
    var g = S.rng, n = S.n, p = S.p, X = [], i, j, k;
    for (i = 0; i < n; i++) {
      var e = []; for (j = 0; j < p; j++) e.push(g.norm());
      var x = []; for (j = 0; j < p; j++) { var v = MU[j]; for (k = 0; k < p; k++) v += S.V[j][k] * Math.sqrt(S.lam[k]) * e[k]; x.push(v); }
      X.push(x);
    }
    if (S.outlier) X[0] = MU.slice(0, p).map(function (m, j) { return m + 10 * S.V[j][1]; }); // un punto lontano lungo l'asse 2 della popolazione
    X.forEach(function (x) { x[1] *= S.unit; });
    return X;
  }
  function pca(X) {
    var n = X.length, p = X[0].length, m = new Array(p).fill(0), sd = new Array(p).fill(1), i, j, k;
    for (i = 0; i < n; i++) for (j = 0; j < p; j++) m[j] += X[i][j] / n;
    var Z = X.map(function (x) { return x.map(function (v, q) { return v - m[q]; }); });
    if (S.std) { for (j = 0; j < p; j++) { var s2 = 0; for (i = 0; i < n; i++) s2 += Z[i][j] * Z[i][j]; sd[j] = Math.sqrt(s2 / (n - 1)); } Z = Z.map(function (z) { return z.map(function (v, q) { return v / sd[q]; }); }); }
    var C = []; for (j = 0; j < p; j++) { C.push(new Array(p).fill(0)); for (k = 0; k < p; k++) for (i = 0; i < n; i++) C[j][k] += Z[i][j] * Z[i][k] / (n - 1); }
    var E = SA.la.symEig(C), sc = Math.max.apply(null, E.values.map(Math.abs)) || 1;
    E.values = E.values.map(function (v) { return v < 0 && v > -1e-12 * sc ? 0 : v; }); // solo arrotondamenti
    var T = Z.map(function (z) { var t = new Array(p).fill(0); for (var a = 0; a < p; a++) for (var b = 0; b < p; b++) t[a] += z[b] * E.vectors[b][a]; return t; });
    // residuo ‖S V − V Λ‖_F
    var res = 0, q; for (j = 0; j < p; j++) for (k = 0; k < p; k++) { var a = 0; for (q = 0; q < p; q++) a += C[j][q] * E.vectors[q][k]; a -= E.vectors[j][k] * E.values[k]; res += a * a; }
    return { m: m, sd: sd, Z: Z, C: C, E: E, T: T, res: Math.sqrt(res) };
  }
  function reconErr(P, k) { // ‖Z − T_k V_kᵀ‖²_F / n, calcolato direttamente
    var n = P.Z.length, p = P.Z[0].length, s = 0;
    for (var i = 0; i < n; i++) for (var j = 0; j < p; j++) { var z = 0; for (var a = 0; a < k; a++) z += P.T[i][a] * P.E.vectors[j][a]; s += (P.Z[i][j] - z) * (P.Z[i][j] - z); }
    return s / n;
  }
  function step() {
    if (S.k0 >= S.B) return false;
    var X = sample(), P = pca(X), v = P.E.vectors, w = S.pop.vectors, p = S.p, dot = 0, j, a, b;
    for (j = 0; j < p; j++) dot += v[j][0] * w[j][0];
    S.ang[S.k0] = Math.acos(Math.min(1, Math.abs(dot))) * 180 / Math.PI; // angolo tra assi: indipendente dal segno
    S.l1[S.k0] = P.E.values[0];
    var tot = P.E.values.reduce(function (x, y) { return x + y; }, 0); S.pve1[S.k0] = P.E.values[0] / tot;
    // distanza tra i sottospazi delle prime due componenti: ‖P̂ − P‖_F / √2 (definita anche con autovalori ripetuti)
    if (p > 2) { var d2 = 0; for (a = 0; a < p; a++) for (b = 0; b < p; b++) { var ph = v[a][0] * v[b][0] + v[a][1] * v[b][1], pp = w[a][0] * w[b][0] + w[a][1] * w[b][1]; d2 += (ph - pp) * (ph - pp); } S.sub[S.k0] = Math.sqrt(d2 / 2); }
    S.cur = { X: X, P: P }; S.k0++; return true;
  }
  function meanOf(a, k) { var s = 0; for (var i = 0; i < k; i++) s += a[i]; return k ? s / k : NaN; }
  function sdOf(a, k) { var m = meanOf(a, k), s = 0; for (var i = 0; i < k; i++) s += (a[i] - m) * (a[i] - m); return k > 1 ? Math.sqrt(s / (k - 1)) : NaN; }

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, figE, legA, legC;
  function drawCloud() {
    var P = SA.plot, a = S.cur, X = a.X, pc = a.P, Z = pc.Z, std = S.std;
    // coordinate mostrate: dati centrati (e standardizzati se scelto) sulle variabili 1 e 2
    var r = 0; Z.forEach(function (z) { r = Math.max(r, Math.abs(z[0]), Math.abs(z[1])); }); r = +(1.08 * r).toPrecision(2);
    var F = P.frame(figA, { W: 520, H: 480, x: [-r, r], y: [-r, r], xlabel: (std ? 'z₁' : 'x₁ − x̄₁'), ylabel: (std ? 'z₂' : 'x₂ − x̄₂'), label: 'Nuvola di punti centrata e assi principali' });
    var t = F.t, g = F.g, v = pc.E.vectors, w = S.pop.vectors, L = pc.E.values;
    if (S.p === 2 && S.k === 1) Z.forEach(function (z, i) { var tt = pc.T[i][0]; P.svg('line', { x1: F.x(z[0]), y1: F.y(z[1]), x2: F.x(tt * v[0][0]), y2: F.y(tt * v[1][0]), stroke: t.c3, 'stroke-width': 0.8, 'stroke-opacity': 0.5 }, g); });
    P.dots(g, Z.map(function (z) { return [F.x(z[0]), F.y(z[1])]; }), 3, t.ink, 0.5);
    if (S.outlier) P.marker(g, 'circle', F.x(Z[0][0]), F.y(Z[0][1]), 14, 'none', t.c2);
    if (S.p === 2 && S.k === 1) P.dots(g, pc.T.map(function (tt) { return [F.x(tt[0] * v[0][0]), F.y(tt[0] * v[1][0])]; }), 2.4, t.c3, 0.9);
    var Lp = S.pop.values;
    [0, 1].forEach(function (c) {
      var len = 2 * Math.sqrt(Math.max(0, L[c])), lp = 2 * Math.sqrt(Math.max(0, Lp[c]));
      P.svg('line', { x1: F.x(-lp * w[0][c]), y1: F.y(-lp * w[1][c]), x2: F.x(lp * w[0][c]), y2: F.y(lp * w[1][c]), stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
      P.svg('line', { x1: F.x(-len * v[0][c]), y1: F.y(-len * v[1][c]), x2: F.x(len * v[0][c]), y2: F.y(len * v[1][c]), stroke: c ? t.c1 : t.accent, 'stroke-width': 3 }, g);
      P.text(g, F.x(len * v[0][c]) + 6, F.y(len * v[1][c]) - 6, 'PC' + (c + 1), { fill: c ? t.c1 : t.accent, 'font-weight': 700, 'font-size': 12 });
    });
    if (S.p > 2) P.text(g, F.m.l + 6, F.m.t + 12, 'p = ' + S.p + ': si vedono le prime due coordinate degli assi', { fill: t.ink_3, 'font-size': 11 });
  }
  function drawScree() {
    var P = SA.plot, L = S.cur.P.E.values, tot = L.reduce(function (a, b) { return a + b; }, 0), p = S.p, cum = 0;
    var F = P.frame(figB, { W: 520, H: 300, x: [0.4, p + 0.6], y: [0, 1], xlabel: 'componente', ylabel: 'quota di varianza', label: 'Scree plot e varianza spiegata cumulata' });
    var t = F.t, g = F.g, w = (F.x(1) - F.x(0)) * 0.5, pts = [];
    for (var j = 0; j < p; j++) {
      var q = L[j] / tot; cum += q; pts.push([F.x(j + 1), F.y(cum)]);
      P.svg('rect', { x: F.x(j + 1) - w / 2, width: w, y: F.y(q), height: F.y(0) - F.y(q), fill: j < S.k ? t.accent : t.rule_2, 'fill-opacity': 0.75 }, g);
      P.marker(g, 'diamond', F.x(j + 1), F.y(S.popPVE[j]), 10, t.c_theory);
      P.text(g, F.x(j + 1), F.y(q) - 6, SA.fmt(100 * q, 0) + '%', { 'text-anchor': 'middle', fill: t.ink_2, 'font-size': 11 });
    }
    P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c1, 'stroke-width': 2.2 }, g);
    pts.forEach(function (q) { P.marker(g, 'circle', q[0], q[1], 8, t.c1); });
  }
  function drawBiplot() {
    var P = SA.plot, pc = S.cur.P, T = pc.T, v = pc.E.vectors, r = 0, i;
    T.forEach(function (tt) { r = Math.max(r, Math.abs(tt[0]), Math.abs(tt[1] || 0)); }); r = +(1.1 * r).toPrecision(2);
    var F = P.frame(figC, { W: 520, H: 440, x: [-r, r], y: [-r, r], xlabel: 'score PC1', ylabel: 'score PC2', label: 'Biplot: score e loading' });
    var t = F.t, g = F.g, sc = 0.85 * r; // frecce: loading vⱼ moltiplicati per 0,85 · max|score|
    P.dots(g, T.map(function (tt) { return [F.x(tt[0]), F.y(tt[1])]; }), 2.8, t.ink, 0.45);
    for (i = 0; i < S.p; i++) {
      var ex = F.x(sc * v[i][0]), ey = F.y(sc * v[i][1]);
      P.svg('line', { x1: F.x(0), y1: F.y(0), x2: ex, y2: ey, stroke: t.c2, 'stroke-width': 2.2 }, g);
      P.marker(g, 'circle', ex, ey, 7, t.c2);
      P.text(g, ex + 5, ey - 5, 'x' + (i + 1), { fill: t.c2, 'font-weight': 700, 'font-size': 12 });
    }
  }
  function drawRecon() {
    var P = SA.plot, pc = S.cur.P, p = S.p, n = S.n, L = pc.E.values, tot = (n - 1) / n * L.reduce(function (a, b) { return a + b; }, 0);
    var F = P.frame(figD, { W: 520, H: 260, x: [-0.5, p + 0.5], y: [0, +(1.1 * tot).toPrecision(2)], xlabel: 'numero di componenti k', ylabel: '‖Z − Ẑₖ‖² / n', label: 'Errore di ricostruzione' });
    var t = F.t, g = F.g, w = (F.x(1) - F.x(0)) * 0.55;
    for (var k = 0; k <= p; k++) {
      var e = reconErr(pc, k);
      P.svg('rect', { x: F.x(k) - w / 2, width: w, y: F.y(e), height: Math.max(0.5, F.y(0) - F.y(e)), fill: k === S.k ? t.accent : t.c1, 'fill-opacity': k === S.k ? 0.85 : 0.45 }, g);
    }
  }
  function drawMC() {
    var P = SA.plot, k = S.k0, hi = 90, c = new Uint32Array(BINS), mx = 1, i;
    var top = 0; for (i = 0; i < k; i++) top = Math.max(top, S.ang[i]); hi = Math.min(90, Math.max(5, Math.ceil(1.1 * top / 5) * 5));
    for (i = 0; i < k; i++) c[Math.min(BINS - 1, Math.floor(S.ang[i] / hi * BINS))]++;
    for (i = 0; i < BINS; i++) mx = Math.max(mx, c[i]);
    var bw = hi / BINS, F = P.frame(figE, { W: 720, H: 230, x: [0, hi], y: [0, +(1.15 * mx / Math.max(1, k) / bw).toPrecision(2)], xlabel: 'angolo tra PC1 stimata e PC1 della popolazione (gradi)', ylabel: 'densità', label: 'Distribuzione Monte Carlo dell’angolo' });
    var t = F.t; P.hist(F, c, 0, hi, k, t.accent, { opacity: 0.25 });
    if (S.asy) { var a = Math.asin(Math.sqrt(Math.min(1, S.asy.sin2))) * 180 / Math.PI; P.svg('line', { x1: F.x(a), x2: F.x(a), y1: F.m.t, y2: F.y(0), stroke: t.c_theory, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, F.g); P.text(F.g, F.x(a) + 5, F.m.t + 12, 'radice di E[sin²] asintotico', { fill: t.c_theory, 'font-size': 11 }); }
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legC.innerHTML = '';
    legA.append(el('span', sw(t.accent, null), 'PC1 stimata'), el('span', sw(t.c1, null), 'PC2 stimata'), el('span', sw(t.c_theory, '7 4'), 'assi della popolazione'), S.p === 2 && S.k === 1 ? el('span', sw(t.c3, null, 'circle'), 'proiezioni su PC1') : null, el('span.muted', 'lunghezza: 2√λ'));
    legC.append(el('span', sw(t.c2, null, 'circle'), 'loading (× 0,85 max|score|)'), el('span.muted', 'score T = Z V'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, pc = S.cur.P, L = pc.E.values, n = S.n, p = S.p, k = S.k0, tot = L.reduce(function (x, y) { return x + y; }, 0), i, j;
    var cum = 0; for (j = 0; j < S.k; j++) cum += L[j] / tot;
    var cumPop = 0; for (j = 0; j < S.k; j++) cumPop += S.popPVE[j];
    var direct = reconErr(pc, S.k), formula = 0; for (j = S.k; j < p; j++) formula += L[j]; formula *= (n - 1) / n;
    var maxc = 0; for (i = 0; i < p; i++) for (j = i + 1; j < p; j++) { var s = 0, si = 0, sj = 0; pc.T.forEach(function (t) { s += t[i] * t[j]; si += t[i] * t[i]; sj += t[j] * t[j]; }); maxc = Math.max(maxc, si > 0 && sj > 0 ? Math.abs(s) / Math.sqrt(si * sj) : 0); }
    var full = reconErr(pc, p), dec = true; for (j = 1; j <= p; j++) if (reconErr(pc, j) > reconErr(pc, j - 1) + 1e-12) dec = false;
    var asy = S.asy, why = S.std ? 'non usata: PCA sulla correlazione' : S.outlier ? 'non valida con il valore anomalo' : 'λ₁ = λ₂: asse non identificato';
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', S.k === 1 ? 'Varianza spiegata dalla prima componente' : 'Varianza spiegata dalle prime ' + S.k + ' componenti'), el('td', fmt(100 * cumPop, 1) + '%'), el('td', fmt(100 * cum, 1) + '% (campione corrente)'), el('td', b('exact'))),
      el('tr', el('td', 'Errore di ricostruzione con k = ' + S.k + ': diretto · (n−1)/n Σⱼ>ₖ λ̂ⱼ'), el('td', 'identità esatta'), el('td', fmt(direct, 5) + ' · ' + fmt(formula, 5)), el('td', b('exact'))),
      el('tr', el('td', 'λ̂₁: media e deviazione standard nelle repliche'), el('td', asy ? fmt(asy.l1, 3) + ' · ' + fmt(asy.sd1, 3) : '— (' + why + ')'), el('td', k ? fmt(meanOf(S.l1, k), 3) + ' · ' + fmt(sdOf(S.l1, k), 3) : '—'), el('td', b(asy ? 'asym' : 'mc'))),
      el('tr', el('td', 'sin² dell’angolo tra PC1 stimata e vera (media)'), el('td', asy ? fmt(asy.sin2, 4) : '— (' + why + ')'), el('td', k ? fmt(meanOf(S.ang.map(function (a) { return Math.pow(Math.sin(a * Math.PI / 180), 2); }), k), 4) : '—'), el('td', b(asy ? 'asym' : 'mc'))),
      p > 2 ? el('tr', el('td', 'Distanza tra i sottospazi PC1–PC2 stimato e vero (media)'), el('td', '0 se n → ∞ (λ₂ > λ₃)'), el('td', k ? fmt(meanOf(S.sub, k), 4) : '—'), el('td', b('mc'))) : null,
      el('tr', el('td', 'Controlli numerici'), el('td', 'Σ PVE = 1; score incorrelati; ricostruzione esatta con k = p; errore non crescente; ‖SV − VΛ‖ ≈ 0'),
        el('td', fmt(L.reduce(function (x, y) { return x + y / tot; }, 0), 6) + ' · max|r| = ' + maxc.toExponential(1).replace('.', ',').replace('e-', 'e−') + ' · ' + full.toExponential(1).replace('.', ',').replace('e-', 'e−') + ' · ' + (dec ? '✓' : '✗') + ' · ' + pc.res.toExponential(1).replace('.', ',').replace('e-', 'e−')), el('td', b('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k0 + ' / ' + S.B), el('span', 'campioni')),
      el('div.kpi', el('b', fmt(S.pop.values[0] / S.pop.values[1], 2)), el('span', 'rapporto λ₁/λ₂ della popolazione: quanto è separato il primo asse')),
      el('div.kpi', el('b', S.std ? 'correlazione' : 'covarianza'), el('span', 'oggetto della PCA')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p21-' + Date.now();
    predBox.append(el('p.prose', 'Due variabili misurano la stessa cosa in unità diverse: la seconda è espressa in un’unità 10 volte più piccola (i numeri sono 10 volte più grandi). Che cosa fa la prima componente principale, senza standardizzare?'),
      el('div.choices', { role: 'radiogroup' }, [['unit', 'Si allinea quasi del tutto con la variabile dai numeri grandi'], ['same', 'Non cambia: la PCA guarda solo la correlazione'], ['mid', 'Si mette a metà tra le due variabili']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'unit' ? '✓ ' : '✗ ') + 'La PCA sulla covarianza cerca le direzioni di varianza massima: moltiplicare una variabile per 10 ne moltiplica la varianza per 100, e PC1 la insegue. Prova “unità di x₂ × 10” con e senza standardizzazione: standardizzare cambia l’oggetto statistico (la matrice di correlazione), e i risultati non sono più confrontabili con quelli sulla covarianza.';
  }
  function interpretation() {
    interpBox.innerHTML = '<p>La prima componente principale è la direzione lungo cui i dati centrati hanno <strong>varianza massima</strong>; la seconda è la migliore tra quelle ortogonali alla prima, e così via. Gli autovalori sono le varianze degli score, e la loro somma è la varianza totale: da qui le quote di varianza spiegata.</p>' +
      '<p>Equivalentemente, le prime k componenti danno la migliore approssimazione dei dati con un sottospazio di dimensione k: l’errore di ricostruzione è la somma degli autovalori scartati. Il <strong>segno</strong> di ciascun autovettore è arbitrario (qui la componente più grande è resa positiva), e quando due autovalori coincidono i singoli assi non sono identificati: si confrontano i sottospazi.</p>' +
      '<p class="muted">La PCA non usa nessuna variabile risposta: non cerca gruppi né la direzione più utile per prevedere. Un solo valore anomalo può ruotare gli assi, e la standardizzazione cambia la matrice analizzata.</p>';
  }
  function codeR() {
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 21 — Analisi delle componenti principali',
      '# R0: stessi dati di StatAtlas (stesso seed). R1: stessi autovalori, quote di varianza ed errori di ricostruzione;',
      '#     prcomp() usa la SVD: i segni degli autovettori possono differire e vanno allineati prima di confrontarli.',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; p <- ' + S.p + '; rho <- ' + S.rho + '; theta <- ' + S.theta + ' * pi / 180; unita <- ' + S.unit + '; standardizza <- ' + (S.std ? 'TRUE' : 'FALSE') + '; k <- ' + S.k + '; B <- ' + S.B,
      'lambda <- c(rho, 1, 0.6, 0.35, 0.2, 0.1)[1:p]; mu <- c(3, -2, 1, 0, 0, 0)[1:p]',
      'V <- diag(p); V[1:2, 1:2] <- matrix(c(cos(theta), sin(theta), -sin(theta), cos(theta)), 2)',
      'genera <- function() {', '  E <- matrix(rnorm(n * p), ncol = p, byrow = TRUE)', '  X <- sweep(E %*% diag(sqrt(lambda), p) %*% t(V), 2, mu, "+")',
      S.outlier ? '  X[1, ] <- mu + 10 * V[, 2]                           # valore anomalo lungo il secondo asse' : '  # (nessun valore anomalo)',
      '  X[, 2] <- unita * X[, 2]', '  X', '}', '',
      '# Segno: componente di modulo massimo positiva (convenzione di StatAtlas)', 'allinea <- function(V) sweep(V, 2, sign(V[cbind(apply(abs(V), 2, which.max), seq_len(ncol(V)))]), "*")', '',
      'X <- genera()', 'pc <- prcomp(X, center = TRUE, scale. = standardizza)', 'lambda_hat <- pc$sdev^2',
      'tibble(componente = 1:p, autovalore = lambda_hat, pve = lambda_hat / sum(lambda_hat), cumulata = cumsum(pve))',
      'allinea(pc$rotation)', '',
      '# Errore di ricostruzione con k componenti: diretto e tramite gli autovalori scartati', 'Z <- scale(X, center = TRUE, scale = standardizza)',
      'Zk <- pc$x[, 1:k, drop = FALSE] %*% t(pc$rotation[, 1:k, drop = FALSE])', 'c(diretto = sum((Z - Zk)^2) / n, autovalori = (n - 1) / n * sum(lambda_hat[-(1:k)]))', '',
      '# Campioni ripetuti: angolo tra PC1 stimata e PC1 della popolazione (il primo campione è quello sopra)',
      'Sigma <- V %*% diag(lambda, p) %*% t(V); D <- diag(c(1, unita, rep(1, p - 2)))[1:p, 1:p]; Sigma <- D %*% Sigma %*% D',
      'if (standardizza) Sigma <- cov2cor(Sigma)', 'v1 <- eigen(Sigma, symmetric = TRUE)$vectors[, 1]',
      'set.seed(' + S.seed + ')', 'repliche <- map_dfr(seq_len(B), \\(b) {', '  pc <- prcomp(genera(), center = TRUE, scale. = standardizza)',
      '  tibble(lambda1 = pc$sdev[1]^2, angolo = acos(min(1, abs(sum(pc$rotation[, 1] * v1)))) * 180 / pi)', '})',
      'repliche |> summarise(media_lambda1 = mean(lambda1), sd_lambda1 = sd(lambda1), media_sin2 = mean(sin(angolo * pi / 180)^2))', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'ggplot(repliche, aes(angolo)) + geom_histogram(bins = 30, fill = "#9A3412", alpha = 0.5) +', '  labs(x = "angolo tra PC1 stimata e vera (gradi)") + theme_statatlas()',
      'biplot(pc, scale = 0)   # convenzione diversa da StatAtlas: frecce = loading, score non riscalati', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Definizione</h3><p>Con Z la matrice dei dati centrati (n × p), S = ZᵀZ/(n − 1). Gli autovettori v₁, …, vₚ di S (ortonormali) sono le direzioni principali, gli autovalori λ₁ ≥ … ≥ λₚ le varianze degli <em>score</em> T = ZV.</p>' +
        '<div class="eq" data-tex="\\text{PVE}_j = \\frac{\\lambda_j}{\\sum_{l} \\lambda_l} \\qquad \\frac{\\|Z - T_k V_k^{\\top}\\|_F^2}{n} = \\frac{n - 1}{n}\\sum_{j > k} \\lambda_j"></div>' +
        '<h3>Due letture equivalenti</h3><p>Massima varianza: v₁ rende massima la varianza di Zv tra i vettori di norma 1. Migliore approssimazione: TₖVₖᵀ è la matrice di rango k più vicina a Z (teorema di Eckart–Young).</p>' +
        '<div class="callout warn">Standardizzare significa fare la PCA della matrice di correlazione: un oggetto diverso, con autovalori e assi diversi. Si sceglie prima di guardare i risultati, in base al significato delle unità di misura.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Distribuzione asintotica</h3><p>Con dati normali e autovalori distinti, √n(λ̂ⱼ − λⱼ) → N(0, 2λⱼ²) e √n(v̂₁ − v₁) → N(0, Σⱼ≠₁ λ₁λⱼ/(λ₁ − λⱼ)² vⱼvⱼᵀ) (Anderson, 1963): l’incertezza sull’asse esplode quando λ₂ si avvicina a λ₁. La media di λ̂₁ è distorta verso l’alto di circa (1/n) Σⱼ≠₁ λ₁λⱼ/(λ₁ − λⱼ).</p>' +
        '<h3>Autovalori ripetuti</h3><p>Se λ₁ = λ₂ ogni base ortonormale del sottospazio comune è ugualmente valida: l’angolo di PC1 con un asse “vero” è casuale, mentre la distanza tra i proiettori del sottospazio resta una quantità ben definita.</p>' +
        '<h3>Molte variabili</h3><p>Quando p è dell’ordine di n, gli autovalori campionari si disperdono anche se tutti quelli della popolazione sono uguali (legge di Marchenko–Pastur): i primi autovalori sono sovrastimati, gli ultimi sottostimati.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  var builtP = 0;
  function restart() { run.stop(); S = newState(S); step(); legends(); interpretation(); codeBox.refresh(); if (S.p !== builtP) buildControls(); render(true); run.refresh(); }
  function render(full) { drawCloud(); drawMC(); if (full || run.frame % 3 === 0 || !run.running) { drawScree(); drawBiplot(); drawRecon(); updateTable(); } }
  function redrawK() { legends(); drawCloud(); drawScree(); drawRecon(); updateTable(); codeBox.refresh(); }
  function buildControls() {
    ctrlBox.innerHTML = ''; builtP = S.p;
    var sel = function (lab, key, vals, fmtv) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    var chk = function (lab, key) { return el('label.field', { style: 'flex-direction:row;display:flex;gap:8px;align-items:center' }, el('input', { type: 'checkbox', checked: S[key], onchange: function () { S[key] = this.checked; restart(); } }), el('span', lab)); };
    ctrlBox.append(
      SA.ui.slider('Varianza del primo asse λ₁ (λ₂ = 1)', { min: 1, max: 10, step: 0.5, value: S.rho, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.rho = v; restart(); } }),
      SA.ui.slider('Angolo θ del primo asse (gradi)', { min: 0, max: 90, step: 5, value: S.theta, format: function (v) { return v + '°'; }, onchange: function (v) { S.theta = v; restart(); } }),
      SA.ui.slider('Componenti mantenute k', { min: 1, max: S.p, step: 1, value: S.k, format: function (v) { return String(v); }, onchange: function (v) { S.k = v; redrawK(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('Variabili p', 'p', [2, 3, 4, 5, 6]), sel('n', 'n', [30, 80, 200]), sel('Unità di x₂', 'unit', [1, 10], function (v) { return '× ' + v; }), sel('Campioni B', 'B', [100, 500, 1000]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))),
      chk('Standardizza (PCA sulla correlazione)', 'std'), chk('Aggiungi un valore anomalo', 'outlier'));
    run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('pca', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k0 >= S.B; }, progress: function () { return S.k0 / S.B; }, reset: function () { S = newState(S); step(); } });
      var openT = function (l) { SA.ui.openDrawer('Componenti principali', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Molte variabili, poche direzioni importanti: la PCA trova gli assi lungo cui i dati variano di più e dice quanta informazione si perde tenendone solo alcuni.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Come descrivere dati multivariati con poche direzioni che conservano la maggior parte della varianza?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Assi, varianza, ricostruzione');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); figC = el('div'); figD = el('div'); figE = el('div'); legA = el('div.legend'); legC = el('div.legend');
      var two = function (a, b) { return el('div.duo', a, b); };
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        two(el('div.fig', el('div.fig-title', el('h3', 'Dati centrati e assi principali'), legA), figA), el('div.fig', el('div.fig-title', el('h3', 'Biplot'), legC), figC)),
        two(el('div.fig', el('div.fig-title', el('h3', 'Varianza spiegata'), el('div.legend', el('span.muted', 'barre: quota per componente · linea: cumulata · rombi: popolazione'))), figB), el('div.fig', el('div.fig-title', el('h3', 'Errore di ricostruzione'), el('div.legend', el('span.muted', 'in arancio il k scelto'))), figD)),
        el('div.fig', el('div.fig-title', el('h3', 'Quanto è stabile la prima direzione nei campioni ripetuti')), figE),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [S.cur.X[0].map(function (v, j) { return 'x' + (j + 1); })]; S.cur.X.forEach(function (x) { rows.push(x); }); SA.ui.download('statatlas_lab21_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Score CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var rows = [S.cur.P.T[0].map(function (v, j) { return 'PC' + (j + 1); })]; S.cur.P.T.forEach(function (t) { rows.push(t); }); SA.ui.download('statatlas_lab21_score.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab21.png', ['Componenti principali', 'p = ' + S.p + ' · λ₁ = ' + S.rho + ' · θ = ' + S.theta + '° · n = ' + S.n + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Popolazione / teoria'), el('th', 'Campione / simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' esatto (o identità algebrica)'), el('span', SA.ui.badge('asym'), ' asintotico, dati normali'), el('span', SA.ui.badge('mc'), ' Monte Carlo')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Asintotica di Anderson, autovalori ripetuti, molte variabili (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi dati, prcomp'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab21_pca.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati (R0) e stessi autovalori, quote di varianza ed errori (R1); i segni degli autovettori si allineano con la stessa convenzione. Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      step(); buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
