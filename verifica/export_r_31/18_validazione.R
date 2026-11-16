# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 18 — Validazione e overfitting
# R0: stessi dati, stessa suddivisione training/test e stessi fold di StatAtlas (R ≥ 3.6, stesso seed).
# R1: stesse metriche (errore di training, CV, test, Err su 200 punti); poly() e i polinomi
#     di Legendre generano lo stesso spazio, quindi le stesse previsioni a meno dell’arrotondamento.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
f <- function(x) sin(2 * pi * x)
n <- 60; n_test <- 18; K <- 5; sigma <- 0.3; D <- 12; B <- 200
griglia <- tibble(x = (seq_len(200) - 0.5) / 200)

adatta <- function(d, dati) if (d == 0) lm(y ~ 1, data = dati) else lm(y ~ poly(x, d), data = dati)
errore <- function(fit, dati) mean((dati$y - predict(fit, newdata = dati))^2)

una_replica <- function() {
  x <- runif(n); y <- f(x) + sigma * rnorm(n)
  dati <- tibble(x, y)
  id_test <- sample(n, n_test)                       # il test si mette da parte subito
  train <- dati[-id_test, ]; test <- dati[id_test, ]
  fold <- sample(rep_len(1:K, nrow(train)))           # fold generati una volta, per tutti i gradi
  curve <- map_dfr(0:D, \(d) {
    fuori <- numeric(nrow(train))
    for (k in 1:K) fuori[fold == k] <- predict(adatta(d, train[fold != k, ]), newdata = train[fold == k, ])
    fit <- adatta(d, train)
    tibble(d = d, training = errore(fit, train), cv = mean((train$y - fuori)^2), test = errore(fit, test),
           err = sigma^2 + mean((f(griglia$x) - predict(fit, newdata = griglia))^2))
  })
  d_cv <- curve$d[which.min(curve$cv)]; d_test <- curve$d[which.min(curve$test)]
  list(curve = curve, sintesi = tibble(d_cv, d_test,
    corretto = curve$test[d_cv + 1] - curve$err[d_cv + 1],      # scelta con CV, test usato una volta
    scorretto = curve$test[d_test + 1] - curve$err[d_test + 1], # scelta e stima sul test
    training = curve$training[d_cv + 1] - curve$err[d_cv + 1]))
}

repliche <- map(seq_len(B), \(b) una_replica())
sintesi <- map_dfr(repliche, "sintesi")
sintesi |> summarise(across(c(corretto, scorretto, training), list(media = mean, es = \(v) sd(v) / sqrt(B))))
count(sintesi, d_cv)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
# Curve medie sulle repliche
map_dfr(repliche, "curve") |> group_by(d) |> summarise(across(everything(), mean)) |>
  pivot_longer(-d, names_to = "errore", values_to = "valore") |>
  ggplot(aes(d, valore, colour = errore)) + geom_line(linewidth = 1) + geom_point() +
  geom_hline(yintercept = sigma^2, linetype = "dotted") + coord_cartesian(ylim = c(0, NA)) +
  labs(x = "grado del polinomio", y = "errore quadratico medio") + theme_statatlas()

# Replica numero 1 (quella mostrata)
repliche[[1]]$curve
