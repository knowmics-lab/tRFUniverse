import { atom } from "jotai";
import { DataResponse } from "@/types";

export function remoteApiAtom<T>(url: string) {
    return atom(async () => {
        const response = await fetch(url);
        const json = (await response.json()) as DataResponse<T>;
        return json.data;
    });
}
