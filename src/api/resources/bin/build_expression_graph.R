#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("ggpubr"))
suppressPackageStartupMessages(library("plotly"))

source_local <- function(fname, ...){
  argv <- commandArgs(trailingOnly = FALSE)
  base_dir <- dirname(substring(argv[grep("--file=", argv)], 8))
  if (length(base_dir) == 0) base_dir <- dirname(sys.frame(1)$ofile)
  if (!dir.exists(base_dir)) stop("Unable to determine current directory!")
  source(file.path(base_dir, fname), ...)
}
source_local("common_normalize.R")

parser <- ArgumentParser()
parser$add_argument("-d", "--dataset", type="character",
                    help="dataset used to build the graph",
                    required=TRUE)
parser$add_argument("-f", "--fragment", type="character",
                    help="tRF fragment used to build the graph",
                    required=TRUE)
parser$add_argument("-m", "--metadata", type="character",
                    help="metadata variable used to build the graph",
                    required=TRUE)
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
parser$add_argument("-t", "--type", type="character", default="rpm",
                    help="type of expression data [default %(default)s]",
                    choices=c("rpm", "counts", "norm_counts"))
add.common.arguments(parser, subtypes.filter = FALSE, sample.type.filter = FALSE)
args <- parser$parse_args()
#   c('-d', 'TCGA-BRCA', '-f', 'tRF-30-86J8WPMN1E8Y', '-m', 'subtype_selected',
#   '-t', 'norm_counts', '-o', 'b31e74e39f7299c32794f44ed69ba8e2.json',
#   '-e', './expressions_by_dataset/')
# )

dataset    <- args$dataset
fragment   <- args$fragment
meta_var   <- args$metadata
exp_dir    <- args$expressions
output     <- args$output
type       <- args$type
covariates <- args$covariates
normalize  <- FALSE

if (is.null(dataset)) {
  stop("Dataset is required")
}
if (is.null(meta_var)) {
  stop("Metadata variable is required")
}
if (is.null(exp_dir)) {
  stop("Expressions directory is required")
}
if (is.null(fragment)) {
  stop("Fragment name is required")
}
if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}
if (!type %in% c("rpm", "counts", "norm_counts")) {
  stop(sprintf("Specified type ( %s ) is invalid", type))
}
if (type == "norm_counts") {
  type      <- "counts"
  normalize <- TRUE
}

meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", dataset))
exp.file  <- file.path(exp_dir, sprintf("%s_%s.rds", dataset, type))
if (!file.exists(meta.file) || !file.exists(exp.file)) {
  stop(sprintf("Specified dataset ( %s ) is invalid", dataset))
}

meta <- read.and.filter.metadata(meta.file)

exp  <- readRDS(exp.file)
if (!fragment %in% rownames(exp)) {
  stop(sprintf("Specified fragment name ( %s ) is invalid", fragment))
}

if (normalize) {
  covariates     <- parse.covariates(covariates, meta)
  exp            <- normalize.external(exp, meta, covariates)
  common.samples <- intersect(colnames(exp), meta$sample_id)
  meta           <- meta[meta$sample_id %in% common.samples,,drop=FALSE]
  exp            <- exp[,meta$sample_id,drop=FALSE]
}

sel_meta            <- na.omit(meta[,c("sample_id", meta_var)])
sel_meta$expression <- unname(exp[fragment,sel_meta$sample_id])

p     <- ggboxplot(sel_meta, x = meta_var, y = "expression", color = meta_var)
pp    <- ggplotly(p)
writeLines(toJSON(pp$x), output)
