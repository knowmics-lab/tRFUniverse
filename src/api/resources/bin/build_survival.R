#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("ggpubr"))
suppressPackageStartupMessages(library("plotly"))
suppressPackageStartupMessages(library("htmlwidgets"))
suppressPackageStartupMessages(library("survival"))
suppressPackageStartupMessages(library("ggfortify"))

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
                    help="tRF fragment used to perform the analysis")
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

dataset      <- args$dataset
fragment     <- args$fragment
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

status_var          <- paste0(meta_var,"_status")
sel_meta            <- meta[,c("sample_id", meta_var, status_var)]
colnames(sel_meta)  <- c("sample_id", "time", "status")
sel_meta$expression <- unname(exp[fragment,sel_meta$sample_id])
sel_meta            <- na.omit(sel_meta)
if (nrow(sel_meta) == 0) {
  stop("No samples found with the input criteria")
}
sel_meta            <- apply.censoring(sel_meta, left_cens, right_cens)
if (nrow(sel_meta) == 0) {
  stop("No samples found with the input criteria")
}

th_high <- quantile(sel_meta$expression, args$cutoff_high, names = FALSE)
th_low  <- quantile(sel_meta$expression, args$cutoff_low, names = FALSE)

sel_meta$fragment_expression <- NA
sel_meta$fragment_expression[sel_meta$expression > th_high] <- "High exp. group"
sel_meta$fragment_expression[sel_meta$expression < th_low] <- "Low exp. group"
sel_meta$fragment_expression <- factor(
  sel_meta$fragment_expression, levels=c("High exp. group", "Low exp. group")
)
sel_meta <- na.omit(sel_meta)

if (nrow(sel_meta) == 0) {
  stop("No samples found with the input criteria")
}

sel_meta$status <- sapply(strsplit(sel_meta$status, ":"), function (x)(as.numeric(x[1])))

fit <- survfit(Surv(time, status) ~ fragment_expression, data=sel_meta)
cox <- coxph(Surv(time, status) ~ fragment_expression, data=sel_meta)

y_lab <- switch (meta_var,
  OS="Overall survival probability",
  DFS="Disease-free surivivl probability",
  DSS="Disease-specific survival probability",
  PFS="Progression-free survival probability"
)

pv <- summary(cox)$logtest["pvalue"]
hr <- summary(cox)$coefficients[1,2]

p <- ggplot2::autoplot(
  fit, conf.int=FALSE, 
  censor.shape="+",
  censor.size=1,
  xlab="Time (months)",
  ylab=y_lab
) + labs(
  title = paste0(
    "p = ", 
    round(pv * 10000) / 10000,
    "; HR = ",
    round(hr * 10000) / 10000
  )
)

pp <- ggplotly(p)
writeLines(toJSON(pp$x), output)


