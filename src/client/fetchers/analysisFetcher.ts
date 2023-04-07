import { JobResponse, MetadataOptionsResponse, MetadataResponse } from "@/types";
import {
    ClusteringRequest,
    CorrelatedEnrichmentAnalysisRequest,
    CorrelationPlotRequest,
    DifferentialExpressionAnalysisRequest,
    DifferentialExpressionMetadataRequest,
    DifferentialSurvivalAnalysisRequest,
    DimensionalityReductionRequest,
    MediatedCorrelationPlotRequest,
    MostCorrelatedAnalysisRequest,
    MostMediatedCorrelatedAnalysisRequest,
    PHENSIMAnalysisRequest,
    SurvivalAnalysisRequestWithName,
    TargetEnrichmentAnalysisRequest,
} from "@/types/requests";
import { postFetchGenerator } from "@/fetchers/commons";

export async function targetEnrichmentFetcher({ fragmentId, ...parameters }: TargetEnrichmentAnalysisRequest) {
    const url = `fragments/${fragmentId}/enrichment`;
    const fetcher = postFetchGenerator<typeof parameters, JobResponse>(url);
    return fetcher(parameters);
}

export const mostCorrelatedTableFetcher = postFetchGenerator<MostCorrelatedAnalysisRequest, JobResponse>(
    "analysis/correlation/table",
);

export const correlationPlotFetcher = postFetchGenerator<CorrelationPlotRequest, JobResponse>(
    "analysis/correlation/plot",
);

export const mostMediatedCorrelatedTableFetcher = postFetchGenerator<
    MostMediatedCorrelatedAnalysisRequest,
    JobResponse
>("analysis/correlation/table/mediated");

export const mediatedCorrelationPlotFetcher = postFetchGenerator<MediatedCorrelationPlotRequest, JobResponse>(
    "analysis/correlation/plot/mediated",
);

export const dimensionalityReductionFetcher = postFetchGenerator<DimensionalityReductionRequest, JobResponse>(
    "analysis/dimensionality_reduction",
);

export const clusteringFetcher = postFetchGenerator<ClusteringRequest, JobResponse>("analysis/clustering");

export const differentialSurvivalFetcher = postFetchGenerator<DifferentialSurvivalAnalysisRequest, JobResponse>(
    "analysis/differential_survival",
);

export const survivalWithFragmentNameFetcher = postFetchGenerator<SurvivalAnalysisRequestWithName, JobResponse>(
    "analysis/survival",
);

export const differentialExpressionFetcher = postFetchGenerator<DifferentialExpressionAnalysisRequest, JobResponse>(
    "analysis/differentially_expressed",
);

const metadataFetcher = postFetchGenerator<DifferentialExpressionMetadataRequest, MetadataResponse>(
    "analysis/differentially_expressed/metadata",
);

export const differentialExpressionMetadataFetcher = async (
    query: DifferentialExpressionMetadataRequest,
): Promise<MetadataOptionsResponse> => {
    const { data } = await metadataFetcher(query);
    return {
        data: data.map((m) => ({ value: m, label: m.replace(/_/g, " ") })),
    };
};

export const correlatedEnrichmentAnalysisFetcher = postFetchGenerator<CorrelatedEnrichmentAnalysisRequest, JobResponse>(
    "analysis/correlation/enrichment",
);

export async function phensimAnalysisFetcher({ fragmentId, ...parameters }: PHENSIMAnalysisRequest) {
    const url = `fragments/${fragmentId}/phensim`;
    const fetcher = postFetchGenerator<typeof parameters, JobResponse>(url);
    return fetcher(parameters);
}
