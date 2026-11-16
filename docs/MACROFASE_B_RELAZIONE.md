# StatAtlas 2.1 · Macrofase B — Relazione preliminare di integrazione

**Base di partenza:** archivio della Macrofase A che ha generato il commit pubblicato `2f7a9b0`. Il repository remoto non è stato modificato da questo ambiente; nessun push eseguito.

## Realizzato

- Collegamento curricolare in tutti i 31 laboratori, senza alterare gli algoritmi di simulazione.
- Due collegamenti per laboratorio (62 riferimenti) verso 29 lezioni distinte del corso R.
- Distinzione esplicita tra 15 laboratori con allineamento diretto e 16 con allineamento solo propedeutico.
- Percorso in tre passaggi (domanda, esperimento controllato, verifica R) e avvertenza metodologica dedicati a ogni laboratorio.
- Scaricamento di una scheda studente strutturata in Markdown, con autovalutazione; 31 schede anche esportate in `docs/schede_studenti_B/`.
- Guida per il docente e mappa CSV tracciabile.
- Homepage con accesso diretto al corso R (sito esterno); offline StatAtlas preservato.
- Test automatici sulla coerenza della mappatura e test funzionali del browser con download.

## Validazioni locali

- Build Python completata; test sintattico JS completato.
- Suite JS e 31 verifiche scientifiche indipendenti superate.
- Test bridge 31/31 a 390 e 1366 px, inclusi 4 download per larghezza, senza eccezioni.
- Responsive 31/31 a 320, 390, 768 e 1024 px superato dopo l'integrazione.

## Confini della certificazione

- Nessun nuovo report GNU R `31/31` è stato prodotto qui, dove GNU R non è disponibile; la nuova build ha SHA-256 differente dalla Macrofase A. Deve passare il gate GNU R sul Mac prima della pubblicazione.
- La parità numerica generalizzata R/JS dei laboratori 01–25 non è dimostrata dal test di esecuzione degli esportatori. Si richiede benchmarking specifico per modello e dataset, con tolleranze dichiarate.
- I collegamenti Quarto sono ricavati dalla navigazione pubblica `_quarto.yml`; alcuni sono stati verificati direttamente via web, ma non è stata eseguita una scansione HTTP 200 su tutti i 62 riferimenti.
- Il repository del corso R è indipendente e **non viene modificato**; questa integrazione è diretta da StatAtlas al corso. L'integrazione inversa è candidata a una successiva revisione del progetto del corso R.
- Nessuna valutazione didattica empirica su studenti è stata eseguita.

## Stato

**Implementazione curricolare pronta come candidate locale.** Non dichiarare chiusa l'intera Macrofase B fino al collaudo GNU R sulla build finale, ai controlli CI/Pages e a una decisione esplicita sull'equivalenza JS/R 01–25.
