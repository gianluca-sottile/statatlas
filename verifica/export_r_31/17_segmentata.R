# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 17 — Regressione segmentata e breakpoint
# R0: stessi dati di StatAtlas con R ≥ 4.1 e lo stesso seed.
# R2: stessa ricerca su griglia (200 candidati, minimo con il ψ più piccolo a parità).
# R3: segmented::segmented() usa un algoritmo diverso (Muggeo, 2003): confronto di metodo, non stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 80; b0 <- 1; b1 <- 0.5; delta <- 1.2; psi <- 6; sigma <- 1; B <- 300
x <- 10 * (seq_len(n) - 0.5) / n
media <- b0 + b1 * x + delta * pmax(0, x - psi)
errori <- function(n) rnorm(n)
genera <- function() media + sigma * errori(n)

# Griglia dei candidati: almeno m osservazioni da ciascun lato
m <- max(3, ceiling(0.05 * n))
griglia <- seq(x[m], x[n - m + 1], length.out = 200)
profilo <- function(y) sapply(griglia, \(p) sum(lm.fit(cbind(1, x, pmax(0, x - p)), y)$residuals^2))

# Campioni ripetuti: stima di psi in ciascuno
stime <- map_dbl(seq_len(B), \(b) griglia[which.min(profilo(genera()))])
tibble(media = mean(stime), distorsione = mean(stime) - psi, rmse = sqrt(mean((stime - psi)^2)),
       bordo = mean(stime %in% range(griglia)))

# Campione numero 1 (quello mostrato) e test bootstrap sotto H0: delta = 0
set.seed(2026)
for (r in seq_len(1)) y <- genera()
rss <- profilo(y); psi_hat <- griglia[which.min(rss)]
fit_lin <- lm(y ~ x)
T_oss <- n * log(sum(resid(fit_lin)^2) / min(rss))
s <- sqrt(sum(resid(fit_lin)^2) / (n - 2))
T_boot <- map_dbl(seq_len(199), \(b) {
  yb <- fitted(fit_lin) + s * rnorm(n)
  n * log(sum(lm.fit(cbind(1, x), yb)$residuals^2) / min(profilo(yb)))
})
c(psi_hat = psi_hat, T = T_oss, p_bootstrap = (1 + sum(T_boot >= T_oss)) / (199 + 1))

# Confronto di metodo (R3): pacchetto segmented
# install.packages("segmented")
library(segmented)
fit_seg <- segmented(fit_lin, seg.Z = ~x, psi = psi_hat)
summary(fit_seg)
davies.test(fit_lin, seg.Z = ~x)   # test di esistenza con psi ignoto

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
tibble(psi = griglia, devianza = n * log(rss / min(rss))) |>
  ggplot(aes(psi, devianza)) + geom_line(colour = "#9A3412", linewidth = 1) +
  geom_hline(yintercept = qchisq(0.95, 1), linetype = "dashed") +
  labs(title = "Profilo RSS(psi)", y = "n log(RSS(psi) / RSS min)") + theme_statatlas()
