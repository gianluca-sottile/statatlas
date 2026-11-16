# StatAtlas 2.1 · Parte VIII unificata — rilascio di sviluppo

**16 novembre 2026 · Laboratori 26–31 · UNA sola interfaccia per laboratorio**

## Decisione didattica e architetturale

I sei laboratori spaziali non mostrano più il vecchio esperimento accanto alla nuova mappa: l'interfaccia precedente è **stata rimossa dai mount** dei laboratori. Il codice di calcolo condiviso (`spatial-areal.js`, `spatial-local.js`, `spatial-points.js`, `spatial-geostat.js`, `spatial-kriging.js`, `spatial-regression.js`) è mantenuto perché utile, testato e necessario dove la nuova interfaccia lo richiama. Non è però mostrato un secondo pannello con controlli propri. I vecchi file dei laboratori 26–31 sono sostituiti da registrazioni minimali che invocano `src/core/spatial-unified.js` e `src/core/spatial-studio.js`.

Il flusso di studio è **Domanda → Mappa e controlli unici → Interpretazione → 3 Challenges → Script R derivato dai dati correnti**. La mappa aggiorna superfici, misure e grafici da **un solo array di punti**; l'inserimento, trascinamento, rimozione e reset sono utilizzabili da mouse e touch. Ogni mappa ha scenari sintetici per introdurre il concetto.

## Il significato statistico delle sei mappe

| N. | Esperimento e grandezze esposte | Condizioni e cautele |
|---:|---|---|
| 26 | Aggiungi osservazioni simili o alternanti; **Moran globale I** su valori puntuali e vicini kNN normalizzati per riga, cambiando k. | La heatmap è un lisciamento illustrativo; Moran non è calcolato dai pixel. La definizione di W cambia con k. Nessun test di significatività automatico. |
| 27 | Crea aree ad alto e basso valore; colora ai punti i quadranti **HH/LL/HL/LH** del lag e i relativi indici locali. | I quadranti non sono hotspot significativi. La nuova UI non fornisce p-value, randomizzazioni locali o correzioni BH/BY; tali temi restano nella teoria. |
| 28 | Inserisci eventi, gruppi e pattern regolari; **KDE**, primo vicino, curva descrittiva **L(r)−r**. | KDE non corretta ai bordi; L(r)−r non è un test CSR né un envelope. L'inomogeneità dell'intensità può imitare aggregazione. |
| 29 | Aggiungi e trascina sensori; **semivarianza empirica** per classi di distanza e curva; superficie illustrativa **IDW**. | Le coppie di misure, non i pixel, determinano le semivarianze. IDW non è un predittore kriging né stima di varianza condizionale. |
| 30 | Inserisci, sposta o rimuovi sensori su campo gaussiano iniziale fisso; **ordinary kriging**, previsione e varianza di errore condizionale, range assunto. | Sensori acquisiscono valori dal **medesimo campo latente simulato**; la varianza dipende da geometria e covarianza assunta, non dai valori rilevati. Il rumore nugget è modellato. Non è disponibile un confronto IDW nella nuova UI. |
| 31 | Campione spaziale con Y, X, x, y modificabile; **OLS Y~X** e **OLS Y~X+x+y**, R², coefficienti, Moran dei residui. | Coordinate normalizzate; la seconda equazione introduce un trend geografico, **non** stima SAR/SEM né garantisce capacità predittiva o residui indipendenti. SAR e SEM sono spiegati soltanto nella teoria avanzata. |

Tutte le coordinate spaziali sono normalizzate nel quadrato [0,1]×[0,1], non gradi geodetici. Prima di trasferire algoritmi e distanze a posizioni geografiche reali servono metrica, proiezione e protocollo inferenziale appropriati. Le superfici sono disegnate su una griglia SVG 29×29: è una resa raster campionata, non un campo osservato infinitamente denso.

## Challenges: 18 esercizi aggiornati

Le sfide 26, 27, 28, 29 e 31 richiedono effettivamente: (1) modificare le osservazioni sulla mappa per il livello Comprensione, (2) variare il controllo pertinente e registrare il risultato per Applicazione, (3) registrare **A**, variare unicamente il controllo previsto e registrare **B** sullo **stesso dataset**, rispondendo a una domanda interpretativa e al confronto numerico A/B. Ogni snapshot è una **lettura descrittiva**, NON una replica statistica indipendente; il menu selezionato non crea da solo una nuova misura.

Le 3 sfide kriging, ex pilota, sono riscritte sul medesimo laboratorio: sensore aggiuntivo/varianza, previsione contro incertezza a geometria variata, range assunto con geometria e campo costanti.

La verifica delle sfide utilizza il contatore interno della versione dei punti. Se cambiano posizioni, valori o numerosità durante un confronto A/B, la comparazione è respinta come non controllata. Il punteggio resta formativo e locale; non è un test validato dell'apprendimento.

## Riproducibilità: cosa è mantenuto, cosa no

- I pulsanti **Esporta i punti (CSV)** e **Riproduci in R** usano **lo stesso snapshot corrente** dei punti, coordinate e valori. Lo script R illustra le statistiche corrispondenti (Moran, quadranti LISA, KDE, variogramma, kriging al centro, OLS e Moran residui), dichiarando limiti espliciti.
- Gli algoritmi numerici originali dei 31 laboratori non spaziali e i moduli condivisi spaziali non sono stati sostituiti da simulazioni non verificate. I sei **vecchi front-end e i loro comandi** sono però intenzionalmente rimossi.
- **I nuovi script R dinamici non sono stati eseguiti in R in questa fase**; la corrispondenza numerica R/JS completa è una verifica aperta della Macrofase A. Non confondere la validazione precedente dei motori legacy con quella delle nuove mappe.
- I vecchi test basati sui controlli GUI eliminati sono stati **riscritti** contro la nuova GUI; i test matematici indipendenti dei motori condivisi sono rimasti attivi.

## Test eseguibili

Dalla cartella del progetto, dopo aver installato Node, Python+NumPy/SciPy e Playwright/Chromium secondo le relative esigenze:

```sh
python3 build.py
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_science_independent_31.py
python3 tests/test_scientific_claims.py
python3 tests/test_spatial_studio_browser.py
python3 tests/test_spatial_studio_interactions.py
python3 tests/test_spatial_unified_challenges.py
```

La CI esegue la build, i test JS, i controlli scientifici indipendenti e i tre gruppi di test browser. Il workflow remoto deve essere verificato **dopo** il push: il successo locale non equivale al successo su GitHub Actions o su Safari reale.

## Limiti scientifici da non nascondere

Il ridisegno privilegia *intuizione e manipolazione*; è quindi intenzionale la rimozione dall'interfaccia di alcune procedure più avanzate presenti nei sei vecchi esperimenti: permutazioni e test areali, test hotspot multipli, simulazioni CSR/Thomas/inibizione e relativi envelope, esperimenti Monte Carlo su variogrammi, confronto kriging–IDW e simulazione ML SAR/SEM con CV geografica. Alcuni argomenti restano nella teoria; **non sono attualmente esperimenti eseguibili nella Parte VIII unificata**. La Macrofase A dovrà decidere se reintrodurre in maniera nativa e pertinente un sottoinsieme di queste analisi, senza ripristinare due pannelli separati.

### Piano mantenuto

Dopo il collaudo del ridisegno: **A** audit teorico/scientifico delle 31 lezioni + validazione R completa + 93 Challenges; **B** integrazione con il corso R e configurazioni riproducibili; **C** versione inglese e validazione didattica. Nessuna modifica a questo ordine.
