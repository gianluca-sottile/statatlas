/* StatAtlas · core/dist.js — densità e statistiche descrittive */
var SA = window.SA || (window.SA = {});

SA.dens = {
  norm: function (x, mu, sd) { var z = (x - mu) / sd; return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI)); },
  cauchy: function (x, loc, s) { var z = (x - loc) / s; return 1 / (Math.PI * s * (1 + z * z)); },
  laplace: function (x, loc, b) { return Math.exp(-Math.abs(x - loc) / b) / (2 * b); }
};

SA.stat = {
  mean: function (x) { var s = 0; for (var i = 0; i < x.length; i++) s += x[i]; return s / x.length; },
  sorted: function (x) { return Float64Array.from(x).sort(); },
  // quantile tipo 7 (predefinito in R)
  quantile: function (x, p, isSorted) {
    var s = isSorted ? x : SA.stat.sorted(x), n = s.length;
    if (!n) return NaN;
    var h = (n - 1) * p, lo = Math.floor(h), hi = Math.min(lo + 1, n - 1);
    return s[lo] + (h - lo) * (s[hi] - s[lo]);
  },
  median: function (x) { return SA.stat.quantile(x, 0.5); },
  iqr: function (x) { var s = SA.stat.sorted(x); return SA.stat.quantile(s, 0.75, true) - SA.stat.quantile(s, 0.25, true); },
  sd: function (x) {
    var m = SA.stat.mean(x), s = 0;
    for (var i = 0; i < x.length; i++) s += (x[i] - m) * (x[i] - m);
    return Math.sqrt(s / (x.length - 1));
  },
  // MLE della posizione Cauchy (scala 1) con algoritmo MM/IRLS partendo dalla mediana.
  // Ogni passo aumenta la verosimiglianza; converge a un massimo locale.
  mleCauchy: function (x, tol, maxit) {
    tol = tol || 1e-10; maxit = maxit || 100;
    var theta = SA.stat.median(x), thetaNew = theta;
    for (var it = 0; it < maxit; it++) {
      var sw = 0, swx = 0;
      for (var i = 0; i < x.length; i++) {
        var r = x[i] - theta, w = 1 / (1 + r * r);
        sw += w; swx += w * x[i];
      }
      thetaNew = swx / sw;
      if (Math.abs(thetaNew - theta) < tol) break;
      theta = thetaNew;
    }
    return thetaNew;
  }
};

SA.fmt = function (v, d) {
  if (v == null || isNaN(v)) return '—';
  if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
  d = d == null ? 3 : d;
  var a = Math.abs(v);
  if (a < 1e-12) return (0).toFixed(d).replace('.', ',');
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace('.', ',').replace(/-/g, '−');
  return v.toFixed(d).replace('.', ',').replace('-', '−'); // virgola decimale nell'interfaccia
};
