# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 06 — Media, mediana e massima verosimiglianza
# Modello: N(θ = 0, 1) · n = 100 · M = 1000 · seed = 2026
# Con R ≥ 4.1 e il generatore predefinito (Mersenne-Twister,
# normal.kind = "Inversion") i campioni coincidono con quelli di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

# Parametri -------------------------------------------------------
theta <- 0        # vero parametro di posizione
n     <- 100      # numerosità di ogni campione
M     <- 1000     # numero di campioni (repliche)
set.seed(2026)

# Modello generatore ----------------------------------------------
genera <- function(n) rnorm(n, mean = theta, sd = 1)
# Nel modello Normale lo stimatore di massima verosimiglianza coincide con la media.

# 1. Simulazione: M campioni generati uno dopo l’altro ------------
sim <- tibble(replica = seq_len(M)) |>
  mutate(campione = map(replica, \(r) genera(n)))

stime <- sim |>
  transmute(
    replica,
    media   = map_dbl(campione, mean),
    mediana = map_dbl(campione, median)
  )

# 2. Teoria vs simulazione ----------------------------------------
stime_lunghe <- stime |>
  pivot_longer(-replica, names_to = "stimatore", values_to = "stima")

stime_lunghe |>
  group_by(stimatore) |>
  summarise(
    centro  = median(stima),          # teoria: θ (per simmetria)
    dev_std = sd(stima),
    iqr     = IQR(stima),
    mse     = mean((stima - theta)^2)
  )
# Dev. std teoriche: media 0.1, mediana 0.1253

# 3. Grafico: distribuzioni campionarie ---------------------------
lim <- 0.564   # finestra [θ − lim, θ + lim]
bw  <- 2 * lim / 48
colori <- c(media = "#0072B2", mediana = "#D55E00")

teoria <- tibble(x = seq(theta - lim, theta + lim, length.out = 400)) |>
  mutate(
    media   = dnorm(x, theta, sqrt(1 / n)),
    mediana = dnorm(x, theta, sqrt(pi / (2 * n)))
  ) |>
  pivot_longer(-x, names_to = "stimatore", values_to = "densita")

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(
      plot.title       = element_text(face = "bold"),
      plot.subtitle    = element_text(colour = "grey35"),
      panel.grid.minor = element_blank(),
      legend.position  = "top",
      plot.background  = element_rect(fill = "#FAF8F3", colour = NA)
    )
}

stime_lunghe |>
  filter(abs(stima - theta) <= lim) |>
  ggplot(aes(stima, colour = stimatore, fill = stimatore)) +
  geom_histogram(aes(y = after_stat(count) / (M * bw)),   # densità rispetto a tutte le M stime
                 binwidth = bw, boundary = theta - lim,
                 alpha = 0.15, position = "identity") +
  geom_line(data = teoria, aes(x, densita), linewidth = 0.9) +
  geom_vline(xintercept = theta, linetype = "dashed") +
  scale_colour_manual(values = colori, aesthetics = c("colour", "fill")) +
  labs(
    title    = "Distribuzione campionaria degli stimatori di posizione",
    subtitle = sprintf("Normale(θ = %g), n = %d, M = %d · area: simulazione, curva: teoria", theta, n, M),
    x = "stima di θ", y = "densità", colour = NULL, fill = NULL
  ) +
  theme_statatlas()

# Quota di stime fuori dalla finestra del grafico
stime_lunghe |>
  group_by(stimatore) |>
  summarise(fuori_scala = mean(abs(stima - theta) > lim))
