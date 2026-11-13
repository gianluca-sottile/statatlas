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
  return { nearest: nearest, votePath: votePath, scaler: scaler, wilson: wilson };
})();
