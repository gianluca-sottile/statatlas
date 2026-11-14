/* StatAtlas · core/boost.js — gradient boosting funzionale con alberi CART di regressione.
 * Due perdite: MSE (F = E[Y|X]) e devianza binomiale (p = logistic(F)).
 * In ogni passo si adatta per minimi quadrati un albero ai gradienti negativi:
 *   r_i = y_i - F(x_i)   (MSE / 2), r_i = y_i - logistic(F(x_i)) (log loss).
 * Aggiornamento F <- F + eta * h. NON sono implementati gli update Newton/XGBoost.
 * Confronto esatto con il codice R didattico, NON con gbm/xgboost (R3).
 */
var SA = window.SA || (window.SA = {});
SA.boost = (function () {
  function sigmoid(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  function toMean(v) { return v.reduce(function (s, x) { return s + x; }, 0) / v.length; }
  function intercept(y, family) {
    var m = toMean(y);
    if (family === 'binary') { m = Math.max(1e-6, Math.min(1 - 1e-6, m)); return Math.log(m / (1 - m)); }
    return m;
  }
  function response(f, family) { return family === 'binary' ? sigmoid(f) : f; }
  function pseudo(y, raw, family) { return y.map(function (v, i) { return v - response(raw[i], family); }); }
  function loss(y, raw, family) {
    if (!y.length) return NaN;
    var s = 0;
    for (var i = 0; i < y.length; i++) {
      if (family === 'binary') { // log(1 + exp(f)) - y*f: stabile numericamente
        var f = raw[i]; s += Math.max(0, f) + Math.log1p(Math.exp(-Math.abs(f))) - y[i] * f;
      } else { var d = y[i] - raw[i]; s += d * d; }
    }
    return s / y.length;
  }
  /* CART 1D per la regressione (SSE) con indici ordinati per x, soglia al punto medio.
   * In caso di guadagno uguale vince la soglia più piccola; a parità di x non si spezza.
   * Foglia = media dei residui. La radice ha profondità zero. */
  function tree1D(x, y, maxDepth, minLeaf) {
    if (!x.length || x.length !== y.length) throw new Error('Dati vuoti o dimensioni incompatibili');
    var ord = x.map(function (v, i) { return i; }).sort(function (a, b) { return x[a] - x[b] || a - b; });
    var nodes = [];
    function grow(ids, depth) {
      var n = ids.length, sum = 0, sq = 0, i;
      for (i = 0; i < n; i++) { var v = y[ids[i]]; sum += v; sq += v * v; }
      var parent = sq - sum * sum / n, node = { leaf: true, value: sum / n, n: n, depth: depth, sse: parent };
      var k = nodes.length; nodes.push(node);
      if (depth >= maxDepth || n < 2 * minLeaf || parent < 1e-12) return k;
      var ls = 0, lq = 0, best = parent - 1e-10, pos = -1, split = NaN;
      for (i = 0; i < n - 1; i++) {
        var r = y[ids[i]], nl = i + 1, nr = n - nl;
        ls += r; lq += r * r;
        if (nl < minLeaf || nr < minLeaf || !(x[ids[i]] < x[ids[i + 1]])) continue;
        var rss = lq - ls * ls / nl + (sq - lq) - (sum - ls) * (sum - ls) / nr;
        if (rss < best) { best = rss; pos = i; split = (x[ids[i]] + x[ids[i + 1]]) / 2; }
      }
      if (pos < 0) return k;
      node.leaf = false; node.thr = split; node.gain = parent - best;
      node.l = grow(ids.slice(0, pos + 1), depth + 1);
      node.r = grow(ids.slice(pos + 1), depth + 1);
      return k;
    }
    grow(ord, 0);
    return nodes;
  }
  function treePredict(nodes, x) {
    var k = 0;
    while (!nodes[k].leaf) k = x < nodes[k].thr ? nodes[k].l : nodes[k].r;
    return nodes[k].value;
  }
  function update(raw, tree, xs, eta) {
    for (var i = 0; i < xs.length; i++) raw[i] += eta * treePredict(tree, xs[i]);
    return raw;
  }
  return { sigmoid: sigmoid, intercept: intercept, response: response, pseudo: pseudo, loss: loss,
    tree1D: tree1D, treePredict: treePredict, update: update };
})();
