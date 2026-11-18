# StatAtlas 2.1 — Audit e patch bilingue dei 31 laboratori

**Data:** 18 novembre 2026. **Stato:** candidate integrale, non pubblicata; collaudo conclusivo GNU R sul Mac obbligatorio.

## Difetto e perimetro

La precedente infrastruttura bilingue copriva catalogo, companion scientifici, Challenges e molte etichette, ma non tutte le stringhe prodotte dai singoli simulatori. In inglese il lab 22, ad esempio, conservava “Addestramento epoca per epoca”, le etichette della rete, la perdita, istruzioni e righe della tabella. Problemi analoghi erano distribuiti fra i 31 laboratori, inclusi i sei spaziali.

## Correzione

- Nuovo glossario esplicito e revisionato `src/core/i18n-live.js` per testi scientifici, statistiche, legende, tabulati e istruzioni. Nessuna traduzione remota o dipendenza online.
- La traduzione viene applicata anche ai nuovi elementi generati da una simulazione, ai testi SVG e alle etichette numeriche parametriche, preservando i token quantitativi e senza modificare codice R, seed, valori dei controlli o identificatori dei laboratori.
- Il listener di aggiornamento osserva solo nodi modificati, non scandisce l'intera pagina a ogni frame. Gli elementi `pre` e `code`, i blocchi italiani marcati e il codice scientifico sono esclusi.
- Corretto il riconoscimento della sezione Interpretation nel percorso EN: prima la conversione precoce dell'intestazione poteva impedire di nascondere la spiegazione italiana originale, lasciandola visualizzata assieme alla companion inglese.
- Link nel footer per Gianluca Sottile (sito personale e mailto), Simul2000 (sito del progetto) e Marcello Chiodi (mailto), in IT/EN, comprese le pagine di StatAtlas for Teachers.

## Verifiche locali

`tests/test_L_language_surface.py` apre tutti i 31 laboratori in EN, esamina i testi realmente visibili e li ricontrolla dopo l'attivazione di un passo quando disponibile, con asserzioni aggiuntive sul lab 22 e sui quattro link nel footer. Il test è incluso nel comando unico `tests/run_macrofase_UX.sh` e nel workflow manuale browser GitHub Actions.

Si aggiungono ai gate bilingui esistenti: 31 laboratori, 93 Challenges, 62 viste teoriche e 104 esercizi in EN, a 390 e 1366 px.

Le 31 esportazioni R sono state confrontate tramite SHA-256 con la build UX precedente: **31/31 identiche**. Gli snapshot numerici per i laboratori 01–25 sono anch'essi **identici**, salvo il fingerprint della nuova build. Si mantiene il limite documentato R1 (scenario di default, non equivalenza algoritmica generale R2).

**Limite metodologico:** il test di superficie verifica 31 stati iniziali e una selezione di transizioni dinamiche, non ogni possibile combinazione di controlli, parametro e scenario. Eventuali ulteriori frasi di una diramazione di simulazione non coperta dal test richiederanno nuovi casi di prova; non viene dichiarata una copertura esaustiva dell'intero spazio degli stati.

## Collaudo e pubblicazione

Estrarre lo ZIP completo in una nuova cartella, poi eseguire una sola volta:

```bash
PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_UX.sh > MACROFASE_UX_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
tail -n 25 MACROFASE_UX_COLLAUDO.log
```

Solo dopo `SUCCESS: STATATLAS UX REDESIGN LOCAL ACCEPTANCE PASSED` e prova manuale Safari IT/EN, pannelli e file `file://` studente: `sh scripts/pubblica_github.sh --no-push`, esame del diff, poi un unico `sh scripts/pubblica_github.sh`.
