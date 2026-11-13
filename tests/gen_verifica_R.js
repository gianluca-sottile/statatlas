// Genera verifica/verifica_statatlas.R: tutti gli script R dei 24 laboratori (parametri predefiniti) e i valori del browser
// con cui confrontarli. Uso: node tests/gen_verifica_R.js <estrazione.json> <rng.json> > verifica/verifica_statatlas.R
// (l'estrazione si ottiene con jsdom: codice R e tabella di ogni laboratorio dopo «Completa»).
const fs = require('fs');
const ex = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), rng = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const num = s => { const m = String(s).replace(/−/g, '-').replace(/(\d),(\d)/g, '$1.$2').match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/gi); return m ? m.map(Number) : []; };
const row = (id, start) => { const r = ex[id].rows.find(q => q[0].startsWith(start)); if (!r) throw new Error(id + ': riga mancante ' + start); return r; };
const v = (id, start, col, k) => num(row(id, start)[col])[k];
const LABS = Object.keys(ex), PKG = { quantilica: 'quantreg', penalizzata: 'glmnet', segmentata: 'segmented', dbscan: 'cluster' };
const out = [];
const L = s => out.push(s);
L(`# ═══════════════════════════════════════════════════════════════════════════════
# StatAtlas · verifica automatica degli script R (generato il ${new Date().toISOString().slice(0, 10)})
#
# Esegue gli script R dei 24 laboratori con i parametri predefiniti e confronta i risultati
# con i valori calcolati dal browser (StatAtlas, stessi seed). Alla fine stampa un riepilogo.
#
# Uso:   Rscript verifica_statatlas.R        oppure   source("verifica_statatlas.R")
# Serve: R ≥ 4.1 e i pacchetti tidyverse, quantreg, glmnet, segmented, cluster.
# Tempo: alcuni minuti (i lab 18 e 20 sono i più lenti: CART e validazione in R puro).
# Per eseguire solo alcuni laboratori:  SOLO <- c("segmentata", "knn"); source("verifica_statatlas.R")
# ═══════════════════════════════════════════════════════════════════════════════
stopifnot(getRversion() >= "4.1.0")
RNGkind("Mersenne-Twister", "Inversion", "Rejection")
if (!exists("SOLO")) SOLO <- NULL
pacchetti <- c("tidyverse", "quantreg", "glmnet", "segmented", "cluster")
mancanti <- pacchetti[!vapply(pacchetti, requireNamespace, logical(1), quietly = TRUE)]
if (length(mancanti)) message("Pacchetti mancanti (i laboratori che li usano saranno saltati): ", paste(mancanti, collapse = ", "),
                              "\\n  install.packages(c(", paste0('"', mancanti, '"', collapse = ", "), "))")
suppressPackageStartupMessages(library(tidyverse))

.verifica <- data.frame(lab = character(), controllo = character(), esito = character(), dettaglio = character())
registra <- function(lab, controllo, ok, dettaglio = "") {
  .verifica[nrow(.verifica) + 1, ] <<- list(lab, controllo, if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", dettaglio)
  cat(sprintf("  %-8s %-62s %s\\n", if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", controllo, dettaglio))
}
confronta <- function(lab, controllo, ottenuto, atteso, tol) {
  ok <- length(ottenuto) == length(atteso) && all(is.finite(ottenuto)) && all(abs(ottenuto - atteso) <= tol)
  registra(lab, controllo, ok, sprintf("R = %s · browser = %s · tolleranza %g",
    paste(signif(ottenuto, 7), collapse = " "), paste(signif(atteso, 7), collapse = " "), tol))
}
esegui <- function(id) {
  cat("\\n── ", id, " ──────────────────────────────────────────────\\n", sep = "")
  if (!is.null(SOLO) && !id %in% SOLO) { registra(id, "non richiesto (SOLO)", NA); return(NULL) }
  serve <- c(quantilica = "quantreg", penalizzata = "glmnet", segmentata = "segmented", dbscan = "cluster")[id]
  if (!is.na(serve) && serve %in% mancanti) { registra(id, paste("manca il pacchetto", serve), NA); return(NULL) }
  env <- new.env(parent = globalenv()); grDevices::pdf(NULL); t0 <- Sys.time()
  err <- tryCatch({ eval(parse(text = script[[id]]), envir = env); NULL }, error = function(e) conditionMessage(e))
  grDevices::dev.off()
  registra(id, "lo script si esegue senza errori", is.null(err), if (is.null(err)) sprintf("%.1f s", as.numeric(Sys.time() - t0, units = "secs")) else err)
  if (is.null(err)) env else NULL
}

cat("── generatore di numeri casuali ──────────────────────────────\\n")
set.seed(2026); confronta("RNG", "set.seed(2026); runif(5)", runif(5), c(${rng.unif.map(x => x.toPrecision(17)).join(', ')}), 1e-15)
set.seed(2026); confronta("RNG", "set.seed(2026); rnorm(5)", rnorm(5), c(${rng.norm.map(x => x.toPrecision(17)).join(', ')}), 1e-12)
set.seed(2026); confronta("RNG", "set.seed(2026); sample(10)", sample(10), c(${rng.sample.join(', ')}), 0)
set.seed(2026); confronta("RNG", "set.seed(2026); sample(100, 5, replace = TRUE)", sample(100, 5, replace = TRUE), c(${rng.boot.join(', ')}), 0)
`);
L('script <- list(');
LABS.forEach((id, i) => {
  if (ex[id].code.includes(']---"')) throw new Error('delimitatore presente in ' + id);
  L(`  \`${id}\` = r"---[\n${ex[id].code}\n]---"${i < LABS.length - 1 ? ',' : ''}`);
});
L(')\n');
const CHECK = {
  segmentata: () => `  confronta("17", "media, distorsione e RMSE di psi_hat (B campioni)", c(mean(stime), mean(stime) - psi, sqrt(mean((stime - psi)^2))), c(${v('segmentata', 'Media di ψ̂', 2, 0)}, ${v('segmentata', 'Media di ψ̂', 2, 1)}, ${v('segmentata', 'Media di ψ̂', 2, 2)}), c(0.006, 0.0006, 0.0006))
  confronta("17", "psi_hat del campione mostrato", psi_hat, ${v('segmentata', 'Breakpoint', 2, 0)}, 0.006)
  confronta("17", "statistica T e p-value bootstrap", c(T_oss, (1 + sum(T_boot >= T_oss)) / 200), c(${v('segmentata', 'Test di esistenza', 2, 1)}, ${v('segmentata', 'Test di esistenza', 2, 0)}), c(0.006, 0.0006))`,
  validazione: () => `  confronta("18", "distorsione media: protocollo corretto, scorretto, training", c(mean(sintesi$corretto), mean(sintesi$scorretto), mean(sintesi$training)), c(${v('validazione', 'Protocollo corretto', 2, 0)}, ${v('validazione', 'Protocollo scorretto', 2, 0)}, ${v('validazione', 'Errore di training', 2, 0)}), 6e-5)`,
  knn: () => `  k_mostrato <- ${num(row('knn', 'Errore medio sul test')[0])[0]}
  confronta("19", "errore medio sul test con il k mostrato", mean(curve$test[curve$k == k_mostrato]), ${v('knn', 'Errore medio sul test', 2, 0)}, 6e-5)
  scelto <- curve |> group_by(replica) |> slice_min(loo, n = 1, with_ties = FALSE) |> ungroup()
  confronta("19", "errore sul test al k scelto con leave-one-out", mean(scelto$test), ${v('knn', 'k scelto', 2, 0)}, 6e-5)
  confronta("19", "k = 1: errore di training e di test", c(mean(curve$training[curve$k == 1]), mean(curve$test[curve$k == 1])), c(0, ${v('knn', 'Errore sul test con k = 1 per', 2, 0)}), 6e-5)`,
  alberi: () => `  ultimo <- traiettoria |> filter(alberi == B)
  confronta("20", "errore sul test di un solo albero", errore_albero, ${v('alberi', 'Un solo albero', 2, 0)}, 6e-4)
  confronta("20", "bagging: errore sul test e OOB", c(ultimo$test[ultimo$metodo == "bagging"], ultimo$oob[ultimo$metodo == "bagging"]), c(${v('alberi', 'Bagging', 2, 0)}, ${v('alberi', 'Bagging', 2, 3)}), 6e-4)
  confronta("20", "foresta: errore sul test e OOB", c(ultimo$test[ultimo$metodo == "foresta"], ultimo$oob[ultimo$metodo == "foresta"]), c(${v('alberi', 'Foresta casuale', 2, 0)}, ${v('alberi', 'Foresta casuale', 2, 3)}), 6e-4)`,
  pca: () => `  confronta("21", "lambda1: media e sd nelle repliche", c(mean(repliche$lambda1), sd(repliche$lambda1)), c(${v('pca', 'λ̂₁', 2, 0)}, ${v('pca', 'λ̂₁', 2, 1)}), 6e-4)
  confronta("21", "sin^2 medio dell'angolo di PC1", mean(sin(repliche$angolo * pi / 180)^2), ${v('pca', 'sin²', 2, 0)}, 6e-5)`,
  clustering: () => `  confronta("22", "WCSS della soluzione migliore (kmeans Lloyd)", km$tot.withinss, ${v('clustering', 'WCSS finale', 2, 0)}, 6e-4)
  confronta("22", "ARI: k-means, gerarchico, tra metodi", c(ari(km$cluster, gruppo), ari(gruppi_h, gruppo), ari(km$cluster, gruppi_h)), c(${v('clustering', 'Accordo con le popolazioni', 2, 0)}, ${v('clustering', 'Accordo con le popolazioni', 2, 1)}, ${v('clustering', 'Accordo tra', 2, 0)}), 6e-4)`,
  dbscan: () => `  tipo <- ifelse(db$core, "core", ifelse(db$cluster > 0, "bordo", "rumore"))
  confronta("23", "cluster, core, bordo, rumore", c(max(db$cluster), sum(tipo == "core"), sum(tipo == "bordo"), sum(tipo == "rumore")), c(${num(row('dbscan', 'Cluster trovati')[2]).join(', ')}), 0)
  confronta("23", "ARI: k-means, Ward, DBSCAN", c(ari(km$cluster, gruppo), ari(ward, gruppo), ari(db$cluster, gruppo)), c(${num(row('dbscan', 'Accordo con le popolazioni')[2]).join(', ')}), 6e-4)`,
  'reti-neurali': () => `  confronta("24", "perdita finale: training e validazione", unname(fit$storia[E + 1, ]), c(${num(row('reti-neurali', 'Perdita')[2]).join(', ')}), 6e-5)
  confronta("24", "accuratezza di validazione", mean((plogis(avanti(fit$par, Xva)$z) > 0.5) == yva), ${v('reti-neurali', 'Accuratezza', 2, 1)}, 6e-4)
  registra("24", "controllo del gradiente (differenze finite)", max(abs(num - unlist(gradiente(par0, Xtr, ytr)))) / max(abs(num)) < 1e-6)
  confronta("24", "20 inizializzazioni: perdita di training min e max", range(esiti$training), c(${num(row('reti-neurali', '20 inizializzazioni')[2]).slice(2, 4).join(', ')}), 6e-4)`
};
LABS.forEach(id => {
  L(`e <- esegui("${id}")`);
  if (CHECK[id]) L(`if (!is.null(e)) local({\n${CHECK[id]()}\n}, envir = e)`);
});
L(`
cat("\\n═══ Riepilogo ═══════════════════════════════════════════════\\n")
print(table(.verifica$esito))
if (any(.verifica$esito == "DIVERSO")) { cat("\\nControlli non superati:\\n"); print(.verifica[.verifica$esito == "DIVERSO", c("lab", "controllo", "dettaglio")], row.names = FALSE) } else cat("\\nTutti i controlli eseguiti sono superati.\\n")
write.csv(.verifica, "verifica_statatlas_esiti.csv", row.names = FALSE)
cat("Esiti salvati in verifica_statatlas_esiti.csv\\n")`);
process.stdout.write(out.join('\n') + '\n');
