# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 22 — Rete neurale 2 → H → 1 e backpropagation
# R0: stessi dati, stessa suddivisione e stessi pesi iniziali di StatAtlas (R ≥ 3.6).
# R2: stessa discesa del gradiente a lotto intero: stesse perdite a meno dell’arrotondamento.
# R3: nnet o torch usano ottimizzatori e inizializzazioni diversi: confronto di metodo, non stessi pesi.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

n <- 200; sigma <- 0.1; n_val <- 60; H <- 4; eta <- 0.5; lambda <- 0; E <- 2000
set.seed(2026)
U <- matrix(runif(2 * n), ncol = 2, byrow = TRUE); Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
X0 <- 2 * U - 1; y <- as.numeric(X0[, 1] * X0[, 2] > 0)
X <- X0 + sigma * Z                                   # etichetta dai punti puliti, poi rumore
id_val <- sample(n, n_val)
Xtr <- X[-id_val, ]; ytr <- y[-id_val]; Xva <- X[id_val, ]; yva <- y[id_val]

# Inizializzazione con un seed proprio
inizializza <- function(seme) {
  set.seed(seme); a <- sqrt(6 / (2 + H)); c <- sqrt(6 / (H + 1))
  list(W1 = matrix(runif(2 * H, -a, a), nrow = H, byrow = TRUE), b1 = rep(0, H), W2 = runif(H, -c, c), b2 = 0)
}
att <- tanh; datt <- function(A, Hh) 1 - Hh^2
avanti <- function(par, X) { A <- sweep(X %*% t(par$W1), 2, par$b1, "+"); Hh <- att(A); list(A = A, H = Hh, z = drop(Hh %*% par$W2) + par$b2) }
bce <- function(z, y) mean(pmax(z, 0) - y * z + log1p(exp(-abs(z))))   # forma stabile
gradiente <- function(par, X, y) {
  f <- avanti(par, X); dz <- (plogis(f$z) - y) / nrow(X)
  dA <- outer(dz, par$W2) * datt(f$A, f$H)
  list(W1 = t(dA) %*% X + lambda * par$W1, b1 = colSums(dA), W2 = drop(t(f$H) %*% dz) + lambda * par$W2, b2 = sum(dz))
}
addestra <- function(par) {
  storia <- matrix(NA, E + 1, 2, dimnames = list(NULL, c("training", "validazione")))
  storia[1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))
  for (e in seq_len(E)) {
    g <- gradiente(par, Xtr, ytr); par <- Map(\(p, d) p - eta * d, par, g)
    storia[e + 1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))
  }
  list(par = par, storia = storia)
}

# Controllo del gradiente con differenze finite (all’inizio)
par0 <- inizializza(1)
obiettivo <- function(v) { p <- relist(v, par0); bce(avanti(p, Xtr)$z, ytr) + lambda / 2 * (sum(p$W1^2) + sum(p$W2^2)) }
v0 <- unlist(as.relistable(par0)); num <- sapply(seq_along(v0), \(k) { h <- replace(numeric(length(v0)), k, 1e-5); (obiettivo(v0 + h) - obiettivo(v0 - h)) / 2e-5 })
max(abs(num - unlist(gradiente(par0, Xtr, ytr)))) / max(abs(num))

fit <- addestra(par0)
tail(fit$storia, 1)
mean((plogis(avanti(fit$par, Xva)$z) > 0.5) == yva)   # accuratezza di validazione

# 20 inizializzazioni diverse sugli stessi dati
esiti <- map_dfr(seq_len(20), \(r) { f <- addestra(inizializza(1 + r)); tibble(seed = 1 + r, training = f$storia[E + 1, 1], validazione = f$storia[E + 1, 2]) })
esiti

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
as_tibble(fit$storia) |> mutate(epoca = 0:E) |> pivot_longer(-epoca, names_to = "insieme", values_to = "perdita") |>
  ggplot(aes(epoca, perdita, colour = insieme)) + geom_line() + theme_statatlas()
