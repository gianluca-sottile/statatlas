#!/usr/bin/env python3
"""Independent numerical spot checks of selected methodological identities.
Not a formal proof audit of the complete manuscript.
"""
import numpy as np
from scipy.stats import t, norm, binom
from itertools import permutations
from math import pi, exp, comb
checks=0
# Binomial Wald coverage at n=20 and p=.1, as stated in chapter 08
n,p,z=20,.1,norm.ppf(.975)
coverage=sum(binom.pmf(k,n,p) for k in range(n+1) if k/n-z*np.sqrt(k/n*(1-k/n)/n)<=p<=k/n+z*np.sqrt(k/n*(1-k/n)/n))
assert abs(coverage-.8760372560)<1e-9,coverage;checks+=1
assert abs(t.cdf(t.ppf(.975,11),11)-t.cdf(t.ppf(.025,11),11)-.95)<1e-12;checks+=1
# AR1 and pairwise covariance under stationarity
phi=.7;sigma2=1.3;assert np.isclose(sigma2/(1-phi**2),sum(sigma2*phi**(2*j) for j in range(400)));checks+=1
# PCA Rayleigh / singular values / optimal rank one reconstruction
X=np.array([[-1.,-2.],[0.,.2],[1.3,2.],[2.,4.1]])
X-=X.mean(axis=0);U,S,Vt=np.linalg.svd(X,full_matrices=False)
C=X.T@X/(X.shape[0]-1);w,v=np.linalg.eigh(C)
assert np.allclose(sorted(w),sorted(S**2/(X.shape[0]-1)));checks+=1
rank1=np.outer(U[:,0]*S[0],Vt[0]);assert np.isclose(np.linalg.norm(X-rank1)**2,S[1]**2);checks+=1
# Moran I under permutation, diagonal weights zero, nonsymmetric W allowed
x=np.array([1.,2.,4.,9.]);W=np.array([[0,1,0,0],[.3,0,.7,0],[0,.2,0,.8],[0,0,1,0.]])
S0=W.sum();def_moran=lambda y: len(y)/S0*(((y-y.mean())@W@(y-y.mean()))/(((y-y.mean())@(y-y.mean()))))
assert abs(np.mean([def_moran(np.asarray(q)) for q in permutations(x)])+1/(len(x)-1))<1e-12;checks+=1
# Lasso simple soft threshold under diagonal X'X and half RSS loss
Y=np.array([2.,-.1,0.]); lam=.5
soft=np.sign(Y)*np.maximum(abs(Y)-lam,0)
assert np.allclose(soft,np.array([1.5,0.,0.]));checks+=1
# Variogram covariance consistency
phi=.2;h=np.array([0.,.2,.6]);sill=2.
cv=sill*np.exp(-h/phi);gamma=sill-cv
assert np.isclose(gamma[2]/sill,1-exp(-3));checks+=1
# Forest variance: B equicorrelated predictors
B=10;v=2.;rho=.4;Sigma=v*((1-rho)*np.eye(B)+rho*np.ones((B,B)))
assert np.isclose(Sigma.mean(),v*(rho+(1-rho)/B));checks+=1
# Ordinary least squares forecast uncertainty exceeds mean uncertainty
h0=.2;sigma2=1.2
assert sigma2*(1+h0)>sigma2*h0;checks+=1
# SAR multiplier total impacts
W2=np.array([[0,1],[1,0.]])
M=np.linalg.inv(np.eye(2)-.3*W2)
assert np.allclose(M,sum((np.linalg.matrix_power(.3*W2,j) for j in range(160)),np.zeros_like(W2)));checks+=1
print('OK: ',checks,'independent mathematical spot checks.')
