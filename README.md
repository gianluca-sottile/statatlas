<p align="center">
  <img src="assets/logo.svg" width="112" alt="Logo di StatAtlas">
</p>

<h1 align="center">StatAtlas</h1>

<p align="center"><em>Vedere la statistica mentre accade.</em></p>

<p align="center">
  Atlante interattivo di probabilità, inferenza, modelli statistici, machine learning e statistica spaziale.<br>
  <strong>31 laboratori · 93 sfide · 31 script R · un solo file HTML utilizzabile offline.</strong>
</p>

<p align="center">
  <a href="https://gianluca-sottile.github.io/statatlas/"><strong>Apri StatAtlas</strong></a>
  · <a href="#i-laboratori">Laboratori</a>
  · <a href="#integrazione-con-from-data-to-models-with-r">Corso R</a>
  · <a href="#riproducibilita-e-validazione-in-r">R e verifiche</a>
  · <a href="#sviluppo-e-test">Sviluppo</a>
</p>

<p align="center">
  <img alt="Versione corrente del ramo main" src="https://img.shields.io/badge/ramo_main-2.1-9A3412">
  <img alt="Lingua" src="https://img.shields.io/badge/lingua-italiano-1C1B19">
  <img alt="HTML autonomo" src="https://img.shields.io/badge/runtime-offline-1F6F43">
  <img alt="Licenze" src="https://img.shields.io/badge/licenze-MIT%20%2B%20CC%20BY%204.0-6B3E8A">
</p>

> **Stato del progetto — novembre 2026.** Il codice del ramo `main` comprende le Macrofasi **A** (audit scientifico, QA e validazione R 31/31) e **B** (collegamento curricolare con il corso R). La Macrofase **C** (inglese e accessibilità) è successiva. La numerazione del codice 2.1 non implica necessariamente la presenza di un nuovo tag GitHub o una validazione didattica già condotta con studenti.

## Che cos'è StatAtlas

StatAtlas è un ambiente di insegnamento *esperienziale*: lo studente formula una previsione, modifica i parametri di un esperimento, osserva le realizzazioni e interpreta i risultati confrontandoli con proprietà teoriche, ipotesi e possibili fallimenti. Non si limita a visualizzare formule né richiede un server o un account.

- **31 laboratori in otto parti**, dalle distribuzioni alla geostatistica, con pannelli *Essenziale*, *Avanzato*, *Esercizi* e *Bibliografia*.
- **93 Challenges** (Comprensione, Applicazione, Avanzato): richiedono attività sperimentali effettive e risposte interpretative; gli indicatori A/B rimangono descrittivi dove non esistono repliche indipendenti.
- **Esperimenti riproducibili** con seed controllato, esportazione R, dati CSV e grafici PNG dove previsti.
- **Macrofase B:** 62 collegamenti a 29 lezioni selezionate di *From Data to Models with R*, una sequenza operativa per laboratorio, 31 schede studente scaricabili e guida docente. I collegamenti possono essere diretti oppure propedeutici.
- **Offline:** `index.html` contiene i sorgenti compilati in HTML/CSS/JavaScript, senza librerie JavaScript da scaricare. I collegamenti alle lezioni esterne richiedono connessione.

![StatAtlas: esperienza didattica desktop](docs/MACROFASE_B_DESKTOP.png)

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

## Come funziona un laboratorio

Il percorso didattico standard comprende una **domanda iniziale**, una **previsione facoltativa**, un **esperimento controllato**, il **confronto tra risultati simulati e teoria**, l'**interpretazione**, gli **approfondimenti** e il modulo **Riproduci in R**. La guida «Come usare il laboratorio» accompagna l'esperimento; la modalità «Mettiti alla prova» offre tre sfide per laboratorio.

### Velocità delle simulazioni (aggiornamento 2.1)

Nei **25 laboratori con animazione temporizzata (01–25)** la velocità si imposta con un cursore **0–100, a incrementi di 1, con valore iniziale 25** all'apertura di ciascun laboratorio.

- Il numero è un **indice di velocità**, non una percentuale delle osservazioni o del tempo totale. Il valore 0 rappresenta il ritmo minimo, non equivale a «Pausa».
- La scala è continua nella conversione ai passi/secondo: valori indicativi **0 ≈ 2**, **25 ≈ 30**, **100 ≈ 1200** passi al secondo. La velocità effettiva dipende dal carico computazionale e dalla frequenza di aggiornamento del browser; è limitato il numero di passi per fotogramma per preservare la reattività.
- La regolazione agisce **durante** la simulazione; non cambia seed, distribuzioni, campioni, stime o script R. I comandi **Avvia/Pausa**, **Un passo**, **Completa** e **Ricomincia** restano disponibili.
- Nel laboratorio **15 (regressione penalizzata)** il cursore appare nella vista **Percorsi**, dove avvengono le repliche; non è necessario nella vista statica **Spazio delle soluzioni**.
- I **laboratori spaziali 26–31** sono mappe con aggiornamento immediato dopo le azioni sui punti e sui parametri, non animazioni temporizzate: non mostrano un cursore di velocità privo di effetto.

![Cursore velocità 0–100 con impostazione predefinita 25](docs/VELOCITA_CONTINUA_2_1.png)

Su desktop e smartphone la stessa impostazione iniziale è usata, con supporto touch e navigazione via tastiera (Spazio = avvia/pausa; freccia destra = un passo, fuori dai campi di input).

## Integrazione con From Data to Models with R

La **Macrofase B** collega le osservazioni interattive all'analisi statistica in R, senza trasformare StatAtlas in una dipendenza del sito del corso. Ogni laboratorio comprende un piccolo percorso *domanda → esperimento → verifica in R*, due rimandi alle lezioni pertinenti e una scheda Markdown scaricabile. Le corrispondenze sono suddivise in **15 allineamenti diretti** e **16 propedeutici**: in particolare i laboratori spaziali rimandano a prerequisiti e non sono dichiarati coperti integralmente dal corso.

Materiali disponibili:

- [Guida docente e rubriche didattiche](docs/MACROFASE_B_GUIDA_DOCENTE.md)
- [Mappatura completa laboratorio–lezione in CSV](docs/MACROFASE_B_MAPPATURA_CORSO.csv)
- [31 schede studente](docs/schede_studenti_B/)
- [Relazione della Macrofase B](docs/MACROFASE_B_RELAZIONE.md)
- [Stato dei benchmark R/JavaScript 01–25](docs/MACROFASE_B_PARITA_01_25.md)

L'integrazione **inversa** dal repository Quarto del corso a StatAtlas è una modifica separata, non inclusa nel repository attuale. Per visitare le lezioni online: [From Data to Models with R](https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/).

## Statistica spaziale: interfaccia unificata (26–31)

Ogni laboratorio spaziale usa **una sola mappa e un dataset corrente modificabile**. Dati e statistiche sono ricalcolati dalle osservazioni visualizzate; non vengono mantenute in parallelo le vecchie interfacce. Si possono esplorare Moran globale, quadranti LISA descrittivi, KDE e statistiche per processi puntuali, variogrammi, kriging e regressione spaziale. Le coordinate sono normalizzate, non longitudini/latitudini geografiche.

Le limitazioni metodologiche sono esplicitate: i quadranti LISA non sono p-value locali; la curva L(r)−r non costituisce da sola un test CSR; la superficie IDW illustrativa non fornisce una varianza di kriging; SAR/SEM non vengono adattati nell'interfaccia compatta del laboratorio 31. [Dettagli e QA scientifico](docs/PARTE_VIII_UNIFICATA.md).

## Riproducibilità e validazione in R

Il generatore pseudo-casuale di StatAtlas riproduce in JavaScript il **Mersenne–Twister** e l'inversione normale di R, entro le ipotesi documentate. Gli script esportati seguono i parametri correnti e sono formattati in righe brevi per evitare il limite della console R. La riproducibilità deve essere interpretata **laboratorio per laboratorio**:

| Livello | Obiettivo | Evidenza necessaria |
|---|---|---|
| **R0** | Stessi dati/seed | Confronto dei campioni e delle suddivisioni |
| **R1** | Stesse statistiche | Verifica numerica entro tolleranze definite |
| **R2** | Stesso algoritmo | Confronto di traiettorie, aggiornamenti e regole di parità |
| **R3** | Confronto di metodo | Differenze dichiarate fra implementazioni/librerie |

Nella Macrofase A e nel collaudo della Macrofase B sono stati eseguiti con successo i **31 script R estratti dal browser**, controllandone integrità, parsing e un invariante eseguibile per laboratorio. Sono disponibili confronti numerici indipendenti per sei laboratori spaziali su 12 snapshot. **I benchmark completi di equivalenza numerica R/JavaScript per i laboratori 01–25 non sono ancora certificati**: 31 esecuzioni riuscite non implicano parità algoritmica R2.

Dalla radice del repository, con GNU R e le dipendenze indicate dal validatore:

```bash
Rscript verifica/valida_tutti_31.R --timeout=900
```

Il validatore ricostruisce l'HTML, esporta i 31 script dal browser, ne verifica SHA e sintassi, li esegue separatamente e genera `verifica/REPORT_VALIDAZIONE_R_31.csv` e i log per laboratorio. **Dopo ogni modifica a `index.html` occorre rigenerare il report**, perché il gate di pubblicazione richiede lo stesso hash della build, anche quando non sono cambiati i calcoli statistici.

Le verifiche delle ipotesi e delle formule dei 31 laboratori sono documentate in [Audit formale teorico](docs/AUDIT_FORMALE_TEORICO_31.md), [Matrice delle verifiche della Macrofase A](docs/MACROFASE_A_MATRICE_VERIFICHE.csv) e [Relazione Macrofase A](docs/MACROFASE_A_RELAZIONE_2026_11_16.md). Queste verifiche non sostituiscono la revisione bibliografica dei teoremi avanzati.

### Numerosità campionaria in probabilità e inferenza (aggiornamento post-B)

Nei laboratori **01–09**, dove il parametro rappresenta la numerosità delle osservazioni o di ciascun campione, la scelta ora comprende **10, 100, 1.000, 10.000 e 100.000**. Nel laboratorio 04 la scala si applica sia alle osservazioni per traiettoria della legge dei grandi numeri, sia alla dimensione *n* di ciascun campione del TCL.

**Attenzione: n/N non è B/M.** In 06–09 il selettore di *n* riguarda la numerosità del singolo campione; il numero di repliche resta indipendente e configurabile. In 01–03 e 05, *N* è il totale delle osservazioni/estrazioni generate. I valori elevati possono allungare l'esperimento: il comando *Completa* nei laboratori con runner condiviso lavora per blocchi annullabili, mentre il laboratorio 06 usa un completamento cooperativo. I grafici più pesanti mostrano un sottoinsieme limitato di punti, **ma calcolano le statistiche sull'intero campione**.

Due casi speciali, dichiarati esplicitamente: nel **LAB 09**, per n ≥ 10.000, si simula direttamente la distribuzione **esatta** della statistica Z sotto normalità, senza generare esplicitamente 2n osservazioni per replica (anche lo script R adotta lo stesso algoritmo). Nel **LAB 05**, per N > 10.000 il bootstrap parametrico interattivo è disabilitato per evitare blocchi del browser; istogramma, QQ plot e test asintotico restano disponibili. Una simulazione con n = 100.000 e migliaia di repliche può comunque richiedere tempi significativi, soprattutto per MLE e modelli non normali. Nel **LAB 08** la copertura per binomiale e Poisson è calcolata sulla regione dei conteggi sufficienti tramite CDF, anche nell'esportazione R, evitando scansioni di n o centinaia di migliaia di campioni. Per i quantili χ² con almeno 10.000 gradi di libertà il browser utilizza la trasformazione numerica di Wilson–Hilferty, confrontata con SciPy fino a n = 100.000; le formule inferenziali restano quelle previste dai metodi, mentre la loro valutazione numerica adotta questa approssimazione ad alti gradi di libertà.

## Utilizzo online e offline

- **Online:** [StatAtlas su GitHub Pages](https://gianluca-sottile.github.io/statatlas/).
- **Offline:** scarica il file `index.html` dalla [radice del repository](https://github.com/gianluca-sottile/statatlas) e aprilo con un browser moderno. I contenuti dell'atlante restano disponibili senza rete, mentre i link al corso R richiedono Internet.
- **In aula:** proietta l'esperimento, chiedi una previsione agli studenti e confronta gli esiti con la teoria. Le schede della Macrofase B sono utilizzabili anche separatamente dal browser.

## Sviluppo e test

Il frontend utilizza **HTML, CSS e JavaScript nativi**, senza framework, backend o database. `build.py` incorpora i moduli in `src/core/`, i 31 file di `src/labs/` e i fogli di stile nell'unico `index.html`. I test di sviluppo utilizzano Node.js, Python con NumPy/SciPy, Playwright/Chromium e GNU R; **non sono dipendenze necessarie per usare il sito**.

```bash
python3 build.py
for f in tests/test_*.js; do node "$f" || exit 1; done
python3 tests/test_speed_slider_browser.py   # controllo velocità 25 lab, mobile + desktop
python3 tests/test_sample_sizes_browser.py    # n = 10, 100, 1000, 10000, 100000 nei lab 01-09
python3 tests/test_large_sample_coverage.py    # 15 confronti indipendenti SciPy per la copertura
python3 tests/test_mobile_tablet.py           # 31 lab, quattro larghezze
```

Per il collaudo integrato della build corrente (GNU R, pacchetti e Playwright presenti):

```bash
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_B.sh > COLLAUDO_2_1.log 2>&1
echo "Codice di uscita: $?"
```

Per preparare la pubblicazione senza commit o push, dopo aver validato **la build corrente**:

```bash
sh scripts/pubblica_github.sh --no-push
```

Il push effettivo va eseguito solo dopo aver esaminato l'anteprima. Il workflow [StatAtlas QA](.github/workflows/scientific-qa.yml) è ora **leggero su ogni push/PR**: esegue soltanto build e test JavaScript, senza installare NumPy, SciPy, Chromium o GNU R. Le modifiche limitate a documentazione e immagini non attivano il workflow. I controlli scientifici indipendenti e i browser test completi sono disponibili con **Actions → StatAtlas QA → Run workflow**. Il collaudo sostanziale e il gate R 31/31 restano obbligatori **in locale prima del push**. Questa scelta riduce il tempo di CI, non la dimensione o il tempo di download del sito GitHub Pages. [Cronologia delle modifiche](CHANGELOG.md).

## Roadmap e limitazioni

- **Macrofase A:** audit teorico, correzioni, UI responsive, 31 esecuzioni R e verifiche scientifiche; pubblicata.
- **Macrofase B:** collegamento con il corso R, schede studente/guida docente, test e validazione delle esportazioni; pubblicata sul ramo principale.
- **Macrofase C:** internazionalizzazione inglese, accessibilità e consolidamento finale; non ancora svolta.
- **Attività scientifiche residue:** benchmark numerici JS/R per i lab 01–25, riferimenti primari per alcuni teoremi avanzati e collegamenti inversi nel corso Quarto separato.
- **Validazione didattica con studenti:** programmata dopo il completamento del repository; non è una misura già disponibile della sua efficacia formativa.

## Citazione, crediti e licenze

**Autore:** Gianluca Sottile, Università degli Studi di Palermo. Per citare il codice pubblicato della versione corrente indicare il repository e, preferibilmente, il commit consultato; i metadati [CITATION.cff](CITATION.cff) rimangono riferiti alla release taggata precedente finché non sarà aggiornato il tag ufficiale.

> Sottile, G. (2026). *StatAtlas: un atlante interattivo di probabilità, inferenza, machine learning e statistica spaziale*. Repository GitHub: https://github.com/gianluca-sottile/statatlas

Le idee di presentazione della simulazione sono anche ispirate a [Simul2000 di Marcello Chiodi](https://github.com/marcellochiodi/simul2000). Sorgenti, testi e illustrazioni di StatAtlas sono originali.

- **Software:** [licenza MIT](LICENSE).
- **Materiali didattici:** [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/deed.it).
