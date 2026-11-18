# StatAtlas 2.1 — Protocollo di redesign UX (post-Macrofase E)

**Stato:** candidate UX completa, non pubblicata. **Base:** Macrofase E per docenti, collaudata su Mac il 17/11/2026 (SHA HTML `0fcdd824...`). La build UX ha fingerprint differente: la certificazione R va ripetuta sulla nuova build.

## Obiettivo pedagogico

Ridurre il carico cognitivo e dare priorità al ciclo **osserva → sperimenta → interpreta → approfondisci**, senza rimuovere teoria, guida, Challenges, collegamenti R o funzionalità di riproducibilità delle macrofasi precedenti. L'estetica resta editoriale, rigorosa e caratteristica di StatAtlas. I principi tratti da `taste-skill` sono gerarchia, spaziature coerenti, qualità del contenuto e verifica visiva; NON si importano automaticamente hero di marketing, effetti decorativi o librerie runtime.

## Architettura di interazione

- **31 laboratori:** testata corta, simulatore immediatamente dopo la barra azioni; guida, quattro obiettivi, eventuale companion EN, istruzioni originarie, illustrazione e collegamenti R sono ACCESSIBILI in pannelli overlay non distruttivi. Il codice R e le modalità di esportazione JSON rimangono funzionanti.
- **Pannelli overlay:** `position:fixed`, backdrop, focus iniziale sul pulsante Close, trappola Tab, Escape, ritorno del focus al pulsante di apertura; contenuto DOM originale spostato anziché duplicato per non alterare listener, target e dati. Il contenuto non deve cambiare coordinata Y all'apertura/chiusura.
- **Mobile:** comandi touch, barra azioni e navigazione locale ai controlli/grafici/risultati. I controlli scientifici rimangono utilizzabili. Pannelli alla larghezza disponibile, scorrimento interno.
- **Catalogo:** 31 laboratori filtrabili da casella di ricerca; indice prima della lunga introduzione, guide supplementari comprimibili.
- **Teachers:** editor master-detail (indice delle attività e una sola scheda in modifica); impostazioni percorso, salvataggio/caricamento ed esportazione HTML in un pannello sovrapposto.
- **Student HTML:** navigazione del percorso e simulazione in primo piano; riflessione, completamento e report JSON in pannello sovrapposto, sempre locale; nessuna valutazione certificativa.
- **Offline / privacy:** nessun backend, tracking o dipendenza CDN. Gli URL esterni al corso R rimangono volutamente online e la lingua IT/EN governa la destinazione.

## Confini di modifica

Nessun intervento sui nuclei numerici, sull'RNG, sulle condizioni di verifica dei Challenges, sui dati generati e sugli script R esportati. La compatibilità delle vecchie interfacce HTML interne ai test browser richiede aggiornare i selettori, non ripristinare il layout ingombrante. Lo schema JSON D/E contiene un fingerprint e non promette compatibilità fra build senza migrazioni.

## Test di accettazione automatizzata

`PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1`

L'unico gate richiama integralmente i test A–E (incluse 31 esecuzioni GNU R e 84 confronti R/JS su scenari predefiniti R1), poi testa i 31 laboratori a 390/1366 px, apertura e chiusura pannelli senza reflow, filtro catalogo, selezione docente e contratto statico del build offline. Scrive `verifica/REPORT_MACROFASE_UX.json` associato all'hash esatto di `index.html`. Lo script di pubblicazione richiede questo report e quelli A–E, tutti della stessa build, e non li committa.

Controlli manuali PRIMA del push:
1. Safari desktop: apertura, chiusura e focus di Guida / Corso R / Salva e condividi (anche tastiera Escape/Tab).
2. Mobile Safari: grafico e parametri senza sovrapposizioni, barra inferiore, pinch/zoom se applicabile.
3. Teacher editor: due attività, titolo e consegne, export HTML, apertura da Finder in Safari con Wi-Fi disattivato.
4. Student: completare Challenge, aprire pannello riflessione, esportare JSON formativo locale.
5. Verificare in IT e EN che i link esterni al corso R conducano alla lingua corretta (richiede Internet).

**Limiti espliciti:** smoke WCAG ≠ audit con VoiceOver/NVDA; test sintetici ≠ valutazione d'uso con studenti; 84 comparazioni numeriche = prova R1 sugli scenari testati, non equivalenza generale R2; Safari `file://` va provato sul Mac.

## Pubblicazione

Solo dopo esito `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED` e verifica manuale, eseguire una sola anteprima `sh scripts/pubblica_github.sh --no-push`, controllare il diff e poi un solo `sh scripts/pubblica_github.sh`. La Macrofase F Classroom resta annotata per il futuro: non rientra in questo redesign.
