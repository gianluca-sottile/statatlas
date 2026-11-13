/* StatAtlas · core/nn.js — percettrone multistrato 2 → H → 1 per la classificazione binaria.
 * Uscita sigmoide, entropia incrociata binaria in forma stabile: ℓ(z, y) = max(z, 0) − yz + log(1 + e^−|z|).
 * Obiettivo: media di ℓ sul training + (λ/2) Σ w² (solo pesi, non intercette). Discesa del gradiente a lotto intero.
 * Inizializzazione: W1 ~ U(±√(6/(2+H))) letta per righe (neurone per neurone), W2 ~ U(±√(6/(H+1))), intercette 0. */
SA.nn = (function () {
  var ACT = {
    tanh: { f: function (a) { return Math.tanh(a); }, d: function (a, h) { return 1 - h * h; } },
    relu: { f: function (a) { return a > 0 ? a : 0; }, d: function (a) { return a > 0 ? 1 : 0; } }
  };
  function init(g, H, act) {
    var a = Math.sqrt(6 / (2 + H)), c = Math.sqrt(6 / (H + 1)), W1 = [], W2 = [], h;
    for (h = 0; h < H; h++) W1.push([-a + 2 * a * g.unif(), -a + 2 * a * g.unif()]);
    for (h = 0; h < H; h++) W2.push(-c + 2 * c * g.unif());
    return { H: H, act: act, W1: W1, b1: new Array(H).fill(0), W2: W2, b2: 0 };
  }
  function sigmoid(z) { if (z >= 0) return 1 / (1 + Math.exp(-z)); var e = Math.exp(z); return e / (1 + e); }
  function bce(z, y) { return Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z))); }
  function forward(net, x) {
    var A = ACT[net.act], a = [], hh = [], z = net.b2;
    for (var h = 0; h < net.H; h++) { a.push(net.b1[h] + net.W1[h][0] * x[0] + net.W1[h][1] * x[1]); hh.push(A.f(a[h])); z += net.W2[h] * hh[h]; }
    return { a: a, h: hh, z: z, p: sigmoid(z) };
  }
  function loss(net, X, y, lambda) {
    var s = 0, m = X.length; for (var i = 0; i < m; i++) s += bce(forward(net, X[i]).z, y[i]);
    s /= m; if (lambda) s += lambda / 2 * penalty(net);
    return s;
  }
  function penalty(net) { var s = 0; for (var h = 0; h < net.H; h++) s += net.W1[h][0] * net.W1[h][0] + net.W1[h][1] * net.W1[h][1] + net.W2[h] * net.W2[h]; return s; }
  function accuracy(net, X, y) { var c = 0; for (var i = 0; i < X.length; i++) if ((forward(net, X[i]).p > 0.5 ? 1 : 0) === y[i]) c++; return c / X.length; }
  function grad(net, X, y, lambda) {
    var H = net.H, A = ACT[net.act], m = X.length, g = { W1: [], b1: new Array(H).fill(0), W2: new Array(H).fill(0), b2: 0 }, h, i;
    for (h = 0; h < H; h++) g.W1.push([0, 0]);
    for (i = 0; i < m; i++) {
      var f = forward(net, X[i]), dz = (f.p - y[i]) / m; g.b2 += dz;
      for (h = 0; h < H; h++) { g.W2[h] += dz * f.h[h]; var da = dz * net.W2[h] * A.d(f.a[h], f.h[h]); g.W1[h][0] += da * X[i][0]; g.W1[h][1] += da * X[i][1]; g.b1[h] += da; }
    }
    if (lambda) for (h = 0; h < H; h++) { g.W1[h][0] += lambda * net.W1[h][0]; g.W1[h][1] += lambda * net.W1[h][1]; g.W2[h] += lambda * net.W2[h]; }
    return g;
  }
  function step(net, g, eta) {
    for (var h = 0; h < net.H; h++) { net.W1[h][0] -= eta * g.W1[h][0]; net.W1[h][1] -= eta * g.W1[h][1]; net.b1[h] -= eta * g.b1[h]; net.W2[h] -= eta * g.W2[h]; }
    net.b2 -= eta * g.b2;
  }
  function finite(net) { var ok = isFinite(net.b2); for (var h = 0; h < net.H && ok; h++) ok = isFinite(net.W1[h][0]) && isFinite(net.W1[h][1]) && isFinite(net.b1[h]) && isFinite(net.W2[h]); return ok; }
  function params(net) { var r = []; for (var h = 0; h < net.H; h++) r.push(['W1', h, 0], ['W1', h, 1], ['b1', h], ['W2', h]); r.push(['b2']); return r; }
  function getP(net, k) { return k[0] === 'W1' ? net.W1[k[1]][k[2]] : k[0] === 'b2' ? net.b2 : net[k[0]][k[1]]; }
  function setP(net, k, v) { if (k[0] === 'W1') net.W1[k[1]][k[2]] = v; else if (k[0] === 'b2') net.b2 = v; else net[k[0]][k[1]] = v; }
  /* controllo del gradiente: differenze centrali; errore = max |g − ĝ| / max(1e−8, max |g|) (relativo alla scala del gradiente) */
  function gradCheck(net, X, y, lambda, eps) {
    eps = eps || 1e-5; var g = grad(net, X, y, lambda), mx = 0, sc = 0;
    params(net).forEach(function (k) {
      var v = getP(net, k); setP(net, k, v + eps); var lp = loss(net, X, y, lambda); setP(net, k, v - eps); var lm = loss(net, X, y, lambda); setP(net, k, v);
      var num = (lp - lm) / (2 * eps), an = getP(g, k);
      mx = Math.max(mx, Math.abs(num - an)); sc = Math.max(sc, Math.abs(an));
    });
    return mx / Math.max(1e-8, sc);
  }
  function clone(net) { return { H: net.H, act: net.act, W1: net.W1.map(function (r) { return r.slice(); }), b1: net.b1.slice(), W2: net.W2.slice(), b2: net.b2 }; }
  return { init: init, forward: forward, loss: loss, accuracy: accuracy, grad: grad, step: step, gradCheck: gradCheck, finite: finite, clone: clone, sigmoid: sigmoid, bce: bce, nParams: function (H) { return 4 * H + 1; } };
})();
