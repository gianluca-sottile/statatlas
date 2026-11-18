#!/usr/bin/env python3
"""R exports from all 31 labs: actual rendered code, file download and R parse.

Run after build.py. On CI use --require-r to require GNU R (base installation).
The maximum line length in the exported R code is limited to 1000 characters,
well below the 4094-character console input limit. No packages are executed.
"""
import argparse
import subprocess
import tempfile
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LABS = (
    'distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
    'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
    'spline segmentata validazione knn alberi boost reti-neurali pca clustering '
    'dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'
).split()
LIMIT = 1000

parser = argparse.ArgumentParser()
parser.add_argument('--require-r', action='store_true')
args = parser.parse_args()

with tempfile.TemporaryDirectory(prefix='statatlas-r-exports-') as tmp:
    out = Path(tmp)
    files = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        try:
            page = browser.new_page(accept_downloads=True)
            errors = []
            page.on('pageerror', lambda exc: errors.append(str(exc)))
            page.goto('about:blank#/distribuzioni')
            page.set_content((ROOT / 'index.html').read_text(encoding='utf-8'), wait_until='load')
            for lab in LABS:
                if lab != LABS[0]:
                    page.evaluate('(id) => { location.hash = "#/" + id; }', lab)
                page.wait_for_function('(id) => window.SA && window.SA.currentLab === id', arg=lab, timeout=30000)
                pre = page.locator('pre[aria-label="Codice R"]').first
                pre.wait_for(state='attached', timeout=30000)
                source = pre.text_content()
                assert source and len(source) > 80, (lab, 'empty or missing R export')
                longest = max(map(len, source.splitlines()))
                assert longest < LIMIT, (lab, f'R console line length {longest} >= {LIMIT}')
                assert not errors, (lab, errors[-1])
                path = out / f'{lab}.R'
                path.write_text(source, encoding='utf-8')
                files.append(path)
                print('PASS',lab,'R export lines <=',longest,flush=True)
                if lab == 'moran':
                    # A live change must update the code; copy/download use the
                    # same wrapper as the visible code.
                    before = source
                    studio = page.locator('.spatial-studio')
                    bg = studio.locator('[data-action="map"]')
                    box = bg.bounding_box()
                    bg.click(position={'x': box['width'] * .76,'y':box['height'] * .24})
                    source = pre.text_content()
                    assert source != before, 'R code not refreshed after adding a point'
                    assert max(map(len, source.splitlines())) < LIMIT
                    page.locator('[data-ux-action="code"]').click()
                    with page.expect_download(timeout=15000) as dl_info:
                        page.locator('.ux-dialog-pane[data-ux-pane="code"] .code .toolbar button').last.click()
                    page.keyboard.press('Escape')
                    dl = dl_info.value
                    saved = out / 'moran-downloaded.R'
                    dl.save_as(str(saved))
                    assert saved.read_text(encoding='utf-8') == source, 'download differs from displayed R'
                    files.append(saved)
                    print('PASS Moran: added point and downloaded R matches displayed R',flush=True)
            assert len(LABS) == 31
        finally:
            browser.close()
    rscript = which('Rscript')
    if not rscript and args.require_r:
        raise RuntimeError('Rscript missing but --require-r was specified')
    if rscript:
        expr = (
            'for (f in commandArgs(TRUE)) { '
            'tryCatch({parse(file=f, keep.source=FALSE); cat("PARSE OK",basename(f),"\\n")}, '
            'error=function(e) stop(sprintf("R PARSE ERROR in %s: %s",f,conditionMessage(e)))) '
            '}'
        )
        subprocess.run([rscript, '--vanilla','-e',expr]+list(map(str,files)),check=True)
        print('PASS: GNU R parsed',len(files),'real exports')
    else:
        print('INFO: Rscript not installed in this environment; actual R parsing will run in GitHub CI.')
print('PASS: 31 laboratory exports, safe console length and live spatial export')
