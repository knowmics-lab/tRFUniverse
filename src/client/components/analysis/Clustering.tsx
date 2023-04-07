import { Card, Col, Row } from "react-bootstrap";
import React, { useCallback } from "react";
import { clusteringFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { ClusteringData } from "@/types";
import { ClusteringRequest } from "@/types/requests";
import RemoteView from "@/components/RemoteView";
import { FilteringFunctionEnum } from "@/constants";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import TopFilteringCollapse, { FilteringSwitch } from "@/components/commons/TopFilteringCollapse";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import { useBasicReducer, useMetadataByDataset, useMetadataWithDatasets, useScrollingEffect } from "@/hooks";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

export default function Clustering() {
    const { datasets, setDatasets, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDatasets(true, "clustering");
    const filteredMetadata = useMetadataByDataset(metadataByDataset, "clustering", true);
    const [state, dispatch] = useBasicReducer<ClusteringRequest>({ filtering_measure: FilteringFunctionEnum.MAD });
    const onRestore = useCallback(
        ({ datasets, ...params }: ClusteringRequest) => {
            setDatasets(datasets);
            dispatch({ type: "many", payload: params });
        },
        [dispatch, setDatasets],
    );
    const clusteringAnalysis = useRemoteAnalysis<ClusteringRequest, ClusteringData>(
        clusteringFetcher,
        "",
        true,
        "Your clustering analysis has been completed!",
        onRestore,
    );
    const resultsCardRef = useScrollingEffect<HTMLDivElement>(clusteringAnalysis.results);
    return (
        <>
            <Card className="m-4 p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0">
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <DatasetSelect
                                placeholder="Select datasets"
                                datasets={allDatasets}
                                isMulti={true}
                                selection={datasets}
                                dispatch={setDatasets}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <MetadataSelect
                                placeholder="Select metadata (optional)"
                                metadata={filteredMetadata}
                                isMulti={true}
                                dispatch={dispatch}
                                selection={state.metadata}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <CovariatesSelect
                                covariatesMetadata={covariatesMetadata}
                                selectedCovariates={state.covariates}
                                dispatch={dispatch}
                            />
                        </Col>
                    </Row>
                    <Row className="my-4 align-items-center">
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SubtypesSelect options={subtypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SampleTypesSelect options={sampleTypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <FilteringSwitch state={state} dispatch={dispatch} />
                        </Col>
                    </Row>
                    <TopFilteringCollapse state={state} dispatch={dispatch} />
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={clusteringAnalysis}
                                disabled={!datasets || datasets.length === 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    clusteringAnalysis.runAnalysis({
                                        ...state,
                                        datasets,
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {clusteringAnalysis.results && (
                <Card className="m-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between" ref={resultsCardRef}>
                            <h6 className="mb-2">Cluster Analysis Viewer</h6>
                        </div>
                    </Card.Header>
                    <Card.Body
                        className="d-flex flex-column"
                        style={{
                            minHeight: "50vmax",
                        }}
                    >
                        <RemoteView url={clusteringAnalysis.results.url} />
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
