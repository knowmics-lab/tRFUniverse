import { apiUrl, processFetchResponse } from "@/utils";
import { JobResponse } from "@/types";
import { SurvivalAnalysisRequest } from "@/types/requests";

export default async function survivalFetcher({ fragmentId, ...data }: SurvivalAnalysisRequest) {
    return processFetchResponse<JobResponse>(
        await fetch(apiUrl(`fragments/${fragmentId}/survival`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        }),
    );
}
