# StatAtlas 2.1 — Relazione di sviluppo della Macrofase E

**Data:** 17 novembre 2026 · **Stato:** candidate da collaudare sul Mac, non pubblicata.

## Realizzato

- Nuovo modulo offline `src/core/teachers.js`, foglio di stile `src/styles/teachers.css`, percorso `#/teachers` con accesso dalla navigazione IT/EN.
- Compositore multistep per 31 laboratori, con ripetizione e riordino dei laboratori; titolo, destinatari, obiettivi, consegne, durata e selezione granulare delle 93 Challenges.
- Assegnazione di preset di Macrofase D da JSON o con cattura diretta dal laboratorio aperto.
- Progetto docente JSON editabile e reimportabile, con schema `statatlas.teaching-path` v1, controlli sui riferimenti delle Challenges e sulla compatibilità dell'engine.
- HTML studenti singolo, autosufficiente e senza librerie remote, con il motore StatAtlas completo, navigazione guidata, Challenges selezionate, attività completate e riflessioni.
- Report formativo JSON locale `statatlas.student-report` v1; nessuna raccolta automatica, nessun identificativo studente, avanzamento cancellabile dal browser.
- Test browser desktop/mobile per export e importazione, due lab, preset con checkpoint D, filtro Challenges, navigazione, report e stringhe non attendibili.

## QA svolto nell'ambiente di sviluppo

- [x] Build HTML autosufficiente (74 moduli JavaScript) e controllo sintassi.
- [x] 30 suite JavaScript, inclusa nuova verifica `test_E_schema.js`.
- [x] 31 controlli scientifici indipendenti, 11 spot-check matematici.
- [x] 31/31 round-trip della D in Chromium a 390 e 1366 px.
- [x] Switch bilingue Macrofase C (31/31 a 390 e 1366 px).
- [x] Compositore e HTML studenti a 390 e 1366 px, senza errori JS.
- [x] Sequenza a due laboratori con preset checkpoint e progressi/report EN.
- [x] Ripetizione dello stesso laboratorio con checkpoint differenti, navigazione in entrambe le direzioni.
- [x] UI con note e titoli escapati, filtri Challenge e vincoli di navigazione.

## QA ancora necessario

- [ ] Eseguire su Mac il gate unico `sh tests/run_macrofase_E.sh` con **GNU R 31/31** e **84 comparazioni R/JS** aggiornate al nuovo fingerprint.
- [ ] Aprire HTML studenti direttamente da Finder/Safari (`file://`), controllare passaggio tra tappe, uso offline, cambio lingua e scaricamento del report.
- [ ] Verificare Git dry run, singolo push su GitHub, Actions e GitHub Pages.

**Limiti metodologici:** i test R/JS attestano concordanza negli scenari predefiniti R1, non R2 universale. I report HTML/JSON di percorso sono liberamente modificabili dagli studenti e non consentono valutazioni certificative. Accessibilità manuale con lettori di schermo e valutazione dell'efficacia didattica restano attività successive.

## Evidenze visive e progetto dimostrativo

- [Schermata del compositore docente](MACROFASE_E_TEACHERS_DESKTOP.png)
- [Schermata del percorso studente su smartphone](MACROFASE_E_STUDENT_MOBILE.png)
- `examples/E_progetto_campionamento.json` e `examples/E_percorso_campionamento.html`: esempio italiano di tre attività, generato dalla stessa build della candidate. Non è un modello d'esame né certifica che i learning outcomes siano raggiunti.
