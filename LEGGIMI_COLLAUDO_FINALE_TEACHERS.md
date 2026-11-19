> **Rettifica QA del 19 novembre 2026:** il primo collaudo Mac ha incontrato un timeout nel test storico `test_mobile_tablet.py`, non nel motore statistico. La nuova barra mobile nasconde deliberatamente la navigazione precedente quando si osserva una mappa. In questa revisione e' stato corretto solo il test, senza cambiare l'applicazione HTML. Dettagli e prove in `docs/COLLAUDO_NAVIGAZIONE_MOBILE_2026_11_19.md`. Utilizzare sempre questa candidate integrale, non una patch sovrapposta.

# StatAtlas 2.1 — Candidate consolidata: barra mobile + Teachers + guida + footer

Preparazione: 19 novembre 2026. **STATO: candidate per collaudo su Mac/Safari; NON pubblicata su GitHub.**

## Che cosa contiene lo ZIP

Un solo repository completo `statatlas-main/`, con i 31 laboratori, l'HTML principale offline (`index.html`), la barra mobile adattiva gia' integrata, la sezione `StatAtlas for Teachers`, la verifica del titolo obbligatorio, la nuova guida rapida in sei passaggi IT/EN e la correzione strutturale dell'allineamento del footer docente. Include sorgenti, test, documentazione, 31 esportazioni R, esempi JSON e HTML studenti ricostruiti con questa build, e schermate di riferimento in `docs/TEACHERS_GUIDE_*.png` e `docs/TEACHERS_FOOTER_*.png`.

La guida estesa, pensata anche per chi non programma, e' in `docs/TEACHERS_GUIDA_PRATICA_IT_EN.md`. La guida rapida e' accessibile direttamente da `index.html` > StatAtlas for Teachers > «Come funziona StatAtlas for Teachers?».

## Modifiche della candidate

- Footer docente: titolo, pagina, area operativa e note finali allineati all'interno dello stesso contenitore centrale; nessuna sovrapposizione all'editor o scorrimento orizzontale.
- Guida integrata: sei passi dalla configurazione al salvataggio del JSON docente e alla distribuzione dell'HTML studenti; disponibile in IT/EN, su desktop e mobile, apribile/chiudibile con tastiera o touch.
- Guida estesa bilingue: esempio di percorso, FAQ, differenza tra JSON docente, HTML studenti e report JSON studenti, assenza di salvataggio automatico del progetto e limiti di compatibilita' delle versioni.
- Nessuna modifica ai file dei 31 laboratori, al motore statistico, alle formule o al generatore casuale.
- Test automatico nuovo: `tests/test_E_teachers_guide_footer.py`, integrato nello script cumulativo `tests/run_macrofase_UX.sh`.
- Manifest delle 31 esportazioni R e i due esempi E (JSON/HTML) allineati all'impronta della nuova build. Le 31 esportazioni R restano invariate nei contenuti.

## Pre-verifiche completate nella preparazione (Chromium, non Safari)

- Nuovo test Teachers + footer: PASS, IT/EN, 320/390/768/1366 px (otto combinazioni).
- Titolo obbligatorio, messaggio d'errore e focus, esportazione JSON/HTML: PASS IT/EN, 390/1366 px.
- Percorsi Teachers, preset, riapertura progetto, report offline studenti, percorso con laboratori ripetuti: PASS.
- Workbench e toolbar UX: PASS sui 31 laboratori a 390 e 1366 px.
- Barra mobile: PASS 31/31 a 320 e 390 px, oltre ai casi di controllo in EN, tablet, desktop e HTML studenti autonomo.
- Superficie inglese: PASS 31/31, `REMAINING []`, inclusi contenuti dinamici e quattro collegamenti footer.
- Tutte le suite Node `tests/test_*.js` (31 file) e i 31 controlli scientifici indipendenti + 11 spot check: PASS.
- Nessun file `src/labs/*.js` modificato rispetto allo ZIP consolidato precedente.
- Build deterministica: ricalcolabile eseguendo `python3 build.py`.

**Non certificato in questo ambiente:** esecuzione GNU R dei 31 script e relative verifiche di parita' sulla nuova impronta, collaudo integrale della macrofase su Mac, Safari reale su `file://`, VoiceOver e prova su iPhone fisico. I certificati precedenti non certificano questa nuova build. I report verranno generati dagli script di collaudo, non sono precompilati.

## Un unico collaudo finale sul Mac

1. Estrai questo ZIP in una cartella nuova. Apri Terminale nella cartella `statatlas-main` estratta (senza sovrascrivere precedenti copie).
2. Con l'ambiente Python/Node/GNU R usato per StatAtlas, esegui **una sola volta**:

   ```sh
   sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1
   echo $?
   tail -n 50 MACROFASE_UX_COLLAUDO.log
   ```

   Atteso: exit code **0**, e `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED`. La suite include il nuovo test Teachers/footer oltre ai gate scientifici R/JS, UX e HTML studenti. Se il risultato e' diverso da 0, non pubblicare e conserva il log.
3. Apri `index.html` direttamente da Finder in Safari. In **StatAtlas for Teachers** prova la guida IT/EN, il pannello Impostazioni, il titolo obbligatorio, l'aggiunta e il riordino di laboratori, il salvataggio JSON e l'HTML studente. Verifica che la riga di separazione del footer inizi allineata alla guida/editor e che i quattro link funzionino. Ripeti a finestra stretta o su iPhone.
4. Apri l'HTML studenti generato in Safari con `file://`; verifica navigazione, sfide assegnate, rapporto locale e barra mobile. Negli intervalli di confidenza e nel TCL usa Avvia/Pausa/Passo/Reset osservando il grafico, poi ripeti su Moran/Kriging per gli strumenti spaziali e controlla che la barra si nasconda con i pannelli.
5. Soltanto dopo i PASS e prima di un eventuale push, esegui il **dry-run**, senza pubblicazione:

   ```sh
   sh scripts/pubblica_github.sh --no-push
   ```

   Controlla l'output. **Non eseguire la pubblicazione durante questo collaudo.**

## Nota di compatibilita'

I JSON docente e i preset includono un identificatore del motore. Un progetto salvato su una vecchia candidate puo' essere rifiutato da una build successiva: conserva il suo file HTML studente e la build di origine, oppure prevedi una migrazione esplicita. Questa revisione non elimina il controllo dell'impronta per non indebolire la riproducibilita'.
