# StatAtlas 2.1 — rettifica del test mobile/tablet (19 novembre 2026)

## Diagnosi del log Mac

Il collaudo `MACROFASE_UX_COLLAUDO.log` ha superato le dipendenze GNU R, i gate JS/scientifici iniziali, i controlli indipendenti 31/31 e i smoke browser su 31 laboratori a 320, 390, 768 e 1024 px. Ha poi interrotto `tests/test_mobile_tablet.py` su `Locator.click` di `.lab-mobile-nav button` con testo `Parametri`, perche' il pulsante risultava nascosto (timeout 30000 ms).

## Causa

Il contratto UX nuovo, introdotto dalla barra mobile contestuale, prevede che `.lab-mobile-nav` sia nascosta quando `.sa-mobile-transport` e' visibile. In Kriging a 390 px la mappa inizia gia' nel primo viewport, quindi la barra dei comandi della mappa e' correttamente attiva da `scrollY=0`. Il test ereditato dalla fase precedente pretendeva invece di cliccare la nav storica, che in questa configurazione non deve essere utilizzabile. I due controlli non possono e non devono restare sovrapposti.

## Rettifica

Modificato **solo** `tests/test_mobile_tablet.py`: ora verifica prima a 390 px la presenza della barra flottante e l'assenza di sovrapposizione con la vecchia nav; passa quindi a un viewport tablet touch di 768 px e controlla che la nav nativa ritorni operativa per `Parametri`, `Mappa`, `Risultati` e `Inizio`. Restano inoltre i controlli degli overlay e dei tab di teoria. Il test specializzato `tests/test_UX_mobile_transport.py` continua a verificare su smartphone le vere azioni mappe e simulazioni, oltre ai comandi sincronizzati di Avvia/Pausa/Passo/Reset.

**Nessuna modifica a:** `src/**`, `index.html`, algoritmi, grafici, formule, dati, codice R, impostazioni del docente, guida Teachers, footer Teachers, esportazioni R o esempi studenti. Non serve rigenerare gli artefatti con fingerprint: l'impronta HTML rimane invariata.

## Verifiche qui eseguite (Chromium Linux)

- `python3 tests/test_mobile_tablet.py`: PASS 31/31 a 320/390/768/1024 px, PASS nav touch/tablet e tab teoria, PASS zoom grafici classici.
- `python3 tests/test_UX_mobile_transport.py --width 390 --spot`: PASS azioni native, mappe, barra, drawer e HTML studente standalone.
- `python3 tests/test_UX_mobile_transport.py --width 768 --spot`: PASS, barra nascosta fuori da smartphone.
- `node tests/test_UX_contract.js`: PASS.
- `python3 build.py`: contenuto di `index.html` byte-per-byte invariato, SHA-256 `8ea57c17499fae9662e552f6835c214d18bafa794bdee664196394ba3fa3814b`.

Il collaudo integrale `run_macrofase_UX.sh` richiede GNU R e Safari nativo, non disponibili qui. Gli esiti precedenti del log Mac non si considerano una certificazione delle fasi non ancora eseguite.

## Ripresa sul Mac

1. Estrai il nuovo ZIP integrale in una **nuova cartella**.
2. Attiva l'ambiente Python precedentemente configurato nella vecchia candidate (o crea e configura `.venv` qui). Da `statatlas-main` esegui: `source .venv/bin/activate` (se l'ambiente e' stato creato in questa cartella).
3. Esegui `sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1; rc=$?; echo "Codice di uscita: $rc"; tail -n 40 MACROFASE_UX_COLLAUDO.log`.
4. Esito atteso: `0` e `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED`. Il collaudo finale Safari/file:// e il dry-run GitHub rimangono obbligatori e separati.

Nessun push GitHub e' stato eseguito.
