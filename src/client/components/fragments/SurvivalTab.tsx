import { Card, Col, Form, Row } from "react-bootstrap";
import React, { useId, useMemo } from "react";
import Select from "react-select";
import { Option, PlotlyResponseData } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";
import { LocalPlotViewer } from "@/components/PlotViewer";
import { survivalFetcher } from "@/fetchers";
import { EXPRESSION_TYPE_OPTIONS, ExpressionTypeEnum } from "@/constants";
import { SurvivalAnalysisRequest } from "@/types/requests";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import SurvivalThresholdSelection from "@/components/commons/SurvivalThresholdSelection";
import { useBasicReducer, useMetadataByDataset, useMetadataWithDataset, useRemoteAnalysis } from "@/hooks";
import SurvivalCensorSelection from "@/components/commons/SurvivalCensorSelection";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type ExpressionsTabProps = {
    fragmentId: number;
    datasets: string[];
};

type StateType = SurvivalAnalysisRequest & {
    cutoff_type?: "median" | "quartile" | "custom";
};

export default function SurvivalTab({ fragmentId, datasets }: ExpressionsTabProps) {
    const { dataset, setDataset, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDataset("survival");
    const expressionTypeSelectId = useId();
    const datasetsOptions = useMemo(
        () => allDatasets.filter((d) => datasets.includes(d.value)),
        [allDatasets, datasets],
    );
    const survivalMetadata = useMetadataByDataset(metadataByDataset, "survival");
    const [state, dispatch, dispatchNumber] = useBasicReducer<StateType>({
        cutoff_type: "median",
        cutoff_high: 0.5,
        cutoff_low: 0.5,
        type: ExpressionTypeEnum.RPM,
    });
    const plotDisabled = useMemo(() => !dataset || !state.metadata, [dataset, state]);
    const survivalPlotAnalysis = useRemoteAnalysis<SurvivalAnalysisRequest, PlotlyResponseData>(
        survivalFetcher,
        "saf-",
        true,
        "Your survival plot is ready!",
    );
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Body>
                    <Row className="gap-2 gap-md-0 align-items-center">
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <DatasetSelect
                                datasets={datasetsOptions}
                                isMulti={false}
                                selection={dataset}
                                dispatch={setDataset}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <MetadataSelect
                                placeholder="Select the survival measure"
                                metadata={survivalMetadata}
                                isMulti={false}
                                dispatch={dispatch}
                                selection={state.metadata}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <Form.Label htmlFor={`react-select-${expressionTypeSelectId}-input`}>
                                Select the type of expression values
                            </Form.Label>
                            <Select<Option<ExpressionTypeEnum>>
                                instanceId={expressionTypeSelectId}
                                options={EXPRESSION_TYPE_OPTIONS}
                                value={EXPRESSION_TYPE_OPTIONS.find((e) => e.value === state.type)}
                                onChange={(m) =>
                                    dispatch({
                                        type: "type",
                                        payload: m?.value ?? ExpressionTypeEnum.RPM,
                                    })
                                }
                            />
                        </Col>
                        {state.type === ExpressionTypeEnum.NORM_COUNTS && (
                            <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                                <CovariatesSelect
                                    covariatesMetadata={covariatesMetadata}
                                    selectedCovariates={state.covariates}
                                    dispatch={dispatch}
                                />
                            </Col>
                        )}
                        {state.type !== ExpressionTypeEnum.NORM_COUNTS && (
                            <Col sm={12} md={6} xl={3} className="d-none d-xl-block"></Col>
                        )}
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SurvivalThresholdSelection state={state} dispatch={dispatch} />
                        </Col>
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SubtypesSelect options={subtypes} state={state} dispatch={dispatch} />
                        </Col>
                        <Col sm={12} md={6} xl={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <SampleTypesSelect options={sampleTypes} state={state} dispatch={dispatch} />
                        </Col>
                    </Row>
                    <SurvivalCensorSelection state={state} dispatch={dispatchNumber} />
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={survivalPlotAnalysis}
                                disabled={plotDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    survivalPlotAnalysis.runAnalysis({
                                        fragmentId,
                                        dataset,
                                        metadata: state.metadata ?? "",
                                        type: state.type ?? "",
                                        cutoff_high: state.cutoff_high ?? 0.5,
                                        cutoff_low: state.cutoff_low ?? 0.5,
                                        subtypes: state.subtypes ?? undefined,
                                        sample_types: state.sample_types ?? undefined,
                                        covariates: state.covariates ?? undefined,
                                        left_censoring: state.left_censoring ?? undefined,
                                        right_censoring: state.right_censoring ?? undefined,
                                    });
                                }}
                                defaultIcon={<FontAwesomeIcon icon={faChartColumn} className="me-2" />}
                                defaultText="Plot"
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {survivalPlotAnalysis.results && (
                <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-2">Survival result</h6>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Row className="my-4">
                            <Col sm="auto" className="mx-auto">
                                <LocalPlotViewer data={survivalPlotAnalysis.results} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
