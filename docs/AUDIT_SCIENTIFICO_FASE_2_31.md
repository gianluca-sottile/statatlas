# StatAtlas 2.1 — Audit scientifico, fase 2: tracciabilità e confronto controllato

**Data:** 15 novembre 2026  
**Baseline:** `StatAtlas_2_1_Challenges_Corretto.zip` (31 laboratori, 93 Challenges).  
**Stato:** controllo indipendente di 31 identità matematiche, audit metodologico dei confronti nelle Challenges, regressioni software. **Non** costituisce una peer review completa di ogni teorema e prova nei 31 capitoli.

## 1. Che cosa è stato cambiato

1. Nuovo `tests/test_science_independent_31.py`: 31 controlli matematici indipendenti dai moduli JavaScript, uno per laboratorio. I test specificano le condizioni sotto le quali vale l'identità verificata. Dipendono da NumPy e SciPy **soltanto nell'ambiente di test**, non nell'applicazione offline.
2. Le Challenges avanzate distinguono ora un confronto **controllato** (almeno due passi con due valori diversi del parametro scelto, a parità degli altri controlli registrati) da un confronto **esplorativo/confuso** (altri controlli variati insieme). **Non è un nuovo vincolo bloccante**: alcune modifiche di scenario cambiano legittimamente i controlli disponibili. La segnalazione avverte che non si può attribuire l'effetto al solo parametro indicato.
3. Le 28 descrizioni delle Challenges avanzate invitano esplicitamente a mantenere fissi gli altri parametri e il seed, quando possibile.
4. Corretta una stringa in `src/core/challenges.js`: il pulsante «Aggiorna punto di partenza» non invita più a cambiare *sensori* in tutti i laboratori; il testo sui sensori resta esclusivo del kriging.
5. `src/core/pedagogy-formulas.js`: la funzione indicatrice nella *check loss* della regressione quantilica è resa come **1 in grassetto con pedice** invece dell'ambigua scrittura `1(u<0)`.
6. Test di regressione nuovi: coppia controllata/non controllata nelle 28 Challenges avanzate (`tests/test_challenges_full.js`), composizione dell'indicatrice (`tests/test_pedagogy.js`), verifica end-to-end nel boosting (`tests/test_challenges_quality_browser.py`).

**Non modificati:** i 31 sorgenti numerici `src/labs/*.js`, generatori casuali, algoritmi di stima, motori geostatistici, codici di verifica R e semantica di avvio manuale nei laboratori spaziali. Non sono state introdotte nuove dipendenze runtime.

## 2. Matrice di 31 verifiche matematiche indipendenti

Il risultato "OK" significa che una proprietà testabile è coerente con la definizione matematica *nel caso e sotto le ipotesi indicate*. Non attesta ogni risultato del laboratorio, la generalità asintotica di un teorema o la correttezza di ogni riferimento bibliografico.

| Lab | Proprietà verificata indipendentemente | Ipotesi e perimetro della verifica | Stato |
|---:|---|---|---|
| 01 | Ripartizione discreta e inclusione degli estremi | Legge discreta con probabilità note | OK |
| 02 | Varianza condizionata come complemento di Schur | Normale bivariata con covarianza definita positiva | OK |
| 03 | Quantile generalizzato discreto e decomposizione di Rao–Blackwell | Uniforme e variabili integrabili di esempio | OK |
| 04 | Stabilità delle medie Cauchy via funzione caratteristica; normalizzazione gaussiana | Campioni iid delle due leggi | OK |
| 05 | Valore atteso k−1 della statistica di Pearson | Multinomiale con probabilità note, nessuna stima di parametri | OK |
| 06 | Identità MSE = varianza + distorsione quadratica | Stimatore discreto con secondo momento | OK |
| 07 | Identità di Bartlett per score Bernoulli | p interno a (0,1), modello regolare | OK |
| 08 | Copertura esatta di Wald (n=20, p=0,1) inferiore al nominale; pivot t | Binomiale e normale iid con varianza ignota | OK |
| 09 | Potenza del test Z bilaterale con entrambe le code | Varianza conosciuta, statistica normalmente distribuita | OK |
| 10 | Proiezione OLS idempotente e intervallo predittivo più largo | Disegno di rango pieno, errori omoschedastici | OK |
| 11 | Convessità di |r|^p per p≥1 e sua perdita con 0<p<1 | Loss scalare | OK |
| 12 | Score della log-verosimiglianza logistica contro differenze finite | Bernoulli, regressori e coefficienti finiti | OK |
| 13 | Varianza stazionaria AR(1), autocorrelazione MA(1) | Rumore bianco e parametri nei domini considerati | OK |
| 14 | Minimo della check loss in corrispondenza del quantile empirico | Campione finito e τ fissato | OK |
| 15 | Soft threshold lasso e condizioni KKT | Disegno ortonormale, convenzione ½RSS+λL1 | OK |
| 16 | Simmetria del smoother e riduzione dei gradi di libertà effettivi | Penalità quadratica DᵀD semidefinita | OK |
| 17 | Profilo piatto e non-identificabilità di ψ quando δ=0 | Dati esattamente lineari, regressione a cerniera | OK |
| 18 | Ottimismo da minimo di errori CV rumorosi; pesatura fold | Due stime normali indipendenti; fold diseguali | OK |
| 19 | Variazione del vicino più prossimo al cambiare delle scale | Distanza euclidea su dati bidimensionali | OK |
| 20 | Varianza dell'ensemble sotto equicorrelazione | B predittori con varianza e correlazione comuni | OK |
| 21 | Pseudo-residuo y−sigmoid(F) per log-loss binaria | F su scala logit, y in {0,1} | OK |
| 22 | Gradiente backprop contro differenze finite | Rete piccola con tanh e loss quadratica | OK |
| 23 | SVD, autovalori e migliore ricostruzione di rango 1 | Matrice centrata e SVD non degenere | OK |
| 24 | Non aumento della somma dei quadrati in un passo di Lloyd | Gruppi non vuoti, distanze euclidee | OK |
| 25 | Distinzione core, border e noise | Vicinato incluso nel conteggio minPts | OK |
| 26 | E(I) = −1/(n−1) per Moran su tutte le permutazioni | Matrice W con diagonale nulla, S0>0 e varianza positiva | OK |
| 27 | Somma di Moran locali = S0 × Moran globale | Stessi pesi e stessa normalizzazione m2 | OK |
| 28 | K(r)=πr² per CSR e fattore translation rettangolare | Poisson omogeneo nel piano e finestra unitaria | OK |
| 29 | Range pratico 95% ≃ 2,996φ per covarianza esponenziale | Covarianza stazionaria esponenziale senza trend | OK |
| 30 | Varianza SK non crescente con un sensore in più; pesi OK sommano a 1 | Covarianza nota e definita positiva, target latente | OK |
| 31 | Moltiplicatore SAR, impatto totale e log-Jacobiano | W standardizzata per riga, ρ nel dominio invertibile | OK |

## 3. Cosa non è ancora certificato

Per non confondere la copertura di una suite di test con una revisione matematica esaustiva, restano **aperti** i seguenti controlli di alto livello:

- **01–08:** tutti i casi limite delle distribuzioni supportate; stima dei parametri nei test di adattamento; regolarità e Bartlett per l'intero catalogo dei modelli di Fisher; coperture per ogni intervallo implementato.
- **09–17:** accuratezza delle procedure asintotiche in campioni piccoli; comportamento e convergenza degli ottimizzatori Lp/GLM/lasso; differenze delle matrici smoother; bootstrap e identificazione del breakpoint non regolare.
- **18–25:** protocollo nested CV, ottimismo da iperparametri, consistenza dei metodi non parametrici, out-of-bag dopo tuning, boosting multinomiale/non equivalente ai pacchetti esterni, gradienti presso non differenziabilità ReLU, autospazi PCA ripetuti e cluster di bordo DBSCAN.
- **26–31:** isole nei pesi spaziali, dipendenza dei p-value LISA sotto BH, envelope globali per point patterns, nugget e anisotropia su domini irregolari, incertezza sui parametri del variogramma nel kriging, ottimizzazione continua SAR/SEM e scelta dell'obiettivo di spatial CV.

Queste attività non risultano "fallite": semplicemente **non sono coperte** dalle 31 prove indipendenti. L'audit bibliografico pagina-per-pagina e la peer review di tutte le dimostrazioni non sono stati completati.

## 4. Challenges: qualità dell'evidenza sperimentale

Per i 28 laboratori non pilota, il livello **Applicazione** continua a verificare un parametro pertinente modificato e due nuovi passi sotto il suo valore aggiornato. Il livello **Avanzato** richiede due configurazioni del parametro e cinque passi, ma fornisce anche un giudizio distinto sulla **comparabilità** dei due esperimenti:

- **Controllato:** esistono almeno due passi con valori diversi del parametro-obiettivo e con gli altri controlli registrati uguali.
- **Esplorativo:** il confronto ha coinvolto anche altri controlli o una modifica di scenario che cambia il pannello. La risposta può ancora essere completata, ma lo studente riceve una nota metodologica sulla non isolabilità dell'effetto.

La verifica del software non equivale a inferenza causale e la comparabilità dei controlli non dimostra l'uguaglianza delle realizzazioni casuali sottostanti. Il seed deve essere mantenuto fisso quando il laboratorio lo consente e lo scopo è confrontare lo stesso campione. Nessuna Challenge raccoglie dati personali o comunica con server.

## 5. Test eseguiti e riproduzione

```
python3 build.py
python3 tests/test_science_independent_31.py
node tests/test_challenges_full.js
node tests/test_pedagogy.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_quality_browser.py
python3 tests/test_challenges_targeted_browser.py 0 10
python3 tests/test_challenges_targeted_browser.py 10 19
python3 tests/test_challenges_targeted_browser.py 19 28
python3 tests/test_challenges_browser.py
python3 tests/test_mobile_tablet.py
```

- **31/31** test scientifici indipendenti: PASS.
- **19/19** suite JavaScript: PASS.
- **994** controlli di gating delle Challenges: PASS.
- **84/84** percorsi completi delle Challenges estese in Chromium: PASS; nove sfide pilota verificate mediante la suite preesistente e i collaudi del loro pannello.
- Controllo Chromium della distinzione confronto controllato/esplorativo nel GBM: PASS.
- Responsive 31/31 ai viewport 320, 390, 768 e 1024 px: PASS.
- **Verifica R di questa fase:** non rieseguita. Le procedure statistiche sono inalterate rispetto ai batch confermati dall'autore.

`NumPy` e `SciPy` servono soltanto per eseguire lo script scientifico indipendente. La pagina HTML continua a essere un file unico senza dipendenze runtime.

## 6. Criterio di passaggio alla fase successiva

Prima di dichiarare concluso l'audit scientifico completo, occorre associare a ciascun teorema del pannello Avanzato: ipotesi, prova o riferimento preciso, scenario simulato, confronto numerico indipendente, controesempio e verifica finale del docente responsabile. Il presente documento è un passo **tracciabile e ripetibile** verso quel livello, non una sua sostituzione.

## 7. Verifica continua su GitHub

Il workflow `.github/workflows/scientific-qa.yml` esegue build, tutte le suite JavaScript, 31 controlli indipendenti e le verifiche matematiche selezionate dopo push/PR. È **predisposto, non eseguito su GitHub in questa sessione**: verificarne il primo run nella scheda *Actions* del repository dopo la pubblicazione. Non include R, Safari o i test browser reali, che restano verifiche complementari.

Per la stessa suite in locale (Node e Python con NumPy/SciPy): `sh tests/run_qa_2_1.sh`.
