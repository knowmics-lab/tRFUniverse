import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { jobResultsFetcher } from "@/fetchers";
import { JobDataResponse, PHENSIMResultType } from "@/types";
import { useInterval } from "react-use";

type Props = {
    analysisId: string | undefined;
};

const PHENSIM_REFRESH_INTERVAL = 60 * 1000; // 60 seconds in milliseconds

export default function ShowPHENSIMLog({ analysisId }: Props) {
    const [log, setLog] = useState("");
    const [completed, setCompleted] = useState(false);

    const fetch = useCallback(async () => {
        console.log("fetching...");
        if (analysisId === undefined) return;
        const jobData = await jobResultsFetcher<JobDataResponse<PHENSIMResultType>>({ analysisId });
        setLog(jobData?.data?.logs ?? "");
        if (jobData?.data?.status === "completed") {
            setCompleted(true);
            location.reload();
        } else if (completed) {
            setCompleted(false);
        }
    }, [analysisId, completed]);
    useInterval(fetch, !completed && analysisId ? PHENSIM_REFRESH_INTERVAL : null);
    useEffect(() => {
        if (analysisId) fetch().catch(console.error);
    }, [analysisId, fetch]);

    return (
        <>
            {analysisId && (
                <div className="d-flex gap-4 flex-column">
                    <Loading message="Your analysis is processing...Please wait..." />
                    <div className="text-center text-sm">
                        Bookmark or copy the link of this page to check the status of your analysis later.
                    </div>
                    <div className="px-4">
                        <pre>{log}</pre>
                    </div>
                </div>
            )}
        </>
    );
}
