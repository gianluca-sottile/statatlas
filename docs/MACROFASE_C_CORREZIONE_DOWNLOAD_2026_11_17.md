# Macrofase C — correzione del collaudo download, 17 novembre 2026

## Evidenza osservata

Il collaudo `MACROFASE_C_COLLAUDO(2).log` termina in `tests/test_course_bridge_browser.py` dopo la build e i controlli JavaScript/scientifici, con un `AssertionError` sul nome della scheda scaricata. Il blocco e` anteriore alle esecuzioni R del nuovo gate.

## Diagnosi e intervento

La versione italiana scaricava erroneamente `StatAtlas_01_student_worksheet.md` invece del nome compatibile con la Macrofase B, `StatAtlas_01_scheda_studente.md`. La versione inglese scarica distintamente `StatAtlas_01_EN_student_worksheet.md`. E` stata corretta unicamente l'espressione che forma il nome di download in `src/core/course-bridge.js`; il contenuto bilingue delle schede e gli algoritmi statistici sono invariati.

Il test `tests/test_course_bridge_browser.py` e` stato ampliato: verifica i quattro download italiani originali su laboratori 01, 22, 26 e 31 e un download inglese su laboratorio 01, su viewport 390 e 1366 px. Su mobile apre/chiude il menu prima di cambiare lingua.

## Verifiche locali

- Test browser corso R a 390 e 1366 px: 31 laboratori PASS in ciascuna esecuzione, con 4 schede IT e 1 EN scaricate e verificate.
- 28 suite JavaScript PASS; 31 controlli scientifici indipendenti e 11 spot-check PASS.
- Browser bilingual a 390/1366: 31 laboratori, 93 Challenges, 62 pannelli teorici e 104 esercizi PASS.
- Accessibilita` smoke e localizzazione dei commenti R: PASS su 31 file, 174 commenti esplicativi tradotti senza alterare le istruzioni R.
- Responsive a 320, 390, 768 e 1024 px: 31/31 PASS.
- Comparazioni copertura con SciPy: 15/15 PASS.
- Esportazioni R: 31 script rigenerati dal browser, byte-identici agli script inclusi nella candidate precedente. Gli snapshot dei 25 laboratori sono uguali nel contenuto numerico; sono stati rigenerati per la nuova build.
- SHA-256 build HTML attuale: `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`.

## Limite di certificazione

I nuovi benchmark R per la build corrente sono stati rigenerati ma NON sono stati eseguiti con GNU R in questo ambiente. Il collaudo completo `tests/run_macrofase_C.sh` va ancora superato sul Mac, e i risultati numerici della build precedente non vanno trasferiti automaticamente alla nuova build. Nessuna modifica e` stata pubblicata su GitHub.
