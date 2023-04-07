import {
    CorrelationMeasure,
    DimensionalityReductionMethodEnum,
    FilterDirectionEnum,
    FilteringFunctionEnum,
    GeneTypeEnum,
} from "@/constants";

export interface QueryRequest {
    per_page?: number;
    search?: Record<string, any>;
    sort?: Record<string, "asc" | "desc">;
    page?: number;
}

export interface SearchQueryRequest extends QueryRequest {
    query: string;
}

export type AdvancedSearchFilterType = { field: string; value: string };

export interface AdvancedSearchRequest extends QueryRequest {
    fragment_type?: string;
    chromosome?: string;
    aminoacid?: string;
    anticodon?: string;
    filters?: AdvancedSearchFilterType[];
    min_rpm?: number;
}

export interface SampleFilteringRequest {
    subtypes?: string[];
    sample_types?: string[];
    covariates?: string[];
}

export interface RequestWithTopNFiltering {
    filtering?: boolean;
    filtering_top?: number;
    filtering_measure?: FilteringFunctionEnum;
}

export interface MostCorrelatedAnalysisRequest extends SampleFilteringRequest {
    dataset: string;
    fragment?: string;
    gene?: string;
    type?: GeneTypeEnum;
    measure?: CorrelationMeasure;
}

export interface CorrelationPlotRequest extends SampleFilteringRequest {
    dataset: string;
    fragment: string;
    gene: string;
    measure?: CorrelationMeasure;
}

export interface MostMediatedCorrelatedAnalysisRequest extends MostCorrelatedAnalysisRequest {
    metadata: string;
}

export interface MediatedCorrelationPlotRequest extends CorrelationPlotRequest {
    metadata: string;
}

export interface DimensionalityReductionRequest extends RequestWithTopNFiltering, SampleFilteringRequest {
    datasets: string[];
    color_by?: string[];
    scaling?: boolean;
    method?: DimensionalityReductionMethodEnum;
    perplexity?: number;
}

export interface ClusteringRequest extends RequestWithTopNFiltering, SampleFilteringRequest {
    datasets: string[];
    metadata?: string[];
}

export interface SurvivalAnalysisRequest extends SampleFilteringRequest {
    fragmentId: number;
    dataset: string;
    metadata: string;
    type: string;
    cutoff_high?: number;
    cutoff_low?: number;
    left_censoring?: number;
    right_censoring?: number;
}

export type SurvivalAnalysisRequestWithName = Omit<SurvivalAnalysisRequest, "fragmentId"> & {
    fragment_name: string;
};

// export interface SurvivalAnalysisRequestWithName extends SampleFilteringRequest {
//     fragment_name: string;
//     dataset: string;
//     metadata: string;
//     type: string;
//     cutoff_high?: number;
//     cutoff_low?: number;
//     left_censoring?: number;
//     right_censoring?: number;
// }

export type DifferentialSurvivalAnalysisRequest = Omit<SurvivalAnalysisRequest, "fragmentId">;

export interface Contrast {
    case: string[];
    control: string[];
}

export interface DifferentialExpressionMetadataRequest {
    dataset: string;
    metadata: string[];
}

export interface DifferentialExpressionAnalysisRequest extends DifferentialExpressionMetadataRequest {
    contrasts: Contrast[];
    logfc_cutoff?: number;
    qvalue_cutoff?: number;
    min_count_cutoff?: number;
    min_total_count_cutoff?: number;
    min_prop?: number;
    covariates?: string[];
}

export interface CorrelatedEnrichmentAnalysisRequest extends SampleFilteringRequest {
    dataset: string;
    fragment: string;
    type?: GeneTypeEnum;
    measure?: CorrelationMeasure;
    correlation_threshold?: number;
    filter_direction?: FilterDirectionEnum;
}

export interface TargetEnrichmentAnalysisRequest {
    fragmentId: number;
    evidences?: string[];
    dataset?: string;
    pvalue?: number;
}

export interface PHENSIMAnalysisRequest {
    fragmentId: number;
    evidences?: string[];
    dataset?: string;
    pvalue?: number;
    reactome?: boolean;
    epsilon?: number;
    seed?: number;
    notify_to?: string;
}
