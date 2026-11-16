# StatAtlas 2.1 - Patch post-Macrofase B: campioni, velocita e GitHub CI

Versione: candidate locale, non ancora pubblicata. Build SHA-256: `af5a9617f8f838359b0dc0d5ccafcb5d47e3218b12f968985d769c0b6c8226f5`.

## Contenuto del pacchetto

Questa candidate sostituisce la precedente patch velocita/README (mai pubblicata come patch separata) e conserva integralmente la Macrofase B.

1. **Velocita**: scala 0-100, passo 1, default 25 a ogni apertura, nei 25 laboratori temporizzati. Le 6 mappe spaziali restano a ricalcolo immediato.
2. **Numerosita**: nei laboratori 01-09 sono selezionabili 10, 100, 1000, 10000, 100000. Nel lab 04 sia LLN sia n-per-campione TCL. Le repliche Monte Carlo B/M restano indipendenti da n.
3. **Prestazioni**: grafici campionati visivamente (statistiche sul campione intero) nei lab 05 e 06; completamento cooperativo delle elaborazioni; lab 09 campiona dalla distribuzione esatta della statistica Z normale per n>=10000; lab 05 disabilita il bootstrap opzionale oltre n=10000 segnalando il motivo.
4. **LAB 08**: regione di copertura discreta calcolata con ricerca binaria nei conteggi sufficienti, coda di Poisson stabile a grandi medie, quantili chi-quadrato elevati valutati con Wilson-Hilferty. La copertura numerica e stata confrontata con SciPy. Anche l'esportazione R usa ricerca binaria e `pbinom`/`ppois`, senza iterare su 100001 campioni.
5. **README/CHANGELOG**: documentazione aggiornata a Macrofasi A+B e alla patch corrente.
6. **CI ridotta**: su push/PR gira un solo job rapido `Build + JavaScript smoke` (Node + Python per build); niente installazione automatica di R/Chromium/NumPy/SciPy. I job scientifici e browser restano richiamabili tramite `workflow_dispatch`. I cambiamenti solo a Markdown/immagini/CSV non lanciano questa QA. Il collaudo integrale locale prima del push rimane obbligatorio.

## Test effettivamente eseguiti in questo ambiente

- Build HTML: PASS, 64 script e file offline unico.
- Tutte le suite JavaScript `tests/test_*.js`: PASS.
- 31 controlli matematici indipendenti e 11 controlli aggiuntivi: PASS.
- `tests/test_sample_sizes_browser.py`: PASS, 9 laboratori, 5 opzioni e 100000 osservazioni, inclusi un passo inferenziale e l'export R.
- `tests/test_large_sample_coverage.py`: PASS, 15 confronti numerici indipendenti con SciPy (Wald, Wilson, Garwood; n fino a 100000; tolleranza assoluta 2e-7).
- `tests/test_speed_slider_browser.py`: PASS, 25 lab a 390/1366px, valore iniziale e risposta della simulazione, assenza di slider inutili nelle 6 mappe.
- `tests/test_mobile_tablet.py`: PASS a 320/390/768px; PASS a 1024px su esecuzione separata dopo limite di tempo della suite monolitica.
- `tests/export_r_live_31.py`: PASS, 31 esportazioni browser e manifest sul SHA della build corrente.
- `tests/test_r_exports_browser.py`: PASS, lunghezza di tutte le righe e download R; parsing R non eseguito qui per assenza di GNU R.
- Ispezione browser del codice R di lab08 per Wilson e Garwood: PASS, ricerca binaria presente, sintassi lambda `\(s)` preservata.

## Gate ancora richiesto sul Mac

Da `statatlas-main`, con `.venv` configurato e GNU R funzionante:

```bash
PATH="$PWD/.venv/bin:$PATH" sh tests/run_macrofase_B.sh > PATCH_POSTB_COLLAUDO.log 2>&1
echo "Codice di uscita: $?"
```

Atteso: `0`, tutte le suite e 31 esecuzioni GNU R `PASS` con build SHA esattamente `af5a9617f8f838359b0dc0d5ccafcb5d47e3218b12f968985d769c0b6c8226f5`. Questo passaggio non e stato eseguito qui e **non** deve essere considerato gia certificato.

Dopo aver esaminato `PATCH_POSTB_COLLAUDO.log`:

```bash
sh scripts/pubblica_github.sh --no-push
```

Se anteprima senza eliminazioni inattese, eseguire un **solo push** con `sh scripts/pubblica_github.sh`.

## Limitazioni deliberate

- La riduzione di CI accelera il completamento dei workflow GitHub Actions; non cambia il peso del file HTML, i tempi di rete o il rendering delle pagine GitHub Pages.
- Per n=100000 e molte repliche i calcoli pesanti possono richiedere tempo. Le statistiche non sono determinate dai soli punti visualizzati.
- Wilson-Hilferty e un'approssimazione numerica dei quantili chi-quadrato a grandi df, confrontata con SciPy; la definizione statistica di Garwood resta quella con quantili esatti.
- La parita numerica completa R/JS dei lab 01-25 non e ancora certificata; la riuscita dei 31 script R non e da sola una prova di equivalenza.
- La valutazione didattica con studenti resta rinviata a repository completo.
