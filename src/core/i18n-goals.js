/* Concise, topic-specific English learning objectives; displayed in the hero. */
(function(){
'use strict';var SA=window.SA||(window.SA={});
SA.englishGoals={
  distribuzioni:['Distinguish probability masses from densities','Compute probabilities with the CDF and interval endpoints','Read empirical probabilities and Monte Carlo uncertainty','Identify distributions without finite moments'],
  bivariata:['Distinguish joint, marginal and conditional laws','Interpret dependence beyond linear correlation','Compare normal and nonlinear conditional behavior','Recognize finite-band conditioning as an approximation'],
  simulazione:['Generate observations using inverse CDFs','Distinguish sample size from Monte Carlo replications','Compare Monte Carlo estimators on matched draws','Explain a variance-reduction argument'],
  'lgn-tcl':['Distinguish LLN from convergence in distribution','State the assumptions behind the classical CLT','Assess approximation quality at finite n','Explain why Cauchy averages are a counterexample'],
  adattamento:['Compare empirical and fitted distributions','Interpret QQ plots and grouped chi-square diagnostics','Distinguish fitted from fully specified null models','Explain model checking without accepting a null as true'],
  stimatori:['Compare bias, variance and mean squared error','Contrast mean, median and likelihood estimates','Study the effect of outliers on estimation','State the assumptions behind efficiency comparisons'],
  fisher:['Interpret score and likelihood curvature','Distinguish observed from expected information','Connect information with estimator variability','Identify failures of regular likelihood theory'],
  intervalli:['Interpret repeated-sample confidence coverage','Compare Z, t and discrete interval procedures','Contrast nominal, exact and simulated coverage','Assess the effect of sample size and boundaries'],
  test:['Define type-I error and power','Interpret a two-sided Z rejection rule','Vary effect size, level and sample size','Avoid treating a p-value as a posterior probability'],
  regressione:['Fit and interpret ordinary least squares','Identify leverage and influential observations','Distinguish mean confidence from prediction intervals','Check design and error assumptions'],
  'regressione-lp':['Compare L1, L2 and Lp residual objectives','Investigate robustness under contaminated errors','Interpret changes in estimator sampling error','Recognize nonconvexity when p falls below one'],
  glm:['Interpret GLM families and link functions','Compare logistic and Poisson predictions','Follow fitting and likelihood estimation','Recognize separation and model misspecification'],
  arma:['Identify autoregressive and moving-average dependence','Compare empirical and theoretical autocorrelations','State AR stationarity and MA invertibility conditions','Recognize nonstationarity and near-unit-root behavior'],
  quantilica:['Interpret a conditional quantile','Fit the asymmetric check-loss objective','Compare OLS and median regression','Assess heteroskedastic and heavy-tailed data'],
  penalizzata:['Contrast ridge, lasso and elastic net','Interpret shrinkage and exact sparsity','Explore coefficient paths as penalty strength varies','Use consistent objective and tuning conventions'],
  spline:['Represent smooth curves with basis functions','Explain the smoothing bias–variance trade-off','Interpret effective degrees of freedom','Compare spline and kernel estimates'],
  segmentata:['Interpret a slope change and breakpoint','Profile the fit over candidate breakpoints','Assess uncertainty from repeated sampling','Recognize nonidentifiability under no slope change'],
  validazione:['Separate fitting, tuning and final evaluation','Recognize training-error optimism','Use fold weighting and avoid leakage','Interpret bias from model selection'],
  knn:['Describe local votes and predictions','Explore the roles of k and variable scaling','Distinguish training and test error','Tune k without using the final test set'],
  alberi:['Interpret recursive splits and stopping rules','Compare trees, bagging and random forests','Relate tree correlation to ensemble variance','Use out-of-bag performance cautiously'],
  boost:['Interpret pseudo-residuals and additive trees','Compare regression and Bernoulli boosting loss','Adjust shrinkage and tree complexity','Distinguish training loss from validation stopping'],
  'reti-neurali':['Trace weights, activations and forward passes','Verify backpropagation against finite differences','Fit nonlinear patterns such as XOR','Assess the effects of initialization and regularization'],
  pca:['Link principal directions to covariance eigenvectors','Interpret explained variance and reconstruction error','Distinguish component sign from subspace','Study sensitivity to scaling and eigengaps'],
  clustering:['Compare k-means and hierarchical linkage','Interpret within-cluster sum of squares','Distinguish local from global optima','Use the adjusted Rand index appropriately'],
  dbscan:['Distinguish core, border and noise points','Explore neighbourhood radius and minPts','Compare density clusters with known labels','Recognize parameter and border-point ambiguity'],
  moran:['Define global spatial autocorrelation','Compare spatial weight matrices','Interpret permutation reference distributions','Separate spatial dependence from trend'],
  lisa:['Interpret location-specific spatial association','Identify high–high and low–low patterns','Connect local and global statistics consistently','Address multiple local tests'],
  'processi-puntuali':['Contrast clustered, random and regular patterns','Define complete spatial randomness','Interpret KDE and Ripley L across scales','Account for window boundaries and intensity'],
  variogrammi:['Define semivariogram and stationarity','Estimate distance-binned semivariances','Interpret nugget, sill and practical range','Recognize anisotropy and trends'],
  kriging:['Distinguish simple and ordinary kriging','Compare prediction and kriging variance','Study the value of additional sensors','Interpret uncertainty under an assumed covariance'],
  'regressione-spaziale':['Contrast spatial lag and spatial error models','Interpret spatial feedback through the multiplier','Assess residual spatial autocorrelation','Recognize weight-matrix and likelihood assumptions']
};
})();
