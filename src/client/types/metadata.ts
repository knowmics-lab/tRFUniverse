export type ValuesMap = { [key: string]: string };
export type Capability =
    | "degs"
    | "search"
    | "dataset"
    | "subtype"
    | "survival"
    | "colorable"
    | "covariate"
    | "clustering"
    | "sample_type"
    | "expression_graphs"
    | "mediated_correlation";

export interface Metadata {
    id: number;
    name: string;
    display_name: string;
    type: "category" | "string" | "boolean" | "float";
    capabilities: { [capability in Capability]: boolean };
    values: ValuesMap;
    values_by_dataset: { [key: string]: ValuesMap };
    props: { [key: string]: any };
}
