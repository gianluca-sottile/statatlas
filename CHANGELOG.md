## StatAtlas 2.1 — navigazione delle Challenges e allineamento dei prerequisiti (sviluppo, 15 novembre 2026)

- Collegamento **Mettiti alla prova** accanto ad **Approfondisci** nella testata di ciascuno dei 31 laboratori; indicatore locale `0/3` aggiornato dopo il completamento.
- Collegamento contestuale **Torna alla sfida** nel pannello dei controlli, visibile dopo l’uso di **Vai ai controlli**, con gestione del focus e preferenze di movimento ridotto.
- Migliorato l’allineamento di nove coppie di prerequisiti sperimentali alle rispettive domande (dimensione del campione, alberi, standardizzazione, differenza tra zonizzazioni, anisotropia, ecc.). Le nove sfide pilota mantengono le condizioni specialistiche.
- Corrette tre formulazioni teoriche nei LAB 05, 07 e 08: bootstrap parametrico non esatto in generale, condizioni di regolarità per Fisher/Cramér–Rao/Wilks, e distinzione fra copertura garantita e nominale dei metodi approssimati.
- Nessuna modifica a generatori, stimatori, funzioni numeriche o script R; i soli sorgenti LAB modificati contengono modifiche testuali. Il controllo browser è distinto dalla validazione scientifica.

# Changelog

## Unreleased — 2.1: audit scientifico indipendente e comparabilità delle Challenges (15/11/2026)

- Nuova suite `tests/test_science_independent_31.py`: 31 verifiche matematiche indipendenti dai motori JavaScript, una per ciascun laboratorio, con ipotesi e perimetro esplicitati.
- Le Challenges avanzate ora distinguono **confronti controllati** (cambia solo il parametro-obiettivo fra i controlli registrati) da confronti **esplorativi** (cambiano anche altri fattori). L'avviso è metodologico, non blocca il completamento.
- Istruzioni didattiche aggiornate per incoraggiare il mantenimento degli altri parametri e del seed; corretto il messaggio del pulsante «Aggiorna punto di partenza» al di fuori del kriging.
- Formula tipografica della check loss quantilica aggiornata: indicatrice esplicita al posto di `1(u<0)`.
- Nuovi test di regressione per la comparabilità delle sfide (28 casi controllati e 28 confusi), formula quantilica e ciclo completo in Chromium sul gradient boosting.
- Documentazione tracciabile in `docs/AUDIT_SCIENTIFICO_FASE_2_31.md` e workflow GitHub Actions per build, test JS e verifiche scientifiche indipendenti. **Non** sono stati modificati generatori, algoritmi o sorgenti dei 31 laboratori; test NumPy/SciPy opzionali solo per sviluppo.

## Unreleased — 2.1: correzioni Challenges e condizioni sperimentali verificabili (15/11/2026)

- Corretto il tracciamento dei cambiamenti dei parametri: gestione degli eventi in **capture phase**, prima che le lezioni possano ricostruire il pannello controlli. Il bug era riproducibile in Gradient Boosting.
- Aggiunto lo stato di avanzamento **in tempo reale** per ogni sfida: passi dopo l'apertura, modifiche riconosciute e prerequisiti ancora da soddisfare.
- Le **84 Challenges non pilota** sono ora collegate a controlli specifici del rispettivo laboratorio: a livello Applicazione si richiede una modifica del parametro pertinente seguita da almeno due passi; a livello Avanzato il confronto fra due configurazioni realmente eseguite e almeno cinque passi complessivi.
- Regola speciale per regressione penalizzata: le repliche si eseguono nella vista **Percorsi**, non nella vista geometrica.
- La vista delle sfide comprende un collegamento rapido **Vai ai controlli**, utilizzabile anche su mobile.
- Aggiunti test delle regole specifiche e collaudi Chromium sulle 84 sfide. Nessuna modifica a RNG, stimatori o algoritmi statistici; soltanto una chiamata al nuovo registratore di attività nel LAB 06.
- I nove esercizi pilota di Intervalli, Validazione e Kriging mantengono le regole specifiche originarie.

## Unreleased — 2.1 (sviluppo): Challenges e revisione dei 31 laboratori

- Estesa «Mettiti alla prova» a **31/31 laboratori**, per **93 sfide**: tre livelli, quesiti e feedback specifici per ogni metodo; prerequisiti basati su esperimento realmente eseguito.
- Conservate le nove regole specialistiche dei LAB 08, 18 e 30; nelle nuove 84 sfide sono verificati il tracciamento di passi e modifiche ai controlli effettuati dopo l'apertura.
- Revisione editoriale e metodologica dei pannelli **Essenziale e Avanzato** su tutti i 31 moduli: ipotesi esplicite, derivazioni, casi limite ed esperimenti mirati, senza sostituire le schede precedenti.
- Nessuna modifica a RNG, formule, algoritmi di stima e simulazione. Tracciamento delle azioni nell'interfaccia e contatore aggiuntivo delle repliche nel LAB 06.
- Nuovi test unitari delle 93 sfide e test browser per tutti i laboratori; audit e matrice scientifica aggiornati.
- Questa è una **versione di lavoro**, non una nuova pubblicazione ufficiale o una certificazione formale della teoria.

## Unreleased — Challenges pilota e prima tranche di audit scientifico

- Modalità **Mettiti alla prova** nei laboratori 08, 18 e 30: nove sfide con prerequisiti verificati sullo stato reale dell'esperimento, feedback e progresso locale non persistente.
- Prima matrice di audit dei 31 laboratori, con priorità della successiva revisione dimostrativa; approfondimento metodologico mirato ai laboratori 08, 18 e 30.
- Correzione della formula-cardine sulla copertura degli intervalli; note sulle ipotesi o sulla specificità di altre 13 identità.
- Algoritmi di simulazione, RNG e calcolo invariati; aggiunte soltanto tre interfacce di lettura dello stato delle lezioni pilota.
- Questa è una **versione di sviluppo** e non cambia il numero ufficiale di versione 2.0.0 né i metadati di citazione.

## 2.0.0 — 14/11/2026 · StatAtlas: 31 laboratori e nuova esperienza didattica

**Release maggiore:** estensione dell'atlante a 31 laboratori in otto parti, con contenuti metodologici più approfonditi e interfaccia ottimizzata per desktop, smartphone e tablet.

### Nuovi laboratori e organizzazione

- **Parte VI — Apprendimento supervisionato:** introdotto il laboratorio 21 sul gradient boosting; reti neurali collocate nella stessa parte come laboratorio 22, accanto a kNN, alberi decisionali, bagging e random forest.
- **Parte VII — Riduzione dimensionale e clustering:** PCA (23), k-means e clustering gerarchico (24), DBSCAN (25).
- **Parte VIII — Statistica spaziale:** nuovi laboratori 26–31 su Moran globale, LISA/hotspot/MAUP, processi puntuali, variogrammi, kriging e regressione spaziale con validazione geografica.
- Preservati gli identificativi pubblici dei laboratori per la compatibilità con i collegamenti già esistenti.

### Teoria e usabilità

- Aggiunta la guida contestuale espandibile **«Come usare il laboratorio»** a tutti e 31 gli esperimenti.
- Ampliate le sezioni **Essenziale** e **Avanzato**, affiancate da esercizi, bibliografia e formule-cardine.
- Migliorata l'esperienza touch: navigazione rapida su telefono, menu a scomparsa sui tablet, pulsanti di simulazione prioritari, zoom sui grafici e scorrimento di tabelle e formule.
- Nei laboratori spaziali le simulazioni Monte Carlo partono solo mediante comando esplicito, senza autoplay all'apertura o dopo la modifica dei controlli.

### Test e riproducibilità

- Conservato il funzionamento **offline** in un unico `index.html`, generato con `python3 build.py`.
- Estesi test numerici JavaScript, smoke test browser e verifiche indipendenti R per i nuovi moduli.
- Confermata dall'autore l'esecuzione delle verifiche R per gradient boosting e laboratori spaziali 26–31. I componenti di calcolo non sono stati modificati dalla revisione responsive o dalla preparazione della release.
- Rimane consigliato il collaudo manuale su Safari iOS/iPadOS fisici.

### Documentazione e pubblicazione

- Aggiornati README, versione e citazione alla 2.0.0, descrizione HTML, metadati di citazione, note e istruzioni di pubblicazione su GitHub.
- I dettagli cronologici dei singoli batch sono conservati sotto come **archivio storico**: eventuali indicazioni «in sviluppo» o «da verificare» riflettono il loro stato al momento della scrittura, non lo stato della release 2.0.0.

---

## Archivio delle fasi di sviluppo precedenti alla release 2.0.0

## Responsive mobile/tablet · ergonomia e accessibilità (2026-11-14)

- Interfaccia adattata a smartphone e tablet: menu laterale a scomparsa anche su tablet, backdrop, Escape, gestione focus/inert e chiusura alla navigazione.
- Barra fissa di accesso rapido a Parametri, Grafici, Risultati e Inizio su display compatti, senza duplicare alcun comando o stato della simulazione.
- Avvia/Passo/Completa/Ricomincia posizionati prima dei parametri sui display compatti; pulsanti, selettori, slider e zoom con bersagli touch maggiorati.
- Zoom mobile dei grafici con larghezza leggibile, pan orizzontale e chiusura sempre visibile. Tabelle, codice R, formule e schede teoriche adattati allo scorrimento e all'uso a una mano.
- Homepage, testate, copertine e selettori adattati alle larghezze tablet/telefono, con rispetto di reduced motion e safe areas.
- Nessuna modifica ai 31 file dei laboratori né agli algoritmi. Nuova suite Playwright `tests/test_mobile_tablet.py`, testata a 320/390/768/1024 px su tutti i laboratori; test numerici preesistenti invariati.
- Restano da verificare manualmente touch e rotazione su Safari iOS/iPadOS fisico.

## Audit trasversale · guida, accessibilità e approfondimenti (2026-11-14)

- Guida «Come usare il laboratorio» implementata centralmente per tutti e 31 i moduli, con quattro azioni specifiche, pannello espandibile e stessa impaginazione responsive; rimosse in fase di rendering le guide locali duplicate.
- Estesi i due livelli delle schede per ogni laboratorio con supplementi autonomi e 31 equazioni-cardine su interpretazione statistica, assunzioni, risultati matematici, identificazione e limiti di validità. Conservati esempi ed esercizi preesistenti.
- Resettata la scheda «Approfondisci» al livello Essenziale quando aperta da un nuovo laboratorio; migliorata la struttura tipografica e la leggibilità su mobile.
- Separati contenuti supplementari (`pedagogy.js`, `pedagogy-theory.js`) dagli algoritmi numerici, rimasti invariati; nuova suite di integrità editoriale automatizzata.
- Riconciliato il README sul numero effettivo di laboratori (31); confermata dall’autore l’esecuzione dei riferimenti R dei lab 26–31.
- Il browser Chromium del presente ambiente applica una policy di blocco degli URL locali: i collaudi visivi automatici non sono dichiarati riusciti. Sono inclusi test browser ripetibili su una macchina non soggetta al blocco.

## Batch 7 — Laboratorio 31: Regressione spaziale e validazione geografica (2026-11-14)

- Aggiunto laboratorio 31 (Parte VIII) con confronto OLS/SAR/SEM, profili di log-verosimiglianza gaussiani e impatti SAR.
- Nuovo motore numerico indipendente dall'interfaccia: DGP SAR/SEM, matrice rook, stima ML su griglia e kNN con random CV / spatial block CV.
- Copertina SVG originale, approfondimenti Essenziale e Avanzato, previsione, quattro grafici, tabella e codice R scaricabile.
- Controlli Monte Carlo esclusivamente manuali, nessun autoplay all'apertura o dopo le modifiche.
- Test numerici e confronto R predisposti per cinque scenari; esito R da certificare esternamente.

## Batch 6 — Laboratorio 30: Kriging e disegno dei sensori (2026-11-14)

- Kriging semplice e ordinario, IDW, varianza di predizione latente e corretta gestione del nugget osservazionale.
- Interfaccia per aggiungere, spostare, rimuovere e selezionare sensori a campo generatore fisso; opzione per svelare il campo.
- Superficie stimata, mappa delle varianze, errore osservato e verifica Monte Carlo della calibrazione.
- Apertura e cambi di parametri senza autoplay. Teoria e controlli grafici nello standard StatAtlas.
- Cinque scenari indipendenti R1 in R base predisposti per verifica esterna.

## Batch 5 — LAB 29 e correzione autoplay LAB 26–28 (14/11/2026)
- Disabilitato l'avvio automatico delle simulazioni all'apertura dei laboratori 26, 27 e 28, mantenendo immediate mappe, grafici e tabelle.
- I controlli di simulazione restano esclusivamente manuali (Avvia, Passo, Completa, Ricomincia); rimosse le indicazioni obsolete di autoplay nelle guide.
- LAB 29 — Variogrammi e campi aleatori: nucleo geostatistico, tre modelli di covarianza, anisotropia e nugget, selezione di coppie, repliche su siti fissi; teoria essenziale e avanzata, esportazioni e reference R.
- Verifiche: 78 nuovi test JS, smoke Chromium su quattro laboratori, generatore/verifica R1 per quattro scenari (R da verificare esternamente).
- Il laboratorio 29 non prevede ancora kriging: resta oggetto del LAB 30.

## Correzione batch 4 · Lab 26–28, controllo Monte Carlo e verifica R (14/11/2026)
- Riparato il confronto opzionale `spatstat.explore::Kest()` del LAB 28: `r=c(0,rr)` sia nello script R indipendente sia nel generatore JavaScript e nello script R esportato dal browser; la curva didattica continua a utilizzare gli stessi 20 raggi positivi.
- Rimossa la chiamata `runner.set(true)` dai callback di riconfigurazione dei LAB 26–28: la simulazione parte automaticamente soltanto al primo ingresso e si avvia di nuovo solo su richiesta esplicita.
- Le modifiche strutturali aggiornano grafici e statistiche ma lasciano fermo il Monte Carlo; gli aggiornamenti di inferenza/presentazione e di B preservano le repliche compatibili, anche in caso di riduzione e successivo aumento di B.
- Aggiunto lo smoke test Chromium `tests/smoke/smoke_spatial_controls.py` per verificare avvio iniziale, assenza di riavvii impliciti e conservazione delle repliche.
- Formule del motore statistico, generatori dei dati e stime K/Moran/LISA invariati.

## In sviluppo — Batch 4 · LAB 28, processi puntuali (14/11/2026)
- Nuova lezione con modelli Poisson omogeneo e non omogeneo, Thomas e inibizione sequenziale.
- K/L di Ripley con correzione translation; envelope puntuale e test Monte Carlo globale condizionati su n.
- Copertina SVG, obiettivi, previsione, guida, tabella, approfondimenti, CSV/PNG e codice R.
- JS e Chromium testati; **verifica R reale da eseguire** prima del rilascio definitivo.

## Batch 3 — LAB 27: LISA, hotspot e MAUP (14/11/2026)

- Aggiunta lezione 27 con copertina SVG, obiettivi, previsione facoltativa con tre risposte, esperimento guidato, quattro grafici e otto righe di tabella.
- Nuovo motore `spatial-local.js`: indicatori Moran locali, permutazione condizionale, p-value, BH/BY e aggregazione spaziale.
- Esperimenti su hotspot, outlier locali, rumore indipendente, scacchiera, trend, SAR; MAUP su 64, 16 o 4 unità e zonizzazione alternativa.
- Verifica R dedicata `verifica_lisa.R`, generatore di riferimenti JS e collegamento al master R; verifica **in R da eseguire**, nessun esito inventato.
- Aggiunti test numerici e smoke test browser reale, mantenendo la compatibilità con i laboratori 01–26.

## In sviluppo — Correzione UI Batch 2 · LAB 26 Moran (14/11/2026)
- Corretto blocco JavaScript iniziale: `speed: 5` non era valido per il runner con quattro velocità (0–3). Il montaggio ora si conclude e ripristina grafici, tabella, copertina SVG, obiettivi e dettagli didattici.
- Migliorata la previsione espandibile con tre scelte, aggiunte istruzioni operative, avvio automatico delle permutazioni, stato della cella selezionata e KPI di Moran e p-value.
- Aggiunto test Chromium/Playwright che attraversa interazioni, drawer, tema e navigazione; il test mock-DOM ora intercetta velocità fuori dominio.
- Formule e algoritmi spaziali, motore di simulazione e codice R **non sono stati modificati**.

## In sviluppo — Batch 2 · Parte VIII, motore spaziale e LAB 26 (non rilasciato)
- `core/spatial.js`: griglie, vicinati rook/queen/per distanza, pesi binari/row-standardized, lag spaziale e validazione delle strutture.
- `core/spatial-areal.js`: Moran I, speranza permutazionale, permutazioni riproducibili e processi generatori (blocchi, alternanza, i.i.d., trend e SAR).
- `labs/26-moran.js`: mappe con celle selezionabili, Moran scatterplot, test permutazionale animato, esportazioni e codice R del campione corrente; Essenziale e Avanzato, esempi ed esercizi.
- Catalogo e navigazione: ottava parte e mappa con otto parti su due righe da quattro colonne, link pubblici esistenti mantenuti.
- `tests/test_spatial_core.js`, `tests/test_spatial_areal.js`, `tests/test_moran_mount.js` e `tests/gen_moran_reference.js`; `verifica/verifica_moran.R` integrato in master e generatore.
- Stato dei gate: JS verificato; R e QA browser reale da verificare prima del rilascio.

## In sviluppo — Batch 1 · Parte VI e gradient boosting (non rilasciato)
- Spostamento delle reti neurali nella Parte VI, subito dopo il nuovo gradient boosting, mantenendo gli ID pubblici per compatibilità degli URL.
- Parte VI: laboratori 18–22; Parte VII: 23–25 (PCA, clustering, DBSCAN); la futura Parte VIII sarà dedicata alla statistica spaziale.
- Nuovo LAB 21: boosting di primo ordine con alberi di regressione, loss quadratica e logistica, visualizzazione di pseudo-residui, training/validation/test indipendenti, early stopping e script R integrato.
- Nuovo `core/boost.js` senza modificare il CART di classificazione esistente; test numerici `test_boost.js` e verifica R autonoma per tre scenari.
- Da completare prima di un rilascio: esecuzione R reale e collaudo browser su dispositivi reali; implementazione dei sei laboratori spaziali e approfondimenti Essenziale/Avanzato estesi.

## Versioni precedenti alla 2.0.0

## 1.14.0 — 13/11/2026 · formule tipografiche e nuovo formato delle schede
- **`src/core/math.js`**: compositore di formule senza librerie esterne (sottoinsieme di LaTeX: frazioni, radici, sommatorie e operatori con limiti, apici e pedici impilati, accenti, greco, funzioni in tondo, delimitatori alti). Le formule in evidenza si scrivono con `data-tex`, sono numerate per scheda e richiamabili con `<a data-eqref>`.
- **41 formule ricomposte** nelle schede Essenziale e Avanzato dei 24 laboratori; aggiunte le formule mancanti nei lab 20 (impurità di Gini e riduzione, varianza della media di alberi correlati) e 23 (intorno ε e punti core).
- **Schede**: indice interno «In questa scheda» quando le sezioni sono almeno quattro; riquadri con intestazione (`.box.def`, `.box.thm`, `.box.ex`, `.box.nota`); l’esempio svolto è in un riquadro; gli avvisi portano l’etichetta «Attenzione».
- **Home**: nuovo blocco «Come leggere i risultati» (esatto, asintotico, approssimato, Monte Carlo) e «Che cosa riproduce lo script R» (livelli R0–R3); testi aggiornati (non più «esattamente lo stesso esperimento»).
- **README**: tabella dei livelli di riproducibilità, descrizione e struttura aggiornate.
- Correzioni dopo la prima prova a schermo: radice disegnata in SVG che si allunga con il radicando e si unisce alla barra; barra di frazione estesa a tutta la larghezza; ± con spaziatura da operatore; spaziatura ridotta degli operatori nei pedici (t<sub>n−2</sub>); cifre sempre diritte; parentesi e graffe \left … \right più alte.
- Rifiniture: singolare «prima componente» nel lab 21; numeri in notazione scientifica con la virgola nei lab 21 e 24.

## 1.13.0 — 13/11/2026 · laboratori 17–24 verificati in R
- La verifica in R dell’utente (`verifica_statatlas.R`) supera tutti i 48 controlli: generatore, esecuzione dei 24 script e confronti numerici dei lab 17–24. Tolte le etichette «Anteprima · script R da verificare».
- Nuovo `verifica/verifica_statatlas_01_16.R` (generato da `tests/gen_verifica_R_01_16.js`): confronti numerici anche per i lab 01–16 (momenti campionari, correlazioni, coperture, potenza, stime di regressione, GLM, autocorrelazioni, regressione quantilica, soluzione lasso, distorsione e varianza delle spline).
- Verifica dei lab 01–16 eseguita dall’utente: tutti i confronti coincidono (corretto nel generatore il confronto del lab 08, che leggeva la copertura esatta invece di quella osservata).
- L’estrattore registra ora tutte le colonne delle tabelle e i riquadri numerici, e usa «Completa» anche nel lab 06.

## 1.12.2 — 13/11/2026 · correzioni dopo la prima verifica in R
- **Ingrandimento dei grafici** riscritto: il riquadro viene spostato in una finestra sopra la pagina (non esce più dallo schermo, scorre al suo interno), si chiude con ✕, Esc, clic fuori o cambio di pagina, e lo scorrimento della pagina torna sempre disponibile; i grafici restano aggiornati dal vivo.
- **Pulsanti di avvio**: il pulsante principale ha larghezza stabile (non deforma più il riquadro dei controlli); a simulazione finita diventa «Riavvia» e la ricomincia con lo stesso seed (anche nel lab 06).
- **Script R** (esiti della verifica dell’utente): `dplyr::select()` esplicito nei lab 03, 04, 10, 11, 19 (un `select` di un altro pacchetto, tipicamente MASS, mascherava quello di dplyr); nei lab 17 e 18 lo script si aggiorna a fine esperimento, così il «campione mostrato» coincide con quello del browser; lab 24 con η predefinito 0,5 (con η = 1 su XOR la traiettoria è sensibile agli arrotondamenti e R e browser si separano nelle cifre finali dopo ~1000 epoche: spiegato nell’interpretazione) e soglia di successo delle 20 inizializzazioni a 0,85.
- `verifica/verifica_statatlas.R` rigenerato; estrattore jsdom in `tests/estrai_per_verifica_R.js`.

## 1.12.1 — 13/11/2026 · aggiustamenti prima della revisione finale
- **Lab 01, mappa delle relazioni**: ridisegnata su quattro righe e completata (da 19 a 30 legami). Aggiunti: Bernoulli → Geometrica, Binomiale negativa → Poisson, miscuglio Poisson–Gamma → Binomiale negativa, processo di Poisson (Esponenziale → Poisson), parte intera di un’Esponenziale → Geometrica, χ² → Normale, χ² → t, Z₁/Z₂ → Cauchy, ν₁F → χ², F → Beta, statistiche d’ordine delle Uniformi → Beta, χ²(2) = Esponenziale(1/2). Precisati i casi particolari (Bernoulli = Binomiale(1, p), Geometrica = Binomiale negativa(1, p), Esponenziale = Gamma(1, λ)) e la parametrizzazione della Weibull.
- **Lab 20**: le partizioni e i diagrammi degli alberi sono sostituiti da tre frontiere affiancate (un albero fisso, bagging, foresta casuale) che evolvono a ogni albero aggiunto, con la tinta proporzionale alla quota di voti e la frontiera stimata in nero; nuova striscia di fotogrammi dopo 1, 5, 25, 100 … alberi.
- **Grafici più grandi**: pagina più larga (fino a 1560 px), colonna dei controlli più stretta, pannelli affiancati che vanno a capo prima di rimpicciolirsi troppo (`.duo`, `.trio`), e un pulsante ⤢ su ogni grafico per ingrandirlo a tutto schermo (Esc per chiudere).
- **Verifica R**: `verifica/verifica_statatlas.R`, file autonomo che esegue tutti gli script R e li confronta con i valori del browser; generato da `tests/gen_verifica_R.js`.

## 1.12.0 — 13/11/2026 · Parte VIII (LAB-24): tutti i 24 laboratori
- **CORE-05**: `src/core/nn.js` — rete 2 → H → 1 (tanh o ReLU, uscita sigmoide), entropia incrociata stabile, penalità L2, backpropagation, discesa a lotto intero, controllo del gradiente con differenze centrali, rilevazione della divergenza; `tests/test_nn.js` (11 test).
- **Lab 24 Reti neurali e backpropagation** (Parte VIII, *anteprima*): XOR, dati separabili, due lune; superficie di probabilità e frontiera; schema della rete con pesi, passaggio in avanti e δ della backpropagation per un’osservazione scelta con un clic; perdita di training e validazione con il minimo della validazione; addestramento cooperativo un’epoca alla volta; venti inizializzazioni sugli stessi dati (a blocchi, annullabile); controllo del gradiente in tabella. R: stessi dati e pesi iniziali (R0), stessa discesa del gradiente scritta in R (R2), `nnet`/`torch` come confronto (R3).
- La mappa dell’atlante ha ora otto parti su due righe, 24 nodi e 47 legami.

## 1.11.0 — 13/11/2026 · Parte VII completa (LAB-23)
- `cluster.js`: DBSCAN con convenzione deterministica dichiarata (visita in ordine di indice, espansione FIFO, bordo al primo cluster), intorni, k-distanze, silhouette; 8 nuovi test (definizioni, invarianza di core e rumore all’ordine dei dati).
- **Lab 23 DBSCAN e confronto tra metodi** (Parte VII, *anteprima*): lune, cerchi concentrici, densità diverse e dati uniformi senza gruppi, punti anomali, scala e standardizzazione; espansione animata con core, bordo e rumore e intorno ε di un punto scelto con un clic; grafico delle k-distanze; ARI e quota di rumore al variare di ε; k-means, Ward e DBSCAN affiancati con ARI e silhouette; bordi contesi; controllo che l’animazione coincida con la procedura di riferimento. R: stessi dati (R0), DBSCAN didattico identico (R2), `dbscan::dbscan` come confronto (R3).

## 1.10.0 — 13/11/2026 · LAB-22
- **CORE-04**: `src/core/cluster.js` — Lloyd (assegnazione e aggiornamento come `kmeans(algorithm = "Lloyd")`, gruppi vuoti che conservano il centro), gerarchico con Lance–Williams (singolo, completo, medio, Ward.D2), `cutree`, ordine delle foglie, indice di Rand corretto; `tests/test_cluster.js` (18 test).
- **Lab 22 k-means e clustering gerarchico** (Parte VII, *anteprima*): tre popolazioni (sferiche, allungate, con dispersioni diverse) a distanza regolabile, valore anomalo, standardizzazione; Lloyd mostrato mezzo passo alla volta con i percorsi dei centri; più avvii e minimi locali con le curve della WCSS; centri iniziali trascinabili; dendrogramma con taglio in K gruppi e partizione corrispondente; ARI rispetto alle popolazioni e tra metodi; controlli (WCSS monotona, n − 1 fusioni, altezze non decrescenti, invarianza alle etichette). R: stessi dati (R0), `kmeans` Lloyd con gli stessi centri iniziali (R2), `hclust`.

## 1.9.0 — 13/11/2026 · Parte VII, LAB-21
- **Lab 21 Componenti principali** (Parte VII, *anteprima*): popolazione normale con autovalori e assi noti (λ₁ regolabile, rotazione θ, p da 2 a 6), unità di misura di x₂, standardizzazione, valore anomalo; nuvola centrata con assi stimati e veri e proiezioni su PC1; scree plot con quote della popolazione; biplot con convenzione dichiarata; errore di ricostruzione (identità con gli autovalori scartati); distribuzione Monte Carlo dell’angolo di PC1 contro l’asintotica di Anderson; distanza tra sottospazi; controlli numerici (Σ PVE, score incorrelati, ‖SV − VΛ‖). R: stessi dati (R0), `prcomp` con segni allineati (R1).

## 1.8.0 — 13/11/2026 · Parte VI completa (LAB-20)
- `ml.js`: CART per due classi con Gini (soglie nei punti medi, regole di parità fissate, riduzione d’impurità strettamente positiva, min-leaf, profondità massima, estrazione di mtry variabili per nodo con `sample()` di R) e previsione; 6 nuovi test.
- **Lab 20 Alberi, bagging e random forest** (Parte VI, *anteprima*): frontiera a cerchio o diagonale con etichette scambiate (errore di Bayes = ε, esatto), variabili di rumore; partizioni di un albero, dell’ultimo albero bootstrap e dell’insieme; diagrammi dei due alberi; errore sul test e out-of-bag di bagging e foresta al crescere degli alberi; accordo medio tra coppie di alberi e variabile della radice (decorrelazione); controlli su impurità, foglie e OOB. R: stessi dati e bootstrap (R0), stesso CART (R2), `ranger`/`rpart` come confronto (R3).

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
