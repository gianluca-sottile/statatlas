# StatAtlas 2.1 (sviluppo) — Audit scientifico dei 31 laboratori

**Perimetro:** 31 laboratori, approfondimenti Essenziale e Avanzato e 93 sfide. Baseline: archivio della versione pilota 2.1, che include le verifiche R confermate dall’autore per i laboratori 01–31.

## Metodo e distinzione tra controlli

- **Revisione teorica integrata:** per ogni laboratorio sono stati aggiunti enunciati/assunzioni, un percorso di derivazione, un controesempio o limite e una verifica empirica mirata. Gli inserti sono nei pannelli Essenziale e Avanzato; le spiegazioni originarie restano intatte.
- **Sfide:** 3 per laboratorio, 93 in totale; 9 già specifiche del motore (LAB 08, 18, 30) e 84 con requisiti osservabili di esecuzione e cambi parametri. I feedback sono stati scritti sul metodo studiato, non generati casualmente.
- **Controlli tecnici:** compilazione, suite JS, test di 93 schede e verifiche browser. I confronti R precedenti sono stati confermati dall’autore, ma non rieseguiti in questa fase.
- **Limite epistemico:** una revisione espositiva e la verifica di identità matematiche rappresentative non costituiscono una peer review formale di tutte le dimostrazioni contenute in 31 capitoli. La validazione didattica delle sfide resta da svolgere con studenti.

## Stato per ciascun laboratorio

Per ogni modulo, **Integrato** significa che i nuovi contenuti e le tre attività sono presenti nei file e vengono caricati; non implica certificazione psicometrica o dimostrazione indipendente della totalità dei risultati.

### LAB 01 — Distribuzioni e relazioni

**Assunzioni e definizioni rivedute.** La funzione di ripartizione F(x)=P(X≤x) esiste per qualsiasi legge; una densità rispetto a Lebesgue, invece, esiste solo nelle componenti assolutamente continue. Per una legge discreta si sommano le masse: la densità disegnata, quando presente, non è da interpretare come probabilità puntuale.

**Derivazione integrata.** Per a<b, l’additività degli eventi dà P(a<X≤b)=F(b)−F(a). Se X è continua con densità f, questa differenza vale l’integrale di f fra a e b. Per n osservazioni iid, la ripartizione empirica F_n(x)=n⁻¹∑1{X_i≤x} ha E[F_n(x)]=F(x) e Var[F_n(x)]=F(x){1−F(x)}/n; la banda DKW controlla il supremo su x, non una singola ordinata.

**Casi critici e interpretazione.** Le leggi Cauchy non possiedono media e varianza; non usare grafici di media campionaria come evidenza della LGN. Per i campioni discreti, la differenza fra F(a) e F(a−) distingue intervalli che includono il bordo.

**Esperimento di verifica.** Fissa una probabilità di intervallo e aumenta n: confronta la frequenza empirica con l’integrale teorico; poi passa a una distribuzione senza momenti.

**Sfide:** tre livelli; Probabilità o densità?; Banda e campione; Momenti non definiti.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 02 — Variabili bivariate

**Assunzioni e definizioni rivedute.** La correlazione di Pearson è definita quando le varianze sono finite e positive. Correlazione nulla non equivale a indipendenza in generale; la distribuzione condizionata richiede una definizione coerente quando l’evento X=x ha probabilità zero.

**Derivazione integrata.** Per una normale bivariata (X,Y) con medie μ_X,μ_Y, deviazioni σ_X,σ_Y e correlazione ρ, Y|X=x è normale con media μ_Y+ρ(σ_Y/σ_X)(x−μ_X) e varianza σ_Y²(1−ρ²). L’identità discende dalla decomposizione Y=μ_Y+ρσ_Y(X−μ_X)/σ_X+σ_Y√(1−ρ²)Z con Z normale indipendente. La formula non si estende a distribuzioni arbitrarie.

**Casi critici e interpretazione.** Nel caso Y=X² con X simmetrica centrata, Cov(X,Y)=E(X³)=0 ma Y è determinato da X. Una fascia condizionante di ampiezza positiva stima Y|X in un intorno, non esattamente Y|X=x.

**Esperimento di verifica.** Confronta un generatore normale e uno curvilineo mantenendo la correlazione vicina a zero; osserva le marginali e la distribuzione condizionata.

**Sfide:** tre livelli; Correlazione e forma; Condizionare su X; Varianza condizionata.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 03 — Metodi di simulazione

**Assunzioni e definizioni rivedute.** L’inversione della ripartizione richiede di utilizzare la funzione quantile generalizzata per distribuzioni con salti: F⁻¹(u)=inf{x:F(x)≥u}. I metodi Monte Carlo richiedono di chiarire campione, variabile integrata e condizioni di integrabilità.

**Derivazione integrata.** Se U~U(0,1), P(F⁻¹(U)≤x)=P(U≤F(x))=F(x). Per Z_i iid con varianza τ² finita, la media Monte Carlo ha varianza τ²/M e errore standard τ/√M. Per un Rao–Blackwell Z*=E(Z|V), la varianza totale dà Var(Z)=E Var(Z|V)+Var(Z*), quindi Var(Z*)≤Var(Z) a parità di valore atteso.

**Casi critici e interpretazione.** L’uso di tecniche per ridurre la varianza non rende sempre qualsiasi metodo migliore: se Z ha varianza infinita, l’errore standard classico non è disponibile; i confronti richiedono uno stesso estimando.

**Esperimento di verifica.** Genera lo stesso integrale con due stimatori diversi e confronta su molte repliche bias e varianza, non una sola realizzazione.

**Sfide:** tre livelli; Inversione; Monte Carlo e precisione; Rao–Blackwell.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 04 — Grandi numeri e limite centrale

**Assunzioni e definizioni rivedute.** Distinguere convergenza quasi certa/in probabilità della media e convergenza in distribuzione della media normalizzata. Il TCL classico iid richiede media μ e varianza σ² finite con σ>0.

**Derivazione integrata.** Posto S_n=∑(X_i−μ), l’indipendenza dà Var(S_n)=nσ², perciò Var(√n(X̄_n−μ)/σ)=1. Il TCL di Lindeberg–Lévy conclude la convergenza in distribuzione a N(0,1); non garantisce che la media sia normale per n finito. La LGN deriva, sotto iid integrabili, da condizioni diverse e converge a μ senza specificare necessariamente la velocità.

**Casi critici e interpretazione.** Per la Cauchy iid la media conserva la stessa legge di partenza e non converge in probabilità a un valore finito. Per distribuzioni asimmetriche con varianza finita la convergenza alla normale può essere lenta.

**Esperimento di verifica.** Metti a confronto normale, asimmetrica e Cauchy, separando traiettoria delle medie e istogramma delle medie standardizzate.

**Sfide:** tre livelli; Legge dei grandi numeri; Normalizzazione del TCL; Code pesanti.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 05 — Adattamento di un modello

**Assunzioni e definizioni rivedute.** Il test confronta una famiglia di probabilità teoriche con frequenze osservate; scelta delle classi, stima di parametri e campioni piccoli determinano la calibrazione della distribuzione nulla.

**Derivazione integrata.** Per k categorie e probabilità π_j note, X²=∑(O_j−nπ_j)²/(nπ_j), con somma dei residui zero; sotto H0 e condizioni regolari converge a χ²_(k−1). Se q parametri vengono stimati con una procedura compatibile con l’assetto multinomiale, i gradi di libertà possono scendere a k−1−q; non vale automaticamente per qualunque stimatore o raggruppamento. Un bootstrap parametrico deve rifare la stima in ogni campione simulato.

**Casi critici e interpretazione.** Le frequenze attese molto basse invalidano l’approssimazione chi-quadrato; non considerare il mancato rifiuto una conferma del modello. Adattare le classi dopo aver visto i dati può alterare il livello.

**Esperimento di verifica.** Genera dati dal modello nullo e confronta livello empirico prima e dopo stima dei parametri e accorpamento delle classi.

**Sfide:** tre livelli; Test e modello; Gradi di libertà; Classi rare.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 06 — Media, mediana e massima verosimiglianza

**Assunzioni e definizioni rivedute.** Uno stimatore può essere non distorto ma non robusto, o avere bias piccolo ma MSE superiore. I momenti della distribuzione devono esistere prima di confrontare varianze e MSE teorici.

**Derivazione integrata.** Per T, MSE(T)=E(T−θ)²=Var(T)+Bias(T)² quando i secondi momenti esistono. Per la normale con scala σ, Var(X̄)=σ²/n e Var(mediana)≈πσ²/(2n) asintoticamente; sotto Laplace(θ,b) la mediana è MLE di posizione e la sua varianza asintotica è b²/n contro 2b²/n per la media. Questi confronti valgono nel rispettivo modello.

**Casi critici e interpretazione.** Per Cauchy la media campionaria mantiene la legge Cauchy: scrivere la sua varianza come infinito è una scorciatoia, non una varianza ordinaria. L’MLE di Cauchy può avere massimi locali e richiede attenzione all’inizializzazione.

**Esperimento di verifica.** Confronta mediana e media sotto normale, Laplace e Cauchy usando MSE solo quando è definito; osserva la distribuzione delle stime.

**Sfide:** tre livelli; Media e mediana; Efficienza relativa; Cauchy e stima.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 07 — Verosimiglianza e informazione di Fisher

**Assunzioni e definizioni rivedute.** L’informazione è un oggetto del modello: dipende dal parametro, dall’esperimento e dalla parametrizzazione. Le identità dello score e il limite di Cramér–Rao necessitano ipotesi di regolarità esplicite.

**Derivazione integrata.** Se f_θ è derivabile con supporto fisso e si può scambiare derivata e integrale, Eθ U(θ)=∫∂θ f_θ(x)dx=0. Derivando ancora si ottiene 0=Eθ[∂θ² log f]+Eθ[U²], cioè I=Var(U)=−E ℓʺ per un’osservazione. Per n iid I_n=nI_1; uno stimatore non distorto differenziabile soddisfa Var(T)≥{gʹ(θ)}²/I_n sotto le altre condizioni del teorema.

**Casi critici e interpretazione.** La famiglia uniforme su (0,θ) ha supporto dipendente dal parametro e non ammette le manipolazioni standard di Bartlett. Per campioni piccoli, MLE e Wald possono divergere dalle proprietà asintotiche.

**Esperimento di verifica.** Scegli più modelli, confronta informazione attesa e osservata e verifica come cambia la dispersione della stima con n.

**Sfide:** tre livelli; Informazione e precisione; Score; Identità di Bartlett.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 08 — Intervalli di confidenza

**Assunzioni e definizioni rivedute.** Il livello nominale riguarda una procedura aleatoria prima di osservare il campione. Occorre distinguere copertura reale, copertura asintotica e ampiezza; un intervallo più stretto non è necessariamente meglio calibrato.

**Derivazione integrata.** Per X_i iid N(μ,σ²) con σ ignota, (X̄−μ)/(S/√n)~t_(n−1); invertendo l’evento centrale si ottiene l’intervallo t con copertura esatta 1−α. Per Bernoulli, la copertura di un intervallo C(X) è ∑_{k=0}^n 1{p∈C(k)} Bin(n,k;p). Questo consente di mostrare che Wilson e Wald possono sottocoprire, mentre l’inversione esatta di Clopper–Pearson è tipicamente conservativa.

**Casi critici e interpretazione.** La copertura realizzata di 100 repliche non è un’uguaglianza al 95%. Intervalli bootstrap, percentile e BCa richiedono condizioni di regolarità: non promettere accuratezza di secondo ordine per ogni statistica o a n arbitrario.

**Esperimento di verifica.** Fissa n=20, p=0,1 e confronta copertura esatta di Wald, Wilson e un intervallo esatto; poi aumenta n.

**Sfide:** tre livelli; prerequisiti specialistici già presenti.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 09 — Test e potenza

**Assunzioni e definizioni rivedute.** Un test di livello α controlla l’errore di primo tipo sotto la specifica ipotesi nulla. Il p-value non è P(H0|dati); la potenza è una funzione del parametro sotto alternative considerate.

**Derivazione integrata.** Per test Z bilaterale con Z~N(δ√n,1) sotto l’alternativa, la potenza è P(Z>z_(1−α/2))+P(Z<−z_(1−α/2)), valutata nella normale spostata. L’approssimazione Φ(δ√n−z_(1−α/2)) trascura la coda inferiore, talvolta piccola ma non identicamente nulla. Con H0 continua e statistica calibrata, il p-value può essere uniforme; con statistiche discrete è spesso superuniforme.

**Casi critici e interpretazione.** La non significatività non prova equivalenza. La potenza post hoc calcolata sullo stesso effetto stimato è essenzialmente una riscrittura del risultato osservato.

**Esperimento di verifica.** Confronta potenze empiriche e teoriche cambiando livello, n, effetto e unilateralità; misura separatamente gli errori sotto H0.

**Sfide:** tre livelli; Livello del test; Potenza; p-value.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 10 — Regressione interattiva

**Assunzioni e definizioni rivedute.** Nel modello lineare con disegno fisso e rango pieno, la media condizionata e una futura osservazione sono due target distinti. La non distorsione OLS non implica che gli intervalli t classici siano esatti sotto qualunque rumore.

**Derivazione integrata.** Per Y=Xβ+ε, E(ε|X)=0 e Var(ε|X)=σ²I, β̂=(XᵀX)⁻¹XᵀY soddisfa E(β̂|X)=β e Var(β̂|X)=σ²(XᵀX)⁻¹. Per x0 fissato, Var(x0ᵀβ̂)=σ²h0, mentre la varianza dell’errore di una nuova risposta è σ²(1+h0) assumendo un nuovo errore indipendente. La differenza spiega la maggiore larghezza del predittivo.

**Casi critici e interpretazione.** Con eteroschedasticità, i coefficienti OLS possono restare non distorti, ma l’errore standard omoschedastico è inconsistente. Punti ad alto leverage non sono necessariamente outlier in y.

**Esperimento di verifica.** Sposta un punto in x e poi in y, confronta la retta, gli intervalli della media e quelli predittivi e registra la distanza di Cook.

**Sfide:** tre livelli; Banda e previsione; Leverage; Inferenza OLS.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 11 — Regressione L1, L2, Lp

**Assunzioni e definizioni rivedute.** I criteri Lp con p≥1 sono convessi nei residui e, attraverso un predittore lineare, in β. L’unicità richiede ulteriori condizioni (per esempio rango e proprietà stretta del criterio). Robustezza ed efficienza dipendono dalla legge degli errori.

**Derivazione integrata.** Per loss ρ_p(r)=|r|^p, lo score è ψ_p(r)=p sign(r)|r|^(p−1), definito con subgradiente in r=0 per p=1. In un modello regolare di posizione, la varianza asintotica di uno stimatore M è E[ψ(ε)²]/{n(E[ψʹ(ε)])²}; la formula presuppone esistenza dei momenti e regolarità della derivata. La funzione quadratica è efficiente per errori normali, la loss assoluta per Laplace.

**Casi critici e interpretazione.** Con p<1 la funzione obiettivo perde convessità; con errori Cauchy l’MSE per L2 non è definito. Il metodo numerico IRLS può richiedere regolarizzazioni vicino a residuo zero.

**Esperimento di verifica.** Confronta L1 e L2 sotto normale, Laplace e contaminazione usando bias, quantili e dispersione campionaria.

**Sfide:** tre livelli; Criterio L1; Efficienza vs robustezza; Convessità.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 12 — Modelli lineari generalizzati

**Assunzioni e definizioni rivedute.** Un GLM richiede famiglia esponenziale (o struttura quasi-verosimile separatamente dichiarata), link e varianza condizionata appropriati. I coefficienti vivono sulla scala del link, non necessariamente su quella della risposta.

**Derivazione integrata.** Con η_i=x_iᵀβ e μ_i=g⁻¹(η_i), la log-verosimiglianza genera score U(β)=XᵀD V⁻¹(y−μ) nella parametrizzazione generale, dove D=diag(dμ/dη) e V contiene le varianze condizionate appropriate. Il Fisher scoring porta a una regressione pesata iterata, con risposta di lavoro z=η+(y−μ)/(dμ/dη), quando la derivata è non nulla. Per il logit, exp(β_j) è un odds ratio condizionato.

**Casi critici e interpretazione.** Separazione completa nella logistica può portare stime divergenti e matrici di informazione mal condizionate. L’approssimazione normale di Wald è fragile anche vicino a confini del parametro.

**Esperimento di verifica.** Aumenta la separazione nel generatore binario, osserva la convergenza IRLS e confronta l’intervallo Wald con una verifica su più campioni.

**Sfide:** tre livelli; Legame del GLM; Separazione logistica; Interpretazione coefficiente.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 13 — Serie temporali ARMA

**Assunzioni e definizioni rivedute.** AR(p), MA(q) e ARMA(p,q) richiedono specifiche condizioni sulle radici per stazionarietà e invertibilità. I risultati per AR(1) non sono automaticamente formule generali ARMA.

**Derivazione integrata.** Per X_t=φX_(t−1)+ε_t, con ε_t rumore bianco di varianza σ² e |φ|<1, iterando si ha X_t=∑_{j≥0} φ^j ε_(t−j). La varianza è σ²∑φ^(2j)=σ²/(1−φ²), e la covarianza a lag h è γ(h)=φ^|h|σ²/(1−φ²). La PACF di un AR(p) teorico si tronca dopo p; l’ACF di un MA(q) dopo q.

**Casi critici e interpretazione.** Avvicinarsi a una radice unitaria rallenta molto il decadimento della dipendenza; ACF/PACF campionarie non mostrano necessariamente tagli netti in piccole serie.

**Esperimento di verifica.** Varia φ, lunghezza della serie e modello AR/MA; verifica l’effetto sulla varianza e sulle stime delle correlazioni.

**Sfide:** tre livelli; AR e memoria; ACF e PACF; Stazionarietà.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 14 — Regressione quantilica

**Assunzioni e definizioni rivedute.** La regressione quantilica studia un quantile della risposta condizionata a X, non un quantile dei residui della regressione OLS. La sua interpretazione causale richiederebbe ipotesi aggiuntive e non deriva dalla sola stima.

**Derivazione integrata.** La loss check è ρ_τ(u)=u(τ−1{u<0}); il suo subgradiente è τ−1{u<0} lontano da zero. Minimizzare ∑ρ_τ(y_i−x_iᵀβ) conduce a condizioni di bilanciamento delle osservazioni sopra e sotto l’iperpiano. L’inferenza asintotica dipende dalla densità condizionata del residuo al quantile, non soltanto dalla matrice dei regressori.

**Casi critici e interpretazione.** Le rette quantiliche stimate separatamente possono incrociarsi e non implicano automaticamente una famiglia di distribuzioni condizionate coerente. Eteroschedasticità e misspecificazione della forma sono due fenomeni diversi.

**Esperimento di verifica.** Varia τ e la dispersione degli errori per confrontare media e quantili condizionati, includendo un outlier.

**Sfide:** tre livelli; Quantile condizionato; Eteroschedasticità; Non regolarità.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 15 — Ridge, lasso ed elastic net

**Assunzioni e definizioni rivedute.** La penalizzazione richiede di dichiarare scala della loss, standardizzazione dei predittori e trattamento dell’intercetta. La selezione di λ per CV non equivale a inferenza non selettiva sul modello scelto.

**Derivazione integrata.** Nel lasso il problema min_β ½||y−Xβ||²+λ||β||_1 ha condizioni KKT X_jᵀ(y−Xβ̂)=λ s_j con s_j=sign(β̂_j) se β̂_j≠0, e |X_jᵀr|≤λ se β̂_j=0. Per XᵀX diagonale con colonne normalizzate, la soluzione usa soft-thresholding. Ridge produce shrinkage continuo; elastic net combina L1 e L2 e può modificare la stabilità con regressori correlati.

**Casi critici e interpretazione.** Le soglie su λ cambiano se la loss viene divisa per n. L’intercetta normalmente non va penalizzata; standardizzare sull’intero dataset prima della CV crea leakage.

**Esperimento di verifica.** Confronta percorsi lasso con predittori correlati e controlla l’errore test dopo il tuning in CV.

**Sfide:** tre livelli; Shrinkage; Correlazione predittori; Tuning e leakage.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 16 — Regressione non parametrica e spline

**Assunzioni e definizioni rivedute.** Spline penalizzate e kernel sono famiglie differenti di stimatori flessibili; la quantità di regolarizzazione deve essere collegata al rischio fuori campione, non soltanto alla bontà di adattamento.

**Derivazione integrata.** Per una spline di smoothing si minimizza ∑(y_i−f(x_i))²+λ∫{fʺ(t)}²dt nello spazio funzionale adeguato; il teorema di rappresentazione conduce a una spline cubica naturale con nodi nei dati. Per smoothers lineari si scrive f̂=S_λy e df_eff=tr(S_λ), da non confondere con il numero dei nodi. Nel kernel di Nadaraya–Watson si usano pesi normalizzati K((x−x_i)/h), e la bandwidth h controlla il vicinato.

**Casi critici e interpretazione.** Una scelta molto piccola di bandwidth può amplificare il rumore; una spline troppo liscia può cancellare un cambiamento brusco. L’estrapolazione oltre i dati può essere instabile.

**Esperimento di verifica.** Confronta la curva stimata e la funzione generatrice sotto diversi parametri di levigatura, usando errore fuori campione.

**Sfide:** tre livelli; Smoothing; Kernel bandwidth; Flessibilità.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 17 — Regressione segmentata e breakpoint

**Assunzioni e definizioni rivedute.** La regressione segmentata continua modifica la pendenza in un breakpoint ψ non noto; se δ=0 il breakpoint sparisce dal modello e l’inferenza regolare su ψ non è giustificata.

**Derivazione integrata.** La funzione E(Y|x)=β0+β1x+δ(x−ψ)_+ ha pendenza β1 per x<ψ e β1+δ per x>ψ, con continuità in ψ. Per ψ fissato è lineare nei coefficienti e può essere stimata con OLS; stimare ψ richiede invece una ricerca o ottimizzazione sul punto di cambiamento. Sotto δ=0 la derivata rispetto a ψ è identicamente zero quasi ovunque, rendendo il parametro non identificato.

**Casi critici e interpretazione.** Il test standard sul coefficiente aggiuntivo con ψ fissato non calibra automaticamente il test quando ψ è scelto dai dati. Pochi punti da un lato e scarsa variazione di pendenza rendono l’incertezza elevata.

**Esperimento di verifica.** Avvicina il breakpoint al bordo e riduci δ fino a zero, confrontando profilo RSS e stime in più repliche.

**Sfide:** tre livelli; Punto di cambiamento; Stima di ψ; Breakpoint non identificato.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 18 — Validazione e overfitting

**Assunzioni e definizioni rivedute.** Distinguere errore di training, stima del rischio mediante validazione, scelta dell’iperparametro e valutazione finale su test indipendente. Le trasformazioni vanno addestrate dentro i fold.

**Derivazione integrata.** Per una procedura A_λ e K fold, R_CV(λ)=∑_k n_k R_k(λ)/∑_k n_k per perdita media per osservazione. Se tutti i fold hanno uguale dimensione coincide con K⁻¹∑R_k. Selezionando λ̂ che minimizza la CV, il minimo osservato è generalmente ottimista rispetto al rischio della procedura scelta; per una stima non contaminata dopo tuning serve un test esterno o nested CV coerente con il target.

**Casi critici e interpretazione.** Una classe di modelli misspecificata può dare prestazioni mediocri pur con CV perfettamente eseguita. Valutare lo stesso test dopo averlo usato ripetutamente per scegliere caratteristiche genera un ulteriore bias di selezione.

**Esperimento di verifica.** Confronta errore training e test al crescere della complessità e ripeti selezioni CV con campioni indipendenti.

**Sfide:** tre livelli; prerequisiti specialistici già presenti.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 19 — k vicini più prossimi

**Assunzioni e definizioni rivedute.** kNN dipende da metrica, scala, dimensione e distribuzione locale dei dati. Non è un modello parametrico globale; la probabilità di classe stimata è una proporzione locale.

**Derivazione integrata.** Per risposta binaria, p̂(x)=k⁻¹∑_{i∈N_k(x)}Y_i. Con k troppo piccolo la varianza locale è alta, mentre con k grande si miscelano regioni con probabilità diverse introducendo bias. In condizioni regolari in dimensione fissata, il compromesso k→∞ e k/n→0 sostiene la consistenza dei metodi kNN; la regola k=1 non ha tale garanzia generale.

**Casi critici e interpretazione.** La standardizzazione deve essere stimata sul training. In dimensioni alte le distanze possono concentrarsi e il vicinato diventare meno informativo; non chiamare la frontiera stimata una frontiera di Bayes.

**Esperimento di verifica.** Confronta k=1 e k elevato su dati rumorosi, visualizzando rischio stimato e, quando disponibile, frontiera di Bayes.

**Sfide:** tre livelli; Ruolo di k; Distanze; Consistenza.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 20 — Alberi, bagging e random forest

**Assunzioni e definizioni rivedute.** Gli alberi CART costruiscono partizioni ricorsive e il loro comportamento dipende da profondità, criteri di split e stabilità del campione. Bagging e random forest aggregano alberi, ma non eliminano automaticamente il bias.

**Derivazione integrata.** Per B predittori con varianza comune v e correlazione comune ρ, Var(B⁻¹∑T_b)=v{ρ+(1−ρ)/B}. La derivazione somma B termini di varianza e B(B−1) covarianze, dividendo per B². La formula è descrittiva sotto equicorrelazione e non fornisce il rischio predittivo completo senza bias e struttura della risposta. Campioni bootstrap generano variabilità; mtry può ridurre la correlazione tra alberi.

**Casi critici e interpretazione.** OOB evita di usare gli stessi record con cui l’albero è stimato, ma il riuso di OOB per tuning e selezione può introdurre ottimismo. Uno split isolato può essere instabile con predittori molto correlati.

**Esperimento di verifica.** Aumenta numero di alberi e modifica mtry per confrontare instabilità, errore OOB e generalizzazione.

**Sfide:** tre livelli; Partizioni CART; Bagging; Random forest e mtry.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 21 — Gradient boosting

**Assunzioni e definizioni rivedute.** Il gradient boosting costruisce una somma sequenziale di weak learners adattando una direzione di miglioramento della loss. Le formule dipendono dal target e dall’eventuale funzione di link.

**Derivazione integrata.** Con loss L(y,F), il pseudo-residuo al passo m è r_im=−∂L(y_i,F(x_i))/∂F valutato in F_(m−1). Con loss quadratica ½(y−F)², r=y−F; con log-loss binaria e F sulla scala logit, r=y−sigmoid(F). Un albero di regressione adatta questi pseudo-residui e produce F_m=F_(m−1)+ν h_m (con eventuale ottimizzazione dei valori foglia, se prevista). Il numero di iterazioni è selezionato su validation.

**Casi critici e interpretazione.** Boosting con alberi di piccola profondità non equivale per definizione a implementazioni come XGBoost/LightGBM; regolarizzazioni, Hessiane e gestione dei mancanti possono differire. Il training error monotono non garantisce migliore test error.

**Esperimento di verifica.** Scegli una funzione con salto e confronta training, validation e test al variare di ν e numero di alberi.

**Sfide:** tre livelli; Residui sequenziali; Shrinkage; Early stopping.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 22 — Reti neurali e backpropagation

**Assunzioni e definizioni rivedute.** Una rete feed-forward compone mappe affini e attivazioni. La non linearità consente di modellare superfici non lineari; la performance dipende da ottimizzazione e regolarizzazione.

**Derivazione integrata.** Per z_l=W_l a_(l−1)+b_l, a_l=σ_l(z_l), la derivata ∂L/∂W_l=δ_l a_(l−1)ᵀ; i termini δ_l si ricavano a ritroso moltiplicando la derivata locale per il Jacobiano del layer successivo (regola della catena). Con discesa del gradiente W_l←W_l−η∂L/∂W_l. Gradient checking con differenze centrate [L(w+h)−L(w−h)]/(2h) verifica implementazioni su reti piccole.

**Casi critici e interpretazione.** La perdita è generalmente non convessa. ReLU può produrre unità inattive; sigmoid può saturare; un learning rate troppo alto può divergere. La validation loss va separata dal training e dalle ripetizioni di tuning.

**Esperimento di verifica.** Ripeti la rete con inizializzazioni diverse su XOR o semilune e osserva errori e frontiere, non solo un fit.

**Sfide:** tre livelli; Attivazione; Learning rate; Backpropagation.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 23 — Componenti principali

**Assunzioni e definizioni rivedute.** La PCA è una proiezione lineare su direzioni di massima varianza. I risultati dipendono dal centramento e, se applicata, dalla standardizzazione; non implicano automaticamente fattori causali.

**Derivazione integrata.** Data X_c centrata con S=X_cᵀX_c/(n−1), per un vettore unitario v la varianza di X_cv è vᵀSv. Il massimo del quoziente di Rayleigh è λ1 con autovettore v1; imponendo ortogonalità si ottengono le componenti successive. La SVD X_c=UΣVᵀ implica λ_j=σ_j²/(n−1). Troncando alla prima k si ottiene la migliore approssimazione di rango k in norma di Frobenius.

**Casi critici e interpretazione.** Il segno di un autovettore è arbitrario; con autovalori uguali la base del sottospazio non è unica. La PCA su matrice di correlazione cambia l’estimando geometrico rispetto alla covarianza.

**Esperimento di verifica.** Varia la correlazione, scala una variabile e osserva loadings, PVE ed errore di ricostruzione.

**Sfide:** tre livelli; Varianza massima; Standardizzare; Autovalori multipli.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 24 — k-means e clustering gerarchico

**Assunzioni e definizioni rivedute.** Un metodo di clustering produce sempre una partizione o una gerarchia compatibile con il suo criterio, anche quando il generatore non contiene gruppi distinti. Le distanze e lo scaling fanno parte del problema.

**Derivazione integrata.** L’obiettivo k-means è J=∑_k∑_{i∈C_k}||x_i−μ_k||². Per C_k fissato, derivare rispetto a μ_k fornisce la media dei punti del gruppo. Per centroidi fissati, assegnare ogni punto al più vicino minimizza il contributo locale; quindi le iterazioni di Lloyd non aumentano J e terminano su uno stato stazionario finito, salvo convenzioni sui pareggi e gruppi vuoti.

**Casi critici e interpretazione.** La monotonia della loss non implica ottimo globale; diversi semi possono produrre partizioni differenti. Single linkage può avere chaining e Ward non è intercambiabile con single/complete.

**Esperimento di verifica.** Confronta più inizializzazioni di k-means, quindi costruisci il dendrogramma sugli stessi punti.

**Sfide:** tre livelli; Obiettivo k-means; Dendrogramma; Cluster e realtà.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 25 — DBSCAN e confronto tra metodi

**Assunzioni e definizioni rivedute.** DBSCAN raggruppa la densità locale rispetto a ε e minPts, senza richiedere K; la sua definizione di rumore è algoritmica e dipende da quei parametri.

**Derivazione integrata.** Un punto x è core se |N_ε(x)|≥minPts secondo una convenzione che include x. La raggiungibilità per densità è costruita percorrendo core in catene di vicinato; un punto di bordo può essere raggiunto da un core ma non estende autonomamente il cluster. L’assegnazione di un bordo conteso può dipendere dall’ordine di visita, pur lasciando invariata la componente dei core.

**Casi critici e interpretazione.** Densità differenti rendono difficile una singola ε; silhouette su soli punti non-rumore e ARI con rumore trattato come gruppo rispondono a domande distinte. Un cluster trovato non è prova inferenziale di una popolazione.

**Esperimento di verifica.** Passa da semilune a cerchi e a dati senza struttura; varia ε e confronta core, bordo, rumore, ARI e silhouette.

**Sfide:** tre livelli; Core e bordo; Rumore; Punti contesi.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 26 — Autocorrelazione spaziale e Moran

**Assunzioni e definizioni rivedute.** L’autocorrelazione globale dipende da valori centrati, definizione del vicinato e convenzione sui pesi. Il riferimento permutazionale va distinto da indipendenza in senso probabilistico generale.

**Derivazione integrata.** Con z=x−x̄1, I=(n/S0)(zᵀWz)/(zᵀz), S0=∑ijw_ij. Sotto permutazione casuale uniforme dei valori, con w_ii=0, E[z_{π(i)}z_{π(j)}]=−(∑z_i²)/(n(n−1)) per i≠j, e quindi E(I)=−1/(n−1). La standardizzazione per riga può rompere la simmetria di W; il confronto JS–R deve rispettare questa scelta.

**Casi critici e interpretazione.** La correlazione positiva dei valori può essere prodotta da un trend deterministico anche con errori indipendenti. Non interpretare un Moran significativo come prova di causalità o di un preciso meccanismo SAR.

**Esperimento di verifica.** Confronta rook/queen e pesi per riga su stessa mappa; rimuovi il trend vero simulato e ripeti il test.

**Sfide:** tre livelli; W e vicinato; Permutazioni; Trend e residui.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 27 — Autocorrelazione locale, hotspot e MAUP

**Assunzioni e definizioni rivedute.** Le statistiche locali classificano configurazioni relative e, separatamente, testano una specifica ipotesi nulla locale. I quadranti HH,LL,HL,LH non sono etichette di significatività.

**Derivazione integrata.** Con z_i=x_i−x̄ e m2=n⁻¹∑z_i², una forma di Local Moran è I_i=(z_i/m2)∑_jw_ijz_j. Le permutazioni condizionali mantengono fisso z_i e permutano i valori delle altre unità, producendo una distribuzione di riferimento specifica. Applicare BH ai p-value è giustificato sotto opportune dipendenze; BY fornisce un controllo più conservativo sotto condizioni più generali.

**Casi critici e interpretazione.** Cambiare aggregazione territoriale può modificare media, varianza, W e numero dei test simultanei: il MAUP cambia l’oggetto statistico stesso. Non confrontare p-value di griglie diverse come se misurassero lo stesso estimando.

**Esperimento di verifica.** Costruisci un High–Low, osserva p-value e FDR, poi aggrega in 16 o 4 zone e ricostruisci i vicinati.

**Sfide:** tre livelli; Quadranti locali; Confronti multipli; MAUP.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 28 — Processi puntuali spaziali

**Assunzioni e definizioni rivedute.** Le configurazioni di punti possono mostrare aggregazione per due ragioni diverse: interazione tra eventi oppure intensità spazialmente variabile. Le conclusioni sul secondo ordine richiedono un modello di primo ordine adeguato.

**Derivazione integrata.** Per un Poisson omogeneo con intensità λ sul piano, il numero atteso di ulteriori punti entro r da un evento tipico è λπr²; per definizione K(r)=πr² e L(r)=√(K(r)/π)=r. La stima empirica K pesa le coppie e corregge le regioni del disco non osservate ai bordi; il metodo di correzione deve essere dichiarato e non equivale all’assenza di bordo.

**Casi critici e interpretazione.** Envelope punto per punto al livello 95% non è automaticamente un test simultaneo al 5% su tutti i raggi. Con un Poisson non omogeneo, K omogenea può indicare falsa aggregazione.

**Esperimento di verifica.** Confronta Poisson omogeneo, Thomas, inibizione e Poisson non omogeneo su stessi raggi e medesimo metodo dei bordi.

**Sfide:** tre livelli; CSR; Effetti di bordo; Inomogeneità.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 29 — Variogrammi e campi aleatori spaziali

**Assunzioni e definizioni rivedute.** Il variogramma è funzione dell’incremento spaziale e richiede ipotesi diverse a seconda che si adotti stazionarietà intrinseca o del secondo ordine. Nugget di misura e nugget microscopico non sono sempre identificabili separatamente.

**Derivazione integrata.** Per Z con media costante e covarianza stazionaria C(h), E[(Z(s+h)−Z(s))²]=2(C(0)−C(h)), quindi γ(h)=C(0)−C(h). L’estimatore empirico aggrega [Z(s_i)−Z(s_j)]²/2 per coppie nella classe di lag. Con C(h)=σ²exp(−||h||/φ), il contributo strutturale del variogramma raggiunge circa il 95% del sill a distanza 3φ, non a φ.

**Casi critici e interpretazione.** Il modello gaussiano con campionamento molto denso può produrre matrici quasi singolari; un trend non rimosso aumenta artificialmente le semivarianze a grandi distanze. Il nugget introduce un salto nel variogramma per distanze strettamente positive.

**Esperimento di verifica.** Seleziona due siti e identifica il contributo al bin; modifica anisotropia e confronta variogrammi per direzione.

**Sfide:** tre livelli; Semivarianza; Anisotropia; Trend.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 30 — Kriging e disegno dei sensori

**Assunzioni e definizioni rivedute.** Il kriging fornisce previsioni lineari basate su un modello di covarianza, dichiarando la media e il target (processo latente o nuova osservazione). IDW non eredita automaticamente una varianza di kriging.

**Derivazione integrata.** Nel simple kriging a media nota, minimizzare Var(Z0−wᵀY) dà Cw=c e w=C⁻¹c quando C è invertibile, con varianza σ0²−cᵀC⁻¹c. Con media ignota costante si impone 1ᵀw=1 e si aggiunge un moltiplicatore di Lagrange (ordinary kriging). Se Y=Z+e con nugget di osservazione, il termine di errore entra in Cov(Y) ma non in Cov(Y,Z0) per target latente.

**Casi critici e interpretazione.** Le varianze condizionate ai parametri del modello non comprendono automaticamente l’incertezza dovuta alla stima del variogramma. Una superficie stimata più vicina ai dati non assicura migliore errore su un campo realizzato.

**Esperimento di verifica.** Posiziona un sensore nella zona di varianza massima e confronta varianza media ed errore sul campo vero, mantenendo la stessa realizzazione.

**Sfide:** tre livelli; prerequisiti specialistici già presenti.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

### LAB 31 — Regressione spaziale e validazione geografica

**Assunzioni e definizioni rivedute.** Nel SAR la dipendenza attraversa direttamente la risposta e produce propagazione degli effetti; nel SEM è l’errore a essere strutturato. La matrice W deve essere fissata e il dominio di ρ deve rendere invertibile I−ρW.

**Derivazione integrata.** Nel SAR y=ρWy+Xβ+ε si ha E(y|X)=(I−ρW)⁻¹Xβ. Per una covariata j, la matrice degli effetti marginali è β_j(I−ρW)⁻¹; la media della diagonale misura l’impatto diretto, le somme fuori diagonale quelli indiretti. La trasformazione ε=(I−ρW)y−Xβ introduce log|det(I−ρW)| nella log-verosimiglianza gaussiana. Nel SEM la trasformazione opera sui residui y−Xβ e non sulla media y nello stesso modo.

**Casi critici e interpretazione.** Un massimo della verosimiglianza calcolato su griglia dipende dalla risoluzione e non equivale a una ottimizzazione continua. Random CV e spatial block CV mirano a target di generalizzazione differenti.

**Esperimento di verifica.** Aumenta |ρ| mantenendo W fisso, osserva come cambiano impatti e residui, poi confronta random CV e blocchi geografici.

**Sfide:** tre livelli; SAR e SEM; Impatti SAR; Validazione geografica.

**Esito:** contenuti e sfide integrati; revisione formale completa e studio su studenti non ancora certificati.

## Invarianti e regressioni

- La build genera un singolo HTML offline senza nuove librerie runtime.
- I 31 moduli di stima e simulazione restano invariati, eccetto l’adattatore di tracciamento non numerico in `06-stimatori.js`.
- La raccolta delle azioni non usa rete, storage persistente né dati personali.
- A differenza dei 9 piloti, le 84 nuove sfide verificano attività e risposta ma non ancora tutti i parametri specifici del compito; questo limite va dichiarato e verificato durante il pilot didattico.

## Comandi riproducibili

```bash
python3 build.py
node tests/audit_science.js
node tests/test_challenges.js
node tests/test_challenges_full.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_browser_full.py
```
