# Checklist di rilascio — Macrofase E

1. Estrarre lo ZIP completo in una **nuova** cartella, senza sovrascrivere il repository D già pubblicato.
2. Usare il virtualenv Python e le dipendenze già installate per D e GNU R.
3. Dal progetto estratto:

```sh
PATH="$HOME/Downloads/statatlas-main/.venv/bin:$PATH" sh tests/run_macrofase_E.sh > MACROFASE_E_COLLAUDO.log 2>&1
echo "Exit: $?"
tail -n 25 MACROFASE_E_COLLAUDO.log
```

4. L'esito atteso è `SUCCESS: MACROFASE E LOCAL ACCEPTANCE PASSED` e un report `verifica/REPORT_MACROFASE_E.json` riferito alla SHA-256 della build corrente.
5. **Safari manuale:** aprire `index.html`, navigare a `StatAtlas per docenti`, creare un progetto di due tappe, esportare JSON e HTML; aprire il secondo file con doppio clic, usare le simulazioni offline, compilare due riflessioni, esportare il report. Verificare la modalità EN, un preset D e la cancellazione dei progressi.
6. Allegare in chat il log completo; non eseguire il push senza revisione dell'output.
7. Solo dopo approvazione: `sh scripts/pubblica_github.sh --no-push`, poi un unico `sh scripts/pubblica_github.sh`. Controllare GitHub Actions e Pages.

**Nota:** il test con Safari è manuale e distinto dalle verifiche automatiche Chromium. Non utilizzare report R o E di build precedenti.
