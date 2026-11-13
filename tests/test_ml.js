// Test di src/core/ml.js. Esecuzione: node tests/test_ml.js
global.window = global;
['rng.js', 'resampling.js', 'ml.js'].forEach(f => require(require('path').join(__dirname, '../src/core/', f)));
const SA = global.SA, ml = SA.ml; let ok = 0, ko = 0;
function check(name, cond, info) { cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info ? ': ' + info : '')); }
const g = new SA.RRNG(3), X = [], y = [];
for (let i = 0; i < 120; i++) { X.push([g.norm(), g.norm()]); y.push(g.unif() < 0.5 ? 1 : 0); }
// 1. vicini = ordinamento completo stabile (come order() in R)
let same = true;
for (let t = 0; t < 30; t++) {
  const q = [g.norm(), g.norm()], d = X.map((x, i) => [(x[0] - q[0]) ** 2 + (x[1] - q[1]) ** 2, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const r = ml.nearest(X, q, 15); for (let j = 0; j < 15; j++) if (r.idx[j] !== d[j][1]) same = false;
}
check('nearest = ordinamento completo', same);
// 2. parità di distanza: vince l'indice minore; esclusione di sé
const T = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0]];
let r = ml.nearest(T, [0, 0], 3); check('parità: indici 0,1,2', [...r.idx].join() === '0,1,2', [...r.idx].join());
r = ml.nearest(T, [0, 0], 3, 0); check('skip di sé: 1,2,3', [...r.idx].join() === '1,2,3', [...r.idx].join());
r = ml.nearest(T, [0, 0], 10); check('K > n: restituisce n vicini', r.idx.length === 6);
// 3. voti
const v = ml.votePath(Int32Array.from([0, 1, 2, 3, 4]), [1, 0, 1, 1, 0], [1, 3, 5]);
check('votePath maggioranza', [...v].join() === '1,1,1', [...v].join());
check('k = n: classe maggioritaria globale', ml.votePath(Int32Array.from([...Array(120).keys()]), y, [119])[0] === (y.slice(0, 119).reduce((a, b) => a + b) > 59.5 ? 1 : 0));
// 4. standardizzazione e Wilson
const sc = ml.scaler(X.map(x => [x[0] * 10 + 3, x[1]])), Z = sc.apply(X.map(x => [x[0] * 10 + 3, x[1]]));
const mz = Z.reduce((a, z) => a + z[0], 0) / Z.length, sz = Math.sqrt(Z.reduce((a, z) => a + (z[0] - mz) ** 2, 0) / (Z.length - 1));
check('scaler: media 0, sd 1', Math.abs(mz) < 1e-12 && Math.abs(sz - 1) < 1e-12);
const w = ml.wilson(40, 100); check('Wilson 40/100 = [0,3094; 0,4980]', Math.abs(w[0] - 0.30943) < 1e-4 && Math.abs(w[1] - 0.49802) < 1e-4, w.map(v => v.toFixed(5)).join(' '));
// 5. CART
const Xs = [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]], ys = [0, 0, 0, 1, 1, 1];
let tr = ml.tree(Xs, ys, [0, 1, 2, 3, 4, 5], { maxDepth: 5, minLeaf: 1, mtry: 2 });
check('separazione perfetta: una divisione su x₁ a 3,5', !tr[0].leaf && tr[0].j === 0 && tr[0].thr === 3.5 && tr.length === 3, JSON.stringify(tr[0]));
check('foglie pure con le classi giuste', ml.treePredict(tr, [2, 9]) === 0 && ml.treePredict(tr, [5.5, -9]) === 1);
tr = ml.tree(Xs, ys, [0, 1, 2, 3, 4, 5], { maxDepth: 0, minLeaf: 1, mtry: 2 }); check('maxDepth 0: solo la radice, parità → classe 0', tr.length === 1 && tr[0].cls === 0);
const g5 = new SA.RRNG(8), Xr = [], yr = [];
for (let i = 0; i < 300; i++) { const x = [4 * g5.unif() - 2, 4 * g5.unif() - 2, 4 * g5.unif() - 2]; Xr.push(x); yr.push((x[0] * x[0] + x[1] * x[1] < 2.5) !== (g5.unif() < 0.1) ? 1 : 0); }
const bi = SA.rs.boot(g5, 300).map(k => k - 1);
tr = ml.tree(Xr, yr, bi, { maxDepth: 30, minLeaf: 3, mtry: 1, g: g5 });
const leaves = tr.filter(nd => nd.leaf), splits = tr.filter(nd => !nd.leaf);
check('riduzione d’impurità > 0 in ogni divisione', splits.every(nd => nd.dec > 0), splits.length + ' divisioni');
check('foglie con almeno minLeaf righe e somma = n', leaves.every(nd => nd.n >= 3) && leaves.reduce((a, nd) => a + nd.n, 0) === 300);
check('figli: n = nₗ + nᵣ', splits.every(nd => tr[nd.l].n + tr[nd.r].n === nd.n));
console.log('\n' + ok + ' superati, ' + ko + ' falliti'); process.exit(ko ? 1 : 0);
