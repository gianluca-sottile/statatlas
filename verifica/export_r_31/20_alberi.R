# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 20 — Alberi, bagging e random forest
# R0: stessi dati e stessi campioni bootstrap di StatAtlas (stesso seed, R ≥ 3.6).
# R2: stesso CART didattico (Gini, soglie nei punti medi, prima variabile e soglia più piccola a parità),
#     stessa estrazione di mtry variabili a ogni nodo: stessi alberi e stessi errori.
# R3: rpart e ranger usano regole diverse (potatura, tie, campionamento): confronto di metodo, non stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 200; n_test <- 1000; p <- 5; eps <- 0.1; mtry <- 2; B <- 100
prof_max <- 30; min_foglia <- 1
confine <- function(X) 8 / pi - X[, 1]^2 - X[, 2]^2

genera <- function(n) {
  X <- matrix(runif(n * p, -2, 2), ncol = p, byrow = TRUE)
  y <- as.integer((confine(X) > 0) != (runif(n) < eps))   # etichette scambiate con probabilità eps
  list(X = X, y = y)
}
tr <- genera(n); te <- genera(n_test)

# CART per due classi: criterio G = n * Gini pesato dei figli, da minimizzare
cresci <- function(X, y, idx, mtry, prof = 0) {
  yy <- y[idx]; m <- length(idx); c1 <- sum(yy); c0 <- m - c1
  foglia <- list(foglia = TRUE, classe = as.integer(c1 > c0), n = m)
  if (prof >= prof_max || m < 2 * min_foglia || c0 == 0 || c1 == 0) return(foglia)
  vars <- if (mtry < p) sample(p, mtry) else seq_len(p)
  G0 <- m - (c0^2 + c1^2) / m; best <- G0 - 1e-10; bj <- 0
  for (j in vars) {
    o <- order(X[idx, j]); v <- X[idx, j][o]; l1 <- cumsum(yy[o])[-m]
    nl <- seq_len(m - 1); nr <- m - nl; l0 <- nl - l1; r1 <- c1 - l1; r0 <- nr - r1
    G <- nl - (l0^2 + l1^2) / nl + nr - (r0^2 + r1^2) / nr
    ok <- which(v[-m] < v[-1] & nl >= min_foglia & nr >= min_foglia)
    if (length(ok)) { i <- ok[which.min(G[ok])]; if (G[i] < best) { best <- G[i]; bj <- j; soglia <- (v[i] + v[i + 1]) / 2 } }
  }
  if (bj == 0) return(foglia)
  sx <- X[idx, bj] < soglia
  list(foglia = FALSE, j = bj, soglia = soglia, sx = cresci(X, y, idx[sx], mtry, prof + 1), dx = cresci(X, y, idx[!sx], mtry, prof + 1))
}
prevedi <- function(t, X) {
  if (t$foglia) return(rep(t$classe, nrow(X)))
  out <- integer(nrow(X)); sx <- X[, t$j] < t$soglia
  out[sx] <- prevedi(t$sx, X[sx, , drop = FALSE]); out[!sx] <- prevedi(t$dx, X[!sx, , drop = FALSE]); out
}

albero <- cresci(tr$X, tr$y, seq_len(n), mtry = p)
errore_albero <- mean(prevedi(albero, te$X) != te$y)

metodi <- c(bagging = p, foresta = mtry)
voti_te <- matrix(0, n_test, 2); voti_oob <- matrix(0, n, 2); conta_oob <- matrix(0, n, 2)
radice <- matrix(NA, B, 2, dimnames = list(NULL, names(metodi))); traiettoria <- vector("list", B)
for (b in seq_len(B)) {
  for (k in 1:2) {
    idx <- sample(n, n, replace = TRUE)                  # campione bootstrap
    t <- cresci(tr$X, tr$y, idx, mtry = metodi[k])
    if (!t$foglia) radice[b, k] <- t$j
    voti_te[, k] <- voti_te[, k] + prevedi(t, te$X)
    fuori <- setdiff(seq_len(n), idx)                    # out-of-bag: mai visti da questo albero
    voti_oob[fuori, k] <- voti_oob[fuori, k] + prevedi(t, tr$X[fuori, , drop = FALSE]); conta_oob[fuori, k] <- conta_oob[fuori, k] + 1
  }
  usati <- conta_oob > 0
  traiettoria[[b]] <- tibble(alberi = b, metodo = names(metodi),
    test = colMeans((2 * voti_te > b) != te$y),
    oob = sapply(1:2, \(k) mean((2 * voti_oob[usati[, k], k] > conta_oob[usati[, k], k]) != tr$y[usati[, k]])))
}
traiettoria <- bind_rows(traiettoria)
traiettoria |> filter(alberi == B)
apply(radice, 2, \(r) table(factor(r, levels = seq_len(p))) / B)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
traiettoria |> pivot_longer(c(test, oob), names_to = "stima", values_to = "errore") |>
  ggplot(aes(alberi, errore, colour = metodo, linetype = stima)) + geom_line() +
  geom_hline(yintercept = c(eps, errore_albero), linetype = c("dashed", "dotted")) + theme_statatlas()

# Confronto di metodo (R3)
# library(ranger); ranger(y ~ ., data = data.frame(y = factor(tr$y), tr$X), num.trees = B, mtry = mtry)
