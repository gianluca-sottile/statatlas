# StatAtlas · Stato e decisioni consolidate

**Aggiornamento: 16 novembre 2026 · Macrofase B, candidate locale.**

## Decisioni del responsabile del progetto

- Progetto didattico: StatAtlas, 31 laboratori in 8 parti, 93 Challenges; statistica spaziale parte VIII, boosting laboratorio dedicato, reti neurali in apprendimento supervisionato.
- Costruzione tecnica: HTML/CSS/JavaScript nativo, unico `index.html` senza dipendenze runtime, modalità offline, responsive mobile/tablet.
- Ogni laboratorio deve avere esperimento significativo, teoria essenziale/avanzata, verifiche R, esercizi e bibliografia; massima attenzione a correttezza delle ipotesi e lettura didattica dei risultati.
- **Metodo di lavoro:** macrofasi complete, senza numerose consegne/collaudi intermedi; un archivio coerente e un rapporto per fase, un solo collaudo locale e una singola pubblicazione GitHub. Istruzioni puntuali con comandi e risultati attesi.
- Validazione didattica con studenti solo quando il repository sarà completo.

## Macrofase A: conclusa e pubblicata

- Audit e correzioni formali, test responsive 31/31, mappe spaziali unificate, verifiche R 31/31, test scientifici e multipiattaforma spaziali.
- Repository: https://github.com/gianluca-sottile/statatlas; ramo `main`; commit pubblicato `2f7a9b0`.
- L'utente conferma che anche i controlli finali GitHub Actions/Pages sono a posto; non si deve ripetere il collaudo A se i sorgenti non cambiano.
- Il MacBook Pro usato per il collaudo è un Intel Core i9 con macOS 26.7.3; dopo la correzione dell'ambiente Python sono funzionanti R 4.6.1, Node e Playwright. Non assumere che l'iMac Apple Silicon e il MacBook Intel siano lo stesso computer.

## Macrofase B: implementazione locale consegnata

- Fonte del corso: https://github.com/gianluca-sottile/An-R-Tutorial-for-Beginners, sito Quarto con 67 lezioni in 4 livelli e approfondimento opzionale deep learning. Lezioni italiane 1–60; opzionali 61–66 in inglese.
- Ponte curricolare in tutti i 31 laboratori, con 62 riferimenti a 29 lezioni, distinti 15 diretti e 16 propedeutici; per la Parte VIII il corso dà prerequisiti, non una trattazione spaziale.
- Ogni laboratorio: domanda guida, esperienza controllata, riscontro R, avvertenza, scheda studente scaricabile; 31 schede anche nel repository e guida docente strutturata.
- QA locale: build riuscita, suite JS, 31 controlli scientifici e 11 spot-check, browser 31/31 a 390 e 1366, responsive 31/31 a 320/390/768/1024. Nessun R disponibile nell'ambiente dell'assistente.
- Mappatura: `docs/MACROFASE_B_MAPPATURA_CORSO.csv`; guida: `docs/MACROFASE_B_GUIDA_DOCENTE.md`; note: `docs/MACROFASE_B_RELAZIONE.md`.

## Criteri di chiusura e limiti non negoziabili

1. **Unico collaudo Mac:** `sh tests/run_macrofase_B.sh > MACROFASE_B_COLLAUDO.log 2>&1`. L'ultimo passo genera il report R 31/31 associato alla build esatta.
2. **Non equiparare eseguibilità R ed equivalenza numerica R/JS:** per i laboratori 01–25 rimane aperta una batteria di benchmark accoppiati e tolleranze dichiarate (`docs/MACROFASE_B_PARITA_01_25.md`). Non scrivere 'R2 certificato 31/31'.
3. Nessun push finché le verifiche della nuova build non sono accettate; il repository GitHub è ancora alla versione A fino a nuova pubblicazione.
4. Il corso R è un repository indipendente: i nuovi collegamenti qui vanno da StatAtlas al corso, non sono stati applicati backlink dentro i `.qmd` del corso.
5. Macrofase C: internazionalizzazione completa IT/EN, WCAG e successiva validazione didattica quando il progetto sarà completo.
