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
// 5. DBSCAN
const P = [[0, 0], [0.1, 0], [0.2, 0], [0.3, 0], [5, 5], [0.45, 0], [5.1, 5], [9, 9]];
let db = cl.dbscan(P, 0.15, 3);
check('core: punti interni della catena', [...db.core].join('') === '01100000', [...db.core].join(''));
check('bordo agganciato al cluster, rumore = 0', db.cl[0] === 1 && db.cl[3] === 1 && db.cl[5] === 0 && db.cl[4] === 0 && db.cl[7] === 0, [...db.cl].join(','));
db = cl.dbscan(P, 0.15, 2); check('minPts = 2: coppie diventano cluster', db.k === 2 && db.cl[4] === db.cl[6] && db.cl[7] === 0, [...db.cl].join(','));
// proprietà su dati casuali: definizioni rispettate, core e rumore indipendenti dall'ordine
const Y = []; for (let i = 0; i < 200; i++) { const c = i % 2; Y.push([c * 3 + 0.5 * g.norm(), 0.5 * g.norm()]); }
const r1 = cl.dbscan(Y, 0.35, 5);
let okDef = true; for (let i = 0; i < 200; i++) {
  const hasCore = r1.nb[i].some(j => r1.core[j]);
  if (r1.core[i] && r1.cl[i] < 1) okDef = false;
  if (!r1.core[i] && r1.cl[i] > 0 && !r1.nb[i].some(j => r1.core[j] && r1.cl[j] === r1.cl[i])) okDef = false;
  if (r1.cl[i] === 0 && hasCore) okDef = false;
}
check('core/bordo/rumore coerenti con le definizioni', okDef);
const pr = SA.rs.sample(g, 200).map(k => k - 1), Yp = pr.map(k => Y[k]), r2 = cl.dbscan(Yp, 0.35, 5);
let same = true; const cc1 = [], cc2 = [];
pr.forEach((k, i) => { if (r2.core[i] !== r1.core[k] || (r2.cl[i] === 0) !== (r1.cl[k] === 0)) same = false; if (r1.core[k]) { cc1.push(r1.cl[k]); cc2.push(r2.cl[i]); } });
check('permutazione dei dati: stessi core e stesso rumore', same);
check('permutazione dei dati: stessa partizione dei core (ARI = 1)', cl.ari(cc1, cc2) === 1);
const kd = cl.kdist(Y, 4); check('k-distanze ordinate', kd.every((v, i) => i === 0 || v >= kd[i - 1]));
check('silhouette in [−1, 1]', (() => { const s = cl.silhouette(Y, Y.map((y, i) => i % 2)); return s > 0.5 && s <= 1; })());
console.log('\n' + ok + ' superati, ' + ko + ' falliti'); process.exit(ko ? 1 : 0);
