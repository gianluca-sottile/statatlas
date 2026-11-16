# StatAtlas 2.1 — Challenges diagnostiche basate su risultati quantitativi

**Data:** 15 novembre 2026. **Baseline:** `statatlas21_prossima_fase.zip`.
**Stato:** versione di sviluppo; non è stato eseguito il push GitHub né creato un tag di release.

## Cosa cambia

Sono state introdotte interfacce di sola lettura `challengeEvidence()` in tutti i 31 laboratori.
Ogni osservazione dopo un passo valido registra, insieme alla configurazione dei controlli,
**un valore numerico effettivamente restituito dallo stato del laboratorio**. Il registratore
rifiuta valori assenti, non finiti e, dove previsto, fuori dall'intervallo ammissibile.
Le osservazioni esistono soltanto nella pagina corrente.

Le **84 sfide dei 28 laboratori non pilota** hanno ora questi vincoli:

1. **Comprensione:** almeno una statistica valida prodotta dopo l'apertura.
2. **Applicazione:** modificare il controllo pertinente e ottenere almeno due statistiche valide sotto la nuova configurazione.
3. **Avanzato:** osservare almeno due valori del parametro, disporre di almeno cinque misure complessive e rispondere **sia** alla domanda teorica **sia** alla domanda empirica A/B/pari. A e B identificano i primi due valori del controllo effettivamente utilizzati. Il confronto numerico usa le medie dei risultati rilevati nelle due configurazioni, arrotondate a quattro decimali.

Se i dati vengono aggiornati dopo la selezione della risposta A/B, la selezione viene azzerata.
Il sistema mostra se gli altri controlli risultano costanti, ma **non** tratta due realizzazioni casuali differenti come un esperimento causale perfettamente accoppiato.

Le **nove sfide pilota** degli intervalli di confidenza (08), validazione (18) e kriging (30)
continuano ad applicare i loro prerequisiti specifici; le nuove interfacce quantitative
non sostituiscono le loro regole.

## Matrice delle 31 osservazioni effettive

La tabella distingue indicatori di stima o performance da singoli valori osservati. L'ultima
osservazione campionaria **non** equivale a una stima di precisione o a un controllo causale.

| Lab | Modulo | Valore registrato dopo il passo |
|---:|---|---|
| 01 | distribuzioni | Ultima osservazione estratta X |
| 02 | bivariata | Ultimo valore generato Y |
| 03 | simulazione | Estrazione o media Monte Carlo |
| 04 | lgn tcl | Media cumulativa o statistica del TCL |
| 05 | adattamento | Ultima osservazione del campione |
| 06 | stimatori | Mediana dell’ultima replica |
| 07 | fisher | Ultima stima di massima verosimiglianza |
| 08 | intervalli | Copertura empirica cumulativa |
| 09 | test | Frequenza di rifiuto sotto H₀ |
| 10 | regressione | Pendenza OLS stimata |
| 11 | regressione lp | Pendenza Lp stimata |
| 12 | glm | Quota di stime GLM finite |
| 13 | arma | Ultimo valore della serie |
| 14 | quantilica | Pendenza della regressione quantilica |
| 15 | penalizzata | Numero medio di coefficienti attivi |
| 16 | spline | ISE medio sulle repliche |
| 17 | segmentata | Punto di cambio stimato |
| 18 | validazione | Errore di test del modello scelto con CV |
| 19 | knn | Errore di test kNN al k mostrato |
| 20 | alberi ensemble | Errore di test Random Forest |
| 21 | gradient boosting | Loss di validazione del boosting |
| 22 | reti neurali | Loss di validazione della rete |
| 23 | pca | Quota di varianza spiegata dalla prima componente |
| 24 | clustering | Within-cluster sum of squares corrente |
| 25 | dbscan | Numero di cluster individuati fino al passo |
| 26 | moran | Indice di Moran I dell’ultima permutazione |
| 27 | lisa | Moran I locale permutato nella zona selezionata |
| 28 | processi puntuali | Massimo scostamento di L(r) sotto CSR |
| 29 | variogrammi | Media dei valori simulati ai sensori |
| 30 | kriging | RMSE dell’ultima replica kriging |
| 31 | regressione spaziale | MSE dell’ultima validazione spaziale |

## Validazione eseguita

| Controllo | Risultato |
|---|---|
| `sh tests/run_qa_2_1.sh` | Superato: build, suite JS, 31 controlli scientifici indipendenti, 11 controlli matematici mirati |
| `node tests/test_challenges_full.js` | **1050 asserzioni**, 93 Challenges, comprese risposte empiriche mancanti e scorrette |
| `python3 tests/test_challenges_observation_browser.py` | **31/31** laboratori con osservazione quantitativa valida dopo un passo reale (in batch) |
| `python3 tests/test_challenges_targeted_browser.py` | **84/84** percorsi completi dei 28 laboratori estesi, in sei batch |
| `python3 tests/test_challenges_browser.py` | Tre laboratori pilota, 390 / 768 / 1366 px |
| `python3 tests/test_challenges_navigation_browser.py` | Scorciatoie e assenza overflow, 31/31 a 390 e 1024 px; verifica ritorno e progresso |
| `python3 tests/test_challenges_quality_browser.py` | Controllo di confondimento nel confronto GBM |
| `python3 tests/test_challenges_diagnostic_browser.py` | 390 e 1280 px: confronto numerico errato respinto, corretto accettato, risposta azzerata dopo nuove repliche |
| Diff dei sorgenti dei laboratori rispetto alla baseline | **31/31 equivalenti dopo aver eliminato le sole funzioni `challengeEvidence()`** |

## Perimetro e limiti scientifici

- **Non** è un voto certificato né una misura validata delle competenze; il completamento rimane formativo e locale.
- Le **medie osservate** non implicano significatività statistica, dominanza del modello o causalità del parametro. Senza replicazioni comparabili, random number stream condiviso e un disegno sperimentale esplicito, il confronto resta descrittivo.
- Alcuni moduli registrano una statistica riassuntiva (errori, loss, copertura, PVE, RMSE), mentre altri raccolgono l'ultima osservazione generata o un valore di processo. In questi ultimi casi il controllo verifica **l'esistenza di un risultato numerico reale**, non una proprietà inferenziale definitiva.
- I 31 test indipendenti validano **una proprietà selezionata per modulo**, non ogni proposizione teorica o bibliografica. Non è stata rieseguita l'intera suite R e non sono stati provati dispositivi Safari fisici.
- Per una valutazione causale o di efficacia predittiva richiederei una fase successiva di **esperimenti appaiati a seed/dati bloccati**, replicazioni calibrate e criteri specifici per ciascuna sfida. Il sistema attuale non afferma di averli implementati.

## Riprodurre i test

```bash
python3 build.py
sh tests/run_qa_2_1.sh
python3 tests/test_challenges_observation_browser.py 0 12
python3 tests/test_challenges_observation_browser.py 12 22
python3 tests/test_challenges_observation_browser.py 22 31
python3 tests/test_challenges_targeted_browser.py 0 8
python3 tests/test_challenges_targeted_browser.py 8 16
python3 tests/test_challenges_targeted_browser.py 16 22
python3 tests/test_challenges_targeted_browser.py 22 28
python3 tests/test_challenges_diagnostic_browser.py
python3 tests/test_challenges_browser.py
python3 tests/test_challenges_navigation_browser.py
```

Il workflow GitHub Actions esistente esegue le suite JavaScript e i controlli matematici;
i test Chromium restano locali, richiedendo `playwright` e Chromium.
