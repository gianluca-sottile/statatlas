# StatAtlas 2.1 — verifiche dopo le rettifiche teoriche

**Data:** 16 novembre 2026. **Ambiente di lavorazione:** Python, Chromium/Playwright, Node.js; **GNU R non disponibile in questo ambiente**.

## Risultati ottenuti

- Build finale `python3 build.py`: riuscita, `index.html` unico (63 script).
- `node tests/test_*.js`: 24 suite JavaScript superate, incluso il nuovo `test_formal_theory_31.js`.
- `python3 tests/test_science_independent_31.py`: 31 controlli tematici superati.
- `python3 tests/test_scientific_claims.py`: 11 controlli metodologici superati.
- `python3 tests/export_r_live_31.py`: esportazioni R della **pagina generata effettiva** 31/31, file tracciati con hash MD5 e SHA-256. Lunghezza massima delle righe: 164 caratteri.
- `python3 tests/test_pedagogy_browser.py --start 1 --stop 16`: 16/16 laboratori completi.
- `python3 tests/test_pedagogy_browser.py --start 21 --stop 31`: 11/11 laboratori completi.
- Nella corsa browser intermedia ai laboratori 17-31, i laboratori 17-20 hanno emesso PASS prima dell'interruzione per timeout della sessione (non e un test finale dell'intera corsa 17-31).
- `python3 tests/test_mobile_tablet.py`: 31/31 su 320, 390, 768 e 1024 px, menu touch e zoom grafici superati.
- `sh -n scripts/pubblica_github.sh`: sintassi shell valida; in assenza del report R 31/31 il gate blocca correttamente il comando `--no-push` prima di clonare o modificare GitHub.

## Risultati NON acquisiti in questa sessione

- Esecuzione di `Rscript verifica/valida_tutti_31.R` in GNU R (non installato nell'ambiente dell'assistente); preparato per il Mac dell'autore.
- Confronto quantitativo **R/JS corrente** dei laboratori 01-25 per ogni singola metrica: l'esecuzione priva di errori non lo implica.
- Verifica della pipeline remota GitHub, del sito Pages dopo eventuale push, Safari su dispositivi reali e validazione dell'apprendimento con studenti.

## Indicazione per la decisione

Il pacchetto e una **release candidate di prepubblicazione**. I test presenti forniscono evidenza dell'assenza dei difetti di regressione specificati, non certificazione universale di tutti i teoremi, implementazioni o browser. Il successivo unico collaudo macOS deve allegare `MACROFASE_A_R31.log` e `verifica/REPORT_VALIDAZIONE_R_31.csv`; il report deve contenere 31 righe PASS. La validazione didattica si svolgera dopo il completamento del repository, come stabilito dall'autore.
