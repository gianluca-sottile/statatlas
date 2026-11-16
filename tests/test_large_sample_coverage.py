#!/usr/bin/env python3
"""Independent SciPy check of *exact* discrete-interval coverage at n up to 100000.

The tested JS function is temporarily exposed only in this test page; the
actual StatAtlas bundle and R exports are left unchanged.
"""
from pathlib import Path
from shutil import which
import math
from scipy.stats import binom, poisson, norm, chi2
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT/'src/labs/08-intervalli.js').read_text(encoding='utf-8')
needle = "  SA.registerLab('intervalli', {"
assert source.count(needle) == 1
source = source.replace(needle, "  SA.__coverageTest = function(method, n, p) { "
    "S = {method:method, n:n, p:p, lambda:p, level:0.95}; return exactCoverage(); };\n"+needle)

Z = norm.ppf(0.975)

def ci(s, n, method, theta):
    if method == 'wald':
        prop = s/n
        h = Z*math.sqrt(prop*(1-prop)/n)
        return prop-h, prop+h
    if method == 'wilson':
        prop=s/n
        den=1+Z*Z/n
        cent=(prop+Z*Z/(2*n))/den
        h=Z*math.sqrt(prop*(1-prop)/n + Z*Z/(4*n*n))/den
        return max(0,cent-h), min(1,cent+h)
    return ((chi2.ppf(.025,2*s)/(2*n)) if s else 0,
            chi2.ppf(.975,2*s+2)/(2*n))

def baseline(n, method, theta):
    mean = n*theta
    top = n if method != 'garwood' else math.ceil(mean + 15*math.sqrt(mean)+100)
    def first(predicate):
        lo, hi = 0, top+1
        while lo < hi:
            mid=(lo+hi)//2
            if predicate(mid):hi=mid
            else:lo=mid+1
        return lo
    lo=first(lambda s: ci(s,n,method,theta)[1] >= theta)
    hi=first(lambda s: ci(s,n,method,theta)[0] > theta)-1
    if hi<lo:return 0.
    dist = poisson(n*theta) if method == 'garwood' else binom(n,theta)
    return float(dist.cdf(hi)-dist.cdf(lo-1))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        page=browser.new_page()
        page.set_content((ROOT/'index.html').read_text(encoding='utf-8'),wait_until='load')
        page.evaluate('(script) => eval(script)', source)
        for method, theta in [('wald',.1),('wilson',.1),('garwood',2.)]:
            for n in [10,100,1000,10000,100000]:
                actual=page.evaluate('([m,n,p])=>SA.__coverageTest(m,n,p)',[method,n,theta])
                expected=baseline(n,method,theta)
                assert math.isfinite(actual) and abs(actual-expected)<2e-7, (method,n,actual,expected)
                print(f'PASS coverage {method} n={n}: JS {actual:.9f} vs SciPy {expected:.9f}')
        print('PASS: 15 independent exact-coverage comparisons including n=100000')
    finally:
        browser.close()
