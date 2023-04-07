import { apiUrl, processFetchResponse } from "@/utils";

export function postFetchGenerator<Q, R>(endpoint: string) {
    return async (query: Q) =>
        processFetchResponse<R>(
            await fetch(apiUrl(endpoint), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(query),
            }),
        );
}
