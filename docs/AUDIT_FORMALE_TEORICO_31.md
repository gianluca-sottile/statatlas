# StatAtlas 2.1 — Audit formale delle 31 schede teoriche

**Data:** 16 novembre 2026. **Base:** sorgenti `src/core/pedagogy-formulas.js`, `src/core/pedagogy-theory.js`, `src/core/pedagogy-rigorous.js`, `src/labs/01-*.js`–`31-*.js` e i dossier precedenti in `docs/`.

## Perimetro, metodo e livello di certificazione

Sono state esaminate **le 31 equazioni-cardine e le 31 sezioni «Enunciato e derivazione»**, incrociandole con le precisazioni metodologiche e le procedure descritte nei laboratori. Per ogni laboratorio segue: **enunciato e ipotesi**, **dimostrazione o derivazione**, **limite di validità/controesempio** e **giudizio**. Le correzioni apportate ai sorgenti sono elencate in fondo.

Classi di giudizio: **F** = derivazione algebrica verificabile nel report; **T** = risultato teorico classico più profondo, per cui il testo fornisce un'enunciazione corretta e lo schema dimostrativo, non la dimostrazione originale completa; **N** = metodo numerico per il quale i test verificano un caso/una proprietà, non consistenza e inferenza generale. **F/T/N non significa «tutto il laboratorio dimostrato»**. Questo documento non sostituisce l'eventuale referaggio scientifico esterno. I test esistenti sono limitati a identità selezionate e non bastano, da soli, ad attestare la correttezza di ogni formula rappresentata negli esperimenti.

## Parte I — Probabilità e simulazione

### 01 — Distribuzioni e relazioni · F + T
**Ipotesi.** X variabile reale; per risultati campionari, X₁,…,Xₙ iid; per la banda DKW, ripartizione qualsiasi e campione iid. **Derivazione.** Gli eventi {X≤a}⊆{X≤b} implicano `P(a<X≤b)=F(b)−F(a)`; per la CDF empirica `Fₙ(x)=n⁻¹∑1{Xᵢ≤x}` le indicatrici sono Bernoulli con probabilità F(x), quindi E(Fₙ)=F e Var(Fₙ)=F(1−F)/n. La disuguaglianza DKW `P(supₓ|Fₙ−F|>ε)≤2exp(−2nε²)` è un teorema non ricavabile dalla sola varianza puntuale e richiede un riferimento specifico. **Limite.** Per legge discreta `P(a≤X≤b)=F(b)−F(a−)`, non F(b)−F(a); l'area di densità non rappresenta una massa puntuale. **Rettifica.** Guida aggiornata con intervallo `(a,b]` e distinzione discreto/continuo.

### 02 — Variabili bivariate · F
**Ipotesi.** Coppia normale con σ_X>0, σ_Y>0, |ρ|<1. **Derivazione.** Scrivere `X=μ_X+σ_X Z₁`, `Y=μ_Y+σ_Y(ρZ₁+√(1−ρ²)Z₂)` per Z₁,Z₂ iid N(0,1). Dato X=x, Z₁ è determinato mentre Z₂ resta indipendente: `E(Y|X=x)=μ_Y+ρσ_Y(x−μ_X)/σ_X` e `Var(Y|X=x)=σ_Y²(1−ρ²)`. **Limite.** `X~N(0,1), Y=X²−1`: covarianza zero ma dipendenza perfetta; una fascia di ampiezza h>0 non rappresenta il condizionamento puntuale. **Rettifica.** Formula visibile resa generale con σ_Y², prima omesso (era valido solo nel caso standardizzato).

### 03 — Simulazione e Monte Carlo · F
**Ipotesi.** U uniforme su (0,1), quantile generalizzato `Q(u)=inf{x:F(x)≥u}`; stimatori iid integrabili e con varianza finita quando si usa lo SE classico. **Derivazione.** `Q(U)≤x ↔ U≤F(x)` quasi certamente, quindi Q(U)∼F. Per Z e una σ-algebra generata da V, `Z=E(Z|V)+(Z−E(Z|V))` è una decomposizione ortogonale in L²: il termine incrociato ha valore atteso zero, dunque `Var(Z)=Var(E(Z|V))+E[Var(Z|V)]`. **Limite.** In hit-or-miss `1{V≤f(U)}` si richiede 0≤f≤1 con lo stesso dominio e lo stesso estimando: senza queste condizioni il confronto di varianza non è giustificato.

## Parte II — Limiti e adattamento

### 04 — Legge dei grandi numeri e TCL · F + T
**Ipotesi.** Xᵢ iid, E(X)=μ; per TCL serve anche `0<Var(X)=σ²<∞`. **Derivazione.** Per `Sₙ=∑(Xᵢ−μ)`, Var(Sₙ)=nσ². Per il TCL, la funzione caratteristica del termine normalizzato soddisfa `φ(t/√n)=1−t²/(2n)+o(1/n)` dopo centering e standardizzazione, perciò `[φ(t/√n)]ⁿ→e^{−t²/2}`. La LGN iid con E|X|<∞ deriva dal teorema forte e non dalla sola equazione della varianza. **Controesempio.** Per medie di Cauchy iid, `φ_{X̄ₙ}(t)=exp(−|t|)` per ogni n: nessuna concentrazione verso una costante. **Rettifica.** Nella formula visibile compare ora `\xrightarrow{d}` anziché una freccia non qualificata.

### 05 — Adattamento χ² · F + T
**Ipotesi.** K categorie a probabilità nulle π_j>0, K fisso, nπ_j→∞; vincolo ∑O_j=n. **Derivazione.** Il vettore multinomiale standardizzato converge a una normale singolare il cui spazio tangente ha dimensione K−1; la forma quadratica di Pearson converge a χ²_(K−1). Se q parametri vengono stimati in un modello multinomiale regolare identificabile e il fitting rispetta i vincoli, può risultare χ²_(K−1−q), ma tale sottrazione non è universale. **Limite.** Classi scelte dopo osservazione e probabilità molto piccole compromettono il riferimento asintotico; il bootstrap deve rieseguire stima e raggruppamento nella medesima procedura.

## Parte III — Inferenza

### 06 — Stimatori · F + T
**Ipotesi.** T stimatore con E(T²)<∞. **Derivazione.** Espandendo `T−θ=[T−E(T)]+[E(T)−θ]`, il termine misto ha media zero e `MSE=Var(T)+Bias(T)²`. Per la mediana iid con densità f(θ)>0 continua, `√n(med−θ)→N(0,1/[4f(θ)²])`; sotto N(θ,σ²) la varianza asintotica è πσ²/(2n), sotto Laplace(θ,b) è b²/n. **Limite.** Per Cauchy il MSE della media è indefinito, non trattabile come una varianza finita.

### 07 — Informazione di Fisher · F
**Ipotesi.** Famiglia con supporto indipendente da θ, densità sufficientemente differenziabile, scambio derivata/integrale legittimo, informazione positiva finita. **Derivazione.** `∫f_θ=1` implica `E_θ(U)=∫∂_θf_θ=0`. Differenziando, `0=E_θ(ℓ''+U²)`; pertanto `I=E(U²)=−E(ℓ'')`. Per T non distorto per g(θ), `Cov_θ(T,U)=g'(θ)` e Cauchy–Schwarz dà `Var(T)≥g'(θ)²/Iₙ`. **Controesempio.** Uniforme (0,θ): supporto variabile, Bartlett e CR classico non applicabili automaticamente. **Limite.** Curve score/curvatura finite non costituiscono prova di normalità asintotica in campioni piccoli.

### 08 — Intervalli di confidenza · F
**Ipotesi.** Campione iid normale con σ² ignota e n≥2 per l'intervallo t esatto. **Derivazione.** Indipendenza di X̄ e S² e distribuzione χ² di `(n−1)S²/σ²` implicano `(X̄−μ)/(S/√n)∼tₙ₋₁`: invertendo il quantile centrale si ottiene copertura esatta `1−α`. Per Bernoulli, con X∼Bin(n,p), `C(p)=∑ₖ1{p∈[L(k),U(k)]} Bin(n,k;p)` consente il controllo esatto. **Limite.** Wald e Wilson possono sottocoprire in alcuni p; Clopper–Pearson copre almeno il nominale ma spesso è conservativo. I grafici a B repliche hanno errore Monte Carlo.

### 09 — Test d'ipotesi · F
**Ipotesi.** Z∼N(δ√n,1) sotto alternativa, cutoff bilaterale c=z_(1−α/2). **Derivazione.** La potenza corretta è `π(δ)=P(Z<−c)+P(Z>c)=Φ(−c−δ√n)+1−Φ(c−δ√n)`. Solo per effetti positivi sufficientemente grandi la prima coda è trascurabile. **Limite.** Un p-value uniforme richiede riferimento continuo correttamente specificato; con statistiche discrete si ha spesso superuniformità. La mancata significatività non dimostra equivalenza.

## Parte IV — Regressione e modelli stocastici

### 10 — OLS · F
**Ipotesi.** X fissata n×p a rango pieno; `E(ε|X)=0`, `Var(ε|X)=σ²I`; nuovi errori indipendenti per la previsione individuale. **Derivazione.** `β̂−β=(XᵀX)⁻¹Xᵀε` dà non distorsione e `Var(β̂|X)=σ²(XᵀX)⁻¹`; con x₀ fissato, `Var(x₀ᵀβ̂)=σ²h₀`, mentre per una futura Y₀ `Var(Y₀−x₀ᵀβ̂)=σ²(1+h₀)`. **Limite.** Per intervalli t *esatti* è richiesta normalità degli errori (o altre condizioni specifiche); con eteroschedasticità le formule omoschedastiche delle deviazioni standard sono errate.

### 11 — Regressione Lp · F + T
**Ipotesi.** Per formula M-estimatore di posizione, equazione score regolare e `Eψ²<∞`, `Eψ'≠0` finito; p≥1 per convessità di |r|ᵖ. **Derivazione.** Espandendo `∑ψ(Xᵢ−θ̂)=0` intorno a θ, si ottiene `√n(θ̂−θ)≈[Eψ']⁻¹n⁻¹/²∑ψ(εᵢ)`; la varianza limite segue dal TCL. **Punto critico corretto.** Per loss assoluta p=1 la funzione score è discontinua e la derivazione differenziale precedente non vale letteralmente: la mediana soddisfa invece `AVar=1/[4nf(θ)²]`; per la regressione con disegno va usata la matrice sandwich. **Limite.** 0<p<1: perdita non convessa; Cauchy: MSE del criterio L2 generalmente indefinito.

### 12 — GLM · F + T
**Ipotesi.** Modello di famiglia esponenziale correttamente specificato, osservazioni condizionalmente indipendenti, link differenziabile e informazione non singolare. **Derivazione.** Con η=Xβ, μ=g⁻¹(η), V matrice varianze e D=diag(dμ/dη), lo score è `Xᵀ D V⁻¹(y−μ)` (includendo la dispersione nelle varianze). La linearizzazione di μ porta alla risposta di lavoro `z=η+(y−μ)/(dμ/dη)` e ai pesi IRLS. **Limite.** Separazione completa nel logit non garantisce esistenza di un MLE finito; gli intervalli Wald sono asintotici e possono fallire per campioni piccoli.

### 13 — ARMA · F
**Ipotesi.** AR(1) `X_t=φX_(t−1)+ε_t`, |φ|<1, rumore bianco di varianza σ_ε²; per un ARMA generale le condizioni sui polinomi caratteristici sono più articolate. **Derivazione.** Soluzione causale `X_t=∑_{j≥0} φʲ ε_{t−j}` in L²; `γ(0)=σ_ε²∑φ²ʲ=σ_ε²/(1−φ²)` e `γ(h)=φ^{|h|}γ(0)`. **Limite.** Questo risultato NON riguarda ogni ARMA; PACF teorica dell'AR(p) e ACF teorica dell'MA(q) si troncano solo sotto condizioni canoniche, non necessariamente nei grafici campionari. **Rettifica.** Formula-card esplicitamente etichettata AR(1).

## Parte V — Metodi di regressione flessibili

### 14 — Regressione quantilica · F
**Ipotesi.** 0<τ<1, funzione di perdita `ρ_τ(u)=u(τ−1{u<0})`, con quantili condizionati identificabili quando si interpreta la stima. **Derivazione.** Per un candidato q non uguale a un dato osservato, la derivata della perdita totale è `∑(1{yᵢ<q}−τ)`; il segno cambia quando il conteggio sotto q supera nτ. Un minimo si trova quindi nell'insieme dei quantili empirici. **Limite.** In regressione lineare non vale una semplice regola secondo cui esattamente il τ dei residui è negativo: entrano anche le condizioni sulle covariate; l'interpretazione causale non è automatica.

### 15 — Penalizzata · F
**Ipotesi.** X centrate/standardizzate, intercetta non penalizzata, λ≥0, 0≤α≤1; normalizzazione `RSS/(2n)` per la loss. **Derivazione.** Per elastic net `Q(β)=||y−Xβ||²/(2n)+λ[α||β||₁+(1−α)||β||²/2]`. L'ottimo richiede `(1/n)Xᵀ(y−Xβ)=λ[α s+(1−α)β]`, con s_j∈∂|β_j|. Per α=0, λ>0, `β̂=(XᵀX+nλI)⁻¹Xᵀy`; per α=1 e XᵀX/n=I si ottiene soft threshold alla soglia λ. **Limite.** Senza general position il numero di coefficienti non nulli può non essere una stima universale dei gradi di libertà, e p>n non implica una unica soluzione lasso; esiste però una soluzione con supporto ≤n in condizioni standard. **Rettifiche.** Formula-card coerente con la loss del laboratorio; condizioni per df, rango e selezione rese esplicite nella scheda avanzata.

### 16 — Spline e kernel · F + T
**Ipotesi.** Smoother lineare `ŷ=S_λ y`, media m e errori con Eε=0, Cov(ε)=σ²I. **Derivazione.** `ŷ−m=(S−I)m+Sε`; per ortogonalità in media, `n⁻¹E||ŷ−m||²=n⁻¹||(S−I)m||²+(σ²/n)tr(SSᵀ)`. I gradi di libertà effettivi di un smoother lineare si definiscono spesso come tr(S). **Teorema più profondo.** L'ottimo della penalizzazione integrata `∫(f''(x))²` nello spazio di Sobolev adeguato è una spline cubica naturale con nodi nelle ascisse distinte; il report non riproduce la dimostrazione funzionale completa. **Limite.** Kernel con h→0 non implica predizione stabile fuori campione.

### 17 — Regressione segmentata · F + T
**Ipotesi.** Media `β₀+β₁x+δ(x−ψ)_+`, breakpoint interno ai dati e disegno che identifica le pendenze quando δ≠0. **Derivazione.** La derivata in x è β₁ per x<ψ e β₁+δ per x>ψ; se δ=0, la media non contiene ψ e il likelihood è piatto in ψ, che non è identificato sotto H₀. **Limite.** Le approssimazioni Wald regolari per ψ e il test naive χ² non sono giustificati sotto δ=0; bootstrap/permutation devono riprodurre correttamente l'ipotesi nulla e l'intera ricerca del breakpoint.

## Parte VI — Apprendimento supervisionato

### 18 — Validazione e overfitting · F
**Ipotesi.** Fold esterni disgiunti, cover completa del training, ogni trasformazione appresa all'interno del rispettivo training fold; loss individuale additiva. **Derivazione.** Se la CV calcola la media dei n errori out-of-fold, allora `R̂_CV=∑_{k=1}^K(n_k/n) R̂_k`, dove `R̂_k` è la media delle loss nel fold k. La media semplice `K⁻¹∑R̂_k` è uguale solo per n_k identici. **Limite.** Minimizzare CV e valutare il valore minimo sulla stessa CV provoca ottimismo di selezione; per stimare l'errore del *procedimento* serve test indipendente o CV esterna. **Rettifica.** La formula-card ora mostra la CV pesata, come il calcolo effettivo del laboratorio.

### 19 — kNN · F + T
**Ipotesi.** Distanza/scaling fissati sul solo training; k osservazioni vicine, criteri di tie coerenti. **Derivazione.** Per Y_i∈{0,1}, la stima locale `p̂(x)=(1/k)∑_{i∈N_k(x)}Y_i`; fissato un vicinato, la variabilità di Bernoulli è dell'ordine 1/k, mentre il raggio aumenta al crescere di k producendo bias se p(x) varia. **Teorema.** Consistenza kNN richiede oltre a k→∞ e k/n→0 condizioni di campionamento iid e spazio metrico appropriato: non è implicata da un singolo grafico di test. **Limite.** Con distanze ad alta dimensionalità e scaling fuori fold la promessa di consistenza può risultare irrilevante.

### 20 — Alberi, bagging e random forest · F
**Ipotesi.** B predittori con stessa varianza v e covarianza comune ρv, matrice di covarianza semidefinita positiva (ρ≥−1/(B−1)). **Derivazione.** `Var(B⁻¹∑T_b)=B⁻²[Bv+B(B−1)ρv]=v[ρ+(1−ρ)/B]`. **Limite.** Il termine comune non scompare per ρ>0, ma la varianza non determina da sola il rischio (bias, rumore). Riutilizzare la stima OOB per selezione e reporting può produrre ottimismo.

### 21 — Gradient boosting · F + N
**Ipotesi.** F sulla scala canonica di previsione, log-loss Bernoulli oppure loss quadratica ½(y−F)². **Derivazione.** Per quadratica, `−∂L/∂F=y−F`; per Bernoulli con p=sigmoid(F), `L=log(1+e^F)−yF`, dunque `−∂L/∂F=y−p`. Un weak learner fitta questo residuo e viene aggiunto `F_m=F_{m−1}+νh_m`; il learning rate e l'ottimizzazione foglie sono decisioni algoritmiche ulteriori. **Limite.** Non equiparare questo motore didattico alle implementazioni con Hessiana, subsampling e regolarizzazioni specifiche dei pacchetti di produzione.

### 22 — Reti neurali · F + N
**Ipotesi.** Architettura feedforward, attivazioni differenziabili nei punti di interesse, loss differenziabile. **Derivazione.** Per `z_l=W_l a_{l−1}+b_l`, la chain rule dà `∂L/∂W_l=δ_l a_{l−1}ᵀ` e `δ_l=(W_{l+1}ᵀδ_{l+1})⊙σ'_l(z_l)`; questo giustifica backpropagation. **Limite.** In ReLU la derivata non esiste in 0: occorre fissare una convenzione di sottogradiente; il gradient check alle differenze finite vicino a un kink non certifica la scelta in quel punto. Ottimizzazione non convessa e generalizzazione non discendono dalla formula del gradiente.

## Parte VII — Apprendimento non supervisionato

### 23 — PCA · F + T
**Ipotesi.** Matrice X centrata, n≥2, S=XᵀX/(n−1); autovalori reali non negativi. **Derivazione.** Per ||v||=1, `Var(Xv)=vᵀSv`: per Rayleigh–Ritz il massimo è λ₁ e v₁ autovettore principale. Dalla SVD X=UΣVᵀ segue λ_j=σ_j²/(n−1). Troncamento di SVD minimizza la norma di Frobenius a rango k (Eckart–Young). **Limite.** Segno dei loadings arbitrario; con λ_j ripetuti non sono identificati i singoli autovettori, ma il sottospazio (se separato dagli altri autovalori).

### 24 — Clustering · F
**Ipotesi.** K gruppi non vuoti, dati euclidei, aggiornamento centroidi tramite media. **Derivazione.** Per partizione fissata, `∂/∂μ_k∑_{i∈C_k}||x_i−μ_k||²=−2∑(x_i−μ_k)=0` implica μ_k=media. Per centroidi fissati, l'assegnazione al centro più vicino minimizza ciascun addendo: ogni passo di Lloyd non aumenta la WCSS. **Limite.** Non dimostra ottimo globale né stabilità tra inizializzazioni; i pareggi vanno risolti in modo deterministico per evitare oscillazioni di etichette.

### 25 — DBSCAN · F + N
**Ipotesi.** Vicinato chiuso N_ε(x) che include x stesso e minPts comprensivo dell'osservazione. **Derivazione.** Il core ha |N_ε(x)|≥minPts; catene di core con archi entro ε determinano componenti di densità, mentre i punti di bordo sono raggiungibili ma non propagano il cluster. **Limite.** I punti di bordo raggiungibili da più componenti core possono ricevere etichette diverse a seconda dell'ordine di visita; ARI/silhouette non sono test d'ipotesi dell'esistenza di gruppi.

## Parte VIII — Statistica spaziale

### 26 — Moran globale · F
**Ipotesi.** n>1, W fissata con w_ii=0, S₀=∑w_ij>0, ∑z_i²>0, permutazioni uniformi delle osservazioni. **Derivazione.** Con z=x−x̄1, `E[z_{π(i)}z_{π(j)}]=−∑z_i²/[n(n−1)]` per i≠j. Sostituendo in `I=(n/S₀)(zᵀWz)/(zᵀz)` si ottiene `E(I)=−1/(n−1)`. **Limite.** Una componente di trend produce Moran sui valori anche con errori indipendenti; W row-normalized non è in generale simmetrica.

### 27 — Moran locale (LISA) · F + T
**Ipotesi.** z centrato, m₂=n⁻¹∑z_i²>0, W e m₂ identici nel locale e nel globale. **Derivazione.** `∑I_i=zᵀWz/m₂=n(zᵀWz)/(zᵀz)=S₀I_global`. Le permutazioni condizionali mantengono fisso z_i e distribuiscono gli altri valori. **Limite.** Etichette HH, LL, HL, LH sono geometrico-descrittive, non significatività; BH richiede ipotesi sulla dipendenza dei p-value, BY offre controllo in condizioni più generali.

### 28 — Processi puntuali · F + T
**Ipotesi.** Poisson omogeneo stazionario nel piano con intensità λ>0; distanze euclidee, riferimento teorico senza finestra. **Derivazione.** Per un punto tipico, il numero atteso di *altri* eventi nella palla di raggio r è `λ area(B_r)=λπr²`; per definizione K(r)=πr² e `L(r)=√(K(r)/π)=r`. **Limite.** Una finestra finita richiede correzione dei bordi; envelope puntuali in r non garantiscono un test simultaneo α. Poisson non omogeneo può simulare aggregazione apparente usando K omogenea.

### 29 — Variogrammi · F
**Ipotesi.** Stazionarietà di secondo ordine, E Z(s)=μ costante e C(h)=Cov(Z(s),Z(s+h)). **Derivazione.** `E[(Z(s+h)−Z(s))²]=Var(Z(s+h))+Var(Z(s))−2Cov(...)=2[C(0)−C(h)]` e `γ(h)=C(0)−C(h)`. Per `C(h)=σ²exp(−||h||/φ)`, il 95% del sill strutturale è raggiunto a `r95=−φlog(0.05)≈2.996φ`. **Limite.** L'intrinseca stazionarietà non garantisce C; il trend non rimosso altera il variogramma empirico, il nugget crea una discontinuità vicino a h=0.

### 30 — Kriging · F
**Ipotesi.** Covarianza osservata C simmetrica definita positiva e invertibile; target latente Z₀ con c=Cov(Y,Z₀), media nota per SK oppure costante ignota per OK. **Derivazione.** Il rischio di `wᵀ(Y−μ1)` è `σ₀²−2wᵀc+wᵀCw`: derivando `2Cw−2c=0` dà SK `Cw=c`, varianza `σ₀²−cᵀC⁻¹c`. Per OK con `1ᵀw=1`, Lagrange porta a `[C 1; 1ᵀ 0][w;ν]=[c;1]` e varianza `σ₀²−wᵀc−ν` per tale convenzione di segno: coincide con lo script esportato. **Limite.** Il nugget di osservazione appartiene a C ma non a c per il target latente; parametri di covarianza stimati e mis-specificazione aumentano l'incertezza non contabilizzata.

### 31 — Regressione spaziale · F + T
**Ipotesi.** W fissata, `I−ρW` invertibile, errori gaussiani iid per il likelihood esatto SAR; X esogena. **Derivazione.** Dal SAR `y=ρWy+Xβ+ε`, `y=(I−ρW)⁻¹(Xβ+ε)`; derivare rispetto alla covariata j dà la matrice d'impatto `β_j(I−ρW)⁻¹`, con diagonale per effetti diretti e off-diagonal per spillover. Trasformando ε si ottiene il termine log-Jacobiano `log|det(I−ρW)|` nella log-verosimiglianza. **Limite.** Nel SEM la trasformazione agisce su `y−Xβ`, non produce gli stessi impatti marginali; random CV e CV a blocchi spaziali rappresentano disegni di generalizzazione diversi. Il laboratorio unificato mostra OLS/trend, non identifica automaticamente un SAR/SEM completo.

## Rettifiche applicate al progetto

1. `src/core/pedagogy-formulas.js`: cinque formule-card corrette/qualificate (bivariata con σ_Y, TCL in distribuzione, AR(1) esplicito, elastic net con scala 1/(2n), CV ponderata per dimensione dei fold) e relative qualificazioni metodologiche.
2. `src/labs/15-penalizzata.js`: condizione λ>0 per unicità ridge, non universalità di active-set/df del lasso, distinzione «esiste una soluzione» in p>n, zero coefficienti possibile anche per ridge in casi eccezionali.
3. `src/core/pedagogy-rigorous.js`: varianza asintotica di stimatori Lp con distinzione non differenziabile del caso L1 e limitazione al modello di posizione (in regressione serve formula sandwich matriciale).
4. `src/core/pedagogy.js`: intervalli `(a,b]` nella guida, per non confondere estremi in leggi discrete.
5. Gli algoritmi numerici JS non sono stati modificati da questo audit; sono state corrette interpretazioni e ipotesi.

## Residui e raccomandazioni prima della release

- **Non confondere 31 identità dimostrate/argomentate con 31 interi algoritmi formalmente dimostrati**: TCL, DKW, teorema di rappresentazione delle spline, consistenza kNN, risultati di FDR e analisi asintotica M-estimatori rimandano a teoremi esterni. Una bibliografia primaria puntuale e numerata fino al singolo risultato non è stata completata nell'archivio.
- **Riproducibilità R**: la suite unica `verifica/valida_tutti_31.R` aggiunge esecuzione reale e invariante per 31/31; la parità numerica R/JS dei laboratori 01–25 richiede ulteriori confronti quantitativi contro snapshot live (non basta Rscript senza errori). Le sei mappe hanno già confronto JS/Python/R sotto 12 snapshot nel collaudo Mac precedente.
- **Validazione didattica**: scelta esplicita dell'autore di effettuarla solo dopo il completamento del repository. Non è un prerequisito della chiusura tecnico-scientifica, ma andrà dichiarata come limitazione nella release.
- **Ambito dei laboratori spaziali**: lo stato attivo unificato non implementa tutti gli esperimenti SAR/SEM, test inferenziali LISA ed envelope globali illustrati teoricamente. Non far apparire una dimostrazione testuale come funzionalità già interattiva.

**Verdetto scientifico:** le 31 equazioni centrali e i relativi schemi teorici, entro le ipotesi esplicitate, non evidenziano contraddizioni matematiche residue di prima grandezza dopo le correzioni sopra riportate; ciò non autorizza ad attestare l'intero catalogo delle dimostrazioni come formalmente completo. Il completamento dell'audit bibliografico e soprattutto l'esecuzione del verificatore R 31/31 sul Mac dell'autore restano condizioni di accettazione per una release scientifica pienamente tracciabile.
