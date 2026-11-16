# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 11 — Regressione L1, L2 e Lp
# Errori: Normali · con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 30; M <- 1000; sigma <- 1; p <- 1.5; b0 <- 1; b1 <- 0.5
x <- (seq_len(n) - 0.5) / n * 10
errori <- function(n) rnorm(n)

# Regressione Lp per minimi quadrati ponderati iterativi (IRLS) (stesso algoritmo di StatAtlas)
fit_lp <- function(x, y, p, maxit = 500) {
  w <- rep(1, length(x))
  wls <- function(w) { coef(lm(y ~ x, weights = w)) }
  b <- wls(w)
  if (p == 2) return(b)
  for (i in seq_len(maxit)) {
    w <- pmax(abs(y - b[1] - b[2] * x), 1e-6)^(p - 2)
    b_new <- wls(w)
    if (sum(abs(b_new - b)) < 1e-10) { b <- b_new; break }
    b <- b_new
  }
  b
}
# Per L1 esiste anche l’algoritmo esatto: quantreg::rq(y ~ x, tau = 0.5)

sim <- tibble(replica = seq_len(M)) |>
  mutate(y  = map(replica, \(r) b0 + b1 * x + sigma * errori(n)),
         L2 = map_dbl(y, \(y) fit_lp(x, y, 2)[2]),
         L1 = map_dbl(y, \(y) fit_lp(x, y, 1)[2]),
         Lp = map_dbl(y, \(y) fit_lp(x, y, p)[2]))

stime <- sim |> dplyr::select(L2, L1, Lp) |> pivot_longer(everything(), names_to = "metodo", values_to = "pendenza")
stime |> group_by(metodo) |>
  summarise(media = mean(pendenza), dev_std = sd(pendenza), iqr = IQR(pendenza), mse = mean((pendenza - b1)^2))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

ggplot(stime, aes(pendenza, colour = metodo, fill = metodo)) +
  geom_density(alpha = 0.1) +
  geom_vline(xintercept = b1, linetype = "dashed") +
  scale_colour_manual(values = c(L2 = "#0072B2", L1 = "#D55E00", Lp = "#009E73"), aesthetics = c("colour", "fill")) +
  coord_cartesian(xlim = b1 + c(-1, 1) * 0.3966) +
  labs(title = "Pendenze stimate con tre criteri", x = "pendenza", y = "densità") +
  theme_statatlas()
