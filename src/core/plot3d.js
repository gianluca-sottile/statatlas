/* StatAtlas · core/plot3d.js — superfici 3D in SVG (nessuna dipendenza).
 * Proiezione con azimut/elevazione, algoritmo del pittore, palette viridis
 * (percettivamente uniforme e adatta ai daltonici). Rotazione con trascinamento,
 * frecce da tastiera, pulsante di ripristino. */
var SA = window.SA || (window.SA = {});

SA.plot3d = (function () {
  var VIR = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
  function color(t) {
    t = Math.max(0, Math.min(1, t)) * (VIR.length - 1);
    var i = Math.min(VIR.length - 2, Math.floor(t)), f = t - i, a = VIR[i], b = VIR[i + 1];
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + f * (b[k] - a[k])); }).join(',') + ')';
  }
  function fmt(v) { return SA.fmt(v, Math.abs(v) >= 10 ? 0 : Math.abs(v) >= 1 ? 1 : 2); }

  /* o = { xs, ys, z(i, j), zmax, discrete, section: j (indice ys) | null,
   *       labels: {x, y, z}, view: {az, el} (oggetto condiviso, viene aggiornato), label } */
  function draw(container, o) {
    var P = SA.plot, t = SA.theme(), W = 720, H = 400, nx = o.xs.length, ny = o.ys.length;
    var view = o.view || (o.view = { az: -0.75, el: 0.5 });
    container.innerHTML = '';
    var root = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', tabindex: 0, 'aria-label': (o.label || 'Superficie') + '. Trascina o usa le frecce per ruotare.',
      'font-family': t.sans, 'font-size': 12, xmlns: 'http://www.w3.org/2000/svg', style: 'cursor:grab;touch-action:none' }, container);
    var g = P.svg('g', null, root);
    var x0 = o.xs[0], x1 = o.xs[nx - 1], y0 = o.ys[0], y1 = o.ys[ny - 1];
    function proj(x, y, z) {
      var u = 2 * (x - x0) / (x1 - x0) - 1, v = 2 * (y - y0) / (y1 - y0) - 1, w = 1.25 * Math.min(z, o.zmax) / o.zmax;
      var ca = Math.cos(view.az), sa = Math.sin(view.az), ce = Math.cos(view.el), se = Math.sin(view.el);
      var u2 = u * ca - v * sa, v2 = u * sa + v * ca;
      return [W / 2 + 205 * u2, H * 0.6 - 205 * (w * ce + v2 * se) * 0.78, v2 * ce - w * se];
    }
    function render() {
      g.innerHTML = '';
      var items = [], i, j;
      // base e assi
      var base = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (c) { return proj(c[0], c[1], 0); });
      P.svg('polygon', { points: base.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: t.paper_2, stroke: t.rule_2 }, g);
      if (!o.discrete) {
        for (i = 0; i < nx - 1; i++) for (j = 0; j < ny - 1; j++) {
          var zs = [o.z(i, j), o.z(i + 1, j), o.z(i + 1, j + 1), o.z(i, j + 1)];
          var pts = [proj(o.xs[i], o.ys[j], zs[0]), proj(o.xs[i + 1], o.ys[j], zs[1]), proj(o.xs[i + 1], o.ys[j + 1], zs[2]), proj(o.xs[i], o.ys[j + 1], zs[3])];
          var zm = (zs[0] + zs[1] + zs[2] + zs[3]) / 4;
          items.push({ d: (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) / 4, pts: pts, c: color(zm / o.zmax) });
        }
      } else {
        for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) {
          var zz = o.z(i, j), a = proj(o.xs[i], o.ys[j], 0), b = proj(o.xs[i], o.ys[j], zz);
          items.push({ d: a[2], a: a, b: b, c: color(zz / o.zmax), w: 3 });
        }
      }
      // colonne della simulazione (istogramma 3D o frequenze), ordinate insieme alla superficie
      (o.bars || []).forEach(function (bar) {
        var a2 = proj(bar[0], bar[1], 0), b2 = proj(bar[0], bar[1], bar[2]);
        items.push({ d: a2[2] - 1e-6, a: a2, b: b2, c: t.c1, w: o.barWidth || 4, sim: true, over: bar[2] > o.zmax });
      });
      items.sort(function (p, q) { return q.d - p.d; });
      var faded = o.bars && o.bars.length && !o.discrete;
      items.forEach(function (s) {
        if (s.pts) P.svg('polygon', { points: s.pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
          fill: s.c, 'fill-opacity': faded ? 0.55 : 1, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 0.4 }, g);
        else {
          P.svg('line', { x1: s.a[0], y1: s.a[1], x2: s.b[0], y2: s.b[1], stroke: s.c, 'stroke-width': s.w, 'stroke-linecap': s.sim ? 'butt' : 'round', 'stroke-opacity': s.sim ? 0.9 : 1 }, g);
          if (s.sim) P.svg('circle', { cx: s.b[0], cy: s.b[1], r: s.over ? 3.5 : 2.2, fill: s.over ? t.accent : t.c1 }, g);
        }
      });
      // sezione al valore corrente del parametro
      if (o.section != null) {
        var sec = [];
        for (i = 0; i < nx; i++) sec.push(proj(o.xs[i], o.ys[o.section], o.z(i, o.section)));
        if (o.discrete) sec.forEach(function (p, k) { var q = proj(o.xs[k], o.ys[o.section], 0); P.svg('line', { x1: q[0], y1: q[1], x2: p[0], y2: p[1], stroke: t.accent, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); });
        else P.svg('path', { d: P.path(sec), fill: 'none', stroke: t.accent, 'stroke-width': 3 }, g);
        // istogramma empirico sul piano della sezione
        if (o.sectionHist) {
          var sh = o.sectionHist, ys0 = o.ys[o.section], poly = [proj(sh.x0, ys0, 0)];
          sh.h.forEach(function (h, k) { poly.push(proj(sh.x0 + k * sh.bw, ys0, h)); poly.push(proj(sh.x0 + (k + 1) * sh.bw, ys0, h)); });
          poly.push(proj(sh.x0 + sh.h.length * sh.bw, ys0, 0));
          P.svg('path', { d: P.path(poly) + 'Z', fill: t.c1, 'fill-opacity': 0.3, stroke: t.c1, 'stroke-width': 1.4 }, g);
          P.svg('path', { d: P.path(sec), fill: 'none', stroke: t.accent, 'stroke-width': 3 }, g);
        }
        var lp = sec[sec.length - 1], lt = P.svg('text', { x: lp[0] + 6, y: lp[1] - 4, fill: t.accent, 'font-size': 12, 'font-weight': 600 }, g);
        lt.textContent = o.sectionLabel || 'valore attuale';
      }
      // etichette degli assi
      function lab(p, txt, anchor, col) { var e = P.svg('text', { x: p[0], y: p[1], 'text-anchor': anchor || 'middle', fill: col || t.ink_3, 'font-size': 11.5 }, g); e.textContent = txt; }
      var px0 = proj(x0, y0, 0), px1 = proj(x1, y0, 0), py1 = proj(x1, y1, 0);
      lab([px0[0], px0[1] + 16], fmt(x0)); lab([px1[0], px1[1] + 16], fmt(x1));
      lab([(px0[0] + px1[0]) / 2, (px0[1] + px1[1]) / 2 + 30], o.labels.x, 'middle', t.ink_2);
      lab([py1[0] + 8, py1[1] + 4], fmt(y1), 'start');
      lab([(px1[0] + py1[0]) / 2 + 14, (px1[1] + py1[1]) / 2 + 14], o.labels.y, 'start', t.ink_2);
      var zt = proj(x0, y1, o.zmax), zb = proj(x0, y1, 0);
      P.svg('line', { x1: zb[0], y1: zb[1], x2: zt[0], y2: zt[1], stroke: t.rule_2 }, g);
      lab([zt[0] - 6, zt[1] + 4], o.labels.z + ' ' + fmt(o.zmax), 'end', t.ink_2);
    }
    render();
    // interazione
    var drag = null;
    root.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, view.az, view.el]; root.setPointerCapture(e.pointerId); root.style.cursor = 'grabbing'; });
    root.addEventListener('pointermove', function (e) {
      if (!drag) return;
      view.az = drag[2] + (e.clientX - drag[0]) * 0.01;
      view.el = Math.max(0.05, Math.min(1.45, drag[3] + (e.clientY - drag[1]) * 0.01));
      render();
    });
    root.addEventListener('pointerup', function () { drag = null; root.style.cursor = 'grab'; });
    root.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft') view.az -= 0.1; else if (k === 'ArrowRight') view.az += 0.1;
      else if (k === 'ArrowUp') view.el = Math.min(1.45, view.el + 0.08); else if (k === 'ArrowDown') view.el = Math.max(0.05, view.el - 0.08);
      else return;
      e.preventDefault(); e.stopPropagation(); render();
    });
    return { svg: root, render: render };
  }

  /* Legenda della palette */
  function colorbar(zmax, label) {
    var el = SA.ui.el, stops = VIR.map(function (c, i) { return 'rgb(' + c.join(',') + ') ' + (100 * i / (VIR.length - 1)) + '%'; }).join(',');
    return el('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, '0',
      el('i', { style: 'display:inline-block;width:90px;height:10px;border-radius:2px;background:linear-gradient(90deg,' + stops + ')' }),
      SA.fmt(zmax, 2) + ' ' + (label || ''));
  }
  return { draw: draw, color: color, colorbar: colorbar };
})();
