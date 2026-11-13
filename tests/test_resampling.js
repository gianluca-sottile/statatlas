// Test di src/core/resampling.js e di la.nestedPredict. Esecuzione: node tests/test_resampling.js
// Valori di riferimento: R ≥ 3.6 (sample.kind = "Rejection").
global.window = global;
['rng.js', 'linalg.js', 'resampling.js'].forEach(f => require(require('path').join(__dirname, '../src/core/', f)));
const SA = global.SA, rs = SA.rs, la = SA.la;
let ok = 0, ko = 0;
function check(name, cond, info) { cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info ? ': ' + info : '')); }
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// 1. Permutazioni note di R
[[42, [1, 5, 10, 8, 2, 4, 6, 9, 7, 3]], [123, [3, 10, 2, 8, 6, 9, 1, 7, 5, 4]], [1, [9, 4, 7, 1, 2, 5, 3, 10, 6, 8]]].forEach(([s, r]) => {
  const got = rs.sample(new SA.RRNG(s), 10); check('set.seed(' + s + '); sample(10)', eq(got, r), got.join(' '));
});
let got = rs.sample(new SA.RRNG(123), 100, 5); check('set.seed(123); sample(1:100, 5)', eq(got, [31, 79, 51, 14, 67]), got.join(' '));

// 2. Proprietà della suddivisione e dei fold
const g = new SA.RRNG(2026), sp = rs.split(g, 60, 18);
check('test e training disgiunti e completi', sp.test.length === 18 && sp.train.length === 42 && new Set(sp.test.concat(sp.train)).size === 60);
check('training in ordine crescente', sp.train.every((v, i) => i === 0 || v > sp.train[i - 1]));
const f = rs.folds(g, 42, 5), cf = rs.checkFolds(f, 5);
check('fold: partizione valida', cf.ok, cf.sizes.join(','));
check('fold bilanciati (9 o 8)', cf.sizes.every(s => s === 8 || s === 9));
check('checkFolds rileva un fold vuoto', !rs.checkFolds([1, 1, 2, 2], 3).ok);
const bt = rs.boot(new SA.RRNG(5), 1000);
check('bootstrap: indici in 1..n', bt.every(v => v >= 1 && v <= 1000 && v === Math.floor(v)));
const uniq = new Set(bt).size / 1000; check('bootstrap: quota di distinti ≈ 1 − 1/e', Math.abs(uniq - 0.632) < 0.04, uniq.toFixed(3));
// uniformità di unifIndex su 7 valori
const cnt = new Array(7).fill(0), g2 = new SA.RRNG(9); for (let i = 0; i < 70000; i++) cnt[rs.unifIndex(g2, 7)]++;
check('unifIndex uniforme (χ² < 22,5)', cnt.reduce((a, c) => a + (c - 10000) ** 2 / 10000, 0) < 22.5, cnt.join(','));

// 3. nestedPredict = lsq sui sottoinsiemi di colonne
const g3 = new SA.RRNG(11), X = [], y = [], Xn = [];
for (let i = 0; i < 40; i++) { const u = 2 * g3.unif() - 1; X.push([1, u, u * u, u ** 3, u ** 4]); y.push(Math.sin(3 * u) + 0.2 * g3.norm()); }
for (let i = 0; i < 9; i++) { const u = -1 + i / 4; Xn.push([1, u, u * u, u ** 3, u ** 4]); }
const np = la.nestedPredict(X, y, Xn);
let maxd = 0, maxr = 0;
for (let j = 0; j < 5; j++) {
  const fit = la.lsq(X.map(r => r.slice(0, j + 1)), y);
  maxr = Math.max(maxr, Math.abs(fit.rss - np.rss[j]));
  Xn.forEach((r, i) => { let p = 0; for (let c = 0; c <= j; c++) p += r[c] * fit.beta[c]; maxd = Math.max(maxd, Math.abs(p - np.pred[j][i])); });
}
check('previsioni annidate = lsq', maxd < 1e-10, maxd.toExponential(2));
check('RSS annidati = lsq', maxr < 1e-10, maxr.toExponential(2));
check('RSS non crescente col grado', np.rss.every((v, i) => i === 0 || v <= np.rss[i - 1] + 1e-12));

console.log('\n' + ok + ' superati, ' + ko + ' falliti');
process.exit(ko ? 1 : 0);
