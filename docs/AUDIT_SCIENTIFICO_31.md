# StatAtlas — Audit scientifico dei 31 laboratori

**Stato:** prima tornata documentata (screening trasversale completo; revisione matematica mirata dei laboratori 08, 18, 30).  
**Baseline:** archivio `StatAtlas_2.0.0_GitHub.zip` fornito e ricostruito nella sessione del 14/11/2026.  
**Ambito di questa tornata:** struttura dei contenuti, correttezza e campo di validità delle formule-cardine, confronto tra spiegazioni ed esperimenti, prototipo Challenges in tre laboratori.  
**Esclusioni:** non si dichiara dimostrata l'intera teoria di 31 moduli né rieseguita in questa sessione l'intera verifica numerica R. Le verifiche R delle versioni precedenti erano state confermate dall'autore.

## 1. Esito e evidenze

- `tests/audit_science.js` indicizza **31/31** laboratori, con **131 obiettivi**, **104 esercizi**, **116 riferimenti** e **31 guide operative** (quattro passi per laboratorio).
- La matrice riproducibile `docs/AUDIT_31_MATRICE.csv` documenta presenze e dimensioni minime degli approfondimenti editoriali; non misura la correttezza delle dimostrazioni.
- **31/31 equazioni-cardine** sono presenti; **14** hanno ora una nota esplicita sulle ipotesi o sulla portata, per evitare generalizzazioni non lecite.
- I sorgenti che calcolano le statistiche, i modelli e le simulazioni restano **identici**, salvo tre piccoli adattatori di lettura dello stato (`challengeState`) nei laboratori 08, 18, 30. Le sfide non intervengono sul generatore casuale.

## 2. Risultati scientifici verificati o corretti

### F-01 · P0 · Copertura degli intervalli: affermazione universalmente falsa [corretto]

**Sorgente:** `src/core/pedagogy-formulas.js`, voce `intervalli`.  
**Problema:** `P_θ(θ ∈ C(X)) ≥ 1−α` non è vera per tutti i metodi del laboratorio: Wald e Wilson possono sottocoprire. Si trattava di un'identità riassuntiva posta nel pannello Avanzato, quindi con rischio di indurre una conclusione scorretta.  
**Correzione effettuata:** sostituita dalla definizione della funzione di copertura `Cov_θ(C)=P_θ{θ∈C(X)}` e precisata la differenza tra copertura nominale, esatta e asintotica.  
**Riscontro indipendente:** per Wald binomiale, n=20, p=0,1, intervallo nominale 95%, la somma esatta della probabilità di copertura è **0,8760372560**; è in accordo con l'esempio del file `src/core/content.js`.

### F-02 · P1 · Normale bivariata standardizzata [contestualizzato]

**Sorgente:** equazione-cardine `bivariata`.  
`Var(Y|X=x)=1−ρ²` non vale per una legge congiunta arbitraria: richiede una normale bivariata con varianze marginali unitarie. È stata aggiunta la condizione al pannello Avanzato.

### F-03 · P1 · Autocovarianza AR(1) [contestualizzato]

**Sorgente:** equazione-cardine `arma`.  
`γ(h)=σ² φ^{|h|}/(1−φ²)` è l'autocovarianza di un **AR(1) stazionario** con innovazioni di varianza σ². Non è la formula di un ARMA generico; ora è indicato esplicitamente.

### F-04 · P1 · Kriging semplice e ordinario [contestualizzato]

**Sorgente:** equazione-cardine `kriging` e teoria del laboratorio 30.  
La forma `w=C^{-1}c` si riferisce al **simple kriging con media nota**. L'ordinary kriging impone in più `1ᵀw=1` e risolve un sistema vincolato. La teoria del laboratorio già distingue i due casi; il nuovo richiamo rende coerente la formula-cardine.

### F-05 · P1 · Funzione K sotto CSR [contestualizzato]

**Sorgente:** equazione-cardine `processi-puntuali`.  
`K(r)=πr²` vale per Poisson omogeneo piano, non per qualunque processo puntuale. L'envelope Monte Carlo e l'interpretazione degli scostamenti richiedono la dichiarazione esplicita del modello nullo.

### F-06 · P1 · Ipotesi nascoste nelle altre formule [contestualizzato]

Le formule-cardine relative a Fisher, TCL, OLS, lasso, CV, Moran, Moran locale, variogramma e SAR hanno ricevuto annotazioni specifiche sulle condizioni di applicazione (regolarità, varianza finita, rango, convenzione sui fold, pesi spaziali, stazionarietà). Le annotazioni non sostituiscono le dimostrazioni presenti nelle schede.

## 3. Revisione approfondita del prototipo (08 / 18 / 30)

### LAB 08 · Intervalli di confidenza

**Controllato:** intervallo t esatto sotto normalità e indipendenza, degenerazione dell'intervallo Wald quando la proporzione campionaria è zero, mancanza di garanzia di copertura conservativa per Wilson, confronto tra copertura nominale/vera/osservata. La formula usata dal codice per `E(s)` sotto normalità corrisponde al momento della distribuzione chi.  
**Limiti da mantenere visibili:** per Poisson la somma nella routine `exactCoverage()` è troncata a una coda estremamente remota (esattezza entro precisione numerica, non una somma letteralmente infinita); le differenze osservate in 100 repliche sono soggette a errore Monte Carlo.  
**Sfide pilota:** t / interpretazione frequentista, Wald / degenerazione, Wilson / copertura approssimata.

### LAB 18 · Validazione e overfitting

**Controllato:** distinzione training–CV–test e protocollo di tuning senza uso del test, polinomi annidati costruiti in base di Legendre, rischio condizionato al modello tramite `σ²` più media del quadrato degli errori rispetto alla funzione vera.  
**Limite da esplicitare in successive revisioni:** la media del quadrato degli errori sulla griglia di 200 punti è un'approssimazione deterministica dell'integrale su X uniforme, non un'identità esatta con il rischio continuo. La CV stima il rischio relativo a una specifica numerosità di training e la scelta del minimo comporta ottimismo da selezione.  
**Sfide pilota:** overfitting, separazione tuning/test, misspecificazione della classe di modelli.

### LAB 30 · Kriging

**Controllato:** distinzione tra campo latente e misura rumorosa; simple vs ordinary kriging, non aumento della varianza predittiva ottima quando si aggiunge un sensore sotto il modello fissato, differenza tra varianza teorica e RMSE realizzato su una mappa, specificazione del range, IDW senza varianza modellistica.  
**Limiti da mantenere visibili:** i parametri della covarianza sono assunti noti; la media delle varianze è un criterio integrato approssimato sulla griglia e non equivale a un ottimo globale dell'intera rete di sensori.  
**Sfide pilota:** sensore aggiuntivo, IDW, specificazione errata del range.

## 4. Matrice dei 31 approfondimenti: prossima prova matematica necessaria

La priorità indica **dove indirizzare la prossima revisione**, non un giudizio automatico di errore. “Screening” significa che è stata verificata la presenza dei contenuti, la formula riassuntiva e il legame con il tema; “mirato” significa che, in questa sessione, sono stati esaminati anche i dettagli indicati nella sezione 3.

| Lab | Stato | Priorità | Verifica scientifica/integrazione successiva |
|---|---|---|---|
| 01 Distribuzioni | Screening | P1 | Precisare domini dei parametri, momenti non esistenti e condizioni delle approssimazioni asintotiche; verificare tutte le 17 leggi. |
| 02 Bivariata | Screening + F-02 | P1 | Separare proprietà generali della correlazione da quelle specifiche della normale bivariata e dai modelli non lineari. |
| 03 Simulazione | Screening | P1 | Dimostrare proprietà dell'inversione e ipotesi di applicabilità delle tecniche di riduzione della varianza. |
| 04 LGN/TCL | Screening + F-06 | P0 | Distinguere convergenza in probabilità/quasi certa/distribuzione; CLT con varianza finita e controesempio di Cauchy. |
| 05 Adattamento | Screening | P0 | Derivare gradi di libertà del test chi-quadrato con parametri stimati; calibrazione bootstrap e vincoli sulle classi. |
| 06 Stimatori | Screening | P1 | Verificare formule finite-campione, robustezza e stime sotto Cauchy; distinguere consistenza da efficienza. |
| 07 Fisher | Screening + F-06 | P0 | Controllare per ciascuno dei 10 modelli regolarità, identità di Bartlett e coperture Wald/LR. |
| 08 Intervalli | Mirato + F-01 | P0 | Estendere la verifica per ogni metodo e ai bordi, inclusa copertura discreta e troncamento numerico Poisson. |
| 09 Test e potenza | Screening | P1 | Confrontare formule esatte e approssimazioni della potenza, scelte unilaterali/bilaterali e calcolo di n. |
| 10 Regressione OLS | Screening + F-06 | P1 | Dimostrare intervalli per media e previsione, assunzioni su errori e limiti in presenza di leverage/influenza. |
| 11 Regressione Lp | Screening | P1 | Qualificare convessità, unicità e condizioni di efficienza/robustezza per diversi p. |
| 12 GLM | Screening | P0 | Verificare score, informazione, IRLS e separazione logistica; precisare quando Wald fallisce. |
| 13 ARMA | Screening + F-03 | P1 | Dimostrare gamma(h) per AR(1) e distinguere esplicitamente ACF/PACF dei diversi ARMA. |
| 14 Quantilica | Screening | P1 | Verificare la perdita check, i subgradienti e condizioni sulla densità condizionale. |
| 15 Penalizzata | Screening + F-06 | P0 | Verificare KKT, scale di lambda, percorso lasso, standardizzazione e selezione CV. |
| 16 Spline/kernel | Screening | P1 | Controllare gradi di libertà effettivi, matrici smoother e differenze tra procedure. |
| 17 Segmentata | Screening | P0 | Distinguere il caso psi identificato da quello delta=0 e la validità dei bootstrap/test di cambiamento. |
| 18 Validazione | Mirato | P0 | Calibrazione del rischio su griglia, varianza della CV, nested CV e ottimismo da tuning. |
| 19 kNN | Screening | P1 | Verificare condizioni di consistenza e ruolo di k, distanza/scalatura e dimensione. |
| 20 Alberi/RF | Screening | P1 | Distinguere ipotesi sulla correlazione nell'identità di varianza, bootstrap e ottimismo OOB post-tuning. |
| 21 Boosting | Screening | P0 | Derivare pseudo-residui per log-loss e shrinkage; distinguere implementazione didattica da librerie esterne. |
| 22 Reti neurali | Screening | P0 | Confrontare backprop con differenze finite e descrivere effetti di inizializzazione/early stopping. |
| 23 PCA | Screening | P1 | SVD, errore di ricostruzione, indeterminazione del segno, autovalori multipli e stabilità dei sottospazi. |
| 24 K-means/Ward | Screening | P1 | Monotonia di Lloyd, convenzioni di Ward e criteri di confronto delle partizioni. |
| 25 DBSCAN | Screening | P1 | Distinguere invarianza del core e ordine dei punti di bordo contesi; cautela con silhouette senza rumore. |
| 26 Moran | Screening + F-06 | P0 | Dimostrare speranza sotto permutazione e verificare convenzioni su W/simmetria e trend. |
| 27 LISA/MAUP | Screening + F-06 | P0 | Verificare permutazioni condizionali, dipendenza e FDR; usare MAUP come modifica del problema. |
| 28 Processi puntuali | Screening + F-05 | P0 | Valutare effetti di bordo, test globale ed envelope puntuali, trend di intensità. |
| 29 Variogrammi | Screening + F-06 | P0 | Verificare validità dei modelli di covarianza, stazionarietà, anisotropia e sistemi quasi singolari. |
| 30 Kriging | Mirato + F-04 | P0 | Confermare numericamente tutti i casi simple/ordinary/IDW e i modelli misspecificati, con incertezza dei parametri esplicitamente esclusa. |
| 31 SAR/SEM/CV | Screening + F-06 | P0 | Verificare dominio di rho, Jacobiano della ML, effetti spaziali e target della spatial CV. |

## 5. Criteri per la revisione dimostrativa completa

Per passare da **screening** a **revisione dimostrativa**, per ciascun laboratorio occorrono: (1) enunciati e ipotesi precise; (2) derivazione matematica indipendente; (3) confronto di ogni quantità teorica con la simulazione; (4) controesempio o regime limite; (5) verifica numerica JS–R se viene toccato un algoritmo; (6) lettura bibliografica primaria con pagine/teoremi; (7) conferma finale dell'autore. Non dichiarare completa una voce sulla sola base di un testo lungo o di test strutturali.

## 6. StatAtlas Challenges · primo esperimento didattico

Tre laboratori pilota: **08, 18, 30**; nove sfide (tre per laboratorio: comprensione, applicazione, avanzato). Ciascuna sfida richiede uno stato verificabile del laboratorio e una risposta interpretativa; il sistema restituisce feedback immediato. La configurazione iniziale per le due sfide sui sensori viene registrata all'apertura della sfida. Il motore Challenges legge unicamente `challengeState()` e non modifica né avvia le simulazioni.

Limiti espliciti: nessuna valutazione linguistica automatica di risposte libere, nessuna persistenza o raccolta dei dati dello studente, nessuna pretesa di validazione psicometrica. Prima dell'estensione a 31 laboratori servono studio pilota, analisi dei tassi di riuscita e verifica con studenti.

## 7. Comandi di verifica

```bash
python3 build.py
node tests/audit_science.js
node tests/test_challenges.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_browser.py
python3 tests/test_mobile_tablet.py
```

**Nota:** l'output dei test attestato qui riguarda JavaScript e Chromium. I confronti R restano quelli della baseline, riferiti dall'autore: i nuovi interventi non richiedono rigenerazione numerica R, perché non cambiano gli algoritmi delle simulazioni.
