#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("plyr"))
suppressPackageStartupMessages(library("ggplot2"))
suppressPackageStartupMessages(library("ggfortify"))
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
parser$add_argument("-d", "--datasets", type="character", action="extend", nargs="+",
                    help="datasets used to compute dimensionality reduction",
                    required=TRUE)
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
parser$add_argument("-c", "--color", type="character", action="extend", nargs="+",
                    help="which variable/s are used to color points",
                    choices=c("dataset", "sample_type", "subtype_selected", "tissue"))
parser$add_argument("-z", "--scaling", action="store_true", default=FALSE,
                    help="enable z-score scaling")
parser$add_argument("-m", "--method", type="character", default="pca",
                    help="method used for dimensionality reduction [default %(default)s]",
                    choices=c("pca","mds","ica","tsne", "umap"))
parser$add_argument("-p", "--perplexity", type="double", default=10,
                    help="perplexity used for t-SNE [default %(default)f]")
parser$add_argument("-f", "--filtering", action="store_true", default=FALSE,
                    help="enable filtering")
parser$add_argument("-t", "--top", type="integer", default=100,
                    help="the top number of fragments to extract [default %(default)d]")
parser$add_argument("-M", "--measure", type="character", default="mad",
                    help="the value used to sort fragments for filtering",
                    choices=c("mad", "variance", "absolute_median", "absolute_mean"))
add.common.arguments(parser)

args <- parser$parse_args()
#   c("-d", "TCGA-BRCA", "-e", "./expressions_by_dataset",
#     "-o", "test.json", "-c", "sample_type", "subtype", "-m", "tsne", "-p", "10",
#     "-a", "Primary Solid Tumor", "-v", "tumor_purity")
# )

if (is.null(args$color)) {
  args$color <- "dataset"
}

datasets     <- args$datasets
exp_dir      <- args$expressions
dr_method    <- args$method
output       <- args$output
do_scaling   <- args$scaling
color_by     <- args$color
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

meta           <- prepare.meta(meta, c(color_by, covariates), merge.vars = color_by, merged.name = "color")
if (length(levels(factor(meta[["color"]]))) > 1) {
  main.vars    <- "color"
} else {
  main.vars    <- character(0)
}
covariates     <- parse.covariates(covariates, meta)
exp            <- normalize.external(exprs = exp, meta = meta, 
                                     covariates = covariates, 
                                     main.formula.var = main.vars, 
                                     filter.by.expr = !has.fluids)
common.samples <- intersect(meta$sample_id, colnames(exp))
meta           <- meta[meta$sample_id %in% common.samples,,drop=FALSE]
exp            <- exp[,meta$sample_id,drop=FALSE]
meta           <- meta[,c("sample_id", "color")]

if (filtering) {
  measure.function <- switch(measure, mad=mad, variance=var,
                             absolute_median=function(x)(abs(median(x))),
                             absolute_mean=function(x)(abs(mean(x))))
  topN <- min(topN, nrow(exp))
  exp  <- exp[names(sort(apply(exp, 1, measure.function), decreasing = TRUE))[1:topN],,drop=FALSE]
}

if (do_scaling) {
  exp <- t(scale(t(exp)))
}

meta$color <- gsub("_", " ", as.character(meta$color), fixed = TRUE)

x.label <- "Component 1"
y.label <- "Component 2"
p       <- NULL
data_df <- NULL
if (dr_method == "pca") {
  pca_data <- prcomp(t(exp), center = FALSE, scale. = FALSE)
  p        <- autoplot(pca_data, data=meta, colour="color")
} else if (dr_method == "mds") {
  dists    <- dist(t(exp))
  mds_data <- cmdscale(dists, eig = TRUE, k = 2)
  data_df  <- data.frame(
    "C1"=mds_data$points[, 1],
    "C2"=mds_data$points[, 2],
    "label"=meta$sample_id,
    "color"=meta$color
  )
  x.label <- "MDS1"
  y.label <- "MDS2"
} else if (dr_method == "ica") {
  suppressPackageStartupMessages(library("ica"))
  ica_data <- icafast(t(exp), nc = 2, center = FALSE)
  data_df  <- data.frame(
    "C1"=ica_data$Y[, 1],
    "C2"=ica_data$Y[, 2],
    "label"=meta$sample_id,
    "color"=meta$color
  )
  x.label  <- "ICA1"
  y.label  <- "ICA2"
} else if (dr_method == "tsne") {
  suppressPackageStartupMessages(library("Rtsne"))
  ts_data  <- Rtsne(t(exp), pca = FALSE, perplexity = args$perplexity, theta = 0.0)
  data_df  <- data.frame(
    "C1"=ts_data$Y[, 1],
    "C2"=ts_data$Y[, 2],
    "label"=meta$sample_id,
    "color"=meta$color
  )
  x.label  <- "t-SNE 1"
  y.label  <- "t-SNE 2"
} else if (dr_method == "umap") {
  suppressPackageStartupMessages(library("uwot"))
  um_data  <- umap(t(exp))
  data_df  <- data.frame(
    "C1"=um_data[, 1],
    "C2"=um_data[, 2],
    "label"=meta$sample_id,
    "color"=meta$color
  )
  x.label  <- "UMAP1"
  y.label  <- "UMAP2"
}
if (is.null(p)) {
  p <- ggplot(
    data_df, 
    aes(x = C1, y = C2, label = label, col = color)
  ) + 
    geom_point() + xlab(x.label) + ylab(y.label)
  
}
pp <- ggplotly(p)
writeLines(toJSON(pp$x), output)

