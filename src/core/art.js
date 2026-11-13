/* StatAtlas · core/art.js — logo e illustrazioni originali in SVG.
 * Tutto è generato dal codice e usa i colori del tema (variabili CSS): nessuna immagine esterna. */
var SA = window.SA || (window.SA = {});

SA.art = (function () {
  var W = 320, H = 180;
  function rnd(seed) { var s = seed >>> 0; return function () { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { var u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function curve(f, x0, x1, n) { var a = []; for (var i = 0; i <= (n || 80); i++) { var x = x0 + (x1 - x0) * i / (n || 80); a.push([x, f(x)]); } return a; }
  function bell(mu, s, top, base) { return function (x) { return base - (base - top) * Math.exp(-0.5 * Math.pow((x - mu) / s, 2)); }; }
  function frame(inner, label) {
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '" preserveAspectRatio="xMidYMid slice">' +
      '<defs><pattern id="g' + label.length + '" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="var(--rule)" stroke-width=".6"/></pattern></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="var(--art-bg)"/><rect width="' + W + '" height="' + H + '" fill="url(#g' + label.length + ')" opacity=".7"/>' +
      inner + '</svg>';
  }
  var L = {};
  L.logo = function (size) {
    return '<svg class="logo" viewBox="0 0 64 64" width="' + (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="28" fill="var(--logo-bg)" stroke="var(--ink)" stroke-width="2.4"/>' +
      '<ellipse cx="32" cy="32" rx="12" ry="28" fill="none" stroke="var(--ink)" stroke-width="1.2" opacity=".55"/>' +
      '<path d="M4 32h56M8.5 18h47M8.5 46h47" stroke="var(--ink)" stroke-width="1" opacity=".35"/>' +
      '<path d="M6 46C16 46 20 14 32 14S48 46 58 46" fill="var(--accent)" fill-opacity=".14" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="32" cy="14" r="3.2" fill="var(--accent)"/></svg>';
  };
  /* ---- laboratori ---- */
  L.distribuzioni = function () {
    var s = '';
    [[110, 26, 'var(--c1)', 1], [190, 38, 'var(--c2)', .8], [240, 20, 'var(--c3)', .7]].forEach(function (c) {
      var p = curve(bell(c[0], c[1], 150 - 110 * c[3], 150), 20, 300);
      s += '<polygon points="' + pts(p) + ' 300,150 20,150" fill="' + c[2] + '" fill-opacity=".14"/><polyline points="' + pts(p) + '" fill="none" stroke="' + c[2] + '" stroke-width="2.6"/>';
    });
    for (var i = 0; i < 9; i++) s += '<rect x="' + (60 + i * 22) + '" y="' + (150 - [10, 22, 40, 58, 64, 52, 34, 18, 8][i]) + '" width="14" height="' + [10, 22, 40, 58, 64, 52, 34, 18, 8][i] + '" fill="var(--ink)" fill-opacity=".08"/>';
    return frame(s + '<line x1="20" y1="150" x2="300" y2="150" stroke="var(--ink)" stroke-width="1.4"/>', 'Densità sovrapposte');
  };
  L.bivariata = function () {
    var r = rnd(7), s = '<g transform="rotate(-28 160 90)"><ellipse cx="160" cy="90" rx="120" ry="44" fill="none" stroke="var(--c1)" stroke-opacity=".35"/><ellipse cx="160" cy="90" rx="80" ry="28" fill="none" stroke="var(--c1)" stroke-opacity=".55"/><ellipse cx="160" cy="90" rx="40" ry="14" fill="var(--c1)" fill-opacity=".12" stroke="var(--c1)"/></g>';
    for (var i = 0; i < 160; i++) { var a = gauss(r), b = 0.75 * a + 0.66 * gauss(r); s += '<circle cx="' + (160 + 46 * a).toFixed(1) + '" cy="' + (90 - 34 * b).toFixed(1) + '" r="2" fill="var(--ink)" fill-opacity=".45"/>'; }
    return frame(s + '<rect x="196" y="12" width="22" height="156" fill="var(--accent)" fill-opacity=".1" stroke="var(--accent)" stroke-dasharray="3 3"/>', 'Nuvola bivariata');
  };
  L.simulazione = function () {
    var f = function (x) { return 150 - 120 / (1 + Math.exp(-(x - 160) / 30)); }, s = '<polyline points="' + pts(curve(f, 20, 300)) + '" fill="none" stroke="var(--ink)" stroke-width="2.4"/>';
    [0.2, 0.45, 0.7, 0.88].forEach(function (u, i) { var y = 150 - 120 * u, x = 160 - 30 * Math.log(1 / u - 1); s += '<path d="M20 ' + y + 'H' + x + 'V150" fill="none" stroke="' + ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--accent)'][i] + '" stroke-width="2" stroke-dasharray="' + (i % 2 ? '5 3' : '') + '"/><circle cx="20" cy="' + y + '" r="4" fill="var(--accent)"/>'; });
    return frame(s, 'Inversione della ripartizione');
  };
  L['lgn-tcl'] = function () {
    var r = rnd(11), s = '<line x1="10" y1="90" x2="310" y2="90" stroke="var(--ink)" stroke-dasharray="6 4"/>';
    s += '<polygon points="' + pts(curve(function (x) { return 90 - 70 / Math.sqrt((x - 4) / 6); }, 10, 310)) + ' ' + pts(curve(function (x) { return 90 + 70 / Math.sqrt((x - 4) / 6); }, 310, 10)) + '" fill="var(--ink)" fill-opacity=".06"/>';
    ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'].forEach(function (c) { var m = 0, a = []; for (var k = 1; k <= 150; k++) { m += (gauss(r) - m) / k; a.push([10 + k * 2, 90 - 60 * m]); } s += '<polyline points="' + pts(a) + '" fill="none" stroke="' + c + '" stroke-width="1.8"/>'; });
    return frame(s, 'Traiettorie della media');
  };
  L.adattamento = function () {
    var r = rnd(5), s = '<polygon points="20,170 300,10 300,30 40,170" fill="var(--c3)" fill-opacity=".14"/><line x1="20" y1="160" x2="300" y2="20" stroke="var(--c2)" stroke-width="2" stroke-dasharray="7 4"/>';
    for (var i = 0; i < 26; i++) { var x = 30 + i * 10.5, y = 160 - (x - 20) * 0.5 + 6 * gauss(r) + (i > 22 ? -(i - 22) * 9 : 0); s += '<circle cx="' + x + '" cy="' + y.toFixed(1) + '" r="3.4" fill="var(--c1)"/>'; }
    return frame(s, 'Grafico quantile-quantile');
  };
  L.stimatori = function () {
    var r = rnd(3), s = '<polygon points="' + pts(curve(bell(160, 50, 40, 140), 10, 310)) + ' 310,140 10,140" fill="var(--paper-2)" stroke="var(--rule-2)"/>';
    for (var i = 0; i < 18; i++) s += '<circle cx="' + (160 + 40 * gauss(r)).toFixed(1) + '" cy="' + (70 + 50 * r()).toFixed(1) + '" r="3.4" fill="var(--ink)" fill-opacity=".5"/>';
    s += '<circle cx="268" cy="96" r="3.4" fill="var(--ink)" fill-opacity=".5"/>';
    [[172, 'var(--c1)', 'M0,-8 7,5 -7,5z'], [158, 'var(--c2)', 'M0,-8 6,0 0,8 -6,0z'], [163, 'var(--c3)', 'M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0']].forEach(function (m) {
      s += '<line x1="' + m[0] + '" x2="' + m[0] + '" y1="30" y2="160" stroke="' + m[1] + '" stroke-width="2"/><path transform="translate(' + m[0] + ' 160)" d="' + m[2] + '" fill="' + m[1] + '"/>';
    });
    return frame(s, 'Tre stimatori');
  };
  L.fisher = function () {
    var s = '<polyline points="' + pts(curve(function (x) { return 30 + 0.012 * (x - 160) * (x - 160); }, 40, 280)) + '" fill="none" stroke="var(--c2)" stroke-width="2" stroke-dasharray="7 4"/>';
    s += '<polyline points="' + pts(curve(function (x) { return 30 + 140 * (1 - Math.exp(-0.5 * Math.pow((x - 160) / 46, 2))); }, 20, 300)) + '" fill="none" stroke="var(--c1)" stroke-width="3"/>';
    return frame(s + '<line x1="20" y1="92" x2="300" y2="92" stroke="var(--c3)" stroke-dasharray="4 3"/><circle cx="160" cy="30" r="6" fill="var(--c1)" stroke="var(--card)" stroke-width="2"/>', 'Log-verosimiglianza');
  };
  L.intervalli = function () {
    var r = rnd(9), s = '<line x1="160" y1="8" x2="160" y2="172" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="6 4"/>';
    for (var i = 0; i < 16; i++) { var c = 160 + 34 * gauss(r), h = 48 + 10 * r(), ok = Math.abs(c - 160) < h; s += '<line x1="' + (c - h).toFixed(1) + '" x2="' + (c + h).toFixed(1) + '" y1="' + (16 + i * 10) + '" y2="' + (16 + i * 10) + '" stroke="' + (ok ? 'var(--c1)' : 'var(--c2)') + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="' + (ok ? '' : '6 3') + '"/>'; }
    return frame(s, 'Intervalli di confidenza');
  };
  L.test = function () {
    var a = curve(bell(120, 34, 30, 150), 10, 310), b = curve(bell(200, 34, 30, 150), 10, 310), s = '';
    s += '<polygon points="' + pts(b.filter(function (p) { return p[0] >= 178; })) + ' 310,150 178,150" fill="var(--c1)" fill-opacity=".25"/><polygon points="' + pts(a.filter(function (p) { return p[0] >= 178; })) + ' 310,150 178,150" fill="var(--c2)" fill-opacity=".45"/>';
    s += '<polyline points="' + pts(a) + '" fill="none" stroke="var(--c2)" stroke-width="2.4" stroke-dasharray="7 4"/><polyline points="' + pts(b) + '" fill="none" stroke="var(--c1)" stroke-width="2.6"/>';
    return frame(s + '<line x1="178" y1="20" x2="178" y2="150" stroke="var(--ink)" stroke-width="1.4"/><line x1="10" y1="150" x2="310" y2="150" stroke="var(--ink)"/>', 'Errore di primo tipo e potenza');
  };
  L.regressione = function () {
    var r = rnd(2), s = '<polygon points="20,150 300,40 300,70 20,170" fill="var(--c1)" fill-opacity=".14"/><polygon points="20,125 300,15 300,95 20,195" fill="var(--c3)" fill-opacity=".07"/><line x1="20" y1="160" x2="300" y2="55" stroke="var(--c1)" stroke-width="3"/>';
    for (var i = 0; i < 14; i++) { var x = 30 + i * 19, y = 160 - (x - 20) * 0.375 + 14 * gauss(r); s += '<circle cx="' + x + '" cy="' + y.toFixed(1) + '" r="5" fill="var(--c1)" fill-opacity=".35" stroke="var(--c1)"/>'; }
    return frame(s + '<circle cx="290" cy="150" r="9" fill="var(--c2)" fill-opacity=".35" stroke="var(--c2)" stroke-width="2"/>', 'Retta di regressione con bande');
  };
  L['regressione-lp'] = function () {
    var r = rnd(4), s = '';
    for (var i = 0; i < 16; i++) { var x = 25 + i * 17.5; s += '<circle cx="' + x + '" cy="' + (150 - (x - 20) * 0.35 + 8 * gauss(r)).toFixed(1) + '" r="3.4" fill="var(--ink)" fill-opacity=".5"/>'; }
    s += '<circle cx="270" cy="18" r="4.5" fill="var(--accent)"/><line x1="20" y1="152" x2="300" y2="40" stroke="var(--c1)" stroke-width="2.6"/><line x1="20" y1="150" x2="300" y2="53" stroke="var(--c2)" stroke-width="2.6" stroke-dasharray="7 4"/><line x1="20" y1="151" x2="300" y2="47" stroke="var(--c3)" stroke-width="2.6" stroke-dasharray="2 3"/>';
    return frame(s, 'Rette L1, L2, Lp');
  };
  L.glm = function () {
    var r = rnd(8), s = '<polyline points="' + pts(curve(function (x) { return 150 - 120 / (1 + Math.exp(-(x - 160) / 28)); }, 20, 300)) + '" fill="none" stroke="var(--c1)" stroke-width="3"/>';
    for (var i = 0; i < 26; i++) { var x = 24 + i * 11, p = 1 / (1 + Math.exp(-(x - 160) / 28)), y = r() < p ? 30 : 150; s += '<circle cx="' + x + '" cy="' + (y + (r() - 0.5) * 8).toFixed(1) + '" r="3.4" fill="var(--ink)" fill-opacity=".5"/>'; }
    return frame(s, 'Curva logistica');
  };
  L.arma = function () {
    var r = rnd(13), x1 = 0, x2 = 0, a = [], s = '';
    for (var t = 0; t < 140; t++) { var x = 1.2 * x1 - 0.6 * x2 + gauss(r); x2 = x1; x1 = x; a.push([12 + t * 2.1, 70 - 12 * x]); }
    s += '<polyline points="' + pts(a) + '" fill="none" stroke="var(--c1)" stroke-width="1.6"/><line x1="10" y1="150" x2="310" y2="150" stroke="var(--ink)"/>';
    for (var h = 1; h <= 12; h++) { var rho = Math.pow(0.775, h) * Math.cos(0.7 * h); s += '<line x1="' + (20 + h * 22) + '" x2="' + (20 + h * 22) + '" y1="150" y2="' + (150 - 26 * rho) + '" stroke="var(--c2)" stroke-width="5"/>'; }
    return frame(s, 'Serie e autocorrelazioni');
  };
  L.quantilica = function () {
    var r = rnd(21), s = '';
    for (var i = 0; i < 40; i++) { var x = 20 + i * 7, sc = 4 + i * 0.9; s += '<circle cx="' + x + '" cy="' + (150 - (x - 20) * 0.32 - sc * gauss(r)).toFixed(1) + '" r="2.6" fill="var(--ink)" fill-opacity=".45"/>'; }
    [[-1.28, 'var(--c4)', '2 3'], [-0.67, 'var(--c3)', '7 4'], [0, 'var(--accent)', ''], [0.67, 'var(--c3)', '7 4'], [1.28, 'var(--c4)', '2 3']].forEach(function (q) {
      s += '<line x1="20" y1="' + (150 - 4 * q[0]).toFixed(1) + '" x2="300" y2="' + (60 - 40 * q[0]).toFixed(1) + '" stroke="' + q[1] + '" stroke-width="' + (q[0] === 0 ? 3 : 2) + '" stroke-dasharray="' + q[2] + '"/>';
    });
    return frame(s, 'Rette quantiliche a ventaglio');
  };
  L.penalizzata = function () {
    var s = '<line x1="160" y1="10" x2="160" y2="170" stroke="var(--rule-2)"/><line x1="40" y1="90" x2="280" y2="90" stroke="var(--rule-2)"/>';
    s += '<polygon points="160,40 210,90 160,140 110,90" fill="var(--c1)" fill-opacity=".16" stroke="var(--c1)" stroke-width="2.4"/>';
    [[1, 1], [1.8, .55], [2.7, .35]].forEach(function (e) { s += '<ellipse cx="236" cy="52" rx="' + (52 * e[0]).toFixed(0) + '" ry="' + (22 * e[0]).toFixed(0) + '" transform="rotate(-30 236 52)" fill="none" stroke="' + (e[0] === 1.8 ? 'var(--c2)' : 'var(--ink-3)') + '" stroke-width="' + (e[0] === 1.8 ? 2.2 : 1) + '" stroke-dasharray="' + (e[0] === 1.8 ? '' : '3 3') + '"/>'; });
    return frame(s + '<circle cx="160" cy="40" r="6" fill="var(--accent)" stroke="var(--card)" stroke-width="2"/><path d="M236 44l7 12h-14z" fill="var(--c2)"/>', 'Rombo del lasso ed ellissi');
  };
  L.spline = function () {
    var r = rnd(31), s = '', f = function (x) { return 95 - 45 * Math.sin(2 * Math.PI * (x - 20) / 280) - 18 * ((x - 20) / 280) * Math.sin(6 * Math.PI * (x - 20) / 280); };
    for (var k = 0; k < 9; k++) { var c = 20 + k * 35; s += '<path d="M' + (c - 52) + ',160 Q' + c + ',' + (60 + 30 * Math.sin(k)) + ' ' + (c + 52) + ',160" fill="none" stroke="' + ['var(--c3)', 'var(--c4)', 'var(--c1)'][k % 3] + '" stroke-opacity=".5" stroke-width="1.4"/>'; }
    for (var i = 0; i < 46; i++) { var x = 20 + i * 6.1; s += '<circle cx="' + x.toFixed(1) + '" cy="' + (f(x) + 9 * gauss(r)).toFixed(1) + '" r="2.4" fill="var(--ink)" fill-opacity=".45"/>'; }
    s += '<polyline points="' + pts(curve(f, 20, 300)) + '" fill="none" stroke="var(--c1)" stroke-width="3"/>';
    for (var j = 1; j < 8; j++) s += '<line x1="' + (20 + j * 35) + '" x2="' + (20 + j * 35) + '" y1="168" y2="160" stroke="var(--accent)" stroke-width="2"/>';
    return frame(s, 'Spline e basi');
  };
  L.segmentata = function () {
    var r = rnd(41), s = '', f = function (x) { return 150 - 0.12 * (x - 20) - 0.45 * Math.max(0, x - 190); };
    for (var i = 0; i < 40; i++) { var x = 22 + i * 7; s += '<circle cx="' + x + '" cy="' + (f(x) + 9 * gauss(r)).toFixed(1) + '" r="2.6" fill="var(--ink)" fill-opacity=".45"/>'; }
    s += '<polyline points="20,150 190,129.6 300,80.1" fill="none" stroke="var(--accent)" stroke-width="3"/><line x1="20" y1="158" x2="300" y2="96" stroke="var(--c1)" stroke-width="2" stroke-dasharray="9 4"/>';
    s += '<line x1="190" y1="20" x2="190" y2="170" stroke="var(--ink)" stroke-dasharray="3 3"/><path d="M60,40 Q125,46 190,22 T300,44" fill="none" stroke="var(--c3)" stroke-width="2"/>';
    return frame(s, 'Spezzata e profilo');
  };
  L.validazione = function () {
    var r = rnd(53), s = '', tr = function (x) { return 150 - 110 * Math.exp(-(x - 20) / 70); }, te = function (x) { return 124 - 0.0029 * (x - 128) * (x - 128); };
    for (var k = 0; k < 5; k++) s += '<rect x="' + (24 + k * 56) + '" y="154" width="52" height="14" rx="3" fill="' + (k === 2 ? 'var(--c2)' : 'var(--c3)') + '" fill-opacity="' + (k === 2 ? '.55' : '.25') + '"/>';
    for (var i = 0; i < 12; i++) { var x = 30 + i * 23; s += '<circle cx="' + x + '" cy="' + (tr(x) + 6 * gauss(r)).toFixed(1) + '" r="2.4" fill="var(--ink)" fill-opacity=".4"/>'; }
    s += '<polyline points="' + pts(curve(tr, 20, 300)) + '" fill="none" stroke="var(--c1)" stroke-width="3"/>';
    s += '<polyline points="' + pts(curve(te, 20, 300)) + '" fill="none" stroke="var(--c2)" stroke-width="3" stroke-dasharray="9 4"/>';
    s += '<line x1="128" y1="18" x2="128" y2="148" stroke="var(--accent)" stroke-dasharray="3 3"/>';
    return frame(s, 'Training, test e fold');
  };
  L.knn = function () {
    var r = rnd(61), s = '';
    s += '<path d="M20,20 H150 Q170,90 140,170 H20 Z" fill="var(--c1)" fill-opacity=".12"/><path d="M150,20 H300 V170 H140 Q170,90 150,20 Z" fill="var(--c2)" fill-opacity=".12"/>';
    for (var i = 0; i < 26; i++) { var a = gauss(r), b = gauss(r), c = i % 2; var x = (c ? 215 : 85) + 38 * a, y = 95 + 38 * b; x = Math.max(26, Math.min(294, x)); y = Math.max(26, Math.min(164, y));
      s += c ? '<polygon points="' + x.toFixed(1) + ',' + (y - 5).toFixed(1) + ' ' + (x + 5).toFixed(1) + ',' + (y + 4).toFixed(1) + ' ' + (x - 5).toFixed(1) + ',' + (y + 4).toFixed(1) + '" fill="var(--c2)"/>' : '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.4" fill="var(--c1)"/>'; }
    s += '<circle cx="160" cy="92" r="44" fill="none" stroke="var(--ink)" stroke-dasharray="4 3"/><circle cx="160" cy="92" r="6" fill="var(--card)" stroke="var(--ink)" stroke-width="2.4"/>';
    s += '<line x1="152" y1="18" x2="152" y2="172" stroke="var(--ink)" stroke-opacity=".5" stroke-dasharray="7 4"/>';
    return frame(s, 'Vicini e frontiera');
  };
  L.alberi = function () {
    var s = '', node = function (x, y, c) { return '<rect x="' + (x - 18) + '" y="' + (y - 9) + '" width="36" height="18" rx="5" fill="' + c + '" fill-opacity=".85"/>'; };
    [[0, 'var(--c1)'], [1, 'var(--c3)'], [2, 'var(--c2)']].forEach(function (q) {
      var ox = 20 + q[0] * 95, e = function (x1, y1, x2, y2) { return '<line x1="' + (ox + x1) + '" y1="' + y1 + '" x2="' + (ox + x2) + '" y2="' + y2 + '" stroke="var(--ink)" stroke-opacity=".5" stroke-width="1.5"/>'; };
      var sh = q[0] * 7 - 7;
      s += e(45, 40, 22 + sh, 85) + e(45, 40, 68 + sh, 85) + e(22 + sh, 85, 10, 130) + e(22 + sh, 85, 34 + sh, 130) + e(68 + sh, 85, 80, 130);
      s += node(ox + 45, 40, q[1]) + node(ox + 22 + sh, 85, q[1]) + node(ox + 68 + sh, 85, q[1]);
      [10, 34 + sh, 80].forEach(function (x, i) { s += '<circle cx="' + (ox + x) + '" cy="130" r="6" fill="' + (i % 2 ? 'var(--c2)' : 'var(--c1)') + '" fill-opacity=".6"/>'; });
    });
    s += '<path d="M60,150 Q160,178 260,150" fill="none" stroke="var(--accent)" stroke-width="2.4"/><circle cx="160" cy="166" r="7" fill="var(--accent)"/>';
    return frame(s, 'Alberi che votano');
  };
  L.pca = function () {
    var r = rnd(71), s = '', c = Math.cos(-0.5), sn = Math.sin(-0.5);
    for (var i = 0; i < 70; i++) { var u = 55 * gauss(r), v = 16 * gauss(r); s += '<circle cx="' + (160 + c * u - sn * v).toFixed(1) + '" cy="' + (95 + sn * u + c * v).toFixed(1) + '" r="2.4" fill="var(--ink)" fill-opacity=".4"/>'; }
    s += '<ellipse cx="160" cy="95" rx="118" ry="34" transform="rotate(-28.6 160 95)" fill="none" stroke="var(--c3)" stroke-width="1.6" stroke-dasharray="6 4"/>';
    s += '<line x1="' + (160 - 120 * c) + '" y1="' + (95 - 120 * sn) + '" x2="' + (160 + 120 * c) + '" y2="' + (95 + 120 * sn) + '" stroke="var(--accent)" stroke-width="3.2"/>';
    s += '<line x1="' + (160 + 36 * sn) + '" y1="' + (95 - 36 * c) + '" x2="' + (160 - 36 * sn) + '" y2="' + (95 + 36 * c) + '" stroke="var(--c1)" stroke-width="3"/>';
    return frame(s, 'Assi principali');
  };
  L.clustering = function () {
    var r = rnd(83), s = '', C = [[90, 70, 'var(--c1)'], [215, 60, 'var(--c2)'], [160, 135, 'var(--c3)']];
    C.forEach(function (c) { for (var i = 0; i < 18; i++) s += '<circle cx="' + (c[0] + 20 * gauss(r)).toFixed(1) + '" cy="' + (c[1] + 14 * gauss(r)).toFixed(1) + '" r="2.8" fill="' + c[2] + '" fill-opacity=".7"/>'; });
    C.forEach(function (c) { s += '<path d="M' + (c[0] - 7) + ',' + (c[1] - 7) + 'L' + (c[0] + 7) + ',' + (c[1] + 7) + 'M' + (c[0] - 7) + ',' + (c[1] + 7) + 'L' + (c[0] + 7) + ',' + (c[1] - 7) + '" stroke="var(--ink)" stroke-width="3"/>'; });
    s += '<path d="M30,172 V160 H60 V172 M45,160 V150 H95 V172 M70,150 V138 H130 V172" fill="none" stroke="var(--ink)" stroke-opacity=".45" stroke-width="1.3"/>';
    return frame(s, 'Gruppi e centri');
  };
  /* ---- parti ---- */
  L.partI = L.distribuzioni; L.partII = L['lgn-tcl']; L.partIII = L.intervalli; L.partIV = L.regressione; L.partV = L.penalizzata; L.partVI = L.validazione; L.partVII = L.pca;
  function get(id) { return L[id] ? L[id]() : ''; }
  return { get: get, logo: L.logo };
})();
