/* StatAtlas Challenges · catalogo completo, 28 laboratori aggiuntivi.
 * Ogni card richiede un esperimento svolto DOPO l'apertura, controlli manipolati
 * quando necessario e interpretazione di una conseguenza metodologica.
 * Le regole non leggono dati personali e non modificano il motore statistico.
 */
(function(){
 'use strict';
 var SA=window.SA; if(!SA||!SA.challenges)throw Error('Challenges base non caricato');
 var specs={
  "distribuzioni": [
    [
      "Probabilità o densità?",
      "Per una variabile assolutamente continua, che cosa rappresenta l’area sotto la densità fra a e b?",
      "La probabilità P(a < X ≤ b).",
      "La probabilità puntuale che X sia esattamente a.",
      "La media della distribuzione.",
      "L’integrale della densità sull’intervallo coincide con F(b)−F(a); il valore della densità in un punto non è una probabilità."
    ],
    [
      "Banda e campione",
      "Perché la CDF empirica non coincide perfettamente con quella teorica anche se il generatore è corretto?",
      "Per la variabilità campionaria finita.",
      "Perché la CDF teorica cambia a ogni replica.",
      "Perché ogni distanza osservata prova misspecificazione.",
      "La deviazione fra F empirica e F vera è casuale; una banda come DKW quantifica una deviazione globale ad alta probabilità."
    ],
    [
      "Momenti non definiti",
      "Perché la media campionaria della Cauchy non si stabilizza necessariamente come per una normale?",
      "La legge di Cauchy non ha valore atteso finito e non soddisfa le ipotesi della LGN classica.",
      "Perché il campione casuale non è indipendente.",
      "Perché una variabile continua non può avere mediana.",
      "Per la Cauchy la media campionaria mantiene una distribuzione di Cauchy della stessa scala sotto iid, per ogni n."
    ]
  ],
  "bivariata": [
    [
      "Correlazione e forma",
      "Che cosa può sfuggire a una correlazione lineare vicina a zero?",
      "Una dipendenza non lineare anche molto forte.",
      "Qualunque cambiamento delle marginali.",
      "La presenza certa di indipendenza.",
      "La covarianza misura soltanto dipendenza lineare; una relazione curvilinea simmetrica può avere correlazione nulla."
    ],
    [
      "Condizionare su X",
      "Che cosa cambia quando restringi la fascia di valori di X?",
      "La distribuzione empirica di Y condizionata ai valori di X selezionati.",
      "L’intera popolazione diventa indipendente.",
      "La correlazione campionaria diventa necessariamente uno.",
      "La fascia condizionante seleziona un sottocampione: la sua distribuzione differisce, in generale, dalla marginale di Y."
    ],
    [
      "Varianza condizionata",
      "In una normale bivariata standardizzata con correlazione ρ, quale formula vale per Var(Y|X=x)?",
      "1−ρ², indipendentemente da x.",
      "1+ρ² per ogni x.",
      "ρ²x².",
      "La formula discende dalla distribuzione normale condizionata e non si estende a una legge bivariata arbitraria."
    ]
  ],
  "simulazione": [
    [
      "Inversione",
      "Se U è uniforme su (0,1) e F è continua e strettamente crescente, quale distribuzione ha F⁻¹(U)?",
      "La distribuzione con ripartizione F.",
      "Sempre la distribuzione normale.",
      "La distribuzione uniforme originale.",
      "P(F⁻¹(U)≤x)=P(U≤F(x))=F(x); con F generale si usa la funzione quantile generalizzata."
    ],
    [
      "Monte Carlo e precisione",
      "Come varia, in condizioni regolari, l’errore standard di una media Monte Carlo aumentando il numero di repliche M?",
      "Decresce proporzionalmente a 1/√M.",
      "Decresce sempre proporzionalmente a 1/M.",
      "Rimane costante se il seed non cambia.",
      "Var(media)=Var(g(X))/M con campioni indipendenti e secondo momento finito."
    ],
    [
      "Rao–Blackwell",
      "Perché sostituire Z con E(Z|U) può ridurre la variabilità dello stimatore?",
      "Per la decomposizione della varianza totale.",
      "Perché aggiunge un bias obbligatorio.",
      "Perché rende ogni simulazione deterministica.",
      "Var(Z)=E Var(Z|U)+Var(E(Z|U)); il secondo termine non eccede la varianza di Z."
    ]
  ],
  "lgn-tcl": [
    [
      "Legge dei grandi numeri",
      "Che cosa descrive la legge dei grandi numeri sotto ipotesi appropriate?",
      "La convergenza della media campionaria al valore atteso.",
      "La normale esatta della media per ogni n.",
      "L’indipendenza di qualsiasi serie temporale.",
      "Con campioni iid integrabili, la media tende al valore atteso; la LGN non è un’affermazione sulla forma normale."
    ],
    [
      "Normalizzazione del TCL",
      "Perché si moltiplica la differenza tra media campionaria e μ per √n?",
      "Per compensare la scala n⁻¹/² delle fluttuazioni.",
      "Per rendere nulla la varianza del campione.",
      "Per garantire normalità per ogni legge e ogni n.",
      "Nel TCL classico iid a varianza finita, √n( X̄−μ)/σ converge in distribuzione a N(0,1)."
    ],
    [
      "Code pesanti",
      "Perché non puoi applicare il TCL classico alle medie iid Cauchy?",
      "La varianza e persino la media non esistono.",
      "Perché i campioni sono sempre correlati.",
      "Perché la Cauchy è discreta.",
      "La media campionaria Cauchy rimane Cauchy; usare formule gaussiane di precisione è inappropriato."
    ]
  ],
  "adattamento": [
    [
      "Test e modello",
      "Cosa indica un p-value alto in un test di adattamento?",
      "Non c’è evidenza sufficiente per rifiutare il modello, non prova che sia vero.",
      "Il modello è dimostrato esatto.",
      "La probabilità che il modello sia vero supera il 95%.",
      "Un test ha potenza finita e può non distinguere modelli vicini, soprattutto con n piccolo."
    ],
    [
      "Gradi di libertà",
      "Perché un chi-quadrato di adattamento deve considerare i parametri stimati?",
      "La stima dai dati consuma vincoli e modifica la distribuzione di riferimento.",
      "Perché rende tutte le frequenze attese uguali.",
      "Perché il test non dipende dalle classi.",
      "Con k classi e q parametri stimati regolarmente dai dati, i gradi di libertà asintotici sono spesso k−1−q, con condizioni da verificare."
    ],
    [
      "Classi rare",
      "Che cosa rischi quando molte frequenze attese sono piccole?",
      "L’approssimazione chi-quadrato asintotica può essere inaffidabile.",
      "Il p-value deve essere esattamente zero.",
      "Il test diventa automaticamente esatto.",
      "Può servire accorpare classi o stimare la distribuzione nulla mediante simulazione/bootstrap coerente con la stima dei parametri."
    ]
  ],
  "stimatori": [
    [
      "Media e mediana",
      "In presenza di forti valori anomali nella risposta, quale stimatore della posizione è più resistente?",
      "La mediana campionaria, rispetto alla media.",
      "La media campionaria per definizione.",
      "Qualunque stimatore con minore deviazione standard normale.",
      "La funzione di influenza della media è non limitata, mentre la mediana possiede robustezza locale maggiore, sotto regolarità."
    ],
    [
      "Efficienza relativa",
      "Sotto popolazione normale, quale vantaggio ha tipicamente la media rispetto alla mediana per stimare la posizione?",
      "Varianza asintotica inferiore, nel modello normale.",
      "È sempre più robusta alla contaminazione.",
      "Non dipende dalla numerosità.",
      "Sotto N(μ,σ²), var(media)=σ²/n e var(mediana)≈πσ²/(2n): la media è più efficiente nel modello normale, ma può essere meno robusta a outlier."
    ],
    [
      "Cauchy e stima",
      "Perché la media non è uno stimatore consistente della posizione Cauchy?",
      "La media campionaria conserva una distribuzione Cauchy a scala fissa.",
      "Perché la distribuzione Cauchy è asimmetrica.",
      "Perché la mediana è distorta per ogni n.",
      "La stabilità della legge Cauchy impedisce la concentrazione della media campionaria; la mediana ha invece una distribuzione asintotica concentrata."
    ]
  ],
  "fisher": [
    [
      "Informazione e precisione",
      "Quale legame esprime l’informazione di Fisher in un modello regolare?",
      "Un limite inferiore alla varianza degli stimatori non distorti regolari.",
      "La certezza che ogni MLE sia esattamente normale.",
      "Il numero dei parametri stimati.",
      "Il limite di Cramér–Rao richiede condizioni di regolarità e non identifica da solo uno stimatore efficiente."
    ],
    [
      "Score",
      "Qual è il valore atteso dello score nel parametro vero, sotto regolarità?",
      "Zero.",
      "Sempre uno.",
      "Uguale al p-value del modello.",
      "Derivando l’integrale unitario della densità, Eθ[∂ log f(X;θ)/∂θ]=0 quando lo scambio è lecito."
    ],
    [
      "Identità di Bartlett",
      "Perché E(score²)=−E(seconda derivata della log-verosimiglianza) può fallire?",
      "Per assenza di regolarità, per esempio supporto dipendente dal parametro.",
      "Perché i dati sono indipendenti.",
      "Perché il campione supera n=30.",
      "Le identità d’informazione dipendono dallo scambio derivata–integrale e da condizioni sul supporto della famiglia."
    ]
  ],
  "test": [
    [
      "Livello del test",
      "Che cosa misura la probabilità di rifiutare H₀ quando H₀ è vera?",
      "L’errore di primo tipo.",
      "La potenza contro l’alternativa.",
      "La probabilità che H₀ sia vera.",
      "Un test di livello α controlla la probabilità di rifiuto sotto H₀ secondo la definizione adottata."
    ],
    [
      "Potenza",
      "Come cambia generalmente la potenza di un test Z a effetto fissato aumentando n?",
      "Aumenta perché cresce lo spostamento standardizzato dell’alternativa.",
      "Diminuisce sempre a zero.",
      "Diventa identica al p-value osservato.",
      "La non-centralità cresce spesso come √n, con modello e alternativa fissati."
    ],
    [
      "p-value",
      "Qual è la corretta interpretazione di un p-value di 0,03?",
      "Sotto H₀, la probabilità di una statistica almeno altrettanto estrema è 0,03.",
      "La probabilità che H₀ sia vera è 0,03.",
      "L’effetto ha probabilità 97% di essere clinicamente rilevante.",
      "Il p-value è calcolato sotto il modello nullo, non assegna probabilità a H₀ senza una struttura bayesiana."
    ]
  ],
  "regressione": [
    [
      "Banda e previsione",
      "Quale intervallo è generalmente più largo: per la risposta individuale o per la media condizionata?",
      "Quello di previsione individuale, a parità di x e livello.",
      "Quello per la media, perché usa meno dati.",
      "Sono sempre identici.",
      "La varianza predittiva include anche la variabilità irreducibile di una nuova risposta."
    ],
    [
      "Leverage",
      "Che cosa rappresenta un punto ad alto leverage?",
      "Un valore delle covariate lontano dal loro centro, potenzialmente influente.",
      "Un residuo necessariamente grande.",
      "Una prova della non linearità.",
      "Il leverage dipende da X; l’influenza dipende anche dal residuo e dalla risposta."
    ],
    [
      "Inferenza OLS",
      "Quando gli intervalli t classici della regressione sono esatti a campione finito?",
      "Con errori gaussiani indipendenti omoschedastici e disegno fissato di rango pieno.",
      "Con qualsiasi rumore, indipendentemente da n.",
      "Soltanto se R²=1.",
      "La normalità degli errori e la stima corretta della varianza consentono la distribuzione t pivotale."
    ]
  ],
  "regressione-lp": [
    [
      "Criterio L1",
      "A quale obiettivo corrisponde la regressione L1?",
      "Minimizzare la somma dei valori assoluti dei residui.",
      "Massimizzare la somma dei quadrati.",
      "Minimizzare il numero delle osservazioni.",
      "L1 produce una stima legata alla mediana condizionata sotto specificazione adeguata."
    ],
    [
      "Efficienza vs robustezza",
      "Perché la scelta di p influisce sulla sensibilità agli outlier?",
      "Perché la crescita della perdita e del suo score cambia con la grandezza del residuo.",
      "Perché p cambia solo l’etichetta dell’asse.",
      "Perché la loss L2 limita più di L1 i grandi residui.",
      "La perdita quadratica penalizza fortemente grandi residui, e il contributo al gradiente cresce linearmente nella loro ampiezza."
    ],
    [
      "Convessità",
      "Quando |r|^p è convessa come funzione del residuo r?",
      "Per p≥1.",
      "Soltanto per p=2.",
      "Per ogni p positivo, compreso 0<p<1.",
      "Per 0<p<1 la funzione non è convessa e la minimizzazione può introdurre problemi di ottimi locali."
    ]
  ],
  "glm": [
    [
      "Legame del GLM",
      "Che cosa lega la funzione di link in un GLM?",
      "La media condizionata della risposta al predittore lineare.",
      "La varianza direttamente alla classe osservata.",
      "Sempre la risposta grezza a un polinomio cubico.",
      "Nel GLM g(E[Y|X])=Xβ; la varianza è governata dalla famiglia e dal parametro di dispersione."
    ],
    [
      "Separazione logistica",
      "Che cosa può accadere con separazione completa nella regressione logistica ordinaria?",
      "L’MLE finito di alcuni coefficienti può non esistere.",
      "Le probabilità previste sono tutte 0,5.",
      "L’informazione di Fisher diventa necessariamente costante.",
      "La log-verosimiglianza può aumentare lungo direzioni con coefficienti divergenti; Wald diventa inaffidabile."
    ],
    [
      "Interpretazione coefficiente",
      "Nel modello logit, a cosa corrisponde exp(β_j), a parità delle altre covariate?",
      "All’odds ratio per un aumento unitario di x_j.",
      "Alla differenza costante di probabilità.",
      "Alla probabilità di successo per ogni individuo.",
      "L’effetto sul rischio dipende dal livello delle altre covariate: l’odds ratio non coincide generalmente con un risk ratio."
    ]
  ],
  "arma": [
    [
      "AR e memoria",
      "Per un AR(1) stazionario, come decade tipicamente l’autocorrelazione ai lag?",
      "Geometricamente, come φ^|h|.",
      "È sempre zero ai lag positivi.",
      "Cresce linearmente con h.",
      "Con |φ|<1, la covarianza di un AR(1) soddisfa γ(h)=σ²φ^|h|/(1−φ²)."
    ],
    [
      "ACF e PACF",
      "Quale caratteristica teorica distingue un AR(p) da un MA(q) ideale?",
      "La PACF dell’AR(p) si tronca dopo p, l’ACF dell’MA(q) dopo q.",
      "L’ACF dell’AR(p) si tronca sempre dopo p.",
      "La PACF dell’MA(q) è costantemente zero.",
      "La distinzione è teorica: con dati finiti si osservano stime rumorose, non tagli netti."
    ],
    [
      "Stazionarietà",
      "Che cosa succede quando il coefficiente AR(1) tende in modulo a uno?",
      "La varianza stazionaria e il tempo di memoria possono aumentare senza limite.",
      "L’autocorrelazione scompare.",
      "La varianza rimane sempre σ².",
      "La formula σ²/(1−φ²) diverge quando |φ|→1; al bordo il processo non è debolmente stazionario nel modello usuale."
    ]
  ],
  "quantilica": [
    [
      "Quantile condizionato",
      "Quale aspetto dei dati descrive una regressione quantilica a τ=0,9?",
      "Il quantile condizionato di ordine 0,9, non la media.",
      "Sempre il 90% del coefficiente OLS.",
      "La probabilità che un coefficiente sia significativo.",
      "La funzione check assegna pesi asimmetrici ai residui e mira al quantile condizionato sotto la specificazione scelta."
    ],
    [
      "Eteroschedasticità",
      "Perché le pendenze di quantili diversi possono differire?",
      "La distribuzione condizionata può modificare dispersione o forma con X.",
      "Perché tutti i quantili devono avere la stessa pendenza.",
      "Perché τ controlla soltanto il seed.",
      "Se la scala condizionata dipende da X, i quantili non risultano necessariamente paralleli."
    ],
    [
      "Non regolarità",
      "Perché una soluzione di regressione quantilica non si ottiene derivando ovunque una loss liscia?",
      "La perdita check non è differenziabile nel residuo zero.",
      "La funzione check è sempre quadratica.",
      "La densità condizionata è sempre normale.",
      "Si usano subgradienti o programmazione lineare; l’inferenza asintotica richiede condizioni sulla densità al quantile."
    ]
  ],
  "penalizzata": [
    [
      "Shrinkage",
      "Quale effetto ha aumentare λ nel lasso, mantenendo fissa la scala della funzione obiettivo?",
      "Favorisce coefficienti più piccoli e potenzialmente esattamente nulli.",
      "Rende sempre più grande il numero di coefficienti non nulli.",
      "Imposta automaticamente l’errore test a zero.",
      "La penalizzazione L1 introduce un angolo nella funzione obiettivo e può produrre soluzioni sparse."
    ],
    [
      "Correlazione predittori",
      "Che cosa rende difficoltosa la selezione lasso con covariate molto correlate?",
      "Piccoli cambiamenti dei dati possono alterare quale predittore viene selezionato.",
      "La loss cessa sempre di essere convessa.",
      "L’intercetta viene necessariamente penalizzata.",
      "Elastic net introduce anche un termine L2, che può stabilizzare stime con predittori correlati."
    ],
    [
      "Tuning e leakage",
      "Perché si standardizzano i predittori dentro ogni fold di training durante CV?",
      "Per evitare di utilizzare informazione del fold di validazione nel preprocessing.",
      "Per imporre a ogni fold la stessa media calcolata sui dati totali.",
      "Per rendere non necessaria la scelta di λ.",
      "Le trasformazioni che apprendono dai dati devono essere stimate esclusivamente sulla parte training del fold."
    ]
  ],
  "spline": [
    [
      "Smoothing",
      "Quale compromesso controlla λ in una spline penalizzata?",
      "Adattamento ai dati contro penalizzazione della curvatura.",
      "Solo la dimensione del campione.",
      "Sempre il numero esatto di nodi del campione.",
      "A λ grande prevale la regolarità; a λ piccolo la funzione può seguire più da vicino le osservazioni."
    ],
    [
      "Kernel bandwidth",
      "Che cosa succede tipicamente riducendo molto la bandwidth in una stima kernel?",
      "Diminuisce il bias locale ma cresce la variabilità delle stime.",
      "La stima diventa necessariamente una retta.",
      "La varianza dello stimatore tende sempre a zero.",
      "La bandwidth regola il vicinato effettivo e dunque il compromesso bias-varianza."
    ],
    [
      "Flessibilità",
      "Perché non basta scegliere un fit con residui di training minimi?",
      "Un metodo troppo flessibile può avere rischio fuori campione maggiore.",
      "La norma dei residui è indipendente dalla complessità.",
      "La CV non ha utilità con spline.",
      "I gradi di libertà effettivi e una valutazione esterna aiutano a valutare la capacità predittiva."
    ]
  ],
  "segmentata": [
    [
      "Punto di cambiamento",
      "Che cosa rappresenta ψ nel modello continuo a un breakpoint?",
      "Il punto in cui cambia la pendenza della relazione media con x.",
      "Il punto in cui la risposta salta sempre discontinuamente.",
      "Il valore che massimizza necessariamente la varianza degli errori.",
      "La funzione (x−ψ)+ è continua; il coefficiente δ determina la differenza tra pendenza dopo e prima ψ."
    ],
    [
      "Stima di ψ",
      "Perché una stima di ψ vicino ai bordi può essere instabile?",
      "Vi sono poche osservazioni su uno dei due lati per identificare il cambiamento.",
      "Perché ψ è una variabile aleatoria sempre uniforme.",
      "Perché le due pendenze devono coincidere.",
      "La localizzazione di un cambio di pendenza richiede informazione a entrambi i lati del punto candidato."
    ],
    [
      "Breakpoint non identificato",
      "Che cosa succede a ψ se il vero δ è zero?",
      "Il breakpoint non è identificato dal modello, invalidando inferenza Wald standard su ψ.",
      "La stima di ψ è sempre uguale al centro.",
      "La distribuzione di ψ è esattamente normale.",
      "Sotto assenza di cambiamento la funzione media non dipende da ψ; occorrono test di cambiamento costruiti per questa non regolarità."
    ]
  ],
  "knn": [
    [
      "Ruolo di k",
      "Che cosa accade tipicamente con k=1 su un campione rumoroso?",
      "La frontiera può essere molto irregolare e sensibile ai dati.",
      "La classificazione è sempre lineare.",
      "Il classificatore coincide con la frontiera di Bayes.",
      "Un vicinato minuscolo ha bassa regolarizzazione e può inseguire fluttuazioni casuali."
    ],
    [
      "Distanze",
      "Perché standardizzare predittori su scale differenti può cambiare kNN?",
      "Perché il calcolo delle distanze è sensibile alla scala delle coordinate.",
      "Perché cambia le etichette osservate.",
      "Perché impone necessariamente k=p.",
      "In distanza euclidea una variabile con unità grandi può dominare; le scale vanno calcolate dal training."
    ],
    [
      "Consistenza",
      "Quale condizione qualitativa porta kNN verso una classificazione consistente in condizioni regolari?",
      "k cresce ma k/n tende a zero al crescere di n.",
      "k rimane sempre uno indipendentemente da n.",
      "k=n per tutte le numerosità.",
      "Il numero di vicini deve crescere per controllare la varianza, rimanendo locale relativamente al campione."
    ]
  ],
  "alberi": [
    [
      "Partizioni CART",
      "Come sceglie uno split un albero CART di classificazione?",
      "Riducendo l’impurità pesata dei nodi figli secondo un criterio dichiarato.",
      "Massimizzando sempre la profondità senza criterio.",
      "Costruendo un modello lineare su tutte le variabili.",
      "Gini o entropia possono guidare split ricorsivi e generare regioni rettangolari."
    ],
    [
      "Bagging",
      "Perché mediare molti alberi può ridurre la varianza della previsione?",
      "La parte non perfettamente correlata dell’errore degli alberi si attenua nell’aggregazione.",
      "Perché ogni singolo albero diventa meno profondo.",
      "Perché il bias è sempre ridotto a zero.",
      "Con varianza comune v e correlazione ρ, Var(media)=v[ρ+(1−ρ)/B] sotto ipotesi di equicorrelazione."
    ],
    [
      "Random forest e mtry",
      "Perché selezionare casualmente predittori candidati a ogni split può migliorare un ensemble?",
      "Può ridurre la correlazione fra alberi, pur con possibili effetti sul bias.",
      "Fa coincidere tutte le predizioni degli alberi.",
      "Elimina la necessità di validazione.",
      "Il beneficio dipende dalla struttura dei dati: la decorrelazione non garantisce sempre un rischio minore."
    ]
  ],
  "boost": [
    [
      "Residui sequenziali",
      "Nel boosting quadratico, che cosa adatta il nuovo albero?",
      "I residui o gradiente negativo della loss rispetto al predittore corrente.",
      "Le etichette permutate in modo casuale.",
      "Soltanto il valore medio iniziale.",
      "Con loss quadratica, la direzione di discesa funzionale è proporzionale a y−F(x)."
    ],
    [
      "Shrinkage",
      "Qual è il ruolo del learning rate ν in F_m=F_(m−1)+νh_m?",
      "Ridimensiona l’aggiornamento di ogni nuovo learner.",
      "Imposta direttamente il numero delle classi.",
      "Rende irrilevante il numero di iterazioni.",
      "Un ν più piccolo richiede spesso più alberi per un adattamento simile, e influenza la regolarizzazione."
    ],
    [
      "Early stopping",
      "Perché selezionare il numero di alberi sulla validation e non sul test finale?",
      "Per evitare ottimismo dovuto all’uso del test per il tuning.",
      "Perché il training error è sempre maggiore del validation error.",
      "Perché il test non contiene mai etichette.",
      "Il test indipendente serve per valutare la procedura scelta, non per guidarne la scelta."
    ]
  ],
  "reti-neurali": [
    [
      "Attivazione",
      "Perché inserire funzioni di attivazione non lineari tra layer?",
      "Senza non linearità la composizione di trasformazioni affini resta affine.",
      "Perché rendono le reti sempre interpretabili.",
      "Perché eliminano tutti i minimi locali.",
      "Le attivazioni consentono di rappresentare relazioni non lineari; architettura e regolarizzazione ne influenzano l’apprendimento."
    ],
    [
      "Learning rate",
      "Che cosa può accadere con un learning rate troppo grande?",
      "L’ottimizzazione può oscillare o divergere.",
      "Il gradiente diventa matematicamente identico a zero.",
      "La validation loss diventa sempre più piccola.",
      "L’aggiornamento usa una scala proporzionale al learning rate; passi eccessivi possono attraversare le regioni di discesa."
    ],
    [
      "Backpropagation",
      "Qual è il principio matematico della backpropagation?",
      "Applicare la regola della catena alle derivate lungo la rete.",
      "Calcolare una regressione OLS separata per ogni neurone.",
      "Invertire la matrice delle osservazioni una sola volta.",
      "Il gradiente complessivo si ottiene propagando le sensitività dall’uscita agli strati precedenti."
    ]
  ],
  "pca": [
    [
      "Varianza massima",
      "Come viene definita la prima componente principale?",
      "Direzione unitaria che massimizza la varianza delle proiezioni dei dati centrati.",
      "Direzione della maggiore media grezza.",
      "Variabile con massimo p-value.",
      "La prima componente coincide con un autovettore della covarianza associato all’autovalore massimo."
    ],
    [
      "Standardizzare",
      "Perché PCA su covarianza e su correlazione può dare risultati differenti?",
      "La standardizzazione modifica il peso relativo delle variabili nella geometria.",
      "Perché rende le variabili indipendenti automaticamente.",
      "Perché cambia il numero totale delle osservazioni.",
      "La PCA non è invariante a riscalamenti arbitrari delle variabili; le unità di misura sono decisive."
    ],
    [
      "Autovalori multipli",
      "Cosa succede alle direzioni principali quando due autovalori sono uguali?",
      "La base del relativo sottospazio non è univocamente identificata.",
      "I valori spiegati diventano negativi.",
      "La matrice di covarianza non può più essere simmetrica.",
      "Si confrontano sottospazi/proiettori, non il segno e l’orientamento di singoli autovettori."
    ]
  ],
  "clustering": [
    [
      "Obiettivo k-means",
      "Che cosa minimizza k-means?",
      "La somma dei quadrati delle distanze ai centroidi dei cluster.",
      "La massima distanza fra tutte le coppie.",
      "La verosimiglianza di una regressione logistica.",
      "L’algoritmo Lloyd alterna assegnazione e centroidi per non aumentare la funzione obiettivo."
    ],
    [
      "Dendrogramma",
      "Che cosa determina il linkage nel clustering gerarchico agglomerativo?",
      "Il criterio per calcolare la distanza tra gruppi di osservazioni.",
      "L’etichetta vera delle osservazioni.",
      "La dimensione fissa del nuovo campione.",
      "Single, complete, average e Ward operano con criteri diversi e non generano necessariamente la stessa gerarchia."
    ],
    [
      "Cluster e realtà",
      "Un valore alto di silhouette dimostra che esistono popolazioni distinte?",
      "No: è un indice geometrico interno alla partizione, non un test di esistenza di popolazioni.",
      "Sì, per ogni generatore casuale e distanza.",
      "Sì, purché K sia almeno tre.",
      "Anche un algoritmo su dati senza gruppi reali produce una partizione; la sua significatività non deriva dalla silhouette."
    ]
  ],
  "dbscan": [
    [
      "Core e bordo",
      "Quando un punto è core in DBSCAN?",
      "Quando il suo ε-vicinato include almeno minPts punti secondo la convenzione adottata.",
      "Quando è il centroide del gruppo.",
      "Quando appartiene al cluster più grande.",
      "La definizione di densità locale usa ε e minPts e solitamente include il punto stesso."
    ],
    [
      "Rumore",
      "Un punto etichettato come rumore da DBSCAN prova che sia un errore di misura?",
      "No: è un punto non raggiungibile per densità ai parametri fissati.",
      "Sì, necessariamente.",
      "Sì, se ha una distanza elevata dall’origine.",
      "Una variazione di ε o minPts può modificarne la classe; rumore algoritmico non equivale a anomalia scientifica."
    ],
    [
      "Punti contesi",
      "Cosa accade a un punto di bordo raggiungibile da due cluster core?",
      "L’assegnazione può dipendere dall’ordine di visita e dalla convenzione dell’implementazione.",
      "Il punto diventa automaticamente core.",
      "I due cluster devono fondersi sempre.",
      "La connettività dei core è più stabile; l’assegnazione del bordo può cambiare senza modificare la partizione dei core."
    ]
  ],
  "moran": [
    [
      "W e vicinato",
      "Perché Moran I cambia passando da rook a queen?",
      "Cambiano le coppie territoriali considerate vicine e i loro pesi.",
      "Perché la media dei valori deve cambiare.",
      "Perché il test diventa una correlazione temporale.",
      "L’indice è funzione dei dati e della matrice W; cambiarla modifica la struttura della domanda."
    ],
    [
      "Permutazioni",
      "Quale ipotesi è esplorata permutando i valori sui territori?",
      "La scambiabilità spaziale dei valori sotto una specifica ipotesi nulla.",
      "L’indipendenza causale fra tutti i fenomeni osservati.",
      "La stima senza errore del parametro SAR.",
      "Il riferimento permutazionale è condizionato ai valori osservati e alla matrice W scelta."
    ],
    [
      "Trend e residui",
      "Perché valori spazialmente simili possono presentarsi anche con errori indipendenti?",
      "Un trend deterministico comune può produrre una struttura nei valori.",
      "Perché gli errori iid sono sempre correlati.",
      "Perché E(I)=0 sotto qualunque W e nullo.",
      "Rimuovere un trend corretto può far scomparire la struttura residua; bisogna distinguere media spaziale e correlazione degli errori."
    ]
  ],
  "lisa": [
    [
      "Quadranti locali",
      "Che cosa indica un’unità High–Low?",
      "Valore alto rispetto alla media, circondato da vicini con valori mediamente bassi.",
      "Un hotspot High–High.",
      "Una regione con p-value necessariamente significativo.",
      "I quadranti descrivono configurazioni relative; l’inferenza è un passaggio ulteriore."
    ],
    [
      "Confronti multipli",
      "Perché correggere i p-value quando si eseguono molti test locali?",
      "Per controllare false scoperte o errori familiari secondo la procedura scelta.",
      "Perché ogni p-value grezzo è matematicamente invalido.",
      "Per rendere tutti i test indipendenti.",
      "BH e BY hanno garanzie di FDR sotto condizioni diverse di dipendenza; la mappa di quadranti non è una mappa di significatività."
    ],
    [
      "MAUP",
      "Cosa dimostra cambiare la zonizzazione degli stessi dati di base?",
      "Statistiche e dipendenze possono cambiare con scala e confini delle aree.",
      "La dipendenza spaziale è necessariamente causale.",
      "L’indice di Moran è invariante a ogni aggregazione.",
      "Il MAUP modifica unità, variabili aggregate e matrice W; non è un semplice effetto estetico."
    ]
  ],
  "processi-puntuali": [
    [
      "CSR",
      "Per un Poisson omogeneo piano, qual è il riferimento teorico della K di Ripley?",
      "K(r)=πr².",
      "K(r)=r per ogni r.",
      "K(r)=0 per ogni processo di Poisson.",
      "La K di Poisson omogeneo coincide con l’area del disco di raggio r."
    ],
    [
      "Effetti di bordo",
      "Perché la stima empirica di K richiede una correzione dei bordi?",
      "Le coppie oltre il confine della finestra non possono essere osservate.",
      "Perché i punti ai bordi sono sempre rumore.",
      "Perché i punti devono avere coordinate intere.",
      "Senza correzione i conteggi di coppie disponibili a distanza r sono distorti vicino al bordo."
    ],
    [
      "Inomogeneità",
      "Perché la K omogenea può suggerire aggregazione anche per un Poisson non omogeneo?",
      "Un’intensità variabile può creare concentrazioni senza interazione fra eventi.",
      "Perché gli eventi Poisson hanno sempre repulsione.",
      "Perché l’intensità è identicamente zero.",
      "Bisogna separare andamento dell’intensità di primo ordine da interazione di secondo ordine, eventualmente con K inhomogeneous."
    ]
  ],
  "variogrammi": [
    [
      "Semivarianza",
      "Che cosa sintetizza il variogramma empirico per una classe di distanze?",
      "La media dei semiquadrati delle differenze fra osservazioni a distanze simili.",
      "La covarianza campionaria delle sole coordinate.",
      "La frequenza totale di eventi Poisson.",
      "La stima di Matheron aggrega ½(Z_i−Z_j)² nelle classi di lag: l’affidabilità dipende anche da quante coppie cadono in ciascuna classe."
    ],
    [
      "Anisotropia",
      "Quale indizio suggerisce anisotropia spaziale?",
      "Variogrammi direzionali diversi alla stessa distanza euclidea.",
      "Medie esattamente identiche a ogni direzione.",
      "Range sempre indipendente dall’orientamento.",
      "Una dipendenza geometrica anisotropa dipende dalla direzione e può essere descritta con una metrica trasformata."
    ],
    [
      "Trend",
      "Perché un trend nella media contamina la stima del variogramma della componente stazionaria?",
      "Le differenze osservate includono anche differenze sistematiche della media.",
      "Perché il nugget diventa sempre negativo.",
      "Perché la covarianza non può essere positiva definita.",
      "Prima di stimare una covarianza stazionaria si deve controllare e, se appropriato, rimuovere la componente media non costante."
    ]
  ],
  "regressione-spaziale": [
    [
      "SAR e SEM",
      "Quale componente contiene la dipendenza nel modello SAR lag?",
      "La risposta tramite ρWy.",
      "Soltanto gli errori tramite λWu.",
      "Un termine di interazione fra due covariate.",
      "SAR introduce un moltiplicatore simultaneo tra unità; SEM modella la correlazione del disturbo."
    ],
    [
      "Impatti SAR",
      "Perché β_j non coincide normalmente con l’effetto marginale totale SAR?",
      "La matrice (I−ρW)⁻¹ trasmette perturbazioni fra unità.",
      "Perché ogni coefficiente viene posto a zero.",
      "Perché le osservazioni sono sempre indipendenti.",
      "Gli elementi diagonali e fuori diagonale del moltiplicatore determinano impatti diretti e indiretti."
    ],
    [
      "Validazione geografica",
      "Quando ha senso preferire una validazione a blocchi geografici?",
      "Quando il target è prevedere in aree non rappresentate nel training.",
      "Sempre, indipendentemente dall’obiettivo predittivo.",
      "Mai, perché viola l’indipendenza dei fold.",
      "Random e spatial CV stimano prestazioni per target predittivi differenti: la scelta deve riflettere la distribuzione operativa futura."
    ]
  ]
};
 /* Discipline-specific experimental controls for every non-pilot laboratory.
  * The named control must have actually changed and the student must run the
  * simulation UNDER that configuration, not just click a random widget.
  * Stage 3 requires evidence from two configurations of a relevant control.
  */
 var practical = {
   'distribuzioni': ['Numero di osservazioni', 'Legge'],
   'bivariata': ['Punto di condizionamento', 'Modello'],
   'simulazione': ['Estrazioni N', 'Legge da generare'],
   'lgn-tcl': ['Osservazioni per traiettoria', 'Popolazione'],
   'adattamento': ['Legge che genera i dati', 'Legge che genera i dati'],
   'stimatori': ['Numerosità campionaria', 'Modello'],
   'fisher': ['n', 'Modello'],
   'test': ['Effetto vero', 'Livello α'],
   'regressione': ['Punto x₀', 'Errori'],
   'regressione-lp': ['Esponente p', 'Errori'],
   'glm': ['Famiglia e legame', 'Famiglia e legame'],
   'arma': ['φ₁', 'Modello di partenza'],
   'quantilica': ['Quantile τ', 'Errori'],
   'penalizzata': ['Correlazione ρ', 'Penalizzazione'],
   'spline': ['Metodo', 'Metodo'],
   'segmentata': ['Posizione vera ψ', 'Cambio di pendenza δ'],
   'knn': ['Scala di x₂', 'k mostrato'],
   'alberi': ['Alberi B', 'mtry'],
   'boost': ['Learning rate ν', 'Profondità'],
   'reti-neurali': ['Neuroni nascosti', 'Learning rate η'],
   'pca': ['Standardizza', 'Varianza del primo asse'],
   'clustering': ['Legame (gerarchico)', 'Popolazioni'],
   'dbscan': ['Raggio ε', 'Dati'],
   'moran': ['Vicinato', 'Meccanismo generatore'],
   'lisa': ['Correzione multipla', 'Unità di analisi'],
   'processi-puntuali': ['Meccanismo generatore', 'Meccanismo generatore'],
   'variogrammi': ['Rapporto anisotropia', 'Trend lungo x'],
   'regressione-spaziale': ['Modello da ispezionare', 'Colora i fold']
 };
 function normalize(name) {return SA.challenges.keyOf(name);}
 function matchingKey(controls, focus) {
   var wanted=normalize(focus);
   return Object.keys(controls||{}).filter(function (k) {
     return k===wanted || k.indexOf(wanted)>=0;
   })[0] || null;
 }
 function gate(snapshot, initial, focus, level) {
   if(!initial) return {ready:false,message:'Apri la sfida per registrare il punto di partenza.'};
   var samples=(snapshot.samples||[]).filter(function(e){return e.seq>initial.actions;});
   var needed=level===0?1:level===1?2:5;
   if(level===0) return {ready:samples.length>=needed,
     message:'Premi Passo o Avvia per generare almeno un nuovo risultato ('+samples.length+'/'+needed+').'};
   var key=matchingKey(snapshot.controls,focus);
   if(!key) return {ready:false,message:'Il controllo «'+focus+'» non è disponibile in questa configurazione. Apri il laboratorio dalla sua pagina iniziale.'};
   var edits=(snapshot.edits||[]).slice((initial.edits||[]).length)
     .filter(function(e){return e.key===key;});
   if(!edits.length) return {ready:false,message:'Modifica «'+focus+'» nel pannello Parametri. Modifiche pertinenti: 0.'};
   var defaultValue=(initial.controls||{})[key];
   var valueCount={};
   samples.forEach(function(e){
     var value=e.values[key];
     if(value!=null) valueCount[value]=(valueCount[value]||0)+1;
   });
   if(level===1){
     var actual=Object.keys(valueCount).filter(function(v){return v!==defaultValue;})
       .reduce(function(n,v){return n+valueCount[v];},0);
     return {ready:actual>=needed,
       message:'Dopo aver modificato «'+focus+'», genera almeno '+needed+
       ' nuovi passi con il valore modificato ('+actual+'/'+needed+').'};
   }
   var values=Object.keys(valueCount).filter(function(k){return valueCount[k]>0;});
   if(values.length<2) return {ready:false,
     message:'Confronta due valori distinti di «'+focus+'»: genera almeno un passo per ciascuno ('+values.length+'/2 configurazioni osservate).'};
   /* Distinguish two values of the focus control from a controlled comparison.
    * This is feedback, NOT an additional pass/fail prerequisite: changing
    * a data-generating mechanism may legitimately change which controls exist.
    * We report a controlled comparison only if at least two actual simulation
    * steps use distinct focus values with the same other recorded controls.
    */
   var controlled=false;
   for(var a=0;a<samples.length&&!controlled;a++)for(var b=a+1;b<samples.length;b++){
     var va=samples[a].values||{},vb=samples[b].values||{};
     if(va[key]==null||vb[key]==null||va[key]===vb[key])continue;
     var other=Object.keys(va).concat(Object.keys(vb)).filter(function(k,i,all){
       return k!==key&&k!=='velocita'&&all.indexOf(k)===i;
     });
     if(other.every(function(k){return va[k]===vb[k];})){controlled=true;break;}
   }
   var quality=controlled?
     'Confronto controllato: almeno due passi differiscono solo per «'+focus+'» fra i parametri registrati.':
     'Attenzione: tra le configurazioni sono cambiati anche altri controlli. Il confronto resta esplorativo; per attribuire una differenza a «'+focus+'», ripeti mantenendo fissi gli altri parametri e il seed.';
   return {ready:samples.length>=needed,quality:quality,
     message:'Hai esplorato '+values.length+' configurazioni di «'+focus+'». Completa almeno '+needed+
       ' passi totali ('+samples.length+'/'+needed+').'};
 }
 var levels=['Comprensione','Applicazione','Avanzato'];
 Object.keys(specs).forEach(function(id){
   if(!practical[id]) throw Error('Manca il controllo didattico per il laboratorio '+id);
   SA.challenges.bank[id]=specs[id].map(function(data,i){
     var answer=(i+1)%3, wrongs=[data[3],data[4]];
     var choices=[null,null,null]; choices[answer]=data[2];
     var j=0; for(var t=0;t<3;t++)if(t!==answer)choices[t]=wrongs[j++];
     var focus=i===1?practical[id][0]:i===2?practical[id][1]:'';
     var precondition=id==='penalizzata'?'Seleziona prima la vista «Percorsi» per attivare le simulazioni. ':'';
     var practicalGuide=i===0?'Esegui almeno un passo e osserva ciò che cambia.':
       i===1?'Modifica «'+focus+'», quindi genera almeno due passi con il nuovo valore.':
       'Confronta due valori di «'+focus+'»: osserva almeno un passo in ciascuna configurazione e almeno cinque complessivamente. Se possibile, mantieni fissi gli altri parametri e il seed.';
     return {
       id:'full-'+id+'-'+(i+1),level:levels[i],title:data[0],
       task:'Apri questa sfida prima di intervenire. '+(SA.pedagogy[id]&&SA.pedagogy[id].guida?SA.pedagogy[id].guida[Math.min(i,3)]:'Esplora il laboratorio.')+
         ' '+precondition+practicalGuide+' Infine interpreta i risultati e rispondi.',
       question:data[1],options:choices,correct:answer,explanation:data[5],baseline:true,
       focus:focus,stage:i,
       rule:function(s,b){
         if(id==='penalizzata'&&s.controls&&s.controls['vista']!=='Percorsi')return {ready:false,message:'Seleziona «Percorsi» nella vista del laboratorio per attivare le repliche.'};
         return gate(s,b,focus,i);
       }
     };
   });
 });
 // Tracciamento delle repliche senza modificare i calcoli dei laboratori.
 var originalRunner=SA.ui.runner;
 SA.ui.runner=function(config){
   var trace={steps:0, edits:[], samples:[], current:{}}, originalStep=config.step;
   var wrapped=Object.assign({},config,{step:function(){
     var before=config.progress(),result=originalStep(),after=config.progress();
     if(result!==false||after!==before)SA.challenges.noteStep(SA.currentLab);
     return result;
   }});
   var runner=originalRunner(wrapped);
   if(SA.currentLab)SA.challenges.traces[SA.currentLab]=trace;
   return runner;
 };
 // Le sfide pilota originali conservano regole più selettive (08, 18, 30).
})();
