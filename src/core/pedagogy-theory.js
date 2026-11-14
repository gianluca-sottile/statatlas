/* StatAtlas — complementi scientifici specifici per 31 laboratori.
 * Si sommano alle schede Essenziale / Avanzato e alle referenze esistenti.
 * Non generano metodi alternativi e non toccano le simulazioni.
 */
(function(){
  var SA=window.SA|| (window.SA={});
  var chapters={
  "distribuzioni": [
    "Il laboratorio mette in relazione tre rappresentazioni della stessa legge: probabilità teoriche, frequenze dei dati e funzione di ripartizione. Per una variabile continua l’altezza della densità non è una probabilità: la probabilità di un intervallo è un’area. Per una variabile discreta, invece, si sommano le masse. L’informazione nei parametri riguarda la popolazione, non una particolare realizzazione.",
    "La banda Dvoretzky–Kiefer–Wolfowitz riguarda la distanza uniforme tra la ripartizione empirica e quella vera, in condizioni di campionamento indipendente e identicamente distribuito; non equivale a una banda di confidenza puntuale per la densità. Nel confronto Monte Carlo verifica indipendentemente normalizzazione, supporto, coda e momenti: un istogramma apparentemente vicino non garantisce che i generatori rispettino una legge corretta."
  ],
  "bivariata": [
    "Una coppia di variabili può avere marginali identiche e strutture congiunte diverse. La correlazione riassume solo la dipendenza lineare normalizzata, mentre E(Y|X=x) descrive il centro della distribuzione condizionata e può essere non lineare. La fascia attorno a x₀ produce una stima approssimata di una quantità condizionata puntuale: allargarla introduce distorsione, restringerla riduce il numero di osservazioni.",
    "Per una normale bivariata standardizzata, E(Y|X=x)=ρx e Var(Y|X=x)=1−ρ²: la decomposizione della varianza rende esplicita la riduzione dell’incertezza condizionata. Questa identità non vale per una congiunta generica con le stesse marginali. Per valutare dipendenze non lineari, confronta correlazione Pearson, ranghi e una misura che caratterizzi l’indipendenza, anziché inferire l’indipendenza da Cov(X,Y)=0."
  ],
  "simulazione": [
    "L’inversione trasforma uniformi indipendenti in osservazioni di una distribuzione bersaglio usando la quantile generalizzata. Per una legge discreta è essenziale la convenzione sull’inclusione della massa al punto di salto. Nell’integrazione Monte Carlo la stima è una media: la precisione dipende dalla varianza dell’integrando trasformato e dal numero di osservazioni, non dal modo in cui è rappresentata graficamente la curva.",
    "La riduzione della varianza è una questione di accoppiamento delle osservazioni. Se U è uniforme e Z=1{V≤f(U)} con V uniforme indipendente, E(Z|U)=f(U); dalla decomposizione Var(Z)=E Var(Z|U)+Var E(Z|U) segue che la media di f(U) non ha varianza maggiore del corrispondente hit-or-miss. La proprietà richiede che la costruzione condivida la stessa legge bersaglio e che f(U) sia nel range appropriato."
  ],
  "lgn-tcl": [
    "LGN e TCL rispondono a domande diverse: la legge dei grandi numeri riguarda la concentrazione della media attorno a μ, il teorema centrale la distribuzione delle sue fluttuazioni riscalate. Non basta osservare traiettorie visivamente stabili per affermare che una normalizzazione centrale sia valida: occorre conoscere le ipotesi sui momenti e sulla dipendenza.",
    "Con varianza finita positiva, il TCL i.i.d. dà √n(Ȳ−μ)/σ che converge in distribuzione a N(0,1); la LGN può invece valere sotto condizioni differenti. Berry–Esseen controlla la distanza uniforme dalla normale con un bound proporzionale a E|X−μ|³/(σ³√n), se il terzo momento assoluto è finito. La Cauchy mostra perché una media campionaria non deve necessariamente convergere a una costante."
  ],
  "adattamento": [
    "Un test di bontà dell’adattamento confronta una descrizione probabilistica esplicitata prima del controllo con i dati osservati. Un QQ plot può rendere visibili scostamenti locali che una singola statistica globale non descrive; un p-value grande non è prova che il modello sia vero. L’aggregazione in classi e la stima dei parametri modificano la distribuzione di riferimento.",
    "Il test χ² classico usa ∑(O−E)²/E su categorie con frequenze attese non troppo piccole; i gradi di libertà dipendono dai vincoli e dai parametri stimati, ma non ogni stima comporta automaticamente la semplice sottrazione del numero di parametri. Nel bootstrap parametrico bisogna simulare sotto il modello nullo e ripetere su ogni replica la stessa procedura di stima e test: omettere il rifitting altera il livello."
  ],
  "stimatori": [
    "Distorsione, variabilità e perdita si riferiscono alla distribuzione dello stimatore su ipotetiche ripetizioni del campionamento, non alla distanza di una singola stima dal vero parametro. L’errore quadratico medio unisce distorsione al quadrato e varianza, ma la scelta tra stimatori può dipendere dalla legge dei dati e dalla presenza di contaminazioni.",
    "La decomposizione MSE(T)=Var(T)+{E(T)−θ}² è esatta quando esiste il secondo momento. Per dati con code molto pesanti MSE e varianza possono essere indefiniti: in quel caso il confronto deve usare quantili degli errori, rischio con perdita limitata o misure robuste. Per l’efficienza relativa è necessario specificare il modello e distinguere rapporti asintotici da quelli finiti."
  ],
  "fisher": [
    "La verosimiglianza non rappresenta la probabilità del parametro: considera i dati fissati e misura quanto le diverse configurazioni parametriche li rendono plausibili. Score, curvatura e informazione sono quantità collegate ma non identiche su un campione. L’approssimazione quadratica ha un dominio di validità locale e dipende dalla regolarità.",
    "Sotto condizioni di regolarità che autorizzano la differenziazione sotto integrale, Eθ[U(θ)]=0 e Varθ[U(θ)]=−Eθ[ℓ″(θ)]. L’informazione additiva del campione i.i.d. è nI(θ); il limite di Cramér–Rao riguarda stimatori non distorti e ipotesi precise. Se il supporto dipende dal parametro o la stima è al bordo, le identità e gli intervalli Wald possono fallire: il laboratorio va letto anche come stress test delle assunzioni."
  ],
  "intervalli": [
    "Un intervallo di confidenza è una procedura casuale, mentre il parametro, nell’interpretazione frequentista, è fisso. La copertura del 95% significa che il metodo contiene il vero parametro nel 95% circa dei campioni ripetuti sotto il modello, non che l’intervallo già osservato assegni una probabilità del 95% al parametro.",
    "Per un parametro discreto la funzione di copertura può essere a gradini: un intervallo esatto conserva spesso copertura almeno nominale, pagando con ampiezza maggiore. I metodi Wald approssimano la distribuzione dello stimatore tramite la normale e possono essere inaffidabili vicino ai limiti dello spazio parametrico. Per valutare un intervallo non basta la sola copertura media: confronta ampiezza e copertura condizionale per valori differenti del parametro."
  ],
  "test": [
    "Il valore p quantifica la compatibilità della statistica osservata con H₀ secondo una distribuzione nulla definita; non è la probabilità che H₀ sia vera. La potenza dipende dall’alternativa concreta, dal campione e dal livello del test. Una decisione su un singolo esperimento non rivela da sola l’errore di prima o seconda specie.",
    "Sotto un test calibrato, P(rifiuto|H₀)=α (o al più α nel caso discreto); la funzione di potenza π(θ)=Pθ(rifiuto) varia nello spazio parametrico. Un test bilaterale non coincide con scegliere a posteriori la direzione più favorevole. Per valutare la calibrazione attraverso Monte Carlo, confronta la frequenza stimata dei rifiuti con α tenendo conto dell’errore binomiale e delle eventuali approssimazioni alla legge nulla."
  ],
  "regressione": [
    "L’OLS sceglie i coefficienti minimizzando gli scarti quadratici verticali; questo è un criterio geometrico, non la garanzia che una relazione sia causale. L’incertezza della media condizionata e quella di una futura osservazione sono differenti perché la seconda include anche il rumore non osservabile. Un punto estremo in x può alterare fortemente la retta anche con residuo piccolo.",
    "Con X a rango pieno, β̂=(XᵀX)⁻¹Xᵀy e Var(β̂|X)=σ²(XᵀX)⁻¹ sotto errori omoschedastici incorrelati. L’hat matrix H=X(XᵀX)⁻¹Xᵀ determina leverage hᵢᵢ e sensibilità della stima. La validità esatta degli intervalli t richiede ipotesi più forti della sola esistenza del minimo OLS; robustezza a eteroschedasticità e osservazioni influenti necessita procedure specifiche."
  ],
  "regressione-lp": [
    "Cambiando p nella perdita |residuo|ᵖ si modifica quali errori vengono maggiormente penalizzati. L2 è particolarmente sensibile a pochi residui grandi; L1 riduce il loro peso e può stabilizzare la stima sotto contaminazione. La risposta della retta a un outlier dipende però anche dalla posizione della covariata, non solo dalla scelta della perdita.",
    "Per 1<p<∞ la derivata del criterio è proporzionale a ∑xᵢ sign(rᵢ)|rᵢ|ᵖ⁻¹; gli IRLS approssimano la soluzione mediante sistemi di minimi quadrati con pesi dipendenti dai residui. Per p<2 piccoli residui possono creare pesi numericamente molto grandi: serve una regolarizzazione numerica coerente. Gli argomenti di massima efficienza di L2 sotto errori gaussiani non implicano superiorità universale se il modello degli errori è specificato male."
  ],
  "glm": [
    "Nei GLM il predittore lineare η=Xβ entra nella media attraverso una funzione di collegamento, mentre la famiglia probabilistica determina la relazione tra media e varianza. Coefficienti logistici e di Poisson operano su scale differenti: odds e rapporti di intensità non sono differenze assolute delle risposte.",
    "Con link canonico, la log-verosimiglianza di una famiglia esponenziale produce uno score del tipo Xᵀ(y−μ) opportunamente scalato; IRLS usa una quadratic approximation locale mediante matrice dei pesi. La convergenza dell’algoritmo non prova di per sé l’esistenza di una stima finita: nella regressione logistica con separazione completa i coefficienti possono divergere. Le approssimazioni di Wald dipendono dall’informazione e possono essere molto imprecise in campioni piccoli."
  ],
  "arma": [
    "Una serie temporale con memoria non può essere trattata come un insieme di osservazioni indipendenti. I parametri AR controllano la retroazione dei valori passati; quelli MA il modo in cui gli shock passati si propagano. ACF e PACF sono stimatori campionari incerti: un andamento irregolare su una singola serie non equivale a una identificazione certa del modello.",
    "Per un AR(1) stazionario con |φ|<1, γ(h)=σ²φ^|h|/(1−φ²); un MA(q) ha autocovarianza nulla dopo q ritardi. Per un ARMA generale stazionarietà e invertibilità richiedono vincoli sulle radici dei polinomi AR e MA, rispettivamente, secondo la convenzione dei ritardi adottata. Vicino a una radice unitaria le approssimazioni asintotiche standard e la precisione delle stime possono degradarsi nettamente."
  ],
  "quantilica": [
    "La regressione quantilica descrive più punti della distribuzione condizionata, mentre OLS descrive la media condizionata. L’eteroschedasticità può far divergere le pendenze quantiliche per valori differenti di τ, anche quando la media segue una semplice retta. La perdita asimmetrica rende esplicito il costo diverso degli errori sopra e sotto la curva.",
    "La funzione check ρτ(u)=u{τ−1(u<0)} porta a condizioni di ottimalità subgradiente perché non è differenziabile in zero. Sotto regolarità, la varianza asintotica coinvolge la densità condizionata nel quantile stimato: non dipende soltanto dalla varianza degli errori. Le rette per τ differenti possono incrociarsi se stimate separatamente, e non ogni quantile campionario rispetta esattamente una quota τ di punti sotto la retta con regressori multipli."
  ],
  "penalizzata": [
    "Ridge e lasso modificano la funzione obiettivo per limitare la grandezza dei coefficienti, con differenti geometrie dei vincoli. Lasso può porre coefficienti esattamente a zero; ridge li restringe senza selezione esatta in generale. La standardizzazione è decisiva: lo stesso λ non impone la stessa penalità effettiva a covariate su scale diverse.",
    "La soluzione ridge, con intercetta non penalizzata e covariate centrate, è (XᵀX+λI)⁻¹Xᵀy; il valore numerico di λ dipende dalla normalizzazione della loss. Nel lasso la non differenziabilità della norma L1 produce condizioni KKT con sottogradienti in [−1,1]. Se i regressori sono fortemente correlati la selezione può essere instabile; il tuning tramite validazione deve essere rifatto entro ogni fold per evitare ottimismo."
  ],
  "spline": [
    "Le spline approssimano una funzione tramite basi locali; le penalizzazioni controllano l’ondulazione della curva senza fissarne una formula rigida. Nei metodi kernel la banda regola il compromesso fra località e stabilità. Un adattamento apparentemente perfetto sui punti osservati può avere maggiore errore lontano dal campione.",
    "Per un linear smoother con ŷ=Sy, i gradi di libertà effettivi sono spesso tr(S), non il numero letterale di coefficienti. Sotto un modello con media m e errori omoschedastici, E[(ŷ−m)²] si scompone in distorsione² e σ² tr(SSᵀ) per la perdita aggregata, con normalizzazioni appropriate. La cross-validation ordinaria può essere ottimista in presenza di dipendenza tra osservazioni; la scelta del parametro di smoothing è parte della procedura da valutare."
  ],
  "segmentata": [
    "La regressione segmentata descrive un cambiamento nella pendenza della funzione media mediante una cerniera (x−ψ)₊. La continuità della curva non implica continuità della derivata: la pendenza successiva al breakpoint è la somma della pendenza iniziale e della variazione stimata. Quando il cambiamento è debole i dati contengono poca informazione sulla posizione di ψ.",
    "Il profilo della somma dei residui quadratici in ψ può essere poco curvo, multimodale o con minimizzatore vicino ai bordi. Sotto l’ipotesi δ=0 il parametro ψ non è identificato, perciò un test Wald ordinario che lo tratta come parametro regolare è inappropriato. Un intervallo per ψ ottenuto da profilo o bootstrap richiede condizioni specifiche e la sua copertura può degradarsi per cambiamenti piccoli."
  ],
  "validazione": [
    "La qualità predittiva riguarda osservazioni non utilizzate per costruire il modello, compresa la scelta delle trasformazioni e degli iperparametri. L’errore di training tende a favorire modelli più flessibili; l’errore sul test finale serve a valutare una procedura già selezionata, non a selezionarla nuovamente.",
    "Formalmente, scegliere il parametro che minimizza una stima rumorosa di rischio produce ottimismo da selezione. Se la ricerca del migliore iperparametro coinvolge molti candidati, il minimo della validation loss non è una stima senza distorsione del rischio del modello finale. Per valutare l’intera procedura di tuning usa test esterno o nested cross-validation; tutte le operazioni apprese dai dati, inclusa standardizzazione e imputazione, devono essere stimate solo sui fold di training."
  ],
  "knn": [
    "Il kNN assegna un’etichetta a una nuova osservazione utilizzando le classi dei vicini più prossimi nella metrica scelta. k piccolo rende la frontiera molto irregolare; k grande produce una mediazione più forte. La distanza è una decisione modellistica: cambiando scala o metrica cambia anche quali osservazioni risultano vicine.",
    "In condizioni regolari e con k→∞ ma k/n→0, il kNN può essere consistente; questo risultato asintotico non garantisce prestazioni su campioni finiti o in dimensione elevata. La maledizione della dimensionalità rende i vicini meno locali a parità di n. La stima del rischio deve distinguere dati usati per scegliere k e dati per la verifica finale; altrimenti la selezione induce ottimismo."
  ],
  "alberi": [
    "Un albero CART divide ricorsivamente lo spazio delle covariate in regioni rettangolari e assegna una predizione a ciascuna foglia. Piccole modifiche del campione possono cambiare i primi split e quindi la struttura intera: questa instabilità è una motivazione per gli ensemble, non soltanto un difetto estetico del grafico.",
    "Bagging riduce la componente di varianza aggregando alberi addestrati su campioni bootstrap. Random forest limita a mtry il numero di candidate a ogni nodo per ridurre la correlazione tra alberi. Per la media di B predittori con varianza v e correlazione comune ρ, Var(media)=v{ρ+(1−ρ)/B}; perciò aumentando B non si elimina la quota di varianza comune. La stima OOB è utile, ma il tuning su OOB necessita una valutazione distinta."
  ],
  "boost": [
    "Il boosting costruisce un modello additivo in successione: a ogni passo il nuovo learner corregge la direzione in cui la perdita corrente diminuisce. Nella regressione quadratica gli pseudo-residui coincidono con i residui ordinari; nella classificazione logistica dipendono dalla probabilità attuale e dalla derivata della log-loss.",
    "Nel gradient boosting funzionale, Fₘ=Fₘ₋₁+νhₘ e hₘ approssima il gradiente negativo della perdita rispetto alla funzione predittiva. Learning rate e numero di iterazioni non sono parametri indipendenti: un ν piccolo richiede spesso più alberi. La procedura che sceglie m sulla validazione deve essere valutata su un test separato; il modello didattico con piccoli alberi CART non coincide automaticamente con gli aggiornamenti di librerie XGBoost, LightGBM o CatBoost."
  ],
  "reti-neurali": [
    "Una rete neurale a uno o pochi strati nascosti compone trasformazioni affini e funzioni di attivazione. I pesi sono stimati minimizzando una funzione obiettivo; i neuroni non corrispondono necessariamente a variabili interpretabili. L’evoluzione del training deve essere letta insieme alla validation loss e alla sensibilità rispetto all’inizializzazione.",
    "La backpropagation applica la regola della catena a un grafo di calcolo, propagando derivate dal layer di uscita verso quelli iniziali. Attivazioni saturanti possono generare gradienti piccoli; learning rate e inizializzazione condizionano la dinamica dell’ottimizzazione non convessa. Una minima training loss non dimostra generalizzazione: è necessario tenere separati campioni di validazione e test e valutare robustezza tra inizializzazioni."
  ],
  "pca": [
    "La PCA cerca direzioni ortogonali di massima varianza, non necessariamente variabili latenti causalmente significative. Centrare i dati è necessario per analizzare la covarianza; standardizzarli cambia la geometria e fa dominare altre componenti. La proiezione su k assi principali è un’approssimazione a rango ridotto e conserva soltanto una quota della variabilità totale.",
    "La PCA può essere ottenuta mediante decomposizione agli autovalori della covarianza oppure SVD della matrice centrata. Il teorema di Eckart–Young giustifica, in norma di Frobenius, la ricostruzione ottimale a rango k tramite le prime componenti. Il segno degli autovettori è indeterminato e autovalori coincidenti non identificano direzioni uniche: per confrontare due PCA vicine confronta proiettori sui sottospazi, non soltanto singoli vettori."
  ],
  "clustering": [
    "Il clustering ricerca una struttura nei dati senza osservare necessariamente etichette corrette. K-means ottimizza la somma delle distanze quadratiche ai centroidi, privilegiando forme relativamente compatte; il clustering gerarchico costruisce invece una sequenza di fusioni secondo una distanza tra gruppi. Entrambi impongono una struttura anche a dati privi di gruppi reali.",
    "L’algoritmo di Lloyd alterna assegnazione e aggiornamento dei centroidi e non aumenta la funzione obiettivo, ma può convergere a minimi locali dipendenti dall’inizializzazione. I metodi di linkage definiscono criteri differenti di fusione: single può generare chaining e Ward privilegia incrementi di inerzia. Indici interni come silhouette non equivalgono a evidenza inferenziale dell’esistenza di cluster; se le etichette sono simulate, l’ARI misura soltanto l’accordo con quelle etichette generative."
  ],
  "dbscan": [
    "DBSCAN identifica regioni dense mediante una soglia di distanza ε e il numero minimo di punti nell’intorno. I punti core sostengono l’espansione; i punti di bordo possono appartenere a regioni raggiunte da più gruppi; il rumore resta fuori. Il metodo non richiede K, ma il suo risultato dipende fortemente da scala e densità.",
    "I cluster core sono determinati dalla connettività per densità, mentre le etichette dei punti di bordo contesi possono dipendere dalla convenzione di visita. L’ARI richiede etichette di riferimento, qui disponibili perché i dati sono simulati; la silhouette, soprattutto con rumore escluso, misura una diversa proprietà geometrica. Una sola ε può fallire con densità diseguali: osserva come cambia la partizione senza interpretare ogni cluster come prova di una popolazione distinta."
  ],
  "moran": [
    "Moran I confronta il prodotto delle deviazioni dalla media fra territori collegati dalla matrice W. Cambiare definizione dei vicini cambia la domanda statistica: una correlazione positiva su rook può non coincidere con quella ottenuta su queen o pesi a distanza. Le permutazioni descrivono una specifica ipotesi di scambiabilità dei valori sulle unità.",
    "Per pesi fissati, I=(n/S₀)(zᵀWz)/(zᵀz). Sotto permutazione casuale e convenzioni ordinarie, E(I)=−1/(n−1); non è in generale zero. La simmetria di W non è garantita dalla normalizzazione per riga e ciò influenza alcune interpretazioni. Un trend deterministico può generare valori vicini simili senza dipendenza dei residui: confronta Moran sui valori e sugli errori dopo rimozione del trend, senza chiamare automaticamente il risultato causalità spaziale."
  ],
  "lisa": [
    "Le statistiche locali rispondono a domande diverse dall’indice globale. Una cella con valore elevato può stare in un gruppo High–High oppure essere un outlier High–Low; la classificazione dei quadranti non è un test. I risultati inferenziali richiedono permutazioni compatibili con la statistica locale e attenzione alla molteplicità.",
    "Una forma comune è Iᵢ=(zᵢ/m₂)∑ⱼwᵢⱼzⱼ, con convenzioni di m₂ e normalizzazione che devono coincidere tra JS e R. Le permutazioni condizionali mantengono fisso il valore dell’unità i e ridistribuiscono gli altri valori. BH controlla il FDR sotto condizioni precise di dipendenza; BY usa una soglia più conservativa per dipendenze arbitrarie. Cambiare la zonizzazione modifica variabili aggregate, pesi e popolazione dei test: il MAUP non è un semplice effetto grafico."
  ],
  "processi-puntuali": [
    "In un processo puntuale i dati sono posizioni degli eventi, non valori attribuiti ad aree fisse. Aggregazione, regolarità e casualità completa sono proprietà del meccanismo che genera i punti. La stessa configurazione può apparire aggregata perché l’intensità varia nello spazio, anche se gli eventi sono indipendenti condizionatamente all’intensità.",
    "Per un processo di Poisson omogeneo piano con intensità λ, K(r)=πr² e L(r)=√{K(r)/π}; un eccesso di L(r)−r può suggerire aggregazione a quella scala. La stima K richiede correzioni per gli effetti di bordo e la funzione scelta influenza il risultato. Gli envelope puntuali costruiti per ciascun r non costituiscono automaticamente un test globale al livello nominale, poiché si confrontano simultaneamente molte distanze."
  ],
  "variogrammi": [
    "Il variogramma misura quanto due osservazioni differiscono al crescere della distanza. In un campo con correlazione positiva a breve raggio, le differenze quadratiche tendono ad aumentare con la distanza; il nugget introduce una componente discontinua in prossimità di zero. Ogni punto empirico del grafico aggrega coppie e ha precisione dipendente dal numero e dalla distribuzione delle coppie.",
    "Sotto stazionarietà di secondo ordine, γ(h)=C(0)−C(h); con anisotropia geometrica la distanza entra tramite una norma trasformata, non necessariamente la distanza euclidea. La semivarianza empirica di Matheron è una media di ½{Z(sᵢ)−Z(sⱼ)}² per classe di lag. Se la media presenta un trend non modellato il variogramma empirico lo incorpora, compromettendo la stima di C. Il range pratico del modello esponenziale non coincide con il suo parametro di scala φ."
  ],
  "kriging": [
    "Il kriging predice un campo aleatorio sfruttando la covarianza tra siti osservati e punto bersaglio. Simple kriging assume media nota, ordinary kriging media costante ignota e IDW costruisce pesi deterministici in funzione delle distanze. La varianza di kriging esprime incertezza sotto il modello scelto: non è l’errore che si realizzerà necessariamente sul campo visualizzato.",
    "Con C=Cov(Y), c=Cov(Y,Z₀), il predittore lineare a media nota usa w=C⁻¹c e rischio minimo Var(Z₀)−cᵀC⁻¹c. Per la media ignota costante la restrizione 1ᵀw=1 conduce al sistema ordinario con moltiplicatore. Un nugget di misura entra in C per le osservazioni, ma non nella covarianza c con il processo latente. La varianza prevista ignora l’incertezza sui parametri di covarianza quando trattati come noti e può risultare non calibrata sotto specificazione errata."
  ],
  "regressione-spaziale": [
    "In una regressione territoriale la dipendenza spaziale può riguardare direttamente la risposta oppure gli errori non spiegati dalle covariate. SAR e SEM codificano due meccanismi differenti e richiedono un’ipotesi sulla matrice dei pesi W. Una buona predizione geografica dipende anche da quanto i siti di test siano lontani da quelli di addestramento.",
    "Nel SAR y=(I−ρW)⁻¹(Xβ+ε), quindi l’effetto marginale di una covariata attraversa il moltiplicatore spaziale. La log-verosimiglianza introduce log|det(I−ρW)| come Jacobiano; nel SEM occorre trasformare anche la parte Xβ. La ricerca su griglia del laboratorio non è equivalente a un massimo continuo e non produce automaticamente intervalli validi. Random CV e spatial block CV stimano errori per due disegni predittivi diversi: la scelta dipende dal dominio di impiego finale."
  ]
};
  Object.keys(chapters).forEach(function(id){
    if (!SA.pedagogy[id]) SA.pedagogy[id]={};
    SA.pedagogy[id].essenziale='<h3>Dal risultato alla conclusione</h3><p>'+chapters[id][0]+'</p>';
    SA.pedagogy[id].avanzato='<h3>Derivazione, ipotesi e campo di validità</h3><p>'+chapters[id][1]+'</p>';
  });
})();
