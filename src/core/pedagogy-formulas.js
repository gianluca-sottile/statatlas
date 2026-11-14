/* StatAtlas — equazioni-cardine per le schede avanzate.
 * L'interpretazione e le ipotesi di ciascuna identità sono nel testo del laboratorio.
 */
(function(){
 var SA=window.SA||(window.SA={});
 var formulas={
  "distribuzioni": "P(a<X\\le b)=F(b)-F(a)",
  "bivariata": "\\mathrm{Var}(Y\\mid X=x)=1-\\rho^2",
  "simulazione": "\\mathrm{Var}(Z)=\\mathrm{E}[\\mathrm{Var}(Z\\mid U)]+\\mathrm{Var}(\\mathrm{E}[Z\\mid U])",
  "lgn-tcl": "\\frac{\\sqrt{n}(\\bar{X}_n-\\mu)}{\\sigma}\\to N(0,1)",
  "adattamento": "X^2=\\sum_{j=1}^{k}\\frac{(O_j-E_j)^2}{E_j}",
  "stimatori": "\\mathrm{MSE}(T)=\\mathrm{Var}(T)+(\\mathrm{E}[T]-\\theta)^2",
  "fisher": "I(\\theta)=\\mathrm{E}[U(\\theta)^2]=-\\mathrm{E}[\\ell\\prime\\prime(\\theta)]",
  "intervalli": "\\mathrm{P}_\\theta(\\theta\\in C(X))\\ge 1-\\alpha",
  "test": "\\pi(\\theta)=P_\\theta(T\\in R)",
  "regressione": "\\hat{\\beta}=(X^\\top X)^{-1}X^\\top y",
  "regressione-lp": "\\hat\\beta_p=\\argmin_\\beta \\sum_{i=1}^{n}|y_i-x_i^\\top\\beta|^p",
  "glm": "g(\\mu_i)=x_i^\\top\\beta",
  "arma": "\\gamma(h)=\\frac{\\sigma^2\\phi^{|h|}}{1-\\phi^2}",
  "quantilica": "\\rho_\\tau(u)=u(\\tau-1(u<0))",
  "penalizzata": "\\hat\\beta=\\argmin_\\beta \\{RSS(\\beta)+\\lambda ||\\beta||_1\\}",
  "spline": "\\hat f=\\argmin_f \\{\\sum_{i=1}^n(y_i-f(x_i))^2+\\lambda J(f)\\}",
  "segmentata": "\\mathrm{E}(Y_i\\mid x_i)=\\beta_0+\\beta_1 x_i+\\delta(x_i-\\psi)_+",
  "validazione": "\\hat R(\\lambda)=\\frac{1}{K}\\sum_{k=1}^K R_k(\\lambda)",
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
})();
