#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("jsonlite"))
suppressPackageStartupMessages(library("dplyr"))
suppressPackageStartupMessages(library("clusterProfiler"))
suppressPackageStartupMessages(library("DOSE"))
suppressPackageStartupMessages(library("org.Hs.eg.db"))
suppressPackageStartupMessages(library("multiMiR"))

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
parser$add_argument("-T", "--threshold", type="double", default=0.5,
                    help="The absolute minimum correlation threshold [default %(default)s]")
parser$add_argument("-F", "--corr-filter", type="character", default="both",
                    help="type of correlation filter [default %(default)s]",
                    choices=c("positive","negative","both"))
add.common.arguments(parser)

args <- parser$parse_args()
#   c(
#     "-f", "tRF-30-86J8WPMN1E8Y", "-d", "TCGA-BRCA", "-t", "genes", "-a",
#     "Primary Solid Tumor", "-v", "tumor_purity", "-e", "./expressions_by_dataset/",
#     "-o", "test.json", "-T", "0.25", "-F", "negative"
#   )
# )

fragment     <- args$fragment
dataset      <- args$dataset
exp_dir      <- args$expressions
output       <- args$output
subtypes     <- args$subtypes
sample_types <- args$sample_types
type         <- args$type
corr.measure <- args$correlation
covariates   <- args$covariates
th.corr      <- args$threshold
corr.filter  <- args$corr_filter

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
meta <- read.and.filter.metadata(meta.file, sample_types, subtypes)
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}

exp  <- readRDS(exp.file)
if (!all(fragment %in% rownames(exp))) {
  stop(sprintf("The fragment \"%s\" does not appear to be expressed in \"%s\".", fragment, dataset))
}

gene.exps <- readRDS(file.path(exp_dir, sprintf("%s_%s.rds", dataset, type)))
meta <- meta[meta$sample_id %in% intersect(meta$sample_id, colnames(gene.exps)),]
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}

covariates <- parse.covariates(covariates, meta)
exp        <- normalize.external(exprs = exp, meta = meta, covariates = covariates)
gene.exps  <- normalize.external(exprs = gene.exps, meta = meta, covariates = covariates)

common.samples <- intersect(intersect(colnames(exp), colnames(gene.exps)), meta$sample_id)
meta           <- meta[meta$sample_id %in% common.samples,,drop=FALSE]
exp            <- exp[,meta$sample_id,drop=FALSE]
gene.exps      <- gene.exps[,meta$sample_id,drop=FALSE]

gene.id   <- rownames(gene.exps)
grid.exps <- expand.grid(genes = gene.id, fragments = fragment, stringsAsFactors = FALSE)
corrs     <- sapply(1:nrow(grid.exps), function (i) {
  return (cor(exp[grid.exps$fragments[i],], gene.exps[grid.exps$genes[i],], method=corr.measure))
})

grid.exps$correlation <- corrs
if (corr.filter == "positive") {
  grid.exps <- grid.exps[grid.exps$correlation > 0,]
} else if (corr.filter == "negative") {
  grid.exps <- grid.exps[grid.exps$correlation < 0,]
}
grid.exps <- grid.exps[abs(grid.exps$correlation) > th.corr,]

if (nrow(grid.exps) > 0) {
  grid.exps$genes <- sapply(strsplit(grid.exps$genes, ".", fixed = TRUE), function(x)(x[1]))
  if (type == "mirnas") {
    mir_map <- suppressMessages(suppressWarnings(get_multimir(mirna = grid.exps$genes, table="validated",  use.tibble = TRUE, summary = TRUE)))
    mir_summary <- mir_map@summary
    grid.exps   <- unique(na.omit(mir_summary[,c("mature_mirna_id", "target_entrez")]))
    colnames(grid.exps) <- c("genes", "entrez_id")
  } else {
    map             <- AnnotationDbi::select(org.Hs.eg.db, unique(grid.exps$genes), c("ENTREZID"), "ENSEMBL")
    colnames(map)   <- c("genes", "entrez_id")
    map             <- unique(na.omit(map))
    grid.exps       <- grid.exps %>% inner_join(map)
  }

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
