# StatAtlas for Teachers — required path title UX

**Candidate:** 19 novembre 2026. La correzione è stata apportata dopo la patch linguistica EN dei 31 laboratori.

## Problema

La validazione preesistente rifiutava percorsi privi del **titolo del percorso**, ma l’interfaccia non indicava che fosse obbligatorio. L’errore era riportato nello stato generale, fuori dal pannello di esportazione, risultando facilmente invisibile.

## Correzione

- Il campo **Titolo del percorso / Path title** espone un asterisco e un’indicazione «Obbligatorio / Required», con testo che specifica l’uso per entrambe le esportazioni.
- Il campo HTML conserva il medesimo `aria-label` per i test e le tecnologie assistive, ma usa anche `required`, `aria-required` e una descrizione associata tramite `aria-describedby`.
- Quando un’esportazione JSON o HTML è avviata con titolo vuoto (anche soli spazi), l’esportazione non avviene, compare il pannello Impostazioni, il campo viene evidenziato, un errore bilingue è mostrato accanto al campo e il focus viene spostato lì.
- Correggendo il titolo, l’errore scompare e la stessa attività può essere esportata; schema JSON, contenuti dei laboratori, script R e report degli studenti sono invariati.
- Il titolo *della singola attività* resta modificabile e può utilizzare il valore predefinito del laboratorio. Le attività devono essere almeno una per esportare, come già previsto dallo schema.

## Test

`tests/test_E_required_title.py` verifica UI italiana e inglese a 390 e 1366 px: marcatura required, apertura automatica, errore in linea e focus, titolo contenente soli spazi, ripristino, download di JSON e HTML e assenza di errori JS.

Il comando unico `sh tests/run_macrofase_UX.sh` include il nuovo test, oltre ai gate scientifici A–E, GNU R 31/31 e 84 confronti R/JS (scenari predefiniti R1). Questa candidate richiede **un nuovo collaudo Mac** per il nuovo fingerprint, malgrado l’assenza di modifiche numeriche. Nessun push effettuato.
