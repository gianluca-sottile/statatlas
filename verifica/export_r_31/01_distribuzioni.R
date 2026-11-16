# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 01 — Normale(mean = 0, sd = 1)
# Osservazioni generate per inversione, X = F⁻¹(U) con U ~ U(0, 1):
# con lo stesso seed R e StatAtlas producono gli stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 1000
a <- -0.68; b <- 0.68   # intervallo (a, b]

x <- qnorm(runif(N), mean = 0, sd = 1)   # stessa legge di rnorm()

# Teoria vs simulazione ---------------------------------------------
tibble(
  quantita    = c("E(X)", "Var(X)", "mediana", "P(a < X <= b)"),
  teoria      = c(0, 1, qnorm(0.5, mean = 0, sd = 1),
                  pnorm(b, mean = 0, sd = 1) - pnorm(a, mean = 0, sd = 1)),
  simulazione = c(mean(x), var(x), median(x), mean(x > a & x <= b))
)

# Distanza dalla ripartizione teorica e banda DKW al 95% ------------
D <- ks.test(x, "pnorm", mean = 0, sd = 1)$statistic
c(D = unname(D), raggio_DKW = sqrt(log(2 / 0.05) / (2 * N)))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Istogramma vs densità teorica ------------------------------------
lo <- -4; hi <- 4; bw <- (hi - lo) / 40
tibble(x = x) |>
  filter(x >= lo, x <= hi) |>
  ggplot(aes(x)) +
  annotate("rect", xmin = a, xmax = b, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.07) +
  geom_histogram(aes(y = after_stat(count) / (N * bw)), binwidth = bw, boundary = lo,
                 fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(lo, hi)) +
  labs(title = "Normale(mean = 0, sd = 1)",
       subtitle = "Istogramma: simulazione · curva: densità teorica",
       x = "x", y = "densità") +
  theme_statatlas()

# Ripartizione empirica vs teorica -----------------------------------
tibble(x = x) |>
  ggplot(aes(x)) +
  stat_ecdf(colour = "#0072B2", linetype = "dashed") +
  stat_function(fun = pnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(-4, 4)) +
  labs(x = "x", y = "F(x)", title = "Funzione di ripartizione: empirica (tratteggio) e teorica") +
  theme_statatlas()
