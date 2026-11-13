// Test di src/core/linalg.js. Esecuzione: node tests/test_linalg.js
global.window = global;
require(require('path').join(__dirname, '../src/core/rng.js'));
require(require('path').join(__dirname, '../src/core/linalg.js'));
const SA = global.SA, la = SA.la;
let ok = 0, ko = 0;
function near(name, got, exp, tol) { const pass = Math.abs(got - exp) <= tol; pass ? ok++ : ko++; console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + got + ' vs ' + exp); }
function check(name, cond) { cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name); }

// 1. Interpolazione esatta: y = 2 − x + 0,5 (x − 3)+ → coefficienti recuperati, RSS = 0
let X = [], y = [];
for (let i = 0; i < 12; i++) { const x = i * 0.7; X.push([1, x, Math.max(0, x - 3)]); y.push(2 - x + 0.5 * Math.max(0, x - 3)); }
let f = la.lsq(X, y);
near('β₀ esatto', f.beta[0], 2, 1e-12); near('β₁ esatto', f.beta[1], -1, 1e-12); near('δ esatto', f.beta[2], 0.5, 1e-12); near('RSS = 0', f.rss, 0, 1e-20); check('rango pieno', f.rank === 3);

// 2. Dati rumorosi: confronto con le equazioni normali risolte a mano (2 parametri)
const g = new SA.RRNG(7); X = []; y = [];
for (let i = 0; i < 50; i++) { const x = i / 49; X.push([1, x]); y.push(1 + 3 * x + 0.3 * g.norm()); }
f = la.lsq(X, y);
let n = 50, sx = 0, sy = 0, sxx = 0, sxy = 0; X.forEach((r, i) => { sx += r[1]; sy += y[i]; sxx += r[1] * r[1]; sxy += r[1] * y[i]; });
const b1 = (n * sxy - sx * sy) / (n * sxx - sx * sx), b0 = (sy - b1 * sx) / n;
near('pendenza = equazioni normali', f.beta[1], b1, 1e-10); near('intercetta = equazioni normali', f.beta[0], b0, 1e-10);
let rss = 0; y.forEach((v, i) => { rss += (v - b0 - b1 * X[i][1]) ** 2; }); near('RSS = somma dei quadrati dei residui', f.rss, rss, 1e-10);

// 3. Colonna nulla: rango ridotto segnalato
f = la.lsq(X.map(r => [r[0], r[1], 0]), y); check('rango ridotto rilevato', f.rank === 2);

// 4. Autodecomposizione simmetrica
const S = [[4, 1, 0.5], [1, 3, 0.2], [0.5, 0.2, 2]], e = la.symEig(S);
check('autovalori decrescenti', e.values[0] >= e.values[1] && e.values[1] >= e.values[2]);
near('traccia = somma autovalori', e.values.reduce((a, b) => a + b, 0), 9, 1e-12);
let res = 0, orth = 0;
for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { let sv = 0; for (let k = 0; k < 3; k++) sv += S[i][k] * e.vectors[k][j]; res = Math.max(res, Math.abs(sv - e.values[j] * e.vectors[i][j])); }
for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { let d = 0; for (let k = 0; k < 3; k++) d += e.vectors[k][a] * e.vectors[k][b]; orth = Math.max(orth, Math.abs(d - (a === b ? 1 : 0))); }
near('‖SV − VΛ‖ max', res, 0, 1e-12); near('‖VᵀV − I‖ max', orth, 0, 1e-12);
const e2 = la.symEig([[2, 0], [0, 2]]); near('autovalori ripetuti', e2.values[0] - e2.values[1], 0, 1e-15);

// 5. Base ortonormale e RSS veloce per disegno fisso
const Xs = [], ys = []; for (let i = 0; i < 80; i++) { const x = 10 * (i + 0.5) / 80; Xs.push([1, x, Math.max(0, x - 6)]); ys.push(1 + 0.5 * x + 1.2 * Math.max(0, x - 6) + g.norm()); }
const Q = la.orthoBasis(Xs); let qq = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { let s = 0; for (let i = 0; i < 80; i++) s += Q[a][i] * Q[b][i]; qq = Math.max(qq, Math.abs(s - (a === b ? 1 : 0))); }
near('‖QᵀQ − I‖ max', qq, 0, 1e-13);
const yy = ys.reduce((a, v) => a + v * v, 0); near('RSS da Q = RSS da QR', la.rssQ(Q, ys, yy), la.lsq(Xs, ys).rss, 1e-9);

console.log(`\n${ok} superati, ${ko} falliti`);
process.exit(ko ? 1 : 0);
