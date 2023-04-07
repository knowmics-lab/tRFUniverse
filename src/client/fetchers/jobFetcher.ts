import { apiUrl } from "@/utils";
import { RequestError } from "@/errors";
import { JobStatusResponse } from "@/types";

export async function jobStatusFetcher({ analysisId }: { analysisId: string }) {
    const res = await fetch(apiUrl(`analysis/${analysisId}`), {
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
    });
    if (!res.ok) {
        const error = new RequestError("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return (await res.json()) as JobStatusResponse;
}

export async function jobResultsFetcher<R>({ analysisId }: { analysisId: string }) {
    const res = await fetch(apiUrl(`analysis/${analysisId}/results`), {
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
    });
    if (!res.ok) {
        const error = new RequestError("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return (await res.json()) as R;
}
