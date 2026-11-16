# Pubblicare StatAtlas 2.1 · Parte VIII unificata

**Snapshot 16 novembre 2026, sviluppo 2.1.** Un solo commit su `main`, senza tag di release. Perimetro: sei vecchie interfacce **rimosse**, sei mappe unificate al loro posto.

## Dal Mac: pubblicazione del repository completo

Scaricare `StatAtlas_2_1_Parte_VIII_Unificata.zip` in `~/Downloads` ed eseguire:

```sh
cd ~/Downloads
mkdir -p StatAtlas_Parte_VIII_Unificata
unzip -oq StatAtlas_2_1_Parte_VIII_Unificata.zip -d StatAtlas_Parte_VIII_Unificata
sh StatAtlas_Parte_VIII_Unificata/statatlas-main/scripts/pubblica_github.sh
```

Lo script clona il repository in una directory temporanea, preserva `.git`, copia il nuovo progetto (compresi i file rimossi), ricostruisce `index.html`, esegue i test locali disponibili e crea un singolo commit. **Non** caricare semplicemente il file ZIP nella pagina GitHub.

## Da iPhone: upload dell'intero repository senza terminale

Lo ZIP `StatAtlas_2_1_Parte_VIII_Unificata_iPhone.zip` contiene i file **alla radice**, senza sottocartella `statatlas-main/`. Salvalo nell'app File; apri un client Git iOS che consenta l'importazione di uno ZIP dentro un repository esistente, clona `gianluca-sottile/statatlas` su `main`, estrai il contenuto nella radice del clone preservando `.git`, crea commit e push.

**Attenzione alle eliminazioni:** una semplice estrazione dello ZIP sovrascrive i file omonimi ma **non cancella automaticamente i file eliminati dal progetto**. Per ottenere l'esatta struttura della nuova versione, usa un client capace di sincronizzare il repository con il pacchetto o verifica la lista delle differenze prima del commit. I sei `src/labs/26–31` sono sostituiti e devono risultare modificati; il nuovo `src/core/spatial-unified.js` deve essere presente. Se il client non offre sincronizzazione affidabile, è preferibile la procedura Mac.

## Checklist unica dopo la pubblicazione

- [ ] GitHub Actions: job `numerical-and-scientific` e `spatial-ui-browser` verdi. Confermare il commit corrente su `main` e il deploy Pages.
- [ ] LAB 26 Moran: **una sola mappa**; aggiungere gruppo di valori simili, vedere il conteggio e l'indice I cambiare; alternare i vicini kNN.
- [ ] LAB 27 LISA: una sola mappa; riconoscere HH/LL e HL/LH; vedere le classi variare quando si interviene sui punti. Nessuna falsa etichetta di significatività.
- [ ] LAB 28 Processi puntuali: aggiungere un gruppo di eventi, vedere KDE e L(r)−r aggiornarsi; nessuna vecchia mappa/envelope duplicata.
- [ ] LAB 29 Variogrammi: aggiungere/spostare un sensore e vedere la curva delle semivarianze cambiare; l'IDW è correttamente etichettato come illustrativo.
- [ ] LAB 30 Kriging: aggiungere sensore senza rigenerare campo, verificare la varianza media non crescente e passare a superficie prevista; una sola mappa.
- [ ] LAB 31 Regressione: aggiungere osservazioni e confrontare `Y~X` contro `Y~X+x+y`, R² e Moran residui; **nessuna pretesa di stimare SAR/SEM** nell'interfaccia.
- [ ] Smartphone: trascina/elimina un punto, visualizza `Mettiti alla prova` (tre sfide per laboratorio), `Approfondisci`, CSV e script R. Nessun vecchio pannello sotto la mappa.

**Nota:** la successiva Macrofase A comprenderà audit completo delle 31 teorie e verifiche in R dei **nuovi** script. Questo pacchetto non è la validazione R finale.
