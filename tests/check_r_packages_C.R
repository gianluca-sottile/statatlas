#!/usr/bin/env Rscript
# Macrofase C: preflight delle dipendenze R.
# L'espressione e' in un file R dedicato per evitare problemi di quoting nella shell.
required <- c("tidyverse", "quantreg", "glmnet", "segmented", "cluster")
present <- vapply(required, requireNamespace, logical(1), quietly = TRUE)
missing <- required[!present]
if (length(missing)) {
  cat("MISSING R PACKAGES: ", paste(missing, collapse = ", "), "\n", sep = "")
  quoted <- sprintf('"%s"', missing)
  cat("Run in R: install.packages(c(", paste(quoted, collapse = ", "), "))\n", sep = "")
  quit(save = "no", status = 2L)
}
cat("PASS: Macrofase C R dependencies (", paste(required, collapse = ", "), ")\n", sep = "")
