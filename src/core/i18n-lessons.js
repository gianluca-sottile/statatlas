/* StatAtlas English learning texts: reviewed scientific examples and practice.
 * Numerical claims mirror the corresponding Italian teaching materials.
 * Original Italian lessons are left intact and available via IT. */
(function () {
'use strict'; var SA=window.SA||(window.SA={});
var L={
 distribuzioni:{
 example:'For X distributed Gamma(shape=2, rate=1), E(X)=2 and Var(X)=2. For an interval (1,3], P(1<X<=3)=F(3)-F(1)=2e^(-1)-4e^(-3), approximately 0.5366. Select a=1 and b=3 and compare the population probability with the simulated proportion.',
 exercises:[
 ['Show that an exponential waiting time is memoryless: P(X>s+t | X>s)=P(X>t).','The exponential survival is exp(-lambda*x); dividing exp(-lambda*(s+t)) by exp(-lambda*s) yields exp(-lambda*t).'],
 ['If U is uniform on (0,1), what is the distribution of -log(U)/lambda?','It is exponential with rate lambda because P(-log(U)/lambda>x)=exp(-lambda*x).'],
 ['For n=1000, compute the 95% DKW band radius and the size needed to halve it.','sqrt(log(40)/(2*1000)) is about 0.0429. Since the bound scales with 1/sqrt(n), four times as many observations are needed.']]},
 bivariata:{
 example:'For a standardized bivariate normal with rho=0.6, conditioning on X=1 gives Y|X=1 distributed N(mean=0.6, variance=1-0.36=0.64), hence standard deviation 0.8. Knowledge of X reduces conditional variance by 36%, the squared correlation.',
 exercises:[
 ['Show Cov(X,X²)=0 for X distributed N(0,1). Are X and X² independent?','E(X³)=E(X)=0, so covariance is zero. They are dependent because X² is determined by X.'],
 ['For standardized bivariate normal variables with rho=0.8, compute Var(Y|X=2).','Var(Y|X)=1-rho²=0.36, independent of the conditioning value.'],
 ['Why are estimates from an extremely narrow conditioning band unstable?','They use fewer observations, so sampling variability increases even though local approximation bias may decrease.']]},
 simulazione:{
 example:'For I=integral from 0 to 1 of x² dx=1/3, direct Monte Carlo uses U² with variance 1/5-1/9=4/45 (about 0.089). Hit-or-miss uses a Bernoulli variable with variance I(1-I)=2/9 (about 0.222). Its variance is 2.5 times as large per draw.',
 exercises:[
 ['Derive the Weibull(shape k, scale lambda) quantile function.','F(x)=1-exp(-(x/lambda)^k), so F inverse(u)=lambda[-log(1-u)]^(1/k).'],
 ['Why may pairing f(U) and f(1-U) reduce variance for an increasing f?','The transformed values are negatively correlated, reducing variance of their paired average compared with two independent draws.'],
 ['How many hit-or-miss draws are needed for SE=0.001 when I=1/3?','Since Var(Z)=2/9, M=(2/9)/10^(-6), approximately 222,222.']]},
 'lgn-tcl':{
 example:'For an exponential population with unit rate and skewness gamma=2, the skewness of a sample mean is 2/sqrt(n). At n=10 it is about 0.63; at n=100 it is 0.20; attaining 0.10 requires n=400.',
 exercises:[
 ['Use the CLT to assess P(Xbar>0.5) for Bernoulli(0.35) data and n=30.','The normal SE is sqrt(0.35*0.65/30)=0.087; z=(0.5-0.35)/0.087 about 1.72, yielding roughly 0.043 without continuity correction.'],
 ['Why does the mean of n i.i.d. standard Cauchy variables remain Cauchy?','The characteristic function is exp(-|t|); [exp(-|t|/n)]^n=exp(-|t|), establishing stability.'],
 ['Evaluate the illustrative Berry-Esseen bound for a uniform population and n=10.','Using the cited constant 0.4748 and standardized third absolute moment about 1.299 gives 0.4748*1.299/sqrt(10), around 0.195.']]},
 adattamento:{
 example:'For 200 observations generated from Gamma(2,1) but assessed using a fitted normal, consider a chi-square statistic near 62 on 17 degrees of freedom. Compare it with the chi-square reference and inspect the QQ plot: the observed right tail is much longer than the fitted normal tail.',
 exercises:[
 ['With k=10 classes and two regularly estimated parameters, what are the chi-square degrees of freedom?','Under the appropriate multinomial estimation assumptions, k-1-2=7. With probabilities fully specified, k-1=9.'],
 ['What can an S-shaped normal QQ plot indicate?','A systematic discrepancy in tail weight or distributional shape, rather than sampling noise alone.'],
 ['Why may a nearly correct model be rejected when n reaches 2000?','Under a fixed alternative, test power increases with sample size; statistical significance need not imply practical importance.']]},
 stimatori:{
 example:'For N(0,1) samples of size n=20, Var(Xbar)=1/20=0.05. The large-sample median variance is about pi/40=0.0785. The median’s relative efficiency is about 2/pi=0.64, so roughly 31 observations are needed to match the mean’s precision with 20.',
 exercises:[
 ['Compare the asymptotic variance of median and mean for Laplace data with scale b=1.','The median has asymptotic variance b²/n; the mean has variance 2b²/n, so the median has twice the asymptotic efficiency.'],
 ['Why does increasing sample size not stabilize the mean of Cauchy data?','Cauchy stability gives the sample mean the same Cauchy distribution for every n.'],
 ['Propose a robust but efficient location estimate for nearly normal data with isolated outliers.','One option is a carefully tuned Huber M-estimator; assess its contamination assumptions and efficiency.']]},
 fisher:{
 example:'For Exp(rate lambda=1) and n=20, the MLE is 1/Xbar. One-observation Fisher information is 1/lambda², giving an asymptotic variance scale 1/20=0.05. The MLE is biased: E(lambda-hat)=20/19 and its exact variance is 400/(19²*18), about 0.0616; the usual unbiased-estimator Cramer-Rao bound does not apply directly to this biased MLE.',
 exercises:[
 ['Compute Bernoulli Fisher information for p and the n=50 Cramer-Rao bound at p=0.3.','I_1(p)=1/[p(1-p)], so the bound for an unbiased p estimator is p(1-p)/n=0.0042.'],
 ['Why is Uniform(0,theta) a nonregular likelihood model?','The sampling support depends on theta, preventing standard differentiation-under-the-integral arguments.'],
 ['If the log-likelihood difference l(theta-hat)-l(theta0)=2.5, does an LRT reject at 5%?','The LRT statistic is 5. Under regular one-parameter chi-square asymptotics, 5 exceeds 3.84; reject.']]},
 intervalli:{
 example:'For a binomial proportion with p=0.1 and n=20, P(X=0)=0.9^20 about 0.12. Whenever X=0, the naive Wald interval has zero width and misses p. This already costs about 12 percentage points of coverage; the exact coverage for this scenario is about 87.6%, not 95%.',
 exercises:[
 ['Compute a 95% Z interval when Xbar=10.4, known sigma=2 and n=25.','10.4 +/- 1.96*(2/5)=10.4 +/- 0.784, giving [9.616,11.184].'],
 ['With zero Poisson events over ten unit exposures, what is the upper Garwood 95% bound for the rate?','For a two-sided 95% interval, chi-square quantile qchisq(0.975,2)/(2*10) approximately 0.369.'],
 ['Why are t intervals usually wider than Z intervals at the same confidence level?','The t critical value exceeds the normal critical value at finite degrees of freedom because variance is estimated.']]},
 test:{
 example:'For standardized effect delta=0.5, two-sided alpha=0.05 and n=20, the mean alternative Z shift is delta*sqrt(n)=2.236. The approximate power is Phi(2.236-1.96)=0.609. Targeting power 0.80 gives n approximately [(1.96+0.842)/0.5]²=32.',
 exercises:[
 ['Calculate one-sided Z power for delta=0.3, n=50 and alpha=0.05.','The alternative mean shift is 0.3*sqrt(50)=2.121; power about Phi(2.121-1.645)=0.683.'],
 ['Approximate required n for 90% power at delta=0.4, two-sided alpha=0.05.','n about [(1.96+1.282)/0.4]²=65.7, so round up to 66 under the normal approximation.'],
 ['Why is a continuous-null p-value uniform under H0?','The probability integral transform applied to the continuous null reference distribution yields Uniform(0,1).']]},
 regressione:{
 example:'For n=12 evenly spaced predictor values between 0 and 10, Sxx is about 99.3. If sigma=1.5, the slope standard error is 1.5/sqrt(99.3), about 0.151. Doubling the predictor range multiplies Sxx by four and halves the slope uncertainty.',
 exercises:[
 ['Show that the OLS fitted line passes through (Xbar,Ybar).','The normal equation for the intercept gives beta0-hat=Ybar-beta1-hat*Xbar.'],
 ['Why are residuals at high-leverage points often relatively small?','Such observations influence the fitted line strongly; Var(e_i)=sigma²(1-h_i) under homoskedastic OLS.'],
 ['At x0=Xbar with n=20 and estimated sigma=1.2, approximate the 95% prediction interval width.','Full width is 2*t_(0.975,18)*1.2*sqrt(1+1/20), about 5.17.']]},
 'regressione-lp':{
 example:'In a contaminated normal error distribution (90% scale 1, 10% scale 10), variance is 0.9+0.1*100=10.9 while the density at zero remains near 0.363. The asymptotic efficiency ratio 4*f(0)²*10.9 is about 5.7, favoring median-type estimation in this scenario.',
 exercises:[
 ['Under what error distribution is L1 estimation a maximum-likelihood procedure?','For Laplace errors, log likelihood differs by a constant from minus the sum of absolute residuals.'],
 ['Compute the relative asymptotic efficiency of L1 versus L2 under normality.','4*f(0)²*sigma²=2/pi, approximately 0.637.'],
 ['Why do IRLS weights for an Lp loss scale with |residual|^(p-2)?','The derivative of the objective is proportional to sum |r_i|^(p-2) r_i x_i; weighted least-squares normal equations match this expression.']]},
 glm:{
 example:'For a logistic coefficient beta1=1.2, exp(1.2) is about 3.32. Each unit increase in x multiplies the odds by roughly 3.3, conditional on the other predictors. Small-sample complete separation can lead to divergent ordinary MLE coefficients.',
 exercises:[
 ['For logistic beta1=0.7, by what factor do the odds change for a two-unit increase in x?','The odds ratio is exp(1.4), approximately 4.06.'],
 ['Give the IRLS weight and working response for Poisson regression with log link.','w_i=mu_i=exp(eta_i); z_i=eta_i+(y_i-mu_i)/mu_i.'],
 ['When is complete separation possible with a single logistic predictor?','When a threshold partitions all response-1 and response-0 predictor values (in one direction or the other).']]},
 arma:{
 example:'For stationary AR(1) with phi=0.8 and innovation variance one, gamma(0)=1/(1-0.64)=2.78, rho(h)=0.8^h and rho(5)=0.328. The theoretical PACF cuts off after lag one. The correlation half-life is log(0.5)/log(0.8), about 3.1 periods.',
 exercises:[
 ['Is AR(2) with phi1=0.5 and phi2=0.6 stationary?','No; for this pair phi1+phi2=1.1 violates the AR(2) stationarity condition.'],
 ['Calculate lag-one ACF for MA(1) with theta=0.7.','rho(1)=theta/(1+theta²)=0.7/1.49, about 0.470.'],
 ['Why do MA(1) coefficients theta=2 and theta=0.5 have the same ACF?','theta/(1+theta²) is invariant under replacing theta by 1/theta; both give 0.4.']]},
 quantilica:{
 example:'Consider Y=2+0.6x+(0.3+0.25x)epsilon with standard-normal epsilon. The conditional tau quantile has slope 0.6+0.25*z_tau: about 0.28 at tau=0.1, 0.60 at tau=0.5 and 0.92 at tau=0.9. The spread in slopes reflects heteroskedasticity.',
 exercises:[
 ['Why can an estimated median-regression line pass through several observed points?','The piecewise linear L1 optimization has basic solutions determined by active residual constraints; in a generic two-parameter problem, two fitted residuals can be zero.'],
 ['Under homoskedastic location-shift errors, how are conditional-quantile slopes related?','They are parallel: quantile levels shift the intercept but do not alter the predictor slopes.'],
 ['How does a strictly increasing log transformation affect a conditional median?','Conditional quantiles transform monotonically: median(log Y|X)=log median(Y|X) when Y>0; the result need not be linear in x.']]},
 penalizzata:{
 example:'With orthonormal predictors and OLS coefficients (1.6,0.7), the lasso under the stated loss convention at lambda=0.8 soft-thresholds to (0.8,0). Ridge with lambda=1 yields (0.8,0.35), shrinking both without selecting exact zeros.',
 exercises:[
 ['Write the ridge solution for orthonormal predictors as a function of the OLS estimate.','Under objective (1/2)||y-Xb||²+(lambda/2)||b||² with X-transpose-X=I, b_ridge=b_OLS/(1+lambda).'],
 ['Why does ridge shrinkage rarely give coefficients exactly zero?','The smooth quadratic penalty has no coordinate-axis corners, unlike L1.'],
 ['How may lasso and elastic net differ for nearly duplicate predictors?','Lasso may select one arbitrarily; the L2 component of elastic net encourages grouping and stabilizes selection.']]},
 spline:{
 example:'For a regression spline with eight basis terms and projection matrix S, tr(S)=8. Under independent noise with sigma=0.3 and n=100, mean fitted variance is sigma²*8/n=0.0072. Doubling the number of basis functions doubles that variance term.',
 exercises:[
 ['Why is tr(S) equal to the number of linearly independent regression-spline basis terms?','With a full-rank unpenalized basis, S is an idempotent projection and its trace equals its rank.'],
 ['What happens to a second-difference penalized P-spline as lambda grows very large?','Curvature differences are suppressed and the fit tends toward the unpenalized linear null space of the penalty.'],
 ['Why can cross-validation estimate prediction error minus a constant noise term?','For independent validation noise, expected squared prediction loss differs from squared signal error by the irreducible noise variance.']]},
 segmentata:{
 example:'With slope beta1=0.5, slope change delta=1.2 and breakpoint psi=6, the slope changes from 0.5 to 1.7. A weak delta makes the breakpoint estimate unstable; at delta=0 the model mean no longer identifies psi.',
 exercises:[
 ['Why is a single-breakpoint regression linear in the coefficients when psi is fixed?','The hinge (x-psi)+ is then a known design column.'],
 ['Under delta=0, how does the expected RSS profile depend on psi?','At the population model level the mean is invariant to psi; sample RSS still fluctuates, making psi unidentified under the null.'],
 ['Why restrict candidate breakpoints away from sample endpoints?','Sufficient observations on both sides are needed to estimate the two slopes reliably.']]},
 validazione:{
 example:'For a noisy sinusoid with sigma=0.3, n=60 and degree-12 polynomial fitting, training error can fall below the irreducible variance sigma²=0.09 while independent test error becomes enormous near domain boundaries. Training-fold CV often selects substantially lower degrees; choosing degree using the test set makes the reported test error optimistically biased.',
 exercises:[
 ['Why does minimum training RSS not increase when polynomial degree increases?','Polynomial model spaces are nested: higher degree can reproduce the previous optimum by setting the new coefficient to zero.'],
 ['For a fixed fitted model, why is independent test error an unbiased estimate of conditional predictive risk?','Test observations are drawn independently from the target deployment distribution and were not used for fitting or selection.'],
 ['What trade-off distinguishes leave-one-out CV from coarser K-fold CV?','LOOCV uses almost all observations for each fit but may have higher variance and greater computational cost than fewer folds.']]},
 knn:{
 example:'In a balanced linear Gaussian classification problem with standardized separation delta=2, Bayes error is Phi(-1), about 0.159. One-neighbor kNN may fit training perfectly while giving test error about 0.235; using a moderate k can reduce variance and bring test error closer to 0.175.',
 exercises:[
 ['Why can kNN with k=n-1 predict nearly the same class everywhere?','Each leave-one-out neighborhood contains nearly the whole training sample, so the global class majority dominates.'],
 ['Why is the Bayes boundary unaffected by multiplying an irrelevant feature by ten?','The likelihood ratio for the class does not depend on the irrelevant feature; Euclidean kNN, however, can be distorted by its scale.'],
 ['Why is leave-one-out evaluation especially cheap for a fitted kNN distance matrix?','Nearest-neighbor distances can be reused after excluding each observation itself; no parametric model needs refitting.']]},
 alberi:{
 example:'For circular classes with n=200, noise and three irrelevant predictors, a deep single tree may have test error around 0.22. Bagging 100 trees can lower this toward 0.18; random forests with reduced mtry may further decorrelate trees and improve aggregation, depending on the data.',
 exercises:[
 ['Why must an accepted CART split have positive impurity reduction?','The split criterion explicitly requires weighted child impurity to decrease relative to the parent node.'],
 ['What fraction of training observations is out of one size-n bootstrap sample, approximately?','(1-1/n)^n tends to exp(-1), approximately 36.8%.'],
 ['Why might mtry=1 perform poorly with many irrelevant variables?','Too few informative variables are proposed at a split, introducing bias that may outweigh decorrelation gains.']]},
 boost:{
 example:'With squared-error loss, y=(1,2,4,5) and initial F0=3, residuals are (-2,-1,1,2). A stump separating first from last two observations has leaf values -1.5 and 1.5. At learning rate 0.1 the fitted values become 2.85 and 3.15.',
 exercises:[
 ['Why is the logistic-loss pseudo-residual y-expit(F)?','For log(1+exp(F))-yF, the derivative with respect to F equals expit(F)-y.'],
 ['In the example, what happens at learning rate 0.2?','The fitted values move to 2.7 for the first group and 3.3 for the second.'],
 ['Why not pick the tree count by minimizing final test loss?','Doing so uses the test for tuning and biases the reported test performance optimistically.'],
 ['If learning rate is halved with tree count fixed, what can we conclude?','Each step is smaller, but the ultimate comparison depends on refitted residuals and cannot be inferred by simply halving the final predictions.']]},
 pca:{
 example:'With covariance eigenvalues lambda1=4 and lambda2=1, PC1 explains 4/5=80% of variance. For n=80, a simple large-sample approximation gives E[sin²(angle)] about 4/[(4-1)²*80]=0.0056. If lambda1 and lambda2 coincide, the individual principal direction is not identifiable.',
 exercises:[
 ['Why does the sum of PCA eigenvalues equal total marginal variance?','The covariance trace equals both the sum of diagonal variances and the sum of eigenvalues.'],
 ['Why are different principal-component scores uncorrelated?','Eigenvectors diagonalize the covariance matrix, giving a diagonal score covariance.'],
 ['How does correlation-PCA change if one original variable is multiplied by ten?','It does not, provided that standardized correlation is recomputed; covariance-PCA generally does change.']]},
 clustering:{
 example:'With three separated spherical populations and k=3, the best of several k-means starts can achieve ARI near 0.96, while unlucky starts may have much larger within-cluster sum of squares. Elongated or strongly overlapping populations defeat the spherical-cluster assumption, even though k-means still returns k groups.',
 exercises:[
 ['Why does the k-means centroid-update step not increase WCSS?','The sample mean is the minimizer of within-cluster squared distance with assignments held fixed.'],
 ['Can globally minimum WCSS increase when the number of clusters increases?','No. A k+1 cluster solution can emulate a k solution by splitting a cluster without increasing within-cluster SSE.'],
 ['Why does relabeling clusters leave the adjusted Rand index unchanged?','ARI depends on pairwise co-membership counts, not the numerical names assigned to clusters.']]},
 dbscan:{
 example:'For two interlocking moons plus ten isolated observations, epsilon=0.2 and minPts=5 may recover both moons with ARI about 0.99 and label roughly eight outliers as noise. Global distance-to-centroid methods cut the moons incorrectly. A fixed epsilon does not behave identically if point density or sample size changes.',
 exercises:[
 ['Why can a core point not be labeled as noise under standard DBSCAN?','By definition it has a sufficiently populated epsilon-neighborhood and initiates or joins a density-connected cluster.'],
 ['What happens when minPts=1?','Every observation is a core point, and DBSCAN reduces to connected components of the epsilon-neighborhood graph.'],
 ['Why can border-point assignment change when observations are reordered?','A border point can be reachable from multiple core components; the implementation may assign it to the first visited cluster.']]},
 'reti-neurali':{
 example:'For a noisy XOR problem with four hidden tanh neurons, learning rate 0.5 and 2000 epochs, training loss may fall from about 0.80 to 0.17 while validation accuracy reaches about 0.88. With fewer hidden neurons, some initializations get stuck; an excessive learning rate can cause divergence.',
 exercises:[
 ['Why do identical zero initial hidden-layer weights prevent useful symmetry breaking?','All identical hidden units receive the same gradient and remain indistinguishable.'],
 ['How many trainable parameters does a fully connected 2-H-1 network with biases have?','2H incoming weights, H hidden biases, H output weights and one output bias: 4H+1.'],
 ['Why evaluate binary cross-entropy using the logit rather than an already-rounded probability?','Stable log-sum-exp formulas avoid numerical overflow and log(0) under extreme logits.']]},
 moran:{
 example:'Consider a 4x4 grid with value -1 in the first two columns and +1 in the others. With binary rook neighbors, same-sign adjacent cells contribute positively to Moran I and pairs across the boundary contribute negatively. Under a permutation null, E(I)=-1/(16-1)=-1/15, not zero.',
 exercises:[
 ['Why does the Moran I formula include n/S0?','It normalizes the weighted cross-products relative to the sample sum of squared deviations and the total weight S0.'],
 ['Under uniform permutation for n=16, what is the expectation of Moran I?','E(I)=-1/(n-1)=-1/15 under the classical permutation setup with no self-links.'],
 ['Can an east-west mean trend create a positive Moran I with independent errors?','Yes. Geographic structure in the mean can create spatial similarity in the observed variable without correlated disturbances.'],
 ['With 199 permutations and the usual +1 correction, what is the smallest Monte Carlo p-value?','1/(199+1)=0.005.']]},
 lisa:{
 example:'A cell above the global mean surrounded by above-mean neighbors is High-High (HH); with below-mean neighbors it is High-Low (HL). Quadrant labels do not imply statistical significance. With 64 local tests, multiplicity needs explicit treatment.',
 exercises:[
 ['A cell has positive standardized value and negative spatial lag. Which quadrant is it in?','High-Low (HL).'],
 ['For B=199 random permutations, what is the smallest corrected Monte Carlo p-value?','1/(B+1)=0.005.'],
 ['Why can two aggregations into 16 geographic areas produce different Moran I values?','Areal-unit boundaries modify aggregated values and the spatial weight matrix W (MAUP).'],
 ['Why do HH regions not establish causality?','Local association is observational and may arise from trends, common causes, or the chosen spatial units.']]},
 'processi-puntuali':{
 example:'With n=100 events in a unit square and r=0.125, homogeneous Poisson theory gives K(r)=pi*(0.125)^2, about 0.0491. Empirical K fluctuates. A pointwise 95% envelope exceeded at one radius is not a global 5% test across many radii; a global maximum-deviation statistic must be calibrated.',
 exercises:[
 ['For intensity lambda=100 in the unit square, what is E(N) under a homogeneous Poisson process?','Area is one, so E(N)=lambda*area=100.'],
 ['What is the CSR reference for K(0.1)?','pi*(0.1)^2, approximately 0.0314.'],
 ['Does exceeding a pointwise 95% envelope at one radius constitute a global 5% rejection?','Not automatically. Multiple radii are inspected; a simultaneous or global-envelope calibration is required.'],
 ['Does a spatially varying Poisson intensity imply interaction between events?','No. Inhomogeneous Poisson events can remain conditionally independent.'],
 ['Why does estimating K require boundary correction?','Pairs whose partner would lie outside the observation window cannot be observed, biasing naive pair counts.']]},
 variogrammi:{
 example:'For exponential covariance with partial sill sigma²=1, range parameter phi=0.25 and nugget tau²=0.12, semivariance at positive separation h=0.25 is 0.12+1*(1-exp(-1)), about 0.7521. An empirical estimate from one realization need not match it.',
 exercises:[
 ['With sigma²=2, phi=0.2 and tau²=0.3, calculate exponential semivariance at separation h=0.2.','For distinct sites, gamma=0.3+2*(1-exp(-1)), approximately 1.5642.'],
 ['When is an empirical distance-bin variogram undefined?','When no pairs fall within that distance class, or when the statistic otherwise lacks sufficient valid observations.'],
 ['Does increasing measurement nugget necessarily make the simulated latent field less smooth?','No. A measurement nugget affects observed measurement noise; smoothness of the latent spatial process is separate.'],
 ['Does an anisotropic covariance yield identical directional variograms?','Not generally: dependence may decay at different rates in different spatial directions.'],
 ['What is lost by using too many variogram bins with only 24 sensors?','Fewer pairs per bin yield noisy and occasionally empty estimates.']]},
 kriging:{
 example:'With latent variance 1, measurement nugget 0.25 and covariance with one observed sensor 0.6, simple kriging weight is 0.6/(1+0.25)=0.48 and error variance is 1-0.6²/1.25=0.712. If the sensor reports 2 and known mean is zero, the prediction is 0.96. Ordinary kriging with one sensor instead imposes weight one and has a different variance.',
 exercises:[
 ['Why need latent-process kriging not interpolate noisy observations exactly?','Measurement error (positive nugget) means the observed signal includes noise beyond the latent field being predicted.'],
 ['What unbiasedness constraint defines ordinary kriging with unknown constant mean?','Kriging weights sum to one, preserving any unknown constant mean.'],
 ['Can adding a sensor worsen realized RMSE on one simulated field?','Yes. Optimal model-based prediction variance is nonincreasing, but realized error in a particular draw can increase.'],
 ['Why is there no intrinsic model-based kriging variance for IDW?','Inverse-distance weights do not specify a stochastic covariance model from which such variance follows.'],
 ['Why compare the expectation of RMSE squared with mean prediction variance?','Variance represents expected squared prediction error, not expected square-root error; Jensen’s inequality distinguishes them.']]},
 'regressione-spaziale':{
 example:'For a row-standardized spatial weights matrix, beta=1 and SAR rho=0.5, the average total marginal impact is beta/(1-rho)=2. Average direct impact depends on the trace of (I-rho W)^(-1)/n; the difference gives average indirect impact. In SEM, dependence instead enters the disturbance.',
 exercises:[
 ['For row-standardized W, rho=0.5 and beta=1.2, what is the average total SAR impact?','beta/(1-rho)=1.2/0.5=2.4, assuming the multiplier exists.'],
 ['Why is X also transformed in an SEM profile likelihood?','Premultiplying the regression equation by (I-lambda W) transforms both the response and design.'],
 ['What does rho=0 imply in a spatial-lag SAR model?','The spatial feedback term vanishes; the response equation reduces to the baseline regression conditional on other assumptions.'],
 ['Can random CV ever be preferable to spatial-block CV?','Yes, when deployment predicts held-out points drawn within the same represented spatial distribution and the validation target justifies it.'],
 ['Why can SAR produce indirect impacts with a single covariate?','The inverse multiplier (I-rho W)^(-1) propagates a local change through the spatial network.']]}
};
SA.englishLessons=L;
})();
