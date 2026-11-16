# ───────────────────────────────────────────────────────────────
# StatAtlas · Lab 24 — k-means e clustering gerarchico
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
