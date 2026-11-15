# StatAtlas 2.1 — Navigazione delle Challenges e verifica scientifica mirata

Data: 15 novembre 2026. Baseline: `StatAtlas_2_1_QA_Scientifica.zip`.
Versione di sviluppo; non e' stato creato un tag Git o eseguito un push.

## Obiettivo e risultati

1. **Accesso alle sfide da ogni laboratorio:** in testa, accanto ad Approfondisci, compare `Mettiti alla prova · 0/3`. Il contatore passa a `1/3`, `2/3`, `3/3` dopo verifiche completate. Il collegamento porta alla sezione esistente, senza duplicarla.
2. **Ritorno dalla simulazione:** `Vai ai controlli` registra la sfida corrente e rende disponibile `Torna alla sfida` nel pannello parametri. Il focus torna sul titolo della sfida attiva. Rispettata la preferenza di movimento ridotto.
3. **Didattica sperimentale:** riallineati nove accoppiamenti applicazione/avanzato tra quesito e parametro da modificare (vedi sotto). La correzione del modello ipotizzato nel LAB 05 non e' stata confermata: il controllo aveva una sola opzione disponibile nello scenario iniziale, quindi e' stata mantenuta la selezione della legge generatrice.
4. **Correzioni teoriche puntuali:** LAB 05, 07 e 08, senza modifiche alle funzioni di simulazione/stima.

## Matrice dei prerequisiti modificati

| LAB | Livello | Prima | Ora | Pertinenza |
|---|---|---|---|---|
| 01 Distribuzioni | Applicazione | Estremo a | Numero di osservazioni | Precisione empirica vs teoria |
| 03 Simulazione | Applicazione | Legge da generare | Estrazioni N | Errore Monte Carlo e numerosita' |
| 10 Regressione | Applicazione | Rumore sigma | Punto x0 | Predizione e posizione del punto |
| 19 kNN | Applicazione | k mostrato | Scala di x2 | Distanza e scaling |
| 19 kNN | Avanzato | Scala di x2 | k mostrato | Scelta di k e consistenza |
| 20 Alberi | Applicazione | Profondita' massima | Alberi B | Numero di membri nell'ensemble |
| 23 PCA | Applicazione | Componenti mantenute | Standardizza | Covarianza vs correlazione |
| 23 PCA | Avanzato | Unita' di x2 | Varianza del primo asse | Prossimita' degli autovalori |
| 24 Clustering | Applicazione | Numero di gruppi K | Legame (gerarchico) | Dendrogramma e linkage |
| 24 Clustering | Avanzato | Legame (gerarchico) | Popolazioni | Struttura generativa dei gruppi |
| 27 LISA | Applicazione | Unita' di analisi | Correzione multipla | Test multipli |
| 27 LISA | Avanzato | Correzione multipla | Unita' di analisi | MAUP |
| 29 Variogrammi | Applicazione | Scala di correlazione phi | Rapporto anisotropia | Anisotropia e struttura direzionale |

Le nove coppie corrispondono a nove laboratori con almeno un focus rivisto (13 associazioni singole).
La modalita' avanzata confronta due configurazioni del parametro e segnala gli altri cambiamenti; e' un'indicazione metodologica, non una dimostrazione causale ne' un controllo delle realizzazioni casuali identiche.

## Precisioni teoriche integrate

- **LAB 05**: il bootstrap parametrico con riadattamento puo' evitare il riferimento a una distribuzione chi-quadrato asintotica, ma non fornisce in generale una calibrazione esatta a campione finito.
- **LAB 07**: limite di Cramer-Rao, normalita' asintotica ML e intervalli LR/Wald richiedono condizioni di regolarita'; non esiste una superiorita' uniforme generale del LR rispetto al Wald.
- **LAB 08**: la copertura e' `P_theta(theta in C(X))`. Solo metodi con garanzia appropriata soddisfano copertura >= nominale per ogni theta; Wilson e Wald possono sottocoprire.

Riferimenti per il controllo del LAB 05: Stute, W., Gonzalez Manteiga, W. & Presedo Quindimil, M. (1993), *Bootstrap based goodness-of-fit-tests*, Metrika 40, 243–256, DOI 10.1007/BF02613687. Consultare anche la documentazione SciPy `stats.goodness_of_fit` per il principio della simulazione con riadattamento dei parametri.

## Test effettivamente eseguiti

- `python3 build.py`: OK, unico `index.html` offline.
- `sh tests/run_qa_2_1.sh`: OK, 31 test scientifici indipendenti, 11 controlli spot e tutte le suite JavaScript (ora incluso `test_challenge_targets.js`).
- `python3 tests/test_challenges_navigation_browser.py`: OK su 5 laboratori rappresentativi a 390 e 1024 pixel; navigazione di ritorno e avanzamento 0/3 -> 1/3.
- Prima esecuzione estesa dell'accesso da testata a **31/31 laboratori su 390 px**: OK. Il secondo ciclo completo a 1024 px ha raggiunto un limite di timeout; per questo il risultato confermato e' il campione rappresentativo a 1024 px, non 31/31.
- `python3 tests/test_challenges_targeted_browser.py` nei segmenti 0–5, 3–6, 5–8, 8–16, 16–24, 24–28: **84/84 percorsi estesi** passati dopo la correzione del focus del LAB 05.
- Verifica visiva in Chromium della testata e del pulsante di ritorno nel LAB 21: OK.

## Non verificato in questa fase

- Esecuzione dell'intera suite R (non disponibile nell'ambiente; algoritmi e script R invariati).
- Safari su iPhone/iPad fisici.
- Revisione dimostrativa esaustiva di tutti i teoremi e degli eventuali casi limite nei 31 approfondimenti.
- Equivalenza causale e randomica dei confronti delle sfide generiche: richiederebbe vincoli ulteriori sul dataset/seed e osservazioni quantitative specifiche per ciascun esperimento.

## File modificati

- `src/core/challenges.js`
- `src/core/challenges-curriculum.js`
- `src/styles/challenges.css`
- `src/labs/05-adattamento.js` (solo formulazione teorica)
- `src/labs/07-fisher.js` (solo formulazione teorica)
- `src/labs/08-intervalli.js` (solo formulazione teorica)
- `tests/test_challenges_navigation_browser.py` (nuovo)
- `tests/test_challenge_targets.js` (nuovo)
- `CHANGELOG.md`
- `index.html` (rigenerato tramite build)

Criterio di accettazione: nessuna variazione dei 31 algoritmi, nuove azioni accessibili nei laboratori, nessuna regressione nelle suite e nei 84 percorsi delle Challenges estese. Tutti superati nei limiti dei test elencati.
