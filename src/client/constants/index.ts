export * as URLs from "./url";

export enum GeneTypeEnum {
    GENES = "genes",
    MIRNAS = "mirnas",
}

export const GENE_TYPE_OPTIONS = [
    { value: GeneTypeEnum.GENES, label: "Genes" },
    { value: GeneTypeEnum.MIRNAS, label: "miRNAs" },
];

export enum CorrelationMeasure {
    PEARSON = "pearson",
    SPEARMAN = "spearman",
    KENDALL = "kendall",
}

export const CORRELATION_MEASURE_OPTIONS = [
    { value: CorrelationMeasure.PEARSON, label: "Pearson" },
    { value: CorrelationMeasure.SPEARMAN, label: "Spearman" },
    { value: CorrelationMeasure.KENDALL, label: "Kendall" },
];

export enum ExpressionTypeEnum {
    RPM = "rpm",
    COUNTS = "counts",
    NORM_COUNTS = "norm_counts",
}

export const EXPRESSION_TYPE_OPTIONS = [
    { value: ExpressionTypeEnum.RPM, label: "RPM" },
    { value: ExpressionTypeEnum.COUNTS, label: "Counts" },
    { value: ExpressionTypeEnum.NORM_COUNTS, label: "Normalized Counts" },
];

export enum DimensionalityReductionMethodEnum {
    PCA = "pca",
    MDS = "mds",
    ICA = "ica",
    TSNE = "tsne",
    UMAP = "umap",
}

export const DIMENSIONALITY_REDUCTION_OPTIONS = [
    { value: DimensionalityReductionMethodEnum.PCA, label: "PCA" },
    { value: DimensionalityReductionMethodEnum.MDS, label: "MDS" },
    { value: DimensionalityReductionMethodEnum.ICA, label: "ICA" },
    { value: DimensionalityReductionMethodEnum.TSNE, label: "t-SNE" },
    { value: DimensionalityReductionMethodEnum.UMAP, label: "UMAP" },
];

export enum FilteringFunctionEnum {
    MAD = "mad",
    VARIANCE = "variance",
    ABSOLUTE_MEDIAN = "absolute_median",
    ABSOLUTE_MEAN = "absolute_mean",
}

export const FILTERING_FUNCTION_OPTIONS = [
    { value: FilteringFunctionEnum.MAD, label: "Mean Absolute Deviation (MAD)" },
    { value: FilteringFunctionEnum.VARIANCE, label: "Variance" },
    { value: FilteringFunctionEnum.ABSOLUTE_MEDIAN, label: "Absolute Median" },
    { value: FilteringFunctionEnum.ABSOLUTE_MEAN, label: "Absolute Mean" },
];

export enum FilterDirectionEnum {
    POSITIVE = "positive",
    NEGATIVE = "negative",
    BOTH = "both",
}

export const FILTER_DIRECTION_OPTIONS = [
    { value: FilterDirectionEnum.POSITIVE, label: "Positive" },
    { value: FilterDirectionEnum.NEGATIVE, label: "Negative" },
    { value: FilterDirectionEnum.BOTH, label: "Both" },
];

export const EVIDENCE_FILTERING_OPTIONS = [
    { value: "CLASH", label: "CLASH" },
    { value: "CLEAR-CLIP", label: "CLEAR-CLIP" },
    { value: "CLIP-Seq", label: "CLIP-Seq" },
    { value: "RIP-Seq", label: "RIP-Seq" },
];

export const ALIAS_SOURCES: { [db: string]: string } = {
    tsRFun: "tsRFun",
    tRFdb: "tRFdb",
    OncotRF: "OncotRF",
    tsRBase: "tsRBase",
    tDR: "tDR",
};

export const ALIAS_SOURCES_URLS: { [db: string]: string } = {
    tsRFun: "https://rna.sysu.edu.cn/tsRFun/",
    tRFdb: "http://genome.bioch.virginia.edu/trfdb/",
    OncotRF: "http://bioinformatics.zju.edu.cn/OncotRF/",
    tsRBase: "http://www.tsrbase.org/",
    tDR: "http://trna.ucsc.edu/tDRnamer/",
};
