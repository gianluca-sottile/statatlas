# StatAtlas · Resoconto implementazione — Challenges / Audit scientifico

**Data:** 14 novembre 2026 · **Stato:** pilota di sviluppo; release pubblica 2.0.0 non modificata.

## Consegne effettive

1. **StatAtlas Challenges** su LAB 08, 18, 30: tre livelli per modulo, nove sfide. Gli obiettivi richiedono interazioni reali con il laboratorio prima di valutare le risposte, con feedback formativo e progress locale. Nessun account, rete, scoring psicometrico o modifiche alle simulazioni.
2. **Inventario scientifico strutturale** di 31 laboratori: 131 obiettivi, 104 esercizi e 116 riferimenti; matrice CSV riproducibile e calendario di revisione dimostrativa.
3. **Audit mirato** sulla copertura degli intervalli, sulla validazione predittiva e sul kriging; correzione della formula-cardine erroneamente universale sulla copertura e 14 note sulle condizioni di validità di altre formule (incluso il richiamo sulla formula corretta).
4. **Browser e test** automatici: percorso completo nei tre laboratori, layout mobile/tablet, compatibilità dei 31 moduli e suite numerica originale.

## Compatibilità numerica

- Le modifiche ai LAB 08, 18 e 30 consistono soltanto nel nuovo metodo `challengeState()`, **di sola lettura**.
- Gli altri 28 sorgenti dei laboratori sono immutati; tutti i moduli di stima, RNG e simulazione preesistenti sono immutati.
- I confronti R confermati in precedenza dall'autore non sono stati rieseguiti in questa sessione. Poiché gli algoritmi statistici non sono stati toccati, il pilot non modifica i risultati numerici attesi.

## Test effettivamente eseguiti

- `python3 build.py` — riuscito; un singolo HTML offline.
- `node tests/audit_science.js` — 31 schede complete di strutture editoriali principali.
- `node tests/test_challenges.js` — 28 assert su esito corretto, risposta errata e prerequisiti non soddisfatti.
- `for f in tests/test_*.js; do node "$f"; done` — tutte le 18 suite superate; nessuna regressione registrata.
- `python3 tests/test_challenges_browser.py` — tre laboratori a 390/768/1366px, simulazione t con 100 intervalli, 20 repliche di validazione e un sensore aggiuntivo nel kriging, feedback raggiunto e verificato.
- `python3 tests/test_mobile_tablet.py` — 31/31 laboratori alle larghezze 320/390/768/1024px, assenza di overflow e errori JavaScript; menu, controllo dell'esperimento, zoom e teoria mobile superati.

## Limiti

Questa consegna non costituisce una revisione dimostrativa completa di tutti i 31 laboratori; il report `docs/AUDIT_SCIENTIFICO_31.md` distingue esplicitamente screening e audit mirato. Nessuno dei nove item è validato psicometricamente. La prova su Safari iPhone/iPad fisici resta consigliata. La persistenza e l'esportazione dei risultati individuali non sono previste in questo pilota.

## Comandi ripetibili

```bash
python3 build.py
node tests/audit_science.js
for f in tests/test_*.js; do node "$f"; done
python3 tests/test_challenges_browser.py
python3 tests/test_mobile_tablet.py
```

## Test didattico consigliato prima dell'estensione

Proporre le nove sfide a un piccolo gruppo di studenti senza aiuti, rilevare quali prerequisiti non vengono compresi e dove il feedback è ambiguo, poi correggere gli item. Solo dopo considerare l'estensione ai rimanenti 28 laboratori.
