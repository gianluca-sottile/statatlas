# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 15 — Lasso: lo spazio delle soluzioni in due dimensioni
# ───────────────────────────────────────────────────────────────
library(tidyverse)

bh <- c(1.8, 0.4)   # stima dei minimi quadrati
r  <- 0.5; a <- 1; t <- 1
Sigma <- matrix(c(1, r, r, 1), 2)

# Q(b) = ½ (b − bh)ᵀ Σ (b − bh); vincolo a‖b‖₁ + (1 − a)‖b‖₂² ≤ a t + (1 − a) t²
Q <- function(b) 0.5 * drop(t(b - bh) %*% Sigma %*% (b - bh))
g <- function(b) a * sum(abs(b)) + (1 - a) * sum(b^2)
soglia <- function(z, l) sign(z) * pmax(abs(z) - l, 0)
pen_lambda <- function(lam) {   # discesa coordinata, come in StatAtlas
  c0 <- drop(Sigma %*% bh); b <- bh
  for (it in 1:500) { b_old <- b
    b[1] <- soglia(c0[1] - r * b[2], lam * a) / (1 + 2 * lam * (1 - a))
    b[2] <- soglia(c0[2] - r * b[1], lam * a) / (1 + 2 * lam * (1 - a))
    if (sum(abs(b - b_old)) < 1e-12) break }
  b
}
s <- a * t + (1 - a) * t^2
lam <- if (g(bh) <= s) 0 else uniroot(\(l) g(pen_lambda(l)) - s, c(0, 1e4), tol = 1e-12)$root
b_star <- pen_lambda(lam); b_star

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
griglia <- expand_grid(b1 = seq(-2.5, 2.5, length.out = 201), b2 = seq(-2.5, 2.5, length.out = 201)) |>
  mutate(rss = map2_dbl(b1, b2, \(x, y) Q(c(x, y))), dentro = map2_lgl(b1, b2, \(x, y) g(c(x, y)) <= s))
ggplot(griglia, aes(b1, b2)) +
  geom_raster(aes(fill = dentro), alpha = 0.25, show.legend = FALSE) +
  geom_contour(aes(z = rss), breaks = Q(b_star) * c(0.15, 0.5, 1, 1.5, 3), colour = "grey40") +
  annotate("point", x = bh[1], y = bh[2], shape = 17, size = 3, colour = "#D55E00") +
  annotate("point", x = b_star[1], y = b_star[2], size = 3, colour = "#9A3412") +
  scale_fill_manual(values = c(`FALSE` = NA, `TRUE` = "#0072B2")) +
  coord_equal() + labs(x = expression(beta[1]), y = expression(beta[2]), title = "Lasso") +
  theme_statatlas()
