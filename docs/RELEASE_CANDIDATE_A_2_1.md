# StatAtlas 2.1 — Macrofase A, prepubblicazione

**Data:** 16 novembre 2026. **Stato:** release candidate, NON pubblicata.

## Evidenza gia acquisita

1. Il collaudo Mac fornito dall'autore (`MACROFASE_A_COLLAUDO.log` della versione precedente a questo audit) e terminato con `SUCCESS`: build, suite JS, 31 laboratori e 93 Challenges, responsive su 320/390/768/1024 px, ripristino delle sei mappe, parsing con GNU R dei 31 script e confronti JS/Python/R per 12 snapshot spaziali.
2. In questa revisione e stata completata la ricognizione critica di 31 equazioni-cardine, 31 sezioni avanzate, ipotesi e controesempi: `docs/AUDIT_FORMALE_TEORICO_31.md`. Non equivale a dimostrare da zero ogni teorema citato: per DKW, TCL, consistenza kNN, spline rappresenter e FDR occorrono riferimenti formali primari.
3. Corrette le formule visibili e le qualificazioni sull'intervallo della CDF discreta, sulla varianza condizionata normale bivariata, su TCL, AR(1), elastic net, CV con fold diseguali, ridge/lasso e regressione L1.
4. Test locali post-revisione: build, 31 script R estratti LIVE dal browser, 31 verifiche matematiche indipendenti, 11 spot checks, 31 schede didattiche, e controlli di regressione delle formule. La versione finale dell'app richiede un nuovo giro di collaudo su Mac/CI dopo questi aggiornamenti.

## Unico comando per la validazione reale dei 31 script R

Dalla radice `statatlas-main` dopo `source .venv/bin/activate`:

```bash
Rscript verifica/valida_tutti_31.R --timeout=900 > MACROFASE_A_R31.log 2>&1
echo "Codice di uscita: $?"
```

**Requisiti:** GNU R >=4.1 e pacchetti R `tidyverse`, `quantreg`, `segmented`, `cluster`; Python dell'ambiente virtuale con Playwright e Chromium. Il comando ricostruisce `index.html`, cattura il codice R mostrato in ogni laboratorio, verifica checksum e lunghezze, controlla `parse()` e avvia ogni script in un processo GNU R indipendente. Ogni script ha un invariante numerico/strutturale aggiuntivo e un proprio log; i PDF delle figure sono in `verifica/runs/`. Nessun laboratorio mancante puo essere considerato PASS.

**Evidenze da consegnare per l'ultimo gate:** `MACROFASE_A_R31.log` e `verifica/REPORT_VALIDAZIONE_R_31.csv` (se fallisce un singolo laboratorio anche `verifica/runs/XX_nome.log`). Per il report conclusivo e obbligatorio avere 31 `runtime=PASS` e codice 0.

**Limite importante:** parsing + esecuzione + invariante di tutti i laboratori dimostrano la riproducibilita computazionale minima, non la parita numerica puntuale R/JavaScript per i primi 25, che richiede benchmark da snapshot correnti. Il collaudo precedente ha eseguito confronti completi per 12 snapshot dei laboratori spaziali.

## Pubblicazione, un solo ciclo

1. A validazione R conclusa e report verificato, non rigenerare manualmente o modificare `index.html`: il gate controlla SHA-256 del file confrontandolo con manifest e report.
2. Da `statatlas-main` usare `sh scripts/pubblica_github.sh --no-push` per controllare la sincronizzazione remota e lo stato dei file senza alcun commit/push.
3. Dopo aver verificato il piano di pubblicazione, lanciare **una volta** `sh scripts/pubblica_github.sh`. Il comando clona `main`, ricostruisce offline, ripete i controlli locali disponibili, crea un solo commit e invia il push. Richiede credenziali GitHub e un remote accessibile. **Non e stato eseguito dall'assistente.**
4. Su GitHub, verificare la pipeline `Scientific QA`, l'URL GitHub Pages e la versione effettivamente servita; solo dopo pubblicazione verificata valutare tag/release e aggiornamento di badge/versione/CITATION.

## Che cosa resta dopo il consolidamento della Macrofase A

**Prima della pubblicazione:** risultato del validatore 31/31 sul Mac; esecuzione della suite browser finale se l'ultima modifica al frontend lo richiede; verifica della correttezza dello stato del remote; controllo CI e Pages dopo il push.

**Scientifico da documentare senza sovrastimare i risultati:** differenza tra equivalenza del generatore RNG (R0), identita di misure (R1), stesso algoritmo (R2), metodi alternativi (R3); creare benchmark quantitativi JS/R da snapshot LIVE dei primi 25 laboratori prima di reclamare una equivalenza R2 universale. Ampliare la bibliografia primaria per i teoremi non dimostrati integralmente e la catalogazione dei limiti (F/T/N) nelle schede avanzate.

**Evoluzione metodologica facoltativa della Parte VIII:** attivare inferenza permutazionale LISA con FDR, envelope globali dei processi puntuali, diagnostica e confronto predittivo kriging/IDW, SAR/SEM e spatial CV solo dopo scelta del perimetro didattico, mantenendo una sola mappa per laboratorio.

**Macrofase B:** raccordo operativo con `From Data to Models with R`, learning paths, collegamenti ai capitoli R ed esercizi, benchmark didattici. **Macrofase C:** traduzione inglese rigorosa, navigazione/accessibilita, compatibilita Safari/iPhone, revisione documentazione internazionale. **Validazione didattica con studenti:** differita, per decisione dell'autore, fino a repository completato; va presentata onestamente come futuro studio e non come proprieta gia validata.
