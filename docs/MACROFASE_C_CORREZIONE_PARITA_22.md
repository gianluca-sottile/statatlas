# Macrofase C — correzione del confronto numerico 17–25 (laboratorio 22)

## Diagnosi dal collaudo Mac

- I 31 script GNU R e il confronto numerico 01–16 risultano superati nella build `4688200eb5e87d0590fef0af83873ebd7016902058739b66dfa8489d3403668b`.
- Il confronto 17–25 si interrompe nel laboratorio 22: il pannello opzionale «20 inizializzazioni» non è stato attivato nel browser, perciò la cella del riferimento riporta «premi il pulsante». Il generatore precedente trasformava il testo privo di numeri in `c()` e chiamava `signif()` su tale valore: errore di test, non discrepanza numerica dimostrata.
- Le tolleranze vettoriali erano interpolate con `%g` in `sprintf`, producendo dettagli non scalari e warning di assegnazione nel data frame degli esiti.

## Correzioni applicate

1. Il generatore `tests/gen_verifica_R.js` non genera più il confronto opzionale sulle 20 inizializzazioni in uno **snapshot predefinito** che non le ha eseguite. Restano i confronti quantitativi di perdita e accuratezza e l'invariante sul gradiente del laboratorio 22.
2. Qualsiasi valore richiesto dall'interfaccia ma assente fa fallire il generatore: non si usa più un riferimento numerico inesistente.
3. `confronta()` ora valida tipo, lunghezze, finitezza e dimensione delle tolleranze; `registra()` registra esattamente una riga per controllo; le tolleranze multiple vengono formattate con `paste(..., collapse = " ")`.
4. `tests/generate_parity_C.py` rifiuta anche confronti generati che contengano un riferimento `c()` vuoto; il test JS dedicato verifica la regressione.

## Verifica mirata, senza ricominciare il collaudo 31/31

Nella cartella `statatlas-main`, applicare lo ZIP di correzione e poi eseguire:

```sh
{ Rscript --vanilla verifica/parita_C_17_25.R && python3 tests/verify_parity_C.py; } > MACROFASE_C_PARITA_RJS.log 2>&1
echo "Codice di uscita: $?"
```

Questo riusa il rapporto 01–16 del collaudo precedente e riesegue solo i benchmark R/JS 17–25. La verifica finale respinge esiti `DIVERSO`/`SALTATO`, assenze e hash incoerenti. Se il primo rapporto non fosse più presente, eseguire prima `Rscript --vanilla verifica/parita_C_01_16.R` sulla stessa build.

## Limiti

La correzione non modifica `index.html` né il motore delle simulazioni. I confronti documentano un solo scenario predefinito per ciascun laboratorio (evidenza di livello R0/R1); la parità generale R2 non è certificata. Il confronto delle 20 inizializzazioni richiederà acquisizione **dopo aver azionato** il relativo pulsante del laboratorio 22 e rimane fuori dal benchmark dello stato predefinito. La Macrofase C non è ancora editorialmente completa: teoria estesa e Challenges devono ancora essere tradotte. Non pubblicare la candidate come versione EN definitiva.
