# StatAtlas 2.1 — Correzione delle righe R troppo lunghe

## Difetto riprodotto

Il generatore della Parte VIII produceva `d <- data.frame(x=c(...), y=c(...), z=c(...), X=c(...))` in **un'unica riga**. Per un numero sufficiente di punti la riga superava i 4094 caratteri accettati dall'input interattivo della console R: `WARNING: Truncating console input`. Un successivo comando `plot(...)` poteva quindi generare `Error: unexpected symbol`.

## Correzioni introdotte

1. `src/core/spatial-unified.js`: dati R generati con una colonna per blocco e vettori di sei valori per riga (coord. `x`, `y`, variabile `z`, covariata `X`). Nessuna modifica ai valori numerici o ai modelli.
2. `src/core/r-code.js`: formattazione sicura e comune per tutti i 31 laboratori. Aggiunge ritorni a capo **solo dopo virgole all'interno di chiamate/indici R**, mai all'interno di numeri, stringhe o commenti; massimo previsto di circa 180 caratteri nei punti in cui è possibile spezzare la riga.
3. `src/core/ui.js`: visualizzazione del codice, pulsante **Copia** e pulsante **Scarica .R** si servono della medesima trasformazione, preservando la congruenza fra le tre modalità.
4. `tests/test_r_export_linewrap.js`: test ripetibile con vettori molto lunghi e sei esportatori spaziali stressati con 250 punti ciascuno.
5. `tests/test_r_exports_browser.py`: apre le 31 lezioni in Chromium, verifica che ogni riga del codice R sia sotto 1000 caratteri, confronta il download `.R` con il testo effettivamente visualizzato dopo aver aggiunto un punto a Moran.
6. `.github/workflows/scientific-qa.yml`: nel job browser, GNU R viene installato per il parsing effettivo di tutti e 31 gli esporti con `parse(file=...)`, **senza eseguire le dipendenze esterne e senza modificare gli script statistici**.

## Verifiche e limiti

Il controllo di parsing con GNU R è automatico **sul runner GitHub**; nell'ambiente di sviluppo di questa correzione Rscript non è installato. La verifica di parsing segnala gli errori sintattici, ma non certifica esecuzione senza errori di ogni script R né equivalenza numerica completa con gli algoritmi JavaScript. Queste verifiche rimangono nella Macrofase A.

## Uso pratico

Scarica il codice con **Scarica .R** e aprilo in RStudio come file di script, quindi eseguilo con **Source**. Anche **Copia** produce codice a righe brevi; per script lunghi è preferibile il file. Se una precedente esecuzione ha lasciato il prompt R su `+`, premi Esc e riesegui il codice aggiornato dall'inizio.

Consultare anche il report separato `StatAtlas_2_1_Export_R_Rapporto.md` della consegna.
