# StatAtlas Challenges — correzione tracciamento e verifiche specifiche

Data: 15 novembre 2026. Base: archivio `statatlas21_codice.zip` (31 lezioni, 93 sfide). Non sono stati alterati RNG, stime, funzioni di rischio o equazioni statistiche.

## Problema riprodotto

Nella seconda sfida del LAB 21 (Gradient Boosting) si modificava il learning rate ma la schermata mostrava **azioni registrate: 0**. La gestione `onchange` del controllo eseguiva `restart()`, che ricostruiva il pannello; il precedente listener `change` era registrato su `page` in fase di bubbling e non riceveva l'evento dal nodo già rimosso. Il test Chromium ha riprodotto `steps=1`, `changes=0` dopo modifica e passo.

## Correzione implementata

1. Listener `change` in capture phase sul contenitore del laboratorio. Copre input numerici, select, checkbox e slider; esclusa la velocità di animazione. Un listener `click` in capture registra gli eventuali selettori segmentati (per esempio il modello degli stimatori).
2. Ogni passo del runner condiviso registra il valore dei parametri correnti. Nel LAB 06 (runner proprietario) la chiamata di conteggio è centralizzata, senza alterare l'algoritmo.
3. Gli snapshot delle Challenges conservano la storia di modifiche e configurazioni utilizzate. I contatori non si azzerano quando il laboratorio ricostruisce l'esperimento; ripartono da zero soltanto per una nuova sessione/nuova baseline della sfida.
4. Le 84 sfide aggiuntive usano due controlli pertinenti per laboratorio: il livello Applicazione esige che il valore sia modificato e che vengano eseguiti due passi con quel valore; l'Avanzato esige due configurazioni effettivamente esplorate e almeno cinque passi complessivi. Comprensione esige almeno un passo successivo all'apertura. Le 9 regole pilota sono conservate.
5. Il progresso viene mostrato nella scheda in tempo reale. Aggiunto «Vai ai controlli» per facilitare l'uso su schermi piccoli.

## Verifiche effettivamente eseguite

- `python3 build.py`: riuscito, generazione HTML offline.
- `tests/test_challenges_full.js`: **938 asserzioni** superate su 31 lezioni e 93 sfide, inclusi controlli contrari (parametro non pertinente, passi senza modificare il parametro, confronto su una sola configurazione, risposta errata).
- **19/19 suite JS** superate, senza modifiche ai motori numerici.
- Chromium E2E su **84/84 sfide estese**: apertura, selezione del controllo pertinente, generazione di passi, verifica risposta, cambio di due configurazioni e assenza di errori JS. Test suddiviso in tre blocchi per evitare limiti temporali del browser automatico.
- Chromium: GBM, cambio learning rate da 0.1 a 0.2 e due passi → `steps=2`, `edits=1`, sfida pronta. Screenshot desktop e mobile. Nessun overflow orizzontale osservato nelle due viewport della preview.
- La verifica indipendente dei pacchetti R **non è stata ripetuta**, perché il motore numerico è invariato.

## Limiti e riserve

- I controlli registrano **azioni e configurazioni realmente utilizzate**, ma non dimostrano automaticamente la comprensione causale o metodologica: restano prove formative con risposta e feedback specifici.
- Confrontare due impostazioni non significa necessariamente che lo studente abbia isolato un singolo fattore se modifica anche altri parametri: l'interfaccia didattica dovrebbe invitare a mantenerli costanti.
- La sessione delle sfide è volatile, non vengono registrate valutazioni individuali o inviate informazioni a server.
- Test in Chromium emulato, non certificazione su Safari iOS reale.

## Come replicare

```bash
python3 build.py
node tests/test_challenges_full.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_targeted_browser.py 0 10
python3 tests/test_challenges_targeted_browser.py 10 19
python3 tests/test_challenges_targeted_browser.py 19 28
```

## File interessati

- `src/core/challenges.js` — registrazione eventi, stati, contatori e accesso ai controlli.
- `src/core/challenges-curriculum.js` — 28 coppie di parametri e 84 condizioni scientificamente pertinenti; wrapper runner.
- `src/labs/06-stimatori.js` — utilizzo del registratore dei passi con runner proprietario.
- `src/styles/challenges.css` — box di stato.
- `tests/test_challenges_full.js`, `tests/test_challenges_targeted_browser.py` — test.
- `README.md`, `CHANGELOG.md` — documentazione.
