#!/usr/bin/env python3
"""Export the 31 ACTUAL R scripts displayed by the built StatAtlas interface.

Use from the repository root: python3 build.py && python3 tests/export_r_live_31.py
The resulting files are inputs to the single R validator verifica/valida_tutti_31.R.
No synthetic R script or obsolete historical snapshot is used.
"""
import csv
import hashlib
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'verifica' / 'export_r_31'
LABS = (
    'distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
    'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
    'spline segmentata validazione knn alberi boost reti-neurali pca clustering '
    'dbscan moran lisa processi-puntuali variogrammi kriging regressione-spaziale'
).split()


def main():
    html = ROOT / 'index.html'
    if not html.exists():
        raise SystemExit('ERROR: run python3 build.py first')
    OUT.mkdir(parents=True, exist_ok=True)
    build_sha = hashlib.sha256(html.read_bytes()).hexdigest()
    rows = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True, executable_path=which('chromium') or which('google-chrome') or None,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        try:
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda exc: errors.append(str(exc)))
            page.goto('about:blank#/distribuzioni')
            page.set_content(html.read_text(encoding='utf-8'), wait_until='load')
            for index, lab in enumerate(LABS, 1):
                if index > 1:
                    page.evaluate('(id) => { location.hash = "#/" + id; }', lab)
                page.wait_for_function('(id) => window.SA && window.SA.currentLab === id', arg=lab)
                code = page.locator('pre[aria-label="Codice R"]').first.text_content()
                if not code or len(code) < 80:
                    raise RuntimeError(f'Export empty: {lab}')
                longest = max(map(len, code.splitlines()))
                if longest >= 1000:
                    raise RuntimeError(f'Overlong R line ({longest}): {lab}')
                if errors:
                    raise RuntimeError(f'Browser JavaScript error in {lab}: {errors[-1]}')
                fn = f'{index:02d}_{lab}.R'
                data = (code.rstrip('\n')+'\n').encode('utf-8')
                (OUT / fn).write_bytes(data)
                rows.append([index, lab, fn, hashlib.md5(data).hexdigest(),
                             hashlib.sha256(data).hexdigest(), len(code.splitlines()), longest,
                             build_sha])
                print(f'EXPORT {index:02d}/31 {lab} lines={len(code.splitlines())}, maxlen={longest}', flush=True)
        finally:
            browser.close()
    if len(rows) != 31:
        raise RuntimeError('Not all 31 labs exported')
    with (OUT / 'manifest.csv').open('w', encoding='utf-8', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(['number', 'lab', 'file', 'md5', 'sha256', 'lines', 'max_line', 'build_sha256'])
        writer.writerows(rows)
    print('PASS: 31 real dynamic R exports; manifest + source integrity hashes')


if __name__ == '__main__':
    main()
