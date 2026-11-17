// Regression: never fabricate a numerical benchmark from a not-yet-run optional action.
// No R dependency: this is a guard on the generated benchmark source.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
// A clean source archive contains the canonical snapshots, not the _raw.json
// intermediate generated later by generate_parity_C.py. Make this test
// stand-alone so the ordinary JS regression gate can run before that step.
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'verifica/snapshots_C_17_25.json'), 'utf8'));
assert.ok(snapshot.labs && Object.keys(snapshot.labs).length === 9);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statatlas-parity-C-'));
let output;
try {
  const raw = path.join(tmp, 'snapshots_17_25_raw.json');
  fs.writeFileSync(raw, JSON.stringify(snapshot.labs));
  output = execFileSync('node', [
    path.join(root, 'tests/gen_verifica_R.js'),
    raw,
    path.join(root, 'verifica/rng_C.json')
  ], { cwd: root, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
assert.match(output, /confronta\("22", "perdita finale/);
assert.match(output, /confronta\("22", "accuratezza/);
assert.match(output, /registra\("22", "controllo del gradiente/);
assert.match(output, /sprintf\("errore relativo R %\.4g", err_grad\)/);
assert.doesNotMatch(output, /confronta\([^\n]*?,\s*c\(\)\s*,/);
assert.doesNotMatch(output, /range\(esiti\$training\),\s*c\(\)/);
assert.match(output, /if \(!is\.numeric\(ottenuto\)/);
assert.match(output, /paste\(signif\(tol, 7\), collapse = " "\)/);
assert.match(output, /"premi il pulsante"/);
const generated = fs.readFileSync(path.join(root, 'verifica/parita_C_17_25.R'), 'utf8');
assert.match(generated, /dir\.create\("verifica\/runs", recursive = TRUE, showWarnings = FALSE\)/);
assert.match(generated, /write\.csv\(\.verifica, "verifica\/runs\/parita_C_17_25_esiti\.csv"/);
console.log('PASS: Macro C parity generator rejects empty references, reports tolerances and creates its CSV destination.');
