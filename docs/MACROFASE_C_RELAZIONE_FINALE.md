# StatAtlas 2.1 — Macrofase C
## Rapporto tecnico-scientifico e criteri di accettazione

**Artefatto:** Macrofase C bilingue, revisione SHA-256 `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`. **Stato al 17 novembre 2026:** collaudo locale GNU R e R/JS **superato**, pubblicazione da confermare su GitHub. I riferimenti alle candidate precedenti nel rapporto descrivono lo sviluppo storico, non il risultato finale.

### 1. Obiettivo e metodo

L'edizione italiana è mantenuta integra come riferimento; l'edizione inglese è costruita mediante contenuti espliciti scientificamente rivisti, separati dalla logica numerica. Non sono tradotti i nomi interni dei parametri, le condizioni di verifica delle Challenges, le formule che determinano risultati, le istruzioni R, i seed e le scelte casuali. Ogni laboratorio offre ora un **percorso autonomo in lingua inglese**. La traduzione non è letterale frase per frase, ma una riedizione rigorosa: in particolare, i testi teorici avanzati originali rimangono disponibili in italiano come confronto.

### 2. Copertura didattica implementata

| Voce | Quantità | Fonte e verifica |
|---|---:|---|
| Laboratori con titolo, descrizione e 4 obiettivi EN | 31/31; 124 obiettivi | `src/core/i18n-goals.js`, browser |
| Guide EN domanda, esperimento e interpretazione | 31/31 | `src/core/i18n-data.js`, browser |
| Capitoli EN essenziale/avanzato | 62/62 | `src/core/i18n-theory.js`, browser |
| Esempi numerici svolti EN | 31 | `src/core/i18n-lessons.js` |
| Esercizi EN e soluzioni | 104 | `src/core/i18n-lessons.js`, browser |
| Challenges EN (quesito, 3 opzioni, spiegazione, task) | 93/93 | `src/core/i18n-challenges.js`, browser |
| Collegamenti didattici al corso R e schede studente EN | 31/31 | `src/core/course-bridge.js` |
| Lessico UI specializzato | >500 chiavi | `src/core/i18n-ui.js` |
| Commenti R narrativi tradotti negli export iniziali | 174 | `src/core/i18n-rcomments.js`, `tests/test_C_english_exports.py` |

### 3. Verifiche software locali effettuate

- Build `index.html` standalone (72 moduli JavaScript) ricostruita.
- 28 suite JavaScript e 31 controlli matematici indipendenti (con 11 spot check) superati.
- Playwright: 31/31 laboratori in EN per due viewport 390/1366 px; 93 Challenges, pannelli essenziali e avanzati, esercizi e riferimenti e ritorno all'italiano verificati.
- Playwright: etichette dei controlli, ripristino idioma e tracciamento di parametri anche quando la UI viene ricreata, con 02 bivariata 2D/3D corretto per chiavi semantiche.
- I test di accessibilità riguardano lingua, skip, focus e preferenza reduced motion. Non equivalgono a WCAG 2.2 AA o ai test con lettori di schermo.
- Controllo sui 31 export R della sola traduzione dei commenti; le righe R eseguibili sono rimaste identiche. I test R della nuova build non possono essere considerati superati soltanto da questo controllo.

### 4. Parità numerica e limiti scientifici

Una build precedente della C (`4688200e...d3403668b`) ha superato in GNU R **48 controlli 01–16 + 36 controlli 17–25**, con 31/31 esportazioni R eseguite. La nuova candidate inglese modifica codice del rendering e quindi **ha un altro SHA**: l'accettazione deve riacquisire gli snapshot correnti, rigenerare i benchmark 01–25 ed eseguirli in GNU R. Il gate finale deve rifiutare report mancanti, obsoleti o non superati. I benchmark confrontano solo scenari predefiniti (livello R1), non garantiscono R2 globale né sostituiscono prove matematiche complete.

### 5. Dipendenze e collaudo unico sul Mac

Dalla radice estratta `statatlas-main`, con Node.js, Python 3/NumPy/SciPy/Playwright/Chromium, GNU R e le dipendenze di `tests/check_r_packages_C.R`:

```sh
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_C.sh > MACROFASE_C_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
```

Esito atteso `0` e chiusura `SUCCESS: C PHASE RELEASE CANDIDATE PASSED LOCAL AUTOMATED GATES`. Consegnare **solo quel log** per la revisione conclusiva. Dopo il suo esito positivo, un solo `sh scripts/pubblica_github.sh --no-push` e un solo `sh scripts/pubblica_github.sh` saranno sufficienti, previa approvazione dell'anteprima.

### 6. Residui da non presentare come verificati

- Traduzione **letterale** di ogni singola riga italiana: non prevista. L'edizione inglese fornisce invece contenuti autonomi ed equivalenti sul piano degli obiettivi, non un'edizione parallela filologica.
- Copertura di tutti gli stati dinamici della UI/grafici, aria labels meno frequenti e code paths non esercitati: la suite verifica l'insieme dei percorsi rappresentativi.
- VoiceOver/NVDA, Safari e zoom fino al 400%, contrasto sistematico tramite axe, validazione WCAG 2.2 AA: non ancora certificati.
- Valutazione pedagogica con studenti: da condurre **dopo** il completamento del repository.
- Conclusione R2/R3 su tutti gli stati o identità degli ottimizzatori: non dimostrata.
- Pubblicazione su GitHub: non effettuata da questo artefatto.

### 7. Architettura e rollback

La build resta offline e non modifica il sito del corso R. Tutti i componenti nuovi si trovano in `src/core/i18n-*.js` e `src/core/course-bridge.js`; i sorgenti originali dei 31 laboratori sono preservati eccetto correzione UI semanticamente neutra in laboratorio 02. È possibile tornare alla versione post-B pubblicata su GitHub senza perdere dati: la candidate non è pubblicata fino al collaudo autorizzato.

### Addendum del 17 novembre 2026 — regressione download

Il controllo browser di Macrofase B falliva per una rinomina involontaria della scheda studente italiana. Ripristinato `StatAtlas_XX_scheda_studente.md` mantenendo `StatAtlas_XX_EN_student_worksheet.md` per l'inglese; ampliato il test browser per verificare entrambi i download. Rinnovati i manifest e gli snapshot quantitativi sulla build SHA-256 `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`. Per risultati e limiti vedere `docs/MACROFASE_C_CORREZIONE_DOWNLOAD_2026_11_17.md`. L'esecuzione GNU R del nuovo build rimane necessaria.


### Addendum conclusivo — collaudo Mac 17 novembre 2026

L’utente ha eseguito `tests/run_macrofase_C.sh` sulla build SHA-256 `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8` con GNU R 4.6.1. Risultati: **31/31 script R PASS**; **48/48** verifiche numeriche 01–16 e **36/36** verifiche 17–25; **25/25 laboratori, 84/84 confronti R/JS PASS**, senza `SALTATO` o `DIVERSO`; test browser EN e accessibilità mirata PASS. Messaggio conclusivo: `SUCCESS: C PHASE RELEASE CANDIDATE PASSED LOCAL AUTOMATED GATES`. La pubblicazione resta separata da questa accettazione. Non è dimostrata parità R2 né certificazione WCAG. Vedere `docs/MACROFASE_C_ACCETTAZIONE_MAC_2026_11_17.md`.
