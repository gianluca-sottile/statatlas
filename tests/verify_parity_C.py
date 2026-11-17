#!/usr/bin/env python3
"""Validate all 25 StatAtlas R/JS numerical benchmark reports against this build.

The Macrofase C initial runner saved the 01-16 CSV under its legacy name;
the revised runner saves it under verifica/runs. Both are supported only when
the report was written after the current generated benchmark R script.

Default-scenario numerical parity is R1 evidence, NOT global algorithmic R2.
"""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABS = (
    'distribuzioni bivariata simulazione lgn-tcl adattamento stimatori fisher '
    'intervalli test regressione regressione-lp glm arma quantilica penalizzata '
    'spline segmentata validazione knn alberi boost reti-neurali pca clustering dbscan'
).split()


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def report_file(group, script):
    candidates = [ROOT / f'verifica/runs/parita_C_{group}_esiti.csv']
    if group == '01_16':
        candidates.extend((
            ROOT / 'verifica_statatlas_01_16_esiti.csv',
            ROOT / 'verifica/verifica_statatlas_01_16_esiti.csv',
        ))
    for candidate in candidates:
        if candidate.is_file() and candidate.stat().st_mtime >= script.stat().st_mtime:
            return candidate
    found = [str(p.relative_to(ROOT)) for p in candidates if p.is_file()]
    raise RuntimeError(
        f'{group}: no fresh R CSV report. Found: {found or "none"}. '
        'The R report must postdate its benchmark script.'
    )


def main():
    sha = hashlib.sha256((ROOT / 'index.html').read_bytes()).hexdigest()
    total_checks = 0
    for group, start, stop in (('01_16', 1, 16), ('17_25', 17, 25)):
        script = ROOT / f'verifica/parita_C_{group}.R'
        source = script.read_text(encoding='utf-8')
        require('# build_sha256: ' + sha in source,
                f'{group}: benchmark R script not generated from current build')
        snapfile = ROOT / f'verifica/snapshots_C_{group}.json'
        snap = json.loads(snapfile.read_text(encoding='utf-8'))
        require(snap['build_sha256'] == sha,
                f'{group}: browser snapshot does not match current build')
        expected_names = LABS[start - 1:stop]
        require(list(snap['labs']) == expected_names,
                f'{group}: browser snapshot missing/reordered laboratories')
        result_file = report_file(group, script)
        with result_file.open(encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            require(reader.fieldnames is not None and
                    {'lab', 'controllo', 'esito'}.issubset(reader.fieldnames),
                    f'{group}: malformed R results CSV')
            rows = list(reader)
        require(rows, f'{group}: empty R results CSV')
        bad = [(r['lab'], r['controllo'], r['esito'])
               for r in rows if r['esito'] != 'OK']
        require(not bad, f'{group}: mismatches/skipped checks: {bad[:8]!r}')
        for i in range(start, stop + 1):
            num = f'{i:02d}'
            name = LABS[i - 1]
            require(any(r['lab'] == num for r in rows),
                    f'{group}: missing numerical comparison for lab {num}')
            require(any(r['lab'] == name for r in rows),
                    f'{group}: missing successful R-script execution for {name}')
        total_checks += len(rows)
        print(f'PASS {group}: {stop - start + 1} labs, {len(rows)} checks; '
              f'report {result_file.relative_to(ROOT)}')
    print(f'PASS 25/25: {total_checks} R/JS checks, all tied to build SHA-256 {sha}')
    print('Scope: one default scenario per lab (R1 numerical evidence); '
          'full algorithmic R2 not certified.')


if __name__ == '__main__':
    main()
