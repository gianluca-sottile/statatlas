# StatAtlas — Scheda di laboratorio 31 · Regressione spaziale e validazione geografica

## Collegamento al corso R
- Lezione 39 — Regressione multipla (IT): https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/39-multiple-regression.html
- Lezione 40 — Selezione e validazione del modello (IT): https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html

**Tipo di allineamento:** prerequisiti e concetti di supporto; il metodo specifico può non essere trattato nel corso

## Prima di sperimentare
L’aggiunta delle coordinate assorbe sempre la dipendenza spaziale residua?

## Esperimento nel browser
Confronta OLS Y~X e OLS Y~X+x+y sul medesimo campione.

## Riproducibilità in R
Scarica lo script R generato da StatAtlas mentre il campione è visibile. Eseguilo con lo stesso seed e verifica:
Confronta R2 e Moran dei residui tra i due modelli in R.

## Interpretazione e limitazioni
Il laboratorio non adatta SAR/SEM nella mappa unificata.

## Consegna
Riporta: (1) parametri e seed; (2) una previsione; (3) uno screenshot o una tabella; (4) un risultato numerico in R; (5) interpretazione; (6) una limitazione.

## Autovalutazione
- [ ] Ho fissato e dichiarato il seed.
- [ ] Ho distinto dati, stima e risultato teorico.
- [ ] Ho controllato uno stesso output in R.
- [ ] Non ho interpretato come indipendenti checkpoint successivi.

Nota: i collegamenti al corso richiedono la connessione; StatAtlas può funzionare offline.
