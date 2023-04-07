import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import React, { useCallback, useId } from "react";
import { dimensionalityReductionFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { PlotlyResponseData } from "@/types";
import { DimensionalityReductionRequest } from "@/types/requests";
import {
    DIMENSIONALITY_REDUCTION_OPTIONS,
    DimensionalityReductionMethodEnum,
    FilteringFunctionEnum,
} from "@/constants";
import { useMetadataWithDatasets } from "@/hooks/useMetadataWithDatasets";
import { LocalPlotViewer } from "@/components/PlotViewer";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import TopFilteringCollapse, { FilteringSwitch } from "@/components/commons/TopFilteringCollapse";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import { useBasicReducer, useMetadataByDataset, useScrollingEffect } from "@/hooks";
import EnumSelect from "@/components/commons/EnumSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

export default function DimensionalityReduction() {
    const checkScalingId = useId();
    const perplexityId = useId();
    const { datasets, setDatasets, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDatasets(true, "dimensionality_reduction");
    const filteredMetadata = useMetadataByDataset(metadataByDataset, "colorable");
    const [state, dispatch] = useBasicReducer<DimensionalityReductionRequest>({
        method: DimensionalityReductionMethodEnum.PCA,
        filtering_measure: FilteringFunctionEnum.MAD,
    });
    const onRestore = useCallback(
        ({ datasets, ...params }: DimensionalityReductionRequest) => {
            setDatasets(datasets);
            dispatch({ type: "many", payload: params });
        },
        [dispatch, setDatasets],
    );
    const dimensionalityReductionAnalysis = useRemoteAnalysis<DimensionalityReductionRequest, PlotlyResponseData>(
        dimensionalityReductionFetcher,
        "",
        true,
        "Your dimensionality reduction analysis has been completed!",
        onRestore,
    );
    const plotCardRef = useScrollingEffect<HTMLDivElement>(dimensionalityReductionAnalysis.results);
    const isTSNE = state.method === DimensionalityReductionMethodEnum.TSNE;
    return (
        <>
            <Card className="m-4 p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0">
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <DatasetSelect
                                placeholder="Select datasets"
                                datasets={allDatasets}
                                isMulti={true}
                                selection={datasets}
                                dispatch={setDatasets}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <MetadataSelect
                                metadata={filteredMetadata}
                                isMulti={true}
                                dispatch={({ payload }) => dispatch({ type: "color_by", payload })}
                                selection={state.color_by}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <EnumSelect
                                options={DIMENSIONALITY_REDUCTION_OPTIONS}
                                state={state}
                                field="method"
                                dispatch={dispatch}
                                placeholder={"Select the dimensionality reduction algorithm"}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <CovariatesSelect
                                covariatesMetadata={covariatesMetadata}
                                selectedCovariates={state.covariates}
                                dispatch={dispatch}
                            />
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col sm={12} md={6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SubtypesSelect options={subtypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col sm={12} md={6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SampleTypesSelect options={sampleTypes} state={state} dispatch={dispatch} />
                        </Col>
                    </Row>
                    <Row className="my-4 d-flex justify-content-center">
                        <Col sm={12} md={isTSNE ? 4 : 6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <Form.Check
                                type="switch"
                                id={checkScalingId}
                                label="Enable expression scaling?"
                                checked={state.scaling ?? false}
                                onChange={(e) => dispatch({ type: "scaling", payload: e.target.checked })}
                            />
                        </Col>
                        {isTSNE && (
                            <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <FloatingLabel controlId={perplexityId} label="Perplexity">
                                    <Form.Control
                                        type="number"
                                        placeholder="Perplexity"
                                        value={state.perplexity ?? 30}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "perplexity",
                                                payload: Number(e.target.value),
                                            })
                                        }
                                    />
                                </FloatingLabel>
                            </Col>
                        )}
                        <Col sm={12} md={isTSNE ? 4 : 6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <FilteringSwitch state={state} dispatch={dispatch} />
                        </Col>
                    </Row>
                    <TopFilteringCollapse state={state} dispatch={dispatch} />
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={dimensionalityReductionAnalysis}
                                disabled={!datasets || datasets.length === 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    dimensionalityReductionAnalysis.runAnalysis({
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
            {dimensionalityReductionAnalysis.results && (
                <Card className="p-3 m-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between" ref={plotCardRef}>
                            <h6 className="mb-2">Dimensionality Reduction Plot</h6>
                        </div>
                    </Card.Header>
                    <Card.Body className="d-flex align-items-center justify-content-center">
                        <LocalPlotViewer data={dimensionalityReductionAnalysis.results} />
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
