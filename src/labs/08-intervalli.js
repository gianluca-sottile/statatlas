/* StatAtlas · Lab 08 — Intervalli di confidenza: copertura nominale, esatta e osservata */
(function () {
  var el, S, LAWS = SA.laws, SHOW = 40;
  var tq = function (p, df) { return LAWS.get('t').q(p, { df: df }); };
  var cq = function (p, df) { return LAWS.get('chisq').q(p, { df: df }); };
  var lchoose = SA.sf.lchoose;

  var METHODS = {
    z: { label: 'Media normale, σ nota (Z)', par: 'μ', model: 'norm', st: 'exact',
      ci: function (x, a) { var m = SA.stat.mean(x), h = SA.qnorm(1 - a / 2) * S.sigma / Math.sqrt(x.length); return [m - h, m + h]; },
      formula: 'x̄ ± z<sub>1−α/2</sub> σ/√n', r: 'z <- qnorm(1 - a / 2)\n  mean(x) + c(-1, 1) * z * sigma / sqrt(n)' },
    t: { label: 'Media normale, σ ignota (t)', par: 'μ', model: 'norm', st: 'exact',
      ci: function (x, a) { var n = x.length, m = SA.stat.mean(x), h = tq(1 - a / 2, n - 1) * SA.stat.sd(x) / Math.sqrt(n); return [m - h, m + h]; },
      formula: 'x̄ ± t<sub>n−1, 1−α/2</sub> s/√n', r: 'mean(x) + c(-1, 1) * qt(1 - a / 2, n - 1) * sd(x) / sqrt(n)' },
    wald: { label: 'Proporzione: Wald', par: 'p', model: 'bern', st: 'asym',
      ci: function (x, a) { var n = x.length, p = SA.stat.mean(x), h = SA.qnorm(1 - a / 2) * Math.sqrt(p * (1 - p) / n); return [p - h, p + h]; },
      ciS: function (s, n, a) { var p = s / n, h = SA.qnorm(1 - a / 2) * Math.sqrt(p * (1 - p) / n); return [p - h, p + h]; },
      formula: 'p̂ ± z<sub>1−α/2</sub> √(p̂(1 − p̂)/n)', r: 'p <- mean(x); z <- qnorm(1 - a / 2)\n  p + c(-1, 1) * z * sqrt(p * (1 - p) / n)' },
    wilson: { label: 'Proporzione: Wilson', par: 'p', model: 'bern', st: 'asym',
      ci: function (x, a) { return METHODS.wilson.ciS(x.reduce(function (s, v) { return s + v; }, 0), x.length, a); },
      ciS: function (s, n, a) {
        var p = s / n, z = SA.qnorm(1 - a / 2), den = 1 + z * z / n, c = (p + z * z / (2 * n)) / den, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den;
        return [Math.max(0, c - h), Math.min(1, c + h)];
      },
      formula: '[p̂ + z²/(2n) ± z √(p̂(1 − p̂)/n + z²/(4n²))] / (1 + z²/n)',
      r: 'p <- mean(x); z <- qnorm(1 - a / 2); den <- 1 + z^2 / n\n  ctr <- (p + z^2 / (2 * n)) / den\n  h <- z * sqrt(p * (1 - p) / n + z^2 / (4 * n^2)) / den\n  c(max(0, ctr - h), min(1, ctr + h))' },
    garwood: { label: 'Media Poisson: Garwood (esatto)', par: 'λ', model: 'pois', st: 'exact',
      ci: function (x, a) { return METHODS.garwood.ciS(x.reduce(function (s, v) { return s + v; }, 0), x.length, a); },
      ciS: function (s, n, a) { return [s === 0 ? 0 : cq(a / 2, 2 * s) / (2 * n), cq(1 - a / 2, 2 * s + 2) / (2 * n)]; },
      formula: '[χ²<sub>2S, α/2</sub> / (2n), χ²<sub>2S+2, 1−α/2</sub> / (2n)], &nbsp;S = Σxᵢ',
      r: 's <- sum(x)\n  c(if (s == 0) 0 else qchisq(a / 2, 2 * s) / (2 * n), qchisq(1 - a / 2, 2 * s + 2) / (2 * n))' },
    exp: { label: 'Tasso esponenziale: pivot χ²', par: 'λ', model: 'exp', st: 'exact',
      ci: function (x, a) { var n = x.length, s = x.reduce(function (t, v) { return t + v; }, 0); return [cq(a / 2, 2 * n) / (2 * s), cq(1 - a / 2, 2 * n) / (2 * s)]; },
      formula: '[χ²<sub>2n, α/2</sub>, χ²<sub>2n, 1−α/2</sub>] / (2 Σxᵢ)', r: 's <- sum(x)\n  c(qchisq(a / 2, 2 * n), qchisq(1 - a / 2, 2 * n)) / (2 * s)' }
  };
  var MODELS = {
    norm: { gen: function (g, n) { return g.rnorm(n, S.mu, S.sigma); }, truth: function () { return S.mu; }, se: function (n) { return S.sigma / Math.sqrt(n); }, r: function () { return 'rnorm(n, mean = ' + S.mu + ', sd = ' + S.sigma + ')'; } },
    bern: { gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = LAWS.get('bern').q(g.unif(), { prob: S.p }); return o; }, truth: function () { return S.p; }, se: function (n) { return Math.sqrt(S.p * (1 - S.p) / n); }, r: function () { return 'qbinom(runif(n), size = 1, prob = ' + S.p + ')'; } },
    pois: { gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = LAWS.get('pois').q(g.unif(), { lambda: S.lambda }); return o; }, truth: function () { return S.lambda; }, se: function (n) { return Math.sqrt(S.lambda / n); }, r: function () { return 'qpois(runif(n), lambda = ' + S.lambda + ')'; } },
    exp: { gen: function (g, n) { var o = new Float64Array(n); for (var i = 0; i < n; i++) o[i] = -Math.log1p(-g.unif()) / S.rate; return o; }, truth: function () { return S.rate; }, se: function (n) { return S.rate / Math.sqrt(n); }, r: function () { return 'qexp(runif(n), rate = ' + S.rate + ')'; } }
  };

  function newState(prev) {
    var s = { method: 'z', n: 20, level: 0.95, B: 1000, seed: 2026, mu: 10, sigma: 2, p: 0.1, lambda: 2, rate: 1, pred: null };
    if (prev) for (var k in s) if (prev[k] !== undefined) s[k] = prev[k];
    s.rng = new SA.RRNG(s.seed); s.k = 0; s.cov = 0; s.width = 0;
    s.lo = new Float64Array(s.B); s.hi = new Float64Array(s.B); s.trace = [];
    return s;
  }
  function M() { return METHODS[S.method]; }
  function Md() { return MODELS[M().model]; }

  /* Copertura esatta: somma sulla legge della statistica sufficiente (metodi discreti) */
  var exactCache = {};
  function exactCoverage() {
    var m = M(), key = [S.method, S.n, S.level, S.p, S.lambda].join('|');
    if (exactCache[key] != null) return exactCache[key];
    var a = 1 - S.level, n = S.n, c = 0, s, pr;
    if (m.model === 'bern') {
      for (s = 0; s <= n; s++) { pr = Math.exp(lchoose(n, s) + s * Math.log(S.p) + (n - s) * Math.log1p(-S.p)); var ci = m.ciS(s, n, a); if (S.p >= ci[0] && S.p <= ci[1]) c += pr; }
    } else if (m.model === 'pois') {
      var mu = n * S.lambda, top = Math.ceil(mu + 12 * Math.sqrt(mu) + 30);
      for (s = 0; s <= top; s++) { pr = Math.exp(-mu + s * Math.log(mu) - SA.sf.lgamma(s + 1)); var c2 = m.ciS(s, n, a); if (S.lambda >= c2[0] && S.lambda <= c2[1]) c += pr; }
    } else c = S.level;
    return (exactCache[key] = c);
  }
  function theoWidth() {
    var a = 1 - S.level, n = S.n;
    if (S.method === 'z') return 2 * SA.qnorm(1 - a / 2) * S.sigma / Math.sqrt(n);
    if (S.method === 't') { var c4 = Math.sqrt(2 / (n - 1)) * Math.exp(SA.sf.lgamma(n / 2) - SA.sf.lgamma((n - 1) / 2)); return 2 * tq(1 - a / 2, n - 1) * c4 * S.sigma / Math.sqrt(n); }
    return NaN;
  }

  function step() {
    if (S.k >= S.B) return false;
    var x = Md().gen(S.rng, S.n), ci = M().ci(x, 1 - S.level), th = Md().truth();
    S.lo[S.k] = ci[0]; S.hi[S.k] = ci[1];
    if (th >= ci[0] && th <= ci[1]) S.cov++;
    S.width += ci[1] - ci[0]; S.k++;
    if (S.k <= 50 || S.k % Math.max(1, Math.floor(S.B / 300)) === 0 || S.k === S.B) S.trace.push([S.k, S.cov / S.k]);
    return true;
  }

  /* ---------- grafici ---------- */
  var figA, figB, legA, legB;
  function drawIntervals() {
    var P = SA.plot, th = Md().truth(), se = Md().se(S.n), lo = th - 5 * se, hi = th + 5 * se;
    if (M().model !== 'norm') lo = Math.max(lo, M().model === 'bern' ? -0.02 : 0);
    if (M().model === 'bern') hi = Math.min(hi, 1.02);
    var f = P.frame(figA, { W: 720, H: 340, x: [+lo.toPrecision(3), +hi.toPrecision(3)], xlabel: M().par, label: 'Ultimi intervalli generati' });
    var t = f.t, g = f.g, from = Math.max(0, S.k - SHOW), rowH = (f.H - f.m.b - 24) / SHOW;
    P.svg('line', { x1: f.x(th), x2: f.x(th), y1: 8, y2: f.H - f.m.b, stroke: t.ink, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g);
    P.text(g, f.x(th) + 5, 18, M().par + ' = ' + SA.fmt(th, 3) + ' (vero valore, fisso)', { fill: t.ink_2, 'font-size': 12, 'font-family': t.serif, 'font-style': 'italic' });
    var cl = function (v) { return f.x(Math.max(f.x.domain[0], Math.min(f.x.domain[1], v))); };
    for (var i = from; i < S.k; i++) {
      var y = f.H - f.m.b - 8 - (S.k - 1 - i) * rowH, ok = th >= S.lo[i] && th <= S.hi[i], c = ok ? t.c1 : t.c2;
      P.svg('line', { x1: cl(S.lo[i]), x2: cl(S.hi[i]), y1: y, y2: y, stroke: c, 'stroke-width': ok ? 2.2 : 2.6, 'stroke-dasharray': ok ? null : '5 3', 'stroke-linecap': 'round' }, g);
      if (!ok) P.marker(g, 'diamond', cl((S.lo[i] + S.hi[i]) / 2), y, 9, t.c2);
      if (S.hi[i] - S.lo[i] < 1e-12) P.svg('circle', { cx: cl(S.lo[i]), cy: y, r: 3, fill: t.c2 }, g);
    }
    if (!S.k) P.text(g, 360, 150, 'Premi ▶: ogni passo è un nuovo campione e un nuovo intervallo', { 'text-anchor': 'middle', fill: t.ink_3, 'font-size': 13 });
  }
  function drawCoverage() {
    var P = SA.plot, L = S.level, ex = exactCoverage(), B = S.B, ylo = Math.min(L - 0.12, ex - 0.04), yhi = Math.min(1, Math.max(L + 0.06, ex + 0.03));
    var f = P.frame(figB, { W: 720, H: 240, x: [0, B], y: [+ylo.toFixed(2), +yhi.toFixed(2)], xlabel: 'numero di intervalli', ylabel: 'copertura', label: 'Copertura osservata' });
    var t = f.t, g = f.g, se = function (k) { return 1.96 * Math.sqrt(ex * (1 - ex) / Math.max(1, k)); };
    var up = [], dn = [];
    for (var i = 1; i <= 200; i++) { var k = B * i / 200; up.push([f.x(k), Math.max(f.m.t, f.y(Math.min(yhi, ex + se(k))))]); dn.push([f.x(k), Math.min(f.y(ylo), f.y(Math.max(ylo, ex - se(k))))]); }
    P.svg('path', { d: P.path(up.concat(dn.reverse())) + 'Z', fill: t.c3, 'fill-opacity': 0.1 }, g);
    P.svg('line', { x1: f.x(0), x2: f.x(B), y1: f.y(L), y2: f.y(L), stroke: t.ink, 'stroke-dasharray': '6 4' }, g);
    P.text(g, f.x(B) - 4, f.y(L) - 5, 'nominale ' + Math.round(L * 100) + '%', { 'text-anchor': 'end', fill: t.ink_2, 'font-size': 12 });
    if (Math.abs(ex - L) > 1e-9) {
      P.svg('line', { x1: f.x(0), x2: f.x(B), y1: f.y(ex), y2: f.y(ex), stroke: t.c3, 'stroke-width': 1.6 }, g);
      P.text(g, f.x(B) - 4, f.y(ex) + 14, 'esatta ' + SA.fmt(100 * ex, 1) + '%', { 'text-anchor': 'end', fill: t.c3, 'font-size': 12, 'font-weight': 600 });
    }
    if (S.trace.length) P.svg('path', { d: P.path(S.trace.map(function (r) { return [f.x(r[0]), Math.max(f.m.t, Math.min(f.y(ylo), f.y(r[1])))]; })), fill: 'none', stroke: t.c1, 'stroke-width': 2 }, g);
  }
  function legends() {
    var t = SA.theme(), sw = SA.plot.legendSwatch;
    legA.innerHTML = ''; legB.innerHTML = '';
    legA.append(el('span', sw(t.c1, null), 'contiene il vero valore'), el('span', sw(t.c2, '5 3', 'diamond'), 'lo manca'));
    legB.append(el('span', sw(t.c1, null), 'copertura osservata'), el('span', sw(t.ink, '6 4'), 'nominale'), el('span', sw(t.c3, null), 'esatta (calcolata)'),
      el('span', el('i', { style: 'display:inline-block;width:18px;height:10px;background:' + t.c3 + ';opacity:.25;border-radius:2px' }), 'variabilità Monte Carlo attesa'));
  }

  /* ---------- tabella ---------- */
  var tblBody, kpiBox, fbBox, interpBox, predBox;
  function updateTable() {
    var fmt = SA.fmt, b = SA.ui.badge, ex = exactCoverage(), tw = theoWidth(), m = M();
    var mcse = S.k ? Math.sqrt(ex * (1 - ex) / S.k) : NaN;
    tblBody.innerHTML = '';
    tblBody.append(
      el('tr', el('td', 'Copertura'), el('td', Math.round(S.level * 100) + '%'), el('td', fmt(100 * ex, 2) + '%'), el('td', S.k ? fmt(100 * S.cov / S.k, 2) + '% ± ' + fmt(196 * mcse, 2) : '—'),
        el('td', m.model === 'bern' || m.model === 'pois' ? 'calcolata esattamente' : 'per costruzione')),
      el('tr', el('td', 'Ampiezza media'), el('td', '—'), el('td', isNaN(tw) ? '—' : fmt(tw, 4)), el('td', S.k ? fmt(S.width / S.k, 4) : '—'), el('td', isNaN(tw) ? '' : 'formula esatta')));
    kpiBox.innerHTML = '';
    kpiBox.append(el('div.kpi', el('b', S.k + ' / ' + S.B), el('span', 'intervalli costruiti')),
      el('div.kpi', el('b', S.k - S.cov + ''), el('span', 'intervalli che mancano il vero valore')),
      el('div.kpi', el('b', fmt(100 * ex, 2) + '%'), el('span', 'copertura reale del metodo '), b(m.st === 'exact' || m.model === 'bern' || m.model === 'pois' ? 'exact' : 'asym')));
    updateFeedback();
  }

  function buildPrediction() {
    predBox.innerHTML = ''; var name = 'p08-' + Date.now(), L = Math.round(S.level * 100);
    predBox.append(el('p.prose', 'Costruiamo ' + S.B + ' intervalli al ' + L + '% con il metodo «' + M().label + '», ciascuno da un nuovo campione di n = ' + S.n + '. Che frazione conterrà il vero valore?'),
      el('div.choices', { role: 'radiogroup' }, [['all', 'Tutti'], ['about', 'Circa il ' + L + '%, con piccole oscillazioni'], ['less', 'Sensibilmente meno del ' + L + '%']].map(function (o, i) {
        return el('div.choice', el('input', { type: 'radio', name: name, id: name + i, value: o[0], checked: S.pred === o[0], onchange: function () { S.pred = this.value; updateFeedback(); } }), el('label', { for: name + i }, o[1]));
      })));
    fbBox = el('div.feedback', { role: 'status', hidden: true }); predBox.appendChild(fbBox);
  }
  function updateFeedback() {
    if (!S.pred) { fbBox.hidden = true; return; }
    fbBox.hidden = false;
    var ex = exactCoverage(), truth = ex < S.level - 0.015 ? 'less' : 'about';
    fbBox.textContent = (S.pred === truth ? '✓ ' : '✗ ') + 'La copertura reale di questo metodo, con questi parametri, è ' + SA.fmt(100 * ex, 1) + '%' +
      (truth === 'less' ? ': l’approssimazione asintotica non regge con questo n e questo valore del parametro.' : ex > S.level + 0.01 ? ': il metodo è conservativo, copre più del nominale.' : ': il livello nominale è rispettato. Nessun metodo copre sempre: un intervallo su ' + Math.round(1 / (1 - S.level)) + ' circa sbaglia.') +
      (S.k ? ' Osservata finora: ' + SA.fmt(100 * S.cov / S.k, 1) + '% su ' + S.k + '.' : '');
  }

  function interpretation() {
    var m = M(), ex = exactCoverage(), txt = '<p>Il vero valore è <strong>fisso</strong>; a cambiare, da un campione all’altro, sono gli estremi dell’intervallo. “Livello 95%” è una proprietà del <em>metodo</em>: su molte ripetizioni circa il 95% degli intervalli contiene il parametro. Del singolo intervallo calcolato non si può dire che contenga θ con probabilità 0,95.</p>';
    if (S.method === 'wald') txt += '<p>L’intervallo di <strong>Wald</strong> si basa sull’approssimazione normale con la varianza stimata. Con p = ' + S.p + ' e n = ' + S.n + ' la sua copertura reale è ' + SA.fmt(100 * ex, 1) + '%: quando p̂ = 0 l’intervallo degenera nel punto 0 e non copre mai. Prova Wilson con gli stessi parametri.</p>';
    else if (S.method === 'wilson') txt += '<p><strong>Wilson</strong> inverte il test score: la varianza è calcolata nel valore ipotizzato, non in p̂. La copertura oscilla attorno al nominale anche per n piccoli o p vicino ai bordi.</p>';
    else if (S.method === 'garwood') txt += '<p><strong>Garwood</strong> è esatto nel senso che garantisce copertura <em>almeno</em> nominale per ogni λ: con dati discreti non si può ottenere esattamente il livello, e il prezzo è un intervallo conservativo (qui ' + SA.fmt(100 * ex, 1) + '%).</p>';
    else if (S.method === 'exp') txt += '<p>Per l’Esponenziale 2λΣXᵢ ~ χ²(2n) qualunque sia λ: è una <strong>quantità pivotale</strong>, e invertirla dà copertura esattamente nominale per ogni n.</p>';
    else txt += '<p>Con dati normali (x̄ − μ)/(σ/√n) e (x̄ − μ)/(s/√n) sono pivot con legge nota (N(0, 1) e t(n − 1)): la copertura è esatta per ogni n. ' + (S.method === 't' ? 'L’intervallo t è in media più largo dello Z: stimare σ ha un costo.' : '') + '</p>';
    interpBox.innerHTML = txt + '<div class="eq">' + m.formula + '</div>';
  }

  function codeR() {
    var m = M(), d = Md();
    var L = ['# ───────────────────────────────────────────────────────────────', '# StatAtlas · Lab 08 — Intervalli di confidenza: ' + m.label,
      '# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi intervalli di StatAtlas.', '# ───────────────────────────────────────────────────────────────',
      'library(tidyverse)', '', 'set.seed(' + S.seed + ')', 'n <- ' + S.n + '; B <- ' + S.B + '; livello <- ' + S.level + '; a <- 1 - livello',
      'vero <- ' + d.truth() + '   # parametro vero, fisso'];
    if (m.model === 'norm') L.push('sigma <- ' + S.sigma);
    L.push('', 'intervallo <- function(x) {', '  ' + m.r, '}', '',
      '# Un nuovo campione e un nuovo intervallo per ogni replica',
      'sim <- tibble(replica = seq_len(B)) |>',
      '  mutate(ci = map(replica, \\(r) intervallo(' + d.r() + ')),',
      '         basso = map_dbl(ci, 1), alto = map_dbl(ci, 2),',
      '         copre = basso <= vero & vero <= alto)', '',
      'sim |> summarise(copertura = mean(copre), ampiezza_media = mean(alto - basso),',
      '                 errore_mc = sqrt(copertura * (1 - copertura) / B))');
    if (m.model === 'bern') L.push('', '# Copertura esatta: somma su S = Σx ~ Binomiale(n, p)',
      'copertura_esatta <- sum(map_dbl(0:n, \\(s) {', '  x <- c(rep(1, s), rep(0, n - s))   # un campione con somma s', '  ci <- intervallo(x)', '  dbinom(s, n, vero) * (ci[1] <= vero & vero <= ci[2])', '}))', 'copertura_esatta');
    if (m.model === 'pois') L.push('', '# Copertura esatta: somma su S = Σx ~ Poisson(nλ)',
      'smax <- qpois(1 - 1e-12, n * vero)', 'copertura_esatta <- sum(map_dbl(0:smax, \\(s) {', '  x <- c(s, rep(0, n - 1))           # un campione con somma s', '  ci <- intervallo(x)', '  dpois(s, n * vero) * (ci[1] <= vero & vero <= ci[2])', '}))', 'copertura_esatta');
    L.push('', '# Gli ultimi ' + SHOW + ' intervalli',
      'theme_statatlas <- function(base_size = 12) {', '  theme_minimal(base_size = base_size, base_family = "serif") +',
      '    theme(panel.grid.minor = element_blank(), legend.position = "top",', '          plot.background = element_rect(fill = "#FAF8F3", colour = NA))', '}',
      'sim |>', '  slice_tail(n = ' + SHOW + ') |>', '  ggplot(aes(y = replica, xmin = basso, xmax = alto, colour = copre)) +',
      '  geom_linerange(linewidth = 0.8) +', '  geom_vline(xintercept = vero, linetype = "dashed") +',
      '  scale_colour_manual(values = c(`TRUE` = "#0072B2", `FALSE` = "#D55E00"), labels = c(`TRUE` = "copre", `FALSE` = "non copre")) +',
      '  labs(title = "' + m.label + '", subtitle = sprintf("n = %d, livello %.0f%%", n, 100 * livello), x = "' + m.par + '", y = "replica", colour = NULL) +',
      '  theme_statatlas()', '');
    return L.join('\n');
  }

  var THEORY = {
    base: function () {
      return el('div.prose', { html: '<h3>Che cosa garantisce un intervallo</h3><p>Un intervallo di confidenza al livello 1 − α è una regola C(X) tale che P<sub>θ</sub>(θ ∈ C(X)) ≥ 1 − α per ogni valore del parametro. La probabilità riguarda il campione X, cioè la procedura, non θ.</p>' +
        '<h3>Tre famiglie di metodi</h3><ul><li><strong>Pivotali</strong>: una funzione di dati e parametro ha legge nota (Z, t, χ² per l’Esponenziale). Copertura esatta.</li>' +
        '<li><strong>Asintotici</strong>: si usa la normalità approssimata di uno stimatore (Wald, Wilson). Copertura giusta solo per n grande, e talvolta lentamente.</li>' +
        '<li><strong>Esatti per dati discreti</strong>: si invertono test esatti (Garwood, Clopper–Pearson). Copertura almeno nominale, quindi conservativa.</li></ul>' +
        '<h3>Copertura nominale, esatta, osservata</h3><p>La <em>nominale</em> è il livello dichiarato. La <em>esatta</em> è la vera probabilità di copertura del metodo per i parametri scelti: per dati binomiali o Poisson StatAtlas la calcola sommando su tutti i valori possibili della statistica. L’<em>osservata</em> è la frequenza nella simulazione, con il suo errore Monte Carlo.</p>' });
    },
    adv: function () {
      return el('div.prose', { html: '<h3>Dualità con i test</h3><p>C(x) = {θ₀ : il test di livello α non rifiuta H₀: θ = θ₀}. Wald inverte il test con varianza stimata in p̂; Wilson il test score con varianza in p₀:</p><div class="eq">|p̂ − p₀| ≤ z √(p₀(1 − p₀)/n)</div><p>e risolvere la disequazione quadratica in p₀ dà la formula di Wilson.</p>' +
        '<h3>Perché Wald fallisce</h3><p>La copertura di Wald oscilla con n e p a causa della discretezza (Brown, Cai e DasGupta, 2001), e crolla per p vicino a 0 o 1: se p̂ = 0 l’intervallo è {0}. P(p̂ = 0) = (1 − p)ⁿ, che per p = 0,1 e n = 20 vale circa 0,12.</p>' +
        '<h3>Garwood</h3><p>Usa la relazione tra Poisson e Gamma: P(S ≥ s) = P(G ≤ nλ) con G ~ Gamma(s, 1), da cui gli estremi con quantili χ²<sub>2s</sub> e χ²<sub>2s+2</sub>. La copertura esatta è una funzione a dente di sega di λ, sempre ≥ 1 − α.</p>' +
        '<h3>Pivot esponenziale</h3><p>Se Xᵢ ~ Exp(λ), allora λXᵢ ~ Exp(1) e 2λΣXᵢ ~ Gamma(n, 1/2) = χ²(2n).</p>' +
        '<h3>Ampiezza dell’intervallo t</h3><p>E(s) = c₄σ con c₄ = √(2/(n − 1)) Γ(n/2)/Γ((n − 1)/2), quindi l’ampiezza media è 2 t<sub>n−1,1−α/2</sub> c₄ σ/√n.</p>' });
    }
  };

  var run, codeBox, ctrlBox;
  function restart() { run.stop(); S = newState(S); legends(); interpretation(); codeBox.refresh(); render(true); run.refresh(); buildPrediction(); }
  function render(full) { drawIntervals(); drawCoverage(); if (full || run.frame % 6 === 0 || !run.running) updateTable(); }
  function buildControls() {
    ctrlBox.innerHTML = '';
    var m = M(), sel = function (label, key, vals, fmt) {
      return el('label.field', el('span', label), el('select', { onchange: function () { S[key] = +this.value; restart(); } },
        vals.map(function (v) { return el('option', { value: v, selected: v === S[key] }, fmt ? fmt(v) : String(v)); })));
    };
    var par = m.model === 'norm' ? SA.ui.slider('σ (nota o da stimare)', { min: 0.5, max: 5, step: 0.5, value: S.sigma, onchange: function (v) { S.sigma = v; restart(); } })
      : m.model === 'bern' ? SA.ui.slider('p vero', { min: 0.01, max: 0.99, step: 0.01, value: S.p, format: function (v) { return SA.fmt(v, 2); }, onchange: function (v) { S.p = v; restart(); } })
      : m.model === 'pois' ? SA.ui.slider('λ vero', { min: 0.1, max: 10, step: 0.1, value: S.lambda, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.lambda = v; restart(); } })
      : SA.ui.slider('λ vero (tasso)', { min: 0.2, max: 5, step: 0.1, value: S.rate, format: function (v) { return SA.fmt(v, 1); }, onchange: function (v) { S.rate = v; restart(); } });
    ctrlBox.append(
      el('label.field', el('span', 'Parametro e metodo'), el('select', { onchange: function () { S.method = this.value; S.pred = null; buildControls(); restart(); } },
        Object.keys(METHODS).map(function (k) { return el('option', { value: k, selected: k === S.method }, METHODS[k].label); }))),
      par,
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
        sel('n', 'n', [5, 10, 20, 30, 50, 100, 200]), sel('Livello', 'level', [0.8, 0.9, 0.95, 0.99], function (v) { return Math.round(v * 100) + '%'; }),
        sel('Intervalli B', 'B', [100, 500, 1000, 5000]),
        el('label.field', el('span', 'Seed'), el('input', { type: 'number', value: S.seed, min: 1, onchange: function () { S.seed = Math.max(1, Math.floor(+this.value || 1)); restart(); } }))));
    run.controls('Un intervallo').forEach(function (n) { ctrlBox.appendChild(n); });
  }

  SA.registerLab('intervalli', {
    mount: function (page, info) {
      el = SA.ui.el; S = newState(S);
      run = SA.ui.runner({ speed: 1, step: step, render: render, done: function () { return S.k >= S.B; }, progress: function () { return S.k / S.B; }, reset: function () { S = newState(S); } });
      var openT = function (l) { SA.ui.openDrawer('Intervalli di confidenza', THEORY, l); };
      page.appendChild(el('header.lab-head', el('div', el('div.kicker', info.part.part + ' · ' + info.part.title + ' · Laboratorio ' + info.lab.num),
        el('h1', info.lab.title), el('p.lede', 'Il parametro sta fermo, gli intervalli si muovono. Il livello di confidenza è una promessa sul metodo: vediamo se la mantiene.')),
        SA.ui.button('Approfondisci', { icon: 'book', onclick: function () { openT(); } })));
      var s1 = SA.ui.step('1', 'Domanda'); s1.body.appendChild(el('p.question', 'Che cosa significa davvero “intervallo di confidenza al 95%”?'));
      var s2 = SA.ui.step('2', 'La tua previsione'); predBox = el('div'); s2.body.appendChild(predBox);
      var s3 = SA.ui.step('3', 'Esperimento', 'Un campione, un intervallo, e poi ancora');
      ctrlBox = el('div.panel.controls'); figA = el('div'); figB = el('div'); legA = el('div.legend'); legB = el('div.legend');
      s3.body.appendChild(el('div.lab-grid', ctrlBox, el('div.figure',
        el('div.fig', el('div.fig-title', el('h3', 'Gli ultimi ' + SHOW + ' intervalli'), legA), figA),
        el('div.fig', el('div.fig-title', el('h3', 'Copertura al crescere delle ripetizioni'), legB), figB),
        el('div.toolbar', SA.ui.button('Dati CSV', { icon: 'download', cls: 'btn-ghost', onclick: function () {
          var rows = [['replica', 'basso', 'alto', 'copre']], th = Md().truth();
          for (var i = 0; i < S.k; i++) rows.push([i + 1, S.lo[i], S.hi[i], th >= S.lo[i] && th <= S.hi[i] ? 1 : 0]);
          SA.ui.download('statatlas_lab08_' + S.method + '_seed' + S.seed + '.csv', SA.ui.csv(rows), 'text/csv'); } }),
          SA.ui.button('Figura PNG', { icon: 'download', cls: 'btn-ghost', onclick: function () { SA.ui.exportPNG([figA.querySelector('svg'), figB.querySelector('svg')], 'statatlas_lab08_' + S.method + '.png', [M().label, 'n = ' + S.n + ' · livello ' + Math.round(S.level * 100) + '% · seed ' + S.seed]); } })))));
      var s4 = SA.ui.step('4', 'Teoria e simulazione a confronto'); tblBody = el('tbody'); kpiBox = el('div.kpis');
      s4.body.append(el('div.tbl-wrap', el('table.tv', el('thead', el('tr', el('th', 'Quantità'), el('th', 'Nominale'), el('th', 'Esatta'), el('th', 'Simulazione ± 1,96 e.s.'), el('th', 'Come è ottenuta'))), tblBody)), kpiBox);
      var s5 = SA.ui.step('5', 'Interpretazione'); interpBox = el('div.prose');
      s5.body.append(interpBox, el('p', el('button.btn.btn-ghost', { type: 'button', onclick: function () { openT('adv'); } }, SA.ui.icon('book'), ' Dualità con i test, Wald contro Wilson, pivot (livello avanzato)')));
      var s6 = SA.ui.step('6', 'Riproduci in R', 'Stessi campioni, stessi intervalli'); codeBox = SA.ui.codeBlock(codeR, 'statatlas_lab08_intervalli.R');
      s6.body.append(el('p.prose', 'Include il calcolo della copertura esatta per i metodi discreti. Richiede R ≥ 4.1 e tidyverse.'), codeBox);
      page.append(s1, s2, s3, s4, s5, s6);
      buildControls(); buildPrediction(); legends(); interpretation(); render(true); run.refresh();
      document.addEventListener('keydown', run.key);
    },
    unmount: function () { run.stop(); document.removeEventListener('keydown', run.key); },
    redraw: function () { legends(); render(true); }
  });
})();
