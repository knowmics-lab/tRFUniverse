#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("plyr"))
suppressPackageStartupMessages(library("morpheus"))
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
parser$add_argument("-d", "--datasets", type="character", action="extend", nargs="+",
                    help="datasets used to compute the clustering",
                    required=TRUE)
parser$add_argument("-m", "--metadata", type="character", action="extend", nargs="+",
                    help="metadata used to annotate clusters")
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
parser$add_argument("-f", "--filtering", action="store_true", default=FALSE,
                    help="enable filtering")
parser$add_argument("-t", "--top", type="integer", default=100,
                    help="the top number of fragments to extract [default %(default)d]")
parser$add_argument("-M", "--measure", type="character", default="mad",
                    help="the value used to sort fragments for filtering",
                    choices=c("mad", "variance", "absolute_median", "absolute_mean"))
add.common.arguments(parser)

args <- parser$parse_args()
#   c("-d", "TCGA-LUAD", "TCGA-LUSC", "-e", "./expressions_by_dataset",
#     "-o", "test1.json", "-m", "age",
#     "-a", "Primary Solid Tumor", "-v", "tumor_purity")
# )

datasets     <- args$datasets
metadata     <- args$metadata
exp_dir      <- args$expressions
output       <- args$output
subtypes     <- args$subtypes
sample_types <- args$sample_types
covariates   <- args$covariates
filtering    <- args$filtering
topN         <- max(10, args$top)
measure      <- args$measure
has.fluids   <- all(datasets == "fluids")
if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}
if (length(datasets) == 0) {
  stop("You must specify at least one dataset")
}

data <- Filter(
  function(x)(nrow(x$meta) > 0),
  lapply(datasets, function(d) {
    meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", d))
    exp.file  <- file.path(exp_dir, sprintf("%s_counts.rds", d))
    if (!file.exists(meta.file) || !file.exists(exp.file)) {
      stop(sprintf("Specified dataset ( %s ) is invalid", d))
    }
    meta <- read.and.filter.metadata(meta.file, sample_types, subtypes)
    exp  <- readRDS(exp.file)
    return (list(
      "meta"=meta,
      "exp"=exp
    ))
  })
)
if (length(data) == 0) {
  stop("No samples found with the input criteria")
}
meta <- do.call(plyr::rbind.fill, lapply(data, function(x)(x$meta)))
exp  <- do.call(cbind, lapply(data, function(x)(x$exp)))

meta           <- prepare.meta(meta, metadata)

main.vars <- Filter(
  function(m)(length(levels(factor(meta[[m]]))) > 1),
  metadata
)
covariates     <- parse.covariates(covariates, meta)
exp            <- normalize.external(exprs = exp, meta = meta,
                                     covariates = covariates,
                                     main.formula.var = main.vars,
                                     filter.by.expr = !has.fluids)
common.samples <- intersect(meta$sample_id, colnames(exp))
meta           <- meta[meta$sample_id %in% common.samples,,drop=FALSE]
exp            <- exp[,meta$sample_id,drop=FALSE]

if (filtering) {
  measure.function <- switch(measure, mad=mad, variance=var,
                             absolute_median=function(x)(abs(median(x))),
                             absolute_mean=function(x)(abs(mean(x))))
  topN <- min(topN, nrow(exp))
  exp  <- exp[names(sort(apply(exp, 1, measure.function), decreasing = TRUE))[1:topN],,drop=FALSE]
}

columnAnnots   <- NULL
if (ncol(meta) > 1) {
  columnAnnots <- meta[,-1,drop=FALSE]
}
morph          <- morpheus(
  exp,
  colorScheme=list(
    scalingMode="relative",
    values=c(0, 0.5, 1),
    colors=c("#0000FF", "#FFFFFF", "#FF0000"),
    transformValues=1
  ),
  columnAnnotations=columnAnnots,
  overrideColumnDefaults=FALSE,
  dendrogram = "both",
  columns=lapply(
    metadata,
    function (m)(list(field=m, highlightMatchingValues=TRUE, display=list("color")))
  )
)
writeLines(toJSON(morph$x), output)

