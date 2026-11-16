# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 02 — Normale bivariata standard con correlazione ρ
# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse coppie di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 1000; rho <- 0.6; x0 <- 1; h <- 0.25

# Due normali standard per coppia, nell’ordine z1, z2 (riempimento per righe)
z <- matrix(rnorm(2 * N), ncol = 2, byrow = TRUE)
z1 <- z[, 1]; z2 <- z[, 2]
coppie <- tibble(x = z1, y = rho * z1 + sqrt(1 - rho^2) * z2)

# Correlazioni: lineare e con X²
coppie |> summarise(r = cor(x, y), r_x2 = cor(x^2, y))

# Distribuzione condizionata approssimata: punti con |x − x0| ≤ h
striscia <- coppie |> filter(abs(x - x0) <= h)
striscia |> summarise(n = n(), media = mean(y), dev_std = sd(y))
# Teoria: E(Y | X = x0) = 0.6, sd = 0.8

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

ggplot(coppie, aes(x, y)) +
  annotate("rect", xmin = x0 - h, xmax = x0 + h, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.1) +
  geom_point(alpha = 0.35, size = 0.8, colour = "#0072B2") +
  geom_function(fun = \(x) rho * x, linetype = "dashed", linewidth = 0.9) +
  geom_density_2d(colour = "grey30", linewidth = 0.3) +
  labs(title = "Normale bivariata standard con correlazione ρ", subtitle = "Linea tratteggiata: E(Y | X = x)") +
  theme_statatlas()

ggplot(striscia, aes(y)) +
  geom_histogram(aes(y = after_stat(density)), bins = 25, fill = "#9A3412", alpha = 0.25, colour = "#9A3412") +
  stat_function(fun = dnorm, args = list(mean = 0.6, sd = 0.8), linewidth = 1) +
  labs(title = "Y condizionata a X vicino a x0", x = "y", y = "densità") +
  theme_statatlas()
