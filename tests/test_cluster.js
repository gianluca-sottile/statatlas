// Test di src/core/cluster.js. Esecuzione: node tests/test_cluster.js
global.window = global;
['rng.js', 'resampling.js', 'cluster.js'].forEach(f => require(require('path').join(__dirname, '../src/core/', f)));
const SA = global.SA, cl = SA.cluster; let ok = 0, ko = 0;
function check(name, cond, info) { cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info ? ': ' + info : '')); }
const g = new SA.RRNG(4), X = [];
for (let i = 0; i < 90; i++) { const c = i % 3; X.push([3 * Math.cos(2 * c) + g.norm(), 3 * Math.sin(2 * c) + g.norm()]); }
// 1. Lloyd: WCSS non crescente a ogni mezzo passo, su 20 inizializzazioni
let mono = true, conv = true;
for (let r = 0; r < 20; r++) {
  let C = SA.rs.sample(g, 90, 4).map(k => X[k - 1].slice()), lab = null, w = Infinity;
  for (let it = 0; it < 100; it++) {
    const a = cl.assign(X, C, lab); const w1 = cl.wcss(X, a.lab, C); if (w1 > w + 1e-9) mono = false; w = w1;
    if (!a.changed) break; lab = a.lab;
    const u = cl.update(X, lab, 4, C); C = u.C; const w2 = cl.wcss(X, lab, C); if (w2 > w + 1e-9) mono = false; w = w2;
    if (it === 99) conv = false;
  }
}
check('WCSS non crescente', mono); check('convergenza entro 100 iterazioni', conv);
// 2. gruppo vuoto: conserva il centro precedente
const u = cl.update([[0, 0], [1, 1]], Int32Array.from([0, 0]), 2, [[0, 0], [9, 9]]);
check('gruppo vuoto conserva il centro', u.empty === 1 && u.C[1][0] === 9 && u.C[0][0] === 0.5);
// 3. gerarchico
['single', 'complete', 'average', 'ward.D2'].forEach(m => {
  const h = cl.hclust(X, m), mono2 = h.heights.every((v, i) => i === 0 || v >= h.heights[i - 1] - 1e-12);
  check(m + ': n − 1 fusioni, altezze non decrescenti', h.merges.length === 89 && mono2);
});
// single linkage su punti allineati: altezze = distanze consecutive ordinate
const L = [[0], [1], [3], [7]], hs = cl.hclust(L, 'single');
check('single linkage: altezze 1, 2, 4', hs.heights.join() === '1,2,4', hs.heights.join());
check('complete linkage: altezze 1, 3, 7', cl.hclust(L, 'complete').heights.join() === '1,3,7');
// Ward.D2: altezza della prima fusione = distanza; incremento di SSE = h²/2
const hw = cl.hclust([[0, 0], [0, 2], [10, 0]], 'ward.D2');
check('Ward.D2: prima altezza 2', Math.abs(hw.heights[0] - 2) < 1e-12);
// seconda fusione: {(0,0),(0,2)} con (10,0): ΔSSE = n1 n2/(n1+n2) ‖c1 − c2‖² = 2/3·101 ; altezza = √(2 ΔSSE)
check('Ward.D2: seconda altezza = √(2 ΔSSE)', Math.abs(hw.heights[1] - Math.sqrt(2 * 2 / 3 * 101)) < 1e-10, hw.heights[1].toFixed(6));
// 4. taglio, foglie, ARI
const h = cl.hclust(X, 'average');
check('cutree K = 1: un solo gruppo', cl.cutree(h, 1).every(v => v === 1));
check('cutree K = n: tutti distinti', new Set(cl.cutree(h, 90)).size === 90);
check('cutree: etichette per prima comparsa', cl.cutree(h, 3)[0] === 1);
check('ordine delle foglie: permutazione di 0…n−1', new Set(cl.leafOrder(h)).size === 90);
const a = Array.from(cl.cutree(h, 3)), perm = a.map(v => [0, 3, 1, 2][v]), truth = X.map((x, i) => i % 3);
check('ARI invariante per permutazione delle etichette', Math.abs(cl.ari(a, truth) - cl.ari(perm, truth)) < 1e-15);
check('ARI = 1 per partizioni identiche', cl.ari(a, perm) === 1);
check('ARI di riferimento', Math.abs(cl.ari([1, 1, 0, 0, 0], [1, 1, 1, 0, 0]) - 0.1666667) < 1e-6, cl.ari([1, 1, 0, 0, 0], [1, 1, 1, 0, 0]).toFixed(7));
console.log('\n' + ok + ' superati, ' + ko + ' falliti'); process.exit(ko ? 1 : 0);
