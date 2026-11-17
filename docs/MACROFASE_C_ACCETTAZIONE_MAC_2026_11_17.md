# StatAtlas 2.1 — Accettazione Mac della Macrofase C

**Data:** 17 novembre 2026  
**Build validata — SHA-256 `index.html`:** `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`  
**Ambiente di esecuzione:** macOS, GNU R 4.6.1, Python/Playwright/Chromium, Node.js.  
**Evidenza primaria:** `MACROFASE_C_COLLAUDO(3).log`, fornito dal responsabile del progetto. Non incluso nello ZIP di distribuzione.

## Gate tecnico-scientifici

| Gate | Risultato osservato |
|---|---|
| Compilazione standalone | PASS, 1567 KB, 72 moduli |
| 31 esportazioni ed esecuzioni GNU R | **31/31 PASS**, parsing e runtime indipendenti |
| 31 identità scientifiche indipendenti | **31/31 PASS** e 11 spot check |
| Gruppo R/JS 01–16 | **16/16 laboratori; 48/48 controlli PASS** |
| Gruppo R/JS 17–25 | **9/9 laboratori; 36/36 controlli PASS** |
| Gate aggregato su esiti della stessa build | **25/25 laboratori; 84/84 confronti PASS**, zero divergenze/salti |
| Bilinguismo EN/IT mobile e desktop | **31 laboratori, 93 Challenges, 62 sezioni teoriche, 104 esercizi**, PASS |
| Worksheet IT e EN | PASS, nomi e download distinti |
| Controlli di accessibilità mirati | PASS (lang, skip, focus, dialoghi, reduced motion) |
| Responsive, grandi campioni, coperture SciPy | PASS |
| `scripts/pubblica_github.sh --no-push` | PASS, **nessun commit e nessun push** |

**Esito finale del gate:** `SUCCESS: C PHASE RELEASE CANDIDATE PASSED LOCAL AUTOMATED GATES`.

## Interpretazione rigorosa

La parità R/JavaScript è accertata **per lo scenario predefinito di ciascuno dei 25 laboratori (livello R1)**, non per tutte le configurazioni né per ogni stato intermedio (R2/R3). L’edizione inglese è un percorso autonomo, non la traduzione letterale di tutti i paragrafi italiani. Le verifiche automatiche di accessibilità non certificano WCAG 2.2 AA e non sostituiscono VoiceOver/NVDA, Safari o prove con studenti.

## Prerequisiti e passaggi per il rilascio

Dalla **stessa cartella collaudata**, con gli esiti R locali in `verifica/runs/`, eseguire una sola volta:

```sh
sh scripts/pubblica_github.sh
```

Il programma controlla nuovamente i report R legati all’hash, clona `main`, copia il progetto e pubblica un commit. Il suo `rsync --delete` elimina dal repository i **due CSV storici** `verifica/verifica_statatlas_01_16_esiti.csv` e `verifica/verifica_statatlas_esiti.csv`, sostituiti da report della nuova fase (i report dei run attuali sono volutamente esclusi dal pacchetto pubblico). I vecchi CSV rimangono accessibili nella cronologia Git, non vengono distrutti dalla storia.

Dopo il comando verificare il commit `main`, GitHub Actions e GitHub Pages, inclusi switch IT/EN e download. La presenza della build validata nel repository non garantisce da sola che Pages abbia già distribuito il nuovo sito.
