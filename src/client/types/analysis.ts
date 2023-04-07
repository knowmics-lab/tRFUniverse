export interface EnrichmentResultTableRow {
    ONTOLOGY: string;
    ID: string;
    Description: string;
    GeneRatio: string;
    pvalue: number;
    padjust: number;
    geneID: string;
}

export interface MostCorrelatedTableRow {
    gene_id: string;
    gene_name: string;
    fragment: string;
    correlation: number;
    p: number;
    q: number;
}

export type MostCorrelatedTable = MostCorrelatedTableRow[];

export interface DifferentialSurvivalTableRow {
    id: string;
    th_high: number;
    th_low: number;
    HR: number;
    p: number;
    q: number;
}
