/* StatAtlas | core/spatial-areal.js - Moran I, permutazioni, DGP areali.
 * Il test di permutazione condiziona sui valori osservati e ipotizza scambiabilità.
 */
var SA = window.SA || (window.SA = {});
SA.spatialAreal = (function () {
  'use strict';
  var sp = SA.spatial;
  function moran(x, W) {
    var info = sp.inspect(W), n = info.n;
    if (n !== x.length || n < 3 || !(info.s0 > 0) || x.some(function (v) { return !Number.isFinite(v); })) throw new RangeError('Input Moran non valido');
    var mean = x.reduce(function (a, b) { return a + b; }, 0) / n;
    var z = x.map(function (v) { return v - mean; });
    var ss = z.reduce(function (s, v) { return s + v * v; }, 0);
    if (ss <= 1e-24) return { I: NaN, expected: -1 / (n - 1), mean: mean, ss: ss, s0: info.s0, lag: [], z: z, valid: false };
    var zl = sp.lag(W, z), cross = z.reduce(function (s, v, i) { return s + v * zl[i]; }, 0);
    return { I: n * cross / (info.s0 * ss), expected: -1 / (n - 1), mean: mean, ss: ss, s0: info.s0, lag: zl, z: z, valid: true };
  }
  function shuffled(x, rng) {
    var a = x.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng.unif() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function permuteOnce(x, W, rng) { return moran(shuffled(x, rng), W).I; }
  function pMonteCarlo(observed, samples, alt) {
    if (!samples.length || !Number.isFinite(observed)) return NaN;
    var ex = samples.filter(function (v) {
      return alt === 'less' ? v <= observed : alt === 'greater' ? v >= observed : Math.abs(v) >= Math.abs(observed);
    }).length;
    return (ex + 1) / (samples.length + 1);
  }
  function generate(rows, cols, pattern, seed, rho) {
    var rng = new SA.RRNG(seed), n = rows * cols, noise = Array.from({ length: n }, function () { return rng.norm(); });
    var W = sp.weights(rows, cols, 'rook', 'row');
    var truth = [], trend = [], x = [];
    for (var i = 0; i < n; i++) {
      var r = Math.floor(i / cols), c = i % cols;
      var t = 1.8 * (c / (cols - 1) - 0.5);
      trend.push(t);
      if (pattern === 'blocks') x.push(c < cols / 2 ? -1 : 1);
      else if (pattern === 'checker') x.push((r + c) % 2 ? -1 : 1);
      else if (pattern === 'trend') x.push(t + 0.35 * noise[i]);
      else x.push(noise[i]);
    }
    if (pattern === 'sar') {
      var rr = rho == null ? 0.65 : rho;
      if (!(Math.abs(rr) < 1)) throw new RangeError('Il DGP SAR richiede |rho| < 1 per W row-normalizzata');
      var prev = x.slice(), next;
      for (var it = 0; it < 150; it++) {
        var lg = sp.lag(W, prev), diff = 0;
        next = noise.map(function (v, i) { return v + rr * lg[i]; });
        for (var j = 0; j < n; j++) diff = Math.max(diff, Math.abs(next[j] - prev[j]));
        prev = next;
        if (diff < 1e-12) break;
      }
      x = prev;
    }
    return { x: x, noise: noise, trend: trend, W: W, pattern: pattern };
  }
  return { moran: moran, shuffled: shuffled, permuteOnce: permuteOnce, pMonteCarlo: pMonteCarlo, generate: generate };
})();
