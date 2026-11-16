# Archived spatial browser tests from the pre-2.1 dual-interface layout

The `_pre_unification.py` tests are preserved solely as a historical record of
capabilities that were deliberately removed in the spatial studio migration.
They expect `.fig` / `.transport`, legacy areal grids, and duplicate maps and
are **not runnable acceptance tests for StatAtlas 2.1**.

The original filenames under `tests/smoke/` now invoke current single-map smoke
tests. The more extensive acceptance tests are
`tests/test_spatial_studio_browser.py`,
`tests/test_spatial_studio_interactions.py`,
`tests/test_spatial_unified_challenges.py`, and
`tests/test_spatial_export_equivalence.py`.

Archiving these tests does **not** certify the old advanced spatial features
(MAUP simulation, global Monte Carlo envelopes, IDW-vs-kriging benchmark,
SAR/SEM inference), which are currently absent from the single-map UI.
