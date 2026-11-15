# StatAtlas 2.1 (sviluppo) — Report conclusivo della tranche 31/31

Data: 14 novembre 2026. Baseline: archivio `statatlas_challenges_audit_pilota.zip` (31 laboratori, 9 sfide pilota).

## Consegnato

- **31 laboratori con modalità Challenges:** 93 sfide, tre per laboratorio: Comprensione, Applicazione e Avanzato. Sono inclusi obiettivo operativo, risposta a tre alternative, feedback metodologico e progresso locale nella pagina.
- **9 sfide specialistiche preservate** nei laboratori 08, 18 e 30 (verifiche legate a stato del modello, numero di repliche, metodo e sensori).
- **84 sfide estese** negli altri 28 laboratori: prerequisiti verificati mediante passi del motore e modifiche reali ai controlli successive all'apertura della sfida. Questo è un gate di interazione, non una verifica completa della configurazione scientifica specifica di ogni esercizio.
- **31 revisioni dei contenuti Essenziale e Avanzato:** ipotesi, derivazioni, casi limite ed esperimenti di controllo, aggiunti ai testi preesistenti. Ogni capitolo è documentato separatamente in `docs/AUDIT_REVISIONE_31.md`.
- **Funzionamento offline** conservato; nessuna API, dipendenza runtime, raccolta dati o persistenza dei risultati dello studente.

## Invarianti del calcolo

Il confronto file per file con la baseline mostra che 30 dei 31 sorgenti dei laboratori sono invariati; nel LAB 06 sono stati aggiunti soltanto un adattatore di lettura del progresso e un contatore non numerico. RNG, librerie dei modelli e algoritmi di calcolo non sono stati modificati. La registrazione del passo nel runner condiviso chiama **esattamente una volta** il metodo originale ed è usata solo dalle sfide.

## Verifiche effettivamente svolte

- `python3 build.py` — superato; un unico HTML standalone.
- 19 suite `tests/test_*.js` — superate.
- `tests/test_challenges_full.js` — 31/31 banche di sfide, 93/93 item, 779 asserzioni su struttura, feedback ed eleggibilità delle 84 sfide aggiuntive.
- `tests/test_scientific_claims.py` (richiede NumPy e SciPy) — 11 controlli matematici indipendenti selezionati (copertura Wald, pivot t, AR1, SVD/PCA, Moran permutazionale, soft thresholding, variogramma, ensemble, OLS e moltiplicatore SAR).
- `tests/audit_science.js` — 31 schede indicizzate, 131 obiettivi, 104 esercizi, 116 riferimenti, formule e guide presenti.
- Chromium tramite HTML caricato direttamente: **31/31** laboratori su viewport **390 px e 1024 px**; tre card e nove opzioni per laboratorio, guide, layout e assenza di errori/overflow. Test funzionale della sfida di test d'ipotesi (modifica di un controllo + due passi + risposta corretta), test del motore personalizzato nel LAB 06, apertura dei testi avanzati e schermate di controllo.

## Cosa non è certificato da questi test

1. Non è stata rieseguita l'intera suite R in questa fase. I precedenti confronti R restano validi per il calcolo invariato, ma una release pubblica richiede un controllo regressivo sui sistemi target.
2. Le derivazioni e i controesempi sono stati revisionati metodologicamente, **non sottoposti a dimostrazione formale indipendente** per ogni singolo risultato dei 31 laboratori. L'audit allegato rende esplicita la portata di ogni integrazione.
3. La correttezza delle risposte non è una misura validata della competenza statistica. I nuovi 84 gate garantiscono attività sperimentale, ma non sempre verificano che sia stato cambiato esattamente il parametro menzionato nel testo della sfida.
4. Browser Chromium emulato, non test su hardware iOS/iPadOS reale. Una prova su Safari rimane raccomandata.

## Test consigliati prima della pubblicazione

```bash
python3 build.py
node tests/audit_science.js
node tests/test_challenges_full.js
python3 tests/test_scientific_claims.py
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_browser_full.py
```

## Stato e prossimo gate

Il progetto è una **versione candidata di sviluppo 2.1**, non un rilascio ufficiale. Per la release: prova con studenti sui 93 item, controllo matematico specialistico delle 31 schede, test R completo e prova touch su Safari reale.
