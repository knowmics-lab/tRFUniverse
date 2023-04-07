#!/usr/bin/env Rscript

check.installed <- function (requirements) {
  installed  <- rownames(installed.packages())
  to.install <- requirements[!(requirements %in% installed)]
  return (to.install)
}

install.packages("BiocManager")
BiocManager::install(version = "3.16", ask = FALSE)

required.packages <- c(
  "Glimma", "MASS", "argparse", "edgeR", "ggfortify", "ggplot2", "ggpubr",
  "htmlwidgets", "jsonlite", "limma", "plotly", "sfsmisc", "survival",
  "survminer", "qvalue", "ica", "Rtsne", "uwot", "devtools", "gtools", "readr", 
  "base64enc", "clusterProfiler", "DOSE", "ReactomePA", "org.Hs.eg.db"
)
to.install <- check.installed(required.packages)
count <- 1
while(length(to.install) > 0) {
  BiocManager::install(to.install, ask = FALSE)
  to.install <- check.installed(required.packages)
  count      <- count + 1
  if (count > 3) {
    q(save = "no", status = 1)
  }
}

devtools::install_github("alaimos/morpheus.R")
