# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 14 — Regressione quantilica
# Errori: Normali · stessi campioni di StatAtlas con R ≥ 4.1
# ───────────────────────────────────────────────────────────────
library(tidyverse)
library(quantreg)   # install.packages("quantreg")

set.seed(2026)
n <- 50; M <- 500; tau <- 0.5
b0 <- 2; b1 <- 0.6; s0 <- 0.3; s1 <- 0.25   # y = b0 + b1 x + (s0 + s1 x) e
x <- 10 * (seq_len(n) - 0.5) / n
errori <- function(n) rnorm(n)

# Pendenza vera del quantile tau: b1 + s1 * q_tau(e)
pendenza_vera <- b1 + s1 * qnorm(tau)

# Primo campione e rette per cinque quantili
dati <- tibble(x = x, y = b0 + b1 * x + (s0 + s1 * x) * errori(n))
taus <- c(0.1, 0.25, 0.5, 0.75, 0.9)
fit <- rq(y ~ x, tau = taus, data = dati)
coef(fit)

# Quota di punti sotto ciascuna retta (≈ tau)
colMeans(dati$y < fitted(fit))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
rette <- tibble(tau = factor(taus), intercetta = coef(fit)[1, ], pendenza = coef(fit)[2, ])
ggplot(dati, aes(x, y)) +
  geom_point(alpha = 0.6) +
  geom_abline(data = rette, aes(intercept = intercetta, slope = pendenza, colour = tau), linewidth = 0.9) +
  geom_smooth(method = "lm", se = FALSE, colour = "#0072B2", linetype = "dashed") +
  scale_colour_viridis_d(end = 0.85) +
  labs(title = "Rette quantiliche e retta dei minimi quadrati", colour = expression(tau)) +
  theme_statatlas()

# Campioni ripetuti: distribuzione della pendenza quantilica (il primo campione è già stato generato)
set.seed(2026)
sim <- map(seq_len(M), \(m) {
  y <- b0 + b1 * x + (s0 + s1 * x) * errori(n)
  tibble(quantilica = coef(rq(y ~ x, tau = tau))[2], minimi_quadrati = coef(lm(y ~ x))[2])
}) |> list_rbind()
sim |> summarise(across(everything(), list(media = mean, dev_std = sd)))
pendenza_vera
