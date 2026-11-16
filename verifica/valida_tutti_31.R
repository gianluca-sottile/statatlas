#!/usr/bin/env Rscript
# StatAtlas 2.1 - un SOLO comando R per validare tutte le 31 esportazioni.
# Dalla radice: Rscript verifica/valida_tutti_31.R
# --no-refresh: verifica le 31 esportazioni gia' incluse nel repository.
# --only=01,19: diagnostica su un sottoinsieme (NON accettazione completa).
# --timeout=900: limite, in secondi, per ogni singolo laboratorio.
#
# Gate R0 (tutti): esportazione reale e corrispondenza alla pagina corrente;
# Gate R1 (tutti): parsing GNU R; Gate R2 (tutti): esecuzione indipendente
# in processi R separati, con errori, timeout e pacchetti mancanti FAIL.
# NON dichiarare questo gate una parita' numerica R/JS: per quella servono
# benchmark numerici indipendenti (gia' disponibili per i sei lab spaziali).
#
# Dipendenze per eseguire tutti i laboratori: tidyverse, quantreg,
# segmented e cluster (splines fa parte di R). Nessuna installazione
# automatica e nessun risultato SALTATO considerato come PASS.

options(warn = 1)
args <- commandArgs(trailingOnly = TRUE)
all_args <- commandArgs(trailingOnly = FALSE)
script_arg <- grep('^--file=', all_args, value = TRUE)
if (length(script_arg) != 1L) stop('Avviare con Rscript verifica/valida_tutti_31.R')
me <- sub('^--file=', '', script_arg[1])
root <- normalizePath(file.path(dirname(me), '..'), mustWork = TRUE)
setwd(root)

only_arg <- grep('^--only=', args, value = TRUE)
only <- if (length(only_arg)) strsplit(sub('^--only=', '', only_arg[1]), ',', fixed = TRUE)[[1]] else NULL
timeout_arg <- grep('^--timeout=', args, value = TRUE)
timeout <- if (length(timeout_arg)) as.integer(sub('^--timeout=', '', timeout_arg[1])) else 900L
if (!is.finite(timeout) || timeout < 10L) stop('Il timeout deve essere >= 10 secondi')
valid <- c('--no-refresh', '--refresh')
unknown <- args[!grepl('^--only=|^--timeout=', args) & !args %in% valid]
if (length(unknown)) stop('Opzioni sconosciute: ', paste(unknown, collapse = ', '))
refresh <- !('--no-refresh' %in% args)
if ('--refresh' %in% args && '--no-refresh' %in% args) stop('Usare una sola opzione refresh')

lab_ids <- c('distribuzioni', 'bivariata', 'simulazione', 'lgn-tcl', 'adattamento',
  'stimatori', 'fisher', 'intervalli', 'test', 'regressione', 'regressione-lp',
  'glm', 'arma', 'quantilica', 'penalizzata', 'spline', 'segmentata',
  'validazione', 'knn', 'alberi', 'boost', 'reti-neurali', 'pca', 'clustering',
  'dbscan', 'moran', 'lisa', 'processi-puntuali', 'variogrammi', 'kriging',
  'regressione-spaziale')

run_dir <- file.path(root, 'verifica', 'runs')
dir.create(run_dir, recursive = TRUE, showWarnings = FALSE)
manifest_path <- file.path(root, 'verifica', 'export_r_31', 'manifest.csv')
cat('STATATLAS 2.1 - VALIDAZIONE COMPLETA R 31/31\n')
cat('Root:', root, '\nR:', R.version.string, '\n')

run_system <- function(command, arguments, log, limit) {
  out <- tryCatch(
    suppressWarnings(system2(command, arguments, stdout = log,
                              stderr = log, wait = TRUE, timeout = limit)),
    error = function(e) { cat(conditionMessage(e), '\n', file = log); 127L }
  )
  if (is.null(out) || !length(out)) 0L else as.integer(out[1])
}

if (refresh) {
  py <- file.path(root, '.venv', 'bin', 'python3')
  if (!file.exists(py)) py <- Sys.which('python3')
  if (!nzchar(py)) stop('Python 3 non trovato; attiva .venv oppure usa --no-refresh')
  cat('\n[STEP 1/4] Ricompilazione e acquisizione LIVE dei 31 script R...\n')
  build_log <- file.path(run_dir, 'refresh.log')
  status <- run_system(py, shQuote(file.path(root, 'build.py')), build_log, 120L)
  if (status != 0L) stop('Build fallita, vedi ', build_log)
  status <- run_system(py, shQuote(file.path(root, 'tests', 'export_r_live_31.py')),
                       build_log, 240L)
  if (status != 0L) stop('Esportazione LIVE fallita, vedi ', build_log,
                         '. Verifica Playwright + Chromium nel Python selezionato.')
} else {
  cat('\n[STEP 1/4] Uso snapshot R inclusi (NON riconferma freshness browser).\n')
}
if (!file.exists(manifest_path)) stop('Manifest mancante: ', manifest_path)
manifest <- read.csv(manifest_path, stringsAsFactors = FALSE,
                     colClasses = c(number='integer', lab='character', file='character',
                                    md5='character', sha256='character', lines='integer',
                                    max_line='integer', build_sha256='character'),
                     check.names = FALSE)
if (nrow(manifest) != 31L || !identical(manifest$lab, lab_ids)) {
  stop('Il manifest NON rappresenta esattamente i 31 laboratori nell\'ordine previsto')
}
if (!is.null(only)) {
  only_idx <- suppressWarnings(as.integer(only))
  if (anyNA(only_idx) || any(only_idx < 1 | only_idx > 31)) {
    stop('--only accetta numeri 01..31 separati da virgole')
  }
  selected <- which(seq_len(31) %in% only_idx)
  cat('ATTENZIONE: diagnostica parziale,',length(selected), 'laboratori.\n')
} else selected <- seq_len(31)

cat("\n[STEP 2/4] Integrita, lunghezza righe e parsing R...\n")
paths <- file.path(root, 'verifica', 'export_r_31', manifest$file)
if (any(!file.exists(paths))) stop('Mancano file R esportati: ', paste(paths[!file.exists(paths)], collapse=', '))
md5 <- unname(tools::md5sum(paths))
if (!identical(md5, manifest$md5)) stop('MD5 non corrispondente: possibili script obsoleti o modificati')
if (any(manifest$max_line >= 1000L)) stop('Esportazione R con righe troppo lunghe')
for (i in selected) {
  tryCatch(parse(file = paths[i], keep.source = FALSE),
           error = function(e) stop(sprintf('Errore parsing LAB %02d (%s): %s',
                                            i, lab_ids[i], conditionMessage(e))))
  cat(sprintf('  PARSE OK %02d %s\n', i, lab_ids[i]))
}

# Includiamo solo le librerie effettivamente richieste dalle esportazioni.
# Ognuna deve risultare installata: un pacchetto mancante e' un fallimento del gate.
required <- c('tidyverse', 'quantreg', 'segmented', 'cluster')
if (all(selected > 25L)) required <- character()
missing <- required[!vapply(required, requireNamespace, logical(1), quietly=TRUE)]
if (length(missing)) {
  cat('\nPACCHETTI R MANCANTI:', paste(missing, collapse=', '), '\n')
  cat('Installa da R con:\n  install.packages(c(',
      paste(shQuote(missing, type='cmd'), collapse=', '),
      '), repos="https://cloud.r-project.org")\n', sep='')
  stop('Preflight fallito: installa i pacchetti prima di eseguire tutti gli script')
}

# Un controllo numerico/strutturale addizionale sul risultato di ogni script.
# Questo gate non pretende di essere una prova completa dell'algoritmo.
invarianti <- c(
  distribuzioni = 'length(x)==N && all(is.finite(x))',
  bivariata = 'nrow(coppie)==N && all(is.finite(coppie$x))',
  simulazione = 'nrow(sim)==N && all(is.finite(sim$x))',
  `lgn-tcl` = 'ncol(x)==N && all(is.finite(x))',
  adattamento = 'is.finite(X2) && gdl>0',
  stimatori = 'nrow(stime)>0 && nrow(stime_lunghe)>0',
  fisher = 'all(is.finite(sim$U))',
  intervalli = 'nrow(sim)>0 && all(sim$copre %in% c(TRUE,FALSE))',
  test = 'nrow(sim)>0 && all(is.finite(sim$z0))',
  regressione = 'all(is.finite(coef(fit))) && nrow(sim)>0',
  `regressione-lp` = 'nrow(stime)>0 && all(is.finite(stime$pendenza))',
  glm = 'nrow(sim)>0 && any(sim$finita)',
  arma = 'length(x)==T && all(is.finite(x))',
  quantilica = 'nrow(sim)>0 && all(is.finite(sim$quantilica))',
  penalizzata = 'length(b_star)==2 && all(is.finite(b_star))',
  spline = 'nrow(S)==n && all(is.finite(S))',
  segmentata = 'is.finite(psi_hat) && all(is.finite(stime))',
  validazione = 'nrow(sintesi)>0 && all(is.finite(sintesi$corretto))',
  knn = 'nrow(curve)>0 && all(is.finite(curve$test))',
  alberi = 'nrow(traiettoria)>0 && all(is.finite(traiettoria$test))',
  boost = 'nrow(hist)>0 && all(is.finite(hist$training))',
  `reti-neurali` = 'all(is.finite(fit$storia))',
  pca = 'all(is.finite(lambda_hat)) && all(lambda_hat>=0)',
  clustering = 'is.finite(km$tot.withinss) && km$tot.withinss>=0',
  dbscan = 'length(db$cluster)==nrow(X) && length(db$core)==nrow(X)',
  moran = 'is.finite(moran(d$z,W))',
  lisa = 'length(quadrante)==nrow(d) && is.finite(moran(d$z,W))',
  `processi-puntuali` = 'all(is.finite(intensita)) && all(intensita>=0)',
  variogrammi = 'length(bin)==length(distPairs)',
  kriging = 'abs(sum(w)-1)<1e-6 && all(is.finite(w))',
  `regressione-spaziale` = 'is.finite(summary(m1)$r.squared) && summary(m1)$r.squared + 1e-8 >= summary(m0)$r.squared'
)
stopifnot(identical(names(invarianti), lab_ids))

cat('\n[STEP 3/4] Esecuzione INDIPENDENTE di ogni script...\n')
# Ogni laboratorio vive in un Rscript distinto: niente contaminazione
# da variabili globali, pacchetti caricati o stato RNG di un altro laboratorio.
wrapper_path <- file.path(run_dir, '_run_lab_isolato.R')
writeLines(c(
  'argv <- commandArgs(trailingOnly=TRUE)',
  'src <- argv[1]; pdf_file <- argv[2]; lab <- argv[3]',
  'RNGkind("Mersenne-Twister", "Inversion", "Rejection")',
  'grDevices::pdf(pdf_file, onefile=TRUE)',
  'tryCatch({',
  '  expr <- parse(file=src, keep.source=FALSE)',
  '  env <- new.env(parent=globalenv())',
  '  eval(expr, envir=env)',
  paste0('  invarianti <- ', paste(deparse(invarianti, width.cutoff=500L),collapse='\n')),
  '  if (!isTRUE(eval(parse(text=unname(invarianti[[lab]])), envir=env))) stop(paste("invariante non superato:",lab))',
  '  if (grDevices::dev.cur() > 1) grDevices::dev.off()',
  '  cat("STATATLAS_RUNTIME_OK\\n")',
  '}, error=function(e) {',
  '  cat("STATATLAS_RUNTIME_ERROR: ", conditionMessage(e), "\\n", sep="", file=stderr())',
  '  quit(save="no", status=1, runLast=FALSE)',
  '})'), wrapper_path, useBytes=TRUE)

rscript <- file.path(R.home('bin'), 'Rscript')
if (!file.exists(rscript)) rscript <- Sys.which('Rscript')
if (!nzchar(rscript) || !file.exists(rscript)) stop('Rscript non trovato')
rows <- vector('list', length(selected))
for (j in seq_along(selected)) {
  i <- selected[j]; id <- lab_ids[i]
  log_path <- file.path(run_dir, sprintf('%02d_%s.log', i, id))
  pdf_path <- file.path(run_dir, sprintf('%02d_%s.pdf', i, id))
  started <- Sys.time()
  exit_code <- run_system(rscript, c('--vanilla', shQuote(wrapper_path),
                                     shQuote(paths[i]), shQuote(pdf_path), shQuote(id)),
                          log_path, timeout)
  duration <- round(as.numeric(difftime(Sys.time(), started, units='secs')),2)
  out <- if (file.exists(log_path)) readLines(log_path, warn=FALSE) else character()
  passed <- exit_code == 0L && any(grepl('STATATLAS_RUNTIME_OK', out, fixed=TRUE))
  rows[[j]] <- data.frame(lab_num=i, laboratorio=id, parse='PASS',
                          runtime=if (passed) 'PASS' else 'FAIL',
                          exit_code=exit_code, seconds=duration,
                          build_sha256=manifest$build_sha256[i],
                          log=sub(paste0('^',root,'/'), '',log_path),
                          stringsAsFactors=FALSE)
  cat(sprintf('  %02d/31 %-23s %-4s %7.2fs %s\n',
              i,id,if(passed) 'PASS' else 'FAIL',duration,if(passed) '' else log_path))
  flush.console()
}
results <- do.call(rbind, rows)
csv_path <- file.path(root, 'verifica','REPORT_VALIDAZIONE_R_31.csv')
write.csv(results, csv_path, row.names=FALSE, fileEncoding='UTF-8')
cat('\n[STEP 4/4] Riepilogo\n')
print(table(results$runtime))
cat('Report:', csv_path, '\nDettagli:', run_dir, '\n')
cat('NOTE: ogni LAB supera un invariante R, non una prova di equivalenza JS/R.\n')
cat('NOTE: parita numerica sui 6 laboratori spaziali validata in tests/test_spatial_export_equivalence.py.\n')
cat('NOTE: i primi 25 richiedono benchmark numerici live aggiuntivi per parita R2.\n')
cat('NOTE: --no-refresh certifica solo gli snapshot inclusi, non i nuovi stati del browser.\n')
if (any(results$runtime != 'PASS') || length(selected) < 31L) {
  if (any(results$runtime != 'PASS')) {
    cat('FAIL: almeno un laboratorio non si esegue.\n')
    quit(save='no', status=1L, runLast=FALSE)
  }
  cat('PARZIALE: nessuna certificazione 31/31.\n')
  quit(save='no', status=2L, runLast=FALSE)
}
cat('SUCCESS: 31/31 script R reali, integrita, parsing ed esecuzione superati.\n')
