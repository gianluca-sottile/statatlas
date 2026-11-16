# StatAtlas 2.1 — Aggiornamento velocità e README dopo Macrofase B

**Data:** 16 novembre 2026. **Base:** archivio della Macrofase B, che l'autore ha confermato pubblicato online. **Ambito:** manutenzione mirata precedente alla Macrofase C. Nessun push GitHub è stato eseguito durante questa revisione.

## Modifiche applicate

1. Sostituiti i quattro scatti di velocità (Lenta/Media/Veloce/Turbo) con un cursore uniforme da **0 a 100** a passo **1**, inizializzato a **25** all'apertura dei laboratori temporizzati **01–25**.
2. La conversione è continua e monotona. I valori 0, 25, 100 corrispondono rispettivamente a circa **2, 30 e 1200** passi/s *nominali*, non a durate garantite. Un accumulatore basato sul tempo di animazione limita i passi per fotogramma a **24**; il lavoro non recupera gli intervalli in cui la scheda è stata sospesa. Il livello 0 non è una pausa.
3. Sono state uniformate le implementazioni speciali del LAB 01 e del LAB 06. Nel LAB 06 una nuova apertura ripristina 25 anche se il cursore era stato cambiato in una visita precedente; i comandi di pausa, passo, completa e riavvio sono preservati.
4. LAB 15 mostra il controllo nella vista **Percorsi**, sede dell'animazione delle repliche; la vista **Spazio delle soluzioni** non esegue una sequenza temporizzata. Nei LAB 26–31 l'esperimento spaziale reagisce in tempo reale alle modifiche dei punti, senza slider di velocità artificiale.
5. Aggiornati README, CHANGELOG, messaggio di commit dello script di pubblicazione, workflow QA e runner del collaudo completo. Aggiunti test unitari e test Chromium dedicati e uno screenshot dei controlli aggiornati.

Non sono stati modificati generatori pseudo-casuali, formule, stimatori, dati o algoritmi statistici, né il contenuto scientifico dei file R esportati.

## Verifiche effettivamente eseguite qui

| Controllo | Esito |
|---|---|
| `python3 build.py` | PASS — 64 script nell'HTML offline |
| `node --check` su tutti i moduli `src` | PASS |
| Tutte le suite `tests/test_*.js`, compreso `test_speed_slider.js` | PASS |
| 31 controlli scientifici indipendenti e ulteriori verifiche metodologiche | PASS |
| Browser — 25 slider a 390 e 1366 px | PASS |
| Browser — 6 mappe senza controllo di velocità non operativo | PASS |
| Browser — LAB 06 riaperto con valore iniziale 25 | PASS |
| Test dinamico — livello 0 nettamente più lento di 100 | PASS |
| Responsive generale 320/390/768 px | PASS nel test completo parziale; **1024 px: controllo mirato 31/31 PASS**. Il collaudo integrale riunito va ripetuto sul Mac (limite di sessione qui) |
| Generazione browser di 31 esportazioni R; verifica della lunghezza e integrità del manifest | PASS |
| Parsing ed esecuzione R sulla nuova build | **Da eseguire in GNU R sul Mac** |

**SHA-256 del nuovo `index.html`:** `41d423dd09e93bd3bb7118989f8119b0b641f27e008cd32db1d07bc164ee23d2`.

L'esecuzione R **31/31** completata durante la Macrofase B riguardava una build diversa e **non** è un attestato valido per il nuovo hash. I benchmark numerici completi R/JavaScript per i laboratori 01–25 restano fuori dal perimetro di questa modifica; vedere `docs/MACROFASE_B_PARITA_01_25.md`.

## Un solo collaudo conclusivo sul Mac

Dalla radice `statatlas-main`, mantenendo l'ambiente virtuale Python con NumPy/SciPy/Playwright e GNU R precedentemente configurato:

```bash
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_B.sh > PATCH_VELOCITA_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
```

Il risultato richiesto è codice **0**, completamento dei controlli browser sulla velocità e **31/31** esecuzioni R `PASS` con hash della build corrente. Il report sarà `verifica/REPORT_VALIDAZIONE_R_31.csv`.

Solo dopo il PASS, esaminare l'anteprima GitHub:

```bash
sh scripts/pubblica_github.sh --no-push
```

Dopo aver esaminato i file da committare, pubblicare **una sola volta**:

```bash
sh scripts/pubblica_github.sh
```

Il README aggiornato descrive lo stato dopo la Macrofase B, la nuova scala e i criteri per la futura Macrofase C; la validazione didattica con studenti resta programmata dopo la conclusione dell'intero repository.
