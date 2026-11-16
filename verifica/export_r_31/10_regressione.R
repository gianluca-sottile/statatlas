# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 10 — Regressione lineare: bande, influenza, copertura
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 12; b0 <- 2; b1 <- 0.8; sigma <- 1.5; x0 <- 8; B <- 1000
x <- (seq_len(n) - 0.5) / n * 10          # disegno fisso in [0, 10]
errori <- function(n) rnorm(n)   # errori normali

# Una replica: nuove risposte agli stessi x, poi una nuova osservazione in x0
replica <- function() {
  y  <- b0 + b1 * x + sigma * errori(n)
  y0 <- b0 + b1 * x0 + sigma * errori(1)
  fit <- lm(y ~ x)
  ci <- predict(fit, tibble(x = x0), interval = "confidence")
  pi <- predict(fit, tibble(x = x0), interval = "prediction")
  tibble(pendenza = coef(fit)[2],
         copre_media = ci[2] <= b0 + b1 * x0 & b0 + b1 * x0 <= ci[3],
         copre_y0    = pi[2] <= y0 & y0 <= pi[3])
}
sim <- map(seq_len(B), \(b) replica()) |> list_rbind()

sim |> summarise(media_pendenza = mean(pendenza), sd_pendenza = sd(pendenza),
                 copertura_media = mean(copre_media), copertura_previsione = mean(copre_y0))
c(sd_teorica = sigma / sqrt(sum((x - mean(x))^2)))

# Diagnostiche di un campione: leva e distanza di Cook
set.seed(2026)
y <- b0 + b1 * x + sigma * errori(n)
fit <- lm(y ~ x)
tibble(x, y, leva = hatvalues(fit), cook = cooks.distance(fit), res_std = rstandard(fit)) |> arrange(desc(cook)) |> head()

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

griglia <- tibble(x = seq(-0.5, 10.5, length.out = 200))
bande <- bind_cols(griglia,
  as_tibble(predict(fit, griglia, interval = "confidence")) |> rename(ci_lo = lwr, ci_hi = upr),
  as_tibble(predict(fit, griglia, interval = "prediction")) |> dplyr::select(pi_lo = lwr, pi_hi = upr))
ggplot(bande, aes(x)) +
  geom_ribbon(aes(ymin = pi_lo, ymax = pi_hi), fill = "#009E73", alpha = 0.12) +
  geom_ribbon(aes(ymin = ci_lo, ymax = ci_hi), fill = "#0072B2", alpha = 0.25) +
  geom_line(aes(y = fit), colour = "#0072B2", linewidth = 1) +
  geom_abline(intercept = b0, slope = b1, linetype = "dotted") +
  geom_point(data = tibble(x, y), aes(x, y), size = 2) +
  labs(title = "Retta dei minimi quadrati", subtitle = "Scura: E(Y | x) al 95% · chiara: previsione al 95%", y = "y") +
  theme_statatlas()
