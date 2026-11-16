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
printf '1/5 Clono il repository in uno spazio temporaneo...\n'
git clone --quiet "$URL" "$WORK/repo"
cd "$WORK/repo"
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != main ]; then echo "ERRORE: il ramo corrente e' $BRANCH, atteso main." >&2; exit 1; fi
printf '2/5 Copio la versione conclusiva senza modificare la cronologia Git...\n'
rsync -a --delete --exclude='.git/' "$SOURCE/" "$WORK/repo/"
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
git commit -m 'StatAtlas 2.1: correzione generale export R e parsing automatico in CI'
git push origin main
printf 'PUBBLICAZIONE COMPLETATA. Ora verifica GitHub Actions e la checklist conclusiva.\n'
