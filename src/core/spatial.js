/* StatAtlas | core/spatial.js - metriche e pesi spaziali, senza dipendenze esterne.
 * Indici: griglia row-major (r * ncol + c); diagonale di W = 0.
 */
var SA = window.SA || (window.SA = {});
SA.spatial = (function () {
  'use strict';
  function grid(rows, cols) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2 || rows * cols > 2500) throw new RangeError('Griglia non valida');
    var a = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) a.push({ row: r, col: c, x: c, y: r, id: r * cols + c });
    return a;
  }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function weights(rows, cols, kind, style, radius) {
    kind = kind || 'rook'; style = style || 'binary';
    if (['rook', 'queen', 'distance'].indexOf(kind) < 0) throw new Error('Tipo di vicinato sconosciuto');
    if (['binary', 'row'].indexOf(style) < 0) throw new Error('Stile dei pesi sconosciuto');
    if (kind === 'distance' && !(radius > 0 && Number.isFinite(radius))) throw new RangeError('Raggio non valido');
    var xy = grid(rows, cols), n = xy.length, out = [];
    for (var i = 0; i < n; i++) {
      var nb = [];
      for (var j = 0; j < n; j++) {
        if (i === j) continue;
        var dr = Math.abs(xy[i].row - xy[j].row), dc = Math.abs(xy[i].col - xy[j].col);
        var yes = kind === 'rook' ? dr + dc === 1 : kind === 'queen' ? Math.max(dr, dc) === 1 : distance(xy[i], xy[j]) <= radius + 1e-12;
        if (yes) nb.push({ j: j, w: 1 });
      }
      if (style === 'row' && nb.length) nb.forEach(function (e) { e.w = 1 / nb.length; });
      out.push(nb);
    }
    return out;
  }
  function inspect(W) {
    var n = W.length, s0 = 0, isolates = 0;
    W.forEach(function (nb, i) {
      if (!nb.length) isolates++;
      nb.forEach(function (e) {
        if (!Number.isInteger(e.j) || e.j < 0 || e.j >= n || e.j === i || !Number.isFinite(e.w) || e.w < 0) throw new RangeError('Matrice W invalida');
        s0 += e.w;
      });
    });
    return { n: n, s0: s0, isolates: isolates };
  }
  function lag(W, x) {
    if (W.length !== x.length) throw new RangeError('Dimensioni incompatibili');
    return W.map(function (nb) { return nb.reduce(function (sum, e) { return sum + e.w * x[e.j]; }, 0); });
  }
  return { grid: grid, distance: distance, weights: weights, inspect: inspect, lag: lag };
})();
