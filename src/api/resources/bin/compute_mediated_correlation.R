#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("ggplot2"))
suppressPackageStartupMessages(library("ggpubr"))
suppressPackageStartupMessages(library("plotly"))
suppressPackageStartupMessages(library("htmlwidgets"))
suppressPackageStartupMessages(library("MASS"))
suppressPackageStartupMessages(library("sfsmisc"))

source_local <- function(fname, ...){
  argv <- commandArgs(trailingOnly = FALSE)
  base_dir <- dirname(substring(argv[grep("--file=", argv)], 8))
  if (length(base_dir) == 0) base_dir <- dirname(sys.frame(1)$ofile)
  if (!dir.exists(base_dir)) stop("Unable to determine current directory!")
  source(file.path(base_dir, fname), ...)
}
source_local("common_normalize.R")

parser <- ArgumentParser()
parser$add_argument("-f", "--fragment", type="character",
                    help="tRF fragment used to perform the analysis",
                    required=TRUE)
parser$add_argument("-g", "--gene", type="character",
                    help="Gene/miRNA used to perform the analysis",
                    required=TRUE)
parser$add_argument("-m", "--metadata", type="character",
                    help="metadata variable used to build the graph",
                    required=TRUE)
parser$add_argument("-d", "--dataset", type="character",
                    help="dataset used to build the correlation analysis",
                    required=TRUE)
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
parser$add_argument("-t", "--type", type="character", default="genes",
                    help="type of expression data [default %(default)s]",
                    choices=c("genes","mirnas"))
add.common.arguments(parser)

args <- parser$parse_args()

# args <- list(
#   "fragment"="tRF-18-8R1546D2",
#   "gene"="ERBB2",
#   "metadata"="subtype_selected",
#   "dataset"="TCGA-BRCA",
#   "expressions"="./expressions_by_dataset",
#   "output"="test.json",
#   "type"="genes",
#   "covariates"="tumor_purity"
# )

fragment     <- args$fragment
gene         <- args$gene
meta.var     <- args$metadata
dataset      <- args$dataset
exp_dir      <- args$expressions
output       <- args$output
subtypes     <- args$subtypes
sample_types <- args$sample_types
type         <- args$type
covariates   <- args$covariates

if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}
if (!type %in% c("genes", "mirnas")) {
  stop(sprintf("Specified type ( %s ) is invalid", type))
}

meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", dataset))
exp.file  <- file.path(exp_dir, sprintf("%s_counts.rds", dataset))
if (!file.exists(meta.file) || !file.exists(exp.file)) {
  stop(sprintf("Specified dataset ( %s ) is invalid", dataset))
}

meta       <- read.and.filter.metadata(meta.file, sample_types, subtypes)
covariates <- parse.covariates(covariates, meta)
meta <- na.omit(meta[,c("sample_id", c(meta.var, covariates))])
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}
all.genes <- readRDS(file.path(exp_dir, sprintf("all_%s.rds", type)))
gene.id <- NULL
if (gene %in% all.genes$id) {
  gene.id <- gene
} else if (gene %in% all.genes$name) {
  gene.id <- all.genes$id[all.genes$name == gene]
}
if (is.null(gene.id)) {
  stop(sprintf("Specified gene ( %s ) is invalid", gene))
}
gene.exps <- readRDS(file.path(exp_dir, sprintf("%s_%s.rds", dataset, type)))
meta <- meta[meta$sample_id %in% intersect(meta$sample_id, colnames(gene.exps)),]
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}
exp  <- readRDS(exp.file)
if (!fragment %in% rownames(exp)) {
  stop(sprintf("Specified fragment name ( %s ) is invalid", fragment))
}

exp            <- normalize.external(exprs = exp, meta = meta,
                                     covariates = covariates,
                                     main.formula.var = meta.var)
gene.exps      <- normalize.external(exprs = gene.exps, meta = meta,
                                     covariates = covariates,
                                     main.formula.var = meta.var)
common.samples <- intersect(intersect(colnames(exp), colnames(gene.exps)), meta$sample_id)

meta      <- meta[meta$sample_id %in% common.samples,c("sample_id", meta.var),drop=FALSE]
exp       <- exp[,meta$sample_id,drop=FALSE]
gene.exps <- gene.exps[,meta$sample_id,drop=FALSE]

colnames(meta) <- c("sample_id", "meta.var")
meta$y         <- exp[fragment,]
meta$x         <- gene.exps[gene.id,]
meta$meta.var  <- factor(meta$meta.var)

subgroups_length <- length(levels(meta$meta.var))

p_interaction <- 1
if(subgroups_length == 2) {
  # gene_B ~ gene_A * subgroup
  lmfit <- stats::lm(y ~ x * meta.var, data=meta)
  p_interaction <- stats::coef(summary(lmfit))[4,4]
}
if(subgroups_length >= 3) {
  # one-way ANOVA
  # gene_B ~ gene_A * subgroup
  res_aov <- stats::aov(y ~ x * meta.var, data=meta)
  p_interaction <- summary(res_aov)[[1]][["Pr(>F)"]][3]
}

colnames(meta)[2] <- meta.var
p <- ggscatter(meta, x = "x", y = "y",
               color = meta.var, palette="jco",
               add = "reg.line", conf.int = TRUE) +
  ggtitle(paste("p = ", format.pval(p_interaction, digits = 4, eps = 0.01))) +
  xlab(gene.id) +
  ylab(fragment)
pp <- ggplotly(p)
writeLines(toJSON(pp$x), output)
