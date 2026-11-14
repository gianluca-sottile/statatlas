# StatAtlas - Batch 2: motore spaziale e LAB 26 Moran globale

**Data:** 14 novembre 2026. **Base:** codice ricevuto nel Batch 1, derivato dallo ZIP dell'autore. I file originali non sono stati alterati. Questa versione contiene 26 laboratori (25 precedenti e il nuovo LAB 26). Non contiene ancora LAB 27-31 né l'audit teorico integrale di tutti i laboratori.

## Gate precedente (gradient boosting)

L'autore ha eseguito `source("~/Downloads/statatlas-main/verifica/verifica_gradient_boosting.R")`: output incollato in chat, **tre esiti OK** per `sine`, `step` e `binary`. Questi risultati corroborano R2 per le statistiche e la selezione nei tre scenari di riferimento. Il minimo in validazione per `binary` coincide con il limite del budget B=100; non indica una divergenza, ma sarebbe utile ampliare B per studiare la scelta di arresto anticipato. Il collaudo grafico reale del Batch 1 rimane indipendente e non e stato documentato come passato.

## Ambito del Batch 2

- `src/core/spatial.js`: griglia row-major, distanze, vicinati rook/queen/distanza, pesi binari e normalizzati per riga, lag spaziale, controlli degli input.
- `src/core/spatial-areal.js`: indice globale I, speranza condizionata a permutazione, permutazione Fisher-Yates riproducibile nel browser, p-value Monte Carlo (+1), DGP per blocchi/alternanza/i.i.d./trend/SAR.
- `src/labs/26-moran.js`: interfaccia conforme al ciclo a sei sezioni, mappa SVG modificabile da tastiera o clic, evidenza dei vicini della cella selezionata, Moran scatterplot, istogramma permutazionale, impostazioni vicinato/W, 199/499/999 permutazioni, scelta alternativa, rumore SAR e confronto tra valori con trend e rumore dopo sottrazione del trend *vero*. Riprova del campione corrente in R, download CSV e PNG.
- `src/core/app.js`: Parte VIII, LAB 26, link concettuali. Gli URL dei 25 laboratori precedenti restano invariati.
- `src/core/art.js`: illustrazione originale per la Parte VIII e LAB 26.
- `src/core/content.js`: obiettivi, esempio, errori, supplementi Essenziale/Avanzato, esercizi e riferimenti bibliografici sul LAB 26.
- `tests/test_spatial_core.js`, `tests/test_spatial_areal.js`, `tests/test_moran_mount.js`: test numerici e test ciclo di vita con DOM simulato.
- `tests/gen_moran_reference.js`, `verifica/verifica_moran.R`: sei scenari numerici dal motore JS; confronto in R base di W, I e lag, con `spdep` opzionale. Lo script principale `verifica/verifica_statatlas.R` e il generatore `tests/gen_verifica_R.js` vengono estesi con questo controllo.

## Modello statistico e limiti

L'indice di Moran usato e I = n/S0 * (z'Wz)/(z'z) con z = x - media(x), W a diagonale nulla; se la varianza e zero I e indefinito. E[I | permutazione uniforme dei valori] = -1/(n-1). Con W row-standardized senza isolati S0=n e la pendenza OLS di Wz su z coincide con I; con pesi binari generalmente non coincide. Le permutazioni sono condizionate ai valori osservati e testano una specifica null di scambiabilita spaziale, non genericamente l'assenza di correlazione degli errori. Il SAR simulato usa (I-rho W)^-1 eps per |rho|<1; rho non coincide con il valore di I.

La modalità "trend rimosso" sottrae la funzione *vera* nota al simulatore, non stima trend con regressione dai dati. Non implica la validità universale di test permutazionali su residui stimati. Il p-value JS e riproducibile internamente con lo stesso seed, ma il campionamento di permutazioni in R usa una sequenza differente: R1 per la formula I e W; non R0 per le permutazioni di base R.

## Verifiche eseguite in questa sessione

| Test | Risultato |
|---|---|
| `python3 build.py` | successo; 44 script, `index.html` circa 1008 KB |
| `node tests/test_core.js` | 49 OK |
| `node tests/test_linalg.js` | 16 OK |
| `node tests/test_resampling.js` | 15 OK |
| `node tests/test_ml.js` | 14 OK |
| `node tests/test_cluster.js` | 26 OK |
| `node tests/test_nn.js` | 11 OK |
| `node tests/test_boost.js` | 26 OK |
| `node tests/test_spatial_core.js` | 25 OK |
| `node tests/test_spatial_areal.js` | 23 OK |
| `node tests/test_boost_mount.js` | mount e 110 iterazioni OK (mock DOM) |
| `node tests/test_moran_mount.js` | mount e 499 permutazioni OK (mock DOM) |
| `node --check` sui nuovi JS | OK |
| `node tests/gen_moran_reference.js` | generato script R per sei scenari |

**205 controlli numerici JS superati**, oltre ai due smoke test con mock DOM. La prova di enumerazione esaustiva delle 6! permutazioni conferma E[I]=-1/5 per n=6. Sono test e controlli deterministici nel runtime JavaScript, non un audit visuale completo.

## Gate NON ancora soddisfatti

1. **R reale:** `Rscript` non disponibile nell'ambiente di sviluppo. Lo script R per LAB 26 deve essere eseguito sul Mac e i sei scenari devono risultare tutti OK. Se `spdep` e installato, vanno superati anche i confronti con `spdep::moran`.
2. **Browser reale:** Chromium headless si e arrestato per timeout senza produrre screenshot. Richiedono verifica manuale: layout desktop e mobile, temi, eventi delle celle, avvio/pausa/completa/ricomincia, esportazioni, drawer Essenziale/Avanzato e passaggio tra laboratori.
3. **Suite completa in R:** anche il master `verifica_statatlas.R` richiede di essere eseguito nel contesto R con i pacchetti usati dai laboratori precedenti.
4. **Altri laboratori spaziali:** LAB 27-31 non ancora implementati.

## Comandi per la verifica sul Mac

Dalla radice di `statatlas-main`:

```sh
python3 build.py
node tests/test_spatial_core.js
node tests/test_spatial_areal.js
node tests/test_moran_mount.js
Rscript verifica/verifica_moran.R
# opzionale, se sono installati i pacchetti storici richiesti:
Rscript verifica/verifica_statatlas.R
```

Oppure nella console R:

```r
source("~/Downloads/statatlas-main/verifica/verifica_moran.R")
```

Aprire `index.html#/moran` e verificare visivamente il nuovo laboratorio in Safari/Chrome: due regioni, scacchiera, trend (con/rimosso), SAR, rook/queen/distanza, binary/row, permutazioni e script R. Il risultato va documentato prima della prossima fase.

## Criterio per procedere al LAB 27

Test JS numerici verdi; script R standalone verde su sei scenari (e `spdep` se disponibile); nessuna regressione dei 25 laboratori esistenti; test di browser reale ed export superati. L'implementazione del LAB 27 (LISA e MAUP) deve riutilizzare il motore spaziale e migliorarlo solo in base a bisogni verificati.
