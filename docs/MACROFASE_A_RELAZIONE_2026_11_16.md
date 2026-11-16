> **Aggiornamento 16 novembre 2026 (successivo al presente rapporto).** Sono stati aggiunti un audit teorico documentato delle 31 schede (`docs/AUDIT_FORMALE_TEORICO_31.md`) e il verificatore unico R (`verifica/valida_tutti_31.R`). Gli stati `NON eseguiti` qui presenti descrivono le condizioni del precedente ambiente di test: il collaudo dell'autore sul Mac ha successivamente confermato parsing GNU R e parita numerica sulle sei mappe. Per il nuovo gate R 31/31 e lo stato della pubblicazione, vedere `docs/RELEASE_CANDIDATE_A_2_1.md`.

# StatAtlas 2.1 — Macrofase A, rapporto di consolidamento scientifico-tecnico

**Data:** 16 novembre 2026. **Baseline:** archivio `StatAtlas_2_1_Export_R_Corretto_Completo(1).zip` caricato dall'autore. **Modalità:** copia di lavoro, nessuna modifica alla baseline originale, nessuna pubblicazione o tag GitHub.

## Stato di avanzamento: A1–A5

| Cantiere | Risultati verificabili nel pacchetto | Stato |
|---|---|---|
| A1 Audit scientifico | Riletti i dossier teorici preesistenti e rieseguiti 31 controlli indipendenti (1 per lab) + 11 controlli metodologici; mappate ipotesi e limitazioni delle sei mappe. | **Screening scientifico confermato; audit formale esaustivo delle dimostrazioni NON certificato** |
| A2 Riproducibilità e R | 31 esportazioni reali in browser; lunghezza riga massima 164 (<1000); allineamento bin variogramma JS/R; 12 snapshot spaziali indipendentemente controllati in NumPy rispetto a JS. CI estesa con esecuzione numerica GNU R per sei mappe (12 snapshot). | **JS/Python completato; parse/execute GNU R locale NON eseguiti** |
| A3 Challenges | Test JavaScript delle 93 sfide, controlli quantitativi e A/B; test browser di tutte le 31 lezioni a 390 px, più test specifici delle 18 sfide spaziali. | **Controlli automatici superati; valutazione sperimentale dell'apprendimento non certificata** |
| A4 Interfaccia | Aggiornata navigazione mobile per mappe unificate; corretti test con selettori obsoleti; corretto un bug reale del ripristino dei punti; testato responsive 31×4 e mappe 6×3. | **PASS nei browser Chromium locali** |
| A5 Qualità integrata | Build, JS, test scientifici, browser, suite offline, QA GitHub estesa, test storici spaziali archiviati e rimpiazzati con smoke coerenti. | **PASS locale su verifiche eseguite; CI GitHub/Safari non eseguiti** |

**Non dichiarare chiusa la Macrofase A sul piano scientifico** prima della validazione rigorosa in GNU R e della risoluzione delle verifiche teoriche residue. Il presente archivio è una **release candidate di collaudo**, non un rilascio definitivo certificato.

## Difetti corretti (con causa e copertura di regressione)

### A4-01 · `tests/test_mobile_tablet.py` falliva su Moran e sulla Parte VIII

La verifica richiedeva `.fig` e `.lab-grid`, presenti soltanto nelle prime 25 lezioni. Dal ridisegno 2.1 i laboratori 26–31 hanno una mappa `.spatial-studio-map`, un pannello `.spatial-studio-panel` e indicatori `.spatial-studio-stat`, senza grafici `.fig`, player `.transport` o tabelle `.tbl-wrap` legacy. Il problema era duplice:

- **Test obsoleto:** ricercava elementi deliberatamente rimossi.
- **Difetto funzionale reale:** `addMobileLabNav` costruiva collegamenti solo per il layout storico e non per le mappe unificate.

Rimedi: due rami specifici nel generatore della navigazione rapida (Parametri/Mappa/Risultati/Inizio per Parte VIII; Parametri/Grafici/Risultati/Inizio per Parte I–VII), margini di scorrimento CSS specifici e test separati per zoom dei grafici tradizionali. **Risultato:** 31/31 su larghezze 320, 390, 768, 1024 px; interazione touch su Kriging e zoom su Regressione, senza errori JS o overflow orizzontali.

### A4-02 · `Ripristina mappa iniziale` conservava osservazioni aggiunte

**Bug reale emerso durante il nuovo collaudo:** `state.points = initial.points` condivideva l'array iniziale. Le aggiunte e rimozioni in-place alteravano il riferimento usato dal reset. La correzione `state.points = initial.points.map(clone)` separa lo snapshot iniziale dai dati modificabili. Un nuovo controllo modifica *realmente* il numero di osservazioni, invoca il reset e verifica la numerosità originaria; i precedenti smoke test, basati sull'aggiunta seguita dalla rimozione, non erano sufficienti a rilevare il problema. **Esito:** PASS per sei laboratori × tre viewport e smoke mobili dedicati.

### A2-01 · Allineamento delle classi del variogramma esportato in R

Il calcolo JavaScript colloca una distanza esattamente coincidente con un bordo di classe nella **classe successiva** (salvo l'estremo destro globale a 1), mentre l'uso precedente di `cut()` con intervalli destri chiusi poteva assegnarla alla precedente. Lo script R genera ora indici basati su `floor(distPairs * p)+1L`, troncati alla classe `p`, e scarta distanze oltre 1. Gli stimatori e i dati dell'interfaccia JS non vengono alterati. La verifica R è presente nella nuova suite di parità, ma non è stata eseguita localmente per assenza di R.

### QA-01 · Test Challenges, teoria e vecchi smoke spaziali

Il test `test_challenges_browser_full.py` presumeva tabelle `.tbl-wrap` nei laboratori spaziali e un messaggio di prerequisito dell'interfaccia precedente: controlla ora l'unica mappa, le statistiche e il blocco preventivo specifico della nuova UI. `test_pedagogy_browser.py` usava un server HTTP locale e i vecchi player: è passato a HTML offline e controlli coerenti con i nuovi laboratori. I sette smoke storici dipendenti da `.fig`/`.transport` sono conservati in `tests/legacy/`; i file con i nomi originari sono stati sostituiti da smoke per le mappe realmente visibili. Le funzionalità avanzate rimosse **non sono dichiarate equivalenti** ai nuovi smoke.

## Validazione numerica e limiti di inferenza

`tests/test_spatial_export_equivalence.py` acquisisce lo **script R visualizzato** nel browser, estrae i vettori realmente esportati e calcola in NumPy riferimenti indipendenti. Per Moran e LISA ricostruisce W kNN e la classificazione; per i processi puntuali la KDE centrale; per il variogramma medie e numerosità di classe; per il kriging la soluzione del sistema vincolato al centro con rumore nugget; per regressione i due OLS, R² e Moran dei residui. Il confronto usa la scala numerica completa, non i soli valori arrotondati in UI. Per ogni laboratorio spaziale è stato verificato lo stato iniziale **e uno stato realmente modificato**, seguito dal reset.

Quando trova `Rscript`, lo stesso test **esegue** gli script R delle sei mappe con `--vanilla` in un processo indipendente per ogni stato e verifica statistiche e tolleranza numerica rispetto a NumPy. Su GitHub Actions è configurato con `--require-r`: l'assenza del runtime o una discrepanza R/JS producono un fallimento della CI. Il test di esportazione dei 31 laboratori prova la lunghezza delle righe e il download; con R installato esegue il parsing di tutti i 31 codici tramite GNU R. **Non** è un test di esecuzione automatica degli script 01–25: questi ultimi possono richiedere pacchetti CRAN e necessitano di un'ulteriore verifica di runtime e concordanza numerica.

Nel contenuto didattico va inoltre preservata la distinzione tra (i) confronti descrittivi A/B dello stesso dataset e (ii) repliche Monte Carlo indipendenti; tra quadranti LISA e hotspot significativi; tra superficie IDW e kriging; tra trend OLS e SAR/SEM. Le vecchie funzioni spaziali avanzate non sono state reintegrate automaticamente, per non duplicare le interfacce.

## Matrice e prove ripetibili

- `docs/MACROFASE_A_MATRICE_VERIFICHE.csv`: copertura dei 31 laboratori e confini delle certificazioni.
- `docs/MACROFASE_A_PARITA_SPAZIALE.json`: risultati numerici, due configurazioni per ciascuna delle sei mappe, con esplicita indicazione `NOT RUN` per R in questo ambiente.
- `tests/test_mobile_tablet.py`: quattro viewport × 31 lezioni, più interazioni touch e grafici legacy.
- `tests/test_spatial_studio_browser.py` e `tests/smoke/spatial_unified_smoke.py`: addizione, rimozione, reset e unicità mappa.
- `tests/test_spatial_export_equivalence.py`: doppio confronto di codici R esportati e runtime opzionale/obbligatorio.
- `.github/workflows/scientific-qa.yml`: build, JS, identità matematiche, parse R, parità R/JS spaziale, responsive, Challenges, didattica.

## Checklist finale di accettazione — una sola sessione

1. Su Mac, con Node.js 22+, Python 3.11+ con NumPy/SciPy/Playwright e Chromium, e GNU R con `Rscript` nel `PATH`, estrarre la cartella del progetto. Installare il browser di Playwright una sola volta con `python3 -m playwright install chromium`.
2. Da terminale, nella directory `statatlas-main`, eseguire **un solo** comando: `sh tests/run_macrofase_A.sh --require-r > MACROFASE_A_COLLAUDO.log 2>&1`; quindi leggere l'ultima parte del log. In caso di errore allegare l'intero log, non ripetere manualmente decine di test.
3. Criterio automatico minimo: tutte le sezioni `PASS` e stampa finale `SUCCESS`. **Non sostituisce** la verifica manuale dei sei studi su Safari reale e la validazione completa degli script R dei laboratori 01–25.
4. Controllare su Safari desktop/mobile che menu, pulsanti rapidi, mappa, drag, Challenges, tab teoria, copia/scarica R e reset siano effettivamente usabili. Se R/JS o Safari falliscono, non pubblicare.
5. Solo dopo esiti soddisfacenti, effettuare **una singola** pubblicazione GitHub della versione approvata e verificare le Actions remote prima di ogni tag. Non anticipare un tag definitivo sulla sola base di questi test locali.

## Rischi e decisioni ancora aperte

- **R0/R1–R3:** l'esecuzione R reale e i confronti quantitativi dei laboratori 01–25 restano da produrre/validare sistematicamente; il precedente CSV storico `verifica/verifica_statatlas_esiti.csv` non costituisce prova aggiornata per gli script 2.1 dinamici.
- **A1 completo:** controlli matematici per identità selezionate e documenti teorici preesistenti non equivalgono a una dimostrazione formalmente revisionata riga per riga di tutte le 31 schede.
- **Validazione didattica:** non esiste ancora uno studio empirico sugli apprendimenti degli studenti; le 93 Challenges sono attività formative, non uno strumento psicometrico validato.
- **Funzioni spaziali non presenti:** permutazioni/FDR LISA, envelope CSR, confronto IDW–kriging, inferenza SAR/SEM, spatial CV. Decidere singolarmente e solo con una motivazione didattica se reintegrarle, preservando una sola mappa.
- **Piattaforma:** i risultati browser locali sono ottenuti con Chromium; la CI GitHub e Safari non sono stati eseguiti in questa sessione.

**Conclusione:** problemi responsive e reset effettivamente corretti, test stantii allineati, suite scientifica JS/Python ampliata e CI preparata alla validazione R, ma **non dichiarare Macrofase A scientificamente chiusa** finché restano assenti esecuzione e parità R complete e revisione teorica formale dove richiesta.
