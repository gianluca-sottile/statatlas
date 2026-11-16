# StatAtlas · Parità numerica R/JavaScript nei laboratori 01–25

**Stato: piano di benchmark, non certificazione R2.** I 31 script R sono stati eseguiti correttamente nella Macrofase A, e i laboratori spaziali dispongono di 12 snapshot con controlli multipiattaforma. Per i primi 25, la corretta esecuzione non equivale al confronto numerico sullo stesso stato dei motori.

## Protocollo formale

1. Acquisire **lo stato vivo del browser**: seed, parametri, campione, output numerici e criteri di arrotondamento; tenere il riferimento JS in un JSON firmato SHA-256.
2. Esportare lo script R nello stesso istante, eseguirlo in sessione isolata con la versione R dichiarata.
3. Confrontare almeno un caso regolare e un caso limite per laboratorio, con criterio esplicito: tolleranza assoluta/relativa per numeri reali, identità esatta per campioni e partizioni quando prevista.
4. Se gli algoritmi sono deliberatamente diversi, classificare R3 e verificare il *metodo*, non pretendere identità bit-a-bit.
5. Registrare R0/R1/R2/R3 separatamente e produrre evidenze, errori massimi, stdout/stderr, versioni e motivi di ogni tolleranza.

## Matrice di esiti da completare

I livelli di questa tabella sono **obiettivi proposti**, non livelli già attestati.

| Lab | Metodo | Target | Numeri da confrontare | Stato |
|---:|---|---|---|---|
| 01 | Distribuzioni | R1 | CDF/PMF/PDF, inclusione estremi | Non certificato su snapshot accoppiati |
| 02 | Bivariata | R1 | momenti e condizionata | Non certificato su snapshot accoppiati |
| 03 | Simulazione | R1 | inversione e Monte Carlo | Non certificato su snapshot accoppiati |
| 04 | LGN e TCL | R1 | medie e quantili su repliche | Non certificato su snapshot accoppiati |
| 05 | Adattamento | R1 | statistiche e p-value MC | Non certificato su snapshot accoppiati |
| 06 | Stimatori | R1 | bias, varianza, MSE | Non certificato su snapshot accoppiati |
| 07 | Fisher | R1 | score, Hessiana e informazione | Non certificato su snapshot accoppiati |
| 08 | Intervalli | R1 | copertura e limiti | Non certificato su snapshot accoppiati |
| 09 | Test | R1 | statistica, livello e potenza | Non certificato su snapshot accoppiati |
| 10 | Regressione | R1 | OLS, Cook, bande | Non certificato su snapshot accoppiati |
| 11 | Regressione Lp | R3 | minimizzazione e parametri | Non certificato su snapshot accoppiati |
| 12 | GLM | R1 | coefficienti, score e devianza | Non certificato su snapshot accoppiati |
| 13 | ARMA | R1 | serie e ACF/PACF | Non certificato su snapshot accoppiati |
| 14 | Quantilica | R3 | check loss e coefficienti | Non certificato su snapshot accoppiati |
| 15 | Penalizzata | R3 | standardizzazione, lambda, soluzioni | Non certificato su snapshot accoppiati |
| 16 | Spline | R3 | smooth, df effettivi, CV | Non certificato su snapshot accoppiati |
| 17 | Segmentata | R3 | profilo breakpoint e bootstrap | Non certificato su snapshot accoppiati |
| 18 | Validazione | R2 | fold, scelte e stime OOF | Non certificato su snapshot accoppiati |
| 19 | kNN | R2 | vicinato, distanze, predizioni | Non certificato su snapshot accoppiati |
| 20 | Alberi e forest | R3 | split, regole CART, OOB | Non certificato su snapshot accoppiati |
| 21 | Boosting | R2 | pseudo-residui, loss, early stopping | Non certificato su snapshot accoppiati |
| 22 | Reti neurali | R2 | gradienti, loss, pesi, ordine update | Non certificato su snapshot accoppiati |
| 23 | PCA | R1 | autovalori, autovettori, ricostruzione | Non certificato su snapshot accoppiati |
| 24 | Clustering | R2 | kmeans/hclust con regole di parità | Non certificato su snapshot accoppiati |
| 25 | DBSCAN | R2 | core, border, noise e tie rules | Non certificato su snapshot accoppiati |

## Condizione di chiusura

Una parità generale R2 **non deve essere dichiarata** quando il laboratorio usa pacchetti R con convenzioni differenti o procedure di ottimizzazione esterne. L'obiettivo corretto è una matrice tracciabile che distingua:
- R0: dati identici; R1: risultati numerici entro tolleranze; R2: identiche regole dei passaggi algoritmici; R3: confronto del metodo con algoritmi non identici.

Finché queste verifiche non sono automatiche, il dashboard non deve contenere formule del tipo “31 laboratori con equivalenza numerica piena R/JS certificata”.
