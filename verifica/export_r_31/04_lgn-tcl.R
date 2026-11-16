# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 04 — Legge dei grandi numeri
# Popolazione: Normale N(0, 1) · seed = 2026
# Stesso generatore e stesso ordine di estrazione di StatAtlas:
# con R ≥ 4.1 si ottengono gli stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

set.seed(2026)
mu    <- 0   # valore atteso della popolazione
sigma <- sqrt(1)
K <- 4      # traiettorie
N <- 1000   # osservazioni per traiettoria

# Matrice K × N riempita per colonne: al passo k ogni traiettoria riceve
# una nuova osservazione, nello stesso ordine usato da StatAtlas.
x <- matrix(rnorm(K * N), nrow = K)

traiettorie <- tibble(
  traiettoria = factor(rep(seq_len(K), times = N)),
  n           = rep(seq_len(N), each = K),
  x           = as.vector(x)
) |>
  group_by(traiettoria) |>
  mutate(media = cummean(x)) |>
  ungroup()

# Valore finale di ciascuna traiettoria
traiettorie |> filter(n == N) |> dplyr::select(traiettoria, media)

banda <- tibble(n = seq_len(N), basso = mu - 1.96 * sigma / sqrt(n), alto = mu + 1.96 * sigma / sqrt(n))

ggplot(traiettorie, aes(n, media, colour = traiettoria)) +
  geom_ribbon(data = banda, aes(n, ymin = basso, ymax = alto), inherit.aes = FALSE, fill = "grey60", alpha = 0.15) +
  geom_hline(yintercept = mu, linetype = "dashed") +
  geom_line(linewidth = 0.6) +
  coord_cartesian(ylim = mu + c(-2.2, 2.2) * sigma) +
  scale_colour_manual(values = c("#0072B2", "#D55E00", "#009E73", "#CC79A7")) +
  labs(title = "Legge dei grandi numeri: Normale N(0, 1)",
       x = "n", y = expression(bar(x)[n]), colour = "traiettoria") +
  theme_statatlas()
