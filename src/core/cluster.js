/* StatAtlas · core/cluster.js — k-means (Lloyd), clustering gerarchico agglomerativo, indice di Rand corretto.
 * Lloyd come in stats::kmeans(algorithm = "Lloyd"): assegnazione al centro più vicino (a parità il primo),
 * poi media dei gruppi. Differenza dichiarata: un gruppo vuoto conserva il centro precedente (R si ferma con un errore).
 * Gerarchico: formula di Lance–Williams; Ward.D2 lavora sulle distanze al quadrato e restituisce altezze = radice. */
SA.cluster = (function () {
  function d2(a, b) { var s = 0; for (var j = 0; j < a.length; j++) { var t = a[j] - b[j]; s += t * t; } return s; }
  function assign(X, C, lab) {
    var changed = false, out = new Int32Array(X.length);
    for (var i = 0; i < X.length; i++) {
      var best = Infinity, bj = 0;
      for (var j = 0; j < C.length; j++) { var dd = d2(X[i], C[j]); if (dd < best) { best = dd; bj = j; } }
      out[i] = bj; if (!lab || lab[i] !== bj) changed = true;
    }
    return { lab: out, changed: changed };
  }
  function update(X, lab, K, Cprev) {
    var p = X[0].length, C = [], nc = new Array(K).fill(0), empty = 0, i, j;
    for (j = 0; j < K; j++) C.push(new Array(p).fill(0));
    for (i = 0; i < X.length; i++) { nc[lab[i]]++; for (j = 0; j < p; j++) C[lab[i]][j] += X[i][j]; }
    for (j = 0; j < K; j++) { if (nc[j]) for (var c = 0; c < p; c++) C[j][c] /= nc[j]; else { C[j] = Cprev[j].slice(); empty++; } }
    return { C: C, sizes: nc, empty: empty };
  }
  function wcss(X, lab, C) { var s = 0; for (var i = 0; i < X.length; i++) s += d2(X[i], C[lab[i]]); return s; }

  /* gerarchico: metodo 'single' | 'complete' | 'average' | 'ward.D2'. merges[m] = [a, b] con id dei nodi
   * (foglie 0…n−1, nodo interno n + m), heights[m] altezza della fusione. A parità di distanza: coppia (i, j) con i, poi j, minimi. */
  function hclust(X, method) {
    var n = X.length, D = new Float64Array(n * n), size = new Array(n).fill(1), node = [], act = new Uint8Array(n).fill(1), i, j, k, ward = method === 'ward.D2';
    for (i = 0; i < n; i++) { node.push(i); for (j = i + 1; j < n; j++) { var v = d2(X[i], X[j]); D[i * n + j] = D[j * n + i] = ward ? v : Math.sqrt(v); } }
    var merges = [], heights = [];
    for (var m = 0; m < n - 1; m++) {
      var best = Infinity, bi = -1, bj = -1;
      for (i = 0; i < n; i++) if (act[i]) for (j = i + 1; j < n; j++) if (act[j] && D[i * n + j] < best) { best = D[i * n + j]; bi = i; bj = j; }
      merges.push([node[bi], node[bj]]); heights.push(ward ? Math.sqrt(best) : best);
      var ni = size[bi], nj = size[bj];
      for (k = 0; k < n; k++) if (act[k] && k !== bi && k !== bj) {
        var dki = D[k * n + bi], dkj = D[k * n + bj], nk = size[k], v2;
        if (method === 'single') v2 = Math.min(dki, dkj);
        else if (method === 'complete') v2 = Math.max(dki, dkj);
        else if (method === 'average') v2 = (ni * dki + nj * dkj) / (ni + nj);
        else v2 = ((ni + nk) * dki + (nj + nk) * dkj - nk * best) / (ni + nj + nk);
        D[k * n + bi] = D[bi * n + k] = v2;
      }
      act[bj] = 0; size[bi] = ni + nj; node[bi] = n + m;
    }
    return { merges: merges, heights: heights, n: n };
  }
  /* taglio in K gruppi (come cutree): si applicano le prime n − K fusioni; etichette 1…K per ordine di prima comparsa */
  function cutree(h, K) {
    var n = h.n, par = [], i;
    for (i = 0; i < 2 * n - 1; i++) par.push(i);
    function find(a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }
    for (var m = 0; m < n - K; m++) { par[find(h.merges[m][0])] = n + m; par[find(h.merges[m][1])] = n + m; }
    var map = {}, next = 1, lab = new Int32Array(n);
    for (i = 0; i < n; i++) { var r = find(i); if (!map[r]) map[r] = next++; lab[i] = map[r]; }
    return lab;
  }
  /* ordine delle foglie nel dendrogramma (visita in profondità dalla radice, primo figlio a sinistra) */
  function leafOrder(h) {
    var n = h.n, out = [], st = [2 * n - 2];
    while (st.length) { var v = st.pop(); if (v < n) out.push(v); else { var mm = h.merges[v - n]; st.push(mm[1], mm[0]); } }
    return out;
  }
  /* indice di Rand corretto (Hubert e Arabie, 1985): invariante per permutazione delle etichette */
  function ari(a, b) {
    var n = a.length, T = {}, A = {}, B = {}, c2 = function (x) { return x * (x - 1) / 2; }, s = 0, sa = 0, sb = 0, k;
    for (var i = 0; i < n; i++) { k = a[i] + '|' + b[i]; T[k] = (T[k] || 0) + 1; A[a[i]] = (A[a[i]] || 0) + 1; B[b[i]] = (B[b[i]] || 0) + 1; }
    for (k in T) s += c2(T[k]); for (k in A) sa += c2(A[k]); for (k in B) sb += c2(B[k]);
    var e = sa * sb / c2(n), mx = (sa + sb) / 2;
    return mx === e ? 1 : (s - e) / (mx - e);
  }
  /* ---------- DBSCAN (Ester et al., 1996), convenzione deterministica ----------
   * N(i) = { j : ‖xᵢ − xⱼ‖ ≤ ε } (i compreso, in ordine di indice); core se |N(i)| ≥ minPts.
   * Si scorrono i punti in ordine di indice; un core non ancora etichettato apre un nuovo cluster, espanso in ampiezza
   * (coda FIFO, vicini in ordine di indice). Un punto non core né raggiunto diventa rumore (0) in via provvisoria e può
   * diventare bordo; un punto di bordo resta al primo cluster che lo raggiunge. */
  function neighbors(X, eps) {
    var n = X.length, nb = [], e2 = eps, i, j;
    for (i = 0; i < n; i++) nb.push([]);
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (Math.sqrt(d2(X[i], X[j])) <= e2) nb[i].push(j);
    return nb;
  }
  function dbscan(X, eps, minPts, nb) {
    nb = nb || neighbors(X, eps);
    var n = X.length, cl = new Int32Array(n).fill(-1), core = new Uint8Array(n), id = 0, i;
    for (i = 0; i < n; i++) core[i] = nb[i].length >= minPts ? 1 : 0;
    for (i = 0; i < n; i++) {
      if (cl[i] !== -1) continue;
      if (!core[i]) { cl[i] = 0; continue; }
      cl[i] = ++id; var queue = [i], h = 0;
      while (h < queue.length) {
        var q = queue[h++], L = nb[q];
        for (var k = 0; k < L.length; k++) { var j = L[k]; if (cl[j] === -1 || cl[j] === 0) { var fresh = cl[j] === -1; cl[j] = id; if (core[j] && fresh) queue.push(j); } }
      }
    }
    return { cl: cl, core: core, nb: nb, k: id };
  }
  /* distanza dal k-esimo vicino (escluso il punto stesso), ordinata in modo crescente */
  function kdist(X, k) {
    var n = X.length, out = [];
    for (var i = 0; i < n; i++) { var d = []; for (var j = 0; j < n; j++) if (j !== i) d.push(Math.sqrt(d2(X[i], X[j]))); d.sort(function (a, b) { return a - b; }); out.push(d[Math.min(k, d.length) - 1]); }
    return out.sort(function (a, b) { return a - b; });
  }
  /* silhouette media (Rousseeuw, 1987); con skip0 i punti etichettati 0 (rumore) sono esclusi. NaN con meno di 2 gruppi */
  function silhouette(X, lab, skip0) {
    var idx = [], i, j; for (i = 0; i < X.length; i++) if (!(skip0 && lab[i] === 0)) idx.push(i);
    var groups = {}; idx.forEach(function (q) { groups[lab[q]] = (groups[lab[q]] || 0) + 1; });
    var G = Object.keys(groups); if (G.length < 2) return NaN;
    var s = 0;
    idx.forEach(function (a) {
      var sum = {}; idx.forEach(function (b) { if (a !== b) sum[lab[b]] = (sum[lab[b]] || 0) + Math.sqrt(d2(X[a], X[b])); });
      var own = lab[a], na = groups[own]; if (na === 1) return; // silhouette 0 per i gruppi di un solo punto
      var ai = sum[own] / (na - 1), bi = Infinity;
      G.forEach(function (gk) { if (gk != own) bi = Math.min(bi, (sum[gk] || 0) / groups[gk]); });
      s += (bi - ai) / Math.max(ai, bi);
    });
    return s / idx.length;
  }
  return { assign: assign, update: update, wcss: wcss, hclust: hclust, cutree: cutree, leafOrder: leafOrder, ari: ari, d2: d2, neighbors: neighbors, dbscan: dbscan, kdist: kdist, silhouette: silhouette };
})();
