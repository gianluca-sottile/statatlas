# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 12 — GLM: Binomiale, legame logit (regressione logistica)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi campioni di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 40; M <- 1000; b0 <- -0.5; b1 <- 1.2
x <- -2 + 4 * (seq_len(n) - 0.5) / n

# Un campione, un adattamento: stima, errore standard, convergenza
adatta <- function() {
  y <- qbinom(runif(n), size = 1, prob = plogis(b0 + b1 * x))
  fit <- suppressWarnings(glm(y ~ x, family = binomial))
  s <- summary(fit)$coefficients
  # stime enormi = separazione (logistica) o stima non finita
  tibble(b1_hat = s[2, 1], se = s[2, 2], finita = fit$converged & abs(s[2, 1]) < 30)
}
sim <- map(seq_len(M), \(m) adatta()) |> list_rbind()

sim |> summarise(separazione = mean(!finita))
sim |> filter(finita) |>
  summarise(media = mean(b1_hat), dev_std = sd(b1_hat), copertura_wald = mean(abs(b1_hat - b1) <= 1.96 * se))

# Deviazione standard asintotica dall’informazione di Fisher nel vero β
mu <- plogis(b0 + b1 * x); w <- mu * (1 - mu)
X <- cbind(1, x)
sqrt(solve(t(X) %*% (w * X))[2, 2])

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

sim |> filter(finita) |>
  ggplot(aes(b1_hat)) +
  geom_histogram(aes(y = after_stat(density)), bins = 40, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = b1, sd = sqrt(solve(t(X) %*% (w * X))[2, 2])), linetype = "dashed", colour = "#D55E00", linewidth = 1) +
  geom_vline(xintercept = b1, linetype = "dotted") +
  labs(title = "Distribuzione della pendenza stimata", x = expression(hat(beta)[1]), y = "densità") +
  theme_statatlas()
