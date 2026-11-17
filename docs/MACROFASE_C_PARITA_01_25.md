# Macrofase C — Protocollo di parità R/JavaScript 01–25

**Stato (17 novembre 2026):** collaudo finale sul Mac **PASS** per la build SHA-256 `cadb2eedc383c9d7faa2c957f57ef3a00410815bae0c48a347c7ce58658976d8`: **48/48** confronti nel gruppo 01–16 e **36/36** nel gruppo 17–25, **84/84**, gate aggregato **25/25 PASS**. R1 per uno scenario iniziale per laboratorio, non equivalenza algoritmica universale R2.

## Metodo

1. Il browser Chromium acquisisce, dalla build locale, 25 script R con lo stato predefinito dopo «Completa», i KPI e le righe numeriche delle tabelle, in due blocchi (01–16 e 17–25).
2. Ogni file di riferimento riporta l'hash SHA-256 della build. Se cambia il codice dell'applicazione, il generatore rifiuta i riferimenti precedenti.
3. I due generatori preesistenti `gen_verifica_R_01_16.js` e `gen_verifica_R.js` costruiscono script R dalla **nuova** acquisizione, con controlli specifici sulle statistiche mostrate da JavaScript.
4. La procedura finale `tests/verify_parity_C.py` richiede 25 laboratori, almeno un controllo numerico e una conferma di esecuzione R ciascuno, nessun `SALTATO` o `DIVERSO` e la corrispondenza degli SHA.
5. Qualsiasi errore, mancata dipendenza o divergenza fa fallire il gate. Le tolleranze rimangono quelle motivate dall'arrotondamento visualizzato nelle interfacce storiche; non sono usate per dichiarare parità di algoritmo.

## Limiti metodologici

I benchmark generati verificano **un caso predefinito** per laboratorio, non tutti gli stati possibili, i bordi del dominio o ogni algoritmo interno. R0/R1 sono supportati soltanto per quantità specificamente confrontate. Alcuni metodi sono R3 per definizione (ottimizzazioni o implementazioni differenti). L'uguaglianza di media, RMSE, power, o del valore finale del loss non dimostra R2.

| Laboratori | Benchmark | Stato |
|---|---|---|
| 01–16 | Confronti di statistiche R/browser, inclusi copertura e stime | **Build corrente: PASS (48 controlli)** |
| 17–25 | Breakpoint, CV, kNN, ensemble, boosting, reti, PCA, k-means, DBSCAN | **Build corrente: PASS (36 controlli)** |
| 26–31 | Test spaziali multipiattaforma su due snapshot per laboratorio | Eseguiti e superati nella Macrofase B; restano diversi dai benchmark R2 generali |

Anche dopo 25 PASS saranno necessari casi limite e verifiche degli stati intermedi per poter attribuire R2 a un intero laboratorio.
