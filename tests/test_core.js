// Test numerici del core. Esecuzione: node tests/test_core.js
// Valori di riferimento: output noti di R >= 3.6 (RNGkind predefinito).
global.window = global;
const path = require('path');
for (const f of ['rng.js', 'dist.js', 'laws.js']) require(path.join(__dirname, '../src/core', f));
const SA = global.SA;
let ok = 0, ko = 0;
function near(name, got, exp, tol = 5e-7) {
  const pass = Math.abs(got - exp) <= tol;
  pass ? ok++ : ko++;
  console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + got + ' vs ' + exp);
}
let g = new SA.RRNG(1);
[0.2655087, 0.3721239, 0.5728534].forEach((v, i) => near('set.seed(1) runif[' + (i + 1) + ']', g.unif(), v));
g = new SA.RRNG(42);
near('set.seed(42) runif[1]', g.unif(), 0.9148060);
g = new SA.RRNG(1);
[-0.6264538, 0.1836433, -0.8356286, 1.5952808].forEach((v, i) => near('set.seed(1) rnorm[' + (i + 1) + ']', g.norm(), v));
g = new SA.RRNG(42);
[1.37095845, -0.56469817, 0.36312841].forEach((v, i) => near('set.seed(42) rnorm[' + (i + 1) + ']', g.norm(), v));
g = new SA.RRNG(123);
near('set.seed(123) rnorm[1]', g.norm(), -0.56047565);
// set.seed(1); rcauchy(1) = tan(pi*0.2655087)
g = new SA.RRNG(1);
near('set.seed(1) rcauchy[1]', g.rcauchy(1)[0], Math.tan(Math.PI * 0.2655087), 1e-5);
near('qnorm(0.975)', SA.qnorm(0.975), 1.959963985, 1e-9);
near('qnorm(1e-10)', SA.qnorm(1e-10), -6.3613409, 1e-7);
// statistiche
near('median pari', SA.stat.median([4, 1, 3, 2]), 2.5, 1e-12);
near('quantile tipo 7 (0.25)', SA.stat.quantile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.25), 3.25, 1e-12);
const x = [-1.2, 0.3, 0.1, 5, -0.4, 40];
const th = SA.stat.mleCauchy(x);
const score = x.reduce((s, xi) => s + 2 * (xi - th) / (1 + (xi - th) ** 2), 0);
near('score Cauchy al MLE', score, 0, 1e-8);
// funzioni speciali e quantili (valori di riferimento da R)
const Lw = SA.laws.get;
near('pnorm(1.96)', SA.sf.pnorm(1.96), 0.9750021, 1e-7);
near('pnorm(-3)', SA.sf.pnorm(-3), 0.001349898, 1e-9);
near('pgamma(2, 3)', Lw('gamma').cdf(2, { shape: 3, rate: 1 }), 0.3233236, 1e-7);
near('pbeta(0.3, 2, 5)', Lw('beta').cdf(0.3, { shape1: 2, shape2: 5 }), 0.579825, 1e-6);
near('pt(2, 5)', Lw('t').cdf(2, { df: 5 }), 0.9490303, 1e-7);
near('pchisq(3.84, 1)', Lw('chisq').cdf(3.84, { df: 1 }), 0.9499565, 1e-7);
near('qgamma(0.5, 2)', Lw('gamma').q(0.5, { shape: 2, rate: 1 }), 1.678347, 1e-6);
near('qt(0.975, 10)', Lw('t').q(0.975, { df: 10 }), 2.228139, 1e-6);
near('qbeta(0.5, 2, 3)', Lw('beta').q(0.5, { shape1: 2, shape2: 3 }), 0.3857276, 1e-7);
near('qchisq(0.95, 3)', Lw('chisq').q(0.95, { df: 3 }), 7.814728, 1e-6);
near('qf(0.95, 3, 10)', Lw('f').q(0.95, { df1: 3, df2: 10 }), 3.708265, 1e-6);
near('qbinom(0.5, 10, 0.3)', Lw('binom').q(0.5, { size: 10, prob: 0.3 }), 3, 0);
near('qpois(0.9, 4)', Lw('pois').q(0.9, { lambda: 4 }), 7, 0);
near('phyper(5, 20, 30, 12)', Lw('hyper').cdf(5, { m: 20, n: 30, k: 12 }), 0.684665953706353, 1e-12); // calcolo combinatorio esatto
// ogni pmf somma a 1, ogni densità integra a ~1 sul supporto
SA.laws.list.forEach(l => {
  const p = {}; l.params.forEach(q => p[q.key] = q.value);
  if (l.kind === 'discrete') { let s = 0; for (let k = l.lo(p); k <= l.hi(p); k++) s += l.pmf(k, p); near('somma pmf ' + l.id, s, 1, 1e-9); }
  else { const u = 0.3, x = l.q(u, p); near('F(F⁻¹(0.3)) ' + l.id, l.cdf(x, p), u, 1e-9); }
});
console.log(`\n${ok} superati, ${ko} falliti`);
process.exit(ko ? 1 : 0);
