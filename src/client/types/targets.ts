export interface BindingSiteSource {
    dataset: string;
    sample: string;
    type: string;
    cell_line: string;
    ago: string;
    algorithm: string;
    target_sequence: string;
    fragment_sequence: string;
    mfe: number;
}

export interface BindingSite {
    id: number;
    transcript_id: string;
    transcript_name: string;
    position: string;
    start: number;
    end: number;
    count: number;
    mfe: number;
    sources: BindingSiteSource[];
}

export interface DatasetExpression {
    logFC: number;
    p: number;
}

export interface TargetBase {
    id: number;
    fragment_id: number;
    fragment_name: string;
    gene_id: string;
    gene_name: string;
    count: number;
    mfe: number;
}

export interface Target extends TargetBase {
    binding_sites: BindingSite[];
    expressions: { [dataset: string]: DatasetExpression };
}
