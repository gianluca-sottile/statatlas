# StatAtlas 2.1 — Rifinitura finale della barra e dei pannelli UX

**Data:** 18 novembre 2026. **Stato:** candidate integrale da collaudare sul Mac, non pubblicata. **Build HTML SHA-256:** `0fb7a854401ad116d5a11179b67f65bba8b229b0c863afed5b1f5a1b8f1540e1`.

## Obiettivo

Mantenere al centro della pagina l'**esperimento statistico** e ridurre le azioni ridondanti e lo scorrimento fra grafici e materiale di studio, senza eliminare contenuti, cambiare i motori numerici o introdurre dipendenze online.

## Nuovo ordinamento della barra

| Percorso didattico | Riproducibilità in R | Strumenti |
|---|---|---|
| **Guida** · **Approfondisci** · **Mettiti alla prova** | **Corso R** · **Codice R** | **Salva / Condividi** |

Tutti i pulsanti sono della medesima famiglia grafica, con bordo discreto, focus visibile e dimensioni touch adeguate; su schermi stretti i gruppi vanno a capo mantenendo l'ordine logico. Il vecchio pulsante rapido **Simula** è rimosso esclusivamente dalla barra: i comandi originali **Avvia / Passo / Completa / Reset** dei simulatori sono preservati.

**Guida:** obiettivi, istruzioni, contesto originale e companion scientifico inglese.
**Approfondisci:** l'originario pannello della teoria, con livelli essenziale/avanzato, esercizi e riferimenti; non è duplicato.
**Mettiti alla prova:** le tre schede Challenge originali vengono *spostate* nel pannello, non ricreate. Una scheda aperta alla volta, senza perdere condizioni iniziali, risposte, correzioni o progresso. **Vai ai controlli** chiude il pannello; l'azione per riprendere la sfida lo riapre sullo stato precedente.
**Corso R:** link coerenti con IT/EN, lezione 62 solo EN, schede del corso disponibili.
**Codice R:** il blocco originale genera lo script dall'esperimento corrente. Il pannello rigenera il codice all'apertura, senza perdere i controlli Copia / Scarica `.R` e senza generare copie obsolete.
**Salva / Condividi:** integra i comandi JSON e link della D, con controllo sul fingerprint della build.

I pannelli sono **sovrapposti**, non alterano la posizione della simulazione e hanno chiusura tramite `Esc`, click fuori o pulsante dedicato, con ritorno del focus al comando iniziale. Il contenuto sotto il pannello mantiene lo stato. Lo spostamento di nodi DOM originali preserva gli handler già registrati.

## Percorsi autonomi StatAtlas for Teachers

Nella pagina studente generata dalla E il collegamento **Vai alle Challenges assegnate** apre direttamente il nuovo pannello. Il contatore mostra soltanto le sfide assegnate dal docente, non le tre possibili in ogni laboratorio. Progetto docente JSON e HTML studente dimostrativo sono stati rigenerati per il fingerprint corrente. Nulla è raccolto da server: i report restano JSON locali, modificabili e non idonei a certificare esami.

## Contratto scientifico e riproducibilità

- I **31 file `.R` esportati** sono identici byte per byte alla precedente build scientific-workbench; verificati con SHA-256 sul file e manifest aggiornato alla nuova build.
- Gli snapshot iniziali **01–25** contengono gli **stessi valori numerici** di prima; sono stati rigenerati per registrare il nuovo fingerprint.
- I benchmark `verifica/parita_C_01_16.R` e `verifica/parita_C_17_25.R` sono rigenerati sulla nuova build; il confronto con GNU R richiede ancora l'esecuzione sul Mac.
- Confronti di parità R/JS: **R1** (uno scenario iniziale per ciascuno dei 25 laboratori) e non attestazione generale **R2**.
- In questa rifinitura **non** si sviluppa la futura Macrofase F — StatAtlas Classroom.

## QA già eseguito nell'ambiente di sviluppo

Test JavaScript, 31 invarianti scientifici, 31 laboratori in Chromium 390/1366 px con nuovo ordinamento, Challenges in overlay con ritorno ai controlli, codice R live, download, Teoria nativa, link R IT/EN, test E della modalità studente, test spaziali dedicati e verifiche responsive a 320/390/768/1024 px. Una suite legacy cumulativa ha superato il limite temporale di questo ambiente prima di concludersi; non è considerata interamente superata. Il comando Mac esegue la regressione completa e produce una nuova attestazione.

## Unico collaudo conclusivo sul Mac

Estrarre lo ZIP completo in una **nuova cartella**; poi, dalla radice `statatlas-main/`:

```bash
PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
tail -n 25 MACROFASE_UX_COLLAUDO.log
```

Atteso: `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED`, e rapporto `verifica/REPORT_MACROFASE_UX.json` con lo **stesso** SHA-256 indicato sopra. Sui Mac con ambienti Python in altre cartelle, adattare solo il prefisso del `PATH`.

**Prima del push** controllare in Safari l'apertura/chiusura dei sei comandi, il focus con `Tab`/`Esc`, una Challenge modificando parametri e tornando alla sfida, la copia e il download di uno script R dopo variazione di un parametro, e un HTML studente offline aperto da Finder (`file://`). I link al corso esterno richiedono Internet. I test automatici non sostituiscono una valutazione WCAG con tecnologia assistiva.

**Pubblicazione:** esclusivamente dopo il collaudo e l'audit delle modifiche con `sh scripts/pubblica_github.sh --no-push`; un solo `sh scripts/pubblica_github.sh` sul ramo `main`, poi controllare Actions e Pages. Non eseguire push dalla fase di sviluppo.

## Schermate di verifica

| Vista | Desktop 1366 px | Mobile 390 px |
|---|---|---|
| Barra dei laboratori | [Toolbar](UX_TOOLBAR_1366.png) | [Toolbar](UX_TOOLBAR_390.png) |
| Challenges in pannello | [Challenges](UX_CHALLENGES_1366.png) | [Challenges](UX_CHALLENGES_390.png) |
| Codice R in pannello | [Codice R](UX_CODE_R_1366.png) | [Codice R](UX_CODE_R_390.png) |

Le schermate sono state prodotte in Chromium dalla **candidate attuale**, non da un mockup.
