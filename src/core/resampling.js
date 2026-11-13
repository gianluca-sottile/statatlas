/* StatAtlas · core/resampling.js — campionamento di indici identico a R (≥ 3.6, sample.kind = "Rejection").
 * R_unif_index: campionamento per rifiuto sugli interi sotto la potenza di 2 successiva, bit generati a gruppi di 16.
 * sample(n, k) senza reinserimento: algoritmo di do_sample (scambio con l'ultimo elemento).
 * Tutti gli indici restituiti sono 1-based, come in R. */
SA.rs = (function () {
  function rbits(g, bits) {
    var v = 0;
    for (var n = 0; n <= bits; n += 16) v = 65536 * v + Math.floor(g.unif() * 65536);
    return v % Math.pow(2, bits); // equivale alla maschera (1 << bits) − 1 (v < 2^53 per n < 2^31)
  }
  function unifIndex(g, dn) {
    if (dn <= 0) return 0;
    var bits = Math.ceil(Math.log2(dn)), dv;
    do { dv = rbits(g, bits); } while (dn <= dv);
    return dv;
  }
  /* sample(n, size) e sample(n, size, replace = TRUE) */
  function sample(g, n, size, replace) {
    if (size == null) size = n;
    var y = new Array(size), i;
    if (replace) { for (i = 0; i < size; i++) y[i] = unifIndex(g, n) + 1; return y; }
    var x = new Array(n); for (i = 0; i < n; i++) x[i] = i;
    for (i = 0; i < size; i++) { var j = unifIndex(g, n); y[i] = x[j] + 1; x[j] = x[--n]; }
    return y;
  }
  /* sample(v): permutazione degli elementi di un vettore (v[sample.int(length(v))]) */
  function permute(g, v) { return sample(g, v.length).map(function (k) { return v[k - 1]; }); }
  /* id_test <- sample(n, nTest); train <- setdiff(seq_len(n), id_test) (ordine crescente) */
  function split(g, n, nTest) {
    var test = sample(g, n, nTest), inT = new Uint8Array(n + 1), train = [];
    test.forEach(function (k) { inT[k] = 1; });
    for (var i = 1; i <= n; i++) if (!inT[i]) train.push(i);
    return { train: train, test: test };
  }
  /* fold <- sample(rep_len(1:K, m)): etichette 1..K per le m osservazioni di training */
  function folds(g, m, K) { var r = []; for (var i = 0; i < m; i++) r.push(i % K + 1); return permute(g, r); }
  /* controllo della partizione: fold disgiunti per costruzione, ognuno non vuoto, unione = tutte le m osservazioni */
  function checkFolds(f, K) {
    var sizes = new Array(K).fill(0), ok = true;
    f.forEach(function (k) { if (k < 1 || k > K || k !== Math.floor(k)) ok = false; else sizes[k - 1]++; });
    var tot = sizes.reduce(function (a, b) { return a + b; }, 0);
    return { ok: ok && tot === f.length && sizes.every(function (s) { return s > 0; }), sizes: sizes };
  }
  /* indici bootstrap: sample(n, replace = TRUE) */
  function boot(g, n) { return sample(g, n, n, true); }
  return { unifIndex: unifIndex, sample: sample, permute: permute, split: split, folds: folds, checkFolds: checkFolds, boot: boot };
})();
