#!/usr/bin/env python3
"""Live six-map parity audit: independent NumPy + actual GNU R (when installed).

The *displayed* R code is parsed to recover the snapshot. Each numerical result
is checked against an independently implemented Python reference; if Rscript is
available the same displayed R script is also executed in a clean base-R process
and its numerical output compared to the same reference.

This does NOT certify the legacy 01-25 R scripts, the entire theory, or the
stochastic distributional equivalence of simulations between JS and R.
"""
import argparse
import json
import math
import re
import subprocess
import tempfile
from pathlib import Path
from shutil import which

import numpy as np
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LABS = ['moran', 'lisa', 'processi-puntuali', 'variogrammi', 'kriging', 'regressione-spaziale']
TOL = 3e-6  # Reporting/parsing precision is stricter than visible three-decimal UI.


def coordinates(text):
    columns = {}
    for name in ('x', 'y', 'z', 'X'):
        m = re.search(r'\b' + name + r'\s*=\s*c\s*\(([^)]*)\)', text, re.S)
        if m is None:
            raise AssertionError(f'Missing exported vector {name}')
        columns[name] = np.array([
            float(v.strip()) if v.strip() != 'NA_real_' else float('nan')
            for v in m.group(1).split(',') if v.strip()
        ])
    n = len(columns['x'])
    assert n >= 3 and all(len(v) == n for v in columns.values())
    return columns


def neighbors(d, k):
    points = np.stack([d['x'], d['y']], axis=1)
    dist = np.sqrt(np.sum((points[:, None, :] - points[None, :, :]) ** 2, axis=2))
    np.fill_diagonal(dist, float('inf'))
    ind = np.argsort(dist, axis=1, kind='stable')[:, :k]
    W = np.zeros((len(points), len(points)))
    for i in range(len(points)):
        W[i, ind[i]] = 1 / k
    return W


def moran(z, W):
    a = z - np.mean(z)
    ss = np.dot(a, a)
    return float(len(a) / np.sum(W) * (a @ W @ a) / ss) if ss >= 1e-12 else float('nan')


def verify(lab, source, js):
    d = coordinates(source)
    assert np.all(np.isfinite(d['x'])) and np.all(np.isfinite(d['y']))
    assert np.all(np.isfinite(d['z']))
    assert np.all((d['x'] >= 0) & (d['x'] <= 1)) and np.all((d['y'] >= 0) & (d['y'] <= 1))
    out = {'n': len(d['x'])}
    if lab in ('moran', 'lisa', 'regressione-spaziale'):
        k = int(re.search(r'^k\s*<-\s*(\d+)L', source, re.M).group(1))
        W = neighbors(d, k)
    if lab in ('moran', 'lisa'):
        mi = moran(d['z'], W)
        assert np.isclose(mi, js['moran'], rtol=0, atol=TOL), (lab, mi, js['moran'])
        out['moran'] = mi
        if lab == 'lisa':
            zz = d['z'] - np.mean(d['z'])
            lag = W @ zz
            names = np.where(zz >= 0, np.where(lag >= 0, 'HH', 'HL'), np.where(lag < 0, 'LL', 'LH'))
            out['HH'], out['LL'], out['HL'], out['LH'] = [int(sum(names == v)) for v in ('HH', 'LL', 'HL', 'LH')]
            assert out['HH'] == js['HH'] and out['LL'] == js['LL']
            assert out['HL'] + out['LH'] == js['outliers']
    elif lab == 'processi-puntuali':
        h = float(re.search(r'^h\s*<-\s*([.\d]+)', source, re.M).group(1))
        u = (d['x'] - .5)**2 + (d['y'] - .5)**2
        out['kde_center'] = float(np.sum(np.exp(-u / (2*h*h))) / (2*math.pi*h*h))
        assert np.isclose(out['kde_center'], js['kde'], rtol=0, atol=TOL), (lab, out, js)
    elif lab == 'variogrammi':
        bins = int(re.search(r'^p\s*<-\s*(\d+)L', source, re.M).group(1))
        n = len(d['x']); sums = np.zeros(bins); counts = np.zeros(bins, dtype=int)
        for i in range(n):
            for j in range(i+1, n):
                distance = math.hypot(d['x'][i]-d['x'][j], d['y'][i]-d['y'][j])
                if distance > 1: continue
                bucket = min(bins-1, int(distance * bins))
                sums[bucket] += .5*(d['z'][i]-d['z'][j])**2
                counts[bucket] += 1
        gamma = [float(sums[i]/counts[i]) if counts[i] else None for i in range(bins)]
        out['count'] = int(sum(counts))
        out['gamma'] = gamma
        assert out['count'] == js['count'], (lab, out, js)
        vals = [x for x in gamma if x is not None]
        out['mean_gamma'] = float(np.mean(vals))
        assert np.isclose(out['mean_gamma'], js['mean_gamma'], atol=TOL), (lab, out, js)
    elif lab == 'kriging':
        phi = float(re.search(r'^phi\s*<-\s*([.\d]+)', source, re.M).group(1))
        loc = np.stack([d['x'], d['y']], axis=1)
        dist = np.sqrt(np.sum((loc[:, None, :] - loc[None, :, :])**2, axis=2))
        C = np.exp(-dist/phi) + .12*np.eye(len(loc))
        c0 = np.exp(-np.linalg.norm(loc - np.array([.5,.5]), axis=1)/phi)
        A = np.block([[C, np.ones((len(loc), 1))], [np.ones((1, len(loc))), np.zeros((1,1))]])
        wnu = np.linalg.solve(A, np.r_[c0, 1.])
        out['prediction_center'] = float(np.dot(wnu[:-1], d['z']))
        out['variance_center'] = float(1 - np.dot(wnu[:-1], c0) - wnu[-1])
        assert np.isclose(out['prediction_center'], js['prediction_center'], atol=TOL), (lab, out, js)
        assert np.isclose(out['variance_center'], js['variance_center'], atol=TOL), (lab, out, js)
    elif lab == 'regressione-spaziale':
        for suffix, design in [('x', np.stack([np.ones(len(d['z'])), d['X']], axis=1)),
                               ('coords', np.stack([np.ones(len(d['z'])), d['X'], d['x'], d['y']], axis=1))]:
            coef, _, _, _ = np.linalg.lstsq(design, d['z'], rcond=None)
            residual = d['z'] - design @ coef
            out['r2_'+suffix] = float(1 - np.dot(residual,residual) / np.sum((d['z']-np.mean(d['z']))**2))
            out['moran_'+suffix] = moran(residual, W)
            assert np.isclose(out['r2_'+suffix], js['r2_'+suffix], atol=TOL), (lab, suffix, out, js)
            assert np.isclose(out['moran_'+suffix], js['moran_'+suffix], atol=TOL), (lab, suffix, out, js)
    return out


def get_js(page, lab, source):
    # Use the same exported points, but the real, unmodified StatAtlas numerical
    # engine. Comparison reference above does NOT use that engine.
    d = coordinates(source)
    points = [dict(x=float(d['x'][i]), y=float(d['y'][i]), value=float(d['z'][i]),
                   cov=float(d['X'][i]) if np.isfinite(d['X'][i]) else 0)
              for i in range(len(d['x']))]
    return page.evaluate('''({lab, points, source}) => {
       const s=window.SA, rx=(p)=>Number(source.match(new RegExp('^'+p+'\\\\s*<-\\\\s*([0-9.]+)', 'm'))[1]);
       const n=points.length, mean=(a)=>a.reduce((x,y)=>x+y,0)/a.length;
       if(lab==='moran'||lab==='lisa') {
         const m=s.spatialStudio.describe(points,rx('k'));
         if(lab==='moran')return {moran:m.I};
         let counts={HH:0,LL:0,HL:0,LH:0};m.local.quadrant.forEach(q=>{if(q in counts)counts[q]++});
         return {moran:m.I,HH:counts.HH,LL:counts.LL,outliers:counts.HL+counts.LH};
       }
       if(lab==='processi-puntuali')return {kde:s.spatialStudio.smooth(points,.5,.5,'kde',rx('h'))};
       if(lab==='variogrammi'){
         const v=s.geostat.empirical(points,points.map(p=>p.value),{bins:rx('p'),maxDist:1});
         return {count:v.counts.reduce((x,y)=>x+y,0),mean_gamma:mean(v.gamma.filter(Number.isFinite))};
       }
       if(lab==='kriging'){
         const design=s.kriging.geometry(points,[{x:.5,y:.5}],{model:'exponential',sigma2:1,phi:rx('phi'),nugget:.12,ratio:1,angle:0},'ordinary',2);
         return {prediction_center:s.kriging.predict(design,points.map(p=>p.value))[0],variance_center:design.variances[0]};
       }
       const k=rx('k'), a=s.spatialStudio.ols(points,false,k), b=s.spatialStudio.ols(points,true,k);
       return {r2_x:a.r2,moran_x:a.moran,r2_coords:b.r2,moran_coords:b.moran};
    }''', {'lab': lab, 'points': points, 'source': source})


TAILS = {
 'moran': 'c(moran(d$z,W))',
 'lisa': 'c(moran(d$z,W),sum(quadrante=="HH"),sum(quadrante=="LL"),sum(quadrante=="HL"),sum(quadrante=="LH"))',
 'processi-puntuali': 'c(kde(.5,.5))',
 'variogrammi': 'c(sum(!is.na(bin)),mean(as.numeric(tapply(sqDiff,bin,mean)),na.rm=TRUE))',
 'kriging': 'c(sum(w*d$z),sigma2-sum(w*c0)-nu)',
 'regressione-spaziale': 'c(summary(m0)$r.squared,moran(residuals(m0),W),summary(m1)$r.squared,moran(residuals(m1),W))',
}


def compare_r(lab, source, reference, rscript, tmp):
    # Use base R only: six map exports deliberately require no CRAN packages.
    path = Path(tmp)/f'{lab}.R'
    path.write_text('pdf(file=' + json.dumps(str(Path(tmp)/f'{lab}.pdf')) + ')\n' + source +
                    '\ncat("\\nSTATATLAS_NUMERIC:", paste(format(' + TAILS[lab] +
                    ', digits=17), collapse=","), "\\n")\n' +
                    'dev.off()\n', encoding='utf-8')
    result = subprocess.run([rscript, '--vanilla', str(path)], capture_output=True,
                            text=True, timeout=100)
    assert result.returncode == 0, (lab, result.stdout[-900:], result.stderr[-900:])
    m = re.search(r'STATATLAS_NUMERIC:\s*([^\n]+)', result.stdout)
    assert m, (lab, result.stdout[-900:])
    data = [float(x) for x in m.group(1).split(',')]
    keys = {
        'moran': ['moran'],
        'lisa': ['moran','HH','LL','HL','LH'],
        'processi-puntuali': ['kde_center'],
        'variogrammi': ['count','mean_gamma'],
        'kriging': ['prediction_center','variance_center'],
        'regressione-spaziale': ['r2_x','moran_x','r2_coords','moran_coords'],
    }[lab]
    assert len(data) == len(keys), (lab, data)
    for key, v in zip(keys, data):
        ref = reference[key]
        assert np.isclose(v, ref, rtol=0, atol=TOL), (lab, key, v, ref)
    return dict(zip(keys, data))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--require-r', action='store_true', help='Make missing GNU R fatal (CI).')
    parser.add_argument('--json-report', default=None, help='Write detailed machine-readable audit.')
    args = parser.parse_args()
    rscript=which('Rscript')
    if args.require_r and not rscript:
        raise RuntimeError('Rscript missing but required: cannot certify JS/R parity')
    audit={}
    with tempfile.TemporaryDirectory(prefix='statatlas-spatial-parity-') as tmp:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,
                                       args=['--no-sandbox','--disable-dev-shm-usage'])
            try:
                page=browser.new_page()
                errs=[]
                page.on('pageerror',lambda e:errs.append(str(e)))
                page.set_content((ROOT/'index.html').read_text(encoding='utf-8'))
                for lab in LABS:
                    page.evaluate('(lab)=>{location.hash="#/"+lab}',lab)
                    page.locator('.spatial-studio').wait_for()
                    source=page.locator('pre[aria-label="Codice R"]').first.text_content()
                    assert not errs,(lab,errs)
                    js=get_js(page,lab,source)
                    ref=verify(lab,source,js)
                    audit[lab]={'initial':{'python_reference':ref,'javascript':js,'comparison_JS_Python':'PASS'}}
                    if rscript:
                        audit[lab]['initial']['r']=compare_r(lab,source,ref,rscript,tmp)
                        audit[lab]['initial']['comparison_R_Python']='PASS'
                    else:
                        audit[lab]['initial']['comparison_R_Python']='NOT RUN (Rscript unavailable)'
                    # Second complete comparison after a real edit. This catches
                    # stale exports as well as errors that depend on n and values.
                    studio=page.locator('.spatial-studio')
                    add=studio.locator('[data-tool="add"]')
                    if add.count(): add.click()
                    else: studio.locator('[data-tool="high"]').click()
                    oldn=int(studio.get_attribute('data-points'))
                    mapbg=studio.locator('[data-action="map"]')
                    mapbg.focus()
                    mapbg.press('Enter')
                    assert int(studio.get_attribute('data-points'))==oldn+1,lab
                    edited=page.locator('pre[aria-label="Codice R"]').first.text_content()
                    assert edited!=source,(lab,'export failed to update after editing')
                    js_edited=get_js(page,lab,edited)
                    ref_edited=verify(lab,edited,js_edited)
                    audit[lab]['edited']={'python_reference':ref_edited,
                                          'javascript':js_edited,'comparison_JS_Python':'PASS'}
                    if rscript:
                        audit[lab]['edited']['r']=compare_r(lab,edited,ref_edited,rscript,tmp)
                        audit[lab]['edited']['comparison_R_Python']='PASS'
                    else:
                        audit[lab]['edited']['comparison_R_Python']='NOT RUN (Rscript unavailable)'
                    studio.locator('.spatial-studio-reset').first.click()
                    assert int(studio.get_attribute('data-points'))==oldn,(lab,'reset regression')
                    assert page.locator('pre[aria-label="Codice R"]').first.text_content()==source,(lab,'reset R snapshot regression')
                    print('PASS',lab,'two live snapshots (initial+edited), reset, JS/Python parity',
                          '+ R execution' if rscript else '(R execution not available)',flush=True)
            finally:
                browser.close()
    if args.json_report:
        Path(args.json_report).parent.mkdir(parents=True,exist_ok=True)
        Path(args.json_report).write_text(json.dumps(audit,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('PASS: 12 live spatial snapshots (six initial + six edited), independent numeric JS/Python tests and reset')
    if not rscript: print('NOT VERIFIED: GNU R execution (will be required in remote CI)')


if __name__ == '__main__':
    main()
