#!/bin/sh
# Publish this exact, already tested snapshot through a clean clone.
# Usage: sh statatlas-main/scripts/pubblica_github.sh
# To test without publishing: sh .../pubblica_github.sh --no-push
set -eu
case "${1:-}" in ''|--no-push) ;; *) echo 'Uso: sh scripts/pubblica_github.sh [--no-push]' >&2; exit 2;; esac
SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
URL=${STATATLAS_REPO_URL:-https://github.com/gianluca-sottile/statatlas.git}
WORK=$(mktemp -d "${TMPDIR:-/tmp}/statatlas-v21-XXXXXX")
trap 'rm -rf "$WORK"' EXIT HUP INT TERM
# Gate obbligatorio: non pubblicare un report storico o una build diversa.
if [ ! -f "$SOURCE/verifica/REPORT_VALIDAZIONE_R_31.csv" ]; then
  echo 'ERRORE: manca verifica/REPORT_VALIDAZIONE_R_31.csv: esegui prima Rscript verifica/valida_tutti_31.R' >&2
  exit 1
fi
python3 - "$SOURCE" <<'PY_VERIFY'
import csv, hashlib, pathlib, sys
root = pathlib.Path(sys.argv[1])
manifest = list(csv.DictReader((root/'verifica/export_r_31/manifest.csv').open(encoding='utf-8')))
results = list(csv.DictReader((root/'verifica/REPORT_VALIDAZIONE_R_31.csv').open(encoding='utf-8')))
assert len(manifest) == len(results) == 31, 'Collegamento manifest-esiti R incompleto'
sha = hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
assert all(r['build_sha256'] == sha for r in manifest), 'Gli snapshot R sono obsoleti: ripetere la validazione R'
assert all(r['build_sha256'] == sha and r['runtime'] == 'PASS' and r['parse'] == 'PASS' for r in results), 'R fallito oppure esiti obsoleti'
assert [r['laboratorio'] for r in results] == [m['lab'] for m in manifest], 'Ordine laboratori non coerente'
print('Gate GNU R: 31 esecuzioni con esito PASS, stessa build corrente')
PY_VERIFY
# C release candidate: require the additional 25 live numerical comparisons.
if [ -f "$SOURCE/verifica/parita_C_01_16.R" ]; then
  (cd "$SOURCE" && python3 tests/verify_parity_C.py) || {
    echo 'ERRORE: parita R/JS 01-25 non certificata sulla build corrente.' >&2
    exit 1
  }
fi
printf '1/5 Clono il repository in uno spazio temporaneo...\n' 
git clone --quiet "$URL" "$WORK/repo"
cd "$WORK/repo"
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != main ]; then echo "ERRORE: il ramo corrente e' $BRANCH, atteso main." >&2; exit 1; fi
printf '2/5 Copio la versione conclusiva senza modificare la cronologia Git...\n'
rsync -a --delete --exclude='.git/' --exclude='.venv/' --exclude='.venv_backup*/' --exclude='node_modules/' --exclude='__pycache__/' \
  --exclude='*.pyc' --exclude='*.log' --exclude='verifica/runs/' \
  --exclude='verifica/REPORT_VALIDAZIONE_R_31.csv' "$SOURCE/" "$WORK/repo/"
printf '3/5 Ricostruisco la versione offline...\n'
python3 build.py
if command -v node >/dev/null 2>&1; then
  for f in tests/test_*.js; do node "$f" >/dev/null; done
  printf 'Tutte le suite JavaScript, incluso il nuovo studio spaziale, superate.\n'
else
  printf 'Node non disponibile: test locali JS saltati; il workflow GitHub li eseguira.\n'
fi
if python3 -c 'import numpy, scipy' >/dev/null 2>&1; then
  python3 tests/test_science_independent_31.py >/dev/null
  python3 tests/test_scientific_claims.py >/dev/null
  printf 'Verifiche matematiche indipendenti superate.\n'
else
  printf 'NumPy/SciPy assenti: verifiche indipendenti affidate alla CI GitHub.\n'
fi
printf '4/5 Verifico le modifiche da pubblicare...\n'
git status --short
if [ "${1:-}" = '--no-push' ]; then
  printf 'Modalita verifica: nessun commit o push eseguito.\n'
  exit 0
fi
if [ -z "$(git status --porcelain)" ]; then
  printf 'Nessuna modifica da pubblicare.\n'
  exit 0
fi
printf '5/5 Creo un unico commit e pubblico su main...\n'
git add -A
git commit -m 'StatAtlas 2.1: versioned offline experiment snapshots and language-aware R links'
git push origin main
printf 'PUBBLICAZIONE COMPLETATA. Ora verifica GitHub Actions e la checklist conclusiva.\n'
