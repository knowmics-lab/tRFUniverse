import { Card, Col, Form, Row } from "react-bootstrap";
import React, { Ref, useCallback, useId, useMemo } from "react";
import { correlatedEnrichmentAnalysisFetcher } from "@/fetchers";
import { EnrichmentResultTableRow } from "@/types";
import { CorrelatedEnrichmentAnalysisRequest } from "@/types/requests";
import {
    CORRELATION_MEASURE_OPTIONS,
    CorrelationMeasure,
    FILTER_DIRECTION_OPTIONS,
    FilterDirectionEnum,
    GENE_TYPE_OPTIONS,
    GeneTypeEnum,
} from "@/constants";
import ArrayDataTable, { DefaultNumberFilter } from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import { useBasicReducer, useMetadataWithDataset, useRemoteAnalysis, useScrollingEffect } from "@/hooks";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import EnumSelect from "@/components/commons/EnumSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type EnrichmentAnalysisTabProps = {
    fragment: string;
    expressedIn: string[];
};

export default function CorrelatedEnrichmentTab({ fragment, expressedIn }: EnrichmentAnalysisTabProps) {
    const thresholdId = useId();
    const { dataset, setDataset, allDatasets, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDataset("correlation");
    const filteredDatasets = useMemo(
        () => allDatasets.filter((d) => expressedIn.includes(d.value)),
        [allDatasets, expressedIn],
    );
    const [state, dispatch, dispatchNumber] = useBasicReducer<CorrelatedEnrichmentAnalysisRequest>({
        type: GeneTypeEnum.GENES,
        measure: CorrelationMeasure.PEARSON,
        correlation_threshold: 0.5,
        filter_direction: FilterDirectionEnum.BOTH,
    });
    const onRestore = useCallback(
        ({ dataset, ...params }: CorrelatedEnrichmentAnalysisRequest) => {
            setDataset(dataset);
            dispatch({ type: "many", payload: params });
        },
        [dispatch, setDataset],
    );
    const enrichmentAnalysisRequest = useRemoteAnalysis<
        CorrelatedEnrichmentAnalysisRequest,
        EnrichmentResultTableRow[]
    >(
        correlatedEnrichmentAnalysisFetcher,
        "ce-",
        true,
        "Your correlated-genes enrichment analysis has been completed!",
        onRestore,
    );
    const resultsTableCardRef = useScrollingEffect(enrichmentAnalysisRequest.results);
    return (
        <>
            <Card className="p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0">
                        <Col
                            sm={12}
                            md={6}
                            xl={3}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <DatasetSelect
                                datasets={filteredDatasets}
                                isMulti={false}
                                selection={dataset}
                                dispatch={setDataset}
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            xl={3}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <EnumSelect
                                options={CORRELATION_MEASURE_OPTIONS}
                                state={state}
                                field="measure"
                                dispatch={dispatch}
                                placeholder="Select a correlation measure"
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            xl={3}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <EnumSelect
                                options={GENE_TYPE_OPTIONS}
                                state={state}
                                field="type"
                                dispatch={dispatch}
                                placeholder="Select the type of expression values"
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            xl={3}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <CovariatesSelect
                                covariatesMetadata={covariatesMetadata}
                                selectedCovariates={state.covariates}
                                dispatch={dispatch}
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <SubtypesSelect options={subtypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <SampleTypesSelect options={sampleTypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <Form.Label htmlFor={thresholdId}>Minimum absolute correlation threshold</Form.Label>
                            <Form.Control
                                id={thresholdId}
                                size="sm"
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                value={state.correlation_threshold}
                                onChange={(e) => {
                                    dispatchNumber({
                                        type: "correlation_threshold",
                                        payload: Number(e.target.value),
                                    });
                                }}
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <EnumSelect
                                options={FILTER_DIRECTION_OPTIONS}
                                state={state}
                                field="filter_direction"
                                dispatch={dispatch}
                                placeholder="Select the filter direction"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="auto" className="mx-auto my-4">
                            <SubmitButton
                                monitoredAnalysis={enrichmentAnalysisRequest}
                                disabled={!dataset}
                                onClick={(e) => {
                                    e.preventDefault();
                                    enrichmentAnalysisRequest.runAnalysis({
                                        ...state,
                                        dataset,
                                        fragment,
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {enrichmentAnalysisRequest.results && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div
                            className="d-flex justify-content-between"
                            ref={resultsTableCardRef as Ref<HTMLDivElement>}
                        >
                            <h6 className="mb-2">Results</h6>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <ArrayDataTable<EnrichmentResultTableRow>
                            data={enrichmentAnalysisRequest.results ?? []}
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
