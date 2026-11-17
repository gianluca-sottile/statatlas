/* StatAtlas · Macrofase B — ponte curricolare con From Data to Models with R.
 * Solo riferimenti: il corso è esterno e richiede rete; l'atlante resta offline.
 * Il mapping è tratto dalla navigazione di _quarto.yml (master, 2026-11-16).
 */
var SA = window.SA || (window.SA = {});
SA.courseBridge = (function () {
  var BASE = "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/";
  var LESSONS = {
  "23": {
    "num": 23,
    "title": "Descrivere due variabili",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/05-descriptive/23-two-variables.html",
    "lang": "it"
  },
  "25": {
    "num": 25,
    "title": "Grafici per le distribuzioni",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/25-distribution-plots.html",
    "lang": "it"
  },
  "27": {
    "num": 27,
    "title": "Correlazione",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/06-visualization/27-correlation.html",
    "lang": "it"
  },
  "28": {
    "num": 28,
    "title": "Casualità e simulazione",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/28-randomness-simulation.html",
    "lang": "it"
  },
  "29": {
    "num": 29,
    "title": "Distribuzioni di probabilità",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/29-distributions.html",
    "lang": "it"
  },
  "30": {
    "num": 30,
    "title": "Distribuzioni campionarie",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/30-sampling-distributions.html",
    "lang": "it"
  },
  "31": {
    "num": 31,
    "title": "Bootstrap",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/07-probability/31-bootstrap.html",
    "lang": "it"
  },
  "32": {
    "num": 32,
    "title": "Intervalli di confidenza",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/32-confidence-intervals.html",
    "lang": "it"
  },
  "33": {
    "num": 33,
    "title": "La logica del test d’ipotesi",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/33-hypothesis-testing.html",
    "lang": "it"
  },
  "34": {
    "num": 34,
    "title": "Test t: confrontare medie",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/34-t-tests.html",
    "lang": "it"
  },
  "35": {
    "num": 35,
    "title": "Proporzioni e test chi-quadrato",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/35-proportions-chisq.html",
    "lang": "it"
  },
  "36": {
    "num": 36,
    "title": "Test non parametrici",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/08-inference/36-nonparametric-tests.html",
    "lang": "it"
  },
  "38": {
    "num": 38,
    "title": "Regressione lineare semplice",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/38-simple-regression.html",
    "lang": "it"
  },
  "39": {
    "num": 39,
    "title": "Regressione multipla",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/39-multiple-regression.html",
    "lang": "it"
  },
  "40": {
    "num": 40,
    "title": "Selezione e validazione del modello",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/40-model-selection.html",
    "lang": "it"
  },
  "41": {
    "num": 41,
    "title": "Regressione logistica",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/41-logistic-regression.html",
    "lang": "it"
  },
  "42": {
    "num": 42,
    "title": "Regressione di Poisson",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/42-poisson-regression.html",
    "lang": "it"
  },
  "43": {
    "num": 43,
    "title": "Regressione penalizzata",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/09-regression/43-penalized-regression.html",
    "lang": "it"
  },
  "44": {
    "num": 44,
    "title": "Flusso di lavoro del machine learning",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/44-ml-workflow.html",
    "lang": "it"
  },
  "45": {
    "num": 45,
    "title": "Alberi decisionali",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/45-decision-trees.html",
    "lang": "it"
  },
  "46": {
    "num": 46,
    "title": "Random forest",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/46-random-forests.html",
    "lang": "it"
  },
  "47": {
    "num": 47,
    "title": "Gradient boosting",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/47-gradient-boosting.html",
    "lang": "it"
  },
  "49": {
    "num": 49,
    "title": "Confrontare e scegliere i modelli",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/10-ml/49-model-comparison.html",
    "lang": "it"
  },
  "50": {
    "num": 50,
    "title": "Analisi delle componenti principali",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/11-dimred/50-pca.html",
    "lang": "it"
  },
  "55": {
    "num": 55,
    "title": "Clustering: quadro generale",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/55-clustering-intro.html",
    "lang": "it"
  },
  "56": {
    "num": 56,
    "title": "Clustering k-means",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/56-kmeans.html",
    "lang": "it"
  },
  "57": {
    "num": 57,
    "title": "Clustering gerarchico",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/57-hierarchical.html",
    "lang": "it"
  },
  "58": {
    "num": 58,
    "title": "DBSCAN",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/12-clustering/58-dbscan.html",
    "lang": "it"
  },
  "62": {
    "num": 62,
    "title": "Deep neural networks for tabular data",
    "url": "https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/lessons/13-deep-learning/62-dnn-tabular.html",
    "lang": "en"
  }
};
  var MAP = {
  "distribuzioni": {
    "lessons": [
      29,
      25
    ],
    "alignment": "direct",
    "question": "Perché la probabilità di un intervallo non coincide sempre con l’altezza della densità?",
    "experiment": "Varia tipo di legge e intervallo, poi confronta probabilità teorica e frequenza relativa al crescere del campione.",
    "check": "Confronta le funzioni p* e q* della legge selezionata con la frequenza simulata.",
    "caution": "Nelle variabili discrete esplicita quali estremi sono inclusi."
  },
  "bivariata": {
    "lessons": [
      23,
      27
    ],
    "alignment": "direct",
    "question": "Una correlazione nulla implica indipendenza?",
    "experiment": "Confronta un esempio normale bivariato con un meccanismo di dipendenza non lineare.",
    "check": "Riproduci scatterplot, correlazione e media condizionata dallo script esportato.",
    "caution": "La formula normale condizionata vale sotto normalità congiunta."
  },
  "simulazione": {
    "lessons": [
      28,
      29
    ],
    "alignment": "direct",
    "question": "Una singola uniforme può generare dati da una distribuzione assegnata?",
    "experiment": "Segui l’inversione della CDF e confronta due stimatori Monte Carlo sullo stesso problema.",
    "check": "Verifica le stime e ripeti la simulazione con lo stesso seed.",
    "caution": "Non trattare due stime correlate come repliche indipendenti."
  },
  "lgn-tcl": {
    "lessons": [
      30,
      28
    ],
    "alignment": "direct",
    "question": "La media campionaria tende sempre a una normale?",
    "experiment": "Confronta campioni normali o asimmetrici con campioni Cauchy; varia n.",
    "check": "Riproduci medie e quantili empirici; verifica quando ha senso standardizzare.",
    "caution": "Distingui convergenza quasi certa e convergenza in distribuzione."
  },
  "adattamento": {
    "lessons": [
      35,
      29
    ],
    "alignment": "foundation",
    "question": "Una discrepanza visibile comporta necessariamente il rifiuto di H0?",
    "experiment": "Cambia n e modello generatore, confrontando istogramma, QQ plot e test.",
    "check": "Controlla frequenze attese e p-value Monte Carlo nel codice R.",
    "caution": "Il corso tratta il chi-quadrato, non l’intero apparato DKW/QQ del laboratorio."
  },
  "stimatori": {
    "lessons": [
      30,
      31
    ],
    "alignment": "foundation",
    "question": "Quale stimatore è preferibile sotto contaminazione?",
    "experiment": "Confronta media, mediana e ML sugli stessi campioni con e senza outlier.",
    "check": "Calcola bias, varianza e MSE da repliche con seed fissato.",
    "caution": "Efficienza e robustezza richiedono una specifica popolazione generatrice."
  },
  "fisher": {
    "lessons": [
      29,
      32
    ],
    "alignment": "foundation",
    "question": "L’informazione osservata coincide con quella attesa in un campione finito?",
    "experiment": "Varia n e il parametro in un modello regolare; osserva score e curvatura.",
    "check": "Verifica il valore dello score e della curvatura in R sullo stesso dataset.",
    "caution": "La lezione del corso è propedeutica: non contiene una trattazione completa di Fisher."
  },
  "intervalli": {
    "lessons": [
      32,
      35
    ],
    "alignment": "direct",
    "question": "Un livello nominale del 95% garantisce la copertura del 95% per n piccolo?",
    "experiment": "Confronta Wald, Wilson e metodi esatti vicino al bordo del parametro.",
    "check": "Riproduci la frequenza di copertura con lo script R a seed fissato.",
    "caution": "Non confondere probabilità di copertura procedurale con probabilità sul parametro fissato."
  },
  "test": {
    "lessons": [
      33,
      34
    ],
    "alignment": "direct",
    "question": "Come cambia la potenza se si aumenta n a livello fissato?",
    "experiment": "Fissa alfa, modifica l’effetto e poi n; osserva errori e frequenza dei rifiuti.",
    "check": "Calcola la potenza teorica e confrontala con la frequenza stimata.",
    "caution": "La potenza è funzione del parametro sotto l’alternativa."
  },
  "regressione": {
    "lessons": [
      38,
      39
    ],
    "alignment": "direct",
    "question": "Un’osservazione lontana in x è necessariamente influente?",
    "experiment": "Sposta un punto e confronta leverage, residuo e distanza di Cook.",
    "check": "Riproduci coefficienti OLS e statistiche diagnostiche in R.",
    "caution": "Distingui intervallo per la risposta media e intervallo di previsione."
  },
  "regressione-lp": {
    "lessons": [
      38,
      36
    ],
    "alignment": "foundation",
    "question": "Quale perdita attenua l’effetto di un outlier verticale?",
    "experiment": "Aggiungi contaminazione e confronta rette L1, L2 e Lp sugli stessi dati.",
    "check": "Confronta i criteri ottimizzati e i residui in R.",
    "caution": "I fondamenti del corso non equivalgono a una lezione dedicata agli M-stimatori."
  },
  "glm": {
    "lessons": [
      41,
      42
    ],
    "alignment": "direct",
    "question": "Quale relazione lega media e predittore nella logistica e nel Poisson?",
    "experiment": "Confronta risposta binaria e conteggi; modifica entità e struttura del segnale.",
    "check": "Confronta link, fitted values e coefficienti con glm() in R.",
    "caution": "Le interpretazioni dei coefficienti dipendono dal link."
  },
  "arma": {
    "lessons": [
      27,
      28
    ],
    "alignment": "foundation",
    "question": "Una correlazione nel tempo ha lo stesso significato di una correlazione tra unità?",
    "experiment": "Varia i parametri autoregressivi e confronta ACF teorica ed empirica.",
    "check": "Controlla in R la simulazione e la funzione di autocorrelazione.",
    "caution": "Il corso R non include una lezione dedicata ai modelli ARMA."
  },
  "quantilica": {
    "lessons": [
      38,
      36
    ],
    "alignment": "foundation",
    "question": "Una relazione sulla mediana può differire da quella sulla media?",
    "experiment": "Confronta rette per quantili differenti e osserva un caso eteroschedastico.",
    "check": "Verifica con quantreg la check loss e le pendenze per tau diversi.",
    "caution": "Le lezioni collegate forniscono prerequisiti, non l’intera teoria quantilica."
  },
  "penalizzata": {
    "lessons": [
      43,
      40
    ],
    "alignment": "direct",
    "question": "Aumentando lambda, tutti i coefficienti devono ridursi nello stesso modo?",
    "experiment": "Confronta ridge, lasso ed elastic net mantenendo identici i dati.",
    "check": "Controlla la normalizzazione della loss e i coefficienti contro R.",
    "caution": "Standardizzazione, intercetta e fattore 1/n cambiano il significato di lambda."
  },
  "spline": {
    "lessons": [
      40,
      38
    ],
    "alignment": "foundation",
    "question": "Una curva più flessibile predice necessariamente meglio fuori campione?",
    "experiment": "Aumenta la complessità della spline e confronta errore di training e CV.",
    "check": "Riproduci i criteri di fitting e validazione in R.",
    "caution": "Non esiste qui una lezione Quarto dedicata alle P-spline."
  },
  "segmentata": {
    "lessons": [
      38,
      39
    ],
    "alignment": "foundation",
    "question": "Quando è identificabile il punto di cambio di pendenza?",
    "experiment": "Varia l’intensità della variazione di pendenza e osserva il profilo RSS.",
    "check": "Confronta la stima del breakpoint con la ricerca su griglia in R.",
    "caution": "Sotto assenza di cambiamento il breakpoint non è identificabile."
  },
  "validazione": {
    "lessons": [
      40,
      44
    ],
    "alignment": "direct",
    "question": "Perché l’errore di training è ottimista?",
    "experiment": "Aumenta la complessità e confronta training, test e cross-validation.",
    "check": "Ricostruisci fold e previsioni out-of-fold in R.",
    "caution": "Non usare il test set per scegliere la complessità."
  },
  "knn": {
    "lessons": [
      44,
      49
    ],
    "alignment": "foundation",
    "question": "Perché la standardizzazione può cambiare il vicinato?",
    "experiment": "Modifica k e la scala dei predittori, poi osserva decisioni ed errore.",
    "check": "Calcola le distanze e l’insieme dei vicini con R.",
    "caution": "Il corso contiene il workflow ML, ma non una lezione autonoma su kNN."
  },
  "alberi": {
    "lessons": [
      45,
      46
    ],
    "alignment": "direct",
    "question": "Perché bagging e forest riducono l’instabilità dell’albero singolo?",
    "experiment": "Cambia numero di alberi e mtry osservando test/OOB e variabilità.",
    "check": "Replica lo stesso split, bootstrap e aggregazione in R.",
    "caution": "Il confronto OOB non sostituisce un test set indipendente."
  },
  "boost": {
    "lessons": [
      47,
      40
    ],
    "alignment": "direct",
    "question": "Perché shrinkage e numero di iterazioni vanno scelti insieme?",
    "experiment": "Confronta due learning rate sugli stessi dati e checkpoint.",
    "check": "Riproduci la sequenza di errori e pseudo-residui in R.",
    "caution": "Il confronto A/B non è una prova statistica con repliche indipendenti."
  },
  "reti-neurali": {
    "lessons": [
      44,
      62
    ],
    "alignment": "foundation",
    "question": "Perché due inizializzazioni possono convergere a soluzioni differenti?",
    "experiment": "Mantieni dati e architettura, poi varia seed e learning rate.",
    "check": "Confronta loss e gradienti via differenze finite in R.",
    "caution": "La lezione 62 è solo in inglese; il corso italiano offre il prerequisito ML."
  },
  "pca": {
    "lessons": [
      50,
      27
    ],
    "alignment": "direct",
    "question": "La massima varianza è sempre la direzione migliore per prevedere y?",
    "experiment": "Confronta matrice non standardizzata e standardizzata, poi ricostruzione.",
    "check": "Calcola eigen/SVD e quota di varianza spiegata in R.",
    "caution": "Le componenti PCA sono non supervisionate; il segno è arbitrario."
  },
  "clustering": {
    "lessons": [
      56,
      57
    ],
    "alignment": "direct",
    "question": "Due inizializzazioni k-means producono sempre gli stessi gruppi?",
    "experiment": "Varia seed, numero di gruppi e criterio di linkage.",
    "check": "Confronta WCSS, membership e dendrogramma in R.",
    "caution": "Un cluster statistico non implica un gruppo reale noto."
  },
  "dbscan": {
    "lessons": [
      58,
      55
    ],
    "alignment": "direct",
    "question": "Quale combinazione epsilon/minPts distingue cluster e rumore?",
    "experiment": "Varia epsilon e minPts per lune, cerchi e campioni con outlier.",
    "check": "Confronta core/border/noise e la partizione in R.",
    "caution": "I punti di bordo possono dipendere dalla regola di assegnazione in casi ambigui."
  },
  "moran": {
    "lessons": [
      27,
      23
    ],
    "alignment": "foundation",
    "question": "Un pattern positivo in mappa implica sempre significatività statistica?",
    "experiment": "Trasforma una configurazione alternata in una a gruppi e osserva I.",
    "check": "Riproduci I con la stessa matrice kNN e normalizzazione in R.",
    "caution": "Il corso R non contiene una lezione dedicata all’autocorrelazione spaziale."
  },
  "lisa": {
    "lessons": [
      27,
      50
    ],
    "alignment": "foundation",
    "question": "Una classe HH descrittiva equivale a un hotspot significativo?",
    "experiment": "Aggiungi punti alti/bassi vicini e confronta quadranti locali.",
    "check": "Ricostruisci standardizzazione e lag locale in R.",
    "caution": "La mappa unificata non stima p-value locali; non dichiarare significatività."
  },
  "processi-puntuali": {
    "lessons": [
      28,
      25
    ],
    "alignment": "foundation",
    "question": "Un raggruppamento osservato basta a rifiutare CSR?",
    "experiment": "Aggiungi un gruppo di eventi e osserva KDE e L(r)-r.",
    "check": "Riproduci distanze tra eventi e KDE dal campione esportato.",
    "caution": "La mappa non produce un envelope Monte Carlo formale."
  },
  "variogrammi": {
    "lessons": [
      27,
      38
    ],
    "alignment": "foundation",
    "question": "Come varia la semivarianza empirica con la distanza?",
    "experiment": "Modifica posizione e valore di un sensore, mantenendo gli altri costanti.",
    "check": "Ricalcola coppie e classi di distanza in R.",
    "caution": "La superficie IDW non è un variogramma né un kriging."
  },
  "kriging": {
    "lessons": [
      38,
      40
    ],
    "alignment": "foundation",
    "question": "Aggiungere un sensore vicino riduce l’incertezza condizionale?",
    "experiment": "Posiziona un nuovo sensore e osserva previsione e varianza.",
    "check": "Confronta sistema lineare e varianza condizionale in R.",
    "caution": "La riduzione vale sotto il modello di covarianza specificato."
  },
  "regressione-spaziale": {
    "lessons": [
      39,
      40
    ],
    "alignment": "foundation",
    "question": "L’aggiunta delle coordinate assorbe sempre la dipendenza spaziale residua?",
    "experiment": "Confronta OLS Y~X e OLS Y~X+x+y sul medesimo campione.",
    "check": "Confronta R2 e Moran dei residui tra i due modelli in R.",
    "caution": "Il laboratorio non adatta SAR/SEM nella mappa unificata."
  }
};
  // The Italian and English course editions share the same lesson paths.
  // The optional deep-learning track (lesson 62) has no Italian edition.
  // Return a fresh localized descriptor, never mutate the source catalogue.
  function lesson(n, requestedLocale) {
    var source = LESSONS[n];
    if (!source) return null;
    if (requestedLocale !== 'it' && requestedLocale !== 'en') return source;
    var english = requestedLocale === 'en' || source.lang === 'en';
    return {
      num: source.num,
      title: english ? LESSON_TITLES_EN[n] : source.title,
      url: english ? source.url.replace(BASE + 'it/', BASE) : source.url,
      lang: english ? 'en' : 'it'
    };
  }
  var LESSON_TITLES_EN = {
    23:'Describing two variables',25:'Distribution plots',27:'Correlation',28:'Randomness and simulation',
    29:'Probability distributions',30:'Sampling distributions',31:'Bootstrap',32:'Confidence intervals',
    33:'The logic of hypothesis tests',34:'Comparing means: t tests',35:'Proportions and chi-square tests',
    36:'Nonparametric tests',38:'Simple linear regression',39:'Multiple regression',
    40:'Model selection and validation',41:'Logistic regression',42:'Poisson regression',
    43:'Penalized regression',44:'The machine-learning workflow',45:'Decision trees',46:'Random forests',
    47:'Gradient boosting',49:'Comparing and selecting models',50:'Principal component analysis',
    55:'Introduction to clustering',56:'k-means clustering',57:'Hierarchical clustering',58:'DBSCAN',
    62:'Deep neural networks for tabular data'
  };
  function isEN() { return !!(SA.i18n && SA.i18n.isEnglish()); }
  function enActivity(id) {
    var d=SA.english && SA.english.labs[id], goals=SA.englishGoals && SA.englishGoals[id];
    if (!d) throw Error('Missing English learning bridge for '+id);
    return {
      question:d.question, experiment:d.experiment,
      check:'With the displayed settings and seed, export the R script, reproduce the simulated summary and compare an independently computed numerical quantity. '+(goals ? goals[2]+'.' : ''),
      caution:d.limit
    };
  }
  function worksheet(id, info) {
    var e=MAP[id]; if(!e) return '';
    if (isEN()) {
      var d=SA.english.labs[id],g=SA.englishGoals[id],act=enActivity(id);
      var linksEN=e.lessons.map(function(n){var l=lesson(n,'en');return '- Lesson '+n+' — '+l.title+': '+l.url;}).join('\n');
      return [
        '# StatAtlas — Laboratory '+info.lab.num+' · '+d.title,
        '', '## Related R lessons', linksEN,
        '', '**Curricular relationship:** '+(e.alignment==='direct'?'direct thematic connection':'foundational topics only; the specific statistical method may not be covered in the R lesson'),
        '', '## Research question',act.question,
        '', '## Interactive experiment',act.experiment,
        '', '## Learning objectives',g.map(function(x){return '- '+x;}).join('\n'),
        '', '## Reproducing the experiment in R',
        'Download the R script generated from the current simulation state. Run it with the stated seed and parameter settings.',
        act.check,
        '', '## Interpretation',d.essential,
        '', '## Assumptions and limitations',act.caution,
        '', '## What to submit',
        'Report: (1) parameter values and seed; (2) a prediction made before observing the data; (3) a chart or table; (4) one R comparison; (5) statistical interpretation; and (6) one explicit limitation.',
        '', '## Self-assessment',
        '- [ ] I reported the complete model and seed.',
        '- [ ] I distinguished observed estimates from theoretical expectations.',
        '- [ ] I checked at least one value using R.',
        '- [ ] I did not mistake sequential checkpoints for independent replicates.',
        '', 'External R course links require Internet access. Links follow the selected language; the optional deep-learning lesson is English-only. StatAtlas itself runs offline.'
      ].join('\n')+'\n';
    }
    var lessons=e.lessons.map(function(n){var l=lesson(n,'it');return '- Lezione '+l.num+' — '+l.title+' ('+l.lang.toUpperCase()+'): '+l.url;}).join('\n');
    return [
      '# StatAtlas — Scheda di laboratorio '+info.lab.num+' · '+info.lab.title,
      '', '## Collegamento al corso R', lessons,
      '', '**Tipo di allineamento:** '+(e.alignment==='direct'?'trattazione direttamente pertinente':'prerequisiti e concetti di supporto; il metodo specifico può non essere trattato nel corso'),
      '', '## Prima di sperimentare', e.question,
      '', '## Esperimento nel browser', e.experiment,
      '', '## Riproducibilità in R', 'Scarica lo script R generato da StatAtlas mentre il campione è visibile. Eseguilo con lo stesso seed e verifica:', e.check,
      '', '## Interpretazione e limitazioni', e.caution,
      '', '## Consegna', 'Riporta: (1) parametri e seed; (2) una previsione; (3) uno screenshot o una tabella; (4) un risultato numerico in R; (5) interpretazione; (6) una limitazione.',
      '', '## Autovalutazione', '- [ ] Ho fissato e dichiarato il seed.', '- [ ] Ho distinto dati, stima e risultato teorico.', '- [ ] Ho controllato uno stesso output in R.', '- [ ] Non ho interpretato come indipendenti checkpoint successivi.',
      '', 'Nota: i collegamenti al corso richiedono la connessione; StatAtlas può funzionare offline.'
    ].join('\n')+'\n';
  }
  function mount(page, id, info) {
    var entry=MAP[id],head=page.querySelector('.lab-head');
    if(!entry||!head||page.querySelector('[data-course-bridge]'))return;
    var english=isEN(),act=english?enActivity(id):entry,el=SA.ui.el;
    var links=entry.lessons.map(function(n){
      var l=lesson(n,english?'en':'it'),text=english ? 'Lesson '+n+' · '+l.title :
        'Lezione '+n+' · '+l.title+(l.lang==='en'?' (EN)':'');
      var aria=english ? 'Open external R course lesson '+n+' in '+(l.lang==='en'?'English':'Italian') :
        'Apri la lezione '+n+' del corso R in '+(l.lang==='en'?'inglese':'italiano')+' (sito esterno)';
      return el('li',el('a',{href:l.url,target:'_blank',rel:'noopener noreferrer',lang:l.lang,'aria-label':aria},text));
    });
    var direct=entry.alignment==='direct';
    var panel=el('section.course-bridge',{'data-course-bridge':id,'aria-label':english?'Related R course learning path':'Percorso integrato con il corso R'},
      el('div.course-bridge-head',el('span.course-bridge-kicker',english?'From experiment to reproducible R':'Dal laboratorio al codice R'),
        el('span.course-bridge-kind',english?(direct?'Directly related lessons':'Foundational lessons'):(direct?'Lezioni direttamente collegate':'Lezioni propedeutiche'))),
      el('p',english?'Move from the visual experiment to a reproducible analysis: read the related R material, repeat a controlled experiment and verify a reported result using the exported script.':'Per passare dall’esperimento visuale all’analisi riproducibile: consulta il corso R, esegui una prova controllata e verifica un risultato con lo script esportato.'),
      el('ul.course-bridge-links',links),
      el('details.course-bridge-details',
        el('summary',english?'Show the three-step learning path':'Apri il percorso in tre passaggi'),
        el('div.course-bridge-steps',
          el('p',el('strong',english?'1 · Before. ':'1 · Prima. '),act.question),
          el('p',el('strong',english?'2 · During. ':'2 · Durante. '),act.experiment),
          el('p',el('strong',english?'3 · In R. ':'3 · In R. '),act.check),
          el('p.course-bridge-caution',el('strong',english?'Caution. ':'Attenzione. '),act.caution))),
      el('button.btn.btn-ghost.course-bridge-download',{type:'button',onclick:function(){SA.ui.download('StatAtlas_'+info.lab.num+(english?'_EN_student_worksheet.md':'_scheda_studente.md'),worksheet(id,info),'text/markdown;charset=utf-8');}},english?'Download student worksheet':'Scarica la scheda di lavoro'),
      el('p.course-bridge-offline',english?'External lessons need Internet access; StatAtlas experiments and exported code remain available offline.':'Lezioni esterne: connessione richiesta. Esperimenti e codice StatAtlas: disponibili anche offline.'));
    head.parentNode.insertBefore(panel,head.nextSibling);
    var actions=head.querySelector('.head-actions');
    if(actions) actions.appendChild(el('button.btn.btn-ghost.course-bridge-jump',{
      type:'button',onclick:function(){var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;panel.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});}
    },english?'Learn with R':'Studia con R'));
  }
  return {lessons:LESSONS,map:MAP,lesson:lesson,worksheet:worksheet,mount:mount};
})();
