/* Original English methodological chapters for StatAtlas C.
 * Edited independently from the authoritative Italian source, with explicit
 * assumptions, caveats and mathematical consequences. Never modify algorithms.
 */
(function () {
'use strict';
var SA=window.SA||(window.SA={});
SA.englishTheory = {
  distribuzioni: {
    essential: [
      'A probability law assigns probabilities to events, while a random variable maps outcomes into numerical observations. For a discrete law, probability masses can be added over a set. For an absolutely continuous law, probabilities are areas under the density, not the values of that density at individual points. The cumulative distribution F(x) = P(X ≤ x) is defined for either kind of law and is always nondecreasing and right-continuous.',
      'In this simulation the interval probability is P(a < X ≤ b) = F(b) − F(a). The distinction between an open and a closed endpoint is particularly important when a distribution places positive probability at a single point. With independent samples, the fraction falling in the interval is a Bernoulli sample mean. It estimates that probability; its Monte Carlo uncertainty depends on both the number of draws and the underlying event probability.'
    ],
    advanced: [
      'The empirical CDF F_n(x) is the average of indicators 1{X_i ≤ x}. At a fixed x its expectation is F(x), with variance F(x)[1−F(x)]/n under independent sampling. Uniform deviations can be controlled without specifying F through the Dvoretzky–Kiefer–Wolfowitz bound P(sup_x |F_n(x)−F(x)| > ε) ≤ 2 exp(−2nε²). The bound concerns an entire empirical CDF, whereas a confidence interval for a single binomial proportion concerns one event.',
      'Simulation by inversion uses the generalized quantile Q(u) = inf{x: F(x) ≥ u}. This convention also works for discrete distributions, where simple algebraic inversion of a density is not meaningful. Transformations and model relationships should preserve their stated parameterizations: for example, gamma shape and rate must not be confused with shape and scale. Some distributions, such as Cauchy, lack finite means or variances, so familiar moment-based summaries can be undefined.'
    ]
  },
  bivariata: {
    essential: [
      'A bivariate distribution describes the joint behavior of X and Y. The marginal distribution of X is obtained by summing or integrating over Y; the conditional distribution of Y given X restricts the joint law and normalizes by the marginal probability or density. The conditional mean E(Y|X=x) is a function of x, not necessarily a straight line.',
      'Covariance and Pearson correlation summarize linear co-movement and depend on the existence of suitable moments. A correlation of zero does not imply independence in general. For instance, a centered X and Y=X² can be dependent and uncorrelated. Under a jointly Gaussian law, however, uncorrelated components are independent, and the conditional expectation is linear.'
    ],
    advanced: [
      'For a nonsingular jointly Gaussian pair, Y|X=x is normal with mean μ_Y + ρ(σ_Y/σ_X)(x−μ_X) and variance σ²_Y(1−ρ²). The conditional variance is a variance, not a standard deviation; the latter is σ_Y sqrt(1−ρ²). One derivation decomposes Y into its linear projection on X and a Gaussian residual independent of X.',
      'A simulation that examines observations inside |X−x₀| ≤ h conditions on a band of positive width. This is an approximation to a pointwise conditional distribution, not the same conditional law unless h tends to zero under appropriate smoothness and sampling assumptions. As h decreases, conditional bias may decrease but the effective number of observations falls; both effects should be discussed when interpreting an empirical slice.'
    ]
  },
  simulazione: {
    essential: [
      'Monte Carlo methods replace analytically difficult expectations or probabilities with calculations on generated random observations. In inverse-transform sampling, a uniform draw U is transformed through the generalized inverse CDF Q to obtain X=Q(U) with the desired law. The algorithm is exact as a distributional identity when U is ideal; empirical estimates based on finitely many draws are still random.',
      'For an integrable quantity h(X), the average of M independent values estimates E[h(X)]. The number M of replications must not be mistaken for the sample size inside each replication. Under finite variance, the estimator has standard error proportional to M^−1/2. Four times as many independent replications are needed to approximately halve that standard error.'
    ],
    advanced: [
      'Variance reduction compares estimators of the same estimand under the same computational budget. A conditional Monte Carlo or Rao–Blackwell estimator E(T|S) has the same expectation as T and no larger variance when E(T²) is finite. The law of total variance gives Var(T) = E[Var(T|S)] + Var[E(T|S)], making the reduction explicit.',
      'A common-random-numbers comparison must be paired using identical underlying streams. Reusing the same seed alone is not sufficient when the two algorithms consume different numbers of random values. Simulation uncertainty is separate from approximation bias in any numerical quadrature and from model uncertainty about the assumed data-generating distribution.'
    ]
  },
  'lgn-tcl': {
    essential: [
      'The law of large numbers and the central limit theorem answer different questions. The LLN concerns a running mean from a single growing sample and its approach to the population mean. The CLT concerns the sampling distribution of a properly standardized mean over independent samples of a fixed size, as that size increases.',
      'For i.i.d. observations with finite mean μ and finite, positive variance σ², the standardized statistic sqrt(n)(X̄_n−μ)/σ converges in distribution to a standard normal law. At a fixed finite n the sampling distribution need not be normal. The Monte Carlo replicate count B controls how clearly the plotted approximation is seen, independently of the within-sample size n.'
    ],
    advanced: [
      'A strong LLN under integrability states X̄_n → μ almost surely. The classical finite-variance CLT states convergence in distribution, which must not be confused with convergence of sample paths or almost-sure convergence. A Berry–Esseen inequality gives an approximation rate of order 1/sqrt(n) under an additional finite third absolute centered moment, with a constant depending on a standardized third-moment ratio.',
      'The Cauchy example is a substantive counterexample, not just a slow-converging case: the sample mean of independent identically distributed Cauchy observations is again Cauchy with the same scale. No finite population mean exists for this LLN/CLT formulation. Heavy tails with finite variance and infinite variance belong to different asymptotic regimes.'
    ]
  },
  adattamento: {
    essential: [
      'Model checking evaluates discrepancies between an observed sample and a proposed distribution. Empirical CDF plots, QQ plots, histograms and grouped chi-square statistics emphasize different discrepancies. A p-value is the probability, under the null model and its calibration procedure, of a statistic at least as extreme as observed; it is not the probability that the model is true.',
      'If the hypothesized cell probabilities are fixed and positive and expected cell counts are sufficiently large, the usual grouped Pearson statistic has an asymptotic chi-square reference law with an appropriate number of degrees of freedom. Small expected counts or data-dependent grouping can compromise this approximation.'
    ],
    advanced: [
      'When parameters are estimated from the same sample, the null distribution of many goodness-of-fit statistics changes. It is not generally justified to subtract an arbitrary number of degrees of freedom without accounting for the estimation method and regularity of the grouped model. Parameter fitting also alters the distribution of QQ-plot bands.',
      'Parametric bootstrap calibration should simulate under the fitted null, re-estimate every parameter for each bootstrap dataset, and recompute the same statistic using the same procedure. Otherwise the bootstrap targets a different experiment. A nonsignificant test does not prove equality of the two probability laws; it can reflect low power for relevant alternatives.'
    ]
  },
  stimatori: {
    essential: [
      'A statistical estimator is a rule applied to a random sample; its repeated-sampling distribution characterizes bias, variance and other properties. Bias is E(T)−θ, while mean squared error E[(T−θ)²] combines variance and squared bias when the second moment exists. A low-variance estimator may still have a high MSE if its systematic error is substantial.',
      'Sample mean, median and likelihood estimators can target the same location parameter yet respond differently to outliers. Their relative efficiency depends on the population family and the loss used to judge estimation. Compare estimators on matched simulated samples so that observed differences are not unnecessarily contaminated by different random datasets.'
    ],
    advanced: [
      'The mean minimizes squared deviations within a sample, while a sample median minimizes absolute deviations. Neither optimization identity alone proves that the estimator minimizes a population risk under every data-generating distribution. For a regular symmetric distribution with positive density at its median, the sample median has asymptotic variance 1/[4n f(m)²].',
      'The sample mean has an unbounded influence function under classical location contamination, whereas the median has bounded local influence under regularity conditions. This does not mean a median is always preferable: normal-model estimation may favor the mean for quadratic loss. MSE comparisons for Cauchy data require special caution because some moments do not exist.'
    ]
  },
  fisher: {
    essential: [
      'The likelihood L(θ;x) treats observed data x as fixed and varies the candidate parameter θ. Its log derivative is the score U(θ); the negative second derivative is observed information, and the variance of the score defines expected Fisher information under regularity conditions. A sharper likelihood around the parameter can indicate greater local precision, but the inference depends on a correctly specified family.',
      'Monte Carlo experiments can compare the score, information and sampling distributions across several parametric models. Parameterizations matter: the information for a variance parameter differs from that for a standard deviation or a log-variance.'
    ],
    advanced: [
      'For a regular one-parameter model, E_θ[U(θ)]=0 and I(θ)=E_θ[U(θ)²]=−E_θ[∂²ℓ(θ)/∂θ²]. The equalities require interchange of differentiation and integration and suitable support conditions. The Cramér–Rao lower bound for an unbiased estimator involves the inverse information, but equality is not automatic.',
      'In regular models, maximum-likelihood estimators are often asymptotically normal with variance of order I_n(θ)⁻¹. Boundary parameters, moving support, infinite information or nonidentifiability violate assumptions used in Wald intervals and likelihood-ratio chi-square approximations. Compare observed and expected curvature without treating them as identical finite-sample quantities.'
    ]
  },
  intervalli: {
    essential: [
      'A confidence interval is a random set constructed by a fixed procedure before the sample is seen. Coverage at parameter θ is P_θ(θ ∈ C(X)). Nominal 95% coverage is a claim about the procedure across hypothetical repetitions, not a frequentist probability assigned to the fixed parameter conditional on the observed data.',
      'Different models lead to different pivots. For a normal mean with known variance, the Z interval is exact; with unknown variance under normal independent sampling, the Student t pivot provides exact coverage. Binomial proportions near boundaries expose weaknesses of the Wald interval, while score/Wilson and discrete exact methods have different coverage behavior.'
    ],
    advanced: [
      'For a continuous model, a correctly calibrated pivot can lead to coverage equal to the nominal level. For a discrete model, attainable coverage values may jump with the parameter, and conservative exact constructions generally exceed nominal coverage for some parameter values. Garwood intervals for a Poisson mean invert tail probabilities; their finite-sample behavior differs from Gaussian approximations.',
      'The empirical coverage estimate from B independent replications has binomial standard error sqrt(p(1−p)/B), where p is the procedure’s true coverage at the chosen parameter. This simulation uncertainty must be distinguished from the discrepancy p−(1−α). Evaluate both coverage and mean interval length when comparing procedures.'
    ]
  },
  test: {
    essential: [
      'A hypothesis test fixes a rejection rule using a test statistic and a null reference distribution. The type-I error rate is the probability of rejection when the null is true. Power is the rejection probability at a specified alternative parameter, and the type-II error at that point is one minus power.',
      'For a two-sided normal Z test, rejection is based on the magnitude of the standardized statistic and both tails. Increasing sample size under a fixed nonzero effect generally separates the alternative distribution from the null, increasing power while preserving the nominal null calibration.'
    ],
    advanced: [
      'The p-value is a tail probability computed under H₀, with the meaning determined by the statistic and alternative. It is not P(H₀|data). Exact calibration holds under the model assumptions; estimated nuisance parameters or dependent observations can alter the null law and require different procedures.',
      'A power function is indexed by parameter values, not simply by one reported p-value. Designs intended to achieve a target power require a specific minimally relevant effect and variance or nuisance assumptions. Simulation can estimate the entire curve, but a Monte Carlo estimate at each parameter value has its own random error.'
    ]
  },
  regressione: {
    essential: [
      'Ordinary least squares chooses a coefficient vector minimizing the sum of squared residuals. When the design has full column rank, the unique solution satisfies the normal equations XᵀX β̂=Xᵀy. Residuals are vertical differences between observed and fitted responses, not distances perpendicular to the regression line.',
      'Leverage depends on predictor geometry. An observation far in predictor space can move the fitted line substantially even with an apparently moderate residual. Confidence intervals for the conditional mean and prediction intervals for an individual future observation answer different questions; the latter include irreducible response variability.'
    ],
    advanced: [
      'For fixed full-rank X, independent mean-zero homoskedastic errors with variance σ² give E(β̂|X)=β and Cov(β̂|X)=σ²(XᵀX)⁻¹. Gaussian errors yield exact finite-sample t and F distributions for standard statistics; without Gaussian errors these may be asymptotic approximations.',
      'The hat matrix H=X(XᵀX)⁻¹Xᵀ maps y to fitted values. Its diagonal entries measure leverage and sum to the number of fitted parameters. Studentized residuals and Cook’s distance combine different aspects of unusual observations. Influential points should be investigated, not automatically discarded.'
    ]
  },
  'regressione-lp': {
    essential: [
      'An Lp regression criterion minimizes a sum of |y_i−x_iᵀβ|^p terms. At p=2 it is least squares; at p=1 it is least absolute deviations. Changing p changes the relative weight of large residuals and therefore the response to contamination or heavy-tailed errors.',
      'Comparisons should use the same simulated observations, a clearly stated loss for evaluation, and computational procedures appropriate to each criterion. A small training objective under one loss does not imply superiority under another loss.'
    ],
    advanced: [
      'The scalar map |r|^p is convex for p≥1. It is strictly convex in r for p>1 but strict convexity of the full coefficient objective additionally depends on the design. For 0<p<1, the loss is nonconvex, so local minima and optimization initialization become central; a numerical fit is not automatically a global optimum.',
      'The L1 objective has subgradients at zero and can admit multiple minimizers under rank deficiencies. Under symmetric errors, different p values can be motivated by different conditional functionals or assumed likelihoods. The theoretical distribution of an estimator is not determined solely by the numerical optimizer used to find it.'
    ]
  },
  glm: {
    essential: [
      'A generalized linear model combines a distributional family, a linear predictor η=Xβ and a link g such that g(E[Y|X])=η. In logistic regression the conditional mean is a Bernoulli probability and g is the logit. In Poisson log-link regression the mean is exp(η) and must be positive.',
      'The slope coefficients act on the link scale: in logistic regression, a one-unit predictor increase multiplies the conditional odds by exp(β_j), holding other variables fixed. For Poisson log-link regression it multiplies the conditional mean by exp(β_j). These are not generally additive effects on the response scale.'
    ],
    advanced: [
      'For canonical links in full exponential-family models, the score takes a particularly simple form based on Xᵀ(y−μ) with appropriate dispersion scaling. Iteratively reweighted least squares is one way to solve the likelihood score equations. Fisher information depends on the changing mean-variance relation and on predictor geometry.',
      'Complete or quasi-complete separation in logistic regression can cause infinite likelihood estimates; finite iteration counts do not guarantee finite MLEs. Sparse count data, overdispersion and misspecification affect the reliability of nominal standard errors and confidence intervals. Convergence warnings and boundary fits are part of the statistical result.'
    ]
  },
  arma: {
    essential: [
      'A time-series process combines marginal behavior with temporal dependence. An AR(1) process X_t=φX_{t−1}+ε_t with white-noise innovations has a covariance-stationary solution for |φ|<1; the stationary autocorrelation at lag h is φ^|h|. A moving-average MA(1) process depends on the current and previous innovation.',
      'Autocorrelation and partial autocorrelation plots provide clues about dependence structure, but finite sample estimates are noisy. They do not establish a model solely by visual inspection. The process must satisfy the stated assumptions before its theoretical autocovariance is compared with empirical values.'
    ],
    advanced: [
      'Under |φ|<1 and finite innovation variance σ², stationary AR(1) variance is σ²/(1−φ²) and the lag-h autocovariance is γ(h)=γ(0)φ^|h|. Near a unit root, persistence becomes strong and finite-sample behavior differs markedly from stationary asymptotics. At |φ|≥1 the usual covariance-stationary representation does not apply.',
      'An MA(1) has nonzero autocovariance only at lag zero and one, yet invertibility is a distinct property from stationarity. Invertibility of the conventional MA(1) parameterization requires the absolute coefficient to be below one. ARMA model identification and inference demand attention to initialization, deterministic trends and innovation assumptions.'
    ]
  },
  quantilica: {
    essential: [
      'Quantile regression estimates a conditional quantile of the response rather than its conditional mean. For a quantile level τ in (0,1), the check loss assigns different weights to positive and negative residuals. At τ=0.5 it becomes proportional to absolute loss and targets a conditional median.',
      'Different quantile lines describe different parts of a conditional response distribution. In a heteroskedastic model, upper and lower quantile slopes may differ even when the conditional mean is nearly linear. Interpretation must distinguish changing conditional scale from changing conditional location.'
    ],
    advanced: [
      'The quantile regression objective is ∑ρ_τ(y_i−x_iᵀβ), where ρ_τ(u)=u[τ−1{u<0}]. This convex objective is generally nondifferentiable at zero. Its minimizer need not be unique for degenerate designs or special data configurations.',
      'Asymptotic standard errors depend on the conditional density near the target quantile and cannot simply reuse ordinary least-squares variance formulas. Quantile crossing can appear when several τ levels are fitted independently. The confidence statements associated with displayed lines require their own inferential assumptions.'
    ]
  },
  penalizzata: {
    essential: [
      'Penalized regression trades goodness of fit against model complexity by adding a nonnegative penalty to the data-fitting criterion. Ridge uses an L2 squared-norm penalty and shrinks coefficients continuously. Lasso uses an L1 norm and can set coefficients exactly to zero. Elastic net combines the two.',
      'The penalty changes the estimator, often reducing variance at the cost of additional bias. Comparing algorithms requires a consistent normalization of the residual-loss term and penalty parameter; a numerical λ from one convention cannot necessarily be transferred directly to another.'
    ],
    advanced: [
      'In the convention (1/2)||y−Xβ||²+λ||β||₁, the lasso optimality condition is Xᵀ(Xβ−y)+λs=0 with s in the subdifferential of ||β||₁. On a one-dimensional orthogonal design, soft thresholding explains why exact zeros appear. Uniqueness is not guaranteed for arbitrary collinear designs.',
      'Ridge with strictly positive λ has a unique coefficient solution under the conventional quadratic objective, even when X has dependent columns. For correlated predictors, elastic net can encourage grouped retention. Cross-validation selects a penalty according to a specified predictive criterion; selection and evaluation should be separated to prevent optimism.'
    ]
  },
  spline: {
    essential: [
      'A flexible regression curve can be represented as a linear combination of basis functions, with coefficients estimated from observations. Spline bases provide local flexibility through knots and polynomial pieces with continuity constraints. Penalization discourages excessive roughness while allowing departures from a straight line.',
      'Bias and variance depend on smoothing strength. An overly rigid smoother misses important structure; an extremely flexible smoother reacts to random noise. Repeated-sampling experiments reveal how average curves and pointwise variability respond to the chosen complexity.'
    ],
    advanced: [
      'For a quadratic penalized criterion ||y−Bθ||²+λθᵀPθ with positive semidefinite P, the fitted values are a linear smoother S_λ y for fixed B and λ. Effective degrees of freedom are often summarized by tr(S_λ), not simply the number of basis columns.',
      'Kernel regression similarly depends on smoothing bandwidth but generally uses a different fitting operator. Local-linear estimators can reduce boundary bias relative to local-constant estimators under suitable assumptions. Selecting λ or bandwidth with the same data and then reporting unadjusted model-selection-free inference can be misleading.'
    ]
  },
  segmentata: {
    essential: [
      'Segmented regression describes a relationship with different slopes on either side of a breakpoint ψ. A common continuous form adds δ(x−ψ)_+ to a baseline linear predictor. The change δ modifies the slope beyond ψ without requiring a jump in the fitted mean.',
      'A breakpoint estimate is itself random and can be unstable with limited data, weak slope changes or uneven observation density. Plotting its sampling distribution and bootstrap behavior helps distinguish a clearly identified change from one largely determined by noise.'
    ],
    advanced: [
      'Under the null hypothesis δ=0, the breakpoint ψ disappears from the conditional mean and is not identified. Consequently, a naive regular χ² or normal approximation for a test involving ψ may not hold. This is a nonregular inference problem; a bootstrap or specially calibrated procedure must respect the null data-generating mechanism.',
      'Profile residual sums of squares can be multimodal or relatively flat across candidate ψ values. The optimization method should therefore be treated as part of the estimator definition. Separate the deterministic profile of one sample from the repeated-sampling distribution of its estimated minimizer.'
    ]
  },
  validazione: {
    essential: [
      'Predictive performance must be evaluated on observations not used to fit the model. A training error is generally optimistic because the model has been chosen to fit those observations. Validation can guide hyperparameter choice; an untouched test set estimates the performance of the entire selection protocol when used only at the end.',
      'Cross-validation divides the available training observations into folds and averages holdout losses. Unequal fold sizes require explicit weighting if the objective is mean error per observation. Data preprocessing and model tuning must be refitted inside the relevant training folds.'
    ],
    advanced: [
      'Selecting the smallest observed validation error among many candidates produces selection-induced optimism. Reusing those same validation errors as an unbiased final test confuses a model-selection criterion with evaluation of a fixed procedure. Nested cross-validation provides an outer test loop for an inner tuning procedure.',
      'For correlated or temporal observations, random row-wise folds may violate independence assumptions or leak future information. Spatial blocks, grouped folds or forward-chaining splits may be more appropriate. Generalization estimates must specify the target sampling regime and not be interpreted as universal guarantees.'
    ]
  },
  knn: {
    essential: [
      'The k-nearest-neighbours rule predicts using nearby observations under a chosen distance metric. For classification, a majority vote estimates the class favored by a local neighborhood; for regression, a local average estimates the response. Smaller k gives more flexible boundaries but potentially greater variance.',
      'Distance depends on variable scaling. A predictor measured on a very large numerical scale can dominate Euclidean distance unless predictors are standardized appropriately. Scale parameters must be estimated on the training sample rather than the test data.'
    ],
    advanced: [
      'Consistency results for nearest-neighbour classification under suitable assumptions typically require k to increase with n while k/n tends to zero. Fixing k=1 does not generally yield Bayes-risk consistency. Dimension increases can make local neighborhoods sparse, aggravating the curse of dimensionality.',
      'The best k for predictive performance is a tuning choice. Select it using training data and resampling, not using the untouched test set. When distances tie, the implementation’s deterministic tie-breaking policy matters for exact reproducibility across R and the browser.'
    ]
  },
  alberi: {
    essential: [
      'A decision tree recursively partitions predictor space into regions whose training responses are homogeneous under a chosen impurity or error criterion. Tree depth and leaf-size constraints determine how flexibly the method can fit the data. A tree can express interactions and thresholds without imposing a global linear response surface.',
      'Bagging averages or votes over trees fitted to bootstrap samples. A random forest also randomizes the candidate predictor subset at each split. The resulting diversity can reduce ensemble prediction variance, especially when individual trees have correlated errors.'
    ],
    advanced: [
      'The prediction variance of an average of equally variable trees involves both individual-tree variance and average pairwise correlation. Increasing the number of trees cannot eliminate variance due to a strong common correlation; random feature selection can alter this dependence at some cost to individual tree strength.',
      'Out-of-bag observations provide a useful internal validation mechanism for bootstrap forests, but OOB risk still targets a specified data-generating regime and is not a guarantee against leakage from global preprocessing. Feature importance measures are algorithm- and data-dependent and need careful interpretation under correlated predictors.'
    ]
  },
  boost: {
    essential: [
      'Gradient boosting constructs an additive predictor by repeatedly fitting a simple learner to a direction that reduces the current loss. In squared-error regression, negative gradients are residuals. For Bernoulli log loss, the negative gradient on the logit scale is the observed outcome minus its current fitted probability.',
      'A small learning rate moves only partway along each fitted direction and typically requires more iterations. Training loss often decreases as trees are added, but validation loss may eventually increase. The best iteration should be selected without using the final test responses.'
    ],
    advanced: [
      'For a Bernoulli response with logit predictor f(x), the per-observation loss can be written log(1+exp(f))−yf, whose derivative with respect to f is sigmoid(f)−y. A numerically stable loss evaluation prevents overflow for extreme logits. Each step approximates functional gradient descent within the chosen base-learner class.',
      'Shrinkage, tree depth, subsampling and early stopping regulate the model’s effective complexity. The point of minimal validation error is random and should not be confused with a guaranteed optimum for future unseen data. Comparisons between steps should use matched data and random streams when claiming a paired experiment.'
    ]
  },
  'reti-neurali': {
    essential: [
      'A feedforward neural network alternates affine transformations and nonlinear activations, ending with an output suited to the response type. Hidden layers make it possible to represent nonlinear decision boundaries such as XOR that a single linear separator cannot reproduce.',
      'Weights are learned by iteratively reducing a loss function through backpropagation. Learning rate, hidden width, penalty and initialization change both the optimization path and resulting validation performance. Comparing neural networks must distinguish optimization variability from changes in the sample.'
    ],
    advanced: [
      'Backpropagation applies the chain rule to compute derivatives of the total loss with respect to all parameters. A finite-difference gradient check perturbs individual parameters and compares the numerical difference quotient to the analytic gradient; the error should be assessed away from nondifferentiable activation kinks.',
      'Neural-network objectives are typically nonconvex, so distinct initial weights can lead to different stationary points. L2 penalties, early stopping and validation splits address different forms of instability and overfitting. A high training accuracy alone is not evidence of generalization or calibration.'
    ]
  },
  pca: {
    essential: [
      'Principal component analysis finds orthogonal directions of maximal sample variance after centering the data. The first component maximizes projected variance among unit vectors; subsequent components are orthogonal to the earlier directions. Truncation provides a low-dimensional representation that preserves as much sample variance as possible.',
      'PCA is unsupervised: it does not use response labels and does not necessarily preserve the directions most useful for prediction. Scaling matters when variables have different units. A direction is defined only up to sign; flipping its sign does not change the component subspace.'
    ],
    advanced: [
      'The eigenvectors of the sample covariance matrix correspond to right singular vectors of the centered data matrix. The associated eigenvalues are proportional to squared singular values under the chosen covariance normalization. The Eckart–Young theorem identifies the truncated SVD as an optimal low-rank approximation in Frobenius norm.',
      'When eigenvalues are repeated or very close, individual component directions may be unstable or non-identifiable even when the leading subspace is stable. Assessing angles across repeated samples requires a sign-invariant measure, such as squared sine of the angle between one-dimensional directions.'
    ]
  },
  clustering: {
    essential: [
      'Clustering groups observations without known class labels. k-means seeks a partition that minimizes within-cluster sums of squares around centroids; its objective depends on the chosen K and on the scale of the variables. Lloyd’s alternating assignment and centroid-update steps do not increase this objective, but may settle at a local minimum.',
      'Hierarchical agglomerative clustering builds a sequence of nested merges based on a linkage rule. Single, complete, average and Ward linkages express different grouping priorities and need not return the same partition. A dendrogram describes the merge hierarchy rather than estimating a uniquely true number of groups.'
    ],
    advanced: [
      'A k-means centroid update is the exact minimizer of squared within-cluster error for a fixed nonempty assignment. With fixed centroids, assigning each point to a closest centroid is optimal for the same objective; repeated alternation gives monotonic improvement on that sample. The result does not establish global optimality.',
      'Ward.D2 linkage is related to increases in within-cluster sum of squares, but the reported dendrogram heights depend on the algorithmic convention. Adjusted Rand index compares partitions and is invariant under cluster label permutations. Similarity with known simulated classes is an external validation, not an intrinsic clustering criterion.'
    ]
  },
  dbscan: {
    essential: [
      'DBSCAN detects regions of high local point density using a neighbourhood radius ε and a minimum number of neighbours minPts. Core points have enough observations in their ε-neighbourhood; noncore points reachable from a core may be border points; observations not density-reachable from a cluster are labelled noise.',
      'Unlike k-means, DBSCAN does not require a prespecified cluster count and can recover nonconvex shapes. Its result nevertheless depends on the scale of the variables and the two neighbourhood parameters. A small parameter change can merge clusters or convert marginal observations into noise.'
    ],
    advanced: [
      'The ε-neighbourhood convention includes all points within distance ≤ε, commonly including the point itself when minPts is counted. Density reachability is directional for a border point, whereas the connectivity relation among core points is more stable. Border points accessible from multiple clusters can inherit an implementation-dependent label.',
      'The ordered k-distance curve is a heuristic for ε, not a mathematically optimal estimator in all settings. Varying density across the sample can make one global ε inappropriate. Adjusted Rand index can compare recovered labels with known simulation classes, but it is not available for genuinely unlabeled data.'
    ]
  },
  moran: {
    essential: [
      'Global Moran’s I summarizes how a spatial variable covaries with a spatially weighted version of itself. The spatial weights matrix W defines which locations are neighbours and how their contributions are normalized. A positive statistic is consistent with similar values near one another; a negative statistic can reflect local alternation.',
      'A permutation test randomizes observed values across fixed spatial locations under an exchangeability null, generating a reference distribution for the observed statistic. It does not establish a physical causal process nor compensate for a misspecified spatial support or weights matrix.'
    ],
    advanced: [
      'With zero diagonal and suitable randomization assumptions, the expectation of global Moran’s I under unrestricted uniform permutations is −1/(n−1). The algebra uses centered observations and the total spatial weight S₀, which must match the normalization implemented for the statistic.',
      'Binary and row-standardized weights need not give the same statistic. Isolated regions require explicit handling because a row-normalization with zero row sum is undefined. Spatial trend, nonstationarity or heterogeneous variance can generate a positive Moran statistic without an underlying stationary autoregression.'
    ]
  },
  lisa: {
    essential: [
      'Local indicators of spatial association quantify the contribution of each location to a spatial dependence pattern. The local Moran statistic combines the centered value at a location with a weighted lag of neighboring centered values. Quadrants such as high–high or low–low summarize signs relative to a chosen global center.',
      'Mapping local statistics and their permutation p-values is an exploratory procedure. A site with a large local statistic is not necessarily statistically significant, and a spatial cluster classification should specify both the sign convention and the inferential threshold.'
    ],
    advanced: [
      'Under one consistent normalization of global and local Moran statistics, the sum of the local contributions is proportional to the global index, with proportionality determined by S₀ and the sample scaling. A code comparison must match the same weight normalization and variance convention on both sides.',
      'Testing many locations produces a multiple-comparisons problem. The Benjamini–Hochberg and Benjamini–Yekutieli procedures control false discovery rates under different dependence assumptions; neither changes the meaning of the permutation null itself. Edge locations, irregular neighbourhood sizes and conditional versus unconditional permutations affect interpretation.'
    ]
  },
  'processi-puntuali': {
    essential: [
      'A spatial point process models the random locations of events in a study window. Complete spatial randomness usually refers to a homogeneous Poisson process: event counts in disjoint regions are independent and expected counts are proportional to their area. Clustering and regular spacing can both depart from this null.',
      'Kernel density estimation smooths observed events to show local concentration, but bandwidth changes what patterns appear. Ripley’s K and transformed L functions summarize interpoint structure over distance scales. Window boundaries require correction because some potential neighbours lie outside the observation region.'
    ],
    advanced: [
      'For homogeneous Poisson points in the plane, the theoretical K function is πr², giving L(r)−r=0. An observed curve above zero may indicate clustering at the corresponding scale and a curve below zero may indicate inhibition, subject to edge corrections and Monte Carlo uncertainty.',
      'Pointwise Monte Carlo envelopes at many radii are not automatically simultaneous confidence bands. Strongly varying spatial intensity can mimic clustering; a comparison against homogeneous CSR may then answer the wrong substantive question. The observation window, intensity definition and edge correction are part of the statistical model.'
    ]
  },
  variogrammi: {
    essential: [
      'A semivariogram describes how expected squared differences between spatial observations change with spatial separation. Under intrinsic stationarity, γ(h)=1/2 Var[Z(s+h)−Z(s)] depends on the separation vector h rather than the absolute location. Isotropy further reduces this dependence to distance alone.',
      'An empirical semivariogram bins observed pairs by distance and averages half their squared differences. Its precision differs greatly across bins because both the number and dependence of contributing pairs vary. Nugget, sill and practical range are model descriptors whose interpretation depends on the assumed covariance form.'
    ],
    advanced: [
      'Under second-order stationarity with covariance C(h), the theoretical semivariogram satisfies γ(h)=C(0)−C(h). A pure exponential covariance decays exponentially but only approaches zero asymptotically; its commonly reported practical range is defined relative to a chosen decay percentage, such as 95%.',
      'The nugget may represent microscale spatial variation, measurement error or both, but these mechanisms can have different predictive consequences. Empirical semivariogram least-squares fits need not be statistically efficient because binned pairwise estimates are dependent and heteroskedastic. Anisotropy and nonstationary trends violate a simple isotropic stationary fit.'
    ]
  },
  kriging: {
    essential: [
      'Kriging predicts a spatial value using weighted observed measurements and a stated covariance model. In simple kriging the population mean is treated as known; in ordinary kriging an unknown constant mean is estimated implicitly through an unbiasedness constraint requiring the weights to sum to one.',
      'A prediction map and its kriging-variance map answer different questions. The kriging variance expresses conditional mean-squared prediction uncertainty under the assumed covariance and mean model. It does not automatically include uncertainty from fitting covariance parameters or model misspecification.'
    ],
    advanced: [
      'For simple kriging with known covariance, predictor weights solve the covariance linear system Cw=c, where C is the observation covariance matrix and c contains prediction–observation covariances. The conditional prediction variance is C(0)−cᵀC⁻¹c when the matrix is nonsingular.',
      'Ordinary kriging augments this system with a Lagrange multiplier to enforce sum(w)=1. With the same correctly specified known covariance, adding an observation cannot increase optimal linear prediction MSE at a fixed target because the previous predictor remains feasible by assigning the new observation weight zero. That monotonicity may not apply to uncertainty maps after re-estimating covariance parameters.'
    ]
  },
  'regressione-spaziale': {
    essential: [
      'Spatial regression accounts for dependence that is not fully explained by measured covariates. A spatial autoregressive lag model introduces the response lag Wy on the right-hand side; a spatial error model puts autoregression in the disturbance process. These represent different mechanisms and require different effect interpretations.',
      'The matrix W defines spatial feedback and should be specified before fitting. Ordinary least squares can retain spatially patterned residuals when the model omits relevant geography. A significant residual Moran statistic may suggest misspecification but is not a unique diagnostic of the correct spatial model.'
    ],
    advanced: [
      'In the SAR model y=ρWy+Xβ+ε, stability requires that I−ρW be invertible, giving y=(I−ρW)⁻¹(Xβ+ε). A covariate change can propagate through the spatial multiplier, so raw regression coefficients are not directly comparable to total marginal effects as in an ordinary linear model.',
      'Gaussian likelihood fitting contains the log absolute determinant log|I−ρW|, reflecting the Jacobian of the transformation from y to innovations. The spatial error model instead applies an autoregressive structure to disturbances. Identification, admissible ρ values, endogeneity of Wy and weighting-matrix choice all affect likelihood and causal interpretation.'
    ]
  }
};
})();
