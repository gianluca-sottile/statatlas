#!/bin/sh
# One-shot local scientific/browser QA. Run from any directory.
# Use --require-r for a strict acceptance test that includes GNU R execution.
set -eu
cd "$(dirname "$0")/.."
REQUIRE_R=0
case "${1:-}" in
  "") ;;
  --require-r) REQUIRE_R=1 ;;
  *) echo "Usage: sh tests/run_macrofase_A.sh [--require-r]" >&2; exit 2 ;;
esac
python3 -c 'import numpy,scipy,playwright' || { echo 'Install numpy, scipy, playwright in Python 3' >&2; exit 1; }
command -v node >/dev/null || { echo 'Node.js missing' >&2; exit 1; }
if [ "$REQUIRE_R" -eq 1 ]; then
  command -v Rscript >/dev/null || { echo 'GNU Rscript missing: strict R parity cannot run' >&2; exit 1; }
fi
printf '\n=== BUILD ===\n'
python3 build.py
printf '\n=== JAVASCRIPT REGRESSION (all test_*.js) ===\n'
for f in tests/test_*.js; do node "$f"; done
printf '\n=== INDEPENDENT METHODOLOGICAL CHECKS ===\n'
python3 tests/test_science_independent_31.py
python3 tests/test_scientific_claims.py
printf '\n=== BROWSER: RESPONSIVE, SPATIAL, CHALLENGES AND PEDAGOGY ===\n'
for f in \
 tests/test_mobile_tablet.py \
 tests/test_spatial_studio_browser.py \
 tests/test_spatial_studio_interactions.py \
 tests/test_spatial_unified_challenges.py \
 tests/test_challenges_browser_full.py; do
  python3 "$f"
done
# Split long theoretical browser audit into deterministic batches for reliable logs.
python3 tests/test_pedagogy_browser.py --start 1 --stop 16
python3 tests/test_pedagogy_browser.py --start 17 --stop 31
printf '\n=== ALL 31 R EXPORTS (HTML snapshot and length, plus parse if GNU R present) ===\n'
if [ "$REQUIRE_R" -eq 1 ]; then
  python3 tests/test_r_exports_browser.py --require-r
else
  python3 tests/test_r_exports_browser.py
fi
printf '\n=== SIX SPATIAL EXPORTS: JS/PYTHON/R EQUIVALENCE ===\n'
if [ "$REQUIRE_R" -eq 1 ]; then
  python3 tests/test_spatial_export_equivalence.py --require-r
else
  python3 tests/test_spatial_export_equivalence.py
fi
printf '\n=== SUCCESS: LOCAL MACROFASE A AUTOMATED CHECKS ===\n'
if ! command -v Rscript >/dev/null; then
  printf '%s\n' 'ATTENTION: GNU R absent; its execution and full JS/R numerical parity are NOT certified.'
fi
printf '%s\n' 'Theoretical proof audit and real-student usability validation are not automated by this script.'
