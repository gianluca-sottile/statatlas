> **DOCUMENTO STORICO — prima candidate tecnica.** Questo testo registra lo stato della candidate PRECEDENTE, non lo stato di rilascio della Macrofase C. Le affermazioni di traduzioni mancanti e gate GNU R non eseguito **sono superate**. Consultare [accettazione Mac 17 novembre 2026](MACROFASE_C_ACCETTAZIONE_MAC_2026_11_17.md), [checklist aggiornata](MACROFASE_C_CHECKLIST_RILASCIO.md) e [matrice di copertura EN](MACROFASE_C_STATO_TRADUZIONI.md).

# StatAtlas 2.1 — Macrofase C: rapporto tecnico e matrice di accettazione

**Data:** 16 novembre 2026  
**Stato:** **candidate tecnica parziale**; **non è ancora la versione inglese completa** e non è pubblicata su GitHub.  
**Baseline:** archivio StatAtlas 2.1 successivo alla Macrofase B, alla scala velocità 0–100 (default 25), alle numerosità 10/100/1000/10000/100000 nei laboratori 01–09 e alla CI leggera. Le Macrofasi A e B sono già pubblicate.

## 1. Che cosa è stato effettivamente realizzato

1. **Fondazione bilingue offline:** selettore IT/EN, preferenza di lingua persistente dove disponibile, attributo HTML `lang` coerente, otto sezioni e 31 titoli/descrizioni inglesi. Nessuna dipendenza online aggiunta al bundle standalone.
2. **31 guide scientifiche inglesi specifiche:** per ciascun laboratorio domanda di ricerca, esperimento, interpretazione essenziale, approfondimento e limiti/assunzioni. Le guide sono nuove sezioni e NON sono traduzioni integrali della lezione italiana. L'originale rimane disponibile e viene marcato `lang=it` in modalità inglese.
3. **Accessibilità mirata:** collegamento skip-to-content, commutatore linguistico azionabile da tastiera, marcatura delle lingue, menu mobile con gestione `inert`, focus nel dialogo e chiusura Escape, supporto `prefers-reduced-motion`, mantenimento delle etichette accessibili.
4. **Protocollo di confronto numerico R/JS su 25 laboratori:** cattura live da Chromium di dati, KPI e codice R con impronta SHA-256 della build; generazione di due script R per i laboratori 01–16 e 17–25; gate che respinge divergenze, controlli mancanti e verifiche realmente saltate; conferma di esecuzione R e confronto numerico distinti.
5. **CI invariata nel principio di leggerezza:** build e suite JavaScript a ogni push; test scientifici/browser estesi solo manuali in GitHub Actions e tramite un unico comando locale.
6. **Documentazione:** `README.en.md`, aggiornamento README italiano, matrice traduzioni, accessibilità, protocollo di parità R/JS, due screenshot EN.

## 2. Risultati che POSSIAMO certificare in questo ambiente

| Verifica | Risultato | Nota |
|---|---|---|
| Build standalone | PASS, 66 script | `python3 build.py` |
| Sintassi e regressioni JavaScript | PASS | Tutte le suite `tests/test_*.js` |
| Controlli scientifici indipendenti | PASS, 31/31 + 11 spot-check | Proprietà mirate, non audit completo di tutte le teorie |
| Guide inglesi | PASS, 31/31 a 390 e 1366 px | La verifica controlla anche il paragrafo essenziale mostrato |
| Accessibilità browser mirata | PASS, 390 e 1366 px | Focus/skip/dialogo/lingue/riduzione movimento |
| Responsive regressione della baseline | PASS locale 320, 390, 768, 1024 px | Dalla suite eseguita durante la fase |
| Acquisizione R live | PASS, 31/31 | Manifest integrità riferito alla build candidata |
| Snapshot numerici per R/JS | PASS, 16 + 9 | Cattura numerica *non equivale* a parità confermata |
| Generazione benchmark R | PASS, due file, nessun `undefined`/`NaN` | Include bootstrap reale del laboratorio 17 |
| **Esecuzione GNU R dei due benchmark nuovi** | **DA ESEGUIRE SUL MAC** | GNU R non installato in questo ambiente |
| **Traduzione integrale lezioni e Challenges** | **NON COMPLETATA** | Vedi matrice in `docs/MACROFASE_C_STATO_TRADUZIONI.md` |
| **Audit WCAG con tecnologie assistive reali** | **NON ESEGUITO** | Gli smoke test non sono una certificazione WCAG |

### Integrità della candidate

`index.html`, `verifica/export_r_31/manifest.csv`, `verifica/snapshots_C_01_16.json`, `verifica/snapshots_C_17_25.json` e gli script `verifica/parita_C_*.R` devono condividere la stessa impronta SHA-256. La verifica locale di questa identità è passata.

## 3. Limiti metodologici della parità R/JS

Lo script del Mac ripete anzitutto l'intera Macrofase B, compresi i 31 script R. Poi acquisisce i valori NUMERICI dei 25 laboratori dalla build corrente, crea i due benchmark R, li esegue e ne confronta i risultati con l'interfaccia. Le tolleranze riflettono principalmente la precisione dei valori mostrati, non certificano l'identità degli algoritmi. Anche in caso di 25 PASS si tratta di verifiche **R0/R1 nei casi osservati**, non di una dimostrazione R2 generale. Per le verifiche R2 vanno ancora esercitati parametri multipli, casi limite, diversi seed e stati intermedi per ciascuna famiglia di metodi. Gli script R dei 6 laboratori spaziali conservano i controlli già acquisiti nella Macrofase B.

## 4. Unico collaudo operativo sul Mac

Estrarre la candidate in una cartella `statatlas-main` e attivare l'ambiente Python dedicato con `numpy`, `scipy`, `playwright` e Chromium. Sono inoltre necessari Node.js e GNU R, con i pacchetti R `tidyverse`, `quantreg`, `glmnet`, `segmented`, `cluster`. Il comando seguente segnala eventuali pacchetti mancanti:

```bash
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_C.sh > MACROFASE_C_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
```

**Criterio di accettazione computazionale:** codice di uscita 0; R 31/31 PASS; due file di confronto R conclusi senza valori DIVERSO/SALTATO; `tests/verify_parity_C.py` PASS; stessa build SHA. I report R sono in `verifica/runs/parita_C_01_16_esiti.csv` e `verifica/runs/parita_C_17_25_esiti.csv`; il log unico è `MACROFASE_C_COLLAUDO.log`. **Non pubblicare automaticamente:** resta anche il gate editoriale della traduzione EN completa.

## 5. Lavori imprescindibili per dichiarare Macrofase C COMPLETA

1. Tradurre e rivedere integralmente i materiali teorici e i due approfondimenti di **31 laboratori**, conservando esattamente notazione, ipotesi e formule dell'originale.
2. Localizzare e verificare il funzionamento delle **93 Challenges** (quesiti, risposte, feedback, condizioni di successo, grafici e dati).
3. Localizzare tutte le stringhe effettivamente mostrate da ogni motore JavaScript, compresi controlli, grafici, tabelle e messaggi d'errore, evitando di tradurre identificatori, dati o codice.
4. Preparare i commenti in lingua inglese degli script R senza alterare riproducibilità o limiti di lunghezza; ripetere R 31/31 dopo qualsiasi modifica al bundle.
5. Svolgere revisione linguistica scientifica, verifica dei riferimenti e delle formule in entrambe le lingue, e un audit accessibilità più approfondito (test con screen reader reali, semantica delle visualizzazioni, WCAG).
6. Eseguire ed eventualmente correggere i benchmark R/JS 01–25 sul Mac; distinguere R0, R1, R2 e R3, senza sovracertificazioni.
7. Soltanto dopo tutti i gate, preparare un singolo push GitHub e verificare Pages e Actions. **La validazione didattica con studenti avverrà a repository completo**.

## 6. Giudizio conclusivo

La **base architetturale bilingue** è implementata, correttamente testata e reversibile; il protocollo per la verifica numerica R/JS è pronto per il Mac. La **Macrofase C resta aperta sul contenuto editoriale e scientifico**: una versione che mostra 31 guide inglesi ma conserva sezioni italiane non deve essere presentata come full English. Il repository online non è stato modificato da questa lavorazione.
