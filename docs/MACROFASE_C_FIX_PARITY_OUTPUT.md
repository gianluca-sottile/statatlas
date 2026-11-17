# Macrofase C — robustezza output parità R/JS

Il controllo dei laboratori 17–25 del 16 novembre 2026 ha concluso **36 verifiche OK** ma si è arrestato al salvataggio del CSV: mancava la cartella `verifica/runs/` nell'esecuzione autonoma. Ora lo script generato crea la cartella prima di salvare e il generatore incorpora sempre la correzione nei due gruppi. È stato inoltre reso esplicito l'errore relativo della **verifica interna R** del gradiente del laboratorio 22: non è un ulteriore confronto R/JS.

La build HTML e gli snapshot numerici sono invariati. I risultati del gruppo 01–16 già ottenuti sulla stessa build rimangono validi; ripetere soltanto lo script R del gruppo 17–25, seguito dal verificatore di sintesi.

```sh
Rscript --vanilla verifica/parita_C_17_25.R > MACROFASE_C_PARITA_RJS.log 2>&1 && \
python3 tests/verify_parity_C.py >> MACROFASE_C_PARITA_RJS.log 2>&1
printf 'Codice di uscita: %s\n' "$?"
```

Un PASS documenta il confronto **su uno scenario predefinito per laboratorio**; non dimostra la piena equivalenza algoritmica per tutte le configurazioni.
