# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 16 — Spline di regressione (B-spline cubiche)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)
library(splines)

set.seed(2026)
n <- 100; sigma <- 0.3
f <- function(x) sin(2 * pi * x) + 0.5 * x * sin(6 * pi * x)
x <- (seq_len(n) - 0.5) / n
y <- f(x) + sigma * rnorm(n)
griglia <- seq(0, 1, length.out = 201)

# Matrice del lisciatore S (ŷ = S y) per il metodo scelto
basi <- 8; K <- basi - 4
nodi <- c(rep(0, 4), seq_len(K) / (K + 1), rep(1, 4))
X <- splineDesign(nodi, x, ord = 4)
S <- X %*% solve(crossprod(X), t(X))
fit <- lm(y ~ X - 1)

# Gradi di libertà effettivi, distorsione² e varianza (esatti)
c(gdl = sum(diag(S)), distorsione2 = mean((S %*% f(x) - f(x))^2), varianza = sigma^2 * sum(S^2) / n)

# Validazione incrociata leave-one-out in forma chiusa
yhat <- drop(S %*% y)
mean(((y - yhat) / (1 - diag(S)))^2)

# Errore Monte Carlo su 300 campioni (il primo è quello già generato)
set.seed(2026)
ise <- map_dbl(seq_len(300), \(m) { yy <- f(x) + sigma * rnorm(n); mean((S %*% yy - f(x))^2) })
mean(ise)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
tibble(x, y, yhat) |>
  ggplot(aes(x, y)) + geom_point(alpha = 0.5) +
  geom_function(fun = f, linetype = "dashed") +
  geom_line(aes(y = yhat), colour = "#0072B2", linewidth = 1.1) +
  labs(title = "Spline di regressione (B-spline cubiche)", subtitle = sprintf("gradi di libertà effettivi %.1f", sum(diag(S)))) +
  theme_statatlas()
