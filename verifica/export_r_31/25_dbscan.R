# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 25 — DBSCAN e confronto tra metodi
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
