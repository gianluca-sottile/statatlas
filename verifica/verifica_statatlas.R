# ═══════════════════════════════════════════════════════════════════════════════
# StatAtlas · verifica automatica degli script R (generato il 2026-11-13)
#
# Esegue gli script R dei 24 laboratori con i parametri predefiniti e confronta i risultati
# con i valori calcolati dal browser (StatAtlas, stessi seed). Alla fine stampa un riepilogo.
#
# Uso:   Rscript verifica_statatlas.R        oppure   source("verifica_statatlas.R")
# Serve: R ≥ 4.1 e i pacchetti tidyverse, quantreg, glmnet, segmented, cluster.
# Tempo: alcuni minuti (i lab 18 e 20 sono i più lenti: CART e validazione in R puro).
# Per eseguire solo alcuni laboratori:  SOLO <- c("segmentata", "knn"); source("verifica_statatlas.R")
# ═══════════════════════════════════════════════════════════════════════════════
stopifnot(getRversion() >= "4.1.0")
RNGkind("Mersenne-Twister", "Inversion", "Rejection")
if (!exists("SOLO")) SOLO <- NULL
pacchetti <- c("tidyverse", "quantreg", "glmnet", "segmented", "cluster")
mancanti <- pacchetti[!vapply(pacchetti, requireNamespace, logical(1), quietly = TRUE)]
if (length(mancanti)) message("Pacchetti mancanti (i laboratori che li usano saranno saltati): ", paste(mancanti, collapse = ", "),
                              "\n  install.packages(c(", paste0('"', mancanti, '"', collapse = ", "), "))")
suppressPackageStartupMessages(library(tidyverse))

.verifica <- data.frame(lab = character(), controllo = character(), esito = character(), dettaglio = character())
registra <- function(lab, controllo, ok, dettaglio = "") {
  .verifica[nrow(.verifica) + 1, ] <<- list(lab, controllo, if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", dettaglio)
  cat(sprintf("  %-8s %-62s %s\n", if (is.na(ok)) "SALTATO" else if (ok) "OK" else "DIVERSO", controllo, dettaglio))
}
confronta <- function(lab, controllo, ottenuto, atteso, tol) {
  ok <- length(ottenuto) == length(atteso) && all(is.finite(ottenuto)) && all(abs(ottenuto - atteso) <= tol)
  registra(lab, controllo, ok, sprintf("R = %s · browser = %s · tolleranza %g",
    paste(signif(ottenuto, 7), collapse = " "), paste(signif(atteso, 7), collapse = " "), tol))
}
esegui <- function(id) {
  cat("\n── ", id, " ──────────────────────────────────────────────\n", sep = "")
  if (!is.null(SOLO) && !id %in% SOLO) { registra(id, "non richiesto (SOLO)", NA); return(NULL) }
  serve <- c(quantilica = "quantreg", penalizzata = "glmnet", segmentata = "segmented", dbscan = "cluster")[id]
  if (!is.na(serve) && serve %in% mancanti) { registra(id, paste("manca il pacchetto", serve), NA); return(NULL) }
  env <- new.env(parent = globalenv()); grDevices::pdf(NULL); t0 <- Sys.time()
  err <- tryCatch({ eval(parse(text = script[[id]]), envir = env); NULL }, error = function(e) conditionMessage(e))
  grDevices::dev.off()
  registra(id, "lo script si esegue senza errori", is.null(err), if (is.null(err)) sprintf("%.1f s", as.numeric(Sys.time() - t0, units = "secs")) else err)
  if (is.null(err)) env else NULL
}

cat("── generatore di numeri casuali ──────────────────────────────\n")
set.seed(2026); confronta("RNG", "set.seed(2026); runif(5)", runif(5), c(0.69867347087711096, 0.55653050588443875, 0.14013995765708387, 0.28572330623865128, 0.55536900996230543), 1e-15)
set.seed(2026); confronta("RNG", "set.seed(2026); rnorm(5)", rnorm(5), c(0.52058907291852308, -1.0796907623522800, 0.13923811501927341, -0.084748784948576530, -0.66663961528459614), 1e-12)
set.seed(2026); confronta("RNG", "set.seed(2026); sample(10)", sample(10), c(9, 1, 6, 5, 3, 4, 7, 10, 8, 2), 0)
set.seed(2026); confronta("RNG", "set.seed(2026); sample(100, 5, replace = TRUE)", sample(100, 5, replace = TRUE), c(93, 97, 38, 45, 91), 0)

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

]---",
  `segmentata` = r"---[
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

# Campione numero 300 (quello mostrato) e test bootstrap sotto H0: delta = 0
set.seed(2026)
for (r in seq_len(300)) y <- genera()
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

]---",
  `validazione` = r"---[
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

# Replica numero 200 (quella mostrata)
repliche[[200]]$curve

]---",
  `knn` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 19 — k vicini più prossimi
# R0: stessi dati di training e di test di StatAtlas (stesso seed, R ≥ 3.6).
# R2: stesso algoritmo: distanza euclidea, a parità di distanza l’indice minore (order()), k dispari.
# R3: class::knn() rompe le parità a caso e consuma numeri casuali: confronto di metodo, non stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 100; n_test <- 500; delta <- 2; scala <- 1; standardizza <- TRUE; B <- 100
k_val <- seq(1, 99, by = 2); kmax <- max(k_val)

genera <- function(n) {
  y <- rep(0:1, each = n / 2)
  s <- ifelse(runif(n) < 0.5, -1, 1)                 # (usato solo nello scenario XOR)
  z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
  x <- cbind(ifelse(y == 1, delta / 2, -delta / 2) + z[, 1], z[, 2])
  x[, 2] <- scala * x[, 2]
  list(x = x, y = y)
}
errore_bayes <- pnorm(-delta / 2)

# Classe prevista per ogni k: matrice (punti × k)
prevedi <- function(xtr, ytr, xnew, loo = FALSE) {
  t(sapply(seq_len(nrow(xnew)), \(i) {
    d <- (xtr[, 1] - xnew[i, 1])^2 + (xtr[, 2] - xnew[i, 2])^2
    o <- order(d); if (loo) o <- o[o != i]          # leave-one-out: il punto non vota per sé
    v <- cumsum(ytr[o[seq_len(kmax)]])
    as.integer(v[k_val] > k_val / 2)
  }))
}

una_replica <- function() {
  tr <- genera(n); te <- genera(n_test)
  if (standardizza) {                                # medie e sd stimate sul solo training
    m <- colMeans(tr$x); s <- apply(tr$x, 2, sd)
    tr$x <- scale(tr$x, m, s); te$x <- scale(te$x, m, s)
  }
  err <- \(P, y) colMeans(P != y)
  tibble(k = k_val, training = err(prevedi(tr$x, tr$y, tr$x), tr$y),
         loo = err(prevedi(tr$x, tr$y, tr$x, loo = TRUE), tr$y), test = err(prevedi(tr$x, tr$y, te$x), te$y))
}

repliche <- map(seq_len(B), \(b) una_replica())
curve <- bind_rows(repliche, .id = "replica")
curve |> group_by(replica) |> slice_min(loo, n = 1, with_ties = FALSE) |> ungroup() |>
  summarise(k_medio = mean(k), test_al_k_scelto = mean(test))
curve |> filter(k == 1) |> summarise(training = mean(training), test = mean(test), cover_hart = 2 * errore_bayes * (1 - errore_bayes))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
curve |> dplyr::select(-replica) |> group_by(k) |> summarise(across(everything(), mean)) |>
  pivot_longer(-k, names_to = "errore", values_to = "valore") |>
  ggplot(aes(k, valore, colour = errore)) + geom_line(linewidth = 1) +
  geom_hline(yintercept = errore_bayes, linetype = "dashed") +
  labs(x = "k", y = "tasso di errore") + theme_statatlas()

# Confronto di metodo (R3)
# library(class); knn(train = tr$x, test = te$x, cl = factor(tr$y), k = 15)

]---",
  `alberi` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 20 — Alberi, bagging e random forest
# R0: stessi dati e stessi campioni bootstrap di StatAtlas (stesso seed, R ≥ 3.6).
# R2: stesso CART didattico (Gini, soglie nei punti medi, prima variabile e soglia più piccola a parità),
#     stessa estrazione di mtry variabili a ogni nodo: stessi alberi e stessi errori.
# R3: rpart e ranger usano regole diverse (potatura, tie, campionamento): confronto di metodo, non stessi numeri.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 200; n_test <- 1000; p <- 5; eps <- 0.1; mtry <- 2; B <- 100
prof_max <- 30; min_foglia <- 1
confine <- function(X) 8 / pi - X[, 1]^2 - X[, 2]^2

genera <- function(n) {
  X <- matrix(runif(n * p, -2, 2), ncol = p, byrow = TRUE)
  y <- as.integer((confine(X) > 0) != (runif(n) < eps))   # etichette scambiate con probabilità eps
  list(X = X, y = y)
}
tr <- genera(n); te <- genera(n_test)

# CART per due classi: criterio G = n * Gini pesato dei figli, da minimizzare
cresci <- function(X, y, idx, mtry, prof = 0) {
  yy <- y[idx]; m <- length(idx); c1 <- sum(yy); c0 <- m - c1
  foglia <- list(foglia = TRUE, classe = as.integer(c1 > c0), n = m)
  if (prof >= prof_max || m < 2 * min_foglia || c0 == 0 || c1 == 0) return(foglia)
  vars <- if (mtry < p) sample(p, mtry) else seq_len(p)
  G0 <- m - (c0^2 + c1^2) / m; best <- G0 - 1e-10; bj <- 0
  for (j in vars) {
    o <- order(X[idx, j]); v <- X[idx, j][o]; l1 <- cumsum(yy[o])[-m]
    nl <- seq_len(m - 1); nr <- m - nl; l0 <- nl - l1; r1 <- c1 - l1; r0 <- nr - r1
    G <- nl - (l0^2 + l1^2) / nl + nr - (r0^2 + r1^2) / nr
    ok <- which(v[-m] < v[-1] & nl >= min_foglia & nr >= min_foglia)
    if (length(ok)) { i <- ok[which.min(G[ok])]; if (G[i] < best) { best <- G[i]; bj <- j; soglia <- (v[i] + v[i + 1]) / 2 } }
  }
  if (bj == 0) return(foglia)
  sx <- X[idx, bj] < soglia
  list(foglia = FALSE, j = bj, soglia = soglia, sx = cresci(X, y, idx[sx], mtry, prof + 1), dx = cresci(X, y, idx[!sx], mtry, prof + 1))
}
prevedi <- function(t, X) {
  if (t$foglia) return(rep(t$classe, nrow(X)))
  out <- integer(nrow(X)); sx <- X[, t$j] < t$soglia
  out[sx] <- prevedi(t$sx, X[sx, , drop = FALSE]); out[!sx] <- prevedi(t$dx, X[!sx, , drop = FALSE]); out
}

albero <- cresci(tr$X, tr$y, seq_len(n), mtry = p)
errore_albero <- mean(prevedi(albero, te$X) != te$y)

metodi <- c(bagging = p, foresta = mtry)
voti_te <- matrix(0, n_test, 2); voti_oob <- matrix(0, n, 2); conta_oob <- matrix(0, n, 2)
radice <- matrix(NA, B, 2, dimnames = list(NULL, names(metodi))); traiettoria <- vector("list", B)
for (b in seq_len(B)) {
  for (k in 1:2) {
    idx <- sample(n, n, replace = TRUE)                  # campione bootstrap
    t <- cresci(tr$X, tr$y, idx, mtry = metodi[k])
    if (!t$foglia) radice[b, k] <- t$j
    voti_te[, k] <- voti_te[, k] + prevedi(t, te$X)
    fuori <- setdiff(seq_len(n), idx)                    # out-of-bag: mai visti da questo albero
    voti_oob[fuori, k] <- voti_oob[fuori, k] + prevedi(t, tr$X[fuori, , drop = FALSE]); conta_oob[fuori, k] <- conta_oob[fuori, k] + 1
  }
  usati <- conta_oob > 0
  traiettoria[[b]] <- tibble(alberi = b, metodo = names(metodi),
    test = colMeans((2 * voti_te > b) != te$y),
    oob = sapply(1:2, \(k) mean((2 * voti_oob[usati[, k], k] > conta_oob[usati[, k], k]) != tr$y[usati[, k]])))
}
traiettoria <- bind_rows(traiettoria)
traiettoria |> filter(alberi == B)
apply(radice, 2, \(r) table(factor(r, levels = seq_len(p))) / B)

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
traiettoria |> pivot_longer(c(test, oob), names_to = "stima", values_to = "errore") |>
  ggplot(aes(alberi, errore, colour = metodo, linetype = stima)) + geom_line() +
  geom_hline(yintercept = c(eps, errore_albero), linetype = c("dashed", "dotted")) + theme_statatlas()

# Confronto di metodo (R3)
# library(ranger); ranger(y ~ ., data = data.frame(y = factor(tr$y), tr$X), num.trees = B, mtry = mtry)

]---",
  `pca` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 21 — Analisi delle componenti principali
# R0: stessi dati di StatAtlas (stesso seed). R1: stessi autovalori, quote di varianza ed errori di ricostruzione;
#     prcomp() usa la SVD: i segni degli autovettori possono differire e vanno allineati prima di confrontarli.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 80; p <- 2; rho <- 4; theta <- 30 * pi / 180; unita <- 1; standardizza <- FALSE; k <- 1; B <- 500
lambda <- c(rho, 1, 0.6, 0.35, 0.2, 0.1)[1:p]; mu <- c(3, -2, 1, 0, 0, 0)[1:p]
V <- diag(p); V[1:2, 1:2] <- matrix(c(cos(theta), sin(theta), -sin(theta), cos(theta)), 2)
genera <- function() {
  E <- matrix(rnorm(n * p), ncol = p, byrow = TRUE)
  X <- sweep(E %*% diag(sqrt(lambda), p) %*% t(V), 2, mu, "+")
  # (nessun valore anomalo)
  X[, 2] <- unita * X[, 2]
  X
}

# Segno: componente di modulo massimo positiva (convenzione di StatAtlas)
allinea <- function(V) sweep(V, 2, sign(V[cbind(apply(abs(V), 2, which.max), seq_len(ncol(V)))]), "*")

X <- genera()
pc <- prcomp(X, center = TRUE, scale. = standardizza)
lambda_hat <- pc$sdev^2
tibble(componente = 1:p, autovalore = lambda_hat, pve = lambda_hat / sum(lambda_hat), cumulata = cumsum(pve))
allinea(pc$rotation)

# Errore di ricostruzione con k componenti: diretto e tramite gli autovalori scartati
Z <- scale(X, center = TRUE, scale = standardizza)
Zk <- pc$x[, 1:k, drop = FALSE] %*% t(pc$rotation[, 1:k, drop = FALSE])
c(diretto = sum((Z - Zk)^2) / n, autovalori = (n - 1) / n * sum(lambda_hat[-(1:k)]))

# Campioni ripetuti: angolo tra PC1 stimata e PC1 della popolazione (il primo campione è quello sopra)
Sigma <- V %*% diag(lambda, p) %*% t(V); D <- diag(c(1, unita, rep(1, p - 2)))[1:p, 1:p]; Sigma <- D %*% Sigma %*% D
if (standardizza) Sigma <- cov2cor(Sigma)
v1 <- eigen(Sigma, symmetric = TRUE)$vectors[, 1]
set.seed(2026)
repliche <- map_dfr(seq_len(B), \(b) {
  pc <- prcomp(genera(), center = TRUE, scale. = standardizza)
  tibble(lambda1 = pc$sdev[1]^2, angolo = acos(min(1, abs(sum(pc$rotation[, 1] * v1)))) * 180 / pi)
})
repliche |> summarise(media_lambda1 = mean(lambda1), sd_lambda1 = sd(lambda1), media_sin2 = mean(sin(angolo * pi / 180)^2))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
ggplot(repliche, aes(angolo)) + geom_histogram(bins = 30, fill = "#9A3412", alpha = 0.5) +
  labs(x = "angolo tra PC1 stimata e vera (gradi)") + theme_statatlas()
biplot(pc, scale = 0)   # convenzione diversa da StatAtlas: frecce = loading, score non riscalati

]---",
  `clustering` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 22 — k-means e clustering gerarchico
# R0: stessi dati di StatAtlas (stesso seed). R2: stats::kmeans con algorithm = "Lloyd" estrae i centri iniziali
#     con sample.int(n, K) per ogni avvio, nello stesso ordine: stessa soluzione migliore (salvo gruppi vuoti,
#     che in R fermano l’algoritmo con un errore). Il gerarchico usa hclust con lo stesso legame (a parità di
#     distanza l’ordine delle fusioni può differire).
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 150; d <- 3; K <- 3; nstart <- 10; legame <- "ward.D2"
ang <- c(90, 210, 330) * pi / 180; sx <- c(1, 1, 1); sy <- c(1, 1, 1)
gruppo <- rep(1:3, each = n / 3)
Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
X <- cbind(d * cos(ang[gruppo]) + sx[gruppo] * Z[, 1], d * sin(ang[gruppo]) + sy[gruppo] * Z[, 2])
# (nessun valore anomalo)
# (nessuna standardizzazione)

# Il gerarchico prima di kmeans: non usa numeri casuali, quindi non cambia il flusso del generatore
hc <- hclust(dist(X), method = legame)
gruppi_h <- cutree(hc, k = K)


km <- kmeans(X, centers = K, nstart = nstart, algorithm = "Lloyd", iter.max = 100)
km$tot.withinss; km$iter

# Indice di Rand corretto (Hubert e Arabie, 1985)
ari <- function(a, b) {
  tab <- table(a, b); c2 <- function(x) sum(choose(x, 2))
  e <- c2(rowSums(tab)) * c2(colSums(tab)) / choose(length(a), 2); m <- (c2(rowSums(tab)) + c2(colSums(tab))) / 2
  (c2(tab) - e) / (m - e)
}
c(kmeans = ari(km$cluster, gruppo), gerarchico = ari(gruppi_h, gruppo), tra_metodi = ari(km$cluster, gruppi_h))

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
tibble(x1 = X[, 1], x2 = X[, 2], popolazione = factor(gruppo), kmeans = factor(km$cluster)) |>
  ggplot(aes(x1, x2, colour = kmeans, shape = popolazione)) + geom_point() +
  geom_point(data = as_tibble(km$centers, .name_repair = ~ c("x1", "x2")), inherit.aes = FALSE, aes(x1, x2), shape = 4, size = 5, stroke = 2) +
  coord_equal() + theme_statatlas()
plot(hc, labels = FALSE); rect.hclust(hc, k = K)

]---",
  `dbscan` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 23 — DBSCAN e confronto tra metodi
# R0: stessi dati di StatAtlas (stesso seed). R2: DBSCAN didattico con la stessa convenzione
#     (punti in ordine di indice, espansione FIFO, bordo al primo cluster che lo raggiunge) → stesse etichette.
# R3: dbscan::dbscan() usa un altro ordine di visita: core e rumore coincidono, i bordi contesi possono differire.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

set.seed(2026)
n <- 300; sigma <- 0.08; m <- 10; eps <- 0.2; minPts <- 5; K <- 2
u <- runif(n); Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
gruppo <- rep(1:2, each = n / 2); t <- pi * u
X <- ifelse(gruppo == 1, 1, 0) * cbind(cos(t), sin(t)) + ifelse(gruppo == 2, 1, 0) * cbind(1 - cos(t), 0.5 - sin(t)) + sigma * Z
X <- rbind(X, matrix(runif(2 * m, -2.5, 2.5), ncol = 2, byrow = TRUE)); gruppo <- c(gruppo, rep(0, m))   # anomali = 0
X[, 2] <- 1 * X[, 2]
# (nessuna standardizzazione)

# DBSCAN didattico
dbscan_did <- function(X, eps, minPts) {
  D <- as.matrix(dist(X)); n <- nrow(X)
  vic <- lapply(seq_len(n), \(i) which(D[i, ] <= eps))   # i compreso, in ordine di indice
  core <- lengths(vic) >= minPts; cl <- rep(NA_integer_, n); id <- 0L
  for (i in seq_len(n)) {
    if (!is.na(cl[i])) next
    if (!core[i]) { cl[i] <- 0L; next }                     # rumore provvisorio
    id <- id + 1L; cl[i] <- id; coda <- i
    while (length(coda)) {
      q <- coda[1]; coda <- coda[-1]
      for (j in vic[[q]]) if (is.na(cl[j]) || cl[j] == 0L) { nuovo <- is.na(cl[j]); cl[j] <- id; if (core[j] && nuovo) coda <- c(coda, j) }
    }
  }
  list(cluster = cl, core = core)
}
db <- dbscan_did(X, eps, minPts)
table(tipo = ifelse(db$core, "core", ifelse(db$cluster > 0, "bordo", "rumore")))

# Confronto con k-means (Lloyd, 10 avvii) e Ward sugli stessi dati
km <- kmeans(X, centers = K, nstart = 10, algorithm = "Lloyd", iter.max = 100)
ward <- cutree(hclust(dist(X), method = "ward.D2"), k = K)
ari <- function(a, b) {
  tab <- table(a, b); c2 <- function(x) sum(choose(x, 2))
  e <- c2(rowSums(tab)) * c2(colSums(tab)) / choose(length(a), 2); mm <- (c2(rowSums(tab)) + c2(colSums(tab))) / 2
  (c2(tab) - e) / (mm - e)
}
c(kmeans = ari(km$cluster, gruppo), ward = ari(ward, gruppo), dbscan = ari(db$cluster, gruppo))
library(cluster)   # silhouette (pacchetto incluso nelle installazioni standard di R)
nr <- db$cluster > 0
c(kmeans = mean(silhouette(km$cluster, dist(X))[, 3]), ward = mean(silhouette(ward, dist(X))[, 3]),
  dbscan = mean(silhouette(db$cluster[nr], dist(X[nr, ]))[, 3]))

# Grafico delle k-distanze e confronto di metodo (R3)
kd <- sort(apply(as.matrix(dist(X)), 1, \(d) sort(d)[minPts]))   # minPts-esimo incluso il punto = (minPts − 1)-esimo vicino
plot(kd, type = "l", ylab = "k-distanza"); abline(h = eps, lty = 2)
# library(dbscan); dbscan::dbscan(X, eps = eps, minPts = minPts)

]---",
  `reti-neurali` = r"---[
# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 24 — Rete neurale 2 → H → 1 e backpropagation
# R0: stessi dati, stessa suddivisione e stessi pesi iniziali di StatAtlas (R ≥ 3.6).
# R2: stessa discesa del gradiente a lotto intero: stesse perdite a meno dell’arrotondamento.
# R3: nnet o torch usano ottimizzatori e inizializzazioni diversi: confronto di metodo, non stessi pesi.
# ───────────────────────────────────────────────────────────────
library(tidyverse)

n <- 200; sigma <- 0.1; n_val <- 60; H <- 4; eta <- 0.5; lambda <- 0; E <- 2000
set.seed(2026)
U <- matrix(runif(2 * n), ncol = 2, byrow = TRUE); Z <- matrix(rnorm(2 * n), ncol = 2, byrow = TRUE)
X0 <- 2 * U - 1; y <- as.numeric(X0[, 1] * X0[, 2] > 0)
X <- X0 + sigma * Z                                   # etichetta dai punti puliti, poi rumore
id_val <- sample(n, n_val)
Xtr <- X[-id_val, ]; ytr <- y[-id_val]; Xva <- X[id_val, ]; yva <- y[id_val]

# Inizializzazione con un seed proprio
inizializza <- function(seme) {
  set.seed(seme); a <- sqrt(6 / (2 + H)); c <- sqrt(6 / (H + 1))
  list(W1 = matrix(runif(2 * H, -a, a), nrow = H, byrow = TRUE), b1 = rep(0, H), W2 = runif(H, -c, c), b2 = 0)
}
att <- tanh; datt <- function(A, Hh) 1 - Hh^2
avanti <- function(par, X) { A <- sweep(X %*% t(par$W1), 2, par$b1, "+"); Hh <- att(A); list(A = A, H = Hh, z = drop(Hh %*% par$W2) + par$b2) }
bce <- function(z, y) mean(pmax(z, 0) - y * z + log1p(exp(-abs(z))))   # forma stabile
gradiente <- function(par, X, y) {
  f <- avanti(par, X); dz <- (plogis(f$z) - y) / nrow(X)
  dA <- outer(dz, par$W2) * datt(f$A, f$H)
  list(W1 = t(dA) %*% X + lambda * par$W1, b1 = colSums(dA), W2 = drop(t(f$H) %*% dz) + lambda * par$W2, b2 = sum(dz))
}
addestra <- function(par) {
  storia <- matrix(NA, E + 1, 2, dimnames = list(NULL, c("training", "validazione")))
  storia[1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))
  for (e in seq_len(E)) {
    g <- gradiente(par, Xtr, ytr); par <- Map(\(p, d) p - eta * d, par, g)
    storia[e + 1, ] <- c(bce(avanti(par, Xtr)$z, ytr), bce(avanti(par, Xva)$z, yva))
  }
  list(par = par, storia = storia)
}

# Controllo del gradiente con differenze finite (all’inizio)
par0 <- inizializza(1)
obiettivo <- function(v) { p <- relist(v, par0); bce(avanti(p, Xtr)$z, ytr) + lambda / 2 * (sum(p$W1^2) + sum(p$W2^2)) }
v0 <- unlist(as.relistable(par0)); num <- sapply(seq_along(v0), \(k) { h <- replace(numeric(length(v0)), k, 1e-5); (obiettivo(v0 + h) - obiettivo(v0 - h)) / 2e-5 })
max(abs(num - unlist(gradiente(par0, Xtr, ytr)))) / max(abs(num))

fit <- addestra(par0)
tail(fit$storia, 1)
mean((plogis(avanti(fit$par, Xva)$z) > 0.5) == yva)   # accuratezza di validazione

# 20 inizializzazioni diverse sugli stessi dati
esiti <- map_dfr(seq_len(20), \(r) { f <- addestra(inizializza(1 + r)); tibble(seed = 1 + r, training = f$storia[E + 1, 1], validazione = f$storia[E + 1, 2]) })
esiti

theme_statatlas <- function(base_size = 12) {
  theme_minimal(base_size = base_size, base_family = "serif") +
    theme(panel.grid.minor = element_blank(), plot.background = element_rect(fill = "#FAF8F3", colour = NA))
}
as_tibble(fit$storia) |> mutate(epoca = 0:E) |> pivot_longer(-epoca, names_to = "insieme", values_to = "perdita") |>
  ggplot(aes(epoca, perdita, colour = insieme)) + geom_line() + theme_statatlas()

]---"
)

e <- esegui("distribuzioni")
e <- esegui("bivariata")
e <- esegui("simulazione")
e <- esegui("lgn-tcl")
e <- esegui("adattamento")
e <- esegui("stimatori")
e <- esegui("fisher")
e <- esegui("intervalli")
e <- esegui("test")
e <- esegui("regressione")
e <- esegui("regressione-lp")
e <- esegui("glm")
e <- esegui("arma")
e <- esegui("quantilica")
e <- esegui("penalizzata")
e <- esegui("spline")
e <- esegui("segmentata")
if (!is.null(e)) local({
  confronta("17", "media, distorsione e RMSE di psi_hat (B campioni)", c(mean(stime), mean(stime) - psi, sqrt(mean((stime - psi)^2))), c(5.95, -0.055, 0.553), c(0.006, 0.0006, 0.0006))
  confronta("17", "psi_hat del campione mostrato", psi_hat, 6.81, 0.006)
  confronta("17", "statistica T e p-value bootstrap", c(T_oss, (1 + sum(T_boot >= T_oss)) / 200), c(35.18, 0.005), c(0.006, 0.0006))
}, envir = e)
e <- esegui("validazione")
if (!is.null(e)) local({
  confronta("18", "distorsione media: protocollo corretto, scorretto, training", c(mean(sintesi$corretto), mean(sintesi$scorretto), mean(sintesi$training)), c(0.0023, -0.0244, -0.0513), 6e-5)
}, envir = e)
e <- esegui("knn")
if (!is.null(e)) local({
  k_mostrato <- 15
  confronta("19", "errore medio sul test con il k mostrato", mean(curve$test[curve$k == k_mostrato]), 0.1753, 6e-5)
  scelto <- curve |> group_by(replica) |> slice_min(loo, n = 1, with_ties = FALSE) |> ungroup()
  confronta("19", "errore sul test al k scelto con leave-one-out", mean(scelto$test), 0.1761, 6e-5)
  confronta("19", "k = 1: errore di training e di test", c(mean(curve$training[curve$k == 1]), mean(curve$test[curve$k == 1])), c(0, 0.2353), 6e-5)
}, envir = e)
e <- esegui("alberi")
if (!is.null(e)) local({
  ultimo <- traiettoria |> filter(alberi == B)
  confronta("20", "errore sul test di un solo albero", errore_albero, 0.216, 6e-4)
  confronta("20", "bagging: errore sul test e OOB", c(ultimo$test[ultimo$metodo == "bagging"], ultimo$oob[ultimo$metodo == "bagging"]), c(0.178, 0.165), 6e-4)
  confronta("20", "foresta: errore sul test e OOB", c(ultimo$test[ultimo$metodo == "foresta"], ultimo$oob[ultimo$metodo == "foresta"]), c(0.159, 0.155), 6e-4)
}, envir = e)
e <- esegui("pca")
if (!is.null(e)) local({
  confronta("21", "lambda1: media e sd nelle repliche", c(mean(repliche$lambda1), sd(repliche$lambda1)), c(4.055, 0.634), 6e-4)
  confronta("21", "sin^2 medio dell'angolo di PC1", mean(sin(repliche$angolo * pi / 180)^2), 0.0055, 6e-5)
}, envir = e)
e <- esegui("clustering")
if (!is.null(e)) local({
  confronta("22", "WCSS della soluzione migliore (kmeans Lloyd)", km$tot.withinss, 260.437, 6e-4)
  confronta("22", "ARI: k-means, gerarchico, tra metodi", c(ari(km$cluster, gruppo), ari(gruppi_h, gruppo), ari(km$cluster, gruppi_h)), c(0.96, 0.98, 0.98), 6e-4)
}, envir = e)
e <- esegui("dbscan")
if (!is.null(e)) local({
  tipo <- ifelse(db$core, "core", ifelse(db$cluster > 0, "bordo", "rumore"))
  confronta("23", "cluster, core, bordo, rumore", c(max(db$cluster), sum(tipo == "core"), sum(tipo == "bordo"), sum(tipo == "rumore")), c(2, 297, 5, 8), 0)
  confronta("23", "ARI: k-means, Ward, DBSCAN", c(ari(km$cluster, gruppo), ari(ward, gruppo), ari(db$cluster, gruppo)), c(0.158, 0.325, 0.987), 6e-4)
}, envir = e)
e <- esegui("reti-neurali")
if (!is.null(e)) local({
  confronta("24", "perdita finale: training e validazione", unname(fit$storia[E + 1, ]), c(0.1748, 0.2622), 6e-5)
  confronta("24", "accuratezza di validazione", mean((plogis(avanti(fit$par, Xva)$z) > 0.5) == yva), 0.883, 6e-4)
  registra("24", "controllo del gradiente (differenze finite)", max(abs(num - unlist(gradiente(par0, Xtr, ytr)))) / max(abs(num)) < 1e-6)
  confronta("24", "20 inizializzazioni: perdita di training min e max", range(esiti$training), c(0.14, 0.195), 6e-4)
}, envir = e)

cat("\n═══ Riepilogo ═══════════════════════════════════════════════\n")
print(table(.verifica$esito))
if (any(.verifica$esito == "DIVERSO")) { cat("\nControlli non superati:\n"); print(.verifica[.verifica$esito == "DIVERSO", c("lab", "controllo", "dettaglio")], row.names = FALSE) } else cat("\nTutti i controlli eseguiti sono superati.\n")
write.csv(.verifica, "verifica_statatlas_esiti.csv", row.names = FALSE)
cat("Esiti salvati in verifica_statatlas_esiti.csv\n")
