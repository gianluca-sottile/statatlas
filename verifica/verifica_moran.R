# StatAtlas LAB 26 - verifica R1 Moran globale
# Generato da node tests/gen_moran_reference.js; Rscript verifica/verifica_moran.R
# Confronta stesse osservazioni, definizioni rook/queen, W, lag, I e speranza.
# Non richiede pacchetti; confronto con spdep opzionale se installato.
check <- function(name, x, expected, tol=1e-9) {
  if (!length(x) || length(x)!=length(expected) || any(!is.finite(x)) || max(abs(x-expected))>tol)
    stop(sprintf("FAIL %s: R=%s, JS=%s", name, paste(signif(x,7),collapse=","),paste(signif(expected,7),collapse=",")))
  cat("OK:",name,"\n")
}
W_grid <- function(nr,nc,kind,style) {
 n <- nr*nc; i <- seq_len(n); rr <- (i-1L) %/% nc; cc <- (i-1L) %% nc
 W <- matrix(0,n,n)
 for (k in i) {
  row <- if (kind=="rook") abs(rr-rr[k])+abs(cc-cc[k])==1 else
    pmax(abs(rr-rr[k]), abs(cc-cc[k]))==1
  row[k] <- FALSE; if (style=="row" && sum(row)>0) W[k,row] <- 1/sum(row) else W[k,row] <- 1
 }
 W
}
count <- 0L
local({
 x <- c(-1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000)
 W <- W_grid(4L,4L,"rook","row")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("blocks/rook/row I",got,0.70833333333333304)
 check("blocks/rook/row S0",S0,16.000000000000007)
 check("blocks/rook/row lag [1,6,16]",lag[c(1,6,16)],c(-1.0000000000000000, -0.50000000000000000, 1.0000000000000000))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("row"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("blocks/rook/row spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(-1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000)
 W <- W_grid(4L,4L,"rook","binary")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("blocks/rook/binary I",got,0.66666666666666663)
 check("blocks/rook/binary S0",S0,48.000000000000000)
 check("blocks/rook/binary lag [1,6,16]",lag[c(1,6,16)],c(-2.0000000000000000, -2.0000000000000000, 2.0000000000000000))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("binary"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("blocks/rook/binary spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(1.0000000000000000, -1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, -1.0000000000000000, 1.0000000000000000, 1.0000000000000000, -1.0000000000000000, 1.0000000000000000, -1.0000000000000000, -1.0000000000000000, 1.0000000000000000, -1.0000000000000000, 1.0000000000000000)
 W <- W_grid(4L,4L,"queen","row")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("checker/queen/row I",got,-0.18333333333333346)
 check("checker/queen/row S0",S0,15.999999999999991)
 check("checker/queen/row lag [1,6,16]",lag[c(1,6,16)],c(-0.33333333333333331, 0.0000000000000000, -0.33333333333333331))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("row"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("checker/queen/row spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(0.52058907291852308, -1.0796907623522800, 0.13923811501927341, -0.084748784948576530, -0.66663961528459614, -2.5160890320094564, -0.73514679745667699, -1.0201222631350930, 0.11355444129730691, -0.47379098184009488, -0.40821470433792822, -0.73043327859361440, -0.22143659940617358, -0.22581652442895142, -2.5468814461282956, 1.3470014992970316)
 W <- W_grid(4L,4L,"rook","row")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("iid/rook/row I",got,-0.24970090593051869)
 check("iid/rook/row S0",S0,16.000000000000007)
 check("iid/rook/row lag [1,6,16]",lag[c(1,6,16)],c(-0.33637595998158787, -0.20202781039656181, -1.1018681335241047))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("row"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("iid/rook/row spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(-0.71779382447851692, -0.67789176682329799, 0.34873334025674563, 0.87033792526799825, -1.1333238653496087, -1.1806311612033098, 0.042698620890163019, 0.54295720790271751, -0.86025594554594265, -0.46582684364403326, 0.15712485348172506, 0.64434835249223499, -0.97750280979216075, -0.37903578355013301, -0.59140850614490348, 1.3714505247539610)
 W <- W_grid(4L,4L,"queen","binary")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("trend/queen/binary I",got,0.38940185871791388)
 check("trend/queen/binary S0",S0,84.000000000000000)
 check("trend/queen/binary lag [1,6,16]",lag[c(1,6,16)],c(-2.4282181030975236, -1.8035255904695853, 0.77369339010774940))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("binary"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("trend/queen/binary spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(-0.59924391615844430, -2.0879050490719537, -0.84311956805067367, -0.89915156232678450, -1.6448715811863959, -3.5987079493906826, -1.9247318039536845, -1.8715563565443083, -0.69320796396130446, -1.5599510149997238, -1.6171828359962979, -1.4332871007682932, -0.82898943010962400, -1.3319681383844855, -3.1418176246710101, -0.025529918334222135)
 W <- W_grid(4L,4L,"rook","row")
 z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)
 got <- length(x)/S0 * sum(z*lag)/sum(z^2)
 check("sar/rook/row I",got,-0.071420466350977915)
 check("sar/rook/row S0",S0,16.000000000000007)
 check("sar/rook/row lag [1,6,16]",lag[c(1,6,16)],c(-0.36006195175993183, -0.29803849893369649, -0.78122599935040871))
 check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)
 if (requireNamespace("spdep",quietly=TRUE)) {
   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))
   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))
   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE
   lw <- spdep::nb2listw(nb, style=if ("row"=="row") "W" else "B",zero.policy=TRUE)
   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))
   check("sar/rook/row spdep",ans$I,got)
 }
})
count <- count + 1L
local({
 x <- c(1,2,3,4,5,6); W <- W_grid(2,3,"rook","binary"); z <- x-mean(x); S0 <- sum(W)
 # 6! permutazioni: conferma la media esatta
 tot <- 0; nperm <- 0L
 recurse <- function(v,left) {
   if (!length(left)) { tot <<- tot + length(v)/S0 * sum((v-mean(v)) * drop(W %*% (v-mean(v)))) / sum((v-mean(v))^2); nperm <<- nperm+1L; return() }
   for (j in seq_along(left)) recurse(c(v,left[j]),left[-j])
 }
 recurse(numeric(),1:6)
 check("6! permutazioni - speranza esatta", c(tot/nperm, nperm),c(-1/5,720))
})
cat("LAB 26: ",count," scenari Moran JS/R verificati.\n",sep="")
