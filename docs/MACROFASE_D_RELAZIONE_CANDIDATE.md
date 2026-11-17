# StatAtlas 2.1 — Macrofase D, relazione tecnica della candidate (17 novembre 2026)

## Obiettivi e realizzazione

1. Il ponte con *From Data to Models with R* segue il selettore IT/EN in **tutti i 31 laboratori** e nei fogli studente scaricati. La lezione 62 resta sempre EN. URL EN e IT verificati sul sito del corso; test automatizzato locale 31/31 su HTML statico.
2. La nuova sezione «Esperimenti riproducibili / Reproducible experiments» offre salvataggio JSON, apertura JSON, link compatto con limite di lunghezza. Nessun backend, account o upload; i file funzionano offline.
3. Schema `statatlas.experiment` v1: identificativo laboratorio, fingerprint SHA-256 delle sorgenti incluse nella build, parametri dei controlli, selezioni, seed quando esposto dalla UI, checkpoint per le animazioni, punti modificati per i sei laboratori spaziali e le regressioni interattive 10 e 14.
4. I runner condivisi registrano il numero esatto di passi e ricostruiscono progressivamente lo stato a partire dal seed; il laboratorio 06 dispone di un adapter dedicato. I sei laboratori spaziali serializzano l'effettivo insieme osservato e i parametri della mappa: non si pretende di riprodurre i movimenti del mouse dal seed.
5. Anche i laboratori 10 e 14 hanno un adapter `manual-xy-v1` per i punti manuali: il dataset si applica dopo il replay del checkpoint; i dati in forma di CSV restano esportabili per R.
6. Validazione dei dati prima dell'import: formato/versione, fingerprint esatto, lab noto, contatori sicuri, range numerici, dati spaziali coerenti, lunghezza file e link. Non si includono risposte alle Challenges.

## Evidenza QA dell'ambiente di sviluppo

- 29 suite JavaScript `test_*.js`, 31 controlli scientifici indipendenti e 11 spot check superati sulla nuova build.
- 31/31 laboratori: salvataggio e ripristino dello stato predefinito a 390 px e 1366 px.
- 24 laboratori che usano il runner condiviso: almeno un passo e identità del risultato numerico verificati; laboratorio 06 con adapter indipendente, 3 repliche Laplace/seed 42, ricostruite.
- Laboratori 01, 06: modifica di modello, numerosità, seed e checkpoint; test numerico round-trip.
- Regressioni 10 e 14: aggiunta di osservazioni tramite il controllo del laboratorio, modifica successiva, recupero delle coordinate e verifica delle tabelle e dei checkpoint; coordinate fuori dominio rifiutate. I drag manuali via mouse sono gestiti dallo stesso `S.pts` interno ma non sono stati simulati direttamente nel test browser.
- Sei laboratori spaziali: due aggiunte effettive per ciascuno, confronto esatto delle osservazioni, dello script R e delle statistiche disponibili.
- Link EN del corso verificati a browser per 31/31 lab; doppio link IT/EN incluso quello inglese-only; foglio EN corretto.
- Link compatto importato in una nuova pagina HTML in memoria senza rete; protocollo validato contro schemi, motori e ID di laboratorio incompatibili.
- Regression test dell'edizione C bilingue (93 Challenges, 62 pannelli teorici, 104 esercizi) passato con Chromium.

## Non attestato / limiti

- Nel runtime container non è installato GNU R: **la candidate D non è ancora certificata** con i 31 script R e i 84 benchmark della build nuova; eseguire `tests/run_macrofase_D.sh` sul Mac.
- Il browser dell'ambiente di prova blocca l'apertura `file://` e `http://127.0.0.1`: il test del link in una nuova pagina HTML in memoria non sostituisce un test manuale dei link aperti nel browser desktop reale.
- L'importazione è vincolata al medesimo fingerprint del motore; l'evoluzione dello schema e le migrazioni sono attività future.
- Il protocollo è progettato per stati deterministici entro il limite dichiarato di 100.000 passi. Non attesta equivalenza globale R2 per ogni scenario, né certificazione WCAG, né integrazione con un registro valutativo.
- Le Challenges non sono parte della serializzazione: il pacchetto registra esperimenti, non prove di apprendimento ufficiali.

## Consegna e rilascio

ZIP con root `statatlas-main/`, build unica `index.html`, sorgenti, test, roadmap, protocollo, relazione. Un solo collaudo completo Mac `tests/run_macrofase_D.sh`, quindi dry-run Git e singolo push. Non pubblicare finché il gate non restituisce `SUCCESS: MACROFASE D LOCAL ACCEPTANCE PASSED` e la versione HTML è stata verificata nel browser reale.
