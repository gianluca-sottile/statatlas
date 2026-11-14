# StatAtlas 2.0.0 — Pubblicazione su GitHub

Questa cartella deriva dall'ultimo archivio approvato, `statatlas_mobile_tablet.zip`. Contiene **31 laboratori** e tutti i componenti responsive. Questa preparazione modifica soltanto README, changelog, metadati HTML, CITATION.cff e documentazione di rilascio; non modifica gli algoritmi o i file dei laboratori.

## Verifiche prima della pubblicazione

Eseguire dalla radice del progetto:

```bash
python3 build.py
for f in tests/test_*.js; do node "$f" || exit 1; done
```

Gli script di riferimento R sono già stati eseguiti e confermati dall'autore per i laboratori spaziali 26–31. Il collaudo manuale Safari iOS/iPadOS resta raccomandato.

## Copiare i file nel repository Git

Se `~/Downloads/statatlas-main` **è già un clone Git** e contiene questa versione aggiornata:

```bash
cd ~/Downloads/statatlas-main
git status
python3 build.py
git add -A
git diff --cached --stat
git commit -m "StatAtlas 2.0.0: 31 laboratori, statistica spaziale e interfaccia mobile"
git push origin main
```

Se invece la cartella `statatlas-main` deriva dallo ZIP e non contiene `.git`, clonare prima il repository, quindi copiarvi il contenuto estratto (senza sovrascrivere `.git`):

```bash
cd ~/Downloads
git clone https://github.com/gianluca-sottile/statatlas.git statatlas-pubblicazione
rsync -a --exclude='.git' statatlas-main/ statatlas-pubblicazione/
cd statatlas-pubblicazione
python3 build.py
git status
git add -A
git diff --cached --stat
git commit -m "StatAtlas 2.0.0: 31 laboratori, statistica spaziale e interfaccia mobile"
git push origin main
```

Controllare sempre `git diff --cached --stat` prima del commit. Non utilizzare `git push --force`.

## Aggiornare descrizione e topic (GitHub CLI)

```bash
gh repo edit gianluca-sottile/statatlas \
  --description "Atlante interattivo di probabilità, inferenza, machine learning e statistica spaziale: 31 laboratori offline, simulazioni riproducibili in R e interfaccia mobile/tablet." \
  --homepage "https://gianluca-sottile.github.io/statatlas/" \
  --add-topic statistics,r,teaching,interactive,simulation,machine-learning,spatial-statistics,gradient-boosting,data-visualization,statistics-education,italian
```

Per contrassegnare il rilascio dopo il push e una verifica della pagina GitHub Pages:

```bash
git tag -a v2.0.0 -m "StatAtlas 2.0.0"
git push origin v2.0.0
```

Questi comandi sono una guida: **il rilascio non è stato pubblicato automaticamente**.
