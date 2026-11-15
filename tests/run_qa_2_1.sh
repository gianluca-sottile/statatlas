#!/bin/sh
# Run from any directory; Node and Python with NumPy/SciPy are needed for QA.
set -eu
cd "$(dirname "$0")/.."
python3 build.py
for file in tests/test_*.js; do node "$file"; done
python3 tests/test_science_independent_31.py
python3 tests/test_scientific_claims.py
printf '\nPASS: build, JavaScript and independent scientific checks.\n'
