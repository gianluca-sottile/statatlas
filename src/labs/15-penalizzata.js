/* StatAtlas · Lab 15 — Regressione penalizzata: ridge, lasso, elastic net.
 * Vista 1: spazio delle soluzioni in (β₁, β₂). Vista 2: percorsi di regolarizzazione e
 * scomposizione distorsione²–varianza per p = 8 predittori (discesa coordinata, obiettivo di glmnet). */
(function () {
  var el, S, P8 = 8, BETA = [3, 1.5, 0, 0, 2, 0, 0, 0], SIGMA = 3, NL = 40;
  var PEN = { ridge: 'Ridge', lasso: 'Lasso', enet: 'Elastic net' };
  function mix(pen) { return pen === 'ridge' ? 0 : pen === 'lasso' ? 1 : S.alpha; }
  function soft(z, g) { return z > g ? z - g : z < -g ? z + g : 0; }

  /* ---------- vista 1: geometria in due dimensioni ---------- */
  // Q(b) = ½ (b − β̂)ᵀ Σ (b − β̂), Σ = [[1, r], [r, 1]]; vincolo g(b) = a‖b‖₁ + (1 − a)‖b‖₂² ≤ s, s = a t + (1 − a) t²
  function g2(b, a) { return a * (Math.abs(b[0]) + Math.abs(b[1])) + (1 - a) * (b[0] * b[0] + b[1] * b[1]); }
  function budget(t, a) { return a * t + (1 - a) * t * t; }
  function solveLam(lam, a) {
    var r = S.r, c = [S.bh[0] + r * S.bh[1], r * S.bh[0] + S.bh[1]], b = [S.bh[0], S.bh[1]];
    for (var it = 0; it < 500; it++) {
      var o0 = b[0], o1 = b[1];
      b[0] = soft(c[0] - r * b[1], lam * a) / (1 + 2 * lam * (1 - a));
      b[1] = soft(c[1] - r * b[0], lam * a) / (1 + 2 * lam * (1 - a));
      if (Math.abs(b[0] - o0) + Math.abs(b[1] - o1) < 1e-12) break;
    }
    return b;
  }
  function solveBudget(t, a) {
    var s = budget(t, a);
    if (g2(S.bh, a) <= s) return { b: S.bh.slice(), lam: 0 };
    var lo = 0, hi = 1; while (g2(solveLam(hi, a), a) > s && hi < 1e6) hi *= 2;
    for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (g2(solveLam(m, a), a) > s) lo = m; else hi = m; }
    return { b: solveLam(hi, a), lam: hi };
  }

  /* ---------- vista 2: p = 8 predittori ---------- */
  function cholUpper(r, p) { // Σᵢⱼ = ρ^|i−j| (autoregressiva, definita positiva per ogni |ρ| < 1); restituisce L = Uᵀ, Σ = UᵀU come chol() in R
    var A = [], L = [], i, j, k;
    for (i = 0; i < p; i++) { A.push([]); L.push(new Float64Array(p)); for (j = 0; j < p; j++) A[i].push(Math.pow(r, Math.abs(i - j))); }
    for (i = 0; i < p; i++) for (j = 0; j <= i; j++) {
      var s = A[i][j]; for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j];
    }
    return L; // L[i][j] = U[j][i]
  }
  function buildDesign() {
    var n = S.n, L = cholUpper(S.r, P8), Z = [], i, j, k;
    for (i = 0; i < n; i++) { var z = new Float64Array(P8); for (j = 0; j < P8; j++) z[j] = S.rng.norm(); Z.push(z); }
    S.X = Z.map(function (z) { var x = new Float64Array(P8); for (j = 0; j < P8; j++) { var s = 0; for (k = 0; k <= j; k++) s += z[k] * L[j][k]; x[j] = s; } return x; });
    S.mx = new Float64Array(P8); S.sd = new Float64Array(P8);
    for (j = 0; j < P8; j++) { var m = 0, v = 0; for (i = 0; i < n; i++) m += S.X[i][j] / n; for (i = 0; i < n; i++) v += (S.X[i][j] - m) * (S.X[i][j] - m) / n; S.mx[j] = m; S.sd[j] = Math.sqrt(v); }
    S.Xs = S.X.map(function (x) { var o = new Float64Array(P8); for (j = 0; j < P8; j++) o[j] = (x[j] - S.mx[j]) / S.sd[j]; return o; });
  }
  function newY() {
    var y = new Float64Array(S.n);
    for (var i = 0; i < S.n; i++) { var m = 0; for (var j = 0; j < P8; j++) m += S.X[i][j] * BETA[j]; y[i] = m + SIGMA * S.rng.norm(); }
    return y;
  }
  /* discesa coordinata per (1/2n)‖y − Xb‖² + λ[(1 − a)/2 ‖b‖² + a‖b‖₁], X standardizzata; coefficienti riportati sulla scala originale */
  function path(y, a, grid) {
    var n = S.n, ym = 0, i, j, b = new Float64Array(P8), res = new Float64Array(n), out = [];
    for (i = 0; i < n; i++) ym += y[i] / n;
    for (i = 0; i < n; i++) res[i] = y[i] - ym;
    grid.forEach(function (lam) {
      for (var it = 0; it < 1000; it++) {
        var maxd = 0;
        for (j = 0; j < P8; j++) {
          var z = 0; for (i = 0; i < n; i++) z += S.Xs[i][j] * res[i]; z = z / n + b[j];
          var nb = soft(z, lam * a) / (1 + lam * (1 - a)), d = nb - b[j];
          if (d !== 0) { for (i = 0; i < n; i++) res[i] -= d * S.Xs[i][j]; b[j] = nb; maxd = Math.max(maxd, Math.abs(d)); }
        }
        if (maxd < 1e-8) break;
      }
      out.push(Array.prototype.map.call(b, function (v, k) { return v / S.sd[k]; }));
    });
    return out;
  }

  function newState(prev) {
    var s = { view: 'geo', pen: 'lasso', alpha: 0.5, r: 0.5, bh: [1.8, 0.4], t: 1, n: 50, M: 300, seed: 2026, lamIdx: 20, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.lastPath = null;
    return s;
  }
  function initPath() {
    buildDesign();
    var y = newY(), a = Math.max(mix(S.pen), 0.05), ym = SA.stat.mean(y), mx = 0;
    for (var j = 0; j < P8; j++) { var z = 0; for (var i = 0; i < S.n; i++) z += S.Xs[i][j] * (y[i] - ym); mx = Math.max(mx, Math.abs(z) / S.n); }
    var lmax = mx / a; S.grid = []; for (var l = 0; l < NL; l++) S.grid.push(lmax * Math.pow(1e-3, l / (NL - 1)));
    S.firstY = y; S.sum = S.grid.map(function () { return new Float64Array(P8); }); S.sum2 = S.grid.map(function () { return new Float64Array(P8); }); S.nz = new Float64Array(NL);
    S.olsSum = new Float64Array(P8); S.olsSum2 = new Float64Array(P8);
    accumulate(y);
  }
  function accumulate(y) {
    var a = mix(S.pen), pth = path(y, a, S.grid), ols = path(y, 0, [0])[0];
    pth.forEach(function (b, l) { for (var j = 0; j < P8; j++) { S.sum[l][j] += b[j]; S.sum2[l][j] += b[j] * b[j]; if (Math.abs(b[j]) > 1e-10) S.nz[l]++; } });
    for (var j = 0; j < P8; j++) { S.olsSum[j] += ols[j]; S.olsSum2[j] += ols[j] * ols[j]; }
    S.lastPath = pth; S.k++;
  }
  function step() { if (S.view !== 'path' || S.k >= S.M) return false; accumulate(newY()); return true; }
  function biasVar(l) {
    var k = S.k, b2 = 0, v = 0;
    for (var j = 0; j < P8; j++) { var m = S.sum[l][j] / k, q = S.sum2[l][j] / k; b2 += (m - BETA[j]) * (m - BETA[j]); v += Math.max(0, q - m * m) * k / Math.max(1, k - 1); }
    return { b2: b2, v: v, mse: b2 + v };
  }
  function olsMse() { var k = S.k, s = 0; for (var j = 0; j < P8; j++) { var m = S.olsSum[j] / k; s += (m - BETA[j]) * (m - BETA[j]) + Math.max(0, S.olsSum2[j] / k - m * m) * k / Math.max(1, k - 1); } return s; }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB, titA, titB, frameA = null, drag = false;
  function drawGeo() {
    var P = SA.plot, Sz = 520, m = { t: 16, r: 16, b: 42, l: 48 };
    var f = frameA = P.frame(figA, { W: m.l + m.r + Sz, H: m.t + m.b + Sz, m: m, x: [-2.5, 2.5], y: [-2.5, 2.5], xlabel: 'β₁', ylabel: 'β₂', label: 'Spazio delle soluzioni' });
    var t = f.t, g = f.g, a = mix(S.pen), i;
    f.root.style.touchAction = 'none';
    P.svg('line', { x1: f.x(-2.5), x2: f.x(2.5), y1: f.y(0), y2: f.y(0), stroke: t.rule_2 }, g);
    P.svg('line', { x1: f.x(0), x2: f.x(0), y1: f.y(-2.5), y2: f.y(2.5), stroke: t.rule_2 }, g);
    var sol = solveBudget(S.t, a), r = S.r, q0 = Q(sol.b);
    function Q(b) { var d0 = b[0] - S.bh[0], d1 = b[1] - S.bh[1]; return 0.5 * (d0 * d0 + 2 * r * d0 * d1 + d1 * d1); }
    function ell(c) { // {b : Q(b) = c}
      var l1 = 1 + r, l2 = 1 - r, pts = [];
      for (i = 0; i <= 120; i++) { var th = 2 * Math.PI * i / 120, u = Math.sqrt(2 * c / l1) * Math.cos(th), v = Math.sqrt(2 * c / l2) * Math.sin(th);
        pts.push([f.x(S.bh[0] + (u + v) / Math.SQRT2), f.y(S.bh[1] + (u - v) / Math.SQRT2)]); }
      return P.path(pts) + 'Z';
    }
    // regione di vincolo
    var s = budget(S.t, a), reg = [];
    for (i = 0; i <= 240; i++) { var ph = 2 * Math.PI * i / 240, cs = Math.cos(ph), sn = Math.sin(ph), A = a * (Math.abs(cs) + Math.abs(sn)), B = 1 - a;
      var rad = B > 1e-12 ? (-A + Math.sqrt(A * A + 4 * B * s)) / (2 * B) : s / A; reg.push([f.x(rad * cs), f.y(rad * sn)]); }
    P.svg('path', { d: P.path(reg) + 'Z', fill: t.c1, 'fill-opacity': 0.14, stroke: t.c1, 'stroke-width': 2 }, g);
    // curve di livello della somma dei quadrati dei residui
    [0.15, 0.5, 1.5, 3].forEach(function (k) { if (q0 > 0) P.svg('path', { d: ell(q0 * k), fill: 'none', stroke: t.ink_3, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g); });
    if (q0 > 0) P.svg('path', { d: ell(q0), fill: 'none', stroke: t.c2, 'stroke-width': 2.2 }, g);
    // percorso della soluzione al variare del vincolo
    var tmax = Math.max(Math.abs(S.bh[0]) + Math.abs(S.bh[1]), Math.hypot(S.bh[0], S.bh[1])) + 0.2, pp = [];
    for (i = 0; i <= 60; i++) { var bb = solveBudget(tmax * i / 60, a).b; pp.push([f.x(bb[0]), f.y(bb[1])]); }
    P.svg('path', { d: P.path(pp), fill: 'none', stroke: t.accent, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
    P.marker(g, 'tri', f.x(S.bh[0]), f.y(S.bh[1]), 15, t.c2, t.card).setAttribute('style', 'cursor:grab');
    P.text(g, f.x(S.bh[0]) + 10, f.y(S.bh[1]) - 8, 'β̂ minimi quadrati (trascinami)', { fill: t.c2, 'font-size': 12, 'font-weight': 600 });
    P.svg('circle', { cx: f.x(sol.b[0]), cy: f.y(sol.b[1]), r: 7, fill: t.accent, stroke: t.card, 'stroke-width': 2 }, g);
    var zero = Math.abs(sol.b[0]) < 1e-9 || Math.abs(sol.b[1]) < 1e-9;
    P.text(g, f.x(sol.b[0]) + 10, f.y(sol.b[1]) + 18, PEN[S.pen] + ': (' + SA.fmt(sol.b[0], 2) + '; ' + SA.fmt(sol.b[1], 2) + ')' + (zero ? ' · un coefficiente è esattamente 0' : ''), { fill: t.accent, 'font-size': 12, 'font-weight': 700 });
    S.geoSol = sol;
  }
  function drawPaths() {
    var P = SA.plot, lg = S.grid.map(Math.log10), x0 = lg[NL - 1], x1 = lg[0], pth = S.lastPath, ymin = -1, ymax = 4;
    var f = P.frame(figA, { W: 720, H: 340, x: [+x0.toFixed(2), +x1.toFixed(2)], y: [ymin, ymax], xlabel: 'log₁₀ λ', ylabel: 'coefficienti', label: 'Percorsi di regolarizzazione' });
    var t = f.t, g = f.g, cols = { 0: t.c1, 1: t.c3, 4: t.c2 };
    P.svg('line', { x1: f.x(x0), x2: f.x(x1), y1: f.y(0), y2: f.y(0), stroke: t.rule_2 }, g);
    for (var j = 0; j < P8; j++) {
      var pts = pth.map(function (b, l) { return [f.x(lg[l]), f.y(Math.max(ymin, Math.min(ymax, b[j])))]; });
      P.svg('path', { d: P.path(pts), fill: 'none', stroke: cols[j] || t.ink_3, 'stroke-width': cols[j] ? 2.4 : 1.2, 'stroke-opacity': cols[j] ? 1 : 0.7 }, g);
      if (cols[j]) P.svg('line', { x1: f.x(x0), x2: f.x(x0) + 18, y1: f.y(BETA[j]), y2: f.y(BETA[j]), stroke: cols[j], 'stroke-width': 3 }, g);
    }
    var xl = f.x(lg[S.lamIdx]);
    P.svg('line', { x1: xl, x2: xl, y1: f.m.t, y2: f.y(ymin), stroke: t.accent, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g);
    P.text(g, xl + 5, f.m.t + 12, 'λ = ' + SA.fmt(S.grid[S.lamIdx], 3), { fill: t.accent, 'font-size': 12, 'font-weight': 600 });
  }
  function drawBV() {
    var P = SA.plot, lg = S.grid.map(Math.log10), bv = S.grid.map(function (_, l) { return biasVar(l); }), om = olsMse();
    var top = Math.max(om * 1.6, Math.max.apply(null, bv.map(function (v) { return Math.min(v.mse, om * 3); })) * 1.1);
    var f = P.frame(figB, { W: 720, H: 260, x: [+lg[NL - 1].toFixed(2), +lg[0].toFixed(2)], y: [0, +top.toPrecision(2)], xlabel: 'log₁₀ λ', ylabel: 'errore quadratico medio', label: 'Distorsione e varianza' });
    var t = f.t, g = f.g, cl = function (v) { return Math.max(f.m.t, f.y(v)); };
    [['b2', t.c2, '7 4'], ['v', t.c1, '2 3'], ['mse', t.ink, null]].forEach(function (c) {
      P.svg('path', { d: P.path(bv.map(function (v, l) { return [f.x(lg[l]), cl(v[c[0]])]; })), fill: 'none', stroke: c[1], 'stroke-width': c[0] === 'mse' ? 2.6 : 2, 'stroke-dasharray': c[2] }, g);
    });
    P.svg('line', { x1: f.x(lg[NL - 1]), x2: f.x(lg[0]), y1: cl(om), y2: cl(om), stroke: t.c3, 'stroke-dasharray': '6 4' }, g);
    var best = 0; bv.forEach(function (v, l) { if (v.mse < bv[best].mse) best = l; });
    P.marker(g, 'circle', f.x(lg[best]), cl(bv[best].mse), 11, t.accent);
    P.svg('line', { x1: f.x(lg[S.lamIdx]), x2: f.x(lg[S.lamIdx]), y1: f.m.t, y2: f.y(0), stroke: t.accent, 'stroke-dasharray': '4 3' }, g);
    P.text(g, f.m.l + 8, f.m.t + 12, S.k + ' campioni · minimo dell’errore a λ ≈ ' + SA.fmt(S.grid[best], 3), { fill: t.ink_3, 'font-size': 11.5 });
    S.best = best;
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = ''; legB.innerHTML = '';
    if (S.view === 'geo') {
      titA.textContent = 'Lo spazio delle soluzioni (β₁, β₂)';
      legA.append(el('span', sw(t.c1, null), 'regione di vincolo'), el('span', sw(t.c2, null), 'curva di livello che tocca la regione'), el('span', sw(t.ink_3, '3 3'), 'altre curve di livello di RSS'), el('span', sw(t.accent, '5 4', 'circle'), 'soluzione e suo percorso al variare di t'));
    } else {
      titA.textContent = 'Percorsi dei coefficienti (campione corrente)';
      legA.append(el('span', sw(t.c1, null), 'β₁ = 3'), el('span', sw(t.c3, null), 'β₂ = 1,5'), el('span', sw(t.c2, null), 'β₅ = 2'), el('span', sw(t.ink_3, null), 'coefficienti veri nulli'));
      legB.append(el('span', sw(t.ink, null), 'errore quadratico medio'), el('span', sw(t.c2, '7 4'), 'distorsione²'), el('span', sw(t.c1, '2 3'), 'varianza'), el('span', sw(t.c3, '6 4'), 'minimi quadrati'));
    }
  }

  /* ---------- tabella ---------- */
  var tblHead, tblBody, kpiBox, fbBox, interpBox, predBox, figBWrap;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge;
    tblBody.innerHTML = ''; kpiBox.innerHTML = '';
    if (S.view === 'geo') {
      tblHead.innerHTML = '<tr><th>Penalizzazione</th><th>β₁</th><th>β₂</th><th>Coefficienti nulli</th><th>λ equivalente</th></tr>';
      ['ridge', 'lasso', 'enet'].forEach(function (p) {
        var a = p === 'ridge' ? 0 : p === 'lasso' ? 1 : S.alpha, so = solveBudget(S.t, a), z = (Math.abs(so.b[0]) < 1e-9) + (Math.abs(so.b[1]) < 1e-9);
        tblBody.appendChild(el('tr' + (p === S.pen ? '.row-sel' : ''), el('td', PEN[p] + (p === 'enet' ? ' (α = ' + fmt(S.alpha, 2) + ')' : '')), el('td', fmt(so.b[0], 4)), el('td', fmt(so.b[1], 4)), el('td', String(z)), el('td', fmt(so.lam, 4))));
      });
      kpiBox.append(el('div.kpi', el('b', '(' + fmt(S.bh[0], 2) + '; ' + fmt(S.bh[1], 2) + ')'), el('span', 'stima dei minimi quadrati β̂')),
        el('div.kpi', el('b', fmt(S.t, 2)), el('span', 'ampiezza del vincolo t')), el('div.kpi', el('b', fmt(S.r, 2)), el('span', 'correlazione tra i due predittori')));
    } else {
      var bv = biasVar(S.lamIdx), om = olsMse();
      tblHead.innerHTML = '<tr><th>Quantità (λ selezionato)</th><th>Penalizzata</th><th>Minimi quadrati</th><th>Natura</th></tr>';
      tblBody.append(el('tr', el('td', 'Errore quadratico medio Σ E(β̂ⱼ − βⱼ)²'), el('td', fmt(bv.mse, 3)), el('td', fmt(om, 3)), el('td', b('mc'))),
        el('tr', el('td', 'Distorsione²'), el('td', fmt(bv.b2, 3)), el('td', '≈ 0'), el('td', b('mc'))),
        el('tr', el('td', 'Varianza totale'), el('td', fmt(bv.v, 3)), el('td', fmt(om, 3)), el('td', b('mc'))),
        el('tr', el('td', 'Numero medio di coefficienti non nulli'), el('td', fmt(S.nz[S.lamIdx] / S.k, 2)), el('td', '8'), el('td', b('mc'))));
      kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.M), el('span', 'campioni (disegno X fisso)')),
        el('div.kpi', el('b', fmt(S.grid[S.best || 0], 3)), el('span', 'λ con errore minimo nella simulazione')),
        el('div.kpi', el('b', fmt(100 * (1 - biasVar(S.best || 0).mse / om), 1) + '%'), el('span', 'riduzione dell’errore rispetto ai minimi quadrati')));
    }
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p15-' + Date.now();
    predBox.append(el('p.prose', 'Stringendo il vincolo sui coefficienti, quale penalizzazione porta un coefficiente esattamente a zero?'),
      el('div.choices', { role: 'radiogroup' }, [['ridge', 'Ridge'], ['lasso', 'Lasso (ed elastic net)'], ['none', 'Nessuna: le stime si riducono soltanto']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'lasso' ? '✓ ' : '✗ ') + 'La regione del lasso ha spigoli sugli assi: la curva di livello la tocca spesso proprio lì, dove un coefficiente vale 0. Il cerchio del ridge non ha spigoli: le stime si riducono ma restano diverse da zero. L’elastic net ha spigoli (selezione) ma lati curvi (stabilità con predittori correlati).';
  }
  function interpretation() {
    interpBox.innerHTML = S.view === 'geo'
      ? '<p>Minimizzare la somma dei quadrati dei residui con un vincolo sui coefficienti equivale a cercare la <strong>prima curva di livello</strong> (ellisse) che tocca la regione ammessa. Per il <strong>ridge</strong> la regione è un cerchio: il contatto avviene quasi sempre lontano dagli assi. Per il <strong>lasso</strong> è un rombo con spigoli sugli assi: il contatto avviene spesso su uno spigolo, e lì un coefficiente è esattamente nullo. L’<strong>elastic net</strong> unisce spigoli e curvatura.</p><p>Cambia la correlazione: con ρ &gt; 0 le ellissi si allungano lungo la direzione (1, −1), con ρ &lt; 0 lungo (1, 1). Con predittori correlati il lasso diventa instabile nello scegliere quale coefficiente azzerare; ridge ed elastic net ripartiscono il peso. Nota: quando il contatto avviene su un lato del rombo parallelo a un asse dell’ellisse, il punto di contatto non dipende da ρ (cambia solo il λ equivalente): sposta la stima dei minimi quadrati per vederlo. La linea arancione tratteggiata è il percorso della soluzione al variare di t: dall’origine (t = 0) ai minimi quadrati.</p>'
      : '<p>Con 8 predittori con correlazione ρ<sup>|i−j|</sup> (lo schema di simulazione di Tibshirani, 1996), di cui 5 inutili, i minimi quadrati sono non distorti ma molto variabili. La penalizzazione introduce <strong>distorsione</strong> (stime ridotte verso zero) e in cambio riduce la <strong>varianza</strong>: per valori intermedi di λ l’errore quadratico medio complessivo è inferiore a quello dei minimi quadrati.</p><p>Nei percorsi, il lasso azzera i coefficienti uno dopo l’altro al crescere di λ; il ridge li riduce tutti insieme senza azzerarli. Nella pratica λ si sceglie per validazione incrociata (<code>cv.glmnet</code>), che stima l’errore di previsione invece di quello sui coefficienti, ignoto nei dati reali.</p>';
  }
  function codeR() {
    var a = mix(S.pen);
    if (S.view === 'geo') return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 15 — ' + PEN[S.pen] + ': lo spazio delle soluzioni in due dimensioni', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'bh <- c(' + S.bh.map(function (v) { return +v.toFixed(4); }).join(', ') + ')   # stima dei minimi quadrati', 'r  <- ' + S.r + '; a <- ' + a + '; t <- ' + S.t,
      'Sigma <- matrix(c(1, r, r, 1), 2)', '', '# Q(b) = ½ (b − bh)ᵀ Σ (b − bh); vincolo a‖b‖₁ + (1 − a)‖b‖₂² ≤ a t + (1 − a) t²',
      'Q <- function(b) 0.5 * drop(t(b - bh) %*% Sigma %*% (b - bh))', 'g <- function(b) a * sum(abs(b)) + (1 - a) * sum(b^2)',
      'soglia <- function(z, l) sign(z) * pmax(abs(z) - l, 0)', 'pen_lambda <- function(lam) {   # discesa coordinata, come in StatAtlas',
      '  c0 <- drop(Sigma %*% bh); b <- bh', '  for (it in 1:500) { b_old <- b', '    b[1] <- soglia(c0[1] - r * b[2], lam * a) / (1 + 2 * lam * (1 - a))',
      '    b[2] <- soglia(c0[2] - r * b[1], lam * a) / (1 + 2 * lam * (1 - a))', '    if (sum(abs(b - b_old)) < 1e-12) break }', '  b', '}',
      's <- a * t + (1 - a) * t^2', 'lam <- if (g(bh) <= s) 0 else uniroot(\\(l) g(pen_lambda(l)) - s, c(0, 1e4), tol = 1e-12)$root',
      'b_star <- pen_lambda(lam); b_star', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'griglia <- expand_grid(b1 = seq(-2.5, 2.5, length.out = 201), b2 = seq(-2.5, 2.5, length.out = 201)) |>',
      '  mutate(rss = map2_dbl(b1, b2, \\(x, y) Q(c(x, y))), dentro = map2_lgl(b1, b2, \\(x, y) g(c(x, y)) <= s))',
      'ggplot(griglia, aes(b1, b2)) +', '  geom_raster(aes(fill = dentro), alpha = 0.25, show.legend = FALSE) +',
      '  geom_contour(aes(z = rss), breaks = Q(b_star) * c(0.15, 0.5, 1, 1.5, 3), colour = "grey40") +',
      '  annotate("point", x = bh[1], y = bh[2], shape = 17, size = 3, colour = "#D55E00") +',
      '  annotate("point", x = b_star[1], y = b_star[2], size = 3, colour = "#9A3412") +',
      '  scale_fill_manual(values = c(`FALSE` = NA, `TRUE` = "#0072B2")) +', '  coord_equal() + labs(x = expression(beta[1]), y = expression(beta[2]), title = "' + PEN[S.pen] + '") +', '  theme_statatlas()', ''].join('\n');
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 15 — ' + PEN[S.pen] + ': percorsi e distorsione–varianza', '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', 'library(glmnet)   # per il confronto con lo standard', '', 'set.seed(' + S.seed + ')',
      'n <- ' + S.n + '; p <- 8; r <- ' + S.r + '; sigma <- 3; a <- ' + a + '; M <- ' + S.M, 'beta <- c(3, 1.5, 0, 0, 2, 0, 0, 0)',
      'Sigma <- r^abs(outer(1:p, 1:p, "-"))   # correlazione ρ^|i−j| (Tibshirani, 1996)', 'Z <- matrix(rnorm(n * p), n, p, byrow = TRUE)', 'X <- Z %*% chol(Sigma)              # disegno fisso', '',
      '# Discesa coordinata per (1/2n)‖y − Xb‖² + λ[(1 − a)/2 ‖b‖² + a‖b‖₁] con X standardizzata (stesso algoritmo di StatAtlas)',
      'Xs <- scale(X, scale = apply(X, 2, \\(v) sqrt(mean((v - mean(v))^2))))', 'sdx <- attr(Xs, "scaled:scale")',
      'percorso <- function(y, lambdas) {', '  res <- y - mean(y); b <- numeric(p)', '  sapply(lambdas, \\(lam) {', '    for (it in 1:1000) { maxd <- 0',
      '      for (j in 1:p) { z <- sum(Xs[, j] * res) / n + b[j]', '        nb <- sign(z) * max(abs(z) - lam * a, 0) / (1 + lam * (1 - a))',
      '        res <- res - (nb - b[j]) * Xs[, j]; maxd <- max(maxd, abs(nb - b[j])); b[j] <- nb }', '      if (maxd < 1e-8) break }', '    b / sdx', '  })', '}', '',
      'y1 <- drop(X %*% beta + sigma * rnorm(n))', 'lmax <- max(abs(crossprod(Xs, y1 - mean(y1)))) / n / max(a, 0.05)',
      'lambdas <- lmax * 10^(-3 * (0:' + (NL - 1) + ') / ' + (NL - 1) + ')', '',
      '# Percorsi del primo campione', 'B1 <- percorso(y1, lambdas)',
      'matplot(log10(lambdas), t(B1), type = "l", lty = 1, lwd = 2, col = ifelse(beta != 0, "#0072B2", "grey60"),', '        xlab = expression(log[10] ~ lambda), ylab = "coefficienti", main = "Percorsi: ' + PEN[S.pen] + '")', 'abline(h = 0, col = "grey80")', '',
      '# Confronto con glmnet (per a < 1 glmnet riscala y internamente: piccole differenze sono attese)',
      'coef(glmnet(X, y1, alpha = a, lambda = lambdas[' + (S.lamIdx + 1) + ']))', '',
      '# Distorsione² e varianza su M campioni con X fisso',
      'stime <- map(seq_len(M - 1), \\(m) percorso(drop(X %*% beta + sigma * rnorm(n)), lambdas))', 'stime <- c(list(B1), stime)',
      'media <- Reduce(`+`, stime) / M', 'distorsione2 <- colSums((media - beta)^2)', 'varianza <- colSums(Reduce(`+`, map(stime, \\(B) (B - media)^2)) / (M - 1))',
      'tibble(log_lambda = log10(lambdas), distorsione2, varianza, mse = distorsione2 + varianza) |>',
      '  pivot_longer(-log_lambda) |>', '  ggplot(aes(log_lambda, value, colour = name)) + geom_line(linewidth = 1) +',
      '  labs(x = expression(log[10] ~ lambda), y = NULL, colour = NULL, title = "Distorsione e varianza") + theme_minimal()', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Tre penalizzazioni</h3><div class="eq">min (1/2n)‖y − Xβ‖² + λ [ (1 − α)/2 ‖β‖₂² + α‖β‖₁ ]</div><p>α = 0: <strong>ridge</strong>; α = 1: <strong>lasso</strong>; 0 &lt; α &lt; 1: <strong>elastic net</strong>. È la forma usata da <code>glmnet</code>. Equivale a minimizzare la somma dei quadrati dei residui con un vincolo sulla norma dei coefficienti: ogni λ corrisponde a un’ampiezza t del vincolo.</p>' +
        '<h3>Perché penalizzare</h3><p>Con molti predittori, o predittori correlati, i minimi quadrati sono non distorti ma hanno varianza elevata. Ridurre i coefficienti verso zero introduce una piccola distorsione e diminuisce molto la varianza: l’errore complessivo può diminuire.</p>' +
        '<div class="callout warn">I predittori vanno standardizzati: la penalizzazione tratta tutti i coefficienti allo stesso modo, quindi dipende dalle unità di misura. <code>glmnet</code> lo fa per impostazione predefinita.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Soluzioni in forma chiusa</h3><p>Ridge: β̂ = (XᵀX + nλI)⁻¹Xᵀy, che esiste anche quando p &gt; n. Con predittori ortonormali: ridge β̂ⱼ<sup>OLS</sup>/(1 + λ), lasso S(β̂ⱼ<sup>OLS</sup>, λ) con S(z, γ) = sign(z)(|z| − γ)₊ (soglia morbida).</p>' +
        '<h3>Discesa coordinata</h3><p>Si aggiorna un coefficiente alla volta: βⱼ ← S(zⱼ, λα)/(1 + λ(1 − α)), con zⱼ il prodotto tra il predittore j e il residuo parziale. Con partenze a caldo lungo una griglia decrescente di λ si ottiene l’intero percorso in poche iterazioni (Friedman, Hastie e Tibshirani, 2010).</p>' +
        '<h3>Gradi di libertà e scelta di λ</h3><p>Per il lasso il numero di coefficienti non nulli è uno stimatore non distorto dei gradi di libertà (Zou, Hastie e Tibshirani, 2007). λ si sceglie per validazione incrociata; la regola “un errore standard” preferisce il modello più semplice entro un errore standard dal minimo.</p>' +
        '<h3>Effetto di raggruppamento</h3><p>Con predittori molto correlati il lasso tende a sceglierne uno solo, in modo instabile; l’elastic net li seleziona insieme con coefficienti simili (Zou e Hastie, 2005). Il lasso seleziona al più n variabili quando p &gt; n.</p>' +
        '<h3>Inferenza dopo la selezione</h3><p>Gli errori standard usuali non valgono dopo aver scelto le variabili con i dati: servono metodi di inferenza selettiva o il campionamento separato (sample splitting).</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); if (S.view === 'path') initPath(); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) {
    if (S.view === 'geo') { drawGeo(); figBWrap.hidden = true; }
    else { drawPaths(); drawBV(); figBWrap.hidden = false; }
    if (full || run.frame % 4 === 0 || !run.running) updateTable();
  }
  function toData(ev) {
    var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !frameA) return null;
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.max(-2.4, Math.min(2.4, frameA.x.invert(p.x))), Math.max(-2.4, Math.min(2.4, frameA.y.invert(p.y)))];
  }
  function bind() {
    figA.addEventListener('pointerdown', function (ev) { if (S.view !== 'geo') return; var q = toData(ev); if (!q) return; drag = true; S.bh = q; figA.setPointerCapture(ev.pointerId); drawGeo(); });
    figA.addEventListener('pointermove', function (ev) { if (!drag) return; var q = toData(ev); if (!q) return; S.bh = q; drawGeo(); });
    figA.addEventListener('pointerup', function () { if (!drag) return; drag = false; updateTable(); codeBox.refresh(); });
  }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var seg = el('div.seg', { role: 'group', 'aria-label': 'Vista' });
    [['geo', 'Spazio delle soluzioni'], ['path', 'Percorsi']].forEach(function (v) {
      seg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.view === v[0]), onclick: function () { if (S.view === v[0]) return; S.view = v[0]; buildControls(); restart(); } }, v[1]));
    });
    var penSeg = el('div.seg', { role: 'group', 'aria-label': 'Penalizzazione' });
    Object.keys(PEN).forEach(function (p) {
      penSeg.appendChild(el('button', { type: 'button', 'aria-pressed': String(S.pen === p), onclick: function () { S.pen = p; buildControls(); if (S.view === 'path') restart(); else { render(true); codeBox.refresh(); } } }, PEN[p]));
    });
    ctrlBox.append(el('div.field', el('span', 'Vista'), seg), el('div.field', el('span', 'Penalizzazione'), penSeg));
    if (S.pen === 'enet') ctrlBox.appendChild(SA.ui.slider('Miscela α (0 ridge, 1 lasso)', { min: 0.05, max: 0.95, step: 0.05, value: S.alpha, format: function (v) { return SA.fmt(v, 2); },
      oninput: function (v) { S.alpha = v; if (S.view === 'geo') drawGeo(); }, onchange: function (v) { S.alpha = v; if (S.view === 'path') restart(); else { updateTable(); codeBox.refresh(); } } }));
    ctrlBox.appendChild(SA.ui.slider(S.view === 'geo' ? 'Correlazione tra i predittori' : 'Correlazione ρ (Σᵢⱼ = ρ^|i−j|)', { min: -0.9, max: 0.95, step: 0.05, value: S.r, format: function (v) { return SA.fmt(v, 2); },
      oninput: function (v) { S.r = v; if (S.view === 'geo') drawGeo(); }, onchange: function (v) { S.r = v; if (S.view === 'path') restart(); else { updateTable(); codeBox.refresh(); } } }));
    if (S.view === 'geo') ctrlBox.appendChild(SA.ui.slider('Ampiezza del vincolo t', { min: 0.05, max: 2.5, step: 0.05, value: S.t, format: function (v) { return SA.fmt(v, 2); },
      oninput: function (v) { S.t = v; drawGeo(); }, onchange: function () { updateTable(); codeBox.refresh(); } }));
    else {
      ctrlBox.append(SA.ui.slider('λ (posizione nella griglia)', { min: 0, max: NL - 1, step: 1, value: S.lamIdx, format: function (v) { return S.grid ? SA.fmt(S.grid[v], 3) : String(v); },
        oninput: function (v) { S.lamIdx = v; render(true); }, onchange: function () { codeBox.refresh(); } }),
        el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
          el('label.field', el('span', 'n'), el('select', { onchange: function () { S.n = +this.value; restart(); } }, [30, 50, 100].map(function (v) { return el('option', { value: v, selected: v === S.n }, String(v)); }))),
          el('label.field', el('span', 'Campioni M'), el('select', { onchange: function () { S.M = +this.value; restart(); } }, [100, 300, 1000].map(function (v) { return el('option', { value: v, selected: v === S.M }, String(v)); }))),
          el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
      run.controls('Un nuovo campione').forEach(function (n) { ctrlBox.appendChild(n); });
    }
  }

  SA.registerLab('penalizzata', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.view !== 'path' || S.k >= S.M; }, progress: function () { return S.view === 'path' ? S.k / S.M : 0; }, reset: function () { S = newState(S); if (S.view === 'path') initPath(); } });
      var openT = function (l) { SA.ui.openDrawer('Regressione penalizzata', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Ridge, lasso ed elastic net: la stessa idea, regioni di vincolo diverse. La geometria spiega perché il lasso seleziona le variabili e il ridge no.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Perché rinunciare a stime non distorte può dare stime migliori?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Geometria e simulazione');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend'); titA = el('h3'); titB = el('h3', 'Distorsione², varianza ed errore quadratico medio');
      figBWrap = el('div.fig', el('div.fig-title', titB, legB), figB);
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', titA, legA), el('p.muted', { style: 'margin:2px 0 4px;font-size:.8rem' }, 'Nella vista geometrica trascina il triangolo (stima dei minimi quadrati) in un punto qualsiasi del piano.'), figA), figBWrap,
        el('div.toolbar', SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { var sv = [figA.querySelector('svg')]; if (S.view === 'path') sv.push(figB.querySelector('svg')); SA.ui.exportPNG(sv, 'statatlas_lab15_' + S.pen + '.png', [PEN[S.pen], 'correlazione ' + S.r]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblHead = el('thead'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', tblHead, tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Soglia morbida, discesa coordinata, scelta di λ (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stesso algoritmo, confronto con glmnet'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab15_penalizzata.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1, tidyverse e, per il confronto, glmnet.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      if (S.view === 'path') initPath();
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh(); bind();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
