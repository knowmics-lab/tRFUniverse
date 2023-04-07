import type { Config, Data, Layout } from "plotly.js";

export interface DataResponse<T> {
    data: T;
}

export interface JobDataResponse<T> extends DataResponse<T> {
    params: any;
    fragment?: number;
}

export type DataListResponse<T> = DataResponse<T[]>;

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginationMetaLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    from: number;
    to: number;
    total: number;
    path: string;
    links: PaginationMetaLink[];
}

export interface PaginatedDataListResponse<T> extends DataListResponse<T> {
    links: PaginationLinks;
    meta: PaginationMeta;
}

export type PlotlyResponseData = {
    data: Data[];
    layout: Partial<Layout>;
    config: Partial<Config> | undefined;
};

export type PlotlyResponse = DataResponse<PlotlyResponseData>;

export type JobResponse = DataResponse<{
    analysisId: string;
}>;

export type JobStatusResponse = DataResponse<{
    id: string;
    status: "pending" | "finished" | "failed";
    progress: number;
    created_at: string;
    finished_at: string | null;
}>;

export type ClusteringData = {
    url: string;
    path: string;
};
export type MetadataResponse = DataListResponse<string>;

export type MetadataOptionsResponse = DataListResponse<{
    value: string;
    label: string;
}>;

export interface DifferentiallyExpressedResponse {
    contrasts: string;
    url: string;
    file_name: string;
}
