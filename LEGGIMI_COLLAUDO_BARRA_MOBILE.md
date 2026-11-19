# StatAtlas 2.1 — Pacchetto unico per collaudo della barra mobile adattiva

Data di preparazione: 19 novembre 2026. **Stato: candidate da verificare su Mac/Safari; non pubblicata.**

## Contenuto

Questa e' una copia integrale e autonoma del repository `statatlas-main`: `index.html` offline, sorgenti `src/`, 31 laboratori, StatAtlas for Teachers, esempi di percorsi studente autosufficienti, script di build/test/publishing, documentazione e risorse. La barra mobile e' gia' integrata nel file principale e negli HTML studenti. Non e' una patch separata da applicare a un'altra release.

La barra riprende gli stessi pulsanti del simulatore: Avvia/Pausa, Passo, Completa, Reset; nei sei laboratori spaziali presenta strumenti contestuali e ripristino. La barra sostituisce temporaneamente la navigazione mobile inferiore quando il grafico/mappa e' visibile e i comandi originali non lo sono. Si nasconde su desktop, con tastiera virtuale, quando i controlli originali tornano visibili e durante i pannelli/modalita' incompatibili. Laboratorio 15: barra solo nella vista Percorsi. Calcoli, sorgenti dei 31 laboratori e motore RNG invariati rispetto alla candidate di partenza.

Dettagli e anteprime: `docs/UX_MOBILE_TRANSPORT.md` e `docs/UX_MOBILE_TRANSPORT_*.png`.

## Pre-verifiche eseguite nell'ambiente di preparazione (Chromium, NON Safari)

- Integrita' archivio e ricostruzione da `build.py`: PASS; HTML ricostruito identico byte per byte.
- SHA-256 di `index.html`: `f6b63107b4d2fd56acd774dc53c988ae8324d372a65028bd2597986ea6e55374`.
- Test barra a 320 e 390 px: 31/31 laboratori, proxy di Avvia/Pausa/Passo/Reset, modalita' mappe, overlay, cleanup, assenza di duplicazione della navigazione: PASS.
- Test di compatibilita' a 600, 768 e 1366 px (casi campione), lingua EN a 390 px e studente HTML autonomo: PASS.
- UX workbench e toolbar a 390 e 1366 px: 31/31 laboratori per ciascun test: PASS.
- Campo titolo obbligatorio in StatAtlas for Teachers: IT/EN, 390/1366 px: PASS.
- Superficie inglese visibile: 31/31 laboratori, live steps, tabelle delle reti neurali e quattro link footer: PASS, `REMAINING []`.
- 16 suite Node.js selezionate, inclusi calcoli di probabilita', ML, geostatistica, kriging, regressione spaziale, schemi Teachers e formatter R: PASS.
- 31/31 controlli scientifici indipendenti e 11 verifiche matematiche aggiuntive: PASS.

**Non attestato in questo ambiente:** esecuzione GNU R dei 31 script, confronti numerici R/JS, suite di accettazione completa `run_macrofase_UX.sh`, test nativo Safari `file://`, VoiceOver e prova tattile su iPhone reale. L'accettazione finale richiede questi collaudi; le verifiche precedenti sulla candidate non sostituiscono i gate della nuova build. I report che attestano il collaudo completo vengono generati dagli script, non sono precompilati.

## Un solo collaudo finale su Mac

1. Estrarre questo ZIP in una cartella nuova, evitando di sovrapporlo a copie precedenti. Aprire Terminale nella cartella `statatlas-main` estratta.
2. Usare l'ambiente Python, Node.js e GNU R gia' configurato per StatAtlas. Eseguire:

   ```sh
   sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1
   echo $?
   tail -n 40 MACROFASE_UX_COLLAUDO.log
   ```

   Atteso: exit code `0`, riga `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED`, 31 esecuzioni GNU R e verifiche R/JS su questa stessa build. Se il comando non termina con esito 0, interrompere il rilascio e condividere il log.
3. Aprire da Finder in Safari `index.html`. Su viewport mobile (e, se possibile, iPhone fisico), andare a **Intervalli** e **LGN/TCL**. Scorrere fino al grafico: verificare che la barra rimanga cliccabile, senza coprire il contenuto; provare Avvia -> Pausa -> Passo -> Reset e verificare che i comandi originali risultino coerenti. Scorrere fino ai controlli nativi: la barra deve nascondersi. Verificare sia IT sia EN, rotazione/orientamento, tastiera e zoom.
4. Ripetere su **Moran** e **Kriging**: selezionare gli strumenti della barra, toccare la mappa, verificare il risultato. Su **Penalizzata** la barra deve essere assente nella vista geometrica e disponibile nella vista Percorsi.
5. Aprire **Mettiti alla prova**, **Guida**, **Approfondisci** e **Codice R** mentre la barra e' visibile: deve nascondersi e riapparire alla chiusura senza salti di scroll.
6. In **StatAtlas for Teachers**, creare un percorso, verificare che il titolo sia obbligatorio e generare un HTML studente. Aprire quel file autonomo da Finder in Safari e ripetere la prova mobile. Verificare il corretto avanzamento dell'esperimento.
7. Solo dopo tutti i PASS, eseguire il **dry-run senza pubblicazione**:

   ```sh
   sh scripts/pubblica_github.sh --no-push
   ```

   Verificare output e modifiche proposte. **Non eseguire il comando senza `--no-push` durante il collaudo.**

L'esperimento forma report studenti locali e modificabili: non usarli come registri certificati di esame. La Macrofase F Classroom non e' inclusa.
