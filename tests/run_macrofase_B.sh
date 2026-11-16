#!/bin/sh
# Unico collaudo di accettazione: suite A sulla nuova build + validazione R 31/31.
# Usage: sh tests/run_macrofase_B.sh > MACROFASE_B_COLLAUDO.log 2>&1
set -eu
cd "$(dirname "$0")/.."
printf '\n=== MACROFASE B: QUALITY GATES ===\n'
command -v Rscript >/dev/null || { echo 'Rscript missing'; exit 1; }
command -v node >/dev/null || { echo 'Node.js missing'; exit 1; }
python3 -c 'import numpy,scipy,playwright' || { echo 'Python dependencies missing'; exit 1; }
printf '\n=== REGRESSION / SCIENCE / BROWSER (including course bridge) ===\n'
sh tests/run_macrofase_A.sh --require-r
printf '\n=== REGENERATE AND RUN ALL 31 R EXPORTS ===\n'
Rscript verifica/valida_tutti_31.R --timeout=900
printf '\n=== ASSERT RELEASE GATE MATCHES CURRENT BUILD ===\n'
python3 - <<'PY'
import pathlib,csv,hashlib
root=pathlib.Path('.')
sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
rows=list(csv.DictReader((root/'verifica/REPORT_VALIDAZIONE_R_31.csv').open(encoding='utf-8')))
assert len(rows)==31, 'Only %d R exports, expected 31'%len(rows)
assert all(x['build_sha256']==sha and x['runtime']=='PASS' and x['parse']=='PASS' for x in rows), 'R results obsolete or not passed'
print('PASS: 31/31 R runs, exact build sha256',sha)
PY
printf '\nSUCCESS: MACROFASE B RELEASE CANDIDATE READY FOR DRY RUN\n'
