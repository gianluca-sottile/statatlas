# StatAtlas — Macrofase C: checklist di rilascio (17 novembre 2026)

**Stato:** build bilingue collaudata localmente e idonea alla pubblicazione sul ramo `main`. Lo stato di deployment va verificato dopo il push. Non confondere il superamento dei test con una certificazione WCAG o con parità algoritmica universale.

## Validazioni completate sulla build corrente

- [x] Edizione inglese autonoma per 31/31 laboratori: 124 obiettivi e 31 guide scientifiche.
- [x] 62/62 capitoli metodologici EN, 31 esempi svolti e 104 esercizi EN con soluzione.
- [x] 93/93 Challenges EN (quesiti, alternative, spiegazioni e task), preservando criteri di valutazione.
- [x] Localizzazione di controlli principali, schede studente, collegamenti al corso R e commenti esplicativi degli export.
- [x] Edizione IT originale preservata, inclusi nomi storici dei worksheet italiani.
- [x] Regressioni JavaScript, controllo scientifico indipendente 31/31 e 11 spot check matematici.
- [x] Chromium: test bilingui per 31 laboratori e 93 Challenges a 390 e 1366 px; responsive a 320/390/768/1024 px.
- [x] Test di accessibilità mirati: lingua HTML, tastiera, focus, dialoghi e reduced-motion.
- [x] GNU R su Mac: 31/31 esportazioni R parse/execute PASS, vincolate all'hash della build.
- [x] Parità numerica R/JavaScript (R1): laboratori 01–16, 48/48 controlli; laboratori 17–25, 36/36; gate 25/25 PASS.
- [x] Anteprima `sh scripts/pubblica_github.sh --no-push`: gate R e confronti 25/25 superati; nessun commit/push.

**SHA-256 di `index.html`:** `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`.

## Passaggio di pubblicazione

- [ ] Pubblicare una sola volta con `sh scripts/pubblica_github.sh` dalla stessa cartella collaudata.
- [ ] Verificare su GitHub il commit `main`, la CI leggera e GitHub Pages, incluse IT/EN e download.

## Attività successive e limiti dichiarati

- [ ] Audit manuale WCAG 2.2 AA (inclusi VoiceOver/NVDA, Safari, zoom e contrasto); i test automatici non equivalgono a certificazione.
- [ ] Valutazione didattica con studenti dopo il rilascio completo.
- [ ] Confronti multi-scenario R/JavaScript per un'eventuale certificazione R2/R3.

L'edizione inglese è un percorso scientifico autonomo, **non una traduzione letterale** di tutti i paragrafi italiani. Eventuali messaggi dinamici specialistici meno comuni possono conservare termini italiani. I riferimenti esterni del corso R possono essere in italiano.

I risultati CSV di verifica della vecchia distribuzione post-B restano recuperabili nella cronologia Git; i report della nuova build sono prodotti localmente e non vengono pubblicati come se fossero equivalenze per ogni scenario.

Per dettagli: [accettazione Mac](MACROFASE_C_ACCETTAZIONE_MAC_2026_11_17.md), [rapporto finale](MACROFASE_C_RELAZIONE_FINALE.md), [copertura EN](MACROFASE_C_STATO_TRADUZIONI.md).
