# StatAtlas — Batch 3: laboratorio 27, LISA e MAUP

**Data:** 14 novembre 2026. **Base:** archivio `statatlas_moran_corretto.zip` (Batch 2 già corretto nel browser).

## Ambito completato

- Nuovo laboratorio `src/labs/27-lisa.js`, integrato come laboratorio **27** nella Parte **VIII — Statistica spaziale**; ID pubblico `lisa` (`index.html#/lisa`).
- Nuovo motore numerico `src/core/spatial-local.js` con:
  - indicatori locali di Moran, lag e quadranti HH/LL/HL/LH;
  - speranza delle statistiche sotto permutazione condizionale;
  - permutazioni dei valori delle altre unità, mantenendo fisso quello della zona studiata;
  - p-value bilaterali centrati sulla speranza condizionale, correzione Monte Carlo +1;
  - confronto delle correzioni multipli senza correzione, BH e BY;
  - aggregazione 64→16→4 zone e zonizzazione alternativa delle 16 zone.
- Sei modalità del generatore: hotspot e coldspot, outlier, rumore indipendente, scacchiera, trend, SAR.
- Interfaccia coerente con gli altri laboratori: SVG originale, 5 obiettivi, previsione espandibile (3 opzioni), guida operativa, 2 mappe, istogramma del test locale, confronto della statistica globale in presenza di MAUP, 8 righe di tabella, KPI, controlli avvio/pausa/passo/completa/riavvia, CSV, PNG, codice R scaricabile.
- Sezioni Essenziale e Avanzato, esercizi con soluzione, errori frequenti e bibliografia in `src/core/content.js`.
- Integrazione del catalogo, della navigazione e della mappa concettuale, senza modificare gli ID dei 26 laboratori precedenti.

## Protocollo inferenziale

Per `z_i = x_i - mean(x)` e `m2 = sum(z_i^2)/n`, si usa `I_i = z_i * sum_j(w_ij z_j)/m2`.

I valori condizionali sono ottenuti permutando per ogni `i` gli `n-1` altri valori (quello di `i` resta fisso), quindi `E[I_i | z_i] = - z_i^2 * rowSums(W)[i] / ((n-1)*m2)`.

Il confronto bilaterale è effettuato tramite `|I_i - E[I_i|z_i]|` e il p-value usa `(1 + exceedances)/(B + 1)`. L'intera famiglia di aree è trattata con p-value grezzi, BH o BY. Le categorie HH/LL/HL/LH sono descrittive: non sostituiscono il test. Le distribuzioni nulle, gli aggiustamenti e l'interpretazione cambiano con W e con le assunzioni di randomizzazione.

Nel MAUP, rook/queen/distanza si applicano alla griglia delle zone aggregate; se si sceglie il vicinato a distanza, il raggio è in **unità normalizzate della griglia aggregata**, non in distanza fisica misurata fra centroidi geografici. La media di una zona è calcolata sulle celle di base, con zone contigue anche nello schema a confini spostati.

## Verifiche effettuate

- `python3 build.py`: **OK**, `index.html` offline generato.
- Test preesistenti: **205 controlli JavaScript passati**, zero fallimenti.
- Nuovo `tests/test_spatial_local.js`: **49 controlli passati**, zero fallimenti (identità esatta fra global e local Moran, speranza condizionale enumerata, BH/BY, MAUP, generatori e determinismo).
- Totale numerico: **254/254 controlli passati**.
- `tests/test_moran_mount.js` e `tests/test_boost_mount.js`: **OK**.
- `tests/smoke/smoke_lab26_browser.py`: **OK**, il precedente laboratorio Moran resta funzionante.
- `tests/smoke/smoke_lab27_browser.py`: **OK** in Chromium reale headless: copertina, 5 obiettivi, 3 risposte, guida, mappe, statistiche, 8 righe, autoplay, navigazione, CSV, R scaricabile, cambi di scala e zonizzazione, correzioni BY, varianza nulla, drawer, ritorno al LAB 26, viewport mobile e tema scuro. Nessuna eccezione JavaScript.
- `tests/gen_lisa_reference.js` ha generato `verifica/verifica_lisa.R` con **7 scenari** di benchmark per confronti numerici indipendenti in R base e test opzionali con `spdep`.

## Verifiche non eseguite

**R non è installato in questo ambiente.** Lo script dedicato è predisposto ma non deve essere considerato validato numericamente prima dell'esecuzione sul Mac dell'autore.

Il test Chromium headless non sostituisce la verifica manuale in Safari su macOS. Permangono le limitazioni interpretative dell'inferenza permutazionale sotto trend/eteroschedasticità e le dipendenze proprie del controllo FDR, già esplicitate nella teoria del laboratorio.

## Comandi di verifica

```sh
python3 build.py
node tests/test_spatial_local.js
node tests/gen_lisa_reference.js
STATATLAS_CHROMIUM=/usr/bin/chromium python3 tests/smoke/smoke_lab27_browser.py
Rscript verifica/verifica_lisa.R
```

In RStudio sul Mac, da una cartella qualsiasi, si può usare `source(file.choose())` e scegliere `verifica/verifica_lisa.R` nella cartella estratta.

## Gate prima della fase successiva

1. Ricevere output positivo della verifica R completa del LAB 27.
2. Confermare la resa visiva/interattiva in Safari, con particolare attenzione alle mappe dopo variazione di scala e a BH/BY.
3. Solo dopo avviare LAB 28 — Processi puntuali spaziali.
