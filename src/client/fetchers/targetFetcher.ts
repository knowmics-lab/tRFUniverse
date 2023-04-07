import { apiUrl } from "@/utils";
import { RequestError } from "@/errors";
import { DataListResponse, DataResponse, Target } from "@/types";

export async function targetIdsFetcher() {
    const res = await fetch(apiUrl(`targets/ids`), {
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
    return (await res.json()) as DataListResponse<number>;
}

export async function targetFetcher({ targetId: id }: { targetId: string | number }) {
    const res = await fetch(apiUrl(`targets/${id}`), {
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
    return (await res.json()) as DataResponse<Target>;
}
