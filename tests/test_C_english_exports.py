#!/usr/bin/env python3
"""Check EN R-script comment localization without modifying executable R lines.

Parses all 31 stored reproducible scripts from a previous build to confirm the
localization layer changes explanatory comment text only. Separate GNU R runs
are still required against the release build.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = sorted((ROOT / 'verifica' / 'export_r_31').glob('[0-9][0-9]_*.R'))
assert len(SCRIPTS) == 31, f'Expected 31 R scripts, got {len(SCRIPTS)}'

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        p = b.new_page(viewport={'width': 1366, 'height': 850})
        p.set_content((ROOT/'index.html').read_text(encoding='utf-8'))
        p.locator('button.lang-toggle').first.click()
        assert p.evaluate('document.documentElement.lang') == 'en'
        changed = 0
        for path in SCRIPTS:
            lab = path.stem.split('_', 1)[1]
            before = path.read_text(encoding='utf-8')
            after = p.evaluate('([id, code]) => SA.i18n.translateRComments(code, id)', [lab, before])
            assert len(after.splitlines()) == len(before.splitlines()), lab
            for src, dst in zip(before.splitlines(), after.splitlines()):
                if not re.match(r'^\s*#', src):
                    assert src == dst, f'Executable R expression changed: {lab}: {src!r}'
                elif dst != src:
                    changed += 1
            assert 'StatAtlas' in after, lab
        assert changed >= 100, f'Too few English explanatory comments translated: {changed}'
        assert not p.evaluate('SA.i18n.translateRComments("x <- 2 # unchanged inline", "distribuzioni")') != 'x <- 2 # unchanged inline'
        print(f'PASS EN R exports: {len(SCRIPTS)}/31; {changed} translated comment lines; executable R unchanged')
        p.close()
    finally:
        b.close()
