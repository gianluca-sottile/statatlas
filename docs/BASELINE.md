# BASE-01 — Baseline prima di StatAtlas 2.0

Registrata il 13/11/2026, prima di qualunque modifica del ciclo 2.0.

| Voce | Valore |
|---|---|
| Commit | `18706512e0136572049be4cb02240ebb0844a317` (“StatAtlas 1.4.1: correlazioni negative nel lab 15”) |
| Versione | 1.4.1 (CHANGELOG); README allineato a 1.4.1 in questa sessione (prima riportava 1.4.0) |
| Build | `python3 build.py` → `index.html` 615 KB (641 237 byte), 25 script |
| Test numerici | `node tests/test_core.js` → 49 superati, 0 falliti |
| Smoke test (jsdom 24) | 10 script in `tests/smoke/`: nessun errore JS (`smoke_lab06.js` è il primo script storico e stampa solo il numero di schede) |
| Laboratori | 16, tutti `ready` |
| `index.html` | file generato da `build.py`: non va modificato a mano |

## Limiti noti della baseline
- Gli script R dei laboratori non sono stati eseguiti in R reale nell’ambiente di sviluppo (R non disponibile): verifica a carico dell’utente.
- Nessuna CI: i test si eseguono a mano; `jsdom` è installato fuori dal repository (`NODE_PATH`).
- Collaudo su Safari, Firefox e mobile reali non ancora eseguito.

## Come rieseguire
```bash
python3 build.py
node tests/test_core.js
npm install jsdom@24        # una sola volta, dipendenza di sviluppo
for f in tests/smoke/*.js; do node "$f" index.html; done
```
