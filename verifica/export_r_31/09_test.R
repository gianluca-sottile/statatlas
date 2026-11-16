# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 09 — Test Z bilaterale: livello e potenza
# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse statistiche di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 20; B <- 1000; alpha <- 0.05; delta <- 0.5   # effetto in unità di σ (σ = 1, μ₀ = 0)
z_crit <- qnorm(1 - alpha / 2)
rifiuta <- function(z) abs(z) > z_crit

# Per ogni replica: un campione sotto H0, poi uno sotto H1 (stesso ordine di StatAtlas)
sim <- tibble(replica = seq_len(B)) |>
  mutate(z = map(replica, \(r) c(z0 = sqrt(n) * mean(rnorm(n, 0, 1)),
                                 z1 = sqrt(n) * mean(rnorm(n, delta, 1))))) |>
  unnest_wider(z)

potenza_teorica <- function(d, n) pnorm(-z_crit + d * sqrt(n)) + pnorm(-z_crit - d * sqrt(n))
sim |> summarise(errore_I = mean(rifiuta(z0)), potenza = mean(rifiuta(z1))) |>
  mutate(alpha = alpha, potenza_teorica = potenza_teorica(delta, n))

# n per potenza 80% (approssimato: trascura la coda opposta)
ceiling(((z_crit + qnorm(0.8)) / delta)^2)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Curve di potenza per n/2, n, 2n
expand_grid(d = seq(0, 1.5, by = 0.01), n_ = c(max(2, round(n / 2)), n, 2 * n)) |>
  mutate(potenza = potenza_teorica(d, n_), n_ = factor(n_)) |>
  ggplot(aes(d, potenza, colour = n_, linetype = n_)) +
  geom_hline(yintercept = c(alpha, 0.8), linetype = "dotted", colour = "grey50") +
  geom_line(linewidth = 0.9) +
  annotate("point", x = delta, y = mean(rifiuta(sim$z1)), shape = 18, size = 4, colour = "#9A3412") +
  scale_colour_manual(values = c("grey55", "#0072B2", "#009E73")) +
  labs(title = "Curva di potenza del test Z", x = expression(delta == (mu - mu[0]) / sigma), y = "potenza", colour = "n", linetype = "n") +
  theme_statatlas()
