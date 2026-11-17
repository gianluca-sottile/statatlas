> **DOCUMENTO STORICO — consolidamento tecnico parziale.** Questo testo registra lo stato della candidate PRECEDENTE, non lo stato di rilascio della Macrofase C. Le affermazioni di traduzioni mancanti e gate GNU R non eseguito **sono superate**. Consultare [accettazione Mac 17 novembre 2026](MACROFASE_C_ACCETTAZIONE_MAC_2026_11_17.md), [checklist aggiornata](MACROFASE_C_CHECKLIST_RILASCIO.md) e [matrice di copertura EN](MACROFASE_C_STATO_TRADUZIONI.md).

# StatAtlas 2.1 — Macrofase C: archive consolidato

Questa distribuzione raccoglie **l'intera candidate tecnica della Macrofase C** e tutte le patch successive.
Non è ancora la release bilingue definitiva: le sezioni teoriche estese, le Challenges e parti dei controlli rimangono in italiano.
La traduzione completa e l'audit finale di accessibilità restano attività aperte.

## Correzioni incorporate

- Preflight R stabile (`tests/check_r_packages_C.R`, `tests/run_macrofase_C.sh`).
- Generatore di benchmark numerici privo di confronti fittizi sul laboratorio 22 e formato corretto delle tolleranze.
- Creazione automatica di `verifica/runs/` nei benchmark R generati.
- Test del generatore autonomo su estrazione pulita, senza richiedere gli snapshot `_raw.json` creati durante il collaudo.
- Verificatore finale `tests/verify_parity_C.py` incluso: riconosce il report legacy 01–16 e quello nuovo 17–25; controlla la build e i CSV generati.

## Installazione e uso

Estrarre l'archivio in una cartella separata e accedere a `statatlas-main`.
Per un nuovo collaudo integrale, con GNU R, Node e dipendenze Python configurati:

```sh
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_C.sh > MACROFASE_C_COLLAUDO.log 2>&1
```

Se sono già disponibili **nella cartella di progetto** i report R effettivamente prodotti dalla stessa build corrente, per la sola verifica aggregata senza rieseguire R:

```sh
python3 tests/verify_parity_C.py
```

I report CSV prodotti sul Mac **non sono inseriti** nello ZIP: non vanno sostituiti con risultati sintetici o vecchi. Per verificare una cartella appena estratta, eseguire il collaudo integrale.

**Ambito scientifico:** il confronto numerico riguarda uno scenario predefinito per ciascuno dei primi 25 laboratori (R1); non dimostra equivalenza algoritmica globale R2. I sei laboratori spaziali hanno test numerici separati.
