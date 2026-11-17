#!/bin/sh
# Macrofase E: one local acceptance pass (31 GNU R scripts, C/D parity and E authored offline paths).
# From statatlas-main: PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_E.sh > MACROFASE_E_COLLAUDO.log 2>&1
set -eu
cd "$(dirname "$0")/.."
rm -f verifica/REPORT_MACROFASE_E.json
printf '\n=== 1/4 SCIENTIFIC + BILINGUAL + D EXPERIMENTS + GNU R ===\n'
sh tests/run_macrofase_D.sh
printf '\n=== 2/4 TEACHER PROJECT CONTRACT ===\n'
node tests/test_E_schema.js
printf '\n=== 3/4 TEACHER AUTHORING AND STANDALONE STUDENT HTML ===\n'
python3 tests/test_E_teachers.py 390
python3 tests/test_E_teachers.py 1366
python3 tests/test_E_presets_navigation.py 390
python3 tests/test_E_presets_navigation.py 1366
python3 tests/test_E_repeat_lab.py
printf '\n=== 4/4 RELEASE FINGERPRINT AND ATTESTATION ===\n'
python3 - <<'PY'
from pathlib import Path
import hashlib,json,re
root=Path.cwd()
html=(root/'index.html').read_bytes()
sha=hashlib.sha256(html).hexdigest()
match=re.search(rb"window.SA.buildId = '([0-9a-f]{64})'",html)
assert match, 'Missing engine fingerprint'
record={'format':'statatlas.phase-e-acceptance','version':1,
        'html_sha256':sha,'engine':match.group(1).decode(),
        'gates':{'R_exports':31,'RJS_default_checks':84,'E_browser_viewports':[390,1366],
                 'student_html':'PASS','teacher_project_json':'PASS','D_roundtrip':31},
        'scope':'R/JS default scenarios R1 only; not full R2, WCAG or student usability.'}
(root/'verifica/REPORT_MACROFASE_E.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print('PASS E acceptance report:',sha)
PY
printf '\nSUCCESS: MACROFASE E LOCAL ACCEPTANCE PASSED\n'
printf 'NOTE: open the student HTML from Finder in Safari to verify native file:// behavior before release.\n'
printf 'NOTE: student reports are local and editable, not certified examination results.\n'
