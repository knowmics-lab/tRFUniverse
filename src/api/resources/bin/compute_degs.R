#!/usr/bin/env Rscript
suppressPackageStartupMessages(library("argparse"))
suppressPackageStartupMessages(library("htmlwidgets"))
suppressPackageStartupMessages(library("Glimma"))
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
                    help="output directory",
                    required=TRUE)
parser$add_argument("-l", "--logfc-cutoff", type="double", default=0.6,
                    help="Absolute Log2FC cutoff [default %(default).2f]")
parser$add_argument("-q", "--qvalue-cutoff", type="double", default=0.05,
                    help="q-value cutoff (between 0 and 1) [default %(default).2f]")
parser$add_argument("-M", "--min-count-cutoff", type="double", default=5,
                    help="Minimum count required for at least some samples [default %(default)d]")
parser$add_argument("-T", "--min-total-count-cutoff", type="double", default=15,
                    help="Minimum total count required [default %(default).2f]")
parser$add_argument("-P", "--min-prop", type="double", default=0.7,
                    help="Minimum proportion of samples in the smallest group that express the fragment [default %(default).2f]")
parser$add_argument("-c", "--contrasts", type="character", action="extend", nargs="+",
                    help="one or more constrasts formatted as control__vs__case",
                    required=TRUE)
add.common.arguments(parser, subtypes.filter = FALSE, sample.type.filter = FALSE)

args <- parser$parse_args()
#   c(
#     "-d", "TCGA-BRCA", "-e", "./expressions_by_dataset",
#     "-o", "./test-degs", "-m", "sample_type", "-m", "subtype_selected",
#     "-l", "0.6", "-q", "0.01", "-v", "tumor_purity",
#     "-c", "Solid_Tissue_Normal__vs__Primary_Solid_Tumor_BRCA_Basal", 
#     "-c", "Solid_Tissue_Normal__vs__Primary_Solid_Tumor_BRCA_Her2",
#     "-c", "Primary_Solid_Tumor_BRCA_Her2__vs__Primary_Solid_Tumor_BRCA_Basal"
#   )
# )

dataset         <- args$dataset
exp_dir         <- args$expressions
meta_vars       <- args$metadata
out_dir         <- args$output
lfc_cutoff      <- args$logfc_cutoff
q_cutoff        <- args$qvalue_cutoff
covariates      <- args$covariates
contrasts       <- args$contrasts
min.count       <- args$min_count_cutoff
min.total.count <- args$min_total_count_cutoff
min.prop        <- args$min_prop

if (!dir.exists(exp_dir)) {
  stop(sprintf("Specified expressions directory ( %s ) does not exist", exp_dir))
}

meta.file <- file.path(exp_dir, sprintf("%s_metadata.rds", dataset))
exp.file  <- file.path(exp_dir, sprintf("%s_counts.rds", dataset))
if (!file.exists(meta.file) || !file.exists(exp.file)) {
  stop(sprintf("Specified dataset ( %s ) is invalid", dataset))
}
if (!dir.exists(out_dir)) {
  dir.create(out_dir, recursive = TRUE)
}

meta <- read.and.filter.metadata(meta.file)
if (nrow(meta) == 0) {
  stop("No samples found with the input criteria")
}

exp  <- readRDS(exp.file)

covariates <- parse.covariates(covariates, meta)
meta       <- prepare.meta(meta, union(meta_vars, covariates), 
                           merge.vars = meta_vars, 
                           merged.name = "comparison_variable")
if (length(levels(meta$comparison_variable)) <= 1) {
  stop("There are not enough classes to perform a comparison")
}
limma.data  <- normalize.limma(exprs = exp, meta = meta, 
                               main.formula.var = "comparison_variable",
                               covariates = covariates,
                               filter.by.expr = TRUE,
                               return.voom.object = TRUE,
                               min.count = min.count,
                               min.total.count = min.total.count,
                               min.prop = min.prop)
design <- limma.data$design
v.exps <- limma.data$exprs
groups <- setNames(meta$comparison_variable, meta$sample_id)
groups <- unname(groups[colnames(v.exps$E)])

colnames(design) <- gsub("comparison_variable", "", colnames(design), fixed = TRUE)

limma.fit <- lmFit(v.exps, design = design)

contrasts.list <- strsplit(contrasts, "__vs__", fixed = TRUE)
contrasts.list <- lapply(contrasts.list, function(x)(strsplit(x, "__+__", fixed=TRUE)))
contrasts.vars <- setNames(lapply(contrasts.list, function(x){
  if (length(x) != 2) return (NULL)
  return (
    unique(unname(unlist(x)))
  )
}), contrasts)
titles.list    <- setNames(sapply(contrasts.list, function(x){
  if (length(x) != 2) return (NULL)
  return (paste(
    paste0(gsub("_", " ", x[[2]], fixed = TRUE), collapse = " "),
    paste0(gsub("_", " ", x[[1]], fixed = TRUE), collapse = " "),
    sep = " vs "
  ))  
}), contrasts)
contrasts.list <- setNames(sapply(contrasts.list, function(x){
  if (length(x) != 2) return (NULL)
  return (paste(
    paste0("(", paste0(x[[2]], collapse = "+"), ")"),
    paste0("(", paste0(x[[1]], collapse = "+"), ")"),
    sep = " - "
  ))
}), contrasts)
contrasts.vars <- contrasts.vars[!sapply(contrasts.vars, function(x)(is.null(x)))]
titles.list    <- titles.list[!sapply(contrasts.list, function(x)(is.null(x)))]
contrasts.list <- contrasts.list[!sapply(contrasts.list, function(x)(is.null(x)))]

contrasts.table <- makeContrasts(contrasts = contrasts.list, levels = design)
colnames(contrasts.table) <- names(contrasts.list)

contrasts.fit <- eBayes(contrasts.fit(limma.fit, contrasts.table))

file.names <- setNames(
  file.path(out_dir, paste0(names(contrasts.list), ".html")), 
  names(contrasts.list)
)
for (i in 1:length(contrasts.list)) {
  c.vars <- contrasts.vars[[i]]
  c.e    <- v.exps$E[,meta$sample_id[meta$comparison_variable %in% c.vars],drop=FALSE]
  c.g    <- meta$comparison_variable[meta$comparison_variable %in% c.vars]
  suppressWarnings(
    htmlwidgets::saveWidget(
      glimmaVolcano(contrasts.fit, 
                    coef = i, 
                    counts = c.e,
                    groups = c.g,
                    status = limma::decideTests(contrasts.fit, p.value = q_cutoff, lfc = lfc_cutoff),
                    transform.counts = "none",
                    main = titles.list[[i]]),
      file.names[i],
      selfcontained = TRUE
    )
  )
}
grid.results <- data.frame(
  "contrasts"=names(file.names),
  "file.name"=unname(file.names),
  stringsAsFactors = FALSE
)
writeLines(jsonlite::toJSON(grid.results), file.path(out_dir, "results.json"))
