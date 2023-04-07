import { querySerialize, template } from "@/utils";
import { QueryRequest } from "@/types/requests";
import { PaginatedDataListResponse } from "@/types";
import { RequestError } from "@/errors";

type TableFetcherInput<Q extends QueryRequest> = {
    url: string | ReturnType<typeof template<Q>>;
    values: Q;
    excludeKeys?: (keyof Q)[];
    method?: "GET" | "POST";
};

export default async function tableFetcher<Q extends QueryRequest, R>({
    url,
    values,
    excludeKeys = [],
    method = "GET",
}: TableFetcherInput<Q>) {
    const parsedUrl = typeof url === "string" ? url : url(values);
    let res;
    if (method === "GET") {
        const urlParams = querySerialize(values, excludeKeys);
        res = await fetch(`${parsedUrl}?${urlParams}`, {
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
        });
    } else {
        res = await fetch(`${parsedUrl}`, {
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            method: "POST",
            body: JSON.stringify(values),
        });
    }
    if (!res.ok) {
        const error = new RequestError("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return (await res.json()) as PaginatedDataListResponse<R>;
}