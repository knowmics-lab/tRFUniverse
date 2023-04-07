import { useCallback, useEffect, useMemo } from "react";
import { JobDataResponse, JobResponse } from "@/types";
import { useChannel } from "@/hooks/Echo";
import { jobResultsFetcher, jobStatusFetcher } from "@/fetchers";
import useHash from "@/hooks/useHash";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/router";
import { pathWithoutHash, pushPendingAnalysis, removePendingAnalysis } from "@/utils";
import useBasicReducer from "@/hooks/useBasicReducer";

type Fetcher<Q> = (request: Q) => Promise<JobResponse>;
type RunAnalysisType<Q> = (request: Q) => void;
type ResultType<Q, R> = {
    isRunning: boolean;
    runAnalysis: RunAnalysisType<Q>;
    results: R | undefined;
    error: any;
    status: string;
    analysisId: string | undefined;
};
type StateType<R> = {
    isRunning: boolean;
    status: string;
    error: any;
    results: R | undefined;
    params: any;
    fragment: number | undefined;
    analysisId: string | undefined;
};

export default function useRemoteAnalysis<Q, R>(
    fetcher: Fetcher<Q>,
    hashPrefix: string | false = "",
    storeAnalysis = true,
    message = "Your analysis has been completed!",
    onRestoreState?: (params: Q, fragment?: number) => void,
): ResultType<Q, R> {
    const router = useRouter();
    const notify = useNotify();
    const hash = useHash(true);
    const initialIdState = useMemo(
        () =>
            hashPrefix === false
                ? undefined
                : hash && hash.startsWith(hashPrefix)
                ? hash.replace(hashPrefix, "")
                : undefined,
        [hashPrefix, hash],
    );
    const [state, dispatch] = useBasicReducer<StateType<R>>({
        isRunning: false,
        status: "",
        analysisId: initialIdState,
    });
    const channelName = useMemo(
        () => (state.analysisId ? `analysis.${state.analysisId}` : undefined),
        [state.analysisId],
    );
    const fetchResults = useCallback(
        (analysisId: string, restoreState = false) => {
            dispatch({ type: "status", payload: "Fetching results..." });
            jobResultsFetcher<JobDataResponse<R>>({ analysisId })
                .then((data) => {
                    dispatch({
                        type: "many",
                        payload: {
                            status: "Done",
                            results: data.data,
                            isRunning: false,
                        },
                    });
                    if (restoreState && onRestoreState && data.params) {
                        onRestoreState(data.params, data.fragment);
                    }
                })
                .catch((e) => {
                    notify({
                        title: "Error fetching results",
                        message: `${e}`,
                        type: "danger",
                    });
                    dispatch({
                        type: "many",
                        payload: {
                            error: e,
                            isRunning: false,
                        },
                    });
                });
        },
        [dispatch, notify, onRestoreState],
    );
    const processingListener = useCallback(() => {
        dispatch({ type: "status", payload: "Processing..." });
    }, [dispatch]);
    const notifyAndDispatchError = useCallback(
        (error: any, title = "Analysis error") => {
            notify({
                title,
                message: `${error}`,
                type: "danger",
            });
            dispatch({
                type: "many",
                payload: {
                    status: "Error",
                    error,
                    isRunning: false,
                },
            });
        },
        [dispatch, notify],
    );
    const errorListener = useCallback(
        (data: any) => {
            notifyAndDispatchError(data.error);
            removePendingAnalysis(state.analysisId);
        },
        [notifyAndDispatchError, state.analysisId],
    );
    const completedListener = useCallback(() => {
        if (state.analysisId) {
            fetchResults(state.analysisId);
        } else {
            notifyAndDispatchError("An unknown error occurred during the analysis");
        }
        removePendingAnalysis(state.analysisId);
    }, [fetchResults, notifyAndDispatchError, state.analysisId]);
    const previousAnalysisFetcher = useCallback(
        async (analysisId: string | undefined, restoreState = false) => {
            if (!analysisId) return;
            const { data: jobStatus } = await jobStatusFetcher({ analysisId });
            if (jobStatus.status === "pending") {
                dispatch({ type: "many", payload: { isRunning: true, status: "Processing...", analysisId } });
            } else if (jobStatus.status === "finished") {
                dispatch({ type: "many", payload: { isRunning: true, analysisId } });
                fetchResults(analysisId, restoreState);
            }
        },
        [dispatch, fetchResults],
    );
    useChannel(channelName, ".analysis.processing", processingListener);
    useChannel(channelName, ".analysis.error", errorListener);
    useChannel(channelName, ".analysis.completed", completedListener);
    useEffect(() => {
        previousAnalysisFetcher(state.analysisId, true).catch((e) => {
            notifyAndDispatchError(e, "Error fetching analysis");
        });
    }, [state.analysisId, notify, previousAnalysisFetcher, notifyAndDispatchError]);
    const runAnalysis = useCallback(
        (request: Q) => {
            dispatch({ type: "many", payload: { isRunning: true, status: "Queuing analysis..." } });
            fetcher(request)
                .then(({ data: { analysisId } }) => {
                    dispatch({ type: "analysisId", payload: analysisId });
                    if (hashPrefix !== false) {
                        window.location.hash = `${hashPrefix}${analysisId}`;
                    }
                    if (storeAnalysis && hashPrefix !== false) {
                        pushPendingAnalysis({
                            id: analysisId,
                            prefix: hashPrefix,
                            message,
                            url: pathWithoutHash(router.asPath),
                        });
                    }
                })
                .catch((e) => notifyAndDispatchError(e, "Error creating the analysis"));
        },
        [dispatch, fetcher, hashPrefix, storeAnalysis, message, router.asPath, notifyAndDispatchError],
    );

    return {
        isRunning: state.isRunning ?? false,
        runAnalysis,
        results: state.results,
        error: state.error,
        status: state.status ?? "",
        analysisId: state.analysisId,
    };
}
