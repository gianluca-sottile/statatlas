# StatAtlas — Scheda di laboratorio 15 · Ridge, lasso ed elastic net

## Collegamento al corso R
- Lezione 43 — Regressione penalizzata (IT): https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/43-penalized-regression.html
- Lezione 40 — Selezione e validazione del modello (IT): https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html

**Tipo di allineamento:** trattazione direttamente pertinente

## Prima di sperimentare
Aumentando lambda, tutti i coefficienti devono ridursi nello stesso modo?

## Esperimento nel browser
Confronta ridge, lasso ed elastic net mantenendo identici i dati.

## Riproducibilità in R
Scarica lo script R generato da StatAtlas mentre il campione è visibile. Eseguilo con lo stesso seed e verifica:
Controlla la normalizzazione della loss e i coefficienti contro R.

## Interpretazione e limitazioni
Standardizzazione, intercetta e fattore 1/n cambiano il significato di lambda.

## Consegna
Riporta: (1) parametri e seed; (2) una previsione; (3) uno screenshot o una tabella; (4) un risultato numerico in R; (5) interpretazione; (6) una limitazione.

## Autovalutazione
- [ ] Ho fissato e dichiarato il seed.
- [ ] Ho distinto dati, stima e risultato teorico.
- [ ] Ho controllato uno stesso output in R.
- [ ] Non ho interpretato come indipendenti checkpoint successivi.

Nota: i collegamenti al corso richiedono la connessione; StatAtlas può funzionare offline.
