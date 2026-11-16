#!/usr/bin/env python3
"""Single-studio smoke tests replacing pre-2.1 transport-dependent controls."""
from spatial_unified_smoke import run
for lab in ('moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale'):
    run(lab)
