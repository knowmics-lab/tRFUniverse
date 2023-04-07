import { apiUrl } from "@/utils";
import { RequestError } from "@/errors";
import { JobResponse } from "@/types";

type FetcherRequest = {
    fragmentId: number;
    metadata: string;
    dataset: string;
    type: string;
    covariates: string[];
};

export default async function expressionGraphFetcher({ fragmentId, ...data }: FetcherRequest) {
    const res = await fetch(apiUrl(`fragments/${fragmentId}/expression_graph`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = new RequestError("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return (await res.json()) as JobResponse;
}
