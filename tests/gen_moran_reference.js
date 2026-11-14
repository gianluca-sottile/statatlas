/* Genera verifica/verifica_moran.R: riferimenti numerici JS testabili con R base e spdep opzionale. */
const fs=require('fs'),path=require('path');global.window=global;
for(const f of ['dist.js','rng.js','spatial.js','spatial-areal.js'])require('../src/core/'+f);
const A=global.SA.spatialAreal,Sp=global.SA.spatial;
const R=path.join(__dirname,'..','verifica','verifica_moran.R');
const val=n=>Number(n).toPrecision(17);
const cases=[
  {kind:'rook',style:'row',pattern:'blocks',seed:11},
  {kind:'rook',style:'binary',pattern:'blocks',seed:11},
  {kind:'queen',style:'row',pattern:'checker',seed:11},
  {kind:'rook',style:'row',pattern:'iid',seed:2026},
  {kind:'queen',style:'binary',pattern:'trend',seed:2026},
  {kind:'rook',style:'row',pattern:'sar',seed:2026}
];
let lines=[
'# StatAtlas LAB 26 - verifica R1 Moran globale',
'# Generato da node tests/gen_moran_reference.js; Rscript verifica/verifica_moran.R',
'# Confronta stesse osservazioni, definizioni rook/queen, W, lag, I e speranza.',
'# Non richiede pacchetti; confronto con spdep opzionale se installato.',
'check <- function(name, x, expected, tol=1e-9) {',
'  if (!length(x) || length(x)!=length(expected) || any(!is.finite(x)) || max(abs(x-expected))>tol)',
'    stop(sprintf("FAIL %s: R=%s, JS=%s", name, paste(signif(x,7),collapse=","),paste(signif(expected,7),collapse=",")))',
'  cat("OK:",name,"\\n")',
'}',
'W_grid <- function(nr,nc,kind,style) {',
' n <- nr*nc; i <- seq_len(n); rr <- (i-1L) %/% nc; cc <- (i-1L) %% nc',
' W <- matrix(0,n,n)',
' for (k in i) {',
'  row <- if (kind=="rook") abs(rr-rr[k])+abs(cc-cc[k])==1 else',
'    pmax(abs(rr-rr[k]), abs(cc-cc[k]))==1',
'  row[k] <- FALSE; if (style=="row" && sum(row)>0) W[k,row] <- 1/sum(row) else W[k,row] <- 1',
' }',
' W',
'}',
'count <- 0L'
];
for(const c of cases){
  const x=A.generate(4,4,c.pattern,c.seed,0.6).x,W=Sp.weights(4,4,c.kind,c.style),m=A.moran(x,W);
  const desc=`${c.pattern}/${c.kind}/${c.style}`;
  lines.push('local({',` x <- c(${x.map(val).join(', ')})`, ` W <- W_grid(4L,4L,"${c.kind}","${c.style}")`,
    ' z <- x - mean(x); lag <- drop(W %*% z); S0 <- sum(W)',
    ' got <- length(x)/S0 * sum(z*lag)/sum(z^2)',
    ` check("${desc} I",got,${val(m.I)})`,
    ` check("${desc} S0",S0,${val(m.s0)})`,
    ` check("${desc} lag [1,6,16]",lag[c(1,6,16)],c(${[m.lag[0],m.lag[5],m.lag[15]].map(val).join(', ')}))`,
    ' check("E[I] sotto permutazione", -1/(length(x)-1), -1/15)',
    ' if (requireNamespace("spdep",quietly=TRUE)) {',
    '   nb <- lapply(seq_len(nrow(W)),function(i) as.integer(which(W[i,]!=0)))',
    '   class(nb) <- "nb"; attr(nb,"region.id") <- as.character(seq_len(nrow(W)))',
    '   attr(nb,"type") <- "user"; attr(nb,"sym") <- TRUE',
    '   lw <- spdep::nb2listw(nb, style=if ("'+c.style+'"=="row") "W" else "B",zero.policy=TRUE)',
    '   ans <- spdep::moran(x,lw,n=length(x),S0=spdep::Szero(lw))',
    `   check("${desc} spdep",ans$I,got)`,
    ' }',
    '})', 'count <- count + 1L');
}
lines.push(
'local({',
' x <- c(1,2,3,4,5,6); W <- W_grid(2,3,"rook","binary"); z <- x-mean(x); S0 <- sum(W)',
' # 6! permutazioni: conferma la media esatta',
' tot <- 0; nperm <- 0L',
' recurse <- function(v,left) {',
'   if (!length(left)) { tot <<- tot + length(v)/S0 * sum((v-mean(v)) * drop(W %*% (v-mean(v)))) / sum((v-mean(v))^2); nperm <<- nperm+1L; return() }',
'   for (j in seq_along(left)) recurse(c(v,left[j]),left[-j])',
' }',
' recurse(numeric(),1:6)',
' check("6! permutazioni - speranza esatta", c(tot/nperm, nperm),c(-1/5,720))',
'})',
'cat("LAB 26: ",count," scenari Moran JS/R verificati.\\n",sep="")',
);
fs.writeFileSync(R,lines.join('\n')+'\n');
console.log('Generato verifica/verifica_moran.R per',cases.length,'scenari');
