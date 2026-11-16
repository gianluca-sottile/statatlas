# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 19 — k vicini più prossimi
# R0: stessi dati di training e di test di StatAtlas (stesso seed, R ≥ 3.6).
# R2: stesso algoritmo: distanza euclidea, a parità di distanza l’indice minore (order()), k dispari.
# R3: class::knn() rompe le parità a caso e consuma numeri casuali: confronto di metodo, non stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 100; n_test <- 500; delta <- 2; scala <- 1; standardizza <- TRUE; B <- 100
k_val <- seq(1, 99, by = 2); kmax <- max(k_val)

genera <- function(n) {
  y <- rep(0:1, each = n / 2)
  s <- ifelse(runif(n) < 0.5, -1, 1)                 # (usato solo nello scenario XOR)
  z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
  x <- cbind(ifelse(y == 1, delta / 2, -delta / 2) + z[, 1], z[, 2])
  x[, 2] <- scala * x[, 2]
  list(x = x, y = y)
}
errore_bayes <- pnorm(-delta / 2)

# Classe prevista per ogni k: matrice (punti × k)
prevedi <- function(xtr, ytr, xnew, loo = FALSE) {
  t(sapply(seq_len(nrow(xnew)), \(i) {
    d <- (xtr[, 1] - xnew[i, 1])^2 + (xtr[, 2] - xnew[i, 2])^2
    o <- order(d); if (loo) o <- o[o != i]          # leave-one-out: il punto non vota per sé
    v <- cumsum(ytr[o[seq_len(kmax)]])
    as.integer(v[k_val] > k_val / 2)
  }))
}

una_replica <- function() {
  tr <- genera(n); te <- genera(n_test)
  if (standardizza) {                                # medie e sd stimate sul solo training
    m <- colMeans(tr$x); s <- apply(tr$x, 2, sd)
    tr$x <- scale(tr$x, m, s); te$x <- scale(te$x, m, s)
  }
  err <- \(P, y) colMeans(P != y)
  tibble(k = k_val, training = err(prevedi(tr$x, tr$y, tr$x), tr$y),
         loo = err(prevedi(tr$x, tr$y, tr$x, loo = TRUE), tr$y), test = err(prevedi(tr$x, tr$y, te$x), te$y))
}

repliche <- map(seq_len(B), \(b) una_replica())
curve <- bind_rows(repliche, .id = "replica")
curve |> group_by(replica) |> slice_min(loo, n = 1, with_ties = FALSE) |> ungroup() |>
  summarise(k_medio = mean(k), test_al_k_scelto = mean(test))
curve |> filter(k == 1) |> summarise(training = mean(training), test = mean(test), cover_hart = 2 * errore_bayes * (1 - errore_bayes))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
curve |> dplyr::select(-replica) |> group_by(k) |> summarise(across(everything(), mean)) |>
  pivot_longer(-k, names_to = "errore", values_to = "valore") |>
  ggplot(aes(k, valore, colour = errore)) + geom_line(linewidth = 1) +
  geom_hline(yintercept = errore_bayes, linetype = "dashed") +
  labs(x = "k", y = "tasso di errore") + theme_statatlas()

# Confronto di metodo (R3)
# library(class); knn(train = tr$x, test = te$x, cl = factor(tr$y), k = 15)
