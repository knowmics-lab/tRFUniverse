import { Card, Col, Form, Row } from "react-bootstrap";
import { useAtom } from "jotai";
import { metadataAtom } from "@/atoms";
import React, { useCallback, useId, useMemo } from "react";
import { phensimAnalysisFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { useBasicReducer } from "@/hooks";
import { PHENSIMAnalysisRequest } from "@/types/requests";
import { EVIDENCE_FILTERING_OPTIONS } from "@/constants";
import EnumSelect from "@/components/commons/EnumSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";
import { PHENSIMResultType } from "@/types";
import OutputViewer from "@/components/fragments/analysis/PHENSIM/OutputViewer";

type EnrichmentAnalysisTabProps = {
    fragmentId: number;
    expressedIn: string[];
};

type TabState = Omit<PHENSIMAnalysisRequest, "fragmentId">;

export default function PHENSIMTab({ fragmentId, expressedIn }: EnrichmentAnalysisTabProps) {
    const [state, dispatch, dispatchNumber] = useBasicReducer<TabState>({
        pvalue: 0.05,
        reactome: true,
        epsilon: 0.0000001,
        seed: 1234,
        notify_to: "",
    });
    const onRestore = useCallback(
        (params: PHENSIMAnalysisRequest) => {
            dispatch({ type: "many", payload: params });
        },
        [dispatch],
    );
    const phensimResults = useRemoteAnalysis<PHENSIMAnalysisRequest, PHENSIMResultType>(
        phensimAnalysisFetcher,
        "ph-",
        true,
        "Your phensim analysis has been completed!",
        onRestore,
    );
    const [metadata] = useAtom(metadataAtom);
    const datasetOptions = useMemo(
        () =>
            [
                ["global", "All datasets"],
                ...Object.entries(metadata.filter((m) => m.capabilities.dataset)[0].values).filter(
                    ([k]) => expressedIn.includes(k) && k !== "NCI60",
                ),
            ].map(([key, value]) => ({ value: key, label: value })),
        [expressedIn, metadata],
    );
    const pvalueId = useId();
    const reactomeId = useId();
    const epsilonId = useId();
    const seedId = useId();
    const notifyToId = useId();
    return (
        <>
            <Card className="p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Body>
                    <fieldset>
                        <legend className="text-sm font-weight-bold">Filter targets by:</legend>
                        <Row className="gap-2 gap-md-0 align-items-center px-2">
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <EnumSelect
                                    placeholder="Experimental Method"
                                    options={EVIDENCE_FILTERING_OPTIONS}
                                    isMulti
                                    field="evidences"
                                    state={state}
                                    dispatch={dispatch}
                                />
                            </Col>
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <EnumSelect
                                    placeholder={
                                        <>
                                            Activity in a dataset<sup>*</sup>
                                        </>
                                    }
                                    options={datasetOptions}
                                    field="dataset"
                                    state={state}
                                    dispatch={dispatch}
                                />
                            </Col>
                            {state.dataset && (
                                <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                    <Form.Label htmlFor={pvalueId}>
                                        Activity p-value threshold<sup>*</sup>
                                    </Form.Label>
                                    <Form.Control
                                        id={pvalueId}
                                        size="sm"
                                        type="text"
                                        value={state.pvalue}
                                        onChange={(e) => {
                                            dispatchNumber({
                                                type: "pvalue",
                                                payload: e.target.value,
                                            });
                                        }}
                                    />
                                </Col>
                            )}
                        </Row>
                    </fieldset>
                    <fieldset className="my-4">
                        <legend className="text-sm font-weight-bold">PHENSIM parameters:</legend>
                        <Row className="gap-2 gap-md-0 align-items-center px-2">
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <Form.Check
                                    type="switch"
                                    id={reactomeId}
                                    label="Enable REACTOME pathways?"
                                    checked={state.reactome ?? false}
                                    onChange={(e) => dispatch({ type: "reactome", payload: e.target.checked })}
                                />
                            </Col>
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <Form.Label htmlFor={epsilonId}>Epsilon threshold</Form.Label>
                                <Form.Control
                                    id={epsilonId}
                                    size="sm"
                                    type="text"
                                    value={state.epsilon}
                                    onChange={(e) => dispatchNumber({ type: "epsilon", payload: e.target.value })}
                                />
                            </Col>
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <Form.Label htmlFor={seedId}>RNG seed</Form.Label>
                                <Form.Control
                                    id={seedId}
                                    size="sm"
                                    type="text"
                                    value={state.seed}
                                    onChange={(e) => dispatchNumber({ type: "seed", payload: e.target.value })}
                                />
                            </Col>
                            <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <Form.Label htmlFor={notifyToId}>Notify results to (email)</Form.Label>
                                <Form.Control
                                    id={notifyToId}
                                    size="sm"
                                    type="email"
                                    value={state.notify_to}
                                    onChange={(e) => dispatch({ type: "notify_to", payload: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </fieldset>
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={phensimResults}
                                disabled={false}
                                onClick={(e) => {
                                    e.preventDefault();
                                    phensimResults.runAnalysis({
                                        fragmentId,
                                        ...state,
                                        notify_to: state.notify_to !== "" ? state.notify_to : undefined,
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col sm={12}>
                            <p className="text-xs">
                                <sup>*</sup>Activity is detected by performing a differential expression analysis
                                between samples with high fragment expression (&gt; 75 percentile) and samples with low
                                fragment expression (&lt; 25 percentile). Then, a p-value threshold is applied to the
                                differential expression analysis results. All targets with a p-value below the threshold
                                are considered active in the dataset.
                            </p>
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            <OutputViewer analysisId={phensimResults.analysisId} results={phensimResults.results} />
        </>
    ); //
}
