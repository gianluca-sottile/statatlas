# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 08 — Intervalli di confidenza: Media normale, σ nota (Z)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi intervalli di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 100; B <- 1000; livello <- 0.95; a <- 1 - livello
vero <- 10   # parametro vero, fisso
sigma <- 2

intervallo <- function(x) {
  z <- qnorm(1 - a / 2)
  mean(x) + c(-1, 1) * z * sigma / sqrt(n)
}

# Un nuovo campione e un nuovo intervallo per ogni replica
sim <- tibble(replica = seq_len(B)) |>
  mutate(ci = map(replica, \(r) intervallo(rnorm(n, mean = 10, sd = 2))),
         basso = map_dbl(ci, 1), alto = map_dbl(ci, 2),
         copre = basso <= vero & vero <= alto)

sim |> summarise(copertura = mean(copre), ampiezza_media = mean(alto - basso),
                 errore_mc = sqrt(copertura * (1 - copertura) / B))

# Gli ultimi 40 intervalli
theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
sim |>
  slice_tail(n = 40) |>
  ggplot(aes(y = replica, xmin = basso, xmax = alto, colour = copre)) +
  geom_linerange(linewidth = 0.8) +
  geom_vline(xintercept = vero, linetype = "dashed") +
  scale_colour_manual(values = c(`TRUE` = "#0072B2", `FALSE` = "#D55E00"), labels = c(`TRUE` = "copre", `FALSE` = "non copre")) +
  labs(title = "Media normale, σ nota (Z)", subtitle = sprintf("n = %d, livello %.0f%%", n, 100 * livello), x = "μ", y = "replica", colour = NULL) +
  theme_statatlas()
