# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 07 — Verosimiglianza: Normale: media μ (σ = 1 nota)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
theta <- 0.5; n <- 20; B <- 1000

# Log-verosimiglianza, score, informazione osservata e stima ML (t = parametro)
loglik <- function(t, x) -0.5 * sum((x - t)^2)
score  <- function(t, x) sum(x - t)
J      <- function(t, x) length(x)
mle    <- function(x) mean(x)

sim <- tibble(replica = seq_len(B)) |>
  mutate(x = map(replica, \(r) rnorm(n, mean = theta, sd = 1)),
         stima = map_dbl(x, mle),
         U     = map_dbl(x, \(x) score(theta, x)),
         Jt    = map_dbl(x, \(x) J(theta, x)),
         wald  = map2_lgl(x, stima, \(x, s) abs(s - theta) <= 1.96 / sqrt(J(s, x))))

# Identità di Bartlett: E[U] = 0, Var[U] = E[J] = n I(theta)
sim |> summarise(media_U = mean(U), var_U = var(U), media_J = mean(Jt),
                 media_stima = mean(stima), var_stima = var(stima), copertura_wald = mean(wald))
c(n_I = 20, cramer_rao = 0.05)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Log-verosimiglianza relativa del primo campione
x1 <- sim$x[[1]]; s1 <- mle(x1)
tibble(t = seq(s1 - 4 / sqrt(n * 1), s1 + 4 / sqrt(n * 1), length.out = 400)) |>
  mutate(rel = map_dbl(t, \(t) loglik(t, x1)) - loglik(s1, x1),
         quad = -0.5 * J(s1, x1) * (t - s1)^2) |>
  ggplot(aes(t)) +
  geom_hline(yintercept = -qchisq(0.95, 1) / 2, linetype = "dashed", colour = "#009E73") +
  geom_line(aes(y = quad), linetype = "dashed", colour = "#D55E00") +
  geom_line(aes(y = rel), colour = "#0072B2", linewidth = 1) +
  geom_vline(xintercept = theta, linetype = "dotted") +
  coord_cartesian(ylim = c(-6, 0.3)) +
  labs(x = "μ", y = "loglik relativa", title = "Normale: media μ (σ = 1 nota)") +
  theme_statatlas()

# Distribuzione campionaria della stima con la normale asintotica
ggplot(sim, aes(stima)) +
  geom_histogram(aes(y = after_stat(density)), bins = 40, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = theta, sd = 1 / sqrt(n * 1)), linetype = "dashed", colour = "#D55E00", linewidth = 1) +
  geom_vline(xintercept = theta, linetype = "dotted") +
  labs(x = expression(hat(theta)), y = "densità") +
  theme_statatlas()
