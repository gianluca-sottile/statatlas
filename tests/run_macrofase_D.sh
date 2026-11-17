#!/bin/sh
# Full Macro D local acceptance: ONE execution, no commit/push.
# Run on Mac from statatlas-main with PATH="/path/to/.venv/bin:$PATH" sh tests/run_macrofase_D.sh > MACROFASE_D_COLLAUDO.log 2>&1
set -eu
cd "$(dirname "$0")/.."
command -v Rscript >/dev/null || { echo 'Missing GNU R: strict Macrofase D gate cannot pass'; exit 2; }
command -v node >/dev/null || { echo 'Missing Node.js'; exit 2; }
python3 -c 'import playwright,numpy,scipy' || { echo 'Missing Python dependencies'; exit 2; }
printf '\n=== 1/4 FULL SCIENTIFIC + BILINGUAL + GNU R + NUMERICAL PARITY ===\n'
sh tests/run_macrofase_C.sh
printf '\n=== 2/4 BILINGUAL LINKS TO THE R COURSE ===\n'
node tests/test_D_course_urls.js
python3 tests/test_D_course_urls_browser.py
printf '\n=== 3/4 EXPERIMENT SNAPSHOTS AND ROUND TRIPS ===\n'
python3 tests/test_D_experiments.py 390
python3 tests/test_D_experiments.py 1366
python3 tests/test_D_changed_roundtrip.py 1366
python3 tests/test_D_complex_roundtrip.py
python3 tests/test_D_manual_points.py
python3 tests/test_D_offline_links.py
printf '\n=== 4/4 FINAL BUILD FINGERPRINT AND RELEASE INPUT ===\n'
python3 - <<'PY'
from pathlib import Path
import hashlib,re
s=Path('index.html').read_text()
match=re.search(r"window.SA.buildId = '([0-9a-f]{64})'",s)
assert match, 'Missing engine fingerprint'
print('Engine fingerprint:',match.group(1))
print('HTML SHA-256:',hashlib.sha256(s.encode()).hexdigest())
print('PASS D release inputs; execute the GitHub dry-run only after inspecting this log')
PY
printf '\nSUCCESS: MACROFASE D LOCAL ACCEPTANCE PASSED\n'
printf 'NOTE: R/JS comparisons are R1 default-scenario evidence, not full algorithmic equivalence R2.\n'
printf 'NOTE: the shared-link flow was tested in an in-memory/offline browser document, not native file:// navigation.\n'
