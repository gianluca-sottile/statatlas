# StatAtlas · LAB 21 — verifica autonoma JS ↔ R (generata da tests/gen_boost_reference.js)
# Avvio: Rscript verifica/verifica_gradient_boosting.R
# Nessuna dipendenza aggiuntiva. I tre scenari hanno dati e seed deterministici.
# ───────────────────── Scenario sine ─────────────────────
local({
# StatAtlas · Lab 21 — Gradient boosting didattico (R0 dati, R2 regole CART)
# Regole identiche al browser per le foglie e gli split; non eguaglianza con gbm/xgboost.
RNGkind("Mersenne-Twister", "Inversion", "Rejection"); set.seed(2026)
n <- 120; nval <- 100; ntest <- 220
B <- 100; eta <- 0.1; maxDepth <- 2; minLeaf <- 8
family <- "gaussian"; sigma <- 0.4
f <- function(x) 1.4 * sin(1.6 * x) + 0.25 * x
xtr <- runif(n, -2, 2); xva <- runif(nval, -2, 2); xte <- runif(ntest, -2, 2)
ygen <- function(x) if (family == "binary") as.integer(runif(length(x)) < f(x)) else f(x) + sigma * rnorm(length(x))
ytr <- ygen(xtr); yva <- ygen(xva); yte <- ygen(xte)
xgrid <- seq(-2, 2, length.out = 140)
sigmoid <- function(z) ifelse(z >= 0, 1 / (1 + exp(-z)), exp(z) / (1 + exp(z)))
risk <- function(y, v) if (family == "binary") mean(pmax(v, 0) + log1p(exp(-abs(v))) - y * v) else mean((y - v)^2)
response <- function(v) if (family == "binary") sigmoid(v) else v
tree1D <- function(x, y, maxDepth, minLeaf) {
  ord <- order(x, seq_along(x))
  grow <- function(ids, depth) {
    n <- length(ids); z <- y[ids]; sm <- sum(z); sq <- sum(z*z); parent <- sq - sm*sm/n
    nd <- list(leaf = TRUE, value = sm/n, n = n, depth = depth)
    if (depth >= maxDepth || n < 2*minLeaf || parent < 1e-12) return(nd)
    ls <- 0; lq <- 0; best <- parent - 1e-10; pos <- 0L; split <- NA_real_
    for (i in seq_len(n-1L)) {
      r <- y[ids[i]]; nl <- i; nr <- n-i; ls <- ls+r; lq <- lq+r*r
      if (nl < minLeaf || nr < minLeaf || !(x[ids[i]] < x[ids[i+1L]])) next
      rss <- lq-ls*ls/nl + (sq-lq) - (sm-ls)^2/nr
      if (rss < best) { best <- rss; pos <- i; split <- (x[ids[i]] + x[ids[i+1L]])/2 }
    }
    if (!pos) return(nd)
    nd$leaf <- FALSE; nd$thr <- split
    nd$left <- grow(ids[seq_len(pos)], depth+1L)
    nd$right <- grow(ids[(pos+1L):n], depth+1L)
    nd
  }
  grow(ord, 0L)
}
predictTree <- function(nd, x) {
  vapply(x, function(xx) { p <- nd; while (!p$leaf) p <- if (xx < p$thr) p$left else p$right; p$value }, 0.0)
}
F0 <- if (family == "binary") { p <- max(1e-6, min(1-1e-6, mean(ytr))); log(p/(1-p)) } else mean(ytr)
Ftr <- rep(F0, n); Fva <- rep(F0, nval); Fte <- rep(F0, ntest); Fgrid <- rep(F0, length(xgrid))
hist <- data.frame(passo = 0L, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte))
alberi <- vector("list", B)
for (b in seq_len(B)) {
  residui <- ytr - response(Ftr)
  t <- tree1D(xtr, residui, maxDepth, minLeaf); alberi[[b]] <- t
  Ftr <- Ftr + eta * predictTree(t, xtr)
  Fva <- Fva + eta * predictTree(t, xva)
  Fte <- Fte + eta * predictTree(t, xte)
  Fgrid <- Fgrid + eta * predictTree(t, xgrid)
  hist <- rbind(hist, data.frame(passo = b, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte)))
}
best <- which.min(hist$validazione) - 1L
cat("Miglior passo validazione:", best, "· loss:", hist$validazione[best + 1L], "\n")
print(tail(hist, 1)); print(hist[best + 1L, ])
matplot(hist$passo, hist[, c("training", "validazione", "test")], type = "l", lty = c(1,2,3),
        col = c("#327EAA", "#CE8747", "#51846D"), xlab = "Alberi", ylab = if (family == "binary") "Log loss" else "MSE")
legend("topright", legend = c("training", "validazione", "test"), col = c("#327EAA", "#CE8747", "#51846D"), lty = c(1,2,3), bty = "n")
# Fine: confrontare con gbm/xgboost richiede specificare obiettivo e update di foglia (R3).

# R2: confronto dei risultati del browser sullo stesso scenario di riferimento
atteso_F0 <- -0.12094570797824605
atteso_iniziale <- c(1.6396809684615643, 1.5163942583538752, 1.7669493704662016)
atteso_ultimo <- c(0.089912655344175210, 0.21850849646006673, 0.19444286578802353)
atteso_best <- 46L; atteso_loss_best <- c(0.21306750125532772, 0.18840961644897988)
tolleranza <- 1e-6
stopifnot(abs(F0 - atteso_F0) < tolleranza)
stopifnot(max(abs(as.numeric(hist[1, 2:4]) - atteso_iniziale)) < tolleranza)
stopifnot(max(abs(as.numeric(tail(hist[, 2:4], 1)) - atteso_ultimo)) < tolleranza)
stopifnot(best == atteso_best)
stopifnot(max(abs(c(hist$validazione[best+1L], hist$test[best+1L]) - atteso_loss_best)) < tolleranza)
cat('OK: scenario sine — baseline, perdite, selezione e test indipendente corrispondono al motore JS.\n')

})

# ───────────────────── Scenario step ─────────────────────
local({
# StatAtlas · Lab 21 — Gradient boosting didattico (R0 dati, R2 regole CART)
# Regole identiche al browser per le foglie e gli split; non eguaglianza con gbm/xgboost.
RNGkind("Mersenne-Twister", "Inversion", "Rejection"); set.seed(2026)
n <- 120; nval <- 100; ntest <- 220
B <- 100; eta <- 0.1; maxDepth <- 2; minLeaf <- 8
family <- "gaussian"; sigma <- 0.4
f <- function(x) 0.35 * x + ifelse(x > 0.25, 1, -0.5)
xtr <- runif(n, -2, 2); xva <- runif(nval, -2, 2); xte <- runif(ntest, -2, 2)
ygen <- function(x) if (family == "binary") as.integer(runif(length(x)) < f(x)) else f(x) + sigma * rnorm(length(x))
ytr <- ygen(xtr); yva <- ygen(xva); yte <- ygen(xte)
xgrid <- seq(-2, 2, length.out = 140)
sigmoid <- function(z) ifelse(z >= 0, 1 / (1 + exp(-z)), exp(z) / (1 + exp(z)))
risk <- function(y, v) if (family == "binary") mean(pmax(v, 0) + log1p(exp(-abs(v))) - y * v) else mean((y - v)^2)
response <- function(v) if (family == "binary") sigmoid(v) else v
tree1D <- function(x, y, maxDepth, minLeaf) {
  ord <- order(x, seq_along(x))
  grow <- function(ids, depth) {
    n <- length(ids); z <- y[ids]; sm <- sum(z); sq <- sum(z*z); parent <- sq - sm*sm/n
    nd <- list(leaf = TRUE, value = sm/n, n = n, depth = depth)
    if (depth >= maxDepth || n < 2*minLeaf || parent < 1e-12) return(nd)
    ls <- 0; lq <- 0; best <- parent - 1e-10; pos <- 0L; split <- NA_real_
    for (i in seq_len(n-1L)) {
      r <- y[ids[i]]; nl <- i; nr <- n-i; ls <- ls+r; lq <- lq+r*r
      if (nl < minLeaf || nr < minLeaf || !(x[ids[i]] < x[ids[i+1L]])) next
      rss <- lq-ls*ls/nl + (sq-lq) - (sm-ls)^2/nr
      if (rss < best) { best <- rss; pos <- i; split <- (x[ids[i]] + x[ids[i+1L]])/2 }
    }
    if (!pos) return(nd)
    nd$leaf <- FALSE; nd$thr <- split
    nd$left <- grow(ids[seq_len(pos)], depth+1L)
    nd$right <- grow(ids[(pos+1L):n], depth+1L)
    nd
  }
  grow(ord, 0L)
}
predictTree <- function(nd, x) {
  vapply(x, function(xx) { p <- nd; while (!p$leaf) p <- if (xx < p$thr) p$left else p$right; p$value }, 0.0)
}
F0 <- if (family == "binary") { p <- max(1e-6, min(1-1e-6, mean(ytr))); log(p/(1-p)) } else mean(ytr)
Ftr <- rep(F0, n); Fva <- rep(F0, nval); Fte <- rep(F0, ntest); Fgrid <- rep(F0, length(xgrid))
hist <- data.frame(passo = 0L, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte))
alberi <- vector("list", B)
for (b in seq_len(B)) {
  residui <- ytr - response(Ftr)
  t <- tree1D(xtr, residui, maxDepth, minLeaf); alberi[[b]] <- t
  Ftr <- Ftr + eta * predictTree(t, xtr)
  Fva <- Fva + eta * predictTree(t, xva)
  Fte <- Fte + eta * predictTree(t, xte)
  Fgrid <- Fgrid + eta * predictTree(t, xgrid)
  hist <- rbind(hist, data.frame(passo = b, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte)))
}
best <- which.min(hist$validazione) - 1L
cat("Miglior passo validazione:", best, "· loss:", hist$validazione[best + 1L], "\n")
print(tail(hist, 1)); print(hist[best + 1L, ])
matplot(hist$passo, hist[, c("training", "validazione", "test")], type = "l", lty = c(1,2,3),
        col = c("#327EAA", "#CE8747", "#51846D"), xlab = "Alberi", ylab = if (family == "binary") "Log loss" else "MSE")
legend("topright", legend = c("training", "validazione", "test"), col = c("#327EAA", "#CE8747", "#51846D"), lty = c(1,2,3), bty = "n")
# Fine: confrontare con gbm/xgboost richiede specificare obiettivo e update di foglia (R3).

# R2: confronto dei risultati del browser sullo stesso scenario di riferimento
atteso_F0 <- 0.050299625722643702
atteso_iniziale <- c(1.4067069300923769, 1.3914768388541077, 1.3912368445700873)
atteso_ultimo <- c(0.098326007732244022, 0.20238522383147292, 0.18239250208683122)
atteso_best <- 27L; atteso_loss_best <- c(0.19039764427602104, 0.17754852329681151)
tolleranza <- 1e-6
stopifnot(abs(F0 - atteso_F0) < tolleranza)
stopifnot(max(abs(as.numeric(hist[1, 2:4]) - atteso_iniziale)) < tolleranza)
stopifnot(max(abs(as.numeric(tail(hist[, 2:4], 1)) - atteso_ultimo)) < tolleranza)
stopifnot(best == atteso_best)
stopifnot(max(abs(c(hist$validazione[best+1L], hist$test[best+1L]) - atteso_loss_best)) < tolleranza)
cat('OK: scenario step — baseline, perdite, selezione e test indipendente corrispondono al motore JS.\n')

})

# ───────────────────── Scenario binary ─────────────────────
local({
# StatAtlas · Lab 21 — Gradient boosting didattico (R0 dati, R2 regole CART)
# Regole identiche al browser per le foglie e gli split; non eguaglianza con gbm/xgboost.
RNGkind("Mersenne-Twister", "Inversion", "Rejection"); set.seed(2026)
n <- 120; nval <- 100; ntest <- 220
B <- 100; eta <- 0.1; maxDepth <- 2; minLeaf <- 8
family <- "binary"; sigma <- 0.4
f <- function(x) plogis(2.5 * sin(1.5 * x) + 0.45 * x)
xtr <- runif(n, -2, 2); xva <- runif(nval, -2, 2); xte <- runif(ntest, -2, 2)
ygen <- function(x) if (family == "binary") as.integer(runif(length(x)) < f(x)) else f(x) + sigma * rnorm(length(x))
ytr <- ygen(xtr); yva <- ygen(xva); yte <- ygen(xte)
xgrid <- seq(-2, 2, length.out = 140)
sigmoid <- function(z) ifelse(z >= 0, 1 / (1 + exp(-z)), exp(z) / (1 + exp(z)))
risk <- function(y, v) if (family == "binary") mean(pmax(v, 0) + log1p(exp(-abs(v))) - y * v) else mean((y - v)^2)
response <- function(v) if (family == "binary") sigmoid(v) else v
tree1D <- function(x, y, maxDepth, minLeaf) {
  ord <- order(x, seq_along(x))
  grow <- function(ids, depth) {
    n <- length(ids); z <- y[ids]; sm <- sum(z); sq <- sum(z*z); parent <- sq - sm*sm/n
    nd <- list(leaf = TRUE, value = sm/n, n = n, depth = depth)
    if (depth >= maxDepth || n < 2*minLeaf || parent < 1e-12) return(nd)
    ls <- 0; lq <- 0; best <- parent - 1e-10; pos <- 0L; split <- NA_real_
    for (i in seq_len(n-1L)) {
      r <- y[ids[i]]; nl <- i; nr <- n-i; ls <- ls+r; lq <- lq+r*r
      if (nl < minLeaf || nr < minLeaf || !(x[ids[i]] < x[ids[i+1L]])) next
      rss <- lq-ls*ls/nl + (sq-lq) - (sm-ls)^2/nr
      if (rss < best) { best <- rss; pos <- i; split <- (x[ids[i]] + x[ids[i+1L]])/2 }
    }
    if (!pos) return(nd)
    nd$leaf <- FALSE; nd$thr <- split
    nd$left <- grow(ids[seq_len(pos)], depth+1L)
    nd$right <- grow(ids[(pos+1L):n], depth+1L)
    nd
  }
  grow(ord, 0L)
}
predictTree <- function(nd, x) {
  vapply(x, function(xx) { p <- nd; while (!p$leaf) p <- if (xx < p$thr) p$left else p$right; p$value }, 0.0)
}
F0 <- if (family == "binary") { p <- max(1e-6, min(1-1e-6, mean(ytr))); log(p/(1-p)) } else mean(ytr)
Ftr <- rep(F0, n); Fva <- rep(F0, nval); Fte <- rep(F0, ntest); Fgrid <- rep(F0, length(xgrid))
hist <- data.frame(passo = 0L, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte))
alberi <- vector("list", B)
for (b in seq_len(B)) {
  residui <- ytr - response(Ftr)
  t <- tree1D(xtr, residui, maxDepth, minLeaf); alberi[[b]] <- t
  Ftr <- Ftr + eta * predictTree(t, xtr)
  Fva <- Fva + eta * predictTree(t, xva)
  Fte <- Fte + eta * predictTree(t, xte)
  Fgrid <- Fgrid + eta * predictTree(t, xgrid)
  hist <- rbind(hist, data.frame(passo = b, training = risk(ytr, Ftr), validazione = risk(yva, Fva), test = risk(yte, Fte)))
}
best <- which.min(hist$validazione) - 1L
cat("Miglior passo validazione:", best, "· loss:", hist$validazione[best + 1L], "\n")
print(tail(hist, 1)); print(hist[best + 1L, ])
matplot(hist$passo, hist[, c("training", "validazione", "test")], type = "l", lty = c(1,2,3),
        col = c("#327EAA", "#CE8747", "#51846D"), xlab = "Alberi", ylab = if (family == "binary") "Log loss" else "MSE")
legend("topright", legend = c("training", "validazione", "test"), col = c("#327EAA", "#CE8747", "#51846D"), lty = c(1,2,3), bty = "n")
# Fine: confrontare con gbm/xgboost richiede specificare obiettivo e update di foglia (R3).

# R2: confronto dei risultati del browser sullo stesso scenario di riferimento
atteso_F0 <- -0.16705408466316632
atteso_iniziale <- c(0.68967092835702570, 0.69830205606462314, 0.69739085196646056)
atteso_ultimo <- c(0.28296124619064250, 0.39946452550171258, 0.38461843064560908)
atteso_best <- 100L; atteso_loss_best <- c(0.39946452550171258, 0.38461843064560908)
tolleranza <- 1e-6
stopifnot(abs(F0 - atteso_F0) < tolleranza)
stopifnot(max(abs(as.numeric(hist[1, 2:4]) - atteso_iniziale)) < tolleranza)
stopifnot(max(abs(as.numeric(tail(hist[, 2:4], 1)) - atteso_ultimo)) < tolleranza)
stopifnot(best == atteso_best)
stopifnot(max(abs(c(hist$validazione[best+1L], hist$test[best+1L]) - atteso_loss_best)) < tolleranza)
cat('OK: scenario binary — baseline, perdite, selezione e test indipendente corrispondono al motore JS.\n')

})
