# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 13 — ARMA(2, 1): φ₁ = 1.2, φ₂ = -0.6, θ₁ = 0
# Generazione esplicita (non arima.sim) per avere gli stessi numeri di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
phi <- c(1.2, -0.6); theta <- 0; T <- 400; burn <- 200

e <- rnorm(burn + T)
x <- numeric(burn + T)
for (t in seq_along(x)) {
  x1 <- if (t > 1) x[t - 1] else 0; x2 <- if (t > 2) x[t - 2] else 0; e1 <- if (t > 1) e[t - 1] else 0
  x[t] <- phi[1] * x1 + phi[2] * x2 + e[t] + theta * e1
}
x <- x[-seq_len(burn)]   # scarta il burn-in

# Stazionarietà e invertibilità: moduli delle radici (devono superare 1)
Mod(polyroot(c(1, -phi)))
abs(theta) < 1

# ACF e PACF: empiriche e teoriche
confronto <- tibble(ritardo = 1:20,
  acf_emp  = acf(x, lag.max = 20, plot = FALSE)$acf[-1],
  acf_teo  = ARMAacf(ar = phi, ma = theta, lag.max = 20)[-1],
  pacf_emp = pacf(x, lag.max = 20, plot = FALSE)$acf[, 1, 1],
  pacf_teo = ARMAacf(ar = phi, ma = theta, lag.max = 20, pacf = TRUE))
confronto

# Stima di massima verosimiglianza del modello che ha generato i dati
arima(x, order = c(2, 0, 1), include.mean = FALSE)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

tibble(t = seq_along(x), x = x) |> ggplot(aes(t, x)) + geom_line(colour = "#0072B2") + theme_statatlas()
confronto |>
  pivot_longer(-ritardo, names_to = c("funzione", "tipo"), names_sep = "_") |>
  ggplot(aes(ritardo, value, colour = tipo)) +
  geom_hline(yintercept = c(-1, 1) * 1.96 / sqrt(T), linetype = "dashed", colour = "grey60") +
  geom_point() + geom_line() + facet_wrap(~ funzione) +
  scale_colour_manual(values = c(emp = "#0072B2", teo = "#D55E00")) +
  labs(y = NULL) + theme_statatlas()
