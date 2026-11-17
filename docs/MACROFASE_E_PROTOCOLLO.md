# Macrofase E — StatAtlas for Teachers: contratto tecnico

Data: 17 novembre 2026 · Candidate locale, NON pubblicata · dipendenza: Macrofase D pubblicata, commit `80f2ea6`.

## Scopo e interfaccia

La nuova voce **StatAtlas per docenti / StatAtlas for Teachers** nella barra laterale apre il compositore a `#/teachers`. Il docente può:

1. Specificare titolo, destinatari, obiettivi/descrizione e lingua del percorso (IT/EN).
2. Aggiungere da 1 a 24 attività dai 31 laboratori. Lo stesso laboratorio può comparire più volte, con istruzioni/preset diversi; ogni attività ha un identificativo stabile, titolo, consegna e durata prevista.
3. Selezionare una, due, tre o nessuna delle tre Challenges di quel laboratorio, senza riscrivere né alterare le regole di verifica.
4. Associare una configurazione di Macrofase D (`statatlas.experiment` v1) tramite upload JSON; in alternativa, dal laboratorio aperto, usare **Aggiungi esperimento al percorso docente** per importare automaticamente lo stato corrente (inclusi checkpoint e dati manuali supportati dalla D).
5. Esportare **il progetto docente JSON** da riaprire e modificare oppure **un HTML studenti autonomo** (HTML+CSS+JS embedded, nessun CDN/backend). Sono artefatti differenti.

La pagina HTML studenti incorpora la stessa build dei 31 laboratori e monta solo il percorso definito. Il menu dell'atlante viene nascosto nella vista studenti; un controllo sull'hash riporta alla tappa corrente se si tenta una navigazione non assegnata. Questa limitazione è **di interfaccia, non di sicurezza**: come qualunque HTML offline, può essere ispezionato o modificato.

## Schema JSON docente

```json
{
  "format": "statatlas.teaching-path",
  "version": 1,
  "engine": "<SHA-256 del motore StatAtlas corrente>",
  "id": "path-unique-id",
  "language": "it",
  "title": "Dal campione all'inferenza",
  "description": "Obiettivi formativi e contesto",
  "audience": "Classe quarta",
  "steps": [{
    "id": "step-unique-id",
    "lab": "intervalli",
    "title": "La copertura di un intervallo",
    "instructions": "Confronta Wald e Wilson e formula una conclusione",
    "minutes": 25,
    "challengeIds": ["ci-t", "ci-wald"],
    "preset": null
  }]
}
```

L'`engine` vincola progetto e preset alla stessa build. La validazione limita dimensioni e testi, 24 attività, valori delle opzioni, Challenge IDs, duplicazioni e tipi: niente valutazione dinamica, `eval` o HTML proveniente dal docente. Un progetto con versione o fingerprint incompatibili viene rifiutato. Per migrare progetti fra release future sarà necessario sviluppare una migrazione esplicita, con nuovi test.

## HTML studenti e report

L'HTML studenti incorpora il CSS, il JS, i 31 laboratori e il progetto con JSON reso sicuro per i tag `script`. I testi docente e studente sono inseriti con `textContent`, mai interpretati come markup. Non contiene librerie JavaScript richieste via rete. I collegamenti al corso R restano esterni e richiedono rete, se utilizzati.

Per ogni attività lo studente vede consegna, tempi previsti, laboratorio originale, sole Challenges assegnate, campo di riflessione, avanzamento e pulsante report. Le risposte corrette restano parte del motore, perciò **non è un sistema di verifica antifrode**. I report sono utilizzabili per valutazione formativa, non esami certificativi.

Il browser mantiene localmente le riflessioni e i progressi (quando `localStorage` è consentito); **Cancella avanzamento locale** permette di eliminarli. **Esporta report JSON** produce un file `statatlas.student-report` v1 con identificativo percorso, fingerprint del motore, data e per ogni attività: id, laboratorio, stato completato autodichiarato, testo di riflessione, Challenge assegnate e risolte. Non vengono inseriti nomi studenti o altri identificatori personali; nessun dato viene inviato al docente automaticamente.

## Riproducibilità e limiti

Un preset D con checkpoint viene ripristinato tramite l'adapter già testato in Macrofase D e lo stesso build fingerprint. Per dati modificati manualmente valgono i limiti D (punti dei sei laboratori spaziali e delle regressioni 10/14, adapter di 06). I valori numerici e le regole delle 93 Challenges non vengono modificati da E. Non è dimostrata equivalenza R/JS universale (R2): le prove automatiche di parità coprono scenari predefiniti R1.

L'HTML deve essere provato anche con un doppio click in Safari (`file://`) sul Mac prima del rilascio: il browser Playwright dell'ambiente di sviluppo blocca il protocollo `file://` per policy, quindi i test di integrazione lo verificano attraverso un documento autonomo caricato in memoria. L'app offline non usa `fetch` locale. È inoltre opportuno un successivo audit con VoiceOver e un collaudo di usabilità con docenti/studenti.

## Test e gate di pubblicazione

- `node tests/test_E_schema.js`: schema docente, limiti di validazione, IDs e preset, input ostili.
- `python3 tests/test_E_teachers.py 390` e `1366`: compositore, challenge filter, HTML studente, report e input ostili.
- `python3 tests/test_E_presets_navigation.py 390` e `1366`: due tappe, checkpoint D, preset, import JSON, navigazione, report bilingue.
- `python3 tests/test_E_repeat_lab.py`: ripetizione dello stesso laboratorio in due tappe con checkpoint differenti e navigazione bidirezionale.
- `sh tests/run_macrofase_E.sh`: esegue **l'intera validazione della D** (incluse C, 31 esportazioni GNU R e 84 verifiche numeriche R/JS) e poi i test della E. Crea `verifica/REPORT_MACROFASE_E.json` con l'hash di build esclusivamente dopo l'esito positivo.
- `scripts/pubblica_github.sh` richiede anche tale report prima del push. Non distribuire report generati sulla vecchia build o copiare prove GNU R da altri archivi.

**Stato:** la candidate non è ancora stata eseguita con GNU R sul Mac, né è stata sottoposta a test di native Safari `file://` o pubblicata.
