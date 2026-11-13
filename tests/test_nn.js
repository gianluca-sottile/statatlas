// Test di src/core/nn.js. Esecuzione: node tests/test_nn.js
global.window = global;
['rng.js', 'nn.js'].forEach(f => require(require('path').join(__dirname, '../src/core/', f)));
const SA = global.SA, nn = SA.nn; let ok = 0, ko = 0;
function check(name, cond, info) { cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info ? ': ' + info : '')); }
const g = new SA.RRNG(5), X = [], yx = [], yl = [];
for (let i = 0; i < 120; i++) { const x = [2 * g.unif() - 1, 2 * g.unif() - 1]; X.push(x); yx.push(x[0] * x[1] > 0 ? 1 : 0); yl.push(x[1] > 0.5 * x[0] ? 1 : 0); }
// 1. entropia incrociata stabile
check('BCE finita per |z| = 1000', isFinite(nn.bce(1000, 0)) && isFinite(nn.bce(-1000, 1)) && Math.abs(nn.bce(1000, 0) - 1000) < 1e-9 && nn.bce(1000, 1) < 1e-300 + 1e-12);
check('sigmoide stabile', nn.sigmoid(-800) >= 0 && nn.sigmoid(800) === 1 && Math.abs(nn.sigmoid(0) - 0.5) < 1e-15);
// 2. controllo del gradiente
['tanh', 'relu'].forEach(a => [0, 0.01].forEach(l => {
  const net = nn.init(new SA.RRNG(3), 5, a); net.b1 = net.b1.map((v, i) => 0.1 * (i - 2)); net.b2 = 0.3;
  const e = nn.gradCheck(net, X, yx, l); check('gradiente = differenze finite (' + a + ', λ = ' + l + ')', e < 1e-6, e.toExponential(2));
}));
// 3. la discesa riduce la perdita (passo piccolo, problema lineare)
let net = nn.init(new SA.RRNG(1), 3, 'tanh'), L0 = nn.loss(net, X, yl, 0), mono = true, prev = L0;
for (let e = 0; e < 300; e++) { nn.step(net, nn.grad(net, X, yl, 0), 0.5); const L = nn.loss(net, X, yl, 0); if (L > prev + 1e-12) mono = false; prev = L; }
check('perdita decrescente con η piccolo', mono && prev < 0.5 * L0, L0.toFixed(3) + ' → ' + prev.toFixed(3));
check('accuratezza > 0,9 sul problema lineare', nn.accuracy(net, X, yl) > 0.9);
// 4. XOR su più inizializzazioni: non sempre riesce, ma spesso
let succ = 0; const fin = [];
for (let r = 1; r <= 10; r++) { net = nn.init(new SA.RRNG(100 + r), 4, 'tanh'); for (let e = 0; e < 1500; e++) nn.step(net, nn.grad(net, X, yx, 0), 1); fin.push(nn.loss(net, X, yx, 0)); if (nn.accuracy(net, X, yx) > 0.9) succ++; }
check('XOR: almeno metà delle inizializzazioni supera 0,9', succ >= 5, succ + '/10 · perdite ' + fin.map(v => v.toFixed(2)).join(' '));
// 5. η enorme: divergenza rilevata o perdita alta, mai NaN nella BCE
net = nn.init(new SA.RRNG(2), 4, 'relu'); for (let e = 0; e < 50; e++) nn.step(net, nn.grad(net, X, yx, 0), 500);
check('η = 500: pesi finiti o divergenza segnalata', nn.finite(net) ? isFinite(nn.loss(net, X, yx, 0)) : true);
check('numero di parametri 4H + 1', nn.nParams(4) === 17);
console.log('\n' + ok + ' superati, ' + ko + ' falliti'); process.exit(ko ? 1 : 0);
