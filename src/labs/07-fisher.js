/* StatAtlas · Lab 07 — Verosimiglianza e informazione di Fisher.
 * Dieci modelli a un parametro (gli altri noti), dalla v0.8 di StatAtlas. */
(function () {
  var el, S, LAWS = SA.laws, BINS = 40, lg = SA.sf.lgamma, CUT = 1.920729; // qchisq(0.95, 1) / 2
  var sum = function (x, f) { var s = 0; for (var i = 0; i < x.length; i++) s += f ? f(x[i]) : x[i]; return s; };
  var dgam = function (x, a, r) { return x <= 0 ? 0 : Math.exp(a * Math.log(r) + (a - 1) * Math.log(x) - r * x - lg(a)); };
  var inv = function (id, p) { return function (g, n) { var o = new Float64Array(n), L = LAWS.get(id); for (var i = 0; i < n; i++) o[i] = L.q(g.unif(), p(S.theta)); return o; }; };
  var KG = 2, KW = 1.5; // forme note di Gamma e Weibull

  var MODELS = {
    normMean: { label: 'Normale: media μ (σ = 1 nota)', par: 'μ', min: -3, max: 3, step: 0.1, def: 0.5, pos: false,
      gen: function (g, n) { return g.rnorm(n, S.theta, 1); }, rgen: 'rnorm(n, mean = theta, sd = 1)',
      ll: function (t, x) { return -0.5 * sum(x, function (v) { return (v - t) * (v - t); }); },
      U: function (t, x) { return sum(x) - x.length * t; }, J: function (t, x) { return x.length; },
      mle: function (x) { return SA.stat.mean(x); }, I: function () { return 1; },
      exact: function (t, n) { return { m: t, v: 1 / n, d: function (y) { return SA.dens.norm(y, t, 1 / Math.sqrt(n)); } }; },
      r: { ll: '-0.5 * sum((x - t)^2)', U: 'sum(x - t)', J: 'length(x)', mle: 'mean(x)' } },
    normVar: { label: 'Normale: varianza σ² (μ = 0 nota)', par: 'σ²', min: 0.2, max: 4, step: 0.1, def: 1, pos: true,
      gen: function (g, n) { return g.rnorm(n, 0, Math.sqrt(S.theta)); }, rgen: 'rnorm(n, mean = 0, sd = sqrt(theta))',
      ll: function (t, x) { return -x.length / 2 * Math.log(t) - sum(x, function (v) { return v * v; }) / (2 * t); },
      U: function (t, x) { return -x.length / (2 * t) + sum(x, function (v) { return v * v; }) / (2 * t * t); },
      J: function (t, x) { return -x.length / (2 * t * t) + sum(x, function (v) { return v * v; }) / (t * t * t); },
      mle: function (x) { return sum(x, function (v) { return v * v; }) / x.length; }, I: function (t) { return 1 / (2 * t * t); },
      exact: function (t, n) { return { m: t, v: 2 * t * t / n, d: function (y) { return n / t * LAWS.get('chisq').pdf(n * y / t, { df: n }); } }; },
      r: { ll: '-length(x) / 2 * log(t) - sum(x^2) / (2 * t)', U: '-length(x) / (2 * t) + sum(x^2) / (2 * t^2)', J: '-length(x) / (2 * t^2) + sum(x^2) / t^3', mle: 'mean(x^2)' } },
    bern: { label: 'Bernoulli: probabilità p', par: 'p', min: 0.05, max: 0.95, step: 0.01, def: 0.3, pos: true, unit: true,
      gen: inv('bern', function (t) { return { prob: t }; }), rgen: 'qbinom(runif(n), size = 1, prob = theta)',
      ll: function (t, x) { var s = sum(x), n = x.length; return (s ? s * Math.log(t) : 0) + (n - s ? (n - s) * Math.log1p(-t) : 0); },
      U: function (t, x) { var s = sum(x); return s / t - (x.length - s) / (1 - t); }, J: function (t, x) { var s = sum(x); return s / (t * t) + (x.length - s) / ((1 - t) * (1 - t)); },
      mle: function (x) { return SA.stat.mean(x); }, I: function (t) { return 1 / (t * (1 - t)); },
      exact: function (t, n) { return { m: t, v: t * (1 - t) / n }; },
      r: { ll: 'sum(x) * log(t) + (length(x) - sum(x)) * log(1 - t)', U: 'sum(x) / t - (length(x) - sum(x)) / (1 - t)', J: 'sum(x) / t^2 + (length(x) - sum(x)) / (1 - t)^2', mle: 'mean(x)' } },
    pois: { label: 'Poisson: intensità λ', par: 'λ', min: 0.2, max: 10, step: 0.1, def: 2, pos: true,
      gen: inv('pois', function (t) { return { lambda: t }; }), rgen: 'qpois(runif(n), lambda = theta)',
      ll: function (t, x) { return sum(x) * Math.log(t) - x.length * t; }, U: function (t, x) { return sum(x) / t - x.length; }, J: function (t, x) { return sum(x) / (t * t); },
      mle: function (x) { return SA.stat.mean(x); }, I: function (t) { return 1 / t; },
      exact: function (t, n) { return { m: t, v: t / n }; },
      r: { ll: 'sum(x) * log(t) - length(x) * t', U: 'sum(x) / t - length(x)', J: 'sum(x) / t^2', mle: 'mean(x)' } },
    exp: { label: 'Esponenziale: tasso λ', par: 'λ', min: 0.2, max: 5, step: 0.1, def: 1, pos: true,
      gen: inv('exp', function (t) { return { rate: t }; }), rgen: 'qexp(runif(n), rate = theta)',
      ll: function (t, x) { return x.length * Math.log(t) - t * sum(x); }, U: function (t, x) { return x.length / t - sum(x); }, J: function (t, x) { return x.length / (t * t); },
      mle: function (x) { return x.length / sum(x); }, I: function (t) { return 1 / (t * t); },
      exact: function (t, n) { return { m: n > 1 ? n * t / (n - 1) : Infinity, v: n > 2 ? n * n * t * t / ((n - 1) * (n - 1) * (n - 2)) : Infinity, d: function (y) { return dgam(n / y, n, t) * n / (y * y); } }; },
      r: { ll: 'length(x) * log(t) - t * sum(x)', U: 'length(x) / t - sum(x)', J: 'length(x) / t^2', mle: '1 / mean(x)' } },
    geom: { label: 'Geometrica: probabilità p', par: 'p', min: 0.05, max: 0.9, step: 0.01, def: 0.3, pos: true, unit: true,
      gen: inv('geom', function (t) { return { prob: t }; }), rgen: 'qgeom(runif(n), prob = theta)',
      ll: function (t, x) { return x.length * Math.log(t) + sum(x) * Math.log1p(-t); }, U: function (t, x) { return x.length / t - sum(x) / (1 - t); },
      J: function (t, x) { return x.length / (t * t) + sum(x) / ((1 - t) * (1 - t)); },
      mle: function (x) { return 1 / (1 + SA.stat.mean(x)); }, I: function (t) { return 1 / (t * t * (1 - t)); },
      r: { ll: 'length(x) * log(t) + sum(x) * log(1 - t)', U: 'length(x) / t - sum(x) / (1 - t)', J: 'length(x) / t^2 + sum(x) / (1 - t)^2', mle: '1 / (1 + mean(x))' } },
    gamma: { label: 'Gamma: tasso β (forma k = 2 nota)', par: 'β', min: 0.2, max: 5, step: 0.1, def: 1, pos: true,
      gen: inv('gamma', function (t) { return { shape: KG, rate: t }; }), rgen: 'qgamma(runif(n), shape = 2, rate = theta)',
      ll: function (t, x) { return KG * x.length * Math.log(t) - t * sum(x); }, U: function (t, x) { return KG * x.length / t - sum(x); }, J: function (t, x) { return KG * x.length / (t * t); },
      mle: function (x) { return KG * x.length / sum(x); }, I: function (t) { return KG / (t * t); },
      exact: function (t, n) { var a = KG * n; return { m: a * t / (a - 1), v: a * a * t * t / ((a - 1) * (a - 1) * (a - 2)), d: function (y) { return dgam(a / y, a, t) * a / (y * y); } }; },
      r: { ll: '2 * length(x) * log(t) - t * sum(x)', U: '2 * length(x) / t - sum(x)', J: '2 * length(x) / t^2', mle: '2 / mean(x)' } },
    weibull: { label: 'Weibull: scala λ (forma k = 1,5 nota)', par: 'λ', min: 0.2, max: 5, step: 0.1, def: 1, pos: true,
      gen: inv('weibull', function (t) { return { shape: KW, scale: t }; }), rgen: 'qweibull(runif(n), shape = 1.5, scale = theta)',
      ll: function (t, x) { return -KW * x.length * Math.log(t) - sum(x, function (v) { return Math.pow(v, KW); }) / Math.pow(t, KW); },
      U: function (t, x) { return -KW * x.length / t + KW * sum(x, function (v) { return Math.pow(v, KW); }) / Math.pow(t, KW + 1); },
      J: function (t, x) { return -KW * x.length / (t * t) + KW * (KW + 1) * sum(x, function (v) { return Math.pow(v, KW); }) / Math.pow(t, KW + 2); },
      mle: function (x) { return Math.pow(sum(x, function (v) { return Math.pow(v, KW); }) / x.length, 1 / KW); }, I: function (t) { return KW * KW / (t * t); },
      exact: function (t, n) {
        var m1 = t * Math.exp(lg(n + 1 / KW) - lg(n) - Math.log(n) / KW), m2 = t * t * Math.exp(lg(n + 2 / KW) - lg(n) - 2 * Math.log(n) / KW);
        return { m: m1, v: m2 - m1 * m1, d: function (y) { var G = n * Math.pow(y / t, KW); return dgam(G, n, 1) * n * KW * Math.pow(y, KW - 1) / Math.pow(t, KW); } };
      },
      r: { ll: '-1.5 * length(x) * log(t) - sum(x^1.5) / t^1.5', U: '-1.5 * length(x) / t + 1.5 * sum(x^1.5) / t^2.5', J: '-1.5 * length(x) / t^2 + 3.75 * sum(x^1.5) / t^3.5', mle: 'mean(x^1.5)^(1 / 1.5)' } },
    cauchy: { label: 'Cauchy: posizione θ (scala 1 nota)', par: 'θ', min: -3, max: 3, step: 0.1, def: 0, pos: false,
      gen: function (g, n) { return g.rcauchy(n, S.theta, 1); }, rgen: 'rcauchy(n, location = theta, scale = 1)',
      ll: function (t, x) { return -sum(x, function (v) { return Math.log1p((v - t) * (v - t)); }); },
      U: function (t, x) { return sum(x, function (v) { var r = v - t; return 2 * r / (1 + r * r); }); },
      J: function (t, x) { return sum(x, function (v) { var r2 = (v - t) * (v - t); return 2 * (1 - r2) / ((1 + r2) * (1 + r2)); }); },
      mle: function (x) { return SA.stat.mleCauchy(x); }, I: function () { return 0.5; },
      r: { ll: '-sum(log1p((x - t)^2))', U: 'sum(2 * (x - t) / (1 + (x - t)^2))', J: 'sum(2 * (1 - (x - t)^2) / (1 + (x - t)^2)^2)',
        mle: 'mle_cauchy(x)', extra: 'mle_cauchy <- function(x, tol = 1e-10, maxit = 100) {   # MM/IRLS dalla mediana\n  t <- median(x)\n  for (i in seq_len(maxit)) {\n    w <- 1 / (1 + (x - t)^2); t_new <- sum(w * x) / sum(w)\n    if (abs(t_new - t) < tol) break\n    t <- t_new\n  }\n  t_new\n}' } },
    unif: { label: 'Uniforme (0, θ): estremo θ — non regolare', par: 'θ', min: 0.5, max: 5, step: 0.1, def: 2, pos: true, irregular: true,
      gen: function (g, n) { return g.runif(n, 0, S.theta); }, rgen: 'runif(n, min = 0, max = theta)',
      ll: function (t, x) { var m = Math.max.apply(null, x); return t < m ? -Infinity : -x.length * Math.log(t); },
      mle: function (x) { return Math.max.apply(null, x); }, I: function () { return NaN; },
      exact: function (t, n) { return { m: n * t / (n + 1), v: n * t * t / ((n + 1) * (n + 1) * (n + 2)), d: function (y) { return y <= 0 || y > t ? 0 : n * Math.pow(y / t, n - 1) / t; } }; },
      r: { ll: 'ifelse(t < max(x), -Inf, -length(x) * log(t))', mle: 'max(x)' } }
  };

  function M() { return MODELS[S.model]; }
  function newState(prev) {
    var s = { model: 'normMean', n: 20, B: 1000, seed: 2026, pred: null, theta: null };
    if (prev) for (var k in s) if (prev[k] !== undefined && prev[k] !== null) s[k] = prev[k];
    if (s.theta == null) s.theta = MODELS[s.model].def;
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.last = null;
    s.mle = new Float64Array(s.B); s.U = new Float64Array(s.B); s.Jt = new Float64Array(s.B); s.cov = 0; s.covLR = 0;
    var m = MODELS[s.model], sd = m.irregular ? s.theta / s.n : 1 / Math.sqrt(s.n * m.I(s.theta));
    s.hlo = m.irregular ? s.theta * (1 - 6 / s.n) : s.theta - 4.5 * sd; s.hhi = m.irregular ? s.theta * (1 + 0.6 / s.n) : s.theta + 4.5 * sd;
    if (m.pos) s.hlo = Math.max(m.unit ? 0 : 0, s.hlo); if (m.unit) s.hhi = Math.min(1, s.hhi);
    s.counts = new Uint32Array(BINS);
    return s;
  }

  /* intervallo di verosimiglianza: {θ : ℓ(θ̂) − ℓ(θ) ≤ 1,92} cercato su griglia + bisezione */
  function lrInterval(x, th) {
    var m = M(), l0 = m.ll(th, x), f = function (t) { return l0 - m.ll(t, x) - CUT; };
    var span = m.irregular ? th : Math.max(1e-6, 6 / Math.sqrt(Math.max(1e-9, m.J ? Math.abs(m.J(th, x)) : 1)));
    function edge(dir) {
      var a = th, b = th, lim = m.unit ? (dir < 0 ? 1e-9 : 1 - 1e-9) : (m.pos && dir < 0 ? 1e-9 : null);
      for (var i = 0; i < 60; i++) {
        b = a + dir * span; if (lim != null && (dir < 0 ? b <= lim : b >= lim)) { b = lim; if (!(f(b) > 0)) return lim; }
        if (f(b) > 0 || !isFinite(f(b))) break; a = b; span *= 1.6;
      }
      for (var j = 0; j < 60; j++) { var c = (a + b) / 2; if (f(c) > 0 || !isFinite(f(c))) b = c; else a = c; }
      return (a + b) / 2;
    }
    return [edge(-1), edge(1)];
  }

  function step() {
    if (S.k >= S.B) return false;
    var m = M(), x = m.gen(S.rng, S.n), th = m.mle(x), bw = (S.hhi - S.hlo) / BINS;
    S.mle[S.k] = th;
    if (!m.irregular) {
      S.U[S.k] = m.U(S.theta, x); S.Jt[S.k] = m.J(S.theta, x);
      var Jh = m.J(th, x), h = 1.96 / Math.sqrt(Jh);
      if (isFinite(h) && Math.abs(th - S.theta) <= h) S.cov++;
      var lr = lrInterval(x, th); if (S.theta >= lr[0] && S.theta <= lr[1]) S.covLR++;
    } else { var mx = th; if (S.theta >= mx && S.theta <= mx / Math.pow(0.05, 1 / S.n)) S.cov++; }
    var b = Math.floor((th - S.hlo) / bw); if (b >= 0 && b < BINS) S.counts[b]++;
    S.last = x; S.k++; return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB;
  function drawLik() {
    var m = M(), P = SA.plot, x = S.last;
    if (!x) { var f0 = P.frame(figA, { W: 720, H: 290, x: [S.hlo, S.hhi], y: [-6, 0.4], xlabel: m.par, label: 'Log-verosimiglianza' }); P.text(f0.g, 360, 130, 'Premi ▶ o “passo” per osservare il primo campione', { 'text-anchor': 'middle', fill: f0.t.ink_3, 'font-size': 13 }); return; }
    var th = m.mle(x), sd = m.irregular ? S.theta / S.n * 3 : 1 / Math.sqrt(Math.max(1e-9, S.n * m.I(S.theta)));
    var lo = m.irregular ? Math.max(1e-6, th * 0.85) : th - 4 * sd, hi = m.irregular ? th * 1.5 : th + 4 * sd;
    if (m.pos) lo = Math.max(lo, 1e-3); if (m.unit) { lo = Math.max(lo, 0.005); hi = Math.min(hi, 0.995); }
    lo = Math.min(lo, S.theta - 0.05 * Math.abs(S.theta || 1)); hi = Math.max(hi, S.theta + 0.05 * Math.abs(S.theta || 1));
    var f = P.frame(figA, { W: 720, H: 290, x: [+lo.toPrecision(3), +hi.toPrecision(3)], y: [-6, 0.4], xlabel: m.par, ylabel: 'ℓ(θ) − ℓ(θ̂)', label: 'Log-verosimiglianza relativa del campione corrente' });
    var t = f.t, g = f.g, l0 = m.ll(th, x);
    P.svg('line', { x1: f.x(f.x.domain[0]), x2: f.x(f.x.domain[1]), y1: f.y(-CUT), y2: f.y(-CUT), stroke: t.c3, 'stroke-dasharray': '4 3' }, g);
    P.text(g, f.W - f.m.r - 4, f.y(-CUT) - 5, '−1,92: soglia dell’intervallo di verosimiglianza 95%', { 'text-anchor': 'end', fill: t.c3, 'font-size': 11 });
    if (!m.irregular) { var Jh = m.J(th, x); if (isFinite(Jh) && Jh > 0) P.curve(f, function (v) { return -0.5 * Jh * (v - th) * (v - th); }, f.x.domain[0], f.x.domain[1], { stroke: t.c2, 'stroke-dasharray': '7 4', 'stroke-width': 1.8 }); }
    P.curve(f, function (v) { var l = m.ll(v, x) - l0; return isFinite(l) ? Math.max(l, -6) : NaN; }, f.x.domain[0], f.x.domain[1], { stroke: t.c1, 'stroke-width': 2.4 }, 400);
    if (m.irregular) P.svg('line', { x1: f.x(th), x2: f.x(th), y1: f.y(0), y2: f.y(-6), stroke: t.c1, 'stroke-width': 2 }, g);
    P.svg('line', { x1: f.x(S.theta), x2: f.x(S.theta), y1: f.m.t, y2: f.y(-6), stroke: t.ink, 'stroke-dasharray': '3 3' }, g);
    P.text(g, f.x(S.theta) + 4, f.m.t + 12, m.par + ' vero', { fill: t.ink_2, 'font-size': 11.5 });
    P.marker(g, 'circle', f.x(th), f.y(0), 11, t.c1, t.card);
    P.text(g, f.x(th) + 8, f.y(0) + 16, 'θ̂ = ' + SA.fmt(th, 3), { fill: t.c1, 'font-size': 12, 'font-weight': 600 });
  }
  function drawSampling() {
    var m = M(), P = SA.plot, ex = m.exact ? m.exact(S.theta, S.n) : null, asd = m.irregular ? NaN : 1 / Math.sqrt(S.n * m.I(S.theta)), peak = 0, i;
    // densità esatta valutata solo dove è finita (es. Esponenziale: in θ̂ = 0 darebbe NaN e bloccherebbe l'asse)
    var safe = function (fn) { return function (v) { var d = fn(v); return isFinite(d) ? d : 0; }; };
    if (ex && ex.d) ex.d = safe(ex.d);
    for (i = 0; i <= 100; i++) { var v = S.hlo + (S.hhi - S.hlo) * i / 100; peak = Math.max(peak, ex && ex.d ? ex.d(v) : 0, isNaN(asd) ? 0 : SA.dens.norm(v, S.theta, asd)); }
    if (S.k) { var bw = (S.hhi - S.hlo) / BINS; for (i = 0; i < BINS; i++) peak = Math.max(peak, Math.min(S.counts[i] / (S.k * bw), peak * 1.5)); }
    if (!(peak > 0)) peak = 1;
    var f = P.frame(figB, { W: 720, H: 260, x: [+S.hlo.toPrecision(3), +S.hhi.toPrecision(3)], y: [0, +(peak * 1.3).toPrecision(2)], xlabel: 'θ̂', ylabel: 'densità', label: 'Distribuzione campionaria dello stimatore' });
    var t = f.t, g = f.g;
    P.hist(f, S.counts, S.hlo, S.hhi, S.k, t.c1);
    if (!isNaN(asd)) P.curve(f, function (v) { return SA.dens.norm(v, S.theta, asd); }, S.hlo, S.hhi, { stroke: t.c2, 'stroke-dasharray': '7 4' });
    if (ex && ex.d) P.curve(f, ex.d, S.hlo, S.hhi, { stroke: t.c_theory }, 300);
    P.svg('line', { x1: f.x(S.theta), x2: f.x(S.theta), y1: f.m.t, y2: f.y(0), stroke: t.ink, 'stroke-dasharray': '3 3' }, g);
    P.text(g, f.m.l + 8, f.m.t + 12, S.k + ' stime su ' + S.B, { fill: t.ink_3, 'font-size': 11.5 });
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch, m = M(), ex = m.exact && m.exact(S.theta, S.n);
    legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c1, null, 'circle'), 'log-verosimiglianza e θ̂'));
    if (!m.irregular) legA.append(el('span', sw(t.c2, '7 4'), 'approssimazione quadratica −J(θ̂)(θ − θ̂)²/2'));
    legB.append(el('span', sw(t.c1, null), 'simulazione'));
    if (ex && ex.d) legB.append(el('span', sw(t.c_theory, null), 'legge esatta'));
    if (!m.irregular) legB.append(el('span', sw(t.c2, '7 4'), 'normale asintotica N(θ, 1/(n I(θ)))'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function mv(a) { if (!a.length) return [NaN, NaN]; var m = SA.stat.mean(a); return [m, a.length > 1 ? Math.pow(SA.stat.sd(a), 2) : NaN]; }
  function row(q, th, sim, st) { return el('tr', el('td', q), el('td', th), el('td', sim), el('td', SA.ui.badge(st))); }
  function updateTable() {
    var m = M(), fmt = SA.fmt, k = S.k, n = S.n, ex = m.exact ? m.exact(S.theta, n) : null;
    var est = mv(S.mle.subarray(0, k));
    tblBody.innerHTML = '';
    if (!m.irregular) {
      var nI = n * m.I(S.theta), u = mv(S.U.subarray(0, k)), j = mv(S.Jt.subarray(0, k));
      tblBody.append(
        row('Media dello score E[U(θ)]', '0', fmt(u[0], 4), 'exact'),
        row('Varianza dello score Var[U(θ)]', fmt(nI, 4) + ' = n I(θ)', fmt(u[1], 4), 'exact'),
        row('Informazione osservata media E[J(θ)]', fmt(nI, 4) + ' = n I(θ)', fmt(j[0], 4), 'exact'),
        row('Media di θ̂', ex ? fmt(ex.m, 4) : fmt(S.theta, 4) + ' (limite)', fmt(est[0], 4), ex ? 'exact' : 'asym'),
        row('Varianza di θ̂', (ex ? fmt(ex.v, 5) + ' esatta · ' : '') + fmt(1 / nI, 5) + ' Cramér–Rao', fmt(est[1], 5), ex ? 'exact' : 'asym'),
        row('Copertura Wald θ̂ ± 1,96/√J(θ̂)', '0,95', k ? fmt(S.cov / k, 3) : '—', 'asym'),
        row('Copertura del rapporto di verosimiglianza', '0,95', k ? fmt(S.covLR / k, 3) : '—', 'asym'));
    } else {
      tblBody.append(
        row('Media di θ̂ = max xᵢ', fmt(ex.m, 4) + ' = nθ/(n + 1)', fmt(est[0], 4), 'exact'),
        row('Varianza di θ̂', fmt(ex.v, 6), fmt(est[1], 6), 'exact'),
        row('Informazione di Fisher', 'non definita: il supporto dipende da θ', '—', 'none'),
        row('Copertura di [max, max/0,05^(1/n)]', '0,95', k ? fmt(S.cov / k, 3) : '—', 'exact'));
    }
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', k + ' / ' + S.B), el('span', 'campioni di n = ' + n)),
      el('div.kpi', el('b', m.irregular ? 'non definita' : fmt(m.I(S.theta), 4)), el('span', 'informazione per osservazione I(θ)')),
      el('div.kpi', el('b', m.irregular ? fmt(ex.v, 5) : fmt(1 / (n * m.I(S.theta)), 5)), el('span', m.irregular ? 'varianza esatta: ordine 1/n²' : 'limite di Cramér–Rao 1/(n I(θ))')));
    updateFeedback();
  }

  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p07-' + Date.now();
    predBox.append(el('p.prose', 'Nel modello «' + M().label + '», se raddoppi la numerosità n, la varianza dello stimatore di massima verosimiglianza diventa circa:'),
      el('div.choices', { role: 'radiogroup' }, [['half', 'La metà'], ['quarter', 'Un quarto'], ['same', 'Più o meno uguale']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    var m = M(), truth = m.irregular ? 'quarter' : 'half';
    fbBox.textContent = (S.pred === truth ? '✓ ' : '✗ ') + (m.irregular
      ? 'Nel modello uniforme la varianza di max xᵢ è dell’ordine di θ²/n²: raddoppiare n la divide per circa 4. La velocità è n, non √n: il modello non è regolare.'
      : 'Nei modelli regolari Var(θ̂) ≈ 1/(n I(θ)): l’informazione si somma sulle osservazioni, quindi raddoppiare n dimezza la varianza. Prova n = ' + S.n + ' e poi ' + 2 * S.n + ' e confronta la riga “Varianza di θ̂”.');
  }

  function interpretation() {
    var m = M(), txt = '<p>Il grafico in alto è la log-verosimiglianza <strong>di un solo campione</strong>: una funzione del parametro, non una densità. Il suo massimo è la stima θ̂; la sua <strong>curvatura</strong> nel massimo, J(θ̂), misura quanta informazione il campione porta su θ. Più è appuntita, più la stima è precisa.</p>';
    if (m.irregular) txt += '<p>Qui la verosimiglianza è −n log θ per θ ≥ max xᵢ e zero altrove: il massimo è sul bordo, dove la derivata non si annulla. Le condizioni di regolarità falliscono (il supporto dipende da θ): niente score a media nulla, niente informazione di Fisher, niente normalità asintotica. In compenso θ̂ converge più in fretta, con errore dell’ordine di 1/n, e n(θ − θ̂) tende a una Esponenziale.</p>';
    else txt += '<p>Ripetendo l’esperimento, lo <strong>score</strong> U(θ) nel vero valore ha media 0 e varianza n I(θ), e la curvatura media è anch’essa n I(θ): sono le identità di Bartlett, verificate dalla tabella. Ne segue che θ̂ è approssimativamente N(θ, 1/(n I(θ))), e nessuno stimatore non distorto ha varianza minore del limite di Cramér–Rao.</p>' +
      (S.model === 'cauchy' ? '<p>Nella Cauchy la log-verosimiglianza può avere più massimi locali e J(θ̂) di un campione può essere molto diversa da n/2: l’intervallo del rapporto di verosimiglianza è più affidabile di quello di Wald.</p>' : '') +
      (S.model === 'exp' || S.model === 'gamma' ? '<p>Qui θ̂ è distorto per n finito (la media esatta supera θ) e la legge esatta è asimmetrica: la normalità è solo asintotica. La distorsione svanisce come 1/n.</p>' : '');
    interpBox.innerHTML = txt;
  }

  function codeR() {
    var m = M(), r = m.r, reg = !m.irregular;
    var L = ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 07 — Verosimiglianza: ' + m.label,
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'theta <- ' + S.theta + '; n <- ' + S.n + '; B <- ' + S.B, '',
      '# Log-verosimiglianza, score, informazione osservata e stima ML (t = parametro)',
      'loglik <- function(t, x) ' + r.ll];
    if (reg) L.push('score  <- function(t, x) ' + r.U, 'J      <- function(t, x) ' + r.J);
    if (r.extra) L.push(r.extra);
    L.push('mle    <- function(x) ' + r.mle, '');
    L.push('sim <- tibble(replica = seq_len(B)) |>', '  mutate(x = map(replica, \\(r) ' + m.rgen + '),', '         stima = map_dbl(x, mle)' + (reg ? ',' : ')'));
    if (reg) L.push('         U     = map_dbl(x, \\(x) score(theta, x)),', '         Jt    = map_dbl(x, \\(x) J(theta, x)),',
      '         wald  = map2_lgl(x, stima, \\(x, s) abs(s - theta) <= 1.96 / sqrt(J(s, x))))', '',
      '# Identità di Bartlett: E[U] = 0, Var[U] = E[J] = n I(theta)',
      'sim |> summarise(media_U = mean(U), var_U = var(U), media_J = mean(Jt),',
      '                 media_stima = mean(stima), var_stima = var(stima), copertura_wald = mean(wald))',
      'c(n_I = ' + +(S.n * m.I(S.theta)).toPrecision(8) + ', cramer_rao = ' + +(1 / (S.n * m.I(S.theta))).toPrecision(8) + ')');
    else L.push('', 'sim |> summarise(media_stima = mean(stima), var_stima = var(stima),',
      '                 copertura = mean(stima <= theta & theta <= stima / 0.05^(1 / n)))',
      'c(media_esatta = n * theta / (n + 1), var_esatta = n * theta^2 / ((n + 1)^2 * (n + 2)))');
    L.push('', 'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}', '',
      '# Log-verosimiglianza relativa del primo campione',
      'x1 <- sim$x[[1]]; s1 <- mle(x1)',
      'tibble(t = seq(' + (m.irregular ? 's1 * 0.85, s1 * 1.5' : 's1 - 4 / sqrt(n * ' + +m.I(S.theta).toPrecision(8) + '), s1 + 4 / sqrt(n * ' + +m.I(S.theta).toPrecision(8) + ')') + ', length.out = 400)) |>' + (m.pos ? '\n  filter(t > 0' + (m.unit ? ', t < 1' : '') + ') |>' : ''),
      '  mutate(rel = map_dbl(t, \\(t) loglik(t, x1)) - loglik(s1, x1)' + (reg ? ',\n         quad = -0.5 * J(s1, x1) * (t - s1)^2' : '') + ') |>',
      '  ggplot(aes(t)) +', '  geom_hline(yintercept = -qchisq(0.95, 1) / 2, linetype = "dashed", colour = "#009E73") +');
    if (reg) L.push('  geom_line(aes(y = quad), linetype = "dashed", colour = "#D55E00") +');
    L.push('  geom_line(aes(y = rel), colour = "#0072B2", linewidth = 1) +', '  geom_vline(xintercept = theta, linetype = "dotted") +',
      '  coord_cartesian(ylim = c(-6, 0.3)) +', '  labs(x = "' + m.par + '", y = "loglik relativa", title = "' + m.label + '") +', '  theme_statatlas()', '',
      '# Distribuzione campionaria della stima' + (reg ? ' con la normale asintotica' : ''),
      'ggplot(sim, aes(stima)) +', '  geom_histogram(aes(y = after_stat(density)), bins = 40, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +');
    if (reg) L.push('  stat_function(fun = dnorm, args = list(mean = theta, sd = 1 / sqrt(n * ' + +m.I(S.theta).toPrecision(8) + ')), linetype = "dashed", colour = "#D55E00", linewidth = 1) +');
    L.push('  geom_vline(xintercept = theta, linetype = "dotted") +', '  labs(x = expression(hat(theta)), y = "densità") +', '  theme_statatlas()', '');
    return L.join('\n');
  }

  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Verosimiglianza</h3><p>Osservato il campione x, la verosimiglianza L(θ) = ∏ f(xᵢ; θ) dice quanto ciascun valore del parametro rende plausibili i dati. Si lavora con ℓ(θ) = log L(θ). La stima di massima verosimiglianza θ̂ è il valore che la massimizza.</p>' +
        '<h3>Score e informazione</h3><p>Lo <strong>score</strong> è la pendenza U(θ) = ℓ′(θ); l’<strong>informazione osservata</strong> è la curvatura J(θ) = −ℓ″(θ). L’<strong>informazione di Fisher</strong> è la curvatura attesa per osservazione:</p>' +
        '<div class="eq" data-tex="I(\\theta) = \\E\\left[-\\frac{\\partial^2 \\log f(X; \\theta)}{\\partial\\theta^2}\\right] = \\Var\\left[\\frac{\\partial \\log f(X; \\theta)}{\\partial\\theta}\\right]"></div>' +
        '<h3>Che cosa garantisce</h3><ul><li><strong>Cramér–Rao</strong>: ogni stimatore non distorto ha varianza ≥ 1/(n I(θ)).</li><li><strong>Normalità asintotica</strong>: θ̂ ≈ N(θ, 1/(n I(θ))) per n grande.</li><li><strong>Intervalli</strong>: Wald θ̂ ± 1,96/√J(θ̂) o, meglio, {θ : ℓ(θ̂) − ℓ(θ) ≤ 1,92}.</li></ul>' +
        '<div class="callout warn">Queste proprietà richiedono condizioni di regolarità. Il modello uniforme (0, θ) le viola: il supporto dipende da θ.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Identità di Bartlett</h3><p>Derivando ∫ f(x; θ) dx = 1 sotto il segno di integrale (lecito se il supporto non dipende da θ):</p>' +
        '<div class="eq" data-tex="\\E[U(\\theta)] = 0, \\qquad \\Var[U(\\theta)] = \\E[J(\\theta)] = n I(\\theta)"></div>' +
        '<h3>Cramér–Rao</h3><p>Se E[T] = θ, derivando si ottiene Cov(T, U) = 1; per Cauchy–Schwarz 1 ≤ Var(T) Var(U), cioè Var(T) ≥ 1/(n I(θ)). L’uguaglianza vale solo nelle famiglie esponenziali con T statistica sufficiente nella parametrizzazione della media (es. x̄ per μ normale, x̄ per λ Poisson).</p>' +
        '<h3>Normalità asintotica</h3><p>Sviluppando 0 = U(θ̂) ≈ U(θ) − J(θ)(θ̂ − θ): √n(θ̂ − θ) ≈ [U(θ)/√n] / [J(θ)/n] → N(0, I(θ)) / I(θ) = N(0, 1/I(θ)), per TCL sul numeratore e legge dei grandi numeri sul denominatore.</p>' +
        '<h3>Rapporto di verosimiglianza</h3><p>2[ℓ(θ̂) − ℓ(θ)] → χ²₁ (Wilks), da cui la soglia qchisq(0,95, 1)/2 = 1,92. L’intervallo che ne deriva è invariante per riparametrizzazione e segue l’asimmetria della verosimiglianza, a differenza di Wald.</p>' +
        '<h3>Modello uniforme</h3><p>P(θ̂ ≤ t) = (t/θ)ⁿ, quindi E θ̂ = nθ/(n + 1) e n(θ − θ̂)/θ → Exp(1). Lo stimatore corretto (n + 1)θ̂/n ha varianza θ²/(n(n + 2)), sotto il “limite” di Cramér–Rao, che qui non si applica.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); }
  function render(full) { drawLik(); drawSampling(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var m = M(), sel = function (label, key, vals) {
      return el('label.field', el('span', label), el('select', { onchange: function () { S[key] = +this.value; restart(); } },
        vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, String(v)); })));
    };
    ctrlBox.append(
      el('label.field', el('span', 'Modello'), el('select', { onchange: function () { S.model = this.value; S.theta = MODELS[S.model].def; S.pred = null; buildControls(); buildPrediction(); restart(); } },
        Object.keys(MODELS).map(function (k) { return el('option', { value: k, selected: k === S.model }, MODELS[k].label); }))),
      SA.ui.slider(m.par + ' vero', { min: m.min, max: m.max, step: m.step, value: S.theta, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.theta = v; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' }, sel('n', 'n', [5, 10, 20, 50, 100, 200]), sel('Campioni B', 'B', [200, 1000, 5000]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un campione').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('fisher', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Verosimiglianza e informazione', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'La forma della verosimiglianza di un campione racconta quanto è precisa la stima. Ripetendo l’esperimento, la curvatura diventa l’informazione di Fisher.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Quanto può essere precisa, al meglio, una stima ottenuta da n osservazioni?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Un campione, la sua verosimiglianza, la sua stima');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Log-verosimiglianza del campione corrente'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Distribuzione campionaria di θ̂'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['replica', 'stima', 'score_theta', 'J_theta']]; for (var i = 0; i < S.k; i++) rows.push([i + 1, S.mle[i], S.U[i], S.Jt[i]]);
          SA.ui.download('statatlas_lab07_' + S.model + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab07_' + S.model + '.png', [M().label, 'n = ' + S.n + ' · ' + S.k + ' campioni · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Teoria'), el('th', 'Simulazione'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' vale per ogni n'), el('span', SA.ui.badge('asym'), ' vale per n → ∞')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Bartlett, Cramér–Rao, Wilks e il caso non regolare (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi campioni, stesse stime'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab07_fisher.R');
      s6.body.append(el('p.prose', 'Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
