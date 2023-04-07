#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("jsonlite"))

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
                    help="dataset used for the DEGs analysis",
                    required=TRUE)
parser$add_argument("-m", "--metadata", type="character", action="extend", nargs="+",
                    help="metadata variables used to perform the analysis",
                    required=TRUE)
parser$add_argument("-e", "--expressions", type="character",
                    help="expressions directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
args <- parser$parse_args()
#   c(
#     "-d", "TCGA-BRCA", "-e", "./expressions_by_dataset",
#     "-o", "./test.json", "-m", "sample_type", "-m", "subtype_selected"
#   )
# )

dataset         <- args$dataset
exp_dir         <- args$expressions
meta_vars       <- args$metadata
out_file        <- args$output

if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}

meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", dataset))
if (!file.exists(meta.file)) {
  stop(sprintf("Specified dataset ( %s ) is invalid", dataset))
}
meta <- read.and.filter.metadata(meta.file)
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}
meta <- prepare.meta(meta, meta_vars, merge.vars = meta_vars, merged.name = "comparison_variable")
values <- levels(meta$comparison_variable)
writeLines(jsonlite::toJSON(values), out_file)
