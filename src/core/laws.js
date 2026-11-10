/* StatAtlas · core/laws.js — funzioni speciali e catalogo delle leggi.
 * Ogni legge espone densità/probabilità, ripartizione, quantile (per generare
 * per inversione X = F⁻¹(U), riproducibile in R con q*(runif(n))), momenti e
 * la sintassi R corrispondente. Parametrizzazioni identiche a quelle di R. */
var SA = window.SA || (window.SA = {});

SA.sf = (function () {
  var LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1; var a = LG[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  var TINY = 1e-300;
  /* Gamma incompleta regolarizzata: restituisce [P(a,x), Q(a,x)] */
  function gammaPQ(a, x) {
    if (x <= 0) return [0, 1];
    var lf = -x + a * Math.log(x) - lgamma(a), i;
    if (x < a + 1) {
      var ap = a, sum = 1 / a, del = sum;
      for (i = 0; i < 1000; i++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
      var p = sum * Math.exp(lf); return [p, 1 - p];
    }
    var b = x + 1 - a, c = 1 / TINY, d = 1 / b, h = d;
    for (i = 1; i < 1000; i++) {
      var an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < TINY) d = TINY;
      c = b + an / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d; var dl = d * c; h *= dl; if (Math.abs(dl - 1) < 1e-16) break;
    }
    var q = Math.exp(lf) * h; return [1 - q, q];
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < TINY) d = TINY; d = 1 / d; var h = d;
    for (var m = 1; m <= 1000; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY; c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY; c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d; var del = d * c; h *= del; if (Math.abs(del - 1) < 1e-16) break;
    }
    return h;
  }
  /* Beta incompleta regolarizzata I_x(a, b) */
  function pbeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function pnorm(z) { var q = 0.5 * gammaPQ(0.5, z * z / 2)[1]; return z < 0 ? q : 1 - q; }
  function lchoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
  /* Quantile di una legge continua: bisezione + Newton sulla ripartizione */
  function invert(cdf, pdf, p, lo, hi) {
    var i;
    for (i = 0; i < 200 && cdf(lo) > p; i++) lo = lo - Math.max(1, Math.abs(lo));
    for (i = 0; i < 200 && cdf(hi) < p; i++) hi = hi + Math.max(1, Math.abs(hi));
    for (i = 0; i < 64; i++) { var mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; }
    var x = (lo + hi) / 2;
    for (i = 0; i < 4; i++) {
      var f = pdf(x); if (!(f > 0)) break;
      var nx = x - (cdf(x) - p) / f; if (nx <= lo || nx >= hi || !isFinite(nx)) break; x = nx;
    }
    return x;
  }
  return { lgamma: lgamma, gammaPQ: gammaPQ, pbeta: pbeta, pnorm: pnorm, lchoose: lchoose, invert: invert };
})();

SA.laws = (function () {
  var sf = SA.sf, LN2PI = Math.log(2 * Math.PI), EPS64 = 1 - 64 * 2.220446049250313e-16;
  function P(key, label, min, max, step, value, r) { return { key: key, label: label, min: min, max: max, step: step, value: value, r: r || key }; }
  function nf(v) { return +(+v).toPrecision(6); }

  /* Costruttore per leggi discrete: pmf + supporto → cdf e quantile per somma */
  function discrete(o) {
    o.kind = 'discrete';
    o.cdf = function (x, p) {
      var lo = o.lo(p); x = Math.floor(x); if (x < lo) return 0;
      var s = 0; for (var k = lo; k <= x; k++) { s += o.pmf(k, p); if (s >= 1) return 1; } return Math.min(1, s);
    };
    o.q = function (u, p) {
      var t = u * EPS64, k = o.lo(p), s = o.pmf(k, p), top = o.hi(p);
      while (s < t && k < top) { k++; s += o.pmf(k, p); }
      return k;
    };
    o.density = o.pmf;
    return o;
  }
  function continuous(o) {
    o.kind = 'continuous';
    if (!o.q) o.q = function (u, p) {
      var r = o.range(p);
      return sf.invert(function (x) { return o.cdf(x, p); }, function (x) { return o.pdf(x, p); }, u, r[0], r[1]);
    };
    o.density = o.pdf;
    return o;
  }

  var L = [
    discrete({ id: 'bern', label: 'Bernoulli', rq: 'qbinom', rd: 'dbinom', params: [P('prob', 'p', 0.01, 0.99, 0.01, 0.3)],
      rargs: function (p) { return 'size = 1, prob = ' + nf(p.prob); },
      pmf: function (k, p) { return k === 0 ? 1 - p.prob : k === 1 ? p.prob : 0; },
      lo: function () { return 0; }, hi: function () { return 1; },
      mean: function (p) { return p.prob; }, var: function (p) { return p.prob * (1 - p.prob); },
      formula: 'P(X = x) = p<sup>x</sup> (1 − p)<sup>1−x</sup>, &nbsp;x ∈ {0, 1}',
      story: 'Un singolo esperimento con due esiti: successo (1) con probabilità p, insuccesso (0).' }),
    discrete({ id: 'binom', label: 'Binomiale', rq: 'qbinom', rd: 'dbinom', params: [P('size', 'n', 1, 100, 1, 10), P('prob', 'p', 0.01, 0.99, 0.01, 0.3)],
      rargs: function (p) { return 'size = ' + p.size + ', prob = ' + nf(p.prob); },
      pmf: function (k, p) { if (k < 0 || k > p.size) return 0; return Math.exp(sf.lchoose(p.size, k) + k * Math.log(p.prob) + (p.size - k) * Math.log1p(-p.prob)); },
      lo: function () { return 0; }, hi: function (p) { return p.size; },
      mean: function (p) { return p.size * p.prob; }, var: function (p) { return p.size * p.prob * (1 - p.prob); },
      formula: 'P(X = x) = C(n, x) p<sup>x</sup> (1 − p)<sup>n−x</sup>, &nbsp;x = 0, …, n',
      story: 'Numero di successi in n prove di Bernoulli indipendenti con la stessa probabilità p.' }),
    discrete({ id: 'hyper', label: 'Ipergeometrica', rq: 'qhyper', rd: 'dhyper',
      params: [P('m', 'bianche m', 1, 60, 1, 20), P('n', 'nere n', 1, 60, 1, 30), P('k', 'estratte k', 1, 60, 1, 12)],
      fix: function (p) { if (p.k > p.m + p.n) p.k = p.m + p.n; },
      rargs: function (p) { return 'm = ' + p.m + ', n = ' + p.n + ', k = ' + p.k; },
      pmf: function (x, p) { if (x < Math.max(0, p.k - p.n) || x > Math.min(p.k, p.m)) return 0; return Math.exp(sf.lchoose(p.m, x) + sf.lchoose(p.n, p.k - x) - sf.lchoose(p.m + p.n, p.k)); },
      lo: function (p) { return Math.max(0, p.k - p.n); }, hi: function (p) { return Math.min(p.k, p.m); },
      mean: function (p) { return p.k * p.m / (p.m + p.n); },
      var: function (p) { var N = p.m + p.n; return N > 1 ? p.k * (p.m / N) * (p.n / N) * (N - p.k) / (N - 1) : 0; },
      formula: 'P(X = x) = C(m, x) C(n, k − x) / C(m + n, k)',
      story: 'Palline bianche estratte senza reinserimento: k estrazioni da un’urna con m bianche e n nere.' }),
    discrete({ id: 'pois', label: 'Poisson', rq: 'qpois', rd: 'dpois', params: [P('lambda', 'λ', 0.2, 30, 0.1, 4)],
      rargs: function (p) { return 'lambda = ' + nf(p.lambda); },
      pmf: function (k, p) { return k < 0 ? 0 : Math.exp(-p.lambda + k * Math.log(p.lambda) - sf.lgamma(k + 1)); },
      lo: function () { return 0; }, hi: function (p) { return Math.ceil(p.lambda + 40 * Math.sqrt(p.lambda) + 40); },
      mean: function (p) { return p.lambda; }, var: function (p) { return p.lambda; },
      formula: 'P(X = x) = e<sup>−λ</sup> λ<sup>x</sup> / x!, &nbsp;x = 0, 1, 2, …',
      story: 'Conteggio di eventi rari e indipendenti in un intervallo, con intensità media λ.' }),
    discrete({ id: 'geom', label: 'Geometrica', rq: 'qgeom', rd: 'dgeom', params: [P('prob', 'p', 0.02, 0.95, 0.01, 0.25)],
      rargs: function (p) { return 'prob = ' + nf(p.prob); },
      pmf: function (k, p) { return k < 0 ? 0 : p.prob * Math.pow(1 - p.prob, k); },
      lo: function () { return 0; }, hi: function (p) { return Math.ceil(Math.log(1e-12) / Math.log(1 - p.prob)); },
      mean: function (p) { return (1 - p.prob) / p.prob; }, var: function (p) { return (1 - p.prob) / (p.prob * p.prob); },
      formula: 'P(X = x) = p (1 − p)<sup>x</sup>, &nbsp;x = 0, 1, 2, …',
      story: 'Numero di insuccessi prima del primo successo (convenzione di R).' }),
    discrete({ id: 'nbinom', label: 'Binomiale negativa', rq: 'qnbinom', rd: 'dnbinom', params: [P('size', 'r', 1, 30, 1, 3), P('prob', 'p', 0.05, 0.95, 0.01, 0.4)],
      rargs: function (p) { return 'size = ' + p.size + ', prob = ' + nf(p.prob); },
      pmf: function (k, p) { return k < 0 ? 0 : Math.exp(sf.lchoose(k + p.size - 1, k) + p.size * Math.log(p.prob) + k * Math.log1p(-p.prob)); },
      lo: function () { return 0; }, hi: function (p) { var m = p.size * (1 - p.prob) / p.prob, s = Math.sqrt(m / p.prob); return Math.ceil(m + 40 * s + 40); },
      mean: function (p) { return p.size * (1 - p.prob) / p.prob; }, var: function (p) { return p.size * (1 - p.prob) / (p.prob * p.prob); },
      formula: 'P(X = x) = C(x + r − 1, x) p<sup>r</sup> (1 − p)<sup>x</sup>',
      story: 'Numero di insuccessi prima dell’r-esimo successo.' }),

    continuous({ id: 'unif', label: 'Uniforme', rq: 'qunif', rd: 'dunif', params: [P('min', 'a', -5, 5, 0.1, 0), P('max', 'b', -4, 10, 0.1, 1)],
      fix: function (p) { if (p.max <= p.min) p.max = +(p.min + 0.5).toFixed(1); },
      rargs: function (p) { return 'min = ' + nf(p.min) + ', max = ' + nf(p.max); },
      pdf: function (x, p) { return x < p.min || x > p.max ? 0 : 1 / (p.max - p.min); },
      cdf: function (x, p) { return x <= p.min ? 0 : x >= p.max ? 1 : (x - p.min) / (p.max - p.min); },
      q: function (u, p) { return p.min + u * (p.max - p.min); },
      range: function (p) { var w = p.max - p.min; return [p.min - 0.15 * w, p.max + 0.15 * w]; },
      mean: function (p) { return (p.min + p.max) / 2; }, var: function (p) { return Math.pow(p.max - p.min, 2) / 12; },
      formula: 'f(x) = 1 / (b − a), &nbsp;a ≤ x ≤ b',
      story: 'Ogni sottointervallo di uguale ampiezza ha la stessa probabilità. È il punto di partenza di ogni simulazione.' }),
    continuous({ id: 'norm', label: 'Normale', rq: 'qnorm', rd: 'dnorm', params: [P('mean', 'μ', -5, 5, 0.1, 0), P('sd', 'σ', 0.2, 4, 0.05, 1)],
      rargs: function (p) { return 'mean = ' + nf(p.mean) + ', sd = ' + nf(p.sd); },
      pdf: function (x, p) { return SA.dens.norm(x, p.mean, p.sd); },
      cdf: function (x, p) { return sf.pnorm((x - p.mean) / p.sd); },
      q: function (u, p) { return p.mean + p.sd * SA.qnorm(u); },
      range: function (p) { return [p.mean - 4 * p.sd, p.mean + 4 * p.sd]; },
      mean: function (p) { return p.mean; }, var: function (p) { return p.sd * p.sd; },
      formula: 'f(x) = (σ√(2π))<sup>−1</sup> exp{−(x − μ)² / (2σ²)}',
      story: 'Somma di molti piccoli effetti indipendenti: il limite del teorema centrale.' }),
    continuous({ id: 'lnorm', label: 'Lognormale', rq: 'qlnorm', rd: 'dlnorm', params: [P('meanlog', 'μ (log)', -1, 2, 0.05, 0), P('sdlog', 'σ (log)', 0.1, 1.5, 0.05, 0.6)],
      rargs: function (p) { return 'meanlog = ' + nf(p.meanlog) + ', sdlog = ' + nf(p.sdlog); },
      pdf: function (x, p) { return x <= 0 ? 0 : SA.dens.norm(Math.log(x), p.meanlog, p.sdlog) / x; },
      cdf: function (x, p) { return x <= 0 ? 0 : sf.pnorm((Math.log(x) - p.meanlog) / p.sdlog); },
      q: function (u, p) { return Math.exp(p.meanlog + p.sdlog * SA.qnorm(u)); },
      range: function (p) { return [0, Math.exp(p.meanlog + 3.2 * p.sdlog)]; },
      mean: function (p) { return Math.exp(p.meanlog + p.sdlog * p.sdlog / 2); },
      var: function (p) { var s2 = p.sdlog * p.sdlog; return (Math.exp(s2) - 1) * Math.exp(2 * p.meanlog + s2); },
      formula: 'log X ~ N(μ, σ²), &nbsp;x &gt; 0',
      story: 'Prodotto di molti fattori positivi indipendenti: redditi, dimensioni, concentrazioni.' }),
    continuous({ id: 'exp', label: 'Esponenziale', rq: 'qexp', rd: 'dexp', params: [P('rate', 'λ', 0.1, 5, 0.05, 1)],
      rargs: function (p) { return 'rate = ' + nf(p.rate); },
      pdf: function (x, p) { return x < 0 ? 0 : p.rate * Math.exp(-p.rate * x); },
      cdf: function (x, p) { return x <= 0 ? 0 : -Math.expm1(-p.rate * x); },
      q: function (u, p) { return -Math.log1p(-u) / p.rate; },
      range: function (p) { return [0, 6 / p.rate]; },
      mean: function (p) { return 1 / p.rate; }, var: function (p) { return 1 / (p.rate * p.rate); },
      formula: 'f(x) = λ e<sup>−λx</sup>, &nbsp;x ≥ 0',
      story: 'Tempo di attesa senza memoria: P(X &gt; s + t | X &gt; s) = P(X &gt; t).' }),
    continuous({ id: 'gamma', label: 'Gamma', rq: 'qgamma', rd: 'dgamma', params: [P('shape', 'forma k', 0.3, 20, 0.1, 2), P('rate', 'tasso λ', 0.1, 5, 0.05, 1)],
      rargs: function (p) { return 'shape = ' + nf(p.shape) + ', rate = ' + nf(p.rate); },
      pdf: function (x, p) { return x <= 0 ? 0 : Math.exp(p.shape * Math.log(p.rate) + (p.shape - 1) * Math.log(x) - p.rate * x - sf.lgamma(p.shape)); },
      cdf: function (x, p) { return x <= 0 ? 0 : sf.gammaPQ(p.shape, p.rate * x)[0]; },
      range: function (p) { var m = p.shape / p.rate, s = Math.sqrt(p.shape) / p.rate; return [0, m + 5 * s]; },
      mean: function (p) { return p.shape / p.rate; }, var: function (p) { return p.shape / (p.rate * p.rate); },
      formula: 'f(x) = λ<sup>k</sup> x<sup>k−1</sup> e<sup>−λx</sup> / Γ(k), &nbsp;x &gt; 0',
      story: 'Con k intero: tempo fino al k-esimo evento di un processo di Poisson.' }),
    continuous({ id: 'chisq', label: 'Chi-quadrato', rq: 'qchisq', rd: 'dchisq', params: [P('df', 'ν', 1, 40, 1, 4)],
      rargs: function (p) { return 'df = ' + p.df; },
      pdf: function (x, p) { var k = p.df / 2; return x <= 0 ? 0 : Math.exp(-k * Math.log(2) + (k - 1) * Math.log(x) - x / 2 - sf.lgamma(k)); },
      cdf: function (x, p) { return x <= 0 ? 0 : sf.gammaPQ(p.df / 2, x / 2)[0]; },
      range: function (p) { return [0, p.df + 5.5 * Math.sqrt(2 * p.df) + 2]; },
      mean: function (p) { return p.df; }, var: function (p) { return 2 * p.df; },
      formula: 'X = Z₁² + … + Z<sub>ν</sub>², &nbsp;Zᵢ ~ N(0, 1) indipendenti',
      story: 'Somma di quadrati di normali standard: la legge della varianza campionaria.' }),
    continuous({ id: 'beta', label: 'Beta', rq: 'qbeta', rd: 'dbeta', params: [P('shape1', 'α', 0.3, 10, 0.1, 2), P('shape2', 'β', 0.3, 10, 0.1, 5)],
      rargs: function (p) { return 'shape1 = ' + nf(p.shape1) + ', shape2 = ' + nf(p.shape2); },
      pdf: function (x, p) { if (x <= 0 || x >= 1) return 0; return Math.exp((p.shape1 - 1) * Math.log(x) + (p.shape2 - 1) * Math.log1p(-x) + sf.lgamma(p.shape1 + p.shape2) - sf.lgamma(p.shape1) - sf.lgamma(p.shape2)); },
      cdf: function (x, p) { return sf.pbeta(x, p.shape1, p.shape2); },
      range: function () { return [0, 1]; },
      mean: function (p) { return p.shape1 / (p.shape1 + p.shape2); },
      var: function (p) { var s = p.shape1 + p.shape2; return p.shape1 * p.shape2 / (s * s * (s + 1)); },
      formula: 'f(x) = x<sup>α−1</sup> (1 − x)<sup>β−1</sup> / B(α, β), &nbsp;0 &lt; x &lt; 1',
      story: 'Proporzioni e probabilità incerte; flessibile su (0, 1).' }),
    continuous({ id: 'weibull', label: 'Weibull', rq: 'qweibull', rd: 'dweibull', params: [P('shape', 'forma k', 0.3, 6, 0.05, 1.5), P('scale', 'scala λ', 0.2, 5, 0.05, 1)],
      rargs: function (p) { return 'shape = ' + nf(p.shape) + ', scale = ' + nf(p.scale); },
      pdf: function (x, p) { if (x < 0) return 0; var z = x / p.scale; return p.shape / p.scale * Math.pow(z, p.shape - 1) * Math.exp(-Math.pow(z, p.shape)); },
      cdf: function (x, p) { return x <= 0 ? 0 : -Math.expm1(-Math.pow(x / p.scale, p.shape)); },
      q: function (u, p) { return p.scale * Math.pow(-Math.log1p(-u), 1 / p.shape); },
      range: function (p) { return [0, p.scale * Math.pow(-Math.log(0.002), 1 / p.shape)]; },
      mean: function (p) { return p.scale * Math.exp(sf.lgamma(1 + 1 / p.shape)); },
      var: function (p) { var g1 = Math.exp(sf.lgamma(1 + 1 / p.shape)), g2 = Math.exp(sf.lgamma(1 + 2 / p.shape)); return p.scale * p.scale * (g2 - g1 * g1); },
      formula: 'F(x) = 1 − exp{−(x/λ)<sup>k</sup>}, &nbsp;x ≥ 0',
      story: 'Durate e affidabilità: con k &lt; 1 il rischio decresce, con k &gt; 1 cresce, con k = 1 è costante.' }),
    continuous({ id: 't', label: 't di Student', rq: 'qt', rd: 'dt', params: [P('df', 'ν', 1, 60, 1, 5)],
      rargs: function (p) { return 'df = ' + p.df; },
      pdf: function (x, p) { var v = p.df; return Math.exp(sf.lgamma((v + 1) / 2) - sf.lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log1p(x * x / v)); },
      cdf: function (x, p) {
        var v = p.df, x2 = x * x;
        if (x2 < v) { var c = 0.5 * sf.pbeta(x2 / (v + x2), 0.5, v / 2); return x < 0 ? 0.5 - c : 0.5 + c; } // precisione vicino a 0
        var tail = 0.5 * sf.pbeta(v / (v + x2), v / 2, 0.5); return x < 0 ? tail : 1 - tail;
      },
      range: function (p) { var h = p.df <= 2 ? 8 : 5; return [-h, h]; },
      mean: function (p) { return p.df > 1 ? 0 : NaN; },
      var: function (p) { return p.df > 2 ? p.df / (p.df - 2) : p.df > 1 ? Infinity : NaN; },
      formula: 'T = Z / √(V/ν), &nbsp;Z ~ N(0, 1), V ~ χ²<sub>ν</sub> indipendenti',
      story: 'La media standardizzata con la deviazione standard stimata: code più pesanti della normale.' }),
    continuous({ id: 'f', label: 'F di Fisher', rq: 'qf', rd: 'df', params: [P('df1', 'ν₁', 1, 50, 1, 5), P('df2', 'ν₂', 1, 60, 1, 12)],
      rargs: function (p) { return 'df1 = ' + p.df1 + ', df2 = ' + p.df2; },
      pdf: function (x, p) {
        if (x <= 0) return 0; var a = p.df1 / 2, b = p.df2 / 2;
        return Math.exp(a * Math.log(p.df1 / p.df2) + (a - 1) * Math.log(x) - (a + b) * Math.log1p(p.df1 * x / p.df2) + sf.lgamma(a + b) - sf.lgamma(a) - sf.lgamma(b));
      },
      cdf: function (x, p) { return x <= 0 ? 0 : sf.pbeta(p.df1 * x / (p.df1 * x + p.df2), p.df1 / 2, p.df2 / 2); },
      range: function () { return [0, 6]; },
      mean: function (p) { return p.df2 > 2 ? p.df2 / (p.df2 - 2) : Infinity; },
      var: function (p) { var a = p.df1, b = p.df2; return b > 4 ? 2 * b * b * (a + b - 2) / (a * (b - 2) * (b - 2) * (b - 4)) : b > 2 ? Infinity : NaN; },
      formula: 'F = (V₁/ν₁) / (V₂/ν₂), &nbsp;Vᵢ ~ χ²<sub>νᵢ</sub> indipendenti',
      story: 'Rapporto di varianze stimate: confronti fra gruppi e analisi della varianza.' }),
    continuous({ id: 'cauchy', label: 'Cauchy', rq: 'qcauchy', rd: 'dcauchy', params: [P('location', 'x₀', -5, 5, 0.1, 0), P('scale', 'γ', 0.2, 4, 0.05, 1)],
      rargs: function (p) { return 'location = ' + nf(p.location) + ', scale = ' + nf(p.scale); },
      pdf: function (x, p) { return SA.dens.cauchy(x, p.location, p.scale); },
      cdf: function (x, p) { return 0.5 + Math.atan((x - p.location) / p.scale) / Math.PI; },
      q: function (u, p) { return u > 0.5 ? p.location + p.scale / Math.tan(Math.PI * (1 - u)) : u === 0.5 ? p.location : p.location - p.scale / Math.tan(Math.PI * u); },
      range: function (p) { return [p.location - 10 * p.scale, p.location + 10 * p.scale]; },
      mean: function () { return NaN; }, var: function () { return NaN; },
      formula: 'f(x) = γ / {π [(x − x₀)² + γ²]}',
      story: 'Code così pesanti che valore atteso e varianza non esistono.' })
  ];
  var byId = {};
  L.forEach(function (l) { byId[l.id] = l; });
  return { list: L, get: function (id) { return byId[id]; } };
})();
