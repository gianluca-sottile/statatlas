# Macrofase D — Protocollo tecnico e limiti della riproducibilità

Il contratto `statatlas.experiment` (versione 1) è indipendente dalla lingua e contiene un `engine` che identifica la build dell'applicazione. Il laboratorio è identificato dal suo *id* canonico, non dal titolo tradotto. I comandi di importazione sono puramente locali e non caricano file su server.

**Livelli di riproducibilità:**

- **Configurazione:** stessi parametri/seme di partenza; non attesta identità delle osservazioni a un passo arbitrario.
- **Checkpoint deterministico:** stessi parametri, seed e numero di passi della macchina stocastica, con confronto numerico dell'output; questa proprietà richiede che ogni laboratorio esponga un adapter affidabile e che la build corrisponda.
- **Dati spaziali:** coordinate e valori osservati direttamente esportati, senza ricostruirli dai movimenti del mouse; eventuali superfici derivate sono ricalcolate con lo stesso algoritmo e le medesime ipotesi.

I file provenienti da build diverse richiedono compatibilità dichiarata; un `engine` diverso non deve essere importato silenziosamente come se garantisse identità esatta. I link sono limitati ai soli payload compatti e non adatti a contenere l'intero dataset o la cronologia delle interazioni. Non si serializzano i risultati personali delle Challenges per evitare di confonderli con attestazioni di valutazione.

**Criterio di completamento D:** matrice 31×(default, modificato, importato) e per i 25 runner anche (0, intermedio, completo), con verifiche positive su almeno due browser/viewport e gli input formalmente invalidi rifiutati prima della mutazione dello stato; gli errori di layout dinamici possono emergere durante il ripristino. Evitare etichette come "riproducibilità esatta" quando si è verificata soltanto la configurazione.

## Edit dei punti nelle regressioni classiche 10 e 14

I laboratori 10 e 14 possiedono punti manualmente trascinabili, aggiungibili o eliminabili. Un campo separato `manualData` (`manual-xy-v1`) registra le coppie `(x,y)` quando la vista contiene osservazioni modificate a mano. Al ripristino il motore rigenera prima il checkpoint numerico, **poi** riapplica le coordinate effettive dei punti, senza sostituirle con osservazioni simulate dal seed. Gli adattatori validano i limiti del dominio e ricostruiscono tabelle e grafici. L'output R standard descrive il modello simulato e non costituisce, da solo, l'esportazione dell'insieme di punti manualmente modificato: per trasferire i dati grezzi in R usare il comando CSV del laboratorio.
