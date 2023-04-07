import { useCallback, useEffect, useMemo, useState } from "react";
import { PendingAnalysis } from "@/types";
import { getPendingAnalyses, pathWithoutHash, removePendingAnalysis } from "@/utils";
import { useUpdateEffect } from "@/hooks/commons";
import { useChannels, useNotify } from "@/hooks/index";
import useHash from "@/hooks/useHash";
import { useRouter } from "next/router";
import { jobStatusFetcher } from "@/fetchers";

export default function usePendingAnalyses(): PendingAnalysis[] {
    const notify = useNotify();
    const hash = useHash();
    const router = useRouter();
    const currentPath = useMemo(() => pathWithoutHash(router.asPath), [router.asPath]);
    const [pendingAnalyses, setPendingAnalyses] = useState<PendingAnalysis[]>([]);
    const updatePendingAnalyses = useCallback(async () => {
        const newPending = getPendingAnalyses();
        const status = await Promise.all(
            newPending.map(async (analysis) => {
                return jobStatusFetcher({ analysisId: analysis.id });
            }),
        );
        const stillPendingIds = status.filter((s) => s.data.status === "pending").map((s) => s.data.id);
        newPending.forEach((a) => {
            if (stillPendingIds.includes(a.id)) return;
            if (currentPath !== a.url || hash !== `${a.prefix}${a.id}`) {
                const analysisStatus = status.find((s) => s.data.id === a.id)?.data.status;
                if (analysisStatus === "finished") {
                    notify({
                        title: "Analysis completed",
                        message: a.message ?? "Your analysis has been completed!",
                        type: "success",
                        link: `${a.url}#${a.prefix}${a.id}`,
                    });
                } else if (analysisStatus === "failed") {
                    notify({
                        title: "Analysis failed",
                        message: "Your analysis has failed without any error message.",
                        type: "danger",
                    });
                }
            }
            removePendingAnalysis(a.id);
        });
        const stillPendingAnalyses = newPending.filter((a) => stillPendingIds.includes(a.id));
        setPendingAnalyses(stillPendingAnalyses);
    }, [currentPath, hash, notify]);
    useUpdateEffect(() => {
        updatePendingAnalyses().catch(console.error);
    }, [updatePendingAnalyses]);
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const listener = async () => {
            return updatePendingAnalyses();
        };
        window.addEventListener("updatePendingAnalyses", listener);
        return () => {
            window.removeEventListener("updatePendingAnalyses", listener);
        };
    }, [updatePendingAnalyses]);
    const completedListenerSpecs = useMemo(() => {
        return pendingAnalyses
            .filter((a) => {
                return currentPath !== a.url || hash !== `${a.prefix}${a.id}`;
            })
            .map((a) => ({
                channelName: `analysis.${a.id}`,
                eventName: ".analysis.completed",
                callback: () => {
                    notify({
                        title: "Analysis completed",
                        message: a.message ?? "Your analysis has been completed!",
                        type: "success",
                        link: `${a.url}#${a.prefix}${a.id}`,
                    });
                    removePendingAnalysis(a.id);
                },
            }));
    }, [currentPath, hash, notify, pendingAnalyses]);
    useChannels(completedListenerSpecs);
    const errorListenerSpecs = useMemo(() => {
        return pendingAnalyses
            .filter((a) => {
                return currentPath !== a.url || hash !== `${a.prefix}${a.id}`;
            })
            .map((a) => ({
                channelName: `analysis.${a.id}`,
                eventName: ".analysis.error",
                callback: () => {
                    notify({
                        title: "Analysis failed",
                        message: "Your analysis has failed without any error message.",
                        type: "danger",
                    });
                    removePendingAnalysis(a.id);
                },
            }));
    }, [currentPath, hash, notify, pendingAnalyses]);
    useChannels(errorListenerSpecs);
    return pendingAnalyses;
}
