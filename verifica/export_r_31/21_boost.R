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
