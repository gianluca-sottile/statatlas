/* StatAtlas · core/plot.js — micro-libreria SVG.
 * I colori sono scritti come attributi (non classi CSS) così che
 * l'esportazione PNG/SVG conservi l'aspetto del grafico. */
var SA = window.SA || (window.SA = {});

SA.theme = function () {
  var cs = getComputedStyle(document.documentElement), t = {};
  ['paper', 'paper-2', 'card', 'ink', 'ink-2', 'ink-3', 'rule', 'rule-2', 'accent', 'c1', 'c2', 'c3', 'c4', 'c-theory']
    .forEach(function (k) { t[k.replace('-', '_')] = cs.getPropertyValue('--' + k).trim(); });
  t.serif = cs.getPropertyValue('--serif').trim();
  t.sans = cs.getPropertyValue('--sans').trim();
  return t;
};

SA.plot = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function scale(d0, d1, r0, r1) {
    var f = function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); };
    f.invert = function (p) { return d0 + (p - r0) / (r1 - r0) * (d1 - d0); };
    f.domain = [d0, d1]; f.range = [r0, r1];
    return f;
  }
  function ticks(a, b, n) {
    var span = b - a, step = Math.pow(10, Math.floor(Math.log10(span / (n || 5)))), err = (n || 5) / span * step;
    if (err <= 0.15) step *= 10; else if (err <= 0.35) step *= 5; else if (err <= 0.75) step *= 2;
    var out = [], v = Math.ceil(a / step) * step;
    for (; v <= b + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toPrecision(12));
    return out;
  }
  function fmtTick(v) { return String(v).replace('.', ',').replace('-', '−'); }

  /* Crea un'area di disegno con assi. Restituisce {root, g, x, y, W, H, m, t} */
  function frame(container, o) {
    var t = SA.theme(), W = o.W || 720, H = o.H || 300, m = o.m || { t: 16, r: 16, b: 42, l: 48 };
    container.innerHTML = '';
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.label || '',
      'font-family': t.sans, 'font-size': 13, xmlns: NS }, container);
    var x = scale(o.x[0], o.x[1], m.l, W - m.r);
    var y = o.y ? scale(o.y[0], o.y[1], H - m.b, m.t) : null;
    var ax = svg('g', { stroke: t.rule, 'stroke-width': 1 }, root);
    // griglia orizzontale leggera
    if (y && o.yTicks !== false) ticks(o.y[0], o.y[1], 4).forEach(function (v) {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), 'stroke-dasharray': v === 0 ? null : '2 4' }, ax);
      var tx = svg('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: t.ink_3, stroke: 'none' }, ax);
      tx.textContent = fmtTick(v);
    });
    svg('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.rule_2 }, ax);
    ticks(o.x[0], o.x[1], o.xTicks || 8).forEach(function (v) {
      svg('line', { x1: x(v), x2: x(v), y1: H - m.b, y2: H - m.b + 5, stroke: t.rule_2 }, ax);
      var tx = svg('text', { x: x(v), y: H - m.b + 19, 'text-anchor': 'middle', fill: t.ink_3, stroke: 'none' }, ax);
      tx.textContent = fmtTick(v);
    });
    if (o.xlabel) {
      var xl = svg('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle', fill: t.ink_2,
        'font-family': t.serif, 'font-style': 'italic', 'font-size': 13 }, root);
      xl.textContent = o.xlabel;
    }
    if (o.ylabel) {
      var yl = svg('text', { x: m.l + 6, y: Math.max(10, m.t - 4), fill: t.ink_3, 'font-size': 11 }, root);
      yl.textContent = o.ylabel;
    }
    var g = svg('g', null, root);
    return { root: root, g: g, x: x, y: y, W: W, H: H, m: m, t: t };
  }

  function marker(parent, shape, cx, cy, s, fill, stroke) {
    var a = { fill: fill, stroke: stroke || 'none', 'stroke-width': stroke ? 1.5 : null };
    if (shape === 'circle') { a.cx = cx; a.cy = cy; a.r = s * 0.55; return svg('circle', a, parent); }
    var p;
    if (shape === 'tri') p = [[cx, cy - s * 0.7], [cx + s * 0.68, cy + s * 0.5], [cx - s * 0.68, cy + s * 0.5]];
    else p = [[cx, cy - s * 0.75], [cx + s * 0.6, cy], [cx, cy + s * 0.75], [cx - s * 0.6, cy]];
    a.points = p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    return svg('polygon', a, parent);
  }

  function path(points) {
    var d = '';
    for (var i = 0; i < points.length; i++) d += (i ? 'L' : 'M') + points[i][0].toFixed(1) + ',' + points[i][1].toFixed(1);
    return d;
  }

  /* Campione legenda: linea con tratteggio + simbolo */
  function legendSwatch(color, dash, shape) {
    var s = svg('svg', { viewBox: '0 0 26 12', 'aria-hidden': 'true' });
    svg('line', { x1: 1, x2: 25, y1: 6, y2: 6, stroke: color, 'stroke-width': 2, 'stroke-dasharray': dash }, s);
    if (shape) marker(s, shape, 13, 6, 8, color);
    return s;
  }

  /* Istogramma a gradini come densità: counts su [lo, hi] diviso in counts.length classi */
  function hist(f, counts, lo, hi, total, color, opts) {
    opts = opts || {};
    if (!total) return null;
    var k = counts.length, bw = (hi - lo) / k, yb = f.y(0), d = 'M' + f.x(lo).toFixed(1) + ',' + yb.toFixed(1);
    for (var i = 0; i < k; i++) {
      var h = Math.max(f.m.t, f.y(counts[i] / (total * bw)));
      d += 'L' + f.x(lo + i * bw).toFixed(1) + ',' + h.toFixed(1) + 'L' + f.x(lo + (i + 1) * bw).toFixed(1) + ',' + h.toFixed(1);
    }
    return svg('path', { d: d + 'L' + f.x(hi).toFixed(1) + ',' + yb.toFixed(1) + 'Z', fill: color, 'fill-opacity': opts.opacity || 0.16,
      stroke: color, 'stroke-width': 1, 'stroke-dasharray': opts.dash || null }, f.g);
  }
  /* Curva y = fn(x) su [lo, hi], tagliata al bordo superiore */
  function curve(f, fn, lo, hi, attrs, n) {
    n = n || 240; var pts = [];
    for (var i = 0; i <= n; i++) { var x = lo + (hi - lo) * i / n, v = fn(x); if (isFinite(v)) pts.push([f.x(x), Math.min(f.y(f.y.domain[0]), Math.max(f.m.t, f.y(v)))]); }
    var a = { d: path(pts), fill: 'none', 'stroke-width': 2.2, 'stroke-linejoin': 'round' };
    for (var k in attrs) a[k] = attrs[k];
    return svg('path', a, f.g);
  }
  /* Molti punti in un solo tracciato: segmenti di lunghezza zero con estremità rotonde (rendering molto più leggero) */
  function dots(parent, points, r, color, opacity) {
    var d = '';
    for (var i = 0; i < points.length; i++) d += 'M' + points[i][0].toFixed(1) + ' ' + points[i][1].toFixed(1) + 'h0';
    return svg('path', { d: d, stroke: color, 'stroke-width': 2 * r, 'stroke-linecap': 'round', 'stroke-opacity': opacity == null ? 1 : opacity, fill: 'none' }, parent);
  }
  function text(parent, x, y, txt, attrs) {
    var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k];
    var e = svg('text', a, parent); e.textContent = txt; return e;
  }

  return { hist: hist, curve: curve, text: text, dots: dots, svg: svg, scale: scale, ticks: ticks, frame: frame, marker: marker, path: path, legendSwatch: legendSwatch };
})();
