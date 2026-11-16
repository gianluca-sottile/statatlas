# StatAtlas 2.1 — Parte VIII unificata · Rapporto di consegna

**16 novembre 2026** · Snapshot di sviluppo destinato a un unico push GitHub, senza tag ufficiale.

## Risultato

Sostituiti i sei front-end dei laboratori spaziali 26–31 con una singola mappa ciascuno: nessun vecchio pannello, runner, doppio campione o insieme di controlli paralleli è montato. I sorgenti matematici condivisi sono stati conservati come motori di calcolo e test: l'interfaccia degli esperimenti originali non è più esposta. Le sei nuove mappe sono controllate da `src/core/spatial-unified.js` e `src/core/spatial-studio.js`; `src/labs/26–31` contiene i sei wrapper di registrazione.

Tutte le mappe hanno aggiunta/spostamento/rimozione e ripristino; risultati quantitativi e superfici ricalcolati sugli stessi punti. LISA rimane descrittiva; nei processi puntuali non è calcolato un envelope CSR; variogramma IDW è illustrativo; kriging è ordinary su campo fisso; regressione interattiva confronta solo due modelli OLS, mentre SAR/SEM restano nella teoria. Coordinate sempre normalizzate, non geografiche reali.

Le 18 Challenges spaziali sono riscritte e sono state verificate end-to-end: la comparazione A/B acquisisce esplicitamente due snapshot dello stesso dataset. Cambiare un menu senza registrare la statistica non crea una replica. Il codice R visualizzato nella lezione contiene i punti correnti, ma i sei nuovi script R **non sono stati eseguiti** e richiedono validazione numerica nella Macrofase A.

## Evidenze automatizzate

| Controllo | Evidenza |
|---|---|
| Build | `python3 build.py` riuscito; output HTML offline ricostruito. |
| Suite JavaScript | 22/22 superate. |
| Verifiche scientifiche indipendenti | 31/31 superate, su identità e algoritmi condivisi (non prova completa di ogni lezione). |
| Altri controlli matematici | 11/11 superati. |
| Browser su mappe | 6 laboratori × 3 larghezze: 390, 768, 1366; add/remove/reset e nessuna interfaccia precedente. |
| Browser supplementare | 6 laboratori × 2 larghezze: 320, 1024; niente overflow orizzontale, tre Challenges, un'unica mappa. |
| Gesti e calcoli | Cluster Moran, quadranti LISA, curve KDE/L e variogramma, trascinamento, kriging, confronto OLS. |
| Challenges | 18/18 percorsi completi, livelli Comprensione/Applicazione/Avanzato; controlli delle precondizioni e risultati osservati. |
| Regressione rispetto al pacchetto precedente | Tutti i 25 sorgenti dei laboratori 01–25 e tutti i 29 preesistenti moduli core JavaScript, escluso il vecchio layer UI, confrontati byte per byte: invariati. |
| Script R nuovi | **Non verificati in esecuzione R** (R non disponibile nel runtime); parte della successiva Macrofase A. |
| Deploy GitHub | **Non effettuato**, da verificare sul repository dell'utente dopo il push. |
| Safari iPhone reale | **Non eseguito**; Chrome/Chromium emulato non sostituisce prova touch sul dispositivo reale. |

La suite browser nuova è `tests/test_spatial_unified_challenges.py`, inclusa nel workflow `.github/workflows/scientific-qa.yml`.

## Materiali

- `StatAtlas_2_1_Parte_VIII_Unificata.zip` — archivio completo, cartella radice `statatlas-main/`, per Mac.
- `StatAtlas_2_1_Parte_VIII_Unificata_iPhone.zip` — stesso contenuto con file direttamente nella radice dell'archivio, per importazione in clone Git iOS.
- `StatAtlas_Parte_VIII_Unificata_Offline.html` — sito completo offline, senza Git.
- `docs/PARTE_VIII_UNIFICATA.md` — metodologie, limiti e dettagli tecnici.
- `docs/PARTE_VIII_PUBBLICAZIONE.md` — istruzioni GitHub e unica checklist finale.

## Collaudo finale (una sola sessione)

1. GitHub Actions: `numerical-and-scientific` e `spatial-ui-browser` verdi e deploy GitHub Pages relativo al commit caricato.
2. Tutte e sei le lezioni: **una sola mappa** e nessuna seconda configurazione legacy sotto l'esperimento.
3. Moran: aggiungi gruppo simile, cambia I; LISA: crea cluster/outlier; processi: aggiungi gruppo, vedi KDE e L-r; variogrammi: muovi sensore, cambia semivarianza.
4. Kriging: aggiungi un sensore su campo fisso, varianza media non crescente, seleziona predizione; regressione: aggiungi punto e alterna OLS `Y~X` / `Y~X+x+y`.
5. Smartphone: tocca, trascina, elimina e ripristina un punto; prova una Challenge avanzata A/B, Apri teoria, esportazione CSV e script R. Nessun overflow.

**Conclusione:** pronto per un singolo collaudo di accettazione dell'interfaccia e successivo ritorno alla Macrofase A. Non dichiarare validazione teorica completa o equivalenza numerica R definitiva.
