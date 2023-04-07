export interface PHENSIMResultBase {
    status: "ready" | "queued" | "processing" | "failed" | "completed";
    logs: string;
    input_table_url: string;
}

export interface PHENSIMCompletedResult extends PHENSIMResultBase {
    status: "completed";
    results: {
        pathway_list: string;
        pathways: { [key: string]: string };
    };
}

export interface PHENSIMOtherResult extends PHENSIMResultBase {
    status: "ready" | "queued" | "processing" | "failed";
}

export type PHENSIMResultType = PHENSIMCompletedResult | PHENSIMOtherResult;

export type PathwayListTableRow = {
    pathwayId: string;
    pathwayName: string;
    pathwayActivityScore: number;
    pathwayPValue: number;
    pathwayFDR: number;
    averagePathwayPerturbation: number;
};

export type PathwayTableRow = {
    nodeId: string;
    nodeName: string;
    isEndpoint: boolean;
    activityScore: number;
    pValue: number;
    FDR: number;
    averagePerturbation: number;
};

export type InputTableRow = {
    ensembl_id: string;
    entrez_id: string;
    gene_symbol: string;
};
