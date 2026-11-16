/* StatAtlas — equazioni-cardine per le schede avanzate.
 * L'interpretazione e le ipotesi di ciascuna identità sono nel testo del laboratorio.
 */
(function(){
 var SA=window.SA||(window.SA={});
 var formulas={
  "distribuzioni": "P(a<X\\le b)=F(b)-F(a)",
  "bivariata": "\\mathrm{Var}(Y\\mid X=x)=\\sigma_Y^2(1-\\rho^2)",
  "simulazione": "\\mathrm{Var}(Z)=\\mathrm{E}[\\mathrm{Var}(Z\\mid U)]+\\mathrm{Var}(\\mathrm{E}[Z\\mid U])",
  "lgn-tcl": "\\frac{\\sqrt{n}(\\bar{X}_n-\\mu)}{\\sigma}\\xrightarrow{d} N(0,1)",
  "adattamento": "X^2=\\sum_{j=1}^{k}\\frac{(O_j-E_j)^2}{E_j}",
  "stimatori": "\\mathrm{MSE}(T)=\\mathrm{Var}(T)+(\\mathrm{E}[T]-\\theta)^2",
  "fisher": "I(\\theta)=\\mathrm{E}[U(\\theta)^2]=-\\mathrm{E}[\\ell\\prime\\prime(\\theta)]",
  "intervalli": "\\mathrm{Cov}_\\theta(C)=\\mathrm{P}_\\theta(\\theta\\in C(X))",
  "test": "\\pi(\\theta)=P_\\theta(T\\in R)",
  "regressione": "\\hat{\\beta}=(X^\\top X)^{-1}X^\\top y",
  "regressione-lp": "\\hat\\beta_p=\\argmin_\\beta \\sum_{i=1}^{n}|y_i-x_i^\\top\\beta|^p",
  "glm": "g(\\mu_i)=x_i^\\top\\beta",
  "arma": "\\gamma_{AR(1)}(h)=\\frac{\\sigma_\\varepsilon^2\\phi^{|h|}}{1-\\phi^2}",
  "quantilica": "\\rho_\\tau(u)=u(\\tau-\\mathbf{1}_{u<0})",
  "penalizzata": "\\hat\\beta=\\argmin_\\beta \\{\\tfrac{1}{2n}\\|y-X\\beta\\|_2^2+\\lambda[\\alpha\\|\\beta\\|_1+\\tfrac{1-\\alpha}{2}\\|\\beta\\|_2^2]\\}",
  "spline": "\\hat f=\\argmin_f \\{\\sum_{i=1}^n(y_i-f(x_i))^2+\\lambda J(f)\\}",
  "segmentata": "\\mathrm{E}(Y_i\\mid x_i)=\\beta_0+\\beta_1 x_i+\\delta(x_i-\\psi)_+",
  "validazione": "\\widehat R_{CV}(\\lambda)=\\frac{1}{n}\\sum_{k=1}^K n_k R_k(\\lambda)",
  "knn": "\\hat P(Y=c\\mid x)=\\frac{1}{k}\\sum_{i\\in N_k(x)}1(y_i=c)",
  "alberi": "\\mathrm{Var}(\\bar T_B)=v\\left(\\rho+\\frac{1-\\rho}{B}\\right)",
  "boost": "F_m=F_{m-1}+\\nu h_m",
  "reti-neurali": "W_{l}^{\\mathrm{new}}=W_l-\\eta\\nabla_{W_l}L",
  "pca": "X_c=U\\Sigma V^\\top",
  "clustering": "\\sum_{k=1}^{K}\\sum_{i\\in C_k}||x_i-\\mu_k||^2",
  "dbscan": "|N_\\epsilon(x)|\\ge \\mathrm{minPts}",
  "moran": "I=\\frac{n}{S_0}\\frac{z^\\top Wz}{z^\\top z}",
  "lisa": "I_i=\\frac{z_i}{m_2}\\sum_j w_{ij}z_j",
  "processi-puntuali": "K(r)=\\pi r^2",
  "variogrammi": "\\gamma(h)=C(0)-C(h)",
  "kriging": "w=C^{-1}c",
  "regressione-spaziale": "(I-\\rho W)y=X\\beta+\\epsilon"
};
 Object.keys(formulas).forEach(function(id) { if (SA.pedagogy[id]) SA.pedagogy[id].formula=formulas[id]; });

 var qualifications={
   "bivariata":"La varianza condizionata σ_Y²(1−ρ²) vale per una normale bivariata con σ_X,σ_Y positive e |ρ|<1; nel caso standardizzato σ_Y²=1. Non vale per una congiunta arbitraria.",
   "lgn-tcl":"La normalizzazione classica del TCL richiede varianza finita, campioni iid e σ positiva; il laboratorio presenta casi di fallimento.",
   "fisher":"L'identità tra varianza dello score e curvatura media richiede ipotesi di regolarità e giustificazione dello scambio derivata-integrale.",
   "intervalli":"L'identità definisce la copertura reale. L'uguaglianza o disuguaglianza rispetto a 1−α deve essere verificata per ciascun metodo: Wald e Wilson possono sottocoprire.",
   "regressione":"L'espressione mediante inversa ordinaria di XᵀX richiede rango colonnare pieno; con collinearità perfetta servono altre convenzioni o una soluzione generalizzata.",
   "arma":"La formula della covarianza indicata riguarda esclusivamente un AR(1) stazionario con |φ| < 1, non un ARMA generico.",
   "penalizzata":"Obiettivo di elastic net coerente con la normalizzazione (1/2n)RSS del laboratorio: α=0 ridge, α=1 lasso, 0<α<1 elastic net; λ≥0; intercetta non penalizzata e predittori opportunamente centrati/standardizzati.",
   "validazione":"L’errore out-of-fold per osservazione pesa i rischi dei fold per n_k/n. La media semplice K⁻¹∑R_k coincide soltanto quando le numerosità dei fold sono uguali; le differenze influiscono sul valore della CV e sulla scelta degli iperparametri.",
   "moran":"Il valore di I dipende dalla matrice W, da S0 e dalla normalizzazione; la speranza sotto permutazione non è in generale zero.",
   "lisa":"La definizione di m2 e le normalizzazioni di W devono essere mantenute identiche nel confronto tra implementazioni.",
   "processi-puntuali":"K(r)=πr² è il riferimento teorico del processo di Poisson omogeneo sul piano; non vale per un processo puntuale generico.",
   "variogrammi":"La relazione γ(h)=C(0)−C(h) vale per un processo stazionario del secondo ordine; l'ipotesi intrinseca da sola non implica l'esistenza di C(h).",
   "kriging":"I pesi C⁻¹c sono quelli del simple kriging con media nota. L'ordinary kriging richiede il vincolo che i pesi sommino a uno.",
   "regressione-spaziale":"La formula rappresenta il modello spatial lag SAR, non il modello spatial error SEM; la stima e gli impatti richiedono convenzioni esplicite su W."
 };
 Object.keys(qualifications).forEach(function(id){if(SA.pedagogy[id])SA.pedagogy[id].formulaNote=qualifications[id];});
})();
