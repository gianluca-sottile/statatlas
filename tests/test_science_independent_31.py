#!/usr/bin/env python3
"""31 independent numerical/theorem checks for StatAtlas 2.1.

Does NOT import the application or its JavaScript routines. A green result
supports the specified identity only; it is not a formal proof audit or a
validation of every statement of the laboratory.
Requires NumPy and SciPy; it does not require R or a running browser.
"""
from itertools import permutations
from math import exp, pi, sqrt
import numpy as np
from numpy.testing import assert_allclose
from scipy.stats import binom, norm, t

RESULTS = []

def case(number, topic, assumption, fn):
    fn()
    RESULTS.append((number, topic, assumption))
    print(f"OK {number:02d} {topic} | {assumption}")

# 01: discrete CDF and interval probability (endpoint convention).
def t01():
    p = np.array([.15, .25, .60])
    F = np.cumsum(p)
    assert_allclose(F[2]-F[0], p[1:].sum())
    assert_allclose(F[0], p[0])
case(1, "Distribuzioni", "probabilita' discrete / inclusione degli estremi", t01)

# 02: Gaussian conditional variance is a Schur complement.
def t02():
    sx,sy,rho=2.,3.,.6
    C=np.array([[sx*sx,rho*sx*sy],[rho*sx*sy,sy*sy]])
    assert_allclose(C[1,1]-C[1,0]**2/C[0,0],sy**2*(1-rho**2))
    assert np.linalg.eigvalsh(C).min()>0
case(2, "Bivariata", "formula condizionata sotto normalita'", t02)

# 03: generalized inverse and Rao-Blackwell variance decomposition.
def t03():
    u=(np.arange(10000)+.5)/10000
    x=np.searchsorted(np.cumsum([.3,.7]),u,side='left')
    assert_allclose([np.mean(x==0),np.mean(x==1)],[.3,.7])
    assert_allclose(.25,1/6+1/12)
case(3, "Simulazione", "inversione discreta e Rao-Blackwell", t03)

# 04: the Cauchy mean is not stabilized; characteristic function unchanged.
def t04():
    for n in (2,5,40):
        for z in (.25,1.5):
            assert_allclose(np.exp(-n*abs(z/n)),np.exp(-abs(z)))
    # In contrast, for iid normals, the normalized sample mean has the
    # standard normal characteristic function for every n (not just asymptotically).
    z=.6
    for n in (2,5,40):
        one=np.exp(-(z/sqrt(n))**2/2)
        assert_allclose(one**n,np.exp(-z*z/2))
case(4, "LGN/TCL", "non applicabilita' delle medie Cauchy", t04)

# 05: expectation of Pearson chi-squared for a known multinomial null.
def t05():
    p=np.array([.2,.3,.5]); n=40
    expected=np.sum(n*p*(1-p)/(n*p))
    assert_allclose(expected,len(p)-1)
case(5, "Adattamento", "H0 multinomiale, probabilita' note", t05)

# 06: finite MSE decomposition.
def t06():
    v=np.array([0.,2.,4.]); w=np.array([.25,.5,.25]); theta=1.
    mean=w@v; var=w@((v-mean)**2); mse=w@((v-theta)**2)
    assert_allclose(mse,var+(mean-theta)**2)
case(6, "Stimatori", "identita' MSE con secondo momento finito", t06)

# 07: Bartlett identity for Bernoulli; fixed support p in (0,1).
def t07():
    p=.37
    scores=np.array([-1/(1-p),1/p]); second=np.array([-1/(1-p)**2,-1/p**2]); probs=np.array([1-p,p])
    assert_allclose(probs@scores,0.,atol=1e-14)
    assert_allclose(probs@(scores**2),-probs@second)
case(7, "Fisher", "score e curvatura Bernoulli regolare", t07)

# 08: exact binomial coverage exposes Wald undercoverage.
def t08():
    n,p=20,.1; z=norm.ppf(.975)
    c=0.
    for k in range(n+1):
        q=k/n; half=z*sqrt(q*(1-q)/n)
        if q-half<=p<=q+half: c+=binom.pmf(k,n,p)
    assert_allclose(c,.8760372560,rtol=0,atol=1e-9)
    assert c<.95
    assert_allclose(t.cdf(t.ppf(.975,11),11)-t.cdf(t.ppf(.025,11),11),.95)
case(8, "Intervalli", "Wald binomiale e copertura t normale", t08)

# 09: exact two-sided Gaussian Z power includes both tails.
def t09():
    a=.05; delta=.8; n=25; z=norm.ppf(1-a/2); mu=delta*sqrt(n)
    power=norm.sf(z-mu)+norm.cdf(-z-mu)
    assert power>norm.sf(z-mu)
    assert_allclose(norm.sf(z)+norm.cdf(-z),a)
case(9, "Test", "test Z bilaterale: due code", t09)

# 10: OLS idempotent hat matrix, prediction uncertainty.
def t10():
    x=np.array([-2.,-1.,0.,1.,2.]); X=np.c_[np.ones(5),x]
    H=X@np.linalg.inv(X.T@X)@X.T
    assert_allclose(H@H,H,atol=1e-13)
    x0=np.array([1.,1.3]); h=x0@np.linalg.inv(X.T@X)@x0
    assert (1+h)>h>0
case(10, "OLS", "rango pieno, varianza omoschedastica", t10)

# 11: p>=1 convex; p<1 nonconvex.
def t11():
    for p in (1.,1.5,2.,3.):
        assert abs(1.)**p <= (abs(0.)**p+abs(2.)**p)/2+1e-12
    p=.5
    assert abs(1.)**p>(abs(0.)**p+abs(2.)**p)/2
case(11, "Regressione Lp", "convessita' p>=1 e perdita di convessita' p<1", t11)

# 12: logistic score checked independently against finite differences.
def t12():
    X=np.array([[1.,-1.],[1.,0.],[1.,.5],[1.,2.]])
    y=np.array([0.,1.,1.,1.]); beta=np.array([.12,-.65]); eps=1e-6
    def ell(b):
        u=X@b;return y@u-np.logaddexp(0,u).sum()
    p=1/(1+np.exp(-X@beta)); score=X.T@(y-p)
    finite=np.array([(ell(beta+eps*np.eye(2)[j])-ell(beta-eps*np.eye(2)[j]))/(2*eps) for j in range(2)])
    assert_allclose(score,finite,atol=1e-9)
case(12, "GLM", "score logit Bernoulli e gradiente indipendente", t12)

# 13: AR(1) stationary variance and MA(1) lag-1 autocorrelation.
def t13():
    phi=.65;sigma2=1.7
    assert_allclose(sigma2/(1-phi**2),sigma2*sum(phi**(2*j) for j in range(400)))
    th=.75
    # MA(1): X_t = e_t + th e_{t-1}, X_{t-1} = e_{t-1}+th e_{t-2}.
    a=np.array([1.,th,0.]);b=np.array([0.,1.,th])
    lag1=sigma2*a@b;variance=sigma2*(a@a)
    assert_allclose(lag1/variance,th/(1+th**2))
case(13, "ARMA", "AR(1) stazionario / MA(1) invertibile nel modello", t13)

# 14: check loss minimizer at an empirical quantile.
def t14():
    data=np.array([0.,.1,.3,1.,2.,4.,5.,9.,10.]); tau=.35
    def qloss(v):
        u=data-v; return np.sum(u*(tau-(u<0)))
    q=data[int(np.ceil(tau*len(data)))-1]
    assert qloss(q)<=min(qloss(q-eps) for eps in (.001,.5,3.))+1e-12
    assert qloss(q)<=min(qloss(q+eps) for eps in (.001,.5,3.))+1e-12
case(14, "Quantilica", "minimizzazione check loss campione discreto", t14)

# 15: LASSO soft threshold for orthonormal coordinates, half RSS convention.
def t15():
    y=np.array([2.,-.1,0.]); lam=.5
    b=np.sign(y)*np.maximum(abs(y)-lam,0)
    assert_allclose(b,[1.5,0.,0.])
    assert np.all(abs(y-b)<=lam+1e-12)
case(15, "Penalizzata", "KKT con perdita 1/2 ||y-Xb||^2 e X=I", t15)

# 16: smoother matrix penalization reduces effective degrees of freedom.
def t16():
    D=np.diff(np.eye(6),axis=0); DtD=D.T@D
    S1=np.linalg.inv(np.eye(6)+.1*DtD)
    S2=np.linalg.inv(np.eye(6)+2.*DtD)
    assert_allclose(S1,S1.T)
    assert np.trace(S2)<np.trace(S1)<6.
    assert np.linalg.eigvalsh(S2).min()>0
case(16, "Spline/kernel", "smoother lineare penalizzato a matrice positiva", t16)

# 17: unidentified breakpoint if slope change exactly zero.
def t17():
    x=np.linspace(-2,2,30); y=1.4+.8*x
    for psi in (-1.3,-.5,0.,1.2):
        M=np.c_[np.ones(x.size),x,np.maximum(0,x-psi)]
        b=np.linalg.lstsq(M,y,rcond=None)[0]
        assert_allclose(np.linalg.norm(M@b-y),0.,atol=1e-12)
        assert_allclose(b[2],0.,atol=1e-12)
case(17, "Segmentata", "breakpoint non identificato sotto delta=0", t17)

# 18: optimism of the minimum of two equally noisy validation scores.
def t18():
    sig=.4
    # E[min(X,Y)] for iid N(1,sig^2) = 1-sig/sqrt(pi).
    from scipy.integrate import quad
    # E|X-Y| with X-Y ~ N(0,2 sig^2), computed numerically.
    eabs=quad(lambda d:2*d*norm.pdf(d,loc=0,scale=sig*sqrt(2)),0,4.5)[0]
    assert_allclose(1-eabs/2,1-sig/sqrt(pi),atol=1e-11)
    assert 1-eabs/2<1
    # Unequal fold sizes: simple and observation-weighted means differ.
    r=np.array([.2,.8]); n=np.array([10,90])
    assert abs(np.mean(r)-np.average(r,weights=n))>.1
case(18, "Validazione", "ottimismo da selezione, fold diseguali", t18)

# 19: scaling can change Euclidean nearest neighbor.
def t19():
    X=np.array([[0.,10.],[2.,0.]])
    q=np.array([0.,0.]); raw=np.linalg.norm(X-q,axis=1)
    scaled=np.linalg.norm((X-q)/np.array([1.,10.]),axis=1)
    assert np.argmin(raw)!=np.argmin(scaled)
case(19, "kNN", "distanze dipendenti dalla scala", t19)

# 20: equicorrelated forest variance identity.
def t20():
    B=9;v=2.;rho=.3
    C=v*((1-rho)*np.eye(B)+rho*np.ones((B,B)))
    assert_allclose(C.sum()/B**2,v*(rho+(1-rho)/B))
    assert np.linalg.eigvalsh(C).min()>0
case(20, "Alberi/forest", "equivarianza e correlazione comune dei predittori", t20)

# 21: logistic boosting pseudo-residual negative log-loss gradient.
def t21():
    y=np.array([0.,1.,1.]);F=np.array([-.7,.2,1.1]); eps=1e-6
    def loss(z):return np.logaddexp(0,z).sum()-y@z
    grad=np.array([(loss(F+eps*np.eye(3)[j])-loss(F-eps*np.eye(3)[j]))/(2*eps) for j in range(3)])
    p=1/(1+np.exp(-F))
    assert_allclose(-grad,y-p,atol=1e-9)
case(21, "Boosting", "pseudo-residui binari sulla scala logit", t21)

# 22: backpropagation independent central-difference gradient check.
def t22():
    x=np.array([.2,-.3]);W1=np.array([[.4,-.2],[.1,.6]]);b=np.array([.05,-.04]);w2=np.array([.8,-.3]); target=.7
    a=np.tanh(W1@x+b);pred=w2@a
    grad=np.outer((pred-target)*w2*(1-a*a),x)
    h=1e-6; finite=np.zeros_like(W1)
    def loss(A):return .5*(w2@np.tanh(A@x+b)-target)**2
    for i in range(2):
        for j in range(2):
            E=np.zeros_like(W1);E[i,j]=h
            finite[i,j]=(loss(W1+E)-loss(W1-E))/(2*h)
    assert_allclose(grad,finite,atol=1e-10)
case(22, "Reti neurali", "backprop con attivazione tanh", t22)

# 23: SVD eigenvalue identity and optimal rank-one reconstruction.
def t23():
    X=np.array([[-1.,-2.],[0.,.2],[1.3,2.],[2.,4.1]]);X=X-X.mean(axis=0)
    U,S,Vt=np.linalg.svd(X,full_matrices=False)
    C=X.T@X/(X.shape[0]-1)
    assert_allclose(np.sort(np.linalg.eigvalsh(C)),np.sort(S**2/(X.shape[0]-1)))
    rank1=np.outer(U[:,0]*S[0],Vt[0])
    assert_allclose(np.linalg.norm(X-rank1)**2,S[1]**2)
case(23, "PCA", "SVD e Eckart-Young, dati centrati", t23)

# 24: Lloyd k-means two coordinate steps cannot increase within SSE.
def t24():
    X=np.array([[0.,0.],[.2,.1],[3.,3.],[3.2,2.9]]);c=np.array([[0.,0.],[2.,2.]])
    before=np.linalg.norm(X-c[np.argmin(np.linalg.norm(X[:,None]-c,axis=2),axis=1)],axis=1)**2
    labels=np.argmin(np.linalg.norm(X[:,None]-c,axis=2),axis=1)
    new=np.array([X[labels==j].mean(axis=0) for j in range(2)])
    after=np.linalg.norm(X-new[labels],axis=1)**2
    assert after.sum()<=before.sum()+1e-12
case(24, "Clustering", "Lloyd e monotonia della somma dei quadrati", t24)

# 25: DBSCAN core, border and noise definitions on fixed positions.
def t25():
    X=np.array([[0,0],[.1,0],[0,.1],[.3,0],[3,3]],dtype=float)
    N=[set(np.flatnonzero(np.linalg.norm(X-X[i],axis=1)<=.25)) for i in range(len(X))]
    core={i for i,s in enumerate(N) if len(s)>=3}
    border={i for i in range(len(X)) if i not in core and any(j in core for j in N[i])}
    noise=set(range(len(X)))-core-border
    assert core=={0,1,2} and border=={3} and noise=={4}
case(25, "DBSCAN", "epsilon-balls inclusivi e minPts=3", t25)

# 26: Moran permutation null expectation for fixed x and zero-diagonal W.
def t26():
    x=np.array([1.,2.,4.,9.]);W=np.array([[0,1,0,0],[.3,0,.7,0],[0,.2,0,.8],[0,0,1,0.]])
    S0=W.sum()
    def I(y):
        z=y-y.mean();return len(y)/S0*(z@W@z)/(z@z)
    assert_allclose(np.mean([I(np.asarray(q)) for q in permutations(x)]),-1/(len(x)-1),atol=1e-13)
case(26, "Moran", "speranza esatta sotto permutazione uniforme", t26)

# 27: local Moran sum identity, same m2 and weights.
def t27():
    x=np.array([.2,1.5,2.7,.1]);z=x-x.mean();W=np.array([[0,1,0,0],[.5,0,.5,0],[0,.5,0,.5],[0,0,1,0]])
    m2=z@z/len(x);local=z*(W@z)/m2
    globalI=len(x)/W.sum()*(z@W@z)/(z@z)
    assert_allclose(local.sum(),W.sum()*globalI)
case(27, "LISA", "coerenza locale-globale con stessa normalizzazione", t27)

# 28: K under homogeneous CSR; edge-overlap translation factor.
def t28():
    r=.34
    from scipy.integrate import quad
    # Area under circumference 2*pi*u; homogeneous CSR K is disk area.
    area=quad(lambda u:2*pi*u,0,r)[0]
    assert_allclose(area,pi*r*r)
    assert_allclose(sqrt(area/pi),r)
    dx,dy=.1,.2
    assert_allclose((1-abs(dx))*(1-abs(dy)),.72)
case(28, "Processi puntuali", "CSR e finestra rettangolare, correzione translation", t28)

# 29: exponential covariance vs variogram and practical range.
def t29():
    phi=.2;h=phi*np.log(20);sill=1.7
    C=sill*exp(-h/phi)
    assert_allclose(sill-C,.95*sill)
    assert_allclose(h/phi,np.log(20))
case(29, "Variogrammi", "range pratico 95% di covarianza esponenziale", t29)

# 30: conditional Gaussian variance reduction and ordinary weights.
def t30():
    sensors=np.array([0.,.4,.8]);target=.55;phi=.35
    def cov(x,y):return np.exp(-abs(x[:,None]-y[None,:])/phi)
    C=cov(sensors,sensors);c=cov(sensors,np.array([target]))[:,0]
    w=np.linalg.solve(C,c);v=1-c@w
    C2=C[:2,:2];c2=c[:2];v2=1-c2@np.linalg.solve(C2,c2)
    assert v>=-1e-12 and v<=v2+1e-12
    A=np.block([[C,np.ones((3,1))],[np.ones((1,3)),np.zeros((1,1))]])
    weights=np.linalg.solve(A,np.r_[c,1.])[:3]
    assert_allclose(weights.sum(),1.)
case(30, "Kriging", "covarianza nota, SK e vincolo OK", t30)

# 31: SAR multiplier and direct/indirect effects; determinant term.
def t31():
    W=np.array([[0,1,0],[0,0,1],[1,0,0.]],dtype=float);rho=.3;beta=1.5
    A=np.eye(3)-rho*W;M=np.linalg.inv(A)
    direct=beta*np.trace(M)/3;total=beta*np.mean(M.sum(axis=1))
    # For row-standardized W, total SAR impact equals beta/(1-rho).
    assert_allclose(total,beta/(1-rho))
    assert direct>beta and 0<direct<total
    assert np.linalg.det(A)>0
    assert_allclose(np.linalg.slogdet(A)[1],np.log(abs(np.linalg.det(A))))
    assert_allclose(A@M,np.eye(3),atol=1e-12)
case(31, "SAR / SEM", "moltiplicatore SAR e log-Jacobiano", t31)

if [n for n,_,_ in RESULTS]!=list(range(1,32)):
    raise AssertionError('31 tests required, ordered 01..31')
print(f"PASS: {len(RESULTS)}/31 controlli scientifici indipendenti (un'identita' per laboratorio).")
