# StatAtlas 2.1 — Teachers onboarding e footer, candidate del 19 novembre 2026

## Problema osservato

Nello screenshot Safari della vista `#/teachers`, il footer iniziava dal margine della colonna principale anziche' dal margine sinistro dell'editor centrato. La barra orizzontale e le righe di attribuzione apparivano quindi disallineate rispetto alla superficie di lavoro. In aggiunta, un docente che non conoscesse il formato del progetto doveva dedurre il flusso di lavoro dai nomi dei controlli.

## Risoluzione

- `src/core/app.js`: la vista Teachers monta editor e footer nello stesso `div.teacher-page`.
- `src/styles/teachers.css`: contenitore con misura uniforme, padding responsive, footer allineato e tipografia a capo; layout responsivo per la guida e supporto del tema scuro.
- `src/core/teachers.js`: disclosure nativo `details` con sei istruzioni operative, versioni IT e EN, inizialmente aperto e preservato quando viene modificata la sequenza.
- `docs/TEACHERS_GUIDA_PRATICA_IT_EN.md`: guida completa, FAQ, scenari applicativi e limiti di persistenza.
- `tests/test_E_teachers_guide_footer.py`: controllo reale nel browser dei collegamenti, margini, assenza di overflow, contenuti, apertura e compatibilita' coi drawer.

## Evidenza e limiti

| Controllo | Risultato |
|---|---|
| Footer in asse con `.teacher-builder` | PASS in Chromium, 320/390/768/1366, IT e EN |
| Guida apribile e persistente tra riedizioni della sequenza | PASS in otto configurazioni |
| Workbench e toolbar invariati, tutti i 31 laboratori | PASS 390/1366 |
| Barra mobile tutti i 31 laboratori | PASS 320/390 |
| Titolo obbligatorio ed export docenti | PASS IT/EN 390/1366 |
| E teacher, preset, report locali | PASS |
| Contenuti dinamici EN nei 31 laboratori | PASS: `REMAINING []` |
| 31 suite di test Node, 31 controlli scientifici, 11 spot check | PASS |
| Esecuzione GNU R, Safari file:// e touch fisico | DA ESEGUIRE SU MAC |

Rispetto alla candidate di partenza, i 31 file `src/labs/*.js` sono identici byte per byte. Impronta HTML attesa della candidate: `8ea57c17499fae9662e552f6835c214d18bafa794bdee664196394ba3fa3814b`. Gli screenshot Chromium in `docs/TEACHERS_GUIDE_*` sono anteprime, non prove Safari.

L'archivio e' una candidate completa. Non e' stato effettuato alcun push GitHub; l'attestazione completa richiede lo script `run_macrofase_UX.sh` e la prova nativa descritti nel LEGGIMI.
