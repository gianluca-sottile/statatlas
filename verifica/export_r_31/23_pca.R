# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 23 — Analisi delle componenti principali
# R0: stessi dati di StatAtlas (stesso seed). R1: stessi autovalori, quote di varianza ed errori di ricostruzione;
#     prcomp() usa la SVD: i segni degli autovettori possono differire e vanno allineati prima di confrontarli.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 80; p <- 2; rho <- 4; theta <- 30 * pi / 180; unita <- 1; standardizza <- FALSE; k <- 1; B <- 500
lambda <- c(rho, 1, 0.6, 0.35, 0.2, 0.1)[1:p]; mu <- c(3, -2, 1, 0, 0, 0)[1:p]
V <- diag(p); V[1:2, 1:2] <- matrix(c(cos(theta), sin(theta), -sin(theta), cos(theta)), 2)
genera <- function() {
  E <- matrix(rnorm(n * p), ncol = p, byrow = TRUE)
  X <- sweep(E %*% diag(sqrt(lambda), p) %*% t(V), 2, mu, "+")
  # (nessun valore anomalo)
  X[, 2] <- unita * X[, 2]
  X
}

# Segno: componente di modulo massimo positiva (convenzione di StatAtlas)
allinea <- function(V) sweep(V, 2, sign(V[cbind(apply(abs(V), 2, which.max), seq_len(ncol(V)))]), "*")

X <- genera()
pc <- prcomp(X, center = TRUE, scale. = standardizza)
lambda_hat <- pc$sdev^2
tibble(componente = 1:p, autovalore = lambda_hat, pve = lambda_hat / sum(lambda_hat), cumulata = cumsum(pve))
allinea(pc$rotation)

# Errore di ricostruzione con k componenti: diretto e tramite gli autovalori scartati
Z <- scale(X, center = TRUE, scale = standardizza)
Zk <- pc$x[, 1:k, drop = FALSE] %*% t(pc$rotation[, 1:k, drop = FALSE])
c(diretto = sum((Z - Zk)^2) / n, autovalori = (n - 1) / n * sum(lambda_hat[-(1:k)]))

# Campioni ripetuti: angolo tra PC1 stimata e PC1 della popolazione (il primo campione è quello sopra)
Sigma <- V %*% diag(lambda, p) %*% t(V); D <- diag(c(1, unita, rep(1, p - 2)))[1:p, 1:p]; Sigma <- D %*% Sigma %*% D
if (standardizza) Sigma <- cov2cor(Sigma)
v1 <- eigen(Sigma, symmetric = TRUE)$vectors[, 1]
set.seed(2026)
repliche <- map_dfr(seq_len(B), \(b) {
  pc <- prcomp(genera(), center = TRUE, scale. = standardizza)
  tibble(lambda1 = pc$sdev[1]^2, angolo = acos(min(1, abs(sum(pc$rotation[, 1] * v1)))) * 180 / pi)
})
repliche |> summarise(media_lambda1 = mean(lambda1), sd_lambda1 = sd(lambda1), media_sin2 = mean(sin(angolo * pi / 180)^2))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
ggplot(repliche, aes(angolo)) + geom_histogram(bins = 30, fill = "#9A3412", alpha = 0.5) +
  labs(x = "angolo tra PC1 stimata e vera (gradi)") + theme_statatlas()
biplot(pc, scale = 0)   # convenzione diversa da StatAtlas: frecce = loading, score non riscalati
