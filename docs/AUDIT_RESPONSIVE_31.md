# StatAtlas — Audit di usabilità mobile e tablet

**Data:** 14 novembre 2026  
**Baseline:** archivio `statatlas_31_revisione_didattica.zip`, 31 laboratori.  
**Perimetro:** navigazione, leggibilità, ergonomia touch, grafici, tabelle, codice R, approfondimenti e comportamento delle interfacce su smartphone/tablet.

## Problemi identificati

1. Su tablet (in particolare 1024 px) la sidebar occupava 280 px di larghezza, restringendo inutilmente i grafici. Il menu compatto si attivava soltanto sotto 860 px.
2. L'indice dei laboratori non disponeva di backdrop, chiusura mediante Esc, stato `aria-expanded` e gestione del focus.
3. I grafici presentano talvolta molte annotazioni, difficili da leggere alla larghezza dei telefoni. Lo zoom precedente riutilizzava l'intera larghezza del telefono, senza renderle sufficientemente leggibili.
4. I comandi delle simulazioni nei pannelli con molti parametri apparivano soltanto dopo numerose righe, rendendo scomodo trovare **Avvia**.
5. Mancava un modo veloce per passare dai parametri ai grafici e ai risultati nelle pagine didattiche lunghe.
6. Pulsanti da 30–36 px, schede teoriche e tabelle avevano aree di tocco e meccanismi di lettura migliorabili.
7. Le animazioni iniziali della pagina mostravano temporaneamente testo semitrasparente su smartphone.

## Modifiche apportate

- Nuovo file `src/styles/mobile.css`, caricato per ultimo dalla build. Breakpoint tablet 1180 px, menu compatto; breakpoint touch 860 e smartphone 640 px. Allineati margini, copertine SVG, titoli e griglie.
- Nuovo indice laterale con backdrop, pulsante Chiudi, Escape, trap del focus, stato `aria-expanded`, `aria-controls` e `inert` a indice chiuso. Aggiornato `src/core/app.js`.
- Navigazione rapida *Parametri / Grafici / Risultati / Inizio* per schermi fino a 860 px. I pulsanti scorrono ai pannelli esistenti e **non** producono eventi di simulazione.
- I pulsanti già presenti **Avvia / Passo / Completa / Ricomincia** appaiono prima degli altri parametri su display compatti, tramite ordinamento CSS: stessa istanza del runner e nessuna duplicazione dello stato.
- Ingrandimento dei grafici su smartphone con larghezza di lavoro 620 px, scorrimento orizzontale e pulsante di chiusura touch visibile; aggiunto un suggerimento al primo grafico di ogni laboratorio.
- Touch target di almeno 44 px per controlli essenziali; maggiore leggibilità per slider, codice R, tabelle, formule e quattro schede nel drawer di approfondimento (due righe su telefono).
- `safe-area-inset-*`, chiusura menu mediante backdrop, contenimento dei pannelli scorrevoli e supporto `prefers-reduced-motion`. Rimossa l'animazione di ingresso sui display compatti.

## Test e verifiche

- **Sorgenti numerici:** confronto byte a byte con l'archivio baseline: tutti i 31 file `src/labs/*.js` invariati; unico modulo core cambiato `src/core/app.js` (navigazione/presentazione).
- **Build:** `python3 build.py` riuscito; file unico offline creato.
- **Suite numerica JavaScript:** tutte le suite `tests/test_*.js` passate, comprendendo 1.698 controlli numerici e 282 controlli editoriali. Test di montaggio del boosting e di Moran passati.
- **Browser Chromium:** `tests/test_mobile_tablet.py`, 31/31 laboratori alle viewport 320, 390, 768 e 1024 px. Verificati assenza di overflow orizzontale, presenza di grafici e guide, assenza di eccezioni JS e assenza di autoplay nei sei laboratori spaziali.
- **Ulteriori larghezze:** audit puntuale di tutti i 31 laboratori a 360, 820, 1180 e 1280 px, senza overflow orizzontale.
- **Interazioni touch:** apertura/chiusura menu e focus, navigazione rapida, controlli del runner, zoom con pannello scorrevole, apertura e cambio tab degli approfondimenti.
- **Screen QA:** catturate le schermate `docs/UI_MOBILE_*.png` e `docs/UI_TABLET_LAB30.png` come esempi rappresentativi.

## Limiti e test manuali consigliati

I test sono stati effettuati con Chromium in viewport touch emulati, caricando l'HTML completo direttamente nella pagina del browser. Questo elude l'esigenza di un server locale, ma **non costituisce una verifica fisica su Safari/iOS/iPadOS**. Si raccomanda di collaudare su iPhone e iPad reali: apertura del menu, rotazione portrait/landscape, gesture touch sui punti SVG interattivi, fullscreen dei grafici, comportamento della tastiera e salvataggio di CSV/PNG/R. Le prestazioni frame-per-frame non sono state misurate su hardware mobile reale.

## Comandi di verifica

```bash
python3 build.py
python3 tests/test_mobile_tablet.py
for t in tests/test_*.js; do node "$t"; done
```

Non sono stati eseguiti nuovi confronti R perché formule, generatori, algoritmi e laboratori sono identici alla baseline già verificata dall'autore.
