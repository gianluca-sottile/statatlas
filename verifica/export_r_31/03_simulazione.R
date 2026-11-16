# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 03 — Metodo di inversione
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi numeri di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

set.seed(2026)
N <- 1000

# 1. Uniformi, poi inversione della ripartizione
sim <- tibble(u = runif(N)) |>
  mutate(x = qnorm(u, mean = 0, sd = 1))

# 2. Controllo: momenti empirici e teorici
sim |> summarise(media = mean(x), varianza = var(x))

# 3. Istogramma vs densità teorica
ggplot(sim, aes(x)) +
  geom_histogram(aes(y = after_stat(density)), bins = 36, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(-4, 4)) +
  labs(title = "Inversione: x = F^{-1}(u)", subtitle = "Normale(mean = 0, sd = 1)", x = "x", y = NULL) +
  theme_statatlas()

# 4. Il percorso dell’inversione per le prime 20 estrazioni
ggplot(slice_head(sim, n = 20)) +
  stat_function(fun = pnorm, args = list(mean = 0, sd = 1), n = 400,
                xlim = c(-4, 4)) +
  geom_segment(aes(x = -4, xend = x, y = u, yend = u), colour = "#0072B2", alpha = 0.5) +
  geom_segment(aes(x = x, xend = x, y = u, yend = 0), colour = "#0072B2", alpha = 0.5) +
  labs(x = "x", y = "u = F(x)") +
  theme_statatlas()
