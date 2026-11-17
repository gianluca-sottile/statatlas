#!/bin/sh
# StatAtlas C: SINGLE local acceptance pass, no background process and no push.
# From statatlas-main: PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_C.sh > MACROFASE_C_COLLAUDO.log 2>&1
set -eu
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo 'Missing Node.js'; exit 2; }
command -v Rscript >/dev/null || { echo 'Missing GNU R'; exit 2; }
python3 -c 'import numpy,scipy,playwright' || { echo 'Missing Python dependencies in selected interpreter'; exit 2; }
# Verify exact R dependencies before the long browser and numerical suites.
Rscript --vanilla tests/check_r_packages_C.R || exit 2
mkdir -p verifica/runs
printf '\n=== 1/6 REGRESSION AND FULL R EXECUTION 31/31 ===\n'
sh tests/run_macrofase_B.sh
printf '\n=== 2/6 ENGLISH SCIENTIFIC GUIDES AND ACCESSIBILITY ===\n'
python3 tests/test_macrofase_C_i18n.py
python3 tests/test_accessibility_C.py
python3 tests/test_C_complete_bilingual.py
python3 tests/test_C_english_exports.py
printf '\n=== 3/6 LIVE DEFAULT SNAPSHOTS FOR NUMERICAL PARITY (01-25) ===\n'
python3 tests/export_numeric_snapshot_25.py --start 1 --stop 16 --output verifica/snapshots_C_01_16.json
python3 tests/export_numeric_snapshot_25.py --start 17 --stop 25 --output verifica/snapshots_C_17_25.json
printf '\n=== 4/6 GENERATE R NUMERIC CHECKS FROM CURRENT BUILD ===\n'
python3 tests/generate_parity_C.py
printf '\n=== 5/6 GNU R PAIRWISE NUMERICAL COMPARISONS ===\n'
Rscript verifica/parita_C_01_16.R
Rscript verifica/parita_C_17_25.R
printf '\n=== 6/6 STRICT EVIDENCE AND BUILD CHECK ===\n'
python3 tests/verify_parity_C.py
printf '\nSUCCESS: C PHASE RELEASE CANDIDATE PASSED LOCAL AUTOMATED GATES\n'
printf 'NOTE: the EN edition provides independent edited scientific chapters and 93 localized challenges, not a literal line-by-line translation of every Italian sentence.\n'
printf 'NOTE: R/JS numerical comparisons certify the tested default scenarios, not global algorithmic parity; manual assistive-technology assessment is outstanding.\n'
