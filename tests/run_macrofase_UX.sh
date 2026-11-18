#!/bin/sh
# Single complete release acceptance for the UX redesign. No changes to GitHub.
# From statatlas-main: PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1
set -eu
cd "$(dirname "$0")/.."
rm -f verifica/REPORT_MACROFASE_UX.json
printf '\n=== 1/4 COMPLETE STATATLAS A-E SCIENTIFIC / R / PARITY GATES ===\n'
sh tests/run_macrofase_E.sh
printf '\n=== 2/4 UX ALL 31 LABORATORIES, MOBILE AND DESKTOP ===\n'
python3 tests/test_UX_workbench.py --width 390
python3 tests/test_UX_workbench.py --width 1366
printf "\n=== UX TOOLBAR: CHALLENGES AND LIVE R DRAWERS ===\n"
python3 tests/test_UX_toolbar.py 390
python3 tests/test_UX_toolbar.py 1366
printf '\n=== 3/4 DESIGN AND OFFLINE CONTRACT ===\n'
node tests/test_UX_contract.js
python3 - <<'PY'
from pathlib import Path
from hashlib import sha256
import csv,json,re
root=Path.cwd();html=(root/'index.html').read_bytes();sha=sha256(html).hexdigest()
manifest=list(csv.DictReader((root/'verifica/export_r_31/manifest.csv').open(encoding='utf-8')))
assert len(manifest)==31 and all(r['build_sha256']==sha for r in manifest), 'R exports no longer tied to this UX build'
project=json.loads((root/'examples/E_progetto_campionamento.json').read_text(encoding='utf-8'))
match=re.search(rb"window.SA.buildId = '([0-9a-f]{64})'",html)
assert match and project['engine']==match.group(1).decode(), 'Demo teaching project engine is stale'
student=(root/'examples/E_percorso_campionamento.html').read_text(encoding='utf-8')
assert project['engine'] in student and 'id="teacherProject"' in student, 'Standalone teaching example stale'
print('PASS UX examples / current R manifest / offline fingerprints:',sha)
PY
printf '\n=== 4/4 UX RELEASE ATTESTATION ===\n'
python3 - <<'PY'
from pathlib import Path
import json,hashlib
root=Path.cwd();sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
prior=json.loads((root/'verifica/REPORT_MACROFASE_E.json').read_text(encoding='utf-8'))
assert prior['html_sha256']==sha and prior['gates']['student_html']=='PASS', 'Teacher E gate is not current'
record={'format':'statatlas.ux-acceptance','version':1,'html_sha256':sha,
  'gates':{'prior_macrofasi_A_to_E':'PASS','R_exports':31,'RJS_default_checks':84,
           'workbench_labs':31,'mobile_390':'PASS','desktop_1366':'PASS',
           'non_reflowing_overlays':'PASS','toolbar_six_actions':'PASS',
           'challenge_overlay':'PASS','live_r_code_overlay':'PASS','teacher_master_detail':'PASS',
           'standalone_student_report':'PASS','D_snapshots':'PASS'},
  'limitations':'R1 default scenario parity only (not R2); native Safari file://, screen readers and student usability require manual verification.'}
(root/'verifica/REPORT_MACROFASE_UX.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('PASS UX release report:',sha)
PY
printf '\nSUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED\n'
printf 'NOTE: before GitHub publication test native Safari file:// student paths and overlays (mouse, keyboard, mobile).\n'
printf 'NOTE: formative student JSON reports are local and editable, not certified exam results.\n'
