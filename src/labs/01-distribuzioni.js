/* StatAtlas · Lab 01 — Distribuzioni e relazioni.
 * Osservazioni generate per inversione X = F⁻¹(U): stessi numeri di R con q*(runif(N)). */
(function () {
  var el, S, LAWS = SA.laws, BINS = 40;
  var N_VALUES = [100, 500, 1000, 5000, 10000];
  var SPEEDS = [{ label: 'Lenta', per: 1, every: 12 }, { label: 'Media', per: 1, every: 2 },
    { label: 'Veloce', per: 10, every: 1 }, { label: 'Turbo', per: 120, every: 1 }];

  /* ---------- stato ---------- */
  var memo = {}; // parametri ricordati per legge
  function defaults(law) { var p = {}; law.params.forEach(function (q) { p[q.key] = q.value; }); return p; }
  function newState(prev) {
    var s = { law: 'norm', N: 1000, seed: 2026, guess: null };
    if (prev) ['law', 'N', 'seed', 'guess', 'a', 'b'].forEach(function (k) { s[k] = prev[k]; });
    var law = LAWS.get(s.law);
    s.p = memo[s.law] || (memo[s.law] = defaults(law));
    if (law.fix) law.fix(s.p);
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.x = new Float64Array(s.N);
    if (law.kind === 'discrete') {
      s.lo = law.q(0.0005, s.p); s.hi = Math.max(s.lo + 1, law.q(0.9995, s.p));
      s.counts = new Uint32Array(s.hi - s.lo + 1);
    } else {
      var r = law.range(s.p); s.lo = r[0]; s.hi = r[1]; s.counts = new Uint32Array(BINS);
    }
    s.out = 0;
    var minA = law.kind === 'discrete' ? s.lo - 1 : s.lo;
    if (s.a == null || s.a < minA || s.b > s.hi || s.a >= s.b) setDefaultInterval(s, law);
    return s;
  }
  function setDefaultInterval(s, law) {
    var a = law.q(0.25, s.p), b = law.q(0.75, s.p);
    if (law.kind === 'discrete') { s.a = a - 1; s.b = b; if (s.a < s.lo - 1) s.a = s.lo - 1; }
    else { var st = step(s); s.a = Math.round(a / st) * st; s.b = Math.round(b / st) * st; if (s.b <= s.a) s.b = s.a + st; }
    s.a = +s.a.toPrecision(6); s.b = +s.b.toPrecision(6);
  }
  function step(s) { var w = (s.hi - s.lo) / 200, e = Math.pow(10, Math.floor(Math.log10(w))); return w / e >= 5 ? 5 * e : w / e >= 2 ? 2 * e : e; }
  function law() { return LAWS.get(S.law); }

  function draw1() {
    if (S.k >= S.N) return false;
    var L = law(), v = L.q(S.rng.unif(), S.p);
    S.x[S.k++] = v;
    if (L.kind === 'discrete') { var i = v - S.lo; if (i >= 0 && i < S.counts.length) S.counts[i]++; else S.out++; }
    else { var bw = (S.hi - S.lo) / BINS, b = Math.floor((v - S.lo) / bw); if (b >= 0 && b < BINS) S.counts[b]++; else S.out++; }
    return true;
  }

  /* ---------- teoria e statistiche ---------- */
  function theory() {
    var L = law(), p = S.p;
    return { mean: L.mean(p), var: L.var(p), median: L.q(0.5, p), prob: L.cdf(S.b, p) - L.cdf(S.a, p) };
  }
  function sim() {
    if (S.k < 2) return null;
    var x = S.x.subarray(0, S.k), srt = SA.stat.sorted(x), inn = 0;
    for (var i = 0; i < x.length; i++) if (x[i] > S.a && x[i] <= S.b) inn++;
    var sd = SA.stat.sd(x);
    return { mean: SA.stat.mean(x), var: sd * sd, median: SA.stat.quantile(srt, 0.5, true), prob: inn / x.length, sorted: srt, D: ksD(srt) };
  }
  function ksD(srt) { // sup |F_N − F|
    var L = law(), n = srt.length, D = 0, i;
    if (L.kind === 'continuous') {
      for (i = 0; i < n; i++) { var F = L.cdf(srt[i], S.p); D = Math.max(D, (i + 1) / n - F, F - i / n); }
    } else {
      var j = 0;
      for (var v = S.lo; v <= S.hi; v++) { while (j < n && srt[j] <= v) j++; D = Math.max(D, Math.abs(j / n - L.cdf(v, S.p))); }
    }
    return D;
  }
  function dkw(n) { return Math.sqrt(Math.log(2 / 0.05) / (2 * n)); }
  function momentTxt(v) { return isNaN(v) ? 'non esiste' : !isFinite(v) ? 'infinita' : SA.fmt(v, 4); }

  /* ---------- grafici ---------- */
  var figPdf, figCdf, statCache = null;
  function drawPdf() {
    var L = law(), t, P = SA.plot, disc = L.kind === 'discrete', lo = S.lo, hi = S.hi;
    var xr = disc ? [lo - 0.6, hi + 0.6] : [lo, hi], ys = [], i, ymax;
    if (disc) { for (i = lo; i <= hi; i++) ys.push(L.pmf(i, S.p)); ymax = Math.max.apply(null, ys); }
    else {
      for (i = 0; i <= 300; i++) { var xx = lo + (hi - lo) * i / 300, d = L.pdf(xx, S.p); ys.push(isFinite(d) ? d : 0); }
      var srt = ys.slice().sort(function (a, b) { return a - b; });
      ymax = Math.min(srt[srt.length - 1], 3 * srt[Math.floor(srt.length * 0.9)]);
    }
    if (S.k > 0) {
      var bw = disc ? 1 : (hi - lo) / BINS;
      for (i = 0; i < S.counts.length; i++) ymax = Math.max(ymax, Math.min(S.counts[i] / (S.k * bw), ymax * 1.6));
    }
    ymax = +(ymax * 1.12).toPrecision(2);
    var f = P.frame(figPdf, { W: 720, H: 280, x: xr, y: [0, ymax], xlabel: 'x', ylabel: disc ? 'P(X = x)' : 'f(x)', xTicks: disc ? Math.min(12, hi - lo + 1) : 8, label: 'Densità o probabilità' });
    t = f.t; var g = f.g, yb = f.y(0), top = f.m.t;
    var clip = function (v) { return Math.max(top, f.y(v)); };
    if (disc) {
      for (i = lo; i <= hi; i++) {
        var inside = i > S.a && i <= S.b, x0 = f.x(i);
        if (inside) P.svg('rect', { x: x0 - 13, width: 26, y: top, height: yb - top, fill: t.accent, 'fill-opacity': 0.07 }, g);
        if (S.k > 0) {
          var h = S.counts[i - lo] / S.k;
          P.svg('rect', { x: x0 - 9, width: 18, y: clip(h), height: yb - clip(h), fill: t.c1, 'fill-opacity': 0.22, stroke: t.c1, 'stroke-width': 1 }, g);
        }
        var pv = L.pmf(i, S.p);
        P.svg('line', { x1: x0, x2: x0, y1: yb, y2: clip(pv), stroke: inside ? t.accent : t.c_theory, 'stroke-width': 2 }, g);
        P.svg('circle', { cx: x0, cy: clip(pv), r: 4, fill: inside ? t.accent : t.c_theory }, g);
      }
    } else {
      var pts = [], area = [];
      for (i = 0; i <= 300; i++) {
        var xv = lo + (hi - lo) * i / 300, yv = clip(ys[i]);
        pts.push([f.x(xv), yv]);
        if (xv >= S.a && xv <= S.b) area.push([f.x(xv), yv]);
      }
      if (area.length > 1) P.svg('path', { d: P.path(area) + 'L' + area[area.length - 1][0] + ',' + yb + 'L' + area[0][0] + ',' + yb + 'Z', fill: t.accent, 'fill-opacity': 0.14 }, g);
      if (S.k > 0) {
        var bw2 = (hi - lo) / BINS, d2 = 'M' + f.x(lo) + ',' + yb;
        for (i = 0; i < BINS; i++) {
          var hh = clip(S.counts[i] / (S.k * bw2));
          d2 += 'L' + f.x(lo + i * bw2).toFixed(1) + ',' + hh.toFixed(1) + 'L' + f.x(lo + (i + 1) * bw2).toFixed(1) + ',' + hh.toFixed(1);
        }
        P.svg('path', { d: d2 + 'L' + f.x(hi) + ',' + yb + 'Z', fill: t.c1, 'fill-opacity': 0.16, stroke: t.c1, 'stroke-width': 1 }, g);
      }
      P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c_theory, 'stroke-width': 2.2 }, g);
    }
    [S.a, S.b].forEach(function (v, j) {
      if (v < xr[0] || v > xr[1]) return;
      P.svg('line', { x1: f.x(v), x2: f.x(v), y1: top, y2: yb, stroke: t.accent, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, g);
      var lb = P.svg('text', { x: f.x(v) + (j ? 4 : -4), y: top + 10, 'text-anchor': j ? 'start' : 'end', fill: t.accent, 'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 }, g);
      lb.textContent = j ? 'b' : 'a';
    });
    var tx = P.svg('text', { x: f.W - f.m.r, y: top + 12, 'text-anchor': 'end', fill: t.ink_3, 'font-size': 11.5 }, g);
    tx.textContent = S.k + ' osservazioni' + (S.out ? ' · fuori scala ' + S.out + ' (' + SA.fmt(100 * S.out / S.k, 1) + '%)' : '');
  }

  function drawCdf() {
    var L = law(), P = SA.plot, disc = L.kind === 'discrete', lo = S.lo, hi = S.hi;
    var xr = disc ? [lo - 1, hi + 1] : [lo, hi];
    var f = P.frame(figCdf, { W: 720, H: 230, x: xr, y: [0, 1], xlabel: 'x', ylabel: 'F(x)', xTicks: disc ? Math.min(12, hi - lo + 1) : 8, label: 'Funzione di ripartizione' });
    var t = f.t, g = f.g, i, pts = [];
    var srt = statCache && statCache.sorted, n = srt ? srt.length : 0;
    function ecdf(x) { var l = 0, h = n; while (l < h) { var m = (l + h) >> 1; if (srt[m] <= x) l = m + 1; else h = m; } return l / n; }
    // banda DKW al 95% attorno alla funzione di ripartizione empirica
    if (n > 0) {
      var eps = dkw(n), up = [], dn = [], G = disc ? null : 240;
      var xs = [];
      if (disc) { for (i = xr[0]; i <= xr[1]; i++) { xs.push(i); xs.push(i + 0.999); } }
      else for (i = 0; i <= G; i++) xs.push(lo + (hi - lo) * i / G);
      xs.forEach(function (x) { var e = ecdf(x); up.push([f.x(x), f.y(Math.min(1, e + eps))]); dn.push([f.x(x), f.y(Math.max(0, e - eps))]); });
      P.svg('path', { d: P.path(up.concat(dn.reverse())) + 'Z', fill: t.c1, 'fill-opacity': 0.12, stroke: 'none' }, g);
      var ep = []; xs.forEach(function (x) { ep.push([f.x(x), f.y(ecdf(x))]); });
      P.svg('path', { d: P.path(ep), fill: 'none', stroke: t.c1, 'stroke-width': 1.6, 'stroke-dasharray': '6 3' }, g);
    }
    if (disc) {
      for (i = xr[0]; i <= xr[1]; i++) {
        var F = L.cdf(i, S.p);
        P.svg('line', { x1: f.x(i), x2: f.x(i + 1), y1: f.y(F), y2: f.y(F), stroke: t.c_theory, 'stroke-width': 2.2 }, g);
        P.svg('circle', { cx: f.x(i), cy: f.y(F), r: 3, fill: t.c_theory }, g);
      }
    } else {
      for (i = 0; i <= 300; i++) { var xv = lo + (hi - lo) * i / 300; pts.push([f.x(xv), f.y(L.cdf(xv, S.p))]); }
      P.svg('path', { d: P.path(pts), fill: 'none', stroke: t.c_theory, 'stroke-width': 2.2 }, g);
    }
    var Fa = L.cdf(S.a, S.p), Fb = L.cdf(S.b, S.p), xe = f.W - f.m.r - 6;
    [[S.a, Fa], [S.b, Fb]].forEach(function (q) {
      if (q[0] < xr[0] || q[0] > xr[1]) return;
      P.svg('line', { x1: f.x(q[0]), x2: xe, y1: f.y(q[1]), y2: f.y(q[1]), stroke: t.accent, 'stroke-dasharray': '3 3' }, g);
      P.svg('circle', { cx: f.x(q[0]), cy: f.y(q[1]), r: 3.5, fill: t.accent }, g);
    });
    P.svg('line', { x1: xe, x2: xe, y1: f.y(Fa), y2: f.y(Fb), stroke: t.accent, 'stroke-width': 3 }, g);
    var lb = P.svg('text', { x: xe - 6, y: (f.y(Fa) + f.y(Fb)) / 2 + 4, 'text-anchor': 'end', fill: t.accent, 'font-size': 12, 'font-weight': 600 }, g);
    lb.textContent = 'F(b) − F(a) = ' + SA.fmt(Fb - Fa, 4);
  }

  /* ---------- vista 3D: famiglia f(x; θ) o normale bivariata ---------- */
  var dim = '2d', surf = null, rho = 0.5, view3 = { az: -0.75, el: 0.5 }, last3d = null, bar3d;
  function surfOptions() {
    var L = law(), o = L.params.map(function (q) { return [q.key, 'Famiglia f(x; ' + q.label + ') al variare di ' + q.label]; });
    if (L.id === 'norm') o.push(['bivar', 'Normale bivariata f(x₁, x₂) con correlazione ρ']);
    return o;
  }
  function drawDensity() { if (dim === '3d') draw3d(); else drawPdf(); }
  function draw3d() {
    var L = law(), opts = surfOptions(), i, j;
    if (!opts.some(function (o) { return o[0] === surf; })) surf = opts[0][0];
    var t = SA.theme(), sw = SA.plot.legendSwatch;
    if (surf === 'bivar') {
      var mu = S.p.mean, sd = S.p.sd, n = 34, xs = [], k = 1 - rho * rho, pk = 1 / (2 * Math.PI * sd * sd * Math.sqrt(k));
      for (i = 0; i < n; i++) xs.push(mu - 3.2 * sd + 6.4 * sd * i / (n - 1));
      var zb = function (a, b) { var u = (a - mu) / sd, v = (b - mu) / sd; return pk * Math.exp(-(u * u - 2 * rho * u * v + v * v) / (2 * k)); };
      last3d = { surf: 'bivar', zmax: +(pk * 1.02).toPrecision(3), x0: xs[0], x1: xs[n - 1] };
      // coppie dagli stessi valori generati: (x₂ᵢ₋₁, x₂ᵢ) → X₁ = x₂ᵢ₋₁, X₂ = μ + σ(ρz₁ + √(1−ρ²)z₂)
      var NB = 14, w = 6.4 * sd / NB, cnt = new Uint32Array(NB * NB), np = Math.floor(S.k / 2), bars = [];
      for (i = 0; i < np; i++) {
        var z1 = (S.x[2 * i] - mu) / sd, z2 = (S.x[2 * i + 1] - mu) / sd, x1v = mu + sd * z1, x2v = mu + sd * (rho * z1 + Math.sqrt(k) * z2);
        var bi = Math.floor((x1v - xs[0]) / w), bj = Math.floor((x2v - xs[0]) / w);
        if (bi >= 0 && bi < NB && bj >= 0 && bj < NB) cnt[bi * NB + bj]++;
      }
      if (np) for (i = 0; i < NB; i++) for (j = 0; j < NB; j++) if (cnt[i * NB + j]) bars.push([xs[0] + (i + 0.5) * w, xs[0] + (j + 0.5) * w, cnt[i * NB + j] / (np * w * w)]);
      SA.plot3d.draw(figPdf, { xs: xs, ys: xs, z: function (a, b) { return zb(xs[a], xs[b]); }, zmax: last3d.zmax, section: null, bars: bars, barWidth: 5,
        labels: { x: 'x₁', y: 'x₂', z: 'f' }, view: view3, label: 'Densità normale bivariata con ρ = ' + SA.fmt(rho, 2) });
      legendPdf.innerHTML = ''; legendPdf.append(SA.plot3d.colorbar(last3d.zmax, ''), el('span', sw(t.c1, null), 'istogramma 3D di ' + np + ' coppie simulate'),
        el('span.muted', 'margini N(μ, σ²) · ρ = ' + SA.fmt(rho, 2)));
      return;
    }
    var q = L.params.filter(function (p) { return p.key === surf; })[0], disc = L.kind === 'discrete';
    var ny = disc ? 18 : 28, ys = [];
    for (j = 0; j < ny; j++) { var v = q.min + (q.max - q.min) * j / (ny - 1); if (q.step >= 1) v = Math.round(v); if (!ys.length || v !== ys[ys.length - 1]) ys.push(+v.toPrecision(6)); }
    var cur = S.p[surf], sec = 0;
    ys.forEach(function (v, k2) { if (Math.abs(v - cur) < Math.abs(ys[sec] - cur)) sec = k2; });
    ys[sec] = cur;
    var xs2 = [];
    if (disc) { var stp = Math.max(1, Math.ceil((S.hi - S.lo + 1) / 40)); for (var x = S.lo; x <= S.hi; x += stp) xs2.push(x); }
    else for (i = 0; i <= 40; i++) xs2.push(S.lo + (S.hi - S.lo) * i / 40);
    var Z = ys.map(function (y) {
      var p = {}; for (var kk in S.p) p[kk] = S.p[kk]; p[surf] = y; if (L.fix) L.fix(p);
      return xs2.map(function (xv) { var d = L.density(xv, p); return isFinite(d) ? d : 0; });
    });
    var all = [].concat.apply([], Z).sort(function (a, b) { return a - b; }), secMax = Math.max.apply(null, Z[sec]);
    var zmax = Math.min(all[all.length - 1], Math.max(2.5 * all[Math.floor(all.length * 0.97)], secMax * 1.05));
    zmax = +zmax.toPrecision(2);
    last3d = { surf: surf, zmax: zmax, x0: xs2[0], x1: xs2[xs2.length - 1], y0: ys[0], y1: ys[ys.length - 1], ny: ys.length, nx: xs2.length };
    // simulazione sulla sezione: istogramma (continue) o frequenze affiancate (discrete)
    var simBars = null, secHist = null;
    if (S.k) {
      if (disc) {
        var dy = 0.35 * (ys[ys.length - 1] - ys[0]) / Math.max(1, ys.length - 1);
        simBars = []; for (i = 0; i < S.counts.length; i++) if (S.counts[i]) simBars.push([S.lo + i, cur + (sec === ys.length - 1 ? -dy : dy), S.counts[i] / S.k]);
      } else {
        var bwh = (S.hi - S.lo) / BINS; secHist = { x0: S.lo, bw: bwh, h: Array.prototype.map.call(S.counts, function (c) { return Math.min(c / (S.k * bwh), zmax); }) };
      }
    }
    SA.plot3d.draw(figPdf, { xs: xs2, ys: ys, z: function (a, b) { return Z[b][a]; }, zmax: zmax, discrete: disc, section: sec, bars: simBars, sectionHist: secHist, barWidth: 3,
      sectionLabel: q.label + ' = ' + SA.fmt(cur, q.step >= 1 ? 0 : 2), labels: { x: 'x', y: q.label, z: disc ? 'P' : 'f' }, view: view3,
      label: 'Famiglia ' + L.label + ' al variare di ' + q.label });
    legendPdf.innerHTML = '';
    legendPdf.append(SA.plot3d.colorbar(zmax, disc ? 'probabilità' : 'densità'), el('span', sw(t.accent, null), 'sezione: la legge attuale'),
      el('span', sw(t.c1, null), (disc ? 'frequenze' : 'istogramma') + ' di ' + S.k + ' osservazioni'));
  }
  function build3dBar() {
    bar3d.innerHTML = '';
    var seg = el('div.seg', { role: 'group', 'aria-label': 'Vista' });
    [['2d', 'Piano'], ['3d', 'Superficie 3D']].forEach(function (d) {
      seg.appendChild(el('button', { type: 'button', 'aria-pressed': String(dim === d[0]), onclick: function () { dim = d[0]; build3dBar(); legends(); drawDensity(); codeBox.refresh(); } }, d[1]));
    });
    bar3d.appendChild(seg);
    if (dim !== '3d') return;
    var opts = surfOptions(); if (!opts.some(function (o) { return o[0] === surf; })) surf = opts[0][0];
    bar3d.appendChild(el('select', { 'aria-label': 'Superficie', style: 'width:auto;max-width:100%', onchange: function () { surf = this.value; build3dBar(); drawDensity(); codeBox.refresh(); } },
      opts.map(function (o) { return el('option', { value: o[0], selected: o[0] === surf }, o[1]); })));
    if (surf === 'bivar') {
      var sl = SA.ui.slider('ρ', { min: -0.9, max: 0.9, step: 0.05, value: rho, format: function (v) { return SA.fmt(v, 2); },
        oninput: function (v) { rho = v; drawDensity(); }, onchange: function () { codeBox.refresh(); } });
      sl.style.minWidth = '180px'; bar3d.appendChild(sl);
    }
    bar3d.appendChild(SA.ui.button('Ripristina vista', { cls: 'btn-ghost', onclick: function () { view3.az = -0.75; view3.el = 0.5; drawDensity(); } }));
    bar3d.appendChild(el('span.muted', { style: 'font-size:.78rem' }, surf === 'bivar' ? 'Trascina o usa le frecce per ruotare. Le colonne blu sono l’istogramma 3D delle coppie simulate.' : 'Trascina o usa le frecce per ruotare. In blu, sulla sezione, i dati simulati.'));
  }

  var legendPdf, legendCdf;
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch;
    legendCdf.innerHTML = '';
    var disc = law().kind === 'discrete';
    legendCdf.append(el('span', sw(t.c_theory, null), 'F teorica'), el('span', sw(t.c1, '6 3'), 'F empirica'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c1 + ';opacity:.25;border-radius:2px' }), 'banda DKW 95%'));
    if (dim === '3d') return;
    legendPdf.innerHTML = '';
    legendPdf.append(el('span', sw(t.c_theory, null), disc ? 'probabilità teoriche' : 'densità teorica'),
      el('span', sw(t.c1, null), disc ? 'frequenze relative' : 'istogramma (densità)'),
      el('span', sw(t.accent, '4 3'), 'intervallo (a, b]'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox;
  function updateTable() {
    var th = theory(), sm = statCache = sim(), fmt = SA.fmt;
    var rows = [
      ['Valore atteso E(X)', momentTxt(th.mean), sm ? fmt(sm.mean, 4) : '—', isNaN(th.mean) || !isFinite(th.mean)],
      ['Varianza Var(X)', momentTxt(th.var), sm ? fmt(sm.var, 4) : '—', isNaN(th.var) || !isFinite(th.var)],
      ['Mediana', fmt(th.median, 4), sm ? fmt(sm.median, 4) : '—', false],
      ['P(a < X ≤ b)', fmt(th.prob, 4), sm ? fmt(sm.prob, 4) : '—', false]];
    tblBody.innerHTML = '';
    rows.forEach(function (r) {
      tblBody.appendChild(el('tr', el('td', r[0]), el('td', r[1]),
        el('td', r[2], r[3] && sm ? el('sup', { title: 'Il momento teorico non esiste o è infinito: il valore empirico non converge' }, '†') : null),
        el('td', SA.ui.badge('exact'), ' ', SA.ui.badge('mc'))));
    });
    kpiBox.innerHTML = '';
    kpiBox.append(
      el('div.kpi', el('b', S.k + ' / ' + S.N), el('span', 'osservazioni generate')),
      el('div.kpi', el('b', sm ? fmt(sm.D, 4) : '—'), el('span', 'distanza massima sup|F̂ − F| '), SA.ui.badge('mc')),
      el('div.kpi', el('b', S.k ? fmt(dkw(S.k), 4) : '—'), el('span', 'raggio della banda DKW al 95% '), SA.ui.badge('exact')));
    updateFeedback(th, sm);
  }

  /* ---------- previsione ---------- */
  var guessBox, fbBox;
  function buildGuess() {
    guessBox.innerHTML = '';
    var out = el('output', S.guess ? Math.round(S.guess.v * 100) + '%' : '50%');
    var inp = el('input', { type: 'range', min: 0, max: 100, step: 1, value: S.guess ? Math.round(S.guess.v * 100) : 50, 'aria-label': 'La tua stima di P(a < X ≤ b)',
      oninput: function () { out.textContent = this.value + '%'; } });
    var lock = SA.ui.button('Registra la previsione', { onclick: function () { S.guess = { v: inp.value / 100, a: S.a, b: S.b, law: S.law }; updateTable(); } });
    guessBox.append(
      el('p.prose', 'Osserva la forma della distribuzione e l’intervallo (a, b] evidenziato. Prima di guardare la tabella: quale frazione delle osservazioni cadrà nell’intervallo?'),
      el('div', { style: 'display:grid;grid-template-columns:minmax(200px,420px) auto;gap:16px;align-items:end' },
        el('label.field', el('div.field-row', el('span', 'La tua stima'), out), inp), lock));
    fbBox = el('div.feedback', { role: 'status', hidden: true });
    guessBox.appendChild(fbBox);
  }
  function updateFeedback(th, sm) {
    if (!S.guess) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    var g = S.guess;
    if (g.law !== S.law || g.a !== S.a || g.b !== S.b) { fbBox.textContent = 'Hai cambiato legge o intervallo: registra una nuova previsione per confrontarla.'; return; }
    var err = Math.abs(g.v - th.prob);
    fbBox.textContent = 'Hai previsto ' + Math.round(g.v * 100) + '%. La probabilità teorica è ' + SA.fmt(100 * th.prob, 1) + '%' +
      (sm ? ', la frequenza osservata finora ' + SA.fmt(100 * sm.prob, 1) + '% su ' + S.k + ' osservazioni' : '') + '. ' +
      (err < 0.05 ? 'Ottima intuizione.' : err < 0.15 ? 'Ci sei vicino.' : 'Rileggi l’area evidenziata sotto la densità: è quella la probabilità.');
  }

  /* ---------- mappa delle relazioni ---------- */
  var NODES = {
    hyper: [90, 45], binom: [250, 45], bern: [410, 45], geom: [570, 45], nbinom: [730, 45], pois: [890, 45],
    lnorm: [90, 190], norm: [250, 190], t: [410, 190], cauchy: [570, 190], exp: [890, 190],
    f: [250, 335], chisq: [410, 335], gamma: [730, 335], weibull: [890, 335],
    beta: [410, 480], unif: [730, 480]
  };
  /* [da, a, approssimazione?, testo, curvatura facoltativa] — relazioni tra le 17 leggi del laboratorio */
  var EDGES = [
    ['bern', 'binom', 0, 'Somma di n Bernoulli(p) indipendenti → Binomiale(n, p); Bernoulli(p) = Binomiale(1, p)'],
    ['bern', 'geom', 0, 'Numero di insuccessi prima del primo successo in prove di Bernoulli(p) indipendenti → Geometrica(p)'],
    ['hyper', 'binom', 1, 'Popolazione grande rispetto al campione: estrarre senza reinserimento ≈ con reinserimento'],
    ['binom', 'pois', 1, 'n → ∞, p → 0 con np → λ: Binomiale(n, p) ≈ Poisson(λ)', -60],
    ['geom', 'nbinom', 0, 'Somma di r Geometriche(p) indipendenti → Binomiale negativa(r, p); Geometrica(p) = Binomiale negativa(1, p)'],
    ['nbinom', 'pois', 1, 'r → ∞ con media r(1 − p)/p → λ fissata: Binomiale negativa ≈ Poisson(λ)'],
    ['gamma', 'nbinom', 0, 'Miscuglio Poisson–Gamma: se Λ ~ Gamma(r, tasso p/(1 − p)) e Y | Λ ~ Poisson(Λ), allora Y ~ Binomiale negativa(r, p)'],
    ['exp', 'pois', 0, 'Processo di Poisson: con tempi tra eventi Esponenziali(λ) indipendenti, il numero di eventi in un intervallo unitario è Poisson(λ)'],
    ['exp', 'geom', 0, 'Parte intera: se X ~ Esponenziale(λ), ⌊X⌋ ~ Geometrica(1 − e^−λ)'],
    ['binom', 'norm', 1, 'Teorema centrale: Binomiale(n, p) ≈ N(np, np(1 − p)) per np(1 − p) grande'],
    ['pois', 'norm', 1, 'Poisson(λ) ≈ N(λ, λ) per λ grande', 30],
    ['norm', 'lnorm', 0, 'Se X ~ N(μ, σ²), allora exp(X) è Lognormale(μ, σ); viceversa log Y ~ N(μ, σ²)'],
    ['norm', 'chisq', 0, 'Z₁² + … + Z_ν² con Zᵢ ~ N(0, 1) indipendenti → χ²(ν)', -14],
    ['chisq', 'norm', 1, 'χ²(ν) ≈ N(ν, 2ν) per ν grande (teorema centrale)', -14],
    ['norm', 't', 0, 'Z / √(V/ν) con Z ~ N(0, 1), V ~ χ²(ν) indipendenti → t(ν)', -14],
    ['t', 'norm', 1, 't(ν) → N(0, 1) per ν → ∞', -14],
    ['chisq', 't', 0, 'Il denominatore della t: √(V/ν) con V ~ χ²(ν) indipendente da Z ~ N(0, 1)'],
    ['t', 'cauchy', 0, 't con ν = 1 è la Cauchy standard'],
    ['norm', 'cauchy', 0, 'Z₁ / Z₂ con Z₁, Z₂ ~ N(0, 1) indipendenti → Cauchy(0, 1)', -40],
    ['chisq', 'f', 0, '(V₁/ν₁) / (V₂/ν₂) con V₁ ~ χ²(ν₁), V₂ ~ χ²(ν₂) indipendenti → F(ν₁, ν₂)', -14],
    ['f', 'chisq', 1, 'ν₁ · F(ν₁, ν₂) → χ²(ν₁) per ν₂ → ∞', -14],
    ['t', 'f', 0, 'Se T ~ t(ν), allora T² ~ F(1, ν)'],
    ['f', 'beta', 0, 'Se X ~ F(ν₁, ν₂), allora ν₁X / (ν₂ + ν₁X) ~ Beta(ν₁/2, ν₂/2)'],
    ['unif', 'exp', 0, 'Inversione: −log(U)/λ con U ~ Uniforme(0, 1) è Esponenziale(λ)'],
    ['unif', 'beta', 0, 'Statistiche d’ordine: la k-esima più piccola di n Uniformi(0, 1) è Beta(k, n − k + 1); in particolare Beta(1, 1) = Uniforme(0, 1)'],
    ['exp', 'gamma', 0, 'Somma di k Esponenziali(λ) indipendenti → Gamma(k, λ); Esponenziale(λ) = Gamma(1, λ)'],
    ['exp', 'chisq', 0, 'χ²(2) = Esponenziale(tasso 1/2)'],
    ['gamma', 'chisq', 0, 'χ²(ν) = Gamma(forma ν/2, tasso 1/2)'],
    ['gamma', 'beta', 0, 'A/(A + B) con A ~ Gamma(α, λ), B ~ Gamma(β, λ) indipendenti → Beta(α, β)'],
    ['exp', 'weibull', 0, 'Weibull con forma k = 1 è Esponenziale; λX^(1/k) con X ~ Exp(1) è Weibull(k, λ)']
  ];
  var mapBox, relList, mapCaption;
  function showEdge(e) {
    mapCaption.innerHTML = '';
    mapCaption.append(el('strong', LAWS.get(e[0]).label + ' → ' + LAWS.get(e[1]).label + '. '), e[3] + ' ',
      e[2] ? el('span.badge.st-approx', 'approssimazione') : el('span.badge.st-exact', 'esatto'));
  }
  function drawMap() {
    var P = SA.plot, t = SA.theme();
    mapBox.innerHTML = '';
    var root = P.svg('svg', { viewBox: '0 0 980 520', role: 'group', 'aria-label': 'Mappa delle relazioni tra le leggi', 'font-family': t.sans, 'font-size': 12 }, mapBox);
    var defs = P.svg('defs', null, root);
    ['n', 's'].forEach(function (k) {
      var m = P.svg('marker', { id: 'arr-' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      P.svg('path', { d: 'M0,0L10,5L0,10z', fill: k === 's' ? t.accent : t.rule_2 }, m);
    });
    [['Discrete', 45], ['Normale e derivate', 190], ['Campionarie e famiglia gamma', 335], ['Uniforme e Beta', 480]].forEach(function (r) {
      var tx = P.svg('text', { x: 4, y: r[1] - 30, fill: t.ink_3, 'font-size': 10.5, 'letter-spacing': '.08em' }, root); tx.textContent = r[0].toUpperCase();
    });
    EDGES.forEach(function (e) {
      var a = NODES[e[0]], b = NODES[e[1]], sel = e[0] === S.law || e[1] === S.law;
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
      var bend = e[4] || 0;
      var x1 = a[0] + ux * 58, y1 = a[1] + uy * 20, x2 = b[0] - ux * 58, y2 = b[1] - uy * 20;
      if (Math.abs(dy) > Math.abs(dx)) { x1 = a[0] + ux * 30; y1 = a[1] + uy * 20; x2 = b[0] - ux * 30; y2 = b[1] - uy * 20; }
      var mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
      var d = 'M' + x1 + ',' + y1 + 'Q' + mx + ',' + my + ' ' + x2 + ',' + y2;
      var line = P.svg('path', { d: d, fill: 'none', stroke: sel ? t.accent : t.rule_2, 'stroke-width': sel ? 2 : 1.2,
        'stroke-dasharray': e[2] ? '5 4' : null, 'marker-end': 'url(#arr-' + (sel ? 's' : 'n') + ')', 'pointer-events': 'none' }, root);
      // area di aggancio larga e invisibile: mouse, tastiera e tocco
      var hit = P.svg('path', { d: d, fill: 'none', stroke: 'transparent', 'stroke-width': 16, 'pointer-events': 'stroke',
        tabindex: 0, role: 'button', 'aria-label': LAWS.get(e[0]).label + ' → ' + LAWS.get(e[1]).label + ': ' + e[3], style: 'cursor:help;outline:none' }, root);
      var on = function () {
        line.setAttribute('stroke', t.accent); line.setAttribute('stroke-width', 3); line.setAttribute('marker-end', 'url(#arr-s)');
        showEdge(e);
      };
      var off = function () {
        line.setAttribute('stroke', sel ? t.accent : t.rule_2); line.setAttribute('stroke-width', sel ? 2 : 1.2);
        line.setAttribute('marker-end', 'url(#arr-' + (sel ? 's' : 'n') + ')');
      };
      hit.addEventListener('mouseenter', on); hit.addEventListener('focus', on); hit.addEventListener('click', on);
      hit.addEventListener('mouseleave', off); hit.addEventListener('blur', off);
    });
    mapCaption = el('div.feedback', { role: 'status', style: 'margin-top:10px;max-width:none' }, 'Passa sopra una freccia (o toccala) per leggere la relazione.');
    mapBox.appendChild(mapCaption);
    Object.keys(NODES).forEach(function (id) {
      var c = NODES[id], L = LAWS.get(id), sel = id === S.law;
      var g = P.svg('g', { tabindex: 0, role: 'button', 'aria-pressed': String(sel), 'aria-label': L.label, style: 'cursor:pointer' }, root);
      P.svg('rect', { x: c[0] - 56, y: c[1] - 17, width: 112, height: 34, rx: 8, fill: sel ? t.ink : t.card, stroke: sel ? t.ink : t.rule_2 }, g);
      var tx = P.svg('text', { x: c[0], y: c[1] + 4, 'text-anchor': 'middle', fill: sel ? t.paper : t.ink, 'font-size': 12.5, 'font-weight': sel ? 600 : 400 }, g);
      tx.textContent = L.label;
      var go = function () { selectLaw(id); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
    relList.innerHTML = '';
    var mine = EDGES.filter(function (e) { return e[0] === S.law || e[1] === S.law; });
    relList.appendChild(el('h3', 'Legami di ' + law().label));
    relList.appendChild(mine.length ? el('ul', mine.map(function (e) {
      return el('li', e[3], e[2] ? el('span.badge.st-approx', { style: 'margin-left:6px' }, 'approssimazione') : el('span.badge.st-exact', { style: 'margin-left:6px' }, 'esatto'));
    })) : el('p.muted', 'Nessun legame diretto in questa mappa.'));
    relList.appendChild(el('p.muted', 'Ogni legge si ottiene anche dall’Uniforme per inversione: X = F⁻¹(U). È il metodo usato qui per generare i dati.'));
  }

  /* ---------- interpretazione ---------- */
  var interpBox, lawCard;
  function interpretation() {
    var L = law(), th = theory(), notes = [];
    if (isNaN(th.mean)) notes.push('<strong>Il valore atteso non esiste.</strong> La media campionaria si può sempre calcolare, ma non converge a nulla: osserva come salta quando compare un valore estremo. Per descrivere il centro usa la mediana, per la dispersione lo scarto interquartile.');
    else if (!isFinite(th.var) || isNaN(th.var)) notes.push('<strong>La varianza non è finita.</strong> La media converge (lentamente), ma la varianza empirica no, e il teorema centrale nella forma classica non si applica.');
    if (L.kind === 'discrete') notes.push('Per una legge discreta la probabilità sta nei punti: P(a < X ≤ b) = F(b) − F(a) dipende da quali estremi sono inclusi. Prova a spostare <span class="m">a</span> di una unità.');
    else notes.push('Per una legge continua f(x) non è una probabilità (può superare 1): la probabilità è l’<strong>area</strong> sotto la curva, uguale al salto F(b) − F(a) nel grafico sotto.');
    notes.push('Con N osservazioni la funzione di ripartizione empirica resta, con probabilità almeno 95%, entro la banda DKW di raggio √(log(40)/(2N)): un risultato <em>esatto</em>, valido per ogni N e ogni legge. La distanza osservata sup|F̂ − F| la verifica sui tuoi dati.');
    interpBox.innerHTML = notes.map(function (n) { return '<p>' + n + '</p>'; }).join('');
    lawCard.innerHTML = '';
    lawCard.append(el('div.step-label', L.kind === 'discrete' ? 'Legge discreta' : 'Legge continua'),
      el('h3', { style: 'margin:0 0 6px' }, L.label), el('p.muted', { style: 'margin:0 0 8px', html: L.story }),
      el('div.eq', { style: 'margin:8px 0 0;font-size:1rem', html: L.formula }));
  }

  /* ---------- codice R ---------- */
  function codeR() {
    var L = law(), args = L.rargs(S.p), q = L.rq, pF = 'p' + q.slice(1), dF = 'd' + q.slice(1), th = theory(), disc = L.kind === 'discrete';
    var f6 = function (v) { return isNaN(v) ? 'NA' : !isFinite(v) ? 'Inf' : String(+v.toPrecision(6)); };
    var lines = [
      '# ───────────────────────────────────────────────────────────────',
      '# StatAtlas · Lab 01 — ' + L.label + '(' + args + ')',
      '# Osservazioni generate per inversione, X = F⁻¹(U) con U ~ U(0, 1):',
      '# con lo stesso seed R e StatAtlas producono gli stessi numeri.',
      '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)',
      '',
      'set.seed(' + S.seed + ')',
      'N <- ' + S.N,
      'a <- ' + f6(S.a) + '; b <- ' + f6(S.b) + '   # intervallo (a, b]',
      '',
      'x <- ' + q + '(runif(N), ' + args + ')   # stessa legge di r' + q.slice(1) + '()',
      '',
      '# Teoria vs simulazione ---------------------------------------------',
      'tibble(',
      '  quantita    = c("E(X)", "Var(X)", "mediana", "P(a < X <= b)"),',
      '  teoria      = c(' + f6(th.mean) + ', ' + f6(th.var) + ', ' + q + '(0.5, ' + args + '),',
      '                  ' + pF + '(b, ' + args + ') - ' + pF + '(a, ' + args + ')),',
      '  simulazione = c(mean(x), var(x), median(x), mean(x > a & x <= b))',
      ')' + (isNaN(th.mean) ? '   # NA: il momento teorico non esiste' : ''),
      '',
      '# Distanza dalla ripartizione teorica e banda DKW al 95% ------------',
      disc ? 'supporto <- ' + S.lo + ':' + S.hi + '\nD <- max(abs(ecdf(x)(supporto) - ' + pF + '(supporto, ' + args + ')))'
        : 'D <- ks.test(x, "' + pF + '", ' + args + ')$statistic',
      'c(D = unname(D), raggio_DKW = sqrt(log(2 / 0.05) / (2 * N)))',
      '',
      'theme_statatlas <- function(base_size = 12) {',
      '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",',
      '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))',
      '}',
      ''
    ];
    if (disc) lines.push(
      '# Frequenze relative osservate vs probabilità teoriche ---------------',
      'teoria <- tibble(x = ' + S.lo + ':' + S.hi + ', p = ' + dF + '(x, ' + args + '))',
      'tibble(x = x) |>',
      '  count(x) |>',
      '  mutate(freq = n / N) |>',
      '  ggplot(aes(x, freq)) +',
      '  annotate("rect", xmin = a + 0.5, xmax = b + 0.5, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.07) +',
      '  geom_col(fill = "#0072B2", alpha = 0.3, colour = "#0072B2", width = 0.6) +',
      '  geom_segment(data = teoria, aes(x = x, xend = x, y = 0, yend = p), linewidth = 0.9) +',
      '  geom_point(data = teoria, aes(x, p), size = 2) +',
      '  labs(title = "' + L.label + '(' + args.replace(/"/g, '') + ')",',
      '       subtitle = "Barre: frequenze relative simulate · punti: probabilità teoriche",',
      '       x = "x", y = "probabilità") +',
      '  theme_statatlas()');
    else lines.push(
      '# Istogramma vs densità teorica ------------------------------------',
      'lo <- ' + f6(S.lo) + '; hi <- ' + f6(S.hi) + '; bw <- (hi - lo) / ' + BINS,
      'tibble(x = x) |>',
      '  filter(x >= lo, x <= hi) |>',
      '  ggplot(aes(x)) +',
      '  annotate("rect", xmin = a, xmax = b, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.07) +',
      '  geom_histogram(aes(y = after_stat(count) / (N * bw)), binwidth = bw, boundary = lo,',
      '                 fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +',
      '  stat_function(fun = ' + dF + ', args = list(' + args + '), linewidth = 1, n = 400) +',
      '  coord_cartesian(xlim = c(lo, hi)) +',
      '  labs(title = "' + L.label + '(' + args + ')",',
      '       subtitle = "Istogramma: simulazione · curva: densità teorica",',
      '       x = "x", y = "densità") +',
      '  theme_statatlas()');
    lines.push('',
      '# Ripartizione empirica vs teorica -----------------------------------',
      'tibble(x = x) |>',
      '  ggplot(aes(x)) +',
      '  stat_ecdf(colour = "#0072B2", linetype = "dashed") +',
      '  stat_function(fun = ' + pF + ', args = list(' + args + '), linewidth = 1, n = 400' + (disc ? ', geom = "step"' : '') + ') +',
      '  coord_cartesian(xlim = c(' + f6(S.lo) + ', ' + f6(S.hi) + ')) +',
      '  labs(x = "x", y = "F(x)", title = "Funzione di ripartizione: empirica (tratteggio) e teorica") +',
      '  theme_statatlas()', '');
    if (dim === '3d' && last3d) {
      var pal = [
        '# Colori viridis per faccetta (media dei quattro vertici)',
        'faccette <- (zg[-1, -1] + zg[-1, -ncol(zg)] + zg[-nrow(zg), -1] + zg[-nrow(zg), -ncol(zg)]) / 4',
        'colori   <- hcl.colors(100, "viridis")[cut(faccette, 100)]'];
      if (last3d.surf === 'bivar') lines.push('',
        '# Superficie 3D: normale bivariata (base R, nessun pacchetto aggiuntivo) ---',
        'mu <- ' + f6(S.p.mean) + '; sigma <- ' + f6(S.p.sd) + '; rho <- ' + f6(rho),
        'dnorm2 <- function(x1, x2) {',
        '  u <- (x1 - mu) / sigma; v <- (x2 - mu) / sigma',
        '  exp(-(u^2 - 2 * rho * u * v + v^2) / (2 * (1 - rho^2))) / (2 * pi * sigma^2 * sqrt(1 - rho^2))',
        '}',
        'xg <- seq(mu - 3.2 * sigma, mu + 3.2 * sigma, length.out = 34)',
        'zg <- outer(xg, xg, dnorm2)', '',
        '# Coppie simulate dagli stessi valori x: (x[1], x[2]), (x[3], x[4]), ...',
        'z  <- matrix((x[seq_len(2 * (N %/% 2))] - mu) / sigma, ncol = 2, byrow = TRUE)',
        'coppie <- tibble(x1 = mu + sigma * z[, 1], x2 = mu + sigma * (rho * z[, 1] + sqrt(1 - rho^2) * z[, 2]))',
        'cor(coppie$x1, coppie$x2)   # vicino a rho',
        'ggplot(coppie, aes(x1, x2)) + geom_bin2d(bins = 14) + scale_fill_viridis_c() + coord_equal() + theme_statatlas()');
      if (last3d.surf === 'bivar') lines.push.apply(lines, pal.concat([
        'persp(xg, xg, zg, theta = 35, phi = 25, col = colori, border = NA, shade = 0.25,',
        '      xlab = "x1", ylab = "x2", zlab = "f(x1, x2)", ticktype = "detailed",',
        '      main = sprintf("Normale bivariata, rho = %.2f", rho))', '']));
      else {
        var th3 = 987654, pp = {}; for (var kk in S.p) pp[kk] = S.p[kk]; pp[last3d.surf] = th3;
        var a3 = L.rargs(pp).replace(String(th3), 'th'), lab3 = L.params.filter(function (q2) { return q2.key === last3d.surf; })[0].label;
        lines.push('',
          '# Superficie 3D: la famiglia ' + L.label + ' al variare di ' + lab3 + ' (base R) ----',
          disc ? 'xg <- seq(' + last3d.x0 + ', ' + last3d.x1 + ')   # per una legge discreta contano solo i nodi interi' : 'xg <- seq(' + f6(last3d.x0) + ', ' + f6(last3d.x1) + ', length.out = ' + last3d.nx + ')',
          'tg <- seq(' + f6(last3d.y0) + ', ' + f6(last3d.y1) + ', length.out = ' + last3d.ny + ')' + (L.params.filter(function (q2) { return q2.key === last3d.surf; })[0].step >= 1 ? ' |> round() |> unique()' : ''),
          'zg <- outer(xg, tg, \\(x, th) ' + dF + '(x, ' + a3 + '))',
          'zg <- pmin(zg, ' + f6(last3d.zmax) + ')   # stessa scala verticale di StatAtlas');
        lines.push.apply(lines, pal.concat([
          'persp(xg, tg, zg, theta = 35, phi = 25, col = colori, border = NA, shade = 0.25,',
          '      xlab = "x", ylab = "' + lab3 + '", zlab = "' + (disc ? 'P(X = x)' : 'f(x)') + '", ticktype = "detailed",',
          '      main = "' + L.label + ': famiglia al variare di ' + lab3 + '")', '']));
      }
    }
    return lines.join('\n');
  }

  /* ---------- teoria ---------- */
  var THEORY = {
    base: function () {
      var L = law();
      return el('div.prose', { html:
        '<h3>Tre modi di descrivere una legge</h3>' +
        '<p>Una variabile aleatoria <span class="m">X</span> è descritta completamente dalla <strong>funzione di ripartizione</strong> F(x) = P(X ≤ x), definita per ogni legge. Per una legge discreta si usano anche le probabilità P(X = x); per una legge continua la <strong>densità</strong> f(x), con F(x) = ∫ f(t) dt fino a x.</p>' +
        '<div class="eq">P(a &lt; X ≤ b) = F(b) − F(a)</div>' +
        '<p>Nel continuo è l’area sotto f tra a e b; nel discreto è la somma delle probabilità dei punti in (a, b].</p>' +
        '<h3>' + L.label + '</h3><div class="eq">' + L.formula + '</div><p>' + L.story + '</p>' +
        '<h3>Momenti: non sempre esistono</h3>' +
        '<p>Il valore atteso esiste se E|X| &lt; ∞. Per la Cauchy, e per la t con ν = 1, non esiste: la media campionaria non si stabilizza. Per la t con ν ≤ 2 o la F con ν₂ ≤ 4 la varianza non è finita. In questi casi la tabella lo dichiara e segna con † i valori empirici che non convergono.</p>' +
        '<h3>Come vengono generati i dati</h3>' +
        '<p>Ogni osservazione è X = F⁻¹(U), con U uniforme in (0, 1). È il <strong>metodo di inversione</strong>: funziona per qualunque legge e permette a R di riprodurre esattamente gli stessi valori con <code>' + L.rq + '(runif(N), …)</code>.</p>' +
        '<div class="callout warn">L’istogramma che somiglia alla densità non dimostra che i dati vengano da quella legge: ci sono infinite leggi compatibili con un campione finito. La banda DKW quantifica quanta discrepanza è normale aspettarsi.</div>' });
    },
    adv: function () {
      return el('div.prose', { html:
        '<h3>Proprietà della funzione di ripartizione</h3>' +
        '<p>F è non decrescente, continua a destra, con limiti 0 in −∞ e 1 in +∞; ogni funzione con queste proprietà è la ripartizione di qualche legge. I salti di F sono gli atomi: P(X = x) = F(x) − F(x⁻).</p>' +
        '<h3>Inversione generalizzata</h3>' +
        '<div class="eq">F⁻¹(u) = inf { x : F(x) ≥ u }, &nbsp; 0 &lt; u &lt; 1</div>' +
        '<p>Per la continuità a destra, F⁻¹(u) ≤ x ⟺ u ≤ F(x). Se U ~ U(0, 1) allora P(F⁻¹(U) ≤ x) = P(U ≤ F(x)) = F(x): la variabile F⁻¹(U) ha esattamente ripartizione F, anche per leggi discrete. È la definizione usata da <code>qbinom</code>, <code>qpois</code> e simili in R.</p>' +
        '<h3>Glivenko–Cantelli e DKW</h3>' +
        '<p>La funzione di ripartizione empirica F̂<sub>N</sub>(x) = #{Xᵢ ≤ x}/N converge uniformemente a F quasi certamente (Glivenko–Cantelli). La disuguaglianza di Dvoretzky–Kiefer–Wolfowitz, con la costante ottimale di Massart (1990), dà una velocità esplicita:</p>' +
        '<div class="eq">P( sup<sub>x</sub> |F̂<sub>N</sub>(x) − F(x)| &gt; ε ) ≤ 2 e<sup>−2Nε²</sup></div>' +
        '<p>Ponendo il secondo membro uguale a 0,05 si ottiene ε = √(log(40)/(2N)): la banda nel grafico. Vale per ogni N e ogni F (per le leggi discrete è conservativa). La statistica sup|F̂ − F| è quella del test di Kolmogorov–Smirnov.</p>' +
        '<h3>Esistenza dei momenti</h3>' +
        '<p>E|X|<sup>r</sup> &lt; ∞ dipende dalle code: se f(x) ~ c|x|<sup>−(α+1)</sup>, esistono i momenti di ordine r &lt; α. Per la t(ν) α = ν; per la Cauchy α = 1; per la F(ν₁, ν₂) α = ν₂/2.</p>' });
    }
  };

  /* ---------- controlli ---------- */
  var run, paramBox, abBox, codeBox;
  function selectLaw(id) {
    if (id === S.law) return;
    run.stop(); S = newState({ law: id, N: S.N, seed: S.seed, guess: S.guess });
    lawSel.value = id; buildParams(); refreshAll();
  }
  var lawSel;
  function buildParams() {
    var L = law();
    paramBox.innerHTML = '';
    L.params.forEach(function (q) {
      paramBox.appendChild(SA.ui.slider(q.label, { min: q.min, max: q.max, step: q.step, value: S.p[q.key],
        onchange: function (v) { S.p[q.key] = v; if (L.fix) L.fix(S.p); restart(true); buildParams(); } }));
    });
    buildAB();
  }
  function buildAB() {
    var L = law(), disc = L.kind === 'discrete', st = disc ? 1 : step(S);
    var lo = disc ? S.lo - 1 : S.lo, hi = S.hi;
    var fmtv = function (v) { return SA.fmt(v, disc ? 0 : Math.max(0, -Math.floor(Math.log10(st)))); };
    abBox.innerHTML = '';
    abBox.append(
      SA.ui.slider('Estremo a', { min: lo, max: hi, step: st, value: S.a, format: fmtv, oninput: function (v) { S.a = Math.min(v, S.b - st); drawDensity(); drawCdf(); },
        onchange: function () { S.a = +S.a.toPrecision(6); refreshAll(true); } }),
      SA.ui.slider('Estremo b', { min: lo, max: hi, step: st, value: S.b, format: fmtv, oninput: function (v) { S.b = Math.max(v, S.a + st); drawDensity(); drawCdf(); },
        onchange: function () { S.b = +S.b.toPrecision(6); refreshAll(true); } }));
  }
  function restart(resetInterval) {
    run.stop();
    var keep = { law: S.law, N: S.N, seed: S.seed, guess: S.guess };
    if (!resetInterval) { keep.a = S.a; keep.b = S.b; }
    S = newState(keep);
    refreshAll();
  }
  function refreshAll(soft) {
    if (!soft) build3dBar();
    legends(); render(true); interpretation(); drawMap(); codeBox.refresh();
    if (!soft) run.refresh();
  }
  function render(full) {
    if (full || run.frame % 5 === 0 || !run.running) updateTable();
    if (dim !== '3d' || full || run.frame % 4 === 0) drawDensity(); // in 3D ridisegno diradato
    drawCdf();
  }

  function exportCSV() {
    var rows = [['i', 'x']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.x[i]]);
    SA.ui.download('statatlas_lab01_' + S.law + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv');
  }
  function exportPNG() {
    var L = law();
    SA.ui.exportPNG([figPdf.querySelector('svg'), figCdf.querySelector('svg')], 'statatlas_lab01_' + S.law + '.png',
      [L.label + '(' + L.rargs(S.p) + ')', S.k + ' osservazioni · seed ' + S.seed + ' · intervallo (' + S.a + ', ' + S.b + ']']);
  }

  SA.registerLab('distribuzioni', {
    mount: function (page, info) {
      el = SA.ui.el;
      S = newState(S);
      run = SA.ui.runner({ speeds: SPEEDS, speed: 1, step: draw1, render: render,
        done: function () { return S.k >= S.N; }, progress: function () { return S.k / S.N; },
        reset: function () { S = newState({ law: S.law, N: S.N, seed: S.seed, guess: S.guess, a: S.a, b: S.b }); } });
      var openT = function (lvl) { SA.ui.openDrawer('Distribuzioni di probabilità', THEORY, lvl); };
      page.appendChild(el('header.lab-head',
        el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
          el('h1', info.lab.title),
          el('p.lede', 'Diciassette leggi, un solo modo di guardarle: densità, ripartizione e dati che si accumulano fino a ricostruirle.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));

      var s1 = SA.ui.step('1', 'Domanda');
      s1.body.appendChild(el('p.question', 'Che cosa dice davvero una distribuzione, e quanti dati servono per riconoscerla?'));

      var s2 = SA.ui.step('2', 'La tua previsione');
      guessBox = el('div'); s2.body.appendChild(guessBox);

      var s3 = SA.ui.step('3', 'Esperimento', 'Genera osservazioni e confrontale con la legge');
      lawSel = el('select', { 'aria-label': 'Legge', onchange: function () { selectLaw(this.value); } },
        ['discrete', 'continuous'].map(function (k) {
          return el('optgroup', { label: k === 'discrete' ? 'Discrete' : 'Continue' },
            LAWS.list.filter(function (l) { return l.kind === k; }).map(function (l) { return el('option', { value: l.id, selected: l.id === S.law }, l.label); }));
        }));
      paramBox = el('div', { style: 'display:grid;gap:12px' }); abBox = el('div', { style: 'display:grid;gap:12px' });
      var nSel = el('select', { 'aria-label': 'Numero di osservazioni', onchange: function () { S.N = +this.value; restart(); } },
        N_VALUES.map(function (v) { return el('option', { value: v, selected: v === S.N }, String(v)); }));
      var seedIn = el('input', { type: 'number', value: S.seed, min: 1, max: 99999, 'aria-label': 'Seed', onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } });
      var controls = el('div.panel.controls',
        el('label.field', el('span', 'Legge'), lawSel), paramBox,
        el('div', { style: 'border-top:1px solid var(--rule);padding-top:12px;display:grid;gap:12px' }, abBox),
        el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
          el('label.field', el('span', 'Osservazioni N'), nSel), el('label.field', el('span', 'Seed'), seedIn)),
        run.controls('Una osservazione'));
      figPdf = el('div'); figCdf = el('div'); legendPdf = el('div.legend'); legendCdf = el('div.legend'); lawCard = el('div.panel');
      s3.body.appendChild(el('div.lab-grid', controls, el('div.figure', lawCard,
        el('div.fig', el('div.fig-title', el('h3', 'Densità e frequenze'), legendPdf),
          bar3d = el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:6px 0 4px' }), figPdf),
        el('div.fig', el('div.fig-title', el('h3', 'Funzione di ripartizione'), legendCdf), figCdf),
        el('div.toolbar',
          SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: exportCSV }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: exportPNG })))));

      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto');
      tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv',
        el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' risultato teorico esatto'), el('span', SA.ui.badge('mc'), ' stima dai dati simulati'),
          el('span', '† il momento teorico non esiste o è infinito')), kpiBox);

      var s5 = SA.ui.step('5', 'Interpretazione');
      interpBox = el('div.prose'); s5.body.append(interpBox,
        el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Inversione, Glivenko–Cantelli e DKW (livello avanzato)')));

      var s6 = SA.ui.step('6', 'Mappa delle relazioni', 'Come le leggi si generano l’una dall’altra');
      mapBox = el('div.fig'); relList = el('div.prose');
      s6.body.append(el('p.muted', 'Clicca una legge per esplorarla. Linea continua: relazione esatta; tratteggio: approssimazione. Passa sopra o tocca una freccia per leggere la relazione.'),
        mapBox, relList);

      var s7 = SA.ui.step('7', 'Riproduci in R', 'Stessa legge, stessi numeri');
      codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab01_distribuzioni.R');
      s7.body.append(el('p.prose', 'Lo script si aggiorna con legge, parametri, intervallo e seed correnti. Richiede R ≥ 4.1 e tidyverse.'), codeBox);

      page.append(s1, s2, s3, s4, s5, s6, s7);
      buildGuess(); buildParams(); refreshAll();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); drawMap(); }
  });
})();
