# StatAtlas for Teachers — Guida pratica / Practical Guide

**Versione 2.1 · Italiano e English · Utilizzo locale e offline**

Questa guida spiega lo strumento anche a docenti che non hanno esperienza di programmazione. La guida rapida in sei passaggi è disponibile anche **dentro l'interfaccia** di StatAtlas, aprendo la voce «Come funziona StatAtlas for Teachers?».

## IT — Per cominciare

**Che cosa permette di fare?** StatAtlas for Teachers consente di costruire un percorso didattico personalizzato scegliendo tra i 31 laboratori interattivi. Ogni attività può comprendere una consegna, una durata, da zero a tre Challenges, e facoltativamente i parametri salvati di un esperimento. Il risultato è una **pagina HTML autonoma per gli studenti**, che può essere aperta senza collegamento Internet.

### Passaggi per una prima lezione

1. Apri `index.html` nel browser. Seleziona «StatAtlas for Teachers» dalla barra laterale. Puoi scegliere italiano o inglese con il pulsante della lingua.
2. Seleziona «Impostazioni del percorso». Compila **Titolo del percorso** (obbligatorio per esportare), Destinatari e Obiettivi e descrizione; imposta la lingua degli studenti. Chiudi con `×` o `Esc`.
3. Nella sezione **Sequenza didattica** seleziona un laboratorio, poi «Aggiungi laboratorio». Puoi inserire fino a **24 attività**, anche ripetendo lo stesso laboratorio con consegne differenti.
4. Seleziona un'attività nell'elenco e personalizza **Titolo dell'attività**, **Consegna agli studenti** e **Minuti previsti**. Spunta da **zero a tre Challenges**; usa le frecce per cambiare l'ordine o «Rimuovi» per eliminare un'attività. Il titolo dell'attività non è obbligatorio: può restare quello predefinito.
5. **Facoltativo — scenario riproducibile**: apri un laboratorio, configura l'esperimento e usa il pulsante «Aggiungi esperimento al percorso docente» per importare lo stato nel percorso come nuova attività. In alternativa, se hai un preset di esperimento `.json`, caricalo nel campo dedicato della specifica attività (deve essere del laboratorio corrispondente). Senza preset, agli studenti vengono presentate le impostazioni iniziali del laboratorio.
6. Apri **«Esporta / Apri progetto»** e salva **il JSON docente** («Salva progetto JSON») e **l'HTML studenti** («Esporta HTML studenti»). Consegna l'HTML agli studenti; conserva il JSON per modificare il percorso in seguito.

### Esempio concreto: campionamento e intervalli

Puoi costruire una sequenza con «04 · Grandi numeri e limite centrale», «06 · Media, mediana e massima verosimiglianza», «08 · Intervalli di confidenza». Inserisci una domanda guida per ogni attività (ad esempio: «Cosa accade alla variabilità delle medie al crescere di n?»), assegna una o due Challenges pertinenti e imposta una durata indicativa. Il pacchetto include anche `examples/E_progetto_campionamento.json` ed `examples/E_percorso_campionamento.html` come esempi già predisposti per la candidate corrente.

### Cosa consegnare e cosa conservare

| File | A chi serve | Uso |
|---|---|---|
| `StatAtlas_Teachers_project.json` | Docente | Progetto modificabile: per continuare usa «Apri progetto docente». **Non esiste il salvataggio automatico del progetto docente.** |
| `StatAtlas_Teachers_<id>.html` | Studenti | Pagina autonoma con motore e attività; si apre offline in un browser. |
| `StatAtlas_student_report_*.json` | Studenti / docente dopo consegna volontaria | Report locale esportabile dallo studente, contenente avanzamento e riflessioni. Non è un voto d'esame certificato. |

### Domande frequenti e limiti

- **Devo usare un server, un account o un servizio cloud?** No. Creazione, esportazione e attività studenti funzionano senza backend.
- **Posso assegnare più volte lo stesso laboratorio?** Sì, in attività diverse, fino al limite complessivo di 24.
- **Gli studenti inviano automaticamente i risultati?** No. Il report viene prodotto e conservato localmente; la condivisione con il docente, se desiderata, avviene con una modalità concordata esterna a StatAtlas.
- **Chi salva l'avanzamento dello studente?** Il browser può mantenere lo stato locale del percorso; è comunque consigliabile esportare il report JSON. Le funzionalità di conservazione locale dipendono dalle impostazioni del browser, soprattutto con file `file://` e modalità privata.
- **Posso modificare un percorso salvato in una versione precedente?** Il file JSON include un'impronta del motore StatAtlas. L'apertura in una build diversa può richiedere una migrazione: non è garantita la compatibilità tra candidate differenti. Conserva anche la versione del progetto con cui lo hai creato.
- **Le Challenges misurano una certificazione?** No. Sono strumenti formativi; le risposte o i report non costituiscono valutazioni d'esame certificate.

---

## EN — Getting started

**What is it for?** StatAtlas for Teachers helps you assemble a custom teaching path from 31 interactive laboratories. Each activity may have instructions, a duration, zero to three Challenges, and optionally a saved experiment preset. You export a **standalone student HTML page** that runs without an Internet connection.

### Your first teaching path

1. Open `index.html` in your browser and choose **StatAtlas for Teachers** from the sidebar. Use the language toggle to switch between Italian and English.
2. Open **Path settings**. Enter the **Path title** (required for export), Audience, Description and objectives, and choose the Student language. Close the panel using `×` or `Esc`.
3. Under **Teaching sequence**, select one of the 31 labs and click **Add laboratory**. Add up to **24 activities**; a lab may appear more than once with different instructions.
4. Select an activity in the outline. Edit **Activity title**, **Instructions for students**, and **Estimated minutes**. Choose **zero to three Challenges**, reorder with the arrows or remove an activity. Activity titles may retain their defaults.
5. **Optional — reproducible experiments**: configure an experiment in its laboratory, then select **Add experiment to teaching path** to append an activity with that preset. Alternatively, upload a matching experiment `.json` preset inside the activity. Without one, the original laboratory defaults apply.
6. Open **Export / Open project**. Save both the **teacher JSON** using **Save teacher JSON** and the **student HTML** using **Export student HTML**. Give the HTML to students and keep the JSON to edit later.

### A classroom example

Create a sequence using **04 · Law of large numbers and central limit theorem**, **06 · Mean, median and maximum-likelihood estimators**, and **08 · Confidence intervals and coverage**. Include one question or prediction in each activity, choose relevant Challenges and set a reasonable time budget. Ready-to-inspect example files are provided in `examples/`.

### What do the files mean?

| File | User | Purpose |
|---|---|---|
| `StatAtlas_Teachers_project.json` | Teacher | Editable project; reopen with **Open teacher project**. **No automatic teacher-project saving.** |
| `StatAtlas_Teachers_<id>.html` | Student | Self-contained learning page, usable offline. |
| `StatAtlas_student_report_*.json` | Student, optionally shared with teacher | Local progress and reflection report, not a certified exam grade. |

### Common questions and limitations

- **Is a server or account required?** No; authoring and the student experience work without a backend.
- **Can I repeat a laboratory?** Yes, as distinct activities, up to 24 total.
- **Are student results uploaded automatically?** No. Any report is local; sharing it is a separate choice.
- **Does student progress persist?** The browser can store local progress, subject to its `file://` and privacy restrictions. Export the JSON report for an explicit copy.
- **Will teacher JSON from an earlier version always open?** No. Projects identify their engine build, and cross-build compatibility is not guaranteed. Keep the matching StatAtlas build.
- **Are Challenges certified grades?** No. They support formative activities only.

## Technical notes / Note tecniche

- No remote services, telemetry, network assets or backend were added by this guide.
- The teacher footer uses the same centered content container as the editor.
- The teacher guide uses a native keyboard-accessible HTML `details/summary` disclosure, with IT/EN text and no new persistence layer.
- No laboratory algorithms, random-number generators or statistical formulas were modified by this UI intervention.
