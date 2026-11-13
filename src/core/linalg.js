/* StatAtlas · core/linalg.js — algebra lineare per matrici piccole (n × p con p ≤ ~20).
 * API ristretta e testata (tests/test_linalg.js):
 *   SA.la.lsq(X, y)    minimi quadrati con QR di Householder → {beta, rss, rank, fitted}
 *   SA.la.symEig(S)    autodecomposizione simmetrica (Jacobi ciclico) → {values (decrescenti), vectors (colonne)}
 *   SA.la.matMul(A, B), SA.la.t(A)
 * Le matrici sono array di righe (array o Float64Array). */
var SA = window.SA || (window.SA = {});

SA.la = (function () {
  function t(A) { var r = A.length, c = A[0].length, o = []; for (var j = 0; j < c; j++) { o.push(new Float64Array(r)); for (var i = 0; i < r; i++) o[j][i] = A[i][j]; } return o; }
  function matMul(A, B) {
    var n = A.length, m = B[0].length, k = B.length, o = [];
    for (var i = 0; i < n; i++) { var row = new Float64Array(m); for (var q = 0; q < k; q++) { var a = A[i][q]; if (a) for (var j = 0; j < m; j++) row[j] += a * B[q][j]; } o.push(row); }
    return o;
  }

  /* Minimi quadrati numericamente stabili: X = QR (Householder), β = R⁻¹ Qᵀy, RSS = ‖(Qᵀy)₍ₚ₊₁…ₙ₎‖² */
  function lsq(X, y) {
    var n = X.length, p = X[0].length, i, j, k;
    var A = []; for (j = 0; j < p; j++) { A.push(new Float64Array(n)); for (i = 0; i < n; i++) A[j][i] = X[i][j]; } // per colonne
    var b = Float64Array.from(y), diag = new Float64Array(p), rank = p, maxd = 0;
    for (k = 0; k < p; k++) {
      var col = A[k], nrm = 0; for (i = k; i < n; i++) nrm += col[i] * col[i]; nrm = Math.sqrt(nrm);
      if (nrm === 0) { diag[k] = 0; continue; }
      var alpha = col[k] > 0 ? -nrm : nrm, v0 = col[k] - alpha, vn2 = v0 * v0 + (nrm * nrm - col[k] * col[k]);
      col[k] = v0; // il vettore di Householder occupa col[k..n-1]
      if (vn2 > 0) {
        for (j = k + 1; j < p; j++) { var s = 0, cj = A[j]; for (i = k; i < n; i++) s += col[i] * cj[i]; s = 2 * s / vn2; for (i = k; i < n; i++) cj[i] -= s * col[i]; }
        var sb = 0; for (i = k; i < n; i++) sb += col[i] * b[i]; sb = 2 * sb / vn2; for (i = k; i < n; i++) b[i] -= sb * col[i];
      }
      diag[k] = alpha; maxd = Math.max(maxd, Math.abs(alpha));
    }
    for (k = 0; k < p; k++) if (Math.abs(diag[k]) <= 1e-10 * maxd) rank--;
    var beta = new Float64Array(p);
    for (k = p - 1; k >= 0; k--) {
      var s2 = b[k]; for (j = k + 1; j < p; j++) s2 -= A[j][k] * beta[j];
      beta[k] = Math.abs(diag[k]) > 1e-10 * maxd ? s2 / diag[k] : NaN;
    }
    var rss = 0; for (i = p; i < n; i++) rss += b[i] * b[i];
    var fitted = new Float64Array(n); for (i = 0; i < n; i++) { var f = 0; for (j = 0; j < p; j++) f += X[i][j] * beta[j]; fitted[i] = f; }
    return { beta: beta, rss: rss, rank: rank, fitted: fitted };
  }

  /* Autodecomposizione di una matrice simmetrica con il metodo di Jacobi ciclico.
   * Autovalori in ordine decrescente; segno degli autovettori fissato (componente di modulo massimo positiva). */
  function symEig(S0) {
    var p = S0.length, S = S0.map(function (r) { return Float64Array.from(r); }), V = [], i, j, k, sweep;
    for (i = 0; i < p; i++) { V.push(new Float64Array(p)); V[i][i] = 1; }
    var scale = 0; for (i = 0; i < p; i++) for (j = 0; j < p; j++) scale += S[i][j] * S[i][j]; scale = Math.sqrt(scale) || 1;
    for (sweep = 0; sweep < 100; sweep++) {
      var off = 0; for (i = 0; i < p; i++) for (j = i + 1; j < p; j++) off += S[i][j] * S[i][j];
      if (Math.sqrt(off) <= 1e-15 * scale) break;
      for (i = 0; i < p - 1; i++) for (j = i + 1; j < p; j++) {
        if (Math.abs(S[i][j]) <= 1e-300) continue;
        var th = (S[j][j] - S[i][i]) / (2 * S[i][j]), tt = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
        for (k = 0; k < p; k++) { var a = S[k][i], b = S[k][j]; S[k][i] = c * a - s * b; S[k][j] = s * a + c * b; }
        for (k = 0; k < p; k++) { var a2 = S[i][k], b2 = S[j][k]; S[i][k] = c * a2 - s * b2; S[j][k] = s * a2 + c * b2; }
        for (k = 0; k < p; k++) { var a3 = V[k][i], b3 = V[k][j]; V[k][i] = c * a3 - s * b3; V[k][j] = s * a3 + c * b3; }
      }
    }
    var idx = []; for (i = 0; i < p; i++) idx.push(i);
    idx.sort(function (a, b) { return S[b][b] - S[a][a] || a - b; });
    var values = idx.map(function (q) { return S[q][q]; }), vectors = [];
    for (i = 0; i < p; i++) vectors.push(new Float64Array(p));
    idx.forEach(function (q, col) {
      var m = 0, sg = 1; for (k = 0; k < p; k++) if (Math.abs(V[k][q]) > m + 1e-12) { m = Math.abs(V[k][q]); sg = V[k][q] < 0 ? -1 : 1; }
      for (k = 0; k < p; k++) vectors[k][col] = sg * V[k][q];
    });
    return { values: values, vectors: vectors };
  }
  /* Base ortonormale delle colonne di X (Gram–Schmidt modificato con doppia ortogonalizzazione).
   * Per un disegno fisso: RSS(y) = ‖y‖² − ‖Qᵀy‖², calcolabile in O(np) per ogni nuovo y. */
  function orthoBasis(X) {
    var n = X.length, p = X[0].length, Q = [], i, j, k, pass;
    for (j = 0; j < p; j++) {
      var v = new Float64Array(n); for (i = 0; i < n; i++) v[i] = X[i][j];
      for (pass = 0; pass < 2; pass++) for (k = 0; k < Q.length; k++) { var s = 0, q = Q[k]; for (i = 0; i < n; i++) s += q[i] * v[i]; for (i = 0; i < n; i++) v[i] -= s * q[i]; }
      var nr = 0; for (i = 0; i < n; i++) nr += v[i] * v[i]; nr = Math.sqrt(nr);
      if (nr > 1e-10) { for (i = 0; i < n; i++) v[i] /= nr; Q.push(v); }
    }
    return Q;
  }
  function rssQ(Q, y, yy) {
    var r = yy, n = y.length;
    for (var k = 0; k < Q.length; k++) { var s = 0, q = Q[k]; for (var i = 0; i < n; i++) s += q[i] * y[i]; r -= s * s; }
    return Math.max(0, r);
  }
  return { lsq: lsq, symEig: symEig, matMul: matMul, t: t, orthoBasis: orthoBasis, rssQ: rssQ };
})();
