/* StatAtlas · English scientific orientation for all 31 experiments.
 * The numerical models and the Italian source text remain authoritative.
 * This dataset is an independently edited English companion, not a wholesale
 * translation of the Italian Challenges, formulas or R scripts.
 */
var SA = window.SA || (window.SA = {});
SA.english = {
  parts: {
    I: ['Probability', 'Probability laws, dependence and how random variables are simulated.'],
    II: ['Sampling', 'Sample size, limiting results and goodness-of-fit diagnostics.'],
    III: ['Statistical inference', 'Estimation, likelihood, confidence intervals and hypothesis tests.'],
    IV: ['Statistical models', 'Regression, generalized models and time series.'],
    V: ['Modern regression', 'Quantiles, shrinkage, nonlinearity and structural changes.'],
    VI: ['Supervised learning', 'Prediction, validation, neighbours, ensembles and neural networks.'],
    VII: ['Dimension reduction and clustering', 'Low-dimensional representations and unsupervised groups.'],
    VIII: ['Spatial statistics', 'Spatial dependence, point patterns, interpolation and regression.']
  },
  labs: {
    distribuzioni: {
      title: 'Distributions and their relationships',
      blurb: 'Seventeen probability laws: probability mass or density, cumulative distribution, inversion sampling and relationships among models.',
      question: 'How close is an empirical probability to its theoretical value?',
      experiment: 'Choose a distribution, set its parameters and compare the empirical proportion in an interval with the exact probability as the sample size grows.',
      essential: 'Every random variable has a cumulative distribution F(x) = P(X ≤ x). For a < b, P(a < X ≤ b) = F(b) − F(a), whether the distribution is discrete or continuous. A density value alone is not a probability.',
      advanced: 'For independent observations, the empirical CDF has expectation F(x) and variance F(x)(1 − F(x))/n at each fixed x. The Dvoretzky–Kiefer–Wolfowitz inequality controls the maximum deviation over all x.',
      limit: 'Do not apply finite-moment statements to the Cauchy distribution. Check interval endpoints carefully for discrete random variables.'
    },
    bivariata: {
      title: 'Bivariate random variables',
      blurb: 'Joint dependence, marginals, conditional distributions, a three-dimensional density and the limits of correlation.',
      question: 'Can two variables be dependent even when their correlation is zero?',
      experiment: 'Compare a bivariate normal mechanism with a curved dependence pattern; move the conditioning window and inspect the empirical conditional distribution.',
      essential: 'Correlation measures linear association and does not, in general, characterize independence. Under joint normality, the conditional mean of Y is linear in X and its conditional variance is σ²_Y(1 − ρ²).',
      advanced: 'The normal conditional formula follows by decomposing Y into its linear projection on X and an independent Gaussian residual. This decomposition is not a universal law for non-Gaussian data.',
      limit: 'Conditioning on a band |X − x₀| ≤ h approximates, but does not equal, conditioning on an exact continuous value X = x₀.'
    },
    simulazione: {
      title: 'Monte Carlo simulation methods',
      blurb: 'Inverse-transform sampling, integration by random sampling and variance reduction.',
      question: 'How can uniform random numbers produce more complicated distributions?',
      experiment: 'Use the generalized inverse CDF to generate observations; compare alternative Monte Carlo estimators for the same integral.',
      essential: 'If U is uniform on (0,1), the generalized inverse F⁻¹(U) follows the distribution F. For independent integrable replicates, a Monte Carlo mean estimates the target expectation.',
      advanced: 'With finite variance, the standard error of a Monte Carlo mean decreases at rate 1/√M. Rao–Blackwell conditioning never increases variance when the two estimators have the same expectation.',
      limit: 'Sample size of the simulated dataset and number of independent Monte Carlo replicates are distinct concepts.'
    },
    'lgn-tcl': {
      title: 'Law of large numbers and central limit theorem',
      blurb: 'Trajectories of sample means, standardized sampling distributions and a Cauchy counterexample.',
      question: 'Does a large sample make the sample mean close to normal?',
      experiment: 'Contrast the stabilization of a running sample mean with the distribution of standardized means across repeated samples.',
      essential: 'The law of large numbers concerns convergence of the sample mean to the population mean. The classical central limit theorem concerns convergence in distribution of the standardized sample mean to a normal law.',
      advanced: 'Under i.i.d. sampling with finite, strictly positive variance σ², √n(X̄ₙ − μ)/σ converges in distribution to N(0,1). The result is asymptotic, not an exact statement at finite n.',
      limit: 'A Cauchy population has no finite mean: its sample means do not satisfy the classical i.i.d. LLN or CLT. Keep n distinct from the replicate count B.'
    },
    adattamento: {
      title: 'Assessing model fit',
      blurb: 'Histograms, quantile plots, exact bands, grouped chi-square diagnostics and simulation-based p-values.',
      question: 'How can we detect a mismatch between a hypothesized model and observed data?',
      experiment: 'Compare empirical and theoretical distributions; examine the QQ plot and whether the chi-square cell-count assumptions are satisfied.',
      essential: 'Goodness-of-fit tests compare observed discrepancies with their distribution under a specified null model. A p-value refers to that null distribution, not to the probability that the null is true.',
      advanced: 'Estimating parameters from the data changes the reference distribution. Grouped chi-square approximations require careful expected-count grouping and appropriate degrees of freedom.',
      limit: 'A large p-value is not evidence that the proposed model is exactly correct. Bootstrap calibration must replicate the complete fitting procedure.'
    },
    stimatori: {
      title: 'Mean, median and maximum-likelihood estimators',
      blurb: 'Repeated sampling to compare bias, variability, efficiency and robustness for location estimators.',
      question: 'Which estimator best recovers a location parameter when the data have outliers?',
      experiment: 'Apply competing estimators to the same simulated samples, then compare their sampling distributions and mean squared errors.',
      essential: 'The mean squared error equals variance plus squared bias when the second moment is finite. Efficiency depends on the data-generating distribution and the loss function.',
      advanced: 'The influence function of the mean is unbounded, while the median can be more resistant to extreme observations under suitable regularity conditions.',
      limit: 'Robustness against outliers in the response does not imply resistance to high-leverage points in regression.'
    },
    fisher: {
      title: 'Likelihood and Fisher information',
      blurb: 'Log-likelihood, score, observed curvature, expected information and asymptotic inference across ten model families.',
      question: 'What does the local curvature of a likelihood function tell us about estimation?',
      experiment: 'Change the parameter and inspect the log-likelihood, score and information; then repeat the estimation on new samples.',
      essential: 'Likelihood considers the observed data fixed and compares parameter values. The score is the derivative of the log-likelihood, and expected Fisher information quantifies its variability under regularity assumptions.',
      advanced: 'Under regularity, E(U) = 0 and Var(U) = I(θ), with the information also equal to minus the expected second derivative. Such identities require differentiation under the integral sign.',
      limit: 'At a parameter boundary or in a nonregular model, standard information identities and Wald approximations can fail.'
    },
    intervalli: {
      title: 'Confidence intervals and coverage',
      blurb: 'Nominal, exact and empirical coverage for normal means, binomial proportions, Poisson rates and variances.',
      question: 'What does 95% confidence mean over repeated samples?',
      experiment: 'Draw many samples and measure the fraction of confidence intervals that contain the fixed population parameter.',
      essential: 'A frequentist 95% confidence procedure covers the fixed true parameter in 95% of repeated experiments under its assumptions. Individual intervals do not come with a frequentist 95% probability for that fixed parameter.',
      advanced: 'Wald, Wilson and exact discrete methods differ appreciably near parameter boundaries or at small n. Coverage should be evaluated under the actual sampling distribution.',
      limit: 'Nominal confidence does not guarantee exact finite-sample coverage. Avoid treating simulated Monte Carlo error as a property of the interval construction.'
    },
    test: {
      title: 'Hypothesis testing and power',
      blurb: 'Rejection regions, type-I errors, alternatives and statistical power in a Z-test.',
      question: 'How do significance level, effect size and sample size alter a test decision?',
      experiment: 'Fix a null and alternative, vary sample size and record the rejection frequency under each mechanism.',
      essential: 'The significance level bounds the null rejection probability, whereas power is the rejection probability under a particular alternative. These are properties of the procedure across repeated samples.',
      advanced: 'For a specified standardized effect, increasing n moves the distribution of the Z-statistic under the alternative while its null calibration remains fixed.',
      limit: 'A p-value is not the probability that the null hypothesis is true; a nonsignificant result is not proof of no effect.'
    },
    regressione: {
      title: 'Interactive linear regression',
      blurb: 'Drag observations, examine leverage and Cook’s distance, and distinguish confidence bands from prediction intervals.',
      question: 'Why can a single observation substantially change a fitted regression line?',
      experiment: 'Move an observation away from the center of the predictor distribution and compare the estimated line and uncertainty bands.',
      essential: 'Ordinary least squares minimizes squared residuals. Leverage measures geometric influence from the design matrix, while residual magnitude and leverage jointly affect influence.',
      advanced: 'Under a full-rank fixed design and homoskedastic independent errors, Cov(β̂ | X) = σ²(XᵀX)⁻¹. A future individual response is more uncertain than its conditional mean.',
      limit: 'Standard intervals require their stated error and design assumptions; a fitted line alone does not establish causality.'
    },
    'regressione-lp': {
      title: 'L1, L2 and Lp regression',
      blurb: 'Loss functions, outliers, efficiency and the trade-off between robustness and precision.',
      question: 'How does the loss function change the response to outliers?',
      experiment: 'Fit different losses to the same data and contaminate the response with unusually large errors.',
      essential: 'L2 minimizes the sum of squared residuals, whereas L1 minimizes absolute residuals. Their statistical efficiency and robustness depend on the error distribution.',
      advanced: 'For differentiable M-estimators, the asymptotic variance contains E[ψ²]/(E[ψ′])² under regularity. The L1 score is not differentiable at zero, and requires the appropriate separate argument.',
      limit: 'L1 regression is not automatically robust to high-leverage predictor contamination.'
    },
    glm: {
      title: 'Generalized linear models',
      blurb: 'Logistic and Poisson regression, likelihood-based fitting, separation and sampling uncertainty.',
      question: 'How do link functions connect linear predictors to non-Gaussian responses?',
      experiment: 'Fit a logistic or Poisson model, then repeat sampling to compare estimates and asymptotic approximations.',
      essential: 'A GLM specifies a response distribution, a linear predictor and a link between the expected response and that predictor. Logistic coefficients change log odds, not probabilities directly.',
      advanced: 'Iteratively reweighted least squares solves local weighted least-squares problems. With complete logistic separation, an unpenalized finite maximum-likelihood estimate need not exist.',
      limit: 'Small samples and model misspecification can invalidate usual Wald standard errors or chi-square approximations.'
    },
    arma: {
      title: 'ARMA time-series models',
      blurb: 'Simulation, empirical and theoretical ACF/PACF, stationarity and invertibility.',
      question: 'What features of serial dependence identify an AR or MA mechanism?',
      experiment: 'Generate a time series and compare empirical autocorrelations with those implied by its ARMA parameters.',
      essential: 'AR dependence comes from past values, while MA dependence comes from current and past shocks. Stationarity and invertibility impose conditions on characteristic roots.',
      advanced: 'A stationary AR(1), Xₜ = φXₜ₋₁ + εₜ, has autocorrelation ρ(h) = φʰ when |φ| < 1. The PACF vanishes beyond lag one in the population.',
      limit: 'Theoretical stationary ACF formulas cannot be used uncritically for unit-root or explosive processes.'
    },
    quantilica: {
      title: 'Quantile regression',
      blurb: 'Conditional quantiles, asymmetric check loss and robustness to outliers.',
      question: 'Why may the conditional mean fail to describe heterogeneous conditional distributions?',
      experiment: 'Fit several conditional quantile lines, vary the quantile level and drag an outlying point.',
      essential: 'Quantile regression minimizes the asymmetric check loss. The 0.5 quantile corresponds to median regression, which can behave differently from ordinary least squares.',
      advanced: 'Estimating multiple conditional quantiles reveals heteroskedasticity and shape changes. Quantile crossing may occur if levels are fitted independently.',
      limit: 'The fitted quantile is conditional on covariates and the chosen model class, not a guaranteed causal effect.'
    },
    penalizzata: {
      title: 'Ridge, lasso and elastic net',
      blurb: 'Regularization paths, coefficient shrinkage, sparsity and bias–variance compromise.',
      question: 'Why can adding bias improve predictive performance?',
      experiment: 'Increase the regularization penalty and compare the coefficient paths under correlated predictors.',
      essential: 'Ridge penalizes squared coefficients and generally retains nonzero estimates; lasso uses absolute coefficients and can set some exactly to zero. Elastic net combines both.',
      advanced: 'The loss normalization and penalty scaling must match when comparing solutions across implementations. Ridge with positive penalty adds strict convexity; lasso uniqueness requires further conditions.',
      limit: 'A selected variable is not automatically a statistically significant or causal predictor.'
    },
    spline: {
      title: 'Nonparametric regression and splines',
      blurb: 'Polynomial, spline and kernel smoothing; complexity, effective degrees of freedom and cross-validation.',
      question: 'How can a flexible curve fit the signal without fitting every fluctuation?',
      experiment: 'Change the basis size, smoothing penalty or bandwidth and compare estimated and generating curves.',
      essential: 'A smoother balances fidelity to observed data against complexity. Too little smoothing increases variability, while too much smoothing introduces bias.',
      advanced: 'For a linear smoother with hat matrix S, effective degrees of freedom are commonly tr(S); under independent homoskedastic errors the pointwise covariance involves SSᵀ.',
      limit: 'Cross-validation only chooses among the candidate smoothing procedures it evaluates.'
    },
    segmentata: {
      title: 'Segmented regression and change points',
      blurb: 'Piecewise-linear trends, unknown breakpoints, profile residual sums of squares and bootstrap tests.',
      question: 'When is a change in regression slope identifiable?',
      experiment: 'Simulate a slope change and compare the segmented fit with a straight line as the change weakens.',
      essential: 'A hinge term (x − ψ)₊ lets the slope change at ψ while preserving continuity. The breakpoint must be estimated along with regression coefficients.',
      advanced: 'When the slope-change parameter is zero, the breakpoint is not identified under the null. Standard regular Wald or chi-square approximations for ψ need not apply.',
      limit: 'A visually plausible change point is not by itself evidence of a statistically significant structural change.'
    },
    validazione: {
      title: 'Validation and overfitting',
      blurb: 'Training error, test error, cross-validation, hyperparameter selection and data leakage.',
      question: 'Why is training error a misleading estimate of future prediction error?',
      experiment: 'Compare correct training/validation/test separation with a procedure that selects a model using the test set.',
      essential: 'Training error is optimistic for a model selected on those same data. Cross-validation can guide model choice, while a truly untouched test set evaluates the selected procedure.',
      advanced: 'When folds have different sizes, pooled cross-validation error must weight each fold according to the number of held-out observations. Reusing a test set for tuning invalidates its independence.',
      limit: 'Even a flawless validation protocol cannot correct a fundamentally inadequate candidate model family.'
    },
    knn: {
      title: 'k-nearest neighbours',
      blurb: 'Local classification, decision boundaries, choosing k and feature scaling.',
      question: 'How does neighbourhood size affect bias and variability?',
      experiment: 'Vary k and the feature scales to see how the decision boundary and test error change.',
      essential: 'kNN estimates class probabilities from nearby labeled observations. Small k produces flexible boundaries; large k averages over a larger region.',
      advanced: 'Under suitable assumptions in fixed dimension, k → ∞ together with k/n → 0 underpins consistency. Scaling parameters must be learned from training data only.',
      limit: 'Distance becomes less informative in high dimensions; kNN estimates are not necessarily Bayes-optimal at finite n.'
    },
    alberi: {
      title: 'Decision trees, bagging and random forests',
      blurb: 'Recursive splits, bootstrap aggregation, out-of-bag error and randomized feature selection.',
      question: 'How can an ensemble of unstable trees predict more reliably?',
      experiment: 'Compare one tree, bagging and a random forest on the same simulated classification problem.',
      essential: 'An individual tree recursively partitions predictor space. Bagging averages bootstrap-fitted trees, and random forests additionally randomize feature candidates.',
      advanced: 'Ensemble variance reduction depends on the correlation among component predictions. Out-of-bag observations provide an internal assessment, subject to the sampling protocol.',
      limit: 'Large ensembles do not guarantee good calibration or protection against distribution shift.'
    },
    boost: {
      title: 'Gradient boosting',
      blurb: 'Sequential trees fitted to loss gradients, shrinkage, learning rate and early stopping.',
      question: 'Why does the next tree focus on mistakes made by earlier trees?',
      experiment: 'Advance boosting one tree at a time and monitor training, validation and test losses.',
      essential: 'Gradient boosting adds weak learners along directions that approximately reduce a differentiable loss. The learning rate controls each incremental update.',
      advanced: 'For logistic loss, the pseudo-residuals are calculated on the appropriate link scale. Early stopping must be selected on validation data, not retrospectively on the test set.',
      limit: 'An ever-decreasing training loss does not imply improving generalization.'
    },
    'reti-neurali': {
      title: 'Neural networks and backpropagation',
      blurb: 'Feedforward computation, gradients, initialization, learning rate and overfitting in a small network.',
      question: 'How does a network learn nonlinear decision boundaries?',
      experiment: 'Inspect the forward pass and gradients while varying hidden units, initialization and the learning rate.',
      essential: 'A feedforward neural network composes affine transformations and nonlinear activations. Backpropagation applies the chain rule to obtain gradients for optimization.',
      advanced: 'Optimization is generally nonconvex and can depend strongly on initialization. Validation performance and regularization matter more than minimizing training loss alone.',
      limit: 'A stable finite optimization trace is not a proof of finding a global minimum.'
    },
    pca: {
      title: 'Principal component analysis',
      blurb: 'Directions of maximal variance, eigenvalues, reconstruction and component stability.',
      question: 'Can many correlated variables be summarized by a few orthogonal directions?',
      experiment: 'Vary the covariance structure, inspect principal axes and measure reconstruction error using fewer components.',
      essential: 'PCA finds orthogonal directions that successively maximize sample variance. Retaining the first k components minimizes rank-k squared reconstruction error for centered data.',
      advanced: 'The Eckart–Young theorem characterizes the optimal low-rank approximation. Component signs are arbitrary, and nearly repeated eigenvalues undermine individual eigenvector stability.',
      limit: 'High explained variance does not necessarily preserve information relevant to predicting a separate response.'
    },
    clustering: {
      title: 'k-means and hierarchical clustering',
      blurb: 'Lloyd iterations, local minima, linkage criteria and comparison with generating groups.',
      question: 'Are clusters intrinsic groups or outcomes of a chosen algorithm?',
      experiment: 'Rerun k-means with different initial centers and compare the resulting partition with hierarchical methods.',
      essential: 'k-means minimizes within-cluster squared distances by alternating assignment and centroid updates. The algorithm can converge to different local optima.',
      advanced: 'Hierarchical linkage methods define different pairwise cluster dissimilarities, so dendrograms need not agree. Adjusted Rand indices compare partitions while correcting for chance.',
      limit: 'An algorithmic cluster is not automatically a population or a scientifically meaningful subgroup.'
    },
    dbscan: {
      title: 'DBSCAN and clustering comparisons',
      blurb: 'Density-based clusters, core and border points, noise, ε and minimum points.',
      question: 'Can clustering recover curved groups without forcing spherical shapes?',
      experiment: 'Vary neighbourhood radius and minimum density, then compare DBSCAN with k-means and Ward clustering.',
      essential: 'DBSCAN uses density connectivity to form clusters and identify noise. Core points have sufficiently many neighbours in an ε-neighbourhood under the stated counting convention.',
      advanced: 'Border points can be assigned ambiguously when they connect to multiple core components; implementation tie-breaking can affect their label.',
      limit: 'No single ε and minPts setting is optimal for all heterogeneous densities.'
    },
    moran: {
      title: 'Spatial autocorrelation and Moran’s I',
      blurb: 'Spatial weights, spatial lags, Moran scatterplots and randomization-based tests.',
      question: 'Do nearby locations have more similar measurements than chance would suggest?',
      experiment: 'Change spatial arrangements or neighbourhood definitions and follow the change in global Moran’s I.',
      essential: 'Moran’s I measures a weighted cross-product of centered observations. Its interpretation requires an explicit spatial-weight matrix and normalization.',
      advanced: 'Under uniform random permutation of nonconstant observations with zero-diagonal weights, E(I) = −1/(n − 1). A reference distribution for a test depends on the null randomization scheme.',
      limit: 'Positive spatial correlation does not establish a causal interaction between locations.'
    },
    lisa: {
      title: 'Local spatial autocorrelation and hotspots',
      blurb: 'Local Moran statistics, HH/LL/HL/LH quadrants and the modifiable areal unit problem.',
      question: 'Is a high-valued location surrounded by low-valued neighbours a hotspot?',
      experiment: 'Edit neighbouring observations and inspect the local classification and its dependence on spatial weights.',
      essential: 'HH and LL indicate similar local signs; HL and LH indicate local disagreement. These are descriptive classes, not significance tests.',
      advanced: 'Inference for local spatial association requires a defined null distribution and a multiple-testing strategy. Aggregation changes both measured values and the spatial-weight structure.',
      limit: 'A visually striking local class is not automatically a statistically significant hotspot.'
    },
    'processi-puntuali': {
      title: 'Spatial point processes',
      blurb: 'Poisson, clustered and inhibitive point patterns; intensity, Ripley’s K and CSR envelopes.',
      question: 'Does a pattern of event locations look clustered or inhibited relative to complete spatial randomness?',
      experiment: 'Add or move points and compare the estimated intensity and summary functions under alternative point mechanisms.',
      essential: 'A homogeneous Poisson point process has independent counts in disjoint regions and constant intensity. Ripley’s K summarizes second-order neighbourhood counts.',
      advanced: 'Edge corrections and the simulation protocol matter when comparing observed curves with a CSR reference. Pointwise envelopes are not automatically global tests.',
      limit: 'A dense region caused by a changing intensity is not necessarily evidence of second-order interaction.'
    },
    variogrammi: {
      title: 'Variograms and random fields',
      blurb: 'Empirical semivariograms, covariance models, nugget, range and anisotropy.',
      question: 'How does similarity between measurements vary with their spatial separation?',
      experiment: 'Modify sensor locations and compare binned squared differences with a theoretical semivariogram.',
      essential: 'Under intrinsic stationarity, the semivariogram is γ(h) = ½ Var[Z(s+h) − Z(s)]. The empirical estimator averages squared differences of observed pairs within lag classes.',
      advanced: 'For second-order stationarity, γ(h) = C(0) − C(h). Nugget and range control short-distance discontinuity and the decay of dependence.',
      limit: 'A fitted curve is not guaranteed to be a valid covariance structure without appropriate positive-definiteness constraints.'
    },
    kriging: {
      title: 'Kriging and sensor design',
      blurb: 'Spatial prediction, simple and ordinary kriging, uncertainty and comparison with inverse-distance weighting.',
      question: 'Where should another sensor be placed to reduce predictive uncertainty?',
      experiment: 'Move or add sensors and compare kriging predictions and model-based prediction variance.',
      essential: 'Kriging uses a covariance model to construct an optimal linear predictor under specified assumptions. Ordinary kriging imposes an unbiasedness constraint for an unknown constant mean.',
      advanced: 'With a fixed correct covariance model, adding observations cannot increase the optimal linear prediction variance. Inverse-distance weighting does not provide the same model-based uncertainty by itself.',
      limit: 'Kriging variance describes uncertainty conditional on the assumed model, not guaranteed error on a particular realized field.'
    },
    'regressione-spaziale': {
      title: 'Spatial regression: SAR and SEM',
      blurb: 'Spatial dependence in outcomes or errors, spatial multipliers and geographic cross-validation.',
      question: 'What changes when regression residuals depend on neighbouring locations?',
      experiment: 'Compare ordinary least squares and spatial-model interpretations while changing the dependence and neighbourhood weights.',
      essential: 'Spatial-autoregressive response models include a spatial lag of the outcome. Spatial-error models instead put dependence in the disturbance structure.',
      advanced: 'For the SAR mechanism, y = (I − ρW)⁻¹(Xβ + ε) where the inverse exists. The log-likelihood includes the spatial log-Jacobian, and coefficient effects propagate through the multiplier.',
      limit: 'Random cross-validation and spatial block cross-validation answer different prediction questions; causal effects require further assumptions.'
    }
  }
};
