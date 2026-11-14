# StatAtlas LAB 30: confronto indipendente R base vs JS, five deterministic fixtures.
# Lo script ricostruisce covarianze e predizioni con solve() di R, senza riusare il solver JS.
# Per IDW NON esiste la varianza di kriging: i NA sono attesi.
distance <- function(A,B) sqrt(outer(A[,1],B[,1],"-")^2 + outer(A[,2],B[,2],"-")^2)
fit_one <- function(sites,targets,y,model,phi,sig2,nugget,method){
  corfun <- function(D) {t <- D/phi; if(model=="gaussian") return(exp(-t*t));
    if(model=="spherical") return(ifelse(t>=1,0,1-1.5*t+.5*t^3)); exp(-t) }
  if(method=="idw") {
    W <- sapply(seq_len(nrow(targets)),function(j){ D <- sqrt(rowSums((sites-matrix(targets[j,],nrow(sites),2,byrow=TRUE))^2));
      at <- which(D<=1e-12); if(length(at)){w<-rep(0,length(D));w[at[1]]<-1;return(w)}
      a<-1/D^2; a/sum(a)})
    return(list(pred=as.numeric(crossprod(W,y)),pv=rep(NA_real_,nrow(targets)),W=W))
  }
  C <- sig2*corfun(distance(sites,sites))+diag(nugget,nrow(sites))
  c0 <- sig2*corfun(distance(sites,targets))
  A <- solve(C,c0)
  if(method=="ordinary") {b<-solve(C,rep(1,nrow(sites)));nu<-(colSums(A)-1)/sum(b);W<-A-b%o%nu}
  else {nu<-rep(0,ncol(A));W<-A}
  list(pred=as.numeric(crossprod(W,y)),pv=pmax(0,sig2-colSums(W*c0)-nu),W=W)
}
tests <- 0L
{ # simple_exponential_nugget
  sites <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.69999999999999996, 0.10000000000000001, 0.20000000000000001, 0.84999999999999998, 0.90000000000000002, 0.69999999999999996),ncol=2,byrow=TRUE)
  targets <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.20000000000000001, 0.20000000000000001, 0.50000000000000000, 0.40000000000000002, 0.84999999999999998, 0.84999999999999998),ncol=2,byrow=TRUE)
  y <- c(1.3999999999999999, -0.90000000000000002, 0.50000000000000000, 0.20000000000000001)
  result <- fit_one(sites,targets,y,"exponential",0.23,1,0.2,"simple")
  ref_pred <- c(1.1621284924560868, 0.28743599197036412, -0.036363731476523803, 0.095527383138362135)
  ref_pv <- c(0.16660588970529400, 0.91834432240097086, 0.94624816744711260, 0.78784137924694586)
  stopifnot(max(abs(result$pred-ref_pred))<1e-8)
  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))
  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)
  if("simple"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)
  tests <- tests+1L;cat("OK: simple_exponential_nugget — previsioni, varianze, vincoli R1 JS-R\n")
}
{ # ordinary_exponential_zero_nugget
  sites <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.69999999999999996, 0.10000000000000001, 0.20000000000000001, 0.84999999999999998, 0.90000000000000002, 0.69999999999999996),ncol=2,byrow=TRUE)
  targets <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.20000000000000001, 0.20000000000000001, 0.50000000000000000, 0.40000000000000002, 0.84999999999999998, 0.84999999999999998),ncol=2,byrow=TRUE)
  y <- c(1.3999999999999999, -0.90000000000000002, 0.50000000000000000, 0.20000000000000001)
  result <- fit_one(sites,targets,y,"exponential",0.31,1.2,0,"ordinary")
  ref_pred <- c(1.4000000000000001, 0.57072810977889832, 0.087433874796658664, 0.26124642886928640)
  ref_pv <- c(0.0000000000000000, 1.0153417646262366, 1.0637494874857736, 0.80458356254102603)
  stopifnot(max(abs(result$pred-ref_pred))<1e-8)
  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))
  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)
  if("ordinary"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)
  tests <- tests+1L;cat("OK: ordinary_exponential_zero_nugget — previsioni, varianze, vincoli R1 JS-R\n")
}
{ # ordinary_spherical_nugget
  sites <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.69999999999999996, 0.10000000000000001, 0.20000000000000001, 0.84999999999999998, 0.90000000000000002, 0.69999999999999996),ncol=2,byrow=TRUE)
  targets <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.20000000000000001, 0.20000000000000001, 0.50000000000000000, 0.40000000000000002, 0.84999999999999998, 0.84999999999999998),ncol=2,byrow=TRUE)
  y <- c(1.3999999999999999, -0.90000000000000002, 0.50000000000000000, 0.20000000000000001)
  result <- fit_one(sites,targets,y,"spherical",0.65,2,0.15,"ordinary")
  ref_pred <- c(1.3232786451588909, 0.62551531471519140, 0.018492650208489794, 0.24110361140214615)
  ref_pv <- c(0.14215247997562486, 1.8914196651237369, 2.1009115187872260, 1.3198014119165529)
  stopifnot(max(abs(result$pred-ref_pred))<1e-8)
  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))
  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)
  if("ordinary"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)
  tests <- tests+1L;cat("OK: ordinary_spherical_nugget — previsioni, varianze, vincoli R1 JS-R\n")
}
{ # simple_gaussian_nugget
  sites <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.69999999999999996, 0.10000000000000001, 0.20000000000000001, 0.84999999999999998, 0.90000000000000002, 0.69999999999999996),ncol=2,byrow=TRUE)
  targets <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.20000000000000001, 0.20000000000000001, 0.50000000000000000, 0.40000000000000002, 0.84999999999999998, 0.84999999999999998),ncol=2,byrow=TRUE)
  y <- c(1.3999999999999999, -0.90000000000000002, 0.50000000000000000, 0.20000000000000001)
  result <- fit_one(sites,targets,y,"gaussian",0.28,0.8,0.05,"simple")
  ref_pred <- c(1.3175637193247880, 0.44673306898022164, -0.13569808478654569, 0.14157265632389812)
  ref_pv <- c(0.047058815996837478, 0.70120022701989981, 0.77101647497527936, 0.40206823211103176)
  stopifnot(max(abs(result$pred-ref_pred))<1e-8)
  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))
  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)
  if("simple"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)
  tests <- tests+1L;cat("OK: simple_gaussian_nugget — previsioni, varianze, vincoli R1 JS-R\n")
}
{ # IDW_exact_and_interior
  sites <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.69999999999999996, 0.10000000000000001, 0.20000000000000001, 0.84999999999999998, 0.90000000000000002, 0.69999999999999996),ncol=2,byrow=TRUE)
  targets <- matrix(c(0.0000000000000000, 0.0000000000000000, 0.20000000000000001, 0.20000000000000001, 0.50000000000000000, 0.40000000000000002, 0.84999999999999998, 0.84999999999999998),ncol=2,byrow=TRUE)
  y <- c(1.3999999999999999, -0.90000000000000002, 0.50000000000000000, 0.20000000000000001)
  result <- fit_one(sites,targets,y,"exponential",0.3,1,0.1,"idw")
  ref_pred <- c(1.3999999999999999, 0.77212314436584595, -0.056924977431462999, 0.19240907455551065)
  ref_pv <- c(NA_real_, NA_real_, NA_real_, NA_real_)
  stopifnot(max(abs(result$pred-ref_pred))<1e-8)
  stopifnot(identical(is.na(result$pv),is.na(ref_pv)))
  stopifnot(max(abs(result$pv[is.finite(ref_pv)]-ref_pv[is.finite(ref_pv)]),0)<1e-8)
  if("idw"=="ordinary") stopifnot(max(abs(colSums(result$W)-1))<1e-10)
  tests <- tests+1L;cat("OK: IDW_exact_and_interior — previsioni, varianze, vincoli R1 JS-R\n")
}
stopifnot(tests==5L)
cat("OK: LAB 30: cinque scenari JS-R, identità numeriche R1 confermate\n")
# gstat è un riferimento metodologico ulteriore, non richiesto per i cinque benchmark.
# Per gstat il parametro psill/nugget va configurato coerentemente con l’obiettivo LATENTE.
