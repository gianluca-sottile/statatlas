# Macrofase C — Matrice di copertura della versione inglese

**Stato (17 novembre 2026):** edizione bilingue implementata, validata in JavaScript/Chromium e **collaudata con GNU R 31/31 e parità R/JS 25/25 (84/84)** sulla build corrente. Il testo italiano originale è conservato. La pubblicazione pubblica va verificata sul commit e su Pages.

| Componente | Copertura inglese implementata | Verifica |
|---|---:|---|
| Titoli delle otto sezioni | 8/8 | Test dei dati e interfaccia |
| Titoli, presentazioni e obiettivi dei laboratori | 31/31 e 124 obiettivi | Browser mobile/desktop |
| Guide scientifiche introduttive EN | 31/31 | Browser |
| Capitoli metodologici EN: essenziale/avanzato | 62/62 | Browser, 2 livelli per lab |
| Esempi numerici EN svolti | 31/31 | Browser nel livello essenziale |
| Esercizi EN con soluzioni | 104 | Browser e dati di curriculum |
| Challenges: quesiti, opzioni, spiegazioni, task | 93/93 | Browser, regole di valutazione originali preservate |
| Schede di collegamento con il corso R | 31/31 | Nodi della UI; link esterni esplicitamente IT dove pertinente |
| Schede studente EN scaricabili | 31/31 | Dati integrati nella app |
| Etichette di input, pulsanti, tab, grafici e messaggi comuni | Glossario esplicito >500 chiavi | Test per lab; copertura stati non universale |
| Script R, commenti narrativi dello snapshot pre-C | 174 commenti trasformati | 31/31 controlli sulla sola parte testuale |
| Code R, seed, algoritmi e formule | Invariati | Confronto delle righe di codice non commentate |
| Test tastiera, focus, responsivo | 390 e 1366 px, quattro ampiezze aggiuntive | Smoke test automatici, non certificazione WCAG |

## Qualità della traduzione

La versione inglese è una **riedizione scientifica completa come percorso didattico autonomo**: i due livelli offrono enunciati, ipotesi, spiegazioni metodologiche, esempi ed esercizi specifici per ogni laboratorio. **Non rappresenta una traduzione filologica o letterale riga per riga** dell'intero corpo teorico italiano. Il testo italiano rimane disponibile come riferimento. Nei casi in cui il corso esterno espone una pagina italiana, StatAtlas non ne inventa una versione EN.

Gli indici della risposta corretta e le funzioni che verificano il lavoro empirico delle Challenges non vengono modificati dalle traduzioni; gli identificatori dei parametri restano in lingua di origine, mentre le relative etichette sono presentate in inglese.

### Residui e limiti

La localizzazione dell'interfaccia è basata su un vocabolario esplicito. Etichette scientifiche generate dinamicamente in combinazioni non testate, alcune notazioni e parti delle istruzioni del codice R esterno potrebbero conservare l'italiano. Il controllo dei 31 script R copre lo snapshot pre-C dei commenti; dopo il collaudo si rigenerano i codici della nuova build. I separatori e le chiamate R lasciate in commenti non vengono tradotti.

Il perimetro richiesto per la pubblicazione comprende il superamento del gate numerico GNU R sulla build corrente e l'assenza di regressioni bilingui nei test automatici; la prova con tecnologie assistive e la validazione pedagogica con studenti saranno documentate separatamente e non possono essere dichiarate completate.

Il protocollo scientifico R0/R1/R2/R3 è indipendente dalla copertura editoriale: risultati R1 su uno scenario non certificano R2 per l'intero laboratorio.
