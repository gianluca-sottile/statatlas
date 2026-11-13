// Genera verifica/verifica_statatlas_01_16.R: confronto numerico tra gli script R dei lab 01–16 e i valori del browser.
// Uso: node tests/gen_verifica_R_01_16.js <estrazione.json> > verifica/verifica_statatlas_01_16.R
// (estrazione con tests/estrai_per_verifica_R.js: codice R, tabella completa e riquadri numerici dopo «Completa»).
const fs = require('fs');
const ex = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const num = s => { const m = String(s).replace(/−/g, '-').replace(/(\d),(\d)/g, '$1.$2').match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/gi); return m ? m.map(Number) : []; };
const row = (id, start) => { const r = ex[id].rows.find(q => q[0].startsWith(start)); if (!r) throw new Error(id + ': riga mancante ' + start); return r; };
const v = (id, start, col, k) => { const x = num(row(id, start)[col])[k || 0]; if (x === undefined) throw new Error(id + ': valore mancante ' + start); return x; };
const kp = (id, i, k) => num(ex[id].kpi[i])[k || 0];
const IDS = ['distribuzioni', 'bivariata', 'simulazione', 'lgn-tcl', 'adattamento', 'stimatori', 'fisher', 'intervalli', 'test', 'regressione', 'regressione-lp', 'glm', 'arma', 'quantilica', 'penalizzata', 'spline'];
const T3 = 6e-4, T4 = 6e-5, T5 = 6e-6; // mezza unità dell'ultima cifra mostrata dal browser (con margine)
const CHECK = {
  distribuzioni: () => `confronta("01", "media, varianza, mediana, P(a < X ≤ b) del campione", c(mean(x), var(x), median(x), mean(x > a & x <= b)), c(${['Valore atteso', 'Varianza', 'Mediana', 'P(a'].map(s => v('distribuzioni', s, 2)).join(', ')}), ${T4})`,
  bivariata: () => `confronta("02", "correlazioni ρ(X, Y) e ρ(X², Y)", c(cor(coppie$x, coppie$y), cor(coppie$x^2, coppie$y)), c(${v('bivariata', 'Correlazione ρ(X, Y)', 2)}, ${v('bivariata', 'Correlazione ρ(X²', 2)}), ${T3})
  confronta("02", "media e dev. std di Y nella striscia |x − x₀| ≤ h", c(mean(striscia$y), sd(striscia$y)), c(${v('bivariata', 'E(Y', 2)}, ${v('bivariata', 'Dev. std', 2)}), ${T3})`,
  simulazione: () => `confronta("03", "media e varianza del campione per inversione", c(mean(sim$x), var(sim$x)), c(${v('simulazione', 'Media', 2)}, ${v('simulazione', 'Varianza', 2)}), ${T4})
  confronta("03", "quota di valori sotto la mediana teorica", mean(sim$x <= qnorm(0.5)), ${v('simulazione', 'P(X', 2)}, ${T4})`,
  'lgn-tcl': () => `confronta("04", "medie finali delle 4 traiettorie", traiettorie |> filter(n == N) |> arrange(traiettoria) |> pull(media), c(${[1, 2, 3, 4].map(k => v('lgn-tcl', String(k), 2)).join(', ')}), ${T4})`,
  adattamento: () => `confronta("05", "stime ML (media, sd)", c(par$mean, par$sd), c(${kp('adattamento', 1, 0)}, ${kp('adattamento', 1, 1)}), ${T3})
  confronta("05", "X², gradi di libertà, p-value asintotico", c(X2, gdl, pchisq(X2, gdl, lower.tail = FALSE)), c(${v('adattamento', 'Statistica X²', 1)}, ${v('adattamento', 'Gradi', 1)}, ${v('adattamento', 'p-value asintotico', 1)}), c(${T3}, 0, ${T4}))`,
  stimatori: () => `s6 <- stime_lunghe |> group_by(stimatore) |> summarise(centro = median(stima), dev_std = sd(stima), iqr = IQR(stima), mse = mean((stima - theta)^2))
  confronta("06", "media: centro, dev. std, IQR, MSE", unlist(s6[s6$stimatore == "media", -1]), c(${[1, 2, 3, 4].map(c => v('stimatori', 'Media', c)).join(', ')}), ${T3})
  confronta("06", "mediana: centro, dev. std, IQR, MSE", unlist(s6[s6$stimatore == "mediana", -1]), c(${[1, 2, 3, 4].map(c => v('stimatori', 'Mediana', c)).join(', ')}), ${T3})`,
  fisher: () => `confronta("07", "score: media e varianza; informazione osservata media", c(mean(sim$U), var(sim$U), mean(sim$Jt)), c(${v('fisher', 'Media dello score', 2)}, ${v('fisher', 'Varianza dello score', 2)}, ${v('fisher', 'Informazione osservata', 2)}), ${T4})
  confronta("07", "media e varianza di θ̂", c(mean(sim$stima), var(sim$stima)), c(${v('fisher', 'Media di θ̂', 2)}, ${v('fisher', 'Varianza di θ̂', 2)}), c(${T4}, ${T5}))
  confronta("07", "copertura di Wald", mean(sim$wald), ${v('fisher', 'Copertura Wald', 2)}, ${T3})`,
  intervalli: () => `confronta("08", "copertura e ampiezza media", c(mean(sim$copre), mean(sim$alto - sim$basso)), c(${v('intervalli', 'Copertura', 3) / 100}, ${v('intervalli', 'Ampiezza', 3)}), c(${T4}, ${T4}))`,
  test: () => `confronta("09", "errore di primo tipo e potenza simulati", c(mean(rifiuta(sim$z0)), mean(rifiuta(sim$z1))), c(${v('test', 'Errore di primo tipo', 2)}, ${v('test', 'Potenza', 2)}), ${T3})`,
  regressione: () => `confronta("10", "media e dev. std della pendenza", c(mean(sim$pendenza), sd(sim$pendenza)), c(${v('regressione', 'Media di β̂₁', 2)}, ${v('regressione', 'Dev. std', 2)}), ${T4})
  confronta("10", "coperture: banda per la media e intervallo di previsione", c(mean(sim$copre_media), mean(sim$copre_y0)), c(${v('regressione', 'Copertura dell’intervallo per', 2)}, ${v('regressione', 'Copertura dell’intervallo di previsione', 2)}), ${T3})`,
  'regressione-lp': () => `s11 <- stime |> group_by(metodo) |> summarise(media = mean(pendenza), dev_std = sd(pendenza), iqr = IQR(pendenza), mse = mean((pendenza - b1)^2))
  ${[['L2', 'L2 ·'], ['L1', 'L1 ·'], ['Lp', 'Lp']].map(q => `confronta("11", "${q[0]}: media, dev. std, IQR", unlist(s11[s11$metodo == "${q[0]}", 2:4]), c(${[1, 2, 3].map(c => v('regressione-lp', q[1], c)).join(', ')}), ${T4})
  confronta("11", "${q[0]}: errore quadratico medio", s11$mse[s11$metodo == "${q[0]}"], ${v('regressione-lp', q[1], 4)}, ${T5})`).join('\n  ')}`,
  glm: () => `f12 <- sim |> filter(finita)
  confronta("12", "media e dev. std di β̂₁ (stime finite)", c(mean(f12$b1_hat), sd(f12$b1_hat)), c(${v('glm', 'Media di β̂₁', 2)}, ${v('glm', 'Dev. std', 2)}), ${T4})
  confronta("12", "copertura di Wald e campioni con separazione", c(mean(abs(f12$b1_hat - b1) <= 1.96 * f12$se), sum(!sim$finita)), c(${v('glm', 'Copertura di Wald', 2)}, ${v('glm', 'Campioni con separazione', 2)}), c(${T3}, 0))`,
  arma: () => `confronta("13", "γ(0), ρ(1), ρ(2), ρ(5) empirici", c(mean((x - mean(x))^2), confronto$acf_emp[c(1, 2, 5)]), c(${['Varianza', 'ρ(1)', 'ρ(2)', 'ρ(5)'].map(s => v('arma', s, 2)).join(', ')}), ${T4})
  confronta("13", "φ₂₂ e φ₃₃ empirici", confronto$pacf_emp[2:3], c(${v('arma', 'Autocorrelazione parziale φ₂₂', 2)}, ${v('arma', 'Autocorrelazione parziale φ₃₃', 2)}), ${T4})`,
  quantilica: () => `confronta("14", "pendenza quantilica (τ = 0,5): media e dev. std", c(mean(sim$quantilica), sd(sim$quantilica)), c(${kp('quantilica', 1, 0)}, ${kp('quantilica', 1, 1)}), ${T3})
  confronta("14", "pendenza dei minimi quadrati: media e dev. std", c(mean(sim$minimi_quadrati), sd(sim$minimi_quadrati)), c(${kp('quantilica', 2, 0)}, ${kp('quantilica', 2, 1)}), ${T3})`,
  penalizzata: () => `confronta("15", "soluzione lasso (β₁, β₂) sul vincolo", b_star, c(${v('penalizzata', 'Lasso', 1)}, ${v('penalizzata', 'Lasso', 2)}), ${T4})`,
  spline: () => `confronta("16", "gradi di libertà, distorsione², varianza (esatti)", c(sum(diag(S)), mean((S %*% f(x) - f(x))^2), sigma^2 * sum(S^2) / n), c(${['Gradi', 'Distorsione²', 'Varianza media'].map(s => v('spline', s, 1)).join(', ')}), c(0.006, ${T4}, ${T4}))
  confronta("16", "errore quadratico medio sui campioni ripetuti", mean(ise), ${v('spline', 'Errore quadratico medio', 2)}, ${T4})`
};
const out = [];
out.push(`# ═══════════════════════════════════════════════════════════════════════════════
# StatAtlas · verifica numerica degli script R dei laboratori 01–16 (generato il ${new Date().toISOString().slice(0, 10)})
#
# Complementa verifica_statatlas.R: oltre a eseguire gli script, confronta medie, varianze, coperture,
# stime e autocorrelazioni con i valori che il browser mostra dopo «Completa» (stessi seed e parametri predefiniti).
# Uso:   Rscript verifica_statatlas_01_16.R     oppure   source("verifica_statatlas_01_16.R")
# Serve: R ≥ 4.1, tidyverse, quantreg, glmnet. Tempo: circa un minuto.
# ═══════════════════════════════════════════════════════════════════════════════
stopifnot(getRversion() >= "4.1.0")
RNGkind("Mersenne-Twister", "Inversion", "Rejection")
suppressPackageStartupMessages(library(tidyverse))
.verifica <- data.frame(lab = character(), controllo = character(), esito = character(), dettaglio = character())
registra <- function(lab, controllo, ok, dettaglio = "") {
  .verifica[nrow(.verifica) + 1, ] <<- list(lab, controllo, if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", dettaglio)
  cat(sprintf("  %-8s %-62s %s\\n", if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", controllo, dettaglio))
}
confronta <- function(lab, controllo, ottenuto, atteso, tol) {
  ottenuto <- unname(as.numeric(ottenuto))
  ok <- length(ottenuto) == length(atteso) && all(is.finite(ottenuto)) && all(abs(ottenuto - atteso) <= tol)
  registra(lab, controllo, ok, sprintf("R = %s · browser = %s", paste(signif(ottenuto, 6), collapse = " "), paste(atteso, collapse = " ")))
}
esegui <- function(id, pkg = NULL) {
  cat("\\n── ", id, " ──────────────────────────────────────────────\\n", sep = "")
  if (!is.null(pkg) && !requireNamespace(pkg, quietly = TRUE)) { registra(id, paste("manca il pacchetto", pkg), NA); return(NULL) }
  env <- new.env(parent = globalenv()); grDevices::pdf(NULL)
  err <- tryCatch({ eval(parse(text = script[[id]]), envir = env); NULL }, error = function(e) conditionMessage(e))
  grDevices::dev.off()
  registra(id, "lo script si esegue senza errori", is.null(err), if (is.null(err)) "" else err)
  if (is.null(err)) env else NULL
}
script <- list(`);
IDS.forEach((id, i) => out.push(`  \`${id}\` = r"---[\n${ex[id].code}\n]---"${i < IDS.length - 1 ? ',' : ''}`));
out.push(')\n');
const PKG = { quantilica: 'quantreg', penalizzata: 'glmnet' };
IDS.forEach(id => { out.push(`e <- esegui("${id}"${PKG[id] ? ', "' + PKG[id] + '"' : ''})`); out.push(`if (!is.null(e)) local({\n  ${CHECK[id]()}\n}, envir = e)`); });
out.push(`
cat("\\n═══ Riepilogo ═══════════════════════════════════════════════\\n")
print(table(.verifica$esito))
if (any(.verifica$esito == "DIVERSO")) { cat("\\nControlli non superati:\\n"); print(.verifica[.verifica$esito == "DIVERSO", c("lab", "controllo", "dettaglio")], row.names = FALSE) } else cat("\\nTutti i controlli eseguiti sono superati.\\n")
write.csv(.verifica, "verifica_statatlas_01_16_esiti.csv", row.names = FALSE)
cat("Esiti salvati in verifica_statatlas_01_16_esiti.csv\\n")`);
process.stdout.write(out.join('\n') + '\n');
