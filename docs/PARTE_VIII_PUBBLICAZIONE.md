# Pubblicare StatAtlas · Parte VIII a mappe continue

**Versione di sviluppo 2.1, 16 novembre 2026.** Un solo commit su `main`, nessun tag di rilascio ufficiale.

## Dal Mac (metodo consigliato per repository e sito coerenti)

1. Scarica `StatAtlas_2_1_Parte_VIII_Mappe_Continue.zip` nella cartella Download.
2. Apri Terminale e incolla (il percorso usa il nome esatto del file consegnato):

```sh
cd ~/Downloads
mkdir -p StatAtlas_Parte_VIII
unzip -oq StatAtlas_2_1_Parte_VIII_Mappe_Continue.zip -d StatAtlas_Parte_VIII
sh StatAtlas_Parte_VIII/statatlas-main/scripts/pubblica_github.sh
```

Lo script clona `gianluca-sottile/statatlas`, copia l'intero progetto preservando `.git`, ricostruisce il file offline, esegue le suite JavaScript (e i controlli scientifici Python quando disponibili), visualizza il riepilogo modifiche e pubblica un commit. Per **non effettuare il push** usare `sh .../pubblica_github.sh --no-push`.

## Da iPhone senza Bash (repository completo)

1. Scarica `StatAtlas_2_1_Parte_VIII_iPhone.zip` nella cartella File. È l'intero **contenuto radice** del repository, senza un livello `statatlas-main`.
2. Usa un client Git per iOS che supporti importazione/estrazione dentro un repository esistente (per esempio Working Copy, verificando i requisiti del suo piano).
3. Clona `https://github.com/gianluca-sottile/statatlas`, ramo `main`, ed estrai i file nello stesso livello di `index.html`, preservando `.git`.
4. Controlla che esistano `src/core/spatial-studio.js`, `src/styles/spatial-studio.css`, `tests/test_spatial_studio.js` e `.github/workflows/scientific-qa.yml` (non in una nuova sottocartella).
5. Crea commit con messaggio `StatAtlas 2.1: Parte VIII a mappe continue e QA interattiva`, quindi esegui push a `main`.

**Non caricare lo ZIP come singolo file nella pagina GitHub**: i file dentro non vengono distribuiti automaticamente. Caricare solo `index.html` aggiorna il sito ma non aggiorna sorgenti, test e riproducibilità, quindi non è la pubblicazione raccomandata.

## Accettazione su GitHub

Apri:
- Repository: https://github.com/gianluca-sottile/statatlas
- GitHub Actions: https://github.com/gianluca-sottile/statatlas/actions
- GitHub Pages: https://gianluca-sottile.github.io/statatlas/

La workflow **StatAtlas Scientific QA** deve avere i job **numerical-and-scientific** e **spatial-ui-browser** entrambi verdi. Il test browser usa Chromium, non sostituisce una verifica manuale Safari su iOS. Se GitHub Pages mostra una versione vecchia, effettua il refresh della cache o apri una finestra privata prima di diagnosticare un problema di deploy.

## Unica checklist di collaudo funzionale

- [ ] LAB 26 · Aggiungi «+ Gruppo simile»: crescono i punti e cambia I; passa ad «Alternanza» e osserva il nuovo I.
- [ ] LAB 27 · Verifica sulla mappa i quadranti HH/LL e distinguili dalla significatività locale nella sezione originale.
- [ ] LAB 28 · Aggiungi «+ Gruppo di eventi»: crescono i punti anche nella figura originale; cambiano KDE e L(r)−r.
- [ ] LAB 29 · Aggiungi/sposta un sensore: cambiano superficie e variogramma empirico.
- [ ] LAB 30 · Aggiungi un sensore in una zona scoperta: la varianza media non aumenta; cambia la mappa originale; il campo vero non viene rigenerato.
- [ ] LAB 31 · Passa da «Solo X» a «X + coordinate» e osserva β(X), R² e Moran residui; aggiungi un punto; verifica SAR/SEM nella sezione originale.
- [ ] Smartphone · Premi un punto, trascinalo, rimuovilo e ripristina; apri «Mettiti alla prova», una scheda teorica e lo script R.
- [ ] GitHub · Entrambi i job QA verdi e sito pubblico con le sei nuove mappe.

Solo dopo questi punti la **macrofase UX spaziale** può essere accettata; successivamente si riprende la Macrofase A (audit matematico completo, R end-to-end e revisione delle Challenges), già concordata.
