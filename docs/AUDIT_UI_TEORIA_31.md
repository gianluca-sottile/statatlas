# Audit trasversale: interfaccia e teoria dei 31 laboratori

**Baseline:** archivio `statatlas_lab31.zip` ricevuto nella conversazione, 31 laboratori, verifiche R confermate dall’autore.  
**Ambito:** qualità della guida all’interazione, supplementi scientifici e coerenza del sistema editoriale. Nessuna modifica agli algoritmi o ai laboratori numerici.  
**Data:** 14 novembre 2026.

## Sintesi esecutiva

- Guide `Come usare il laboratorio`: **31/31** presenti nel nuovo dizionario `SA.pedagogy`, quattro istruzioni specifiche per laboratorio; contenuto generato in un componente condiviso senza duplicare markup.
- Approfondimenti: **31 estensioni Essenziale**, **31 estensioni Avanzato**, **31 equazioni-cardine**, aggiunti alle schede già esistenti, non sostituiti.
- Stile: pannello espandibile a due colonne desktop / una colonna mobile, accessibilità da tastiera, `prefers-reduced-motion`. Per ridurre lo scroll lo stato iniziale è chiuso sui viewport mobili.
- Drawer: apertura impostata su Essenziale; focus trattenuto nella finestra aperta; chiusura con Esc, click overlay o navigazione; reintegro del focus al bottone di provenienza quando ancora presente.
- Coerenza documentale: README corretto da 28 a 31 laboratori, stato delle verifiche spaziali aggiornato secondo gli output confermati dall’autore.
- Prevenzione delle regressioni: tutti i sorgenti `src/labs/*.js` e tutti i moduli numerici `src/core/*` preesistenti (tranne `ui.js` e `app.js`) sono preservati senza modifiche.

## Matrice di revisione laboratorio per laboratorio

| Lab | Argomenti integrati nella scheda | Elementi preservati |
|---|---|---|
| **I · Probabilità** | | |
| **01 — Distribuzioni e relazioni** | densità, massa, CDF, probabilità d’intervallo e banda DKW. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **02 — Variabili bivariate** | congiunta, condizionate, regressione e correlazione non sufficiente. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **03 — Metodi di simulazione** | inversione, integrazione Monte Carlo e riduzione di varianza. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **II · Campionamento** | | |
| **04 — Grandi numeri e limite centrale** | LGN, TCL, Berry–Esseen, momenti e Cauchy. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **05 — Adattamento di un modello** | QQ plot, χ², gradi di libertà e bootstrap parametrico. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **III · Inferenza** | | |
| **06 — Media, mediana e massima verosimiglianza** | distorsione, MSE, efficienza e code pesanti. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **07 — Verosimiglianza e informazione di Fisher** | score, informazione, limite CR, modelli non regolari. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **08 — Intervalli di confidenza** | copertura, conservatività, metodi discreti e Wald. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **09 — Test e potenza** | livello, potenza, errori e calibrazione Monte Carlo. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **IV · Modelli** | | |
| **10 — Regressione interattiva** | OLS, leverage, incertezza di media e previsione. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **11 — Regressione L1, L2, Lp** | perdite Lp, robustezza, pesi IRLS e stabilità. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **12 — Modelli lineari generalizzati** | famiglia-link, IRLS, campioni piccoli e separazione. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **13 — Serie temporali ARMA** | ACF/PACF, radici, memoria e near-unit-root. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 3 riferimenti; generatore e test R invariati. |
| **V · Regressione moderna** | | |
| **14 — Regressione quantilica** | loss check, subgradienti, densità ai quantili e crossing. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **15 — Ridge, lasso ed elastic net** | geometria, KKT, ridge/lasso, CV e selezione. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 5 riferimenti; generatore e test R invariati. |
| **16 — Regressione non parametrica e spline** | basi, smoothing matrix, df effettivi e bias-varianza. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **17 — Regressione segmentata e breakpoint** | cerniera, identificazione del breakpoint e profili. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **VI · Apprendimento supervisionato** | | |
| **18 — Validazione e overfitting** | selection bias, leakage e nested validation. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **19 — k vicini più prossimi** | metrica, frontiere, k, dimensione e consistenza. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **20 — Alberi, bagging e random forest** | instabilità CART, bootstrap, correlazione e OOB. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **21 — Gradient boosting** | pseudo-residui, boosting funzionale e early stopping. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 4 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **22 — Reti neurali e backpropagation** | forward/backprop, perdita, gradiente, generalizzazione. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **VII · Riduzione dimensionale e clustering** | | |
| **23 — Componenti principali** | SVD, varianza spiegata, ricostruzione e sottospazi. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **24 — k-means e clustering gerarchico** | Lloyd, linkage, minimi locali e indici di valutazione. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **25 — DBSCAN e confronto tra metodi** | core/border/noise, ε, stabilità e confronto ARI. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 4 obiettivi, 3 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **VIII · Statistica spaziale** | | |
| **26 — Autocorrelazione spaziale e Moran** | W, Moran globale, permutazioni e trend. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 4 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **27 — Autocorrelazione locale, hotspot e MAUP** | Moran locale, FDR, quadranti e MAUP. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 4 esercizi con soluzione, 5 riferimenti; generatore e test R invariati. |
| **28 — Processi puntuali spaziali** | CSR, Thomas, inibizione, K/L, intensità non omogenea. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 5 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |
| **29 — Variogrammi e campi aleatori spaziali** | covarianze, lag, sill/nugget, anisotropia e trend. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 5 esercizi con soluzione, 5 riferimenti; generatore e test R invariati. |
| **30 — Kriging e disegno dei sensori** | BLUP, peso, nugget, varianza e sensor placement. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 5 esercizi con soluzione, 5 riferimenti; generatore e test R invariati. |
| **31 — Regressione spaziale e validazione geografica** | SAR/SEM, Jacobiano, spillover, CV geografica. Guida con quattro azioni; collegamento teoria/esperimento; formula; precisazioni essenziali e avanzate. | 5 obiettivi, 5 esercizi con soluzione, 4 riferimenti; generatore e test R invariati. |

## Protocollo di qualità

### Controlli superati
- Ricostruzione offline con `python3 build.py`: riuscita.
- `node tests/test_pedagogy.js`: 282 controlli editoriali; 31 guide, 31 equazioni e 62 integrazioni teoriche.
- `node tests/test_*.js`: suite numeriche preesistenti superate, compresi i controlli per i motori spaziali, kriging e SAR/SEM.
- Composizione delle 31 equazioni con `SA.math.tex()`: senza errori JavaScript.
- Confronto dei sorgenti numerici e dei 31 laboratori con lo ZIP baseline: invariati.

### Controlli non completati (limitazione dell’ambiente)
Il Chromium dell’ambiente attuale applica la policy amministrativa `URLBlocklist: ["*"]`: il tentativo di aprire l’HTML locale o il server locale termina con `net::ERR_BLOCKED_BY_ADMINISTRATOR`. **Non sono state ottenute screenshot o misure di fluidità dalla nuova versione.** Il test opzionale `tests/test_pedagogy_browser.py` è incluso per un esame in un ambiente browser che non imponga questa restrizione. Il layout CSS è stato costruito per essere responsivo, ma richiede una verifica visiva desktop e mobile prima della pubblicazione.
- Nessuno script R è stato rieseguito in questo ambiente. I riferimenti numerici R dei laboratori 26–31 risultano confermati dall’autore **prima** di questo intervento, che non modifica calcoli o dati.

### Checklist di accettazione visuale consigliata
1. Aprire un laboratorio di ciascuna parte (01, 06, 13, 17, 20, 23, 26, 31). Verificare testata, copertina, chips di obiettivi, previsione e guida.
2. Aprire e chiudere «Come usare il laboratorio», verificando nessuna guida duplicata, nessun salto grafico anomalo e leggibilità su Safari Mac e iPhone.
3. Entrare negli approfondimenti Essenziale e Avanzato, verificando tabelle, formule composte, indice interno, esempi, esercizi e bibliografia.
4. Cambiare laboratorio mentre «Approfondisci» è aperto; il drawer deve chiudersi e non coprire il nuovo modulo.
5. Eseguire un ciclo Passo → Avvia/Pausa → Completa → Ricomincia sui laboratori 26–31; nessun autoplay e valori numerici invariati.
6. Su smartphone verificare guida inizialmente chiusa, grafici senza overflow orizzontale e tabella con scroll indipendente.
7. Provare ingrandimento SVG, esportazioni e cambio di tema. Se il collaudo non è completato, non pubblicare una release definitiva.

## Scelte progettuali e limiti scientifici

Le schede originali conservano formulazione, esempi, errori frequenti ed esercizi; i supplementi ampliano il perimetro metodologico ma **non equivalgono a una peer review delle singole dimostrazioni**. Restano quindi raccomandati audit scientifici approfonditi per ogni laboratorio, in particolare sulle condizioni di regolarità, sul significato delle distribuzioni asintotiche, sulla calibrazione dei test e sui casi degeneri. In una release didattica questi temi dovrebbero essere convalidati attraverso un ciclo di revisione da parte del docente.

## File modificati o creati

| Tipo | File |
|---|---|
| Nuovo | `src/core/pedagogy.js` · guida operativa specifica dei 31 laboratori |
| Nuovo | `src/core/pedagogy-theory.js` · approfondimenti Essenziale e Avanzato |
| Nuovo | `src/core/pedagogy-formulas.js` · 31 equazioni-cardine |
| Modificato | `src/core/app.js` · inserimento guida, chiusura pannelli e conferma stato R |
| Modificato | `src/core/ui.js` · struttura dei drawer e integrazione teoria |
| Modificato | `src/styles/editorial.css` · stili responsive guida e supplementi |
| Modificato | `build.py` · ordine di inclusione |
| Modificato | `README.md`, `CHANGELOG.md` · documentazione |
| Nuovo | `tests/test_pedagogy.js`, `tests/test_pedagogy_browser.py` · test strutturali e browser opzionale |
| Rigenerato | `index.html` · applicazione offline |

## Esecuzione e rollback

```bash
python3 build.py
node tests/test_pedagogy.js
for f in tests/test_*.js; do node "$f"; done
```

Lo ZIP originale `statatlas_lab31.zip` resta la baseline di rollback. In alternativa si possono rimuovere i nuovi `pedagogy*.js`, le relative voci in `build.py` e i riferimenti applicativi e ricostruire l’HTML, senza alterare i motori numerici.
