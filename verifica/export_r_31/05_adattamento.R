# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 05 — Adattamento: dati Normale(0, 1), modello Normale (μ, σ stimati)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 100
x <- qnorm(runif(N), mean = 0, sd = 1)

# Stima ML del modello ipotizzato
fit <- function(x) list(mean = mean(x), sd = sqrt(mean((x - mean(x))^2)))
par <- fit(x); par

# Classi con frequenza attesa ≥ 5 e statistica X² di Pearson
chi2 <- function(x, par) {
  K <- max(3, min(20, floor(length(x) / 5)))
  br <- c(-Inf, do.call(qnorm, c(list((1:(K - 1)) / K), par)), Inf)
  o <- table(cut(x, br))
  e <- length(x) / K
  sum((o - e)^2 / e)
}
K <- max(3, min(20, floor(N / 5)))
X2 <- as.numeric(chi2(x, par))
gdl <- K - 1 - 2
c(X2 = X2, gdl = gdl, p_asintotico = pchisq(X2, gdl, lower.tail = FALSE))

# p-value Monte Carlo (bootstrap parametrico, 199 repliche): stessa sequenza di StatAtlas
X2_b <- map_dbl(seq_len(199), \(b) {
  xb <- do.call(qnorm, c(list(runif(N)), par))
  as.numeric(chi2(xb, fit(xb)))
})
(1 + sum(X2_b >= X2)) / (199 + 1)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Grafico quantile-quantile rispetto al modello stimato
tibble(x = sort(x), q = do.call(qnorm, c(list(ppoints(N, a = 0.5)), par))) |>
  ggplot(aes(q, x)) +
  geom_abline(linetype = "dashed", colour = "#D55E00") +
  geom_point(colour = "#0072B2", alpha = 0.7) +
  labs(x = "quantili del modello stimato", y = "quantili osservati", title = "QQ plot: Normale (μ, σ stimati)") +
  theme_statatlas()
