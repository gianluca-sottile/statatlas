# Macrofase B · Guida per il docente

**StatAtlas + From Data to Models with R · 16 novembre 2026**

## Obiettivo e limiti

Il ponte curricolare rende attraversabili due risorse distinte: un esperimento visuale offline e una lezione Quarto con spiegazioni ed esercizi R. La mappatura non sostituisce lo studio dei prerequisiti; i rimandi al corso richiedono Internet, mentre gli esperimenti StatAtlas continuano a funzionare offline. Non sono incorporati script remoti, account, tracciamento o dipendenze di rete.

Ogni laboratorio offre due lezioni del corso, una domanda di previsione, un esperimento controllato, un confronto numerico R, un'avvertenza metodologica e una scheda studente `.md` scaricabile. Le schede sono disponibili anche come 31 file in `docs/schede_studenti_B/` (rigenerabili con `node scripts/genera_schede_B.js`). La scheda è un modello da compilare: non raccoglie dati personali e non attesta automaticamente la riuscita dell'attività.

## Percorsi didattici proposti

| Percorso | StatAtlas | Lezioni R prevalentemente pertinenti | Prodotto osservabile |
|---|---|---|---|
| Dalla legge alla simulazione | 01–05 | 28–30, 35 | Descrizione simulazione, confronto empirico-teorico e caso limite |
| Dall'incertezza all'inferenza | 06–09 | 30–35 | Bias/MSE, frequenza di copertura, livello e potenza |
| Dai modelli al confronto predittivo | 10–22 | 38–49; 62 opzionale EN | Disegno riproducibile, diagnostica e procedura di tuning |
| Strutture latenti | 23–25 | 50, 55–58 | Compattazione, sensibilità all'inizializzazione, scelta di ε e minPts |
| Dati nello spazio | 26–31 | prerequisiti 27–40 | Esperimenti con mappe e controllo R; teoria spaziale propria di StatAtlas |

**Strategia consigliata in aula:** (1) richiamo al corso; (2) previsione individuale e registrazione del seed; (3) esperimento interattivo; (4) confronto con script R scaricato dalla pagina corrente; (5) interpretazione e condizioni di applicabilità; (6) esercizio valutativo.

### Consegna minima e criteri di valutazione

| Dimensione | 0: assente | 1: parziale | 2: soddisfacente |
|---|---|---|---|
| Disegno e riproducibilità | Seed e parametri non dichiarati | Dichiarati, ma confronto non ripetibile | Parametri, seed e output riproducibili |
| Ragionamento statistico | Assenza di distinzione tra dato e modello | Una distinzione solo descrittiva | Evidenza e teoria confrontate con ipotesi esplicite |
| Controllo in R | Non svolto | Output senza spiegazione | Risultato replicato e interpretato |
| Limiti e robustezza | Conclusioni ingiustificate | Limite menzionato | Casi limite e condizioni di validità discussi |

Il punteggio massimo possibile è 8. La rubrica è una proposta progettuale e **non è stata validata empiricamente con studenti**.

## Mappatura completa dei 31 laboratori

Ogni riga distingue *diretto* (lezione che tratta il contenuto centrale) da *propedeutico* (supporto concettuale, non sostitutivo della teoria del laboratorio). Per i laboratori 26–31 non esiste nel corso una sezione dedicata alla statistica spaziale: i rimandi sono deliberatamente indicati come propedeutici.

| Lab | Laboratorio | Allineamento | Lezioni collegate |
|---:|---|---|---|
| 01 | distribuzioni | diretto | [29 — Distribuzioni di probabilità](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/29-distributions.html), [25 — Grafici per le distribuzioni](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/25-distribution-plots.html) |
| 02 | bivariata | diretto | [23 — Descrivere due variabili](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/05-descriptive/23-two-variables.html), [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html) |
| 03 | simulazione | diretto | [28 — Casualità e simulazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/28-randomness-simulation.html), [29 — Distribuzioni di probabilità](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/29-distributions.html) |
| 04 | lgn-tcl | diretto | [30 — Distribuzioni campionarie](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/30-sampling-distributions.html), [28 — Casualità e simulazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/28-randomness-simulation.html) |
| 05 | adattamento | propedeutico | [35 — Proporzioni e test chi-quadrato](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/35-proportions-chisq.html), [29 — Distribuzioni di probabilità](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/29-distributions.html) |
| 06 | stimatori | propedeutico | [30 — Distribuzioni campionarie](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/30-sampling-distributions.html), [31 — Bootstrap](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/31-bootstrap.html) |
| 07 | fisher | propedeutico | [29 — Distribuzioni di probabilità](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/29-distributions.html), [32 — Intervalli di confidenza](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/32-confidence-intervals.html) |
| 08 | intervalli | diretto | [32 — Intervalli di confidenza](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/32-confidence-intervals.html), [35 — Proporzioni e test chi-quadrato](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/35-proportions-chisq.html) |
| 09 | test | diretto | [33 — La logica del test d’ipotesi](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/33-hypothesis-testing.html), [34 — Test t: confrontare medie](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/34-t-tests.html) |
| 10 | regressione | diretto | [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html), [39 — Regressione multipla](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/39-multiple-regression.html) |
| 11 | regressione-lp | propedeutico | [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html), [36 — Test non parametrici](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/36-nonparametric-tests.html) |
| 12 | glm | diretto | [41 — Regressione logistica](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/41-logistic-regression.html), [42 — Regressione di Poisson](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/42-poisson-regression.html) |
| 13 | arma | propedeutico | [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html), [28 — Casualità e simulazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/28-randomness-simulation.html) |
| 14 | quantilica | propedeutico | [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html), [36 — Test non parametrici](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/36-nonparametric-tests.html) |
| 15 | penalizzata | diretto | [43 — Regressione penalizzata](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/43-penalized-regression.html), [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html) |
| 16 | spline | propedeutico | [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html), [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html) |
| 17 | segmentata | propedeutico | [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html), [39 — Regressione multipla](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/39-multiple-regression.html) |
| 18 | validazione | diretto | [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html), [44 — Flusso di lavoro del machine learning](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/44-ml-workflow.html) |
| 19 | knn | propedeutico | [44 — Flusso di lavoro del machine learning](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/44-ml-workflow.html), [49 — Confrontare e scegliere i modelli](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/49-model-comparison.html) |
| 20 | alberi | diretto | [45 — Alberi decisionali](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/45-decision-trees.html), [46 — Random forest](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/46-random-forests.html) |
| 21 | boost | diretto | [47 — Gradient boosting](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/47-gradient-boosting.html), [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html) |
| 22 | reti-neurali | propedeutico | [44 — Flusso di lavoro del machine learning](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/44-ml-workflow.html), [62 — Deep neural networks for tabular data](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/lessons/13-deep-learning/62-dnn-tabular.html) |
| 23 | pca | diretto | [50 — Analisi delle componenti principali](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/11-dimred/50-pca.html), [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html) |
| 24 | clustering | diretto | [56 — Clustering k-means](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/56-kmeans.html), [57 — Clustering gerarchico](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/57-hierarchical.html) |
| 25 | dbscan | diretto | [58 — DBSCAN](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/58-dbscan.html), [55 — Clustering: quadro generale](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/55-clustering-intro.html) |
| 26 | moran | propedeutico | [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html), [23 — Descrivere due variabili](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/05-descriptive/23-two-variables.html) |
| 27 | lisa | propedeutico | [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html), [50 — Analisi delle componenti principali](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/11-dimred/50-pca.html) |
| 28 | processi-puntuali | propedeutico | [28 — Casualità e simulazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/28-randomness-simulation.html), [25 — Grafici per le distribuzioni](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/25-distribution-plots.html) |
| 29 | variogrammi | propedeutico | [27 — Correlazione](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html), [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html) |
| 30 | kriging | propedeutico | [38 — Regressione lineare semplice](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html), [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html) |
| 31 | regressione-spaziale | propedeutico | [39 — Regressione multipla](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/39-multiple-regression.html), [40 — Selezione e validazione del modello](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html) |

## Note di progettazione

- Le lezioni in lingua italiana coprono i livelli 1–4. Il riferimento alla lezione **62** nel laboratorio 22 è disponibile in inglese: il pulsante lo dichiara.
- L'esportazione R del laboratorio deve avvenire **dopo** aver fissato parametri, seed e campione. La scheda studente non incorpora dati correnti, ma richiede di registrarli e confrontarli.
- Il ponte non modifica il generatore pseudo-casuale, il motore delle simulazioni, le Challenges o gli snapshot R della Macrofase A.
- L'eventuale integrazione inversa, ossia collegamenti da ogni lezione Quarto verso StatAtlas, richiede un intervento nel repository separato del corso R; non è inclusa nel commit del repository StatAtlas.
- La validazione didattica con studenti è esplicitamente posticipata alla disponibilità completa del repository.

## Fonti e provenienza

- Corso R: https://github.com/gianluca-sottile/An-R-Tutorial-for-Beginners (`_quarto.yml`, navigazione delle lezioni), verificato il 16 novembre 2026.
- StatAtlas: https://github.com/gianluca-sottile/statatlas (baseline commit `2f7a9b0`, Macrofase A).
- Corrispondenze in formato macchina: `docs/MACROFASE_B_MAPPATURA_CORSO.csv`.

## Attività di controllo della Macrofase B

1. Mappatura 31/31, distinzione diretto/propedeutico, copertura link e lingue.
2. Browser offline: 31 pagine, risoluzioni 390 e 1366 px, schede `.md` scaricabili, nessun errore JS.
3. Regressione JavaScript, numerica indipendente 31/31, responsive completo 320/390/768/1024.
4. Sul Mac prima della pubblicazione: eseguire **nuovamente** la validazione dei 31 script R sulla nuova build (il gate SHA-256 invalida i vecchi risultati per definizione).
5. Restano separati dal controllo didattico i benchmark di parità numerica JS/R completi sui laboratori 01–25; i soli `PASS` di esecuzione R non ne sono una dimostrazione.
