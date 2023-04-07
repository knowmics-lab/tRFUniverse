import { Card, Col, Form, Row } from "react-bootstrap";
import { useAtom } from "jotai";
import { metadataAtom } from "@/atoms";
import React, { Ref, useCallback, useId, useMemo } from "react";
import { targetEnrichmentFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import ArrayDataTable, { DefaultNumberFilter } from "@/components/ArrayDataTable";
import { EnrichmentResultTableRow } from "@/types";
import { Alignment } from "@/components/DataTable";
import { useBasicReducer, useScrollingEffect } from "@/hooks";
import { TargetEnrichmentAnalysisRequest } from "@/types/requests";
import { EVIDENCE_FILTERING_OPTIONS } from "@/constants";
import EnumSelect from "@/components/commons/EnumSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type EnrichmentAnalysisTabProps = {
    fragmentId: number;
    expressedIn: string[];
};

export default function TargetEnrichmentTab({ fragmentId, expressedIn }: EnrichmentAnalysisTabProps) {
    const [state, dispatch, dispatchNumber] = useBasicReducer<Omit<TargetEnrichmentAnalysisRequest, "fragmentId">>({
        pvalue: 0.05,
    });
    const onRestore = useCallback(
        (params: TargetEnrichmentAnalysisRequest) => {
            dispatch({ type: "many", payload: params });
        },
        [dispatch],
    );
    const enrichmentAnalysis = useRemoteAnalysis<TargetEnrichmentAnalysisRequest, EnrichmentResultTableRow[]>(
        targetEnrichmentFetcher,
        "te-",
        true,
        "Your target enrichment analysis has been completed!",
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
    const resultsTableCardRef = useScrollingEffect(enrichmentAnalysis.results);
    const pvalueId = useId();
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
                                <Col sm={4}>
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
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={enrichmentAnalysis}
                                disabled={false}
                                onClick={(e) => {
                                    e.preventDefault();
                                    enrichmentAnalysis.runAnalysis({ fragmentId, ...state });
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
            {enrichmentAnalysis.results && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div
                            className="d-flex justify-content-between"
                            ref={resultsTableCardRef as Ref<HTMLDivElement>}
                        >
                            <h6 className="mb-2">Enrichment analysis results</h6>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <ArrayDataTable<EnrichmentResultTableRow>
                            data={enrichmentAnalysis.results ?? []}
                            columns={[
                                {
                                    accessorKey: "ONTOLOGY",
                                    header: "Ontology",
                                    footer: "Ontology",
                                },
                                {
                                    accessorKey: "ID",
                                    header: "Id",
                                    footer: "Id",
                                },
                                {
                                    accessorKey: "Description",
                                    header: "Description",
                                    footer: "Description",
                                },
                                {
                                    accessorKey: "geneID",
                                    header: "Targets",
                                    footer: "Targets",
                                },
                                {
                                    accessorKey: "GeneRatio",
                                    header: "Gene Ratio",
                                    footer: "Gene Ratio",
                                },
                                {
                                    accessorKey: "pvalue",
                                    header: "p",
                                    footer: "p",
                                    filterFn: DefaultNumberFilter,
                                },
                                {
                                    accessorKey: "padjust",
                                    header: "FDR",
                                    footer: "FDR",
                                    filterFn: DefaultNumberFilter,
                                },
                            ]}
                            columnsVisibility={{
                                ID: "xl",
                                GeneRatio: "xl",
                                pvalue: "xl",
                                geneId: "xl",
                            }}
                            columnsSizing={{}}
                            columnsAlignment={{
                                GeneRatio: Alignment.CENTER,
                                pvalue: Alignment.CENTER,
                                padjust: Alignment.CENTER,
                            }}
                            wrapColumns={{
                                Ontology: true,
                                Description: true,
                                geneID: true,
                            }}
                        />
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
