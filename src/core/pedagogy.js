/* StatAtlas — guide operative e approfondimenti metodologici aggiuntivi.
 * Ogni scheda è specifica del laboratorio e non modifica gli algoritmi numerici.
 */
var SA = window.SA || (window.SA = {});
SA.pedagogy = {
  "distribuzioni": {
    "guida": [
      "Scegli una legge e imposta i parametri; osserva come cambiano densità (o massa), ripartizione e momenti.",
      "Fissa un intervallo (a,b] e confronta la probabilità teorica e la frequenza relativa nel campione, facendo attenzione ai bordi per le leggi discrete.",
      "Usa Passo o Avvia per generare osservazioni: segui istogramma, ripartizione empirica e tabella.",
      "Ripeti cambiando numerosità o distribuzione; verifica anche i casi con momenti non esistenti."
    ]
  },
  "bivariata": {
    "guida": [
      "Seleziona il meccanismo bivariato e modifica la correlazione o la forma della dipendenza.",
      "Osserva simultaneamente scatterplot, marginali e fascia condizionante.",
      "Modifica il punto x₀ e l’ampiezza della fascia: confronta la distribuzione condizionata simulata con la teoria.",
      "Ripeti per distinguere correlazione nulla, indipendenza e regressione non lineare."
    ]
  },
  "simulazione": {
    "guida": [
      "Scegli la modalità inversione o integrazione Monte Carlo e verifica l’obiettivo dell’esperimento.",
      "Se usi l’inversione, varia il valore uniforme e segui la trasformazione dalla ripartizione al campione.",
      "Se integri, confronta il metodo della media e hit-or-miss sugli stessi numeri casuali.",
      "Usa Passo o Completa e confronta precisione empirica, errore standard e valore teorico."
    ]
  },
  "lgn-tcl": {
    "guida": [
      "Seleziona la distribuzione generatrice e la numerosità campionaria n.",
      "Osserva separatamente le traiettorie delle medie e la distribuzione delle medie standardizzate.",
      "Genera campioni progressivamente e confronta istogramma, normale limite e banda teorica.",
      "Sperimenta con asimmetria, code pesanti e Cauchy per distinguere ipotesi dei teoremi e loro fallimenti."
    ]
  },
  "adattamento": {
    "guida": [
      "Seleziona il modello ipotizzato e la distribuzione da cui provengono realmente i dati.",
      "Controlla QQ plot, frequenze attese, ampiezza delle classi e requisiti del test χ².",
      "Ripeti il test per valutare la frequenza di rifiuto e confronta il p-value asintotico con quello bootstrap.",
      "Varia numerosità e parametri stimati per osservare come cambia la calibrazione."
    ]
  },
  "stimatori": {
    "guida": [
      "Scegli una popolazione e identifica il parametro che desideri stimare.",
      "Seleziona gli stimatori da confrontare sullo stesso campione.",
      "Avvia repliche e leggi le distribuzioni campionarie, la distorsione e l’errore quadratico medio.",
      "Aumenta n o introduci code pesanti: valuta efficienza, stabilità e robustezza."
    ]
  },
  "fisher": {
    "guida": [
      "Scegli un modello e un campione; identifica il parametro da stimare.",
      "Muovi il parametro e osserva log-verosimiglianza, score e curvatura locale.",
      "Confronta informazione osservata e attesa; ripeti i campioni per valutare le identità teoriche.",
      "Prova i casi al bordo o non regolari prima di interpretare gli intervalli asintotici."
    ]
  },
  "intervalli": {
    "guida": [
      "Scegli parametro, modello e metodo di costruzione dell’intervallo.",
      "Osserva un singolo intervallo e verifica se contiene il parametro vero.",
      "Genera molti campioni: confronta copertura empirica, copertura teorica e ampiezza.",
      "Varia n e porta il parametro vicino al bordo per vedere differenze tra metodi esatti e approssimati."
    ]
  },
  "test": {
    "guida": [
      "Specifica ipotesi nulla, alternativa, livello α e dimensione del campione.",
      "Osserva regione critica, statistiche e distribuzioni sotto H₀ e H₁.",
      "Esegui test ripetuti e registra frequenze di rifiuto, errori e potenza.",
      "Modifica l’effetto o passa fra test unilaterale e bilaterale mantenendo distinta la calibrazione del livello."
    ]
  },
  "regressione": {
    "guida": [
      "Genera i dati e osserva la retta stimata e le bande per media e previsione.",
      "Sposta un punto dal centro ai bordi: verifica come cambiano stima e leverage.",
      "Ripeti con diverse distribuzioni degli errori e confronta coperture e punti influenti.",
      "Utilizza i riepiloghi per distinguere incertezza sui coefficienti e previsione individuale."
    ]
  },
  "regressione-lp": {
    "guida": [
      "Seleziona la distribuzione degli errori e il criterio Lp, L1 o L2.",
      "Confronta sugli stessi dati le rette risultanti, soprattutto in presenza di outlier.",
      "Genera repliche per analizzare distribuzioni delle pendenze ed efficienza relativa.",
      "Varia p e la contaminazione per vedere quale criterio paga in precisione e quale guadagna in robustezza."
    ]
  },
  "glm": {
    "guida": [
      "Scegli famiglia, link e coefficienti veri del modello.",
      "Osserva relazione tra predittore lineare, media condizionata e risposta osservata.",
      "Genera nuovi campioni e confronta bias e dispersione delle stime con la teoria asintotica.",
      "Esplora la separazione logistica o campioni piccoli prima di interpretare Wald e IRLS."
    ]
  },
  "arma": {
    "guida": [
      "Scegli AR, MA o ARMA e imposta i coefficienti.",
      "Osserva la serie generata e confronta ACF/PACF teoriche e campionarie.",
      "Genera repliche per vedere la variabilità delle autocorrelazioni e il ruolo della lunghezza T.",
      "Avvicina le radici al cerchio unitario: verifica stazionarietà, invertibilità e memoria."
    ]
  },
  "quantilica": {
    "guida": [
      "Scegli il quantile τ e genera osservazioni da un modello con possibile eteroschedasticità.",
      "Confronta retta quantilica e media condizionata, soprattutto lungo la scala di x.",
      "Modifica il punto anomalo e osserva come cambia la perdita check e la stima.",
      "Ripeti per osservare variabilità dei coefficienti e differenze fra quantili."
    ]
  },
  "penalizzata": {
    "guida": [
      "Scegli correlazione delle covariate e rapporto segnale-rumore.",
      "Varia il parametro λ e confronta percorsi ridge, lasso ed elastic net.",
      "Osserva geometria dei vincoli, coefficienti azzerati ed errore di predizione.",
      "Ripeti la simulazione per separare distorsione, varianza e selezione instabile."
    ]
  },
  "spline": {
    "guida": [
      "Genera un modello non lineare e seleziona spline o kernel.",
      "Modifica flessibilità, basi, penalità o bandwidth e osserva la curva adattata.",
      "Confronta sulla stessa scala la funzione vera, le stime e i residui.",
      "Esegui repliche e validazione per verificare compromesso distorsione-varianza e selezione della complessità."
    ]
  },
  "segmentata": {
    "guida": [
      "Seleziona un modello con o senza vero cambiamento di pendenza.",
      "Varia breakpoint, entità della discontinuità nella derivata e livello di rumore.",
      "Confronta stima segmentata, regressione lineare e intervalli per il breakpoint.",
      "Ripeti quando il cambio è debole o vicino ai bordi: verifica identificazione e stabilità inferenziale."
    ]
  },
  "validazione": {
    "guida": [
      "Seleziona meccanismo generatore, numerosità e complessità predittiva.",
      "Confronta errore di training, di validazione e su test indipendente.",
      "Ripeti la scelta degli iperparametri, osservando l’ottimismo della selezione.",
      "Prova la procedura corretta e quella con leakage: confronta prestazione apparente e generalizzazione."
    ]
  },
  "knn": {
    "guida": [
      "Seleziona due popolazioni e modifica il numero di vicini k.",
      "Osserva come i punti del campione determinano la frontiera di decisione.",
      "Confronta errore di training e test su campioni ripetuti.",
      "Cambia la scala delle covariate e verifica come la distanza influenza le classificazioni."
    ]
  },
  "alberi": {
    "guida": [
      "Seleziona una distribuzione di classificazione e osserva il primo split dell’albero.",
      "Varia profondità e numero di alberi per confrontare singolo CART, bagging e random forest.",
      "Monitora partizioni, errore di test e stima out-of-bag quando disponibile.",
      "Modifica mtry e ripeti i campioni per valutare decorrelazione degli alberi e stabilità."
    ]
  },
  "boost": {
    "guida": [
      "Seleziona regressione o classificazione e un segnale generatore.",
      "Osserva la predizione iniziale, gli pseudo-residui e il contributo del nuovo albero.",
      "Premi Passo per aggiungere un albero; confronta le curve di training e validazione.",
      "Varia learning rate, profondità e numero di passi: individua la selezione su validation e controlla il test indipendente."
    ]
  },
  "reti-neurali": {
    "guida": [
      "Scegli dataset e architettura della rete con numero di neuroni e livelli.",
      "Osserva forward pass, funzione di perdita e frontiera decisionale.",
      "Avvia epoche di addestramento e confronta training e validation.",
      "Cambia inizializzazione e regolarizzazione per esplorare instabilità, saturazione e overfitting."
    ]
  },
  "pca": {
    "guida": [
      "Seleziona struttura di covarianza, dimensione e standardizzazione.",
      "Osserva assi principali, scores e varianza spiegata sullo stesso dataset.",
      "Riduci il numero di componenti e verifica l’errore di ricostruzione.",
      "Genera repliche o outlier e confronta stabilità delle direzioni con quella dei sottospazi."
    ]
  },
  "clustering": {
    "guida": [
      "Seleziona geometria e numero di gruppi generativi.",
      "Sposta i centroidi iniziali e osserva le iterazioni di Lloyd.",
      "Confronta partizioni k-means e gerarchiche sui medesimi punti.",
      "Modifica K e la forma dei cluster: verifica stabilità, funzione obiettivo e distanza dalle etichette vere."
    ]
  },
  "dbscan": {
    "guida": [
      "Scegli punti a semiluna, cerchi, gruppi a densità diverse o rumore.",
      "Modifica ε e minPts, identificando core, punti di bordo e rumore.",
      "Premi Passo per seguire l’espansione del cluster e usa il grafico delle k-distanze.",
      "Confronta DBSCAN, k-means e Ward mediante ARI e silhouette, ricordando i limiti delle metriche."
    ]
  },
  "moran": {
    "guida": [
      "Seleziona un meccanismo generatore e osserva la disposizione dei valori sulla griglia.",
      "Clicca sulle celle o modifica vicinato e pesi: confronta mappa e Moran scatterplot.",
      "Scegli numero di permutazioni e alternativa; premi Passo o Avvia per generare la distribuzione nulla.",
      "Confronta statistica e p-value, poi rimuovi un eventuale trend vero per analizzare i residui."
    ]
  },
  "lisa": {
    "guida": [
      "Genera hotspot o valori eterogenei e seleziona un territorio sulla mappa.",
      "Confronta quadrante HH/LL/HL/LH, statistica locale e distribuzione permutazionale condizionale.",
      "Seleziona un aggiustamento dei p-value e avvia le permutazioni su comando.",
      "Modifica la zonizzazione e osserva cosa cambia per MAUP, senza confondere quadrante e significatività."
    ]
  },
  "processi-puntuali": {
    "guida": [
      "Scegli Poisson omogeneo, Thomas, inibizione o intensità non omogenea.",
      "Esamina la realizzazione; aggiungi o rimuovi punti mantenendo chiara la natura della modifica manuale.",
      "Confronta vicino più prossimo, conteggi e funzione L(r)−r.",
      "Premi Avvia o Passo per confrontare la statistica con le simulazioni CSR ed esplora gli effetti di bordo."
    ]
  },
  "variogrammi": {
    "guida": [
      "Scegli modello di covarianza, range, nugget e anisotropia.",
      "Clicca sui sensori e osserva distanza, differenza quadratica e classe del variogramma.",
      "Confronta variogramma empirico e teorico, controllando quanti punti sostengono ciascun lag.",
      "Premi Passo o Avvia per replicare il campo a siti fissi e confrontare la variabilità tra realizzazioni."
    ]
  },
  "kriging": {
    "guida": [
      "Scegli simple/ordinary kriging o IDW, poi osserva superficie stimata e varianza.",
      "Aggiungi, sposta o rimuovi sensori senza cambiare il campo vero sottostante.",
      "Mostra il sito di maggiore incertezza e confronta l’effetto di un nuovo sensore.",
      "Premi Passo o Avvia per studiare calibrazione e variazione dell’errore su repliche."
    ]
  },
  "regressione-spaziale": {
    "guida": [
      "Scegli OLS, SAR o SEM e modifica il processo generatore dei dati.",
      "Confronta risposta, residui e profili di verosimiglianza sulla stessa griglia territoriale.",
      "Mostra fold casuali e blocchi geografici, scegli k e confronta l’errore predittivo fuori campione.",
      "Premi Passo o Avvia per nuove repliche di validazione, distinguendo effetti SAR da coefficienti."
    ]
  }
};
