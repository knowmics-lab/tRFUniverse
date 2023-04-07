#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("jsonlite"))

parser <- ArgumentParser()
parser$add_argument("-f", "--fragment", type="character",
                    help="the fragment to get the enrichment results",
                    required=TRUE)
parser$add_argument("-e", "--enrichment", type="character",
                    help="enrichment output directory",
                    required=TRUE)
parser$add_argument("-o", "--output", type="character",
                    help="output file",
                    required=TRUE)
args <- parser$parse_args()
#   c(
#     "-f", "tRF-28-YO1N7KYUSRV", "-e", "./enrichment_output_hashed",
#     "-o", "./test.json"
#   )
# )

fragment       <- args$fragment
enrichment_rds <- args$enrichment
out_file       <- args$output

if (!dir.exists(enrichment_rds)) {
  stop(sprintf("Specified enrichment directory ( %s ) does not exist", enrichment_rds))
}

fragment_hash      <- substr(digest::digest(fragment, "md5"), 1, 2)
dataset_path       <- file.path(enrichment_rds, paste0(fragment_hash, ".rds"))
enrichment_dataset <- readRDS(dataset_path)

output <- NULL
if (fragment %in% names(enrichment_dataset)) {
  output <- enrichment_dataset[[fragment]]$results
}

writeLines(jsonlite::toJSON(output), out_file)
