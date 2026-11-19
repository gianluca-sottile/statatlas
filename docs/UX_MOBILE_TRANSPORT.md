# StatAtlas 2.1 — Barra mobile contestuale, senza duplicazione del simulatore

**Stato:** candidate integrale, da collaudare sul Mac prima della pubblicazione.  
**Ambito:** UX dei 31 laboratori, 320–640 px, mobile offline e percorsi studenti E.

## Comportamento

La navigazione inferiore esistente conserva la funzione di passaggio fra Parametri, Grafici/Mappa, Risultati e Inizio. Quando, su smartphone, lo studente osserva il grafico mentre i controlli originali non sono interamente visibili, una barra alternativa occupa **lo stesso spazio** della navigazione esistente. Non ci sono due barre sovrapposte né spostamenti dei grafici. La barra scompare quando i controlli originali tornano visibili, quando si lascia l'esperimento o si apre un pannello didattico, una finestra modale o la tastiera.

- **25 laboratori con runner:** gli stessi comandi **Avvia/Pausa**, **Passo**, **Completa** e **Reset** attivano i pulsanti originali. Stato, progressione, disabilitazione e cambio etichetta sono sincronizzati. Non si crea un secondo timer né un altro RNG.
- **Lab 15, penalizzata:** in modalità geometrica non vi è una simulazione temporizzata, quindi la barra rimane nascosta; passando a *Percorsi* compare il trasporto quando appropriato.
- **Sei laboratori spaziali (26–31):** la mappa precede i comandi; la barra propone le prime due modalità effettivamente presenti (ad esempio + Valore alto / + Valore basso, oppure + Sensore / Sposta), **Strumenti** per scorrere ai parametri e **Reset** per ripristinare la mappa. I pulsanti sono modalità di interazione: l'utente seleziona la modalità e poi interviene sulla mappa. Non equivale a creare automaticamente un nuovo punto.
- **Tablet e desktop:** comportamento precedente invariato (fino a 640 px barra mobile; oltre 640 px nessuna duplicazione).
- **HTML studenti autonomi:** stessi pulsanti, nessun server, nessuna modifica al salvataggio locale o alla selezione Challenges.

Il sistema rispetta le safe area dei telefoni, ha touch-target di almeno 44 px, comandi accessibili da tastiera, layout IT/EN e interviene solo sulla presentazione. La chiusura dei pannelli ripristina il focus senza portare automaticamente la pagina all'inizio (`focus({preventScroll:true})`).

## Verifiche

- Chromium: 31 laboratori su viewport 320 px e 390 px; casi rappresentativi a 600/768/1366 px; prova IT e EN.
- Verifica click sui pulsanti originali, Avvia→Pausa, Passo, Reset, strumenti e modalità spaziali, assenza sovrapposizioni, focus e smontaggio alla navigazione.
- Percorso studenti single-file offline generato realmente da StatAtlas for Teachers, con avanzamento del runner.
- Regressioni esistenti JavaScript, scientifiche indipendenti, export R e snapshot numerici invariati rispetto alla candidate precedente; esecuzione GNU R e 84 confronti R/JS sul nuovo HTML da eseguire sul Mac.
- Limiti: non è un test su Safari fisico né un audit con VoiceOver. Aprire un file studente da Finder in Safari e ripetere touch, scroll, orientamento, apertura dei pannelli e tastiera virtuale prima del push.

## Consegna e pubblicazione

Eseguire **una sola volta** `sh tests/run_macrofase_UX.sh` sulla cartella estratta sul Mac. Atteso `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED`; il report UX include il gate `mobile_floating_transport = PASS` legato esattamente all'hash della build. Solo dopo verifica manuale Safari e dry-run `sh scripts/pubblica_github.sh --no-push`, effettuare un unico `sh scripts/pubblica_github.sh`. La Macrofase F (Classroom) non è inclusa.
