# Macrofase C — Audit di accessibilità: verifiche e limiti

## Interventi già implementati

- Impostazione di `html[lang]` durante il cambio di lingua; scelta da tastiera con etichette esplicite e stato `aria-pressed`.
- Percorsi didattici inglesi completi come trattazione autonoma (31 guide, 62 capitoli, 104 esercizi, 93 Challenges). L’italiano originale viene preservato e marcato con `lang="it"` dove compare come materiale di confronto.
- Menu laterale compatto dotato di `inert`, backdrop, Escape, gestione del focus e `aria-expanded`.
- Finestra della mappa con 31 nodi raggiungibili dalla tastiera, Escape e ciclo del focus contenuto nel dialogo.
- Collegamento per saltare al contenuto; un solo titolo h1 per laboratorio; focus sul titolo dopo navigazione.
- Supporto `prefers-reduced-motion`, messaggi di stato e colori del tema con focus visibile.
- Test Playwright su desktop e mobile (390/1366 px) per cambio lingua, navigazione tastiera, 31 laboratori, 93 Challenges e pannelli teorici; ulteriori test responsive a 320/390/768/1024 px.

## Limiti del test

Non è stata eseguita una certificazione WCAG 2.2 AA. Le prove sono smoke test mirati; non includono scansione completa con axe, VoiceOver/NVDA e verifica manuale di tutti i componenti SVG, canvas, grafici interattivi e tabelle. Mancano test specifici su Safari/iPhone reali, zoom testuale 400%, alto contrasto del sistema operativo e alcune combinazioni browser/lettore schermo.

## Verifiche manuali necessarie prima di dichiarare «accessibile AA»

1. Percorrere l'interfaccia IT/EN con sola tastiera, inclusi menu, mappe, pannelli, grafici ingranditi, schede e Challenges.
2. Eseguire test con VoiceOver/Safari e NVDA/Firefox su lettura delle equazioni, aggiornamenti simulati, slider, tabelle e canvas/SVG.
3. Misurare contrasto di **tutti** i testi e delle rappresentazioni grafiche (non solo i token CSS) in tema chiaro/scuro.
4. Verificare target touch, reflow a 320 px e zoom browser/testuale, e individuare eventuali grafici che richiedano descrizioni testuali alternative.
5. Eseguire scansione automatizzata axe/lighthouse sulla versione pubblicata e risolvere i rilievi ad alta gravità.
6. Ripetere le verifiche dopo ogni traduzione dei contenuti interattivi.

**Principio:** la conformità non si deduce dall'assenza di errori JavaScript né da alcuni controlli ARIA verdi.
