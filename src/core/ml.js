/* StatAtlas · core/ml.js — strumenti di apprendimento supervisionato (kNN; alberi nel lab 20).
 * Convenzione dei vicini: distanza euclidea; a parità di distanza vince l'indice più basso (come order() in R). */
SA.ml = (function () {
  /* i K vicini di q tra le righe di X (array di vettori), escludendo l'indice skip; restituisce gli indici ordinati */
  function nearest(X, q, K, skip) {
    var n = X.length, p = q.length, dd = new Float64Array(K), ii = new Int32Array(K), c = 0, i, j, d, t;
    for (i = 0; i < n; i++) {
      if (i === skip) continue;
      d = 0; var x = X[i]; for (j = 0; j < p; j++) { t = x[j] - q[j]; d += t * t; }
      if (c < K) { j = c++; } else if (d < dd[K - 1]) { j = K - 1; } else continue; // a parità resta il primo (indice minore)
      while (j > 0 && dd[j - 1] > d) { dd[j] = dd[j - 1]; ii[j] = ii[j - 1]; j--; }
      dd[j] = d; ii[j] = i;
    }
    return { idx: ii.subarray(0, c), d2: dd.subarray(0, c) };
  }
  /* classe prevista (0/1) per ciascun k di kVals (dispari) a partire dai vicini ordinati */
  function votePath(idx, y, kVals) {
    var out = new Uint8Array(kVals.length), s = 0, j = 0;
    for (var r = 0; r < kVals.length; r++) { while (j < kVals[r]) s += y[idx[j++]]; out[r] = s > kVals[r] / 2 ? 1 : 0; }
    return out;
  }
  /* standardizzazione stimata sul solo training (sd con n − 1), applicata a qualunque insieme */
  function scaler(X) {
    var n = X.length, p = X[0].length, m = new Float64Array(p), s = new Float64Array(p), i, j;
    for (i = 0; i < n; i++) for (j = 0; j < p; j++) m[j] += X[i][j] / n;
    for (i = 0; i < n; i++) for (j = 0; j < p; j++) s[j] += (X[i][j] - m[j]) * (X[i][j] - m[j]);
    for (j = 0; j < p; j++) s[j] = Math.sqrt(s[j] / (n - 1)) || 1;
    return { mean: m, sd: s, apply: function (Z) { return Z.map(function (z) { var o = new Array(p); for (var k = 0; k < p; k++) o[k] = (z[k] - m[k]) / s[k]; return o; }); } };
  }
  /* intervallo di Wilson per una proporzione x/m */
  function wilson(x, m, z) {
    z = z || 1.959963984540054; var p = x / m, z2 = z * z, c = (p + z2 / (2 * m)) / (1 + z2 / m), h = z * Math.sqrt(p * (1 - p) / m + z2 / (4 * m * m)) / (1 + z2 / m);
    return [Math.max(0, c - h), Math.min(1, c + h)];
  }
  /* ---------- CART per la classificazione binaria (Gini) ----------
   * idx: righe del nodo (con ripetizioni nel bootstrap). Regole fissate (identiche nello script R):
   * - profondità della radice 0; si divide solo se prof < maxDepth, m ≥ 2·minLeaf e il nodo è impuro;
   * - variabili candidate: se mtry < p, sample(p, mtry) estratto dal generatore g (in ordine di visita in profondità,
   *   sinistra prima di destra), altrimenti 1…p;
   * - soglie: punti medi tra valori distinti consecutivi; criterio G = nₗ − (l₀² + l₁²)/nₗ + nᵣ − (r₀² + r₁²)/nᵣ
   *   (n volte il Gini pesato), da rendere minimo; vince il primo minimo (variabile prima, soglia più piccola);
   * - la divisione si accetta solo se G < G₀ − 1e−10 (riduzione d'impurità strettamente positiva), figli ≥ minLeaf;
   * - foglia: classe 1 se n₁ > n₀, a parità classe 0. Si va a sinistra se x < soglia. */
  function tree(X, y, idx, o) {
    var p = X[0].length, nodes = [];
    function grow(id, depth) {
      var m = id.length, c1 = 0, i, j; for (i = 0; i < m; i++) c1 += y[id[i]];
      var c0 = m - c1, node = { leaf: true, cls: c1 > c0 ? 1 : 0, n: m, n1: c1, depth: depth };
      var k = nodes.length; nodes.push(node);
      if (depth >= o.maxDepth || m < 2 * o.minLeaf || c0 === 0 || c1 === 0) return k;
      var vars = o.mtry < p ? SA.rs.sample(o.g, p, o.mtry) : null;
      var G0 = m - (c0 * c0 + c1 * c1) / m, best = G0 - 1e-10, bj = -1, bt = 0;
      for (var q = 0; q < (vars ? vars.length : p); q++) {
        j = vars ? vars[q] - 1 : q;
        var ord = id.slice().sort(function (a, b) { return X[a][j] - X[b][j]; }), l1 = 0;
        for (i = 0; i < m - 1; i++) {
          l1 += y[ord[i]];
          var nl = i + 1, nr = m - nl; if (nl < o.minLeaf || nr < o.minLeaf) continue;
          var v = X[ord[i]][j], w = X[ord[i + 1]][j]; if (!(v < w)) continue;
          var l0 = nl - l1, r1 = c1 - l1, r0 = nr - r1, G = nl - (l0 * l0 + l1 * l1) / nl + nr - (r0 * r0 + r1 * r1) / nr;
          if (G < best) { best = G; bj = j; bt = (v + w) / 2; }
        }
      }
      if (bj < 0) return k;
      var L = [], R = []; for (i = 0; i < m; i++) (X[id[i]][bj] < bt ? L : R).push(id[i]);
      node.leaf = false; node.j = bj; node.thr = bt; node.dec = G0 - best;
      node.l = grow(L, depth + 1); node.r = grow(R, depth + 1);
      return k;
    }
    grow(idx, 0);
    return nodes;
  }
  function treePredict(nodes, x) { var k = 0; while (!nodes[k].leaf) k = x[nodes[k].j] < nodes[k].thr ? nodes[k].l : nodes[k].r; return nodes[k].cls; }
  return { nearest: nearest, votePath: votePath, scaler: scaler, wilson: wilson, tree: tree, treePredict: treePredict };
})();
