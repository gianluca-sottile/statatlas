# StatAtlas — Piano di sviluppo post-Macrofase C (17 novembre 2026)

## Base certificata

Macrofasi C e D, pubblicate (D commit `80f2ea6`). C, pubblicata sul repository `gianluca-sottile/statatlas`. Collaudo locale: 31/31 script GNU R; 25/25 laboratori, 84 verifiche numeriche R/JavaScript sullo scenario iniziale (R1); 31 laboratori bilingui, 93 Challenges EN, 62 schede teoriche EN. L'equivalenza algoritmica generale R2 **non** è stata dimostrata. Lo studio con studenti e l'audit manuale mediante tecnologie assistive restano distinti.

## Miglioramento del ponte curricolare (intervento preparatorio alla D)

Il corso *From Data to Models with R* è bilingue e usa indirizzi distinti:

- IT: `https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/it/lessons/...`
- EN: `https://gianluca-sottile.github.io/An-R-Tutorial-for-Beginners/lessons/...`

Quando StatAtlas è in EN, i collegamenti alle due lezioni di ciascuno dei 31 laboratori e quelli nelle schede scaricabili devono condurre alle rispettive pagine inglesi. Quando è in IT, conservano le pagine italiane; la lezione 62 (deep learning) rimane EN in entrambe le modalità, perché il percorso facoltativo è disponibile solo in inglese. I riferimenti rimangono collegamenti esterni e richiedono rete; l'atlante resta interamente offline. Verificare per ogni lab lingue, URL, titoli e `lang` dei link.

## Macrofase D — StatAtlas Experiments

**Obiettivo:** configurazioni ed esperimenti esportabili, importabili e condivisibili senza account, database o backend. Nessuna dipendenza esterna runtime, compatibilità col file `index.html` offline.

### D.1 — Schema, sicurezza e interoperabilità

Un manifesto JSON versionato riporta: formato/schema, versione, identificativo univoco del laboratorio, versione/fingerprint del motore, parametri osservabili e seed, eventuale checkpoint della simulazione, istantanea dei punti spaziali e delle osservazioni manuali dei laboratori 10 e 14, istante di esportazione. L'importazione valida identificativi, formati, limiti dimensionali e intervalli; nessuna istruzione arbitraria o HTML è eseguita. Il passaggio IT/EN non cambia il contenuto scientifico dell'esperimento.

### D.2 — Configurazione e ripresa

Per tutti i 31 laboratori, salvare e importare *almeno* la configurazione, il dataset geografico modificato quando presente e la posizione della simulazione quando supportata da un adapter deterministico. La semplice reimpostazione del seed **non** basta a garantire la riproduzione di un esperimento: le operazioni non deterministiche, le scelte interattive e i checkpoint devono essere trattati separatamente. I runner ripristinano il checkpoint applicando il numero documentato di passi a un RNG ripristinato; i laboratori spaziali usano snapshot delle osservazioni e parametri; le regressioni interattive 10 e 14 conservano le coordinate dei punti aggiunti, spostati o rimossi manualmente.

### D.3 — Condivisione

Fornire pulsanti 'Export experiment (JSON)', 'Import experiment (JSON)' e 'Share link' con etichette IT/EN. Il link può contenere soltanto snapshot piccoli entro un limite di lunghezza; per campioni/punti/azioni più corposi usare il file. Il percorso del laboratorio è separato dal payload e non va interpretato come codice.

### D.4 — Qualità e certificazione

Test round-trip per tutti i 31 laboratori; checkpoint iniziale e intermedio in 25 laboratori animati; variazione manuale dei punti nei sei laboratori spaziali e nei laboratori di regressione 10 e 14; cambio lingua; schemi invalidi, payload troppo lunghi, versioni future, valori non validi; browser desktop/mobile e offline; verifiche numeriche con le tolleranze del laboratorio. La corrispondenza tra la build e i report GNU R precedenti va **rivalutata** se il codice cambia. Solo al completamento dei gate può seguire un unico collaudo finale sul Mac e un unico push.

## Macrofase E — StatAtlas for Teachers (collaudo Mac PASS; pubblicazione non confermata in questa documentazione)

**Dipendenza soddisfatta:** la D introduce snapshot versionati e compatibili con il fingerprint del motore. Implementazione disponibile in `src/core/teachers.js`, `src/styles/teachers.css` e vista `#/teachers`:

- 1–24 attività selezionabili anche ripetendo i medesimi laboratori; consegne, destinatari, durata, lingua IT/EN e selezione esplicita delle 93 Challenges, massimo tre per tappa;
- preset D da JSON o cattura dal laboratorio; progetto JSON `statatlas.teaching-path` v1 modificabile e validato;
- HTML offline autonomo contenente la stessa build StatAtlas, percorso guidato, Challenges selezionate, riflessioni e avanzamento locale;
- report formativo `statatlas.student-report` v1 esportabile, niente account né backend; nessuna garanzia antifrode, nessuna raccolta automatica di dati personali;
- test E schema, browser mobile/desktop, ripristino checkpoint D, due attività, report e input ostili.

**Collaudo Mac superato il 17 novembre 2026:** GNU R 31/31 e 84 confronti R/JS sulla build E (soltanto R1), editor e HTML studenti a 390/1366 px, hash `0fcdd8245e8b9ed9780534e5fd53e42c116fb21ac74f5b7bf86fc555f4c661cb`. Il risultato del push E non è attestato in questo documento. L’apertura diretta `file://` in Safari rimane verifica manuale distinta. Vedi [`MACROFASE_E_PROTOCOLLO.md`](MACROFASE_E_PROTOCOLLO.md) e [`MACROFASE_E_CHECKLIST_MAC.md`](MACROFASE_E_CHECKLIST_MAC.md).

## Redesign UX — dopo E, prima di F (candidate implementata, non pubblicata)

Riorganizzazione completa delle viste senza cambiare gli algoritmi statistici: laboratorio scientific-first, Guida/Corso R/Salva in drawer fixed accessibili, catalogo ricercabile, editor docente master-detail e pannello report studente. La Macrofase E ha superato il collaudo Mac; il redesign UX necessita del suo **nuovo** gate GNU R/JS sulla build corrente e del test `file://` in Safari. Vedi [`UX_REDESIGN_PROTOCOLLO.md`](UX_REDESIGN_PROTOCOLLO.md).

## Macrofase F (opzionale) — StatAtlas Classroom

Raccolta offline dei report prodotti dagli studenti, importazione aggregata da parte del docente, sintesi delle difficoltà e delle attività completate. Prima di introdurre una piattaforma online serve una valutazione esplicita su privacy, autenticazione, proprietà e gestione dei dati.
