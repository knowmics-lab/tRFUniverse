#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("survival"))
suppressPackageStartupMessages(library("jsonlite"))
suppressPackageStartupMessages(library("qvalue"))

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
                    help="dataset used to build the survival analysis",
                    required=TRUE)
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
parser$add_argument("-m", "--metadata", type="character", default="OS",
                    help="metadata variable used to perform the analysis [default %(default)s]",
                    choices=c("OS","DFS", "DSS", "PFS"))
parser$add_argument("-i", "--cutoff-high", type="double", default=0.5,
                    help="quartile high cutoff (between 0 and 1) [default %(default).2f]")
parser$add_argument("-l", "--cutoff-low", type="double", default=0.5,
                    help="quartile low cutoff (between 0 and 1) [default %(default).2f]")
parser$add_argument("-t", "--type", type="character", default="rpm",
                    help="type of expression data [default %(default)s]",
                    choices=c("rpm", "counts", "norm_counts"))
add.common.arguments(parser)
add.censoring.arguments(parser)

args <- parser$parse_args()
#   c(
#     "-d", "TCGA-BRCA", "-m", "OS", "-e", "./expressions_by_dataset",
#     "-o", "test.json", "-s", "BRCA.Basal", "-a", "Primary Solid Tumor", 
#     "-v", "purity", "-t", "rpm", "-i", "0.75", "-l", "0.25",
#     "-L", "3", "-R", "60"
#   )
# )

dataset      <- args$dataset
meta_var     <- args$metadata
exp_dir      <- args$expressions
output       <- args$output
subtypes     <- args$subtypes
sample_types <- args$sample_types
type         <- args$type
cutoff_high  <- args$cutoff_high
cutoff_low   <- args$cutoff_low
covariates   <- args$covariates
left_cens    <- args$left_censoring
right_cens   <- args$right_censoring
normalize    <- FALSE

if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}
if (!meta_var %in% c("OS", "DFS", "DSS", "PFS")) {
  stop(sprintf("Specified metadata variable ( %s ) is invalid", type))
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

meta <- read.and.filter.metadata(meta.file, sample_types, subtypes)
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}

exp  <- readRDS(exp.file)
if (normalize) {
  covariates     <- parse.covariates(covariates, meta)
  exp            <- normalize.external(exp, meta, covariates)
  common.samples <- intersect(colnames(exp), meta$sample_id)
  meta           <- meta[meta$sample_id %in% common.samples,,drop=FALSE]
  exp            <- exp[,meta$sample_id,drop=FALSE]
}

status_var <- paste0(meta_var,"_status")

sel_meta <- meta[,c("sample_id", meta_var, status_var)]
colnames(sel_meta) <- c("sample_id", "time", "status")
sel_meta$status <- sapply(strsplit(sel_meta$status, ":"), function (x)(as.numeric(x[1])))
sel_meta <- na.omit(sel_meta)
if (nrow(sel_meta) == 0) {
  stop("No samples found with the input criteria")
}
sel_meta <- apply.censoring(sel_meta, left_cens, right_cens)
if (nrow(sel_meta) == 0) {
  stop("No samples found with the input criteria")
}
sel_expression <- exp[,sel_meta$sample_id]
sel_expression <- sel_expression[apply(sel_expression, 1, function(x)(!all(x == 0))),]

thresholds <- t(apply(sel_expression, 1, function (x) (
  quantile(x, c(args$cutoff_high, args$cutoff_low), names = FALSE)
)))

valid <- apply(thresholds, 1, function(x)(all(x > 0)))

sel_expression <- sel_expression[valid,,drop=FALSE]
thresholds     <- thresholds[valid,,drop=FALSE]

results <- t(sapply(1:nrow(thresholds), function (i) {
  
  th_high <- thresholds[i,1]
  th_low  <- thresholds[i,2]
  
  mm <- sel_meta
  mm$expression <- unname(sel_expression[i,])
  mm$fragment_expression <- NA
  mm$fragment_expression[mm$expression > th_high] <- "High exp. group"
  mm$fragment_expression[mm$expression < th_low] <- "Low exp. group"
  mm$fragment_expression <- factor(
    mm$fragment_expression, levels=c("High exp. group", "Low exp. group")
  )
  mm <- na.omit(mm)
  
  if (all(mm$fragment_expression == mm$fragment_expression[1])) {
    return (c(0,1))
  }
  if (nrow(mm) == 0) {
    return (c(0, 1))
  }
  cox <- coxph(Surv(time, status) ~ fragment_expression, data=mm)
  return (unname(summary(cox)$coefficients[1,c(2,5)]))
  pv <- summary(cox)$logtest["pvalue"]
}))
colnames(results) <- c("HR", "p")
colnames(thresholds) <- c("th_high", "th_low")
results <- data.frame(
  id=rownames(thresholds), thresholds, results, 
  check.names = FALSE, stringsAsFactors = FALSE
)
results$q <- qvalue::qvalue(results$p)$qvalues
results   <- results[order(results$q, results$p, decreasing = FALSE),]
writeLines(jsonlite::toJSON(results), output)

