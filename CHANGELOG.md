# Changelog

## 1.7.0 — 13/11/2026 · UI-01, mappa a due righe, LAB-19
- **UI-01**: «Completa l’esperimento» cooperativo per i laboratori pesanti (`runner({ coop: true })`): lavoro a fette di ~30 ms, barra di avanzamento, annullabile cambiando parametri o pagina. Attivo nei lab 18 e 19.
- **Mappa dell’atlante** su due righe da quattro parti quando le parti sono più di cinque (pronta per otto).
- **CORE-03**: `src/core/ml.js` — vicini più prossimi con parità risolte come `order()` di R, voti per tutti i k, standardizzazione stimata sul training, intervallo di Wilson; `tests/test_ml.js` (8 test).
- **Lab 19 k vicini più prossimi** (Parte VI, *anteprima*): scenari lineare e XOR con errore di Bayes esatto; regioni kNN e frontiera di Bayes; punto trascinabile con i suoi vicini e la probabilità vera; errori di training, leave-one-out e test in funzione di k; matrice di confusione con sensibilità e specificità (Wilson); limite asintotico del vicino più prossimo E[2η(1 − η)] per quadratura e bound di Cover–Hart; effetto della scala di una variabile con e senza standardizzazione. R: stessi dati (R0), stesso algoritmo (R2), `class::knn` come confronto (R3).

## 1.6.0 — 13/11/2026 · Parte VI, Apprendimento supervisionato (CORE-02, LAB-18)
- **CORE-02**: `src/core/resampling.js` — `sample()` di R riprodotto esattamente (R ≥ 3.6, campionamento per rifiuto), suddivisione training/test, fold `sample(rep_len(1:K, m))`, bootstrap, controllo della partizione; `la.nestedPredict` per modelli annidati con una sola ortogonalizzazione; `tests/test_resampling.js` (15 test, incluse permutazioni note di R).
- **Lab 18 Validazione e overfitting** (Parte VI, *anteprima*): regressione polinomiale di grado 0–12 su tre funzioni vere; errore di training, validazione incrociata a K fold, test ed errore di generalizzazione Err(d) calcolato con la funzione vera; distribuzione del grado scelto; confronto tra protocollo corretto (scelta con CV, test usato una volta) e scorretto (scelta sul test) con la distorsione di ciascuno; controllo dei fold a ogni replica. R: stessi dati, stessa suddivisione e stessi fold (R0), stesse metriche (R1).
- Nuova Parte VI nella home e nella mappa (18 nodi, 29 legami); larghezza dei nodi della mappa adattata al numero di parti.

## 1.5.0 — 13/11/2026 · inizio del ciclo 2.0 (BASE-01, CORE-01, LAB-17)
- **BASE-01**: fotografia della baseline 1.4.1 in `docs/BASELINE.md` (commit, build, 49 test, smoke). Piano 2.0 in `docs/PIANO_2_0.md`.
- **CORE-01**: `src/core/linalg.js` — minimi quadrati con QR di Householder, autodecomposizione simmetrica (Jacobi), base ortonormale per disegni fissi; `tests/test_linalg.js` (16 test).
- **UI-01 (primo passo)**: `SA.ui.chunked`, lavoro pesante a blocchi e annullabile (usato dal bootstrap del lab 17).
- **Lab 17 Regressione segmentata e breakpoint** (Parte V, *anteprima*): profilo RSS(ψ) su griglia con QR, insieme plausibile indicativo, distribuzione Monte Carlo di ψ̂ con quota di stime al bordo, caso non identificato δ = 0, test bootstrap sotto H₀ con ricerca di ψ ripetuta, confronto dell’errore con retta e spline. R: stessi dati (R0) e stessa griglia (R2); `segmented` e `davies.test` come confronto di metodo (R3).
- Conteggio dei laboratori nella home ricavato dal catalogo; nuovi legami nella mappa.

## 1.4.1 — 11/11/2026
- Lab 15, vista Percorsi: la correlazione equicorrelata non è definita positiva per ρ < −1/7 con 8 predittori e produceva NaN. Ora Σᵢⱼ = ρ^|i−j| (schema di Tibshirani, 1996), valida per ogni |ρ| < 1, anche negativa; aggiornati etichetta e script R.
- Lab 15, vista geometrica: nuovo punto di partenza (1,8; 0,4) per rendere visibile l’effetto di ρ, e nota sul caso in cui il contatto lungo un lato del rombo non dipende da ρ.

## 1.4.0 — 11/11/2026
- **Lab 16 Regressione non parametrica e spline**: polinomio globale (base di Legendre), spline di regressione (B-spline cubiche), P-spline (40 nodi, penalità sulle differenze seconde), regressione locale lineare con kernel gaussiano. Basi moltiplicate per i coefficienti, fascio delle stime sui campioni ripetuti, distorsione² e varianza **esatte** dalla matrice S in funzione dei gradi di libertà effettivi, validazione incrociata leave-one-out in forma chiusa. R: `splines::splineDesign`, stessa matrice S.
- **Mappa dell’atlante**: il pulsante della home apre un grafo interattivo dei 16 laboratori (colonne = parti, archi = legami concettuali); al passaggio si evidenziano i legami e se ne leggono le motivazioni, al clic si apre il laboratorio. Rimosso il pulsante «Inizia dal laboratorio 01».

## 1.3.0 — 11/11/2026 · Parte V, Regressione moderna
- **Lab 14 Regressione quantilica**: dati eteroschedastici, rette per τ = 0,1 … 0,9 stimate in modo esatto (vertici del problema di programmazione lineare), punti trascinabili, perdita asimmetrica ρτ, quota di punti sotto ciascuna retta, distribuzione della pendenza contro i minimi quadrati. R: `quantreg::rq`.
- **Lab 15 Ridge, lasso ed elastic net**: spazio delle soluzioni (β₁, β₂) con regioni di vincolo, curve di livello di RSS, stima dei minimi quadrati trascinabile, correlazione regolabile e percorso della soluzione; percorsi di regolarizzazione per 8 predittori e scomposizione distorsione²–varianza. R: discesa coordinata identica + confronto con `glmnet`.
- Nuova tessera della Parte V nella home, illustrazioni e contenuti didattici (obiettivi, esempio svolto, esercizi, bibliografia).

## 1.2.1 — 11/11/2026 · revisione terminologica
- “Matrice cappello” → **hat matrix** (matrice di proiezione); “leva” → **leverage** in tutto il lab 10 e nei testi collegati.
- “Minimi quadrati ripesati/pesati” → **minimi quadrati ponderati (iterativi, IRLS)**; “risposta lavorata” → **working response**; “Fisher scoring” → **scoring di Fisher**.
- “Quote / rapporto di quote” → **odds / odds ratio**; “riscaldamento” → **burn-in**; “progetto sperimentale” → **disegno sperimentale**; “funzione generatrice” → **funzione generatrice dei momenti**.
- Aggiunti i termini inglesi di riferimento dove l’uso italiano è meno stabile: *breakdown point*, *M-estimators*.

## 1.2.0 — 11/11/2026
- Home più compatta: le quattro parti sono tessere illustrate; un clic apre una finestra con le schede dei laboratori (chiusura con ×, clic fuori o Esc).
- La previsione non è più un passo a sé: è un riquadro facoltativo e chiuso dentro la Domanda, con lo stesso riscontro. I passi dei laboratori si rinumerano automaticamente.

## 1.1.0 — 10/11/2026 · revisione grafica e didattica

### Identità e impaginazione
- Logo (globo-atlante attraversato da una curva normale) nella barra laterale, nella testata mobile, nella home e come favicon.
- Illustrazioni originali in SVG generate dal codice (`src/core/art.js`): una “tavola” per ciascun laboratorio e una per ciascuna parte, nei colori del tema. Nessuna fotografia esterna: il sito resta offline e privo di problemi di licenza.
- Home riprogettata: testata con mosaico illustrato, percorso “Come funziona un laboratorio” in sei passi, parti con banner e descrizione, schede con copertina.
- Cornici editoriali (`src/styles/editorial.css`): doppie righe, numeri dei passi cerchiati, tavole con didascalia, riquadri con filetto interno, barre d’accento sui grafici.
- Layout più ampio (fino a 1380 px) e grafici più grandi e leggibili (testo SVG a 13 pt).

### Didattica
- `src/core/content.js`: per ogni laboratorio obiettivi, “Che cosa stiamo valutando”, “Come leggere la tabella”, esempio svolto, errori frequenti, approfondimento “Per andare oltre”, 3 esercizi con soluzione, bibliografia.
- Il pannello Approfondisci ha quattro schede: Essenziale, Avanzato, Esercizi, Bibliografia.
- Obiettivi mostrati come etichette nella testata di ogni laboratorio.

### Interazione
- Normale come modello predefinito nei laboratori 01, 03, 04, 05, 07, 08 (intervallo Z) e 11.
- Animazioni più fluide: velocità ritarate e nuvole di punti disegnate come un unico tracciato (laboratori 02, 03, 05).

## 1.0.0 — 10/11/2026

Riprogettazione completa rispetto alla v0.8 (`StatAtlas_GitHub_old/`).

### Architettura
- Sorgenti modulari in `src/` (HTML/CSS/JS nativo), build in un unico `index.html` offline.
- Design system “Editoriale” con tema chiaro/scuro, palette Okabe–Ito con doppia codifica (colore + tratto/simbolo), contrasto WCAG AA.
- Generatore Mersenne-Twister identico a R; leggi generate per inversione: gli script R riproducono gli stessi numeri.
- Componenti condivisi: motore di animazione (avvia, pausa, passo, completa, velocità, tastiera), drawer di approfondimento a due livelli, codice R evidenziato con copia/scarica, esportazioni CSV/PNG, superfici 3D in SVG.

### Laboratori
- **Migrati e ampliati dalla v0.8**: 01 Distribuzioni (17 leggi con t e F, 3D famiglia e bivariata, banda DKW, mappa delle relazioni), 03 Simulazione, 04 LGN/TCL (Berry–Esseen), 07 Verosimiglianza e Fisher (10 modelli, identità di Bartlett), 08 Intervalli (copertura esatta calcolata), 09 Test e potenza.
- **Nuovi, da idee di Simul2000**: 02 Bivariate, 05 Adattamento (QQ con banda esatta, X², p-value Monte Carlo), 06 Confronto di stimatori, 10 Regressione interattiva, 11 Regressione Lp, 12 GLM, 13 ARMA.

### Verifiche
- 49 test numerici (`tests/test_core.js`) contro valori di riferimento di R.
- Smoke test jsdom di tutti i laboratori (`tests/smoke/`).
- Non ancora eseguiti: script R in R reale, test su Safari/Firefox/mobile reali, audit WCAG con screen reader.
