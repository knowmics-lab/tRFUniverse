#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("jsonlite"))
suppressPackageStartupMessages(library("dplyr"))
suppressPackageStartupMessages(library("org.Hs.eg.db"))

source_local <- function(fname, ...){
  argv <- commandArgs(trailingOnly = FALSE)
  base_dir <- dirname(substring(argv[grep("--file=", argv)], 8))
  if (length(base_dir) == 0) base_dir <- dirname(sys.frame(1)$ofile)
  if (!dir.exists(base_dir)) stop("Unable to determine current directory!")
  source(file.path(base_dir, fname), ...)
}
source_local("common_normalize.R")

parser <- ArgumentParser()
parser$add_argument("-f", "--fragment", type="character", required=TRUE,
                    help="tRF fragment used to perform the analysis")
parser$add_argument("-t", "--target-directory", type="character", required=TRUE,
                    help="directory where targets indexes are stored")
parser$add_argument("-o", "--output", type="character", required=TRUE,
                    help="output file (PHENSIM input file)")
parser$add_argument("-O", "--table", type="character", required=TRUE,
                    help="output file (Output table)")
parser$add_argument("-e", "--filter-evidence", type="character", 
                    action="extend", nargs="+", default=NULL,
                    help="filter targets by evidence source [default NO FILTER]")
parser$add_argument("-d", "--filter-dataset", type="character", default=NULL,
                    help="filter targets by activity in a dataset [default NO FILTER]")
parser$add_argument("-p", "--filter-pvalue", type="character", default=0.05,
                    help="the p-value used to determine if activity in a dataset is significant [default %(default)s]")
args <- parser$parse_args()
#   c(
#     "-f", "tRF-30-86J8WPMN1E8Y", "-t",
#     "../repos/tRFUniverse/src/api/storage/app/public/lfcs_matrices",
#     "-o", "test.tsv", "-O", "table.json", "-e", "CLASH", "CLIP-Seq"
#     , "-d", "TCGA-THCA", "-p", "0.8"
#   )
# )

fragment        <- args$fragment
target_dir      <- args$target_directory
filter_dataset  <- args$filter_dataset
filter_evidence <- args$filter_evidence
filter_p        <- args$filter_pvalue
output          <- args$output
output.table    <- args$table
fragment_hash   <- substr(digest::digest(fragment, algo="md5"),1,2)
index_file      <- file.path(target_dir, paste0(fragment_hash, ".rds"))

if (!dir.exists(target_dir)) {
  stop(sprintf("Specified index directory ( %s ) does not exist", target_dir))
}
if (!file.exists(index_file)) {
  stop(sprintf("Unable to find index file ( %s ) for fragment %s", index_file, fragment))
}
if (!is.null(filter_dataset)) {
  if (is.null(filter_p)) filter_p <- 0.05
  filter_p <- max(0, min(filter_p, 1))
}

targets   <- readRDS(index_file)
grid.exps <- data.frame(genes = character(0), fragment = character(0))
if (fragment %in% names(targets)) {
  fragment_targets <- targets[[fragment]]
  if (!is.null(filter_evidence) && length(filter_evidence) > 0) {
    fragment_targets <- fragment_targets[sapply(fragment_targets, function(x)(any(filter_evidence %in% unlist(strsplit(x$evidences, ",", fixed = TRUE)))))]
  }
  if (!is.null(filter_dataset) && length(filter_dataset) > 0 && nchar(filter_dataset) > 0) {
    convert.to.names <- function (x) (gsub("[[:punct:]\\s]+", "_", x, perl = TRUE))
    filter_dataset <- convert.to.names(filter_dataset)
    fragment_targets <- fragment_targets[sapply(fragment_targets, function(x) (any(x$p[startsWith(names(x$p), filter_dataset)] < filter_p)))]
  }
  grid.exps <- data.frame(genes = names(fragment_targets), fragment = fragment, stringsAsFactors = FALSE)
}

if (nrow(grid.exps) > 0) {
  grid.exps$orig  <- grid.exps$genes
  grid.exps$genes <- sapply(strsplit(grid.exps$genes, ".", fixed = TRUE), function(x)(x[1]))
  map             <- AnnotationDbi::select(org.Hs.eg.db, unique(grid.exps$genes), c("ENTREZID", "SYMBOL"), "ENSEMBL")
  colnames(map)   <- c("genes", "entrez_id", "symbol")
  map             <- unique(na.omit(map))
  grid.exps       <- grid.exps %>% inner_join(map)
  grid.exps$dir   <- "UNDEREXPRESSION"
  input.table     <- grid.exps[,c("orig", "entrez_id", "symbol")]
  colnames(input.table) <- c("ensembl_id", "entrez_id", "gene_symbol")
  phensim.input   <- grid.exps[,c("entrez_id", "dir")]
  readr::write_tsv(phensim.input, file = output, append = FALSE, col_names = FALSE, quote = "none")
  writeLines(jsonlite::toJSON(input.table), output.table)
} else {
  readr::write_tsv(
    data.frame(entrez_id=character(0), dir=character(0)), 
    file = output, append = FALSE, col_names = FALSE, quote = "none"
  )
  writeLines(jsonlite::toJSON(numeric(0)), output.table)
}
