#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("ggplot2"))
suppressPackageStartupMessages(library("ggpubr"))
suppressPackageStartupMessages(library("plotly"))
suppressPackageStartupMessages(library("htmlwidgets"))

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
parser$add_argument("-c", "--correlation", type="character", default="pearson",
                    help="type of correlation measure [default %(default)s]",
                    choices=c("pearson","spearman","kendall"))
add.common.arguments(parser)

args <- parser$parse_args()

# args <- list(
#   "fragment"="tRF-30-86J8WPMN1E8Y",
#   "gene"="ERBB2",
#   "dataset"="TCGA-BRCA",
#   "expressions"="./expressions_by_dataset",
#   "output"="test.json",
#   "subtypes"="BRCA.Basal",
#   "sample_types"="Primary Solid Tumor",
#   "type"="genes",
#   "correlation"="spearman",
#   "covariates"="tumor_purity"
# )

fragment     <- args$fragment
gene         <- args$gene
dataset      <- args$dataset
exp_dir      <- args$expressions
output       <- args$output
subtypes     <- args$subtypes
sample_types <- args$sample_types
type         <- args$type
corr.measure <- args$correlation
covariates   <- args$covariates

if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}
if (!type %in% c("genes", "mirnas")) {
  stop(sprintf("Specified type ( %s ) is invalid", type))
}
if (!corr.measure %in% c("pearson", "kendall", "spearman")) {
  stop(sprintf("Specified correlation measure ( %s ) is invalid", type))
}

meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", dataset))
exp.file  <- file.path(exp_dir, sprintf("%s_counts.rds", dataset))
if (!file.exists(meta.file) || !file.exists(exp.file)) {
  stop(sprintf("Specified dataset ( %s ) is invalid", dataset))
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

meta <- read.and.filter.metadata(meta.file, sample_types, subtypes)
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
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


covariates <- parse.covariates(covariates, meta)
exp       <- normalize.external(exprs = exp, meta = meta, covariates = covariates)
gene.exps <- normalize.external(exprs = gene.exps, meta = meta, covariates = covariates)
common.samples <- intersect(intersect(colnames(exp), colnames(gene.exps)), meta$sample_id)
meta <- meta[meta$sample_id %in% common.samples,,drop=FALSE]

exp       <- exp[fragment,meta$sample_id]
gene.exps <- gene.exps[gene.id,meta$sample_id]

df.data <- data.frame(
  id=meta$sample_id,
  sample_type=meta$sample_type,
  x=gene.exps,
  y=exp
)

yr <- range(df.data$y)

p <- ggscatter(df.data, x = "x", y = "y",
                add = "reg.line", conf.int = TRUE) + 
  ylim(yr[1], yr[2] + 2) +
  stat_cor(method = corr.measure, output.type	= "text",
           label.x.npc = "center", label.y.npc = "top",
           digits = 4) +
  xlab(gene.id) +
  ylab(fragment)
pp <- ggplotly(p)
writeLines(toJSON(pp$x), output)

