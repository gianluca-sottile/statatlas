/* StatAtlas | core/spatial-local.js — LISA, permutazioni condizionali, MAUP.
 * W sparse, diagonale nulla; I_i = z_i (Wz)_i / m2, m2 = sum(z²)/n.
 * Inferenza: randomizzazione degli n-1 valori fuori dalla cella i, x_i fissato.
 */
var SA = window.SA || (window.SA = {});
SA.spatialLocal = (function () {
  'use strict';
  function local(x, W) {
    var info = SA.spatial.inspect(W), n = info.n;
    if (x.length !== n || n < 3 || x.some(function (v) { return !Number.isFinite(v); })) throw new RangeError('Dati LISA non validi');
    var mean = x.reduce(function (s, v) { return s + v; }, 0) / n;
    var z = x.map(function (v) { return v - mean; });
    var m2 = z.reduce(function (s, v) { return s + v * v; }, 0) / n;
    if (!(m2 > 1e-24)) return { valid: false, z: z, m2: m2, lag: [], I: [], expected: [], quadrant: [] };
    var lag = SA.spatial.lag(W, z), I = [], expected = [], quadrant = [];
    for (var i = 0; i < n; i++) {
      var ws = W[i].reduce(function (s, e) { return s + e.w; }, 0);
      I[i] = z[i] * lag[i] / m2;
      expected[i] = -z[i] * z[i] * ws / ((n - 1) * m2);
      quadrant[i] = !W[i].length || Math.abs(z[i]) < 1e-12 || Math.abs(lag[i]) < 1e-12 ? 'NA' :
        z[i] > 0 ? (lag[i] > 0 ? 'HH' : 'HL') : (lag[i] < 0 ? 'LL' : 'LH');
    }
    return { valid: true, z: z, m2: m2, lag: lag, I: I, expected: expected, quadrant: quadrant };
  }
  function conditionalOne(z, W, m2, rng) {
    var n = z.length, values = new Array(n);
    for (var i = 0; i < n; i++) {
      if (!W[i].length) { values[i] = NaN; continue; }
      var others = [];
      for (var j = 0; j < n; j++) if (j !== i) others.push(z[j]);
      for (var k = others.length - 1; k > 0; k--) {
        var h = Math.floor(rng.unif() * (k + 1)), t = others[k]; others[k] = others[h]; others[h] = t;
      }
      // la posizione j in others è j per j<i, j-1 per j>i
      var lag = 0;
      for (var q = 0; q < W[i].length; q++) {
        var e = W[i][q]; lag += e.w * others[e.j < i ? e.j : e.j - 1];
      }
      values[i] = z[i] * lag / m2;
    }
    return values;
  }
  function pValues(observed, expected, samples, W) {
    var n = observed.length, p = new Array(n).fill(NaN), B = samples.length;
    if (!B) return p;
    for (var i = 0; i < n; i++) {
      if (!W[i].length || !Number.isFinite(observed[i])) continue;
      var d = Math.abs(observed[i] - expected[i]), count = 0;
      for (var b = 0; b < B; b++) if (Math.abs(samples[b][i] - expected[i]) >= d - 1e-12) count++;
      p[i] = (1 + count) / (B + 1);
    }
    return p;
  }
  function adjust(p, method) {
    if (['none', 'BH', 'BY'].indexOf(method) < 0) throw new Error('Correzione multipla sconosciuta');
    var idx = p.map(function (v, i) { return { p: v, i: i }; }).filter(function (o) { return Number.isFinite(o.p); }).sort(function (a, b) { return a.p - b.p || a.i - b.i; });
    var out = Array(p.length).fill(NaN), m = idx.length, C = method === 'BY' ? Array.from({ length: m }, function (_, j) { return 1 / (j + 1); }).reduce(function (s, v) { return s + v; }, 0) : 1;
    if (method === 'none') return p.slice();
    var prev = 1;
    for (var k = m - 1; k >= 0; k--) {
      prev = Math.min(prev, idx[k].p * m * C / (k + 1));
      out[idx[k].i] = prev;
    }
    return out;
  }
  function partitions(scale, zoning) {
    if (scale === 'none') return Array.from({ length: 8 }, function (_, i) { return [i]; });
    if (scale === '4') return [[0,1,2,3],[4,5,6,7]];
    if (zoning === 'shifted') return [[0],[1,2],[3,4],[5,6,7]];
    return [[0,1],[2,3],[4,5],[6,7]];
  }
  function aggregate(x, scale, zoning) {
    if (!Array.isArray(x) || x.length !== 64) throw new RangeError('L’aggregazione richiede 8×8 celle');
    if (['none','2','4'].indexOf(scale) < 0) throw new RangeError('Scala non valida');
    var rr = partitions(scale, zoning), cc = partitions(scale, zoning), output = [], zones = [], members = [];
    for (var r = 0; r < rr.length; r++) for (var c = 0; c < cc.length; c++) {
      var ids = [];
      rr[r].forEach(function (i) { cc[c].forEach(function (j) { ids.push(i * 8 + j); }); });
      output.push(ids.reduce(function (s, id) { return s + x[id]; }, 0) / ids.length);
      members.push(ids);
      zones.push({ row: r, col: c, row0: rr[r][0], col0: cc[c][0], h: rr[r].length, w: cc[c].length, ids: ids });
    }
    return { x: output, rows: rr.length, cols: cc.length, zones: zones, members: members };
  }
  function generatePattern(pattern, seed) {
    var base = SA.spatialAreal.generate(8, 8,
      ['iid','checker','trend','sar'].indexOf(pattern) >= 0 ? pattern : 'iid', seed, 0.65);
    if (pattern === 'hotspot' || pattern === 'outlier') {
      base.x = base.noise.map(function (e, k) {
        var r = Math.floor(k / 8), c = k % 8;
        if (pattern === 'outlier') return 0.35 * e + (r === 3 && c === 3 ? -3.5 : 0.9);
        var a = Math.exp(-((r - 2) ** 2 + (c - 2) ** 2) / 2.5);
        var b = Math.exp(-((r - 5.4) ** 2 + (c - 5.4) ** 2) / 2.5);
        return 1.9 * a - 1.9 * b + 0.32 * e;
      });
    }
    return base.x.slice();
  }
  return { local: local, conditionalOne: conditionalOne, pValues: pValues, adjust: adjust, aggregate: aggregate, generatePattern: generatePattern };
})();
