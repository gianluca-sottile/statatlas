# StatAtlas · Parte VIII unificata · kriging
# Snapshot dei punti modificati sulla mappa. Coordinate normalizzate, non geografiche.
d <- data.frame(
  x = c(
    0.2916666666666667, 0.6250000000000000, 0.5416666666666666, 0.6250000000000000, 0.2083333333333333, 0.3750000000000000,
    0.7083333333333334, 0.4583333333333333, 0.7083333333333334, 0.3750000000000000, 0.5416666666666666, 0.9583333333333334
  ),
  y = c(
    0.3750000000000000, 0.2916666666666667, 0.6250000000000000, 0.5416666666666666, 0.9583333333333334, 0.1250000000000000,
    0.6250000000000000, 0.7083333333333334, 0.4583333333333333, 0.04166666666666666, 0.2916666666666667, 0.4583333333333333
  ),
  z = c(
    -0.1935774898953781, -0.8025280852263408, -0.5275580750430543, -0.8595219311757960, -0.001393363377345469, -0.1954707630199746,
    -0.3973109669914958, 0.2228447575029909, -1.480900628369615, -0.5656522534208051, -1.415762602790495, 0.2516495485439929
  ),
  X = c(
    NA_real_, NA_real_, NA_real_, NA_real_, NA_real_, NA_real_,
    NA_real_, NA_real_, NA_real_, NA_real_, NA_real_, NA_real_
  )
)
plot(d$x,d$y,asp=1,pch=19,cex=.7,col="steelblue",xlab="x",ylab="y")
phi <- 0.2500000000000000
sigma2 <- 1; nugget <- 0.12
covF <- function(a,b) sigma2*exp(-as.matrix(dist(rbind(a,b)))[seq_len(nrow(a)), nrow(a)+seq_len(nrow(b)),drop=FALSE]/phi)
loc <- as.matrix(d[,c("x","y")]); n <- nrow(loc)
C <- covF(loc,loc)+diag(nugget,n)
c0 <- covF(loc,matrix(c(.5,.5),nrow=1))[,1]
A <- rbind(cbind(C,rep(1,n)),c(rep(1,n),0))
weights <- solve(A,c(c0,1)); w <- weights[seq_len(n)]; nu <- weights[n+1]
cat("Kriging al centro =",sum(w*d$z),"; varianza latente =",sigma2-sum(w*c0)-nu,"\n")
# Il campo sottostante è fisso mentre cambia il disegno dei sensori.
