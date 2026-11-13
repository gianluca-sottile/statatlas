/* StatAtlas · Lab 22 — k-means e clustering gerarchico.
 * Tre popolazioni normali in R² (centri su un cerchio di raggio d), n/3 punti ciascuna, più un eventuale valore anomalo.
 * k-means: Lloyd mostrato mezzo passo alla volta (assegnazione, aggiornamento); inizializzazioni da sample(n, K)
 * nello stesso ordine di stats::kmeans(nstart = R, algorithm = "Lloyd"). Gerarchico: SA.cluster.hclust. */
(function () {
  var el, S, ANG = [90, 210, 330].map(function (a) { return a * Math.PI / 180; });
  var SHAPE = {
    sferici: { label: 'Sferici, stessa dispersione', sx: [1, 1, 1], sy: [1, 1, 1] },
    allungati: { label: 'Allungati (stessa forma ellittica)', sx: [2.4, 2.4, 2.4], sy: [0.5, 0.5, 0.5] },
    densita: { label: 'Dispersioni diverse (0,5 · 1 · 2)', sx: [0.5, 1, 2], sy: [0.5, 1, 2] }
  };
  var LINK = { 'ward.D2': 'Ward (ward.D2)', complete: 'Legame completo', average: 'Legame medio', single: 'Legame singolo' };
  function gen(s) {
    var g = s.rng, n = s.n, X = [], lab = [], sh = SHAPE[s.shape], i;
    for (i = 0; i < n; i++) {
      var c = Math.floor(i / (n / 3)), z1 = g.norm(), z2 = g.norm();
      X.push([s.d * Math.cos(ANG[c]) + sh.sx[c] * z1, s.d * Math.sin(ANG[c]) + sh.sy[c] * z2]); lab.push(c + 1);
    }
    if (s.outlier) { X.push([8, 8]); lab.push(4); }
    if (s.std) for (var j = 0; j < 2; j++) {
      var m = 0, v = 0; X.forEach(function (x) { m += x[j] / X.length; }); X.forEach(function (x) { v += (x[j] - m) * (x[j] - m); }); v = Math.sqrt(v / (X.length - 1));
      X.forEach(function (x) { x[j] = (x[j] - m) / v; });
    }
    return { X: X, truth: lab };
  }
  function newState(prev) {
    var s = { shape: 'sferici', d: 3, n: 150, K: 3, starts: 10, link: 'ward.D2', std: false, outlier: false, init: 'random', seed: 2026, manual: null, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); var D = gen(s); s.X = D.X; s.truth = D.truth;
    s.N = s.X.length; s.runs = []; s.empty = 0; s.mono = true; s.done = false;
    if (s.manual && s.manual.length !== s.K) s.manual = null;
    s.h = SA.cluster.hclust(s.X, s.link); s.hlab = SA.cluster.cutree(s.h, s.K);
    startRun(s);
    return s;
  }
  function startRun(s) {
    var C;
    if (s.init === 'manual') { if (!s.manual) s.manual = SA.rs.sample(s.rng, s.N, s.K).map(function (k) { return s.X[k - 1].slice(); }); C = s.manual.map(function (c) { return c.slice(); }); }
    else C = SA.rs.sample(s.rng, s.N, s.K).map(function (k) { return s.X[k - 1].slice(); });
    s.cur = { C: C, C0: C.map(function (c) { return c.slice(); }), lab: null, phase: 'assign', iter: 0, trail: [C.map(function (c) { return c.slice(); })], w: [], done: false };
    s.runs.push(s.cur);
  }
  function nStarts() { return S.init === 'manual' ? 1 : S.starts; }
  function step() {
    if (S.done) return false;
    var r = S.cur, X = S.X, CL = SA.cluster, last = r.w.length ? r.w[r.w.length - 1] : Infinity, w;
    if (r.phase === 'assign') {
      var a = CL.assign(X, r.C, r.lab);
      if (!a.changed && r.lab) { r.done = true; r.final = CL.wcss(X, r.lab, r.C); r.ari = CL.ari(Array.from(r.lab), S.truth); }
      else { r.lab = a.lab; w = CL.wcss(X, r.lab, r.C); r.w.push(w); r.phase = 'update'; if (w > last + 1e-9) S.mono = false; if (r.iter >= 100) { r.done = true; r.final = w; r.ari = CL.ari(Array.from(r.lab), S.truth); } }
    } else {
      var u = CL.update(X, r.lab, S.K, r.C); r.C = u.C; S.empty += u.empty; r.trail.push(r.C.map(function (c) { return c.slice(); }));
      w = CL.wcss(X, r.lab, r.C); r.w.push(w); if (w > last + 1e-9) S.mono = false; r.phase = 'assign'; r.iter++;
    }
    if (r.done) { if (S.runs.length < nStarts()) startRun(S); else S.done = true; }
    return true;
  }
  function best() { var b = null; S.runs.forEach(function (r) { if (r.done && (!b || r.final < b.final)) b = r; }); return b; } // a parità il primo, come kmeans

  /* ---------- grafici ---------- */
  var figA, figB, figC, figD, legA, FA;
  function cols(t) { return [t.c1, t.c2, t.c3, t.accent, t.c4 || t.ink_2, t.ink_3]; }
  function range() { var r = 0; S.X.forEach(function (x) { r = Math.max(r, Math.abs(x[0]), Math.abs(x[1])); }); return +(1.08 * r).toPrecision(2); }
  function scatter(F, lab, C) {
    var P = SA.plot, t = F.t, g = F.g, cc = cols(t), SH = ['circle', 'circle', 'tri', 'diamond', 'diamond'];
    S.X.forEach(function (x, i) { var c = lab ? cc[lab[i] % cc.length] : t.ink_3; P.marker(g, SH[S.truth[i]], F.x(x[0]), F.y(x[1]), S.truth[i] === 4 ? 11 : 7, c, null).setAttribute('fill-opacity', '0.75'); });
    return cc;
  }
  function drawKM() {
    var P = SA.plot, r = S.cur, R = range();
    FA = P.frame(figA, { W: 520, H: 480, x: [-R, R], y: [-R, R], xlabel: S.std ? 'z₁' : 'x₁', ylabel: S.std ? 'z₂' : 'x₂', label: 'k-means: assegnazioni e centri' });
    var t = FA.t, g = FA.g, cc = scatter(FA, r.lab ? Array.from(r.lab).map(function (v) { return v; }) : null);
    for (var j = 0; j < S.K; j++) {
      P.svg('path', { d: P.path(r.trail.map(function (C) { return [FA.x(C[j][0]), FA.y(C[j][1])]; })), fill: 'none', stroke: cc[j % cc.length], 'stroke-width': 1.6, 'stroke-dasharray': '3 2' }, g);
      var cx = FA.x(r.C[j][0]), cy = FA.y(r.C[j][1]);
      P.svg('path', { d: 'M' + (cx - 9) + ',' + (cy - 9) + 'L' + (cx + 9) + ',' + (cy + 9) + 'M' + (cx - 9) + ',' + (cy + 9) + 'L' + (cx + 9) + ',' + (cy - 9), stroke: t.ink, 'stroke-width': 5 }, g);
      P.svg('path', { d: 'M' + (cx - 8) + ',' + (cy - 8) + 'L' + (cx + 8) + ',' + (cy + 8) + 'M' + (cx - 8) + ',' + (cy + 8) + 'L' + (cx + 8) + ',' + (cy - 8), stroke: cc[j % cc.length], 'stroke-width': 3 }, g);
      if (S.init === 'manual') P.svg('circle', { cx: FA.x(r.C0[j][0]), cy: FA.y(r.C0[j][1]), r: 9, fill: t.card, stroke: cc[j % cc.length], 'stroke-width': 3, style: 'cursor:grab', 'data-c': j }, g);
    }
    var ph = r.done ? 'convergenza dopo ' + r.iter + ' iterazioni' : 'iterazione ' + (r.iter + 1) + ' · prossimo passo: ' + (r.phase === 'assign' ? 'assegnazione' : 'aggiornamento dei centri');
    P.text(g, FA.m.l + 6, FA.m.t + 13, 'Avvio ' + S.runs.length + ' di ' + nStarts() + ' · ' + ph, { fill: t.ink, 'font-size': 12, 'font-weight': 600 });
  }
  function drawW() {
    var P = SA.plot, mx = 0, len = 2; S.runs.forEach(function (r) { r.w.forEach(function (v) { mx = Math.max(mx, v); }); len = Math.max(len, r.w.length); });
    var b = best(), lo = Infinity; S.runs.forEach(function (r) { r.w.forEach(function (v) { lo = Math.min(lo, v); }); });
    var F = P.frame(figB, { W: 520, H: 300, x: [1, len], y: [+(0.95 * lo).toPrecision(2), +(1.03 * mx).toPrecision(3)], xlabel: 'mezzo passo (assegnazione, aggiornamento, …)', ylabel: 'WCSS', label: 'WCSS lungo le iterazioni di ogni avvio' });
    var t = F.t, g = F.g;
    S.runs.forEach(function (r) { if (r.w.length) P.svg('path', { d: P.path(r.w.map(function (v, i) { return [F.x(i + 1), F.y(v)]; })), fill: 'none', stroke: r === S.cur ? t.accent : r === b ? t.c3 : t.ink_3, 'stroke-width': r === S.cur ? 2.8 : r === b ? 2.2 : 1, 'stroke-opacity': r === S.cur || r === b ? 1 : 0.45 }, g); });
    if (b) { P.svg('line', { x1: F.x(1), x2: F.x(len), y1: F.y(b.final), y2: F.y(b.final), stroke: t.c3, 'stroke-dasharray': '6 3' }, g); P.text(g, F.x(len) - 4, F.y(b.final) - 5, 'minimo trovato ' + SA.fmt(b.final, 2), { 'text-anchor': 'end', fill: t.c3, 'font-size': 11 }); }
  }
  function drawDendro() {
    var P = SA.plot, t = SA.theme(), h = S.h, n = h.n, order = SA.cluster.leafOrder(h), pos = new Float64Array(2 * n - 1), hy = new Float64Array(2 * n - 1), W = 520, H = 300, m = { l: 48, r: 12, t: 16, b: 26 }, svg, i;
    order.forEach(function (lf, k) { pos[lf] = k; });
    var top = h.heights[n - 2] * 1.05, X = function (v) { return m.l + (W - m.l - m.r) * (v + 0.5) / n; }, Y = function (v) { return H - m.b - (H - m.t - m.b) * v / top; };
    figC.innerHTML = ''; svg = P.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Dendrogramma', 'font-family': t.sans, 'font-size': 11 }, figC);
    var cc = cols(t), lab = S.hlab, colOf = new Array(2 * n - 1).fill(null);
    for (i = 0; i < n; i++) colOf[i] = cc[lab[i] % cc.length];
    var cut = S.K > 1 && S.K <= n ? (h.heights[n - S.K - 1] + h.heights[n - S.K]) / 2 : top;
    var paths = {};
    h.merges.forEach(function (mm, k) {
      var a = mm[0], b = mm[1], id = n + k; pos[id] = (pos[a] + pos[b]) / 2; hy[id] = h.heights[k];
      colOf[id] = colOf[a] === colOf[b] && h.heights[k] < cut ? colOf[a] : null;
      var c = colOf[id] || t.ink_3, d = 'M' + X(pos[a]).toFixed(1) + ',' + Y(hy[a]).toFixed(1) + 'V' + Y(hy[id]).toFixed(1) + 'H' + X(pos[b]).toFixed(1) + 'V' + Y(hy[b]).toFixed(1);
      paths[c] = (paths[c] || '') + d;
    });
    Object.keys(paths).forEach(function (c) { P.svg('path', { d: paths[c], fill: 'none', stroke: c, 'stroke-width': 1.2 }, svg); });
    P.svg('line', { x1: m.l, x2: W - m.r, y1: Y(cut), y2: Y(cut), stroke: t.accent, 'stroke-width': 1.8, 'stroke-dasharray': '6 3' }, svg);
    P.text(svg, W - m.r, Y(cut) - 5, 'taglio in K = ' + S.K, { 'text-anchor': 'end', fill: t.accent });
    [0, 0.5, 1].forEach(function (f) { P.text(svg, m.l - 6, Y(f * top) + 4, SA.fmt(f * top, 1), { 'text-anchor': 'end', fill: t.ink_3 }); });
    P.text(svg, 12, m.t + 4, 'altezza', { fill: t.ink_3 });
  }
  function drawH() {
    var P = SA.plot, R = range(), F = P.frame(figD, { W: 520, H: 480, x: [-R, R], y: [-R, R], xlabel: S.std ? 'z₁' : 'x₁', ylabel: S.std ? 'z₂' : 'x₂', label: 'Gruppi del clustering gerarchico' });
    scatter(F, Array.from(S.hlab).map(function (v) { return v - 1; }));
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch; legA.innerHTML = '';
    legA.append(el('span', sw(t.ink_2, null, 'circle'), sw(t.ink_2, null, 'tri'), sw(t.ink_2, null, 'diamond'), ' forma = popolazione generatrice'), el('span.muted', 'colore = gruppo assegnato'), el('span', sw(t.ink, null), '✕ centri e traiettorie'), S.init === 'manual' ? el('span.muted', 'trascina i cerchi: centri iniziali') : null);
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, CL = SA.cluster, done = S.runs.filter(function (r) { return r.done; }), bb = best();
    var finals = done.map(function (r) { return r.final; }), distinct = [];
    finals.forEach(function (f) { if (!distinct.some(function (d) { return Math.abs(d - f) < 1e-6 * Math.max(1, f); })) distinct.push(f); });
    var hl = Array.from(S.hlab), hm = S.h.heights.every(function (v, i) { return i === 0 || v >= S.h.heights[i - 1] - 1e-12; });
    var perm = hl.map(function (v) { return (v % S.K) + 1; }), invariant = Math.abs(CL.ari(hl, S.truth) - CL.ari(perm, S.truth)) < 1e-12;
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'WCSS finale: minimo · massimo tra gli avvii completati'), el('td', '—'), el('td', done.length ? fmt(Math.min.apply(null, finals), 3) + ' · ' + fmt(Math.max.apply(null, finals), 3) + ' (' + done.length + ' avvii)' : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Minimi locali distinti trovati'), el('td', 'ogni avvio converge a un minimo locale'), el('td', done.length ? String(distinct.length) : '—'), el('td', b('mc'))),
      el('tr', el('td', 'Accordo con le popolazioni (ARI): k-means migliore · gerarchico'), el('td', '1 = stessa partizione'), el('td', (bb ? fmt(bb.ari, 3) : '—') + ' · ' + fmt(CL.ari(hl, S.truth), 3)), el('td', b('none'))),
      el('tr', el('td', 'Accordo tra k-means migliore e gerarchico (ARI)'), el('td', '—'), el('td', bb ? fmt(CL.ari(Array.from(bb.lab), hl), 3) : '—'), el('td', b('none'))),
      el('tr', el('td', 'Controlli k-means'), el('td', 'WCSS non crescente a ogni mezzo passo; gruppi vuoti gestiti'), el('td', (S.mono ? '✓ WCSS monotona' : '✗') + ' · gruppi rimasti vuoti: ' + S.empty), el('td', b('exact'))),
      el('tr', el('td', 'Controlli gerarchico'), el('td', 'n − 1 = ' + (S.N - 1) + ' fusioni, altezze non decrescenti; ARI invariante per permutazione'), el('td', (S.h.merges.length === S.N - 1 ? '✓' : '✗') + ' · ' + (hm ? '✓' : '✗') + ' · ' + (invariant ? '✓' : '✗')), el('td', b('exact'))));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', done.length + ' / ' + nStarts()), el('span', 'avvii di k-means completati')),
      el('div.kpi', el('b', String(S.N)), el('span', 'osservazioni' + (S.outlier ? ' (con un valore anomalo)' : ''))),
      el('div.kpi', el('b', LINK[S.link]), el('span', 'legame del gerarchico')));
    updateFeedback();
  }
  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p22-' + Date.now();
    predBox.append(el('p.prose', 'Si lancia k-means con K = 3 da dieci punti di partenza casuali diversi, sugli stessi dati. Che cosa ti aspetti?'),
      el('div.choices', { role: 'radiogroup' }, [['same', 'Sempre la stessa partizione: l’algoritmo è deterministico'], ['local', 'Possono uscire partizioni diverse, con WCSS diverse: minimi locali'], ['labels', 'Stessa partizione, ma i numeri dei gruppi possono cambiare, e conta']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!fbBox) return;
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    fbBox.textContent = (S.pred === 'local' ? '✓ ' : '✗ ') + 'Lloyd scende sempre, ma solo fino al minimo locale più vicino al punto di partenza: con gruppi vicini, forme allungate o K diverso dal vero si ottengono soluzioni diverse. Per questo si usano più avvii e si tiene quello con WCSS minima. I numeri dei gruppi invece non contano: permutarli non cambia la partizione (l’ARI non cambia).';
  }
  function interpretation() {
    interpBox.innerHTML = '<p><strong>k-means</strong> cerca K centri che rendano minima la somma dei quadrati entro i gruppi (WCSS). L’algoritmo di Lloyd alterna due passi che non possono aumentarla: assegnare ogni punto al centro più vicino e spostare ogni centro nella media del suo gruppo. Converge in un numero finito di passi, ma a un <strong>minimo locale</strong>.</p>' +
      '<p>Il <strong>clustering gerarchico</strong> non sceglie K all’inizio: unisce progressivamente i gruppi più vicini, e il legame definisce che cosa significa “vicino”. Ward unisce i gruppi che fanno crescere meno la WCSS ed è il più simile a k-means; il legame singolo segue catene di punti, quello completo preferisce gruppi compatti.</p>' +
      '<p class="muted">Un algoritmo trova sempre dei gruppi, anche quando le popolazioni non sono separate: i gruppi sono una proprietà dell’algoritmo e della metrica, non necessariamente dei dati. Forme allungate e dispersioni diverse violano l’idea implicita di k-means (gruppi sferici e simili).</p>';
  }
  function codeR() {
    var sh = SHAPE[S.shape];
    return ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 22 — k-means e clustering gerarchico',
      '# R0: stessi dati di StatAtlas (stesso seed). R2: stats::kmeans con algorithm = "Lloyd" estrae i centri iniziali',
      '#     con sample.int(n, K) per ogni avvio, nello stesso ordine: stessa soluzione migliore (salvo gruppi vuoti,',
      '#     che in R fermano l’algoritmo con un errore). Il gerarchico usa hclust con lo stesso legame (a parità di',
      '#     distanza l’ordine delle fusioni può differire).',
      '# ───────────────────────────────────────────────────────────────', 'library(tidyverse)', '',
      'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; d <- ' + S.d + '; K <- ' + S.K + '; nstart <- ' + nStarts() + '; legame <- "' + S.link + '"',
      'ang <- c(90, 210, 330) * pi / 180; sx <- c(' + sh.sx.join(', ') + '); sy <- c(' + sh.sy.join(', ') + ')',
      'gruppo <- rep(1:3, each = n / 3)', 'Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)',
      'X <- cbind(d * cos(ang[gruppo]) + sx[gruppo] * Z[, 1], d * sin(ang[gruppo]) + sy[gruppo] * Z[, 2])',
      S.outlier ? 'X <- rbind(X, c(8, 8)); gruppo <- c(gruppo, 4)              # valore anomalo' : '# (nessun valore anomalo)',
      S.std ? 'X <- scale(X)                                                  # standardizzazione' : '# (nessuna standardizzazione)', '',
      '# Il gerarchico prima di kmeans: non usa numeri casuali, quindi non cambia il flusso del generatore',
      'hc <- hclust(dist(X), method = legame)', 'gruppi_h <- cutree(hc, k = K)', '',
      S.init === 'manual' ? 'centri0 <- rbind(' + S.manual.map(function (c) { return 'c(' + c.map(function (v) { return v.toFixed(6); }).join(', ') + ')'; }).join(', ') + ')   # centri trascinati' : '',
      S.init === 'manual' ? 'km <- kmeans(X, centers = centri0, algorithm = "Lloyd", iter.max = 100)' : 'km <- kmeans(X, centers = K, nstart = nstart, algorithm = "Lloyd", iter.max = 100)',
      'km$tot.withinss; km$iter', '',
      '# Indice di Rand corretto (Hubert e Arabie, 1985)', 'ari <- function(a, b) {', '  tab <- table(a, b); c2 <- function(x) sum(choose(x, 2))',
      '  e <- c2(rowSums(tab)) * c2(colSums(tab)) / choose(length(a), 2); m <- (c2(rowSums(tab)) + c2(colSums(tab))) / 2',
      '  (c2(tab) - e) / (m - e)', '}', 'c(kmeans = ari(km$cluster, gruppo), gerarchico = ari(gruppi_h, gruppo), tra_metodi = ari(km$cluster, gruppi_h))', '',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +', '    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'tibble(x1 = X[, 1], x2 = X[, 2], popolazione = factor(gruppo), kmeans = factor(km$cluster)) |>',
      '  ggplot(aes(x1, x2, colour = kmeans, shape = popolazione)) + geom_point() +', '  geom_point(data = as_tibble(km$centers, .name_repair = ~ c("x1", "x2")), inherit.aes = FALSE, aes(x1, x2), shape = 4, size = 5, stroke = 2) +',
      '  coord_equal() + theme_statatlas()', 'plot(hc, labels = FALSE); rect.hclust(hc, k = K)', ''].join('\n');
  }
  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>k-means</h3><p>Si cercano gruppi G₁, …, G<sub>K</sub> e centri c₁, …, c<sub>K</sub> che rendano minima</p><div class="eq" data-tex="\\text{WCSS} = \\sum_{k=1}^{K} \\sum_{i \\in G_k} \\|x_i - c_k\\|^2"></div><p>Lloyd: (1) ogni punto va al centro più vicino; (2) ogni centro diventa la media del suo gruppo. Nessuno dei due passi aumenta la WCSS e le partizioni possibili sono finite: l’algoritmo si ferma, ma in un minimo locale.</p>' +
        '<h3>Gerarchico agglomerativo</h3><p>Si parte da n gruppi di un punto e si uniscono, n − 1 volte, i due più vicini. Distanza tra gruppi: minima (singolo), massima (completo), media (medio), o incremento della WCSS (Ward). Il dendrogramma riporta l’altezza di ogni fusione; tagliarlo a una quota dà una partizione.</p>' +
        '<div class="callout warn">Le etichette dei gruppi sono arbitrarie (label switching): per confrontare partizioni si usano misure invarianti per permutazione, come l’indice di Rand corretto.</div>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Ward e la WCSS</h3><p>Unire due gruppi A e B fa crescere la WCSS di |A||B|/(|A| + |B|) · ‖c<sub>A</sub> − c<sub>B</sub>‖². Ward.D2 applica Lance–Williams alle distanze al quadrato: l’altezza di fusione è √(2 ΔWCSS), coerente con questa formula.</p>' +
        '<h3>Scegliere K</h3><p>La WCSS scende sempre aumentando K: si cercano gomiti, si usano la silhouette, la statistica gap (Tibshirani, Walther e Hastie, 2001) o modelli di miscuglio con BIC. Nessun criterio è automatico.</p>' +
        '<h3>Inizializzazione</h3><p>k-means++ sceglie i centri iniziali con probabilità proporzionale alla distanza al quadrato dai centri già scelti: garantisce in media una WCSS entro un fattore O(log K) dall’ottimo e riduce i minimi locali cattivi.</p>' });
    }
  };

  var run, codeBox, ctrlBox, drag = null, builtK = 0;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); if (S.K !== builtK) buildControls(); render(true); run.refresh(); }
  function render(full) { drawKM(); drawW(); if (full || run.frame % 4 === 0 || !run.running) { drawDendro(); drawH(); updateTable(); } }
  function bindDrag() {
    var toData = function (ev) { var svg = figA.querySelector('svg'); if (!svg || !svg.getScreenCTM || !FA) return null; var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()); return [FA.x.invert(p.x), FA.y.invert(p.y)]; };
    figA.addEventListener('pointerdown', function (ev) { var c = ev.target.closest && ev.target.closest('circle[data-c]'); if (!c || S.init !== 'manual') return; run.stop(); drag = +c.getAttribute('data-c'); if (figA.setPointerCapture) figA.setPointerCapture(ev.pointerId); });
    figA.addEventListener('pointermove', function (ev) { if (drag == null) return; var q = toData(ev); if (q) { S.manual[drag] = q; S.runs = []; S.done = false; S.empty = 0; S.mono = true; startRun(S); drawKM(); } });
    figA.addEventListener('pointerup', function () { if (drag != null) { drag = null; render(true); codeBox.refresh(); run.refresh(); } });
  }
  function buildControls() {
    ctrlBox.innerHTML = ''; builtK = S.K;
    var sel = function (lab, key, vals, fmtv, num) { return el('label.field', el('span', lab), el('select', { onchange: function () { S[key] = num === false ? this.value : +this.value; restart(); } }, vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmtv ? fmtv(v) : String(v)); }))); };
    var chk = function (lab, key) { return el('label.field', { style: 'flex-direction:row;display:flex;gap:8px;align-items:center' }, el('input', { type: 'checkbox', checked: S[key], onchange: function () { S[key] = this.checked; restart(); } }), el('span', lab)); };
    ctrlBox.append(
      sel('Popolazioni', 'shape', Object.keys(SHAPE), function (k) { return SHAPE[k].label; }, false),
      SA.ui.slider('Distanza tra i centri d', { min: 0.5, max: 5, step: 0.25, value: S.d, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.d = v; restart(); } }),
      SA.ui.slider('Numero di gruppi K', { min: 1, max: 6, step: 1, value: S.K, format: function (v) { return String(v); }, onchange: function (v) { S.K = v; S.manual = null; restart(); } }),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('Centri iniziali', 'init', ['random', 'manual'], function (v) { return v === 'random' ? 'casuali' : 'trascinabili'; }, false), sel('Avvii (nstart)', 'starts', [1, 10, 25, 50]),
        sel('Legame (gerarchico)', 'link', Object.keys(LINK), function (k) { return LINK[k]; }, false), sel('n', 'n', [60, 150, 300]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); S.manual = null; restart(); } }))),
      chk('Standardizza le variabili', 'std'), chk('Aggiungi un valore anomalo', 'outlier'));
    run.controls('Un mezzo passo di Lloyd').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('clustering', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.done; }, progress: function () { var d = S.runs.filter(function (r) { return r.done; }).length; return d / nStarts(); }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('k-means e clustering gerarchico', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Raggruppare osservazioni simili senza conoscere i gruppi: due algoritmi classici, i loro passi, le loro trappole.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Che cosa significa dividere osservazioni in gruppi, e quanto dipende il risultato dall’algoritmo scelto?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Lloyd passo dopo passo e dendrogramma');
      ctrlBox = el('div.panel.controls'); figA = el('div', { style: 'touch-action:none' }); figB = el('div'); figC = el('div'); figD = el('div'); legA = el('div.legend');
      var two = function (a, b) { return el('div.duo', a, b); };
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'k-means: assegnazioni, centri e loro percorso'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'WCSS a ogni mezzo passo'), el('div.legend', el('span.muted', 'arancio: avvio corrente · verde: migliore · grigio: altri avvii'))), figB),
        two(el('div.fig', el('div.fig-title', el('h3', 'Dendrogramma')), figC), el('div.fig', el('div.fig-title', el('h3', 'Gruppi del gerarchico al taglio')), figD)),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () { var b = best(), rows = [['x1', 'x2', 'popolazione', 'kmeans', 'gerarchico']]; S.X.forEach(function (x, i) { rows.push([x[0], x[1], S.truth[i], b ? b.lab[i] + 1 : '', S.hlab[i]]); }); SA.ui.download('statatlas_lab22_dati.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figC.querySelector('svg')], 'statatlas_lab22.png', ['k-means e clustering gerarchico', SHAPE[S.shape].label + ' · d = ' + S.d + ' · K = ' + S.K + ' · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Riferimento'), el('th', 'Risultato'), el('th', 'Natura'))), tblBody)),
        el('div.status-key', el('span', SA.ui.badge('exact'), ' proprietà garantita'), el('span', SA.ui.badge('mc'), ' sugli avvii'), el('span', SA.ui.badge('none'), ' valore del campione')), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Ward e WCSS, scelta di K, k-means++ (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'kmeans (Lloyd) e hclust'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab22_clustering.R');
      s6.body.append(el('p.prose', 'Riproducibilità: stessi dati (R0) e stesso algoritmo di Lloyd con gli stessi centri iniziali (R2); hclust con lo stesso legame. Richiede R ≥ 3.6 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); bindDrag(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
