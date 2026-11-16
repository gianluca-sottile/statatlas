<p align="center">
  <img src="assets/logo.svg" width="112" alt="Logo di StatAtlas">
</p>

<h1 align="center">StatAtlas</h1>

<p align="center">
  <em>Vedere la statistica mentre accade.</em><br>
  Un atlante interattivo di probabilità, inferenza, machine learning e statistica spaziale: 31 laboratori, simulazioni riproducibili in R e un unico file HTML utilizzabile anche offline.
</p>

<p align="center">
  <a href="https://gianluca-sottile.github.io/statatlas/"><strong>Apri StatAtlas →</strong></a>
  &nbsp;·&nbsp; <a href="#i-laboratori">Laboratori</a>
  &nbsp;·&nbsp; <a href="#come-è-fatto-un-laboratorio">Struttura</a>
  &nbsp;·&nbsp; <a href="#riproducibilità-in-r">Riproducibilità in R</a>
  &nbsp;·&nbsp; <a href="#sviluppo">Sviluppo</a>
</p>

<p align="center">
  <img alt="Versione" src="https://img.shields.io/badge/versione-2.1.0--rc-9A3412">
  <img alt="Lingua" src="https://img.shields.io/badge/lingua-italiano-1C1B19">
  <img alt="Offline" src="https://img.shields.io/badge/funziona-offline-1F6F43">
  <img alt="Dipendenze" src="https://img.shields.io/badge/dipendenze-nessuna-1E4E8C">
  <img alt="Licenza" src="https://img.shields.io/badge/licenza-MIT%20%2B%20CC%20BY%204.0-6B3E8A">
</p>

---

## Perché StatAtlas

Molti concetti della statistica — la legge dei grandi numeri, il teorema centrale, la copertura di un intervallo, la potenza di un test — sono affermazioni su **che cosa succede ripetendo un esperimento molte volte**. StatAtlas rende visibile proprio questo: ogni osservazione, ogni campione, ogni intervallo viene generato davanti allo studente, e il risultato si confronta passo dopo passo con ciò che la teoria garantisce.

- **Didattica attiva.** Ogni laboratorio parte da una domanda; chi vuole può fare una previsione *prima* di vedere i dati.
- **Rigore dichiarato.** Ogni risultato teorico è etichettato come *esatto*, *asintotico*, *approssimato* o *Monte Carlo*: non si confonde mai ciò che vale per ogni n con ciò che vale al limite.
- **Stessi numeri in R.** Il generatore di numeri casuali di R è reimplementato nel browser: lo script fornito, con lo stesso seed, riproduce gli stessi campioni. Ogni script dichiara fin dove arriva la corrispondenza (livelli R0–R3) e richiede la verifica eseguibile in R per ogni nuova versione. La riproducibilita a livelli R0-R3 dipende dal singolo laboratorio: il verificatore 31/31 controlla parsing ed esecuzione, mentre la parita numerica richiede confronti aggiuntivi per ogni algoritmo.
- **Due livelli di lettura.** Un pannello *Approfondisci* con teoria essenziale, derivazioni avanzate, esercizi con soluzione e bibliografia; formule composte tipograficamente e numerate, senza librerie esterne.
- **Nessuna installazione.** Un unico file `index.html`, che funziona anche offline. Nessun server, nessuna libreria esterna.

## Parte VIII — Sei laboratori unificati su mappe continue (sviluppo 2.1)

**I laboratori 26–31 hanno sostituito le vecchie interfacce.** Ciascuno mostra **una sola mappa, un solo pannello di parametri e un unico campione modificabile**. I vecchi esperimenti grafici, le loro duplicazioni e i controlli separati **non vengono più montati**. Gli algoritmi numerici condivisi restano nel progetto come sorgenti testabili, non come secondi laboratori. Gli script R della Parte VIII sono ora generati dai **punti effettivamente visualizzati**; dodici snapshot delle sei mappe (prima e dopo modifica) sono stati verificati nel collaudo su GNU R, JavaScript e Python.

- **26 — Moran:** modifica valori e posizioni, crea gruppi o alternanze e osserva l'indice globale calcolato sui punti con pesi kNN normalizzati. La heatmap non è il campione utilizzato per il calcolo.
- **27 — LISA:** aggiungi osservazioni alte/basse, individua HH, LL, HL e LH e osserva come cambiano al variare del vicinato. I quadranti sono **descrittivi**: questa interfaccia non stima p-value locali.
- **28 — Processi puntuali:** inserisci eventi singoli o gruppi e confronta KDE, distanza fra eventi e curva L(r)−r. Non sono calcolati envelope o test CSR.
- **29 — Variogrammi:** aggiungi e trascina sensori, osserva la semivarianza empirica per classi di distanza. La superficie IDW serve soltanto a comunicare visivamente la disposizione delle misure.
- **30 — Kriging:** aggiungi, rimuovi e sposta sensori sullo **stesso campo latente simulato**. La previsione e la varianza condizionale usano il motore numerico di kriging; il range è una ipotesi di covarianza, non una verità nota allo studente.
- **31 — Regressione spaziale:** modifica osservazioni dotate di risposta Y, covariata X e coordinate; confronta OLS `Y ~ X` e `Y ~ X + x + y`, R² e Moran dei residui. SAR e SEM sono spiegati nella teoria, **non** adattati dalla nuova interfaccia.

Le coordinate delle mappe sono **normalizzate sul quadrato unitario**, non longitudini e latitudini reali in gradi. Il confronto A/B usa due snapshot dello stesso dataset e non li presenta come repliche Monte Carlo indipendenti. Le 18 Challenges della Parte VIII sono state riscritte per i nuovi controlli; il progresso dei 31 laboratori resta di 93 sfide complessive.

Consulta [architettura, limiti scientifici, verifica dei dati e test](docs/PARTE_VIII_UNIFICATA.md). Il report di audit delle formule ed ipotesi e disponibile in [`docs/AUDIT_FORMALE_TEORICO_31.md`](docs/AUDIT_FORMALE_TEORICO_31.md).

## StatAtlas Challenges — 31 laboratori, 93 sfide (versione di sviluppo 2.1)

La modalità **«Mettiti alla prova»** è disponibile in **tutti i 31 laboratori**, con tre attività progressive per ciascuno: **Comprensione**, **Applicazione** e **Avanzato**. Ogni attività comprende un obiettivo operativo specifico, una domanda interpretativa a tre alternative e feedback metodologico. Le sfide non si completano semplicemente selezionando una risposta: richiedono esperimenti **eseguiti dopo l’apertura**; nei laboratori preesistenti i prerequisiti rimangono legati al relativo motore. Nelle sei lezioni della Parte VIII, invece, le condizioni sono specifiche per una mappa continua e per registrazioni di valori sul medesimo campione, senza ripetizioni artificiali. Il progresso è mostrato in tempo reale e un pulsante porta direttamente ai controlli. Le nove sfide pilota mantengono verifiche di stato specifiche.

**Novità: evidenze quantitative e protocollo A/B controllato (fase 2.1).** Dopo ogni passo, tutti i 31 laboratori possono registrare in sola lettura un indicatore o valore numerico proveniente dal loro vero stato sperimentale. Nelle sfide estese agli esperimenti originali non basta più il conteggio dei passi: per l'**Avanzato** è richiesta anche una risposta sul confronto empirico delle medie A/B/pari. Il confronto tra configurazioni è accettato solo quando gli altri controlli registrati rimangono costanti. Per il boosting (21) e le reti neurali (22) si richiedono tre checkpoint appaiati con dati e seed invariati, confrontando le stesse iterazioni; per gli altri 26 laboratori estesi il confronto resta descrittivo. Le iterazioni successive non sono repliche indipendenti, e non vengono costruiti p-value o intervalli ingiustificati. Consulta la [verifica conclusiva del protocollo A/B](docs/FASE_2_1_CONCLUSIVA_CONTROLLO_AB.md) e la [matrice delle 31 evidenze](docs/FASE_2_1_EVIDENZE_QUANTITATIVE_2026_11_15.md).

- Nei laboratori **08 e 18** rimangono i prerequisiti specialistici precedenti; le tre sfide del **30 — Kriging** sono state aggiornate alla nuova mappa unica (sensori, previsione, range).
- Nei **23 laboratori estesi non spaziali** i livelli Applicazione e Avanzato verificano un controllo pertinente e passi eseguiti sotto configurazioni effettive; nei **cinque laboratori spaziali estesi** richiedono osservazioni puntuali e, quando previsto, due snapshot sugli stessi dati. Per l'Avanzato l'esperimento viene **respinto** se cambiano anche altri controlli, con indicazione del parametro da mantenere fisso; il semplice tracciamento non prova la comprensione statistica. L'interpretazione resta valutata con una risposta a scelta motivata.
- Il punteggio è **formativo e temporaneo**, non viene salvato o inviato online. Non sono presenti certificazione dell'apprendimento, telemetria o valutazione psicometrica.
- Gli algoritmi già verificati in R non sono stati modificati. È stato aggiunto un tracciamento degli eventi del runner; il laboratorio 06 espone esclusivamente il conteggio delle repliche per le sfide.

La revisione delle schede **Essenziale e Avanzato** copre ora i **31 laboratori**, con trattazioni aggiuntive di ipotesi, derivazioni e casi limite specifici, integrate negli approfondimenti senza rimuovere il materiale preesistente. L'audit è documentato in [`docs/AUDIT_REVISIONE_31.md`](docs/AUDIT_REVISIONE_31.md). **La presenza di una derivazione non equivale a una verifica formale indipendente di ogni teorema o riferimento bibliografico**: i risultati non dimostrati integralmente rimangono soggetti a revisione specialistica.

Test rapidi della versione completa (i test scientifici indipendenti richiedono NumPy/SciPy, quelli browser Playwright/Chromium):

```bash
python3 build.py
node tests/audit_science.js
node tests/test_challenges_full.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_browser_full.py
```

## Esperienza mobile e tablet

L'interfaccia è adattata ai dispositivi touch senza modificare i motori numerici: sui tablet fino a 1180 px il menu dei laboratori è a scomparsa, mentre sui telefoni è disponibile una barra di navigazione rapida per tornare a **Parametri**, **Grafici**, **Risultati** e **Inizio**. I pulsanti **Avvia**, **Passo**, **Completa** e **Ricomincia** rimangono gli stessi degli esperimenti desktop e, sui dispositivi compatti, compaiono prima della lista dei parametri.

- **Grafici:** pulsante di ingrandimento con bersaglio touch 44 px; su telefono l'ingrandimento mostra un grafico largo e scorrevole orizzontalmente, con comando di chiusura sempre visibile.
- **Approfondimenti:** pannello a tutta larghezza su telefono, con le quattro schede distribuite su due righe e formule scorrevoli quando necessario.
- **Tabelle e codice R:** contenitori con scorrimento orizzontale indipendente; suggerimento visibile solo su telefono per le tabelle.
- **Accessibilità:** menu laterale con chiusura mediante Esc o tocco esterno, stato `aria-expanded`, gestione del focus e rispetto della preferenza di movimento ridotto.

Il bundle resta un singolo `index.html` funzionante senza rete. Per ripetere il collaudo browser (richiede Playwright e Chromium):

```bash
python3 build.py
python3 tests/test_mobile_tablet.py
```

Sono stati testati Chromium desktop emulando viewport da 320, 390, 768 e 1024 px; rimane opportuno un collaudo manuale su Safari iOS/iPadOS reale, incluse rotazioni e gesti tattili.

## I laboratori

| | Laboratorio | Che cosa si esplora |
|---|---|---|
| **I · Probabilità** | 01 · Distribuzioni e relazioni | 17 leggi, densità e ripartizione, banda DKW, superfici 3D, mappa dei legami tra leggi |
| | 02 · Variabili bivariate | Nuvola con marginali, densità 3D, leggi condizionate, il limite della correlazione |
| | 03 · Metodi di simulazione | Metodo di inversione, integrazione Monte Carlo, confronto delle varianze |
| **II · Campionamento** | 04 · Grandi numeri e limite centrale | Traiettorie della media, medie standardizzate, Berry–Esseen, il controesempio di Cauchy |
| | 05 · Adattamento di un modello | QQ plot con banda esatta, test X² con classi corrette, p-value Monte Carlo |
| **III · Inferenza** | 06 · Media, mediana e massima verosimiglianza | Efficienza e robustezza sugli stessi campioni (Normale, Laplace, Cauchy) |
| | 07 · Verosimiglianza e informazione di Fisher | Dieci modelli, identità di Bartlett, Cramér–Rao, Wald contro rapporto di verosimiglianza |
| | 08 · Intervalli di confidenza | Copertura nominale, esatta e osservata: Z, t, Wald, Wilson, Garwood, pivot χ² |
| | 09 · Test e potenza | Errore di primo tipo, curve di potenza, numerosità campionaria |
| **IV · Modelli** | 10 · Regressione interattiva | Punti trascinabili, leverage, distanza di Cook, banda per la media e intervallo di previsione |
| | 11 · Regressione L1, L2, Lp | Criteri di stima a confronto con errori a code pesanti e contaminati |
| | 12 · Modelli lineari generalizzati | Logistica e Poisson, IRLS, distorsione per n piccolo, separazione |
| | 13 · Serie temporali ARMA | ACF e PACF teoriche ed empiriche, radici, stazionarietà e invertibilità |
| **V · Regressione moderna** | 14 · Regressione quantilica | Rette per ogni quantile, perdita asimmetrica, soluzione esatta, punti trascinabili |
| | 15 · Ridge, lasso ed elastic net | Spazio delle soluzioni, percorsi di regolarizzazione, distorsione–varianza |
| | 16 · Regressione non parametrica e spline | Polinomi, spline, P-spline e kernel: basi, gradi di libertà effettivi, validazione incrociata |
| | 17 · Regressione segmentata e breakpoint | Profilo RSS(ψ), breakpoint non identificato, test bootstrap dell’esistenza del cambiamento |
| **VI · Apprendimento supervisionato** | 18 · Validazione e overfitting | Training, test e validazione incrociata a K fold, ottimismo della scelta sul test |
| | 19 · k vicini più prossimi | Frontiere di decisione, errore di Bayes e limite di Cover–Hart, scelta di k, standardizzazione |
| | 20 · Alberi, bagging e random forest | Instabilità di un albero, bootstrap ed errore out-of-bag, decorrelazione con mtry |
| | 21 · Gradient boosting | Alberi sequenziali su residui e pseudo-residui, shrinkage, perdita e early stopping |
| | 22 · Reti neurali e backpropagation | Rete 2–H–1, forward pass, backpropagation e gradient checking |
| **VII · Riduzione dimensionale e clustering** | 23 · Componenti principali | Assi di massima varianza, scree plot, biplot, ricostruzione, stabilità degli assi (asintotica di Anderson) |
| | 24 · k-means e clustering gerarchico | Lloyd passo dopo passo, minimi locali e riavvii, dendrogrammi e legami, indice di Rand corretto |
| | 25 · DBSCAN e confronto tra metodi | Core, bordo e rumore, k-distanze e scelta di ε, lune e cerchi contro k-means e Ward |
| **VIII · Statistica spaziale** | 26 · Autocorrelazione spaziale e Moran | Punti modificabili, heatmap e Moran globale con vicini kNN |
| | 27 · Autocorrelazione locale, hotspot e MAUP | Quadranti LISA descrittivi HH/LL/HL/LH su mappa continua; limiti inferenziali in teoria |
| | 28 · Processi puntuali spaziali | Eventi inseribili e trascinabili, KDE e curva descrittiva L(r)−r |
| | 29 · Variogrammi e campi aleatori spaziali | Sensori modificabili, semivarianze empiriche per classi e superficie IDW illustrativa |
| | 30 · Kriging e disegno dei sensori | Un solo campo fissato, ordinary kriging, sensori e varianza condizionale |
| | 31 · Regressione spaziale e validazione geografica | Punti modificabili, OLS Y~X contro Y~X+coordinate; SAR/SEM introdotti in teoria |

## Come è fatto un laboratorio

Ogni laboratorio segue la stessa sequenza, così lo studente impara un’unica interfaccia:

1. **Domanda** — un problema concreto da cui partire, con una *previsione facoltativa*: chi vuole mettersi alla prova annota che cosa si aspetta e riceve un riscontro a simulazione avanzata.
2. **Esperimento** — una guida specifica «Come usare il laboratorio» propone quattro mosse; controlli per seed, numerosità e velocità, avvio, pausa e un passo alla volta. Un riquadro spiega *che cosa stiamo valutando*.
3. **Teoria e simulazione a confronto** — una tabella con il valore teorico, quello simulato e la natura del risultato.
4. **Interpretazione** — che cosa significa, quando vale, dove si rompe.
5. **Approfondisci** — Essenziale · Avanzato · Esercizi · Bibliografia.
6. **Codice R** — uno script R che si aggiorna con i parametri scelti; si copia o si scarica.

I dati e le figure si esportano in CSV e PNG.

## Riproducibilità in R

StatAtlas implementa in JavaScript il generatore **Mersenne-Twister** di R, inclusa la procedura di inizializzazione del seed (*scrambling*) di `set.seed()`, e il metodo di **inversione** usato da `rnorm()`. Le altre leggi sono generate come `q*(runif(n), …)`, cioè per inversione della funzione di ripartizione. Di conseguenza, con R ≥ 4.1 e le impostazioni predefinite (`RNGkind("Mersenne-Twister", "Inversion")`):

```r
set.seed(2026)
runif(3)   # gli stessi tre numeri che StatAtlas genera con seed 2026
```

### Livelli di riproducibilità

| Livello | Che cosa coincide | Esempi |
|---|---|---|
| **R0** · stessi dati | Stesso seed, stessi campioni, stesse suddivisioni training/test e fold, stessi campioni bootstrap | tutti i laboratori |
| **R1** · stesse misure | Stesse stime ed errori, a meno dell’arrotondamento | `prcomp` nel lab 23, `lm` con `poly()` nel lab 18 |
| **R2** · stesso algoritmo | Stessi passi e stesse regole nei casi di parità | CART e foreste del lab 20, boosting didattico del lab 21, DBSCAN del lab 25, discesa del gradiente del lab 22, `kmeans(algorithm = "Lloyd")` |
| **R3** · confronto di metodo | Pacchetti che seguono regole diverse: risultati vicini, non identici | `segmented`, `ranger`, `class::knn`, `dbscan`, `nnet` |

Gli script richiedono R ≥ 4.1 e il pacchetto `tidyverse`; alcuni laboratori usano solo funzioni di base di R (`persp`, `glm`, `arima`), i laboratori 14 e 15 anche `quantreg` e `glmnet`, il 17 `segmented`. Anche la suddivisione training/test e i fold del laboratorio 18 coincidono con quelli di R (`sample()`, R ≥ 3.6).

## Uso

- **Online:** apri il sito pubblicato con GitHub Pages.
- **Offline:** scarica `index.html` e aprilo con un browser recente (Chrome, Edge, Firefox, Safari). Funziona anche senza connessione.
- **In aula:** il tema scuro si attiva dalla barra laterale; i grafici si ingrandiscono con la finestra del browser. Tastiera: <kbd>Spazio</kbd> avvia o mette in pausa, <kbd>→</kbd> esegue un passo.

## Sviluppo

StatAtlas (sviluppo 2.1) usa **HTML, CSS e JavaScript nativi**, senza dipendenze obbligatorie a runtime. Il codice modulare in `src/` è assemblato da `build.py` nell'unico file distribuibile `index.html`. La struttura comprende 31 file in `src/labs/`, il motore numerico in `src/core/`, i componenti didattici condivisi, le verifiche JS in `tests/` e i riferimenti R in `verifica/`.

```bash
python3 build.py                         # rigenera il file offline index.html
for f in tests/test_*.js; do node "$f" || exit 1; done  # suite numerica/editoriale
```

Per gli smoke test che richiedono jsdom, installare le dipendenze **solo nell'ambiente di sviluppo** (non servono agli utenti del sito):

```bash
npm install --no-save jsdom
node tests/smoke/smoke_fase7.js index.html
```

Per ripetere i test responsive è necessario Python con Playwright e Chromium disponibili localmente:

```bash
python3 tests/test_mobile_tablet.py
```

### Verifiche indipendenti in R

Gli script R sono raccolti nella directory `verifica/`. **Per validare in un solo comando i 31 script esportati dalla pagina attuale**, lancia dalla radice del progetto (GNU R e dipendenze R installati, Python Playwright+Chromium disponibili):

```bash
Rscript verifica/valida_tutti_31.R --timeout=900 > MACROFASE_A_R31.log 2>&1
echo "Codice di uscita: $?"
```

Il verificatore ricompila `index.html`, estrae dal browser i 31 script R correnti, controlla SHA-256/MD5, verifica il parsing, esegue separatamente ognuno dei 31 script in GNU R e salva report e log per ogni laboratorio. Non sono ammessi SKIP tra i PASS. Richiede i pacchetti R `tidyverse`, `quantreg`, `segmented` e `cluster`; in caso di pacchetti mancanti, il report indica come installarli. I file di output sono `verifica/REPORT_VALIDAZIONE_R_31.csv` e `verifica/runs/`. **La sola esecuzione non dimostra la parita numerica R/JS dei laboratori 01-25.** Il report matematico descrive il perimetro dell'audit, le correzioni e le limitazioni.

Il master storico comprende i confronti precedenti e richiama le verifiche autonome dei moduli aggiunti. Le verifiche indipendenti dei nuovi metodi si possono anche eseguire singolarmente:

```bash
Rscript verifica/verifica_statatlas.R
Rscript verifica/verifica_gradient_boosting.R
Rscript verifica/verifica_moran.R
Rscript verifica/verifica_lisa.R
Rscript verifica/verifica_processi_puntuali.R
Rscript verifica/verifica_variogrammi.R
Rscript verifica/verifica_kriging.R
Rscript verifica/verifica_regressione_spaziale.R
```

**Stato al 14 novembre 2026:** l'autore ha confermato in R le verifiche del gradient boosting (lab 21) e dei sei laboratori spaziali (26–31); le verifiche storiche sono documentate nel progetto. I calcoli JavaScript e i laboratori non sono stati modificati per questa preparazione di release. Restano raccomandate prove manuali su Safari iOS/iPadOS fisici, in particolare gesti touch, rotazione e download.

### Comportamento delle simulazioni spaziali

Nei laboratori **26–31** i dati e i grafici sono disponibili all'apertura, ma le simulazioni Monte Carlo **non partono automaticamente**. I comandi Avvia, Passo e Completa sono espliciti. Le modifiche strutturali invalidano i risultati non più comparabili; quelle di sola visualizzazione o inferenza conservano le repliche ancora valide, secondo le regole di ciascun esperimento.

Per la storia delle modifiche, consultare [CHANGELOG.md](CHANGELOG.md). Per gli audit tecnici e responsive: [`docs/AUDIT_UI_TEORIA_31.md`](docs/AUDIT_UI_TEORIA_31.md) e [`docs/AUDIT_RESPONSIVE_31.md`](docs/AUDIT_RESPONSIVE_31.md).

## Come citare

> Sottile G. (2026). *StatAtlas: un atlante interattivo di probabilità, inferenza, machine learning e statistica spaziale* (versione 2.0.0, ultima release pubblicata; per la versione 2.1 usare la citazione del relativo tag quando disponibile). https://github.com/gianluca-sottile/statatlas

## Crediti

Progetto di **Gianluca Sottile**, Università degli Studi di Palermo.

Diversi laboratori traggono ispirazione dalle idee didattiche di **Simul2000** di Marcello Chiodi (Università di Palermo), in particolare l’attenzione al processo di simulazione osservabile. Codice, testi e illustrazioni di StatAtlas sono originali.

## Licenza

- **Codice** (file `.js`, `.css`, `.html`, `.py`): [licenza MIT](LICENSE).
- **Contenuti didattici** (testi, esercizi, illustrazioni): [Creative Commons Attribuzione 4.0 Internazionale (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.it).

Puoi usare, modificare e ridistribuire StatAtlas, anche nei tuoi corsi, citando l’autore.

### Audit scientifico indipendente — fase 2 (sviluppo 2.1)

I 31 laboratori sono accompagnati da una **batteria indipendente di 31 controlli matematici**, uno per argomento, nel file `tests/test_science_independent_31.py`. La suite verifica identità e condizioni definite; non costituisce una certificazione di tutti i teoremi o riferimenti. La sua esecuzione richiede **NumPy e SciPy soltanto in fase di test**, senza cambiare le dipendenze del file HTML offline.

```bash
python3 tests/test_science_independent_31.py
node tests/test_challenges_full.js
```

Nelle Challenges avanzate, un confronto che cambia solo il parametro-obiettivo viene distinto da un confronto *esplorativo*, dove variano anche altri controlli. L'avvertimento didattico non blocca la risposta. Dettagli, matrice dei 31 controlli, assunzioni ed esclusioni: [`docs/AUDIT_SCIENTIFICO_FASE_2_31.md`](docs/AUDIT_SCIENTIFICO_FASE_2_31.md).

La suite può essere lanciata con `sh tests/run_qa_2_1.sh`; il workflow `.github/workflows/scientific-qa.yml` ripete gli stessi controlli numerici e scientifici sui push e sulle pull request. I collaudi browser e R restano separati e richiedono i rispettivi ambienti.

## Codice R: esportazione e console

Gli script prodotti da **Riproduci in R** sono formattati su righe brevi, compatibili con la console R. Il codice mostrato, copiato e scaricato coincide. Per script lunghi preferire **Scarica .R** e l'esecuzione tramite Source in RStudio. I controlli automatici della lunghezza delle righe coprono i 31 laboratori; la CI verifica anche il parsing con GNU R. Dettagli in `docs/R_EXPORT_CONSOLE_AUDIT.md`.

## Macrofase A — consolidamento 2.1 (candidato di collaudo)

Le verifiche scientifiche e responsive 2.1, comprese le correzioni di navigazione
mobile e del ripristino delle mappe, sono documentate in
[`docs/MACROFASE_A_RELAZIONE_2026_11_16.md`](docs/MACROFASE_A_RELAZIONE_2026_11_16.md).

Il collaudo riproducibile si avvia con `sh tests/run_macrofase_A.sh --require-r`
(dopo avere installato Node.js, Python/NumPy/SciPy/Playwright/Chromium e GNU R).
La presenza di 31 esportazioni R brevi e sintatticamente valide **non** equivale
alla certificazione di esecuzione e concordanza numerica R dei 31 laboratori.
Non interpretare la versione di sviluppo 2.1 come release finale certificata.

### Audit formale e pubblicazione 2.1

- [`docs/AUDIT_FORMALE_TEORICO_31.md`](docs/AUDIT_FORMALE_TEORICO_31.md): assunzioni, dimostrazioni/derivazioni, controesempi e rettifiche di tutte le 31 schede.
- [`docs/RELEASE_CANDIDATE_A_2_1.md`](docs/RELEASE_CANDIDATE_A_2_1.md): protocollo di accettazione, evidenze ancora richieste e stato delle fasi B e C.
- `sh scripts/pubblica_github.sh --no-push` verifica la pronta pubblicazione senza toccare il repository remoto; `sh scripts/pubblica_github.sh` pubblica **solo dopo** che il report R 31/31 passa ed e stato validato dall'autore. Non eseguire push se la validazione non e completa.
