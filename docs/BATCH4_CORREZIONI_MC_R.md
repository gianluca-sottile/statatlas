# Patch correttiva — Laboratori 26–28 (14 novembre 2026)

## Difetti segnalati
1. Lo script `verifica_processi_puntuali.R` supera i controlli R1 e Monte Carlo, ma il blocco opzionale `spatstat.explore::Kest()` solleva `First r value must be 0`.
2. La modifica dei controlli nei laboratori 26, 27 e 28 riavvia automaticamente l'animazione anche quando non richiesto.

## Correzioni
- `Kest()` riceve `c(0, rr)`; solo questo confronto opzionale comprende lo zero; la stima JS/R del laboratorio conserva i 20 raggi 0.0125–0.25 già verificati.
- Rimossi i riavvii impliciti dai callback. Primo mount: autoplay; successivi cambiamenti dei dati: stop, invalidazione delle repliche e aggiornamento immediato di mappe e statistiche, senza autoplay.
- Controlli che non modificano il processo generatore o la null: mantenimento del Monte Carlo; B seleziona un prefisso del cache esistente, senza cambiare il seed o lo stato del generatore.
- Aggiornate le guide di uso dei laboratori, gli script R generati e il generatore dei riferimenti R, evitando la reintroduzione del difetto.

## Verifiche
- `python3 build.py`
- `node tests/gen_point_reference.js` rigenera lo script di verifica R corretto.
- 319 controlli numerici JavaScript (suite preesistente), nessuna modifica alle formule.
- `python3 tests/smoke/smoke_spatial_controls.py`: regressione reale Chromium.
- Controllo R finale esterno: `source("verifica/verifica_processi_puntuali.R")` su installazione con `spatstat`.

## Gate
Il controllo `spatstat` deve essere ripetuto sul Mac. I controlli R1 e Monte Carlo già riportati dall'autore sono stati superati e non necessitano di revisione degli algoritmi.
