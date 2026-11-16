# StatAtlas · Parte VIII · Ridisegno interattivo a mappe continue

**16 novembre 2026 · Sviluppo 2.1 · Sei laboratori (26–31)**

## Obiettivo e decisione architetturale

La prima esperienza dello studente diventa una mappa di superficie **interattiva**, con osservazioni puntuali trascinabili, aggiungibili e rimovibili. I modelli preesistenti, compresi i loro esperimenti Monte Carlo, le verifiche e gli script R, rimangono intatti sotto la nuova mappa. Non si confonde la superficie di visualizzazione con la quantità statistica calcolata.

Le osservazioni e le coordinate della singola mappa possono essere esportate in **CSV** senza collegamenti esterni. L’esportazione riguarda lo studio esplorativo, non costituisce uno script R con equivalenza numerica già verificata (gli script R dei modelli originali restano invariati).

Nuovo sorgente condiviso `src/core/spatial-studio.js`; stile `src/styles/spatial-studio.css`. Caricamento locale in `build.py`, richiamo ai sei `mount` senza modificare i rispettivi motori numerici. **Le coordinate degli studi sono normalizzate fra zero e uno**, non latitudine/longitudine reale in gradi: per geometrie geografiche reali occorre una proiezione adeguata, o una metrica geodetica. La heatmap rasterizzata (29×29 celle SVG) è una rappresentazione continua campionata, non una ricostruzione esatta dell’intero campo aleatorio.

## Scelte per le sei lezioni

| Lab | Mappa iniziale | Parametri e attività | Statistiche interpretate | Interazione col motore originale |
|:--|:--|:--|:--|:--|
| 26 — Moran | Lisciamento kernel dei valori puntuali | Aggiungi valore alto/basso, gruppo simile, trascina, elimina, kNN, regioni/scacchiera/rumore | I globale con `SA.spatialAreal.moran`, E[I] condizionata a scambio uniforme, ΔI dalla baseline | **Autonomo**: dati originali areali 8×8, W rook/queen/distanza e test permutazionale non alterati. |
| 27 — LISA | Lisciamento dei valori + corone HH/LL/HL/LH sui punti | Inserisci cluster, cambia vicinato k, trascina/elimina | Quadranti `SA.spatialLocal.local` e I globale; **nessun p-value nel nuovo studio** | **Autonomo**: il laboratorio originale mantiene permutazioni locali, BH/BY e MAUP. |
| 28 — Eventi | KDE gaussiana dell’intensità non corretta al bordo | Aggiungi eventi isolati o gruppi, trascina, elimina, ampiezza del kernel, CSR/cluster/regolare | Distanza media al primo vicino, riferimento euristico CSR, curva L(r)−r calcolata da `SA.spatialPoints.curve` | **Sincronizzato**: `S.pts`, `recompute`, envelope precedenti invalidati; avvio MC solo esplicito. |
| 29 — Variogrammi | IDW **illustrativo** del valore osservato | Sposta sensori, aggiungine di alti/bassi, scenari, esponente IDW | Stima di Matheron per classi di distanza via `SA.geostat.empirical` e grafico miniatura | **Autonomo**: il laboratorio principale conserva il campo gaussiano e la covarianza impiegata nelle simulazioni R. |
| 30 — Kriging | Varianza condizionale di previsione oppure valore predetto | Aggiungi/rimuovi/sposta sensori sulla griglia originale 12×12; confronto tra disegno concentrato e diffuso | `SA.kriging.geometry` e `predict`, varianza media, varianza massima, Δ rispetto al disegno iniziale | **Sincronizzato**: stessi siti e osservazioni di `S.allObserved`, campo vero **fisso**, `stopRefit` aggiorna mappe, RMSE e output R. |
| 31 — Regressione | Valore atteso OLS a X fissata alla media; X o X+coordinate | Aggiungi/sposta/rimuovi osservazioni, trend geografico sì/no, kNN residui | Coefficienti OLS, R² in campione, I Moran dei residui (senza test) | **Autonomo**: i modelli ML SAR/SEM e i fold del motore originale non sono trasformati in una regressione con coordinate. |

## Distinzioni metodologiche importanti

1. **Moran ≠ superficie di calore.** L'indice dipende dai valori *osservati* e da una matrice di pesi; modificando il vicinato kNN si modifica anche la statistica. La mappa continua serve a individuare pattern, non a calcolare l'indice da pixel interpolati.
2. **LISA descrittivo ≠ significatività hotspot.** HH, LL, HL e LH identificano quadranti nello scatter locale; per parlare di hotspot statisticamente significativo servono una null, randomizzazioni e il controllo della molteplicità, già presenti nel motore originale.
3. **KDE ≠ intensità generatrice nota.** L'estimatore qui mostrato non ha correzione di bordo; aumentando o diminuendo la banda si cambia la risoluzione spaziale. Il semplice rapporto fra distanza media al primo vicino e `1/(2√n)` non è un test di CSR in finestra finita.
4. **IDW ≠ kriging.** Nell'esploratore dei variogrammi la heatmap è IDW; soltanto lo studio 30 impiega `SA.kriging` e mostra la varianza condizionale sotto il modello di covarianza assunto.
5. **Coordinate in OLS ≠ dipendenza SAR/SEM.** Inserire coordinate può adattare un trend della media; non equivale a modellare covarianza o spillover. L'R² in-sample può soltanto aumentare aggiungendo regressori e non prova una migliore capacità predittiva.
6. **Sincronizzazione selettiva.** I nuovi eventi 28 e sensori 30 si possono inserire nel modello originale mantenendo la sua struttura; aggiunte arbitrarie ai territori 26/27 o al campo gaussiano 29 modificherebbero invece W, numero di siti o covarianza fattorizzata, invalidando il protocollo Monte Carlo/R. La nuova regressione puntuale 31 è uno studio OLS separato dalla simulazione SAR/SEM originale.

## Test di accettazione automatizzati

- `node tests/test_spatial_studio.js`: proprietà matematiche di vicinato, autocorrelazione, LISA, interpolazione, KDE, OLS, kriging, variogrammi, curve L.
- `python3 tests/test_spatial_studio_browser.py`: i sei laboratori a 390, 768 e 1366 px; add/remove/reset, statistiche finite, assenza overflow e errori JavaScript.
- `python3 tests/test_spatial_studio_interactions.py`: scenari, cluster correlato, variazione I, aggiornamento L e semivarianza, trascinamento, sincronizzazione al motore 28/30, riduzione incertezza kriging e confronto OLS.
- `for f in tests/test_*.js; do node "$f"; done`: suite JavaScript preesistenti e aggiunte.
- `python3 tests/test_science_independent_31.py`: 31 identità scientifiche indipendenti dalla simulazione del sito.
- `python3 tests/test_scientific_claims.py`: controlli metodologici addizionali.

I nuovi test sono ripetibili in Chromium; **la validazione diretta su Safari iOS reale non è stata eseguita nel container** e resta un punto del collaudo finale dell'utente. Nessuna modifica agli script R; l'esecuzione R completa rimane parte della **Macrofase A di consolidamento scientifico**, conservata dal piano generale.

## Criteri conclusivi sul sito pubblico

1. Aprire il LAB 26 e aggiungere un **gruppo di sette osservazioni simili**: deve crescere il numero di punti e modificarsi I; selezionare alternanza e verificare la mappa e I.
2. Nel LAB 27 distinguere le corone HH/LL dagli hotspot significativi ottenuti con i test nella sezione originale.
3. Nel LAB 28 aggiungere nove eventi come gruppo: l'intensità KDE e L(r)−r devono cambiare; anche la figura originale deve avere nove eventi in più.
4. Nel LAB 29 aggiungere un sensore: aggiornamento della superficie IDW e del grafico di semivarianza; il vecchio Monte Carlo resta separato.
5. Nel LAB 30 aggiungere un sensore in una zona scoperta e verificare che la varianza media non aumenti, che il numero di sensori della figura originale cresca e che il campo vero resti fisso.
6. Nel LAB 31 scegliere «Trend geografico» e confrontare Y~X rispetto a Y~X+coordinate, coefficienti, R² e Moran dei residui; verificare che i modelli SAR/SEM restino disponibili nella sezione originale.
7. Verificare su smartphone il trascinamento di un punto, la modalità rimozione, il ripristino e il ritorno alle Challenges esistenti. Nessuna navigazione o funzione statistica originale deve risultare assente.

**Stato:** questo pacchetto completa il *ridisegno interattivo della Parte VIII*, non l'audit formale definitivo di tutti i 31 laboratori. Il piano di lavoro già approvato rimane: Macrofase A (rigore scientifico + R + QA), B (integrazione con corso R, salvataggi e strumenti per docenti), C (traduzione e valutazione didattica).
