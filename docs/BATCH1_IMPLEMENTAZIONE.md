# StatAtlas: sviluppo reale - Batch 1 (gradient boosting e riorganizzazione)

**Origine:** archivio `statatlas-main.zip` caricato dall'autore il 14/11/2026. Gli originali sono rimasti inalterati: tutte le operazioni sono state effettuate su una copia.

**Perimetro completato:** riordinamento di apprendimento supervisionato e metodi non supervisionati, nuovo laboratorio 21 sul gradient boosting, motore numerico, contenuti teorici, test JS e predisposizione dei confronti R. **Non inclusi in questo batch**: sei laboratori di statistica spaziale e audit metodologico esteso degli altri 24 laboratori. Non si tratta ancora del rilascio complessivo a 31 laboratori.

## Modifiche funzionali

- Parte VI ora comprende `18 validazione`, `19 kNN`, `20 alberi/ensemble`, **`21 gradient boosting`** e `22 reti neurali`.
- Parte VII comprende `23 PCA`, `24 clustering` e `25 DBSCAN`. Le route `#/reti-neurali`, `#/pca`, `#/clustering`, `#/dbscan` non sono state modificate.
- Il nuovo motore `src/core/boost.js` contiene alberi CART di **regressione 1D** sui residui e pseudo-residui, con profondita e numero minimo di osservazioni per foglia controllabili, tie-break deterministico, shrinkage, SSE e log loss binomiale. Non modifica il CART Gini utilizzato dai laboratori precedenti.
- `src/labs/21-gradient-boosting.js` permette di selezionare tre meccanismi generatori (sinusoide, salto, classificazione binaria), differenzia training/validazione/test, animazione di un albero per passo, visualizzazione della funzione vera, dei pseudo-residui, dei percorsi di loss, della scelta di B* sulla sola validazione, esportazione CSV e PNG e codice R autonomo.
- Il LAB 21 presenta approfondimento **Essenziale**, **Avanzato**, esercizi e bibliografia nella stessa esperienza editoriale esistente (`src/core/content.js` e `SA.ui.openDrawer`).
- Catalogo, mappa dei collegamenti e illustrazione SVG aggiunti/aggiornati; la navigazione resta offline, senza dipendenze o servizi aggiuntivi.

## File principali

**Aggiunti:** `src/core/boost.js`, `src/labs/21-gradient-boosting.js`, `tests/test_boost.js`, `tests/test_boost_mount.js`, `tests/gen_boost_reference.js`, `verifica/verifica_gradient_boosting.R`, `verifica/boost_riferimento_js.json`.

**Rinumerati:** `src/labs/24-reti-neurali.js` -> `22-reti-neurali.js`; `21-pca.js` -> `23-pca.js`; `22-clustering.js` -> `24-clustering.js`; `23-dbscan.js` -> `25-dbscan.js`.

**Aggiornati:** `build.py`, `src/core/app.js`, `src/core/art.js`, `src/core/content.js`, `README.md`, `CHANGELOG.md`, `tests/gen_verifica_R.js`, `verifica/verifica_statatlas.R`, `index.html` (rigenerato).

## Audit eseguito / risultati osservati

Comando: `python3 build.py` -> **SUCCESSO** (`index.html`, circa 976 KB, 41 script; 25 laboratori in catalogo).

| Test | Risultato reale |
|---|---|
| `node tests/test_core.js` | 49 pass, 0 fail |
| `node tests/test_linalg.js` | 16 pass, 0 fail |
| `node tests/test_resampling.js` | 15 pass, 0 fail |
| `node tests/test_ml.js` | 14 pass, 0 fail |
| `node tests/test_cluster.js` | 26 pass, 0 fail |
| `node tests/test_nn.js` | 11 pass, 0 fail |
| `node tests/test_boost.js` | **26 pass, 0 fail** |
| `node tests/test_boost_mount.js` | Mount + 110 passi + redraw + unmount su mock DOM: **pass** |
| `node --check` su file JS di implementazione/test | **pass** |
| `node tests/gen_boost_reference.js` | **pass**; tre scenari e riferimento JS generati |

Totale **157 test numerici JavaScript superati** (131 preesistenti, 26 nuovi).

### Test non eseguiti: blocchi da superare PRIMA di una release definitiva

- **R non disponibile nell'ambiente di sviluppo:** `Rscript` non installato. `verifica/verifica_gradient_boosting.R` e l'invocazione nel master `verifica/verifica_statatlas.R` sono predisposti, ma *non e stato confermato in R* che i tre scenari coincidano entro `1e-6`. Non dichiarare R0/R2 numericamente validati prima dell'esecuzione reale.
- **`jsdom` non disponibile:** lo smoke test `tests/test_boost_mount.js` prova il ciclo di vita con mock, *non* e un test DOM/browser equivalente.
- **Collaudo grafico su browser reale non concluso:** una prova headless Chromium non ha terminato nell'ambiente attuale. Restano da verificare layout desktop/mobile, tema chiaro/scuro, controlli, export CSV/PNG, timer e interpretazione della UI nel browser.
- Non eseguiti audit scientifici di dettaglio e aggiornamento Essenziale/Avanzato di tutti i laboratori preesistenti (fase futura, distinta).

## Comandi per il revisore / Claude Code

Eseguire dalla radice della cartella estratta:

```sh
python3 build.py
node tests/test_core.js
node tests/test_linalg.js
node tests/test_resampling.js
node tests/test_ml.js
node tests/test_cluster.js
node tests/test_nn.js
node tests/test_boost.js
node tests/test_boost_mount.js
node tests/gen_boost_reference.js
Rscript verifica/verifica_gradient_boosting.R
Rscript verifica/verifica_statatlas.R
```

In un browser, aprire `index.html#/boost` e, sullo stesso build, verificare tutte le route precedenti. Controllare in particolare: numero di alberi e valore B*, loss su test separata dal tuning, cambio scenario, interruzione della simulazione, editor/approfondimenti, navigazione, tema e PNG/CSV. Verificare con R 4.1+ e, per il master storico, i pacchetti gia richiesti dal repository.

**Gate proposta per merge:** test JS verdi, script R sui tre scenari verdi, smoke/browser reale verde, nessun link storico compromesso, nessuna regressione rispetto alla baseline. Il batch e pronto per revisione, ma **NON tutti i gate sono soddisfatti**.

## Prosecuzione prevista

1. Verifica R reale e visual QA del batch 1, correggendo eventuali divergenze.
2. Definizione e sviluppo del motore spaziale in un secondo batch, con test e riferimenti R per ogni laboratorio.
3. Sei laboratori spaziali 26-31 nella Parte VIII.
4. Revisione scientifica ed editoriale Essenziale/Avanzato di tutti i 31 laboratori, con audit finale regressivo.
