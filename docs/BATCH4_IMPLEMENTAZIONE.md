# StatAtlas — Batch 4 · Laboratorio 28: Processi puntuali spaziali

**Data:** 14 novembre 2026  
**Base:** ZIP `statatlas_lab27_lisa.zip` (27 laboratori, verifica R del LAB 27 confermata dall'autore).  
**Stato:** implementato e testato in JS/Chromium; **verifica numerica indipendente in R non ancora eseguita**.

## 1. Interventi

- Nuovo motore `src/core/spatial-points.js`: processi Poisson omogeneo, Thomas, inibizione sequenziale e Poisson non omogeneo per thinning; stima K translation-corrected nel quadrato unitario, L(r)−r, envelope puntuali e test globale Monte Carlo CSR condizionale su n; distanze nearest-neighbour e conteggi 4×4.
- Nuovo laboratorio `src/labs/28-processi-puntuali.js`, catalogato nella Parte VIII con URL `#/processi-puntuali`, conservando i precedenti ID pubblici.
- Copertina SVG, cinque obiettivi, previsione facoltativa con tre risposte, guida operativa, quattro pannelli grafici, nove righe di tabella e tre KPI; codice R dinamico con coordinate esplicite.
- Interazione diretta con i punti: selezione e vicini più prossimi; aggiunta/rimozione, ricostruzione delle statistiche e riavvio della distribuzione nulla. Se l'utente modifica i punti, viene mostrato un avviso metodologico.
- Teoria Essenziale, Avanzato, esempi ed esercizi nel sistema condiviso `src/core/content.js`.
- Il master `verifica/verifica_statatlas.R` richiama la verifica autonoma del LAB 28; il generatore `tests/gen_verifica_R.js` conserva il blocco al successivo rebuild.

## 2. Convenzioni scientifiche

- Finestra `W=[0,1]^2`; numero Poisson simulato via tempi di attesa esponenziali e coordinate uniformi.
- Thomas con finestra parentale estesa di `4σ` e ritaglio dei figli. Intensità marginale desiderata `λ=κμ` (troncatura gaussiane residuale trascurabile, ma non esattamente nulla).
- Repulsione: sequential inhibition con numero-obiettivo `round(λ)` e limite di tentativi; non si attribuisce una legge Poisson al numero finale.
- Processo non omogeneo: `λ(x,y)=λ[1+a(2x−1)]`, generato tramite thinning; indipendenza tra eventi senza intensità costante.
- Stima K translation-corrected `2/[n(n−1)(1−|dx|)(1−|dy|)]` per ciascuna coppia non ordinata nel quadrato.
- 20 raggi da 0,0125 a 0,25; L(r)−r, envelope CSR *puntuali* (quantili 2,5% e 97,5%) e test globale `T=max|L(r)−r|` con p-value `(1+#Tsim≥Tobs)/(B+1)`.
- La null di CSR **condiziona su n osservato**; l'inferenza è contro omogeneità + indipendenza e **non** dimostra interazione in presenza di trend spaziali non modellati.
- Classificazione riproducibilità: R0 coordinate esportate come letterali, R1 stessa formula K, distanza NN e quadrati; R3 simulazioni e confronto con spatstat (RNG non identico).

## 3. Gate verificati

- Build unica offline: `python3 build.py` — **riuscita**.
- Suite numerica JavaScript: **319/319** controlli superati (254 precedenti + 65 nuovi).
- Smoke test `tests/test_boost_mount.js` e `tests/test_moran_mount.js` — **superati**.
- Chromium/Playwright: `tests/smoke/smoke_lab28_browser.py` — **superato**.
- Browser: copertina SVG, 5 obiettivi, previsione con 3 risposte, 4 grafici, 9 righe tabella, autoplay 99/99, generatori Thomas/repulsione/non omogeneo, click sui punti, aggiunta/rimozione, approfondimenti, CSV e R download, navigazione 27↔28, mobile e tema scuro, 0 eccezioni.

## 4. Gate aperti

- R non installato nell'ambiente di esecuzione. `verifica/verifica_processi_puntuali.R` contiene quattro scenari numerici di riferimento, controlli R1 di K/NN/quadrati e controlli Monte Carlo in R base; eventuale confronto con `spatstat` è opzionale.
- La verifica sul Mac dell'autore e il confronto finale di rendering in Safari sono ancora necessari per dichiarare il LAB 28 validato per il rilascio pubblico.

### Come eseguire R sul Mac

```r
source("~/Downloads/statatlas-main/verifica/verifica_processi_puntuali.R")
```

Oppure da RStudio scegliere il file via `source(file.choose())`. L'esecuzione deve stampare `OK:` per ciascun modello e per i controlli CSR senza interruzioni da `stop()`.

### Comandi per la build e i test

```sh
python3 build.py
node tests/test_spatial_points.js
node tests/gen_point_reference.js
python3 tests/smoke/smoke_lab28_browser.py
```

Lo smoke test Chromium utilizza `page.set_content(...)` sulla build offline per evitare che la configurazione del browser impedisca l'accesso a `file://`.

## 5. Fase successiva

Dopo il controllo R e il collaudo Safari, il prossimo laboratorio pianificato è il **29 — Variogrammi e campi aleatori spaziali**, da realizzare con la stessa struttura grafica e il medesimo protocollo di verifica.
