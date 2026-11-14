#!/usr/bin/env python3
"""Numerical audit with independent NumPy/SciPy (QR/solve/slogdet) of five JS benchmarks."""
import json
from pathlib import Path
import numpy as np
from scipy import linalg
ROOT=Path(__file__).resolve().parent
cases=json.loads((ROOT/'spatial_regression_js_reference.json').read_text())
coords=np.array([(i%6,i//6) for i in range(36)])
W=np.zeros((36,36))
for i in range(36):
 for j in range(36):
  if np.abs(coords[i]-coords[j]).sum()==1: W[i,j]=1
W=W/W.sum(axis=1,keepdims=True)
assert np.allclose(W.sum(axis=1),1)
all_checks=0
for case in cases:
 y=np.array(case['y']);x=np.array(case['x']);X=np.stack([np.ones(36),x],axis=1)
 def prof(model,rho):
  A=np.eye(36)-rho*W
  t=A@y
  design=A@X if model=='sem' else X
  beta=linalg.lstsq(design,t)[0]
  e=t-design@beta
  s2=e@e/36
  logd=np.linalg.slogdet(A)
  assert logd.sign>0
  loglik=(0 if model=='ols' else logd.logabsdet)-36/2*(1+np.log(2*np.pi*s2))
  return beta,loglik
 for kind in ['ols','sar','sem']:
  if kind=='ols':beta,ll=prof(kind,0);ref=case['ols'];expected=ref['beta'];target_ll=ref['logLik']
  else:
   vals=[(rho,)+prof(kind,rho) for rho in np.linspace(-.8,.8,33)]
   best=max(vals,key=lambda x:x[2]);rho,beta,ll=best;ref=case[kind]
   assert abs(rho-ref['rho'])<1e-8,(case['name'],kind,rho,ref['rho']);all_checks+=1
   expected=ref['beta'];target_ll=ref['logLik']
  assert np.allclose(beta,expected,atol=1e-8), (case['name'],kind,'beta');all_checks+=1
  assert abs(ll-target_ll)<1e-7,(case['name'],kind,'loglik',ll,target_ll);all_checks+=1
 H=linalg.inv(np.eye(36)-case['sar']['rho']*W)
 direct=np.trace(H)/36*case['sar']['beta'][1]
 total=np.mean(H.sum(axis=1))*case['sar']['beta'][1]
 assert abs(direct-case['impacts']['direct'])<1e-8
 assert abs(total-case['impacts']['total'])<1e-8
 all_checks+=2
 def cv(folds,k=3):
  out=0
  folds=np.asarray(folds)
  for f in range(3):
   tr=np.flatnonzero(folds!=f)
   te=np.flatnonzero(folds==f)
   for i in te:
    dist=np.linalg.norm(coords[tr]-coords[i],axis=1)
    ii=np.lexsort((tr,dist))[:k]
    w=1/(dist[ii]+1e-9)
    pred=np.sum(w*y[tr[ii]])/np.sum(w)
    out+=(pred-y[i])**2
  return out/36
 assert abs(cv(case['foldRandom'])-case['cv']['random'])<1e-9
 assert abs(cv(case['foldBlock'])-case['cv']['spatial'])<1e-9
 all_checks+=2
 print('OK: confronto indipendente NumPy/SciPy —',case['name'])
print(f'PASSATI {all_checks} confronti indipendenti, 0 fallimenti')
