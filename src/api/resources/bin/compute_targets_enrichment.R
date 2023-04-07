#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("jsonlite"))
suppressPackageStartupMessages(library("dplyr"))
suppressPackageStartupMessages(library("clusterProfiler"))
suppressPackageStartupMessages(library("DOSE"))
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
                    help="output file")
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
#     "-o", "test.json", "-e", "CLASH", "CLIP-Seq"
#     # , "-d", "TCGA-THCA", "-p", "0.8"
#   )
# )

fragment        <- args$fragment
target_dir      <- args$target_directory
filter_dataset  <- args$filter_dataset
filter_evidence <- args$filter_evidence
filter_p        <- args$filter_pvalue
output          <- args$output
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
  grid.exps$genes <- sapply(strsplit(grid.exps$genes, ".", fixed = TRUE), function(x)(x[1]))
  map             <- AnnotationDbi::select(org.Hs.eg.db, unique(grid.exps$genes), c("ENTREZID"), "ENSEMBL")
  colnames(map)   <- c("genes", "entrez_id")
  map             <- unique(na.omit(map))
  grid.exps       <- grid.exps %>% inner_join(map)

  go       <- tryCatch({ enrichGO(gene          = grid.exps$entrez_id,
                                  OrgDb         = org.Hs.eg.db,
                                  ont           = "ALL",
                                  pvalueCutoff  = 1,
                                  qvalueCutoff  = 1,
                                  readable      = TRUE,
                                  pool = TRUE) }, error = function(e)(NULL))
  kegg     <- tryCatch({ enrichKEGG(gene         = grid.exps$entrez_id,
                                    organism     = 'hsa',
                                    pvalueCutoff = 1,
                                    qvalueCutoff = 1) }, error = function(e)(NULL))
  reactome <- tryCatch({ ReactomePA::enrichPathway(gene = grid.exps$entrez_id,
                                                   organism = "human",
                                                   pvalueCutoff = 1,
                                                   qvalueCutoff = 1,
                                                   readable = TRUE) }, error = function(e)(NULL))
  do       <- tryCatch({ DOSE::enrichDO(gene          = grid.exps$entrez_id,
                                        ont           = "DO",
                                        pvalueCutoff  = 1,
                                        minGSSize     = 5,
                                        qvalueCutoff  = 1,
                                        readable      = TRUE) }, error = function(e)(NULL))


  cn <- c("ONTOLOGY", "ID", "Description", "GeneRatio", "BgRatio", "pvalue",
          "p.adjust", "qvalue", "geneID", "Count")
  res <- NULL
  g2s <- NULL
  if (!is.null(go)) {
    if (is.null(g2s)) {
      g2s <- go@gene2Symbol
    }
    go  <- go@result[,cn]
    rownames(go) <- NULL
    if (is.null(res)) res <- go
    else res <- rbind(res, go)
  }
  if (!is.null(reactome)) {
    if (is.null(g2s)) {
      g2s <- reactome@gene2Symbol
    }
    reactome <- reactome@result
    reactome$ONTOLOGY <- "REACTOME"
    reactome <- reactome[,cn]
    rownames(reactome) <- NULL
    if (is.null(res)) res <- reactome
    else res <- rbind(res, reactome)
  }
  if (!is.null(do)) {
    if (is.null(g2s)) {
      g2s <- do@gene2Symbol
    }
    do <- do@result
    do$ONTOLOGY <- "DO"
    do <- do[,cn]
    rownames(do) <- NULL
    if (is.null(res)) res <- do
    else res <- rbind(res, do)
  }
  if (!is.null(kegg)) {
    kegg <- kegg@result
    kegg$ONTOLOGY <- "KEGG"
    if (!is.null(g2s)) {
      kegg$geneID <- sapply(strsplit(kegg$geneID, "/", fixed = TRUE), function (x){
        tmp <- g2s[x]
        tmp[is.na(tmp)] <- x[is.na(tmp)]
        return (paste0(unname(tmp), collapse = "/"))
      })
    }
    kegg <- kegg[,cn]
    rownames(kegg) <- NULL
    if (is.null(res)) res <- kegg
    else res <- rbind(res, kegg)
  }
  ont <- res$ONTOLOGY
  ont[ont == "BP"] <- "Gene Ontology - Biological Process"
  ont[ont == "MF"] <- "Gene Ontology - Molecular Function"
  ont[ont == "CC"] <- "Gene Ontology - Cellular Component"
  ont[ont == "REACTOME"] <- "Reactome"
  ont[ont == "DO"] <- "Disease Ontology"
  res$ONTOLOGY <- ont
  res$padjust  <- res$p.adjust
  res          <- res[order(res$p.adjust),]
  res$BgRatio  <- NULL
  res$Count    <- NULL
  res$qvalue   <- NULL
  res$p.adjust <- NULL
  res          <- res[as.numeric(sapply(strsplit(res$GeneRatio, "/", fixed=TRUE), function(x)(x[1]))) > 1, ]
  writeLines(jsonlite::toJSON(res), output)
} else {
  writeLines(jsonlite::toJSON(numeric(0)), output)
}
