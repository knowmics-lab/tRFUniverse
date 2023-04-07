import { Card, Col, Row } from "react-bootstrap";
import React, { Ref, useCallback, useMemo } from "react";
import { mediatedCorrelationPlotFetcher, mostMediatedCorrelatedTableFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { MostCorrelatedTable, MostCorrelatedTableRow, PlotlyResponseData } from "@/types";
import { MediatedCorrelationPlotRequest, MostMediatedCorrelatedAnalysisRequest } from "@/types/requests";
import { GENE_TYPE_OPTIONS, GeneTypeEnum } from "@/constants";
import ArrayDataTable from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import Loading from "@/components/Loading";
import { LocalPlotViewer } from "@/components/PlotViewer";
import { useBasicReducer, useMetadataByDataset, useMetadataWithDataset, useScrollingEffect } from "@/hooks";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import EnumSelect from "@/components/commons/EnumSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type EnrichmentAnalysisTabProps = {
    fragment: string;
    expressedIn: string[];
};

export default function MediatedCorrelationTab({ fragment, expressedIn }: EnrichmentAnalysisTabProps) {
    const { dataset, setDataset, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDataset("mediated_correlation");
    const filteredDatasets = useMemo(
        () => allDatasets.filter((d) => expressedIn.includes(d.value)),
        [allDatasets, expressedIn],
    );
    const filteredMetadata = useMetadataByDataset(metadataByDataset, "mediated_correlation");
    const [state, dispatch] = useBasicReducer<MostMediatedCorrelatedAnalysisRequest>({ type: GeneTypeEnum.GENES });
    const onRestore = useCallback(
        ({ dataset, ...params }: MostMediatedCorrelatedAnalysisRequest) => {
            setDataset(dataset);
            dispatch({ type: "many", payload: params });
        },
        [dispatch, setDataset],
    );
    const correlationTableAnalysis = useRemoteAnalysis<MostMediatedCorrelatedAnalysisRequest, MostCorrelatedTable>(
        mostMediatedCorrelatedTableFetcher,
        "mct-",
        true,
        "Your mediated correlation analysis has been completed!",
        onRestore,
    );
    const correlationPlotAnalysis = useRemoteAnalysis<MediatedCorrelationPlotRequest, PlotlyResponseData>(
        mediatedCorrelationPlotFetcher,
        false,
        false,
    );
    const resultsTableCardRef = useScrollingEffect(correlationTableAnalysis.results);
    const plotCardRef = useScrollingEffect(correlationPlotAnalysis.results);
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
                            <MetadataSelect
                                placeholder="Select a metadata"
                                metadata={filteredMetadata}
                                isMulti={false}
                                dispatch={dispatch}
                                selection={state.metadata}
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
                    </Row>
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={correlationTableAnalysis}
                                disabled={!dataset || !state.metadata}
                                onClick={(e) => {
                                    e.preventDefault();
                                    correlationTableAnalysis.runAnalysis({
                                        ...state,
                                        dataset,
                                        fragment,
                                        metadata: state.metadata ?? "",
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {correlationTableAnalysis.results && (
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
                        <ArrayDataTable<MostCorrelatedTableRow>
                            data={correlationTableAnalysis.results}
                            columns={[
                                {
                                    accessorKey: "gene_id",
                                    header: "Gene Id",
                                },
                                {
                                    accessorKey: "gene_name",
                                    header: "Gene Name",
                                },
                                {
                                    accessorKey: "p",
                                    header: "p-value",
                                },
                                {
                                    accessorKey: "q",
                                    header: "q-value",
                                },
                                {
                                    id: "actions",
                                    header: undefined,
                                    footer: undefined,
                                    enableSorting: false,
                                    enableColumnFilter: false,
                                    cell: ({ row }) => {
                                        return (
                                            <div className="btn-group-sm">
                                                <a
                                                    href="#"
                                                    className="btn btn-link btn-sm p-0 m-0"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        correlationPlotAnalysis.runAnalysis({
                                                            ...state,
                                                            dataset,
                                                            fragment,
                                                            gene: row.original.gene_name,
                                                            metadata: state.metadata ?? "",
                                                        });
                                                    }}
                                                >
                                                    Details
                                                </a>
                                            </div>
                                        );
                                    },
                                },
                            ]}
                            columnsSizing={{
                                correlation: "15%",
                                p: "15%",
                                q: "15%",
                            }}
                            columnsAlignment={{
                                correlation: Alignment.CENTER,
                                p: Alignment.CENTER,
                                q: Alignment.CENTER,
                            }}
                            wrapColumns={{
                                genes: true,
                            }}
                        />
                    </Card.Body>
                </Card>
            )}
            {correlationPlotAnalysis.isRunning && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white align-items-center justify-content-center">
                    <Loading message={correlationPlotAnalysis.status ?? "Loading..."} />
                </Card>
            )}
            {!correlationPlotAnalysis.isRunning && correlationPlotAnalysis.results && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between" ref={plotCardRef as Ref<HTMLDivElement>}>
                            <h6 className="mb-2">Correlation Plot</h6>
                        </div>
                    </Card.Header>
                    <Card.Body className="d-flex align-items-center justify-content-center">
                        <LocalPlotViewer data={correlationPlotAnalysis.results} />
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
