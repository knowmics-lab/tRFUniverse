suppressPackageStartupMessages(library("edgeR"))
suppressPackageStartupMessages(library("limma"))
suppressPackageStartupMessages(library("jsonlite"))

add.common.arguments <- function (parser, subtypes.filter = TRUE, sample.type.filter = TRUE) {
  if (subtypes.filter) {
    parser$add_argument("-s", "--subtypes", type="character", action="extend", nargs="+", default=NULL,
                        help="subtype filter [default NO FILTER]")
  }
  if (sample.type.filter) {
    parser$add_argument("-a", "--sample-types", type="character", action="extend", nargs="+", default=NULL,
                        help="sample type filter [default NO FILTER]")
  }
  parser$add_argument("-v", "--covariates", type="character", action="extend", nargs="+", default=NULL,
                      help="covariates for normalization [default NO FILTER]")
}

add.censoring.arguments <- function (parser) {
  parser$add_argument("-R", "--right-censoring", type="double", default=NULL,
                      help="apply right censoring to the data (the parameter is the number of months) [default NO FILTER]")
  parser$add_argument("-L", "--left-censoring", type="double", default=NULL,
                      help="apply left censoring to the data (the parameter is the number of months) [default NO FILTER]")
}

read.and.filter.metadata <- function (meta.file, sample_types = NULL, subtypes = NULL) {
  meta <- readRDS(meta.file)
  if (!is.null(sample_types) && any(sample_types != "")) {
    meta <- meta[meta$sample_type %in% sample_types & !is.na(meta$sample_type),]
  }
  
  if (!is.null(subtypes) && any(subtypes != "")) {
    meta <- meta[meta$subtype_selected %in% subtypes & !is.na(meta$subtype_selected),]
  }
  return (meta)
}

parse.covariates <- function (covariates.param, meta) {
  if (is.null(covariates.param)) return(character(0))
  covariates <- covariates.param[covariates.param %in% colnames(meta)]
  covariates <- covariates[covariates != ""]
  return(covariates)
}

convert.to.names <- function (x) (gsub("[[:punct:]\\s]+", "_", x, perl = TRUE))

merge.value <- function (v) {
  v[is.na(v)] <- ""
  return (paste0(v[v != ""], collapse = "."))
}

prepare.meta <- function (meta, variables, merge.vars = NULL, merged.name = "meta.var")
{
  meta      <- meta[,c("sample_id", variables), drop=FALSE]
  if (nrow(meta) == 0) {
    stop("No samples found with the input criteria")
  }
  if (!is.null(merge.vars) && length(merge.vars) > 0) {
    if (length(merge.vars) > 1) {
      meta[[merged.name]] <- sapply(1:nrow(meta), 
                                    function(i)(merge.value(meta[i,merge.vars])))
      for (v in merge.vars) {
        meta[[v]] <- NULL
      }
    } else {
      meta[[merged.name]] <- meta[[merge.vars]]
      meta[[merge.vars]]  <- NULL
    }
    variables <- c(merged.name, variables[!(variables %in% merge.vars)])
  }
  meta <- na.omit(meta)
  for (v in variables) {
    if (class(meta[[v]]) == "character") {
      meta[[v]] <- factor(convert.to.names(meta[[v]]))
    }
  }
  return(meta)
}

normalize.limma <- function (exprs, meta, main.formula.var = character(0), 
                             covariates = character(0), return.voom.object = FALSE,
                             filter.by.expr = FALSE, 
                             min.count = 10, min.total.count = 15, min.prop = 0.7) {
  if (is.null(main.formula.var)) main.formula.var <- character(0)
  if (is.null(covariates)) covariates <- character(0)
  main.formula.var <- main.formula.var[main.formula.var %in% colnames(meta)]
  covariates       <- covariates[covariates %in% colnames(meta)]
  
  all.vars       <- union(main.formula.var, covariates)
  to.remove.vars <- c()
  
  for (v in all.vars) {
    if (class(meta[[v]]) == "factor" && length(levels(meta[[v]])) <= 1) {
      to.remove.vars <- c(to.remove.vars, v)
    } else if (class(meta[[v]]) == "character" && length(levels(factor(meta[[v]]))) <= 1) {
      to.remove.vars <- c(to.remove.vars, v)
    }
  }
  
  all.vars         <- all.vars[!(all.vars  %in% to.remove.vars)]
  main.formula.var <- main.formula.var[!(main.formula.var  %in% to.remove.vars)]
  covariates       <- covariates[!(covariates  %in% to.remove.vars)]
  any.vars         <- length(all.vars) > 0
  meta             <- na.omit(meta[,c("sample_id", all.vars), drop=FALSE])
  if (nrow(meta) == 0) {
    stop("No samples found with the input criteria")
  }
  
  
  common.samples <- intersect(meta$sample_id, colnames(exprs))
  rownames(meta) <- meta$sample_id
  meta           <- meta[common.samples,,drop=FALSE]
  exprs          <- exprs[,common.samples,drop=FALSE]
  
  design <- NULL
  if (any.vars) {
    frml   <- as.formula(paste0(c("~ 0", all.vars), collapse = " + "))
    design <- model.matrix(frml, data = meta)
  }
  
  y <- DGEList(counts = exprs)
  if (filter.by.expr) {
    keep <- filterByExpr(y, design = design, min.prop = min.prop,
                         min.count = min.count, min.total.count = min.total.count)
    y    <- y[keep,,keep.lib.sizes=FALSE]
  }
  y <- calcNormFactors(y)
  v <- voom(y, design = design, plot = FALSE)
  if (return.voom.object) {
    return (list(
      "design"=design,
      "exprs"=v
    ))    
  }
  return (list(
    "design"=design,
    "exprs"=v$E
  ))
}

normalize.external <- function (exprs, meta, main.formula.var = character(0), 
                                covariates = character(0), filter.by.expr = FALSE) {
  if (is.null(main.formula.var)) main.formula.var <- character(0)
  if (is.null(covariates)) covariates <- character(0)
  all.vars       <- union(main.formula.var, covariates)
  to.remove.vars <- c()
  
  for (v in all.vars) {
    if (class(meta[[v]]) == "factor" && length(levels(meta[[v]])) <= 1) {
      to.remove.vars <- c(to.remove.vars, v)
    } else if (class(meta[[v]]) == "character" && length(levels(factor(meta[[v]]))) <= 1) {
      to.remove.vars <- c(to.remove.vars, v)
    }
  }
  
  all.vars         <- all.vars[!(all.vars  %in% to.remove.vars)]
  main.formula.var <- main.formula.var[!(main.formula.var  %in% to.remove.vars)]
  covariates       <- covariates[!(covariates  %in% to.remove.vars)]
  any.vars         <- length(all.vars) > 0
  meta             <- na.omit(meta[,c("sample_id", all.vars), drop=FALSE])
  if (nrow(meta) == 0) {
    stop("No samples found with the input criteria")
  }
  
  common.samples <- intersect(meta$sample_id, colnames(exprs))
  rownames(meta) <- meta$sample_id
  meta           <- meta[common.samples,,drop=FALSE]
  exprs          <- exprs[,common.samples,drop=FALSE]
  
  design <- NULL
  if (length(main.formula.var) > 0) {
    frml   <- as.formula(paste0(c("~ 0", main.formula.var), collapse = " + "))
    design <- model.matrix(frml, data = meta)
  }
  
  y <- DGEList(counts = exprs)
  if (filter.by.expr) {
    keep <- filterByExpr(y, design = design)
    y    <- y[keep,,keep.lib.sizes=FALSE]
  }
  y <- calcNormFactors(y)
  v <- voom(y, design = design, plot = FALSE)
  
  exprs <- v$E
  if (length(covariates) > 0) {
    if (is.null(design)) {
      design.be  <- matrix(1,ncol(exprs),1)
    } else {
      design.be <- design
    }
    frml      <- as.formula(paste0(" ~ ", paste0(covariates, collapse = " + ")))
    design.cv <- model.matrix(frml, data = meta)
    exprs     <- removeBatchEffect(x = exprs, design = design.be, covariates = design.cv)
  }
  
  return (exprs)
}


toJSON2 <- function(
    x, ...,  dataframe = "columns", null = "null", na = "null", auto_unbox = TRUE,
    digits = getOption("shiny.json.digits", 16), use_signif = TRUE, force = TRUE,
    POSIXt = "ISO8601", UTC = TRUE, rownames = FALSE, keep_vec_names = TRUE,
    strict_atomic = TRUE
) {
  if (strict_atomic) x <- I(x)
  jsonlite::toJSON(
    x, dataframe = dataframe, null = null, na = na, auto_unbox = auto_unbox,
    digits = digits, use_signif = use_signif, force = force, POSIXt = POSIXt,
    UTC = UTC, rownames = rownames, keep_vec_names = keep_vec_names,
    json_verbatim = TRUE, ...
  )
}

toJSON <- function(x) {
  if (!is.list(x) || !('x' %in% names(x))) return(toJSON2(x))
  func <- attr(x$x, 'TOJSON_FUNC', exact = TRUE)
  args <- attr(x$x, 'TOJSON_ARGS', exact = TRUE)
  if (length(args) == 0) args <- getOption('htmlwidgets.TOJSON_ARGS')
  if (!is.function(func)) func <- toJSON2
  res <- if (length(args) == 0) func(x) else do.call(func, c(list(x = x), args))
  # make sure shiny:::toJSON() does not encode it again
  structure(res, class = 'json')
}

apply.censoring <- function (sel_meta, left_cens, right_cens) {
  if (is.null(left_cens) && is.null(right_cens)) return (sel_meta)
  r <- range(sel_meta$time)
  if (!is.null(left_cens) && left_cens >= r[1]) {
    sel_meta <- sel_meta[sel_meta$time >= left_cens,,drop=FALSE]
  }
  if (!is.null(right_cens) && right_cens <= r[2]) {
    selection <- sel_meta$time >= right_cens
    sel_meta$time[selection]   <- right_cens
    sel_meta$status[selection] <- 0
  }
  return (sel_meta)
}