import { Card, Col, Form, Row } from "react-bootstrap";
import { useAtom } from "jotai";
import { metadataAtom } from "@/atoms";
import React, { useCallback, useId, useMemo, useState } from "react";
import Select from "react-select";
import { Option, PlotlyResponseData } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";
import { expressionGraphFetcher } from "@/fetchers";
import { EXPRESSION_TYPE_OPTIONS, ExpressionTypeEnum } from "@/constants";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import { useBasicReducer, useMetadataAndDatasets, useMetadataByDataset, useRemoteAnalysis } from "@/hooks";
import { LocalPlotViewer } from "@/components/PlotViewer";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type ExpressionsTabProps = {
    fragmentId: number;
    datasets: string[];
};

type RequestType = Parameters<typeof expressionGraphFetcher>[0];
type State = Omit<RequestType, "fragmentId">;

function useMetadata(dataset: string) {
    const [metadata] = useAtom(metadataAtom);
    const metadataByDataset = useMemo(
        () =>
            metadata.filter(
                (m) =>
                    typeof m.values_by_dataset[dataset] !== "undefined" &&
                    Object.keys(m.values_by_dataset[dataset]).length > 1,
            ),
        [dataset, metadata],
    );
    const expressionMetadata = useMetadataByDataset(metadataByDataset, "expression_graphs");
    const covariatesMetadata = useMemo(
        () =>
            metadataByDataset
                .filter((m) => m.capabilities.covariate)
                .map((m) => {
                    if (m.name === "discretized_ages") {
                        return { ...m, display_name: "Age (Discretized)" };
                    }
                    return m;
                }),
        [metadataByDataset],
    );
    return { expressionMetadata, covariatesMetadata };
}

export default function ExpressionsTab({ fragmentId, datasets }: ExpressionsTabProps) {
    const { allDatasets } = useMetadataAndDatasets("expression_graphs");
    const expressionTypeSelectId = useId();
    const datasetsOptions = useMemo(
        () => allDatasets.filter((d) => datasets.includes(d.value)),
        [allDatasets, datasets],
    );
    const [dataset, setDataset] = useState("");
    const { expressionMetadata, covariatesMetadata } = useMetadata(dataset);
    const [state, dispatch] = useBasicReducer<State>({
        metadata: "",
        type: ExpressionTypeEnum.RPM,
        covariates: [],
    });
    const plotDisabled = useMemo(() => !state.metadata || !dataset, [dataset, state.metadata]);
    const onRestore = useCallback(
        ({ dataset, ...params }: RequestType) => {
            setDataset(dataset);
            dispatch({ type: "many", payload: params });
        },
        [dispatch],
    );
    const expressionPlotAnalysis = useRemoteAnalysis<RequestType, PlotlyResponseData>(
        expressionGraphFetcher,
        "exg-",
        true,
        "Your expression graph is ready!",
        onRestore,
    );
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Body>
                    <Row className="gap-2 gap-md-0 align-items-end">
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
                                placeholder="Select a metadata"
                                metadata={expressionMetadata}
                                isMulti={false}
                                dispatch={({ payload }) => dispatch({ type: "metadata", payload })}
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
                                onChange={(m) => {
                                    dispatch({ type: "type", payload: m?.value ?? ExpressionTypeEnum.RPM });
                                }}
                            />
                        </Col>
                        <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            {state.type === ExpressionTypeEnum.NORM_COUNTS && (
                                <CovariatesSelect
                                    covariatesMetadata={covariatesMetadata}
                                    selectedCovariates={state.covariates}
                                    dispatch={({ payload }) => dispatch({ type: "covariates", payload })}
                                />
                            )}
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={expressionPlotAnalysis}
                                disabled={plotDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    expressionPlotAnalysis.runAnalysis({
                                        fragmentId,
                                        metadata: state.metadata ?? "",
                                        dataset,
                                        type: state.type ?? ExpressionTypeEnum.RPM,
                                        covariates: state.covariates ?? [],
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
            {expressionPlotAnalysis.results && (
                <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-2">Plot result</h6>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Row className="my-4">
                            <Col sm="auto" className="mx-auto">
                                <LocalPlotViewer data={expressionPlotAnalysis.results} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
