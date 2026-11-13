# ═══════════════════════════════════════════════════════════════════════════════
# StatAtlas · verifica numerica degli script R dei laboratori 01–16 (generato il 2026-11-13)
#
# Complementa verifica_statatlas.R: oltre a eseguire gli script, confronta medie, varianze, coperture,
# stime e autocorrelazioni con i valori che il browser mostra dopo «Completa» (stessi seed e parametri predefiniti).
# Uso:   Rscript verifica_statatlas_01_16.R     oppure   source("verifica_statatlas_01_16.R")
# Serve: R ≥ 4.1, tidyverse, quantreg, glmnet. Tempo: circa un minuto.
# ═══════════════════════════════════════════════════════════════════════════════
stopifnot(getRversion() >= "4.1.0")
RNGkind("Mersenne-Twister", "Inversion", "Rejection")
suppressPackageStartupMessages(library(tidyverse))
.verifica <- data.frame(lab = character(), controllo = character(), esito = character(), dettaglio = character())
registra <- function(lab, controllo, ok, dettaglio = "") {
  .verifica[nrow(.verifica) + 1, ] <<- list(lab, controllo, if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", dettaglio)
  cat(sprintf("  %-8s %-62s %s\n", if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", controllo, dettaglio))
}
confronta <- function(lab, controllo, ottenuto, atteso, tol) {
  ottenuto <- unname(as.numeric(ottenuto))
  ok <- length(ottenuto) == length(atteso) && all(is.finite(ottenuto)) && all(abs(ottenuto - atteso) <= tol)
  registra(lab, controllo, ok, sprintf("R = %s · browser = %s", paste(signif(ottenuto, 6), collapse = " "), paste(atteso, collapse = " ")))
}
esegui <- function(id, pkg = NULL) {
  cat("\n── ", id, " ──────────────────────────────────────────────\n", sep = "")
  if (!is.null(pkg) && !requireNamespace(pkg, quietly = TRUE)) { registra(id, paste("manca il pacchetto", pkg), NA); return(NULL) }
  env <- new.env(parent = globalenv()); grDevices::pdf(NULL)
  err <- tryCatch({ eval(parse(text = script[[id]]), envir = env); NULL }, error = function(e) conditionMessage(e))
  grDevices::dev.off()
  registra(id, "lo script si esegue senza errori", is.null(err), if (is.null(err)) "" else err)
  if (is.null(err)) env else NULL
}
script <- list(
  `distribuzioni` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 01 — Normale(mean = 0, sd = 1)
# Osservazioni generate per inversione, X = F⁻¹(U) con U ~ U(0, 1):
# con lo stesso seed R e StatAtlas producono gli stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 1000
a <- -0.68; b <- 0.68   # intervallo (a, b]

x <- qnorm(runif(N), mean = 0, sd = 1)   # stessa legge di rnorm()

# Teoria vs simulazione ---------------------------------------------
tibble(
  quantita    = c("E(X)", "Var(X)", "mediana", "P(a < X <= b)"),
  teoria      = c(0, 1, qnorm(0.5, mean = 0, sd = 1),
                  pnorm(b, mean = 0, sd = 1) - pnorm(a, mean = 0, sd = 1)),
  simulazione = c(mean(x), var(x), median(x), mean(x > a & x <= b))
)

# Distanza dalla ripartizione teorica e banda DKW al 95% ------------
D <- ks.test(x, "pnorm", mean = 0, sd = 1)$statistic
c(D = unname(D), raggio_DKW = sqrt(log(2 / 0.05) / (2 * N)))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Istogramma vs densità teorica ------------------------------------
lo <- -4; hi <- 4; bw <- (hi - lo) / 40
tibble(x = x) |>
  filter(x >= lo, x <= hi) |>
  ggplot(aes(x)) +
  annotate("rect", xmin = a, xmax = b, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.07) +
  geom_histogram(aes(y = after_stat(count) / (N * bw)), binwidth = bw, boundary = lo,
                 fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(lo, hi)) +
  labs(title = "Normale(mean = 0, sd = 1)",
       subtitle = "Istogramma: simulazione · curva: densità teorica",
       x = "x", y = "densità") +
  theme_statatlas()

# Ripartizione empirica vs teorica -----------------------------------
tibble(x = x) |>
  ggplot(aes(x)) +
  stat_ecdf(colour = "#0072B2", linetype = "dashed") +
  stat_function(fun = pnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(-4, 4)) +
  labs(x = "x", y = "F(x)", title = "Funzione di ripartizione: empirica (tratteggio) e teorica") +
  theme_statatlas()

]---",
  `bivariata` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 02 — Normale bivariata standard con correlazione ρ
# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse coppie di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 2000; rho <- 0.6; x0 <- 1; h <- 0.25

# Due normali standard per coppia, nell’ordine z1, z2 (riempimento per righe)
z <- matrix(rnorm(2 * N), ncol = 2, byrow = TRUE)
z1 <- z[, 1]; z2 <- z[, 2]
coppie <- tibble(x = z1, y = rho * z1 + sqrt(1 - rho^2) * z2)

# Correlazioni: lineare e con X²
coppie |> summarise(r = cor(x, y), r_x2 = cor(x^2, y))

# Distribuzione condizionata approssimata: punti con |x − x0| ≤ h
striscia <- coppie |> filter(abs(x - x0) <= h)
striscia |> summarise(n = n(), media = mean(y), dev_std = sd(y))
# Teoria: E(Y | X = x0) = 0.6, sd = 0.8

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

ggplot(coppie, aes(x, y)) +
  annotate("rect", xmin = x0 - h, xmax = x0 + h, ymin = -Inf, ymax = Inf, fill = "#9A3412", alpha = 0.1) +
  geom_point(alpha = 0.35, size = 0.8, colour = "#0072B2") +
  geom_function(fun = \(x) rho * x, linetype = "dashed", linewidth = 0.9) +
  geom_density_2d(colour = "grey30", linewidth = 0.3) +
  labs(title = "Normale bivariata standard con correlazione ρ", subtitle = "Linea tratteggiata: E(Y | X = x)") +
  theme_statatlas()

ggplot(striscia, aes(y)) +
  geom_histogram(aes(y = after_stat(density)), bins = 25, fill = "#9A3412", alpha = 0.25, colour = "#9A3412") +
  stat_function(fun = dnorm, args = list(mean = 0.6, sd = 0.8), linewidth = 1) +
  labs(title = "Y condizionata a X vicino a x0", x = "y", y = "densità") +
  theme_statatlas()

]---",
  `simulazione` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 03 — Metodo di inversione
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi numeri di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

set.seed(2026)
N <- 1000

# 1. Uniformi, poi inversione della ripartizione
sim <- tibble(u = runif(N)) |>
  mutate(x = qnorm(u, mean = 0, sd = 1))

# 2. Controllo: momenti empirici e teorici
sim |> summarise(media = mean(x), varianza = var(x))

# 3. Istogramma vs densità teorica
ggplot(sim, aes(x)) +
  geom_histogram(aes(y = after_stat(density)), bins = 36, fill = "#0072B2", alpha = 0.25, colour = "#0072B2") +
  stat_function(fun = dnorm, args = list(mean = 0, sd = 1), linewidth = 1, n = 400) +
  coord_cartesian(xlim = c(-4, 4)) +
  labs(title = "Inversione: x = F^{-1}(u)", subtitle = "Normale(mean = 0, sd = 1)", x = "x", y = NULL) +
  theme_statatlas()

# 4. Il percorso dell’inversione per le prime 20 estrazioni
ggplot(slice_head(sim, n = 20)) +
  stat_function(fun = pnorm, args = list(mean = 0, sd = 1), n = 400,
                xlim = c(-4, 4)) +
  geom_segment(aes(x = -4, xend = x, y = u, yend = u), colour = "#0072B2", alpha = 0.5) +
  geom_segment(aes(x = x, xend = x, y = u, yend = 0), colour = "#0072B2", alpha = 0.5) +
  labs(x = "x", y = "u = F(x)") +
  theme_statatlas()

]---",
  `lgn-tcl` = r"---[
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

]---",
  `adattamento` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 05 — Adattamento: dati Normale(0, 1), modello Normale (μ, σ stimati)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
N <- 200
x <- qnorm(runif(N), mean = 0, sd = 1)

# Stima ML del modello ipotizzato
fit <- function(x) list(mean = mean(x), sd = sqrt(mean((x - mean(x))^2)))
par <- fit(x); par

# Classi con frequenza attesa ≥ 5 e statistica X² di Pearson
chi2 <- function(x, par) {
  K <- max(3, min(20, floor(length(x) / 5)))
  br <- c(-Inf, do.call(qnorm, c(list((1:(K - 1)) / K), par)), Inf)
  o <- table(cut(x, br))
  e <- length(x) / K
  sum((o - e)^2 / e)
}
K <- max(3, min(20, floor(N / 5)))
X2 <- as.numeric(chi2(x, par))
gdl <- K - 1 - 2
c(X2 = X2, gdl = gdl, p_asintotico = pchisq(X2, gdl, lower.tail = FALSE))

# p-value Monte Carlo (bootstrap parametrico, 199 repliche): stessa sequenza di StatAtlas
X2_b <- map_dbl(seq_len(199), \(b) {
  xb <- do.call(qnorm, c(list(runif(N)), par))
  as.numeric(chi2(xb, fit(xb)))
})
(1 + sum(X2_b >= X2)) / (199 + 1)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Grafico quantile-quantile rispetto al modello stimato
tibble(x = sort(x), q = do.call(qnorm, c(list(ppoints(N, a = 0.5)), par))) |>
  ggplot(aes(q, x)) +
  geom_abline(linetype = "dashed", colour = "#D55E00") +
  geom_point(colour = "#0072B2", alpha = 0.7) +
  labs(x = "quantili del modello stimato", y = "quantili osservati", title = "QQ plot: Normale (μ, σ stimati)") +
  theme_statatlas()

]---",
  `stimatori` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 06 — Media, mediana e massima verosimiglianza
# Modello: N(θ = 0, 1) · n = 20 · M = 1000 · seed = 2026
# Con R ≥ 4.1 e il generatore predefinito (Mersenne-Twister,
# normal.kind = "Inversion") i campioni coincidono con quelli di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

# Parametri -------------------------------------------------------
theta <- 0        # vero parametro di posizione
n     <- 20       # numerosità di ogni campione
M     <- 1000     # numero di campioni (repliche)
set.seed(2026)

# Modello generatore ----------------------------------------------
genera <- function(n) rnorm(n, mean = theta, sd = 1)
# Nel modello Normale lo stimatore di massima verosimiglianza coincide con la media.

# 1. Simulazione: M campioni generati uno dopo l’altro ------------
sim <- tibble(replica = seq_len(M)) |>
  mutate(campione = map(replica, \(r) genera(n)))

stime <- sim |>
  transmute(
    replica,
    media   = map_dbl(campione, mean),
    mediana = map_dbl(campione, median)
  )

# 2. Teoria vs simulazione ----------------------------------------
stime_lunghe <- stime |>
  pivot_longer(-replica, names_to = "stimatore", values_to = "stima")

stime_lunghe |>
  group_by(stimatore) |>
  summarise(
    centro  = median(stima),          # teoria: θ (per simmetria)
    dev_std = sd(stima),
    iqr     = IQR(stima),
    mse     = mean((stima - theta)^2)
  )
# Dev. std teoriche: media 0.2236, mediana 0.2802

# 3. Grafico: distribuzioni campionarie ---------------------------
lim <- 1.2611   # finestra [θ − lim, θ + lim]
bw  <- 2 * lim / 48
colori <- c(media = "#0072B2", mediana = "#D55E00")

teoria <- tibble(x = seq(theta - lim, theta + lim, length.out = 400)) |>
  mutate(
    media   = dnorm(x, theta, sqrt(1 / n)),
    mediana = dnorm(x, theta, sqrt(pi / (2 * n)))
  ) |>
  pivot_longer(-x, names_to = "stimatore", values_to = "densita")

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(
      plot.title       = element_text(face = "bold"),
      plot.subtitle    = element_text(colour = "grey35"),
      panel.grid.minor = element_blank(),
      legend.position  = "top",
      plot.background  = element_rect(fill = "#FAF8F3", colour = NA)
    )
}

stime_lunghe |>
  filter(abs(stima - theta) <= lim) |>
  ggplot(aes(stima, colour = stimatore, fill = stimatore)) +
  geom_histogram(aes(y = after_stat(count) / (M * bw)),   # densità rispetto a tutte le M stime
                 binwidth = bw, boundary = theta - lim,
                 alpha = 0.15, position = "identity") +
  geom_line(data = teoria, aes(x, densita), linewidth = 0.9) +
  geom_vline(xintercept = theta, linetype = "dashed") +
  scale_colour_manual(values = colori, aesthetics = c("colour", "fill")) +
  labs(
    title    = "Distribuzione campionaria degli stimatori di posizione",
    subtitle = sprintf("Normale(θ = %g), n = %d, M = %d · area: simulazione, curva: teoria", theta, n, M),
    x = "stima di θ", y = "densità", colour = NULL, fill = NULL
  ) +
  theme_statatlas()

# Quota di stime fuori dalla finestra del grafico
stime_lunghe |>
  group_by(stimatore) |>
  summarise(fuori_scala = mean(abs(stima - theta) > lim))

]---",
  `fisher` = r"---[
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

]---",
  `intervalli` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 08 — Intervalli di confidenza: Media normale, σ nota (Z)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi intervalli di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 20; B <- 1000; livello <- 0.95; a <- 1 - livello
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

]---",
  `test` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 09 — Test Z bilaterale: livello e potenza
# Con R ≥ 4.1 e lo stesso seed si ottengono le stesse statistiche di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 20; B <- 1000; alpha <- 0.05; delta <- 0.5   # effetto in unità di σ (σ = 1, μ₀ = 0)
z_crit <- qnorm(1 - alpha / 2)
rifiuta <- function(z) abs(z) > z_crit

# Per ogni replica: un campione sotto H0, poi uno sotto H1 (stesso ordine di StatAtlas)
sim <- tibble(replica = seq_len(B)) |>
  mutate(z = map(replica, \(r) c(z0 = sqrt(n) * mean(rnorm(n, 0, 1)),
                                 z1 = sqrt(n) * mean(rnorm(n, delta, 1))))) |>
  unnest_wider(z)

potenza_teorica <- function(d, n) pnorm(-z_crit + d * sqrt(n)) + pnorm(-z_crit - d * sqrt(n))
sim |> summarise(errore_I = mean(rifiuta(z0)), potenza = mean(rifiuta(z1))) |>
  mutate(alpha = alpha, potenza_teorica = potenza_teorica(delta, n))

# n per potenza 80% (approssimato: trascura la coda opposta)
ceiling(((z_crit + qnorm(0.8)) / delta)^2)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

# Curve di potenza per n/2, n, 2n
expand_grid(d = seq(0, 1.5, by = 0.01), n_ = c(max(2, round(n / 2)), n, 2 * n)) |>
  mutate(potenza = potenza_teorica(d, n_), n_ = factor(n_)) |>
  ggplot(aes(d, potenza, colour = n_, linetype = n_)) +
  geom_hline(yintercept = c(alpha, 0.8), linetype = "dotted", colour = "grey50") +
  geom_line(linewidth = 0.9) +
  annotate("point", x = delta, y = mean(rifiuta(sim$z1)), shape = 18, size = 4, colour = "#9A3412") +
  scale_colour_manual(values = c("grey55", "#0072B2", "#009E73")) +
  labs(title = "Curva di potenza del test Z", x = expression(delta == (mu - mu[0]) / sigma), y = "potenza", colour = "n", linetype = "n") +
  theme_statatlas()

]---",
  `regressione` = r"---[
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

]---",
  `regressione-lp` = r"---[
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

]---",
  `glm` = r"---[
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

]---",
  `arma` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 13 — ARMA(2, 1): φ₁ = 1.2, φ₂ = -0.6, θ₁ = 0
# Generazione esplicita (non arima.sim) per avere gli stessi numeri di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
phi <- c(1.2, -0.6); theta <- 0; T <- 400; burn <- 200

e <- rnorm(burn + T)
x <- numeric(burn + T)
for (t in seq_along(x)) {
  x1 <- if (t > 1) x[t - 1] else 0; x2 <- if (t > 2) x[t - 2] else 0; e1 <- if (t > 1) e[t - 1] else 0
  x[t] <- phi[1] * x1 + phi[2] * x2 + e[t] + theta * e1
}
x <- x[-seq_len(burn)]   # scarta il burn-in

# Stazionarietà e invertibilità: moduli delle radici (devono superare 1)
Mod(polyroot(c(1, -phi)))
abs(theta) < 1

# ACF e PACF: empiriche e teoriche
confronto <- tibble(ritardo = 1:20,
  acf_emp  = acf(x, lag.max = 20, plot = FALSE)$acf[-1],
  acf_teo  = ARMAacf(ar = phi, ma = theta, lag.max = 20)[-1],
  pacf_emp = pacf(x, lag.max = 20, plot = FALSE)$acf[, 1, 1],
  pacf_teo = ARMAacf(ar = phi, ma = theta, lag.max = 20, pacf = TRUE))
confronto

# Stima di massima verosimiglianza del modello che ha generato i dati
arima(x, order = c(2, 0, 1), include.mean = FALSE)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), legend.position = "top",
          plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}

tibble(t = seq_along(x), x = x) |> ggplot(aes(t, x)) + geom_line(colour = "#0072B2") + theme_statatlas()
confronto |>
  pivot_longer(-ritardo, names_to = c("funzione", "tipo"), names_sep = "_") |>
  ggplot(aes(ritardo, value, colour = tipo)) +
  geom_hline(yintercept = c(-1, 1) * 1.96 / sqrt(T), linetype = "dashed", colour = "grey60") +
  geom_point() + geom_line() + facet_wrap(~ funzione) +
  scale_colour_manual(values = c(emp = "#0072B2", teo = "#D55E00")) +
  labs(y = NULL) + theme_statatlas()

]---",
  `quantilica` = r"---[
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

]---",
  `penalizzata` = r"---[
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

]---",
  `spline` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 16 — Spline di regressione (B-spline cubiche)
# Con R ≥ 4.1 e lo stesso seed si ottengono gli stessi dati di StatAtlas.
# ───────────────────────────────────────────────────────────────
library(tidyverse)
library(splines)

set.seed(2026)
n <- 100; sigma <- 0.3
f <- function(x) sin(2 * pi * x) + 0.5 * x * sin(6 * pi * x)
x <- (seq_len(n) - 0.5) / n
y <- f(x) + sigma * rnorm(n)
griglia <- seq(0, 1, length.out = 201)

# Matrice del lisciatore S (ŷ = S y) per il metodo scelto
basi <- 8; K <- basi - 4
nodi <- c(rep(0, 4), seq_len(K) / (K + 1), rep(1, 4))
X <- splineDesign(nodi, x, ord = 4)
S <- X %*% solve(crossprod(X), t(X))
fit <- lm(y ~ X - 1)

# Gradi di libertà effettivi, distorsione² e varianza (esatti)
c(gdl = sum(diag(S)), distorsione2 = mean((S %*% f(x) - f(x))^2), varianza = sigma^2 * sum(S^2) / n)

# Validazione incrociata leave-one-out in forma chiusa
yhat <- drop(S %*% y)
mean(((y - yhat) / (1 - diag(S)))^2)

# Errore Monte Carlo su 300 campioni (il primo è quello già generato)
set.seed(2026)
ise <- map_dbl(seq_len(300), \(m) { yy <- f(x) + sigma * rnorm(n); mean((S %*% yy - f(x))^2) })
mean(ise)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
tibble(x, y, yhat) |>
  ggplot(aes(x, y)) + geom_point(alpha = 0.5) +
  geom_function(fun = f, linetype = "dashed") +
  geom_line(aes(y = yhat), colour = "#0072B2", linewidth = 1.1) +
  labs(title = "Spline di regressione (B-spline cubiche)", subtitle = sprintf("gradi di libertà effettivi %.1f", sum(diag(S)))) +
  theme_statatlas()

]---"
)

e <- esegui("distribuzioni")
if (!is.null(e)) local({
  confronta("01", "media, varianza, mediana, P(a < X ≤ b) del campione", c(mean(x), var(x), median(x), mean(x > a & x <= b)), c(-0.0176, 0.996, 0.0156, 0.506), 0.00006)
}, envir = e)
e <- esegui("bivariata")
if (!is.null(e)) local({
  confronta("02", "correlazioni ρ(X, Y) e ρ(X², Y)", c(cor(coppie$x, coppie$y), cor(coppie$x^2, coppie$y)), c(0.623, -0.006), 0.0006)
  confronta("02", "media e dev. std di Y nella striscia |x − x₀| ≤ h", c(mean(striscia$y), sd(striscia$y)), c(0.562, 0.77), 0.0006)
}, envir = e)
e <- esegui("simulazione")
if (!is.null(e)) local({
  confronta("03", "media e varianza del campione per inversione", c(mean(sim$x), var(sim$x)), c(-0.0176, 0.996), 0.00006)
  confronta("03", "quota di valori sotto la mediana teorica", mean(sim$x <= qnorm(0.5)), 0.494, 0.00006)
}, envir = e)
e <- esegui("lgn-tcl")
if (!is.null(e)) local({
  confronta("04", "medie finali delle 4 traiettorie", traiettorie |> filter(n == N) |> arrange(traiettoria) |> pull(media), c(0.0034, 0.0319, -0.0172, -0.0545), 0.00006)
}, envir = e)
e <- esegui("adattamento")
if (!is.null(e)) local({
  confronta("05", "stime ML (media, sd)", c(par$mean, par$sd), c(-0.168, 1.014), 0.0006)
  confronta("05", "X², gradi di libertà, p-value asintotico", c(X2, gdl, pchisq(X2, gdl, lower.tail = FALSE)), c(9.6, 17, 0.9195), c(0.0006, 0, 0.00006))
}, envir = e)
e <- esegui("stimatori")
if (!is.null(e)) local({
  s6 <- stime_lunghe |> group_by(stimatore) |> summarise(centro = median(stima), dev_std = sd(stima), iqr = IQR(stima), mse = mean((stima - theta)^2))
  confronta("06", "media: centro, dev. std, IQR, MSE", unlist(s6[s6$stimatore == "media", -1]), c(0.008, 0.225, 0.306, 0.051), 0.0006)
  confronta("06", "mediana: centro, dev. std, IQR, MSE", unlist(s6[s6$stimatore == "mediana", -1]), c(0.009, 0.275, 0.38, 0.076), 0.0006)
}, envir = e)
e <- esegui("fisher")
if (!is.null(e)) local({
  confronta("07", "score: media e varianza; informazione osservata media", c(mean(sim$U), var(sim$U), mean(sim$Jt)), c(0.2114, 20.2939, 20), 0.00006)
  confronta("07", "media e varianza di θ̂", c(mean(sim$stima), var(sim$stima)), c(0.5106, 0.05073), c(0.00006, 0.000006))
  confronta("07", "copertura di Wald", mean(sim$wald), 0.947, 0.0006)
}, envir = e)
e <- esegui("intervalli")
if (!is.null(e)) local({
  confronta("08", "copertura e ampiezza media", c(mean(sim$copre), mean(sim$alto - sim$basso)), c(0.95, 1.753), c(0.00006, 0.00006))
}, envir = e)
e <- esegui("test")
if (!is.null(e)) local({
  confronta("09", "errore di primo tipo e potenza simulati", c(mean(rifiuta(sim$z0)), mean(rifiuta(sim$z1))), c(0.057, 0.595), 0.0006)
}, envir = e)
e <- esegui("regressione")
if (!is.null(e)) local({
  confronta("10", "media e dev. std della pendenza", c(mean(sim$pendenza), sd(sim$pendenza)), c(0.802, 0.1459), 0.00006)
  confronta("10", "coperture: banda per la media e intervallo di previsione", c(mean(sim$copre_media), mean(sim$copre_y0)), c(0.963, 0.952), 0.0006)
}, envir = e)
e <- esegui("regressione-lp")
if (!is.null(e)) local({
  s11 <- stime |> group_by(metodo) |> summarise(media = mean(pendenza), dev_std = sd(pendenza), iqr = IQR(pendenza), mse = mean((pendenza - b1)^2))
  confronta("11", "L2: media, dev. std, IQR", unlist(s11[s11$metodo == "L2", 2:4]), c(0.5023, 0.065, 0.0878), 0.00006)
  confronta("11", "L2: errore quadratico medio", s11$mse[s11$metodo == "L2"], 0.00422, 0.000006)
  confronta("11", "L1: media, dev. std, IQR", unlist(s11[s11$metodo == "L1", 2:4]), c(0.5005, 0.0795, 0.1075), 0.00006)
  confronta("11", "L1: errore quadratico medio", s11$mse[s11$metodo == "L1"], 0.00632, 0.000006)
  confronta("11", "Lp: media, dev. std, IQR", unlist(s11[s11$metodo == "Lp", 2:4]), c(0.5018, 0.0664, 0.0902), 0.00006)
  confronta("11", "Lp: errore quadratico medio", s11$mse[s11$metodo == "Lp"], 0.0044, 0.000006)
}, envir = e)
e <- esegui("glm")
if (!is.null(e)) local({
  f12 <- sim |> filter(finita)
  confronta("12", "media e dev. std di β̂₁ (stime finite)", c(mean(f12$b1_hat), sd(f12$b1_hat)), c(1.2927, 0.4665), 0.00006)
  confronta("12", "copertura di Wald e campioni con separazione", c(mean(abs(f12$b1_hat - b1) <= 1.96 * f12$se), sum(!sim$finita)), c(0.967, 0), c(0.0006, 0))
}, envir = e)
e <- esegui("arma")
if (!is.null(e)) local({
  confronta("13", "γ(0), ρ(1), ρ(2), ρ(5) empirici", c(mean((x - mean(x))^2), confronto$acf_emp[c(1, 2, 5)]), c(3.4387, 0.7285, 0.2613, -0.2311), 0.00006)
  confronta("13", "φ₂₂ e φ₃₃ empirici", confronto$pacf_emp[2:3], c(-0.5738, 0.0104), 0.00006)
}, envir = e)
e <- esegui("quantilica", "quantreg")
if (!is.null(e)) local({
  confronta("14", "pendenza quantilica (τ = 0,5): media e dev. std", c(mean(sim$quantilica), sd(sim$quantilica)), c(0.6, 0.089), 0.0006)
  confronta("14", "pendenza dei minimi quadrati: media e dev. std", c(mean(sim$minimi_quadrati), sd(sim$minimi_quadrati)), c(0.602, 0.094), 0.0006)
}, envir = e)
e <- esegui("penalizzata", "glmnet")
if (!is.null(e)) local({
  confronta("15", "soluzione lasso (β₁, β₂) sul vincolo", b_star, c(1, 0), 0.00006)
}, envir = e)
e <- esegui("spline")
if (!is.null(e)) local({
  confronta("16", "gradi di libertà, distorsione², varianza (esatti)", c(sum(diag(S)), mean((S %*% f(x) - f(x))^2), sigma^2 * sum(S^2) / n), c(8, 0.0034, 0.0072), c(0.006, 0.00006, 0.00006))
  confronta("16", "errore quadratico medio sui campioni ripetuti", mean(ise), 0.011, 0.00006)
}, envir = e)

cat("\n═══ Riepilogo ═══════════════════════════════════════════════\n")
print(table(.verifica$esito))
if (any(.verifica$esito == "DIVERSO")) { cat("\nControlli non superati:\n"); print(.verifica[.verifica$esito == "DIVERSO", c("lab", "controllo", "dettaglio")], row.names = FALSE) } else cat("\nTutti i controlli eseguiti sono superati.\n")
write.csv(.verifica, "verifica_statatlas_01_16_esiti.csv", row.names = FALSE)
cat("Esiti salvati in verifica_statatlas_01_16_esiti.csv\n")
