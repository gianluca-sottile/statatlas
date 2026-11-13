# StatAtlas 2.0 - Piano di sviluppo scientifico, didattico e tecnico

**Baseline analizzata:** repository pubblico `gianluca-sottile/statatlas`, branch `main`, consultato il 12 novembre 2026. Il changelog riporta **v1.4.1** (11 novembre 2026); il README cita ancora **v1.4.0**.

**Perimetro:** aggiungere otto laboratori (17-24), passando da 16 a 24, senza modificare i contenuti scientifici già validati degli attuali moduli 01-16. Documento di pianificazione: **nessuna modifica e stata applicata al repository**.

**Fonti primarie:**
- https://github.com/gianluca-sottile/statatlas
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/build.py
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/src/core/app.js
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/src/core/ui.js
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/src/core/content.js
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/src/labs/16-spline.js
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/tests/test_core.js
- https://raw.githubusercontent.com/gianluca-sottile/statatlas/main/CHANGELOG.md

## 1. Obiettivo del prodotto

Portare StatAtlas da atlante di probabilità, inferenza e regressione moderna ad **atlante interattivo del ragionamento statistico e del machine learning**, preservando i suoi vantaggi: un solo `index.html` offline, dipendenze runtime nulle, generazione dati osservabile, riproducibilita in R, rigore matematico e identità grafica originale.

La proprietà distintiva non è poter 'eseguire un algoritmo', ma spiegare **quale quantità si stima, come funziona il metodo, quale variabilità presenta, quando funziona e quando fallisce**.

### Mappa definitiva

| Parte | Laboratori | Note |
| --- | --- | --- |
| I probabilità | 01-03 | Esistenti, invariati |
| II Campionamento | 04-05 | Esistenti, invariati |
| III Inferenza | 06-09 | Esistenti, invariati |
| IV Modelli | 10-13 | Esistenti, invariati |
| V Regressione moderna | 14-17 | Nuovo 17 segmentata |
| VI Apprendimento supervisionato | 18-20 | Nuovi 18 validazione, 19 kNN, 20 alberi ed ensemble |
| VII Riduzione dimensionale e clustering | 21-23 | Nuovi 21 PCA, 22 k-means e gerarchico, 23 DBSCAN e confronto |
| VIII Reti neurali | 24 | Nuovo 24 MLP |

L'ordine 21 PCA prima del clustering crea un ponte concettuale tra geometria multivariata e metodi non supervisionati, ma il corso deve spiegare che PCA non è automaticamente il preprocessing corretto per qualsiasi clustering.

## 2. Contratto di compatibilita con v1.4.1

1. Conservare `src/shell.html`, tre file CSS e sorgenti JavaScript concatenati da `build.py` nel file generato `index.html`.
2. Conservare `SA.registerLab(id, {mount, unmount, redraw})`, `SA.catalog`, `SA.content`, `SA.art.get`, `SA.ui.step`, `SA.ui.runner`, `SA.ui.codeBlock`, `SA.ui.exportPNG` e `SA.ui.csv`.
3. Ogni nuovo laboratorio deve avere domanda e previsione facoltativa, esperimento passo-passo, teoria/simulazione, interpretazione, drawer Essenziale/Avanzato/Esercizi/Bibliografia, codice R aggiornato ai parametri ed esportazione figure e dati.
4. Utilizzare `SA.RRNG` senza alterarne il flusso esistente. Codificare in modo dichiarato l'ordine di generazione delle variabili casuali.
5. Separare sempre parametri della popolazione, dati simulati, stimatori e diagnostiche. La 'verita' e mostrata soltanto quando esiste ed e pertinente al messaggio didattico.
6. Etichettare nelle tabelle le quantità secondo lo schema corrente: `exact`, `asym`, `approx`, `mc`, `none`.
7. Non introdurre come prerequisito React, TensorFlow.js, server, database o API esterne. Le eventuali librerie di test sono dipendenze di sviluppo, non di runtime.
8. Preservare tema chiaro/scuro, palette e doppia codifica colore/tratto o simbolo, export SVG->PNG, navigazione tastiera, focus e unmount senza leak.
9. Nessuna riscrittura generalizzata dei moduli precedenti. In caso di refactoring, limitare il diff e richiedere test di regressione.

### Differenza tra livelli di riproducibilita

**R0, dati**: identiche sequenze pseudocasuali con lo stesso seed, stessa procedura di generazione e stesso ordine delle chiamate.

**R1, metrica**: stesso dato e stessa definizione della statistica, con tolleranze numeriche documentate.

**R2, algoritmo**: stessi passaggi, convenzioni, inizializzazioni, tie-breaking e stopping rule; accettabile solo se l'implementazione R replica davvero la procedura JS.

**R3, metodo**: confronto tra algoritmi scientificamente equivalenti ma implementati diversamente; i numeri non devono essere presentati come identici. Per esempio, `ranger` è una foresta JS didattica; `stats::kmeans` con un algoritmo diverso da Lloyd; `segmented::segmented` contro una ricerca su griglia.

**Regola editoriale**: il testo attuale sulla home 'gli stessi numeri' va reso esplicito per i nuovi laboratori, senza indebolire la garanzia già valida per la simulazione di dati nei lab 01-16.

## 3. Schede scientifiche e didattiche dei laboratori

### Lab 17 - Regressione segmentata e breakpoint

**File** `src/labs/17-segmentata.js`; **id** `segmentata`; **Parte V**.

**Domanda**: quando una relazione cambia pendenza? Come stimare un punto di cambiamento ignoto?

**Modello**: `Y_i = beta0 + beta1*x_i + delta*max(0, x_i-psi) + epsilon_i`, con epsilon normale nella configurazione base. La funzione media resta continua. Pendenza prima di psi = beta1; dopo psi = beta1 + delta.

**Controlli**: n (40, 80, 150, 300), sigma, beta1, delta, posizione psi (interno al dominio), seed, numero di repliche B; opzione assenza di breakpoint (`delta=0`). Scenari avanzati: breakpoint al bordo, eteroschedasticita, errori a code pesanti, due breakpoint (solo confronto esplorativo, non obbligatorio nella v1).

**Viste**: (a) campione e funzione vera, retta OLS e linea segmentata stimata; (b) profilo RSS(psi) con minimo e intervallo plausibile; (c) distribuzione Monte Carlo di psi-hat quando identificabile, bias/RMSE e frequenza di stime al bordo; (d) confronto errore predittivo linear/segmentata/spline.

**Algoritmo primario**: per ciascun candidato psi in una griglia predefinita interna (escludere regioni con pochi dati a uno dei lati), calcolare OLS per il disegno `[1, x, (x-psi)+]`, scegliere il minimo RSS con tie-breaking deterministico. QR o minimi quadrati numericamente stabili; salvare l'intera griglia profilata. Facoltativa raffinazione locale da implementare *identica in R* se introdotta.

**Problemi teorici obbligatori**: con delta=0 psi non è identificato; test standard di Wald per psi non regolare; differenza tra punto di cambiamento realmente presente e fluttuazione campionaria; incertezza del breakpoint quando il segnale e debole. Evitare un intervallo Wald nominale ingenuo. Per test di esistenza del break usare opzionalmente bootstrap sotto H0 con fit nullo ricalcolato, etichettando il p-value come Monte Carlo.

**R**: script che replichi la grid search e i dati; confronto *separatamente etichettato* con `segmented::segmented()` e `segmented::davies.test()` / `pscore.test()` se applicabili. Non chiamare l'algoritmo del pacchetto una grid search.

**Acceptance**: a seed fisso dati identici in R; profilo RSS entro tolleranza; riconoscimento della non-identificabilita sotto delta=0; simulator non si blocca nelle condizioni di bordo; nessuna affermazione di copertura nominale senza studio.

### Lab 18 - Generalizzazione, overfitting e validazione

**File** `src/labs/18-validazione.js`; **id** `validazione`; **Parte VI**.

**Domanda**: perché un modello che si adatta meglio al training può prevedere peggio?

**Scenari**: regressione polinomiale su funzione generatrice nota e classificazione logistica di base come confronto opzionale. Non duplicare il lab 16, focalizzato su lisciamento, matrice S e LOOCV: qui il fulcro e il *protocollo predittivo*.

**Controlli**: n, rapporto train/test, rumore, complessità, numero di fold K, seed, repliche B, selezione dell'iperparametro.

**Viste**: training e test differenziati; curve di training/test/CV error; selezione dell'iperparametro; distribuzione dell'errore di generalizzazione tra ripetizioni; esperimento 'valutazione scorretta' che fa scegliere sul test set e mostra il bias ottimistico.

**Protocollo**: i fold e lo split sono generati indipendentemente dall'iperparametro; il preprocessing si stima soltanto sui dati di training di ogni fold; il test set rimane intatto fino alla stima finale; usare nested-CV in un approfondimento per separare selezione e valutazione.

**R**: script con split e fold espliciti tramite stessa sequenza casuale e stesso algoritmo di shuffle; modello `lm` come riferimento. Se usati `rsample` o `caret`, presentare un confronto concettuale, senza promettere identiche suddivisioni casuali.

**Acceptance**: fold disgiunti e che coprono le osservazioni, no leakage nel preprocessing, riproducibilita dello split, curva del test non obbligatoriamente monotona, valutazione sul test *una sola volta* nel workflow corretto.

### Lab 19 - kNN e classificazione

**File** `src/labs/19-knn.js`; **id** `knn`; **Parte VI**.

**Domanda**: come cambia una frontiera di decisione quando usiamo i vicini più prossimi?

**Controlli**: k, n, distanza tra gruppi, rumore/sovrapposizione, metrica euclidea, variabili non standardizzate, seed, numero di repliche.

**Viste**: (a) punti e frontiera di Bayes quando nota analiticamente; (b) vicini di un punto trascinabile, distanze e voti; (c) frontiera kNN; (d) train/test error, accuracy, sensibilità e specificità, con CIs Monte Carlo appropriati.

**Scenari**: due normali bivariate con covarianza comune (Bayes esplicito), cerchi/semilune per mostrare frontiere non lineari, caso a scale discordanti.

**Algoritmo**: ricerca esaustiva delle distanze, sort deterministico con tie-break per indice, regola esplicita per parità dei voti; grid di rendering ridotta nei dispositivi mobili. Confrontare con regressione logistica del lab 12 come baseline.

**R**: kNN replicato con matrici di distanze o implementazione di riferimento e confronto con `class::knn` senza pretesa di equivalenza in tutti i tie.

**Acceptance**: casi k=1, k=n, classi uguali, distanze uguali, metrica e standardizzazione applicata soltanto al training; confronto con rischio di Bayes nei soli scenari per cui e noto.

### Lab 20 - Alberi, bagging e random forest

**File** `src/labs/20-alberi-ensemble.js`; **id** `alberi`; **Parte VI**.

**Domanda**: perché un albero e instabile e l'aggregazione può migliorare la previsione?

**Controlli**: numero osservazioni, profondità max, min-leaf, split Gini (classificazione) o SSE (regressione: approfondimento), numero alberi, mtry, bootstrap, seed, perturbazione del dataset.

**Viste**: albero e split correnti, partizione 2D, traiettoria errori training/OOB/test contro numero di alberi, volatilita delle frontiere e variabilità tra alberi.

**Algoritmi**: CART didattico con ricerca esatta di soglie tra osservazioni ordinate; bagging = bootstrap e tutti i p predittori candidati a ogni split; random forest = bootstrap e sottoinsiemi casuali di mtry predittori allo split. Fissare regole di tie, profondità e casi leaf e classe.

**R**: per *identità esatta* usare un piccolo CART/forest algoritmico tradotto in R; per *confronto di metodo* usare `rpart` e `ranger` e spiegare le differenze. `mtry=p` rende la randomizzazione delle variabili assente, ma non significa automaticamente equivalenza numerica tra motori differenti.

**Acceptance**: riduzione impurita non negativa, nodi foglia coerenti, bootstrap indicizzato e riproducibile, OOB calcolato solo sugli alberi che non hanno visto ciascuna osservazione, no test leakage, nessuna falsa equivalenza a `ranger`.

### Lab 21 - PCA: geometria, varianza e ricostruzione

**File** `src/labs/21-pca.js`; **id** `pca`; **Parte VII**.

**Domanda**: come descrivere dati multivariati mediante poche direzioni che conservano la maggiore varianza?

**Modello**: matrice X (n x p); centratura obbligatoria, standardizzazione facoltativa. `S = Z'Z/(n-1)`, `S v_j = lambda_j v_j`; score `T = Z V`; `PVE_j = lambda_j / sum(lambda)`; ricostruzione `Z_hat_k = T_k V_k'`. Errore di ricostruzione per osservazione `||Z-Z_hat_k||_F^2/n = (n-1)/n * sum_{j>k} lambda_j`. La definizione della scala dell'errore va mantenuta coerente su grafici e tabella.

**Controlli**: n (30, 80, 200), p (2-6), correlazione/angolo latente, rapporto tra varianze, numero k di componenti, standardizzazione si/no, outlier, seed, B repliche. Limiti: impedire standardizzazione quando esistono colonne costanti; trattare p>n solo in approfondimento opzionale.

**Viste**:
1. nuvola di punti e assi principali veri/stimati (solo p=2) con proiezione ortogonale progressiva;
2. scree plot, percentuali individuali e cumulate di varianza spiegata;
3. scores PC1-PC2 e loading vectors con scala e convenzione del biplot dichiarate;
4. errore di ricostruzione e trade-off k vs dimensione;
5. modalità Monte Carlo: distribuzione angolare dell'asse stimato rispetto all'asse principale della popolazione *solo quando l'autovalore dominante e separato*.

**Messaggi fondamentali**: PCA non è una procedura supervisionata, non cerca necessariamente cluster ne massimizza la capacità predittiva; standardizzare modifica l'oggetto statistico; i segni degli autovettori sono arbitrari; con autovalori ripetuti l'orientamento individuale dei vettori e non identificato (si possono confrontare i sottospazi).

**Calcolo JS**: per p piccolo autodecomposizione simmetrica con Jacobi, tolleranza residuo `||S V - V Lambda||`; ordinamento autovalori discendente, controllo ortonormalita; per robustezza usare SVD numerica se si estendono molto p e n in futuro. Per dati quasi singolari, clamp soltanto degli autovalori negativi di ordine roundoff, mai alterare quelli realmente negativi derivanti da un bug.

**R**: `stats::prcomp(X, center=TRUE, scale.=...)` che usa SVD; confrontare PVE, proiezioni, errori, e loadings/scores dopo allineamento del segno; in autovalori degeneri, usare distanza tra proiettori di sottospazio invece di confrontare singoli vettori.

**Acceptance**: somma PVE=1 per rango positivo, scores incorrelati entro tolleranza, ricostruzione esatta per k=rango, errore non crescente con k, invarianti a cambiamento di segno del loading, gestione adeguata di autovalori degeneri e variabili costanti.

### Lab 22 - K-means e clustering gerarchico

**File** `src/labs/22-clustering.js`; **id** `clustering`; **Parte VII**.

**Domanda**: che cosa significa dividere osservazioni in gruppi, e quanto dipende dall'algoritmo scelto?

**Controlli**: K, centroidi iniziali trascinabili, seed, numero restart, metrica euclidea, standardizzazione, linkage (single/complete/average/Ward), distanze tra popolazioni generative, outlier.

**Viste**: iterazione di Lloyd (assignment/update), WCSS ad ogni passo, confronto di inizializzazioni, dendrogramma con taglio alla quota scelta, differenza tra etichette generative e cluster assegnati.

**Problemi obbligatori**: minimi locali, non identificazione delle etichette (label switching), empty clusters, campioni senza cluster, differenza tra struttura algoritmica e popolazioni reali; Ward.D2 e aggiornamenti coerenti con la minimizzazione dell'incremento di SSE.

**R**: per identità riprodurre Lloyd con starting centers espliciti e stessa gestione dei tie; `stats::kmeans` va invocato con `algorithm="Lloyd"` quando opportuno; per gerarchico usare `stats::hclust` con linkage specificato, tenendo conto dei tie.

**Acceptance**: WCSS non crescente a ogni iterazione Lloyd; stabilizzazione; permutazione delle label non cambia il raggruppamento; albero gerarchico ha n-1 merge; sotto K=1 tutti i punti nello stesso gruppo; gestione robusta dei cluster vuoti.

### Lab 23 - DBSCAN e confronto tra metodi

**File** `src/labs/23-dbscan.js`; **id** `dbscan`; **Parte VII**.

**Domanda**: quando i cluster non sono sferici e che cosa consideriamo rumore?

**Controlli**: epsilon, minPts, densità, numero di punti anomali, separazione, scale, seed; switch di confronto k-means/Ward/DBSCAN sugli stessi dati.

**Viste**: neighborhood di un punto, core/border/noise, costruzione per espansione della densità, risultato sui dataset moons/circles/densità differenti, andamento silhouette e Adjusted Rand Index quando esistono classi generative.

**Problemi obbligatori**: scelta difficile di epsilon e minPts, effetto delle scale, densità molto disomogenee, border points assegnabili a più cluster (tie e traversal esplicitati), differenza tra cluster trovati e gruppi veri.

**R**: implementazione didattica esplicita per identità numerica, `dbscan::dbscan()` come confronto di metodo con dettagli di border handling dichiarati.

**Acceptance**: correttezza core/border/noise, ripetibilita, robustezza alla permutazione delle label, comportamento su cerchi e lune, scenari senza cluster veri, nessuna interpretazione causale dei cluster.

### Lab 24 - Reti neurali artificiali e backpropagation

**File** `src/labs/24-reti-neurali.js`; **id** `reti-neurali`; **Parte VIII**.

**Domanda**: come apprende una rete neurale piccola una relazione non lineare? perché può sovradattarsi e perché inizializzazioni diverse danno esiti diversi?

**Modello**: MLP 2D di classificazione binaria con un hidden layer (2-8 neuroni) o due piccoli hidden layer opzionali. Attivazioni tanh/ReLU; output sigmoide, binary cross-entropy, gradient descent o mini-batch con regola esplicita. Dataset linea, XOR, due lune.

**Controlli**: architettura, attivazione, learning rate, L2, epoche, train/validation split, seed di inizializzazione, rumore. Limiti conservativi per non bloccare il browser.

**Viste**: network e pesi, flusso forward (per una osservazione), gradienti/backprop nella forma essenziale, frontiera decisionale, loss di train e validation, distribuzione degli esiti su inizializzazioni ripetute.

**Problemi obbligatori**: loss non convessa, instabilita del training, divergenza per learning rate elevato, overfitting, ruolo della regolarizzazione, numero di parametri, differenza tra training accuracy e generalizzazione.

**R**: per parità algoritmica usare funzioni R esplicite per forward e backprop con stessi pesi iniziali e identico ordine dei batch; `nnet` o `torch` soltanto come confronti di metodo, senza promessa di stessi pesi.

**Acceptance**: gradient checking con differenze finite, riduzione loss in un caso semplice controllato, analisi multi-seed su XOR (non pretendere successo universale), numeri finiti nella BCE grazie a implementazione stabile, annullamento task quando si cambia laboratorio, nessun blocco UI.

## 4. Architettura software proposta

### File da aggiungere

```
src/core/linalg.js         # QR, decomposizione simmetrica, prodotti e controlli
src/core/resampling.js     # split, fold CV, bootstrap, gestione seed e replica R
src/core/ml.js             # metriche, kNN, split per CART, piccoli ensemble
src/core/cluster.js        # Lloyd, linkage, DBSCAN, metriche di clustering
src/core/nn.js             # forward, backward, gradient check, SGD didattico
src/labs/17-segmentata.js
src/labs/18-validazione.js
src/labs/19-knn.js
src/labs/20-alberi-ensemble.js
src/labs/21-pca.js
src/labs/22-clustering.js
src/labs/23-dbscan.js
src/labs/24-reti-neurali.js

tests/test_linalg.js
tests/test_ml.js
tests/test_cluster.js
tests/test_nn.js
tests/integration/         # reference fixtures R->JS, script eseguibili
tests/smoke/               # smoke test parametrizzati per tutti i laboratori
```

Creare i file core in maniera **progressiva**: `linalg.js` nel Lab17, `resampling.js` nel Lab18, `ml.js` nel Lab19/20, `cluster.js` nel Lab22/23, `nn.js` nel Lab24. Evitare un refactor massivo del core esistente prima che sia necessario.

### `build.py`

Il file corrente carica esplicitamente `core/rng.js`, `core/dist.js`, `core/laws.js`, `core/plot.js`, `core/plot3d.js`, `core/art.js`, `core/content.js`, `core/ui.js`, `core/app.js`, e infine i lab ordinati con `sorted(...)`. Aggiungere i nuovi moduli computazionali **prima** del catalogo/app e dei laboratori; non toccare l'ordine dei moduli 01-16. Ogni script nuovo deve avere namespace `SA.*`, senza moduli ES esterni che richiedano rete o bundler aggiuntivi.

### `src/core/app.js`

- Integrare in `SA.catalog` la Parte V (17), VI (18-20), VII (21-23), VIII (24).
- Integrare `PART_DESC` con descrizioni e chiavi delle nuove illustrazioni.
- Aggiornare `LINKS` dell'atlante, includendo gli archi `spline->segmentata`, `penalizzata->validazione`, `glm->knn`, `validazione->knn`, `knn->alberi`, `bivariata->pca`, `pca->clustering`, `clustering->dbscan`, `validazione->reti-neurali`, `knn->reti-neurali`.
- La mappa attuale usa `W=1000` e `cols=SA.catalog.length`; con otto parti la larghezza per colonna dimezza: progettare scroll orizzontale responsivo, viewport più ampio o distribuzione in due righe. Non limitarsi ad aggiungere nodi: testare leggibilità e uso da mobile.
- Sostituire i testi hard-coded 'Sedici laboratori' e i commenti sulle 'quattro parti' con testi e conteggi coerenti, meglio ricavati da `SA.catalog`.
- Verificare che stato 'new' diventi 'ready' soltanto al superamento del gate di rilascio.

### `src/core/art.js`, `src/core/content.js`, CSS

- Aggiungere funzioni di tavole SVG per gli otto laboratori e `L.partVI`, `L.partVII`, `L.partVIII`.
- Aggiungere tutte le schede `SA.content[id]`: `obiettivi` (3-4), `valutiamo`, `tabella`, `esempio`, `errori`, `avanzato`, `esercizi` (almeno 3 completi di soluzione), `riferimenti` (verificati).
- Riutilizzare token CSS e layout editoriali esistenti; introdurre eventuali componenti grafici soltanto se riusabili da più laboratori (p.es. matrice di confusione, dendrogramma, scree plot, albero).
- Per PCA prevedere rendering scalabile per biplot, grafici di loading, legenda e assi all'interno di SVG nativo.

### Performance e concorrenza

`SA.ui.runner` chiama `step()` in sincrono e `finish()` termina in un ciclo continuo. Per esperimenti costosi (MC su alberi, foreste, MLP), **non** eseguire migliaia di addestramenti nel ciclo `finish()` esistente. Introdurre un runner cooperativo o task scheduler per questi casi, con chunk limitati, progressivo, cancellazione e token di generazione/seed per scartare i risultati vecchi. Valutare Worker solo se compatibile con l'obiettivo del singolo file offline e collaudato in `file://` sui browser target.

Regole di performance (obiettivi di accettazione da misurare, non proprietà attuali): feedback degli slider interattivi tipicamente entro 100 ms su laptop medio; lavoro pesante in chunk piccoli senza congelamento prolungato; disponibilità di 'Pausa' e 'Annulla' nei task; limiti di n, B, profondità e numero di alberi diversi tra desktop e mobile se necessario.

## 5. Protocollo di test e Quality Gates

### Livello A - regressione baseline

Prima di intervenire registrare commit SHA, `python3 build.py`, `node tests/test_core.js`, l'esito degli smoke esistenti e dimensione del file `index.html`. Il README dichiara 49 test numerici, ma l'analisi documentale **non** sostituisce la loro esecuzione nel checkout locale. Verificare che `index.html` sia un output generato e che non si modifichi manualmente.

### Livello B - invarianti numerici

- **Segmentata**: differenza RSS/coeff. con R per griglia di psi fissa; non-identificabilita H0; sigma=0; bordo.
- **Validazione**: fold disgiunti, no leakage, tutti i dati training coperti, replica dello shuffle.
- **kNN**: distanze, tie, k=1 e k=n, matrice confusione e rischio Bayes se noto.
- **Tree/forest**: purezza dei nodi, tie, OOB corretto, bootstrap riproducibile e class vote.
- **PCA**: S simmetrica, `V'V=I`, traccia S = somma autovalori, ricostruzione e varianza residua coerenti, sign-invariance e casi degeneri.
- **K-means/hclust**: WCSS non crescente durante Lloyd, numero di merge n-1, validità linkage.
- **DBSCAN**: core/border/noise, stabilità entro convenzione deterministica, casi senza cluster.
- **MLP**: gradient checking e stabilità numerica BCE, loss, casi lineari e XOR.

### Livello C - test R/JS

Per ogni laboratorio salvare `seed`, parametrizzazione, dataset, metrica e risultato di riferimento in un fixture JSON/CSV. Aggiungere script R che generano fixture e script Node che confrontano con soglie documentate. Dove il confronto non deve essere uno-a-uno, comparare invarianti/metodo, non predizioni/pesi identici.

### Livello D - UX, robustezza e accessibilità

Tutti gli stati previsti: avvia, pausa, passo, completa, restart, varia slider, cambia metodo, cambia laboratorio mentre una simulazione e attiva, ritorna al modulo, tema scuro, tastiera, export PNG/CSV, copia/scarica R. Controllare assenza di `NaN`, `Infinity` e grafici fuori SVG. Collaudare anche con `prefers-reduced-motion` e focus da tastiera. Smoke test automatici di **ogni** lab; estendere i test correnti che sono parzialmente specifici a singole fasi.

### Livello E - browser reali e rilascio

Chrome, Safari, Firefox e mobile; apertura tramite GitHub Pages e tramite doppio clic in `file://` senza rete; download e copia dei codici; esportazioni; navigazione dell'atlante con 8 colonne/parti; verfica che i moduli 01-16 mantengano comportamento e output numerico invariati.

### Checklist minima per considerare un lab `ready`

- [ ] Un problema didattico chiaro, previsione prima dell'esperimento e feedback interpretativo
- [ ] Teoria corretta; parametri, stimatori e status quantitativi esplicitati
- [ ] Almeno due visualizzazioni che mostrino un comportamento non banale
- [ ] Almeno un esperimento che evidenzi un limite o fallimento del metodo
- [ ] Animazione e parametri; seed riproducibile
- [ ] Script R eseguibile e verificato su R reale
- [ ] `SA.content`, illustrazione SVG, esercizi, bibliografia
- [ ] CSV/PNG, tema, keyboard, mobile, offline
- [ ] Test numerici e smoke senza regressioni nei laboratori preesistenti
- [ ] README, changelog e count coerenti

## 6. Sequenza realizzativa, dipendenze e release

Le durate sono stime di **giorni di sviluppo concentrato**, non promesse di calendario.

| Fase | Deliverable | Dipendenze | Stima | Release indicativa |
| --- | --- | --- | ---: | --- |
| 0 | Audit baseline, CI, contratti e fixture | Nessuna | 2-4 | Preparazione |
| 1 | Lab17 segmentata + linalg | Fase 0 | 5-8 | v1.5 |
| 2 | Lab18 validazione + resampling | Fase 0 | 5-7 | v1.6 |
| 3 | Lab19 kNN + Lab20 alberi/ensemble | Fase 2 | 10-16 | v1.7 |
| 4 | Lab21 PCA + supporto decomposizioni | Fase 1 (linalg) | 5-8 | v1.8 |
| 5 | Lab22 kmeans/gerarchico + Lab23 DBSCAN | Fase 4 | 8-13 | v1.9 |
| 6 | Lab24 MLP + confronto validazione | Fasi 2-3 | 8-12 | v2.0-rc |
| 7 | Audit globale, responsive, R, docs e release | Tutte | 4-7 | v2.0 |

Totale indicativo: **47-75 giornate-persona equivalenti**, soggetto soprattutto alla qualità del motore di alberi, alla convergenza e performance della MLP e alla profondità dell'audit R/JS. Un primo rilascio con i lab 17 e 18 può essere prodotto molto prima del completamento dei moduli 19-24.

Le milestone si approvano a evidenza: PR autonoma, risultati test allegati, screenshot e script R di riferimento; niente passaggio alla milestone seguente se il gate fallisce.

## 7. Issue/PR suggerite

- **BASE-01** - Documentare commit baseline, v1.4.1 vs README v1.4.0, test locali, dimensioni bundle.
- **CORE-01** - `linalg.js` con API ristrette e test; nessuna regressione nel core attuale.
- **CORE-02** - Resampling deterministico e stesso RNG/order in R; schema fixture.
- **UI-01** - Definizione standard per task asincroni cancellabili; preservare `SA.ui.runner`.
- **NAV-01** - Catalogo VIII parti, `PART_DESC`, archi LINKS, mappa leggibile con 24 nodi, illustrazioni.
- **LAB-17**, **LAB-18**, **LAB-19**, **LAB-20**, **LAB-21**, **LAB-22**, **LAB-23**, **LAB-24** - Una PR per laboratorio con DoD.
- **QA-01** - Suite Node + smoke multi-lab + fixture R + CI.
- **DOC-01** - README, CHANGELOG, homepage, badges, bibliografie, DOI/citazione/versione.
- **RELEASE-01** - QA cross-browser, performance, a11y, deploy GitHub Pages e verifica offline.

## 8. Comandi operativi previsti (nel checkout locale)

```bash
git checkout main
git pull --ff-only
git rev-parse HEAD
python3 build.py
node tests/test_core.js
# Smoke attuale documentato (jsdom richiesto):
node tests/smoke/smoke_fase7.js index.html
```

Dopo l'introduzione di `package.json` / lockfile come **sole dipendenze di sviluppo**:

```bash
npm ci
npm test
python3 build.py
# Eseguire gli script R dei fixture e dei laboratori in R reale.
# Verificare index.html con GitHub Pages e file://.
```

Esempio di flusso per ciascuna PR:

```bash
git checkout -b feat/lab17-segmentata
# Modificare src/, tests/, README e CHANGELOG; non modificare index.html a mano.
python3 build.py
node tests/test_core.js
# Eseguire unit test del nuovo core e gli smoke del laboratorio.
# Verificare lo script R in un'installazione reale di R.
git diff --stat
```

## 9. Rischi e decisioni da tenere aperti

1. **Bundle unico vs complessità**: non precaricare calcoli o modelli pesanti; mantenere funzioni lazy e limiti trasparenti.
2. **Prove R/JS**: molte implementazioni pubbliche usano algoritmi differenti. La convenzione R0-R3 e obbligatoria.
3. **Inferenza non regolare della segmentata**: no CI o test ingenuamente standard sul breakpoint sotto H0.
4. **PCA e identificabilita**: segni arbitrari, autovalori uguali, standardizzazione e interpretazione dei loadings.
5. **Kmeans/DBSCAN**: output variabile per initialization, order e tie; usare confronti invariant rispetto alle label.
6. **Forest/MLP performance**: chunk e cancellazione, smoke reali su mobile.
7. **Mappa 8 parti**: la matematica grafica delle colonne attuali non è pronta senza revisione responsive.
8. **Deriva dei contenuti**: evitare descrizioni README e home non allineate al catalogo.
9. **Gamma teorica**: non presentare euristiche come teoremi; ogni quantità nel confronto teoria/simulazione ha status dichiarato.

## 10. Criterio di successo dell'intero progetto

La release v2.0 non sarà definita dal solo numero dei laboratori. Il risultato si considera completo se un docente può usare senza rete tutti e 24 i moduli, se ogni scenario insegna una proprietà è un limite del metodo, se i calcoli sono verificati, se lo studente può riprodurre *con le corrette garanzie* gli esperimenti in R e se nessuno dei 16 moduli originari e regredito.

**Prima PR raccomandata:** `BASE-01` (stato e test della baseline), poi `LAB-17` supportata da `CORE-01`; in parallelo si può definire il protocollo dei dataset e degli split di `LAB-18`. Non iniziare direttamente con le reti neurali.

## Riferimenti tecnici e metodologici

- `stats::prcomp` (R manual): https://stat.ethz.ch/R-manual/R-devel/library/stats/html/prcomp.html
- `segmented` (Muggeo, CRAN): https://cran.r-project.org/package=segmented
- Manuale `segmented` con test di Davies e score: https://vitomuggeo.r-universe.dev/segmented/doc/manual.html
- `ranger`: https://cran.r-project.org/package=ranger
- `dbscan`: https://cran.r-project.org/package=dbscan
- Repository StatAtlas: https://github.com/gianluca-sottile/statatlas
