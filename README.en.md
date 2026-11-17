# StatAtlas 2.1 — Interactive Atlas of Statistics

**Maintainer:** Gianluca Sottile · [Public StatAtlas application](https://gianluca-sottile.github.io/statatlas/) · [Source repository](https://github.com/gianluca-sottile/statatlas) · [README italiano](README.md)

**Release status:** Macrophase C is included in this revision and **passed local macOS acceptance testing on 17 November 2026** for build SHA-256 `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`. The test executed 31/31 GNU R exports and passed 84/84 numerical R/JavaScript checks for 25 default scenarios (R1). Public availability should be confirmed from the current `main` commit and GitHub Pages deployment. These checks do not certify universal algorithmic parity (R2), WCAG conformance, or student usability.

## Phase D — Reproducible experiments (candidate pending GNU R acceptance)

Each of the 31 labs now supports **Save JSON**, **Open JSON**, and **Copy link**. The versioned experiment file captures displayed controls, exact replay checkpoints where supported, and edited observations from six spatial labs and interactive regression labs 10 and 14. Only small states can fit into shareable links; use JSON for larger datasets. Files tied to a different engine fingerprint are rejected; Challenge scores are not included. The R-course bridge now respects IT/EN in all 31 labs and exported worksheets, except lesson 62 (English only). See [the D/E roadmap](docs/ROADMAP_MACROFASI_D_E.md), [the protocol](docs/MACROFASE_D_PROTOCOLLO.md) and [the technical report](docs/MACROFASE_D_RELAZIONE_CANDIDATE.md). **GNU R acceptance on this new D build and release are still pending.**

## What is StatAtlas?

StatAtlas is a standalone, offline-capable HTML/CSS/JavaScript learning platform comprising **31 interactive statistics laboratories in eight parts**. Topics span probability distributions, simulation, the law of large numbers, the central limit theorem, estimation, likelihood, confidence intervals, hypothesis testing, regression, GLMs, regularization, supervised learning, unsupervised learning, and spatial statistics.

Each lab presents a guiding question, a reproducible interactive experiment, interpretative results, mathematical material, **three Challenges**, a link to the related R curriculum, and an R code export. The atlas runs without a backend, registration or runtime package installation. External R-course links need internet access.

## Italian / English bilingual curriculum

Use the **IT / EN** language switch in the interface. This edition includes:

- English titles, brief descriptions, and **124 learning objectives** (four for each of the 31 labs), along with localised interface buttons, controls, menus, chart labels, and common feedback messages.
- **31 independently edited English scientific companions** (question, experiment, essential interpretation, methodological extension and limitations).
- **62 substantive English methodological chapters**, one essential and one advanced for every lab; **31 English worked numerical examples**; and **104 English practice exercises with solutions**.
- **All 93 Challenges in English**, including questions, the three answer options, theoretical explanations, activity instructions, and specialist laboratory tasks. Correct-answer indices, numerical prerequisites, and simulation evaluation functions remain unchanged.
- **31 English R-course bridges and downloadable English student worksheets**. Linked course pages may still be published in Italian; links are labelled accordingly instead of being misrepresented as English content.
- English prose comments on the **31 exported R scripts** (174 translated default comment lines); code, package names, inline strings, data-generation processes and RNG remain unmodified. Commented example R calls remain valid R code.
- Keyboard navigation, mobile language controls, a skip link, dialog focus management, and reduced-motion support.

**Editorial scope:** English is a carefully authored **self-contained scientific edition**, not a sentence-by-sentence translation of every original Italian paragraph. The original Italian chapters and scholarly references are preserved for comparison. Certain dynamic explanatory annotations or text emitted by specialised plots may continue to use original terminology; this does not imply bilingual equivalence of every possible UI state. See [translation coverage and limitations](docs/MACROFASE_C_STATO_TRADUZIONI.md).

## Laboratory map

| Part | Field | Labs |
|---|---|---|
| I | Probability distributions, bivariate variables and simulation | 01–03 |
| II | LLN, CLT and goodness of fit | 04–05 |
| III | Estimators, likelihood, confidence intervals and hypothesis tests | 06–09 |
| IV | Regression, robust loss functions, GLMs and ARMA | 10–13 |
| V | Quantile/penalized regression, smoothers and segmented models | 14–17 |
| VI | Validation, kNN, tree ensembles, boosting and neural networks | 18–22 |
| VII | Principal components, hierarchical/k-means clustering and DBSCAN | 23–25 |
| VIII | Moran, LISA, point processes, variograms, kriging and spatial regression | 26–31 |

Labs 01–25 have a speed slider from **0 to 100 (default 25)**; the six spatial labs use immediate interactive map updates. Probability and inference labs 01–09 support selected sample sizes of **10, 100, 1,000, 10,000 and 100,000** when meaningful. Computationally demanding plots can display fewer markers without reducing the observations used for statistics.

## Build and local acceptance

Run `python3 build.py` to regenerate the self-contained `index.html`. Users can open this file offline. The project tests require Node.js, Python 3, NumPy/SciPy, Playwright/Chromium, GNU R and the R packages checked by `tests/check_r_packages_C.R`.

From the extracted project root, with the intended Python environment selected:

```sh
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_C.sh > MACROFASE_C_COLLAUDO.log 2>&1
echo "Exit code: $?"
```

This command includes the previous Macrophase A/B suites; validates **all 31 executable R exports**; checks 31 English lab routes, 93 English Challenges, 62 theory views, 104 exercises, and accessibility smoke tests; acquires browser snapshots from the **current build**; generates and executes 25 R/JavaScript numerical comparisons; and refuses stale results, skipped cases and mismatches.

**Acceptance evidence for this exact build:** laboratory groups 01–16 passed 48 numerical checks, and laboratories 17–25 passed 36, with zero skipped or divergent results; the all-25 gate passed. All 31 R exports parsed and executed successfully. Matching selected metrics is evidence of numerical parity for the *tested default scenarios* (R1), **not** proof of universal algorithmic equivalence (R2). See [Mac acceptance report](docs/MACROFASE_C_ACCETTAZIONE_MAC_2026_11_17.md).

On each GitHub push, the fast CI runs only the build and JavaScript checks. Larger checks run locally before release or via an explicit manual workflow. The repository's publication script has a separate dry-run mode; do not push a C candidate that has not passed the matching local gate.

## Accessibility and scientific limitations

Automated checks cover mobile responsiveness, keyboard use, focus management, document language and reduced motion. They **do not certify WCAG 2.2 AA** or replace real VoiceOver/NVDA, Safari, high-zoom and student usability evaluations. Theoretical statements are accompanied by their assumptions; laboratory challenges require empirical work, and their A/B contrasts are descriptive unless experimental independence is warranted. Comprehensive proofs of all cited results and general JS/R parity are outside this candidate's automatic certification.

## Credits, citation and licences

StatAtlas is authored by **Gianluca Sottile**. Its pedagogical approach also draws inspiration from Marcello Chiodi's [Simul2000](https://github.com/marcellochiodi/simul2000), while StatAtlas code and educational materials are independently authored. See [`CITATION.cff`](CITATION.cff), [`LICENSE`](LICENSE), and the [project changelog](CHANGELOG.md). Software is distributed under MIT and educational materials under CC BY 4.0 as specified in the project documentation.

## Roadmap — Phases D and E

The development plan for versioned, shareable experiments and the later *StatAtlas for Teachers* composer is in [`docs/ROADMAP_MACROFASI_D_E.md`](docs/ROADMAP_MACROFASI_D_E.md). R course lesson links now follow the StatAtlas IT/EN selection, with the English-only deep-learning exception. A new build requires a fresh validation: the Phase C numerical certificate does not automatically cover it.

### Phase D — Reproducible Experiments (candidate)

Every laboratory offers **Save JSON**, **Open JSON** and **Copy link** (for compact configurations). Snapshots include a build fingerprint, deterministic runner checkpoints or user-edited spatial observations. Loading a snapshot from an incompatible build is refused rather than claiming false reproducibility. Challenge scores are excluded. See [`docs/MACROFASE_D_PROTOCOLLO.md`](docs/MACROFASE_D_PROTOCOLLO.md). This is an unvalidated release candidate pending the full GNU R acceptance test on macOS.
