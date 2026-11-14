# StatAtlas — correzione di rilascio del laboratorio 26 (Moran)

**Origine:** feedback dell'autore con confronto fotografico LAB 26 vs LAB 25, 14/11/2026.
**Ambito:** solo componente visuale e ciclo di vita di LAB 26, stile locale, test browser; **nessuna modifica al motore numerico** `spatial.js` e `spatial-areal.js` né agli script R.

## Diagnosi riproducibile

Nel file `src/labs/26-moran.js` il runner era configurato con `speed: 5`, mentre `src/core/ui.js` definisce soltanto quattro modalità `SPEEDS` con indici 0–3. L'invocazione di `run.controls()` tentava quindi `speeds[5].label` e lanciava `TypeError: Cannot read properties of undefined (reading 'label')` prima di terminare `mount()`.

Conseguenze: `.fig svg` = 0 e tabella risultati = 0 righe; `SA.ui` non terminava il montaggio, `enhanceLab()` non veniva eseguito e non comparivano copertina SVG, obiettivi, details della previsione, riquadro di valutazione e guida della tabella. I test numerici e mock-DOM non rilevavano l'eccezione, perché sostituivano il runner reale con uno stub che ignorava l'indice di velocità.

## Correzioni applicate

1. Impostato `speed: 2`, valido nel runner reale. Per evitare regressioni il mock runner del test di montaggio ora rifiuta indici fuori 0–3.
2. Ripristinato il completamento del montaggio e di `enhanceLab()`: copertina SVG `SA.art.get('moran')`, obiettivi, pulsante Approfondisci sotto gli obiettivi, details di previsione, quadro «Che cosa stiamo valutando», tabella dei risultati con guida.
3. Allineata la previsione agli altri laboratori: tre opzioni radio in box espandibile e spiegazione contestuale.
4. Aggiunta guida in quattro passi per usare l'esperimento, spiegazione della cella selezionata e contatore di permutazioni in tempo reale.
5. Aggiunto avvio automatico delle permutazioni, con tutti i controlli esistenti di pausa, passo, completamento e riavvio. Quando si cambiano parametri o valori nella mappa, la permutazione riparte sul nuovo insieme di dati e pesi.
6. Aggiunti tre indicatori (Moran I osservato, permutazioni effettuate, p-value) con i componenti grafici già usati dal LAB 25.
7. Aggiunto test browser vero (`tests/smoke/smoke_lab26_browser.py`) che verifica tutti i contenuti, il funzionamento dell'animazione, l'interazione con celle e parametri, il drawer, la navigazione tra LAB 25 e 26, il rendering mobile e il tema scuro.

## Verifiche eseguite

- `python3 build.py`: OK, file offline autonomo ricostruito.
- Test JavaScript: 205/205 controlli numerici OK, compresi i 48 controlli spaziali, in aggiunta a test di montaggio e boosting.
- Test Chromium/Playwright reale: OK, nessuna eccezione; 1 copertina SVG, 5 obiettivi, 3 risposte, 3 grafici, 7 righe di tabella, autoplay effettivo, interazione sulle 64 celle, cambio del vicinato, trend, drawer e navigazione; test su viewport mobile 390px in tema scuro.
- Confronto R: il proprietario ha dichiarato lo script R del LAB 26 già verificato; in questa correzione non sono stati modificati dati, formule e algoritmi. R **non è stato rieseguito** in questo ambiente (Rscript non presente).

## Limiti residui

- Il test Chromium è headless e non sostituisce la verifica manuale su Safari/macOS e su dispositivi reali.
- Il test browser in repository richiede la dipendenza *opzionale* `playwright` per Python e il browser Chromium; nessuna di queste dipendenze è richiesta per utilizzare l'HTML offline.
- I LAB 27–31 non rientrano in questa correzione.
