import { Card, Col, Form, Row } from "react-bootstrap";
import React, { useCallback, useId, useMemo } from "react";
import Select from "react-select";
import { differentialSurvivalFetcher, survivalWithFragmentNameFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { DifferentialSurvivalTableRow, Option, PlotlyResponseData } from "@/types";
import { DifferentialSurvivalAnalysisRequest, SurvivalAnalysisRequestWithName } from "@/types/requests";
import { EXPRESSION_TYPE_OPTIONS, ExpressionTypeEnum } from "@/constants";
import { useBasicReducer, useMetadataByDataset, useMetadataWithDataset, useScrollingEffect } from "@/hooks";
import ArrayDataTable from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import Loading from "@/components/Loading";
import { LocalPlotViewer } from "@/components/PlotViewer";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import { SampleTypesSelect, SubtypesSelect } from "@/components/commons/SampleFilteringSelect";
import SurvivalThresholdSelection from "@/components/commons/SurvivalThresholdSelection";
import SubmitButton from "@/components/commons/SubmitButton";
import SurvivalCensorSelection from "@/components/commons/SurvivalCensorSelection";
import ShareThisPage from "@/components/commons/ShareThisPage";

type StateType = DifferentialSurvivalAnalysisRequest & {
    cutoff_type?: "median" | "quartile" | "custom";
};

export default function DifferentialSurvival() {
    const { dataset, setDataset, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata } =
        useMetadataWithDataset("survival");
    const expressionTypeSelectId = useId();
    const filteredMetadata = useMetadataByDataset(metadataByDataset, "survival");
    const [state, dispatch, dispatchNumber] = useBasicReducer<StateType>({
        cutoff_type: "median",
        cutoff_high: 0.5,
        cutoff_low: 0.5,
        type: ExpressionTypeEnum.RPM,
    });
    const onRestore = useCallback(
        ({ dataset, ...params }: DifferentialSurvivalAnalysisRequest) => {
            setDataset(dataset);
            dispatch({
                type: "many",
                payload: {
                    ...params,
                    cutoff_type:
                        params.cutoff_high === 0.5 && params.cutoff_low === 0.5
                            ? "median"
                            : params.cutoff_high === 0.75 && params.cutoff_low === 0.25
                            ? "quartile"
                            : "custom",
                },
            });
        },
        [dispatch, setDataset],
    );
    const differentialSurvivalAnalysis = useRemoteAnalysis<
        DifferentialSurvivalAnalysisRequest,
        DifferentialSurvivalTableRow[]
    >(differentialSurvivalFetcher, "", true, "Your differential survival analysis has been completed!", onRestore);
    const submitDisabled = useMemo(() => !dataset || !state.metadata, [dataset, state]);
    const tableCardRef = useScrollingEffect<HTMLDivElement>(differentialSurvivalAnalysis.results);
    const survivalPlotAnalysis = useRemoteAnalysis<SurvivalAnalysisRequestWithName, PlotlyResponseData>(
        survivalWithFragmentNameFetcher,
        false,
        false,
        "Your survival plot is ready!",
    );
    const plotCardRef = useScrollingEffect<HTMLDivElement>(
        useMemo(
            () =>
                differentialSurvivalAnalysis.results &&
                (survivalPlotAnalysis.isRunning || survivalPlotAnalysis.results),
            [differentialSurvivalAnalysis.results, survivalPlotAnalysis.isRunning, survivalPlotAnalysis.results],
        ),
    );
    return (
        <>
            <Card className="m-4 p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0 align-items-center">
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <DatasetSelect
                                datasets={allDatasets}
                                isMulti={false}
                                selection={dataset}
                                dispatch={setDataset}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <MetadataSelect
                                placeholder="Select the survival measure"
                                metadata={filteredMetadata}
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
                                monitoredAnalysis={differentialSurvivalAnalysis}
                                disabled={submitDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    differentialSurvivalAnalysis.runAnalysis({
                                        ...state,
                                        metadata: state.metadata ?? "",
                                        type: state.type ?? ExpressionTypeEnum.RPM,
                                        dataset,
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {differentialSurvivalAnalysis.results && (
                <>
                    <Card className="p-3 m-4 shadow-lg border-radius-xl bg-white">
                        <Card.Header className="pb-0 p-3">
                            <div className="d-flex justify-content-between" ref={tableCardRef}>
                                <h6 className="mb-2">Results</h6>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <ArrayDataTable<DifferentialSurvivalTableRow>
                                data={differentialSurvivalAnalysis.results}
                                columns={[
                                    {
                                        accessorKey: "id",
                                        header: "Fragment Id",
                                    },
                                    {
                                        accessorKey: "HR",
                                        header: "Hazard Ratio",
                                        enableColumnFilter: false,
                                    },
                                    {
                                        id: "thresholds",
                                        header: "Thresholds",
                                        columns: [
                                            {
                                                accessorKey: "th_high",
                                                header: "High",
                                                enableColumnFilter: false,
                                            },
                                            {
                                                accessorKey: "th_low",
                                                header: "Low",
                                                enableColumnFilter: false,
                                            },
                                        ],
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
                                                            survivalPlotAnalysis.runAnalysis({
                                                                fragment_name: row.original.id,
                                                                dataset,
                                                                ...state,
                                                                metadata: state.metadata ?? "",
                                                                type: state.type ?? ExpressionTypeEnum.RPM,
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
                                    HR: "15%",
                                    th_high: "15%",
                                    th_low: "15%",
                                    p: "15%",
                                    q: "15%",
                                }}
                                columnsAlignment={{
                                    HR: Alignment.CENTER,
                                    "1_thresholds_th_high": Alignment.CENTER,
                                    th_high: Alignment.CENTER,
                                    th_low: Alignment.CENTER,
                                    p: Alignment.CENTER,
                                    q: Alignment.CENTER,
                                }}
                            />
                        </Card.Body>
                    </Card>
                    {(survivalPlotAnalysis.results || survivalPlotAnalysis.isRunning) && (
                        <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                            <Card.Header className="pb-0 p-3">
                                <div className="d-flex justify-content-between" ref={plotCardRef}>
                                    <h6 className="mb-2">Survival Plot</h6>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row className="my-4">
                                    <Col sm="auto" className="mx-auto">
                                        {survivalPlotAnalysis.isRunning && <Loading />}
                                        {!survivalPlotAnalysis.isRunning && survivalPlotAnalysis.results && (
                                            <LocalPlotViewer data={survivalPlotAnalysis.results} />
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </>
    );
}
