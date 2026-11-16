# StatAtlas 2.1 — Consegna unificata: Challenges e confronto sperimentale A/B

**Data:** 15 novembre 2026. **Stato:** versione di sviluppo pronta per un collaudo unico e successivo push, **non** tag di release 2.1.0. Baseline: `StatAtlas_2_1_Diagnostica_Leggera.zip` (31 laboratori). Nessun push effettuato durante lo sviluppo.

## 1. Perimetro funzionale completato

- **31/31** laboratori con accesso immediato *Mettiti alla prova* in testata, ritorno ai controlli, stato formativo locale.
- **93** sfide: 3 per laboratorio. Le nove sfide 08 (intervalli), 18 (validazione) e 30 (kriging) conservano i propri requisiti specialistici. Le rimanenti **84** applicano il protocollo generale osservabile.
- **Comprensione:** almeno un risultato numerico finito e pertinente prodotto dopo l'apertura della sfida.
- **Applicazione:** modifica effettiva del parametro pertinente e due risultati numerici validi con il nuovo valore.
- **Avanzato:** due valori effettivamente utilizzati del controllo pertinente; **almeno tre misurazioni valide in ciascuna configurazione**; tutti gli altri controlli registrati uguali lungo i due bracci; risposta corretta sia al quesito teorico sia al confronto dei risultati numerici. Se un altro parametro cambia, la sfida **non** risulta pronta e indica quali controlli rimettere a parità.
- **Tabella A/B:** parametri, numero di misurazioni, medie osservate e avvertenza scientifica. La selezione empirica è invalidata dopo nuove osservazioni o variazioni del confronto.

## 2. Esattamente che cosa significa «appaiato»

Il confronto è *appaiato* soltanto nei seguenti due laboratori, a condizione che le osservazioni presentino **lo stesso dataset deterministico, lo stesso seed e la stessa iterazione**:

| Lab | Variabile confrontata nell'Avanzato | Elementi vincolati | Risultato |
|---|---|---|---|
| 21 — Gradient Boosting | Profondità dell'albero | scenario, n, rumore, seed, altri controlli; checkpoint con identico numero di alberi | Loss di validazione agli stessi passi 1, 2, 3 (o altri tre passi comuni) |
| 22 — Reti neurali | Learning rate | dati, split, seed dati, seed pesi, H, attivazione e altri controlli; checkpoint con identica epoca | Loss di validazione alle stesse epoche |

Il generatore e i dati già presenti nel laboratorio sono ricostruiti dagli stessi semi. Si verifica l'identità del contesto sperimentale mediante i metadati `dataKey` e `iteration`, entrambi restituiti da `challengeEvidence()` senza mutare il modello. **Questo è un appaiamento di traiettorie, non un insieme di tre repliche statisticamente indipendenti**: non si calcolano errori standard o p-value impropri. Prima della sfida avanzata, lo studente deve premere **Ricomincia**, eseguire tre passi per A, modificare un solo controllo ed eseguire tre passi per B con lo stesso seed.

Negli **altri 26 laboratori con sfide estese** si impone la costanza dei controlli visibili, ma non è certificata l'identità di tutte le variabili casuali sottostanti né l'indipendenza delle osservazioni. Perciò le differenze A/B restano **descrittive** e il feedback lo afferma. Per realizzare un esperimento Monte Carlo indipendente e appaiato in tali laboratori occorrerebbe intervenire nei disegni di generazione delle repliche e nei protocolli di ciascun motore: non viene simulata questa garanzia con un confronto fittizio.

## 3. Qualità dell'evidenza e limiti scientifici

La tabella A/B usa la stessa precisione decimale della risposta «pari alla precisione mostrata». Nel caso appaiato si usano solo i checkpoint comuni; negli altri casi le medie dei valori registrati. Queste medie sono **riassunti descrittivi**, non stimatori automaticamente confrontabili con un test inferenziale. Alcuni indicatori sono stati cumulativi, serie storiche, errori di validazione o singoli valori; non possono essere trattati uniformemente come misure iid. Per le 31 definizioni precise vedere `docs/FASE_2_1_EVIDENZE_QUANTITATIVE_2026_11_15.md`.

I motori di simulazione/stima e gli script R preesistenti non sono modificati. Le modifiche ai laboratori 21 e 22 aggiungono solamente metadati di evidenza in sola lettura. Restano fuori dal perimetro: analisi psicometrica degli item, certificazione dei risultati formativi, esaustiva revisione delle dimostrazioni teoriche e verifica su Safari reale.

## 4. Verifiche riproducibili

```bash
python3 build.py
sh tests/run_qa_2_1.sh
node tests/test_challenge_design.js
python3 tests/test_challenges_diagnostic_browser.py
python3 tests/test_challenges_quality_browser.py
python3 tests/test_challenge_pairing_browser.py
python3 tests/test_challenges_navigation_browser.py
python3 tests/test_challenges_browser.py
# Browser E2E: 84 sfide negli altri 28 laboratori
python3 tests/test_challenges_targeted_browser.py 0 6
python3 tests/test_challenges_targeted_browser.py 6 12
python3 tests/test_challenges_targeted_browser.py 12 18
python3 tests/test_challenges_targeted_browser.py 18 23
python3 tests/test_challenges_targeted_browser.py 23 28
```

`run_qa_2_1.sh` comprende la build, le suite JavaScript e i 31 controlli scientifici indipendenti oltre a 11 controlli mirati. I test Chromium sono stati eseguiti localmente; la suite R completa non è stata eseguita in questo ambiente, che non dispone di `Rscript`.

## 5. Un solo collaudo manuale dopo il push

1. **GitHub:** su `main` deve comparire il nuovo commit e il workflow **StatAtlas Scientific QA** deve essere verde.
2. **Sito:** 31 laboratori; in ogni testata il pulsante **Mettiti alla prova · 0/3**, tre sfide e il comando **Torna alla sfida**.
3. **GBM, laboratorio 21:** nell'Avanzato premi **Ricomincia**, genera 3 alberi, cambia *solo* profondità, genera 3 alberi. La tabella deve mostrare A e B (3/3) e «confronto appaiato»; una risposta empirica sbagliata deve essere respinta, quella corretta accettata.
4. **Controllo anti-confondimento:** ripeti la sfida GBM cambiando anche il learning rate tra A e B: deve segnalare il parametro diverso e **non consentire di completare** la sfida.
5. **Piloti e smartphone:** controlla una sfida in 08 (intervalli), 18 (validazione) e 30 (kriging); verifica su smartphone che testata, tabella A/B, grafici e pulsanti non provochino overflow della pagina.

**Criterio di accettazione:** tutti e cinque i controlli completati, workflow GitHub verde, nessun errore JavaScript rilevante. Solo dopo è opportuno decidere se creare il tag ufficiale `v2.1.0`.
